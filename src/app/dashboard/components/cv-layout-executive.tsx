// ═══════════════════════════════════════════════════════════
// EXECUTIVE CV LAYOUT — Premium Centered Header + Right Dark Sidebar
// ═══════════════════════════════════════════════════════════
// Design: Elegant centered header with decorative horizontal lines,
// italic tagline, then two-column: LEFT main body with executive
// profile & experience, RIGHT dark sidebar with competencies,
// education, certifications. Board roles in premium card style.
// Distinctive: centered monogram header, right sidebar, gold accents.
// ═══════════════════════════════════════════════════════════

import React, { useRef, useState, useEffect } from "react";
import { type CategoryCVData, type LayoutVariant, type ThemeName, type ThemeColors, themes, A4_W, A4_H, FONT } from "./cv-layout-types";
import { PRINT_MARGIN } from "./cv-design-system";

// ── Fields consumed by this layout — used by the pipeline to load only what's needed ──
export const EXECUTIVE_REQUIRED_FIELDS: ReadonlyArray<keyof CategoryCVData> = [
  "fullName", "title", "email", "phone", "linkedin", "website", "location", "tagline",
  "profile", "skills", "experience", "history", "education", "certifications",
  "languages", "tools", "memberships", "achievements", "boardRoles", "executiveTraining",
  "publications", "references", "volunteer", "declaration", "awards", "projects",
];

function useSidebarSkillsTrim(
  sidebarRef: React.RefObject<HTMLDivElement | null>,
  budget: number,
  totalSkills: number,
  resetKey: string
) {
  const [maxSkills, setMaxSkills] = useState(totalSkills);
  const prevKeyRef = useRef(resetKey);
  if (prevKeyRef.current !== resetKey) {
    prevKeyRef.current = resetKey;
    setMaxSkills(totalSkills);
  }
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el || maxSkills === 0) return;
    const id = requestAnimationFrame(() => {
      if (el.scrollHeight > budget + 2) setMaxSkills(s => Math.max(0, s - 1));
    });
    return () => cancelAnimationFrame(id);
  }, [maxSkills, budget, sidebarRef]);
  return maxSkills;
}

interface Props { data: CategoryCVData; theme: ThemeName | ThemeColors; variant?: LayoutVariant; }

const SIDE_W = 230;
const MAIN_W = A4_W - SIDE_W;
const SP = 16;
const HEADER_H = 138; // increased from 120 to accommodate tagline

function RightLabel({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.headerText, textTransform: "uppercase", letterSpacing: "2px", opacity: 0.65, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function BodySection({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, border: `2px solid ${C.primary}`, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

function useBulletTrim(
  contentRef: React.RefObject<HTMLDivElement | null>,
  budget: number,
  resetKey: string
) {
  const [maxBullets, setMaxBullets] = useState(99);
  const prevKeyRef = useRef(resetKey);

  if (prevKeyRef.current !== resetKey) {
    prevKeyRef.current = resetKey;
    setMaxBullets(99);
  }

  useEffect(() => {
    const el = contentRef.current;
    if (!el || maxBullets === 0) return;
    const id = requestAnimationFrame(() => {
      if (el.scrollHeight > budget + 2) {
        setMaxBullets(b => Math.max(0, b - 1));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [maxBullets, budget]);

  return maxBullets;
}

export default function CVLayoutExecutive({ data: d, theme, variant = "A" }: Props) {
  // ── DOM measurement hooks (unconditional, before variant routing) ──
  const aMeasRef = useRef<HTMLDivElement>(null);
  const [aExpSplit, setAExpSplit] = useState(2);
  const aExpFP = d.experience?.map(e => e.bullets?.length || 0).join(",") || "";
  const P1_BODY_TOP_CONST = HEADER_H + 22 + SP;
  const P1_BODY_BUDGET_CONST = A4_H - P1_BODY_TOP_CONST - PRINT_MARGIN.bottom;
  const A_CONT_BODY_BUDGET_CONST = A4_H - (38 + SP) - PRINT_MARGIN.bottom;
  const p1BodyRef = useRef<HTMLDivElement>(null);
  const p2BodyRef = useRef<HTMLDivElement>(null);
  const expKey = (d.experience || []).map(e => (e.bullets || []).length).join(",");
  const histKey = (d.history?.length ? d.history : (d.experience || [])).map(e => (e.bullets || []).length).join(",");
  const p1MaxBullets = useBulletTrim(p1BodyRef, P1_BODY_BUDGET_CONST, expKey);
  const p2MaxBullets = useBulletTrim(p2BodyRef, A_CONT_BODY_BUDGET_CONST, histKey);
  const sidebarExecRef = useRef<HTMLDivElement>(null);
  const maxSkillsExec = useSidebarSkillsTrim(sidebarExecRef, A4_H - HEADER_H - 22 - PRINT_MARGIN.bottom, d.skills?.length || 0, (d.skills || []).join(","));

  useEffect(() => {
    const el = aMeasRef.current;
    if (!el) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        const heights: Record<string, number> = {};
        for (const child of Array.from(el.children)) {
          const mid = (child as HTMLElement).dataset.mid;
          if (mid) heights[mid] = Math.ceil(child.getBoundingClientRect().height);
        }
        const profileH = heights["profile"] || 0;
        const expHeadingH = 30;
        let used = profileH + expHeadingH + 6;
        let count = 0;
        for (let i = 0; i < (d.experience?.length || 0); i++) {
          const h = heights[`exp-${i}`] || 0;
          if (used + h > P1_BODY_BUDGET_CONST) break;
          used += h;
          count++;
        }
        // Always show at least 2 experiences on P1 when available — useBulletTrim will reduce bullets to fit
        const minOnP1 = Math.min(2, d.experience?.length || 1);
        const optimal = Math.max(minOnP1, count);
        setAExpSplit(prev => prev === optimal ? prev : optimal);
        if (process.env.NODE_ENV === "development") {
          console.log(`[Executive A DOM] budget=${P1_BODY_BUDGET_CONST}, expFit=${optimal}/${d.experience?.length || 0}`, heights);
        }
      });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [P1_BODY_BUDGET_CONST, aExpFP, d.profile]);

  if (variant === "B") return <ExecutiveVariantB data={d} theme={theme} />;
  if (variant === "C") return <ExecutiveVariantC data={d} theme={theme} />;
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const topExps = d.experience?.slice(0, aExpSplit) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(aExpSplit) || [];

  // ── Engine: page budgets ──
  const P1_BODY_TOP = P1_BODY_TOP_CONST;
  const P1_BODY_BUDGET = P1_BODY_BUDGET_CONST;
  const P1_SIDEBAR_BUDGET = A4_H - HEADER_H - 22 - PRINT_MARGIN.bottom;
  const CONT_CHROME = 38 + SP;
  const CONT_BODY_BUDGET = A4_H - CONT_CHROME - PRINT_MARGIN.bottom;
  const BODY_W = MAIN_W - 48;

  return (
    <div>
      {/* ── Hidden measurement container ── */}
      <div ref={aMeasRef} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: -9999, top: 0, width: BODY_W, overflow: "visible", fontFamily: FONT }}>
        {d.profile && (
          <div data-mid="profile" style={{ marginBottom: 16 }}>
            <BodySection C={C}>Executive Profile</BodySection>
            <p style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
          </div>
        )}
        {d.experience?.map((exp, i) => (
          <div key={i} data-mid={`exp-${i}`} style={{ marginBottom: 16, paddingLeft: 14, borderLeft: `3px solid ${C.primary}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
              <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8, fontStyle: "italic" }}>{exp.dates}</span>
            </div>
            <div style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6, wordWrap: "break-word" }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {d.achievements && d.achievements.length > 0 && (
          <div data-mid="achievements" style={{ marginBottom: 16 }}>
            <BodySection C={C}>Career Highlights</BodySection>
            {d.achievements.filter(a => a?.trim()).map((ach, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < d.achievements.length - 1 ? 6 : 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 700 }}>★</span>
                </div>
                <span style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, paddingTop: 2, wordWrap: "break-word" }}>{ach}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════ PAGE 1 ══════ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* ── Elegant Centered Header ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: HEADER_H, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          {/* Decorative line above name */}
          <div style={{ width: 60, height: 2, backgroundColor: C.primary, marginBottom: 10 }} />
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "30px", fontWeight: 800, color: C.headerText, letterSpacing: "2px", textTransform: "uppercase", lineHeight: "34px", maxWidth: A4_W - 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.fullName}</div>
          <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 4, letterSpacing: "1px", textTransform: "uppercase", maxWidth: A4_W - 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
          {d.tagline && (
            <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "10px", color: C.headerText, opacity: 0.55, marginTop: 6, fontStyle: "italic", maxWidth: A4_W - 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{d.tagline}"</div>
          )}
          {/* Decorative line below */}
          <div style={{ width: 60, height: 2, backgroundColor: C.primary, marginTop: 10 }} />
        </div>

        {/* ── Contact strip ── */}
        <div style={{ position: "absolute", top: HEADER_H, left: 0, width: A4_W, height: 22, backgroundColor: C.primaryDark, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 20, rowGap: 1, overflow: "hidden", paddingLeft: 16, paddingRight: 16 }}>
          {d.email && <span data-cv-field="email" style={{ fontFamily: FONT, fontSize: "9px", color: "#fff", opacity: 0.9 }}>✉ {d.email}</span>}
          {d.phone && <span data-cv-field="phone" style={{ fontFamily: FONT, fontSize: "9px", color: "#fff", opacity: 0.9 }}>☎ {d.phone}</span>}
          {d.location && <span data-cv-field="location" style={{ fontFamily: FONT, fontSize: "9px", color: "#fff", opacity: 0.9 }}>📍 {d.location}</span>}
          {d.linkedin && <span data-cv-field="linkedin" style={{ fontFamily: FONT, fontSize: "9px", color: "#fff", opacity: 0.9 }}>in {d.linkedin}</span>}
          {d.website && <span style={{ fontFamily: FONT, fontSize: "9px", color: "#fff", opacity: 0.9 }}>🌐 {d.website}</span>}
        </div>

        {/* ── RIGHT Dark Sidebar ── */}
        <div ref={sidebarExecRef} style={{ position: "absolute", top: HEADER_H + 22, right: 0, width: SIDE_W, height: A4_H - HEADER_H - 22, backgroundColor: C.headerBg, padding: `${SP}px ${SP}px`, display: "flex", flexDirection: "column", maxHeight: P1_SIDEBAR_BUDGET, overflow: "hidden" }}>

          {/* Core Leadership Competencies */}
          {d.skills?.length > 0 && (
            <div style={{ paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.12)`, marginBottom: 14 }}>
              <RightLabel C={C}>Core Competencies</RightLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px" }}>
                {d.skills.slice(0, maxSkillsExec).map((skill, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                    <div style={{ width: 3, height: 3, backgroundColor: C.primary, flexShrink: 0 }} />
                    <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.12)`, marginBottom: 14 }}>
              <RightLabel C={C}>Education</RightLabel>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 7 : 0 }}>
                  <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.headerText, lineHeight: "12px", overflowWrap: "break-word" }}>{edu.degree}</div>
                  <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.6, overflowWrap: "break-word" }}>{edu.school} · {edu.year}</div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.12)`, marginBottom: 14 }}>
              <RightLabel C={C}>Certifications</RightLabel>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 600, color: C.headerText, overflowWrap: "break-word" }}>{cert.name}</div>
                  <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "7.5px", color: C.headerText, opacity: 0.55, overflowWrap: "break-word" }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.12)`, marginBottom: 14 }}>
              <RightLabel C={C}>Languages</RightLabel>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9.5px", padding: "2px 0", gap: 4 }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.headerText, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.headerText, opacity: 0.5, fontSize: "9px", flexShrink: 0 }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Affiliations */}
          {d.memberships && d.memberships.length > 0 && (
            <div style={{ paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.12)`, marginBottom: 14 }}>
              <RightLabel C={C}>Professional Affiliations</RightLabel>
              {d.memberships.map((m, i) => (
                <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.75, padding: "1.5px 0" }}>• {m}</div>
              ))}
            </div>
          )}

          {/* Tools */}
          {d.tools && d.tools.length > 0 && (
            <div>
              <RightLabel C={C}>Tools & Platforms</RightLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {d.tools.map((tool, i) => (
                  <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "7.5px", fontWeight: 500, color: C.headerText, padding: "2px 6px", borderRadius: 8, border: `1px solid rgba(255,255,255,0.2)` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── LEFT Main Body — Page 1 ── */}
        <div ref={p1BodyRef} style={{ position: "absolute", top: P1_BODY_TOP, left: 24, width: MAIN_W - 48, maxHeight: P1_BODY_BUDGET, overflow: "hidden" }}>

          {/* Executive Profile */}
          {d.profile && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Executive Profile</BodySection>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Professional Experience — premium cards */}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Professional Experience</BodySection>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 16 : 0, paddingLeft: 14, borderLeft: `3px solid ${C.primary}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8, fontStyle: "italic" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6, wordWrap: "break-word" }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, p1MaxBullets).map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ══════ PAGE 2 ══════ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Thin top bar with decorative lines */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 36, backgroundColor: C.headerBg, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 30, height: 1, backgroundColor: C.primary }} />
          <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.headerText, letterSpacing: "2px", textTransform: "uppercase" }}>{d.fullName}</span>
          <div style={{ width: 30, height: 1, backgroundColor: C.primary }} />
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.5 }}>Page 2</span>
        </div>
        <div style={{ position: "absolute", top: 36, left: 0, width: A4_W, height: 2, backgroundColor: C.primary }} />

        {/* Right accent stripe — page 2 continuity */}
        <div style={{ position: "absolute", top: 38, right: 0, width: 6, height: A4_H - 38, backgroundColor: C.headerBg }} />

        {/* Page 2 body — full width */}
        <div ref={p2BodyRef} style={{ position: "absolute", top: CONT_CHROME, left: 24, width: A4_W - 54, maxHeight: CONT_BODY_BUDGET, overflow: "hidden" }}>

          {/* Career Highlights */}
          {d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Career Highlights</BodySection>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < d.achievements.length - 1 ? 6 : 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 700 }}>★</span>
                  </div>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, paddingTop: 2, wordWrap: "break-word" }}>{ach}</span>
                </div>
              ))}
            </div>
          )}

          {/* Career History */}
          {historyExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Career History</BodySection>
              {historyExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 10 : 0, paddingLeft: 14, borderLeft: `2px solid ${C.divider}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8, fontStyle: "italic" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6 }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, p2MaxBullets).map((b, bi) => (
                        <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Board & Advisory Roles — side by side, max 2 */}
          {d.boardRoles && d.boardRoles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Board & Advisory Roles</BodySection>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.boardRoles.slice(0, 2).map((role, i) => (
                  <div key={i} style={{ padding: "7px 12px", backgroundColor: C.cardBg, borderRadius: 4, borderLeft: `3px solid ${C.primary}`, borderBottom: `1px solid ${C.divider}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                      <span data-cv-field={`boardRole.${i}.title`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{role.title}</span>
                      <span data-cv-field={`boardRole.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, fontStyle: "italic", flexShrink: 0 }}>{role.dates}</span>
                    </div>
                    <div data-cv-field={`boardRole.${i}.organization`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 500 }}>{role.organization}</div>
                    {role.description && <p data-cv-field={`boardRole.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.muted, margin: "2px 0 0" }}>{role.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Training */}
          {d.executiveTraining && d.executiveTraining.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Executive Training</BodySection>
              {d.executiveTraining.map((tr, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span data-cv-field={`execTrain.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text, overflowWrap: "break-word" }}>{tr.name}</span>
                    {tr.institution && <span data-cv-field={`execTrain.${i}.institution`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, overflowWrap: "break-word" }}> — {tr.institution}</span>}
                  </div>
                  {tr.year && <span data-cv-field={`execTrain.${i}.year`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, flexShrink: 0 }}>{tr.year}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Key Projects</BodySection>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0", wordWrap: "break-word" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 500, wordWrap: "break-word" }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══════ PAGE 3 ══════ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Thin top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 36, backgroundColor: C.headerBg, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 30, height: 1, backgroundColor: C.primary }} />
          <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.headerText, letterSpacing: "2px", textTransform: "uppercase" }}>{d.fullName}</span>
          <div style={{ width: 30, height: 1, backgroundColor: C.primary }} />
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.5 }}>Page 3</span>
        </div>
        <div style={{ position: "absolute", top: 36, left: 0, width: A4_W, height: 2, backgroundColor: C.primary }} />
        <div style={{ position: "absolute", top: 38, right: 0, width: 6, height: A4_H - 38, backgroundColor: C.headerBg }} />

        <div style={{ position: "absolute", top: CONT_CHROME, left: 24, width: A4_W - 54, maxHeight: CONT_BODY_BUDGET, overflow: "hidden" }}>
          {/* Publications */}
          {d.publications && d.publications.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Publications & Speaking</BodySection>
              {d.publications.map((pub, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span data-cv-field={`pub.${i}.title`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text, wordWrap: "break-word" }}>{pub.title}</span>
                  {pub.publisher && <span data-cv-field={`pub.${i}.publisher`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> — {pub.publisher}</span>}
                  {pub.year && <span data-cv-field={`pub.${i}.year`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> ({pub.year})</span>}
                </div>
              ))}
            </div>
          )}
          {/* Awards */}
          {d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Awards & Recognition</BodySection>
              {d.awards.map((award, i) => (
                <div key={i} style={{ padding: "2.5px 0", borderBottom: i < d.awards.length - 1 ? `1px solid ${C.divider}` : "none" }}>
                  <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                  {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                </div>
              ))}
            </div>
          )}
          {/* References */}
          {d.references?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>References</BodySection>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 3 ? "1fr 1fr 1fr" : d.references.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, wordWrap: "break-word" }}>{ref.title}</div>
                    {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, wordWrap: "break-word" }}>{ref.company}</div>}
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteer */}
          {d.volunteer && d.volunteer.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BodySection C={C}>Community & Volunteer</BodySection>
              {d.volunteer.map((vol, i) => (
                <div key={i} style={{ marginBottom: i < d.volunteer!.length - 1 ? 6 : 0 }}>
                  <span data-cv-field={`vol.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text, wordWrap: "break-word" }}>{vol}</span>
                </div>
              ))}
            </div>
          )}

          {/* Declaration */}
          {d.declaration?.declaration && (
            <div>
              <BodySection C={C}>Declaration</BodySection>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 4, fontFamily: FONT, fontSize: "10px", color: C.muted }}>
                {d.declaration.date && <span data-cv-field="decl.date">Date: {d.declaration.date}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT B — Classic Columns: wide dark LEFT sidebar with monogram, right body with gold rules
// ═══════════════════════════════════════════════════════════

function ExecSideLabel({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.headerText, textTransform: "uppercase", letterSpacing: "2px", opacity: 0.6, marginBottom: 5, paddingBottom: 3, borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
      {children}
    </div>
  );
}

function ExecBodyH({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `2.5px solid ${C.primary}`, paddingBottom: 4, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ExecutiveVariantB({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const LS = 250;
  const RS = A4_W - LS;
  const INNER_W = RS - 44;

  // ── Engine: page budgets ──
  const P1_BODY_TOP = 28;
  const P1_BODY_BUDGET = A4_H - P1_BODY_TOP - PRINT_MARGIN.bottom;
  const SIDEBAR_BUDGET = A4_H - PRINT_MARGIN.bottom;
  const CONT_BODY_BUDGET = A4_H - 50 - PRINT_MARGIN.bottom;

  // ── DOM measurement for dynamic experience split ──
  const bMeasRef = useRef<HTMLDivElement>(null);
  const [bExpSplit, setBExpSplit] = useState(2);
  const bExpFP = d.experience?.map(e => e.bullets?.length || 0).join(",") || "";
  const p1BodyRef = useRef<HTMLDivElement>(null);
  const p2BodyRef = useRef<HTMLDivElement>(null);
  const expKey = (d.experience || []).map(e => (e.bullets || []).length).join(",");
  const histKey = (d.history?.length ? d.history : (d.experience || [])).map(e => (e.bullets || []).length).join(",");
  const p1MaxBullets = useBulletTrim(p1BodyRef, P1_BODY_BUDGET, expKey);
  const p2MaxBullets = useBulletTrim(p2BodyRef, CONT_BODY_BUDGET, histKey);

  useEffect(() => {
    const el = bMeasRef.current;
    if (!el) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        const heights: Record<string, number> = {};
        for (const child of Array.from(el.children)) {
          const mid = (child as HTMLElement).dataset.mid;
          if (mid) heights[mid] = Math.ceil(child.getBoundingClientRect().height);
        }
        const profileH = heights["profile"] || 0;
        const expHeadingH = 30;
        let used = profileH + expHeadingH + 6;
        let count = 0;
        for (let i = 0; i < (d.experience?.length || 0); i++) {
          const h = heights[`exp-${i}`] || 0;
          if (used + h > P1_BODY_BUDGET) break;
          used += h;
          count++;
        }
        const optimal = Math.max(1, count);
        setBExpSplit(prev => prev === optimal ? prev : optimal);
        if (process.env.NODE_ENV === "development") {
          console.log(`[Executive B DOM] budget=${P1_BODY_BUDGET}, expFit=${optimal}/${d.experience?.length || 0}`, heights);
        }
      });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [P1_BODY_BUDGET, bExpFP]);

  const topExps = d.experience?.slice(0, bExpSplit) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(bExpSplit) || [];

  return (
    <div>
      {/* ── Hidden measurement container ── */}
      <div ref={bMeasRef} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: -9999, top: 0, width: INNER_W, overflow: "visible", fontFamily: FONT }}>
        {d.profile && (
          <div data-mid="profile" style={{ marginBottom: 16 }}>
            <ExecBodyH C={C}>Executive Profile</ExecBodyH>
            <p style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
          </div>
        )}
        {d.experience?.map((exp, i) => (
          <div key={i} data-mid={`exp-${i}`} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
              <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, fontStyle: "italic" }}>{exp.dates}</span>
            </div>
            <div style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6 }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {d.achievements && d.achievements.length > 0 && (
          <div data-mid="achievements" style={{ marginBottom: 16 }}>
            <ExecBodyH C={C}>Career Highlights</ExecBodyH>
            {d.achievements.filter(a => a?.trim()).map((ach, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>★</span>
                <span style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text }}>{ach}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Wide dark left sidebar */}
        <div style={{ position: "absolute", top: 0, left: 0, width: LS, height: A4_H, backgroundColor: C.headerBg, padding: "0 18px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Monogram circle */}
          <div style={{ paddingTop: 28, paddingBottom: 18, display: "flex", flexDirection: "column", alignItems: "center", borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: FONT, fontSize: "20px", fontWeight: 800, color: C.primary }}>{d.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            </div>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "16px", fontWeight: 800, color: C.headerText, textAlign: "center", lineHeight: "20px", wordWrap: "break-word" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 3, textAlign: "center", wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.45, marginTop: 4, fontStyle: "italic", textAlign: "center" }}>"{d.tagline}"</div>}
          </div>
          {/* Contact */}
          <div style={{ paddingTop: 12, paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
            <ExecSideLabel C={C}>Contact</ExecSideLabel>
            <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.8, lineHeight: "14px" }}>
              {d.email && <div data-cv-field="email">✉ {d.email}</div>}
              {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
              {d.location && <div data-cv-field="location">📍 {d.location}</div>}
              {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
              {d.website && <div>🌐 {d.website}</div>}
            </div>
          </div>
          {/* Skills */}
          {d.skills?.length > 0 && (
            <div style={{ paddingTop: 12, paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
              <ExecSideLabel C={C}>Core Competencies</ExecSideLabel>
              {d.skills.map((skill, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 4, height: 4, backgroundColor: C.primary, flexShrink: 0 }} />
                  <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.85, wordWrap: "break-word" }}>{skill}</span>
                </div>
              ))}
            </div>
          )}
          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ paddingTop: 12, paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
              <ExecSideLabel C={C}>Education</ExecSideLabel>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                  <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.headerText, wordWrap: "break-word" }}>{edu.degree}</div>
                  <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.6 }}>{edu.school} · {edu.year}</div>
                </div>
              ))}
            </div>
          )}
          {/* Certifications */}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ paddingTop: 12, paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.12)` }}>
              <ExecSideLabel C={C}>Certifications</ExecSideLabel>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 3 }}>
                  <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 600, color: C.headerText, wordWrap: "break-word" }}>{cert.name}</div>
                  <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "7.5px", color: C.headerText, opacity: 0.5 }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ paddingTop: 12, paddingBottom: 12 }}>
              <ExecSideLabel C={C}>Languages</ExecSideLabel>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9.5px", padding: "2px 0" }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.headerText, wordWrap: "break-word" }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.headerText, opacity: 0.5, fontSize: "9px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right main body */}
        <div ref={p1BodyRef} style={{ position: "absolute", top: P1_BODY_TOP, left: LS + 20, width: RS - 40, maxHeight: P1_BODY_BUDGET, overflow: "hidden" }}>
          {d.profile && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Executive Profile</ExecBodyH>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Professional Experience</ExecBodyH>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, whiteSpace: "nowrap", fontStyle: "italic" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, p1MaxBullets).map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 32, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: "0 22px", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.5 }}>Page 2</span>
        </div>
        <div style={{ position: "absolute", top: 32, left: 0, width: A4_W, height: 2, backgroundColor: C.primary }} />
        <div ref={p2BodyRef} style={{ position: "absolute", top: 50, left: 22, width: A4_W - 44, maxHeight: CONT_BODY_BUDGET, overflow: "hidden" }}>
          {d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Career Highlights</ExecBodyH>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>★</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, wordWrap: "break-word" }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {historyExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Career History</ExecBodyH>
              {historyExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, fontStyle: "italic" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, p2MaxBullets).map((b, bi) => (
                        <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {d.boardRoles && d.boardRoles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Board & Advisory Roles</ExecBodyH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.boardRoles.slice(0, 2).map((role, i) => (
                  <div key={i} style={{ padding: "7px 12px", backgroundColor: C.cardBg, borderRadius: 4, borderLeft: `3px solid ${C.primary}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                      <span data-cv-field={`boardRole.${i}.title`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{role.title}</span>
                      <span data-cv-field={`boardRole.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, fontStyle: "italic", flexShrink: 0 }}>{role.dates}</span>
                    </div>
                    <div data-cv-field={`boardRole.${i}.organization`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 500 }}>{role.organization}</div>
                    {role.description && <p data-cv-field={`boardRole.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.muted, margin: "2px 0 0" }}>{role.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.executiveTraining && d.executiveTraining.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Executive Training</ExecBodyH>
              {d.executiveTraining.map((tr, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div><span data-cv-field={`execTrain.${i}.name`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: C.text, wordWrap: "break-word" }}>{tr.name}</span>{tr.institution && <span data-cv-field={`execTrain.${i}.institution`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> — {tr.institution}</span>}</div>
                  {tr.year && <span data-cv-field={`execTrain.${i}.year`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{tr.year}</span>}
                </div>
              ))}
            </div>
          )}
          {d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Key Projects</ExecBodyH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0", wordWrap: "break-word" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 500, wordWrap: "break-word" }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ PAGE 3 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 32, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: "0 22px", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.5 }}>Page 3</span>
        </div>
        <div style={{ position: "absolute", top: 32, left: 0, width: A4_W, height: 2, backgroundColor: C.primary }} />
        <div style={{ position: "absolute", top: 50, left: 22, width: A4_W - 44, maxHeight: CONT_BODY_BUDGET, overflow: "hidden" }}>
          {d.publications && d.publications.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Publications & Speaking</ExecBodyH>
              {d.publications.map((pub, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span data-cv-field={`pub.${i}.title`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: C.text, wordWrap: "break-word" }}>{pub.title}</span>
                  {pub.publisher && <span data-cv-field={`pub.${i}.publisher`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> — {pub.publisher}</span>}
                  {pub.year && <span data-cv-field={`pub.${i}.year`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> ({pub.year})</span>}
                </div>
              ))}
            </div>
          )}
          {d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Awards & Recognition</ExecBodyH>
              {d.awards.map((award, i) => (
                <div key={i} style={{ padding: "2.5px 0", borderBottom: i < d.awards.length - 1 ? `1px solid ${C.divider}` : "none" }}>
                  <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                  {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                </div>
              ))}
            </div>
          )}
          {d.references?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>References</ExecBodyH>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 3 ? "1fr 1fr 1fr" : d.references.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, wordWrap: "break-word" }}>{ref.title}</div>
                    {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, wordWrap: "break-word" }}>{ref.company}</div>}
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.volunteer && d.volunteer.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ExecBodyH C={C}>Community & Volunteer</ExecBodyH>
              {d.volunteer.map((vol, i) => (
                <div key={i} style={{ marginBottom: i < d.volunteer!.length - 1 ? 6 : 0 }}>
                  <span data-cv-field={`vol.${i}`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: C.text, wordWrap: "break-word" }}>{vol}</span>
                </div>
              ))}
            </div>
          )}
          {d.declaration?.declaration && (
            <div>
              <ExecBodyH C={C}>Declaration</ExecBodyH>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "12px", lineHeight: "17px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 4, fontFamily: FONT, fontSize: "10px", color: C.muted }}>
                {d.declaration.date && <span data-cv-field="decl.date">Date: {d.declaration.date}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT C — Minimal Premium: thin top accent, large name, two-column body
// ═══════════════════════════════════════════════════════════

function MinimalH({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{ width: 4, height: 14, backgroundColor: C.primary, borderRadius: 1, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "1.2px", wordWrap: "break-word" }}>{children}</span>
    </div>
  );
}

function ExecutiveVariantC({ data: d, theme }: { data: CategoryCVData; theme: ThemeName | ThemeColors }) {
  const C = typeof theme === "string" ? themes[theme as ThemeName] : theme;
  const MX = 36;
  const W = A4_W - MX * 2;

  // ── Engine: page budgets ──
  const P1_BODY_TOP = 130;
  const P1_BODY_BUDGET = A4_H - P1_BODY_TOP - PRINT_MARGIN.bottom;
  const CONT_BODY_BUDGET = A4_H - 60 - PRINT_MARGIN.bottom;

  // ── DOM measurement for dynamic experience split ──
  const cMeasRef = useRef<HTMLDivElement>(null);
  const [cExpSplit, setCExpSplit] = useState(2);
  const cExpFP = d.experience?.map(e => e.bullets?.length || 0).join(",") || "";
  const p1BodyRef = useRef<HTMLDivElement>(null);
  const p2BodyRef = useRef<HTMLDivElement>(null);
  const expKey = (d.experience || []).map(e => (e.bullets || []).length).join(",");
  const histKey = (d.history?.length ? d.history : (d.experience || [])).map(e => (e.bullets || []).length).join(",");
  const p1MaxBullets = useBulletTrim(p1BodyRef, P1_BODY_BUDGET, expKey);
  const p2MaxBullets = useBulletTrim(p2BodyRef, CONT_BODY_BUDGET, histKey);

  useEffect(() => {
    const el = cMeasRef.current;
    if (!el) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        const heights: Record<string, number> = {};
        for (const child of Array.from(el.children)) {
          const mid = (child as HTMLElement).dataset.mid;
          if (mid) heights[mid] = Math.ceil(child.getBoundingClientRect().height);
        }
        const profileH = heights["profile"] || 0;
        const boardH = heights["board"] || 0;
        const expHeadingH = 30;
        let used = profileH + boardH + expHeadingH + 6;
        let count = 0;
        for (let i = 0; i < (d.experience?.length || 0); i++) {
          const h = heights[`exp-${i}`] || 0;
          if (used + h > P1_BODY_BUDGET) break;
          used += h;
          count++;
        }
        const optimal = Math.max(1, count);
        setCExpSplit(prev => prev === optimal ? prev : optimal);
        if (process.env.NODE_ENV === "development") {
          console.log(`[Executive C DOM] budget=${P1_BODY_BUDGET}, expFit=${optimal}/${d.experience?.length || 0}`, heights);
        }
      });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [P1_BODY_BUDGET, cExpFP]);

  const topExps = d.experience?.slice(0, cExpSplit) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(cExpSplit) || [];

  return (
    <div>
      {/* ── Hidden measurement container ── */}
      <div ref={cMeasRef} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: -9999, top: 0, width: W, overflow: "visible", fontFamily: FONT }}>
        {d.profile && (
          <div data-mid="profile" style={{ marginBottom: 16 }}>
            <MinimalH C={C}>Executive Profile</MinimalH>
            <p style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
          </div>
        )}
        {d.experience?.map((exp, i) => (
          <div key={i} data-mid={`exp-${i}`} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
              <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, fontStyle: "italic" }}>{exp.dates}</span>
            </div>
            <div style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6 }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {d.achievements && d.achievements.length > 0 && (
          <div data-mid="achievements" style={{ marginBottom: 16 }}>
            <MinimalH C={C}>Career Highlights</MinimalH>
            {d.achievements.filter(a => a?.trim()).map((ach, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "19px" }}>★</span>
                <span style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text }}>{ach}</span>
              </div>
            ))}
          </div>
        )}
        {d.boardRoles && d.boardRoles.length > 0 && (
          <div data-mid="board" style={{ marginBottom: 16 }}>
            <MinimalH C={C}>Board & Advisory Roles</MinimalH>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {d.boardRoles.slice(0, 2).map((role, i) => (
                <div key={i}>
                  <div style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text }}>{role.title}</div>
                  <div style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600 }}>{role.organization} · {role.dates}</div>
                  {role.description && <div style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginTop: 2 }}>{role.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Thin top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 4, backgroundColor: C.primary }} />
        {/* Header — white bg, large name */}
        <div style={{ position: "absolute", top: 4, left: MX, width: W, paddingTop: 24, paddingBottom: 16, borderBottom: `1px solid ${C.divider}` }}>
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "30px", fontWeight: 800, color: C.text, letterSpacing: "1px", textTransform: "uppercase", lineHeight: "34px" }}>{d.fullName}</div>
          <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.primary, marginTop: 3, wordWrap: "break-word" }}>{d.title}</div>
          {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginTop: 5, fontStyle: "italic" }}>"{d.tagline}"</div>}
          <div style={{ display: "flex", gap: 18, marginTop: 8, fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>
            {d.email && <span data-cv-field="email">✉ {d.email}</span>}
            {d.phone && <span data-cv-field="phone">☎ {d.phone}</span>}
            {d.location && <span data-cv-field="location">📍 {d.location}</span>}
            {d.linkedin && <span data-cv-field="linkedin">in {d.linkedin}</span>}
            {d.website && <span>🌐 {d.website}</span>}
          </div>
        </div>

        {/* Two-column body */}
        <div style={{ position: "absolute", top: P1_BODY_TOP, left: MX, width: W, maxHeight: P1_BODY_BUDGET, overflow: "hidden", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 28, backgroundColor: "#fff" }}>
          {/* Left — main content */}
          <div ref={p1BodyRef} style={{ maxHeight: P1_BODY_BUDGET, overflow: "hidden" }}>
            {d.profile && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Executive Profile</MinimalH>
                <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
              </div>
            )}
            {topExps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Experience</MinimalH>
                {topExps.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 16 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                      <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, fontStyle: "italic" }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.slice(0, p1MaxBullets).map((b, bi) => (
                          <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — sidebar content */}
          <div style={{ maxHeight: P1_BODY_BUDGET, overflow: "hidden" }}>
            {d.skills?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Core Competencies</MinimalH>
                {d.skills.map((skill, i) => (
                  <div key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.text, padding: "2.5px 0", borderBottom: i < d.skills.length - 1 ? `1px solid ${C.divider}` : "none" }}>{skill}</div>
                ))}
              </div>
            )}
            {d.education?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Education</MinimalH>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                ))}
              </div>
            )}
            {d.certifications && d.certifications.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Certifications</MinimalH>
                {d.certifications.map((cert, i) => (
                  <div key={i} style={{ marginBottom: 3 }}>
                    <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                    <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            {d.languages && d.languages.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Languages</MinimalH>
                {d.languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                    <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                    <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            )}
            {d.memberships && d.memberships.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MinimalH C={C}>Affiliations</MinimalH>
                {d.memberships.map((m, i) => (
                  <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.text, padding: "2px 0" }}>• {m}</div>
                ))}
              </div>
            )}
            {d.tools && d.tools.length > 0 && (
              <div>
                <MinimalH C={C}>Tools</MinimalH>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {d.tools.map((tool, i) => (
                    <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 500, color: C.primary, padding: "2px 7px", borderRadius: 10, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{tool}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 4, backgroundColor: C.primary }} />
        <div style={{ position: "absolute", top: 4, left: MX, width: W, paddingTop: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}`, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 800, color: C.text, letterSpacing: "1px", textTransform: "uppercase" }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>Page 2</span>
        </div>
        <div ref={p2BodyRef} style={{ position: "absolute", top: 60, left: MX, width: W, maxHeight: CONT_BODY_BUDGET, overflow: "hidden" }}>
          {d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Career Highlights</MinimalH>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary }}>—</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {historyExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Career History</MinimalH>
              {historyExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, fontStyle: "italic" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, fontWeight: 600, marginBottom: 6, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.slice(0, p2MaxBullets).map((b, bi) => (
                        <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, marginBottom: 2.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {d.boardRoles && d.boardRoles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Board & Advisory Roles</MinimalH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.boardRoles.slice(0, 2).map((role, i) => (
                  <div key={i} style={{ padding: "7px 10px", backgroundColor: C.cardBg, borderRadius: 4, borderLeft: `3px solid ${C.primary}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                      <span data-cv-field={`boardRole.${i}.title`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{role.title}</span>
                      <span data-cv-field={`boardRole.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, fontStyle: "italic", flexShrink: 0 }}>{role.dates}</span>
                    </div>
                    <div data-cv-field={`boardRole.${i}.organization`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 500 }}>{role.organization}</div>
                    {role.description && <p data-cv-field={`boardRole.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.muted, margin: "2px 0 0" }}>{role.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.executiveTraining && d.executiveTraining.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Executive Training</MinimalH>
              {d.executiveTraining.map((tr, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div><span data-cv-field={`execTrain.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{tr.name}</span>{tr.institution && <span data-cv-field={`execTrain.${i}.institution`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> — {tr.institution}</span>}</div>
                  {tr.year && <span data-cv-field={`execTrain.${i}.year`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{tr.year}</span>}
                </div>
              ))}
            </div>
          )}
          {d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Key Projects</MinimalH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0", wordWrap: "break-word" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 500, wordWrap: "break-word" }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ PAGE 3 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 4, backgroundColor: C.primary }} />
        <div style={{ position: "absolute", top: 4, left: MX, width: W, paddingTop: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}`, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 800, color: C.text, letterSpacing: "1px", textTransform: "uppercase" }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>Page 3</span>
        </div>
        <div style={{ position: "absolute", top: 60, left: MX, width: W, maxHeight: CONT_BODY_BUDGET, overflow: "hidden" }}>
          {d.publications && d.publications.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Publications</MinimalH>
              {d.publications.map((pub, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span data-cv-field={`pub.${i}.title`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{pub.title}</span>
                  {pub.publisher && <span data-cv-field={`pub.${i}.publisher`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> — {pub.publisher}</span>}
                  {pub.year && <span data-cv-field={`pub.${i}.year`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}> ({pub.year})</span>}
                </div>
              ))}
            </div>
          )}
          {d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Awards & Recognition</MinimalH>
              {d.awards.map((award, i) => (
                <div key={i} style={{ padding: "2.5px 0", borderBottom: i < d.awards.length - 1 ? `1px solid ${C.divider}` : "none" }}>
                  <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{award.title}</span>
                  {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                </div>
              ))}
            </div>
          )}
          {d.references?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>References</MinimalH>
              <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 3 ? "1fr 1fr 1fr" : d.references.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 4, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, wordWrap: "break-word" }}>{ref.title}</div>
                    {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, wordWrap: "break-word" }}>{ref.company}</div>}
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.volunteer && d.volunteer.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MinimalH C={C}>Community & Volunteer</MinimalH>
              {d.volunteer.map((vol, i) => (
                <div key={i} style={{ marginBottom: i < d.volunteer!.length - 1 ? 6 : 0 }}>
                  <span data-cv-field={`vol.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{vol}</span>
                </div>
              ))}
            </div>
          )}
          {d.declaration?.declaration && (
            <div>
              <MinimalH C={C}>Declaration</MinimalH>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 4, fontFamily: FONT, fontSize: "10px", color: C.muted }}>
                {d.declaration.date && <span data-cv-field="decl.date">Date: {d.declaration.date}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
