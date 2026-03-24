"use client";

// ═══════════════════════════════════════════════════════════
// CV CANVAS PREVIEW — Scale-to-Fit A4 Preview Wrapper
// ═══════════════════════════════════════════════════════════
// Detects .cv-page-sheet elements, scales them to fit the
// available viewport width, and adds visual gaps between pages.
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
  const [scale, setScale] = useState(1);
  const [pageCount, setPageCount] = useState(2);

  // ─── Fit the A4 paper to the available width ───
  const recalcScale = useCallback(() => {
    if (!outerRef.current) return;
    const availableWidth = outerRef.current.clientWidth;
    const targetWidth = availableWidth - 32;
    setScale(Math.min(1, targetWidth / A4_W));
  }, []);

  useEffect(() => {
    recalcScale();
    const observer = new ResizeObserver(() => recalcScale());
    if (outerRef.current) observer.observe(outerRef.current);
    return () => observer.disconnect();
  }, [recalcScale]);

  // ─── Count pages after render ───
  useEffect(() => {
    if (!previewRef.current) return;
    const timer = setTimeout(() => {
      const sheets = previewRef.current?.querySelectorAll(".cv-page-sheet");
      if (sheets) setPageCount(sheets.length);
    }, 100);
    return () => clearTimeout(timer);
  }, [children, previewRef]);

  const totalVisualHeight = pageCount * A4_H + (pageCount - 1) * PAGE_GAP;
  const scaledHeight = totalVisualHeight * scale + 48;

  return (
    <div
      ref={outerRef}
      className="relative w-full"
      style={{ minHeight: `${scaledHeight}px` }}
    >
      <div
        className="mx-auto relative"
        style={{
          width: `${A4_W}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div
          ref={previewRef}
          style={{ width: `${A4_W}px`, pointerEvents: "none" }}
        >
          {/* Gap CSS between sheets */}
          <style>{`
            .cv-page-sheet {
              box-shadow: 0 2px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
              border-radius: 2px;
            }
            .cv-page-sheet + .cv-page-sheet {
              margin-top: ${PAGE_GAP}px;
            }
          `}</style>
          {children}

                  </div>
      </div>

      {/* Page count badge */}
      <div
        className="text-center mt-2"
        style={{ transform: `scale(${1 / Math.max(scale, 0.5)})`, transformOrigin: "top center" }}
      >
        <span className="text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {pageCount} page{pageCount > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
