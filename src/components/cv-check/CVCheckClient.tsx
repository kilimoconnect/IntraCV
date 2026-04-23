"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, CheckCircle2, XCircle, AlertCircle,
  ArrowRight, TrendingUp, Zap, Lock, RefreshCw,
  Sparkles, ChevronRight,
} from "lucide-react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const ORANGE = "#ff751f";
const DARK   = "#0a1628";
const BLUE   = "#004aad";
const ez     = [0.22, 1, 0.36, 1] as [number,number,number,number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: ez } },
};
const stagger = (d = 0.07): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  name: string;
  current_role: string;
  word_count: number;
  page_estimate: number;
  summary_word_count: number;
  has_summary: boolean;
  total_bullets: number;
  bullets_with_metrics: number;
  total_skills: number;
  generic_skills_count: number;
  keywords_found: number;
  keywords_total: number;
  ats_score: number;
  impact_score: number;
  keyword_score: number;
  readability_score: number;
  overall_score: number;
  issues: { severity: "critical" | "warning"; text: string }[];
  strengths: string[];
  top_recommendation: string;
}

type Step = "upload" | "scanning" | "results";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 65) return "#22c55e";
  if (s >= 45) return "#f59e0b";
  return "#ef4444";
}
function scoreLabel(s: number) {
  if (s >= 75) return { text: "Strong",       color: "#22c55e" };
  if (s >= 55) return { text: "Average",      color: "#f59e0b" };
  if (s >= 35) return { text: "Needs Work",   color: "#ef4444" };
  return          { text: "Weak CV",         color: "#ef4444" };
}
function potentialScore(s: number) {
  // Estimate what the score could be after fixes
  const gap = 100 - s;
  return Math.min(95, s + Math.round(gap * 0.55));
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center text-center max-w-lg mx-auto w-full"
    >
      <motion.div variants={fadeUp} className="mb-6">
        <Image src="/fusecv-logo.png" alt="FuseCV" width={100} height={32} className="object-contain mx-auto" />
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight"
        style={{ letterSpacing: "-0.02em" }}
      >
        Get Your Free CV Score
      </motion.h1>

      <motion.p variants={fadeUp} className="text-base text-slate-500 mb-8 max-w-sm">
        Upload your CV and get an instant analysis — no account required.
      </motion.p>

      {/* Drop zone */}
      <motion.div
        variants={fadeUp}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10 flex flex-col items-center gap-4"
        style={{
          borderColor: dragging ? ORANGE : "#e2e8f0",
          background:  dragging ? "rgba(255,117,31,0.04)" : "#f8fafc",
        }}
        whileHover={{ borderColor: ORANGE, background: "rgba(255,117,31,0.03)" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: `rgba(255,117,31,0.1)` }}>
          <Upload size={24} style={{ color: ORANGE }} />
        </div>
        <div>
          <p className="font-black text-slate-800 text-base mb-1">
            Drop your CV here or{" "}
            <span style={{ color: ORANGE }}>browse files</span>
          </p>
          <p className="text-sm text-slate-400">PDF or Word · Max 5 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleChange}
        />
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex items-center gap-5 mt-6 text-xs font-semibold text-slate-400"
      >
        <span className="flex items-center gap-1.5"><Lock size={12} className="text-slate-300" /> Secure</span>
        <span className="flex items-center gap-1.5"><Zap size={12} className="text-slate-300" /> Results in ~60s</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-slate-300" /> Free, no account</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Scanning Step ─────────────────────────────────────────────────────────────
const SCAN_STEPS = [
  "Uploading CV…",
  "Extracting text and structure…",
  "Analysing ATS compatibility…",
  "Scoring impact and keywords…",
  "Generating your report…",
];

function ScanningView({ filename }: { filename: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = SCAN_STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 1400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center max-w-md mx-auto w-full"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "rgba(255,117,31,0.1)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Zap size={28} style={{ color: ORANGE }} />
        </motion.div>
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-2">Analysing your CV…</h2>
      <p className="text-sm text-slate-400 mb-8 truncate max-w-xs">{filename}</p>

      <div className="w-full space-y-3 mb-6">
        {SCAN_STEPS.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= step ? 1 : 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
              i < step  ? "bg-green-500"  :
              i === step ? "bg-orange-500" : "bg-slate-200"
            }`}>
              {i < step ? (
                <CheckCircle2 size={12} className="text-white" />
              ) : i === step ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </motion.div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              )}
            </div>
            <span className={i <= step ? "text-slate-700 font-semibold" : "text-slate-400"}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: ORANGE }}
          animate={{ width: `${Math.min(95, ((step + 1) / SCAN_STEPS.length) * 100)}%` }}
          transition={{ duration: 0.6, ease: ez }}
        />
      </div>
    </motion.div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────
function ResultsView({
  result,
  filename,
  onReset,
}: {
  result: AnalysisResult;
  filename: string;
  onReset: () => void;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [animated, setAnimated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 200);
  }, [inView]);

  const circumference = 2 * Math.PI * 36;
  const sl            = scoreLabel(result.overall_score);
  const potential     = potentialScore(result.overall_score);

  const bars = [
    { label: "ATS Match",   score: result.ats_score     },
    { label: "Impact",      score: result.impact_score  },
    { label: "Keywords",    score: result.keyword_score },
    { label: "Readability", score: result.readability_score },
  ];

  const findings = [
    {
      field: "Summary length",
      value: result.has_summary ? `${result.summary_word_count} words` : "Not found",
      note:  result.has_summary && result.summary_word_count >= 80
        ? "good length" : result.has_summary ? "too short" : "missing",
      bad: !result.has_summary || result.summary_word_count < 80,
    },
    {
      field: "Bullets with metrics",
      value: `${result.bullets_with_metrics} of ${result.total_bullets}`,
      note:  result.bullets_with_metrics === 0 ? "no results" : "found",
      bad:   result.bullets_with_metrics < Math.ceil(result.total_bullets * 0.3),
    },
    {
      field: "Keyword matches",
      value: `${result.keywords_found} of ${result.keywords_total}`,
      note:  `${result.keywords_total - result.keywords_found} missing`,
      bad:   result.keywords_found < 6,
    },
    {
      field: "Generic skills",
      value: `${result.generic_skills_count} of ${result.total_skills}`,
      note:  result.generic_skills_count > 3 ? "too vague" : "acceptable",
      bad:   result.generic_skills_count > 3,
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
      className="w-full max-w-2xl mx-auto"
    >
      {/* ── File header ── */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#fee2e2" }}>
          <FileText size={16} className="text-red-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black text-slate-800 truncate">{filename}</p>
          <p className="text-[10px] text-slate-400">
            {result.page_estimate} page{result.page_estimate !== 1 ? "s" : ""} · ~{result.word_count} words · analysed just now
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          <RefreshCw size={12} />
          New check
        </button>
      </motion.div>

      {/* ── Score + bars ── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl border border-slate-100 p-5 mb-4"
        style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            FuseCV · Your CV Report
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold text-slate-400">DONE</span>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Circle */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative w-[80px] h-[80px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none"
                  stroke={`${scoreColor(result.overall_score)}22`} strokeWidth="6" />
                <motion.circle
                  cx="40" cy="40" r="36" fill="none"
                  stroke={scoreColor(result.overall_score)} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={animated ? { strokeDashoffset: circumference * (1 - result.overall_score / 100) } : {}}
                  transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-2xl font-black leading-none text-slate-900"
                  initial={{ opacity: 0 }}
                  animate={animated ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                >{result.overall_score}</motion.span>
                <span className="text-[9px] text-slate-400 font-bold">/100</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: sl.color }}>
              {sl.text}
            </span>
          </div>

          {/* Bars */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Score Breakdown</p>
            <div className="space-y-2">
              {bars.map(({ label, score }, i) => {
                const c = scoreColor(score);
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-20 shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: c }}
                        initial={{ width: 0 }}
                        animate={animated ? { width: `${score}%` } : {}}
                        transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: [0.4,0,0.2,1] }}
                      />
                    </div>
                    <span className="text-[10px] font-bold w-6 text-right shrink-0" style={{ color: c }}>{score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── What we found ── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl border border-slate-100 p-5 mb-4"
        style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          What We Found in Your CV
        </p>
        <div className="space-y-2">
          {findings.map(({ field, value, note, bad }, i) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -6 }}
              animate={animated ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0"
            >
              <span className="text-[11px] text-slate-500 flex-1">{field}</span>
              <span className={`text-[11px] font-black ${bad ? "text-red-600" : "text-emerald-600"}`}>
                {value}
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                bad ? "bg-red-50 text-red-400" : "bg-emerald-50 text-emerald-500"
              }`}>{note}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Issues ── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl border border-slate-100 p-5 mb-4"
        style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={13} className="text-red-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Issues Found</p>
        </div>
        <div className="space-y-2">
          {result.issues.map(({ severity, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={animated ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.09 }}
              className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
              style={{ background: severity === "critical" ? "#fef2f2" : "#fffbeb" }}
            >
              <XCircle size={13} className={`mt-0.5 shrink-0 ${
                severity === "critical" ? "text-red-500" : "text-amber-500"
              }`} />
              <span className="text-[12px] font-semibold text-slate-700 leading-snug flex-1">{text}</span>
              <span className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                severity === "critical" ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"
              }`}>{severity}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Strengths ── */}
      {result.strengths.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-100 p-5 mb-4"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: BLUE }} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strengths</p>
          </div>
          <div className="space-y-2">
            {result.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-blue-50 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={13} style={{ color: BLUE }} className="mt-0.5 shrink-0" />
                <span className="text-[12px] font-semibold text-slate-700 leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Top recommendation ── */}
      {result.top_recommendation && (
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border p-4 mb-4"
          style={{ borderColor: `rgba(255,117,31,0.3)`, background: "rgba(255,117,31,0.04)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: ORANGE }}>
            #1 Priority Fix
          </p>
          <p className="text-[13px] font-semibold text-slate-700 leading-snug">{result.top_recommendation}</p>
        </motion.div>
      )}

      {/* ── Potential score ── */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 border border-slate-100"
        style={{ background: "linear-gradient(90deg,rgba(0,74,173,0.05) 0%,rgba(0,74,173,0.01) 100%)" }}
      >
        <TrendingUp size={18} style={{ color: BLUE }} className="shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-black text-slate-800">
            Fix these issues → score jumps to{" "}
            <span style={{ color: BLUE }} className="text-base">{potential}/100</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Based on 1,200+ CVs we&apos;ve improved</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-slate-100 shrink-0">
          <span className="text-[11px] font-black text-red-500 line-through">{result.overall_score}</span>
          <ArrowRight size={10} style={{ color: BLUE }} />
          <span className="text-[11px] font-black" style={{ color: BLUE }}>{potential}</span>
        </div>
      </motion.div>

      {/* ── Conversion CTA ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-6 text-center mb-6"
        style={{ background: DARK }}
      >
        <p className="text-[11px] font-black uppercase tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          Ready to fix it?
        </p>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
          Get your improved CV —
          <br />
          <span style={{ color: ORANGE }}>score {potential}+ guaranteed.</span>
        </h3>
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
          Our AI rewrites your CV, fixes every issue, and optimises it for ATS.
          Download in minutes.
        </p>
        <motion.button
          onClick={() => router.push("/register")}
          whileHover={{ scale: 1.04, boxShadow: `0 16px 40px rgba(255,117,31,0.45)` }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl text-base"
          style={{ background: ORANGE }}
        >
          <Sparkles size={18} />
          Fix My CV — Sign Up Free
          <ArrowRight size={17} />
        </motion.button>
        <p className="text-[11px] mt-3 font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
          Free account · No credit card required
        </p>
      </motion.div>

      {/* ── Already have account ── */}
      <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mb-8">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-slate-600 hover:text-slate-900 transition-colors">
          Sign in
        </Link>
        {" "}to open the full CV builder.
      </motion.p>
    </motion.div>
  );
}

// ─── Error view ───────────────────────────────────────────────────────────────
function ErrorView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center max-w-sm mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <XCircle size={26} className="text-red-500" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 font-black text-white px-6 py-3 rounded-xl text-sm"
        style={{ background: ORANGE }}
      >
        <RefreshCw size={15} />
        Try again
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CVCheckClient() {
  const [step, setStep]       = useState<Step>("upload");
  const [file, setFile]       = useState<File | null>(null);
  const [result, setResult]   = useState<AnalysisResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    // Validate
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Please upload a PDF or Word document.");
      return;
    }
    if (f.size > 5_242_880) {
      setError("File is too large. Please upload a CV under 5 MB.");
      return;
    }

    setFile(f);
    setError(null);
    setStep("scanning");

    try {
      const fd = new FormData();
      fd.append("file", f);

      const res  = await fetch("/api/cv-check", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      // Wait a minimum of 7s so the scanning animation feels complete
      await new Promise(r => setTimeout(r, 7000));

      setResult(data);
      setStep("results");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setStep("upload");
    }
  }, []);

  const reset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={88} height={27} className="object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-xs font-black text-white px-3.5 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: ORANGE }}
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-14 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ErrorView message={error} onReset={reset} />
              </motion.div>
            ) : step === "upload" ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <UploadZone onFile={handleFile} />
              </motion.div>
            ) : step === "scanning" ? (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <ScanningView filename={file?.name ?? ""} />
              </motion.div>
            ) : result ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                <ResultsView result={result} filename={file?.name ?? ""} onReset={reset} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 py-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FuseCV ·{" "}
            <Link href="/landing" className="hover:text-slate-600 transition-colors">How it works</Link>
            {" "}·{" "}
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
