import React from "react";
import type { CVTemplateData, DesignStyle } from "../types";
import type { RenderSettings } from "@/lib/cv-density-controller";
import { PAGE_W, FONT_STACKS } from "../types";
import { sf } from "./font-scale";

interface Props {
  data: CVTemplateData;
  style: DesignStyle;
  pageIndex: number;
  totalPages: number;
  renderSettings?: RenderSettings;
}

export default function Footer({ data, style, pageIndex, totalPages, renderSettings: rs }: Props) {
  const { fullName, email, phone } = data.personalInfo;

  return (
    <div style={{
      width: `${PAGE_W}px`,
      height: "28px",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 36px",
      fontSize: sf(7, rs),
      color: style.colors.mutedText,
      fontFamily: FONT_STACKS[style.font],
      borderTop: `1px solid ${style.colors.border}40`,
      boxSizing: "border-box",
      letterSpacing: "0.3px",
    }}>
      <span style={{ opacity: 0.7 }}>
        {[fullName, email, phone].filter(Boolean).map((item, i, arr) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </span>
      {totalPages > 1 && (
        <span style={{ opacity: 0.5, fontSize: sf(6.5, rs), letterSpacing: "0.5px" }}>
          PAGE {pageIndex + 1} OF {totalPages}
        </span>
      )}
    </div>
  );
}
