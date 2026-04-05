/**
 * CV PDF download — client-side image capture via html-to-image + jsPDF.
 *
 * Why html-to-image instead of html2canvas?
 *   html2canvas reimplements its own font renderer which differs from the
 *   browser's, causing text to wrap at different points (the "text shift"
 *   bug).  html-to-image uses the browser's own layout engine via SVG
 *   foreignObject — the rendered pixels match the on-screen preview exactly.
 *
 * Flow:
 *   1. Hide the preview watermark overlay and strip transform:scale() from the
 *      pages wrapper so html-to-image captures at natural A4 pixel dimensions.
 *   2. For every .cv-page-sheet, capture as a 2× PNG.
 *   3. Pack the PNGs into an A4 jsPDF document.
 *   4. Trigger a direct blob download — no server, no print dialog, works on
 *      every device including iOS.
 */

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/** A4 dimensions in mm */
const A4_W_MM = 210;
const A4_H_MM = 297;

/** Natural A4 pixel dimensions at 96 dpi */
const A4_W_PX = 794;
const A4_H_PX = 1123;

/**
 * Capture a single CV page as a 2× PNG data-URL.
 * The caller is responsible for ensuring the sheet's parent has no
 * transform:scale applied before calling this.
 */
async function captureSheet(sheet: HTMLElement): Promise<string> {
  // Force a layout pass so measurements are stable
  sheet.getBoundingClientRect();

  return toPng(sheet, {
    width: A4_W_PX,
    height: A4_H_PX,
    pixelRatio: 2,          // retina-quality output
    skipAutoScale: true,
    cacheBust: true,
    filter: (node) => {
      // Exclude any element explicitly marked as non-printable
      if (node instanceof Element) {
        return !node.classList.contains("no-pdf") &&
               !node.classList.contains("cv-preview-watermark");
      }
      return true;
    },
  });
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

  // ── 2. Hide watermark overlays (they are siblings / ancestors of sheets) ──
  //    .cv-preview-watermark is the SVG overlay in CVCanvasPreview.
  //    We hide them globally so they cannot bleed into the captured image.
  const watermarks = Array.from(
    document.querySelectorAll<HTMLElement>(".cv-preview-watermark")
  );
  watermarks.forEach((el) => (el.style.visibility = "hidden"));

  // ── 3. Strip parent transform:scale so html-to-image captures at 1:1 ──────
  //    previewRef (= element here) has transform:scale(X) applied by
  //    CVCanvasPreview to fit the A4 canvas into the sidebar.  html-to-image
  //    accounts for ancestor transforms when compositing, so we must reset it
  //    to 1:1 before capture and restore it afterwards.
  const prevTransform = element.style.transform;
  const prevTransformOrigin = element.style.transformOrigin;
  element.style.transform = "none";
  element.style.transformOrigin = "top left";

  try {
    // ── 4. Capture each page ────────────────────────────────────────────────
    const images: string[] = [];
    for (const sheet of sheets) {
      images.push(await captureSheet(sheet));
    }

    // ── 5. Build PDF ────────────────────────────────────────────────────────
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    images.forEach((imgData, i) => {
      if (i > 0) pdf.addPage();
      // Fill the entire A4 page — no margin, no gap between pages
      pdf.addImage(imgData, "PNG", 0, 0, A4_W_MM, A4_H_MM, undefined, "FAST");
    });

    // ── 6. Download ─────────────────────────────────────────────────────────
    const safeName = filename.replace(/[^a-z0-9_\-]/gi, "_");
    pdf.save(`${safeName}.pdf`);
  } finally {
    // Always restore the visual state regardless of success/failure
    element.style.transform = prevTransform;
    element.style.transformOrigin = prevTransformOrigin;
    watermarks.forEach((el) => (el.style.visibility = ""));
  }
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed:", err)
  );
}
