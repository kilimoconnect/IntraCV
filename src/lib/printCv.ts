"use client";

/**
 * printCv.ts — iframe-based browser print PDF for IntraCV.
 *
 * Strategy: clone the CV element into a hidden iframe whose viewport is locked
 * to 794 px wide. This gives:
 *   ✓ Pixel-perfect layout (same engine that drew the preview)
 *   ✓ Selectable text
 *   ✓ Full CSS (coloured sidebar, gradients, backgrounds)
 *   ✓ Mobile — the viewport meta `width=794` prevents the browser reflowing
 *     the 794 px CV to 390 px (which turns 2 pages into 7+)
 */

const A4_PX_W = 794;

export interface PrintCvOptions {
  filename: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export async function printCvAsPdf(
  element: HTMLElement,
  options: PrintCvOptions
): Promise<void> {
  const { filename, onStart, onComplete } = options;
  onStart?.();

  try {
    // Wait for fonts so nothing renders as fallback glyphs
    await document.fonts.ready;
    // Let any pending React renders settle
    await new Promise<void>((r) => setTimeout(r, 300));

    const originalTitle = document.title;
    document.title = filename;

    // ── Clone the CV ─────────────────────────────────────────────────────────
    const clone = element.cloneNode(true) as HTMLElement;

    // Strip the preview scale-transform (previewRef has transform:scale(X))
    clone.style.transform = "none";
    clone.style.transformOrigin = "top left";

    // Remove UI-only elements (watermark, buttons, tooltips…)
    clone.querySelectorAll(".no-pdf").forEach((el) => el.remove());

    // Remove the inter-page gap that the preview adds (print has page breaks)
    const gapStyle = clone.querySelector("style");
    if (gapStyle) gapStyle.remove();

    // ── Collect page styles ───────────────────────────────────────────────────
    const styles = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText);
        } catch {
          // Cross-origin sheets (CDN etc.) — skip safely
          return [];
        }
      })
      .join("\n");

    // ── Build iframe ─────────────────────────────────────────────────────────
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;top:0;left:0;width:794px;height:0;" +
      "border:none;opacity:0;pointer-events:none;z-index:-1;";
    document.body.appendChild(iframe);

    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();

      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <!--
    KEY MOBILE FIX: forces the print viewport to 794 px instead of the
    device screen width (~390 px on iPhone). Without this, the two-column
    794 px CV reflows to 390 px and 2 pages becomes 7+.
  -->
  <meta name="viewport" content="width=${A4_PX_W}, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { width: ${A4_PX_W}px; margin: 0; padding: 0; }
    body {
      width: ${A4_PX_W}px;
      min-width: ${A4_PX_W}px;
      max-width: ${A4_PX_W}px;
      margin: 0;
      padding: 0;
      background: white;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    /* Preserve colours, backgrounds, and gradients in print */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Each sheet = exactly one A4 page */
    .cv-page-sheet {
      width: 210mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      position: relative !important;
      display: block !important;
      page-break-after: always !important;
      break-after: page !important;
      /* Remove the preview inter-page gap */
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    .cv-page-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* Sidebar must stretch the full page height */
    .cv-sidebar {
      min-height: 297mm !important;
      height: 100% !important;
    }

    /* Prevent orphaned headings */
    h1, h2, h3, h4, h5, h6 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    /* Keep each item together */
    .cv-experience-item,
    .cv-education-item,
    .cv-certification-item,
    .cv-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .no-pdf { display: none !important; }

    /* ── Application styles (collected from live document) ── */
    ${styles}

    /*
     * CRITICAL: @page MUST come AFTER ${styles}.
     * The collected application CSS may contain @page rules with non-zero
     * margins (e.g. from Tailwind or Next.js base styles). Those rules come
     * before this point so they get overridden here.
     * margin:0mm is what suppresses Chrome's built-in print headers & footers
     * (the date/time line at top and the URL/page-number line at bottom).
     * If any @page rule with margin > 0 survives, Chrome uses that margin
     * space to render its own header/footer, which overlaps and clips the CV.
     */
    @page {
      size: 210mm 297mm;
      margin: 0mm !important;
    }

    @media print {
      html, body {
        width: ${A4_PX_W}px !important;
        min-width: ${A4_PX_W}px !important;
      }
      .cv-page-sheet { width: 210mm !important; }

      /* Repeat @page inside @media print for maximum browser compatibility */
      @page {
        size: 210mm 297mm;
        margin: 0mm !important;
      }
    }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`);
      doc.close();
    });

    // Give the iframe time to load fonts and images before printing
    await new Promise<void>((r) => setTimeout(r, 600));

    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();

    // Clean up after the print dialog closes (1 s grace period)
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      document.title = originalTitle;
      onComplete?.();
    }, 1000);
  } catch (err) {
    console.error("[printCv] Print failed:", err);
    onComplete?.();
  }
}
