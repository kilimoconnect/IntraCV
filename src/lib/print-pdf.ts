/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Strategy:
 *  1. Show a white overlay while we work.
 *  2. Await document.fonts.ready so font metrics are stable.
 *  3. Scroll the window to y=0 — removes any fractional-pixel scroll
 *     offset from getBoundingClientRect that causes the small text shift.
 *  4. Temporarily remove transform:scale from the live CV element.
 *  5. Expand the parent container overflow so the full sheet is accessible.
 *  6. Capture each .cv-page-sheet with html2canvas at 2× resolution.
 *  7. Pack into jsPDF A4 and trigger a direct file download.
 */

const A4_MM_W = 210;
const A4_MM_H = 297;

export async function downloadCvAsPdf(element: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // White overlay — hides the brief layout change from the user
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML =
    '<p style="font-family:sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // Save state we will temporarily change
  const savedTransform = element.style.transform;
  const savedTransformOrigin = element.style.transformOrigin;
  const parent = element.parentElement;
  const savedParentOverflow = parent?.style.overflow ?? "";
  const savedParentHeight = parent?.style.height ?? "";
  const savedScrollY = window.scrollY;
  const savedScrollX = window.scrollX;

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // 1. Ensure all web fonts are measured before capture
    await document.fonts.ready;

    // 2. Scroll to exact origin so getBoundingClientRect has no scroll offset.
    //    This eliminates the fractional-pixel shift that causes text to drift.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    // 3. Unscale the live element
    element.style.transform = "none";
    element.style.transformOrigin = "unset";

    // 4. Expand parent so the full sheet height is accessible to html2canvas
    if (parent) {
      parent.style.overflow = "visible";
      parent.style.height = "auto";
    }

    // Two frames for layout to settle after scroll + transform removal
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const sheets = Array.from(
      element.querySelectorAll<HTMLElement>(".cv-page-sheet")
    );
    if (sheets.length === 0) throw new Error("No CV pages found in element");

    pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    for (let i = 0; i < sheets.length; i++) {
      if (i > 0) pdf.addPage();

      const canvas = await html2canvas(sheets[i], {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        // scrollX/Y are 0 because we scrolled the window to origin above
        scrollX: 0,
        scrollY: 0,
        onclone: (_doc, el) => {
          // Strip decorative styles injected by CVCanvasPreview
          el.style.boxShadow = "none";
          el.style.borderRadius = "0";
          el.style.margin = "0";
          _doc.querySelectorAll("style").forEach((s) => {
            if (s.textContent?.includes("cv-page-sheet")) s.remove();
          });
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
    element.style.transform = savedTransform;
    element.style.transformOrigin = savedTransformOrigin;
    if (parent) {
      parent.style.overflow = savedParentOverflow;
      parent.style.height = savedParentHeight;
    }
    window.scrollTo({ top: savedScrollY, left: savedScrollX, behavior: "instant" as ScrollBehavior });
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
