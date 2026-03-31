/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Renders a real .pdf file download with no browser print dialog.
 * Works identically on desktop and mobile (iOS, Android, all browsers).
 *
 * Strategy:
 *  1. Clone the CV element and strip the transform:scale used in the preview.
 *  2. Position the clone off-screen at the true A4 width (794 px) so fonts
 *     and layout render at full resolution.
 *  3. Capture each .cv-page-sheet with html2canvas at 2× device-pixel-ratio.
 *  4. Pack the captured images into a jsPDF A4 document.
 *  5. Trigger a browser file-save (no dialog, no user interaction required).
 */

const A4_PX_W = 794;
const A4_PX_H = 1123;
const A4_MM_W = 210;
const A4_MM_H = 297;

export async function downloadCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Clone so we never mutate the live preview
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = `
    position: fixed;
    top: -${A4_PX_H * 10}px;
    left: 0;
    width: ${A4_PX_W}px;
    min-width: ${A4_PX_W}px;
    transform: none !important;
    transform-origin: unset !important;
    z-index: -9999;
    visibility: visible;
    opacity: 1;
    background: white;
    overflow: visible;
  `;
  document.body.appendChild(clone);

  // Brief pause so the browser lays out the cloned element
  await new Promise<void>((r) => setTimeout(r, 120));

  const sheets = Array.from(clone.querySelectorAll<HTMLElement>(".cv-page-sheet"));
  if (sheets.length === 0) {
    document.body.removeChild(clone);
    throw new Error("No CV pages found in element");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  for (let i = 0; i < sheets.length; i++) {
    if (i > 0) pdf.addPage();

    const canvas = await html2canvas(sheets[i], {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: A4_PX_W,
      height: A4_PX_H,
      windowWidth: A4_PX_W,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.93);
    pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
  }

  document.body.removeChild(clone);
  pdf.save(`${filename}.pdf`);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed", err)
  );
}
