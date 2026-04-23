import React from "react";
import type { CVTemplateData, DesignStyle } from "../types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { FONT_STACKS } from "../types";
import SectionHeading from "./SectionHeading";
import { sf, sn } from "./font-scale";
import { normalizeDate } from "@/lib/normalize-date";

interface Props {
  data: CVTemplateData;
  style: DesignStyle;
  widthPx: number;
  heightPx?: number;
  sectionTitle?: string;
  renderSettings?: RenderSettings;
}

export default function Experience({ data, style, widthPx, heightPx, sectionTitle, renderSettings: rs }: Props) {
  if (data.experiences.length === 0) return null;

  const isTimeline = style.experienceStyle === "timeline";
  const isCard = style.experienceStyle === "card";
  const isCompact = style.experienceStyle === "compact";
  const accent = style.colors.accent;
  const muted = style.colors.mutedText;
  const body = style.colors.bodyText;

  return (
    <div style={{
      width: `${widthPx}px`,
      height: heightPx ? `${heightPx}px` : "auto",
      overflow: "hidden",
      fontFamily: FONT_STACKS[style.font],
      boxSizing: "border-box",
    }}>
      <SectionHeading title={sectionTitle || "Professional Experience"} style={style} renderSettings={rs} />

      {data.experiences.map((exp, i) => {
        const bullets = (exp.description || "").split("\n").filter(l => l.trim());
        const isEarlierCareer = exp.title === "Earlier Career";

        if (isEarlierCareer) {
          return (
            <div key={i} style={{ marginBottom: "6px", paddingLeft: isTimeline ? "14px" : "0", borderLeftWidth: isTimeline ? "2px" : "0", borderLeftStyle: "solid", borderLeftColor: `${accent}30` }}>
              <div style={{ fontSize: sf(10, rs), fontWeight: 700, color: muted, marginBottom: "3px", fontStyle: "italic" }}>
                Earlier Career
              </div>
              {bullets.map((b, j) => (
                <div key={j} style={{ fontSize: sf(9, rs), color: muted, lineHeight: 1.4, marginBottom: "1px", paddingLeft: "8px" }}>
                  {b.replace(/^[•\-*]\s*/, "")}
                </div>
              ))}
            </div>
          );
        }

        const dateStr = [exp.startDate, exp.endDate].filter(Boolean).map(normalizeDate).join(" – ");

        return (
          <div key={i} style={{
            marginBottom: rs?.spacing === "compact" ? "5px" : rs?.spacing === "spacious" ? "12px" : isCompact ? "7px" : "10px",
            paddingLeft: isTimeline ? "14px" : "0",
            borderLeftWidth: isTimeline ? "2px" : isCard ? "1px" : "0",
            borderLeftStyle: "solid",
            borderLeftColor: isTimeline ? `${accent}40` : isCard ? style.colors.border : "transparent",
            borderRightWidth: isCard ? "1px" : "0",
            borderRightStyle: "solid",
            borderRightColor: isCard ? style.colors.border : "transparent",
            borderTopWidth: isCard ? "1px" : "0",
            borderTopStyle: "solid",
            borderTopColor: isCard ? style.colors.border : "transparent",
            borderBottomWidth: isCard ? "1px" : "0",
            borderBottomStyle: "solid",
            borderBottomColor: isCard ? style.colors.border : "transparent",
            position: "relative",
            ...(isCard ? {
              borderRadius: style.borderRadius || "4px",
              paddingTop: "8px",
              paddingRight: "10px",
              paddingBottom: "8px",
              paddingLeft: "10px",
              marginBottom: "6px",
              background: `${style.colors.accentLight}40`,
            } : {}),
          }}>
            {/* Timeline dot */}
            {isTimeline && (
              <div style={{
                position: "absolute",
                left: "-4px",
                top: "5px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: accent,
                border: "1.5px solid #fff",
                boxShadow: `0 0 0 1px ${accent}40`,
              }} />
            )}

            {/* Title + Date row */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "8px",
            }}>
              <div style={{ fontSize: sf(10.5, rs), fontWeight: 700, color: body, lineHeight: 1.25, letterSpacing: "-0.1px" }}>
                {exp.title}
              </div>
              {dateStr && (
                <div style={{
                  fontSize: sf(7.5, rs),
                  fontWeight: 600,
                  color: accent,
                  background: style.colors.accentLight,
                  padding: "2px 8px",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  letterSpacing: "0.3px",
                }}>
                  {dateStr}
                </div>
              )}
            </div>

            {/* Company + Location */}
            <div style={{
              fontSize: sf(9, rs),
              fontWeight: 500,
              color: muted,
              marginTop: "1px",
              marginBottom: bullets.length > 0 ? "4px" : "0",
              letterSpacing: "0.2px",
            }}>
              {exp.company}{exp.location ? ` · ${exp.location}` : ""}
            </div>

            {/* Bullets */}
            {bullets.length > 0 && (
              <div style={{ marginTop: "3px" }}>
                {bullets.map((b, j) => {
                  const text = b.replace(/^[•\-*]\s*/, "").trim();
                  return (
                    <div key={j} style={{
                      display: "flex",
                      gap: "6px",
                      marginBottom: rs?.spacing === "compact" ? "1px" : rs?.spacing === "spacious" ? "3px" : "1.5px",
                      fontSize: sf(rs?.spacing === "compact" ? 9 : rs?.spacing === "spacious" ? 10 : 9.5, rs),
                      lineHeight: rs?.spacing === "compact" ? 1.4 : rs?.spacing === "spacious" ? 1.55 : 1.45,
                      color: body,
                    }}>
                      <span style={{ color: accent, flexShrink: 0, fontSize: sf(4, rs), marginTop: "5px", opacity: 0.7 }}>◆</span>
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
