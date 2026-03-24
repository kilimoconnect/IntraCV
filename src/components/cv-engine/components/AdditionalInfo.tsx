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

export default function AdditionalInfo({ data, style, widthPx, heightPx, isSidebar, sectionTitle, renderSettings: rs }: Props) {
  const body = isSidebar ? style.colors.sidebarText : style.colors.bodyText;
  const muted = isSidebar ? `${style.colors.sidebarText}aa` : style.colors.mutedText;

  const sections: { label: string; items: string[] }[] = [];
  if (data.languages?.length)
    sections.push({ label: "Languages", items: data.languages.map(l => `${l.name} (${l.proficiency})`) });
  if (data.tools?.length)
    sections.push({ label: "Tools & Technologies", items: data.tools });
  if (data.memberships?.length)
    sections.push({ label: "Memberships", items: data.memberships });
  if (data.volunteer?.length)
    sections.push({ label: "Volunteer Work", items: data.volunteer });
  if (data.projects?.length)
    sections.push({ label: "Projects", items: data.projects.map(p => p.name) });
  if (data.interests?.length)
    sections.push({ label: "Interests", items: data.interests });

  if (sections.length === 0) return null;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Additional Information"} style={style} isSidebar={isSidebar} renderSettings={rs} />
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: "5px" }}>
          <div style={{ fontSize: sf(8.5, rs), fontWeight: 700, color: body, letterSpacing: "0.5px", textTransform: "uppercase" as const, marginBottom: "2px", opacity: 0.7 }}>
            {s.label}
          </div>
          <div style={{ fontSize: sf(9, rs), color: isSidebar ? body : muted, lineHeight: 1.45 }}>
            {s.items.join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}
