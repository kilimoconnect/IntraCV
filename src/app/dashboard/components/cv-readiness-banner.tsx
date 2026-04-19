"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertTriangle, Sparkles } from "lucide-react";

interface CVReadinessData {
  issues: string[];
  improvements: string[];
  strength: number;
}

interface Props {
  score: number;
  isReady: boolean;
  isAnalyzing: boolean;
  cvReadiness: CVReadinessData | null;
  onGenerate?: () => void;
  isGenerating?: boolean;
  children?: React.ReactNode;
}

export default function CVReadinessBanner({
  score, isReady, isAnalyzing, cvReadiness, onGenerate, isGenerating, children,
}: Props) {
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - animScore / 100);
  const ringColor = isReady ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const glowColor = isReady ? "rgba(16,185,129,0.55)" : score >= 50 ? "rgba(245,158,11,0.55)" : "rgba(239,68,68,0.55)";

  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ background: "linear-gradient(140deg, #07111f 0%, #001260 100%)" }}>
      <style>{`
        @keyframes cvb-shine {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }
        @keyframes cvb-fadeup {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

      {/* Ambient glow orb */}
      <div className="absolute top-0 right-0 w-56 h-56 -translate-y-1/2 translate-x-1/4 pointer-events-none rounded-full"
        style={{ background: isReady
          ? "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(0,74,173,0.14) 0%, transparent 70%)" }} />

      {/* Status pill */}
      <div className="absolute top-4 right-4 z-10">
        {isAnalyzing && !cvReadiness ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide"
            style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Analysing
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide"
            style={isReady
              ? { background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.28)", color: "#6ee7b7" }
              : { background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.28)", color: "#fca5a5" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{ background: isReady ? "#10b981" : "#ef4444" }} />
            {isReady ? "Job Ready" : "Needs Work"}
          </span>
        )}
      </div>

      {/* Score ring + headline */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-5 relative z-10">
        {/* SVG ring */}
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
            <circle
              cx="40" cy="40" r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${circ}`}
              strokeDashoffset={`${offset}`}
              transform="rotate(-90 40 40)"
              style={{
                transition: "stroke-dashoffset 1.3s cubic-bezier(0.22,1,0.36,1)",
                filter: `drop-shadow(0 0 4px ${glowColor})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white tabular-nums leading-none">{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>%</span>
          </div>
        </div>

        {/* Headline + bar */}
        <div className="flex-1 min-w-0 pr-16">
          <p className="font-black text-white text-sm leading-snug mb-0.5">
            {isAnalyzing && !cvReadiness
              ? "Analysing your profile…"
              : isReady
              ? "Your CV looks strong and job-ready"
              : "Your CV is not ready for applications"}
          </p>
          <p className="text-[11px] font-medium mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
            Current CV Strength
          </p>
          {/* Glowing thin bar */}
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            {isAnalyzing && !cvReadiness ? (
              <div className="h-1.5 rounded-full w-1/3 animate-pulse" style={{ background: "rgba(255,255,255,0.18)" }} />
            ) : (
              <div className="h-1.5 rounded-full" style={{
                width: `${animScore}%`,
                background: ringColor,
                boxShadow: `0 0 8px ${glowColor}`,
                transition: "width 1.3s cubic-bezier(0.22,1,0.36,1)",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* CTA — my-profile only */}
      {onGenerate && (
        <div className="px-5 pb-5 relative z-10">
          <p className="text-xs font-medium mb-2.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {isReady
              ? "Keep your CV polished — generate or update it anytime"
              : "Improve your chances of getting hired"}
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm text-white relative overflow-hidden disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg, #ff751f 0%, #ff9340 100%)",
              boxShadow: "0 6px 24px rgba(255,117,31,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <span className="absolute inset-0 rounded-xl pointer-events-none" style={{
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)",
              backgroundSize: "250% auto",
              animation: "cvb-shine 3s linear infinite",
            }} />
            {isGenerating
              ? <Loader2 className="h-4 w-4 animate-spin relative z-10" />
              : <Sparkles className="h-4 w-4 relative z-10" />}
            <span className="relative z-10">Generate Professional CV</span>
          </button>
        </div>
      )}

      {/* Issues + Improvements */}
      {cvReadiness && (cvReadiness.issues.length > 0 || cvReadiness.improvements.length > 0) && (
        <div className="grid sm:grid-cols-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {cvReadiness.issues.length > 0 && (
            <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "#fca5a5" }}>
                <AlertTriangle className="w-3 h-3" /> Issues Found
              </p>
              <ul className="space-y-2">
                {cvReadiness.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs"
                    style={{ color: "rgba(255,255,255,0.45)", animation: `cvb-fadeup 0.35s ease both ${i * 0.06 + 0.1}s` }}>
                    <span className="shrink-0 mt-0.5 font-bold text-red-400">–</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cvReadiness.improvements.length > 0 && (
            <div className="px-5 py-4" style={{ background: "rgba(16,185,129,0.04)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "#6ee7b7" }}>
                <CheckCircle2 className="w-3 h-3" /> What We Will Improve
              </p>
              <ul className="space-y-2">
                {cvReadiness.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs"
                    style={{ color: "rgba(255,255,255,0.45)", animation: `cvb-fadeup 0.35s ease both ${i * 0.06 + 0.1}s` }}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Slot: cv-studio missing-sections content */}
      {children && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
