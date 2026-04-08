"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Detects which CV sections have content that overflows their page container.
 *
 * Improvements over the original heuristic version:
 *  • Uses data-section-id attributes for precise identification (no text scanning)
 *  • Waits for document.fonts.ready before measuring to avoid false positives
 *    caused by web-font FOUT shifting layout heights
 *  • Uses ResizeObserver to re-check on zoom or container resize
 *  • Proper set-equality check — avoids spurious re-renders
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

    // Walk each A4 page sheet
    const pages = root.querySelectorAll<HTMLElement>(".cv-page-sheet");
    pages.forEach((page) => {
      const pageRect = page.getBoundingClientRect();

      // Primary: sections with data-section-id — precise, no text heuristics
      const sections = page.querySelectorAll<HTMLElement>("[data-section-id]");
      sections.forEach((section) => {
        const sectionRect = section.getBoundingClientRect();
        // If the section's bottom extends more than 4 px past the page bottom → overflow
        if (sectionRect.bottom > pageRect.bottom + 4) {
          const id = section.dataset.sectionId;
          if (id) clipped.add(id);
        }
      });

      // Fallback: page's own scroll height exceeds its client height
      // (catches overflow even when no section has the attribute)
      if (page.scrollHeight > page.clientHeight + 4 && clipped.size === 0) {
        clipped.add("_page");
      }
    });

    setOverflow((prev) => {
      // Fast-path: both empty → no change
      if (prev.size === 0 && clipped.size === 0) return prev;
      // Size mismatch → definitely changed
      if (prev.size !== clipped.size) return clipped;
      // Same size: check that every clipped item is already in prev
      // (if sizes match and all clipped ∈ prev, then sets are equal)
      for (const item of clipped) {
        if (!prev.has(item)) return clipped;
      }
      return prev; // No change — skip re-render
    });
  }, [previewRef]);

  useEffect(() => {
    let cancelled = false;
    const root = previewRef.current;
    if (!root) return;

    const runCheck = () => {
      if (!cancelled) check();
    };

    // ── 1. Wait for fonts to fully render before first measurement ──
    // Avoids false overflow when a web font hasn't loaded yet and the
    // browser falls back to a narrower system font that shifts heights.
    document.fonts.ready.then(runCheck);

    // ── 2. Re-check whenever DOM content changes (text, bullet additions) ──
    const mutationObs = new MutationObserver(() => {
      // Re-wait for fonts in case new content uses a different font
      document.fonts.ready.then(runCheck);
    });
    mutationObs.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false, // attribute changes don't affect rendered height
    });

    // ── 3. Re-check on zoom or container resize ──
    const resizeObs = new ResizeObserver(runCheck);
    resizeObs.observe(root);

    return () => {
      cancelled = true;
      mutationObs.disconnect();
      resizeObs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, ...deps]);

  return overflow;
}
