// ─── Component-Based CV Layout Engine ───
// Replaces 200+ templates with: 10 components × 5 styles × 1 engine

import type { CVTemplateData } from "../cv-templates/types";
import type { LayoutType } from "@/lib/layout-types";

// Re-export for convenience
export type { CVTemplateData };
export type { LayoutType };

// Re-export density controller types
export type {
  RenderSettings,
  SpacingMode,
  SummaryLength,
  SkillsLayout,
  ExperienceLayout,
  DensityAssessment,
  STARConstraints,
  LayoutRecommendation,
} from "@/lib/cv-density-controller";
export {
  assessContentDensity,
  renderSettingsToDensity,
  getSTARConstraints,
  recommendLayout,
} from "@/lib/cv-density-controller";

// ─── Page Constants ───
export const PAGE_W = 794;   // A4 width in px at 96dpi
export const PAGE_H = 1123;  // A4 height in px at 96dpi
export const GRID_COLS = 12;
export const COL_W = PAGE_W / GRID_COLS; // ~66.2px per column

// ─── Component Types ───
export type ComponentType =
  | "header"
  | "summary"
  | "skills"
  | "experience"
  | "achievements"
  | "education"
  | "certifications"
  | "additional"
  | "referees"
  | "declaration"
  | "memberships"
  | "projects"
  | "publications"
  | "boardRoles"
  | "executiveTraining";

// ─── Section Titles per Page Count ───
export const SECTION_TITLES: Record<number, Partial<Record<ComponentType, string>>> = {
  1: {
    summary: "Professional Summary",
    skills: "Core Skills",
    experience: "Professional Experience",
    education: "Education",
    certifications: "Certifications / Training",
    referees: "Referees",
    declaration: "Declaration",
  },
  2: {
    summary: "Professional Summary",
    skills: "Core Competencies",
    experience: "Professional Experience",
    achievements: "Key Achievements / Projects",
    education: "Education",
    certifications: "Certifications",
    memberships: "Professional Memberships",
    referees: "Referees",
    declaration: "Declaration",
  },
  3: {
    summary: "Executive Profile",
    skills: "Core Leadership Competencies",
    achievements: "Career Highlights",
    experience: "Professional Experience",
    boardRoles: "Board / Leadership Roles",
    projects: "Major Projects",
    education: "Education",
    executiveTraining: "Executive Training",
    certifications: "Certifications",
    memberships: "Professional Affiliations",
    publications: "Publications / Speaking",
    referees: "Referees",
    declaration: "Declaration",
  },
};

// ─── Section Ordering per Page Count ───
// Full order (single-column layouts)
export const FULL_SECTION_ORDER: Record<number, ComponentType[]> = {
  1: ["summary", "skills", "experience", "education", "certifications", "referees", "declaration"],
  2: ["summary", "skills", "experience", "achievements", "education", "certifications", "memberships", "referees", "declaration"],
  3: ["summary", "skills", "achievements", "experience", "boardRoles", "projects", "education", "executiveTraining", "certifications", "memberships", "publications", "referees", "declaration"],
};

// Main panel (sidebar/two-column layouts)
export const MAIN_SECTION_ORDER: Record<number, ComponentType[]> = {
  1: ["summary", "experience", "education"],
  2: ["summary", "experience", "achievements", "education"],
  3: ["summary", "achievements", "experience", "boardRoles", "projects", "education"],
};

// Sidebar panel (sidebar/two-column layouts)
export const SIDEBAR_SECTION_ORDER: Record<number, ComponentType[]> = {
  1: ["skills", "certifications", "referees", "declaration"],
  2: ["skills", "certifications", "memberships", "referees", "declaration"],
  3: ["skills", "executiveTraining", "certifications", "memberships", "publications", "referees", "declaration"],
};

// ─── Design Style ───
export interface DesignStyle {
  id: string;
  name: string;
  colors: {
    accent: string;
    accentLight: string;
    headerBg: string;
    headerText: string;
    sidebarBg: string;
    sidebarText: string;
    bodyText: string;
    mutedText: string;
    border: string;
  };
  font: "sans" | "serif" | "mono";
  headingStyle: "underline" | "bordered" | "pill" | "minimal" | "uppercase-bar" | "filled";
  density: "compact" | "normal" | "spacious";
  borderRadius: string;
  showIcons: boolean;
  skillDisplay: "text" | "tags" | "bars" | "dots";
  experienceStyle: "standard" | "timeline" | "compact" | "card";
  sectionDivider: "none" | "line" | "dots" | "gradient";
}

// ─── Density Metrics ───
export interface DensityMetrics {
  pagePad: string;
  sectionGap: number;
  itemGap: number;
  fontSize: number;
  lineHeight: number;
  linePx: number;       // fontSize * lineHeight
  charW: number;         // fontSize * 0.52 (average char width)
  smallFontSize: number; // 9.5px for bullets
  smallLinePx: number;   // 9.5 * 1.45
}

export const DENSITY_METRICS: Record<string, DensityMetrics> = {
  compact: {
    pagePad: "28px 32px", sectionGap: 12, itemGap: 8,
    fontSize: 10.5, lineHeight: 1.4, linePx: 14.7, charW: 5.46,
    smallFontSize: 9.5, smallLinePx: 13.775,
  },
  normal: {
    pagePad: "36px 40px", sectionGap: 14, itemGap: 10,
    fontSize: 11, lineHeight: 1.45, linePx: 15.95, charW: 5.72,
    smallFontSize: 9.5, smallLinePx: 13.775,
  },
  spacious: {
    pagePad: "40px 48px", sectionGap: 16, itemGap: 12,
    fontSize: 11.5, lineHeight: 1.5, linePx: 17.25, charW: 5.98,
    smallFontSize: 9.5, smallLinePx: 13.775,
  },
};

// ─── Layout Configuration ───

export interface LayoutConfig {
  type: LayoutType;
  // Which components go in which column
  // For single-column: all in "main"
  // For sidebar: sidebar sections + main sections
  mainSections: ComponentType[];
  sidebarSections: ComponentType[];
}

// ─── Grid Placement ───
export interface GridPlacement {
  component: ComponentType;
  col: number;      // 0-based start column
  span: number;     // number of columns (1-12)
  row: number;      // vertical order index
  heightPx: number; // measured or estimated height
}

// ─── Page Plan ───
export interface PagePlan {
  pageIndex: number;
  showHeader: boolean;
  showFooter: boolean;
  placements: GridPlacement[];
  // For sidebar layouts: separate tracks
  mainPlacements: GridPlacement[];
  sidebarPlacements: GridPlacement[];
}

// ─── Component Measurement ───
export interface ComponentMeasure {
  type: ComponentType;
  naturalHeightPx: number;  // How tall this component wants to be
  minHeightPx: number;      // Minimum viable height
  hasContent: boolean;       // Whether this section has data
}

// ─── Engine Output ───
export interface EngineResult {
  pages: PagePlan[];
  style: DesignStyle;
  layout: LayoutConfig;
  data: CVTemplateData;      // Possibly compressed
  metrics: DensityMetrics;
  renderSettings?: import("@/lib/cv-density-controller").RenderSettings;
  densityAssessment?: import("@/lib/cv-density-controller").DensityAssessment;
  log: string[];
}

// ─── Font Stacks ───
export const FONT_STACKS: Record<string, string> = {
  sans: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Georgia', 'Times New Roman', 'Garamond', serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};
