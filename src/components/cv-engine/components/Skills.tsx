import React from "react";
import type { CVTemplateData, DesignStyle } from "../types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { FONT_STACKS } from "../types";
import SectionHeading from "./SectionHeading";
import { sf } from "./font-scale";

interface Props {
  data: CVTemplateData;
  style: DesignStyle;
  widthPx: number;
  heightPx?: number;
  isSidebar?: boolean;
  sectionTitle?: string;
  renderSettings?: RenderSettings;
}

export default function Skills({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  if (data.skills.length === 0) return null;

  // Auto-column: adjusts based on skill count and available width
  const count = data.skills.length;
  const narrowMode = widthPx < 300;
  const cols = narrowMode
    ? (count <= 6 ? 1 : 2)
    : (count <= 8 ? 2 : count <= 15 ? 3 : 4);

  const textColor = isSidebar ? style.colors.sidebarText : style.colors.bodyText;

  const accentColor = isSidebar ? style.colors.sidebarText : style.colors.accent;

  const renderText = () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "3px 14px",
      fontSize: sf(9, rs),
      lineHeight: 1.5,
      color: textColor,
    }}>
      {data.skills.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
          <span style={{ color: accentColor, fontSize: sf(4, rs), opacity: 0.6 }}>◆</span>
          <span>{s.name}</span>
        </div>
      ))}
    </div>
  );

  const renderTags = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
      {data.skills.map((s, i) => (
        <span key={i} style={{
          fontSize: sf(8, rs),
          padding: "2.5px 10px",
          background: isSidebar ? `${style.colors.sidebarText}12` : style.colors.accentLight,
          color: accentColor,
          borderRadius: "100px",
          fontWeight: 600,
          letterSpacing: "0.2px",
        }}>
          {s.name}
        </span>
      ))}
    </div>
  );

  const renderBars = () => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cols, 2)}, 1fr)`, gap: "5px 14px" }}>
      {data.skills.map((s, i) => (
        <div key={i}>
          <div style={{ fontSize: sf(8.5, rs), color: textColor, marginBottom: "2px", fontWeight: 500 }}>{s.name}</div>
          <div style={{ height: "3px", background: isSidebar ? `${style.colors.sidebarText}18` : style.colors.accentLight, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${75 + (i * 7) % 20}%`, background: accentColor, borderRadius: "4px", transition: "width 0.3s" }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderDots = () => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cols, 2)}, 1fr)`, gap: "4px 14px" }}>
      {data.skills.map((s, i) => {
        const level = 3 + (i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 1);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: sf(8.5, rs), color: textColor, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{s.name}</span>
            <div style={{ display: "flex", gap: "2.5px", flexShrink: 0 }}>
              {[1, 2, 3, 4, 5].map(d => (
                <div key={d} style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: d <= level ? accentColor : (isSidebar ? `${style.colors.sidebarText}18` : style.colors.accentLight),
                }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderers: Record<string, () => React.ReactNode> = {
    text: renderText,
    tags: renderTags,
    bars: renderBars,
    dots: renderDots,
  };

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Core Skills"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      {(renderers[style.skillDisplay] || renderText)()}
    </div>
  );
}
