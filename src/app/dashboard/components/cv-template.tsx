// ═══════════════════════════════════════════════════════════
// FIXED CV TEMPLATE — Revised Pixel-Exact Design
// ═══════════════════════════════════════════════════════════

import React from "react";

const W = 794;
const H = 1123;
const SIDE_W = 232;
const ACCENT_X = SIDE_W;
const ACCENT_W = 2;
const BODY_X = SIDE_W + ACCENT_W; 
const BODY_W = W - BODY_X;        
const PAD = 20; // Standardized padding

// Color themes
type ThemeName = "corporate" | "ocean" | "forest" | "sunset" | "monochrome" | "royal" | "cherry" | "emerald" | "lavender" | "amber";

type ThemeColors = {
  sidebarBg: string; accent: string; headerBg: string; headerText: string;
  heading: string; text: string; muted: string; sub: string; divider: string;
  pillBg: string; pillBorder: string; cardBg: string; barBg: string;
};

const themes: Record<ThemeName, ThemeColors> = {
  corporate: {
    sidebarBg:  "#F8FAFC",
    accent:     "#4F46E5",
    headerBg:   "#1E293B",
    headerText: "#FFFFFF",
    heading:    "#4F46E5",
    text:       "#1E293B",
    muted:      "#64748B",
    sub:        "#94A3B8",
    divider:    "#E2E8F0",
    pillBg:     "#EEF2FF",
    pillBorder: "#C7D2FE",
    cardBg:     "#FAFBFF",
    barBg:      "#E2E8F0",
  },
  ocean: {
    sidebarBg:  "#F0F9FF",
    accent:     "#0EA5E9",
    headerBg:   "#0C4A6E",
    headerText: "#FFFFFF",
    heading:    "#0EA5E9",
    text:       "#0F172A",
    muted:      "#64748B",
    sub:        "#94A3B8",
    divider:    "#BAE6FD",
    pillBg:     "#E0F2FE",
    pillBorder: "#7DD3FC",
    cardBg:     "#F0F9FF",
    barBg:      "#BAE6FD",
  },
  forest: {
    sidebarBg:  "#F0FDF4",
    accent:     "#16A34A",
    headerBg:   "#14532D",
    headerText: "#FFFFFF",
    heading:    "#16A34A",
    text:       "#14532D",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#D1FAE5",
    pillBg:     "#DCFCE7",
    pillBorder: "#86EFAC",
    cardBg:     "#F0FDF4",
    barBg:      "#D1FAE5",
  },
  sunset: {
    sidebarBg:  "#FFF7ED",
    accent:     "#EA580C",
    headerBg:   "#7C2D12",
    headerText: "#FFFFFF",
    heading:    "#EA580C",
    text:       "#451A03",
    muted:      "#78716C",
    sub:        "#A8A29E",
    divider:    "#FED7AA",
    pillBg:     "#FFEDD5",
    pillBorder: "#FDBA74",
    cardBg:     "#FFF7ED",
    barBg:      "#FED7AA",
  },
  monochrome: {
    sidebarBg:  "#F9FAFB",
    accent:     "#374151",
    headerBg:   "#111827",
    headerText: "#FFFFFF",
    heading:    "#374151",
    text:       "#111827",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#E5E7EB",
    pillBg:     "#F3F4F6",
    pillBorder: "#D1D5DB",
    cardBg:     "#F9FAFB",
    barBg:      "#E5E7EB",
  },
  royal: {
    sidebarBg:  "#F8F4FF",
    accent:     "#7C3AED",
    headerBg:   "#4C1D95",
    headerText: "#FFFFFF",
    heading:    "#7C3AED",
    text:       "#1F2937",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#E9D5FF",
    pillBg:     "#F3E8FF",
    pillBorder: "#D8B4FE",
    cardBg:     "#FAF5FF",
    barBg:      "#E9D5FF",
  },
  cherry: {
    sidebarBg:  "#FFF1F2",
    accent:     "#E11D48",
    headerBg:   "#881337",
    headerText: "#FFFFFF",
    heading:    "#E11D48",
    text:       "#1F2937",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#FECACA",
    pillBg:     "#FEE2E2",
    pillBorder: "#FCA5A5",
    cardBg:     "#FFF1F2",
    barBg:      "#FECACA",
  },
  emerald: {
    sidebarBg:  "#F0FDF4",
    accent:     "#10B981",
    headerBg:   "#047857",
    headerText: "#FFFFFF",
    heading:    "#10B981",
    text:       "#1F2937",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#A7F3D0",
    pillBg:     "#D1FAE5",
    pillBorder: "#6EE7B7",
    cardBg:     "#F0FDF4",
    barBg:      "#A7F3D0",
  },
  lavender: {
    sidebarBg:  "#FAF5FF",
    accent:     "#8B5CF6",
    headerBg:   "#5B21B6",
    headerText: "#FFFFFF",
    heading:    "#8B5CF6",
    text:       "#1F2937",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#DDD6FE",
    pillBg:     "#EDE9FE",
    pillBorder: "#C4B5FD",
    cardBg:     "#FAF5FF",
    barBg:      "#DDD6FE",
  },
  amber: {
    sidebarBg:  "#FFFBEB",
    accent:     "#F59E0B",
    headerBg:   "#92400E",
    headerText: "#FFFFFF",
    heading:    "#F59E0B",
    text:       "#1F2937",
    muted:      "#6B7280",
    sub:        "#9CA3AF",
    divider:    "#FED7AA",
    pillBg:     "#FEF3C7",
    pillBorder: "#FCD34D",
    cardBg:     "#FFFBEB",
    barBg:      "#FED7AA",
  },
};

export interface CVTemplateProps {
  data: any;
  theme?: ThemeName;
}

export type { ThemeName }

// ─── AI CONTENT QUOTAS — derived from pixel layout ───
// sideInner = SIDE_W - PAD*2 = 192px | bodyInner = BODY_W - PAD*2 = 520px
export const SLOT_RULES = {
  // Header: 32pt name, 14pt title, 10pt tagline in 754px header bar
  header:    { fullNameMax: 25, taglineMaxChars: 100 },
  // Contact: 5 items × 1 line at 8.5pt in 192px → ~26 chars each
  contact:   { items: 5, maxChars: 26 },
  // Profile: 120px at 9.5pt/1.45lh in 520px → ~6 lines × 70 chars
  profile:   { minChars: 380, maxChars: 440 },
  // Skills: 2-col grid 400px tall → 24 pills fill the block
  skills:    { count: 24, maxLabelChars: 14 },
  // Experience: bullets flex-wrap at 9pt/17px in 520px → ~70 chars/line; 2 roles P1
  experience: {
    roles: 2,
    role1Bullets: 11,
    role2Bullets: 9,
    maxRoleChars: 36,    // 11pt bold in 520px
    maxCompanyChars: 42, // 9.5pt in 520px
    maxDatesChars: 22,   // right-aligned float
    bulletMinChars: 115,
    bulletMaxChars: 135,
  },
  // Education: sidebar 192px — degree 9pt bold ~26chars/line (2 lines), school 8.5pt ~24chars
  education: {
    entries: 2,
    maxDegreeChars: 52,  // 2 lines × 26 chars
    maxSchoolChars: 24,
  },
  // Certifications: sidebar 192px — name 8.5pt bold ~26chars/line (2 lines), issuer 7.5pt ~30chars
  certifications: {
    max: 7,
    maxNameChars: 52,    // 2 lines × 26 chars
    maxIssuerChars: 30,
  },
  // Career History: body 520px — 3 older roles, 3 bullets each
  history: {
    roles: 3,
    bulletsPerRole: 3,
    maxRoleChars: 36,
    maxCompanyChars: 40,
    maxDatesChars: 20,
    maxBulletChars: 110,
  },
  // Projects: body 520px — 2 cards, name bold ~36 chars, desc 3 sentences, tech 7.5pt
  projects: {
    count: 2,
    maxNameChars: 36,
    descMinChars: 210,
    descMaxChars: 240,
    maxTechChars: 65,
  },
  // Awards, languages, references: kept for data completeness (not rendered on current template)
  awards:       { max: 5, maxTitleChars: 40, maxDescChars: 60 },
  languages:    { max: 5, maxNameChars: 16, maxLabelChars: 14 },
  references:   { count: 3, maxNameChars: 30, maxTitleChars: 32, maxCompanyChars: 32 },
};

const abs = (l: number, t: number, w: number, h: number): React.CSSProperties => ({
  position: "absolute", left: l, top: t, width: w, height: h, overflow: "hidden",
});

const pos = (l: number, t: number, w: number): React.CSSProperties => ({
  position: "absolute", left: l, top: t, width: w,
});

export interface CVData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  location: string;
  profile: string;
  skills: string[];
  languages: { name: string; level: number; label: string }[];
  experience: { role: string; company: string; dates: string; location?: string; bullets: string[] }[];
  education: { degree: string; school: string; year: string; details?: string }[];
  certifications: { name: string; issuer: string; year: string }[];
  awards: { title: string; description?: string }[];
  history: { role: string; company: string; dates: string; location?: string; bullets: string[] }[];
  projects: { name: string; description: string; tech?: string }[];
  references: { name: string; title: string; company: string; phone: string; email: string }[];
  tagline?: string;
}

const font = "'Inter','Segoe UI',sans-serif";

function SH({ children, top, left, width, C }: { children: string; top: number; left: number; width: number; C: ThemeColors }) {
  const sidebar = left < BODY_X;
  return (
    <div style={{
      ...abs(left, top, width, 24),
      fontFamily: font, fontSize: sidebar ? "9pt" : "11pt", fontWeight: 700,
      color: C.heading, textTransform: "uppercase", letterSpacing: "1.2px",
      borderBottom: `2px solid ${sidebar ? C.divider : C.accent}`,
      lineHeight: "22px",
    }}>
      {children}
    </div>
  );
}

// ─── PAGE 1 ───
function Page1({ d, theme }: { d: CVData; theme: ThemeName }) {
  const sideInner = SIDE_W - PAD * 2;  // 192px
  const bodyInner = BODY_W - PAD * 2;  // 520px
  const C = themes[theme];

  const contactItems = [
    { icon: "✉", val: d.email },
    { icon: "☎", val: d.phone },
    { icon: "📍", val: d.location },
  ];

  return (
    <>
      <div className="cv-page-sheet" style={{
        width: W, height: H, position: "relative", overflow: "hidden",
        background: "white", fontFamily: font, color: C.text,
      }}>
      {/* ── Backgrounds ── */}
      <div style={abs(0, 0, SIDE_W, H)}><div style={{ width: "100%", height: "100%", background: C.sidebarBg }} /></div>
      <div style={abs(0, 0, W, 140)}><div style={{ width: "100%", height: "100%", background: C.headerBg }} /></div>
      <div style={abs(ACCENT_X, 140, ACCENT_W, H - 140)}><div style={{ width: "100%", height: "100%", background: C.accent }} /></div>

      {/* ── Header 0-140 ── */}
      <div style={{ ...pos(PAD, 36, W - PAD * 2) }}>
        <div style={{ fontSize: "30pt", fontWeight: 800, color: C.headerText, lineHeight: 1.1 }}>{d.fullName}</div>
        <div style={{ fontSize: "13pt", fontWeight: 400, color: C.sub, letterSpacing: "0.4px", marginTop: 8 }}>{d.title}</div>
        {d.tagline && (
          <div style={{ fontSize: "10pt", fontWeight: 500, color: C.headerText, opacity: 0.85, marginTop: 4, lineHeight: 1.3 }}>{d.tagline}</div>
        )}
      </div>

      {/* ── Sidebar: Contact 160-346 ── */}
      <SH top={160} left={PAD} width={sideInner} C={C}>Contact</SH>
      <div style={{ ...pos(PAD, 190, sideInner) }}>
        {contactItems.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", fontSize: "8pt", marginBottom: 8 }}>
            <span style={{ width: 18, color: C.accent, fontSize: "9px", flexShrink: 0, marginTop: 2 }}>{c.icon}</span>
            <span style={{ flex: 1, wordBreak: "break-all" }}>{c.val || "—"}</span>
          </div>
        ))}
      </div>

      {/* ── Sidebar: Skills 346-760 ── */}
      <SH top={346} left={PAD} width={sideInner} C={C}>Core Skills</SH>
      <div style={{ ...pos(PAD, 375, sideInner) }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {d.skills.map((s, i) => (
            <div key={i} style={{
              background: C.pillBg, border: `1px solid ${C.pillBorder}`, borderRadius: 4,
              fontSize: "7.5pt", padding: "3px 4px", textAlign: "center",
              color: C.accent, fontWeight: 600,
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* ── Sidebar: Languages 772-1100 ── */}
      <SH top={772} left={PAD} width={sideInner} C={C}>Languages</SH>
      <div style={{ ...pos(PAD, 802, sideInner) }}>
        {d.languages.slice(0, 5).map((lang, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "8.5pt", fontWeight: 600 }}>{lang.name}</span>
              <span style={{ fontSize: "7.5pt", color: C.muted }}>{lang.label}</span>
            </div>
            <div style={{ height: 6, background: C.barBg, borderRadius: 3, marginTop: 4 }}>
              <div style={{ width: `${lang.level}%`, height: "100%", background: C.accent, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Body: Profile 160-326 ── */}
      <SH top={160} left={BODY_X + PAD} width={bodyInner} C={C}>Executive Profile</SH>
      <div style={{ ...pos(BODY_X + PAD, 190, bodyInner), fontSize: "9pt", lineHeight: "20px", textAlign: "justify" }}>{d.profile}</div>

      {/* ── Body: Experience 326-1080 ── */}
      <SH top={326} left={BODY_X + PAD} width={bodyInner} C={C}>Professional Experience</SH>
      <div style={abs(BODY_X + PAD, 356, bodyInner, 724)}>
        {d.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontWeight: 700, fontSize: "10.5pt", color: C.text }}>{exp.role}</div>
              <div style={{ fontSize: "8pt", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</div>
            </div>
            <div style={{ fontSize: "9pt", color: C.accent, fontWeight: 600, marginBottom: 6 }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets.map((b, bi) => (
              <div key={bi} style={{ display: "flex", fontSize: "8.5pt", lineHeight: "17px", marginBottom: 5 }}>
                <span style={{ color: C.accent, fontSize: "5pt", marginRight: 8, marginTop: 4, flexShrink: 0 }}>●</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      </div>
      {/* Page number left bottom */}
      <div style={abs(PAD + 50, H - 8, 100, 20)}>
        <div style={{ fontSize: "7pt", color: C.sub, lineHeight: "20px" }}>Page 1</div>
      </div>
    </>
  );
}

// ─── PAGE 2 ───
function Page2({ d, theme }: { d: CVData; theme: ThemeName }) {
  const sideInner = SIDE_W - PAD * 2;  // 192px
  const bodyInner = BODY_W - PAD * 2;  // 520px
  const C = themes[theme];

  return (
    <>
      <div className="cv-page-sheet" style={{
        width: W, height: H, position: "relative", overflow: "hidden",
        background: "white", fontFamily: font, color: C.text,
      }}>
      {/* ── Backgrounds ── */}
      <div style={abs(0, 0, SIDE_W, H)}><div style={{ width: "100%", height: "100%", background: C.sidebarBg }} /></div>
      <div style={abs(ACCENT_X, 0, ACCENT_W, H)}><div style={{ width: "100%", height: "100%", background: C.accent }} /></div>

      {/* ── Sidebar: Education 20-226 ── */}
      <SH top={20} left={PAD} width={sideInner} C={C}>Education</SH>
      <div style={{ ...pos(PAD, 50, sideInner) }}>
        {d.education.slice(0, 2).map((edu, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "9pt", fontWeight: 700 }}>{edu.degree}</div>
            <div style={{ fontSize: "8.5pt", color: C.accent, fontWeight: 600 }}>{edu.school}</div>
            <div style={{ fontSize: "7.5pt", color: C.muted }}>{edu.year}</div>
          </div>
        ))}
      </div>

      {/* ── Sidebar: Certifications 226-580 ── */}
      {d.certifications && d.certifications.length > 0 && (
        <>
          <SH top={226} left={PAD} width={sideInner} C={C}>Certifications</SH>
          <div style={{ ...pos(PAD, 256, sideInner) }}>
            {d.certifications.slice(0, 7).map((cert, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: "8.5pt", fontWeight: 600 }}>{cert.name}</div>
                <div style={{ fontSize: "7.5pt", color: C.muted }}>
                  {cert.issuer}{cert.year ? ` · ${cert.year}` : ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Sidebar: Awards 580-1100 ── */}
      {d.awards && d.awards.length > 0 && (
        <>
          <SH top={580} left={PAD} width={sideInner} C={C}>Awards & Honours</SH>
          <div style={{ ...pos(PAD, 610, sideInner) }}>
            {d.awards.slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: "flex", marginBottom: 12 }}>
                <span style={{ color: C.accent, fontSize: "10px", marginRight: 6, marginTop: 2, flexShrink: 0 }}>★</span>
                <div>
                  <div style={{ fontSize: "8.5pt", fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: "7.5pt", color: C.muted }}>{a.description || ""}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Body: Career History 20-496 ── */}
      <SH top={20} left={BODY_X + PAD} width={bodyInner} C={C}>Career History</SH>
      <div style={{ ...pos(BODY_X + PAD, 50, bodyInner) }}>
        {d.history.map((exp, ei) => (
          <div key={ei} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontWeight: 700, fontSize: "9.5pt" }}>{exp.role}</div>
              <div style={{ fontSize: "8pt", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</div>
            </div>
            <div style={{ fontSize: "8.5pt", color: C.accent, fontWeight: 600, marginBottom: 2 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
            {exp.bullets.map((b, bi) => (
              <div key={bi} style={{ display: "flex", fontSize: "8pt", lineHeight: "15px", marginBottom: 4 }}>
                <span style={{ color: C.accent, fontSize: "5pt", marginRight: 8, marginTop: 3, flexShrink: 0 }}>●</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Body: Projects 496-856 ── */}
      <SH top={496} left={BODY_X + PAD} width={bodyInner} C={C}>Project Portfolio</SH>
      <div style={{ ...pos(BODY_X + PAD, 526, bodyInner) }}>
        {d.projects.slice(0, 2).map((p, i) => (
          <div key={i} style={{
            background: C.cardBg, border: `1px solid ${C.divider}`,
            borderLeft: `3px solid ${C.accent}`, borderRadius: 4,
            padding: "8px 10px", marginBottom: 10,
          }}>
            <div style={{ fontWeight: 700, fontSize: "9.5pt", marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: "8pt", lineHeight: 1.5, marginBottom: 4 }}>{p.description}</div>
            {p.tech && <div style={{ fontSize: "7.5pt", color: C.accent, fontWeight: 600 }}>Tech: {p.tech}</div>}
          </div>
        ))}
      </div>

      {/* ── Body: References 856-1060 ── */}
      {d.references && d.references.length > 0 && (
        <>
          <SH top={856} left={BODY_X + PAD} width={bodyInner} C={C}>References</SH>
          <div style={{ ...pos(BODY_X + PAD, 886, bodyInner), display: "flex", gap: 10 }}>
            {d.references.slice(0, 3).map((ref, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "8.5pt" }}>{ref.name}</div>
                <div style={{ fontSize: "7.5pt", color: C.accent, fontWeight: 600 }}>{ref.title}</div>
                <div style={{ fontSize: "7.5pt", color: C.muted }}>{ref.company}</div>
                <div style={{ fontSize: "7pt" }}>{ref.phone ? `☎ ${ref.phone}` : ""}</div>
                <div style={{ fontSize: "7pt" }}>{ref.email ? `✉ ${ref.email}` : ""}</div>
              </div>
            ))}
          </div>
        </>
      )}

      </div>
      {/* Page number left bottom */}
      <div style={abs(PAD + 50, H - 8, 100, 20)}>
        <div style={{ fontSize: "7pt", color: C.sub, lineHeight: "20px" }}>Page 2</div>
      </div>
    </>
  );
}

export default function CVTemplate({ data, theme = "corporate" }: { data: any; theme?: ThemeName }) {
  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        .cv-page-wrapper { 
          page-break-after: always; 
          box-shadow: 0 0 10px rgba(0,0,0,0.1); 
          margin: 20px auto; 
          padding: 20px;
          background: white;
          width: 834px;
          height: 1163px;
          position: relative;
        }
        .cv-page-wrapper + .cv-page-wrapper {
          margin-top: 40px;
        }
        @media print { 
          .cv-page-wrapper { 
            margin: 0; 
            box-shadow: none; 
            padding: 20px;
            width: 834px;
            height: 1163px;
            position: relative;
          } 
          .cv-page-wrapper + .cv-page-wrapper {
            margin-top: 0;
            page-break-before: always;
          }
        }
      `}</style>
      <div className="cv-page-wrapper">
        <Page1 d={data} theme={theme} />
      </div>
      <div className="cv-page-wrapper">
        <Page2 d={data} theme={theme} />
      </div>
    </>
  );
}