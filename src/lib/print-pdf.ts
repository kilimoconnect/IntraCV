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

  // Cover the screen so the user sees a clean loading state while we
  // temporarily unscale the live CV element for accurate capture.
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML =
    '<p style="font-family:sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // Save the element's current inline transform (set by CVCanvasPreview scale)
  const savedTransform = element.style.transform;
  const savedTransformOrigin = element.style.transformOrigin;

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // Remove scale so the element sits at its natural 794 px width.
    // The browser keeps all computed styles / loaded fonts intact — no
    // re-rendering, so text metrics are exactly the same as on screen.
    element.style.transform = "none";
    element.style.transformOrigin = "unset";

    // One frame for the browser to reflow without the transform
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const sheets = Array.from(
      element.querySelectorAll<HTMLElement>(".cv-page-sheet")
    );
    if (sheets.length === 0) throw new Error("No CV pages found in element");

    pdf = new jsPDF({
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
        onclone: (_clonedDoc, el) => {
          // Remove box-shadow and border-radius so html2canvas doesn't expand
          // the canvas area beyond the sheet's exact 794×1123 px boundary.
          el.style.boxShadow = "none";
          el.style.borderRadius = "0";
          el.style.margin = "0";
          el.style.outline = "none";
          // Also strip the injected <style> that adds these decorative rules
          _clonedDoc.querySelectorAll("style").forEach((s) => {
            if (s.textContent?.includes("cv-page-sheet")) s.remove();
          });
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.93);
      pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
    // Always restore the transform and remove the overlay
    element.style.transform = savedTransform;
    element.style.transformOrigin = savedTransformOrigin;
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
