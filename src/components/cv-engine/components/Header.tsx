import React from "react";
import type { CVTemplateData, DesignStyle } from "../types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { FONT_STACKS } from "../types";
import { sf } from "./font-scale";

interface Props {
  data: CVTemplateData;
  style: DesignStyle;
  widthPx: number;
  renderSettings?: RenderSettings;
}

export default function Header({ data, style, widthPx, renderSettings: rs }: Props) {
  const p = data.personalInfo;
  const isBanner = style.colors.headerBg !== "#ffffff";
  const bg = isBanner ? style.colors.headerBg : "#ffffff";
  const textColor = isBanner ? style.colors.headerText : style.colors.bodyText;
  const mutedColor = isBanner ? `${style.colors.headerText}bb` : style.colors.mutedText;
  const accentColor = isBanner ? `${style.colors.headerText}cc` : style.colors.accent;
  const dividerColor = isBanner ? `${style.colors.headerText}30` : `${style.colors.accent}30`;

  const contactItems = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);

  return (
    <div style={{
      width: `${widthPx}px`,
      background: bg,
      color: textColor,
      padding: isBanner ? "22px 36px 16px" : "18px 36px 14px",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Name */}
      <div style={{
        fontSize: sf(22, rs),
        fontWeight: 800,
        letterSpacing: "-0.3px",
        lineHeight: 1.15,
        marginBottom: "3px",
      }}>
        {p.fullName}
      </div>

      {/* Headline */}
      {p.headline && (
        <div style={{
          fontSize: sf(10.5, rs),
          fontWeight: 500,
          color: accentColor,
          letterSpacing: "1.5px",
          marginBottom: "8px",
          textTransform: "uppercase" as const,
        }}>
          {p.headline}
        </div>
      )}

      {/* Divider line */}
      <div style={{
        height: "1px",
        background: dividerColor,
        marginBottom: "8px",
      }} />

      {/* Contact row — separated by mid-dots */}
      <div style={{
        display: "flex",
        flexWrap: "wrap" as const,
        alignItems: "center",
        gap: "0",
        fontSize: sf(8, rs),
        color: mutedColor,
        lineHeight: 1.5,
        letterSpacing: "0.2px",
      }}>
        {contactItems.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span style={{ margin: "0 8px", opacity: 0.4, fontSize: sf(6, rs) }}>◆</span>
            )}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
