/**
 * Client-side CV PDF download via the browser's native print engine.
 *
 * WHY NOT html2canvas?
 * html2canvas re-implements the browser's layout and text-rendering in a
 * Canvas 2D context. Its font-metric calculations differ slightly from the
 * real layout engine: characters can be 3–5% wider or narrower, so long
 * lines (90+ chars) wrap at different points. No amount of CSS patching
 * fixes this — it is a fundamental limitation of re-implementing the browser.
 *
 * THIS APPROACH: hidden <iframe> + window.print()
 * The CV page HTML (with all its inline styles) is copied into a hidden
 * iframe. The browser's own print engine renders it — the same engine that
 * drew the canvas preview — so every line wraps identically, every colour is
 * exact, and every CSS feature (flexbox, zoom, transform) works correctly.
 * The user sees the system "Save as PDF" dialog, clicks Save, done.
 *
 * Font handling: all <style> blocks and <link> stylesheets from the main
 * document are injected into the iframe so Inter and every other font/class
 * is available. @page sets exact A4 dimensions with zero margins.
 */

const A4_MM_W = 210;
const A4_MM_H = 297;

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // ── Gather CV page sheets ─────────────────────────────────────────────────
  const sheets = Array.from(
    element.querySelectorAll<HTMLElement>(".cv-page-sheet")
  );
  if (sheets.length === 0) {
    throw new Error(
      'No CV pages found. Ensure each page has the class "cv-page-sheet".'
    );
  }

  // ── Collect all CSS from the main document ────────────────────────────────
  // Inline <style> blocks — includes Tailwind, next/font face declarations, etc.
  let inlineCss = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      inlineCss += Array.from(sheet.cssRules)
        .map((r) => r.cssText)
        .join("\n");
    } catch {
      // Cross-origin sheet — will be included via <link> below
    }
  }

  // External <link rel="stylesheet"> hrefs (cross-origin sheets)
  const linkTags = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
    .map((l) => `<link rel="stylesheet" href="${l.href}">`)
    .join("\n");

  // ── Build the CV HTML ─────────────────────────────────────────────────────
  // Strip "no-pdf" elements (watermarks, preview banners) before serialising.
  const cleanSheets = sheets.map((s) => {
    const clone = s.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".no-pdf").forEach((el) => el.remove());
    return clone.outerHTML;
  });

  // ── Create hidden iframe ──────────────────────────────────────────────────
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

  iDoc.open();
  iDoc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${filename}</title>
${linkTags}
<style>
${inlineCss}

/* ── Print-specific overrides ── */
@page {
  size: ${A4_MM_W}mm ${A4_MM_H}mm;
  margin: 0mm;
}
*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
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
</head>
<body>${cleanSheets.join("\n")}</body>
</html>`);
  iDoc.close();

  // ── Wait for fonts to be ready inside the iframe ──────────────────────────
  try {
    if ("fonts" in iDoc) {
      await (iDoc as Document & { fonts: { ready: Promise<void> } }).fonts
        .ready;
    }
  } catch {
    // Fallback if FontFaceSet is unavailable in iframe
  }

  // Two extra frames so the iframe layout engine fully settles
  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r()))
  );

  // ── Print ─────────────────────────────────────────────────────────────────
  // focus() is required in some browsers before print() will work on the iframe
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  // ── Cleanup ───────────────────────────────────────────────────────────────
  // Delay removal so the browser has time to process the print job before the
  // iframe is destroyed. The print dialog may still be open at this point.
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 5000);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed:", err)
  );
}
