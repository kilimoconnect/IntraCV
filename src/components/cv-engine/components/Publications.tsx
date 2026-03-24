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

export default function Publications({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  const items = data.publications || [];
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
      <SectionHeading title={sectionTitle || "Publications / Speaking"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      {items.map((p, i) => {
        const accent = isSidebar ? style.colors.sidebarText : style.colors.accent;
        return (
          <div key={i} style={{ display: "flex", gap: "7px", marginBottom: "5px", alignItems: "flex-start" }}>
            <div style={{
              width: "4px", height: "4px", borderRadius: "1px", background: accent,
              marginTop: "5px", flexShrink: 0, opacity: 0.5, transform: "rotate(45deg)",
            }} />
            <div>
              <div style={{ fontSize: sf(9, rs), fontWeight: 600, color: body, lineHeight: 1.3 }}>
                {p.title}
              </div>
              <div style={{ fontSize: sf(8, rs), color: muted, letterSpacing: "0.2px" }}>
                {[p.publisher, p.year, p.type !== "publication" ? p.type : ""].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
