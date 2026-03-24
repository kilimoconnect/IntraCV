// ═══════════════════════════════════════════════════════════
// CV DESIGN SYSTEM — Shared tokens, print margins, font scale, text helpers
// ═══════════════════════════════════════════════════════════

import { A4_W, A4_H, FONT } from "./cv-layout-types";

// ── A4 at 96 DPI (re-exported for convenience) ──
export { A4_W, A4_H, FONT };

// ── Print-Safe Margins ──
// Standard laser-printer safe zone ≈ 6mm ≈ 23px at 96 dpi.
// We use 24px sides, 0 top (layout chrome), 20px bottom safety.
export const PRINT_MARGIN = {
  top: 0,
  bottom: 20,
  left: 24,
  right: 24,
} as const;

// ── Font Scale (px) ──
export const FS = {
  xxs:  8,      // tiny labels, page numbers
  xs:   8.5,    // sub-labels, dates
  sm:   9,      // secondary text, captions
  smt:  9.5,    // body text
  base: 10,     // primary body
  md:   10.5,   // emphasis, role names
  lg:   11,     // small section headings
  lgx:  11.5,   // section headings
  xl:   12,     // sub-headings
  xxl:  14,     // name on continuation pages
  title: 18,    // main name (junior)
  hero:  22,    // executive large name
} as const;

// ── Line-Height Multipliers ──
export const LH = {
  tight:   1.2,   // headings, single-line labels
  snug:    1.35,  // compact body text
  normal:  1.5,   // standard body paragraphs
  relaxed: 1.7,   // loose paragraphs (profile summary)
} as const;

// ── Spacing Scale (px) ──
export const GAP = {
  section:    14,   // between major sections
  subsection:  8,   // between items within a section (e.g. experience entries)
  item:        4,   // between minor items (e.g. bullet lines)
  heading:     7,   // below a section heading to its content
  pill:        6,   // gap between skill pills
  card:        8,   // gap between card items
} as const;

// ── Average Character Width Ratio ──
// For Inter / Segoe UI at any font size, avgCharWidth ≈ fontSize × 0.52
export const CHAR_W_RATIO = 0.52;

// ═══════════════════════════════════════════════════════════
// TEXT MEASUREMENT UTILITIES
// ═══════════════════════════════════════════════════════════

/** Estimate how many characters fit on one line at the given font size. */
export function charsPerLine(fontSize: number, containerWidth: number): number {
  const cpl = Math.floor(containerWidth / (fontSize * CHAR_W_RATIO));
  return Math.max(1, cpl);
}

/** Estimate number of wrapped lines for a text string. */
export function estimateLines(text: string, fontSize: number, containerWidth: number): number {
  if (!text || containerWidth <= 0) return 0;
  const cpl = charsPerLine(fontSize, containerWidth);
  return Math.ceil(text.length / cpl);
}

/** Estimate rendered height of a text block (px). */
export function textHeight(
  text: string,
  fontSize: number,
  lineHeight: number,
  containerWidth: number,
): number {
  const lines = estimateLines(text, fontSize, containerWidth);
  return Math.ceil(lines * fontSize * lineHeight);
}

/** Estimate rendered height for an array of bullet strings. */
export function bulletsHeight(
  bullets: string[],
  fontSize: number,
  lineHeight: number,
  containerWidth: number,
  bulletIndent: number = 12,
): number {
  if (!bullets || bullets.length === 0) return 0;
  const w = containerWidth - bulletIndent;
  let h = 0;
  for (const b of bullets) {
    h += textHeight(b, fontSize, lineHeight, w) + 1; // +1px inter-bullet
  }
  return h;
}

// ═══════════════════════════════════════════════════════════
// PAGE GEOMETRY HELPERS
// ═══════════════════════════════════════════════════════════

/** Usable content height on a page given chrome heights. */
export function pageContentHeight(pageIndex: number, page1ChromeH: number, contChromeH: number): number {
  const chrome = pageIndex === 0 ? page1ChromeH : contChromeH;
  return A4_H - chrome - PRINT_MARGIN.bottom;
}

/** Standard full-width content area width. */
export function fullBodyWidth(marginX: number = PRINT_MARGIN.left): number {
  return A4_W - marginX * 2;
}

// ═══════════════════════════════════════════════════════════
// TEXT TRUNCATION HELPERS
// ═══════════════════════════════════════════════════════════

/** Truncate text to fit within maxLines at the given font/width. Returns truncated string. */
export function truncateToFit(
  text: string,
  fontSize: number,
  containerWidth: number,
  maxLines: number,
): string {
  if (!text) return "";
  const cpl = charsPerLine(fontSize, containerWidth);
  const maxChars = cpl * maxLines;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3).trimEnd() + "...";
}

/** Truncate a bullet array to fit within a height budget. Returns trimmed array. */
export function truncateBullets(
  bullets: string[],
  fontSize: number,
  lineHeight: number,
  containerWidth: number,
  maxHeightPx: number,
  bulletIndent: number = 12,
): string[] {
  if (!bullets || bullets.length === 0) return [];
  const w = containerWidth - bulletIndent;
  const result: string[] = [];
  let used = 0;
  for (const b of bullets) {
    const bh = textHeight(b, fontSize, lineHeight, w) + 1;
    if (used + bh > maxHeightPx) break;
    result.push(b);
    used += bh;
  }
  return result;
}
