"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, CheckCircle2, XCircle,
  ArrowRight, ArrowDown, Lock, Zap, Shield,
  RefreshCw, Sparkles, TrendingUp, AlertCircle,
  User, Briefcase, Star, Palette, Layout, CheckCheck,
  FileX, FileSearch,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const ORANGE = "#ff751f";
const BLUE   = "#004aad";
const DARK   = "#0f172a";
const ez = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: ez } },
};
const staggerSm = (d = 0.08): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
});

// ─── FuseCV theme showcase ────────────────────────────────────────────────────
const FUSECV_THEMES = [
  { name: "Corporate",  color: "#1e3a5f" },
  { name: "Executive",  color: "#15503b" },
  { name: "Modern",     color: "#0d7377" },
  { name: "Midnight",   color: "#1e293b" },
  { name: "Creative",   color: "#6d28d9" },
  { name: "Azure",      color: "#1d4ed8" },
  { name: "Burgundy",   color: "#7f1d1d" },
  { name: "Copper",     color: "#92400e" },
  { name: "Forest",     color: "#166534" },
  { name: "Indigo",     color: "#4338ca" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type CareerCategory = "junior" | "mid-senior" | "executive";

interface BeforeAfter {
  before: string;
  after:  string;
  score_label: string;
}
interface CVFormat {
  layout_type:         string;
  ats_safe:            boolean;
  section_clarity:     string;
  template_impression: string;
  format_score:        number;
  issues:              string[];
  strengths:           string[];
}
interface AnalysisResult {
  name:           string;
  current_role:   string;
  category:       CareerCategory;
  category_label: string;
  category_gaps:  string[];
  word_count:     number;
  page_estimate:  number;
  summary_word_count: number;
  has_summary:    boolean;
  total_bullets:  number;
  bullets_with_metrics: number;
  total_skills:   number;
  generic_skills_count: number;
  keywords_found: number;
  keywords_total: number;
  ats_score:      number;
  impact_score:   number;
  keyword_score:  number;
  readability_score: number;
  overall_score:  number;
  format:         CVFormat;
  issues:    { severity: "critical" | "warning"; text: string }[];
  strengths: string[];
  top_recommendation: string;
  before_after?: BeforeAfter;
}
type Step = "upload" | "scanning" | "results";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function firstName(fullName: string) {
  const n = (fullName || "").trim().split(/\s+/)[0];
  return n && n !== "Candidate" ? n : "";
}
function emotionalLabel(score: number): string {
  if (score >= 70) return "Strong CV. A Few Tweaks Needed.";
  if (score >= 55) return "Solid Background. Better Positioning Needed.";
  if (score >= 38) return "Strong Experience. Weak Presentation.";
  if (score >= 22) return "Clear Potential. Hidden Behind Weak Formatting.";
  return "Hidden Potential Detected.";
}
function emotionalSub(score: number, name: string): string {
  const n = name ? `${name}, your` : "Your";
  if (score >= 70) return `${n} CV is performing well. Targeted improvements could make it exceptional.`;
  if (score >= 55) return `${n} background is strong. The way it is presented is holding you back.`;
  if (score >= 38) return `${n} experience is real — but your CV is not showing it effectively to recruiters.`;
  return `${n} CV has clear experience, but it is not presenting your value effectively.`;
}
function potentialScore(s: number) {
  return Math.min(95, s + Math.round((100 - s) * 0.52));
}
function ringColor(s: number) {
  if (s >= 65) return "#22c55e";
  if (s >= 45) return "#f59e0b";
  return "#ef4444";
}
function cardScoreColor(s: number) {
  if (s >= 65) return { text: "#16a34a", bg: "#f0fdf4", ring: "#22c55e" };
  if (s >= 45) return { text: "#d97706", bg: "#fffbeb", ring: "#f59e0b" };
  return { text: "#dc2626", bg: "#fef2f2", ring: "#ef4444" };
}
function formatLabel(t: string) {
  const map: Record<string, string> = {
    "single-column": "Single Column",
    "two-column":    "Two Column",
    "table-based":   "Table-Based",
    sidebar:         "Sidebar Layout",
    unknown:         "Unknown Layout",
  };
  return map[t] ?? t;
}
function templateLabel(t: string) {
  const map: Record<string, string> = {
    basic:        "Basic / Plain Text",
    generic:      "Generic Template",
    structured:   "Structured",
    professional: "Professional",
  };
  return map[t] ?? t;
}

const CATEGORY_STYLE: Record<CareerCategory, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  junior:       { bg: "rgba(0,74,173,0.07)",    border: "rgba(0,74,173,0.18)",    text: "#004aad", icon: <User      size={11} /> },
  "mid-senior": { bg: "rgba(124,58,237,0.07)",  border: "rgba(124,58,237,0.18)",  text: "#7c3aed", icon: <Briefcase size={11} /> },
  executive:    { bg: "rgba(217,119,6,0.07)",   border: "rgba(217,119,6,0.18)",   text: "#b45309", icon: <Star      size={11} /> },
};

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, delay = 400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start  = performance.now() + delay;
    const tick   = (now: number) => {
      if (now < start) { raf = requestAnimationFrame(tick); return; }
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * ease));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD ZONE
// ─────────────────────────────────────────────────────────────────────────────
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <motion.div
      variants={staggerSm(0.1)} initial="hidden" animate="show"
      className="flex flex-col items-center text-center max-w-md mx-auto w-full"
    >
      <motion.div variants={fadeUp} className="mb-8">
        <Image src="/fusecv-logo.png" alt="FuseCV" width={108} height={34} className="object-contain mx-auto" />
      </motion.div>

      <motion.h1 variants={fadeUp}
        className="text-3xl sm:text-[2.6rem] font-black text-slate-900 mb-3 leading-tight"
        style={{ letterSpacing: "-0.025em" }}>
        Free CV Performance Check
      </motion.h1>
      <motion.p variants={fadeUp} className="text-base text-slate-500 mb-10 max-w-sm leading-relaxed">
        Upload your CV and get a detailed, personalised analysis in ~60 seconds.<br />
        No account. No payment. No catch.
      </motion.p>

      <motion.div
        variants={fadeUp}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center gap-5"
        style={{
          borderColor: dragging ? ORANGE : "#d1d5db",
          background:  dragging ? "rgba(255,117,31,0.03)" : "#fafafa",
        }}
        whileHover={{ borderColor: ORANGE, scale: 1.005 }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: `rgba(255,117,31,0.08)` }}>
          <Upload size={26} style={{ color: ORANGE }} />
        </div>
        <div>
          <p className="font-black text-slate-800 text-[15px] mb-1">
            Drop your CV here, or{" "}
            <span style={{ color: ORANGE }}>click to browse</span>
          </p>
          <p className="text-sm text-slate-400">PDF or Word document · Max 5 MB</p>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center gap-6 mt-8 text-xs font-semibold text-slate-400">
        {[
          [<Lock size={12} key="l" />, "Secure & private"],
          [<Zap size={12} key="z" />, "Results in 60s"],
          [<CheckCircle2 size={12} key="c" />, "No account needed"],
        ].map(([icon, label]) => (
          <span key={label as string} className="flex items-center gap-1.5">
            <span className="text-slate-300">{icon}</span>
            {label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCANNING
// ─────────────────────────────────────────────────────────────────────────────
const SCAN_STEPS = [
  "Reading your CV…",
  "Detecting career level…",
  "Extracting structure and content…",
  "Checking format and layout…",
  "Scoring for your career level…",
  "Building your personalised report…",
];

function ScanningView({ filename }: { filename: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = SCAN_STEPS.map((_, i) => setTimeout(() => setStep(i), i * 1300));
    return () => timers.forEach(clearTimeout);
  }, []);

  const pct = Math.min(96, ((step + 1) / SCAN_STEPS.length) * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center max-w-sm mx-auto w-full">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7"
        style={{ background: "rgba(255,117,31,0.08)" }}>
        <motion.div animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}>
          <Zap size={26} style={{ color: ORANGE }} />
        </motion.div>
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
        Analysing your CV…
      </h2>
      <p className="text-sm text-slate-400 mb-8 truncate max-w-[260px]">{filename}</p>

      <div className="w-full space-y-3.5 mb-7">
        {SCAN_STEPS.map((label, i) => (
          <motion.div key={label} initial={{ opacity: 0.25 }} animate={{ opacity: i <= step ? 1 : 0.25 }}
            className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-400 ${
              i < step  ? "bg-green-500" : i === step ? "" : "bg-slate-100"
            }`} style={i === step ? { background: ORANGE } : {}}>
              {i < step ? <CheckCircle2 size={12} className="text-white" /> :
               i === step ? (
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </motion.div>
               ) : <div className="w-2 h-2 rounded-full bg-slate-300" />}
            </div>
            <span className={`${i <= step ? "text-slate-800 font-semibold" : "text-slate-400"} text-left`}>{label}</span>
          </motion.div>
        ))}
      </div>

      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: ORANGE }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: ez }} />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS — PREMIUM REPORT
// ─────────────────────────────────────────────────────────────────────────────
function ResultsView({
  result, filename, onReset,
}: { result: AnalysisResult; filename: string; onReset: () => void }) {
  const router    = useRouter();
  const name      = firstName(result.name);
  const label     = emotionalLabel(result.overall_score);
  const sub       = emotionalSub(result.overall_score, name);
  const potential = potentialScore(result.overall_score);
  const displayScore = useCountUp(result.overall_score, 1400, 300);

  const R = 72; const circ = 2 * Math.PI * R;
  const rc = ringColor(result.overall_score);
  const catStyle = CATEGORY_STYLE[result.category] ?? CATEGORY_STYLE["mid-senior"];

  const findings = [
    { label: "Summary",           value: result.has_summary ? `${result.summary_word_count} words` : "Not found", bad: !result.has_summary || result.summary_word_count < 80, note: result.has_summary && result.summary_word_count >= 80 ? "Good length" : result.has_summary ? "Too short" : "Missing" },
    { label: "Bullets with data", value: `${result.bullets_with_metrics} of ${result.total_bullets}`, bad: result.bullets_with_metrics < Math.ceil(result.total_bullets * 0.3), note: result.bullets_with_metrics === 0 ? "None found" : "Found" },
    { label: "Keyword match",     value: `${result.keywords_found} of ${result.keywords_total}`, bad: result.keywords_found < 6, note: `${result.keywords_total - result.keywords_found} missing` },
    { label: "Generic skills",    value: `${result.generic_skills_count} of ${result.total_skills}`, bad: result.generic_skills_count > 3, note: result.generic_skills_count > 3 ? "Too vague" : "OK" },
  ];

  const scoreCards = [
    { label: "ATS Match",   score: result.ats_score,         sub: result.ats_score < 50          ? "May miss filters"          : "Passes most filters" },
    { label: "Impact",      score: result.impact_score,      sub: result.impact_score < 30        ? "Achievements not visible"   : "Some impact shown" },
    { label: "Keywords",    score: result.keyword_score,     sub: `${result.keywords_total - result.keywords_found} key terms missing` },
    { label: "Readability", score: result.readability_score, sub: result.readability_score >= 60  ? "Easy to scan"              : "Needs clearer structure" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto pb-28 sm:pb-10">

      {/* ── File chip + reset ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="flex items-center gap-2.5 mb-8 px-3.5 py-2.5 rounded-xl border border-slate-100 bg-white w-fit mx-auto">
        <FileText size={13} className="text-slate-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-500 max-w-[180px] truncate">{filename}</span>
        <button onClick={onReset} className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors ml-1">
          <RefreshCw size={11} /> New
        </button>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Hero Score
      ══════════════════════════════════════════════════════ */}
      <motion.section variants={staggerSm(0.09)} initial="hidden" animate="show"
        className="text-center mb-10">

        {name && (
          <motion.p variants={fadeUp} className="text-sm font-semibold text-slate-400 mb-2">
            Hi {name} — here is your CV report
          </motion.p>
        )}

        {/* Category badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full border"
            style={{ background: catStyle.bg, borderColor: catStyle.border, color: catStyle.text }}>
            {catStyle.icon}
            {result.category_label}
          </span>
        </motion.div>

        {/* Score ring */}
        <motion.div variants={fadeUp} className="flex justify-center mb-6 mt-2">
          <div className="relative" style={{ width: 168, height: 168 }}>
            <svg className="absolute inset-0 -rotate-90" width={168} height={168} viewBox="0 0 168 168">
              <circle cx="84" cy="84" r={R} fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <motion.circle
                cx="84" cy="84" r={R} fill="none"
                stroke={rc} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - result.overall_score / 100) }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[3.5rem] font-black leading-none text-slate-900"
                style={{ letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                {displayScore}
              </span>
              <span className="text-sm font-semibold text-slate-400 -mt-1">/100</span>
            </div>
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp}
          className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-tight px-4"
          style={{ letterSpacing: "-0.025em" }}>
          {label}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto px-4">
          {sub}
        </motion.p>

        {result.top_recommendation && (
          <motion.div variants={fadeUp} className="mt-5 px-4">
            <div className="inline-block rounded-2xl px-4 py-3 text-left max-w-sm w-full"
              style={{ background: "rgba(255,117,31,0.06)", border: "1px solid rgba(255,117,31,0.15)" }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: ORANGE }}>Top Fix</p>
              <p className="text-xs text-slate-700 leading-snug">{result.top_recommendation}</p>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Before / After
      ══════════════════════════════════════════════════════ */}
      {result.before_after && <BeforeAfterSection ba={result.before_after} />}

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — Score Breakdown Cards
      ══════════════════════════════════════════════════════ */}
      <ScoreCardsSection cards={scoreCards} />

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — What We Found
      ══════════════════════════════════════════════════════ */}
      <WhatWeFoundSection
        findings={findings}
        issues={result.issues}
        strengths={result.strengths}
        categoryLabel={result.category_label}
      />

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Transformation Preview
      ══════════════════════════════════════════════════════ */}
      <TransformationSection from={result.overall_score} to={potential} />

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — Format & Presentation (last analysis section)
      ══════════════════════════════════════════════════════ */}
      <FormatSection format={result.format} onCTA={() => router.push("/register")} />

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — CTA
      ══════════════════════════════════════════════════════ */}
      <CTASection score={result.overall_score} potential={potential} onCTA={() => router.push("/register")} />

      {/* ══════════════════════════════════════════════════════
          SECTION 8 — Social proof + reset
      ══════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="text-center mt-8 space-y-3">
        <p className="text-xs text-slate-400 font-medium">
          Based on 1,200+ CVs improved · Trusted by professionals in 30+ countries
        </p>
        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
        </p>
      </motion.div>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3">
        <motion.button onClick={() => router.push("/register")} whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl text-sm"
          style={{ background: ORANGE }}>
          <TrendingUp size={16} />
          Raise My Score to {potential}+
          <ArrowRight size={15} />
        </motion.button>
      </div>
    </div>
  );
}

// ── Before / After ──────────────────────────────────────────────────────────
function BeforeAfterSection({ ba }: { ba: BeforeAfter }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section ref={ref} variants={staggerSm(0.1)} initial="hidden"
      animate={inView ? "show" : "hidden"} className="mb-8 px-1">
      <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-center">
        Fastest Way to Improve
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-xl font-black text-slate-900 mb-5 text-center"
        style={{ letterSpacing: "-0.02em" }}>
        Add measurable results to your bullets
      </motion.h2>

      <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-slate-100"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Before</span>
          <p className="text-sm text-slate-600 leading-relaxed">{ba.before}</p>
        </div>
        <div className="flex justify-center py-2 bg-white border-b border-slate-100">
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,117,31,0.1)" }}>
            <ArrowDown size={12} style={{ color: ORANGE }} />
          </div>
        </div>
        <div className="px-5 py-4 bg-white">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{ color: ORANGE }}>After</span>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">{ba.after}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-center mt-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3.5 py-1.5 rounded-full"
          style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
          <TrendingUp size={12} />
          {ba.score_label}
        </span>
      </motion.div>
    </motion.section>
  );
}

// ── Score Cards ──────────────────────────────────────────────────────────────
function ScoreCardsSection({ cards }: { cards: { label: string; score: number; sub: string }[] }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section ref={ref} variants={staggerSm(0.08)} initial="hidden"
      animate={inView ? "show" : "hidden"} className="mb-8 px-1">
      <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
        Score Breakdown
      </motion.p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ label, score, sub }) => {
          const c = cardScoreColor(score);
          return (
            <motion.div key={label} variants={fadeUp}
              className="rounded-2xl bg-white border border-slate-100 p-4 text-center"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke={`${c.ring}22`} strokeWidth="5" />
                  <motion.circle
                    cx="28" cy="28" r="22" fill="none"
                    stroke={c.ring} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 22}
                    initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                    animate={inView ? { strokeDashoffset: 2 * Math.PI * 22 * (1 - score / 100) } : {}}
                    transition={{ duration: 1, ease: [0.4,0,0.2,1], delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black leading-none" style={{ color: c.text }}>{score}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">{sub}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

// ── Format & Presentation ─────────────────────────────────────────────────────
function FormatSection({ format, onCTA }: { format: CVFormat; onCTA: () => void }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const fc     = cardScoreColor(format.format_score);

  const atsBadge = format.ats_safe
    ? { label: "ATS Safe", bg: "rgba(34,197,94,0.1)",  text: "#16a34a" }
    : { label: "ATS Risk",  bg: "rgba(239,68,68,0.1)",  text: "#dc2626" };

  const templateBadgeColor: Record<string, { bg: string; text: string }> = {
    basic:        { bg: "rgba(239,68,68,0.1)",    text: "#dc2626" },
    generic:      { bg: "rgba(245,158,11,0.1)",   text: "#d97706" },
    structured:   { bg: "rgba(99,102,241,0.1)",   text: "#4338ca" },
    professional: { bg: "rgba(34,197,94,0.1)",    text: "#16a34a" },
  };
  const tbColors = templateBadgeColor[format.template_impression] ?? templateBadgeColor.generic;

  return (
    <motion.section ref={ref} variants={staggerSm(0.08)} initial="hidden"
      animate={inView ? "show" : "hidden"} className="mb-8 px-1">

      <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
        Format &amp; Presentation
      </motion.p>

      {/* Main card */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>

        {/* Header row: score + badges */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-50">
          {/* Format score mini ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke={`${fc.ring}22`} strokeWidth="5" />
              <motion.circle
                cx="28" cy="28" r="22" fill="none"
                stroke={fc.ring} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                animate={inView ? { strokeDashoffset: 2 * Math.PI * 22 * (1 - format.format_score / 100) } : {}}
                transition={{ duration: 1, ease: [0.4,0,0.2,1], delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black leading-none" style={{ color: fc.text }}>{format.format_score}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-slate-700 mb-1.5">Presentation Score</p>
            <div className="flex flex-wrap gap-1.5">
              {/* Layout type */}
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                <Layout size={8} />
                {formatLabel(format.layout_type)}
              </span>
              {/* ATS badge */}
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: atsBadge.bg, color: atsBadge.text }}>
                {format.ats_safe ? <CheckCheck size={8} /> : <AlertCircle size={8} />}
                {atsBadge.label}
              </span>
              {/* Template quality */}
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: tbColors.bg, color: tbColors.text }}>
                {templateLabel(format.template_impression)}
              </span>
            </div>
          </div>
        </div>

        {/* Format issues */}
        {format.issues.length > 0 && (
          <div className="border-b border-slate-50">
            {format.issues.map((issue, i) => (
              <div key={i} className={`flex items-start gap-3 px-5 py-3 ${i < format.issues.length - 1 ? "border-b border-slate-50" : ""}`}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-amber-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <span className="text-[12px] text-slate-600 leading-snug">{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Format strengths */}
        {format.strengths.length > 0 && (
          <div className="border-b border-slate-50">
            {format.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[12px] text-slate-600 leading-snug">{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* FuseCV themes teaser */}
        <div className="px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-1.5 mb-3">
            <Palette size={11} style={{ color: ORANGE }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: ORANGE }}>
              FuseCV Professional Themes
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 leading-snug">
            Your CV gets a career-matched layout from{" "}
            <strong className="text-slate-700">20 professional themes</strong> and{" "}
            <strong className="text-slate-700">15 layout variants</strong> — designed specifically for {" "}
            Junior, Mid-Senior, and Executive profiles.
          </p>

          {/* Theme swatches */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {FUSECV_THEMES.map(({ name, color }) => (
              <span key={name} className="inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-1 rounded-full text-white"
                style={{ background: color }}>
                {name}
              </span>
            ))}
            <span className="inline-flex items-center text-[9px] font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-500">
              +10 more
            </span>
          </div>

          {/* Upsell perks */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              ["Career-matched layout", "Tailored for your level"],
              ["Professional typography", "Serif & sans-serif options"],
              ["ATS-optimised structure", "Clean single-column builds"],
            ].map(([title, desc]) => (
              <div key={title} className="text-center">
                <p className="text-[9px] font-black text-slate-600 mb-0.5">{title}</p>
                <p className="text-[8px] text-slate-400 leading-tight">{desc}</p>
              </div>
            ))}
          </div>

          <button onClick={onCTA}
            className="w-full flex items-center justify-center gap-2 text-white font-black py-2.5 rounded-xl text-xs"
            style={{ background: ORANGE }}>
            <Sparkles size={13} />
            Apply a Professional Theme
            <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
}

// ── What We Found ────────────────────────────────────────────────────────────
function WhatWeFoundSection({
  findings, issues, strengths, categoryLabel,
}: {
  findings:      { label: string; value: string; bad: boolean; note: string }[];
  issues:        { severity: "critical" | "warning"; text: string }[];
  strengths:     string[];
  categoryLabel: string;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const criticalIssues = issues.filter(i => i.severity === "critical");
  const warningIssues  = issues.filter(i => i.severity === "warning");

  return (
    <motion.section ref={ref} variants={staggerSm(0.07)} initial="hidden"
      animate={inView ? "show" : "hidden"} className="mb-8 px-1">
      <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
        What We Found
      </motion.p>

      {/* Category context strip */}
      <motion.div variants={fadeUp}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-xs font-semibold text-slate-500"
        style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.06)" }}>
        <Sparkles size={11} className="text-slate-400 shrink-0" />
        Report tailored for <strong className="text-slate-700 ml-0.5">{categoryLabel}</strong>
      </motion.div>

      {/* Data table */}
      <motion.div variants={fadeUp}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
        {findings.map(({ label, value, bad, note }, i) => (
          <div key={label} className={`flex items-center gap-3 px-5 py-3.5 ${i < findings.length - 1 ? "border-b border-slate-50" : ""}`}>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bad ? "bg-red-400" : "bg-emerald-400"}`} />
            <span className="text-[12px] text-slate-600 flex-1">{label}</span>
            <span className={`text-[12px] font-black ${bad ? "text-red-600" : "text-emerald-600"}`}>{value}</span>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
              bad ? "bg-red-50 text-red-400" : "bg-emerald-50 text-emerald-500"
            }`}>{note}</span>
          </div>
        ))}
      </motion.div>

      {/* Critical issues */}
      {criticalIssues.length > 0 && (
        <motion.div variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50">
            <XCircle size={12} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Critical Issues ({criticalIssues.length})
            </span>
          </div>
          {criticalIssues.map(({ text }, i) => (
            <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${i < criticalIssues.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
              <span className="text-[12px] text-slate-700 leading-snug flex-1">{text}</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5 bg-red-100 text-red-600">
                critical
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Warnings */}
      {warningIssues.length > 0 && (
        <motion.div variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50">
            <AlertCircle size={12} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Recommendations ({warningIssues.length})
            </span>
          </div>
          {warningIssues.map(({ text }, i) => (
            <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${i < warningIssues.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-amber-100">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-[12px] text-slate-700 leading-snug flex-1">{text}</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5 bg-amber-100 text-amber-600">
                warning
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <motion.div variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50">
            <Sparkles size={12} style={{ color: BLUE }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strengths</span>
          </div>
          {strengths.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${i < strengths.length - 1 ? "border-b border-slate-50" : ""}`}>
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[12px] text-slate-700 leading-snug">{s}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}

// ── Transformation Preview ────────────────────────────────────────────────────
function TransformationSection({ from, to }: { from: number; to: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section ref={ref} variants={staggerSm(0.1)} initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="mb-8 px-1 bg-white rounded-2xl border border-slate-100 p-6"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>

      <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 text-center">
        See Your Possible Upgrade
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-xl font-black text-slate-900 mb-6 text-center"
        style={{ letterSpacing: "-0.02em" }}>
        {from} → {to}+
      </motion.h2>

      <motion.div variants={fadeUp} className="mb-5">
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: ringColor(from) }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${from}%` } : {}}
            transition={{ duration: 1, ease: [0.4,0,0.2,1], delay: 0.2 }} />
          <motion.div className="absolute top-0 h-full rounded-full opacity-30"
            style={{ background: "#22c55e", left: `${from}%` }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${to - from}%` } : {}}
            transition={{ duration: 0.9, ease: [0.4,0,0.2,1], delay: 0.9 }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-black text-slate-500">Current: {from}</span>
          <span className="text-[10px] font-black text-emerald-600">Potential: {to}+</span>
        </div>
      </motion.div>

      <motion.p variants={fadeUp} className="text-sm text-slate-500 text-center leading-relaxed">
        Your score can improve significantly with stronger wording, measurable achievements,
        and ATS optimisation.
      </motion.p>
    </motion.section>
  );
}

// ── CTA Block ─────────────────────────────────────────────────────────────────
function CTASection({ score, potential, onCTA }: { score: number; potential: number; onCTA: () => void }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.section ref={ref} variants={staggerSm(0.1)} initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="rounded-3xl overflow-hidden mb-6 px-1">

      <div className="relative rounded-3xl p-7 text-center" style={{ background: DARK }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute w-48 h-48 rounded-full blur-3xl opacity-20"
            style={{ background: BLUE, top: "-20%", left: "10%" }} />
          <div className="absolute w-36 h-36 rounded-full blur-3xl opacity-15"
            style={{ background: ORANGE, bottom: "-10%", right: "5%" }} />
        </div>

        <motion.p variants={fadeUp} className="text-[10px] font-black uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          Unlock Your Improved CV
        </motion.p>

        <motion.h2 variants={fadeUp}
          className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight"
          style={{ letterSpacing: "-0.025em" }}>
          We&apos;ll fix every issue<br />
          <span style={{ color: ORANGE }}>and raise your score to {potential}+</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-sm leading-relaxed mb-7 max-w-xs mx-auto"
          style={{ color: "rgba(255,255,255,0.45)" }}>
          Our AI rewrites your CV, applies a professional theme matched to your career level,
          and delivers a recruiter-ready version in minutes.
        </motion.p>

        <motion.button
          variants={fadeUp} onClick={onCTA}
          whileHover={{ scale: 1.04, boxShadow: `0 16px 40px rgba(255,117,31,0.5)` }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl text-base mb-5"
          style={{ background: ORANGE }}>
          <TrendingUp size={18} />
          Raise My Score to {potential}+
          <ArrowRight size={17} />
        </motion.button>

        <motion.div variants={fadeUp}
          className="flex items-center justify-center gap-5 text-[11px] font-semibold flex-wrap"
          style={{ color: "rgba(255,255,255,0.28)" }}>
          <span className="flex items-center gap-1.5"><Shield size={11} /> Free account</span>
          <span className="flex items-center gap-1.5"><Lock size={11} /> No card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={11} /> Private &amp; secure</span>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOT A CV ERROR
// ─────────────────────────────────────────────────────────────────────────────
function NotACVError({ docLabel, onReset }: { docLabel: string; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center max-w-sm mx-auto">

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "rgba(245,158,11,0.08)" }}>
        <FileSearch size={28} className="text-amber-500" />
      </div>

      {/* Headline */}
      <h2 className="text-xl font-black text-slate-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
        That doesn&apos;t look like a CV
      </h2>

      {/* Detected type */}
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
        style={{ background: "rgba(245,158,11,0.08)", color: "#d97706" }}>
        <FileX size={12} />
        Detected: {docLabel}
      </div>

      {/* Explanation */}
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        We can only analyse <strong className="text-slate-700">CV or resume documents</strong>.
        Please upload the document that lists your work experience, education, and skills.
      </p>

      {/* What to upload */}
      <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-6 text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          What to upload
        </p>
        <div className="space-y-2.5">
          {[
            ["Your CV or resume", "The document listing your work history, skills, and education"],
            ["PDF or Word format", ".pdf · .doc · .docx — max 5 MB"],
            ["Any career level", "Student, graduate, junior, senior, or executive"],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700">{title}</p>
                <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onReset}
        className="inline-flex items-center gap-2 font-black text-white px-7 py-3.5 rounded-xl text-sm w-full justify-center"
        style={{ background: ORANGE }}>
        <Upload size={16} /> Upload My CV
      </button>

      <p className="text-xs text-slate-400 mt-3">
        No account needed · Results in ~60 seconds
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────────────────────
function ErrorView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <XCircle size={26} className="text-red-500" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
      <button onClick={onReset}
        className="inline-flex items-center gap-2 font-black text-white px-6 py-3 rounded-xl text-sm"
        style={{ background: ORANGE }}>
        <RefreshCw size={15} /> Try again
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CVCheckClient() {
  const [step,     setStep]     = useState<Step>("upload");
  const [file,     setFile]     = useState<File | null>(null);
  const [result,   setResult]   = useState<AnalysisResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [notACVDoc, setNotACVDoc] = useState<{ label: string } | null>(null);

  const handleFile = useCallback(async (f: File) => {
    const ok = ["application/pdf","application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!ok.includes(f.type) && !f.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Please upload a PDF or Word document."); return;
    }
    if (f.size > 5_242_880) { setError("File too large. Max 5 MB."); return; }

    setFile(f); setError(null); setNotACVDoc(null); setStep("scanning");
    const fd = new FormData(); fd.append("file", f);

    const [res] = await Promise.all([
      fetch("/api/cv-check", { method: "POST", body: fd }),
      new Promise(r => setTimeout(r, 8000)),
    ]);

    try {
      const data = await (res as Response).json();

      // Non-CV document — show dedicated screen, not generic error
      if (data.error === "not_a_cv") {
        setNotACVDoc({ label: data.document_label ?? "unrecognised document" });
        setStep("upload");
        return;
      }

      if (!(res as Response).ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data); setStep("results");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setStep("upload");
    }
  }, []);

  const reset = useCallback(() => {
    setStep("upload"); setFile(null); setResult(null); setError(null); setNotACVDoc(null);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={88} height={27} className="object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="text-xs font-black text-white px-3.5 py-2 rounded-lg"
              style={{ background: ORANGE }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-14 min-h-screen">
        <div className="flex items-center justify-center px-4 sm:px-8 py-12 min-h-[calc(100vh-56px)]">
          <AnimatePresence mode="wait">
            {notACVDoc ? (
              <motion.div key="notcv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <NotACVError docLabel={notACVDoc.label} onReset={reset} />
              </motion.div>
            ) : error ? (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <ErrorView message={error} onReset={reset} />
              </motion.div>
            ) : step === "upload" ? (
              <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <UploadZone onFile={handleFile} />
              </motion.div>
            ) : step === "scanning" ? (
              <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <ScanningView filename={file?.name ?? ""} />
              </motion.div>
            ) : result ? (
              <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <ResultsView result={result} filename={file?.name ?? ""} onReset={reset} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
