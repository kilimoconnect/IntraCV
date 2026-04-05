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
 *   1. For every .cv-page-sheet element, temporarily remove zoom (so the
 *      element is at its natural 794 × 1123 px) and capture as a 2× PNG.
 *   2. Pack the PNGs into an A4 jsPDF document.
 *   3. Trigger a direct blob download — no server, no print dialog, works on
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
 * Any CSS zoom on the element is temporarily reset to 1 so html-to-image
 * always sees exactly 794 × 1123 px, then the original zoom is restored.
 */
async function captureSheet(sheet: HTMLElement): Promise<string> {
  const prevZoom = sheet.style.zoom;
  const prevMinHeight = sheet.style.minHeight;

  // Temporarily lock dimensions to natural A4 size
  sheet.style.zoom = "1";
  sheet.style.minHeight = `${A4_H_PX}px`;

  // Force a layout pass before capturing
  sheet.getBoundingClientRect();

  try {
    const dataUrl = await toPng(sheet, {
      width: A4_W_PX,
      height: A4_H_PX,
      pixelRatio: 2,            // retina-quality output
      skipAutoScale: true,
      cacheBust: true,          // avoid stale cached resources
      style: {
        // Make sure .no-pdf elements are hidden in the capture
        overflow: "hidden",
      },
      filter: (node) => {
        // Exclude any element with the .no-pdf class
        if (node instanceof Element) {
          return !node.classList.contains("no-pdf");
        }
        return true;
      },
    });
    return dataUrl;
  } finally {
    // Always restore original styles
    sheet.style.zoom = prevZoom;
    sheet.style.minHeight = prevMinHeight;
  }
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

  // ── 2. Capture each page as a PNG ─────────────────────────────────────────
  const images: string[] = [];
  for (const sheet of sheets) {
    images.push(await captureSheet(sheet));
  }

  // ── 3. Build PDF ──────────────────────────────────────────────────────────
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  images.forEach((imgData, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, A4_W_MM, A4_H_MM, undefined, "FAST");
  });

  // ── 4. Download ───────────────────────────────────────────────────────────
  const safeName = filename.replace(/[^a-z0-9_\-]/gi, "_");
  pdf.save(`${safeName}.pdf`);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed:", err)
  );
}
