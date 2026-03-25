// ═══════════════════════════════════════════════════════════
// CV PAGINATION ENGINE — Assign sections to pages with no-break guarantee
// ═══════════════════════════════════════════════════════════
// Takes measured sections + per-page height budgets and distributes
// sections across pages so that:
//   1. No section is split across a page break (unless it's too tall for any page)
//   2. Pages are filled as evenly as possible (target 75-95%)
//   3. Overflow sections get additional pages dynamically
//   4. Large sections (experience, education) can be split across pages
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

// ── Sections that should NOT be split across pages ──
const ATOMIC_SECTIONS: Set<SectionId> = new Set([
  "profile", "skills", "declaration", "references",
]);

// ── Default continuation page budget (A4 minus mini header and footer) ──
const DEFAULT_CONTINUATION_BUDGET = 1040;

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

  // Init pages from budgets
  const pages: PagePlan[] = pageBudgets.map((budget, i) => ({
    page: i,
    sections: [],
    usedHeight: 0,
    budget,
    fillRatio: 0,
  }));

  const overflow: SectionId[] = [];

  // ── Sequential placement — maintain section order across pages ──
  let currentPageIdx = 0;

  for (const id of presentIds) {
    const m = mmap.get(id)!;
    const needed = m.fullHeight + GAP.section;

    let placed = false;

    // Try to place on pages starting from current (maintains order)
    for (let pi = currentPageIdx; pi < pages.length; pi++) {
      const pg = pages[pi];
      const remaining = pg.budget - pg.usedHeight;

      // Full section fits on this page
      if (needed <= remaining) {
        pg.sections.push(id);
        pg.usedHeight += needed;
        currentPageIdx = pi;
        placed = true;
        break;
      }

      // Section doesn't fit fully — try minHeight if section is atomic
      if (ATOMIC_SECTIONS.has(id)) {
        const minNeeded = m.minHeight + GAP.section;
        if (minNeeded <= remaining && remaining >= 40) {
          pg.sections.push(id);
          pg.usedHeight += Math.min(needed, remaining);
          currentPageIdx = pi;
          placed = true;
          break;
        }
      }

      // For non-atomic (splittable) sections, if at least minHeight fits,
      // place the section here; the renderer will handle truncation
      if (!ATOMIC_SECTIONS.has(id) && m.minHeight + GAP.section <= remaining && remaining >= 60) {
        pg.sections.push(id);
        pg.usedHeight += Math.min(needed, remaining);
        currentPageIdx = pi;
        placed = true;
        break;
      }
    }

    // If not placed on any existing page, add a new page dynamically
    if (!placed) {
      const newBudget = pageBudgets[pageBudgets.length - 1] ?? DEFAULT_CONTINUATION_BUDGET;
      const newPage: PagePlan = {
        page: pages.length,
        sections: [id],
        usedHeight: Math.min(needed, newBudget),
        budget: newBudget,
        fillRatio: 0,
      };
      pages.push(newPage);
      currentPageIdx = pages.length - 1;
    }
  }

  // ── Rebalance: shift sections from overloaded to underloaded pages ──
  // Skip rebalance for single-budget callers (e.g. junior layout) that only
  // render pages[0] — rebalance could move sections to dynamically-created
  // pages and cause them to silently disappear.
  if (pageBudgets.length > 1) {
    rebalance(pages, mmap);
  }

  // ── Remove empty trailing pages ──
  while (pages.length > 1 && pages[pages.length - 1].sections.length === 0) {
    pages.pop();
  }

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
/**
 * Convenience: paginate using default category order.
 * Now allows dynamic page overflow beyond target count.
 */
export function paginateCV(
  category: CareerCategory,
  measures: SectionMeasure[],
  pageBudgets: number[],
): PaginationResult {
  const order = SECTION_ORDER[category];
  const target = TARGET_PAGES[category];
  const budgets = [...pageBudgets];

  // Ensure at least target number of budget entries
  while (budgets.length < target) {
    budgets.push(budgets[budgets.length - 1] ?? DEFAULT_CONTINUATION_BUDGET);
  }

  // Pass all budgets (not sliced to target) to allow dynamic overflow
  return paginateSections(order, measures, budgets);
}

// ═══════════════════════════════════════════════════════════
// REBALANCE — shift trailing sections from heavy to light pages
// ═══════════════════════════════════════════════════════════

function rebalance(pages: PagePlan[], mmap: Map<SectionId, SectionMeasure>): void {
  // Up to 8 passes to converge
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < pages.length - 1; i++) {
      const cur = pages[i];
      const nxt = pages[i + 1];
      const curFill = cur.budget > 0 ? cur.usedHeight / cur.budget : 0;
      const nxtFill = nxt.budget > 0 ? nxt.usedHeight / nxt.budget : 0;

      // Push-down: if current is >85% full and next is <65%, move last section down
      let movedThisPair = false;
      if (curFill > 0.85 && nxtFill < 0.65 && cur.sections.length > 1) {
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
          movedThisPair = true;
        }
      }

      // Pull-up: consolidate very light next page into current, but only if
      // push-down didn't already fire for this pair and receiving the section
      // won't push current above 0.85 (prevents oscillation)
      if (!movedThisPair && nxtFill < 0.30 && curFill < 0.80 && nxt.sections.length > 0) {
        const firstId = nxt.sections[0];
        const m = mmap.get(firstId);
        if (!m) continue;
        const h = m.fullHeight + GAP.section;
        const newCurFill = cur.budget > 0 ? (cur.usedHeight + h) / cur.budget : 0;
        if (h <= cur.budget - cur.usedHeight && newCurFill <= 0.85) {
          nxt.sections.shift();
          nxt.usedHeight -= h;
          cur.sections.push(firstId);
          cur.usedHeight += h;
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
