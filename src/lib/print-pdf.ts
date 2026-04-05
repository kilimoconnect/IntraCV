/**
 * Client-side CV PDF download via the browser's native print engine.
 *
 * Two paths depending on device type:
 *
 * DESKTOP — hidden <iframe> + iframe.contentWindow.print()
 *   The CV HTML is written into a hidden off-screen iframe and print() is
 *   called on the iframe. The system Save-as-PDF dialog appears. This path
 *   works silently without opening a new visible tab.
 *
 * MOBILE — window.open() new tab + auto-print script
 *   Mobile browsers (iOS Safari, Android Chrome) silently ignore print()
 *   on hidden iframes. Instead we open a new tab immediately (synchronous
 *   with the button click so it is never blocked as a popup), write the CV
 *   content into it, and include a small script that calls window.print()
 *   once fonts are ready. The user sees the browser's native share/print
 *   sheet and can save as PDF from there.
 *
 * Both paths inject all page stylesheets into the print document so Inter
 * and every Tailwind class is available. @page sets exact A4 dimensions
 * with zero margins so the CV fills the page perfectly.
 */

const A4_MM_W = 210;
const A4_MM_H = 297;

/** True on phones/tablets — uses pointer:coarse + UA as belt-and-suspenders */
function isMobileDevice(): boolean {
  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  const mobileUA =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return coarsePointer || mobileUA;
}

/** Collect all CSS the page has loaded (inline <style> blocks + cross-origin <link> tags) */
function collectPageStyles(): { inlineCss: string; linkTags: string } {
  let inlineCss = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      inlineCss += Array.from(sheet.cssRules)
        .map((r) => r.cssText)
        .join("\n");
    } catch {
      // Cross-origin sheet — handled via <link> below
    }
  }

  const linkTags = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
    .map((l) => `<link rel="stylesheet" href="${l.href}">`)
    .join("\n");

  return { inlineCss, linkTags };
}

/** Serialize CV page sheets, stripping watermarks and preview-only elements */
function serialiseSheets(sheets: HTMLElement[]): string {
  return sheets
    .map((s) => {
      const clone = s.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-pdf").forEach((el) => el.remove());
      return clone.outerHTML;
    })
    .join("\n");
}

/** Build the complete HTML document written into the print surface (iframe or new tab) */
function buildPrintDocument(opts: {
  filename: string;
  inlineCss: string;
  linkTags: string;
  sheetsHtml: string;
  autoprint: boolean; // true = include a JS auto-print snippet (mobile tab)
}): string {
  const autoprintScript = opts.autoprint
    ? `<script>
(function () {
  function go() { window.print(); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(go, 300); });
  } else {
    window.addEventListener("load", function () { setTimeout(go, 500); });
  }
})();
<\/script>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.filename}</title>
${opts.linkTags}
<style>
${opts.inlineCss}

/* ── Print-specific overrides ── */
@page {
  size: ${A4_MM_W}mm ${A4_MM_H}mm;
  margin: 0mm;
}
*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
  /* word-wrap is the legacy alias; overflow-wrap is the modern standard.
     Set both so text wraps in all print engines (Chrome, Safari, Firefox). */
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}
html, body {
  margin: 0;
  padding: 0;
  background: white;
}
.cv-page-sheet {
  page-break-after: always;
  break-after: page;
  width: 794px !important;
  min-width: 794px !important;
  max-width: 794px !important;
  height: 1123px !important;
  min-height: 1123px !important;
  overflow: hidden !important;
  position: relative !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
}
.no-pdf { display: none !important; }
</style>
${autoprintScript}
</head>
<body>${opts.sheetsHtml}</body>
</html>`;
}

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // ── 1. Gather CV pages ────────────────────────────────────────────────────
  const sheets = Array.from(
    element.querySelectorAll<HTMLElement>(".cv-page-sheet")
  );
  if (sheets.length === 0) {
    throw new Error(
      'No CV pages found. Ensure each page has the class "cv-page-sheet".'
    );
  }

  const mobile = isMobileDevice();

  // ── 2. MOBILE: open new tab NOW (synchronous — preserves user-gesture) ────
  // window.open() must be called synchronously within the click handler or
  // mobile browsers treat it as a popup and block it. We open an empty tab
  // here, then fill it with content after the async CSS collection below.
  let mobileTab: Window | null = null;
  if (mobile) {
    mobileTab = window.open("", "_blank");
    if (!mobileTab) {
      // Popup blocked — fall through to the iframe path as a best-effort
      // (user can also long-press the button and "Open in new tab")
    }
  }

  // ── 3. Collect styles & serialise sheets (async-safe) ────────────────────
  const { inlineCss, linkTags } = collectPageStyles();
  const sheetsHtml = serialiseSheets(sheets);

  // ── 4. MOBILE PATH ────────────────────────────────────────────────────────
  if (mobile && mobileTab) {
    const html = buildPrintDocument({
      filename,
      inlineCss,
      linkTags,
      sheetsHtml,
      autoprint: true, // the tab prints itself once fonts are ready
    });

    mobileTab.document.open();
    mobileTab.document.write(html);
    mobileTab.document.close();
    return;
  }

  // ── 5. DESKTOP PATH: hidden iframe ───────────────────────────────────────
  const iframe = document.createElement("iframe");
  iframe.style.cssText = [
    "position:fixed",
    "top:-10000px",
    "left:-10000px",
    `width:${A4_MM_W}mm`,
    `height:${A4_MM_H}mm`,
    "border:none",
    "visibility:hidden",
    "pointer-events:none",
  ].join(";");
  document.body.appendChild(iframe);

  const iDoc = iframe.contentDocument!;

  const html = buildPrintDocument({
    filename,
    inlineCss,
    linkTags,
    sheetsHtml,
    autoprint: false,
  });

  iDoc.open();
  iDoc.write(html);
  iDoc.close();

  // Wait for fonts inside the iframe
  try {
    if ("fonts" in iDoc) {
      await (iDoc as Document & { fonts: { ready: Promise<void> } }).fonts
        .ready;
    }
  } catch {
    /* FontFaceSet unavailable in this iframe — continue */
  }

  // Two rAF frames for layout to settle
  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r()))
  );

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  // Remove iframe after a delay — the print dialog may still be open
  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }, 5000);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed:", err)
  );
}
