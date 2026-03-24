// ═══════════════════════════════════════════════════════════
// CV SECTION RENDERER — Overflow-safe section containers & render helpers
// ═══════════════════════════════════════════════════════════
// Provides React components that guarantee sections never overflow
// their page budget. Each section is wrapped in a height-capped
// container with hidden overflow as a safety net.
// ═══════════════════════════════════════════════════════════

import React from "react";
import { type CategoryCVData, type ThemeColors, FONT } from "./cv-layout-types";
import { type SectionId, type SectionMeasure } from "./cv-constraint-engine";
import { type PaginationResult } from "./cv-pagination-engine";
import { FS, LH, GAP } from "./cv-design-system";

// ═══════════════════════════════════════════════════════════
// SECTION CONTAINER — overflow-safe wrapper
// ═══════════════════════════════════════════════════════════

interface SectionBoxProps {
  maxHeight?: number;
  marginBottom?: number;
  children: React.ReactNode;
}

/** Wraps a section in a height-capped div with overflow:hidden. */
export function SectionBox({ maxHeight, marginBottom = GAP.section, children }: SectionBoxProps) {
  return (
    <div
      style={{
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: "hidden",
        marginBottom,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE CONTAINER — A4 page with overflow:hidden
// ═══════════════════════════════════════════════════════════

interface PageSheetProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

/** Renders one A4 page with strict overflow clipping. */
export function PageSheet({ width, height, children }: PageSheetProps) {
  return (
    <div
      className="cv-page-sheet"
      style={{
        position: "relative",
        width,
        height,
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CONTENT FLOW — renders only sections assigned to a page
// ═══════════════════════════════════════════════════════════

interface ContentFlowProps {
  /** Pagination result from the engine */
  plan: PaginationResult;
  /** Which page to render (0-indexed) */
  page: number;
  /** Section measures for height budgeting */
  measures: SectionMeasure[];
  /** Render function called for each section on this page */
  renderSection: (sectionId: SectionId, maxHeight: number) => React.ReactNode;
}

/**
 * Renders only the sections assigned to `page` by the pagination engine.
 * Each section gets a height-capped SectionBox.
 */
export function ContentFlow({ plan, page, measures, renderSection }: ContentFlowProps) {
  const pg = plan.pages[page];
  if (!pg) return null;

  const mmap = new Map<SectionId, SectionMeasure>();
  for (const m of measures) mmap.set(m.id, m);

  return (
    <>
      {pg.sections.map((id) => {
        const m = mmap.get(id);
        const maxH = m ? m.fullHeight + 4 : undefined; // +4px safety
        return (
          <SectionBox key={id} maxHeight={maxH}>
            {renderSection(id, maxH ?? 9999)}
          </SectionBox>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// COMMON SECTION HEADING STYLES (reusable across variants)
// ═══════════════════════════════════════════════════════════

interface HeadingProps {
  children: string;
  C: ThemeColors;
}

/** Accent-bar heading: [▎ HEADING ─────────] */
export function AccentBarHeading({ children, C }: HeadingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: GAP.heading }}>
      <div style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: C.primary, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: `${FS.lgx}px`, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
    </div>
  );
}

/** Line heading: [HEADING ──────────] */
export function LineHeading({ children, C }: HeadingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: GAP.heading }}>
      <span style={{ fontFamily: FONT, fontSize: `${FS.lgx}px`, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

/** Dot + line heading: [● HEADING ──────] */
export function DotLineHeading({ children, C }: HeadingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: GAP.heading }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, border: `2px solid ${C.primary}`, flexShrink: 0 }} />
      <span style={{ fontFamily: FONT, fontSize: `${FS.lgx}px`, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.5px" }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
    </div>
  );
}

/** Underline heading: [HEADING] + accent underline */
export function UnderlineHeading({ children, C }: HeadingProps) {
  return (
    <div style={{ marginBottom: GAP.heading }}>
      <span style={{ fontFamily: FONT, fontSize: `${FS.lgx}px`, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      <div style={{ width: 40, height: 2, backgroundColor: C.primary, marginTop: 3, borderRadius: 1 }} />
    </div>
  );
}

/** Sidebar label (light text on dark bg) */
export function SidebarLabel({ children, C }: HeadingProps) {
  return (
    <div style={{ fontFamily: FONT, fontSize: `${FS.xs}px`, fontWeight: 700, color: C.headerText, textTransform: "uppercase", letterSpacing: "1.8px", opacity: 0.7, marginBottom: 6 }}>
      {children}
    </div>
  );
}

/** Bold badge heading: [█ HEADING] + line */
export function BadgeHeading({ children, C }: HeadingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: GAP.heading }}>
      <div style={{ padding: "2px 10px", backgroundColor: C.primary, borderRadius: 3 }}>
        <span style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "1.2px" }}>{children}</span>
      </div>
      <div style={{ flex: 1, height: 1.5, backgroundColor: C.divider }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMMON SECTION RENDER HELPERS
// ═══════════════════════════════════════════════════════════

/** Render a profile/summary paragraph. */
export function ProfileBlock({ text, C, width }: { text: string; C: ThemeColors; width: number }) {
  return (
    <p style={{
      fontFamily: FONT,
      fontSize: `${FS.smt}px`,
      lineHeight: `${Math.ceil(FS.smt * LH.relaxed)}px`,
      color: C.text,
      margin: 0,
      overflow: "hidden",
    }}>
      {text}
    </p>
  );
}

/** Render a skill pill. */
export function SkillPill({ label, C }: { label: string; C: ThemeColors }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: FONT,
      fontSize: `${FS.sm}px`,
      fontWeight: 500,
      padding: "3px 10px",
      borderRadius: 12,
      backgroundColor: C.pillBg,
      border: `1px solid ${C.pillBorder}`,
      color: C.text,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

/** Render an experience entry (role + company + bullets). */
export function ExperienceEntry({
  role, company, dates, location, bullets, C, width,
}: {
  role: string; company: string; dates: string; location?: string;
  bullets: string[]; C: ThemeColors; width: number;
}) {
  return (
    <div style={{ marginBottom: GAP.subsection }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: FONT, fontSize: `${FS.md}px`, fontWeight: 700, color: C.text }}>{role}</span>
        <span style={{ fontFamily: FONT, fontSize: `${FS.xs}px`, color: C.muted, whiteSpace: "nowrap", marginLeft: 8, fontStyle: "italic" }}>{dates}</span>
      </div>
      <div style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, color: C.primary, fontWeight: 600, marginBottom: 3 }}>
        {company}{location ? ` — ${location}` : ""}
      </div>
      {bullets.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 12, listStyleType: "disc" }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, lineHeight: `${Math.ceil(FS.smt * LH.normal)}px`, color: C.text, marginBottom: 1, overflow: "hidden" }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Render an education entry. */
export function EducationEntry({
  degree, school, year, details, C,
}: {
  degree: string; school: string; year: string; details?: string; C: ThemeColors;
}) {
  return (
    <div style={{ marginBottom: GAP.item }}>
      <div style={{ fontFamily: FONT, fontSize: `${FS.md}px`, fontWeight: 700, color: C.text }}>{degree}</div>
      <div style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, color: C.muted }}>
        {school}{year ? ` — ${year}` : ""}
      </div>
      {details && <div style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.text, marginTop: 2 }}>{details}</div>}
    </div>
  );
}

/** Render a certification row. */
export function CertRow({ name, issuer, year, C }: { name: string; issuer: string; year: string; C: ThemeColors }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <div>
        <span style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, fontWeight: 600, color: C.text }}>{name}</span>
        {issuer && <span style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.muted }}> — {issuer}</span>}
      </div>
      {year && <span style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.muted }}>{year}</span>}
    </div>
  );
}

/** Render a reference card. */
export function ReferenceCard({ name, title, company, phone, email, C }: {
  name: string; title: string; company?: string; phone?: string; email?: string; C: ThemeColors;
}) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, border: `1px solid ${C.divider}`, overflow: "hidden" }}>
      <div style={{ fontFamily: FONT, fontSize: `${FS.base}px`, fontWeight: 700, color: C.text }}>{name}</div>
      <div style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.muted }}>{title}</div>
      {company && <div style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.muted }}>{company}</div>}
      {phone && <div style={{ fontFamily: FONT, fontSize: `${FS.xs}px`, color: C.muted, marginTop: 2 }}>☎ {phone}</div>}
      {email && <div style={{ fontFamily: FONT, fontSize: `${FS.xs}px`, color: C.muted }}>✉ {email}</div>}
    </div>
  );
}

/** Render a language entry with optional bar. */
export function LanguageRow({ name, label, level, C }: {
  name: string; label: string; level?: number; C: ThemeColors;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, fontWeight: 600, color: C.text }}>{name}</span>
        <span style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.muted }}>{label}</span>
      </div>
      {typeof level === "number" && (
        <div style={{ width: "100%", height: 4, backgroundColor: C.divider, borderRadius: 2 }}>
          <div style={{ width: `${Math.min(100, level)}%`, height: 4, backgroundColor: C.primary, borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

/** Render a declaration block. */
export function DeclarationBlock({ declaration, place, date, C }: {
  declaration: string; place?: string; date?: string; C: ThemeColors;
}) {
  return (
    <div>
      <p style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, lineHeight: `${Math.ceil(FS.smt * LH.normal)}px`, color: C.text, margin: 0, fontStyle: "italic" }}>
        {declaration}
      </p>
      <div style={{ display: "flex", gap: 24, marginTop: 4, fontFamily: FONT, fontSize: `${FS.sm}px`, color: C.muted }}>
        {place && <span>Place: {place}</span>}
        {date && <span>Date: {date}</span>}
      </div>
    </div>
  );
}

/** Render a board role card. */
export function BoardRoleCard({ title, organization, dates, description, C }: {
  title: string; organization: string; dates: string; description?: string; C: ThemeColors;
}) {
  return (
    <div style={{ marginBottom: GAP.subsection, padding: "7px 12px", backgroundColor: C.cardBg, borderRadius: 4, borderLeft: `3px solid ${C.primary}`, borderBottom: `1px solid ${C.divider}`, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: FONT, fontSize: `${FS.base}px`, fontWeight: 700, color: C.text }}>{title}</span>
        <span style={{ fontFamily: FONT, fontSize: `${FS.xxs}px`, color: C.muted, fontStyle: "italic" }}>{dates}</span>
      </div>
      <div style={{ fontFamily: FONT, fontSize: `${FS.smt}px`, color: C.primary, fontWeight: 500 }}>{organization}</div>
      {description && <p style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, lineHeight: `${Math.ceil(FS.sm * LH.normal)}px`, color: C.muted, margin: "2px 0 0", overflow: "hidden" }}>{description}</p>}
    </div>
  );
}

/** Render a project card. */
export function ProjectCard({ name, description, tech, C }: {
  name: string; description: string; tech?: string; C: ThemeColors;
}) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 4, backgroundColor: C.cardBg, borderLeft: `3px solid ${C.primary}`, overflow: "hidden" }}>
      <div style={{ fontFamily: FONT, fontSize: `${FS.base}px`, fontWeight: 700, color: C.text }}>{name}</div>
      <p style={{ fontFamily: FONT, fontSize: `${FS.sm}px`, lineHeight: `${Math.ceil(FS.sm * LH.normal)}px`, color: C.text, margin: "3px 0" }}>{description}</p>
      {tech && <div style={{ fontFamily: FONT, fontSize: `${FS.xs}px`, color: C.primary }}>{tech}</div>}
    </div>
  );
}
