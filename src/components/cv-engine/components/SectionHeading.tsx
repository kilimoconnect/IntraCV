import React from "react";
import type { DesignStyle } from "../types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { sf, sn } from "./font-scale";

interface Props {
  title: string;
  style: DesignStyle;
  isSidebar?: boolean;
  renderSettings?: RenderSettings;
}

export default function SectionHeading({ title, style, isSidebar, renderSettings: rs }: Props) {
  const color = isSidebar ? style.colors.sidebarText : style.colors.accent;
  const isCompact = rs?.spacing === "compact";
  const isSpacious = rs?.spacing === "spacious";
  const baseFontPx = isCompact ? 9 : isSpacious ? 10 : 9.5;

  const base: React.CSSProperties = {
    fontSize: sf(baseFontPx, rs),
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: isCompact ? "1.2px" : "1.5px",
    color,
    marginBottom: `${sn(isCompact ? 5 : isSpacious ? 10 : 8, rs)}px`,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: `${sn(isCompact ? 3 : 4, rs)}px`,
    paddingLeft: 0,
    lineHeight: 1.3,
  };

  switch (style.headingStyle) {
    case "underline":
      return (
        <div style={{ ...base, borderBottom: `1px solid ${color}22`, paddingBottom: "5px" }}>
          {title}
          <div style={{ width: "28px", height: "2.5px", background: color, marginTop: "4px", borderRadius: "2px" }} />
        </div>
      );
    case "bordered":
      return (
        <div style={{ ...base, paddingLeft: "10px", borderLeft: `3px solid ${color}` }}>
          {title}
        </div>
      );
    case "pill":
      return (
        <div style={{
          ...base,
          background: style.colors.accentLight,
          color: style.colors.accent,
          paddingTop: "3px", paddingRight: "14px", paddingBottom: "3px", paddingLeft: "14px",
          borderRadius: "100px",
          display: "inline-block",
          fontSize: sf(8.5, rs),
          letterSpacing: "1.8px",
        }}>
          {title}
        </div>
      );
    case "uppercase-bar":
      return (
        <div style={{
          ...base,
          background: color,
          color: "#fff",
          paddingTop: "3.5px", paddingRight: "12px", paddingBottom: "3.5px", paddingLeft: "12px",
          fontSize: sf(8.5, rs),
          letterSpacing: "2px",
        }}>
          {title}
        </div>
      );
    case "filled":
      return (
        <div style={{
          ...base,
          background: style.colors.accentLight,
          color,
          paddingTop: "4px", paddingRight: "12px", paddingBottom: "4px", paddingLeft: "12px",
          borderRadius: style.borderRadius || "2px",
        }}>
          {title}
        </div>
      );
    case "minimal":
    default:
      return (
        <div style={{ ...base, display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{title}</span>
          <div style={{ flex: 1, height: "1px", background: `${color}25` }} />
        </div>
      );
  }
}
