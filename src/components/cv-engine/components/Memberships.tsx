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

export default function Memberships({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  const items = data.memberships || [];
  if (items.length === 0) return null;

  const body = isSidebar ? style.colors.sidebarText : style.colors.bodyText;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Professional Memberships"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      {items.map((m, i) => {
        const accent = isSidebar ? style.colors.sidebarText : style.colors.accent;
        return (
          <div key={i} style={{
            display: "flex",
            gap: "7px",
            marginBottom: "3px",
            fontSize: sf(9, rs),
            lineHeight: 1.5,
            color: body,
            alignItems: "flex-start",
          }}>
            <div style={{
              width: "4px", height: "4px", borderRadius: "1px", background: accent,
              marginTop: "5px", flexShrink: 0, opacity: 0.5, transform: "rotate(45deg)",
            }} />
            <span>{m}</span>
          </div>
        );
      })}
    </div>
  );
}
