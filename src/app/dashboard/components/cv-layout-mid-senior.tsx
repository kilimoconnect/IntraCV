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
    <div style={{ fontFamily: FONT, fontSize: "9.5px", fontWeight: 700, color: C.headerText, textTransform: "uppercase", letterSpacing: "1.8px", opacity: 0.7, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function MainHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
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

  // ── DOM-based measurement for dynamic experience split (Variant A) ──
  const p1MeasureRef = useRef<HTMLDivElement>(null);
  const [expSplit, setExpSplit] = useState(2);
  const expFP = d.experience?.map(e => e.bullets?.length || 0).join(",") || "";

  useEffect(() => {
    const el = p1MeasureRef.current;
    if (!el) return; // no-op for variants B/C
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
        const budget = P1_BODY_BUDGET;
        const profileH = heights["profile"] || 0;
        const achievementsH = heights["achievements"] || 0;
        const expHeadingH = 30; // heading + margin
        const SAFETY_BUF = 6;
        let used = profileH + achievementsH + expHeadingH + SAFETY_BUF;
        let count = 0;
        for (let i = 0; i < (d.experience?.length || 0); i++) {
          const h = heights[`exp-${i}`] || 0;
          if (used + h > budget) break;
          used += h;
          count++;
        }
        const optimal = Math.max(1, count);
        setExpSplit(prev => prev === optimal ? prev : optimal);

        if (process.env.NODE_ENV === "development") {
          console.log(`[Mid-Senior A DOM] budget=${budget}, profile=${profileH}, achievements=${achievementsH}, expFit=${optimal}/${d.experience?.length || 0}`, heights);
        }
      });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [P1_BODY_BUDGET, expFP]);

  if (variant === "B") return <MidSeniorVariantB data={d} theme={theme} />;
  if (variant === "C") return <MidSeniorVariantC data={d} theme={theme} />;
  if (variant === "D") return <MidSeniorVariantD data={d} theme={theme} />;
  if (variant === "E") return <MidSeniorVariantE data={d} theme={theme} />;
  if (variant === "F") return <MidSeniorVariantF data={d} theme={theme} />;
  const C = themes[theme];
  const topExps = d.experience?.slice(0, expSplit) || [];
  const historyExps = d.history?.length ? d.history : d.experience?.slice(expSplit) || [];

  // ── Engine: page budgets ──
  const BODY_W = MAIN_W - 40;
  // P1_BODY_TOP, P1_BODY_BUDGET, p1Fill already declared above
  const P2_BODY_W = A4_W - 52;
  // P2_CHROME, P2_BODY_BUDGET, p2Fill already declared above
  const SIDEBAR_BUDGET = A4_H - PRINT_MARGIN.bottom;

  return (
    <div>
      {/* ── Hidden measurement container (pixel-perfect DOM heights) ── */}
      <div ref={p1MeasureRef} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", left: -9999, top: 0, width: BODY_W, overflow: "visible", fontFamily: FONT }}>
        {d.profile && (
          <div data-mid="profile" style={{ marginBottom: 16 }}>
            <MainHeading C={C}>Professional Summary</MainHeading>
            <p style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
          </div>
        )}
        {d.experience?.map((exp, i) => (
          <div key={i} data-mid={`exp-${i}`} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${C.primary}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
              <span style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
            </div>
            <div style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {d.achievements && d.achievements.length > 0 && (
          <div data-mid="achievements" style={{ marginBottom: 16 }}>
            <MainHeading C={C}>Key Achievements</MainHeading>
            {d.achievements.filter(a => a?.trim()).map((ach, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary }}>{i + 1}</span>
                </div>
                <span style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, paddingTop: 2 }}>{ach}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════ PAGE 1 ══════ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* ── Full-Height Left Sidebar ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: SIDE_W, height: A4_H, backgroundColor: C.headerBg, padding: `0 ${SP}px`, display: "flex", flexDirection: "column", overflow: "auto" }}>

          {/* Name block at top of sidebar */}
          <div style={{ paddingTop: 28, paddingBottom: 20, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "20px", fontWeight: 800, color: C.headerText, lineHeight: "24px" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "14px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 4, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.55, marginTop: 5, fontStyle: "italic", wordWrap: "break-word" }}>"{d.tagline}"</div>}
          </div>

          {/* Contact */}
          <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
            <SideLabel C={C}>Contact</SideLabel>
            <div style={{ fontFamily: FONT, fontSize: "10px", color: C.headerText, opacity: 0.85, lineHeight: "19px" }}>
              {d.email && <div data-cv-field="email">✉  {d.email}</div>}
              {d.phone && <div data-cv-field="phone">☎  {d.phone}</div>}
              {d.location && <div data-cv-field="location">📍  {d.location}</div>}
              {d.linkedin && <div data-cv-field="linkedin">in  {d.linkedin}</div>}
            </div>
          </div>

          {/* Skills — with bar indicators */}
          {d.skills?.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Core Competencies</SideLabel>
              {d.skills.map((skill, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: C.primary, flexShrink: 0 }} />
                  <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.headerText, opacity: 0.9 }}>{skill}</span>
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
                  <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.headerText, lineHeight: "14px" }}>{edu.degree}</div>
                  <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.7 }}>{edu.school} · {edu.year}</div>
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
                  <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.headerText, lineHeight: "12px" }}>{cert.name}</div>
                  <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.6 }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid rgba(255,255,255,0.15)` }}>
              <SideLabel C={C}>Languages</SideLabel>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.headerText }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.headerText, opacity: 0.6, fontSize: "9px" }}>{lang.label}</span>
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
                  <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 500, color: C.headerText, padding: "2px 7px", borderRadius: 10, border: `1px solid rgba(255,255,255,0.25)` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}

          {/* Memberships */}
          {d.memberships && d.memberships.length > 0 && (
            <div style={{ paddingTop: 14 }}>
              <SideLabel C={C}>Memberships</SideLabel>
              {d.memberships.map((m, i) => (
                <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.8, padding: "2px 0" }}>• {m}</div>
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
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Experience — timeline style with left border */}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <MainHeading C={C}>Experience</MainHeading>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 12 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.primary}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
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
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary }}>{i + 1}</span>
                  </div>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, paddingTop: 2 }}>{ach}</span>
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
            <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text }}>{d.fullName}</span>
            <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginLeft: 10 }}>Page 2</span>
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
                      <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                      <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>
                      {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                    </div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1 }}>{b}</li>
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
                      <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{proj.name}</div>
                      <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0", wordWrap: "break-word" }}>{proj.description}</p>
                      {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary, fontWeight: 500, wordWrap: "break-word" }}>{proj.tech}</div>}
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
                    <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                    <div>
                      <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                      {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
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

            {/* Declaration */}
            {d.declaration?.declaration && (
              <div>
                <MainHeading C={C}>Declaration</MainHeading>
                <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
                <div style={{ display: "flex", gap: 24, marginTop: 4, fontFamily: FONT, fontSize: "10px", color: C.muted }}>
                  {d.declaration.place && <span data-cv-field="decl.place">Place: {d.declaration.place}</span>}
                  {d.declaration.date && <span data-cv-field="decl.date">Date: {d.declaration.date}</span>}
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
    <div style={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `2px solid ${C.primary}`, paddingBottom: 4, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function MidSeniorVariantB({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const RSIDE = 220;
  const BODY_W = A4_W - RSIDE;
  const INNER_W = BODY_W - 44;

  // ── Engine: page budgets ──
  const P1_CHROME = 103 + 16; // 100px header + 3px border + 16 gap (increased from 83+16 to accommodate tagline)
  const P1_BODY_BUDGET = A4_H - P1_CHROME - PRINT_MARGIN.bottom;
  const P1_SIDEBAR_BUDGET = A4_H - 83 - PRINT_MARGIN.bottom;
  const P2_BODY_BUDGET = A4_H - 50 - PRINT_MARGIN.bottom;

  // ── Space fillers ──
  const p1Fill = usePageFill(P1_BODY_BUDGET, 1.0);
  const p2Fill = usePageFill(P2_BODY_BUDGET, 1.0);

  // ── DOM measurement for dynamic experience split ──
  const bMeasRef = useRef<HTMLDivElement>(null);
  const [bExpSplit, setBExpSplit] = useState(2);
  const bExpFP = d.experience?.map(e => e.bullets?.length || 0).join(",") || "";

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
        const achievementsH = heights["achievements"] || 0;
        const expHeadingH = 30;
        let used = profileH + achievementsH + expHeadingH + 6;
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
          console.log(`[Mid-Senior B DOM] budget=${P1_BODY_BUDGET}, expFit=${optimal}/${d.experience?.length || 0}`, heights);
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
            <BoldHeading C={C}>Professional Summary</BoldHeading>
            <p style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
          </div>
        )}
        {d.experience?.map((exp, i) => (
          <div key={i} data-mid={`exp-${i}`} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
              <span style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
            </div>
            <div style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {d.achievements && d.achievements.length > 0 && (
          <div data-mid="achievements" style={{ marginBottom: 16 }}>
            <BoldHeading C={C}>Key Achievements</BoldHeading>
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
        {/* Dark top header */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 100, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: "0 22px" }}>
          <div style={{ flex: 1 }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "24px", fontWeight: 800, color: C.headerText }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 2, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.5, marginTop: 3, fontStyle: "italic", wordWrap: "break-word" }}>"{d.tagline}"</div>}
          </div>
          <div style={{ textAlign: "right", fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.7, lineHeight: "14px" }}>
            {d.email && <div data-cv-field="email">✉ {d.email}</div>}
            {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
            {d.location && <div data-cv-field="location">📍 {d.location}</div>}
            {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 100, left: 0, width: A4_W, height: 3, backgroundColor: C.primary }} />

        {/* Light right sidebar */}
        <div style={{ position: "absolute", top: 103, right: 0, width: RSIDE, height: A4_H - 103, backgroundColor: C.sidebarBg, borderLeft: `2px solid ${C.divider}`, padding: "16px 16px", maxHeight: P1_SIDEBAR_BUDGET, overflow: "hidden" }}>
          {d.skills?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Core Competencies</div>
              {d.skills.map((skill, i) => (
                <div key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.text, padding: "2.5px 0", borderBottom: i < d.skills.length - 1 ? `1px solid ${C.divider}` : "none" }}>• {skill}</div>
              ))}
            </div>
          )}
          {d.education?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Education</div>
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
              <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Certifications</div>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                  <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                </div>
              ))}
            </div>
          )}
          {d.languages && d.languages.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Languages</div>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted, fontSize: "9px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
          {d.tools && d.tools.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Tools</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {d.tools.map((tool, i) => (
                  <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 500, color: C.primary, padding: "2px 7px", borderRadius: 10, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
          {d.memberships && d.memberships.length > 0 && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>Memberships</div>
              {d.memberships.map((m, i) => (
                <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.text, padding: "2px 0" }}>• {m}</div>
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
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {topExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <BoldHeading C={C}>Experience</BoldHeading>
              {topExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < topExps.length - 1 ? 12 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
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
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>★</span>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text }}>{ach}</span>
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
          <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.5, marginLeft: 10 }}>Page 2</span>
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
                      <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                      <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1 }}>{b}</li>
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
                      <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                      <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                      {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
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
                    <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                    <div>
                      <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                      {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
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
        <span style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
      </div>
      <div style={{ flex: 1, height: 2, backgroundColor: C.divider, marginLeft: 8 }} />
    </div>
  );
}

function MidSeniorVariantC({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const MX = 32;
  const W = A4_W - MX * 2;

  // ── Engine: page budgets ──
  const P1_CHROME = 113 + 16; // 110px header + 3px border + 16 gap (increased from 93+16 to accommodate tagline)
  const P1_BODY_BUDGET = A4_H - P1_CHROME - PRINT_MARGIN.bottom;
  const P2_BODY_BUDGET = A4_H - 50 - PRINT_MARGIN.bottom;

  // ── Space fillers ──
  const p1Fill = usePageFill(P1_BODY_BUDGET, 1.0);
  const p2Fill = usePageFill(P2_BODY_BUDGET, 1.0);

  // ── DOM measurement for dynamic experience split ──
  const cMeasRef = useRef<HTMLDivElement>(null);
  const [cExpSplit, setCExpSplit] = useState(3);
  const cExpFP = d.experience?.map(e => e.bullets?.length || 0).join(",") || "";

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
        const skillsH = heights["skills"] || 0;
        const achievementsH = heights["achievements"] || 0;
        const eduCertsH = heights["edu-certs"] || 0;
        const expHeadingH = 30;
        let used = profileH + skillsH + achievementsH + eduCertsH + expHeadingH + 6;
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
          console.log(`[Mid-Senior C DOM] budget=${P1_BODY_BUDGET}, expFit=${optimal}/${d.experience?.length || 0}`, heights);
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
          <div data-mid="profile" style={{ marginBottom: 14 }}>
            <CardHeading C={C}>Professional Summary</CardHeading>
            <p style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
          </div>
        )}
        {d.skills?.length > 0 && (
          <div data-mid="skills" style={{ marginBottom: 14 }}>
            <CardHeading C={C}>Core Competencies</CardHeading>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {d.skills.map((skill, i) => (
                <span key={i} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.primary, padding: "3px 10px", borderRadius: 4, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
              ))}
            </div>
          </div>
        )}
        {d.experience?.map((exp, i) => (
          <div key={i} data-mid={`exp-${i}`} style={{ marginBottom: 10, padding: "8px 12px", backgroundColor: C.cardBg, borderRadius: 6, border: `1px solid ${C.divider}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
              <span style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
            </div>
            <div style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>
              {exp.company}{exp.location ? ` — ${exp.location}` : ""}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {d.achievements && d.achievements.length > 0 && (
          <div data-mid="achievements" style={{ marginBottom: 14 }}>
            <CardHeading C={C}>Key Achievements</CardHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "6px 10px", backgroundColor: C.cardBg, borderRadius: 4, border: `1px solid ${C.divider}` }}>
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>★</span>
                  <span style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, wordWrap: "break-word" }}>{ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div data-mid="edu-certs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {d.education?.length > 0 && (
            <div>
              <CardHeading C={C}>Education</CardHeading>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                  <div style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{edu.school} · {edu.year}</div>
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
                    <div style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                    <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            {d.languages && d.languages.length > 0 && (
              <div>
                <CardHeading C={C}>Languages</CardHeading>
                {d.languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                    <span style={{ color: C.muted }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        {/* Full-width header */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: 110, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${MX}px` }}>
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "26px", fontWeight: 800, color: C.headerText }}>{d.fullName}</div>
          <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: C.headerText, opacity: 0.9, marginTop: 2, wordWrap: "break-word" }}>{d.title}</div>
          {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.55, marginTop: 3, fontStyle: "italic", wordWrap: "break-word" }}>"{d.tagline}"</div>}
          <div style={{ display: "flex", gap: 18, marginTop: 6, fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.65 }}>
            {d.email && <span data-cv-field="email">✉ {d.email}</span>}
            {d.phone && <span data-cv-field="phone">☎ {d.phone}</span>}
            {d.location && <span data-cv-field="location">📍 {d.location}</span>}
            {d.linkedin && <span data-cv-field="linkedin">in {d.linkedin}</span>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 110, left: 0, width: A4_W, height: 3, backgroundColor: C.primary }} />

        {/* Full-width body — flex distributes whitespace */}
        <div style={{ position: "absolute", top: P1_CHROME, left: MX, width: W, height: P1_BODY_BUDGET, overflow: "hidden" }}>
         <div ref={p1Fill.ref} style={{ minHeight: `${P1_BODY_BUDGET / p1Fill.zoom}px`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...(p1Fill.zoom !== 1 ? { zoom: p1Fill.zoom } : {}) }}>
          {d.profile && (
            <div style={{ marginBottom: 14 }}>
              <CardHeading C={C}>Professional Summary</CardHeading>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}

          {/* Skills — inline row */}
          {d.skills?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <CardHeading C={C}>Core Competencies</CardHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {d.skills.map((skill, i) => (
                  <span key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.primary, padding: "3px 10px", borderRadius: 4, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
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
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, wordWrap: "break-word", flex: 1, minWidth: 0 }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1.5 }}>{b}</li>
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
                {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "6px 10px", backgroundColor: C.cardBg, borderRadius: 4, border: `1px solid ${C.divider}` }}>
                    <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>★</span>
                    <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, wordWrap: "break-word" }}>{ach}</span>
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
                    <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{edu.degree}</div>
                    <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{edu.school} · {edu.year}</div>
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
                      <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                      <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
              {d.languages && d.languages.length > 0 && (
                <div>
                  <CardHeading C={C}>Languages</CardHeading>
                  {d.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                      <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                      <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
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
          <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.5, marginLeft: 10 }}>Page 2</span>
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
                      <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                      <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1 }}>{b}</li>
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
                      <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                      <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                      {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
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
                    <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                    <div>
                      <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{award.title}</span>
                      {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
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
           </div>
          </div>
        </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT D — Split Header Two-Column
// Colored header band: name/title/tagline left, contact right
// Body: left 58% (profile/experience/achievements) · right 42% (skills/education/certs/languages/tools/memberships)
// Page 2: career history + projects + awards + references
// ═══════════════════════════════════════════════════════════

function DHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ width: 3, height: 14, backgroundColor: C.primary, borderRadius: 1.5, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

function MidSeniorVariantD({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const MX = 30;
  const HEADER_H = 82;
  const BODY_TOP = HEADER_H + 10;
  const BODY_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;
  const W = A4_W - MX * 2;
  const COL_GAP = 20;
  const LEFT_W = Math.floor((W - COL_GAP) * 0.58);
  const RIGHT_W = W - COL_GAP - LEFT_W;
  const P2_CHROME = 36;
  const P2_BUDGET = A4_H - P2_CHROME - PRINT_MARGIN.bottom;
  const P2_W = A4_W - MX * 2;

  const measL = measureAllSections(d, LEFT_W);
  const planL = paginateSections(["profile", "experience", "achievements"], measL, [BODY_BUDGET]);
  const showL = new Set(planL.pages[0]?.sections ?? []);

  const measR = measureAllSections(d, RIGHT_W);
  const planR = paginateSections(["skills", "education", "certifications", "languages", "tools", "memberships"], measR, [BODY_BUDGET]);
  const showR = new Set(planR.pages[0]?.sections ?? []);

  const historyExps = d.history?.length ? d.history : (d.experience?.slice(2) ?? []);

  const refCols = d.references?.length >= 3 ? "1fr 1fr 1fr" : d.references?.length === 2 ? "1fr 1fr" : "1fr";

  return (
    <div>
      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Split header band */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: HEADER_H, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1.5, backgroundColor: C.headerBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "22px", fontWeight: 800, color: C.headerText, letterSpacing: "-0.3px" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 500, color: C.headerText, opacity: 0.85, marginTop: 3, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9px", color: C.headerText, opacity: 0.55, marginTop: 3, fontStyle: "italic" }}>"{d.tagline}"</div>}
          </div>
          <div style={{ flex: 1, backgroundColor: C.sidebarBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", borderLeft: `3px solid ${C.primary}` }}>
            <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, lineHeight: "15px" }}>
              {d.email && <div data-cv-field="email">✉ {d.email}</div>}
              {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
              {d.location && <div data-cv-field="location">📍 {d.location}</div>}
              {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: W, maxHeight: BODY_BUDGET, overflow: "hidden", display: "grid", gridTemplateColumns: `${LEFT_W}px ${RIGHT_W}px`, gap: COL_GAP }}>

          {/* Left: profile / experience / achievements */}
          <div style={{ overflow: "hidden" }}>
            {showL.has("profile") && d.profile && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Professional Summary</DHeading>
                <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11px", lineHeight: "18px", color: C.text, margin: 0 }}>{d.profile}</p>
              </div>
            )}
            {showL.has("experience") && d.experience?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Experience</DHeading>
                {d.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 10 : 0, paddingLeft: 10, borderLeft: `2px solid ${C.primary}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, flex: 1, minWidth: 0, wordWrap: "break-word" }}>{exp.role}</span>
                      <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, whiteSpace: "nowrap", marginLeft: 6 }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`exp.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "15.5px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showL.has("achievements") && d.achievements && d.achievements.length > 0 && (
              <div>
                <DHeading C={C}>Key Achievements</DHeading>
                {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary }}>{i + 1}</span>
                    </div>
                    <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "16px", color: C.text, paddingTop: 1 }}>{ach}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: skills / education / certs / languages / tools / memberships */}
          <div style={{ overflow: "hidden" }}>
            {showR.has("skills") && d.skills?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Core Competencies</DHeading>
                {d.skills.map((skill, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3.5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: C.primary, flexShrink: 0 }} />
                    <span data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.text }}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("education") && d.education?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Education</DHeading>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{edu.degree}</div>
                    <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("certifications") && d.certifications && d.certifications.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Certifications</DHeading>
                {d.certifications.map((cert, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.text, wordWrap: "break-word" }}>{cert.name}</div>
                    <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            {showR.has("languages") && d.languages && d.languages.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Languages</DHeading>
                {d.languages.map((lang, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "1.5px 0" }}>
                    <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                    <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted, fontSize: "9px" }}>{lang.label}</span>
                  </div>
                ))}
              </div>
            )}
            {showR.has("tools") && d.tools && d.tools.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <DHeading C={C}>Tools & Software</DHeading>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 4px" }}>
                  {d.tools.map((tool, i) => (
                    <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 500, color: C.primary, padding: "2px 7px", borderRadius: 10, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{tool}</span>
                  ))}
                </div>
              </div>
            )}
            {showR.has("memberships") && d.memberships && d.memberships.length > 0 && (
              <div>
                <DHeading C={C}>Memberships</DHeading>
                {d.memberships.map((m, i) => (
                  <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.text, padding: "1.5px 0" }}>• {m}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: P2_CHROME, backgroundColor: C.headerBg, display: "flex", alignItems: "center", padding: `0 ${MX}px` }}>
          <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.headerText }}>{d.fullName}</span>
          <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.headerText, opacity: 0.5, marginLeft: 10 }}>Page 2</span>
        </div>
        <div style={{ position: "absolute", top: P2_CHROME, left: MX, width: P2_W, maxHeight: P2_BUDGET, overflow: "hidden" }}>
          {historyExps.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <DHeading C={C}>Career History</DHeading>
              {historyExps.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 10 : 0, paddingLeft: 10, borderLeft: `2px solid ${C.divider}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{exp.role}</span>
                    <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <DHeading C={C}>Projects</DHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <DHeading C={C}>Awards & Recognition</DHeading>
              {d.awards.map((award, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                  <div>
                    <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{award.title}</span>
                    {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {d.references?.length > 0 && (
            <div>
              <DHeading C={C}>References</DHeading>
              <div style={{ display: "grid", gridTemplateColumns: refCols, gap: 10 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}</div>
                    {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.company}</div>}
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.declaration?.declaration && (
            <div style={{ marginTop: 16 }}>
              <DHeading C={C}>Declaration</DHeading>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "15px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT E — Modern Professional
// White header with large name, colored underline accent, inline contact row
// Single-column body: skills pill cloud at top, then timeline experience,
// achievements, education/certs grid, projects, awards, references
// Page 2: career history + overflow sections
// ═══════════════════════════════════════════════════════════

function EHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.4px" }}>{children}</span>
        <div style={{ flex: 1, height: 1.5, backgroundColor: C.primary, opacity: 0.25 }} />
      </div>
    </div>
  );
}

function MidSeniorVariantE({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const MX = 36;
  const COL_W = A4_W - MX * 2;
  const STRIPE_H = 5;
  const HEADER_CONTENT_H = 88;
  const HEADER_H = STRIPE_H + HEADER_CONTENT_H;
  const BODY_TOP = HEADER_H + 8;
  const PAGE_BUDGET = A4_H - BODY_TOP - PRINT_MARGIN.bottom;
  const P2_CHROME = 36;
  const P2_BUDGET = A4_H - P2_CHROME - PRINT_MARGIN.bottom;

  const measures = measureAllSections(d, COL_W);
  const plan = paginateSections(
    ["profile", "experience", "achievements", "skills", "education", "certifications", "languages", "tools", "memberships", "projects", "awards", "references", "declaration"],
    measures,
    [PAGE_BUDGET, P2_BUDGET],
  );
  const show = new Set(plan.pages[0]?.sections ?? []);
  const showP2 = new Set(plan.pages[1]?.sections ?? []);
  const historyExps = d.history?.length ? d.history : (d.experience?.slice(2) ?? []);

  const refCols = d.references?.length >= 3 ? "1fr 1fr 1fr" : d.references?.length === 2 ? "1fr 1fr" : "1fr";

  return (
    <div>
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Top accent stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: STRIPE_H, backgroundColor: C.primary }} />

        {/* Header content */}
        <div style={{ position: "absolute", top: STRIPE_H, left: MX, width: COL_W, height: HEADER_CONTENT_H, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "26px", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{d.fullName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: C.primary, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, fontStyle: "italic" }}>· "{d.tagline}"</div>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 20px", marginTop: 8, fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>
            {d.email && <span data-cv-field="email">✉ {d.email}</span>}
            {d.phone && <span data-cv-field="phone">☎ {d.phone}</span>}
            {d.location && <span data-cv-field="location">📍 {d.location}</span>}
            {d.linkedin && <span data-cv-field="linkedin">in {d.linkedin}</span>}
          </div>
        </div>

        {/* Divider */}
        <div style={{ position: "absolute", top: HEADER_H + 2, left: MX, width: COL_W, height: 2, backgroundColor: C.primary }} />

        {/* Body */}
        <div style={{ position: "absolute", top: BODY_TOP, left: MX, width: COL_W, maxHeight: PAGE_BUDGET, overflow: "hidden" }}>
          {show.has("skills") && d.skills?.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <EHeading C={C}>Core Competencies</EHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 5px" }}>
                {d.skills.map((skill, i) => (
                  <span key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 600, color: C.primary, padding: "3px 10px", borderRadius: 4, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <EHeading C={C}>Professional Summary</EHeading>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <EHeading C={C}>Experience</EHeading>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 12 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.primary}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, flex: 1, minWidth: 0, wordWrap: "break-word" }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
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
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <EHeading C={C}>Key Achievements</EHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", padding: "6px 10px", backgroundColor: C.cardBg, borderRadius: 4, border: `1px solid ${C.divider}` }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary }}>{i + 1}</span>
                    </div>
                    <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "16px", color: C.text, paddingTop: 1, wordWrap: "break-word" }}>{ach}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 14 }}>
            {show.has("education") && d.education?.length > 0 && (
              <div>
                <EHeading C={C}>Education</EHeading>
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 6 : 0 }}>
                    <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{edu.degree}</div>
                    <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{edu.school} · {edu.year}</div>
                  </div>
                ))}
              </div>
            )}
            <div>
              {show.has("certifications") && d.certifications && d.certifications.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <EHeading C={C}>Certifications</EHeading>
                  {d.certifications.map((cert, i) => (
                    <div key={i} style={{ marginBottom: 3 }}>
                      <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                      <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
              {show.has("languages") && d.languages && d.languages.length > 0 && (
                <div>
                  <EHeading C={C}>Languages</EHeading>
                  {d.languages.map((lang, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "10px", padding: "2px 0" }}>
                      <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                      <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted }}>{lang.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {show.has("tools") && d.tools && d.tools.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.divider}` }}>
              <EHeading C={C}>Tools & Software</EHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 5px" }}>
                {d.tools.map((tool, i) => (
                  <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 500, color: C.primary, padding: "2px 7px", borderRadius: 10, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
          {show.has("memberships") && d.memberships && d.memberships.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <EHeading C={C}>Memberships</EHeading>
              {d.memberships.map((m, i) => (
                <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "10px", color: C.text, padding: "1.5px 0" }}>• {m}</div>
              ))}
            </div>
          )}
          {show.has("projects") && d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <EHeading C={C}>Projects</EHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {show.has("awards") && d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <EHeading C={C}>Awards & Recognition</EHeading>
              {d.awards.map((award, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
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
              <EHeading C={C}>References</EHeading>
              <div style={{ display: "grid", gridTemplateColumns: refCols, gap: 10 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}</div>
                    {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.company}</div>}
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {show.has("declaration") && d.declaration?.declaration && (
            <div style={{ marginTop: 14 }}>
              <EHeading C={C}>Declaration</EHeading>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "15px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      {(showP2.size > 0 || historyExps.length > 0) && (
        <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: P2_CHROME, backgroundColor: C.sidebarBg, borderBottom: `2px solid ${C.primary}`, display: "flex", alignItems: "center", padding: `0 ${MX}px` }}>
            <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text }}>{d.fullName}</span>
            <span style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginLeft: 10 }}>Page 2</span>
          </div>
          <div style={{ position: "absolute", top: P2_CHROME, left: MX, width: COL_W, maxHeight: P2_BUDGET, overflow: "hidden" }}>
            {historyExps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <EHeading C={C}>Career History</EHeading>
                {historyExps.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 10 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.divider}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                      <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showP2.has("projects") && d.projects && d.projects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <EHeading C={C}>Projects</EHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {d.projects.map((proj, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                      <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                      <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                      {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showP2.has("references") && d.references?.length > 0 && (
              <div>
                <EHeading C={C}>References</EHeading>
                <div style={{ display: "grid", gridTemplateColumns: refCols, gap: 10 }}>
                  {d.references.map((ref, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                      <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                      <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}</div>
                      {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.company}</div>}
                      {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                      {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT F — Editorial Sidebar
// White left sidebar (185px) with name/title/tagline + contact/education/languages/memberships
// Right main area: colored skills strip at top (38px), then profile/experience/achievements/certs/tools/projects
// Clean editorial magazine-style layout. Page 2: career history + awards + references
// ═══════════════════════════════════════════════════════════

function FSideLabel({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.6px", marginBottom: 5 }}>
      {children}
    </div>
  );
}

function FMainHeading({ children, C }: { children: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "1.3px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

function MidSeniorVariantF({ data: d, theme }: { data: CategoryCVData; theme: ThemeName }) {
  const C = themes[theme];
  const SIDE = 185;
  const SP = 14;
  const SKILLS_STRIP_H = 76;
  const MAIN_X = SIDE + 20;
  const MAIN_W = A4_W - SIDE - 20 - 26; // 26px right margin
  const PAGE_BUDGET = A4_H - SKILLS_STRIP_H - 8 - PRINT_MARGIN.bottom;
  const P2_CHROME = 36;
  const P2_BUDGET = A4_H - P2_CHROME - PRINT_MARGIN.bottom;

  const measures = measureAllSections(d, MAIN_W);
  const plan = paginateSections(
    ["profile", "experience", "achievements", "certifications", "tools", "projects", "awards", "references", "declaration"],
    measures,
    [PAGE_BUDGET, P2_BUDGET],
  );
  const show = new Set(plan.pages[0]?.sections ?? []);
  const showP2 = new Set(plan.pages[1]?.sections ?? []);
  const historyExps = d.history?.length ? d.history : (d.experience?.slice(2) ?? []);

  const refCols = d.references?.length >= 3 ? "1fr 1fr 1fr" : d.references?.length === 2 ? "1fr 1fr" : "1fr";

  return (
    <div>
      {/* ══ PAGE 1 ══ */}
      <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>

        {/* Left sidebar — white with primary right border */}
        <div style={{ position: "absolute", top: 0, left: 0, width: SIDE, height: A4_H, backgroundColor: C.sidebarBg, borderRight: `3px solid ${C.primary}`, overflow: "hidden" }}>
          {/* Name / Title / Tagline block */}
          <div style={{ padding: `22px ${SP}px 16px`, borderBottom: `1px solid ${C.divider}` }}>
            <div data-cv-field="fullName" style={{ fontFamily: FONT, fontSize: "17px", fontWeight: 800, color: C.text, lineHeight: "21px", wordWrap: "break-word" }}>{d.fullName}</div>
            <div data-cv-field="title" style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 600, color: C.primary, marginTop: 3, wordWrap: "break-word" }}>{d.title}</div>
            {d.tagline && <div data-cv-field="tagline" style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginTop: 4, fontStyle: "italic", wordWrap: "break-word" }}>"{d.tagline}"</div>}
          </div>
          {/* Contact */}
          <div style={{ padding: `12px ${SP}px`, borderBottom: `1px solid ${C.divider}` }}>
            <FSideLabel C={C}>Contact</FSideLabel>
            <div style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, lineHeight: "15px" }}>
              {d.email && <div data-cv-field="email">✉ {d.email}</div>}
              {d.phone && <div data-cv-field="phone">☎ {d.phone}</div>}
              {d.location && <div data-cv-field="location">📍 {d.location}</div>}
              {d.linkedin && <div data-cv-field="linkedin">in {d.linkedin}</div>}
            </div>
          </div>
          {/* Education */}
          {d.education?.length > 0 && (
            <div style={{ padding: `12px ${SP}px`, borderBottom: `1px solid ${C.divider}` }}>
              <FSideLabel C={C}>Education</FSideLabel>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: i < d.education.length - 1 ? 7 : 0 }}>
                  <div data-cv-field={`edu.${i}.degree`} style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.text, wordWrap: "break-word" }}>{edu.degree}</div>
                  <div data-cv-field={`edu.${i}.school`} style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{edu.school} · {edu.year}</div>
                </div>
              ))}
            </div>
          )}
          {/* Languages */}
          {d.languages && d.languages.length > 0 && (
            <div style={{ padding: `12px ${SP}px`, borderBottom: `1px solid ${C.divider}` }}>
              <FSideLabel C={C}>Languages</FSideLabel>
              {d.languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: "9.5px", padding: "2px 0" }}>
                  <span data-cv-field={`lang.${i}.name`} style={{ fontWeight: 600, color: C.text }}>{lang.name}</span>
                  <span data-cv-field={`lang.${i}.label`} style={{ color: C.muted, fontSize: "8.5px" }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
          {/* Memberships */}
          {d.memberships && d.memberships.length > 0 && (
            <div style={{ padding: `12px ${SP}px` }}>
              <FSideLabel C={C}>Memberships</FSideLabel>
              {d.memberships.map((m, i) => (
                <div key={i} data-cv-field={`memb.${i}`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.text, padding: "1.5px 0" }}>• {m}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right: colored skills strip at top */}
        {d.skills?.length > 0 && (
          <div style={{ position: "absolute", top: 0, left: SIDE, width: A4_W - SIDE, height: SKILLS_STRIP_H, backgroundColor: C.primary, display: "flex", alignItems: "flex-start", padding: "8px 20px", gap: 5, flexWrap: "wrap", overflow: "hidden" }}>
            <span style={{ fontFamily: FONT, fontSize: "8.5px", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1.2px", marginRight: 4, whiteSpace: "nowrap" }}>Skills</span>
            {d.skills.map((skill, i) => (
              <span key={i} data-cv-field={`skill.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 600, color: "#fff", padding: "2px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{skill}</span>
            ))}
          </div>
        )}

        {/* Right main body */}
        <div style={{ position: "absolute", top: SKILLS_STRIP_H + 10, left: MAIN_X, width: MAIN_W, maxHeight: PAGE_BUDGET, overflow: "hidden" }}>
          {show.has("profile") && d.profile && (
            <div style={{ marginBottom: 14 }}>
              <FMainHeading C={C}>Professional Summary</FMainHeading>
              <p data-cv-field="profile" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: "19px", color: C.text, margin: 0 }}>{d.profile}</p>
            </div>
          )}
          {show.has("experience") && d.experience?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <FMainHeading C={C}>Experience</FMainHeading>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < d.experience.length - 1 ? 12 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.primary}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span data-cv-field={`exp.${i}.role`} style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: C.text, flex: 1, minWidth: 0, wordWrap: "break-word" }}>{exp.role}</span>
                    <span data-cv-field={`exp.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                  </div>
                  <div data-cv-field={`exp.${i}.company`} style={{ fontFamily: FONT, fontSize: "11px", color: C.primary, fontWeight: 600, marginBottom: 4, wordWrap: "break-word" }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
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
              <FMainHeading C={C}>Key Achievements</FMainHeading>
              {d.achievements.filter(a => a?.trim()).map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.pillBg, border: `1.5px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: C.primary }}>{i + 1}</span>
                  </div>
                  <span data-cv-field={`ach.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, paddingTop: 2 }}>{ach}</span>
                </div>
              ))}
            </div>
          )}
          {show.has("certifications") && d.certifications && d.certifications.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <FMainHeading C={C}>Certifications</FMainHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {d.certifications.map((cert, i) => (
                  <div key={i}>
                    <div data-cv-field={`cert.${i}.name`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 600, color: C.text }}>{cert.name}</div>
                    <div data-cv-field={`cert.${i}.issuer`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {show.has("tools") && d.tools && d.tools.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <FMainHeading C={C}>Tools & Software</FMainHeading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 5px" }}>
                {d.tools.map((tool, i) => (
                  <span key={i} data-cv-field={`tool.${i}`} style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 500, color: C.primary, padding: "2px 7px", borderRadius: 10, backgroundColor: C.pillBg, border: `1px solid ${C.pillBorder}` }}>{tool}</span>
                ))}
              </div>
            </div>
          )}
          {show.has("projects") && d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <FMainHeading C={C}>Projects</FMainHeading>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {d.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                    <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                    {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {show.has("awards") && d.awards && d.awards.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <FMainHeading C={C}>Awards & Recognition</FMainHeading>
              {d.awards.map((award, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
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
              <FMainHeading C={C}>References</FMainHeading>
              <div style={{ display: "grid", gridTemplateColumns: refCols, gap: 10 }}>
                {d.references.map((ref, i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                    <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                    <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}</div>
                    {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.company}</div>}
                    {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                    {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {show.has("declaration") && d.declaration?.declaration && (
            <div style={{ marginTop: 14 }}>
              <FMainHeading C={C}>Declaration</FMainHeading>
              <p data-cv-field="decl.declaration" data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "15px", color: C.text, margin: 0, fontStyle: "italic" }}>{d.declaration.declaration}</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ PAGE 2 ══ */}
      {(showP2.size > 0 || historyExps.length > 0) && (
        <div className="cv-page-sheet" style={{ position: "relative", width: A4_W, height: A4_H, backgroundColor: "#fff", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: A4_W, height: P2_CHROME, backgroundColor: C.primary, display: "flex", alignItems: "center", padding: "0 26px" }}>
            <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 700, color: "#fff" }}>{d.fullName}</span>
            <span style={{ fontFamily: FONT, fontSize: "9.5px", color: "rgba(255,255,255,0.6)", marginLeft: 10 }}>Page 2</span>
          </div>
          <div style={{ position: "absolute", top: P2_CHROME, left: 26, width: A4_W - 52, maxHeight: P2_BUDGET, overflow: "hidden" }}>
            {historyExps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <FMainHeading C={C}>Career History</FMainHeading>
                {historyExps.map((exp, i) => (
                  <div key={i} style={{ marginBottom: i < historyExps.length - 1 ? 10 : 0, paddingLeft: 12, borderLeft: `2px solid ${C.divider}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span data-cv-field={`hist.${i}.role`} style={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: C.text }}>{exp.role}</span>
                      <span data-cv-field={`hist.${i}.dates`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.dates}</span>
                    </div>
                    <div data-cv-field={`hist.${i}.company`} style={{ fontFamily: FONT, fontSize: "10.5px", color: C.primary, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} data-cv-field={`hist.${i}.bullet.${bi}`} style={{ fontFamily: FONT, fontSize: "10.5px", lineHeight: "17px", color: C.text, marginBottom: 1 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {(showP2.has("projects") && d.projects && d.projects.length > 0) && (
              <div style={{ marginBottom: 16 }}>
                <FMainHeading C={C}>Projects</FMainHeading>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {d.projects.map((proj, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}` }}>
                      <div data-cv-field={`proj.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{proj.name}</div>
                      <p data-cv-field={`proj.${i}.description`} data-cv-multiline="true" style={{ fontFamily: FONT, fontSize: "10px", lineHeight: "14px", color: C.text, margin: "3px 0" }}>{proj.description}</p>
                      {proj.tech && <div data-cv-field={`proj.${i}.tech`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.primary }}>{proj.tech}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(showP2.has("awards") && d.awards && d.awards.length > 0) && (
              <div style={{ marginBottom: 16 }}>
                <FMainHeading C={C}>Awards & Recognition</FMainHeading>
                {d.awards.map((award, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ fontFamily: FONT, fontSize: "12px", color: C.primary, lineHeight: "17px" }}>🏆</span>
                    <div>
                      <span data-cv-field={`award.${i}`} style={{ fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, color: C.text }}>{award.title}</span>
                      {award.description && <span data-cv-field={`award.${i}.description`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, marginLeft: 4 }}>— {award.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showP2.has("references") && d.references?.length > 0 && (
              <div>
                <FMainHeading C={C}>References</FMainHeading>
                <div style={{ display: "grid", gridTemplateColumns: refCols, gap: 10 }}>
                  {d.references.map((ref, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 6, backgroundColor: C.cardBg, border: `1px solid ${C.divider}` }}>
                      <div data-cv-field={`ref.${i}.name`} style={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: C.text }}>{ref.name}</div>
                      <div data-cv-field={`ref.${i}.title`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.title}</div>
                      {ref.company && <div data-cv-field={`ref.${i}.company`} style={{ fontFamily: FONT, fontSize: "10px", color: C.muted }}>{ref.company}</div>}
                      {ref.phone && <div data-cv-field={`ref.${i}.phone`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted, marginTop: 2 }}>☎ {ref.phone}</div>}
                      {ref.email && <div data-cv-field={`ref.${i}.email`} style={{ fontFamily: FONT, fontSize: "9.5px", color: C.muted }}>✉ {ref.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
