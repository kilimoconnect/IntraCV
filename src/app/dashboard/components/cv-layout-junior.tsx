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
import { measureAllSections } from "./cv-constraint-engine";
import { paginateSections, type PaginationResult } from "./cv-pagination-engine";
import { PRINT_MARGIN } from "./cv-design-system";

interface Props { data: CategoryCVData; theme: ThemeName; variant?: LayoutVariant; }

function Heading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: C.primary, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
    </div>
  );
}

function HeadingLine({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

function HeadingUnderline({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      <div style={{ width: 40, height: 2, backgroundColor: C.primary, marginTop: 3, borderRadius: 1 }} />
    </div>
  );
}

export default function CVLayoutJunior({ data: d, theme, variant = "A" }: Props) {
  if (variant === "B") return <JuniorVariantB data={d} theme={theme} />;
  if (variant === "C") return <JuniorVariantC data={d} theme={theme} />;
  const C = themes[theme];
  const MX = 36;
  const COL_W = A4_W - MX * 2;
  const HEADER_H = 100;
  const CONTACT_H = 28;
  const BODY_TOP = HEADER_H + CONTACT_H + 16;
  const PAGE_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;

  // ── Engine: measure + paginate ──
  const measures = measureAllSections(d, COL_W);
  const plan = paginateSections(
    ["profile", "experience", "achievements", "skills", "education", "languages", "certifications", "projects", "awards", "volunteer", "references", "declaration"],
    measures,
    [PAGE_BUDGET],
  );
  const show = new Set(plan.pages[0]?.sections ?? []);

  return (
    <div style={{ width: A4_W }}>
      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* ── Colored Banner ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: HEADER_H, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: "28px", fontWeight: 800, color: C.headerText, letterSpacing: "-0.5px" }}>{d.fullName}</div>
          <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 500, color: C.headerText, opacity: 0.85, marginTop: 3 }}>{d.title}</div>
        </div>

        {/* ── Contact strip below banner ── */}
        <div style={{ position: "absolute", top: HEADER_H, left: 0, width: A4_W, height: CONTACT_H, backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          {d.email && <span style={{ fontFamily: FONT, fontSize: "8.5px", color: "#fff", opacity: 0.95 }}>✉ {d.email}</span>}
          {d.phone && <span style={{ fontFamily: FONT, fontSize: "8.5px", color: "#fff", opacity: 0.95 }}>☎ {d.phone}</span>}
          {d.location && <span style={{ fontFamily: FONT, fontSize: "8.5px", color: "#fff", opacity: 0.95 }}>📍 {d.location}</span>}
          {d.linkedin && <span style={{ fontFamily: FONT, fontSize: "8.5px", color: "#fff", opacity: 0.95 }}>in {d.linkedin}</span>}
        </div>

        {/* ── Body (height-budgeted) ── */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: COL_W, maxHeight: PAGE_BUDGET, overflow: "hidden" }}>

          {/* Summary */}
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Professional Summary</Heading>
              <p style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Experience */}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Experience</Heading>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {show.has("achievements") && d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Key Achievements</Heading>
              {d.achievements.map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, lineHeight: "15px" }}>★</span>
                  <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skills — pill cloud */}
          {show.has("skills") && d.skills?.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.divider}` }}>
              <Heading C={C}>Skills</Heading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {d.skills.map((skill, i) => (
                  <span key={i} style={{
                    fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.primary,
                    padding: "3px 11px", borderRadius: 20,
                    backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}`,
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Two-column row: Education + Certifications/Languages */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left: Education */}
            {show.has("education") && d.education?.length > 0 && (
              <div>
                <Heading C={C}>Education</Heading>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 7 : 0 }}>
                    <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                    {edu.details && <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, fontStyle: "italic" }}>{edu.details}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Right: Languages + Certifications */}
            <div>
              {show.has("languages") && d.languages && d.languages.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Heading C={C}>Languages</Heading>
                  {d.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9.5px", padding: "2px 0" }}>
                      <span style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                      <span style={{ color: C.muted }}>{lang.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {show.has("certifications") && d.certifications && d.certifications.length > 0 && (
                <div>
                  <Heading C={C}>Certifications</Heading>
                  {d.certifications.map((cert, i) => (
                    <div key={i} style={{ marginBottom: 3 }}>
                      <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                      <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          {show.has("projects") && d.projects && d.projects.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.divider}` }}>
              <Heading C={C}>Projects</Heading>
              <div style={{ display: "grid", gridTemplateColumns: d.projects.length >= 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "7px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                    {proj.tech && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.primary, fontWeight: 500 }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {show.has("awards") && d.awards && d.awards.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.divider}` }}>
              <Heading C={C}>Awards & Recognition</Heading>
              {d.awards.map((award, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                  <div>
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>{award.title}</span>
                    {award.description && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteer */}
          {show.has("volunteer") && d.volunteer && d.volunteer.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <Heading C={C}>Volunteer Experience</Heading>
              {d.volunteer.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 3 }}>
                  <span style={{ fontFamily: FONT, fontSize: "9px", color: C.primary, marginTop: 1 }}>●</span>
                  <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* References */}
          {show.has("references") && d.references?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <Heading C={C}>References</Heading>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 2 ? "1fr 1fr" : "1fr", gap: 8 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "6px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Declaration */}
          {show.has("declaration") && d.declaration?.declaration && (
            <div style={{ marginTop: 14 }}>
              <Heading C={C}>Declaration</Heading>
              <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 3, fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>
                {d.declaration.place && <span>Place: {d.declaration.place}</span>}
                {d.declaration.date && <span>Date: {d.declaration.date}</span>}
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

function JuniorVariantB({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const SIDE = 200;
  const MAIN_X = SIDE;
  const MAIN_W = A4_W - SIDE;
  const BODY_W = MAIN_W - 40;
  const BODY_TOP = 28;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;

  // ── Engine: measure + paginate body ──
  const measures = measureAllSections(d, BODY_W);
  const plan = paginateSections(
    ["profile", "experience", "achievements", "skills", "projects", "awards", "references"],
    measures,
    [BODY_BUDGET],
  );
  const show = new Set(plan.pages[0]?.sections ?? []);

  return (
    <div style={{ width: A4_W }}>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Left sidebar — light bg */}
        <div style={{ position: "absolute", top: 0, left: 0, width: SIDE, height: A4_H, backgroundColor: C.sidebarBg, borderRight: `3px solid ${C.primary}`, overflow: "hidden" }}>
          {/* Name */}
          <div style={{ padding: "28px 16px 18px", borderBottom: `1px solid ${C.divider}` }}>
            <div style={{ fontFamily: FONT, fontSize: "18px", fontWeight: 800, color: C.text, lineHeight: "22px" }}>{d.fullName}</div>
            <div style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.primary, marginTop: 3, wordWrap: "break-word" }}>{d.title}</div>
          </div>
          {/* Contact */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.divider}`, fontFamily: FONT, fontSize: "8.5px", color: C.muted, lineHeight: "14px" }}>
            {d.email && <div>✉ {d.email}</div>}
            {d.phone && <div>☎ {d.phone}</div>}
            {d.location && <div>📍 {d.location}</div>}
            {d.linkedin && <div>in {d.linkedin}</div>}
          </div>
          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Education</HeadingLine>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                  <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                </div>
              ))}
            </div>
          )}
          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.divider}` }}>
              <HeadingLine C={C}>Languages</HeadingLine>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9px", padding: "2px 0" }}>
                  <span style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                  <span style={{ color: C.muted, fontSize: "8px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
          {/* Certifications */}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ padding: "12px 16px" }}>
              <HeadingLine C={C}>Certifications</HeadingLine>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 3 }}>
                  <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                  <div style={{ fontFamily: FONT, fontSize: "8px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
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
              <p style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Experience</HeadingLine>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1.5 }}>{b}</li>
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
              {d.achievements.map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, lineHeight: "15px" }}>★</span>
                  <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {show.has("skills") && d.skills?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Skills</HeadingLine>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {d.skills.map((skill, i) => (
                  <span key={i} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.primary, padding: "3px 10px", borderRadius: 20, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {show.has("projects") && d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Projects</HeadingLine>
              {d.projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 6, padding: "6px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                  <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                  <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: "2px 0" }}>{proj.description}</p>
                  {proj.tech && <div style={{ fontFamily: FONT, fontSize: "8px", color: C.primary }}>{proj.tech}</div>}
                </div>
              ))}
            </div>
          )}
          {show.has("awards") && d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <HeadingLine C={C}>Awards</HeadingLine>
              {d.awards.map((award, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                  <div>
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>{award.title}</span>
                    {award.description && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
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
                    <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>✉ {ref.email}</div>}
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

function JuniorVariantC({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const MX = 32;
  const W = A4_W - MX * 2;
  const HEADER_H = 83; // 80px header + 3px border
  const BODY_TOP = 96;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;
  const LEFT_W = Math.floor((W - 24) * 1.4 / 2.4);
  const RIGHT_W = W - 24 - LEFT_W;

  // ── Engine: measure + paginate both columns ──
  const measL = measureAllSections(d, LEFT_W);
  const planL = paginateSections(
    ["profile", "experience", "achievements", "projects"],
    measL,
    [BODY_BUDGET],
  );
  const showL = new Set(planL.pages[0]?.sections ?? []);

  const measR = measureAllSections(d, RIGHT_W);
  const planR = paginateSections(
    ["skills", "education", "languages", "certifications", "awards", "volunteer", "references"],
    measR,
    [BODY_BUDGET],
  );
  const showR = new Set(planR.pages[0]?.sections ?? []);

  return (
    <div style={{ width: A4_W }}>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Split header: name left, contact right */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 80, display: "flex", alignItems: "center", padding: `0 ${MX}px`, borderBottom: `3px solid ${C.primary}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontSize: "24px", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{d.fullName}</div>
            <div style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 500, color: C.primary, marginTop: 2, wordWrap: "break-word" }}>{d.title}</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: FONT, fontSize: "8.5px", color: C.muted, lineHeight: "15px" }}>
            {d.email && <div>{d.email}</div>}
            {d.phone && <div>{d.phone}</div>}
            {d.location && <div>{d.location}</div>}
            {d.linkedin && <div>{d.linkedin}</div>}
          </div>
        </div>

        {/* Body — two columns */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: W, maxHeight: BODY_BUDGET, overflow: "hidden", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          {/* Left column — main content */}
          <div style={{ maxHeight: BODY_BUDGET, overflow: "hidden" }}>
            {showL.has("profile") && d.profile && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Summary</HeadingUnderline>
                <p style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0 }}>{d.profile}</p>
              </div>
            )}
            {showL.has("experience") && d.experience?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Experience</HeadingUnderline>
                {d.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                      <span style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14.5px", color: C.text, marginBottom: 1.5 }}>{b}</li>
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
                {d.achievements.map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, lineHeight: "15px" }}>★</span>
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text }}>{ach}</span>
                  </div>
                ))}
              </div>
            )}
            {showL.has("projects") && d.projects && d.projects.length > 0 && (
              <div>
                <HeadingUnderline C={C}>Projects</HeadingUnderline>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: "2px 0" }}>{proj.description}</p>
                    {proj.tech && <div style={{ fontFamily: FONT, fontSize: "8px", color: C.primary }}>{proj.tech}</div>}
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
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.text }}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("education") && d.education?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Education</HeadingUnderline>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("languages") && d.languages && d.languages.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Languages</HeadingUnderline>
                {d.languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9px", padding: "2px 0" }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                    <span style={{ color: C.muted }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("certifications") && d.certifications && d.certifications.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Certifications</HeadingUnderline>
                {d.certifications.map((cert, i) => (
                  <div key={i} style={{ marginBottom: 3 }}>
                    <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: "8px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("awards") && d.awards && d.awards.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Awards</HeadingUnderline>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                    <div>
                      <span style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.text }}>{award.title}</span>
                      {award.description && <span style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted, marginLeft: 3 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("volunteer") && d.volunteer && d.volunteer.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <HeadingUnderline C={C}>Volunteer</HeadingUnderline>
                {d.volunteer.map((v, i) => (
                  <div key={i} style={{ fontFamily: FONT, fontSize: "9px", color: C.text, padding: "2px 0" }}>• {v}</div>
                ))}
              </div>
            )}
            {showR.has("references") && d.references?.length > 0 && (
              <div>
                <HeadingUnderline C={C}>References</HeadingUnderline>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ marginBottom: 6, padding: "5px 8px", borderRadius: 4, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{ref.title}{ref.company ? `, ${ref.company}` : ""}</div>
                    {ref.phone && <div style={{ fontFamily: FONT, fontSize: "8px", color: C.muted }}>☎ {ref.phone}</div>}
                    {ref.email && <div style={{ fontFamily: FONT, fontSize: "8px", color: C.muted }}>✉ {ref.email}</div>}
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
