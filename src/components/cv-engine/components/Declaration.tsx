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

export default function Declaration({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  if (!data.declaration?.declaration) return null;

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
      <SectionHeading title={sectionTitle || "Declaration"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      <p style={{
        fontSize: sf(8.5, rs), lineHeight: 1.45, color: body, margin: "0 0 6px",
        fontStyle: "italic", opacity: 0.85,
        paddingLeft: "10px",
        borderLeft: `2px solid ${isSidebar ? style.colors.sidebarText : style.colors.accent}20`,
      }}>
        {data.declaration.declaration}
      </p>
      {(data.declaration.place || data.declaration.date) && (
        <div style={{ fontSize: sf(8, rs), color: muted, paddingLeft: "10px", letterSpacing: "0.2px" }}>
          {[data.declaration.place, data.declaration.date].filter(Boolean).join(" · ")}
        </div>
      )}
    </div>
  );
}
