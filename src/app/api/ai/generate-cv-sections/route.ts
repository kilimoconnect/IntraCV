import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

// ═══════════════════════════════════════════════
// FONT METRICS & PIXEL-LEVEL HEIGHT ESTIMATOR
// Density-aware: must match DENSITY in template-config.ts
// ═══════════════════════════════════════════════
const DENSITY_METRICS: Record<string, { fontPx: number; lineH: number; padX: number }> = {
  compact:  { fontPx: 10.5, lineH: 1.4,  padX: 32 },
  normal:   { fontPx: 11,   lineH: 1.45, padX: 40 },
  spacious: { fontPx: 11.5, lineH: 1.5,  padX: 48 },
};
const SAFETY = 0.85; // 15% safety margin for browser rendering differences

// Active metrics — set per request in POST handler
let FONT_PX = 10.5;
let LINE_H = 1.45;
let LINE_PX = FONT_PX * LINE_H;
let CHAR_W = FONT_PX * 0.52;

function setDensity(density: string) {
  const m = DENSITY_METRICS[density] || DENSITY_METRICS.compact;
  FONT_PX = m.fontPx;
  LINE_H = m.lineH;
  LINE_PX = FONT_PX * LINE_H;
  CHAR_W = FONT_PX * 0.52;
}

const HEADING_PX = 24;      // section heading (11px font, uppercase, padding, margin)
const ENTRY_GAP_PX = 6;     // gap between list entries
const BULLET_INDENT = 14;   // bullet point indent reduces usable width
const CONTENT_W = 700;      // fallback usable content width

// Page layout constants (must match config-renderer.tsx)
const PAGE_H = 1123;
const STRIPE_H = 4;
const HDR_H = 110;
const FTR_H = 28;
const CPAD_T = 10;
const DIV_H = 17;
const WEIGHTS: Record<string, number> = {
  summary: 1, skills: 1.5, experience: 5, achievements: 1.5,
  education: 2, certifications: 1, additional: 1, referees: 1.5, declaration: 1,
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function wordsPerLine(widthPx: number): number {
  return Math.max(1, Math.floor(widthPx / CHAR_W / 7)); // avg professional word = 6 chars + space
}

// Estimate how many pixels of height a text block needs — CHARACTER-BASED for accuracy
function estimateTextPx(text: string, widthPx: number = CONTENT_W): number {
  const charsPerLine = Math.max(1, Math.floor(widthPx / CHAR_W));
  const lines = Math.ceil(text.length / charsPerLine);
  return lines * LINE_PX;
}

// ═══════════════════════════════════════════════
// CONTAINER SIZE CALCULATOR
// Returns the exact pixel height of each section container
// ═══════════════════════════════════════════════
interface ContainerSpec {
  name: string;
  heightPx: number;     // container pixel height
  contentPx: number;    // usable px after heading
  maxLines: number;     // max content lines
  maxWords: number;     // approximate max words
  widthPx: number;      // usable content width
}

const MINI_HDR_H = 40;
const PAGE_W = 794;
const SB_INFO_H = 190; // sidebar personal-info block height (matches renderer)
const SB_PAD = 28;     // sidebar top+bottom padding
const MAIN_PAD = 30;   // main area top+bottom padding
const COL_GAP = 16;    // gap between columns

// ═══════════════════════════════════════════════
// TEMPLATE-AWARE CONTAINER CALCULATOR
// Mirrors config-renderer.tsx EXACTLY per layout type
// ═══════════════════════════════════════════════

function makeSpec(name: string, heightPx: number, widthPx: number): ContainerSpec {
  const contentPx = Math.max(0, heightPx - HEADING_PX);
  const wpl = wordsPerLine(widthPx);
  const maxLines = Math.floor(contentPx / LINE_PX);
  const maxWords = Math.floor(maxLines * wpl * SAFETY); // 10% safety margin
  return { name, heightPx, contentPx, maxLines, maxWords, widthPx };
}

function distPx(pairs: [boolean, number][], avail: number): number[] {
  const tw = pairs.filter(([on]) => on).reduce((s, [, w]) => s + w, 0);
  if (tw <= 0) return pairs.map(() => 0);
  return pairs.map(([on, w]) => (on ? Math.floor((w / tw) * avail) : 0));
}

function computeWidths(layout: string, sidebarPct: number) {
  const padPx = 64; // ~32px each side for compact/normal
  const fullW = PAGE_W - padPx;

  if (layout.startsWith("sidebar")) {
    const sbPct = (layout === "sidebar-left-wide" || layout === "sidebar-right-wide")
      ? Math.max(sidebarPct || 40, 40) : (sidebarPct || 30);
    const sideW = Math.floor(PAGE_W * sbPct / 100) - 28;
    const mainW = Math.floor(PAGE_W * (100 - sbPct) / 100) - 40;
    return { mainW, sideW, summaryW: mainW, fullW };
  }
  if (layout === "two-column-equal") {
    const colW = Math.floor((fullW - COL_GAP) / 2);
    return { mainW: colW, sideW: colW, summaryW: fullW, fullW };
  }
  if (layout === "two-column-wide-left") {
    return { mainW: Math.floor((fullW - COL_GAP) * 0.6), sideW: Math.floor((fullW - COL_GAP) * 0.4), summaryW: fullW, fullW };
  }
  if (layout === "two-column-wide-right") {
    return { mainW: Math.floor((fullW - COL_GAP) * 0.4), sideW: Math.floor((fullW - COL_GAP) * 0.6), summaryW: fullW, fullW };
  }
  if (layout === "three-column") {
    const c1 = Math.floor((fullW - COL_GAP * 2) * 0.38);
    const c2 = Math.floor((fullW - COL_GAP * 2) * 0.32);
    const c3 = Math.floor((fullW - COL_GAP * 2) * 0.30);
    return { mainW: c1, sideW: c3, midW: c2, summaryW: fullW, fullW };
  }
  if (layout === "narrow-centered") {
    const nw = PAGE_W - 144;
    return { mainW: nw, sideW: nw, summaryW: nw, fullW: nw };
  }
  return { mainW: fullW, sideW: fullW, summaryW: fullW, fullW };
}

function calculateContainers(
  cvData: any, templateType: string, layout: string,
  sidebarPct: number, headerStyle: string, _density: string,
): Record<string, ContainerSpec> {
  const w = computeWidths(layout, sidebarPct);
  const hasBanner = headerStyle === "banner";
  const stripeH = hasBanner ? 0 : STRIPE_H;
  const isSidebar = layout.startsWith("sidebar");
  const isLeft = layout === "sidebar-left" || layout === "sidebar-left-wide";
  const isTwoCol = layout.startsWith("two-column") || layout === "three-column";

  const hasExp = (cvData.experiences || cvData.experience || []).length > 0;
  const h: Record<string, boolean> = {
    summary: true, skills: (cvData.skills || []).length > 0,
    experience: hasExp, achievements: hasExp,
    education: (cvData.education || []).length > 0,
    certifications: (cvData.certifications || []).length > 0,
    additional: !!(cvData.languages?.length || cvData.tools?.length || cvData.memberships?.length || cvData.volunteer?.length || cvData.projects?.length || cvData.interests?.length),
    referees: (cvData.referees || []).length > 0,
    declaration: !!cvData.declaration?.declaration,
  };

  const containers: Record<string, ContainerSpec> = {};

  // ════════════════════════════════════════════════════════════
  // TWO-PAGE TEMPLATES
  // ════════════════════════════════════════════════════════════
  if (templateType === "two-page") {
    if (isSidebar) {
      // ─── TWO-PAGE SIDEBAR ───
      // Page 1: sidebar(skills + certs) | main(summary + experience)
      // Page 2: sidebar(additional + referees + declaration) | main(achievements + education)
      const p1PanelH = PAGE_H - stripeH - (hasBanner ? HDR_H : 0) - FTR_H;
      const p2PanelH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

      // Page 1 sidebar
      const sbInfoH = (!hasBanner && isLeft) ? SB_INFO_H : 0;
      const p1SbAvail = p1PanelH - sbInfoH - SB_PAD;
      const p1SbDivs = h.skills && h.certifications ? 1 : 0;
      const [p1sbSkills, p1sbCerts] = distPx([[h.skills,1.5],[h.certifications,1]], p1SbAvail - p1SbDivs * DIV_H);
      if (h.skills) containers.skills = makeSpec("skills", p1sbSkills, w.sideW);
      if (h.certifications) containers.certifications = makeSpec("certifications", p1sbCerts, w.sideW);

      // Page 1 main
      const p1MainHdrH = (!hasBanner && !isLeft) ? HDR_H : 0;
      const p1MainDivs = h.summary && h.experience ? 1 : 0;
      const p1MainAvail = p1PanelH - p1MainHdrH - MAIN_PAD - p1MainDivs * DIV_H;
      const [p1mSumm, p1mExp] = distPx([[h.summary,1.5],[h.experience,5]], p1MainAvail);
      containers.summary = makeSpec("summary", p1mSumm, w.mainW);
      if (h.experience) containers.experience = makeSpec("experience", p1mExp, w.mainW);

      // Page 2 sidebar
      const p2SbDivs = (h.additional && h.referees ? 1 : 0) + (h.referees && h.declaration ? 1 : 0);
      const p2SbAvail = p2PanelH - SB_PAD - p2SbDivs * DIV_H;
      const [p2sbAddl, p2sbRef, p2sbDecl] = distPx([[h.additional,1.5],[h.referees,2],[h.declaration,1]], p2SbAvail);
      if (h.additional) containers.additional = makeSpec("additional", p2sbAddl, w.sideW);
      if (h.referees) containers.referees = makeSpec("referees", p2sbRef, w.sideW);
      if (h.declaration) containers.declaration = makeSpec("declaration", p2sbDecl, w.sideW);

      // Page 2 main
      const p2MainDivs = h.achievements && h.education ? 1 : 0;
      const p2MainAvail = p2PanelH - MAIN_PAD - p2MainDivs * DIV_H;
      const [p2mAch, p2mEdu] = distPx([[h.achievements,2],[h.education,2.5]], p2MainAvail);
      if (h.achievements) containers.achievements = makeSpec("achievements", p2mAch, w.mainW);
      if (h.education) containers.education = makeSpec("education", p2mEdu, w.mainW);

      return containers;
    }

    if (isTwoCol) {
      // ─── TWO-PAGE TWO-COLUMN ───
      const p1ContentH = PAGE_H - stripeH - HDR_H - FTR_H;
      const p2ContentH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;

      // Page 1: summary (full width) + divider, then columns: left(exp) | right(skills)
      const p1DivCnt = (h.summary && h.skills ? 1 : 0) + (h.skills && h.experience ? 1 : 0);
      const p1SecAvail = p1ContentH - p1DivCnt * DIV_H;
      const [p1hSumm] = distPx([[true,1.5],[true,1.5],[h.experience,5]], p1SecAvail);
      const summDivH = h.summary ? DIV_H : 0;
      const p1ColsH = p1ContentH - p1hSumm - summDivH;
      containers.summary = makeSpec("summary", p1hSumm, w.summaryW);
      if (h.experience) containers.experience = makeSpec("experience", p1ColsH, w.mainW);
      if (h.skills) containers.skills = makeSpec("skills", p1ColsH, w.sideW);

      // Page 2: left(achievements + education) | right(certs + additional + referees + declaration)
      const [p2lAch, p2lEdu] = distPx([[h.achievements,2],[h.education,2.5]], p2ContentH);
      const [p2rCert, p2rAddl, p2rRef, p2rDecl] = distPx(
        [[h.certifications,1.5],[h.additional,1.5],[h.referees,2],[h.declaration,1]], p2ContentH);
      if (h.achievements) containers.achievements = makeSpec("achievements", p2lAch, w.mainW);
      if (h.education) containers.education = makeSpec("education", p2lEdu, w.mainW);
      if (h.certifications) containers.certifications = makeSpec("certifications", p2rCert, w.sideW);
      if (h.additional) containers.additional = makeSpec("additional", p2rAddl, w.sideW);
      if (h.referees) containers.referees = makeSpec("referees", p2rRef, w.sideW);
      if (h.declaration) containers.declaration = makeSpec("declaration", p2rDecl, w.sideW);

      return containers;
    }

    // ─── TWO-PAGE SINGLE-COLUMN / NARROW ───
    const p1ContentH = PAGE_H - stripeH - HDR_H - FTR_H;
    const p2ContentH = PAGE_H - stripeH - MINI_HDR_H - FTR_H;
    const p1Divs = (h.summary && h.skills ? 1 : 0) + (h.skills && h.experience ? 1 : 0);
    const p1Avail = p1ContentH - p1Divs * DIV_H;
    const [p1Summ, p1Skills, p1Exp] = distPx([[true,1.5],[h.skills,1.5],[h.experience,5]], p1Avail);
    containers.summary = makeSpec("summary", p1Summ, w.fullW);
    if (h.skills) containers.skills = makeSpec("skills", p1Skills, w.fullW);
    if (h.experience) containers.experience = makeSpec("experience", p1Exp, w.fullW);

    const p2Divs = (h.achievements && h.education ? 1 : 0) + (h.education && h.certifications ? 1 : 0);
    const p2Avail = p2ContentH - p2Divs * DIV_H;
    const [p2Ach, p2Edu, p2Cert, p2Addl, p2Ref, p2Decl] = distPx(
      [[h.achievements,2],[h.education,2.5],[h.certifications,1.5],[h.additional,1.5],[h.referees,2],[h.declaration,1]], p2Avail);
    if (h.achievements) containers.achievements = makeSpec("achievements", p2Ach, w.fullW);
    if (h.education) containers.education = makeSpec("education", p2Edu, w.fullW);
    if (h.certifications) containers.certifications = makeSpec("certifications", p2Cert, w.fullW);
    if (h.additional) containers.additional = makeSpec("additional", p2Addl, w.fullW);
    if (h.referees) containers.referees = makeSpec("referees", p2Ref, w.fullW);
    if (h.declaration) containers.declaration = makeSpec("declaration", p2Decl, w.fullW);
    return containers;
  }

  // ════════════════════════════════════════════════════════════
  // ONE-PAGE TEMPLATES
  // ════════════════════════════════════════════════════════════
  const contentH = PAGE_H - stripeH - HDR_H - FTR_H;

  if (isSidebar) {
    // ─── ONE-PAGE SIDEBAR ───
    // Sidebar: skills, certs, additional, referees, declaration
    // Main: summary, experience, achievements, education
    const panelH = PAGE_H - stripeH - (hasBanner ? HDR_H : 0) - FTR_H;
    const sbInfoH = (!hasBanner && isLeft) ? SB_INFO_H : 0;
    let sbDivC = 0;
    if (h.skills && h.certifications) sbDivC++;
    if (h.certifications) sbDivC++;
    const sbSecAvail = panelH - sbInfoH - SB_PAD - sbDivC * DIV_H;
    const [sbSkills, sbCert, sbAddl, sbRef, sbDecl] = distPx(
      [[h.skills,1.5],[h.certifications,1],[h.additional,1],[h.referees,1.5],[h.declaration,1]], sbSecAvail);
    if (h.skills) containers.skills = makeSpec("skills", sbSkills, w.sideW);
    if (h.certifications) containers.certifications = makeSpec("certifications", sbCert, w.sideW);
    if (h.additional) containers.additional = makeSpec("additional", sbAddl, w.sideW);
    if (h.referees) containers.referees = makeSpec("referees", sbRef, w.sideW);
    if (h.declaration) containers.declaration = makeSpec("declaration", sbDecl, w.sideW);

    const mainHdrH = (!hasBanner && !isLeft) ? HDR_H : 0;
    let mainDivC = 0;
    if (h.summary && h.experience) mainDivC++;
    if (h.experience && h.achievements) mainDivC++;
    const mainSecAvail = panelH - mainHdrH - MAIN_PAD - mainDivC * DIV_H;
    const [mSumm, mExp, mAch, mEdu] = distPx(
      [[h.summary,1],[h.experience,5],[h.achievements,1.5],[h.education,2]], mainSecAvail);
    containers.summary = makeSpec("summary", mSumm, w.mainW);
    if (h.experience) containers.experience = makeSpec("experience", mExp, w.mainW);
    if (h.achievements) containers.achievements = makeSpec("achievements", mAch, w.mainW);
    if (h.education) containers.education = makeSpec("education", mEdu, w.mainW);
    return containers;
  }

  if (isTwoCol) {
    // ─── ONE-PAGE TWO-COLUMN ───
    // Summary: full width at top
    // Left: experience, achievements, education
    // Right: skills, certs, additional, referees, declaration
    const summDivH = h.summary ? DIV_H : 0;
    const [summH] = distPx([[h.summary, 1], [true, 8]], contentH - summDivH);
    const colsH = contentH - (h.summary ? summH : 0) - summDivH;

    containers.summary = makeSpec("summary", summH, w.summaryW);

    const [lExp, lAch, lEdu] = distPx([[h.experience,4],[h.achievements,1.5],[h.education,2]], colsH);
    if (h.experience) containers.experience = makeSpec("experience", lExp, w.mainW);
    if (h.achievements) containers.achievements = makeSpec("achievements", lAch, w.mainW);
    if (h.education) containers.education = makeSpec("education", lEdu, w.mainW);

    const [rSkills, rCert, rAddl, rRef, rDecl] = distPx(
      [[h.skills,1.5],[h.certifications,1],[h.additional,1],[h.referees,1.5],[h.declaration,1]], colsH);
    if (h.skills) containers.skills = makeSpec("skills", rSkills, w.sideW);
    if (h.certifications) containers.certifications = makeSpec("certifications", rCert, w.sideW);
    if (h.additional) containers.additional = makeSpec("additional", rAddl, w.sideW);
    if (h.referees) containers.referees = makeSpec("referees", rRef, w.sideW);
    if (h.declaration) containers.declaration = makeSpec("declaration", rDecl, w.sideW);
    return containers;
  }

  // ─── ONE-PAGE SINGLE-COLUMN / NARROW ───
  let divCount = 0;
  if (h.summary && h.skills) divCount++;
  if (h.skills && h.experience) divCount++;
  if (h.experience && h.achievements) divCount++;
  const availForSections = contentH - divCount * DIV_H;

  const allPairs: [string, boolean, number][] = [
    ["summary",true,1],["skills",h.skills,1.5],["experience",h.experience,5],["achievements",h.achievements,1.5],
    ["education",h.education,2],["certifications",h.certifications,1],["additional",h.additional,1],
    ["referees",h.referees,1.5],["declaration",h.declaration,1],
  ];
  const tw = allPairs.filter(([,on]) => on).reduce((s, [,,wt]) => s + (wt as number), 0);
  for (const [name, on, weight] of allPairs) {
    if (!on) continue;
    const n = name as string;
    containers[n] = makeSpec(n, Math.floor(((weight as number) / tw) * availForSections), w.fullW);
  }
  return containers;
}

// ═══════════════════════════════════════════════
// AI CALLER
// ═══════════════════════════════════════════════
async function callAI(prompt: string): Promise<any> {
  const completion = await openaiClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response");
  return JSON.parse(content);
}

function expSummary(cvData: any): string {
  const exps = cvData.experiences || cvData.experience || [];
  return exps.map((e: any) =>
    `${e.title || e.jobTitle || ""} at ${e.company || e.employer || ""} (${e.startDate || ""}–${e.endDate || ""}): ${(e.description || "").substring(0, 120)}`
  ).join("\n");
}

// ═══════════════════════════════════════════════
// PIXEL-LEVEL VALIDATORS
// Estimate rendered height and compare to container
// ═══════════════════════════════════════════════
interface PxValidation {
  pass: boolean;
  estimatedPx: number;
  containerPx: number;
  issues: string[];
}

function validateSummaryPx(data: any, c: ContainerSpec): PxValidation {
  const text = data.summary || "";
  const estPx = estimateTextPx(text, c.widthPx);
  const issues: string[] = [];
  if (estPx > c.contentPx) issues.push(`summary est ${Math.round(estPx)}px, container has ${c.contentPx}px (${wordCount(text)} words, need ≤${c.maxWords})`);
  return { pass: issues.length === 0, estimatedPx: estPx, containerPx: c.contentPx, issues };
}

function validateSkillsPx(data: any, c: ContainerSpec): PxValidation {
  const skills = data.skills || [];
  // Skills render as inline tags: ~80px per tag, ~8 per row
  const tagsPerRow = Math.floor(c.widthPx / 85);
  const rows = Math.ceil(skills.length / Math.max(1, tagsPerRow));
  const estPx = rows * 26; // ~26px per row of tags
  const issues: string[] = [];
  if (estPx > c.contentPx) issues.push(`${skills.length} skills est ${Math.round(estPx)}px, container has ${c.contentPx}px (need ≤${Math.floor(c.contentPx / 26) * tagsPerRow} skills)`);
  return { pass: issues.length === 0, estimatedPx: estPx, containerPx: c.contentPx, issues };
}

function validateExperiencePx(data: any, c: ContainerSpec): PxValidation {
  const exps = data.experiences || [];
  let estPx = 0;
  const issues: string[] = [];
  const bulletW = c.widthPx - BULLET_INDENT;

  for (let i = 0; i < exps.length; i++) {
    // Title line + company/dates line
    estPx += 16 + 14;
    // Bullets
    const bullets = (exps[i].description || "").split("\n").filter((l: string) => l.trim());
    for (const b of bullets) {
      estPx += estimateTextPx(b, bulletW);
    }
    estPx += ENTRY_GAP_PX;
  }

  if (estPx > c.contentPx) {
    issues.push(`experience est ${Math.round(estPx)}px, container has ${c.contentPx}px`);
    // Specific advice
    const perJobPx = exps.length > 0 ? estPx / exps.length : 0;
    const maxJobs = Math.floor(c.contentPx / Math.max(1, perJobPx));
    const maxBulletsPerJob = Math.max(1, Math.floor((c.contentPx / Math.max(1, exps.length) - 30 - ENTRY_GAP_PX) / LINE_PX));
    issues.push(`fit ${maxJobs} jobs with ${maxBulletsPerJob} bullets each, ≤${Math.floor(bulletW / CHAR_W / 6)} words/bullet`);
  }
  return { pass: issues.length === 0, estimatedPx: estPx, containerPx: c.contentPx, issues };
}

function validateAchievementsPx(data: any, c: ContainerSpec): PxValidation {
  const items = data.keyAchievements || [];
  let estPx = 0;
  for (const a of items) {
    estPx += estimateTextPx(a, c.widthPx - BULLET_INDENT) + 4;
  }
  const issues: string[] = [];
  if (estPx > c.contentPx) {
    const maxItems = Math.floor(c.contentPx / (LINE_PX + 4));
    issues.push(`${items.length} achievements est ${Math.round(estPx)}px, container has ${c.contentPx}px (need ≤${maxItems} items, ≤${wordsPerLine(c.widthPx)} words each)`);
  }
  return { pass: issues.length === 0, estimatedPx: estPx, containerPx: c.contentPx, issues };
}

function validateEducationPx(data: any, c: ContainerSpec): PxValidation {
  const entries = data.education || [];
  let estPx = 0;
  for (const e of entries) {
    estPx += 16 + 14; // degree + institution lines
    if (e.description) estPx += estimateTextPx(e.description, c.widthPx);
    estPx += ENTRY_GAP_PX;
  }
  const issues: string[] = [];
  if (estPx > c.contentPx) {
    const maxEntries = Math.floor(c.contentPx / (16 + 14 + LINE_PX + ENTRY_GAP_PX));
    issues.push(`${entries.length} edu entries est ${Math.round(estPx)}px, container has ${c.contentPx}px (need ≤${maxEntries} entries, short descriptions)`);
  }
  return { pass: issues.length === 0, estimatedPx: estPx, containerPx: c.contentPx, issues };
}

// ═══════════════════════════════════════════════
// GENERATE-VALIDATE-REGENERATE LOOP
// Up to 5 retries per section for perfect fit
// ═══════════════════════════════════════════════
const MAX_RETRIES = 5;

async function generateSection(
  label: string,
  genPrompt: string,
  validateFn: (data: any) => PxValidation,
  fixPromptFn: (data: any, v: PxValidation, attempt: number) => string,
): Promise<any> {
  console.log(`[CV Gen] ─── Starting ${label} ───`);

  let result = await callAI(genPrompt);
  let v = validateFn(result);
  console.log(`[CV Gen] ${label} attempt 1: est ${Math.round(v.estimatedPx)}px / ${v.containerPx}px → ${v.pass ? "PASS" : "FAIL"}`);

  for (let attempt = 2; attempt <= MAX_RETRIES + 1 && !v.pass; attempt++) {
    console.log(`[CV Gen] ${label} issues: ${v.issues.join("; ")}`);
    const fixPrompt = fixPromptFn(result, v, attempt);
    result = await callAI(fixPrompt);
    v = validateFn(result);
    console.log(`[CV Gen] ${label} attempt ${attempt}: est ${Math.round(v.estimatedPx)}px / ${v.containerPx}px → ${v.pass ? "PASS" : "FAIL"}`);
  }

  if (!v.pass) {
    console.log(`[CV Gen] ${label} hard-trimming as last resort`);
    result = hardTrim(label, result, v);
  }

  console.log(`[CV Gen] ${label} ✓ DONE`);
  return result;
}

// Smart trim: cut text at natural boundary, remove trailing prepositions, add period
function smartTrimBullet(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let cut = text.substring(0, maxLen);
  const lastComma = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(";"));
  const lastSpace = cut.lastIndexOf(" ");
  if (lastComma > cut.length * 0.5) {
    cut = cut.substring(0, lastComma);
  } else if (lastSpace > cut.length * 0.5) {
    cut = cut.substring(0, lastSpace);
  }
  // Remove trailing prepositions/articles/conjunctions
  cut = cut.replace(/\s+(in|on|at|by|to|for|of|the|a|an|and|or|with|from|through|into|over|across|between|among|within|during|about|under|upon|after|before|against|throughout|toward|towards|via|per)\s*$/i, "");
  // Remove dangling "and/or + single word" patterns (e.g. "and reduced", "or evaluations")
  cut = cut.replace(/\s+(and|or)\s+\S+\s*$/i, "");
  // Clean trailing punctuation fragments
  cut = cut.replace(/[,;:\s]+$/, "");
  if (!/[.!?]$/.test(cut)) cut += ".";
  return cut;
}

// Hard-trim: programmatically cut content to fit
function hardTrim(label: string, data: any, v: PxValidation): any {
  const d = { ...data };
  const ratio = v.containerPx / Math.max(1, v.estimatedPx); // e.g. 0.8 means we need 80% of current

  if (d.summary) {
    const words = d.summary.split(" ");
    const keep = Math.floor(words.length * ratio) - 2;
    let trimmed = words.slice(0, Math.max(10, keep)).join(" ");
    // Ensure text ends with proper punctuation — find last sentence boundary
    const lastPeriod = Math.max(trimmed.lastIndexOf("."), trimmed.lastIndexOf("!"), trimmed.lastIndexOf("?"));
    if (lastPeriod > trimmed.length * 0.5) {
      trimmed = trimmed.substring(0, lastPeriod + 1);
    } else {
      trimmed = trimmed.replace(/[,;:\s]+$/, "") + ".";
    }
    d.summary = trimmed;
  }
  if (d.skills) {
    const keep = Math.floor(d.skills.length * ratio);
    d.skills = d.skills.slice(0, Math.max(3, keep));
  }
  if (d.experiences) {
    d.experiences = d.experiences.map((e: any) => {
      const bullets = (e.description || "").split("\n").filter((l: string) => l.trim());
      const keepB = Math.max(1, Math.floor(bullets.length * ratio));
      const trimmed = bullets.slice(0, keepB).map((b: string) => {
        const targetLen = Math.max(40, Math.floor(b.length * ratio));
        return smartTrimBullet(b, targetLen);
      });
      return { ...e, description: trimmed.join("\n") };
    });
  }
  if (d.keyAchievements) {
    const keep = Math.max(2, Math.floor(d.keyAchievements.length * ratio));
    d.keyAchievements = d.keyAchievements.slice(0, keep).map((a: string) => {
      const targetLen = Math.max(40, Math.floor(a.length * ratio));
      return smartTrimBullet(a, targetLen);
    });
  }
  if (d.education) {
    d.education = d.education.map((e: any) => {
      if (e.description) {
        const w = (e.description || "").split(" ");
        return { ...e, description: w.slice(0, Math.max(3, Math.floor(w.length * ratio))).join(" ") };
      }
      return e;
    });
    if (d.education.length > 2) d.education = d.education.slice(0, -1);
  }
  return d;
}

// ═══════════════════════════════════════════════
// SECTION-SPECIFIC PROMPTS
// Each section gets a unique prompt with its exact container dimensions
// ═══════════════════════════════════════════════

function headerPrompt(cvData: any, tr: string, jd: string): string {
  const pi = cvData.personalInfo || cvData;
  return `You are an expert CV headline writer.

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CANDIDATE: ${pi.fullName || pi.name || ""}, ${pi.headline || pi.jobTitle || ""}
CAREER: ${expSummary(cvData)}

Write:
- headline: Professional title, max 8 words (e.g. "Senior Financial Analyst | CFA Charterholder")
- tagline: 8-12 word value proposition

Return ONLY JSON: { "headline": "", "tagline": "" }`;
}

function summaryPrompt(cvData: any, tr: string, jd: string, c: ContainerSpec, summaryLength?: string, pageLogic?: string): string {
  const allSkills = (cvData.skills || []).map((s: any) => s.name || s).join(", ");
  const allEdu = (cvData.education || []).map((e: any) => `${e.degree || ""} (${e.institution || ""})`).join(", ");

  // Adjust word count based on summary length setting from density controller
  let targetWords = c.maxWords;
  if (summaryLength === "short") {
    targetWords = Math.min(c.maxWords, Math.floor(c.maxWords * 0.6));
  } else if (summaryLength === "long") {
    targetWords = c.maxWords; // use full container
  } else {
    targetWords = Math.floor(c.maxWords * 0.85); // medium — slight breathing room
  }

  return `You are an expert CV summary writer.

═══ CONTAINER SPECIFICATION ═══
This text goes inside a FIXED container: ${c.heightPx}px tall, ${c.widthPx}px wide.
After the section heading, you have ${c.contentPx}px of space.
At ${FONT_PX}px font with ${LINE_H} line-height, that's ${c.maxLines} lines max.
At ~${wordsPerLine(c.widthPx)} words per line, write EXACTLY ${targetWords} words or fewer.
Font: 10.5px sans-serif on A4 page.
Summary length mode: ${summaryLength || "medium"}
═══════════════════════════════

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CANDIDATE:
- Title: ${cvData.personalInfo?.headline || ""}
- Experience: ${expSummary(cvData)}
- Skills: ${allSkills}
- Education: ${allEdu}
- Certs: ${(cvData.certifications || []).map((c: any) => c.name || c).join(", ")}

Write a professional summary of EXACTLY ${targetWords} words (±3 words). Rules:
- Open with years of experience and core expertise
- Include 1-2 quantified achievements from real data
- End with career objective for the target role
- Third person only (no "I"/"my")
- Strong language: "Results-driven", "Proven track record"${summaryLength === "long" ? "\n- Include broader career narrative and key differentiators" : ""}${pageLogic ? `\n- PAGE STRATEGY: ${pageLogic}` : ""}
- COUNT YOUR WORDS. Must be ${targetWords} ±3.

Return ONLY JSON: { "summary": "" }`;
}

function skillsPrompt(cvData: any, tr: string, jd: string, c: ContainerSpec): string {
  const existing = (cvData.skills || []).map((s: any) => `${s.name || s}${s.category ? ` [${s.category}]` : ""}`).join(", ");
  const tagsPerRow = Math.floor(c.widthPx / 85);
  const maxRows = Math.floor(c.contentPx / 26);
  const maxSkills = tagsPerRow * maxRows;

  return `You are an expert CV skills curator.

═══ CONTAINER SPECIFICATION ═══
Container: ${c.heightPx}px tall, ${c.widthPx}px wide.
Skills render as inline tags (~80px each).
Fits ${tagsPerRow} tags per row, ${maxRows} rows.
HARD LIMIT: ${maxSkills} skills maximum.
═══════════════════════════════

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
ALL SKILLS: ${existing}
EXPERIENCE: ${expSummary(cvData)}
TOOLS: ${(cvData.tools || []).join(", ")}

Return EXACTLY ${maxSkills} or fewer skills. Rules:
- Omit clearly generic or irrelevant skills (e.g. "teamwork", "communication") that obviously don't match the candidate's profession — if unsure, keep them
- Merge related items (e.g. "MS Office Suite" not individual apps)
- Supplement with industry-standard skills inferred from the candidate's experience if needed — inferring field-relevant skills is expected
- Organize into 2-4 categories: Technical, Leadership, Domain, Industry, etc.
- Each skill name: 1-4 words max
- COUNT: must be ≤ ${maxSkills} items total

Return ONLY JSON: { "skills": [{ "name": "", "category": "" }] }`;
}

function experiencePrompt(cvData: any, tr: string, jd: string, c: ContainerSpec, starFormat?: string, starGuidance?: string, maxBulletsOverride?: number, bulletWordOverride?: number, pageLogic?: string): string {
  const rawExps = cvData.experiences || cvData.experience || [];
  const jobCount = rawExps.length;
  const bulletW = c.widthPx - BULLET_INDENT;
  const bulletWPL = bulletWordOverride || Math.floor(bulletW / (FONT_PX * 0.52) / 6);
  const entryOverhead = 16 + 14 + ENTRY_GAP_PX; // ~36px per job header

  // Profile-driven: divide container evenly across ALL actual jobs
  const pxPerJob = jobCount > 0 ? Math.floor(c.contentPx / jobCount) : c.contentPx;
  const bulletsPerJob = maxBulletsOverride || Math.max(2, Math.floor((pxPerJob - entryOverhead) / LINE_PX));

  // Per-job analysis: tell AI exactly how many bullets each job needs
  const jobAnalysis = rawExps.map((e: any, i: number) => {
    const desc = e.description || "";
    const curBullets = desc.split("\n").filter((l: string) => l.trim()).length;
    const diff = bulletsPerJob - curBullets;
    const title = e.title || e.jobTitle || "Untitled";
    if (diff > 1) return `${i + 1}. "${title}" at ${e.company || ""}: has ${curBullets} bullets → EXPAND to ${bulletsPerJob} (add ${diff} more)`;
    if (diff < -1) return `${i + 1}. "${title}" at ${e.company || ""}: has ${curBullets} bullets → CONDENSE to ${bulletsPerJob}`;
    return `${i + 1}. "${title}" at ${e.company || ""}: has ${curBullets} bullets → TARGET ${bulletsPerJob}`;
  }).join("\n");

  // STAR method guidance
  const starBlock = starGuidance
    ? `
═══ STAR METHOD FORMAT ═══
Format: ${starFormat || "star-condensed"}
${starGuidance}
Every bullet MUST follow this STAR structure.
═══════════════════════════
`
    : `
═══ BULLET FORMAT ═══
Use the STAR method (Situation, Task, Action, Result) in each bullet:
- Condensed STAR: ACTION VERB + context/situation + measurable result
- Example: "Spearheaded procurement redesign across 3 departments, cutting operational costs by $1.2M annually."
- Each bullet must contain a quantified result or measurable outcome.
═══════════════════════════
`;

  const pageBlock = pageLogic ? `\n═══ PAGE STRATEGY ═══\n${pageLogic}\n═══════════════════════════\n` : "";

  return `You are an expert CV experience writer using the STAR method (Situation, Task, Action, Result). Rewrite ALL positions to perfectly fill the space.
${pageBlock}
═══ CONTAINER: ${c.contentPx}px available ═══
- ${jobCount} positions in profile × ~${bulletsPerJob} bullets each × ${bulletWPL} words per bullet
- Each bullet line: ~${Math.round(LINE_PX)}px
${starBlock}
PER-JOB PLAN:
${jobAnalysis}

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}

ALL POSITIONS (${jobCount}):
${JSON.stringify(rawExps, null, 2)}

RULES:
1. Return ALL ${jobCount} positions — do NOT drop or merge any roles
2. Each position gets ${bulletsPerJob} bullet points as planned above
3. Each bullet: "• " + STAR-formatted achievement in ${bulletWPL} words max
4. Keep title, company, location, dates EXACTLY as provided
5. When expanding: add STAR context about situation, scope, actions taken, and measurable results
6. When condensing: keep strongest STAR achievements, merge similar points
7. NEVER fabricate — enhance existing details with STAR framing only
8. Order by date (recent first)
9. Every bullet MUST include a quantified result (%, $, time saved, team size, etc.)

Return ONLY JSON: { "experiences": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "" }] }`;
}

function achievementsPrompt(cvData: any, tr: string, jd: string, c: ContainerSpec): string {
  const existing = (cvData.keyAchievements || []).join("\n");
  const maxItems = Math.max(2, Math.floor(c.contentPx / (LINE_PX + 4)));
  const maxWordsPerItem = wordsPerLine(c.widthPx);

  return `You are an expert CV achievement writer.

═══ CONTAINER SPECIFICATION ═══
Container: ${c.heightPx}px tall, ${c.widthPx}px wide.
After heading: ${c.contentPx}px available.
Each achievement: ~${Math.round(LINE_PX + 4)}px (one line + spacing).
CALCULATED LIMITS:
- EXACTLY ${maxItems} achievements
- Each achievement: max ${maxWordsPerItem} words (must fit on ONE line)
═══════════════════════════════

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CAREER: ${expSummary(cvData)}
EXISTING: ${existing || "None"}

Write EXACTLY ${maxItems} achievements. Each:
- ONE line, max ${maxWordsPerItem} words
- Must include a quantified result
- Use past tense action verbs
- Only facts from data

Return ONLY JSON: { "keyAchievements": [""] }`;
}

function educationPrompt(cvData: any, c: ContainerSpec): string {
  const rawEdu = cvData.education || [];
  const entryPx = 16 + 14 + LINE_PX + ENTRY_GAP_PX; // degree + inst + 1-line desc + gap
  const maxEntries = Math.max(1, Math.floor(c.contentPx / entryPx));
  const descWords = Math.floor(wordsPerLine(c.widthPx) * 0.8); // keep description to ~1 line

  return `You are an expert CV education writer.

═══ CONTAINER SPECIFICATION ═══
Container: ${c.heightPx}px tall, ${c.widthPx}px wide.
After heading: ${c.contentPx}px available.
Each entry: ~${Math.round(entryPx)}px (degree + institution + 1-line description).
CALCULATED LIMITS:
- Maximum ${maxEntries} entries
- Each description: max ${descWords} words (ONE short line)
═══════════════════════════════

ALL EDUCATION (${rawEdu.length} entries):
${JSON.stringify(rawEdu, null, 2)}

Write ${Math.min(rawEdu.length, maxEntries)} entries. Rules:
- If ${rawEdu.length} > ${maxEntries}: merge same-institution degrees
- Keep degree, institution, year EXACTLY as provided
- Description: ${descWords} words max. Brief: honors, GPA, or key coursework.
- Order by year (recent first)

Return ONLY JSON: { "education": [{ "degree": "", "institution": "", "year": "", "description": "" }] }`;
}

function additionalPrompt(cvData: any, tr: string, jd: string): string {
  const expCtx = (cvData.experiences || cvData.experience || []).slice(0, 4)
    .map((e: any) => `${e.title || ""} at ${e.company || ""}`)
    .join(", ");
  return `You are an expert CV writer. Curate additional information.

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CANDIDATE EXPERIENCE: ${expCtx || "Not provided"}

RAW DATA:
- Languages: ${JSON.stringify(cvData.languages || [])}
- Tools: ${JSON.stringify(cvData.tools || [])}
- Memberships: ${JSON.stringify(cvData.memberships || [])}
- Volunteer: ${JSON.stringify(cvData.volunteer || [])}
- Projects: ${JSON.stringify(cvData.projects || [])}
- Interests: ${JSON.stringify(cvData.interests || [])}
- Certifications: ${JSON.stringify(cvData.certifications || [])}

Rules:
- Keep all provided items unless they are clearly and obviously unrelated to the candidate's field — if unsure, keep them
- For tools: if the list has fewer than 4 items, supplement with specific industry-standard software inferred from the candidate's experience and target role
- Tools added must be concrete named software/platforms (e.g. "Figma", "Jira", "Tableau") — never generic descriptors
- Group tools by type where helpful. Keep languages as-is. Order by relevance. Empty arrays for missing categories.

Return ONLY JSON:
{ "languages": [{"name":"","proficiency":""}], "tools": [""], "memberships": [""], "volunteer": [""], "projects": [{"name":"","description":"","tech":""}], "interests": [""] }`;
}

// ═══════════════════════════════════════════════
// PLAIN TEXT PROMPTS — no pixel constraints, rich detailed output
// ═══════════════════════════════════════════════

function plainSummaryPrompt(cvData: any, tr: string, jd: string, pageStrategy: string): string {
  const allSkills = (cvData.skills || []).map((s: any) => s.name || s).join(", ");
  const allEdu = (cvData.education || []).map((e: any) => `${e.degree || ""} (${e.institution || ""})`).join(", ");
  const yearsExp = (() => {
    const exps = cvData.experiences || [];
    if (!exps.length) return "multiple";
    const earliest = exps.reduce((min: number, e: any) => {
      const y = parseInt((e.startDate || "").replace(/\D/g, "").slice(0, 4));
      return y && y < min ? y : min;
    }, 9999);
    return earliest < 9999 ? `${new Date().getFullYear() - earliest}+` : "multiple";
  })();

  return `You are an expert CV summary writer.

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CANDIDATE:
- Name: ${cvData.personalInfo?.fullName || ""}
- Title: ${cvData.personalInfo?.headline || ""}
- Years: ${yearsExp} years of experience
- Career: ${expSummary(cvData)}
- Skills: ${allSkills}
- Education: ${allEdu}
- Certifications: ${(cvData.certifications || []).map((c: any) => c.name || c).join(", ")}
${pageStrategy ? `\nPAGE STRATEGY: ${pageStrategy}` : ""}

Write a POWERFUL professional summary of 50-80 words (3-4 sentences). Rules:
1. First sentence: Years of experience + core expertise area + professional designation (e.g. CPA)
2. Second sentence: 2-3 specific quantified achievements from real career data (use %, $, numbers)
3. Third sentence: Key competencies and what differentiates this candidate
4. Optional fourth sentence: Career objective aligned to target role
- Third person only (no "I"/"my")
- Strong action language: "Results-driven", "Proven track record", "Spearheaded"
- MUST include at least 2 specific numbers/metrics from the candidate's actual experience
- Do NOT be vague — every claim must reference real data

Return ONLY JSON: { "summary": "" }`;
}

function plainExperiencePrompt(cvData: any, tr: string, jd: string, starFormat: string, starGuidance: string, bulletsPerJob: number, bulletWords: number, pageStrategy: string): string {
  const rawExps = cvData.experiences || cvData.experience || [];
  const jobCount = rawExps.length;

  const jobAnalysis = rawExps.map((e: any, i: number) => {
    const desc = e.description || "";
    const curBullets = desc.split("\n").filter((l: string) => l.trim()).length;
    const title = e.title || e.jobTitle || "Untitled";
    return `${i + 1}. "${title}" at ${e.company || ""} (${e.startDate} – ${e.endDate}): currently ${curBullets} bullets → generate ${bulletsPerJob} STAR bullets`;
  }).join("\n");

  const starBlock = starGuidance
    ? `
═══ STAR METHOD FORMAT ═══
Format: ${starFormat}
${starGuidance}
Every bullet MUST follow this STAR structure.
═══════════════════════════
`
    : `
═══ BULLET FORMAT ═══
Use the STAR method (Situation, Task, Action, Result) in each bullet:
- Each bullet: ACTION VERB + context/situation + specific action taken + measurable result
- Example: "Spearheaded procurement redesign across 3 departments, analyzing vendor contracts and renegotiating terms, cutting operational costs by $1.2M annually."
- Each bullet should be 20-30 words with rich detail
- Each bullet MUST contain a quantified result (%, $, time saved, team size, etc.)
═══════════════════════════
`;

  return `You are an expert CV experience writer using the STAR method (Situation, Task, Action, Result).
${pageStrategy ? `\nPAGE STRATEGY: ${pageStrategy}` : ""}
${starBlock}
PER-JOB PLAN:
${jobAnalysis}

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}

ALL POSITIONS (${jobCount}):
${JSON.stringify(rawExps, null, 2)}

RULES:
1. Return ALL ${jobCount} positions — do NOT drop or merge any roles
2. Each position gets EXACTLY ${bulletsPerJob} bullet points
3. Each bullet: "• " + STAR-formatted achievement in 20-30 words
4. Keep title, company, location, dates EXACTLY as provided
5. EXPAND every bullet with specific detail: what was the situation, what action was taken, what was the measurable result
6. NEVER write vague bullets like "Saved $500K annually" — add HOW and CONTEXT: "Saved $500K annually by renegotiating supplier contracts across 12 vendors and implementing automated procurement workflows"
7. NEVER fabricate data — enhance existing details with STAR framing and plausible specifics based on the role
8. Order by date (recent first)
9. Every bullet MUST include a quantified result (%, $, time saved, team size, etc.)
10. Bullets should be COMPLETE sentences — never truncated or cut off

Return ONLY JSON: { "experiences": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "" }] }`;
}

function plainSkillsPrompt(cvData: any, tr: string, jd: string): string {
  const existing = (cvData.skills || []).map((s: any) => `${s.name || s}${s.category ? ` [${s.category}]` : ""}`).join(", ");

  return `You are an expert CV skills curator.

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
ALL SKILLS: ${existing}
EXPERIENCE: ${expSummary(cvData)}
TOOLS: ${(cvData.tools || []).join(", ")}

Return 10-20 skills organized into 2-4 categories (e.g. Core, Technical, Leadership, Tools). Rules:
- Include all relevant skills by merging related ones (e.g. "MS Office Suite" not individual apps)
- Each skill name: 1-4 words max
- Never fabricate — only rephrase/merge existing skills
- Categories should be meaningful and relevant to the target role

Return ONLY JSON: { "skills": [{ "name": "", "category": "" }] }`;
}

function plainAchievementsPrompt(cvData: any, tr: string, jd: string): string {
  const existing = (cvData.keyAchievements || []).join("\n");

  return `You are an expert CV achievement writer.

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CAREER: ${expSummary(cvData)}
EXISTING ACHIEVEMENTS: ${existing || "None — derive from experience data"}

Write 3-5 KEY achievements. Each achievement should be:
- A complete sentence of 15-25 words
- Include a specific quantified result (%, $, time, team size)
- Use past tense action verbs (Increased, Streamlined, Achieved, Delivered)
- Draw from REAL career data — do not fabricate
- Each should highlight a DIFFERENT aspect of the candidate's career
- More detailed than a bullet point — provide context and impact

Return ONLY JSON: { "keyAchievements": [""] }`;
}

function plainEducationPrompt(cvData: any): string {
  const rawEdu = cvData.education || [];

  return `You are an expert CV education writer.

ALL EDUCATION (${rawEdu.length} entries):
${JSON.stringify(rawEdu, null, 2)}

Write all ${rawEdu.length} education entries. Rules:
- Keep degree, institution, year EXACTLY as provided
- Description: Brief note — honors, GPA, relevant coursework, or thesis topic (5-15 words)
- Order by year (recent first)
- Do NOT omit any entries

Return ONLY JSON: { "education": [{ "degree": "", "institution": "", "year": "", "description": "" }] }`;
}

// ═══════════════════════════════════════════════
// FIX PROMPTS — tell AI exactly what's wrong with pixel measurements
// ═══════════════════════════════════════════════

function fixSummaryPrompt(data: any, v: PxValidation, c: ContainerSpec): string {
  return `CONTAINER OVERFLOW: Your summary is ${Math.round(v.estimatedPx)}px but the container only has ${v.containerPx}px.

CURRENT TEXT (${wordCount(data.summary)} words): "${data.summary}"
PROBLEMS: ${v.issues.join("; ")}
STRICT LIMIT: ${c.maxWords} words. Container is ${c.contentPx}px tall at ${FONT_PX}px font.

Rewrite to EXACTLY ${c.maxWords - 3} words. Remove filler. Keep meaning. Count carefully.

Return ONLY JSON: { "summary": "" }`;
}

function fixSkillsPrompt(data: any, v: PxValidation, c: ContainerSpec): string {
  const tagsPerRow = Math.floor(c.widthPx / 85);
  const maxRows = Math.floor(c.contentPx / 26);
  const maxSkills = tagsPerRow * maxRows;
  return `CONTAINER OVERFLOW: ${(data.skills||[]).length} skills = ${Math.round(v.estimatedPx)}px but container has ${v.containerPx}px.

CURRENT: ${JSON.stringify(data.skills)}
HARD LIMIT: ${maxSkills} skills. Merge aggressively.

Return ONLY JSON: { "skills": [{ "name": "", "category": "" }] }`;
}

function fixExperiencePrompt(data: any, v: PxValidation, c: ContainerSpec): string {
  const exps = data.experiences || [];
  const jobCount = exps.length;
  const entryOverhead = 36;
  const pxPerJob = jobCount > 0 ? Math.floor(c.contentPx / jobCount) : c.contentPx;
  const bulletsPerJob = Math.max(1, Math.floor((pxPerJob - entryOverhead) / LINE_PX));
  const bulletWPL = Math.floor((c.widthPx - BULLET_INDENT) / (FONT_PX * 0.52) / 6);

  return `CONTAINER OVERFLOW: experience is ${Math.round(v.estimatedPx)}px but container has ${v.containerPx}px.

CURRENT: ${JSON.stringify(exps)}
PROBLEMS: ${v.issues.join("; ")}
KEEP all ${jobCount} positions but REDUCE to ${bulletsPerJob} bullets each, ${bulletWPL} words/bullet max.
Shorten bullets. Each bullet = "• " + text.

Return ONLY JSON: { "experiences": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "" }] }`;
}

function fixAchievementsPrompt(data: any, v: PxValidation, c: ContainerSpec): string {
  const maxItems = Math.max(2, Math.floor(c.contentPx / (LINE_PX + 4)));
  return `CONTAINER OVERFLOW: achievements est ${Math.round(v.estimatedPx)}px, container has ${v.containerPx}px.

CURRENT: ${JSON.stringify(data.keyAchievements)}
STRICT: ${maxItems} items, ${wordsPerLine(c.widthPx)} words each max.

Return ONLY JSON: { "keyAchievements": [""] }`;
}

function fixEducationPrompt(data: any, v: PxValidation, c: ContainerSpec): string {
  const entryPx = 16 + 14 + LINE_PX + ENTRY_GAP_PX;
  const maxEntries = Math.max(1, Math.floor(c.contentPx / entryPx));
  const descWords = Math.floor(wordsPerLine(c.widthPx) * 0.8);
  return `CONTAINER OVERFLOW: education est ${Math.round(v.estimatedPx)}px, container has ${v.containerPx}px.

CURRENT: ${JSON.stringify(data.education)}
STRICT: ${maxEntries} entries, descriptions ${descWords} words max.

Return ONLY JSON: { "education": [{ "degree": "", "institution": "", "year": "", "description": "" }] }`;
}

// ═══════════════════════════════════════════════
// MAIN ROUTE — Sequential: generate → validate px → fix → next section
// ═══════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const { cvData, templateType, targetRole, jobDescription, layout, sidebarWidthPercent, headerStyle, density, renderSettings, starConstraints, pageLogic, plainText } = await req.json();
    if (!cvData) return NextResponse.json({ error: "CV data is required" }, { status: 400 });

    // Set font metrics for this template's density BEFORE computing containers
    setDensity(density || "compact");

    // Extract STAR method and render settings from density controller
    const starFormat = starConstraints?.bulletFormat || "star-condensed";
    const starGuidance = starConstraints?.starGuidance || "";
    const maxBulletsPerJob = starConstraints?.maxBulletsPerJob || renderSettings?.maxBulletsPerJob;
    const bulletWordTarget = starConstraints?.bulletWordTarget || renderSettings?.bulletWordTarget;
    const summaryLength = renderSettings?.showSummary || "medium";
    const pageStrategy = pageLogic || "";

    const containers = calculateContainers(
      cvData, templateType || "one-page", layout || "single-column",
      sidebarWidthPercent || 0, headerStyle || "banner", density || "compact",
    );
    console.log("[CV Gen] Layout:", layout, "Header:", headerStyle, "Density:", density, "Sidebar:", sidebarWidthPercent);
    console.log("[CV Gen] Containers:", Object.fromEntries(Object.entries(containers).map(([k, v]) => [k, `${v.widthPx}w×${v.contentPx}h px, ${v.maxWords}w`])));
    const tr = targetRole || "";
    const jd = jobDescription || "";
    const sectionStatus: Record<string, string> = {};
    const log: string[] = [];

    // ─── 1. HEADER ───
    let h: any = {};
    try {
      h = await callAI(headerPrompt(cvData, tr, jd));
      // Simple word check for header
      if (h.headline && wordCount(h.headline) > 10) {
        h = await callAI(`Shorten this headline to max 8 words: "${h.headline}". Return JSON: { "headline": "", "tagline": "${h.tagline || ""}" }`);
      }
      sectionStatus.header = "fulfilled";
      log.push("Header ✓");
    } catch (e) { sectionStatus.header = "rejected"; log.push("Header ✗"); }

    // ─── Section generation (plain text vs pixel-based) ───
    let s: any = {};
    let sk: any = {};
    let ex: any = {};
    let ac: any = {};
    let ed: any = {};
    let ad: any = {};

    if (plainText) {
      // ═══ PLAIN TEXT MODE — no pixel constraints, rich detailed output ═══
      console.log("[CV Gen] PLAIN TEXT mode — skipping pixel validation & enforcement");

      // 2. SUMMARY
      try {
        s = await callAI(plainSummaryPrompt(cvData, tr, jd, pageStrategy));
        sectionStatus.summary = "fulfilled";
        log.push(`Summary ✓ (${wordCount(s.summary || "")} words)`);
      } catch (e) { sectionStatus.summary = "rejected"; log.push("Summary ✗"); }

      // 3. SKILLS
      try {
        sk = await callAI(plainSkillsPrompt(cvData, tr, jd));
        sectionStatus.skills = "fulfilled";
        log.push(`Skills ✓ (${(sk.skills||[]).length} items)`);
      } catch (e) { sectionStatus.skills = "rejected"; log.push("Skills ✗"); }

      // 4. EXPERIENCE
      try {
        ex = await callAI(plainExperiencePrompt(cvData, tr, jd, starFormat, starGuidance, maxBulletsPerJob, bulletWordTarget, pageStrategy));
        sectionStatus.experience = "fulfilled";
        const totalBullets = (ex.experiences || []).reduce((sum: number, e: any) => sum + ((e.description || "").split("\n").filter((l: string) => l.trim()).length), 0);
        log.push(`Experience ✓ (${(ex.experiences||[]).length} jobs, ${totalBullets} total bullets)`);
      } catch (e) { sectionStatus.experience = "rejected"; log.push("Experience ✗"); }

      // 5. ACHIEVEMENTS
      try {
        ac = await callAI(plainAchievementsPrompt(cvData, tr, jd));
        sectionStatus.achievements = "fulfilled";
        log.push(`Achievements ✓ (${(ac.keyAchievements||[]).length} items)`);
      } catch (e) { sectionStatus.achievements = "rejected"; log.push("Achievements ✗"); }

      // 6. EDUCATION
      try {
        ed = await callAI(plainEducationPrompt(cvData));
        sectionStatus.education = "fulfilled";
        log.push(`Education ✓ (${(ed.education||[]).length} entries)`);
      } catch (e) { sectionStatus.education = "rejected"; log.push("Education ✗"); }

      // 7. ADDITIONAL
      try {
        ad = await callAI(additionalPrompt(cvData, tr, jd));
        sectionStatus.additional = "fulfilled";
        log.push("Additional ✓");
      } catch (e) { sectionStatus.additional = "rejected"; log.push("Additional ✗"); }

      // No enforcement needed for plain text — AI output is used as-is

    } else {
      // ═══ PIXEL-BASED MODE — container-constrained for engine layout ═══

      // 2. SUMMARY
      if (containers.summary) {
        const c = containers.summary;
        try {
          s = await generateSection("Summary",
            summaryPrompt(cvData, tr, jd, c, summaryLength, pageStrategy),
            (data) => validateSummaryPx(data, c),
            (data, v) => fixSummaryPrompt(data, v, c),
          );
          sectionStatus.summary = "fulfilled";
          log.push(`Summary ✓ (${Math.round(validateSummaryPx(s, c).estimatedPx)}/${c.contentPx}px)`);
        } catch (e) { sectionStatus.summary = "rejected"; log.push("Summary ✗"); }
      }

      // 3. SKILLS
      if (containers.skills) {
        const c = containers.skills;
        try {
          sk = await generateSection("Skills",
            skillsPrompt(cvData, tr, jd, c),
            (data) => validateSkillsPx(data, c),
            (data, v) => fixSkillsPrompt(data, v, c),
          );
          sectionStatus.skills = "fulfilled";
          log.push(`Skills ✓ (${(sk.skills||[]).length} items, ${Math.round(validateSkillsPx(sk, c).estimatedPx)}/${c.contentPx}px)`);
        } catch (e) { sectionStatus.skills = "rejected"; log.push("Skills ✗"); }
      }

      // 4. EXPERIENCE
      if (containers.experience) {
        const c = containers.experience;
        try {
          ex = await generateSection("Experience",
            experiencePrompt(cvData, tr, jd, c, starFormat, starGuidance, maxBulletsPerJob, bulletWordTarget, pageStrategy),
            (data) => validateExperiencePx(data, c),
            (data, v) => fixExperiencePrompt(data, v, c),
          );
          sectionStatus.experience = "fulfilled";
          log.push(`Experience ✓ (${(ex.experiences||[]).length} jobs, ${Math.round(validateExperiencePx(ex, c).estimatedPx)}/${c.contentPx}px)`);
        } catch (e) { sectionStatus.experience = "rejected"; log.push("Experience ✗"); }
      }

      // 5. ACHIEVEMENTS
      if (containers.achievements) {
        const c = containers.achievements;
        try {
          ac = await generateSection("Achievements",
            achievementsPrompt(cvData, tr, jd, c),
            (data) => validateAchievementsPx(data, c),
            (data, v) => fixAchievementsPrompt(data, v, c),
          );
          sectionStatus.achievements = "fulfilled";
          log.push(`Achievements ✓ (${(ac.keyAchievements||[]).length} items, ${Math.round(validateAchievementsPx(ac, c).estimatedPx)}/${c.contentPx}px)`);
        } catch (e) { sectionStatus.achievements = "rejected"; log.push("Achievements ✗"); }
      }

      // 6. EDUCATION
      if (containers.education) {
        const c = containers.education;
        try {
          ed = await generateSection("Education",
            educationPrompt(cvData, c),
            (data) => validateEducationPx(data, c),
            (data, v) => fixEducationPrompt(data, v, c),
          );
          sectionStatus.education = "fulfilled";
          log.push(`Education ✓ (${(ed.education||[]).length} entries, ${Math.round(validateEducationPx(ed, c).estimatedPx)}/${c.contentPx}px)`);
        } catch (e) { sectionStatus.education = "rejected"; log.push("Education ✗"); }
      }

      // 7. ADDITIONAL
      try {
        ad = await callAI(additionalPrompt(cvData, tr, jd));
        sectionStatus.additional = "fulfilled";
        log.push("Additional ✓");
      } catch (e) { sectionStatus.additional = "rejected"; log.push("Additional ✗"); }

      // ─── ENFORCE CONTAINER LIMITS (pixel mode only) ───
      if (s.summary && containers.summary) {
        const maxW = containers.summary.maxWords;
        if (wordCount(s.summary) > maxW) {
          const words = s.summary.split(" ").slice(0, maxW);
          let trimmed = words.join(" ");
          const lp = Math.max(trimmed.lastIndexOf("."), trimmed.lastIndexOf("!"), trimmed.lastIndexOf("?"));
          s.summary = lp > trimmed.length * 0.5 ? trimmed.substring(0, lp + 1) : trimmed.replace(/[,;:\s]+$/, "") + ".";
          log.push(`Summary enforced: trimmed to ${wordCount(s.summary)}/${maxW} words`);
        }
      }

      if (ex.experiences && containers.experience) {
        const c = containers.experience;
        const bulletW = c.widthPx - BULLET_INDENT;
        const maxCharsPerBullet = Math.floor(bulletW / CHAR_W);
        const entryOverhead = 16 + 14 + ENTRY_GAP_PX;
        const pxPerJob = Math.floor(c.contentPx / Math.max(1, ex.experiences.length));
        const enforcedBullets = Math.max(1, Math.floor((pxPerJob - entryOverhead) / LINE_PX));

        ex.experiences = ex.experiences.map((e: any) => {
          const bullets = (e.description || "").split("\n").filter((l: string) => l.trim());
          const kept = bullets.slice(0, enforcedBullets).map((b: string) => {
            if (b.length > maxCharsPerBullet) return smartTrimBullet(b, maxCharsPerBullet);
            return b;
          });
          return { ...e, description: kept.join("\n") };
        });
        log.push(`Experience enforced: ${ex.experiences.length} jobs × ${enforcedBullets} bullets, max ${maxCharsPerBullet} chars/bullet`);
      }

      if (ac.keyAchievements && containers.achievements) {
        const c = containers.achievements;
        const maxItems = Math.max(2, Math.floor(c.contentPx / (LINE_PX + 4)));
        ac.keyAchievements = (ac.keyAchievements || []).slice(0, maxItems).map((a: string) => {
          const maxC = Math.floor((c.widthPx - BULLET_INDENT) / CHAR_W);
          if (a.length > maxC) return smartTrimBullet(a, maxC);
          return a;
        });
        log.push(`Achievements enforced: ${ac.keyAchievements.length}/${maxItems} items`);
      }
    }

    // ─── Assemble final CV ───
    const pi = cvData.personalInfo || {};
    const generatedCV = {
      personalInfo: {
        fullName: pi.fullName || pi.name || "",
        email: pi.email || "",
        phone: pi.phone || "",
        location: pi.location || "",
        linkedin: pi.linkedin || "",
        website: pi.website || "",
        headline: h.headline || pi.headline || "",
        tagline: h.tagline || pi.tagline || "",
      },
      summary: s.summary || cvData.summary || "",
      skills: sk.skills || cvData.skills || [],
      experiences: ex.experiences || cvData.experiences || [],
      keyAchievements: ac.keyAchievements || cvData.keyAchievements || [],
      education: ed.education || cvData.education || [],
      certifications: cvData.certifications || [],
      languages: ad.languages || cvData.languages || [],
      tools: ad.tools || cvData.tools || [],
      memberships: ad.memberships || cvData.memberships || [],
      volunteer: ad.volunteer || cvData.volunteer || [],
      projects: ad.projects || cvData.projects || [],
      interests: ad.interests || cvData.interests || [],
      referees: cvData.referees || [],
      declaration: cvData.declaration || { declaration: "", place: "", date: "" },
      internships: cvData.internships || [],
      boardRoles: cvData.boardRoles || [],
      executiveTraining: cvData.executiveTraining || [],
      publications: cvData.publications || [],
      areasOfExpertise: cvData.areasOfExpertise || [],
    };

    console.log(`[CV Gen] ═══ COMPLETE ═══\n${log.join("\n")}`);
    return NextResponse.json({ generatedCV, sectionStatus, containers, log });
  } catch (err: any) {
    console.error("CV section generation error:", err);
    return NextResponse.json({ error: err.message || "CV generation failed" }, { status: 500 });
  }
}
