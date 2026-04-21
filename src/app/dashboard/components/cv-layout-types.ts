// ═══════════════════════════════════════════════════════════
// CV LAYOUT — Shared Types, Themes & Constants
// ═══════════════════════════════════════════════════════════

export type CareerCategory = "junior" | "mid-senior" | "executive";
export type LayoutVariant = "A" | "B" | "C" | "D" | "E" | "F";

export interface LayoutOption {
  variant: LayoutVariant;
  name: string;
  description: string;
}

export const LAYOUT_OPTIONS: Record<CareerCategory, LayoutOption[]> = {
  junior: [
    { variant: "A", name: "Modern Banner",    description: "Centered banner header with accent contact strip, single-column body, pill-shaped skills" },
    { variant: "B", name: "Clean Sidebar",    description: "Thin left accent bar with contact info, clean right body, minimal and airy" },
    { variant: "C", name: "Split Header",     description: "Name left and contact right header, two-column skills and education grid below" },
    { variant: "D", name: "Dual Band",        description: "Split colored header band with name left and contact right, balanced two-column body with dot-grid skills" },
    { variant: "E", name: "Stripe Minimal",   description: "Thin top accent stripe, large left-aligned name with inline contact row, clean single-column body" },
    { variant: "F", name: "Right Sidebar",    description: "Distinct right sidebar with skills and education, clean main area with experience and profile" },
  ],
  "mid-senior": [
    { variant: "A", name: "Dark Sidebar",       description: "Full-height dark left sidebar with contact and skills, timeline experience on right" },
    { variant: "B", name: "Top Bar Split",       description: "Dark top header bar, light right sidebar with skills and education, left body" },
    { variant: "C", name: "Full Width Cards",    description: "No sidebar — bold section dividers, card-based sections, modern full-width layout" },
    { variant: "D", name: "Dual Band Split",     description: "Colored split header band, two-column body with experience left and skills/education right" },
    { variant: "E", name: "Stripe Professional", description: "Thin top accent stripe, large name with inline contact, skills pills at top, single-column timeline body" },
    { variant: "F", name: "Editorial Sidebar",   description: "White left sidebar with name/contact/education, colored skills strip across top of main area" },
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

export type ThemeName =
  | "corporate" | "midnight" | "slate" | "monochrome"
  | "ocean" | "teal" | "azure"
  | "emerald" | "forest" | "sage"
  | "royal" | "lavender" | "plum"
  | "cherry" | "rose" | "coral"
  | "amber" | "copper" | "burgundy" | "graphite";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
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
  // ── Dark & Professional ──────────────────────────────────────────────────
  corporate:  { primary: "#4F46E5", primaryDark: "#3730A3", accent: "#4F46E5", headerBg: "#0F172A", headerText: "#F8FAFC", sidebarBg: "#F8FAFC", text: "#0F172A", muted: "#64748B", divider: "#E2E8F0", pillBg: "#EEF2FF", pillBorder: "#C7D2FE", cardBg: "#FAFBFF" },
  midnight:   { primary: "#6366F1", primaryDark: "#4338CA", accent: "#6366F1", headerBg: "#020617", headerText: "#E0E7FF", sidebarBg: "#F1F5F9", text: "#0F172A", muted: "#475569", divider: "#CBD5E1", pillBg: "#E0E7FF", pillBorder: "#A5B4FC", cardBg: "#F8FAFC" },
  slate:      { primary: "#475569", primaryDark: "#334155", accent: "#475569", headerBg: "#1E293B", headerText: "#F1F5F9", sidebarBg: "#F8FAFC", text: "#1E293B", muted: "#64748B", divider: "#E2E8F0", pillBg: "#F1F5F9", pillBorder: "#CBD5E1", cardBg: "#F8FAFC" },
  monochrome: { primary: "#18181B", primaryDark: "#09090B", accent: "#18181B", headerBg: "#09090B", headerText: "#FAFAFA", sidebarBg: "#FAFAFA", text: "#09090B", muted: "#71717A", divider: "#E4E4E7", pillBg: "#F4F4F5", pillBorder: "#D4D4D8", cardBg: "#FAFAFA" },
  graphite:   { primary: "#374151", primaryDark: "#1F2937", accent: "#374151", headerBg: "#111827", headerText: "#F9FAFB", sidebarBg: "#F9FAFB", text: "#111827", muted: "#6B7280", divider: "#E5E7EB", pillBg: "#F3F4F6", pillBorder: "#D1D5DB", cardBg: "#F9FAFB" },

  // ── Blues & Teals ────────────────────────────────────────────────────────
  ocean:      { primary: "#0284C7", primaryDark: "#075985", accent: "#0284C7", headerBg: "#082F49", headerText: "#E0F2FE", sidebarBg: "#F0F9FF", text: "#0C4A6E", muted: "#64748B", divider: "#BAE6FD", pillBg: "#E0F2FE", pillBorder: "#7DD3FC", cardBg: "#F0F9FF" },
  teal:       { primary: "#0D9488", primaryDark: "#0F766E", accent: "#0D9488", headerBg: "#134E4A", headerText: "#CCFBF1", sidebarBg: "#F0FDFA", text: "#134E4A", muted: "#5F7A76", divider: "#99F6E4", pillBg: "#CCFBF1", pillBorder: "#5EEAD4", cardBg: "#F0FDFA" },
  azure:      { primary: "#2563EB", primaryDark: "#1D4ED8", accent: "#2563EB", headerBg: "#1E3A5F", headerText: "#DBEAFE", sidebarBg: "#EFF6FF", text: "#1E3A5F", muted: "#6B7280", divider: "#BFDBFE", pillBg: "#DBEAFE", pillBorder: "#93C5FD", cardBg: "#EFF6FF" },

  // ── Greens ───────────────────────────────────────────────────────────────
  emerald:    { primary: "#059669", primaryDark: "#047857", accent: "#059669", headerBg: "#022C22", headerText: "#D1FAE5", sidebarBg: "#ECFDF5", text: "#064E3B", muted: "#6B7280", divider: "#A7F3D0", pillBg: "#D1FAE5", pillBorder: "#6EE7B7", cardBg: "#ECFDF5" },
  forest:     { primary: "#15803D", primaryDark: "#166534", accent: "#15803D", headerBg: "#14532D", headerText: "#F0FDF4", sidebarBg: "#F0FDF4", text: "#14532D", muted: "#6B7280", divider: "#BBF7D0", pillBg: "#DCFCE7", pillBorder: "#86EFAC", cardBg: "#F0FDF4" },
  sage:       { primary: "#4D7C5F", primaryDark: "#3D6B4F", accent: "#4D7C5F", headerBg: "#1A3A2A", headerText: "#E8F5E9", sidebarBg: "#F1F8F3", text: "#1A3A2A", muted: "#6B8A7A", divider: "#C8E6C9", pillBg: "#E8F5E9", pillBorder: "#A5D6A7", cardBg: "#F5FAF6" },

  // ── Purples ──────────────────────────────────────────────────────────────
  royal:      { primary: "#7C3AED", primaryDark: "#6D28D9", accent: "#7C3AED", headerBg: "#2E1065", headerText: "#F3E8FF", sidebarBg: "#FAF5FF", text: "#1F2937", muted: "#6B7280", divider: "#E9D5FF", pillBg: "#F3E8FF", pillBorder: "#D8B4FE", cardBg: "#FAF5FF" },
  lavender:   { primary: "#8B5CF6", primaryDark: "#7C3AED", accent: "#8B5CF6", headerBg: "#3B0764", headerText: "#EDE9FE", sidebarBg: "#FAF5FF", text: "#1F2937", muted: "#6B7280", divider: "#DDD6FE", pillBg: "#EDE9FE", pillBorder: "#C4B5FD", cardBg: "#FAF5FF" },
  plum:       { primary: "#9333EA", primaryDark: "#7E22CE", accent: "#9333EA", headerBg: "#581C87", headerText: "#F5D0FE", sidebarBg: "#FDF4FF", text: "#3B0764", muted: "#737373", divider: "#F0ABFC", pillBg: "#FAE8FF", pillBorder: "#E879F9", cardBg: "#FDF4FF" },

  // ── Reds & Pinks ─────────────────────────────────────────────────────────
  cherry:     { primary: "#DC2626", primaryDark: "#B91C1C", accent: "#DC2626", headerBg: "#450A0A", headerText: "#FEE2E2", sidebarBg: "#FEF2F2", text: "#1F2937", muted: "#6B7280", divider: "#FECACA", pillBg: "#FEE2E2", pillBorder: "#FCA5A5", cardBg: "#FEF2F2" },
  rose:       { primary: "#E11D48", primaryDark: "#BE123C", accent: "#E11D48", headerBg: "#4C0519", headerText: "#FFE4E6", sidebarBg: "#FFF1F2", text: "#1F2937", muted: "#71717A", divider: "#FECDD3", pillBg: "#FFE4E6", pillBorder: "#FDA4AF", cardBg: "#FFF1F2" },
  coral:      { primary: "#F97316", primaryDark: "#EA580C", accent: "#F97316", headerBg: "#431407", headerText: "#FFEDD5", sidebarBg: "#FFF7ED", text: "#431407", muted: "#78716C", divider: "#FED7AA", pillBg: "#FFEDD5", pillBorder: "#FDBA74", cardBg: "#FFF7ED" },

  // ── Warm & Rich ──────────────────────────────────────────────────────────
  amber:      { primary: "#D97706", primaryDark: "#B45309", accent: "#D97706", headerBg: "#451A03", headerText: "#FEF3C7", sidebarBg: "#FFFBEB", text: "#1F2937", muted: "#78716C", divider: "#FDE68A", pillBg: "#FEF3C7", pillBorder: "#FCD34D", cardBg: "#FFFBEB" },
  copper:     { primary: "#B45930", primaryDark: "#9A4A25", accent: "#B45930", headerBg: "#3C1A0B", headerText: "#FDE8D8", sidebarBg: "#FDF6F0", text: "#3C1A0B", muted: "#8B7355", divider: "#E8C4A8", pillBg: "#FDE8D8", pillBorder: "#D4A47C", cardBg: "#FDF8F4" },
  burgundy:   { primary: "#881337", primaryDark: "#6B0F2B", accent: "#881337", headerBg: "#2D0A13", headerText: "#FDE4EA", sidebarBg: "#FDF2F4", text: "#2D0A13", muted: "#7A6B6E", divider: "#F5C6CE", pillBg: "#FDE4EA", pillBorder: "#F0A0B0", cardBg: "#FDF5F7" },
};

export const THEME_LIST: { name: ThemeName; label: string; color: string }[] = [
  // Dark & Professional
  { name: "corporate",  label: "Corporate",    color: "#4F46E5" },
  { name: "midnight",   label: "Midnight",     color: "#6366F1" },
  { name: "slate",      label: "Slate",        color: "#475569" },
  { name: "monochrome", label: "Monochrome",   color: "#18181B" },
  { name: "graphite",   label: "Graphite",     color: "#374151" },
  // Blues & Teals
  { name: "ocean",      label: "Ocean",        color: "#0284C7" },
  { name: "teal",       label: "Teal",         color: "#0D9488" },
  { name: "azure",      label: "Azure",        color: "#2563EB" },
  // Greens
  { name: "emerald",    label: "Emerald",      color: "#059669" },
  { name: "forest",     label: "Forest",       color: "#15803D" },
  { name: "sage",       label: "Sage",         color: "#4D7C5F" },
  // Purples
  { name: "royal",      label: "Royal",        color: "#7C3AED" },
  { name: "lavender",   label: "Lavender",     color: "#8B5CF6" },
  { name: "plum",       label: "Plum",         color: "#9333EA" },
  // Reds & Pinks
  { name: "cherry",     label: "Cherry",       color: "#DC2626" },
  { name: "rose",       label: "Rose",         color: "#E11D48" },
  { name: "coral",      label: "Coral",        color: "#F97316" },
  // Warm & Rich
  { name: "amber",      label: "Amber",        color: "#D97706" },
  { name: "copper",     label: "Copper",       color: "#B45930" },
  { name: "burgundy",   label: "Burgundy",     color: "#881337" },
];

// ═══════════════════════════════════════════════════════════
// Custom Theme Builder — derives all 12 slots from one hex
// ═══════════════════════════════════════════════════════════

function _hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function _hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, "0").toUpperCase();
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Derive a full ThemeColors object from a single primary hex colour. */
export function buildCustomTheme(hex: string): ThemeColors {
  const [h, s, l] = _hexToHsl(hex);
  const sat = Math.min(s, 85);
  return {
    primary:     hex,
    primaryDark: _hslToHex(h, sat, Math.max(l - 14, 15)),
    accent:      hex,
    // Dark header: hue-tinted near-black — matches preset pattern
    headerBg:    _hslToHex(h, Math.min(sat, 70),         13),
    // Header text: near-white with gentle hue tint
    headerText:  _hslToHex(h, Math.min(sat * 0.35, 30),  96),
    // Sidebar: very light but properly hue-tinted (presets use 40-100% sat here)
    sidebarBg:   _hslToHex(h, Math.min(sat * 0.7,  60),  97.5),
    // Body text: near-black with slight hue
    text:        _hslToHex(h, Math.min(sat * 0.3,  25),  13),
    // Muted: medium grey with slight hue
    muted:       _hslToHex(h, Math.min(sat * 0.2,  20),  47),
    // Divider: light with real tint (presets use 80-100% sat)
    divider:     _hslToHex(h, Math.min(sat * 0.8,  75),  90),
    // Pill bg: near-white but vibrantly tinted (presets use 90-100% sat)
    pillBg:      _hslToHex(h, Math.min(sat * 0.9,  80),  95),
    // Pill border: medium-light, well-saturated (presets use 80-97% sat)
    pillBorder:  _hslToHex(h, Math.min(sat * 0.85, 75),  82),
    // Card bg: near-white with gentle hue tint
    cardBg:      _hslToHex(h, Math.min(sat * 0.65, 55),  98),
  };
}

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
