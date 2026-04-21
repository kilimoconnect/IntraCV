// ═══════════════════════════════════════════════════════════
// JUNIOR CV LAYOUT — Fresh Minimal Single-Column
// ═══════════════════════════════════════════════════════════
// Design: Full-width colored banner with large name, centered contact
// row, then clean single-column body. No sidebar. Skills as rounded
// pills. Two-column grid for Education + Languages at bottom.
// Distinctive look: top banner + accent underline + airy spacing.
// ═══════════════════════════════════════════════════════════

import React from "react";
import { type CategoryCVData, type LayoutVariant, type ThemeName, type ThemeColors, themes, A4_W, A4_H, FONT } from "./cv-layout-types";
import { PRINT_MARGIN } from "./cv-design-system";

// ── Fields consumed by this layout — used by the pipeline to load only what's needed ──
export const JUNIOR_REQUIRED_FIELDS: ReadonlyArray<keyof CategoryCVData> = [
  "fullName", "title", "email", "phone", "linkedin", "location", "tagline",
  "profile", "skills", "experience", "education", "certifications", "languages",
  "references", "projects", "achievements", "volunteer", "awards", "declaration",
];

interface Props { data: CategoryCVData; theme: ThemeName | ThemeColors; variant?: LayoutVariant; }

function Heading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: C.primary, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
    </div>
  );
}

function HeadingLine({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

function HeadingUnderline({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      <div style={{ width: 40, height: 2, backgroundColor: C.primary, marginTop: 3, borderRadius: 1 }} />
    </div>
  );
}

export default function CVLayoutJunior({ data: d, theme, variant = "A" }: Props) {
  if (variant === "B") return <JuniorVariantB data={d} theme={theme} />;
  if (variant === "C") return <JuniorVariantC data={d} theme={theme} />;
  if (variant === "D") return <JuniorVariantD data={d} theme={theme} />;
  if (variant === "E") return <JuniorVariantE data={d} theme={theme} />;
  if (variant === "F") return <JuniorVariantF data={d} theme={theme} />;
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const MX = 36;
  const COL_W = A4_W - MX * 2;
  const HEADER_H = 88; // compact: name + title only, no tagline in banner
  const CONTACT_H = 28;
  const BODY_TOP = HEADER_H + CONTACT_H + 12;
  const PAGE_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;

  // ── Fixed section manifest — strictly 1 page ──
  const show = new Set(["profile", "experience", "achievements", "skills", "education", "languages", "certifications", "references"]);

  return (
    <div>
      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* ── Colored Banner ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: HEADER_H, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "24px", fontWeight: 800, color: C.headerText, letterSpacing: "-0.5px", maxWidth: A4_W - 40, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.fullName}</div>
          <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 500, color: C.headerText, opacity: 0.85, marginTop: 3, maxWidth: A4_W - 40, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
          {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.6, marginTop: 3, fontStyle: "italic", maxWidth: A4_W - 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{d.tagline}"</div>}
        </div>

        {/* ── Contact strip below banner ── */}
        <div style={{ position: "absolute", top: HEADER_H, left: 0, width: A4_W, height: CONTACT_H, backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 16, rowGap: 2, overflow: "hidden", paddingLeft: 16, paddingRight: 16 }}>
          {d.email && <span data-cv-field="email" style={{ fontFamily: FONT, fontSize: "9.5px", color: "#fff", opacity: 0.95 }}>✉ {d.email}</span>}
          {d.phone && <span data-cv-field="phone" style={{ fontFamily: FONT, fontSize: "9.5px", color: "#fff", opacity: 0.95 }}>☎ {d.phone}</span>}
          {d.location && <span data-cv-field="location" style={{ fontFamily: FONT, fontSize: "9.5px", color: "#fff", opacity: 0.95 }}>📍 {d.location}</span>}
          {d.linkedin && <span data-cv-field="linkedin" style={{ fontFamily: FONT, fontSize: "9.5px", color: "#fff", opacity: 0.95 }}>in {d.linkedin}</span>}
        </div>

        {/* ── Body (height-budgeted) ── */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: COL_W, maxHeight: PAGE_BUDGET, overflow: "hidden" }}>

          {/* Summary */}
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 11, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Professional Summary</Heading>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11px", lineHeight: "18px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Experience — max 2 jobs, max 3 bullets each */}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 11, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Experience</Heading>
              {d.experience.slice(0, 2).map((exp, i) => (
                <div key={i} style={{ marginBottom: i < Math.min(d.experience.length, 2) - 1 ? 9 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, flex: 1, minWidth: 0, overflowWrap: "break-word" }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 2, overflowWrap: "break-word" }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, 5).map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "16px", color: C.text, marginBottom: 1, overflowWrap: "break-word" }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Achievements — max 3 */}
          {show.has("achievements") && d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 11, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Key Achievements</Heading>
              {d.achievements.filter(a => a?.trim()).slice(0, 3).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "16px" }}>★</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "16px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skills — pill cloud */}
          {show.has("skills") && d.skills?.length > 0 && (
            <div style={{ marginBottom: 11, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Skills</Heading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {d.skills.map((skill, i) => (
                  <span key={i} data-cv-field={`skill.${i}`} style={{
                    fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.primary,
                    padding: "3px 11px", borderRadius: 20,
                    backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}`,
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Two-column row: Education + Certifications/Languages */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 11 }}>
            {/* Left: Education */}
            {show.has("education") && d.education?.length > 0 && (
              <div style={{ minWidth: 0 }}>
                <Heading C={C}>Education</Heading>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ display: "flex", gap: 5, marginBottom: i < d.education.length - 1 ? 7 : 0 }}>
                    <div style={{ width: 2, flexShrink: 0, borderRadius: 1, background: C.accent, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, overflowWrap: "break-word" }}>{edu.degree}</div>
                      <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.muted, overflowWrap: "break-word" }}>{edu.school} · {edu.year}</div>
                      {edu.details && <div style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, fontStyle: "italic", overflowWrap: "break-word" }}>{edu.details}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Right: Languages + Certifications */}
            <div style={{ minWidth: 0 }}>
              {show.has("languages") && d.languages && d.languages.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Heading C={C}>Languages</Heading>
                  {d.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10.5px", padding: "2px 0" }}>
                      <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                      <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {show.has("certifications") && d.certifications && d.certifications.length > 0 && (
                <div>
                  <Heading C={C}>Certifications</Heading>
                  {d.certifications.map((cert, i) => (
                    <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                      <div style={{ flexShrink: 0, width: 13, height: 13, borderRadius: 2, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <span style={{ fontFamily: FONT, fontSize: "8px", color: C.accent, lineHeight: 1, fontWeight: 700 }}>✓</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                        <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* References */}
          {show.has("references") && d.references?.length > 0 && (
            <div style={{ paddingTop: 10, borderTop: `1px solid ${C.divider}` }}>
              <Heading C={C}>References</Heading>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 2 ? "1fr 1fr" : "1fr", gap: 6 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "5px 9px", borderRadius: 5, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, overflowWrap: "break-word" }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, overflowWrap: "break-word" }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT B — Clean Sidebar: thin colored left bar + contact, clean right body
// ═══════════════════════════════════════════════════════════

function JuniorVariantB({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const SIDE = 200;
  const MAIN_X = SIDE;
  const MAIN_W = A4_W - SIDE;
  const BODY_W = MAIN_W - 40;
  const BODY_TOP = 28;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;

  // ── Fixed body sections (sidebar carries education/languages/certs) ──
  const show = new Set(["profile", "experience", "achievements", "skills", "references"]);

  return (
    <div>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Left sidebar — light bg */}
        <div style={{ position: "absolute", top: 0, left: 0, width: SIDE, height: A4_H, backgroundColor: C.sidebarBg, borderRight: `3px solid ${C.primary}`, overflow: "hidden" }}>
          {/* Name */}
          <div style={{ padding: "28px 16px 18px", borderBottom: `1px solid ${C.divider}` }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "18px", fontWeight: 800, color: C.text, lineHeight: "22px" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.primary, marginTop: 3, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 4, fontStyle: "italic", wordWrap: "break-word" }}>"{d.tagline}"</div>}
          </div>
          {/* Contact */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.divider}`, fontFamily: FONT, fontSize: "9.5px", color: C.muted, lineHeight: "14px" }}>
            {d.email && <div data-cv-field="email">✉ {d.email}</div>}
            {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
            {d.location && <div data-cv-field="location">📍 {d.location}</div>}
            {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
          </div>
          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Education</HeadingLine>
              {d.education.map((edu, i) => (
                <div key={i} style={{ display: "flex", gap: 5, marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                  <div style={{ width: 2, flexShrink: 0, borderRadius: 1, background: C.accent, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Languages</HeadingLine>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted, fontSize: "9px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
          {/* Certifications */}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ padding: "12px 16px" }}>
              <HeadingLine C={C}>Certifications</HeadingLine>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                  <div style={{ flexShrink: 0, width: 13, height: 13, borderRadius: 2, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <span style={{ fontFamily: FONT, fontSize: "8px", color: C.accent, lineHeight: 1, fontWeight: 700 }}>✓</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                    <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right main body */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MAIN_X + 20, width: BODY_W, maxHeight: BODY_BUDGET, overflow: "hidden" }}>
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Professional Summary</HeadingLine>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Experience</HeadingLine>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {show.has("achievements") && d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Key Achievements</HeadingLine>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "17px" }}>★</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {show.has("skills") && d.skills?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Skills</HeadingLine>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {d.skills.map((skill, i) => (
                  <span key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.primary, padding: "3px 10px", borderRadius: 20, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {show.has("projects") && d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Projects</HeadingLine>
              {d.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 6, padding: "6px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                  <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                  <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "2px 0" }}>{proj.description}</p>
                  {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9px", color: C.primary }}>{proj.tech}</div>}
                </div>
              ))}
            </div>
          )}
          {show.has("awards") && d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Awards</HeadingLine>
              {d.awards.map((award, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                  <div>
                    <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{award.title}</span>
                    {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {show.has("references") && d.references?.length > 0 && (
            <div>
              <HeadingLine C={C}>References</HeadingLine>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 2 ? "1fr 1fr" : "1fr", gap: 8 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "6px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT C — Split Header: name left + contact right, two-column body
// ═══════════════════════════════════════════════════════════

function JuniorVariantC({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const MX = 32;
  const W = A4_W - MX * 2;
  const HEADER_H = 103; // 100px header + 3px border (increased from 83 to accommodate tagline)
  const BODY_TOP = 116;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;
  const LEFT_W = Math.floor((W - 24) * 1.4 / 2.4);
  const RIGHT_W = W - 24 - LEFT_W;

  // ── Fixed column sections — strictly 1 page ──
  const showL = new Set(["profile", "experience", "achievements"]);
  const showR = new Set(["skills", "education", "languages", "certifications", "references"]);

  return (
    <div>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Split header: name left, contact right */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 100, display: "flex", alignItems: "center", padding: `0 ${MX}px`, borderBottom: `3px solid ${C.primary}` }}>
          <div style={{ flex: 1 }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "24px", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 500, color: C.primary, marginTop: 2, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 3, fontStyle: "italic", wordWrap: "break-word" }}>"{d.tagline}"</div>}
          </div>
          <div style={{ textAlign: "right", fontFamily: FONT, fontSize: "9.5px", color: C.muted, lineHeight: "17px" }}>
            {d.email && <div data-cv-field="email">{d.email}</div>}
            {d.phone && <div data-cv-field="phone">{d.phone}</div>}
            {d.location && <div data-cv-field="location">{d.location}</div>}
            {d.linkedin && <div data-cv-field="linkedin">{d.linkedin}</div>}
          </div>
        </div>

        {/* Body — two columns */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: W, maxHeight: BODY_BUDGET, overflow: "hidden", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          {/* Left column — main content */}
          <div style={{ maxHeight: BODY_BUDGET, overflow: "hidden" }}>
            {showL.has("profile") && d.profile && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Summary</HeadingUnderline>
                <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
              </div>
            )}
            {showL.has("experience") && d.experience?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Experience</HeadingUnderline>
                {d.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                      <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14.5px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showL.has("achievements") && d.achievements && d.achievements.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Key Achievements</HeadingUnderline>
                {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "17px" }}>★</span>
                    <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text }}>{ach}</span>
                  </div>
                ))}
              </div>
            )}
            {showL.has("projects") && d.projects && d.projects.length > 0 && (
              <div>
                <HeadingUnderline C={C}>Projects</HeadingUnderline>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "2px 0" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9px", color: C.primary }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column — sidebar content */}
          <div style={{ maxHeight: BODY_BUDGET, overflow: "hidden" }}>
            {showR.has("skills") && d.skills?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Skills</HeadingUnderline>
                {d.skills.map((skill, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2.5px 0" }}>
                    <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary, flexShrink: 0 }} />
                    <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.text }}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("education") && d.education?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Education</HeadingUnderline>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ display: "flex", gap: 5, marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div style={{ width: 2, flexShrink: 0, borderRadius: 1, background: C.accent, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                      <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("languages") && d.languages && d.languages.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Languages</HeadingUnderline>
                {d.languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                    <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                    <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("certifications") && d.certifications && d.certifications.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Certifications</HeadingUnderline>
                {d.certifications.map((cert, i) => (
                  <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                    <div style={{ flexShrink: 0, width: 13, height: 13, borderRadius: 2, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      <span style={{ fontFamily: FONT, fontSize: "8px", color: C.accent, lineHeight: 1, fontWeight: 700 }}>✓</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                      <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("awards") && d.awards && d.awards.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Awards</HeadingUnderline>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                    <div>
                      <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{award.title}</span>
                      {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginLeft: 3 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("volunteer") && d.volunteer && d.volunteer.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Volunteer</HeadingUnderline>
                {d.volunteer.map((v, i) => (
                  <div key={i} data-cv-field={`vol.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.text, padding: "2px 0" }}>• {v}</div>
                ))}
              </div>
            )}
            {showR.has("references") && d.references?.length > 0 && (
              <div>
                <HeadingUnderline C={C}>References</HeadingUnderline>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ marginBottom: 6, padding: "5px 8px", borderRadius: 4, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT D — Dual Band: split colored header, balanced two-column body
// Left header: colored bg with name/title/tagline
// Right header: light bg with contact info
// Body: equal two columns — left (profile/experience/achievements) right (skills/education/languages/certs/projects/awards/volunteer/references)
// ═══════════════════════════════════════════════════════════

function JuniorVariantD({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const MX = 32;
  const W = A4_W - MX * 2;
  const HEADER_H = 82;
  const BODY_TOP = HEADER_H + 10;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;
  const COL_GAP = 20;
  const COL_W = Math.floor((W - COL_GAP) / 2);

  // ── Fixed column sections — strictly 1 page ──
  const showL = new Set(["profile", "experience", "achievements"]);
  const showR = new Set(["skills", "education", "languages", "certifications", "references"]);

  return (
    <div>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Split header band */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: HEADER_H, display: "flex", overflow: "hidden" }}>
          {/* Left: colored bg with name/title/tagline */}
          <div style={{ flex: 1.45, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "22px", fontWeight: 800, color: C.headerText, letterSpacing: "-0.3px" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 500, color: C.headerText, opacity: 0.82, marginTop: 3 }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.55, marginTop: 4, fontStyle: "italic" }}>"{d.tagline}"</div>}
          </div>
          {/* Right: light bg with contact */}
          <div style={{ flex: 1, backgroundColor: C.sidebarBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", borderLeft: `3px solid ${C.primary}` }}>
            <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, lineHeight: "15px" }}>
              {d.email && <div data-cv-field="email">✉ {d.email}</div>}
              {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
              {d.location && <div data-cv-field="location">📍 {d.location}</div>}
              {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: W, maxHeight: BODY_BUDGET, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: COL_GAP }}>

          {/* Left column: profile / experience / achievements */}
          <div style={{ overflow: "hidden" }}>
            {showL.has("profile") && d.profile && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Summary</HeadingLine>
                <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11px", lineHeight: "18px", color: C.text, margin: 0 }}>{d.profile}</p>
              </div>
            )}
            {showL.has("experience") && d.experience?.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Experience</HeadingLine>
                {d.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 9 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                      <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 600, marginBottom: 2 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "15px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showL.has("achievements") && d.achievements && d.achievements.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Key Achievements</HeadingLine>
                {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, lineHeight: "15px" }}>★</span>
                    <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "15px", color: C.text }}>{ach}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: skills / education / languages / certs / projects / awards / volunteer / references */}
          <div style={{ overflow: "hidden" }}>
            {showR.has("skills") && d.skills?.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Skills</HeadingLine>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px" }}>
                  {d.skills.map((skill, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary, flexShrink: 0 }} />
                      <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.text }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showR.has("education") && d.education?.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Education</HeadingLine>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ display: "flex", gap: 5, marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div style={{ width: 2, flexShrink: 0, borderRadius: 1, background: C.accent, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                      <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("languages") && d.languages && d.languages.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Languages</HeadingLine>
                {d.languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "1.5px 0" }}>
                    <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                    <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("certifications") && d.certifications && d.certifications.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Certifications</HeadingLine>
                {d.certifications.map((cert, i) => (
                  <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                    <div style={{ flexShrink: 0, width: 13, height: 13, borderRadius: 2, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      <span style={{ fontFamily: FONT, fontSize: "8px", color: C.accent, lineHeight: 1, fontWeight: 700 }}>✓</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                      <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("projects") && d.projects && d.projects.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Projects</HeadingLine>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: 6, padding: "5px 8px", borderRadius: 5, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "13px", color: C.text, margin: "2px 0" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9px", color: C.primary }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            )}
            {showR.has("awards") && d.awards && d.awards.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Awards</HeadingLine>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                    <div>
                      <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{award.title}</span>
                      {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginLeft: 3 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("volunteer") && d.volunteer && d.volunteer.length > 0 && (
              <div style={{ marginBottom: 13 }}>
                <HeadingLine C={C}>Volunteer</HeadingLine>
                {d.volunteer.map((v, i) => (
                  <div key={i} style={{ fontFamily: FONT, fontSize: "10px", color: C.text, padding: "1.5px 0" }}>• <span data-cv-field={`vol.${i}`}>{v}</span></div>
                ))}
              </div>
            )}
            {showR.has("references") && d.references?.length > 0 && (
              <div>
                <HeadingLine C={C}>References</HeadingLine>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ marginBottom: 5, padding: "5px 8px", borderRadius: 5, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT E — Stripe Minimal: thin top accent stripe, large left-aligned name,
// inline contact row, clean single-column body with HeadingUnderline sections.
// Skills rendered as a 3-column dot grid instead of pills.
// Supports 2-page overflow.
// ═══════════════════════════════════════════════════════════

function JuniorVariantE({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const MX = 36;
  const COL_W = A4_W - MX * 2;
  const STRIPE_H = 6;
  const HEADER_CONTENT_H = 90;
  const HEADER_H = STRIPE_H + HEADER_CONTENT_H;
  const BODY_TOP = HEADER_H + 10;
  const PAGE_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;

  // ── Fixed sections — strictly 1-page, core content only ──
  const show = new Set(["profile", "experience", "achievements", "skills", "education", "languages", "certifications", "references"]);

  const SkillsGrid = ({ label }: { label: string }) => (
    <div style={{ marginBottom: 13, paddingBottom: 11, borderBottom: `1px solid ${C.divider}` }}>
      <HeadingUnderline C={C}>{label}</HeadingUnderline>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 14px" }}>
        {d.skills.map((skill, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: C.primary, flexShrink: 0 }} />
            <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.text }}>{skill}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Top accent stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: STRIPE_H, backgroundColor: C.primary }} />

        {/* Header content */}
        <div style={{ position: "absolute", top: STRIPE_H, left: MX, width: COL_W, height: HEADER_CONTENT_H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "27px", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{d.fullName}</div>
          <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: C.primary, marginTop: 2 }}>{d.title}</div>
          {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2, fontStyle: "italic" }}>"{d.tagline}"</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 20px", marginTop: 7, fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>
            {d.email && <span data-cv-field="email">✉ {d.email}</span>}
            {d.phone && <span data-cv-field="phone">☎ {d.phone}</span>}
            {d.location && <span data-cv-field="location">📍 {d.location}</span>}
            {d.linkedin && <span data-cv-field="linkedin">in {d.linkedin}</span>}
          </div>
        </div>

        {/* Thin divider */}
        <div style={{ position: "absolute", top: HEADER_H + 4, left: MX, width: COL_W, height: 1, backgroundColor: C.primary, opacity: 0.25 }} />

        {/* Body */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: COL_W, maxHeight: PAGE_BUDGET, overflow: "hidden" }}>
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 11, paddingBottom: 9, borderBottom: `1px solid ${C.divider}` }}>
              <HeadingUnderline C={C}>Professional Summary</HeadingUnderline>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11px", lineHeight: "18px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {/* Experience — max 2 jobs, max 3 bullets each */}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 11, paddingBottom: 9, borderBottom: `1px solid ${C.divider}` }}>
              <HeadingUnderline C={C}>Experience</HeadingUnderline>
              {d.experience.slice(0, 2).map((exp, i) => (
                <div key={i} style={{ marginBottom: i < Math.min(d.experience.length, 2) - 1 ? 9 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, flex: 1, minWidth: 0, overflowWrap: "break-word" }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 2 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, 4).map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "16px", color: C.text, marginBottom: 1 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Achievements — max 3 */}
          {show.has("achievements") && d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 11, paddingBottom: 9, borderBottom: `1px solid ${C.divider}` }}>
              <HeadingUnderline C={C}>Key Achievements</HeadingUnderline>
              {d.achievements.filter(a => a?.trim()).slice(0, 3).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "16px" }}>★</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "16px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {show.has("skills") && d.skills?.length > 0 && <SkillsGrid label="Skills" />}

          {/* Two-column: education + languages/certifications */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 11 }}>
            {show.has("education") && d.education?.length > 0 && (
              <div>
                <HeadingUnderline C={C}>Education</HeadingUnderline>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ display: "flex", gap: 5, marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div style={{ width: 2, flexShrink: 0, borderRadius: 1, background: C.accent, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                      <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{edu.school} · {edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div>
              {show.has("languages") && d.languages && d.languages.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <HeadingUnderline C={C}>Languages</HeadingUnderline>
                  {d.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10.5px", padding: "2px 0" }}>
                      <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                      <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {show.has("certifications") && d.certifications && d.certifications.length > 0 && (
                <div>
                  <HeadingUnderline C={C}>Certifications</HeadingUnderline>
                  {d.certifications.map((cert, i) => (
                    <div key={i} style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                      <div style={{ flexShrink: 0, width: 13, height: 13, borderRadius: 2, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        <span style={{ fontFamily: FONT, fontSize: "8px", color: C.accent, lineHeight: 1, fontWeight: 700 }}>✓</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                        <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* References */}
          {show.has("references") && d.references?.length > 0 && (
            <div style={{ paddingTop: 10, borderTop: `1px solid ${C.divider}` }}>
              <HeadingUnderline C={C}>References</HeadingUnderline>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 2 ? "1fr 1fr" : "1fr", gap: 6 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "5px 9px", borderRadius: 5, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, overflowWrap: "break-word" }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, overflowWrap: "break-word" }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT F — Right Sidebar: distinct 210px right sidebar with skills/education/
// languages/certs, clean left main area with profile/experience/achievements.
// Header spans main area only — name/title/tagline left-aligned, bold underline.
// ═══════════════════════════════════════════════════════════

function JuniorVariantF({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const SIDE = 210;
  const MAIN_MX = 36;
  const MAIN_W = A4_W - SIDE - MAIN_MX;
  const HEADER_H = 97;
  const BODY_TOP = HEADER_H + 6;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;

  // ── Fixed body sections (sidebar carries skills/education/languages/certs) ──
  const show = new Set(["profile", "experience", "achievements", "references"]);

  return (
    <div>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Right sidebar — full height */}
        <div style={{ position: "absolute", top: 0, left: A4_W - SIDE, width: SIDE, height: A4_H, backgroundColor: C.sidebarBg, borderLeft: `3px solid ${C.primary}`, overflow: "hidden" }}>
          {/* Contact */}
          <div style={{ padding: "22px 14px 12px", borderBottom: `1px solid ${C.divider}` }}>
            <div style={{ fontFamily: FONT, fontSize: "8.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>Contact</div>
            <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, lineHeight: "15px" }}>
              {d.email && <div data-cv-field="email">✉ {d.email}</div>}
              {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
              {d.location && <div data-cv-field="location">📍 {d.location}</div>}
              {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
            </div>
          </div>
          {/* Skills */}
          {d.skills?.length > 0 && (
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Skills</HeadingLine>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 5px" }}>
                {d.skills.map((skill, i) => (
                  <span key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.primary, padding: "2px 8px", borderRadius: 20, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Education</HeadingLine>
              {d.education.map((edu, i) => (
                <div key={i} style={{ display: "flex", gap: 5, marginBottom: i < d.education.length - 1 ? 7 : 0 }}>
                  <div style={{ width: 2, flexShrink: 0, borderRadius: 1, background: C.accent, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Languages</HeadingLine>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9.5px", padding: "2px 0" }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted, fontSize: "8.5px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
          {/* Certifications */}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Certifications</HeadingLine>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  <div style={{ flexShrink: 0, width: 13, height: 13, borderRadius: 2, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <span style={{ fontFamily: FONT, fontSize: "8px", color: C.accent, lineHeight: 1, fontWeight: 700 }}>✓</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                    <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Awards in sidebar */}
          {d.awards && d.awards.length > 0 && (
            <div style={{ padding: "11px 14px" }}>
              <HeadingLine C={C}>Awards</HeadingLine>
              {d.awards.map((award, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>🏆 {award.title}</div>
                  {award.description && <div data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{award.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main header: name / title / tagline */}
        <div style={{ position: "absolute", top: 0, left: MAIN_MX, width: MAIN_W, height: HEADER_H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "24px", fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>{d.fullName}</div>
          <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: C.primary, marginTop: 3 }}>{d.title}</div>
          {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 3, fontStyle: "italic" }}>"{d.tagline}"</div>}
        </div>

        {/* Bold underline beneath header */}
        <div style={{ position: "absolute", top: HEADER_H, left: MAIN_MX, width: MAIN_W, height: 2, backgroundColor: C.primary }} />

        {/* Main body */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MAIN_MX, width: MAIN_W, maxHeight: BODY_BUDGET, overflow: "hidden" }}>
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 13 }}>
              <Heading C={C}>Professional Summary</Heading>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 13 }}>
              <Heading C={C}>Experience</Heading>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, flex: 1, minWidth: 0, overflowWrap: "break-word" }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 3, overflowWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5, overflowWrap: "break-word" }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {show.has("achievements") && d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 13 }}>
              <Heading C={C}>Key Achievements</Heading>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "17px" }}>★</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {show.has("projects") && d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 13 }}>
              <Heading C={C}>Projects</Heading>
              {d.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 6, padding: "6px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                  <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                  <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "2px 0" }}>{proj.description}</p>
                  {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
                </div>
              ))}
            </div>
          )}
          {show.has("volunteer") && d.volunteer && d.volunteer.length > 0 && (
            <div style={{ marginBottom: 13 }}>
              <Heading C={C}>Volunteer Experience</Heading>
              {d.volunteer.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, marginTop: 1 }}>●</span>
                  <span data-cv-field={`vol.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {show.has("references") && d.references?.length > 0 && (
            <div style={{ marginBottom: 13 }}>
              <Heading C={C}>References</Heading>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 2 ? "1fr 1fr" : "1fr", gap: 8 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "6px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {show.has("declaration") && d.declaration?.declaration && (
            <div>
              <Heading C={C}>Declaration</Heading>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 3, fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>
                {d.declaration.place && <span data-cv-field="decl.place">Place: {d.declaration.place}</span>}
                {d.declaration.date && <span data-cv-field="decl.date">Date: {d.declaration.date}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
