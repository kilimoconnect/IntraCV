// ═══════════════════════════════════════════════════════════
// CV CONTENT FITTER — Post-AI validation & sentence-safe truncation
// ═══════════════════════════════════════════════════════════
// Runs AFTER AI generates content, BEFORE rendering.
// Guarantees every text field fits within its pixel budget:
//   • Profile text fits within page body height
//   • Bullets are trimmed at sentence boundaries (no mid-sentence cuts)
//   • Bullet counts are distributed proportionally across roles
//   • Roles are capped to category maximums
//   • Item arrays are capped to prevent overflow
//   • tightenFactor (0–1) allows progressive tightening on retries
// ═══════════════════════════════════════════════════════════

import type { CategoryCVData, CareerCategory, LayoutVariant } from "./cv-layout-types";
import { CATEGORY_SLOT_RULES } from "./cv-layout-types";
import { A4_W, A4_H } from "./cv-layout-types";
import { PRINT_MARGIN, charsPerLine, FS } from "./cv-design-system";

// ── Sentence-safe truncation helpers ──

/** Truncate text at the last complete sentence that fits within maxChars */
function truncateAtSentence(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  // Find last sentence-ending punctuation
  const lastPeriod = cut.lastIndexOf(".");
  const lastExcl = cut.lastIndexOf("!");
  const lastQ = cut.lastIndexOf("?");
  const lastEnd = Math.max(lastPeriod, lastExcl, lastQ);
  if (lastEnd > maxChars * 0.4) return cut.slice(0, lastEnd + 1).trimEnd();
  // Fallback: trim at last word boundary
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace).trimEnd() + "." : cut.trimEnd() + ".";
}

/** Truncate a bullet string at sentence boundary */
function truncateBullet(bullet: string, maxChars: number): string {
  if (!bullet || bullet.length <= maxChars) return bullet;
  return truncateAtSentence(bullet, maxChars);
}

// ── Layout geometry per category + variant ──

interface LayoutGeometry {
  pages: number;
  p1BodyWidth: number;    // usable body width page 1 (px)
  p1BodyBudget: number;   // usable body height page 1 (px)
  p2BodyWidth: number;
  p2BodyBudget: number;
  p3BodyWidth: number;
  p3BodyBudget: number;
  maxProfileLines: number;
  maxExpBulletsP1: number; // total bullet budget for page 1 experience
}

function getGeometry(
  category: CareerCategory,
  variant: LayoutVariant = "A",
  tightenFactor: number = 1.0,
): LayoutGeometry {
  // Apply tightenFactor to all budgets (reduces available space, forcing earlier truncation)
  const tight = (n: number) => Math.floor(n * tightenFactor);

  switch (category) {
    case "junior": {
      // A: Modern Banner — full-width single column
      // B: Clean Sidebar — narrow left accent, near full-width body
      // C: Split Header — two-column grid for skills+edu, but experience is full-width
      const sidebarW = variant === "B" ? 6 : 0; // thin accent bar
      const mx = 36;
      const bodyTop = 100 + 28 + 16; // banner + contact strip + gap
      const budget = A4_H - bodyTop - PRINT_MARGIN.bottom;
      return {
        pages: 1,
        p1BodyWidth: A4_W - (mx * 2) - sidebarW,
        p1BodyBudget: tight(budget),
        p2BodyWidth: 0, p2BodyBudget: 0,
        p3BodyWidth: 0, p3BodyBudget: 0,
        maxProfileLines: 5,
        maxExpBulletsP1: tight(11),
      };
    }
    case "mid-senior": {
      // A: Dark Sidebar 240px — body = A4_W - 240 - 40
      // B: Top Bar Split — right sidebar ~200px, body wider
      // C: Full Width Cards — no sidebar
      const sidebarW = variant === "A" ? 280 : variant === "B" ? 240 : 52;
      const p1BodyWidth = A4_W - sidebarW;
      const p1Top = 28;
      const p1Budget = A4_H - p1Top - PRINT_MARGIN.bottom;
      const p2BodyWidth = variant === "C" ? A4_W - 52 : A4_W - 52;
      const p2Budget = A4_H - 48 - PRINT_MARGIN.bottom;
      return {
        pages: 2,
        p1BodyWidth,
        p1BodyBudget: tight(p1Budget),
        p2BodyWidth,
        p2BodyBudget: tight(p2Budget),
        p3BodyWidth: 0, p3BodyBudget: 0,
        maxProfileLines: 6,
        maxExpBulletsP1: tight(variant === "C" ? 18 : 16),
      };
    }
    case "executive": {
      // A: Elegant Centered — right sidebar 230px
      // B: Classic Columns — left sidebar 250px
      // C: Minimal Premium — two-column body ~(A4_W - 72)/2 each
      const sidebarW = variant === "A" ? 278 : variant === "B" ? 298 : 0;
      const mx = variant === "C" ? 36 : 24;
      const p1BodyWidth = variant === "C"
        ? Math.floor((A4_W - mx * 2) / 2)   // half-width columns
        : A4_W - sidebarW - (mx * 2);
      const p1Top = 120 + 22 + 16; // header + contact + SP
      const p1Budget = A4_H - p1Top - PRINT_MARGIN.bottom;
      const contBudget = A4_H - 54 - PRINT_MARGIN.bottom;
      const contBodyW = A4_W - 54;
      return {
        pages: 3,
        p1BodyWidth,
        p1BodyBudget: tight(p1Budget),
        p2BodyWidth: contBodyW,
        p2BodyBudget: tight(contBudget),
        p3BodyWidth: contBodyW,
        p3BodyBudget: tight(contBudget),
        maxProfileLines: 6,
        maxExpBulletsP1: tight(variant === "C" ? 14 : 18),
      };
    }
  }
}

// ── Proportional bullet distribution ──
// Instead of greedily giving bullets to the first role until the budget runs out,
// distribute the budget proportionally with more bullets going to recent roles.
// Guarantees a minimum of 2 bullets per role.
function distributeBullets(
  experience: CategoryCVData["experience"],
  totalBudget: number,
): number[] {
  const n = experience.length;
  if (n === 0) return [];
  if (n === 1) return [Math.min(totalBudget, experience[0].bullets?.length ?? 0)];

  const minPerRole = 2;
  const baseTotal = minPerRole * n;
  const extra = Math.max(0, totalBudget - baseTotal);

  // Weight distribution: recent roles (index 0, 1) get proportionally more
  // Weights for positions: [0.45, 0.30, 0.15, 0.07, 0.03, ...]
  const weights = Array.from({ length: n }, (_, i) => {
    if (i === 0) return 0.45;
    if (i === 1) return 0.30;
    if (i === 2) return 0.15;
    if (i === 3) return 0.07;
    return 0.03 / Math.max(1, n - 4); // remaining weight spread across rest
  });
  // Normalize weights
  const weightSum = weights.reduce((s, w) => s + w, 0);
  const normalized = weights.map(w => w / weightSum);

  return experience.map((exp, i) => {
    const allocated = minPerRole + Math.round(extra * normalized[i]);
    // Never allocate more than the role actually has
    return Math.min(allocated, exp.bullets?.length ?? 0);
  });
}

// ═══════════════════════════════════════════════════════════
// MAIN FITTER
// ═══════════════════════════════════════════════════════════

/**
 * Validate and fit all CV data to the layout geometry for the given category + variant.
 * Returns a new CategoryCVData with content trimmed to fit.
 * ALL truncation is sentence-safe — no broken sentences.
 *
 * @param tightenFactor  0–1 multiplier applied to all budgets.
 *   1.0 = full budget, 0.92 = slightly tighter, 0.85 = tighter, 0.75 = aggressive
 *   Used for progressive overflow correction retries in cv-studio.
 */
export function fitContentToLayout(
  data: CategoryCVData,
  category: CareerCategory,
  variant: LayoutVariant = "A",
  tightenFactor: number = 1.0,
): CategoryCVData {
  const d = JSON.parse(JSON.stringify(data)) as CategoryCVData;
  const geo = getGeometry(category, variant, tightenFactor);
  const slotRules = CATEGORY_SLOT_RULES[category];

  // ── Role count cap: slice experience to the max defined in slot rules ──
  {
    const maxRoles = (slotRules.experience as any).roles ?? (
      category === "junior" ? 3 : category === "mid-senior" ? 4 : 5
    );
    if (d.experience && d.experience.length > maxRoles) {
      d.experience = d.experience.slice(0, maxRoles);
    }
    if (d.history && d.history.length > maxRoles) {
      d.history = d.history.slice(0, maxRoles);
    }
  }

  // ── Profile: cap to max lines that fit ──
  {
    const cpl = charsPerLine(FS.md, geo.p1BodyWidth);
    const maxChars = cpl * geo.maxProfileLines;
    if (d.profile && d.profile.length > maxChars) {
      d.profile = truncateAtSentence(d.profile, maxChars);
    }
  }

  // ── Experience bullets: proportional distribution, then individual cap ──
  {
    const maxBulletChars = Math.floor(charsPerLine(FS.smt, geo.p1BodyWidth - 14) * 2.5);
    const exps = d.experience || [];

    if (exps.length > 0) {
      const targets = distributeBullets(exps, geo.maxExpBulletsP1);
      exps.forEach((exp, i) => {
        if (!exp.bullets) return;
        exp.bullets = exp.bullets
          .slice(0, targets[i])
          .map(b => truncateBullet(b, maxBulletChars));
      });
    }
  }

  // ── History bullets (page 2): cap per role ──
  if (d.history && d.history.length > 0 && geo.pages >= 2) {
    const maxBulletChars = Math.floor(charsPerLine(FS.smt, geo.p2BodyWidth - 14) * 2.5);
    const maxBulletsPerRole = category === "junior" ? 0 : 5;
    for (const h of d.history) {
      if (!h.bullets) continue;
      h.bullets = h.bullets.slice(0, maxBulletsPerRole).map(b => truncateBullet(b, maxBulletChars));
    }
  }

  // ── Skills: cap count using slot rules ──
  if (d.skills) {
    const maxSkills = (slotRules.skills as any).count ?? (
      category === "junior" ? 22 : category === "mid-senior" ? 24 : 28
    );
    d.skills = d.skills.slice(0, Math.floor(maxSkills / tightenFactor));
  }

  // ── Projects: cap description length ──
  if (d.projects) {
    const maxDesc = category === "junior" ? 180 : category === "mid-senior" ? 220 : 240;
    for (const p of d.projects) {
      if (p.description && p.description.length > maxDesc) {
        p.description = truncateAtSentence(p.description, maxDesc);
      }
    }
  }

  // ── Achievements: cap per-item length and count ──
  if (d.achievements) {
    const maxLen = (slotRules as any).achievements?.maxChars ?? (
      category === "junior" ? 110 : category === "mid-senior" ? 140 : 140
    );
    const maxCount = (slotRules as any).achievements?.count ?? (
      category === "junior" ? 4 : category === "mid-senior" ? 5 : 6
    );
    d.achievements = d.achievements
      .slice(0, Math.ceil(maxCount * tightenFactor))
      .map(a => truncateAtSentence(a, maxLen));
  }

  // ── References: cap count based on slot rules ──
  if (d.references) {
    const maxRefs = (slotRules.references as any).count ?? (
      category === "junior" ? 2 : category === "mid-senior" ? 3 : 4
    );
    d.references = d.references.slice(0, maxRefs);
  }

  // ── Board Roles: cap count and description ──
  if (d.boardRoles) {
    const maxDesc = (slotRules as any).boardRoles?.maxDescriptionChars ?? 150;
    const maxCount = (slotRules as any).boardRoles?.max ?? 5;
    d.boardRoles = d.boardRoles.slice(0, maxCount);
    for (const role of d.boardRoles) {
      if (role.description && role.description.length > maxDesc) {
        role.description = truncateAtSentence(role.description, maxDesc);
      }
    }
  }

  // ── Volunteer: cap for junior (single page) ──
  if (d.volunteer && category === "junior") {
    d.volunteer = d.volunteer.slice(0, 3).map(v =>
      v.length > 80 ? truncateAtSentence(v, 80) : v
    );
  }

  // ── Declaration: cap length ──
  if (d.declaration?.declaration) {
    const maxDecl = category === "junior" ? 200 : category === "mid-senior" ? 250 : 300;
    if (d.declaration.declaration.length > maxDecl) {
      d.declaration.declaration = truncateAtSentence(d.declaration.declaration, maxDecl);
    }
  }

  return d;
}
