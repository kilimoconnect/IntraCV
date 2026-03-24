// ─── CV Engine: Component-Based Layout Engine ───
// Replaces 200+ templates with: 10 components × 5 styles × 1 engine
//
// Usage:
//   <CVEngine data={cvData} styleId="corporate" layoutType="sidebar-left" />

import React from "react";
import type { CVTemplateData, DesignStyle, LayoutType, EngineResult, RenderSettings, DensityAssessment } from "./types";
import { DENSITY_METRICS } from "./types";
import { getStyle } from "./themes";
import { buildLayout, getColumnWidths, measureComponents, planPages, compressExperience } from "./grid";
import { assessContentDensity, renderSettingsToDensity } from "@/lib/cv-density-controller";
import CVPage from "./CVPage";

interface Props {
  data: CVTemplateData;
  styleId: string;
  layoutType: LayoutType;
  targetPages?: 1 | 2 | 3;
  renderSettings?: RenderSettings;
}

// ─── Core Engine Logic ───
export function runEngine(
  data: CVTemplateData,
  styleId: string,
  layoutType: LayoutType,
  targetPages: number = 2,
  renderSettings?: RenderSettings,
): EngineResult {
  const log: string[] = [];

  // Step 0: Volume Assessment — run density controller if no settings provided
  let rs = renderSettings;
  let densityAssessment: DensityAssessment | undefined;
  if (!rs) {
    const pages = Math.min(3, Math.max(1, targetPages)) as 1 | 2 | 3;
    densityAssessment = assessContentDensity(data, pages);
    rs = densityAssessment.renderSettings;
    log.push(`Density Controller: score=${densityAssessment.contentDensityScore}, mode=${densityAssessment.recommendation}`);
  }

  // Apply render settings to style density
  const style = { ...getStyle(styleId) };
  const engineDensity = renderSettingsToDensity(rs);
  style.density = engineDensity;
  log.push(`Render: spacing=${rs.spacing}, summary=${rs.showSummary}, skills=${rs.skillsLayout}, bullets=${rs.maxBulletsPerJob}/job`);

  // Use density-aware metrics
  const metrics = DENSITY_METRICS[engineDensity] || DENSITY_METRICS.compact;

  const layout = buildLayout(layoutType, targetPages);
  const { mainW } = getColumnWidths(layoutType);

  // Step 1: Measure all components
  let measures = measureComponents(data, style, mainW);
  log.push(`Measured ${measures.filter(m => m.hasContent).length} components with content`);

  // Step 2: Plan pages
  let pages = planPages(layout, measures, style);
  log.push(`Initial plan: ${pages.length} pages`);

  // Step 3: If too many pages, compress experience
  let compressedData = data;
  if (pages.length > targetPages) {
    const totalContentH = measures.filter(m => m.hasContent).reduce((s, m) => s + m.naturalHeightPx, 0);
    const targetH = targetPages * 980;
    const expMeasure = measures.find(m => m.type === "experience");

    if (expMeasure && expMeasure.naturalHeightPx > targetH * 0.5) {
      const maxJobs = Math.max(3, Math.ceil(data.experiences.length * (targetH / totalContentH)));
      compressedData = compressExperience(data, maxJobs);
      log.push(`Compressed experience: ${data.experiences.length} → ${maxJobs} detailed + Earlier Career`);

      measures = measureComponents(compressedData, style, mainW);
      pages = planPages(layout, measures, style);
      log.push(`After compression: ${pages.length} pages`);
    }
  }

  // Step 4: If STILL too many pages, reduce bullets using render settings
  if (pages.length > targetPages) {
    compressedData = reduceBullets(compressedData, rs.maxBulletsPerJob);
    measures = measureComponents(compressedData, style, mainW);
    pages = planPages(layout, measures, style);
    log.push(`After bullet reduction (max ${rs.maxBulletsPerJob}/job): ${pages.length} pages`);
  }

  return {
    pages,
    style,
    layout,
    data: compressedData,
    metrics,
    renderSettings: rs,
    densityAssessment,
    log,
  };
}

// ─── Bullet Reducer ───
function reduceBullets(data: CVTemplateData, maxBullets: number = 2): CVTemplateData {
  return {
    ...data,
    experiences: data.experiences.map(exp => {
      const bullets = (exp.description || "").split("\n").filter(l => l.trim());
      const kept = bullets.slice(0, maxBullets).map(b => {
        const cleaned = b.replace(/^[•\-*]\s*/, "").trim();
        // Trim long bullets to 85 chars
        if (cleaned.length > 85) {
          let cut = cleaned.substring(0, 85);
          const lastComma = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(";"));
          const lastSpace = cut.lastIndexOf(" ");
          if (lastComma > cut.length * 0.5) cut = cut.substring(0, lastComma);
          else if (lastSpace > cut.length * 0.5) cut = cut.substring(0, lastSpace);
          cut = cut.replace(/\s+(in|on|at|by|to|for|of|the|a|an|and|or|with|from|through)\s*$/i, "");
          cut = cut.replace(/\s+(and|or)\s+\S+\s*$/i, "");
          cut = cut.replace(/[,;:\s]+$/, "");
          if (!/[.!?]$/.test(cut)) cut += ".";
          return cut;
        }
        return cleaned;
      });
      return { ...exp, description: kept.join("\n") };
    }),
  };
}

// ─── React Component ───
export default function CVEngine({ data, styleId, layoutType, targetPages = 2, renderSettings }: Props) {
  const result = React.useMemo(
    () => runEngine(data, styleId, layoutType, targetPages, renderSettings),
    [data, styleId, layoutType, targetPages, renderSettings],
  );

  return (
    <div className="cv-template" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {result.pages.map((page, i) => (
        <CVPage
          key={i}
          data={result.data}
          style={result.style}
          plan={page}
          layout={result.layout}
          targetPages={targetPages}
          totalPages={result.pages.length}
          renderSettings={result.renderSettings}
        />
      ))}
    </div>
  );
}
