/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Fixes applied for mobile (iOS/Android Chrome) compatibility:
 *  1. Dynamic scale matched to devicePixelRatio (capped at 3)
 *  2. windowWidth/Height forced to A4 — prevents mobile layout leaking in
 *  3. Three rAF frames instead of two — mobile needs more paint time
 *  4. allowTaint:true — captures icon fonts & cross-origin assets
 *  5. Clone cssText fully overridden with !important — no media-query bleed
 *  6. print-color-adjust:exact — preserves background colours & gradients
 *  7. PNG instead of JPEG — sharp text edges, no colour fringing
 *  8. ignoreElements — skip any element with class "no-pdf"
 */

const A4_PX_W = 794;
const A4_PX_H = 1123;
const A4_MM_W = 210;
const A4_MM_H = 297;

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // ── Lazy-load heavy libs so they don't bloat the initial bundle ──────────
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // ── Overlay — user sees "Generating PDF…" while we work ─────────────────
  const overlay = document.createElement("div");
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "background:#fff",
    "z-index:99999",
    "display:flex",
    "align-items:center",
    "justify-content:center",
  ].join(";");
  overlay.innerHTML =
    '<p style="font-family:sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // ── Isolated capture container fixed at (0,0) at exact A4 pixel size ────
  // Placing it at the top-left corner means html2canvas captures from a
  // predictable coordinate, regardless of how far the user has scrolled.
  const captureRoot = document.createElement("div");
  captureRoot.id = "cv-capture-root";
  captureRoot.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    `width:${A4_PX_W}px`,
    `height:${A4_PX_H}px`,
    "overflow:hidden",
    "z-index:99998",
    "background:#fff",
    "pointer-events:none",
  ].join(";");
  document.body.appendChild(captureRoot);

  // ── Style block: force colour fidelity inside the capture root ───────────
  // Without this, mobile Chrome drops background-color on many elements
  // (sidebars, badges, coloured sections all go white/transparent).
  const resetStyle = document.createElement("style");
  resetStyle.textContent = `
    #cv-capture-root * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  `;
  document.head.appendChild(resetStyle);

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // Wait for all web fonts to finish loading before any capture.
    // On mobile this can take an extra 200–400 ms — skipping it causes
    // text to render in a fallback font (shifted baselines, wrong metrics).
    await document.fonts.ready;

    const sheets = Array.from(
      element.querySelectorAll<HTMLElement>(".cv-page-sheet")
    );
    if (sheets.length === 0) {
      throw new Error(
        'No CV pages found. Ensure each page has the class "cv-page-sheet".'
      );
    }

    pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < sheets.length; i++) {
      if (i > 0) pdf.addPage();

      // ── Deep-clone the page sheet into the capture container ─────────────
      const clone = sheets[i].cloneNode(true) as HTMLElement;

      // Override ALL layout-affecting properties so no mobile responsive
      // CSS leaks in. Using cssText + !important beats any stylesheet rule.
      clone.style.cssText = `
        position: relative !important;
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        width: ${A4_PX_W}px !important;
        min-width: ${A4_PX_W}px !important;
        max-width: ${A4_PX_W}px !important;
        height: ${A4_PX_H}px !important;
        min-height: ${A4_PX_H}px !important;
        overflow: hidden !important;
        zoom: 1 !important;
        transform: none !important;
        transform-origin: top left !important;
      `;

      captureRoot.innerHTML = "";
      captureRoot.appendChild(clone);

      // ── Three animation frames ───────────────────────────────────────────
      // Frame 1: browser schedules layout for the new clone
      // Frame 2: layout is applied, paint callbacks queued
      // Frame 3: mobile-specific — extra time for font rendering & flex/grid
      //          recalculations that desktop resolves in 2 frames
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve())
          )
        )
      );

      // ── Dynamic scale matched to the device's actual pixel density ───────
      // scale:2 on a 3× screen = canvas is lower-res than the display,
      // causing blurry text and sub-pixel shifts. Capped at 3 to prevent
      // out-of-memory crashes on older phones with high devicePixelRatio.
      const scale = Math.min(window.devicePixelRatio * 1.5, 3);

      const canvas = await html2canvas(clone, {
        scale,
        useCORS: true,
        // allowTaint: needed for icon fonts (Font Awesome, Phosphor, etc.)
        // and any asset served from a CDN without explicit CORS headers.
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: A4_PX_W,
        height: A4_PX_H,
        // windowWidth/Height tells html2canvas what "viewport" to assume
        // when evaluating CSS. Without this, it uses window.innerWidth
        // (~390 px on iPhone) — triggering every mobile breakpoint inside
        // the clone and completely breaking the two-column layout.
        windowWidth: A4_PX_W,
        windowHeight: A4_PX_H,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        // Skip any element tagged with "no-pdf" (tooltips, action buttons,
        // download banners, etc.) so they don't appear in the output.
        ignoreElements: (el: Element) =>
          el.classList.contains("no-pdf"),
      });

      // ── PNG over JPEG ────────────────────────────────────────────────────
      // JPEG compression introduces colour fringing around dark text on
      // light backgrounds and loses transparency. PNG is lossless — text
      // stays crisp and coloured backgrounds render accurately.
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
    // Always clean up — even if an error is thrown mid-loop
    document.head.removeChild(resetStyle);
    document.body.removeChild(captureRoot);
    document.body.removeChild(overlay);
  }

  if (pdf) {
    pdf.save(`${filename}.pdf`);
  }
}

/** @deprecated Use downloadCvAsPdf instead */
export function printCvAsPdf(element: HTMLElement, filename: string): void {
  downloadCvAsPdf(element, filename).catch((err) =>
    console.error("PDF export failed:", err)
  );
}
