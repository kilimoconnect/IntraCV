// ═══════════════════════════════════════════════════════════
// CV DENSITY CONTROLLER — Legacy Stub
// ═══════════════════════════════════════════════════════════
// Minimal type exports to keep legacy cv-engine/ compiling.
// The new Fixed-Layer Blueprint system does NOT use this file.
// ═══════════════════════════════════════════════════════════

import type { CVTemplateData } from "@/components/cv-templates/types";

export type SpacingMode = "compact" | "normal" | "spacious";
export type SummaryLength = "short" | "medium" | "long";
export type SkillsLayout = "inline" | "pills" | "grid" | "graph";
export type ExperienceLayout = "compact" | "standard" | "detailed";

export interface RenderSettings {
  fontScale: number;
  lineHeightScale: number;
  sectionGapPx: number;
  itemGapPx: number;
  pageMarginPx: number;
  spacingMode: SpacingMode;
  summaryLength: SummaryLength;
  skillsLayout: SkillsLayout;
  experienceLayout: ExperienceLayout;
  maxBulletsPerJob: number;
  bulletWordTarget: number;
  showIcons: boolean;
  // Legacy cv-engine fields
  spacing: SpacingMode;
  showSummary: boolean;
  contentDensityScore: number;
  recommendation: string;
}

export interface DensityAssessment {
  totalChars: number;
  sectionCount: number;
  density: "light" | "moderate" | "heavy";
  recommendedPages: number;
  // Legacy cv-engine fields
  renderSettings: RenderSettings;
  contentDensityScore: number;
  recommendation: string;
}

export interface STARConstraints {
  maxBullets: number;
  bulletWordTarget: number;
  summaryLength: SummaryLength;
}

export interface LayoutRecommendation {
  layout: string;
  reason: string;
}

const DEFAULT_RS: RenderSettings = {
  fontScale: 1, lineHeightScale: 1, sectionGapPx: 12, itemGapPx: 6, pageMarginPx: 32,
  spacingMode: "normal", summaryLength: "medium", skillsLayout: "inline",
  experienceLayout: "standard", maxBulletsPerJob: 5, bulletWordTarget: 20, showIcons: false,
  spacing: "normal",
  showSummary: true, contentDensityScore: 50, recommendation: "normal",
};

export function assessContentDensity(_data: CVTemplateData, _pages?: number): DensityAssessment {
  return {
    totalChars: 0, sectionCount: 0, density: "moderate", recommendedPages: 2,
    renderSettings: DEFAULT_RS, contentDensityScore: 50, recommendation: "normal",
  };
}

export function renderSettingsToDensity(_rs: RenderSettings): "compact" | "normal" | "spacious" {
  return "normal";
}

export function getSTARConstraints(_density: DensityAssessment): STARConstraints {
  return { maxBullets: 5, bulletWordTarget: 20, summaryLength: "medium" };
}

export function recommendLayout(_data: CVTemplateData): LayoutRecommendation {
  return { layout: "single-column", reason: "default" };
}

export function recommendPageCount(_data: CVTemplateData): number {
  return 2;
}
