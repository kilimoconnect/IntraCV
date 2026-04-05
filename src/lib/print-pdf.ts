/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Font environment: Next.js self-hosted Inter via next/font/google.
 * No CORS issues. Fonts are available immediately via document.fonts.
 *
 * Key fixes in this version:
 *  1. Font metric stabilisation — forces Inter to render at integer px sizes
 *     to prevent sub-pixel baseline shifts that cause word-spacing artifacts
 *  2. Watermark exclusion — any element with class "no-pdf" is stripped
 *  3. Dynamic scale matched to devicePixelRatio (capped at 3)
 *  4. windowWidth/Height forced to A4 — prevents mobile breakpoints leaking in
 *  5. Three rAF frames — mobile needs extra time for font + layout settlement
 *  6. print-color-adjust:exact — preserves background colours and gradients
 *  7. PNG output — lossless, no JPEG fringing around text
 *  8. letter-spacing normalisation — html2canvas mis-measures Inter's tracked
 *     spacing at small sizes; we pin it to a stable value on the clone
 */

const A4_PX_W = 794;
const A4_PX_H = 1123;
const A4_MM_W = 210;
const A4_MM_H = 297;

// Inter weights used in the CV. We explicitly check each is loaded before
// capture — document.fonts.ready resolves when fonts are *scheduled*, not
// necessarily when they are fully measured by the layout engine.
const INTER_WEIGHTS = ["300", "400", "500", "600", "700"];

/**
 * Waits until every Inter weight we care about is confirmed loaded.
 * Falls back gracefully if the FontFaceSet API is unavailable.
 */
async function waitForInterFonts(): Promise<void> {
  if (!("fonts" in document)) return;

  await document.fonts.ready;

  // Check each weight explicitly — some weights may still be in "loading"
  // state even after document.fonts.ready resolves on slow mobile connections.
  const checks = INTER_WEIGHTS.map((weight) =>
    document.fonts.load(`${weight} 16px Inter`)
  );

  await Promise.all(checks);

  // One additional frame after font load to let the layout engine
  // recalculate all text metrics with the confirmed font data.
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

/**
 * Recursively walks all elements inside the clone and applies font metric
 * stabilisation. This prevents Inter's sub-pixel rendering differences
 * between screen and canvas from causing word-spacing and baseline shifts.
 */
function stabiliseFontMetrics(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;

  while (node) {
    const el = node as HTMLElement;
    if (el.style !== undefined) {
      const computed = window.getComputedStyle(el);

      // Round fontSize to nearest integer px — fractional sizes cause
      // different sub-pixel rounding between screen renderer and canvas.
      const fs = parseFloat(computed.fontSize);
      if (!isNaN(fs)) {
        el.style.fontSize = `${Math.round(fs)}px`;
      }

      // Normalise lineHeight to a unitless ratio — "normal" resolves
      // differently in canvas vs the browser layout engine, causing the
      // vertical baseline shift seen in the PDF.
      const lh = computed.lineHeight;
      if (lh !== "normal") {
        const lhPx = parseFloat(lh);
        const fsPx = parseFloat(computed.fontSize);
        if (!isNaN(lhPx) && !isNaN(fsPx) && fsPx > 0) {
          el.style.lineHeight = `${(lhPx / fsPx).toFixed(4)}`;
        }
      }

      // Pin letter-spacing to 0 if it was "normal" — html2canvas interprets
      // "normal" letter-spacing differently from the browser, adding phantom
      // space between characters (visible as extra gaps between words in PDF).
      const ls = computed.letterSpacing;
      if (ls === "normal" || ls === "0px") {
        el.style.letterSpacing = "0px";
      }

      // Force word-spacing to normal — some Inter weights at small sizes
      // accumulate rounding errors in word-spacing that multiply across
      // a line, producing the "Six Sigma ," artifact seen in the PDF.
      el.style.wordSpacing = "0px";

      // Disable font smoothing differences between screen and canvas.
      // Canvas always renders with antialiasing; forcing it on screen-side
      // too means the metrics match.
      (el.style as CSSStyleDeclaration & { webkitFontSmoothing?: string })
        .webkitFontSmoothing = "antialiased";
    }

    node = walker.nextNode();
  }
}

/**
 * Strips all elements marked with "no-pdf" from the clone.
 * Use this for watermarks, action buttons, tooltips, banners, etc.
 */
function stripNoPdfElements(root: HTMLElement): void {
  root.querySelectorAll(".no-pdf").forEach((el) => el.remove());
}

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // ── Overlay ───────────────────────────────────────────────────────────────
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
    '<p style="font-family:Inter,sans-serif;font-size:14px;color:#4f46e5;">Generating PDF\u2026</p>';
  document.body.appendChild(overlay);

  // ── Capture container ─────────────────────────────────────────────────────
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

  // ── Global style: force colour fidelity inside capture root ───────────────
  const resetStyle = document.createElement("style");
  resetStyle.textContent = `
    #cv-capture-root * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
    }
  `;
  document.head.appendChild(resetStyle);

  let pdf: InstanceType<typeof jsPDF> | null = null;

  try {
    // Wait for Inter to be fully measured — not just scheduled.
    await waitForInterFonts();

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

      // ── Clone ─────────────────────────────────────────────────────────────
      const clone = sheets[i].cloneNode(true) as HTMLElement;

      // Hard-reset all layout properties so no mobile responsive CSS bleeds in
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
        font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
      `;

      captureRoot.innerHTML = "";
      captureRoot.appendChild(clone);

      // Strip watermarks and UI-only elements before metric stabilisation
      stripNoPdfElements(clone);

      // Stabilise font metrics on every element inside the clone.
      // Must run after the clone is in the DOM so getComputedStyle works.
      stabiliseFontMetrics(clone);

      // Three rAF frames:
      // 1 — browser schedules layout for clone
      // 2 — layout applied, paint callbacks queued
      // 3 — mobile extra: font metrics + flex/grid fully settled
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve())
          )
        )
      );

      // Dynamic scale — match device pixel density, cap at 3 to avoid
      // out-of-memory on older high-DPR phones.
      const scale = Math.min(window.devicePixelRatio * 1.5, 3);

      const canvas = await html2canvas(clone, {
        scale,
        useCORS: true,
        allowTaint: false,       // false is correct — fonts are self-hosted
        backgroundColor: "#ffffff",
        width: A4_PX_W,
        height: A4_PX_H,
        windowWidth: A4_PX_W,   // prevents mobile breakpoints activating
        windowHeight: A4_PX_H,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (el: Element) => el.classList.contains("no-pdf"),
      });

      // PNG — lossless, no JPEG colour fringing around text edges
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
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
