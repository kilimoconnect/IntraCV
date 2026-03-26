// ═══════════════════════════════════════════════════════════
// MID-SENIOR CV LAYOUT — Left Sidebar Professional Split
// ═══════════════════════════════════════════════════════════
// Design: Full-height colored LEFT sidebar with contact info at top,
// skills as horizontal bars, education, certs. Right side has name
// in sidebar header area, then white body with summary, experience,
// achievements, timeline-style entries with left-border accents.
// Distinctive look: colored sidebar runs full page height.
// ═══════════════════════════════════════════════════════════

import React, { useRef, useEffect, useState } from "react";
import { type CategoryCVData, type LayoutVariant, type ThemeName, type ThemeColors, themes, A4_W, A4_H, FONT } from "./cv-layout-types";
import { measureAllSections } from "./cv-constraint-engine";
import { paginateSections } from "./cv-pagination-engine";
import { PRINT_MARGIN } from "./cv-design-system";

// ── Page-fill hook: measures content height after paint and returns a CSS zoom ──
// The ref div uses flex (space-between) so its scrollHeight = container height.
// We sum each child's offsetHeight + margins to get the natural content height.
function usePageFill(budget: number, maxZoom = 1.35) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Wait one frame so the browser has fully laid out the content
    const raf = requestAnimationFrame(() => {
      // Sum children's natural heights (flex stretches the container itself)
      let contentH = 0;
      for (const child of Array.from(el.children)) {
        const ch = child as HTMLElement;
        const cs = getComputedStyle(ch);
        contentH += ch.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      }
      if (contentH > budget) {
        // Content overflows — scale down to fit, floor at 0.65 for readability
        const sf = Math.max(0.65, budget / contentH);
        setZoom(sf);
      } else if (contentH > 0 && contentH < budget * 0.92) {
        // Linear scale toward 92% fill, cap at maxZoom to keep text readable
        const sf = Math.min(maxZoom, (budget * 0.92) / contentH);
        setZoom(sf);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [budget, maxZoom]);

  return { ref, zoom };
}

interface Props { data: CategoryCVData; theme: ThemeName; variant?: LayoutVariant; }

const SIDE_W = 240;
const MAIN_X = SIDE_W;
const MAIN_W = A4_W - SIDE_W;
const SP = 16;

function SideLabel({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: "8.5px", fontWeight: 700, color: C.headerText, textTransform: "uppercase", letterSpacing: "1.8px", opacity: 0.7, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function MainHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

export default function CVLayoutMidSenior({ data: d, theme, variant = "A" }: Props) {
  // ── Hooks MUST be called before any conditional returns (Rules of Hooks) ──
  const P1_BODY_TOP = 28;
  const P1_BODY_BUDGET = A4_H - P1_BODY_TOP - PRINT_MARGIN.bottom;
  const p1Fill = usePageFill(P1_BODY_BUDGET, 1.30);
  const P2_CHROME = 32 + SP;
  const P2_BODY_BUDGET = A4_H - P2_CHROME - PRINT_MARGIN.bottom;
  const p2Fill = usePageFill(P2_BODY_BUDGET, 1.30);

  if (variant === "B") return <MidSeniorVariantB data={d} theme={theme} />;
  if (variant === "C") return <MidSeniorVariantC data={d} theme={theme} />;
  const C = themes[theme];
  const topExps = d.experience?.slice(0, 2) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(2) || [];

  // ── Engine: page budgets ──
  const BODY_W = MAIN_W - 40;
  // P1_BODY_TOP, P1_BODY_BUDGET, p1Fill already declared above
  const P2_BODY_W = A4_W - 52;
  // P2_CHROME, P2_BODY_BUDGET, p2Fill already declared above
  const SIDEBAR_BUDGET = A4_H - PRINT_MARGIN.bottom;

  return (
    <div>
      {/* ══════ PAGE 1 ══════ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* ── Full-Height Left Sidebar ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: SIDE_W, height: A4_H, backgroundColor: C.headerBg, padding: `0 ${SP}px`, display: "flex", flexDirection: "column", overflow: "auto" }}>

          {/* Name block at top of sidebar */}
          <div style={{ paddingTop: 28, paddingBottom: 20, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
            <div style={{ fontFamily: FONT, fontSize: "20px", fontWeight: 800, color: C.headerText, lineHeight: "24px" }}>{d.fullName}</div>
            <div style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 4, wordWrap: "break-word" }}>{d.title}</div>
          </div>

          {/* Contact */}
          <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
            <SideLabel C={C}>Contact</SideLabel>
            <div style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.85, lineHeight: "17px" }}>
              {d.email && <div>✉  {d.email}</div>}
              {d.phone && <div>☎  {d.phone}</div>}
              {d.location && <div>📍  {d.location}</div>}
              {d.linkedin && <div>in  {d.linkedin}</div>}
            </div>
          </div>

          {/* Skills — with bar indicators */}
          {d.skills?.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Core Competencies</SideLabel>
              {d.skills.map((skill, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: C.primary, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.9 }}>{skill}</span>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Education</SideLabel>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 8 : 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.headerText, lineHeight: "14px" }}>{edu.degree}</div>
                  <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.headerText, opacity: 0.7 }}>{edu.school} · {edu.year}</div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Certifications</SideLabel>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.headerText, lineHeight: "11px" }}>{cert.name}</div>
                  <div style={{ fontFamily: FONT, fontSize: "8px", color: C.headerText, opacity: 0.6 }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Languages</SideLabel>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9px", padding: "2px 0" }}>
                  <span style={{ fontWeight: 600, color: C.headerText }}>{lang.name}</span>
                  <span style={{ color: C.headerText, opacity: 0.6, fontSize: "8px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tools — inline pills */}
          {d.tools && d.tools.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Tools & Software</SideLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {d.tools.map((tool, i) => (
                  <span key={i} style={{ fontFamily: FONT, fontSize: "8px", fontWeight: 500, color: C.headerText, padding: "2px 7px", borderRadius: 10, border: `1px solid rgba(255,255,255,0.25)` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}

          {/* Memberships */}
          {d.memberships && d.memberships.length > 0 && (
            <div style={{ paddingTop: 14 }}>
              <SideLabel C={C}>Memberships</SideLabel>
              {d.memberships.map((m, i) => (
                <div key={i} style={{ fontFamily: FONT, fontSize: "8.5px", color: C.headerText, opacity: 0.8, padding: "2px 0" }}>• {m}</div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Main Body — Page 1 — flex distributes whitespace ── */}
        <div style={{ position: "absolute", top: P1_BODY_TOP, left: MAIN_X + 20, width: BODY_W, height: P1_BODY_BUDGET, overflow: "hidden" }}>
         <div ref={p1Fill.ref} style={{ minHeight: `${P1_BODY_BUDGET / p1Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p1Fill.zoom !== 1 ? { zoom: p1Fill.zoom } : {}) }}>

          {/* Summary */}
          {d.profile && (
            <div style={{ marginBottom: 16 }}>
              <MainHeading C={C}>Professional Summary</MainHeading>
              <p style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Experience — timeline style with left border */}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MainHeading C={C}>Experience</MainHeading>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 12 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.primary}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Achievements — numbered badges */}
          {d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MainHeading C={C}>Key Achievements</MainHeading>
              {d.achievements.map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary }}>{i + 1}</span>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, paddingTop: 2 }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
         </div>
        </div>
      </div>

      {/* ══════ PAGE 2 ══════ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Thin sidebar stripe — page 2 continuity */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 6, height: A4_H, backgroundColor: C.headerBg }} />

          {/* Page 2 name bar */}
          <div style={{ position: "absolute", top: 0, left: 6, width: A4_W - 6, height: 32, backgroundColor: C.sidebarBg, display: "flex", alignItems: "center", padding: "0 20px", borderBottom: `1px solid ${C.divider}` }}>
            <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{d.fullName}</span>
            <span style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted, marginLeft: 10 }}>Page 2</span>
          </div>

          {/* Page 2 body — flex distributes whitespace between sections */}
          <div style={{ position: "absolute", top: P2_CHROME, left: 26, width: P2_BODY_W, height: P2_BODY_BUDGET, overflow: "hidden" }}>
           <div ref={p2Fill.ref} style={{ minHeight: `${P2_BODY_BUDGET / p2Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p2Fill.zoom !== 1 ? { zoom: p2Fill.zoom } : {}) }}>

            {/* Career History — timeline */}
            {historyExps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MainHeading C={C}>Career History</MainHeading>
                {historyExps.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 10 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.divider}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                      <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>
                      {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                    </div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects — cards */}
            {d.projects && d.projects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MainHeading C={C}>Projects</MainHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {d.projects.map((proj, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                      <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{proj.name}</div>
                      <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: "3px 0", wordWrap: "break-word" }}>{proj.description}</p>
                      {proj.tech && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.primary, fontWeight: 500, wordWrap: "break-word" }}>{proj.tech}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {d.awards && d.awards.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MainHeading C={C}>Awards & Recognition</MainHeading>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                    <div>
                      <span style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                      {award.description && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* References */}
            {d.references?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <MainHeading C={C}>References</MainHeading>
                <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 3 ? "1fr 1fr 1fr" : d.references.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                  {d.references.map((ref, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                      <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{ref.name}</div>
                      <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, wordWrap: "break-word" }}>{ref.title}</div>
                      {ref.company && <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, wordWrap: "break-word" }}>{ref.company}</div>}
                      {ref.phone && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                      {ref.email && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>✉ {ref.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Declaration */}
            {d.declaration?.declaration && (
              <div>
                <MainHeading C={C}>Declaration</MainHeading>
                <p style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
                <div style={{ display: "flex", gap: 24, marginTop: 4, fontFamily: FONT, fontSize: "9px", color: C.muted }}>
                  {d.declaration.place && <span>Place: {d.declaration.place}</span>}
                  {d.declaration.date && <span>Date: {d.declaration.date}</span>}
                </div>
              </div>
            )}
           </div>
          </div>
        </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT B — Top Bar Split: dark header bar, light RIGHT sidebar, left body
// ═══════════════════════════════════════════════════════════

function BoldHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `2px solid ${C.primary}`, paddingBottom: 4, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function MidSeniorVariantB({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const RSIDE = 220;
  const BODY_W = A4_W - RSIDE;
  const topExps = d.experience?.slice(0, 2) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(2) || [];

  // ── Engine: page budgets ──
  const P1_CHROME = 83 + 16;
  const P1_BODY_BUDGET = A4_H - P1_CHROME - PRINT_MARGIN.bottom;
  const P1_SIDEBAR_BUDGET = A4_H - 83 - PRINT_MARGIN.bottom;
  const P2_BODY_BUDGET = A4_H - 50 - PRINT_MARGIN.bottom;

  // ── Space fillers: zoom content to eliminate empty bottom space ──
  const p1Fill = usePageFill(P1_BODY_BUDGET, 1.30);
  const p2Fill = usePageFill(P2_BODY_BUDGET, 1.30);

  return (
    <div>
      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Dark top header */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 80, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: "0 22px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontSize: "24px", fontWeight: 800, color: C.headerText }}>{d.fullName}</div>
            <div style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 2, wordWrap: "break-word" }}>{d.title}</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: FONT, fontSize: "8.5px", color: C.headerText, opacity: 0.7, lineHeight: "14px" }}>
            {d.email && <div>✉ {d.email}</div>}
            {d.phone && <div>☎ {d.phone}</div>}
            {d.location && <div>📍 {d.location}</div>}
            {d.linkedin && <div>in {d.linkedin}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 80, left: 0, width: A4_W, height: 3, backgroundColor: C.primary }} />

        {/* Light right sidebar */}
        <div style={{ position: "absolute", top: 83, right: 0, width: RSIDE, height: A4_H - 83, backgroundColor: C.sidebarBg, borderLeft: `2px solid ${C.divider}`, padding: "16px 16px", maxHeight: P1_SIDEBAR_BUDGET, overflow: "hidden" }}>
          {d.skills?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Core Competencies</div>
              {d.skills.map((skill, i) => (
                <div key={i} style={{ fontFamily: FONT, fontSize: "9px", color: C.text, padding: "2.5px 0", borderBottom: i < d.skills.length - 1 ? `1px solid ${C.divider}` : "none" }}>• {skill}</div>
              ))}
            </div>
          )}
          {d.education?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Education</div>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                  <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                </div>
              ))}
            </div>
          )}
          {d.certifications && d.certifications.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Certifications</div>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                  <div style={{ fontFamily: FONT, fontSize: "8px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {d.languages && d.languages.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Languages</div>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9px", padding: "2px 0" }}>
                  <span style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                  <span style={{ color: C.muted, fontSize: "8px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
          {d.tools && d.tools.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Tools</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {d.tools.map((tool, i) => (
                  <span key={i} style={{ fontFamily: FONT, fontSize: "8px", fontWeight: 500, color: C.primary, padding: "2px 7px", borderRadius: 10, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
          {d.memberships && d.memberships.length > 0 && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Memberships</div>
              {d.memberships.map((m, i) => (
                <div key={i} style={{ fontFamily: FONT, fontSize: "8.5px", color: C.text, padding: "2px 0" }}>• {m}</div>
              ))}
            </div>
          )}
        </div>

        {/* Left body — flex distributes whitespace */}
        <div style={{ position: "absolute", top: P1_CHROME, left: 22, width: BODY_W - 44, height: P1_BODY_BUDGET, overflow: "hidden" }}>
         <div ref={p1Fill.ref} style={{ minHeight: `${P1_BODY_BUDGET / p1Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p1Fill.zoom !== 1 ? { zoom: p1Fill.zoom } : {}) }}>
          {d.profile && (
            <div style={{ marginBottom: 16 }}>
              <BoldHeading C={C}>Professional Summary</BoldHeading>
              <p style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BoldHeading C={C}>Experience</BoldHeading>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 12 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {d.achievements && d.achievements.length > 0 && (
            <div>
              <BoldHeading C={C}>Key Achievements</BoldHeading>
              {d.achievements.map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>★</span>
                  <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
         </div>
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 32, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: "0 22px" }}>
          <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "8.5px", color: C.headerText, opacity: 0.5, marginLeft: 10 }}>Page 2</span>
          </div>
          <div style={{ position: "absolute", top: 32, left: 0, width: A4_W, height: 2, backgroundColor: C.primary }} />
          <div style={{ position: "absolute", top: 50, left: 22, width: A4_W - 44, height: P2_BODY_BUDGET, overflow: "hidden" }}>
           <div ref={p2Fill.ref} style={{ minHeight: `${P2_BODY_BUDGET / p2Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p2Fill.zoom !== 1 ? { zoom: p2Fill.zoom } : {}) }}>
            {historyExps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <BoldHeading C={C}>Career History</BoldHeading>
                {historyExps.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                      <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {d.projects && d.projects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <BoldHeading C={C}>Projects</BoldHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {d.projects.map((proj, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                      <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                      <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                      {proj.tech && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.primary }}>{proj.tech}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d.awards && d.awards.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <BoldHeading C={C}>Awards & Recognition</BoldHeading>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                    <div>
                      <span style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                      {award.description && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {d.references?.length > 0 && (
              <div>
                <BoldHeading C={C}>References</BoldHeading>
                <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 3 ? "1fr 1fr 1fr" : d.references.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                  {d.references.map((ref, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                      <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{ref.name}</div>
                      <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, wordWrap: "break-word" }}>{ref.title}</div>
                      {ref.company && <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, wordWrap: "break-word" }}>{ref.company}</div>}
                      {ref.phone && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                      {ref.email && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>✉ {ref.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
           </div>
          </div>
        </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT C — Full Width Cards: no sidebar, bold dividers, card sections
// ═══════════════════════════════════════════════════════════

function CardHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
      <div style={{ padding: "3px 12px", backgroundColor: C.primary, borderRadius: 4 }}>
        <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
      </div>
      <div style={{ flex: 1, height: 2, backgroundColor: C.divider, marginLeft: 8 }} />
    </div>
  );
}

function MidSeniorVariantC({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const MX = 32;
  const W = A4_W - MX * 2;
  const topExps = d.experience?.slice(0, 3) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(3) || [];

  // ── Engine: page budgets ──
  const P1_CHROME = 93 + 16;
  const P1_BODY_BUDGET = A4_H - P1_CHROME - PRINT_MARGIN.bottom;
  const P2_BODY_BUDGET = A4_H - 50 - PRINT_MARGIN.bottom;

  // ── Space fillers: zoom content to eliminate empty bottom space ──
  const p1Fill = usePageFill(P1_BODY_BUDGET, 1.30);
  const p2Fill = usePageFill(P2_BODY_BUDGET, 1.30);

  return (
    <div>
      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Full-width header */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 90, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${MX}px` }}>
          <div style={{ fontFamily: FONT, fontSize: "26px", fontWeight: 800, color: C.headerText }}>{d.fullName}</div>
          <div style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 2, wordWrap: "break-word" }}>{d.title}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 6, fontFamily: FONT, fontSize: "8.5px", color: C.headerText, opacity: 0.65 }}>
            {d.email && <span>✉ {d.email}</span>}
            {d.phone && <span>☎ {d.phone}</span>}
            {d.location && <span>📍 {d.location}</span>}
            {d.linkedin && <span>in {d.linkedin}</span>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 90, left: 0, width: A4_W, height: 3, backgroundColor: C.primary }} />

        {/* Full-width body — flex distributes whitespace */}
        <div style={{ position: "absolute", top: P1_CHROME, left: MX, width: W, height: P1_BODY_BUDGET, overflow: "hidden" }}>
         <div ref={p1Fill.ref} style={{ minHeight: `${P1_BODY_BUDGET / p1Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p1Fill.zoom !== 1 ? { zoom: p1Fill.zoom } : {}) }}>
          {d.profile && (
            <div style={{ marginBottom: 14 }}>
              <CardHeading C={C}>Professional Summary</CardHeading>
              <p style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Skills — inline row */}
          {d.skills?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <CardHeading C={C}>Core Competencies</CardHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {d.skills.map((skill, i) => (
                  <span key={i} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: C.primary, padding: "3px 10px", borderRadius: 4, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <CardHeading C={C}>Experience</CardHeading>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 10 : 0, padding: "8px 12px", backgroundColor: C.cardBg, borderRadius: 6, border: `1px solid ${C.divider}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: "10px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Achievements — two-column */}
          {d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <CardHeading C={C}>Key Achievements</CardHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {d.achievements.map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "6px 10px", backgroundColor: C.cardBg, borderRadius: 4, border: `1px solid ${C.divider}` }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>★</span>
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, wordWrap: "break-word" }}>{ach}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education + Certs two-col */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {d.education?.length > 0 && (
              <div>
                <CardHeading C={C}>Education</CardHeading>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                ))}
              </div>
            )}
            <div>
              {d.certifications && d.certifications.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <CardHeading C={C}>Certifications</CardHeading>
                  {d.certifications.map((cert, i) => (
                    <div key={i} style={{ marginBottom: 3 }}>
                      <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                      <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
              {d.languages && d.languages.length > 0 && (
                <div>
                  <CardHeading C={C}>Languages</CardHeading>
                  {d.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9px", padding: "2px 0" }}>
                      <span style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                      <span style={{ color: C.muted }}>{lang.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
         </div>
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 32, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: `0 ${MX}px` }}>
          <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "8.5px", color: C.headerText, opacity: 0.5, marginLeft: 10 }}>Page 2</span>
          </div>
          <div style={{ position: "absolute", top: 32, left: 0, width: A4_W, height: 2, backgroundColor: C.primary }} />
          <div style={{ position: "absolute", top: 50, left: MX, width: W, height: P2_BODY_BUDGET, overflow: "hidden" }}>
           <div ref={p2Fill.ref} style={{ minHeight: `${P2_BODY_BUDGET / p2Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p2Fill.zoom !== 1 ? { zoom: p2Fill.zoom } : {}) }}>
            {historyExps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <CardHeading C={C}>Career History</CardHeading>
                {historyExps.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 8 : 0, padding: "8px 12px", backgroundColor: C.cardBg, borderRadius: 6, border: `1px solid ${C.divider}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                      <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontFamily: FONT, fontSize: "9.5px", lineHeight: "15px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {d.projects && d.projects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <CardHeading C={C}>Projects</CardHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {d.projects.map((proj, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                      <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                      <p style={{ fontFamily: FONT, fontSize: "9px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                      {proj.tech && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.primary }}>{proj.tech}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d.awards && d.awards.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <CardHeading C={C}>Awards & Recognition</CardHeading>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, lineHeight: "15px" }}>🏆</span>
                    <div>
                      <span style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                      {award.description && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {d.references?.length > 0 && (
              <div>
                <CardHeading C={C}>References</CardHeading>
                <div style={{ display: "grid", gridTemplateColumns: d.references.length >= 3 ? "1fr 1fr 1fr" : d.references.length === 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
                  {d.references.map((ref, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                      <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{ref.name}</div>
                      <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, wordWrap: "break-word" }}>{ref.title}</div>
                      {ref.company && <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, wordWrap: "break-word" }}>{ref.company}</div>}
                      {ref.phone && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                      {ref.email && <div style={{ fontFamily: FONT, fontSize: "8.5px", color: C.muted }}>✉ {ref.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
           </div>
          </div>
        </div>
    </div>
  );
}
