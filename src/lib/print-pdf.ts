/**
 * Client-side CV PDF download via html-to-image + jsPDF.
 *
 * html-to-image renders via SVG foreignObject so the browser uses its own
 * native text engine — text positions are pixel-perfect, no baseline shift.
 *
 * Strategy:
 *  1. Show a white overlay so the user sees "Generating PDF…" while we work.
 *  2. Temporarily remove the transform:scale from the live CV element so it
 *     renders at its natural 794 px A4 width.
 *  3. Capture each .cv-page-sheet with html-to-image at 2× pixel ratio.
 *  4. Pack the JPEG images into a jsPDF A4 document.
 *  5. Trigger a direct browser file-save — no print dialog on any device.
 */

const A4_MM_W = 210;
const A4_MM_H = 297;

export async function downloadCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ toJpeg }, { default: jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  // White overlay — hides the brief layout change from the user
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML =
    '<p style="font-family:sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // Save inline transform set by CVCanvasPreview
  const savedTransform = element.style.transform;
  const savedTransformOrigin = element.style.transformOrigin;

  // Also expand parent overflow so the full sheet height is accessible
  const parent = element.parentElement;
  const savedParentOverflow = parent?.style.overflow ?? "";
  const savedParentHeight = parent?.style.height ?? "";

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // Unscale live element — browser keeps all computed styles & loaded fonts
    element.style.transform = "none";
    element.style.transformOrigin = "unset";
    if (parent) {
      parent.style.overflow = "visible";
      parent.style.height = "auto";
    }

    // Two frames for layout to settle
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const sheets = Array.from(
      element.querySelectorAll<HTMLElement>(".cv-page-sheet")
    );
    if (sheets.length === 0) throw new Error("No CV pages found in element");

    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let i = 0; i < sheets.length; i++) {
      if (i > 0) pdf.addPage();

      // html-to-image uses SVG foreignObject — browser's own text renderer,
      // no Canvas 2D baseline recalculation, no text shift.
      const imgData = await toJpeg(sheets[i], {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        // Strip the decorative <style> injected by CVCanvasPreview so the
        // box-shadow / border-radius don't influence the capture bounds.
        filter: (node) => {
          if (node instanceof HTMLStyleElement && node.textContent?.includes("cv-page-sheet")) {
            return false;
          }
          return true;
        },
        style: {
          boxShadow: "none",
          borderRadius: "0",
          margin: "0",
        },
      });

      pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
    element.style.transform = savedTransform;
    element.style.transformOrigin = savedTransformOrigin;
    if (parent) {
      parent.style.overflow = savedParentOverflow;
      parent.style.height = savedParentHeight;
    }
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
