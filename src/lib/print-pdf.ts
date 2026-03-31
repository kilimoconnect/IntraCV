/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Text-shift root cause: the .cv-page-sheet elements sit deep in the
 * dashboard DOM (y ≈ 400–800 px from viewport top).  html2canvas computes
 * each text element's canvas position as:
 *   canvasY = getBoundingClientRect().top − elementTop
 * Any sub-pixel rounding at those large y values accumulates into a
 * visible downward drift.
 *
 * Fix: clone each sheet into a fixed-position container pinned exactly at
 * (top:0, left:0) so getBoundingClientRect().top === 0 and there is no
 * coordinate offset for html2canvas to round.
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

  // Isolated capture container: fixed at (0,0), behind the overlay,
  // exact A4 width, overflow visible so full sheet height renders.
  const captureRoot = document.createElement("div");
  captureRoot.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${A4_PX_W}px;
    overflow: visible;
    z-index: 99998;
    background: #fff;
    pointer-events: none;
  `;
  document.body.appendChild(captureRoot);

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // Ensure all web fonts are measured before any canvas draw
    await document.fonts.ready;

    const sheets = Array.from(
      element.querySelectorAll<HTMLElement>(".cv-page-sheet")
    );
    if (sheets.length === 0) throw new Error("No CV pages found in element");

    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let i = 0; i < sheets.length; i++) {
      if (i > 0) pdf.addPage();

      // Deep-clone the sheet into the isolated container at (0,0).
      // getBoundingClientRect() for the clone will return top≈0, left≈0
      // so html2canvas has zero coordinate offset to accumulate.
      const clone = sheets[i].cloneNode(true) as HTMLElement;
      clone.style.position = "relative"; // keep containing block for abs children
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      clone.style.borderRadius = "0";
      clone.style.width = `${A4_PX_W}px`;
      clone.style.height = `${A4_PX_H}px`;
      captureRoot.innerHTML = "";
      captureRoot.appendChild(clone);

      // One frame for the browser to lay out the clone
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: A4_PX_W,
        height: A4_PX_H,
        // Use the browser's own rendering engine for text (via SVG foreignObject).
        // This eliminates the text-baseline shift that occurs when html2canvas
        // re-calculates glyph positions with its own algorithm.
        foreignObjectRendering: true,
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
