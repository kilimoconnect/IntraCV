/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * html2canvas renders directly to a <canvas> element using the browser's
 * native 2D engine — no SVG foreignObject involved. This means all CSS
 * (borderRadius, flexbox, gap, grid, list-item, etc.) renders exactly as
 * it does on screen, with no per-property workarounds needed.
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

  // White overlay — user sees "Generating PDF…" while we work
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML =
    '<p style="font-family:sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // Isolated capture container: fixed at exact (0,0) so html2canvas
  // captures at a predictable viewport position with exact A4 dimensions.
  const captureRoot = document.createElement("div");
  captureRoot.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${A4_PX_W}px;
    height: ${A4_PX_H}px;
    overflow: hidden;
    z-index: 99998;
    background: #fff;
    pointer-events: none;
  `;
  document.body.appendChild(captureRoot);

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // Ensure all web fonts are measured before any capture
    await document.fonts.ready;

    const sheets = Array.from(
      element.querySelectorAll<HTMLElement>(".cv-page-sheet")
    );
    if (sheets.length === 0) throw new Error("No CV pages found in element");

    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let i = 0; i < sheets.length; i++) {
      if (i > 0) pdf.addPage();

      // Deep-clone into the isolated container.
      // position:relative is kept so absolutely-positioned children
      // resolve coordinates against the sheet (not the viewport).
      const clone = sheets[i].cloneNode(true) as HTMLElement;
      clone.style.position = "relative";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      clone.style.borderRadius = "0";
      clone.style.width = `${A4_PX_W}px`;
      clone.style.height = `${A4_PX_H}px`;
      clone.style.overflow = "hidden";
      captureRoot.innerHTML = "";
      captureRoot.appendChild(clone);

      // Two frames: first lets the browser lay out the clone,
      // second ensures fonts and any paint callbacks settle.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      // Pass scrollX/scrollY:0 so html2canvas treats the position:fixed
      // clone's viewport position (0,0) as its document position, regardless
      // of how far the user has scrolled the page.
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: A4_PX_W,
        height: A4_PX_H,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
    document.body.removeChild(captureRoot);
    document.body.removeChild(overlay);
  }

  if (pdf) pdf.save(`${filename}.pdf`);
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed", err)
  );
}
