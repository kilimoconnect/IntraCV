/**
 * CV PDF download — clone-and-capture approach with html-to-image + jsPDF.
 *
 * Why clone instead of capturing in-place?
 *   The preview wrapper has transform:scale(X) so A4 pages fit in the sidebar.
 *   html-to-image accounts for ancestor transforms, so an in-place capture
 *   produces content at ~45% scale. We also can't just set style.transform=none
 *   because React may re-apply the transform during the async capture.
 *
 *   Solution: deep-clone each .cv-page-sheet into a temporary fixed container
 *   at position top:-99999px (above the viewport). The clone has no scale
 *   ancestor, no watermark overlay, and is unaffected by React re-renders.
 *   html-to-image sees it as a plain 794×1123 element and renders it correctly.
 */

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const A4_W_MM = 210;
const A4_H_MM = 297;
const A4_W_PX = 794;
const A4_H_PX = 1123;

/**
 * Deep-clone a .cv-page-sheet into an isolated off-screen container,
 * capture it as a 2× PNG, then clean up.
 */
async function captureSheet(sheet: HTMLElement): Promise<string> {
  // Build an isolated wrapper — no transforms, no overflow clipping, no watermark
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "-99999px",       // above the viewport — always rendered by browser
    left: "0px",
    width: `${A4_W_PX}px`,
    height: `${A4_H_PX}px`,
    overflow: "hidden",
    background: "#ffffff",
    zIndex: "-1",
    pointerEvents: "none",
  });

  // Clone the sheet (preserves inline styles, classes, and child tree)
  const clone = sheet.cloneNode(true) as HTMLElement;
  // Ensure the clone itself fills the container at natural A4 size
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.zoom = "1";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // One rAF so the browser has computed layout for the clone
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  try {
    return await toPng(clone, {
      width: A4_W_PX,
      height: A4_H_PX,
      pixelRatio: 2,        // retina quality
      skipAutoScale: true,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // ── 1. Collect pages ──────────────────────────────────────────────────────
  const sheets = Array.from(
    element.querySelectorAll<HTMLElement>(".cv-page-sheet")
  );
  if (sheets.length === 0) {
    throw new Error(
      'No CV pages found — ensure each page has class "cv-page-sheet".'
    );
  }

  // ── 2. Capture each page as a PNG ─────────────────────────────────────────
  const images: string[] = [];
  for (const sheet of sheets) {
    images.push(await captureSheet(sheet));
  }

  // ── 3. Assemble A4 PDF ────────────────────────────────────────────────────
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  images.forEach((imgData, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, A4_W_MM, A4_H_MM, undefined, "FAST");
  });

  // ── 4. Trigger download ───────────────────────────────────────────────────
  const safeName = filename.replace(/[^a-z0-9_\-]/gi, "_");
  pdf.save(`${safeName}.pdf`);
}

/** @deprecated — use downloadCvAsPdf */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch(console.error);
}
