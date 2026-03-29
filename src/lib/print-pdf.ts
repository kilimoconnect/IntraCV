/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Strategy: clone each .cv-page-sheet individually into a clean body-level
 * wrapper (no parent overflow clipping, no transform scale). All Tailwind
 * CSS and inline styles are already in the document so the clone renders
 * identically to the screen preview. Downloads automatically — no dialog.
 */

const A4_W_PX = 794;
const A4_H_PX = 1123;

async function capturePageToCanvas(
  source: HTMLElement,
  html2canvas: (el: HTMLElement, opts: object) => Promise<HTMLCanvasElement>
): Promise<HTMLCanvasElement> {
  const clone = source.cloneNode(true) as HTMLElement;

  // Reset any inherited transform or preview-specific overrides
  clone.style.transform = "none";
  clone.style.transformOrigin = "unset";
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";
  clone.style.margin = "0";

  // Isolated wrapper — body-level, no overflow clipping
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `position:fixed;left:-9999px;top:0;width:${A4_W_PX}px;height:${A4_H_PX}px;overflow:visible;pointer-events:none;z-index:-9999;`;
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Two frames: reflow + paint
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    return await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: A4_W_PX,
      height: A4_H_PX,
      logging: false,
      imageTimeout: 0,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function printCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  // Wait for fonts so text renders correctly
  await document.fonts.ready;

  const sheets = Array.from(element.querySelectorAll<HTMLElement>(".cv-page-sheet"));
  const sources = sheets.length > 0 ? sheets : [element];

  const pdf = new jsPDF({
    unit: "px",
    format: [A4_W_PX, A4_H_PX],
    orientation: "portrait",
    compress: true,
  });

  for (let i = 0; i < sources.length; i++) {
    if (i > 0) pdf.addPage([A4_W_PX, A4_H_PX], "portrait");

    const canvas = await capturePageToCanvas(sources[i], html2canvas);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    pdf.addImage(imgData, "JPEG", 0, 0, A4_W_PX, A4_H_PX);
  }

  pdf.save(`${filename}.pdf`);
}
