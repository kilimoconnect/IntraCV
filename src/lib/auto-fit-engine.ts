/**
 * Auto-Fit Engine
 * ===============
 * Guarantees content fits within template containers by:
 *   1. Calculating exact container sizes (mirrors config-renderer.tsx)
 *   2. Estimating content heights per section
 *   3. Detecting overflow
 *   4. Applying compression rules in priority order
 *   5. Looping until all sections fit
 *
 * Flow: AI generates content → autoFit adjusts → renderer displays perfectly
 */

import type { CVTemplateData } from "@/components/cv-templates/types";
import type { TemplateConfig } from "@/components/cv-templates/template-config";

// ═══════════════════════════════════════════════
// CONSTANTS — must match config-renderer.tsx
// ═══════════════════════════════════════════════
const PAGE_H = 1123;
const PAGE_W = 794;
const STRIPE_H = 4;
const HDR_H = 110;
const FTR_H = 28;
const DIV_H = 17;
const MINI_HDR_H = 40;
const SB_INFO_H = 190;
const SB_PAD = 28;
const MAIN_PAD = 30;
const COL_GAP = 16;
const SH_H = 20;       // section heading height (11px + margins + padding)
const BULLET_ICON = 14; // bullet indent + icon width

// ═══════════════════════════════════════════════
// DENSITY METRICS
// ═══════════════════════════════════════════════
interface Metrics {
  fontPx: number;
  lineH: number;
  linePx: number;
  charW: number;
  sectionGap: number;
  itemGap: number;
  padX: number;
}

function getMetrics(density: string): Metrics {
  const map: Record<string, { fontPx: number; lineH: number; sGap: number; iGap: number; padX: number }> = {
    compact:  { fontPx: 10.5, lineH: 1.4,  sGap: 12, iGap: 8,  padX: 32 },
    normal:   { fontPx: 11,   lineH: 1.45, sGap: 14, iGap: 10, padX: 40 },
    spacious: { fontPx: 11.5, lineH: 1.5,  sGap: 16, iGap: 12, padX: 48 },
  };
  const m = map[density] || map.compact;
  return {
    fontPx: m.fontPx, lineH: m.lineH,
    linePx: m.fontPx * m.lineH,
    charW: m.fontPx * 0.52,
    sectionGap: m.sGap, itemGap: m.iGap, padX: m.padX,
  };
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function hasData(data: CVTemplateData) {
  return {
    summary: !!data.summary,
    skills: data.skills.length > 0,
    experience: data.experiences.length > 0,
    achievements: !!(data.keyAchievements && data.keyAchievements.length > 0),
    education: data.education.length > 0,
    certifications: data.certifications.length > 0,
    additional: !!(data.languages?.length || data.tools?.length || data.memberships?.length || data.volunteer?.length || data.projects?.length || data.interests?.length),
    referees: !!(data.referees && data.referees.length > 0),
    declaration: !!data.declaration?.declaration,
  };
}

function distPx(pairs: [boolean, number][], avail: number): number[] {
  const tw = pairs.filter(([on]) => on).reduce((s, [, w]) => s + w, 0);
  if (tw <= 0) return pairs.map(() => 0);
  const raw = pairs.map(([on, w]) => (on ? (w / tw) * avail : 0));
  const floored = raw.map(v => Math.floor(v));
  let rem = avail - floored.reduce((s, v) => s + v, 0);
  const order = pairs.map((_, i) => i).filter(i => pairs[i][0])
    .sort((a, b) => (raw[b] - floored[b]) - (raw[a] - floored[a]));
  for (const idx of order) { if (rem <= 0) break; floored[idx]++; rem--; }
  return floored;
}

// Content-proportional height estimation (mirrors config-renderer.tsx contentPx)
function estSectionPx(data: CVTemplateData, section: string, m: Metrics): number {
  const smallLine = 9.5 * 1.45;
  switch (section) {
    case "summary": {
      if (!data.summary) return 0;
      return SH_H + Math.ceil(data.summary.length / 95) * m.linePx + m.sectionGap;
    }
    case "skills": {
      if (data.skills.length === 0) return 0;
      const text = data.skills.map(s => s.name).join("  •  ");
      return SH_H + Math.ceil(text.length / 80) * smallLine + m.sectionGap;
    }
    case "experience": {
      if (data.experiences.length === 0) return 0;
      let px = SH_H;
      for (const e of data.experiences) {
        px += m.linePx + 4; // title line + date badge padding
        px += 14; // company line (9.5px + margins)
        const bullets = (e.description || "").split("\n").filter(l => l.trim());
        if (bullets.length > 0) px += 4; // bullet container margin-top
        for (const b of bullets) {
          const cleaned = b.replace(/^[•\-*]\s*/, "").trim();
          const bLines = Math.ceil(Math.max(1, cleaned.length / 80)); // 80 chars/line (conservative)
          px += bLines * smallLine + 2;
        }
        px += m.itemGap;
      }
      return px + m.sectionGap;
    }
    case "achievements": {
      const items = data.keyAchievements || [];
      if (items.length === 0) return 0;
      let px = SH_H;
      for (const a of items) px += Math.ceil(Math.max(1, a.length / 90)) * smallLine + 3;
      return px + m.sectionGap;
    }
    case "education": {
      if (data.education.length === 0) return 0;
      let px = SH_H;
      for (const e of data.education) {
        px += m.linePx + 12;
        if (e.description) px += Math.ceil(e.description.length / 80) * (9 * 1.4);
        px += m.itemGap;
      }
      return px + m.sectionGap;
    }
    case "certifications": {
      if (data.certifications.length === 0) return 0;
      return SH_H + data.certifications.length * 26 + m.sectionGap;
    }
    case "additional": {
      let items = 0;
      if (data.languages?.length) items++;
      if (data.tools?.length) items++;
      if (data.memberships?.length) items++;
      if (data.volunteer?.length) items++;
      if (data.projects?.length) items++;
      if (data.interests?.length) items++;
      return items > 0 ? SH_H + items * (smallLine + 3) + m.sectionGap : 0;
    }
    case "referees": {
      const refs = data.referees || [];
      if (refs.length === 0) return 0;
      return SH_H + Math.ceil(refs.length / 2) * (5 * 13.5) + m.sectionGap;
    }
    case "declaration": {
      if (!data.declaration?.declaration) return 0;
      return SH_H + Math.ceil(data.declaration.declaration.length / 100) * (9 * 1.4) + 20 + m.sectionGap;
    }
    default: return 0;
  }
}

// Content-fit distribution: matches renderer's contentFitDist
function contentFitDist(
  data: CVTemplateData, m: Metrics,
  sections: [boolean, string, number][], // [hasData, sectionName, fallbackWeight]
  avail: number,
): number[] {
  const naturals = sections.map(([on, name]) => on ? estSectionPx(data, name, m) : 0);
  const totalNatural = naturals.reduce((s, n) => s + n, 0);
  if (totalNatural <= 0) {
    return distPx(sections.map(([on, , w]) => [on, w] as [boolean, number]), avail);
  }
  const distributed = distPx(
    sections.map(([on], i) => [on, Math.max(1, naturals[i])] as [boolean, number]),
    avail,
  );
  return distributed.map((h, i) => {
    if (!sections[i][0] || naturals[i] <= 0) return h;
    const capMultiplier = sections[i][1] === "experience" ? 3 : 2;
    return Math.min(h, Math.ceil(naturals[i] * capMultiplier));
  });
}

function textLines(text: string, widthPx: number, charW: number): number {
  if (!text) return 0;
  const cpl = Math.max(1, Math.floor(widthPx / charW));
  return Math.ceil(text.length / cpl);
}

function cloneData(data: CVTemplateData): CVTemplateData {
  return JSON.parse(JSON.stringify(data));
}

// ═══════════════════════════════════════════════
// CONTAINER SIZE CALCULATOR
// Mirrors config-renderer.tsx EXACTLY
// ═══════════════════════════════════════════════
interface SectionBox {
  heightPx: number;
  widthPx: number;
}

function computeWidths(layout: string, sidebarPct: number, padX: number): { mainW: number; sideW: number } {
  if (layout.startsWith("sidebar")) {
    const sbPct = sidebarPct || 30;
    return {
      sideW: Math.floor(PAGE_W * sbPct / 100) - SB_PAD,
      mainW: Math.floor(PAGE_W * (100 - sbPct) / 100) - MAIN_PAD * 2,
    };
  }
  if (layout === "two-column-equal") {
    const w = Math.floor((PAGE_W - padX * 2 - COL_GAP) / 2);
    return { mainW: w, sideW: w };
  }
  if (layout === "two-column-wide-left") {
    const total = PAGE_W - padX * 2 - COL_GAP;
    return { mainW: Math.floor(total * 0.6), sideW: Math.floor(total * 0.4) };
  }
  if (layout === "two-column-wide-right") {
    const total = PAGE_W - padX * 2 - COL_GAP;
    return { mainW: Math.floor(total * 0.4), sideW: Math.floor(total * 0.6) };
  }
  if (layout === "three-column") {
    const total = PAGE_W - padX * 2 - COL_GAP * 2;
    return { mainW: Math.floor(total * 0.38), sideW: Math.floor(total * 0.32) };
  }
  if (layout === "narrow-centered") {
    const w = PAGE_W - 144;
    return { mainW: w, sideW: w };
  }
  // single-column
  const w = PAGE_W - padX * 2;
  return { mainW: w, sideW: w };
}

function calculateContainers(
  data: CVTemplateData, config: TemplateConfig,
): Record<string, SectionBox> {
  const h = hasData(data);
  const m = getMetrics(config.density);
  const hasBanner = config.headerStyle === "banner";
  const layout = config.layout;
  const isTP = config.category === "two-page";
  const { mainW, sideW } = computeWidths(layout, config.sidebarWidthPercent, m.padX);

  const stripeH = hasBanner ? 0 : STRIPE_H;
  const result: Record<string, SectionBox> = {};

  // ─── SIDEBAR LAYOUTS ───
  if (layout.startsWith("sidebar")) {
    const isLeft = layout.includes("left");

    if (isTP) {
      // TWO-PAGE SIDEBAR
      const p1PanelH = PAGE_H - stripeH - (hasBanner ? HDR_H : 0) - FTR_H;
      const p2PanelH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

      // Page 1 sidebar: skills + certs
      const p1SbInfoH = (!hasBanner && isLeft) ? SB_INFO_H : 0;
      const p1SbDiv = (h.skills && h.certifications) ? 1 : 0;
      const p1SbAvail = p1PanelH - p1SbInfoH - SB_PAD - p1SbDiv * DIV_H;
      const [p1sSk, p1sCt] = contentFitDist(data, m,
        [[h.skills, "skills", 1.5], [h.certifications, "certifications", 1]], p1SbAvail);
      result.skills = { heightPx: p1sSk, widthPx: sideW };
      result.certifications = { heightPx: p1sCt, widthPx: sideW };

      // Page 1 main: summary + experience
      const p1MainHdrH = (!hasBanner && !isLeft) ? HDR_H : 0;
      const p1mDiv = (h.summary && h.experience) ? 1 : 0;
      const p1mAvail = p1PanelH - p1MainHdrH - MAIN_PAD - p1mDiv * DIV_H;
      const [p1mSu, p1mEx] = contentFitDist(data, m,
        [[h.summary, "summary", 1.5], [h.experience, "experience", 5]], p1mAvail);
      result.summary = { heightPx: p1mSu, widthPx: mainW };
      result.experience = { heightPx: p1mEx, widthPx: mainW };

      // Page 2 sidebar: additional + referees + declaration
      const p2SbDiv = [h.additional && h.referees, h.referees && h.declaration].filter(Boolean).length;
      const p2SbAvail = p2PanelH - SB_PAD - p2SbDiv * DIV_H;
      const [p2sAd, p2sRf, p2sDc] = contentFitDist(data, m,
        [[h.additional, "additional", 1], [h.referees, "referees", 1.5], [h.declaration, "declaration", 1]], p2SbAvail);
      result.additional = { heightPx: p2sAd, widthPx: sideW };
      result.referees = { heightPx: p2sRf, widthPx: sideW };
      result.declaration = { heightPx: p2sDc, widthPx: sideW };

      // Page 2 main: achievements + education
      const p2mDiv = (h.achievements && h.education) ? 1 : 0;
      const p2mAvail = p2PanelH - MAIN_PAD - p2mDiv * DIV_H;
      const [p2mAc, p2mEd] = contentFitDist(data, m,
        [[h.achievements, "achievements", 2], [h.education, "education", 2.5]], p2mAvail);
      result.achievements = { heightPx: p2mAc, widthPx: mainW };
      result.education = { heightPx: p2mEd, widthPx: mainW };
    } else {
      // ONE-PAGE SIDEBAR
      const panelH = PAGE_H - stripeH - (hasBanner ? HDR_H : 0) - FTR_H;

      // Sidebar panel
      const sbInfoH = (!hasBanner && isLeft) ? SB_INFO_H : 0;
      const sbDivs = [h.skills && h.certifications, h.certifications && h.additional, h.additional && h.referees, h.referees && h.declaration].filter(Boolean).length;
      const sbAvail = panelH - sbInfoH - SB_PAD - sbDivs * DIV_H;
      const [sSk, sCt, sAd, sRf, sDc] = distPx([
        [h.skills, 1.5], [h.certifications, 1], [h.additional, 1], [h.referees, 1.5], [h.declaration, 1],
      ], sbAvail);
      result.skills = { heightPx: sSk, widthPx: sideW };
      result.certifications = { heightPx: sCt, widthPx: sideW };
      result.additional = { heightPx: sAd, widthPx: sideW };
      result.referees = { heightPx: sRf, widthPx: sideW };
      result.declaration = { heightPx: sDc, widthPx: sideW };

      // Main panel
      const mainHdrH = (!hasBanner && !isLeft) ? HDR_H : 0;
      const mainDivs = [h.summary && h.experience, h.experience && h.achievements, h.achievements && h.education].filter(Boolean).length;
      const mainAvail = panelH - mainHdrH - MAIN_PAD - mainDivs * DIV_H;
      const [mSu, mEx, mAc, mEd] = distPx([
        [h.summary, 1], [h.experience, 5], [h.achievements, 1.5], [h.education, 2],
      ], mainAvail);
      result.summary = { heightPx: mSu, widthPx: mainW };
      result.experience = { heightPx: mEx, widthPx: mainW };
      result.achievements = { heightPx: mAc, widthPx: mainW };
      result.education = { heightPx: mEd, widthPx: mainW };
    }
    return result;
  }

  // ─── TWO-COLUMN LAYOUTS ───
  if (layout.startsWith("two-column") || layout === "three-column") {
    if (isTP) {
      const p1ContentH = PAGE_H - stripeH - HDR_H - FTR_H;
      const p2ContentH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

      // Page 1: summary at top, then columns
      const p1DivCnt = (h.summary && h.skills ? 1 : 0) + (h.skills && h.experience ? 1 : 0);
      const p1SecAvail = p1ContentH - p1DivCnt * DIV_H;
      const [p1hSumm, , p1hExp] = contentFitDist(data, m,
        [[h.summary, "summary", 1.5], [h.skills, "skills", 1.5], [h.experience, "experience", 5]], p1SecAvail);
      const summDivH = h.summary ? DIV_H : 0;
      const p1ColsH = p1ContentH - p1hSumm - summDivH;

      result.summary = { heightPx: p1hSumm, widthPx: mainW + sideW + COL_GAP };
      result.experience = { heightPx: p1ColsH, widthPx: mainW };
      result.skills = { heightPx: p1ColsH, widthPx: sideW };

      // Page 2: two columns — content-proportional
      const [p2lAch, p2lEdu] = contentFitDist(data, m,
        [[h.achievements, "achievements", 2], [h.education, "education", 2.5]], p2ContentH);
      const [p2rCert, p2rAddl, p2rRef, p2rDecl] = contentFitDist(data, m,
        [[h.certifications, "certifications", 1.5], [h.additional, "additional", 1.5],
         [h.referees, "referees", 2], [h.declaration, "declaration", 1]], p2ContentH);

      result.achievements = { heightPx: p2lAch, widthPx: mainW };
      result.education = { heightPx: p2lEdu, widthPx: mainW };
      result.certifications = { heightPx: p2rCert, widthPx: sideW };
      result.additional = { heightPx: p2rAddl, widthPx: sideW };
      result.referees = { heightPx: p2rRef, widthPx: sideW };
      result.declaration = { heightPx: p2rDecl, widthPx: sideW };
    } else {
      const contentH = PAGE_H - stripeH - HDR_H - FTR_H;
      const summDivH = h.summary ? DIV_H : 0;
      const summPairs: [boolean, number][] = [[h.summary, 1], [true, 8]];
      const [summH] = distPx(summPairs, contentH - summDivH);
      const colsH = contentH - (h.summary ? summH : 0) - summDivH;

      result.summary = { heightPx: summH, widthPx: mainW + sideW + COL_GAP };

      // Left column
      const [lExp, lAch, lEdu] = distPx([[h.experience, 4], [h.achievements, 1.5], [h.education, 2]], colsH);
      result.experience = { heightPx: lExp, widthPx: mainW };
      result.achievements = { heightPx: lAch, widthPx: mainW };
      result.education = { heightPx: lEdu, widthPx: mainW };

      // Right column
      const [rSk, rCt, rAd, rRf, rDc] = distPx([
        [h.skills, 1.5], [h.certifications, 1], [h.additional, 1], [h.referees, 1.5], [h.declaration, 1],
      ], colsH);
      result.skills = { heightPx: rSk, widthPx: sideW };
      result.certifications = { heightPx: rCt, widthPx: sideW };
      result.additional = { heightPx: rAd, widthPx: sideW };
      result.referees = { heightPx: rRf, widthPx: sideW };
      result.declaration = { heightPx: rDc, widthPx: sideW };
    }
    return result;
  }

  // ─── SINGLE-COLUMN / NARROW-CENTERED ───
  const contentH = PAGE_H - stripeH - HDR_H - FTR_H;
  const fullW = mainW;

  if (isTP) {
    const p1ContentH = contentH;
    const p2ContentH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

    const p1DivCnt = (h.summary && h.skills ? 1 : 0) + (h.skills && h.experience ? 1 : 0);
    const p1SecAvail = p1ContentH - p1DivCnt * DIV_H;
    const [p1Su, p1Sk, p1Ex] = contentFitDist(data, m,
      [[h.summary, "summary", 1.5], [h.skills, "skills", 1.5], [h.experience, "experience", 5]], p1SecAvail);
    result.summary = { heightPx: p1Su, widthPx: fullW };
    result.skills = { heightPx: p1Sk, widthPx: fullW };
    result.experience = { heightPx: p1Ex, widthPx: fullW };

    const p2DivCnt = (h.achievements && h.education ? 1 : 0) + (h.education && h.certifications ? 1 : 0);
    const p2SecAvail = p2ContentH - p2DivCnt * DIV_H;
    const [p2Ac, p2Ed, p2Ct, p2Ad, p2Rf, p2Dc] = contentFitDist(data, m,
      [[h.achievements, "achievements", 2], [h.education, "education", 2.5], [h.certifications, "certifications", 1.5],
       [h.additional, "additional", 1.5], [h.referees, "referees", 2], [h.declaration, "declaration", 1]], p2SecAvail);
    result.achievements = { heightPx: p2Ac, widthPx: fullW };
    result.education = { heightPx: p2Ed, widthPx: fullW };
    result.certifications = { heightPx: p2Ct, widthPx: fullW };
    result.additional = { heightPx: p2Ad, widthPx: fullW };
    result.referees = { heightPx: p2Rf, widthPx: fullW };
    result.declaration = { heightPx: p2Dc, widthPx: fullW };
  } else {
    let dc = 0;
    if (h.summary && h.skills) dc++;
    if (h.skills && h.experience) dc++;
    if (h.experience && h.achievements) dc++;
    const avail = contentH - dc * DIV_H;
    const [hSu, hSk, hEx, hAc, hEd, hCt, hAd, hRf, hDc] = distPx([
      [h.summary, 1], [h.skills, 1.5], [h.experience, 5], [h.achievements, 1.5],
      [h.education, 2], [h.certifications, 1], [h.additional, 1], [h.referees, 1.5], [h.declaration, 1],
    ], avail);
    result.summary = { heightPx: hSu, widthPx: fullW };
    result.skills = { heightPx: hSk, widthPx: fullW };
    result.experience = { heightPx: hEx, widthPx: fullW };
    result.achievements = { heightPx: hAc, widthPx: fullW };
    result.education = { heightPx: hEd, widthPx: fullW };
    result.certifications = { heightPx: hCt, widthPx: fullW };
    result.additional = { heightPx: hAd, widthPx: fullW };
    result.referees = { heightPx: hRf, widthPx: fullW };
    result.declaration = { heightPx: hDc, widthPx: fullW };
  }
  return result;
}

// ═══════════════════════════════════════════════
// CONTENT HEIGHT ESTIMATOR
// Estimates how many pixels each section needs
// ═══════════════════════════════════════════════

function estimateSummaryPx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  if (!data.summary) return 0;
  // SH + borderLeft paragraph
  const lines = textLines(data.summary, widthPx - 13, m.charW); // -13 for borderLeft + paddingLeft
  return SH_H + lines * m.linePx + m.sectionGap;
}

function estimateSkillsPx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  if (data.skills.length === 0) return 0;
  // Inline text mode: SH + single paragraph of joined skills
  const text = data.skills.map(s => s.name).join("  •  ");
  const lines = textLines(text, widthPx, m.charW);
  return SH_H + lines * (9.5 * 1.5) + m.sectionGap; // skills use 9.5px font, 1.5 lineHeight
}

function estimateExperiencePx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  if (data.experiences.length === 0) return 0;
  let px = SH_H;
  for (const exp of data.experiences) {
    // Title line + company line
    px += m.linePx; // title
    px += 12; // company (9.5px + margins)
    // Bullets
    const bullets = (exp.description || "").split("\n").filter(l => l.trim());
    for (const b of bullets) {
      const cleaned = b.replace(/^[•\-*]\s*/, "").trim();
      const bLines = textLines(cleaned, widthPx - BULLET_ICON, m.charW);
      px += bLines * (9.5 * 1.5) + 2; // 9.5px font, 1.5 lineHeight, 2px marginBottom
    }
    px += m.itemGap;
  }
  px += m.sectionGap;
  return px;
}

function estimateAchievementsPx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  if (!data.keyAchievements || data.keyAchievements.length === 0) return 0;
  let px = SH_H;
  for (const a of data.keyAchievements) {
    const lines = textLines(a, widthPx - 16, m.charW); // -16 for star icon + gap
    px += lines * (9.5 * 1.45) + 3; // 9.5px font, 1.45 lineHeight, 3px marginBottom
  }
  px += m.sectionGap;
  return px;
}

function estimateEducationPx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  if (data.education.length === 0) return 0;
  let px = SH_H;
  for (const edu of data.education) {
    px += m.linePx; // degree
    px += 12; // institution
    if (edu.description) {
      const lines = textLines(edu.description, widthPx - 36, m.charW); // -36 for icon + gap
      px += lines * (9 * 1.4) + 2;
    }
    px += m.itemGap;
  }
  px += m.sectionGap;
  return px;
}

function estimateCertificationsPx(data: CVTemplateData, _widthPx: number, m: Metrics): number {
  if (data.certifications.length === 0) return 0;
  // Each cert: name (9.5px) + issuer/year (8.5px) + marginBottom 4px
  return SH_H + data.certifications.length * (12 + 10 + 4) + m.sectionGap;
}

function estimateAdditionalPx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  const items: string[] = [];
  if (data.languages?.length) items.push(data.languages.map(l => `${l.name} (${l.proficiency})`).join(", "));
  if (data.tools?.length) items.push(data.tools.join(", "));
  if (data.memberships?.length) items.push(data.memberships.join(", "));
  if (data.volunteer?.length) items.push(data.volunteer.join(", "));
  if (data.projects?.length) items.push(data.projects.map(p => p.name).join(", "));
  if (data.interests?.length) items.push(data.interests.join(", "));
  if (items.length === 0) return 0;
  let px = SH_H;
  for (const item of items) {
    const lines = textLines(item, widthPx - 16, m.charW);
    px += lines * (9.5 * 1.45) + 3;
  }
  px += m.sectionGap;
  return px;
}

function estimateRefereesPx(data: CVTemplateData, _widthPx: number, m: Metrics): number {
  if (!data.referees || data.referees.length === 0) return 0;
  // Each referee: name(9.5px) + title + company + email + phone ≈ 5 lines × 13.5px
  return SH_H + Math.ceil(data.referees.length / 2) * (5 * 13.5 + 10) + m.sectionGap;
}

function estimateDeclarationPx(data: CVTemplateData, widthPx: number, m: Metrics): number {
  if (!data.declaration?.declaration) return 0;
  const lines = textLines(data.declaration.declaration, widthPx, m.charW);
  return SH_H + lines * (9 * 1.4) + 15 + m.sectionGap; // +15 for place/date line
}

function estimateAllSections(
  data: CVTemplateData, containers: Record<string, SectionBox>, m: Metrics,
): Record<string, { estimated: number; allocated: number; overflow: number }> {
  const estimators: Record<string, (d: CVTemplateData, w: number, m: Metrics) => number> = {
    summary: estimateSummaryPx,
    skills: estimateSkillsPx,
    experience: estimateExperiencePx,
    achievements: estimateAchievementsPx,
    education: estimateEducationPx,
    certifications: estimateCertificationsPx,
    additional: estimateAdditionalPx,
    referees: estimateRefereesPx,
    declaration: estimateDeclarationPx,
  };

  const result: Record<string, { estimated: number; allocated: number; overflow: number }> = {};
  for (const [section, box] of Object.entries(containers)) {
    const estimator = estimators[section];
    if (!estimator || box.heightPx <= 0) continue;
    const est = estimator(data, box.widthPx, m);
    result[section] = { estimated: est, allocated: box.heightPx, overflow: est - box.heightPx };
  }
  return result;
}

// ═══════════════════════════════════════════════
// COMPRESSION RULES (priority order)
// ═══════════════════════════════════════════════

const MAX_BULLET_CHARS = 85;

// Trim text to maxLen, snapping to a natural boundary and adding period
function smartTrim(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let cut = text.substring(0, maxLen);
  // Prefer cutting at comma/semicolon for natural phrasing
  const lastComma = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(";"));
  const lastSpace = cut.lastIndexOf(" ");
  if (lastComma > cut.length * 0.5) {
    cut = cut.substring(0, lastComma);
  } else if (lastSpace > cut.length * 0.5) {
    cut = cut.substring(0, lastSpace);
  }
  // Remove trailing prepositions/articles/conjunctions that create awkward endings
  cut = cut.replace(/\s+(in|on|at|by|to|for|of|the|a|an|and|or|with|from|through|into|over|across|between|among|within|during|about|under|upon|after|before|against|throughout|toward|towards|via|per)\s*$/i, "");
  // Remove dangling "and/or + single word" patterns (e.g. "and reduced", "or evaluations")
  cut = cut.replace(/\s+(and|or)\s+\S+\s*$/i, "");
  // Ensure it ends with proper punctuation
  cut = cut.replace(/[,;:\s]+$/, "");
  if (!/[.!?]$/.test(cut)) cut += ".";
  return cut;
}

function shortenBullets(data: CVTemplateData): boolean {
  let changed = false;
  for (const exp of data.experiences) {
    const bullets = (exp.description || "").split("\n").filter(l => l.trim());
    const shortened = bullets.map(b => {
      const cleaned = b.replace(/^[•\-*]\s*/, "").trim();
      if (cleaned.length > MAX_BULLET_CHARS) {
        changed = true;
        return smartTrim(cleaned, MAX_BULLET_CHARS);
      }
      return cleaned;
    });
    exp.description = shortened.join("\n");
  }
  return changed;
}

function reduceBullets(data: CVTemplateData, maxPerJob: number): boolean {
  let changed = false;
  for (const exp of data.experiences) {
    const bullets = (exp.description || "").split("\n").filter(l => l.trim());
    if (bullets.length > maxPerJob) {
      exp.description = bullets.slice(0, maxPerJob).join("\n");
      changed = true;
    }
  }
  return changed;
}

function reduceSkills(data: CVTemplateData, maxCount: number): boolean {
  if (data.skills.length <= maxCount) return false;
  data.skills = data.skills.slice(0, maxCount);
  return true;
}

function shortenSummary(data: CVTemplateData, maxChars: number): boolean {
  if (!data.summary || data.summary.length <= maxChars) return false;
  let trimmed = data.summary.substring(0, maxChars);
  // Snap to last sentence boundary
  const lastPeriod = Math.max(
    trimmed.lastIndexOf("."),
    trimmed.lastIndexOf("!"),
    trimmed.lastIndexOf("?"),
  );
  if (lastPeriod > trimmed.length * 0.5) {
    trimmed = trimmed.substring(0, lastPeriod + 1);
  } else {
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace > 0) trimmed = trimmed.substring(0, lastSpace);
    trimmed = trimmed.replace(/[,;:\s]+$/, "") + ".";
  }
  data.summary = trimmed;
  return true;
}

function collapseOlderJobs(data: CVTemplateData, keepRecent: number): boolean {
  if (data.experiences.length <= keepRecent) return false;
  const recent = data.experiences.slice(0, keepRecent);
  const older = data.experiences.slice(keepRecent);

  // Group older jobs under "Earlier Career"
  const earlierLines = older.map(e => {
    const company = e.company ? ` – ${e.company}` : "";
    return `${e.title}${company}`;
  });

  recent.push({
    title: "Earlier Career",
    company: "",
    location: "",
    startDate: older[older.length - 1]?.startDate || "",
    endDate: older[0]?.endDate || "",
    description: earlierLines.join("\n"),
  });

  data.experiences = recent;
  return true;
}

function shortenAchievements(data: CVTemplateData, maxChars: number): boolean {
  if (!data.keyAchievements) return false;
  let changed = false;
  data.keyAchievements = data.keyAchievements.map(a => {
    if (a.length > maxChars) {
      changed = true;
      return smartTrim(a, maxChars);
    }
    return a;
  });
  return changed;
}

function reduceAchievements(data: CVTemplateData, maxCount: number): boolean {
  if (!data.keyAchievements || data.keyAchievements.length <= maxCount) return false;
  data.keyAchievements = data.keyAchievements.slice(0, maxCount);
  return true;
}

// ═══════════════════════════════════════════════
// AUTO-FIT LOOP
// ═══════════════════════════════════════════════

export interface AutoFitResult {
  data: CVTemplateData;
  iterations: number;
  log: string[];
  overflows: Record<string, number>;
}

export function autoFit(data: CVTemplateData, config: TemplateConfig): AutoFitResult {
  const m = getMetrics(config.density);
  let current = cloneData(data);
  const log: string[] = [];
  let iterations = 0;

  for (let i = 0; i < 10; i++) {
    iterations = i + 1;

    // Recalculate containers (they change when sections are removed/reduced)
    const containers = calculateContainers(current, config);
    const estimates = estimateAllSections(current, containers, m);

    // Check for overflows
    const overflows: Record<string, number> = {};
    for (const [section, est] of Object.entries(estimates)) {
      if (est.overflow > 0) {
        overflows[section] = est.overflow;
      }
    }

    if (Object.keys(overflows).length === 0) {
      log.push(`✓ All sections fit after ${iterations} iteration(s)`);
      return { data: current, iterations, log, overflows: {} };
    }

    log.push(`Iteration ${iterations}: overflows in ${Object.keys(overflows).join(", ")}`);

    // Apply compression rules in priority order
    let compressed = false;

    // Priority 1: Shorten long bullets (> 85 chars)
    if (!compressed && overflows.experience) {
      compressed = shortenBullets(current);
      if (compressed) log.push("  → Shortened long bullets to 85 chars max");
    }

    // Priority 2: Reduce bullets per job (4→3→2→1)
    if (!compressed && overflows.experience) {
      const maxBullets = current.experiences.reduce((max, e) => {
        const count = (e.description || "").split("\n").filter(l => l.trim()).length;
        return Math.max(max, count);
      }, 0);
      if (maxBullets > 2) {
        compressed = reduceBullets(current, maxBullets - 1);
        if (compressed) log.push(`  → Reduced bullets to ${maxBullets - 1} per job`);
      }
    }

    // Priority 3: Reduce skills count
    if (!compressed && overflows.skills) {
      const currentCount = current.skills.length;
      if (currentCount > 8) {
        compressed = reduceSkills(current, Math.max(8, currentCount - 4));
        if (compressed) log.push(`  → Reduced skills to ${current.skills.length}`);
      }
    }

    // Priority 4: Shorten achievements
    if (!compressed && overflows.achievements) {
      compressed = shortenAchievements(current, MAX_BULLET_CHARS);
      if (compressed) log.push("  → Shortened achievements to 85 chars max");
    }

    // Priority 5: Reduce achievement count
    if (!compressed && overflows.achievements) {
      const count = current.keyAchievements?.length || 0;
      if (count > 3) {
        compressed = reduceAchievements(current, count - 1);
        if (compressed) log.push(`  → Reduced achievements to ${current.keyAchievements.length}`);
      }
    }

    // Priority 6: Shorten summary
    if (!compressed && overflows.summary) {
      const currentLen = current.summary.length;
      compressed = shortenSummary(current, Math.floor(currentLen * 0.8));
      if (compressed) log.push(`  → Shortened summary to ${current.summary.length} chars`);
    }

    // Priority 7: Collapse older jobs
    if (!compressed && overflows.experience) {
      const jobCount = current.experiences.length;
      if (jobCount > 4) {
        compressed = collapseOlderJobs(current, Math.max(3, jobCount - 2));
        if (compressed) log.push(`  → Collapsed older jobs, kept ${current.experiences.length}`);
      }
    }

    // Priority 8: Aggressive bullet reduction
    if (!compressed && overflows.experience) {
      compressed = reduceBullets(current, 1);
      if (compressed) log.push("  → Reduced to 1 bullet per job");
    }

    // Priority 9: Last resort — more aggressive summary trim
    if (!compressed && overflows.summary) {
      compressed = shortenSummary(current, Math.floor(current.summary.length * 0.6));
      if (compressed) log.push("  → Aggressively shortened summary");
    }

    // Priority 10: Any remaining overflow — try reducing education descriptions
    if (!compressed && overflows.education) {
      let eduChanged = false;
      for (const edu of current.education) {
        if (edu.description && edu.description.length > 40) {
          edu.description = edu.description.substring(0, 40).trim();
          eduChanged = true;
        }
      }
      compressed = eduChanged;
      if (compressed) log.push("  → Shortened education descriptions");
    }

    if (!compressed) {
      log.push("  ✗ No further compression possible");
      break;
    }
  }

  // Final overflow check
  const finalContainers = calculateContainers(current, config);
  const finalEstimates = estimateAllSections(current, finalContainers, m);
  const finalOverflows: Record<string, number> = {};
  for (const [section, est] of Object.entries(finalEstimates)) {
    if (est.overflow > 0) finalOverflows[section] = est.overflow;
  }

  return { data: current, iterations, log, overflows: finalOverflows };
}
