/**
 * CV PDF download — server-side headless Chrome generation.
 *
 * Flow:
 *  1. Build the CV HTML (page sheets + all page CSS, font URLs made absolute)
 *  2. POST to /api/pdf/generate (headless Chrome on the server)
 *  3. Receive the PDF binary and trigger a direct file download
 *
 * This works identically on desktop and mobile — it is just an API call
 * followed by a blob URL download, no print dialog, no mobile popup issues.
 *
 * If the server returns an error (e.g. Chromium not available in dev without
 * a local Chrome install) the function falls back to the iframe print path
 * so the developer experience is not broken.
 */

const A4_MM_W = 210;
const A4_MM_H = 297;

/** Collect CSS from all loaded stylesheets, making relative URLs absolute */
function collectPageStyles(): { inlineCss: string; linkTags: string } {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  let inlineCss = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      inlineCss += Array.from(sheet.cssRules)
        .map((r) => r.cssText)
        .join("\n");
    } catch {
      /* cross-origin sheet — included via <link> below */
    }
  }

  // Make all relative url(...) references absolute so headless Chrome
  // (running on the server) can fetch font files and background images.
  inlineCss = inlineCss.replace(
    /url\((['"]?)(?!https?:\/\/|data:)([^)'"]+)\1\)/g,
    (_match, q, path) =>
      `url(${q}${origin}/${path.replace(/^\//, "")}${q})`
  );

  const linkTags = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
    .map((l) => `<link rel="stylesheet" href="${l.href}">`)
    .join("\n");

  return { inlineCss, linkTags };
}

/** Clone and serialise CV page sheets, removing watermarks / UI elements */
function serialiseSheets(sheets: HTMLElement[]): string {
  return sheets
    .map((s) => {
      const clone = s.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-pdf").forEach((el) => el.remove());
      return clone.outerHTML;
    })
    .join("\n");
}

/** Build the complete HTML sent to the server (or used in the iframe fallback) */
function buildPrintDocument(opts: {
  filename: string;
  inlineCss: string;
  linkTags: string;
  sheetsHtml: string;
  autoprint?: boolean;
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
<meta name="viewport" content="width=794,initial-scale=1">
<title>${opts.filename}</title>
${opts.linkTags}
<style>
${opts.inlineCss}

/* ── Print overrides ── */
@page { size: ${A4_MM_W}mm ${A4_MM_H}mm; margin: 0mm; }
*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}
html, body { margin: 0; padding: 0; background: white; }
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

/** Trigger a browser file download from a Blob */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Fallback: iframe print (desktop) or new-tab auto-print (mobile) */
async function fallbackPrint(
  html: string,
  filename: string
): Promise<void> {
  const mobile =
    window.matchMedia("(pointer: coarse)").matches ||
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (mobile) {
    const tab = window.open("", "_blank");
    if (tab) {
      // Re-inject autoprint script for mobile fallback
      const mobileHtml = html.replace(
        "</head>",
        `<script>
document.fonts.ready.then(function(){setTimeout(function(){window.print()},300)});
<\/script></head>`
      );
      tab.document.open();
      tab.document.write(mobileHtml);
      tab.document.close();
      return;
    }
  }

  // Desktop iframe fallback
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:-10000px;left:-10000px;width:210mm;height:297mm;border:none;visibility:hidden;pointer-events:none;";
  document.body.appendChild(iframe);
  const iDoc = iframe.contentDocument!;
  iDoc.open();
  iDoc.write(html);
  iDoc.close();
  try {
    if ("fonts" in iDoc) {
      await (iDoc as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
    }
  } catch { /* ignore */ }
  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r()))
  );
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }, 5000);
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

  // ── 2. Build the print HTML ───────────────────────────────────────────────
  const { inlineCss, linkTags } = collectPageStyles();
  const sheetsHtml = serialiseSheets(sheets);
  const html = buildPrintDocument({ filename, inlineCss, linkTags, sheetsHtml });

  // ── 3. Try server-side generation first ──────────────────────────────────
  try {
    const res = await fetch("/api/pdf/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, filename }),
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerDownload(blob, filename);
      return;
    }

    console.warn(
      "[pdf] server returned",
      res.status,
      "— falling back to client-side print"
    );
  } catch (err) {
    console.warn("[pdf] server unreachable — falling back to client-side print:", err);
  }

  // ── 4. Fallback: client-side iframe / new-tab print ───────────────────────
  await fallbackPrint(html, filename);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed:", err)
  );
}
