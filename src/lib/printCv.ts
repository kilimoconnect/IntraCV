"use client";

/**
 * printCv.ts
 *
 * Two PDF strategies, tried in order:
 *
 * 1. api2pdf  — real Headless Chrome in the cloud.
 *    Client serialises the CV HTML + all page styles → POST /api/pdf/api2pdf
 *    → server calls api2pdf → stores PDF in Supabase → returns binary PDF
 *    → browser saves directly. No print dialog.
 *
 * 2. iframe print  (fallback) — hidden iframe with viewport locked to 794 px
 *    so mobile browsers don't reflow the 794 px CV to 390 px.
 *    Opens the OS print dialog.
 */

const A4_PX_W = 794;

export interface PrintCvOptions {
  filename: string;
  onStart?: () => void;
  onComplete?: () => void;
  /** When true, calls /api/pdf/api2pdf instead of the iframe fallback */
  useApi2Pdf?: boolean;
  userId?: string;
  /** Document metadata — the route creates the record server-side */
  docTitle?: string;
  docContent?: string;
  /** Cover letter text to store alongside the CV */
  coverLetter?: string;
  /** One-time payment token issued by /cv-payment/callback — verified server-side */
  downloadToken?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: build the self-contained print HTML from the live CV element
// ─────────────────────────────────────────────────────────────────────────────
function buildPrintHtml(element: HTMLElement, filename: string): string {
  // Clone so we never mutate the live DOM
  const clone = element.cloneNode(true) as HTMLElement;

  // Strip preview transform:scale that CVCanvasPreview applies
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";

  // Remove elements that must not appear in print
  clone.querySelectorAll(".no-pdf").forEach((el) => el.remove());

  // Remove the <style> tag that adds the inter-page visual gap (24 px margin)
  const gapStyle = clone.querySelector("style");
  if (gapStyle) gapStyle.remove();

  // Collect all live page styles (skip cross-origin sheets)
  const styles = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join("\n");

  return `<!DOCTYPE html>
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

    /* Preserve colours, backgrounds, gradients */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Each .cv-page-sheet = one A4 page */
    .cv-page-sheet {
      width: 210mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      position: relative !important;
      display: block !important;
      page-break-after: always !important;
      break-after: page !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    .cv-page-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .cv-sidebar {
      min-height: 297mm !important;
      height: 100% !important;
    }

    h1, h2, h3, h4, h5, h6 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    .cv-experience-item,
    .cv-education-item,
    .cv-certification-item,
    .cv-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .no-pdf { display: none !important; }

    /* ── Live page styles ── */
    ${styles}

    /*
     * @page MUST be placed AFTER ${styles}.
     * The collected styles may contain @page rules with non-zero margins.
     * This override (with !important) ensures margin is always 0mm so
     * Chrome does not render its own date/URL header-footer chrome.
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
      @page { size: 210mm 297mm; margin: 0mm !important; }
    }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy 1 — api2pdf server-side generation
// ─────────────────────────────────────────────────────────────────────────────
async function generateViaApi2Pdf(
  html: string,
  filename: string,
  opts: {
    userId?: string;
    docTitle?: string;
    docContent?: string;
    coverLetter?: string;
    downloadToken?: string;
  } = {}
): Promise<void> {
  const res = await fetch("/api/pdf/api2pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      html,
      filename,
      userId: opts.userId,
      docTitle: opts.docTitle,
      docContent: opts.docContent,
      coverLetter: opts.coverLetter,
      downloadToken: opts.downloadToken,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `api2pdf returned ${res.status}`);
  }

  // Log storage result for debugging
  const pdfStored = res.headers.get("X-Pdf-Stored");
  console.log("[printCv] pdf storage status:", pdfStored);

  // Trigger a direct browser download from the binary response
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy 2 — iframe print fallback (shows OS print dialog)
// ─────────────────────────────────────────────────────────────────────────────
async function printViaIframe(html: string, filename: string): Promise<void> {
  const originalTitle = document.title;
  document.title = filename;

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:0;left:0;width:794px;height:0;" +
    "border:none;opacity:0;pointer-events:none;z-index:-1;";
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();
  });

  // Let fonts/images finish loading inside the iframe
  await new Promise<void>((r) => setTimeout(r, 600));

  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();

  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    document.title = originalTitle;
  }, 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────
export async function printCvAsPdf(
  element: HTMLElement,
  options: PrintCvOptions
): Promise<void> {
  const { filename, onStart, onComplete, useApi2Pdf = false, userId, docTitle, docContent, coverLetter, downloadToken } = options;
  onStart?.();

  try {
    // Fonts must be ready before we serialise the DOM
    await document.fonts.ready;
    await new Promise<void>((r) => setTimeout(r, 300));

    const html = buildPrintHtml(element, filename);

    if (useApi2Pdf) {
      await generateViaApi2Pdf(html, filename, { userId, docTitle, docContent, coverLetter, downloadToken });
    } else {
      await printViaIframe(html, filename);
    }
  } catch (err) {
    console.error("[printCv] failed:", err);
    // Re-throw so callers can show an error toast
    throw err;
  } finally {
    onComplete?.();
  }
}
