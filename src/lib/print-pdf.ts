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

      // Fix: <ul>/<li> with display:list-item renders with inconsistent box heights
      // inside SVG foreignObject, creating phantom gaps after ~6 bullets.
      // Replace every <ul>/<li> with display:table rows directly — table layout is
      // perfectly stable in foreignObject with no accumulated height errors.
      clone.querySelectorAll("ul").forEach((ul) => {
        const replacement = document.createElement("div");
        replacement.style.margin = "0";
        replacement.style.padding = "0";
        Array.from(ul.children).forEach((li) => {
          if (!li.textContent?.trim()) return;
          const liEl = li as HTMLElement;
          const liColor = getComputedStyle(li).color;
          const liLineHeight = liEl.style.lineHeight || "15px";

          const row = document.createElement("div");
          row.style.display = "table";
          row.style.width = "100%";
          row.style.marginBottom = liEl.style.marginBottom || "1.5px";

          const bulletCell = document.createElement("span");
          bulletCell.textContent = "\u25CF";
          bulletCell.style.display = "table-cell";
          bulletCell.style.verticalAlign = "top";
          bulletCell.style.width = "14px";
          bulletCell.style.fontSize = "7px";
          bulletCell.style.lineHeight = liLineHeight;
          bulletCell.style.color = liColor;
          bulletCell.style.paddingTop = "1px";

          const textCell = document.createElement("span");
          textCell.style.display = "table-cell";
          textCell.style.verticalAlign = "top";
          textCell.style.fontSize = liEl.style.fontSize || "10.5px";
          textCell.style.lineHeight = liLineHeight;
          textCell.style.color = liColor;
          textCell.style.wordBreak = "break-word";
          textCell.innerHTML = li.innerHTML;

          row.appendChild(bulletCell);
          row.appendChild(textCell);
          replacement.appendChild(row);
        });
        ul.parentNode?.replaceChild(replacement, ul);
      });

      // Fix: CSS gap properties are unreliable inside SVG foreignObject.
      // Browsers expand `gap: Xpx` into rowGap + columnGap, so we must clear
      // all three. Convert only column-gap to explicit marginRight on first child.
      // Also lock alignSelf on fixed-size children (icon badges) so they never
      // stretch beyond their set height when alignItems: flex-start misbehaves.
      clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const s = el.style;

        // Determine column-gap value before clearing (gap shorthand may be
        // "Xpx" single-value or "Xpx Ypx" row-then-column)
        const rawGap = s.gap || "";
        const colGap = s.columnGap || (rawGap ? rawGap.trim().split(/\s+/).slice(-1)[0] : "");

        if (rawGap || s.columnGap || s.rowGap) {
          s.gap = "";
          s.columnGap = "";
          s.rowGap = "";          // ← was missing; rowGap stays set without this
          if (colGap) {
            const first = el.firstElementChild as HTMLElement | null;
            if (first) first.style.marginRight = colGap;
          }
        }

        // For flex containers, lock fixed-size children so they can't stretch.
        // Icon/badge divs with explicit width+height must stay at that height.
        if (s.display === "flex" || s.display === "inline-flex") {
          Array.from(el.children).forEach((child) => {
            const cs = (child as HTMLElement).style;
            if (cs.width && cs.height) {
              cs.alignSelf = "flex-start";
              if (!cs.flexShrink) cs.flexShrink = "0";
            }
          });
        }
      });

      // Fix: flex + alignItems:flex-start on icon-badge+text rows accumulates
      // invisible height errors in SVG foreignObject after ~3 items, causing a
      // visible gap before the 4th item. Convert these rows to table layout,
      // which is perfectly reliable in foreignObject.
      // Matches:
      //   A) Numbered circle badge rows — first child is a div with borderRadius.
      //   B) Star/bullet span rows (★, •, etc.) — first child is a <span> with
      //      no explicit width, used for achievement/bullet list items.
      clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const s = el.style;
        if (s.display !== "flex" && s.display !== "inline-flex") return;
        if (s.alignItems !== "flex-start" && s.alignItems !== "start") return;
        const kids = Array.from(el.children) as HTMLElement[];
        if (kids.length !== 2) return;
        const [icon, text] = kids;

        const isBadge = !!icon.style.borderRadius; // numbered circle (div)
        // Single-character bullet span: <span>★</span>, <span>•</span>, etc.
        const isBulletSpan =
          icon.tagName === "SPAN" &&
          !icon.style.width &&
          (icon.textContent?.trim().length ?? 0) <= 3;

        if (!isBadge && !isBulletSpan) return;

        const gap = icon.style.marginRight || (isBadge ? "8px" : "6px");
        const iconW = isBadge ? (parseInt(icon.style.width) || 18) : 16;
        const gapW = parseInt(gap) || (isBadge ? 8 : 6);

        el.style.display = "table";
        el.style.width = "100%";
        el.style.alignItems = "";

        icon.style.display = "table-cell";
        icon.style.verticalAlign = "top";
        icon.style.width = `${iconW + gapW}px`;
        icon.style.paddingRight = gap;
        icon.style.marginRight = "";
        icon.style.alignSelf = "";

        text.style.display = "table-cell";
        text.style.verticalAlign = "top";
      });

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
