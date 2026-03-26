"use client";
// ═══════════════════════════════════════════════════════════
// CV DOM MEASUREMENT ENGINE — Pixel-perfect section heights
// ═══════════════════════════════════════════════════════════
// Replaces approximate text-based estimation with real
// getBoundingClientRect() measurements after fonts load.
// Attach measureRef to a hidden container whose children
// each carry a data-section-id attribute.
// ═══════════════════════════════════════════════════════════

import { useRef, useState, useEffect, type RefObject, type CSSProperties } from "react";
import { type SectionId, type SectionMeasure } from "./cv-constraint-engine";

// ── Hidden container style — renders offscreen for measurement ──
export const MEASURE_STYLE: CSSProperties = {
  position: "absolute",
  visibility: "hidden",
  pointerEvents: "none",
  left: -9999,
  top: 0,
  overflow: "visible", // must be visible so we get full natural heights
};

// ── All known section IDs ──
const ALL_SECTION_IDS: SectionId[] = [
  "profile", "skills", "experience", "education",
  "certifications", "languages", "references", "projects",
  "achievements", "memberships", "tools", "boardRoles",
  "executiveTraining", "publications", "volunteer", "declaration",
  "history", "awards",
];

// ═══════════════════════════════════════════════════════════
// MAIN HOOK — useDOMMeasure
// ═══════════════════════════════════════════════════════════

/**
 * Real DOM-based section measurement hook.
 *
 * Usage:
 *   1. Attach `measureRef` to a hidden container (use MEASURE_STYLE + set width)
 *   2. Render each section inside that container wrapped in
 *      `<div data-section-id="profile">…</div>`
 *   3. Hook returns pixel-perfect SectionMeasure[] after fonts load
 *
 * Returns `null` until first measurement completes — use approximate fallback.
 *
 * @param dataFingerprint  Change this string to trigger re-measurement
 */
export function useDOMMeasure(
  dataFingerprint: string = "",
): {
  measureRef: RefObject<HTMLDivElement | null>;
  measures: SectionMeasure[] | null;
} {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [measures, setMeasures] = useState<SectionMeasure[] | null>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    let cancelled = false;

    // CRITICAL: Wait for all fonts to be loaded before measuring
    document.fonts.ready.then(() => {
      if (cancelled) return;
      // Wait one animation frame for the browser to finish layout
      requestAnimationFrame(() => {
        if (cancelled) return;

        const results: SectionMeasure[] = [];
        const presentIds = new Set<SectionId>();

        for (const child of Array.from(el.children)) {
          const htmlChild = child as HTMLElement;
          const id = htmlChild.dataset.sectionId as SectionId | undefined;
          if (!id) continue;

          const rect = htmlChild.getBoundingClientRect();
          const height = Math.ceil(rect.height); // ceil for safety

          presentIds.add(id);
          results.push({
            id,
            fullHeight: height,
            minHeight: Math.max(Math.round(height * 0.6), 20),
            present: height > 0,
          });
        }

        // Fill absent sections so the pagination engine has a complete picture
        for (const sid of ALL_SECTION_IDS) {
          if (!presentIds.has(sid)) {
            results.push({ id: sid, fullHeight: 0, minHeight: 0, present: false });
          }
        }

        // Debug logging (development only)
        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
          const present = results.filter(r => r.present);
          const total = present.reduce((s, r) => s + r.fullHeight, 0);
          console.log(
            `[CV DOM Measure] ${present.length} sections, total=${Math.round(total)}px`,
            present.map(r => ({ section: r.id, height: r.fullHeight })),
          );
        }

        setMeasures(results);
      });
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFingerprint]);

  return { measureRef, measures };
}

// ═══════════════════════════════════════════════════════════
// FINGERPRINT HELPER
// ═══════════════════════════════════════════════════════════

/**
 * Build a lightweight fingerprint string from CV data.
 * Changes to this string trigger re-measurement in the hook.
 */
export function buildFingerprint(d: Record<string, unknown>): string {
  const counts = [
    Array.isArray(d.experience) ? d.experience.length : 0,
    Array.isArray(d.education) ? d.education.length : 0,
    Array.isArray(d.skills) ? d.skills.length : 0,
    Array.isArray(d.achievements) ? d.achievements.length : 0,
    Array.isArray(d.certifications) ? d.certifications.length : 0,
    Array.isArray(d.references) ? d.references.length : 0,
    Array.isArray(d.projects) ? d.projects.length : 0,
    Array.isArray(d.memberships) ? d.memberships.length : 0,
    Array.isArray(d.tools) ? d.tools.length : 0,
    Array.isArray(d.boardRoles) ? d.boardRoles.length : 0,
    Array.isArray(d.executiveTraining) ? d.executiveTraining.length : 0,
    Array.isArray(d.publications) ? d.publications.length : 0,
    Array.isArray(d.volunteer) ? d.volunteer.length : 0,
    Array.isArray(d.awards) ? d.awards.length : 0,
    Array.isArray(d.history) ? d.history.length : 0,
    typeof d.profile === "string" ? d.profile.length : 0,
  ];
  return counts.join(",");
}
