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

export default function Referees({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  const refs = data.referees || [];
  if (refs.length === 0) return null;

  const body = isSidebar ? style.colors.sidebarText : style.colors.bodyText;
  const muted = isSidebar ? `${style.colors.sidebarText}aa` : style.colors.mutedText;
  const isNarrow = widthPx < 350;
  const cols = isNarrow ? 1 : 2;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Referees"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "8px 16px" }}>
        {refs.map((r, i) => {
          const accent = isSidebar ? style.colors.sidebarText : style.colors.accent;
          return (
            <div key={i} style={{ paddingLeft: "10px", borderLeft: `2px solid ${accent}30` }}>
              <div style={{ fontSize: sf(9, rs), fontWeight: 700, color: body, letterSpacing: "-0.1px" }}>{r.name}</div>
              <div style={{ fontSize: sf(8, rs), color: muted, marginTop: "1px", letterSpacing: "0.2px" }}>
                {[r.title, r.company].filter(Boolean).join(", ")}
              </div>
              {r.phone && <div style={{ fontSize: sf(7.5, rs), color: muted, marginTop: "1px" }}>{r.phone}</div>}
              {r.email && <div style={{ fontSize: sf(7.5, rs), color: muted }}>{r.email}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
