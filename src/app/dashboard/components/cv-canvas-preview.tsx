"use client";

// ═══════════════════════════════════════════════════════════
// CV CANVAS PREVIEW — Scale-to-Fit A4 Preview Wrapper
// ═══════════════════════════════════════════════════════════
// Uses CSS zoom to scale A4 pages to fit the container width.
// Zoom changes layout dimensions (unlike transform: scale)
// so the element naturally fits without overflow tricks.
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
  const [zoomLevel, setZoomLevel] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // ─── Fit the A4 paper to the available width ───
  const recalcZoom = useCallback(() => {
    if (!outerRef.current) return;
    const availableWidth = outerRef.current.clientWidth;
    if (availableWidth <= 0) return;
    setZoomLevel(Math.min(1, availableWidth / A4_W));
  }, []);

  // Recalculate on mount + resize
  useEffect(() => {
    recalcZoom();
    const el = outerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => recalcZoom());
    observer.observe(el);
    return () => observer.disconnect();
  }, [recalcZoom]);

  // Recalculate when children (layout/theme) change
  useEffect(() => {
    const t = setTimeout(recalcZoom, 50);
    return () => clearTimeout(t);
  }, [children, recalcZoom]);

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

  return (
    <div ref={outerRef} className="relative w-full">
      {/* Zoomed A4 content — zoom changes actual layout size */}
      <div
        ref={previewRef}
        style={{
          width: `${A4_W}px`,
          zoom: zoomLevel || undefined,
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
      <div className="text-center mt-3">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {pageCount} page{pageCount > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
