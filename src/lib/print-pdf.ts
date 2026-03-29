/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Strategy: temporarily remove the transform:scale applied by the canvas
 * preview wrapper on the ORIGINAL element, capture each .cv-page-sheet
 * directly (all computed styles already resolved), then restore the
 * transform. Produces a faithful rendering on both desktop and mobile
 * with no print dialog.
 */

const A4_W_PX = 794;
const A4_H_PX = 1123;

export async function printCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  // Wait for all fonts to finish loading before capture
  await document.fonts.ready;

  // Save and reset the preview transform so html2canvas sees full-size pages
  const savedTransform = element.style.transform;
  const savedOrigin = element.style.transformOrigin;
  const savedWidth = element.style.width;
  const savedPointerEvents = element.style.pointerEvents;

  element.style.transform = "none";
  element.style.transformOrigin = "unset";
  element.style.width = `${A4_W_PX}px`;
  element.style.pointerEvents = "none";

  // Two frames: first reflow, second paint
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  try {
    const sheets = Array.from(element.querySelectorAll<HTMLElement>(".cv-page-sheet"));
    const pages = sheets.length > 0 ? sheets : [element];

    const pdf = new jsPDF({
      unit: "px",
      format: [A4_W_PX, A4_H_PX],
      orientation: "portrait",
      compress: true,
    });

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage([A4_W_PX, A4_H_PX], "portrait");

      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: A4_W_PX,
        height: A4_H_PX,
        logging: false,
        imageTimeout: 0,
        // Scroll offsets: ensure we capture from the top-left of each sheet
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(imgData, "JPEG", 0, 0, A4_W_PX, A4_H_PX);
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    // Always restore the original preview transform
    element.style.transform = savedTransform;
    element.style.transformOrigin = savedOrigin;
    element.style.width = savedWidth;
    element.style.pointerEvents = savedPointerEvents;
  }
}
