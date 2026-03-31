/**
 * Client-side CV PDF download via html-to-image + jsPDF.
 *
 * html-to-image uses SVG foreignObject so the browser renders text
 * with its own engine — no text-baseline shift and correct spacing.
 *
 * Earlier html-to-image attempts broke the layout because they captured
 * the live element inside the complex dashboard DOM.  The fix here is to
 * deep-clone each .cv-page-sheet into an isolated container pinned at
 * (top:0, left:0) with exact A4 dimensions.  In this clean context
 * html-to-image renders pixel-perfect output matching the on-screen preview.
 */

const A4_PX_W = 794;
const A4_PX_H = 1123;
const A4_MM_W = 210;
const A4_MM_H = 297;

export async function downloadCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ toJpeg }, { default: jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  // White overlay — user sees "Generating PDF…" while we work
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML =
    '<p style="font-family:sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // Isolated capture container: fixed at exact (0,0), same-origin so
  // fonts load, exact A4 size so html-to-image sees no extra dimensions.
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
      // second ensures any MutationObserver / font rendering settles.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const imgData = await toJpeg(clone, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

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
