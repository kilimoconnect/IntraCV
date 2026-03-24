// ═══════════════════════════════════════════════════════════
// CV LAYOUT — Shared Types, Themes & Constants
// ═══════════════════════════════════════════════════════════

export type CareerCategory = "junior" | "mid-senior" | "executive";
export type LayoutVariant = "A" | "B" | "C";

export interface LayoutOption {
  variant: LayoutVariant;
  name: string;
  description: string;
}

export const LAYOUT_OPTIONS: Record<CareerCategory, LayoutOption[]> = {
  junior: [
    { variant: "A", name: "Modern Banner",    description: "Centered banner header with accent contact strip, single-column body, pill-shaped skills" },
    { variant: "B", name: "Clean Sidebar",     description: "Thin left accent bar with contact info, clean right body, minimal and airy" },
    { variant: "C", name: "Split Header",      description: "Name left and contact right header, two-column skills and education grid below" },
  ],
  "mid-senior": [
    { variant: "A", name: "Dark Sidebar",      description: "Full-height dark left sidebar with contact and skills, timeline experience on right" },
    { variant: "B", name: "Top Bar Split",      description: "Dark top header bar, light right sidebar with skills and education, left body" },
    { variant: "C", name: "Full Width Cards",   description: "No sidebar — bold section dividers, card-based sections, modern full-width layout" },
  ],
  executive: [
    { variant: "A", name: "Elegant Centered",  description: "Centered header with decorative lines, dark right sidebar, premium card board roles" },
    { variant: "B", name: "Classic Columns",    description: "Wide dark left sidebar with monogram, right body with gold-accent horizontal rules" },
    { variant: "C", name: "Minimal Premium",    description: "Thin top accent line, large uppercase name, two-column body, understated elegance" },
  ],
};

export interface CategoryCVData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  location?: string;
  tagline?: string;
  profile: string;
  skills: string[];
  experience: { role: string; company: string; dates: string; location?: string; bullets: string[] }[];
  education: { degree: string; school: string; year: string; details?: string }[];
  certifications?: { name: string; issuer: string; year: string }[];
  languages?: { name: string; label: string; level?: number }[];
  references: { name: string; title: string; company: string; phone?: string; email?: string }[];
  projects?: { name: string; description: string; tech?: string }[];
  achievements?: string[];
  memberships?: string[];
  tools?: string[];
  boardRoles?: { title: string; organization: string; dates: string; description?: string }[];
  executiveTraining?: { name: string; institution: string; year: string }[];
  publications?: { title: string; publisher: string; year: string; type?: string }[];
  volunteer?: string[];
  declaration?: { declaration: string; place?: string; date?: string };
  history?: { role: string; company: string; dates: string; location?: string; bullets: string[] }[];
  awards?: { title: string; description?: string }[];
}

export type ThemeName = "corporate" | "ocean" | "forest" | "sunset" | "monochrome" | "royal" | "cherry" | "emerald" | "lavender" | "amber";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  headerBg: string;
  headerText: string;
  sidebarBg: string;
  text: string;
  muted: string;
  divider: string;
  pillBg: string;
  pillBorder: string;
  cardBg: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  corporate: { primary: "#4F46E5", primaryDark: "#3730A3", headerBg: "#1E293B", headerText: "#fff", sidebarBg: "#F8FAFC", text: "#1E293B", muted: "#64748B", divider: "#E2E8F0", pillBg: "#EEF2FF", pillBorder: "#C7D2FE", cardBg: "#FAFBFF" },
  ocean:     { primary: "#0EA5E9", primaryDark: "#0369A1", headerBg: "#0C4A6E", headerText: "#fff", sidebarBg: "#F0F9FF", text: "#0F172A", muted: "#64748B", divider: "#BAE6FD", pillBg: "#E0F2FE", pillBorder: "#7DD3FC", cardBg: "#F0F9FF" },
  forest:    { primary: "#16A34A", primaryDark: "#15803D", headerBg: "#14532D", headerText: "#fff", sidebarBg: "#F0FDF4", text: "#14532D", muted: "#6B7280", divider: "#D1FAE5", pillBg: "#DCFCE7", pillBorder: "#86EFAC", cardBg: "#F0FDF4" },
  sunset:    { primary: "#EA580C", primaryDark: "#C2410C", headerBg: "#7C2D12", headerText: "#fff", sidebarBg: "#FFF7ED", text: "#451A03", muted: "#78716C", divider: "#FED7AA", pillBg: "#FFEDD5", pillBorder: "#FDBA74", cardBg: "#FFF7ED" },
  monochrome:{ primary: "#374151", primaryDark: "#1F2937", headerBg: "#111827", headerText: "#fff", sidebarBg: "#F9FAFB", text: "#111827", muted: "#6B7280", divider: "#E5E7EB", pillBg: "#F3F4F6", pillBorder: "#D1D5DB", cardBg: "#F9FAFB" },
  royal:     { primary: "#7C3AED", primaryDark: "#6D28D9", headerBg: "#4C1D95", headerText: "#fff", sidebarBg: "#F8F4FF", text: "#1F2937", muted: "#6B7280", divider: "#E9D5FF", pillBg: "#F3E8FF", pillBorder: "#D8B4FE", cardBg: "#FAF5FF" },
  cherry:    { primary: "#E11D48", primaryDark: "#BE123C", headerBg: "#881337", headerText: "#fff", sidebarBg: "#FFF1F2", text: "#1F2937", muted: "#6B7280", divider: "#FECACA", pillBg: "#FEE2E2", pillBorder: "#FCA5A5", cardBg: "#FFF1F2" },
  emerald:   { primary: "#10B981", primaryDark: "#059669", headerBg: "#047857", headerText: "#fff", sidebarBg: "#F0FDF4", text: "#1F2937", muted: "#6B7280", divider: "#A7F3D0", pillBg: "#D1FAE5", pillBorder: "#6EE7B7", cardBg: "#F0FDF4" },
  lavender:  { primary: "#8B5CF6", primaryDark: "#7C3AED", headerBg: "#5B21B6", headerText: "#fff", sidebarBg: "#FAF5FF", text: "#1F2937", muted: "#6B7280", divider: "#DDD6FE", pillBg: "#EDE9FE", pillBorder: "#C4B5FD", cardBg: "#FAF5FF" },
  amber:     { primary: "#F59E0B", primaryDark: "#D97706", headerBg: "#92400E", headerText: "#fff", sidebarBg: "#FFFBEB", text: "#1F2937", muted: "#6B7280", divider: "#FED7AA", pillBg: "#FEF3C7", pillBorder: "#FCD34D", cardBg: "#FFFBEB" },
};

export const THEME_LIST: { name: ThemeName; label: string; color: string }[] = [
  { name: "corporate",  label: "Corporate",  color: "#4F46E5" },
  { name: "ocean",      label: "Ocean",      color: "#0EA5E9" },
  { name: "forest",     label: "Forest",     color: "#16A34A" },
  { name: "sunset",     label: "Sunset",     color: "#EA580C" },
  { name: "monochrome", label: "Monochrome", color: "#374151" },
  { name: "royal",      label: "Royal",      color: "#7C3AED" },
  { name: "cherry",     label: "Cherry",     color: "#E11D48" },
  { name: "emerald",    label: "Emerald",    color: "#10B981" },
  { name: "lavender",   label: "Lavender",   color: "#8B5CF6" },
  { name: "amber",      label: "Amber",      color: "#F59E0B" },
];

// A4 at 96 DPI
export const A4_W = 794;
export const A4_H = 1123;
export const FONT = "'Inter','Segoe UI','Helvetica Neue',sans-serif";

// Slot rules per category (content quotas for AI generation)
export const CATEGORY_SLOT_RULES = {
  junior: {
    profile:      { minChars: 200, maxChars: 320 },
    skills:       { count: 10, maxLabelChars: 18 },
    experience:   { roles: 3, bulletsPerRole: 4, bulletMinChars: 80, bulletMaxChars: 130, maxRoleChars: 40, maxCompanyChars: 44, maxDatesChars: 24 },
    education:    { entries: 3, maxDegreeChars: 55, maxSchoolChars: 40 },
    certifications: { max: 4, maxNameChars: 50, maxIssuerChars: 35 },
    languages:    { max: 4, maxNameChars: 18, maxLabelChars: 14 },
    references:   { count: 3, maxNameChars: 36, maxTitleChars: 40, maxCompanyChars: 40 },
    projects:     { count: 2, maxNameChars: 40, descMinChars: 120, descMaxChars: 200, maxTechChars: 60 },
    volunteer:    { max: 3, maxChars: 120 },
  },
  "mid-senior": {
    profile:      { minChars: 320, maxChars: 440 },
    skills:       { count: 14, maxLabelChars: 18 },
    experience:   { roles: 4, topDetailedRoles: 2, topBullets: 7, restBullets: 4, bulletMinChars: 90, bulletMaxChars: 135, maxRoleChars: 40, maxCompanyChars: 44, maxDatesChars: 24 },
    education:    { entries: 3, maxDegreeChars: 55, maxSchoolChars: 40 },
    certifications: { max: 6, maxNameChars: 50, maxIssuerChars: 35 },
    languages:    { max: 5, maxNameChars: 18, maxLabelChars: 14 },
    references:   { count: 3, maxNameChars: 36, maxTitleChars: 40, maxCompanyChars: 40 },
    achievements: { count: 5, minChars: 60, maxChars: 140 },
    tools:        { count: 10, maxLabelChars: 20 },
    memberships:  { max: 5, maxChars: 60 },
    projects:     { count: 2, maxNameChars: 40, descMinChars: 120, descMaxChars: 200, maxTechChars: 60 },
  },
  executive: {
    header:       { taglineMaxChars: 100 },
    profile:      { minChars: 380, maxChars: 480 },
    skills:       { count: 16, maxLabelChars: 20 },
    experience:   { roles: 5, topDetailedRoles: 2, topBullets: 8, restBullets: 4, bulletMinChars: 100, bulletMaxChars: 140, maxRoleChars: 40, maxCompanyChars: 44, maxDatesChars: 24 },
    education:    { entries: 3, maxDegreeChars: 55, maxSchoolChars: 40 },
    certifications: { max: 7, maxNameChars: 50, maxIssuerChars: 35 },
    languages:    { max: 5, maxNameChars: 18, maxLabelChars: 14 },
    references:   { count: 3, maxNameChars: 36, maxTitleChars: 40, maxCompanyChars: 40 },
    achievements: { count: 6, minChars: 60, maxChars: 140 },
    tools:        { count: 12, maxLabelChars: 20 },
    memberships:  { max: 5, maxChars: 60 },
    boardRoles:   { max: 5, maxTitleChars: 40, maxOrganizationChars: 40, maxDatesChars: 24, maxDescriptionChars: 150 },
    executiveTraining: { max: 5, maxNameChars: 50, maxInstitutionChars: 40 },
    publications: { max: 5, maxTitleChars: 50, maxPublisherChars: 40, maxTypeChars: 20 },
  },
} as const;
