import React from "react";
import type { CVTemplateData, DesignStyle } from "../types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { FONT_STACKS } from "../types";
import SectionHeading from "./SectionHeading";
import { sf } from "./font-scale";
import { normalizeDate } from "@/lib/normalize-date";

interface Props {
  data: CVTemplateData;
  style: DesignStyle;
  widthPx: number;
  heightPx?: number;
  isSidebar?: boolean;
  sectionTitle?: string;
  renderSettings?: RenderSettings;
}

export default function BoardRoles({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  const items = data.boardRoles || [];
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
      <SectionHeading title={sectionTitle || "Board / Leadership Roles"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      {items.map((role, i) => {
        const accent = isSidebar ? style.colors.sidebarText : style.colors.accent;
        const dateStr = [role.startDate, role.endDate].filter(Boolean).map(normalizeDate).join(" – ");
        return (
          <div key={i} style={{ marginBottom: "8px", paddingLeft: "10px", borderLeft: `2px solid ${accent}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
              <div style={{ fontSize: sf(10, rs), fontWeight: 700, color: body, lineHeight: 1.25, letterSpacing: "-0.1px" }}>
                {role.title}
              </div>
              {dateStr && (
                <span style={{
                  fontSize: sf(7.5, rs), fontWeight: 600, color: accent,
                  background: isSidebar ? `${accent}12` : (style.colors.accentLight || `${accent}12`),
                  padding: "1.5px 7px", borderRadius: "100px", flexShrink: 0,
                }}>
                  {dateStr}
                </span>
              )}
            </div>
            {role.organization && (
              <div style={{ fontSize: sf(8.5, rs), fontWeight: 500, color: muted, marginTop: "1px", letterSpacing: "0.2px" }}>
                {role.organization}
              </div>
            )}
            {role.description && (
              <div style={{ fontSize: sf(9, rs), color: body, marginTop: "2px", lineHeight: 1.4, opacity: 0.85 }}>
                {role.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
