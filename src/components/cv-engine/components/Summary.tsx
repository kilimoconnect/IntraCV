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

export default function Summary({ data, style, widthPx, heightPx, sectionTitle, renderSettings: rs }: Props) {
  if (!data.summary) return null;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Professional Summary"} style={style} renderSettings={rs} />
      <p style={{
        fontSize: sf(rs?.spacing === "spacious" ? 10.5 : rs?.spacing === "compact" ? 9.5 : style.density === "spacious" ? 10.5 : style.density === "normal" ? 10 : 9.5, rs),
        lineHeight: rs?.spacing === "spacious" ? 1.6 : rs?.spacing === "compact" ? 1.4 : style.density === "spacious" ? 1.55 : style.density === "normal" ? 1.5 : 1.45,
        color: style.colors.bodyText,
        margin: 0,
        padding: rs?.spacing === "compact" ? "0 0 0 8px" : rs?.spacing === "spacious" ? "0 0 0 12px" : "0 0 0 10px",
        borderLeft: `2px solid ${style.colors.accent}30`,
        letterSpacing: "0.1px",
      }}>
        {data.summary}
      </p>
    </div>
  );
}
