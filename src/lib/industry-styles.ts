// ═══════════════════════════════════════════════
// INDUSTRY STYLE MAPPING
// Maps industry_category → visual style tokens
// Used by PlainCVRenderer after structured generation
// ═══════════════════════════════════════════════

export type IndustryCategory = "CORPORATE" | "TECH" | "CREATIVE" | "ACADEMIC";

export interface IndustryStyle {
  category: IndustryCategory;
  // Fonts
  headingFont: string;
  bodyFont: string;
  // Colors
  primaryColor: string;       // headings, name, section borders
  secondaryColor: string;     // subheadings, accents
  textColor: string;          // body text
  mutedColor: string;         // dates, secondary info
  borderColor: string;        // section dividers
  accentBg: string;           // optional accent background
  // Sizing
  nameSize: string;
  headlineSize: string;
  sectionTitleSize: string;
  bodySize: string;
  smallSize: string;
  lineHeight: number;
  // Section heading style
  sectionBorder: string;      // CSS border-bottom
  sectionTransform: string;   // text-transform
  sectionLetterSpacing: string;
  // Layout hints
  headerAlign: "center" | "left";
  contactSeparator: string;
  skillsDisplay: "inline" | "pills" | "grid" | "graph";
}

export const INDUSTRY_STYLES: Record<IndustryCategory, IndustryStyle> = {
  // ─── CORPORATE ───
  // Serif fonts, Navy/Slate, high density, classic single-column feel
  CORPORATE: {
    category: "CORPORATE",
    headingFont: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
    bodyFont: "'Georgia', 'Times New Roman', serif",
    primaryColor: "#1e293b",    // slate-800
    secondaryColor: "#334155",  // slate-700
    textColor: "#1e293b",       // slate-800
    mutedColor: "#64748b",      // slate-500
    borderColor: "#334155",     // slate-700
    accentBg: "transparent",
    nameSize: "24pt",
    headlineSize: "11pt",
    sectionTitleSize: "12pt",
    bodySize: "10.5pt",
    smallSize: "9.5pt",
    lineHeight: 1.45,
    sectionBorder: "2px solid #334155",
    sectionTransform: "uppercase",
    sectionLetterSpacing: "1px",
    headerAlign: "center",
    contactSeparator: "  |  ",
    skillsDisplay: "inline",
  },

  // ─── TECH ───
  // Sans-serif (Inter), Emerald/Indigo accents, clean minimalist
  TECH: {
    category: "TECH",
    headingFont: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
    bodyFont: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
    primaryColor: "#312e81",    // indigo-900
    secondaryColor: "#059669",  // emerald-600
    textColor: "#1f2937",       // gray-800
    mutedColor: "#6b7280",      // gray-500
    borderColor: "#6366f1",     // indigo-500
    accentBg: "#f0fdf4",        // emerald-50
    nameSize: "22pt",
    headlineSize: "11pt",
    sectionTitleSize: "11pt",
    bodySize: "10.5pt",
    smallSize: "9pt",
    lineHeight: 1.5,
    sectionBorder: "2px solid #6366f1",
    sectionTransform: "uppercase",
    sectionLetterSpacing: "1.5px",
    headerAlign: "left",
    contactSeparator: "  ·  ",
    skillsDisplay: "pills",
  },

  // ─── CREATIVE ───
  // High-contrast typography, bold Rose/Violet accents
  CREATIVE: {
    category: "CREATIVE",
    headingFont: "'Georgia', 'Playfair Display', serif",
    bodyFont: "'Helvetica Neue', 'Arial', sans-serif",
    primaryColor: "#be123c",    // rose-700
    secondaryColor: "#7c3aed",  // violet-600
    textColor: "#18181b",       // zinc-900
    mutedColor: "#71717a",      // zinc-500
    borderColor: "#be123c",     // rose-700
    accentBg: "#fdf2f8",        // pink-50
    nameSize: "26pt",
    headlineSize: "12pt",
    sectionTitleSize: "12pt",
    bodySize: "10.5pt",
    smallSize: "9.5pt",
    lineHeight: 1.5,
    sectionBorder: "3px solid #be123c",
    sectionTransform: "uppercase",
    sectionLetterSpacing: "2px",
    headerAlign: "left",
    contactSeparator: "  ✦  ",
    skillsDisplay: "pills",
  },

  // ─── ACADEMIC ───
  // Traditional serif, muted tones, dense scholarly layout
  ACADEMIC: {
    category: "ACADEMIC",
    headingFont: "'Times New Roman', 'Georgia', serif",
    bodyFont: "'Times New Roman', 'Georgia', serif",
    primaryColor: "#1e3a5f",    // dark navy
    secondaryColor: "#2563eb",  // blue-600
    textColor: "#111827",       // gray-900
    mutedColor: "#6b7280",      // gray-500
    borderColor: "#1e3a5f",     // dark navy
    accentBg: "transparent",
    nameSize: "22pt",
    headlineSize: "11pt",
    sectionTitleSize: "12pt",
    bodySize: "11pt",
    smallSize: "9.5pt",
    lineHeight: 1.4,
    sectionBorder: "1px solid #1e3a5f",
    sectionTransform: "uppercase",
    sectionLetterSpacing: "0.5px",
    headerAlign: "center",
    contactSeparator: "  |  ",
    skillsDisplay: "inline",
  },
};

export function getIndustryStyle(category?: string): IndustryStyle {
  if (category && category in INDUSTRY_STYLES) {
    return INDUSTRY_STYLES[category as IndustryCategory];
  }
  return INDUSTRY_STYLES.CORPORATE; // default fallback
}
