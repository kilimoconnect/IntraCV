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

export default function Projects({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  const items = data.projects || [];
  if (items.length === 0) return null;

  const body = isSidebar ? style.colors.sidebarText : style.colors.bodyText;
  const muted = isSidebar ? `${style.colors.sidebarText}aa` : style.colors.mutedText;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Major Projects"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      {items.map((p, i) => {
        const name = typeof p === "string" ? p : p.name;
        const desc = typeof p === "string" ? "" : (p.description || "");
        const tech = typeof p === "string" ? "" : (p.tech || "");
        const accent = isSidebar ? style.colors.sidebarText : style.colors.accent;
        return (
          <div key={i} style={{ marginBottom: "8px", paddingLeft: "10px", borderLeft: `2px solid ${accent}30` }}>
            <div style={{ fontSize: sf(10, rs), fontWeight: 700, color: body, lineHeight: 1.25, letterSpacing: "-0.1px" }}>
              {name}
            </div>
            {tech && (
              <div style={{ fontSize: sf(7.5, rs), color: accent, marginTop: "2px", letterSpacing: "0.3px", fontWeight: 500 }}>
                {tech}
              </div>
            )}
            {desc && (
              <div style={{ fontSize: sf(9, rs), color: muted, marginTop: "2px", lineHeight: 1.4 }}>
                {desc}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
