// ─── Font Scale Helper ───
// All CV components must use these helpers instead of hardcoded pixel sizes.
// This ensures the density controller's fontScale validation actually takes effect.

import type { RenderSettings } from "@/lib/cv-density-controller";

/** Returns a scaled font size string like "9.5px" */
export function sf(basePx: number, rs?: RenderSettings): string {
  const scale = rs?.fontScale ?? 1;
  return `${Math.round(basePx * scale * 10) / 10}px`;
}

/** Returns a scaled number (for lineHeight, gaps, etc.) */
export function sn(baseVal: number, rs?: RenderSettings): number {
  const scale = rs?.fontScale ?? 1;
  return Math.round(baseVal * scale * 10) / 10;
}

/** Returns scaled spacing in px string — for margins/paddings that should scale with density */
export function sp(basePx: number, rs?: RenderSettings): string {
  const scale = rs?.fontScale ?? 1;
  return `${Math.round(basePx * scale * 10) / 10}px`;
}
