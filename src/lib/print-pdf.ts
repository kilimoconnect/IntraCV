/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Strategy: clone the CV element off-screen at full A4 size (794×1123 px),
 * capture each .cv-page-sheet as a high-DPI canvas, then compile them into
 * a proper .pdf file that downloads automatically — no print dialog, works
 * on desktop and mobile.
 */

const A4_W_PX = 794;
const A4_H_PX = 1123;

export async function printCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  // Clone and position off-screen so the transform:scale from the preview
  // wrapper doesn't affect rendering.
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    "position:fixed",
    "left:-9999px",
    "top:0",
    `width:${A4_W_PX}px`,
    "transform:none",
    "transform-origin:unset",
    "margin:0",
    "padding:0",
    "z-index:-1",
  ].join(";");
  document.body.appendChild(clone);

  try {
    // Wait one frame so the browser computes layout for the clone
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const sheets = Array.from(clone.querySelectorAll<HTMLElement>(".cv-page-sheet"));
    const pages = sheets.length > 0 ? sheets : [clone];

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
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(imgData, "JPEG", 0, 0, A4_W_PX, A4_H_PX);
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    document.body.removeChild(clone);
  }
}
