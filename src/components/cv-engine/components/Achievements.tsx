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
  sectionTitle?: string;
  renderSettings?: RenderSettings;
}

export default function Achievements({ data, style, widthPx, heightPx, sectionTitle, renderSettings: rs }: Props) {
  const items = data.keyAchievements || [];
  if (items.length === 0) return null;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Key Achievements"} style={style} renderSettings={rs} />
      {items.map((a, i) => (
        <div key={i} style={{
          display: "flex",
          gap: "7px",
          marginBottom: "3px",
          fontSize: sf(9.5, rs),
          lineHeight: 1.45,
          color: style.colors.bodyText,
          alignItems: "flex-start",
        }}>
          <span style={{
            color: style.colors.accent,
            flexShrink: 0,
            fontSize: sf(10, rs),
            lineHeight: 1.45,
            fontWeight: 700,
            opacity: 0.5,
          }}>›</span>
          <span>{a}</span>
        </div>
      ))}
    </div>
  );
}
