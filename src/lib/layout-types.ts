// ─── Shared Layout Type ───
// Single source of truth for LayoutType, imported by both
// cv-engine/types.ts and cv-density-controller.ts to avoid circular deps.

export type LayoutType =
  | "single-column"           // All 12 cols
  | "narrow-centered"         // Single col, wider margins
  | "sidebar-left"            // 32% + 68%
  | "sidebar-right"           // 68% + 32%
  | "narrow-sidebar-left"     // 25% + 75%  (slim sidebar)
  | "narrow-sidebar-right"    // 75% + 25%
  | "wide-sidebar-left"       // 40% + 60%  (wide sidebar)
  | "wide-sidebar-right"      // 60% + 40%
  | "compact-sidebar-left"    // 20% + 80%  (minimal sidebar)
  | "compact-sidebar-right"   // 80% + 20%
  | "heavy-sidebar-left"      // 45% + 55%  (near-half sidebar)
  | "heavy-sidebar-right"     // 55% + 45%
  | "balanced-sidebar-left"   // 35% + 65%
  | "balanced-sidebar-right"  // 65% + 35%
  | "two-column"              // 50% + 50%
  | "two-column-wide-left"    // 58% + 42%
  | "two-column-wide-right"   // 42% + 58%
  | "two-column-accent-left"  // 50% + 50% (left has sidebar bg)
  | "two-column-accent-right" // 50% + 50% (right has sidebar bg)
  | "two-column-narrow";      // 45% + 45% (wider outer margins)
