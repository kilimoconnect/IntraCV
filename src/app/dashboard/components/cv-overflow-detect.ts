"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Detects which CV sections have content that overflows their page container.
 * Watches the previewRef for mutations and re-checks after each render.
 * Returns a Set of section names that are clipped.
 */
export function useOverflowDetect(
  previewRef: React.RefObject<HTMLDivElement | null>,
  deps: unknown[] = []
): Set<string> {
  const [overflow, setOverflow] = useState<Set<string>>(new Set());

  const check = useCallback(() => {
    const root = previewRef.current;
    if (!root) return;

    const clipped = new Set<string>();

    // Find all page sheets
    const pages = root.querySelectorAll(".cv-page-sheet");
    pages.forEach((page) => {
      // Check body containers (position:absolute children with maxHeight or overflow:hidden)
      const bodies = page.querySelectorAll<HTMLElement>("[style]");
      bodies.forEach((el) => {
        const style = el.style;
        if (style.overflow === "hidden" && el.scrollHeight > el.clientHeight + 2) {
          // This container is clipping content — figure out which section
          // Look at the last visible child vs total children
          const diff = el.scrollHeight - el.clientHeight;
          if (diff > 4) {
            // Heuristic: check data attributes or text content for section identification
            const text = el.textContent || "";
            if (text.includes("Professional Summary") || text.includes("Executive Profile")) clipped.add("profile");
            if (text.includes("Experience") || text.includes("Professional Experience")) clipped.add("experience");
            if (text.includes("Achievement") || text.includes("Career Highlight")) clipped.add("achievements");
            if (text.includes("Skills") || text.includes("Competenc")) clipped.add("skills");
            if (text.includes("Education")) clipped.add("education");
            if (text.includes("Certification")) clipped.add("certifications");
            if (text.includes("Reference")) clipped.add("references");
            if (text.includes("Language")) clipped.add("languages");
            if (text.includes("Project")) clipped.add("projects");

            // If we can't identify specific sections, mark as general overflow
            if (clipped.size === 0) clipped.add("_page");
          }
        }
      });
    });

    setOverflow((prev) => {
      // Only update if the set actually changed
      if (prev.size !== clipped.size) return clipped;
      for (const item of clipped) {
        if (!prev.has(item)) return clipped;
      }
      return prev;
    });
  }, [previewRef]);

  useEffect(() => {
    // Check after a short delay to let the layout settle
    const timer = setTimeout(check, 400);

    // Also observe DOM mutations for re-checks
    const root = previewRef.current;
    if (!root) return () => clearTimeout(timer);

    const observer = new MutationObserver(() => {
      setTimeout(check, 200);
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, ...deps]);

  return overflow;
}
