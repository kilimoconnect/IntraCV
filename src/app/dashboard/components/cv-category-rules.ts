// ═══════════════════════════════════════════════════════════
// CV CATEGORY RULES — Per-category content limits derived from layout geometry
// ═══════════════════════════════════════════════════════════
// These rules tell the AI exactly how much content to generate for each
// career category so that text fits perfectly within the A4 page budgets
// without overflow, broken sentences, or empty space.
//
// Geometry source: cv-layout-junior/mid-senior/executive.tsx (Variant A baseline)
// Character-width model: Inter @ ~0.52 × fontSize
// ═══════════════════════════════════════════════════════════

import type { CareerCategory } from "./cv-layout-types";

export interface CategorySlotRules {
  header: {
    fullNameMax: number;
    titleMax?: number;
    taglineMaxChars: number;
  };
  contact: { items: number; maxChars: number };
  profile: { minChars: number; maxChars: number };
  skills: { count: number; maxLabelChars: number };
  experience: {
    roles: number;
    role1Bullets: number;
    role2Bullets: number;
    maxRoleChars: number;
    maxCompanyChars: number;
    maxDatesChars: number;
    bulletMinChars: number;
    bulletMaxChars: number;
  };
  education: { entries: number; maxDegreeChars: number; maxSchoolChars: number };
  certifications: { max: number; maxNameChars: number; maxIssuerChars: number };
  history: {
    roles: number;
    bulletsPerRole: number;
    maxRoleChars: number;
    maxCompanyChars: number;
    maxDatesChars: number;
    maxBulletChars: number;
  };
  projects: {
    count: number;
    maxNameChars: number;
    descMinChars: number;
    descMaxChars: number;
    maxTechChars: number;
  };
  awards: { max: number; maxTitleChars: number; maxDescChars: number };
  languages: { max: number; maxNameChars: number; maxLabelChars: number };
  references: { count: number; maxNameChars: number; maxTitleChars: number; maxCompanyChars: number };
  tools: { count: number; maxLabelChars: number };
  achievements: { count: number; minChars: number; maxChars: number };
  boardRoles: { max: number; maxTitleChars: number; maxOrganizationChars: number; maxDatesChars: number; maxDescriptionChars: number };
  executiveTraining: { max: number; maxNameChars: number; maxInstitutionChars: number };
  publications: { max: number; maxTitleChars: number; maxPublisherChars: number; maxTypeChars: number };
  declaration: { maxChars: number };
  volunteer: { max: number; maxChars: number };
  memberships: { max: number };
}

// ═══════════════════════════════════════════════════════════
// JUNIOR — 1 page, single-column body, 722px wide
// ═══════════════════════════════════════════════════════════
// Body budget: 1123 - 144 (banner+contact+gap) - 20 (bottom) ≈ 959px
// Font 9.5px body, cpl ≈ 722 / (9.5×0.52) ≈ 146 chars/line
// Profile: 4 lines max → 4×146 ≈ 584 → target 320-400 chars (comfortable)
// Experience: 1-2 roles, fewer bullets (single page)
// Skills: pill cloud, ~18-22 fit

const JUNIOR_RULES: CategorySlotRules = {
  header:   { fullNameMax: 30, taglineMaxChars: 75 },
  contact:  { items: 5, maxChars: 30 },
  profile:  { minChars: 340, maxChars: 440 },
  skills:   { count: 22, maxLabelChars: 16 },
  experience: {
    roles: 2,
    role1Bullets: 6,
    role2Bullets: 5,
    maxRoleChars: 40,
    maxCompanyChars: 44,
    maxDatesChars: 22,
    bulletMinChars: 80,
    bulletMaxChars: 120,
  },
  education:      { entries: 2, maxDegreeChars: 55, maxSchoolChars: 40 },
  certifications: { max: 5, maxNameChars: 45, maxIssuerChars: 30 },
  history:        { roles: 0, bulletsPerRole: 0, maxRoleChars: 0, maxCompanyChars: 0, maxDatesChars: 0, maxBulletChars: 0 },
  projects:       { count: 2, maxNameChars: 36, descMinChars: 120, descMaxChars: 180, maxTechChars: 50 },
  awards:         { max: 3, maxTitleChars: 36, maxDescChars: 55 },
  languages:      { max: 4, maxNameChars: 16, maxLabelChars: 14 },
  references:     { count: 2, maxNameChars: 30, maxTitleChars: 30, maxCompanyChars: 30 },
  tools:          { count: 0, maxLabelChars: 0 },
  achievements:   { count: 3, minChars: 70, maxChars: 110 },
  boardRoles:     { max: 0, maxTitleChars: 0, maxOrganizationChars: 0, maxDatesChars: 0, maxDescriptionChars: 0 },
  executiveTraining: { max: 0, maxNameChars: 0, maxInstitutionChars: 0 },
  publications:   { max: 0, maxTitleChars: 0, maxPublisherChars: 0, maxTypeChars: 0 },
  declaration:    { maxChars: 200 },
  volunteer:      { max: 3, maxChars: 80 },
  memberships:    { max: 0 },
};

// ═══════════════════════════════════════════════════════════
// MID-SENIOR — 2 pages, sidebar + body
// ═══════════════════════════════════════════════════════════
// Page 1 body: width ~514px (MAIN_W-40), budget ~1075px
// Page 2 body: width ~742px (A4_W-52), budget ~1051px
// Font 9.5px body, cpl page1 ≈ 514/(9.5×0.52) ≈ 104 chars/line
// Profile: 5 lines → 520 chars → target 360-440
// Experience: 2 roles page1, up to 3 history roles page2
// Sidebar: skills, education, certs, languages, tools, memberships

const MID_SENIOR_RULES: CategorySlotRules = {
  header:   { fullNameMax: 28, taglineMaxChars: 80 },
  contact:  { items: 5, maxChars: 26 },
  profile:  { minChars: 380, maxChars: 480 },
  skills:   { count: 24, maxLabelChars: 15 },
  experience: {
    roles: 2,
    role1Bullets: 7,
    role2Bullets: 6,
    maxRoleChars: 36,
    maxCompanyChars: 40,
    maxDatesChars: 22,
    bulletMinChars: 85,
    bulletMaxChars: 125,
  },
  education:      { entries: 3, maxDegreeChars: 52, maxSchoolChars: 38 },
  certifications: { max: 6, maxNameChars: 46, maxIssuerChars: 30 },
  history: {
    roles: 3,
    bulletsPerRole: 4,
    maxRoleChars: 36,
    maxCompanyChars: 42,
    maxDatesChars: 22,
    maxBulletChars: 125,
  },
  projects:       { count: 2, maxNameChars: 38, descMinChars: 160, descMaxChars: 220, maxTechChars: 65 },
  awards:         { max: 4, maxTitleChars: 38, maxDescChars: 60 },
  languages:      { max: 5, maxNameChars: 16, maxLabelChars: 14 },
  references:     { count: 3, maxNameChars: 34, maxTitleChars: 38, maxCompanyChars: 38 },
  tools:          { count: 12, maxLabelChars: 16 },
  achievements:   { count: 5, minChars: 75, maxChars: 125 },
  boardRoles:     { max: 0, maxTitleChars: 0, maxOrganizationChars: 0, maxDatesChars: 0, maxDescriptionChars: 0 },
  executiveTraining: { max: 0, maxNameChars: 0, maxInstitutionChars: 0 },
  publications:   { max: 0, maxTitleChars: 0, maxPublisherChars: 0, maxTypeChars: 0 },
  declaration:    { maxChars: 250 },
  volunteer:      { max: 0, maxChars: 0 },
  memberships:    { max: 5 },
};

// ═══════════════════════════════════════════════════════════
// EXECUTIVE — 3 pages, sidebar + body (premium)
// ═══════════════════════════════════════════════════════════
// Page 1 body: width ~516px (MAIN_W-48), budget ~943px
// Page 2 body: width ~740px (A4_W-54), budget ~1049px
// Page 3 body: same as page 2
// Font 9.5px body, cpl page1 ≈ 516/(9.5×0.52) ≈ 104 chars/line
// Profile: 6 lines → 624 chars → target 380-480
// Experience: 2 roles page1, more history page2
// Board roles, publications, exec training page2/3

const EXECUTIVE_RULES: CategorySlotRules = {
  header:   { fullNameMax: 25, taglineMaxChars: 100 },
  contact:  { items: 5, maxChars: 28 },
  profile:  { minChars: 400, maxChars: 500 },
  skills:   { count: 28, maxLabelChars: 15 },
  experience: {
    roles: 2,
    role1Bullets: 8,
    role2Bullets: 7,
    maxRoleChars: 38,
    maxCompanyChars: 44,
    maxDatesChars: 22,
    bulletMinChars: 90,
    bulletMaxChars: 130,
  },
  education:      { entries: 3, maxDegreeChars: 54, maxSchoolChars: 38 },
  certifications: { max: 7, maxNameChars: 50, maxIssuerChars: 32 },
  history: {
    roles: 3,
    bulletsPerRole: 4,
    maxRoleChars: 38,
    maxCompanyChars: 44,
    maxDatesChars: 22,
    maxBulletChars: 130,
  },
  projects:       { count: 2, maxNameChars: 40, descMinChars: 180, descMaxChars: 240, maxTechChars: 70 },
  awards:         { max: 5, maxTitleChars: 40, maxDescChars: 65 },
  languages:      { max: 5, maxNameChars: 16, maxLabelChars: 14 },
  references:     { count: 4, maxNameChars: 36, maxTitleChars: 40, maxCompanyChars: 40 },
  tools:          { count: 14, maxLabelChars: 16 },
  achievements:   { count: 6, minChars: 75, maxChars: 135 },
  boardRoles:     { max: 3, maxTitleChars: 42, maxOrganizationChars: 38, maxDatesChars: 22, maxDescriptionChars: 130 },
  executiveTraining: { max: 3, maxNameChars: 46, maxInstitutionChars: 38 },
  publications:   { max: 3, maxTitleChars: 50, maxPublisherChars: 38, maxTypeChars: 22 },
  declaration:    { maxChars: 300 },
  volunteer:      { max: 0, maxChars: 0 },
  memberships:    { max: 5 },
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export const CATEGORY_RULES: Record<CareerCategory, CategorySlotRules> = {
  junior: JUNIOR_RULES,
  "mid-senior": MID_SENIOR_RULES,
  executive: EXECUTIVE_RULES,
};

/** Get the slot rules for a given career category */
export function getCategoryRules(category: CareerCategory): CategorySlotRules {
  return CATEGORY_RULES[category];
}
