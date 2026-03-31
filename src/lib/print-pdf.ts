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

  // Clone so we never mutate the live preview.
  // Key: position: absolute at top:0 (not fixed at huge negative top) so
  // html2canvas calculates text baselines from the correct document origin.
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = `
    position: absolute;
    top: 0;
    left: -${A4_PX_W + 200}px;
    width: ${A4_PX_W}px;
    min-width: ${A4_PX_W}px;
    transform: none !important;
    transform-origin: unset !important;
    pointer-events: none;
    background: white;
    overflow: visible;
  `;

  // Wrap in a zero-size container so the clone doesn't affect page layout
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:-1;";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Brief pause so the browser lays out the cloned element
  await new Promise<void>((r) => setTimeout(r, 150));

  const sheets = Array.from(clone.querySelectorAll<HTMLElement>(".cv-page-sheet"));
  if (sheets.length === 0) {
    document.body.removeChild(wrapper);
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
      // Prevent html2canvas from incorporating any scroll offset into coordinates
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.93);
    pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
  }

  document.body.removeChild(wrapper);
  pdf.save(`${filename}.pdf`);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed", err)
  );
}
