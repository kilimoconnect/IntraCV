/**
 * Client-side CV PDF download via html2canvas + jsPDF.
 *
 * Font environment: Next.js self-hosted Inter via next/font/google.
 * No CORS issues. Fonts are available immediately via document.fonts.
 *
 * Root cause of text shifting fixed in this version:
 *  → text-align:justify causes html2canvas to misplace word gaps and
 *    push punctuation away from words ("Excel models ," "100 %").
 *    All justified text is forced to left-align on the clone before capture.
 *
 * Full fix list:
 *  1. text-align:justify → left on entire clone (ROOT CAUSE of word-gap drift)
 *  2. Font metric stabilisation — integer px fontSize, unitless lineHeight
 *  3. letter-spacing pinned to 0px where it was "normal"
 *  4. word-spacing:normal (NOT 0px — conflicts with justify override)
 *  5. Watermark/UI exclusion via class "no-pdf"
 *  6. Fixed scale:2 — stable rounding paths, no DPR instability
 *  7. windowWidth/Height forced to A4 — prevents mobile breakpoints leaking
 *  8. Three rAF frames — mobile needs extra time for layout settlement
 *  9. print-color-adjust:exact — preserves background colours & gradients
 * 10. PNG output — lossless, no JPEG fringing around text
 * 11. Inter font weights explicitly awaited before capture
 * 12. CSS zoom > 1 reset to 1 — prevents right-edge clipping (canvas+overflow)
 * 13. CSS zoom < 1 → transform:scale — html2canvas handles transform correctly
 * 14. lineHeight ratio uses pre-rounded fontSize — prevents vertical drift
 */

const A4_PX_W = 794;
const A4_PX_H = 1123;
const A4_MM_W = 210;
const A4_MM_H = 297;

// Inter weights used in the CV. Explicitly awaited before capture —
// document.fonts.ready resolves when fonts are scheduled, not necessarily
// when they are fully measured by the layout engine.
const INTER_WEIGHTS = ["300", "400", "500", "600", "700"];

/**
 * Waits until every Inter weight is confirmed loaded and measured.
 * Falls back gracefully if the FontFaceSet API is unavailable.
 */
async function waitForInterFonts(): Promise<void> {
  if (!("fonts" in document)) return;

  await document.fonts.ready;

  // Explicitly load each weight — some may still be in "loading" state
  // even after document.fonts.ready resolves on slow mobile connections.
  const checks = INTER_WEIGHTS.map((weight) =>
    document.fonts.load(`${weight} 16px Inter`)
  );
  await Promise.all(checks);

  // One extra frame after font load so the layout engine can
  // recalculate all text metrics with the confirmed font data.
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
}

/**
 * Strips all elements marked "no-pdf" from the clone before capture.
 * Apply class "no-pdf" to: watermarks, download buttons, tooltips,
 * preview banners, or any UI element that must not appear in the PDF.
 */
function stripNoPdfElements(root: HTMLElement): void {
  root.querySelectorAll(".no-pdf").forEach((el) => el.remove());
}

/**
 * Walks every element in the clone and stabilises font metrics so that
 * html2canvas renders text identically to the browser's layout engine.
 *
 * Key fixes applied here:
 *  - text-align:justify → left  (ROOT CAUSE of "Excel models ," artifacts)
 *  - fontSize rounded to integer px
 *  - lineHeight converted to unitless ratio
 *  - letterSpacing pinned to "0px" when "normal"
 *  - wordSpacing left as "normal" (not 0px)
 */
function stabiliseFontMetrics(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;

  while (node) {
    const el = node as HTMLElement;

    if (el.style !== undefined) {
      const computed = window.getComputedStyle(el);

      // ── ROOT CAUSE FIX ───────────────────────────────────────────────────
      // justify tells the browser to stretch word gaps to fill the line width.
      // html2canvas reads final character pixel positions but reconstructs
      // text using its own drawing — the stretched gaps don't transfer, so
      // words drift apart and punctuation floats ("100 %" "models ,").
      // left-align uses natural word gaps that html2canvas reproduces exactly.
      if (computed.textAlign === "justify") {
        el.style.textAlign = "left";
      }

      // ── CSS zoom handling ─────────────────────────────────────────────────
      // html2canvas misplaces text inside zoomed elements (reads DOM positions
      // which include zoom, then re-draws without applying the zoom factor).
      //
      // zoom < 1 (scale-down, content overflows page):
      //   Convert to transform:scale — html2canvas uses its own transform
      //   matrix, rendering text at correct scaled positions.
      //   The visual output (< natural size) fits within parent overflow:hidden.
      //
      // zoom > 1 (scale-up, from usePageFill sparse-content path):
      //   Reset to 1. With zoom > 1 or transform:scale > 1, the fill div
      //   visually expands beyond the parent's overflow:hidden AND beyond the
      //   794px html2canvas canvas width, clipping the right edge of content
      //   (dates "Jan 2019 - Present" become "Jan 2019 - Pr" in the PDF).
      //   Resetting to 1 keeps content at natural scale — minor extra whitespace
      //   at the bottom of the page, but no right-edge clipping.
      const rawZoom = parseFloat((el as HTMLElement & { style: CSSStyleDeclaration & { zoom?: string } }).style.zoom || "");
      if (!isNaN(rawZoom) && rawZoom > 0 && rawZoom !== 1) {
        (el as HTMLElement & { style: CSSStyleDeclaration & { zoom?: string } }).style.zoom = "1";
        if (rawZoom < 1) {
          // Scale-down: use transform so html2canvas handles it correctly
          el.style.transform = `scale(${rawZoom})`;
          el.style.transformOrigin = "top left";
        }
        // Scale-up (rawZoom > 1): zoom reset to 1 above — no transform applied.
      }

      // ── fontSize: round to integer px ────────────────────────────────────
      // Fractional font sizes (e.g. 11.5px) are rounded differently by
      // the screen renderer vs html2canvas, shifting the text baseline.
      // IMPORTANT: capture the ORIGINAL value before rounding — the lineHeight
      // ratio must use the pre-rounded size or the visual spacing changes.
      const fs = parseFloat(computed.fontSize);
      if (!isNaN(fs)) {
        el.style.fontSize = `${Math.round(fs)}px`;
      }

      // ── lineHeight: convert to unitless ratio using ORIGINAL fontSize ─────
      // "normal" lineHeight resolves to ~1.2 in the browser but html2canvas
      // uses a slightly different multiplier, causing vertical baseline drift.
      // BUG FIX: use the original pre-rounded `fs` (not computed.fontSize which
      // now returns the rounded value) so the ratio preserves the real spacing.
      const lh = computed.lineHeight;
      if (lh !== "normal") {
        const lhPx = parseFloat(lh);
        // Use original `fs` — after el.style.fontSize is set, computed.fontSize
        // returns the rounded value, which would shrink line spacing by ~4% on
        // 11.5 px text and push every subsequent line further down the page.
        if (!isNaN(lhPx) && !isNaN(fs) && fs > 0) {
          el.style.lineHeight = `${(lhPx / fs).toFixed(4)}`;
        }
      }

      // ── letterSpacing: pin to 0px when "normal" ───────────────────────────
      // html2canvas interprets "normal" letter-spacing differently from the
      // browser — it adds phantom space between characters, multiplying
      // across a line and pushing words apart.
      const ls = computed.letterSpacing;
      if (ls === "normal" || ls === "0px") {
        el.style.letterSpacing = "0px";
      }

      // ── wordSpacing: keep as "normal" (do NOT set to 0px) ─────────────────
      // Setting 0px conflicts with the text-align:left override above.
      // After justify is removed, "normal" is exactly what the browser uses
      // and html2canvas reproduces correctly.
      el.style.wordSpacing = "normal";

      // ── Font smoothing: force antialiased ─────────────────────────────────
      // Canvas always renders with antialiasing. Matching it on the DOM side
      // ensures font metrics are measured under the same conditions.
      (el.style as CSSStyleDeclaration & { webkitFontSmoothing?: string })
        .webkitFontSmoothing = "antialiased";
    }

    node = walker.nextNode();
  }
}

export async function downloadCvAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // ── Overlay: user sees "Generating PDF…" while we work ───────────────────
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

  // ── Capture container: fixed at (0,0) at exact A4 pixel dimensions ────────
  // Placing at top-left means html2canvas captures from a predictable
  // coordinate regardless of how far the user has scrolled the page.
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

  // ── Global style block injected into <head> ───────────────────────────────
  // Forces colour fidelity and text alignment for everything inside the
  // capture root. CSS specificity is maxed with !important so no rule
  // from the CV template can override these values during capture.
  const resetStyle = document.createElement("style");
  resetStyle.textContent = `
    #cv-capture-root * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
      text-align: left !important;
      word-spacing: normal !important;
    }
    #cv-capture-root h1,
    #cv-capture-root h2,
    #cv-capture-root h3,
    #cv-capture-root h4,
    #cv-capture-root h5,
    #cv-capture-root h6 {
      text-align: left !important;
    }
  `;
  /* Note: CSS zoom is NOT reset here with !important because it would
     override the zoom→transform conversion done in stabiliseFontMetrics.
     Zoom on inline styles is handled element-by-element above. */
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

      // ── Deep-clone the page sheet into the capture container ──────────────
      const clone = sheets[i].cloneNode(true) as HTMLElement;

      // Hard-reset all layout-affecting properties with !important so no
      // mobile responsive CSS or media query can bleed into the clone.
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
        text-align: left !important;
      `;

      captureRoot.innerHTML = "";
      captureRoot.appendChild(clone);

      // Strip watermarks and UI-only elements BEFORE metric stabilisation
      // so we don't walk elements that won't be in the PDF.
      stripNoPdfElements(clone);

      // Stabilise font metrics on every element in the clone.
      // Must run AFTER the clone is in the DOM so getComputedStyle works —
      // computed styles are unavailable on detached elements.
      stabiliseFontMetrics(clone);

      // Three rAF frames:
      // Frame 1 — browser schedules layout for the new clone
      // Frame 2 — layout applied, paint callbacks queued
      // Frame 3 — mobile extra: font metrics + flex/grid fully settled
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve())
          )
        )
      );

      // Fixed scale:2 — gives crisp 1588×2246 px canvas (enough for A4 print)
      // without the instability of DPR-based scaling (where a 3× Retina screen
      // produced scale:3 → 4× larger canvas → different rounding paths in
      // html2canvas text layout, adding to text drift on high-DPR devices).
      const scale = 2;

      const canvas = await html2canvas(clone, {
        scale,
        useCORS: true,
        // allowTaint:false — Inter is self-hosted by Next.js,
        // no cross-origin assets, so taint is not needed.
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: A4_PX_W,
        height: A4_PX_H,
        // windowWidth/Height tells html2canvas what "viewport" to assume
        // when evaluating CSS. Without this it uses window.innerWidth
        // (~390px on iPhone), triggering every mobile breakpoint.
        windowWidth: A4_PX_W,
        windowHeight: A4_PX_H,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        // Secondary safety net — any element still tagged no-pdf that
        // wasn't caught by stripNoPdfElements is skipped here too.
        ignoreElements: (el: Element) => el.classList.contains("no-pdf"),
      });

      // PNG over JPEG:
      // JPEG introduces colour fringing around dark text on light backgrounds
      // and loses coloured sidebar backgrounds. PNG is lossless.
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
    }
  } finally {
    // Always clean up DOM even if an error is thrown mid-loop.
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
