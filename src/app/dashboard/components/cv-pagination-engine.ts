// ═══════════════════════════════════════════════════════════
// CV PAGINATION ENGINE — Assign sections to pages with no-break guarantee
// ═══════════════════════════════════════════════════════════
// Takes measured sections + per-page height budgets and distributes
// sections across pages so that:
//   1. No section is split across a page break
//   2. Pages are filled as evenly as possible (target 75-95%)
//   3. Overflow sections are reported (never silently lost)
// ═══════════════════════════════════════════════════════════

import { type CareerCategory } from "./cv-layout-types";
import { type SectionId, type SectionMeasure } from "./cv-constraint-engine";
import { GAP } from "./cv-design-system";

// ── Page plan for one page ──
export interface PagePlan {
  page: number;          // 0-indexed
  sections: SectionId[];
  usedHeight: number;    // px consumed
  budget: number;        // px available
  fillRatio: number;     // usedHeight / budget
}

// ── Full pagination result ──
export interface PaginationResult {
  pages: PagePlan[];
  overflow: SectionId[];   // sections that couldn't fit anywhere
  totalUsed: number;
  totalBudget: number;
}

// ── Target page counts per category ──
export const TARGET_PAGES: Record<CareerCategory, number> = {
  junior: 1,
  "mid-senior": 2,
  executive: 3,
};

// ── Default section ordering per category ──
export const SECTION_ORDER: Record<CareerCategory, SectionId[]> = {
  junior: [
    "profile", "skills", "experience", "education",
    "projects", "certifications", "languages", "achievements",
    "volunteer", "references", "declaration",
  ],
  "mid-senior": [
    "profile", "skills", "experience", "achievements",
    "education", "certifications", "tools", "memberships",
    "projects", "history", "languages", "awards",
    "references", "declaration",
  ],
  executive: [
    "profile", "skills", "experience", "achievements",
    "education", "certifications", "tools", "memberships",
    "boardRoles", "executiveTraining", "publications",
    "history", "projects", "languages", "volunteer",
    "references", "awards", "declaration",
  ],
};

// ═══════════════════════════════════════════════════════════
// MAIN API
// ═══════════════════════════════════════════════════════════

/**
 * Assign sections to pages using first-fit-decreasing with rebalance.
 *
 * @param orderedIds   Section IDs in desired render order
 * @param measures     All measured sections (from constraint engine)
 * @param pageBudgets  Available content height (px) per page [page0, page1, ...]
 * @returns            PaginationResult with page assignments
 */
export function paginateSections(
  orderedIds: SectionId[],
  measures: SectionMeasure[],
  pageBudgets: number[],
): PaginationResult {
  // Build lookup
  const mmap = new Map<SectionId, SectionMeasure>();
  for (const m of measures) mmap.set(m.id, m);

  // Filter to present sections only, in the given order
  const presentIds = orderedIds.filter(id => {
    const m = mmap.get(id);
    return m && m.present;
  });

  // Init pages
  const pages: PagePlan[] = pageBudgets.map((budget, i) => ({
    page: i,
    sections: [],
    usedHeight: 0,
    budget,
    fillRatio: 0,
  }));

  const overflow: SectionId[] = [];

  // ── First-fit packing ──
  for (const id of presentIds) {
    const m = mmap.get(id)!;
    const needed = m.fullHeight + GAP.section;

    let placed = false;
    for (const pg of pages) {
      const remaining = pg.budget - pg.usedHeight;
      // Try full height
      if (needed <= remaining) {
        pg.sections.push(id);
        pg.usedHeight += needed;
        placed = true;
        break;
      }
      // Try min height (truncated fit) — only if at least minHeight fits
      const minNeeded = m.minHeight + GAP.section;
      if (minNeeded <= remaining && remaining >= 40) {
        pg.sections.push(id);
        pg.usedHeight += Math.min(needed, remaining); // cap at remaining
        placed = true;
        break;
      }
    }
    if (!placed) overflow.push(id);
  }

  // ── Rebalance: shift sections from overloaded to underloaded pages ──
  rebalance(pages, mmap);

  // ── Compute fill ratios ──
  let totalUsed = 0;
  let totalBudget = 0;
  for (const pg of pages) {
    pg.fillRatio = pg.budget > 0 ? Math.min(1, pg.usedHeight / pg.budget) : 0;
    totalUsed += pg.usedHeight;
    totalBudget += pg.budget;
  }

  return { pages, overflow, totalUsed, totalBudget };
}

/**
 * Convenience: paginate using default category order.
 */
export function paginateCV(
  category: CareerCategory,
  measures: SectionMeasure[],
  pageBudgets: number[],
): PaginationResult {
  const order = SECTION_ORDER[category];
  // Ensure enough budget entries
  const target = TARGET_PAGES[category];
  const budgets = [...pageBudgets];
  while (budgets.length < target) {
    budgets.push(budgets[budgets.length - 1] ?? 900);
  }
  return paginateSections(order, measures, budgets.slice(0, target));
}

// ═══════════════════════════════════════════════════════════
// REBALANCE — shift trailing sections from heavy to light pages
// ═══════════════════════════════════════════════════════════

function rebalance(pages: PagePlan[], mmap: Map<SectionId, SectionMeasure>): void {
  // Up to 5 passes to converge
  for (let pass = 0; pass < 5; pass++) {
    let moved = false;
    for (let i = 0; i < pages.length - 1; i++) {
      const cur = pages[i];
      const nxt = pages[i + 1];
      const curFill = cur.budget > 0 ? cur.usedHeight / cur.budget : 0;
      const nxtFill = nxt.budget > 0 ? nxt.usedHeight / nxt.budget : 0;

      // If current is >90% full and next is <50%, move last section
      if (curFill > 0.90 && nxtFill < 0.50 && cur.sections.length > 1) {
        const lastId = cur.sections[cur.sections.length - 1];
        const m = mmap.get(lastId);
        if (!m) continue;
        const h = m.fullHeight + GAP.section;
        if (h <= nxt.budget - nxt.usedHeight) {
          cur.sections.pop();
          cur.usedHeight -= h;
          nxt.sections.unshift(lastId);
          nxt.usedHeight += h;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

// ═══════════════════════════════════════════════════════════
// DUAL-FLOW PAGINATION (for sidebar layouts)
// ═══════════════════════════════════════════════════════════

export interface DualFlowConfig {
  sidebarSections: SectionId[];
  bodySections: SectionId[];
  sidebarBudgets: number[];   // per-page sidebar height
  bodyBudgets: number[];      // per-page body height
}

export interface DualFlowResult {
  sidebar: PaginationResult;
  body: PaginationResult;
}

/**
 * Paginate independently for sidebar and body flows.
 * Sidebar sections and body sections are packed separately.
 */
export function paginateDualFlow(
  measures: SectionMeasure[],
  config: DualFlowConfig,
): DualFlowResult {
  return {
    sidebar: paginateSections(config.sidebarSections, measures, config.sidebarBudgets),
    body: paginateSections(config.bodySections, measures, config.bodyBudgets),
  };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/** Check if a section was assigned to a specific page. */
export function isOnPage(result: PaginationResult, page: number, sectionId: SectionId): boolean {
  const pg = result.pages[page];
  return pg ? pg.sections.includes(sectionId) : false;
}

/** Get all section IDs assigned to a page. */
export function sectionsOnPage(result: PaginationResult, page: number): SectionId[] {
  return result.pages[page]?.sections ?? [];
}

/** Get the height budget remaining on a page. */
export function remainingOnPage(result: PaginationResult, page: number): number {
  const pg = result.pages[page];
  return pg ? pg.budget - pg.usedHeight : 0;
}
