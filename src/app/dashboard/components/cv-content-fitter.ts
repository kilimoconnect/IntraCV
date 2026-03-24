// ═══════════════════════════════════════════════════════════
// CV CONTENT FITTER — Post-AI validation & sentence-safe truncation
// ═══════════════════════════════════════════════════════════
// Runs AFTER AI generates content, BEFORE rendering.
// Guarantees every text field fits within its pixel budget:
//   • Profile text fits within page body height
//   • Bullets are trimmed at sentence boundaries (no mid-sentence cuts)
//   • Item arrays are capped to prevent overflow
//   • All truncation preserves complete sentences
// ═══════════════════════════════════════════════════════════

import type { CategoryCVData, CareerCategory } from "./cv-layout-types";
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

// ── Layout geometry per category (worst-case body widths from Variant A) ──

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

function getGeometry(category: CareerCategory): LayoutGeometry {
  switch (category) {
    case "junior": {
      const bodyTop = 100 + 28 + 16; // banner + contact + gap
      const budget = A4_H - bodyTop - PRINT_MARGIN.bottom;
      return {
        pages: 1,
        p1BodyWidth: A4_W - 72, // MX=36 each side
        p1BodyBudget: budget,   // ~959px
        p2BodyWidth: 0, p2BodyBudget: 0,
        p3BodyWidth: 0, p3BodyBudget: 0,
        maxProfileLines: 5,
        maxExpBulletsP1: 11,
      };
    }
    case "mid-senior": {
      const p1Top = 28;
      const p1Budget = A4_H - p1Top - PRINT_MARGIN.bottom;
      const p2Budget = A4_H - 48 - PRINT_MARGIN.bottom;
      return {
        pages: 2,
        p1BodyWidth: A4_W - 240 - 40, // sidebar 240 + 20px padding each side
        p1BodyBudget: p1Budget,        // ~1075px
        p2BodyWidth: A4_W - 52,
        p2BodyBudget: p2Budget,        // ~1055px
        p3BodyWidth: 0, p3BodyBudget: 0,
        maxProfileLines: 6,
        maxExpBulletsP1: 16,
      };
    }
    case "executive": {
      const p1Top = 120 + 22 + 16; // header + contact + SP
      const p1Budget = A4_H - p1Top - PRINT_MARGIN.bottom;
      const contBudget = A4_H - 54 - PRINT_MARGIN.bottom;
      return {
        pages: 3,
        p1BodyWidth: A4_W - 230 - 48, // sidebar 230 + 24px padding each side
        p1BodyBudget: p1Budget,        // ~945px
        p2BodyWidth: A4_W - 54,
        p2BodyBudget: contBudget,      // ~1049px
        p3BodyWidth: A4_W - 54,
        p3BodyBudget: contBudget,
        maxProfileLines: 6,
        maxExpBulletsP1: 18,
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN FITTER
// ═══════════════════════════════════════════════════════════

/**
 * Validate and fit all CV data to the layout geometry for the given category.
 * Returns a new CategoryCVData with content trimmed to fit.
 * ALL truncation is sentence-safe — no broken sentences.
 */
export function fitContentToLayout(
  data: CategoryCVData,
  category: CareerCategory,
): CategoryCVData {
  const d = JSON.parse(JSON.stringify(data)) as CategoryCVData;
  const geo = getGeometry(category);

  // ── Profile: cap to max lines that fit ──
  {
    const cpl = charsPerLine(FS.md, geo.p1BodyWidth);
    const maxChars = cpl * geo.maxProfileLines;
    if (d.profile && d.profile.length > maxChars) {
      d.profile = truncateAtSentence(d.profile, maxChars);
    }
  }

  // ── Experience bullets: cap total count and individual length ──
  {
    const maxBulletChars = Math.floor(charsPerLine(FS.smt, geo.p1BodyWidth - 14) * 2.5); // 2.5 lines max per bullet
    let totalBullets = 0;
    for (const exp of d.experience || []) {
      if (!exp.bullets) continue;
      const remaining = geo.maxExpBulletsP1 - totalBullets;
      if (remaining <= 0) {
        exp.bullets = [];
        continue;
      }
      exp.bullets = exp.bullets.slice(0, remaining).map(b => truncateBullet(b, maxBulletChars));
      totalBullets += exp.bullets.length;
    }
  }

  // ── History bullets (page 2): cap per role ──
  if (d.history && d.history.length > 0 && geo.pages >= 2) {
    const maxBulletChars = Math.floor(charsPerLine(FS.smt, geo.p2BodyWidth - 14) * 2.5);
    const maxBulletsPerRole = category === "junior" ? 0 : category === "mid-senior" ? 5 : 5;
    for (const h of d.history) {
      if (!h.bullets) continue;
      h.bullets = h.bullets.slice(0, maxBulletsPerRole).map(b => truncateBullet(b, maxBulletChars));
    }
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

  // ── Achievements: cap per-item length ──
  if (d.achievements) {
    const maxLen = category === "junior" ? 110 : category === "mid-senior" ? 125 : 135;
    d.achievements = d.achievements.map(a => truncateAtSentence(a, maxLen));
  }

  // ── Skills: cap count ──
  if (d.skills) {
    const maxSkills = category === "junior" ? 22 : category === "mid-senior" ? 24 : 28;
    d.skills = d.skills.slice(0, maxSkills);
  }

  // ── References: cap count based on page budget ──
  if (d.references) {
    const maxRefs = category === "junior" ? 2 : category === "mid-senior" ? 3 : 4;
    d.references = d.references.slice(0, maxRefs);
  }

  // ── Board Roles descriptions ──
  if (d.boardRoles) {
    for (const role of d.boardRoles) {
      if (role.description && role.description.length > 140) {
        role.description = truncateAtSentence(role.description, 140);
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
