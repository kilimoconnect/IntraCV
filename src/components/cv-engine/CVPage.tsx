import React from "react";
import type { CVTemplateData, DesignStyle, PagePlan, LayoutConfig, ComponentType } from "./types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { PAGE_W, PAGE_H, FONT_STACKS, SECTION_TITLES } from "./types";
import { sf } from "./components/font-scale";
import { getColumnWidths } from "./grid";
import {
  Header, Summary, Skills, Experience, Achievements,
  Education, Certifications, AdditionalInfo, Memberships,
  Projects, Publications, BoardRoles, ExecutiveTraining,
  Referees, Declaration, Footer,
} from "./components";

interface Props {
  data: CVTemplateData;
  style: DesignStyle;
  plan: PagePlan;
  layout: LayoutConfig;
  targetPages?: number;
  totalPages?: number;
  renderSettings?: RenderSettings;
}

// ─── Component Resolver ───
function renderComponent(
  type: string,
  data: CVTemplateData,
  style: DesignStyle,
  widthPx: number,
  heightPx?: number,
  isSidebar?: boolean,
  sectionTitle?: string,
  renderSettings?: RenderSettings,
): React.ReactNode {
  const props = { data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings };
  switch (type) {
    case "summary":        return <Summary {...props} />;
    case "skills":         return <Skills {...props} />;
    case "experience":     return <Experience {...props} />;
    case "achievements":   return <Achievements {...props} />;
    case "education":      return <Education {...props} />;
    case "certifications": return <Certifications {...props} />;
    case "additional":     return <AdditionalInfo {...props} />;
    case "memberships":    return <Memberships {...props} />;
    case "projects":       return <Projects {...props} />;
    case "publications":       return <Publications {...props} />;
    case "boardRoles":         return <BoardRoles {...props} />;
    case "executiveTraining":  return <ExecutiveTraining {...props} />;
    case "referees":           return <Referees {...props} />;
    case "declaration":        return <Declaration {...props} />;
    default:               return null;
  }
}

// ─── Density-Aware Spacing Helpers ───
function getSpacing(rs?: RenderSettings) {
  if (!rs) return { sectionGap: 12, itemGap: 8, padX: 32, padY: 28, fontSize: 10.5, sidebarPad: 14 };
  return {
    sectionGap: rs.sectionGapPx,
    itemGap: rs.itemGapPx,
    padX: rs.pageMarginPx,
    padY: rs.pageMarginPx,
    fontSize: rs.fontScale * 10.5,
    sidebarPad: rs.spacing === "compact" ? 12 : rs.spacing === "spacious" ? 18 : 14,
  };
}

export default function CVPage({ data, style, plan, layout, targetPages = 2, totalPages = 1, renderSettings: rs }: Props) {
  const titles = SECTION_TITLES[targetPages] || SECTION_TITLES[2];
  const { mainW, sideW } = getColumnWidths(layout.type);
  const isAccentCol = layout.type === "two-column-accent-left" || layout.type === "two-column-accent-right";
  const isSidebarLayout = layout.sidebarSections.length > 0 && layout.type.includes("sidebar");
  const isBanner = style.colors.headerBg !== "#ffffff";
  const isLeftSidebar = layout.type.includes("left") && layout.type.includes("sidebar");
  const sp = getSpacing(rs);

  // ─── Strategy Decision ───
  // Strategy A (Compact): sidebar layout, tight spacing, skills/contact in narrow sidebar
  // Strategy B (Spacious): full-width header/footer, justify-between distribution, expanded sections
  const isSpacious = rs?.spacing === "spacious";
  const isCompact = rs?.spacing === "compact";

  // Page container — font scale from density controller
  const pageStyle: React.CSSProperties = {
    width: `${PAGE_W}px`,
    height: `${PAGE_H}px`,
    overflow: "hidden",
    background: "#fff",
    fontFamily: FONT_STACKS[style.font],
    color: style.colors.bodyText,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    fontSize: `${sp.fontSize}px`,
  };

  // ── Shared helpers ──
  const p = data.personalInfo;
  const contactItems = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);
  const hText = isBanner ? style.colors.headerText : style.colors.bodyText;
  const hMuted = isBanner ? `${style.colors.headerText}bb` : style.colors.mutedText;
  const hAccent = isBanner ? `${style.colors.headerText}cc` : style.colors.accent;
  const hDiv = isBanner ? `${style.colors.headerText}30` : `${style.colors.accent}30`;

  const stripe = !isBanner ? (
    <div style={{ height: "3px", background: `linear-gradient(90deg, ${style.colors.accent}, ${style.colors.accent}80)`, width: "100%", flexShrink: 0 }} />
  ) : null;

  const miniHeader = (
    <div style={{
      height: "36px", background: style.colors.accentLight, display: "flex",
      alignItems: "center", justifyContent: "space-between", padding: "0 36px",
      fontSize: sf(8, rs), color: style.colors.mutedText, flexShrink: 0,
      letterSpacing: "0.3px", borderBottom: `1px solid ${style.colors.border}40`,
    }}>
      <span style={{ fontWeight: 600 }}>{p.fullName}</span>
      <span style={{ opacity: 0.5, fontSize: sf(7, rs), letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
        Page {plan.pageIndex + 1} of {totalPages}
      </span>
    </div>
  );

  // Contact row builder
  const contactRow = (color: string) => (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0", fontSize: sf(8, rs), color, lineHeight: 1.5, letterSpacing: "0.2px" }}>
      {contactItems.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ margin: "0 8px", opacity: 0.4, fontSize: sf(6, rs) }}>{"\u25C6"}</span>}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );

  // ── Footer ──
  const footer = (
    <Footer data={data} style={style} pageIndex={plan.pageIndex} totalPages={totalPages} renderSettings={rs} />
  );

  // ══════════════════════════════════════════════════
  // NON-SIDEBAR LAYOUTS
  // Strategy B (Spacious): Full-width header/footer with justify-between
  // Standard: Normal flow with density-aware gaps
  // ══════════════════════════════════════════════════
  if (isSidebarLayout) {
    // ══════════════════════════════════════════════════
    // STRATEGY A (Compact): Sidebar extends full height
    // Skills/contact in narrow sidebar, single-column main, tight spacing
    // ══════════════════════════════════════════════════
    const sbPad = sp.sidebarPad;
    const sidebarContent = (
      <div style={{
        width: `${sideW}px`,
        background: style.colors.sidebarBg,
        color: style.colors.sidebarText,
        padding: `${sbPad}px`,
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: `${sp.sectionGap}px`,
      }}>
        {/* Personal info block on page 1 */}
        {plan.showHeader && (
          <div style={{ padding: isCompact ? "8px 0 6px" : "10px 0 8px", marginBottom: isCompact ? "4px" : "6px" }}>
            <div style={{
              width: isCompact ? "38px" : "44px", height: isCompact ? "38px" : "44px", borderRadius: "50%",
              background: style.colors.accent + "22",
              border: `2px solid ${style.colors.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: sf(isCompact ? 14 : 16, rs), fontWeight: 700, color: style.colors.accent,
              fontFamily: FONT_STACKS[style.font], marginBottom: isCompact ? "4px" : "6px",
            }}>
              {data.personalInfo.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{
              fontSize: sf(isCompact ? 8 : 8.5, rs), color: style.colors.sidebarText, lineHeight: 1.5 }}>
              {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
              {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
              {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
              {data.personalInfo.linkedin && <div style={{ fontSize: sf(7.5, rs), opacity: 0.7 }}>{data.personalInfo.linkedin}</div>}
            </div>
          </div>
        )}

        {plan.sidebarPlacements.map((p, i) => (
          <React.Fragment key={i}>
            {renderComponent(p.component, data, style, sideW - sbPad * 2, undefined, true, titles[p.component as ComponentType], rs)}
          </React.Fragment>
        ))}
      </div>
    );

    const mainContent = (
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header inside the main panel area */}
        {plan.showHeader ? (
          <div style={{
            background: isBanner ? style.colors.headerBg : "#fff",
            color: isBanner ? style.colors.headerText : style.colors.bodyText,
            padding: isCompact ? "14px 18px 10px" : "18px 20px 12px",
            boxSizing: "border-box",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: sf(isCompact ? 19 : 21, rs), fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.15, marginBottom: "3px" }}>
              {data.personalInfo.fullName}
            </div>
            {data.personalInfo.headline && (
              <div style={{
                fontSize: sf(isCompact ? 9 : 10, rs), fontWeight: 500, letterSpacing: "1.5px", marginBottom: "4px",
                textTransform: "uppercase" as const,
                color: isBanner ? `${style.colors.headerText}cc` : style.colors.accent,
              }}>
                {data.personalInfo.headline}
              </div>
            )}
            <div style={{ height: "1px", background: isBanner ? `${style.colors.headerText}25` : `${style.colors.accent}25` }} />
          </div>
        ) : (
          <div style={{
            height: "32px", background: style.colors.accentLight, display: "flex",
            alignItems: "center", justifyContent: "space-between", padding: "0 20px",
            fontSize: sf(8, rs), color: style.colors.mutedText, flexShrink: 0,
            borderBottom: `1px solid ${style.colors.border}40`,
          }}>
            <span style={{ fontWeight: 600 }}>{data.personalInfo.fullName}</span>
            <span style={{ opacity: 0.5, fontSize: sf(7, rs), textTransform: "uppercase" as const }}>
              Page {plan.pageIndex + 1} of {totalPages}
            </span>
          </div>
        )}

        {/* Main sections — use justify-between for spacious mode */}
        <div style={{
          flex: 1,
          padding: isCompact ? "6px 18px" : `${sp.itemGap}px 20px`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          ...(isSpacious ? { justifyContent: "space-between" } : { gap: `${sp.sectionGap}px` }),
        }}>
          {plan.mainPlacements.map((p, i) => (
            <React.Fragment key={i}>
              {renderComponent(p.component, data, style, mainW - (isCompact ? 36 : 40), undefined, false, titles[p.component as ComponentType], rs)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );

    return (
      <div style={pageStyle}>
        {stripe}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {isLeftSidebar ? <>{sidebarContent}{mainContent}</> : <>{mainContent}{sidebarContent}</>}
        </div>
        {footer}
      </div>
    );
  }

  // ── Determine layout category ──
  const isSingleCol = layout.type === "single-column" || layout.type === "narrow-centered";
  const isTwoCol = !isSingleCol && !isSidebarLayout;
  const padXPx = isCompact ? Math.max(24, sp.padX - 4) : isSpacious ? sp.padX + 8 : sp.padX;
  const padX = layout.type === "narrow-centered" ? `${padXPx + 64}px` : layout.type === "two-column-narrow" ? `${padXPx + 16}px` : `${padXPx}px`;
  const isAccentLeft = layout.type === "two-column-accent-left";
  const isAccentRight = layout.type === "two-column-accent-right";

  if (isTwoCol) {
    // ── Compute actual rendering widths (accounting for padding + gap) ──
    const padXNum = parseInt(padX);
    const gap = 16;
    const availW = PAGE_W - padXNum * 2 - gap;
    const accentPad = 10; // inner padding for accent-colored columns

    // Distribute proportionally based on layout ratios
    const mainRatio = layout.type === "two-column-wide-left" ? 0.58
                    : layout.type === "two-column-wide-right" ? 0.42
                    : 0.5;
    const colMainW = Math.floor(availW * mainRatio);
    const colSideW = availW - colMainW;

    // Content widths (subtract accent padding if applicable)
    const contentMainW = isAccentLeft ? colMainW - accentPad * 2 : colMainW;
    const contentSideW = isAccentRight ? colSideW - accentPad * 2 : colSideW;
    const summaryW = availW + gap; // summary spans full width across both columns

    // ── Two-Column Header ──
    const twoColHeader = plan.showHeader ? (
      isAccentLeft || isAccentRight ? (
        // Split header for accent layouts
        <div style={{ display: "flex", flexShrink: 0 }}>
          <div style={{
            width: isAccentLeft ? `${colMainW + padXNum + gap / 2}px` : `${colMainW + padXNum + gap / 2}px`,
            background: isAccentLeft ? style.colors.sidebarBg : (isBanner ? style.colors.headerBg : "#fff"),
            padding: "18px 20px 12px",
            boxSizing: "border-box",
          }}>
            <div style={{ fontSize: sf(22, rs), fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.15, marginBottom: "3px",
              color: isAccentLeft ? style.colors.sidebarText : hText }}>{p.fullName}</div>
            {p.headline && <div style={{ fontSize: sf(10, rs), fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase" as const,
              color: isAccentLeft ? style.colors.accent : hAccent, marginBottom: "4px" }}>{p.headline}</div>}
          </div>
          <div style={{
            flex: 1,
            background: isAccentRight ? style.colors.sidebarBg : (isBanner ? style.colors.headerBg : "#fff"),
            padding: "18px 20px 12px",
            boxSizing: "border-box",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            {contactRow(isAccentRight ? style.colors.sidebarText : hMuted)}
          </div>
        </div>
      ) : (
        // Standard two-column header with subtle column hint
        <div style={{
          background: isBanner ? style.colors.headerBg : "#fff",
          padding: `18px ${padX} 12px`,
          boxSizing: "border-box",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}>
          <div>
            <div style={{ fontSize: sf(22, rs), fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.15, marginBottom: "3px", color: hText }}>{p.fullName}</div>
            {p.headline && <div style={{ fontSize: sf(10, rs), fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase" as const, color: hAccent, marginBottom: "4px" }}>{p.headline}</div>}
          </div>
          <div style={{ textAlign: "right" as const, paddingBottom: "2px" }}>
            {contactRow(hMuted)}
          </div>
        </div>
      )
    ) : miniHeader;

    return (
      <div style={pageStyle}>
        {stripe}
        {twoColHeader}
        <div style={{ flex: 1, padding: `0 ${padX}`, overflow: "hidden", boxSizing: "border-box" }}>
          {/* Summary always full-width at top */}
          {plan.mainPlacements.filter(p => p.component === "summary").map((p, i) => (
            <React.Fragment key={`s-${i}`}>
              {renderComponent(p.component, data, style, summaryW, undefined, false, titles[p.component as ComponentType], rs)}
              <div style={{ height: "1px", background: style.colors.border, margin: `${isCompact ? 4 : 6}px 0` }} />
            </React.Fragment>
          ))}

          {/* Two columns below summary */}
          <div style={{ display: "flex", gap: `${gap}px`, flex: 1, overflow: "hidden" }}>
            <div style={{
              width: `${colMainW}px`, overflow: "hidden",
              display: "flex", flexDirection: "column",
              ...(isSpacious ? { justifyContent: "space-between" } : { gap: `${sp.sectionGap}px` }),
              ...(isAccentLeft ? { background: style.colors.sidebarBg, padding: `${accentPad}px`, borderRadius: "4px", boxSizing: "border-box" as const } : {}),
            }}>
              {plan.mainPlacements.filter(p => p.component !== "summary").map((p, i) => (
                <React.Fragment key={`m-${i}`}>
                  {renderComponent(p.component, data, style, contentMainW, undefined, isAccentLeft, titles[p.component as ComponentType], rs)}
                </React.Fragment>
              ))}
            </div>
            <div style={{
              width: `${colSideW}px`, overflow: "hidden",
              display: "flex", flexDirection: "column",
              ...(isSpacious ? { justifyContent: "space-between" } : { gap: `${sp.sectionGap}px` }),
              ...(isAccentRight ? { background: style.colors.sidebarBg, padding: `${accentPad}px`, borderRadius: "4px", boxSizing: "border-box" as const } : {}),
            }}>
              {plan.sidebarPlacements.map((p, i) => (
                <React.Fragment key={`r-${i}`}>
                  {renderComponent(p.component, data, style, contentSideW, undefined, isAccentRight, titles[p.component as ComponentType], rs)}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {footer}
      </div>
    );
  }

  // ── Single Column (including narrow-centered) ──
  const singleColW = layout.type === "narrow-centered" ? mainW : PAGE_W - padXPx * 2;
  const isNarrow = layout.type === "narrow-centered";

  const singleHeader = plan.showHeader ? (
    isNarrow ? (
      // Centered narrow header
      <div style={{
        background: isBanner ? style.colors.headerBg : "#fff",
        padding: "22px 96px 14px",
        boxSizing: "border-box",
        flexShrink: 0,
        textAlign: "center" as const,
      }}>
        <div style={{ fontSize: sf(22, rs), fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.15, marginBottom: "3px", color: hText }}>{p.fullName}</div>
        {p.headline && <div style={{ fontSize: sf(10, rs), fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase" as const, color: hAccent, marginBottom: "6px" }}>{p.headline}</div>}
        <div style={{ height: "1px", background: hDiv, marginBottom: "6px" }} />
        <div style={{ display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: "0", fontSize: sf(8, rs), color: hMuted, lineHeight: 1.5 }}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ margin: "0 8px", opacity: 0.4, fontSize: sf(6, rs) }}>{"\u25C6"}</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    ) : (
      // Standard full-width header
      <Header data={data} style={style} widthPx={PAGE_W} renderSettings={rs} />
    )
  ) : miniHeader;

  return (
    <div style={pageStyle}>
      {stripe}
      {singleHeader}
      <div style={{
        flex: 1,
        padding: `0 ${padX}`,
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        ...(isSpacious ? { justifyContent: "space-between" } : { gap: `${sp.sectionGap}px` }),
      }}>
        {plan.mainPlacements.map((p, i) => (
          <React.Fragment key={i}>
            {renderComponent(p.component, data, style, singleColW, undefined, false, titles[p.component as ComponentType], rs)}
            {/* Divider between sections */}
            {style.sectionDivider === "line" && i < plan.mainPlacements.length - 1 && (
              <div style={{ height: "1px", background: style.colors.border, margin: `${isCompact ? 3 : 6}px 0` }} />
            )}
          </React.Fragment>
        ))}
      </div>
      {footer}
    </div>
  );
}
