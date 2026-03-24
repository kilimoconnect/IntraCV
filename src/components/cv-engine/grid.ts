// ─── 12-Column Grid Engine + Page Planner ───
// Places components on A4 pages using a grid system.
// No fixed templates — just rules for where components go.

import type {
  CVTemplateData, DesignStyle, DensityMetrics, LayoutType, LayoutConfig,
  ComponentType, ComponentMeasure, PagePlan, GridPlacement,
} from "./types";
import {
  PAGE_W, PAGE_H, GRID_COLS, DENSITY_METRICS,
  FULL_SECTION_ORDER, MAIN_SECTION_ORDER, SIDEBAR_SECTION_ORDER,
} from "./types";

// ─── Layout Constants ───
const HEADER_H = 110;
const FOOTER_H = 28;
const STRIPE_H = 4;
const SH_H = 22;        // section heading height
const SIDEBAR_PAD = 28;  // sidebar vertical padding
const MAIN_PAD = 30;     // main content vertical padding
const PAGE_PAD_X = 32;   // horizontal page padding

// ─── Single-column layout types (no sidebar) ───
const SINGLE_COL_TYPES: Set<LayoutType> = new Set(["single-column", "narrow-centered"]);

// ─── Build Layout Config ───
export function buildLayout(type: LayoutType, targetPages: number = 2): LayoutConfig {
  const pages = Math.min(3, Math.max(1, targetPages)) as 1 | 2 | 3;
  if (SINGLE_COL_TYPES.has(type)) {
    return { type, mainSections: FULL_SECTION_ORDER[pages], sidebarSections: [] };
  }
  return { type, mainSections: MAIN_SECTION_ORDER[pages], sidebarSections: SIDEBAR_SECTION_ORDER[pages] };
}

// ─── Column Widths ───
export function getColumnWidths(layout: LayoutType): { mainW: number; sideW: number; mainCols: number; sideCols: number } {
  switch (layout) {
    case "single-column":
      return { mainW: PAGE_W - PAGE_PAD_X * 2, sideW: 0, mainCols: 12, sideCols: 0 };
    case "narrow-centered":
      return { mainW: PAGE_W - 96 * 2, sideW: 0, mainCols: 12, sideCols: 0 };
    case "sidebar-left":
    case "sidebar-right":
      return { mainW: Math.floor(PAGE_W * 0.68) - MAIN_PAD, sideW: Math.floor(PAGE_W * 0.32) - SIDEBAR_PAD, mainCols: 8, sideCols: 4 };
    case "narrow-sidebar-left":
    case "narrow-sidebar-right":
      return { mainW: Math.floor(PAGE_W * 0.75) - MAIN_PAD, sideW: Math.floor(PAGE_W * 0.25) - SIDEBAR_PAD, mainCols: 9, sideCols: 3 };
    case "wide-sidebar-left":
    case "wide-sidebar-right":
      return { mainW: Math.floor(PAGE_W * 0.60) - MAIN_PAD, sideW: Math.floor(PAGE_W * 0.40) - SIDEBAR_PAD, mainCols: 7, sideCols: 5 };
    case "compact-sidebar-left":
    case "compact-sidebar-right":
      return { mainW: Math.floor(PAGE_W * 0.80) - MAIN_PAD, sideW: Math.floor(PAGE_W * 0.20) - SIDEBAR_PAD, mainCols: 10, sideCols: 2 };
    case "heavy-sidebar-left":
    case "heavy-sidebar-right":
      return { mainW: Math.floor(PAGE_W * 0.55) - MAIN_PAD, sideW: Math.floor(PAGE_W * 0.45) - SIDEBAR_PAD, mainCols: 7, sideCols: 5 };
    case "balanced-sidebar-left":
    case "balanced-sidebar-right":
      return { mainW: Math.floor(PAGE_W * 0.65) - MAIN_PAD, sideW: Math.floor(PAGE_W * 0.35) - SIDEBAR_PAD, mainCols: 8, sideCols: 4 };
    case "two-column":
    case "two-column-accent-left":
    case "two-column-accent-right":
      return { mainW: Math.floor(PAGE_W * 0.5) - 24, sideW: Math.floor(PAGE_W * 0.5) - 24, mainCols: 6, sideCols: 6 };
    case "two-column-wide-left":
      return { mainW: Math.floor(PAGE_W * 0.58) - 24, sideW: Math.floor(PAGE_W * 0.42) - 24, mainCols: 7, sideCols: 5 };
    case "two-column-wide-right":
      return { mainW: Math.floor(PAGE_W * 0.42) - 24, sideW: Math.floor(PAGE_W * 0.58) - 24, mainCols: 5, sideCols: 7 };
    case "two-column-narrow":
      return { mainW: Math.floor(PAGE_W * 0.45) - 24, sideW: Math.floor(PAGE_W * 0.45) - 24, mainCols: 5, sideCols: 5 };
    default:
      return { mainW: PAGE_W - PAGE_PAD_X * 2, sideW: 0, mainCols: 12, sideCols: 0 };
  }
}

// ─── Measure Components ───
// Estimates the natural pixel height each component needs based on actual data.
export function measureComponents(
  data: CVTemplateData,
  style: DesignStyle,
  widthPx: number,
): ComponentMeasure[] {
  const m = DENSITY_METRICS[style.density] || DENSITY_METRICS.compact;
  const measures: ComponentMeasure[] = [];

  // Header — always present
  measures.push({ type: "header", naturalHeightPx: HEADER_H, minHeightPx: 80, hasContent: true });

  // Summary
  if (data.summary) {
    const chars = data.summary.length;
    const cpl = Math.max(1, Math.floor(widthPx / m.charW));
    const lines = Math.ceil(chars / cpl);
    const h = SH_H + lines * m.linePx + m.sectionGap;
    measures.push({ type: "summary", naturalHeightPx: h, minHeightPx: SH_H + m.linePx, hasContent: true });
  } else {
    measures.push({ type: "summary", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Skills
  if (data.skills.length > 0) {
    const count = data.skills.length;
    // Auto-column: 2 cols if ≤8, 3 cols if ≤15, 4 cols if >15
    const cols = count <= 8 ? 2 : count <= 15 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const h = SH_H + rows * (m.smallLinePx + 4) + m.sectionGap;
    measures.push({ type: "skills", naturalHeightPx: h, minHeightPx: SH_H + m.smallLinePx, hasContent: true });
  } else {
    measures.push({ type: "skills", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Experience
  if (data.experiences.length > 0) {
    let h = SH_H;
    for (const exp of data.experiences) {
      h += m.linePx + 4;  // title + date badge
      h += 14;             // company line
      const bullets = (exp.description || "").split("\n").filter(l => l.trim());
      if (bullets.length > 0) h += 4; // bullet container margin
      for (const b of bullets) {
        const cleaned = b.replace(/^[•\-*]\s*/, "").trim();
        const bLines = Math.ceil(Math.max(1, cleaned.length / 80));
        h += bLines * m.smallLinePx + 2;
      }
      h += m.itemGap;
    }
    h += m.sectionGap;
    measures.push({ type: "experience", naturalHeightPx: h, minHeightPx: SH_H + 50, hasContent: true });
  } else {
    measures.push({ type: "experience", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Achievements
  const achievements = data.keyAchievements || [];
  if (achievements.length > 0) {
    let h = SH_H;
    for (const a of achievements) {
      h += Math.ceil(Math.max(1, a.length / 80)) * m.smallLinePx + 3;
    }
    h += m.sectionGap;
    measures.push({ type: "achievements", naturalHeightPx: h, minHeightPx: SH_H + m.smallLinePx, hasContent: true });
  } else {
    measures.push({ type: "achievements", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Education
  if (data.education.length > 0) {
    let h = SH_H;
    for (const edu of data.education) {
      h += m.linePx + 12; // degree + institution
      if (edu.description) h += Math.ceil(edu.description.length / 80) * (9 * 1.4);
      h += m.itemGap;
    }
    h += m.sectionGap;
    measures.push({ type: "education", naturalHeightPx: h, minHeightPx: SH_H + 30, hasContent: true });
  } else {
    measures.push({ type: "education", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Certifications
  if (data.certifications.length > 0) {
    const h = SH_H + data.certifications.length * 26 + m.sectionGap;
    measures.push({ type: "certifications", naturalHeightPx: h, minHeightPx: SH_H + 26, hasContent: true });
  } else {
    measures.push({ type: "certifications", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Additional info
  let addlItems = 0;
  if (data.languages?.length) addlItems++;
  if (data.tools?.length) addlItems++;
  if (data.memberships?.length) addlItems++;
  if (data.volunteer?.length) addlItems++;
  if (data.projects?.length) addlItems++;
  if (data.interests?.length) addlItems++;
  if (addlItems > 0) {
    const h = SH_H + addlItems * (m.smallLinePx + 3) + m.sectionGap;
    measures.push({ type: "additional", naturalHeightPx: h, minHeightPx: SH_H + m.smallLinePx, hasContent: true });
  } else {
    measures.push({ type: "additional", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Referees
  const refs = data.referees || [];
  if (refs.length > 0) {
    const h = SH_H + Math.ceil(refs.length / 2) * (5 * 13.5) + m.sectionGap;
    measures.push({ type: "referees", naturalHeightPx: h, minHeightPx: SH_H + 40, hasContent: true });
  } else {
    measures.push({ type: "referees", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Declaration
  if (data.declaration?.declaration) {
    const h = SH_H + Math.ceil(data.declaration.declaration.length / 100) * (9 * 1.4) + 20 + m.sectionGap;
    measures.push({ type: "declaration", naturalHeightPx: h, minHeightPx: SH_H + 20, hasContent: true });
  } else {
    measures.push({ type: "declaration", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Memberships (standalone — for 2-page and 3-page)
  if (data.memberships?.length) {
    const h = SH_H + data.memberships.length * (m.smallLinePx + 2) + m.sectionGap;
    measures.push({ type: "memberships", naturalHeightPx: h, minHeightPx: SH_H + m.smallLinePx, hasContent: true });
  } else {
    measures.push({ type: "memberships", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Projects (standalone — for 3-page)
  if (data.projects?.length) {
    let h = SH_H;
    for (const p of data.projects) {
      const name = typeof p === "string" ? p : p.name;
      h += m.linePx + 4;
      if (typeof p !== "string" && p.description) {
        h += Math.ceil(p.description.length / 80) * m.smallLinePx;
      }
      h += m.itemGap;
    }
    h += m.sectionGap;
    measures.push({ type: "projects", naturalHeightPx: h, minHeightPx: SH_H + 30, hasContent: true });
  } else {
    measures.push({ type: "projects", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Publications (standalone — for 3-page)
  if (data.publications?.length) {
    const h = SH_H + data.publications.length * (m.linePx + m.smallLinePx + 2) + m.sectionGap;
    measures.push({ type: "publications", naturalHeightPx: h, minHeightPx: SH_H + m.linePx, hasContent: true });
  } else {
    measures.push({ type: "publications", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Board Roles (standalone — for 3-page)
  if (data.boardRoles?.length) {
    let h = SH_H;
    for (const role of data.boardRoles) {
      h += m.linePx + 4; // title
      if (role.organization) h += m.smallLinePx;
      if (role.description) h += Math.ceil(role.description.length / 80) * m.smallLinePx;
      h += m.itemGap;
    }
    h += m.sectionGap;
    measures.push({ type: "boardRoles", naturalHeightPx: h, minHeightPx: SH_H + 30, hasContent: true });
  } else {
    measures.push({ type: "boardRoles", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  // Executive Training (standalone — for 3-page)
  if (data.executiveTraining?.length) {
    const h = SH_H + data.executiveTraining.length * (m.linePx + m.smallLinePx + 2) + m.sectionGap;
    measures.push({ type: "executiveTraining", naturalHeightPx: h, minHeightPx: SH_H + m.linePx, hasContent: true });
  } else {
    measures.push({ type: "executiveTraining", naturalHeightPx: 0, minHeightPx: 0, hasContent: false });
  }

  return measures;
}

// ─── Page Planner ───
// Bin-packs components onto A4 pages.
export function planPages(
  layout: LayoutConfig,
  measures: ComponentMeasure[],
  _style: DesignStyle,
): PagePlan[] {
  const pages: PagePlan[] = [];
  const widths = getColumnWidths(layout.type);
  const isSidebar = layout.sidebarSections.length > 0;

  // Available content height per page
  const page1ContentH = PAGE_H - STRIPE_H - HEADER_H - FOOTER_H;
  const page2ContentH = PAGE_H - STRIPE_H - 40 - FOOTER_H; // mini header on page 2+

  // Build lookup: component type → measure
  const measureMap = new Map<ComponentType, ComponentMeasure>();
  for (const m of measures) {
    if (m.hasContent) measureMap.set(m.type, m);
  }

  if (isSidebar) {
    // ── Sidebar Layout: parallel bin-packing of main + sidebar tracks ──
    const mainQueue = layout.mainSections.filter(s => measureMap.has(s));
    const sideQueue = layout.sidebarSections.filter(s => measureMap.has(s));

    let mainIdx = 0, sideIdx = 0;
    let pageIdx = 0;

    while (mainIdx < mainQueue.length || sideIdx < sideQueue.length) {
      const isFirst = pageIdx === 0;
      const availH = isFirst ? page1ContentH : page2ContentH;
      let mainUsed = isFirst ? 0 : 0;
      let sideUsed = isFirst ? 0 : 0;

      const mainPlacements: GridPlacement[] = [];
      const sidePlacements: GridPlacement[] = [];

      // Pack main track
      while (mainIdx < mainQueue.length) {
        const comp = mainQueue[mainIdx];
        const m = measureMap.get(comp)!;
        if (mainUsed + m.naturalHeightPx > availH && mainPlacements.length > 0) break;
        mainPlacements.push({
          component: comp,
          col: layout.type === "sidebar-right" ? 0 : widths.sideCols,
          span: widths.mainCols,
          row: mainPlacements.length,
          heightPx: m.naturalHeightPx,
        });
        mainUsed += m.naturalHeightPx;
        mainIdx++;
      }

      // Pack sidebar track
      while (sideIdx < sideQueue.length) {
        const comp = sideQueue[sideIdx];
        const m = measureMap.get(comp)!;
        if (sideUsed + m.naturalHeightPx > availH && sidePlacements.length > 0) break;
        sidePlacements.push({
          component: comp,
          col: layout.type === "sidebar-right" ? widths.mainCols : 0,
          span: widths.sideCols,
          row: sidePlacements.length,
          heightPx: m.naturalHeightPx,
        });
        sideUsed += m.naturalHeightPx;
        sideIdx++;
      }

      pages.push({
        pageIndex: pageIdx,
        showHeader: isFirst,
        showFooter: true,
        placements: [...mainPlacements, ...sidePlacements],
        mainPlacements,
        sidebarPlacements: sidePlacements,
      });
      pageIdx++;
    }
  } else {
    // ── Single-Column Layout: linear bin-packing ──
    const queue = layout.mainSections.filter(s => measureMap.has(s));
    let idx = 0;
    let pageIdx = 0;

    while (idx < queue.length) {
      const isFirst = pageIdx === 0;
      const availH = isFirst ? page1ContentH : page2ContentH;
      let used = 0;
      const placements: GridPlacement[] = [];

      while (idx < queue.length) {
        const comp = queue[idx];
        const m = measureMap.get(comp)!;
        if (used + m.naturalHeightPx > availH && placements.length > 0) break;
        placements.push({
          component: comp,
          col: 0,
          span: GRID_COLS,
          row: placements.length,
          heightPx: m.naturalHeightPx,
        });
        used += m.naturalHeightPx;
        idx++;
      }

      pages.push({
        pageIndex: pageIdx,
        showHeader: isFirst,
        showFooter: true,
        placements,
        mainPlacements: placements,
        sidebarPlacements: [],
      });
      pageIdx++;
    }
  }

  // Ensure at least one page
  if (pages.length === 0) {
    pages.push({
      pageIndex: 0, showHeader: true, showFooter: true,
      placements: [], mainPlacements: [], sidebarPlacements: [],
    });
  }

  return pages;
}

// ─── Earlier Career Compression ───
// If experience has too many jobs to fit on target pages,
// collapse older ones into "Earlier Career" summary.
export function compressExperience(
  data: CVTemplateData,
  maxDetailedJobs: number,
): CVTemplateData {
  if (data.experiences.length <= maxDetailedJobs) return data;

  const detailed = data.experiences.slice(0, maxDetailedJobs);
  const collapsed = data.experiences.slice(maxDetailedJobs);

  // Create "Earlier Career" entry
  const earlierDesc = collapsed.map(e =>
    `${e.title} – ${e.company}${e.startDate ? ` (${e.startDate}–${e.endDate || "Present"})` : ""}`
  ).join("\n");

  const earlierEntry = {
    title: "Earlier Career",
    company: "",
    location: "",
    startDate: collapsed[collapsed.length - 1]?.startDate || "",
    endDate: collapsed[0]?.endDate || "",
    description: earlierDesc,
  };

  return {
    ...data,
    experiences: [...detailed, earlierEntry],
  };
}
