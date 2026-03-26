"use client";

// ═══════════════════════════════════════════════════════════
// CV CANVAS PREVIEW — Scale-to-Fit A4 Preview Wrapper
// ═══════════════════════════════════════════════════════════
// Uses transform:scale to visually shrink A4 pages to fit the
// container width. transform does NOT affect child layout
// measurements, so internal CSS zoom (usePageFill) works
// correctly without compounding issues.
// ═══════════════════════════════════════════════════════════

import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";

// A4 at 96 DPI
const A4_W = 794;
const A4_H = 1123;

interface CanvasPreviewProps {
  children: ReactNode;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

const PAGE_GAP = 24;

export default function CVCanvasPreview({ children, previewRef }: CanvasPreviewProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [pageCount, setPageCount] = useState(1);

  // ─── Fit the A4 paper to the available width ───
  const recalcScale = useCallback(() => {
    if (!outerRef.current) return;
    const availableWidth = outerRef.current.clientWidth;
    if (availableWidth <= 0) return;
    setScale(Math.min(1, availableWidth / A4_W));
  }, []);

  // Recalculate on mount + resize
  useEffect(() => {
    recalcScale();
    const el = outerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => recalcScale());
    observer.observe(el);
    return () => observer.disconnect();
  }, [recalcScale]);

  // Recalculate when children (layout/theme) change
  useEffect(() => {
    const t = setTimeout(recalcScale, 50);
    return () => clearTimeout(t);
  }, [children, recalcScale]);

  // ─── Count pages after render ───
  useEffect(() => {
    if (!previewRef.current) return;

    const countPages = () => {
      const sheets = previewRef.current?.querySelectorAll(".cv-page-sheet");
      if (sheets && sheets.length > 0) setPageCount(sheets.length);
    };

    const timer = setTimeout(countPages, 150);
    const observer = new MutationObserver(countPages);
    observer.observe(previewRef.current, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [children, previewRef]);

  // transform:scale doesn't change layout size, so we set height manually
  const totalContentHeight = pageCount * A4_H + (pageCount - 1) * PAGE_GAP;
  const scaledHeight = totalContentHeight * scale;

  return (
    <div
      ref={outerRef}
      className="relative w-full overflow-hidden"
      style={{ height: `${scaledHeight + 40}px` }}
    >
      {/* A4 content scaled from top-left — transform doesn't affect child measurements */}
      <div
        ref={previewRef}
        style={{
          width: `${A4_W}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        <style>{`
          .cv-page-sheet {
            box-shadow: 0 2px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
            border-radius: 2px;
            overflow: hidden;
          }
          .cv-page-sheet + .cv-page-sheet {
            margin-top: ${PAGE_GAP}px;
          }
        `}</style>
        {children}
      </div>

      {/* Page count badge */}
      <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {pageCount} page{pageCount > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
