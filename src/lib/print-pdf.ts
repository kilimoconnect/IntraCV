/**
 * Client-side CV PDF download via html-to-image + jsPDF.
 *
 * html-to-image uses the browser's native SVGForeignObject renderer so
 * every CSS property (absolute positioning, grid, custom properties, fonts)
 * is handled exactly as the browser draws it on screen.
 * No print dialog — downloads automatically on desktop and mobile.
 */

const A4_W_PX = 794;
const A4_H_PX = 1123;

async function capturePageAsJpeg(
  source: HTMLElement,
  toJpeg: (el: HTMLElement, opts: object) => Promise<string>
): Promise<string> {
  const clone = source.cloneNode(true) as HTMLElement;

  // Strip screen-only decorations
  clone.style.transform = "none";
  clone.style.transformOrigin = "unset";
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";
  clone.style.margin = "0";

  // position:absolute (not fixed) — avoids iOS Safari viewport-relative
  // positioning bugs that break absolutely-positioned child elements
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `position:absolute;left:-9999px;top:0;width:${A4_W_PX}px;height:${A4_H_PX}px;overflow:visible;pointer-events:none;`;
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Two animation frames: layout reflow + paint
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    return await toJpeg(clone, {
      quality: 0.92,
      width: A4_W_PX,
      height: A4_H_PX,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      skipFonts: false,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function printCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: jsPDF }, { toJpeg }] = await Promise.all([
    import("jspdf"),
    import("html-to-image"),
  ]);

  // Ensure all fonts are loaded before capture
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

    const imgData = await capturePageAsJpeg(sources[i], toJpeg);
    pdf.addImage(imgData, "JPEG", 0, 0, A4_W_PX, A4_H_PX);
  }

  pdf.save(`${filename}.pdf`);
}
