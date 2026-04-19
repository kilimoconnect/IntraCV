"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion, useInView, useMotionValue, useSpring,
  AnimatePresence, useScroll, useTransform,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Sparkles, FileText, CheckCircle2,
  ChevronDown, Zap, Shield, Target, Star, Globe, Clock,
  X, BarChart2, Lock, RefreshCw, Briefcase,
  Check, Minus, BookOpen, ChevronRight, Cpu, MousePointer,
  TrendingUp, Award,
} from "lucide-react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BLUE   = "#004aad";
const ORANGE = "#ff751f";
const TEAL   = "#00c4cc";

// ─── Motion helpers ───────────────────────────────────────────────────────────
type BezierEase = [number, number, number, number];
const bez: BezierEase = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: bez } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.45 } },
};
const stagger = (d = 0.07): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
});
const slideIn = (dir: "left" | "right"): Variants => ({
  hidden: { opacity: 0, x: dir === "left" ? -36 : 36 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: bez } },
});

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <motion.nav
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: bez }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white shadow-sm border-b border-slate-100" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={100} height={32} className="object-contain" priority />
        </Link>

        {/* Centre nav */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {[
            { label: "Product",    id: "product" },
            { label: "How it works", id: "how-it-works" },
            { label: "Pricing",    id: "pricing" },
            { label: "Guides",     href: "/guides" },
          ].map(({ label, id, href }) =>
            href ? (
              <Link key={label} href={href}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-[#004aad] hover:bg-blue-50 transition-all">
                {label}
              </Link>
            ) : (
              <button key={label}
                onClick={() => document.getElementById(id!)?.scrollIntoView({ behavior: "smooth" })}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-[#004aad] hover:bg-blue-50 transition-all">
                {label}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-[#004aad] transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <motion.button onClick={handleCTA} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="text-sm font-bold text-white px-5 py-2 rounded-xl transition-colors shadow-sm"
            style={{ background: BLUE }}>
            Try Free →
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const [score, setScore] = useState(31);
  const [animating, setAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => { setAnimating(true); }, 1200);
    const t2 = setTimeout(() => { setScore(94); setDone(true); setAnimating(false); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  const keywords = ["ATS-optimised", "Demand generation", "Pipeline growth", "Stakeholder management", "Budget ownership"];
  const suggestions = [
    { label: "Add quantified metrics", done: done },
    { label: "Include ATS keywords",   done: done },
    { label: "Strengthen summary",     done: done },
    { label: "Fix formatting issues",  done: done },
  ];

  return (
    <div ref={ref} className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-4 bg-white rounded-md px-3 py-0.5 text-[10px] text-slate-400 font-mono">
          app.fusecv.com/dashboard
        </div>
      </div>

      {/* App UI */}
      <div className="flex h-[360px]">
        {/* Left — CV preview */}
        <div className="w-[46%] border-r border-slate-100 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your CV</span>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full transition-all duration-700 ${
              done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}>
              {done ? "✓ Optimised" : "Analysing..."}
            </span>
          </div>
          {/* Mock CV text lines */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-bold text-slate-700">James Mitchell</div>
            <div className="text-[8px] text-slate-500 mb-2">Senior Marketing Manager · London</div>
            {[
              { w: "full", label: done ? "Led demand-gen generating £4.1M ARR in FY2023" : "Responsible for marketing activities" },
              { w: "4/5",  label: done ? "Managed £2.4M budget, +42% pipeline YoY" : "Worked with the sales team" },
              { w: "full", label: done ? "Scaled social audience 8K → 34K, 68% engagement" : "Managed social media accounts" },
              { w: "3/4",  label: done ? "Reduced sales cycle by 18% through alignment" : "Helped with content creation" },
            ].map((line, i) => (
              <motion.div key={i}
                animate={{ opacity: 1 }}
                className="text-[8px] leading-4 text-slate-600 transition-all duration-700">
                {animating ? (
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                    className={`h-2 rounded bg-blue-100 ${line.w === "full" ? "w-full" : line.w === "4/5" ? "w-4/5" : "w-3/4"}`} />
                ) : (
                  <span className={done ? "text-slate-700" : "text-slate-400"}>{line.label}</span>
                )}
              </motion.div>
            ))}
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Experience</div>
              {["TechVentures Ltd · 2020–Present", "BrightScale Agency · 2017–2020"].map((co) => (
                <div key={co} className="flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: BLUE }} />
                  <div className="text-[8px] text-slate-500">{co}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — AI panel */}
        <div className="flex-1 p-4 bg-slate-50 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Analysis</span>
            {animating && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 rounded-full border-2 border-blue-200 border-t-blue-600" />
            )}
          </div>

          {/* Score gauge */}
          <div className="flex items-center gap-3 mb-4 bg-white rounded-xl p-3 border border-slate-100">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" strokeLinecap="round"
                  stroke={score >= 80 ? "#059669" : score >= 50 ? ORANGE : "#ef4444"}
                  strokeDasharray="100 100"
                  animate={{ strokeDashoffset: 100 - score }}
                  transition={{ duration: 1.5, ease: bez }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span animate={{ color: score >= 80 ? "#059669" : score >= 50 ? ORANGE : "#ef4444" }}
                  className="text-[11px] font-black">{score}</motion.span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-700">ATS Score</div>
              <motion.div className="text-[9px] font-semibold mt-0.5"
                animate={{ color: score >= 80 ? "#059669" : "#ef4444" }}>
                {done ? "Excellent · Interview-ready" : "Poor · Needs work"}
              </motion.div>
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-3">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Keywords Added</div>
            <div className="flex flex-wrap gap-1">
              {keywords.map((kw, i) => (
                <AnimatePresence key={kw}>
                  {done && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-[8px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${TEAL}18`, color: TEAL }}>
                      {kw}
                    </motion.span>
                  )}
                </AnimatePresence>
              ))}
              {!done && <div className="text-[8px] text-slate-400 italic">Scanning...</div>}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5">
            {suggestions.map(({ label, done: d }, i) => (
              <motion.div key={label}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-[8px]">
                <motion.div
                  animate={{ background: d ? "#059669" : "#e2e8f0" }}
                  transition={{ delay: d ? i * 0.12 : 0 }}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0">
                  {d && <Check size={8} className="text-white" strokeWidth={3} />}
                </motion.div>
                <span className={d ? "text-slate-700 line-through" : "text-slate-400"}>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <section className="pt-28 pb-16 overflow-hidden" style={{ background: "linear-gradient(170deg, #f0f6ff 0%, #ffffff 55%, #f8faff 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top badge */}
        <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full border"
              style={{ borderColor: `${BLUE}30`, background: `${BLUE}08`, color: BLUE }}>
              <Sparkles size={11} />
              AI CV Builder · Trusted in 30+ countries
            </span>
          </motion.div>

          {/* Headline — centered, big, different approach from landing */}
          <motion.div variants={fadeUp} className="text-center max-w-4xl mx-auto mb-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.06]">
              A better CV.{" "}
              <span className="relative">
                <span style={{ color: ORANGE }}>60 seconds.</span>
                <motion.div
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: bez }}
                  className="absolute -bottom-2 left-0 w-full h-1 rounded-full origin-left"
                  style={{ background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE}44)` }}
                />
              </span>
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your CV. Paste a job description. AI rewrites, reformats and ATS-optimises everything — producing a recruiter-ready CV in under a minute.
          </motion.p>

          {/* CTA row */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <motion.button onClick={handleCTA}
              whileHover={{ scale: 1.03, boxShadow: `0 8px 30px ${ORANGE}44` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white text-base shadow-lg"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #e8601a)` }}>
              <Upload size={17} />
              Upload My CV — It&apos;s Free
              <ArrowRight size={15} />
            </motion.button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <MousePointer size={14} />
              See how it works
            </button>
          </motion.div>

          {/* Micro trust */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16">
            {[
              { icon: <Shield size={12} />, t: "No card required" },
              { icon: <Lock size={12} />,   t: "Private & secure" },
              { icon: <Clock size={12} />,  t: "Ready in 60s" },
              { icon: <CheckCircle2 size={12} />, t: "Preview before paying" },
            ].map(({ icon, t }) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-slate-400">{icon}</span>{t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard mockup — centrepiece */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: bez }}
          id="product"
          className="max-w-3xl mx-auto">
          <DashboardMockup />
          <p className="text-center text-xs text-slate-400 mt-4">Watch the ATS score rise from 31 to 94 — live, in seconds</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const items = [
    { value: "50,000+", label: "CVs transformed" },
    { value: "94%",     label: "ATS pass rate" },
    { value: "30+",     label: "Countries" },
    { value: "< 60s",   label: "Average time" },
    { value: "4.9★",    label: "User rating" },
  ];
  return (
    <section className="py-6 bg-slate-900 border-y border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {items.map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-extrabold text-white">{value}</div>
                <div className="text-[10px] text-slate-400 font-medium">{label}</div>
              </div>
              {i < items.length - 1 && <div className="hidden sm:block w-px h-6 bg-slate-700" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Rows ─────────────────────────────────────────────────────────────
function FeatureRow({
  eyebrow, headline, body, bullets, visual, reverse, accent,
}: {
  eyebrow: string; headline: string; body: string;
  bullets: string[]; visual: React.ReactNode;
  reverse?: boolean; accent: string;
}) {
  return (
    <div className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}>
      {/* Text */}
      <motion.div variants={slideIn(reverse ? "right" : "left")} initial="hidden" whileInView="show"
        viewport={{ once: true }} className="flex-1 max-w-lg">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
          style={{ background: `${accent}15`, color: accent }}>
          {eyebrow}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">{headline}</h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-7">{body}</p>
        <ul className="space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-slate-700">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${accent}20` }}>
                <Check size={11} strokeWidth={3} style={{ color: accent }} />
              </div>
              {b}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Visual */}
      <motion.div variants={slideIn(reverse ? "left" : "right")} initial="hidden" whileInView="show"
        viewport={{ once: true }} className="flex-1 w-full max-w-lg">
        {visual}
      </motion.div>
    </div>
  );
}

// Feature 1 visual — upload zone
function UploadVisual() {
  const [hover, setHover] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHover(true), 2000);
    const t2 = setTimeout(() => { setUploaded(true); setHover(false); }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white p-6">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Upload Your CV</div>
      <motion.div
        animate={{
          borderColor: uploaded ? "#059669" : hover ? ORANGE : "#e2e8f0",
          background: uploaded ? "#f0fdf4" : hover ? `${ORANGE}08` : "#f8fafc",
        }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors"
      >
        <motion.div animate={{ scale: hover || uploaded ? 1.15 : 1 }} transition={{ duration: 0.3 }}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: uploaded ? "#d1fae5" : hover ? `${ORANGE}15` : "#f1f5f9" }}>
          {uploaded
            ? <CheckCircle2 size={26} className="text-emerald-600" />
            : <Upload size={26} style={{ color: hover ? ORANGE : "#94a3b8" }} />
          }
        </motion.div>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-700">{uploaded ? "CV uploaded!" : hover ? "Drop it here" : "Drag & drop your CV"}</div>
          <div className="text-xs text-slate-400 mt-1">{uploaded ? "james_mitchell_cv.pdf · 148 KB" : "PDF or Word · Any format works"}</div>
        </div>
      </motion.div>

      {/* Format badges */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {[".pdf", ".docx", ".doc", ".txt", "Paste text"].map((fmt) => (
          <span key={fmt} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">{fmt}</span>
        ))}
      </div>
    </div>
  );
}

// Feature 2 visual — job matching
function JobMatchVisual() {
  const keywords = [
    { word: "ATS optimisation", match: true },
    { word: "Demand generation", match: true },
    { word: "Budget management", match: true },
    { word: "Stakeholder comms", match: true },
    { word: "CRM tools", match: false },
    { word: "Campaign analytics", match: true },
    { word: "Team leadership", match: true },
    { word: "Salesforce", match: false },
  ];
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white p-6">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Job Description Match</div>

      {/* JD input */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 mb-4 text-[10px] text-slate-500 leading-5 font-mono">
        <span className="text-slate-300">// Paste job description</span>
        <br />We are looking for a Senior Marketing Manager with experience in{" "}
        <span className="font-bold text-slate-700">demand generation</span>,{" "}
        <span className="font-bold text-slate-700">budget management</span> and strong{" "}
        <span className="font-bold text-slate-700">ATS optimisation</span> skills...
      </div>

      {/* Match keywords */}
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Keyword Coverage</div>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map(({ word, match }, i) => (
          <motion.span key={word}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
            style={match
              ? { background: `${TEAL}18`, color: TEAL, border: `1px solid ${TEAL}30` }
              : { background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca" }
            }>
            {match ? "✓" : "✗"} {word}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold" style={{ color: "#059669" }}>
        <CheckCircle2 size={14} />
        6 of 8 keywords matched — AI adds the missing ones
      </div>
    </div>
  );
}

// Feature 3 visual — polished output
function OutputVisual() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your optimised CV</span>
        <motion.button whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg"
          style={{ background: BLUE }}>
          <FileText size={10} /> Download PDF
        </motion.button>
      </div>
      {/* Mini CV preview */}
      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-2 shrink-0 rounded-full" style={{ background: `linear-gradient(180deg, ${BLUE}, ${TEAL})` }} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-sm font-black text-slate-900">James Mitchell</div>
              <div className="text-[10px] font-semibold" style={{ color: BLUE }}>Senior Marketing Manager</div>
              <div className="text-[9px] text-slate-400 mt-0.5">london@email.com · +44 7700 900 123</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: BLUE }}>Professional Summary</div>
              <div className="text-[9px] text-slate-600 leading-4">Results-driven Senior Marketing Manager with 9+ years delivering high-impact campaigns. Generated £4.1M attributable revenue in FY2023 through targeted demand-gen programmes.</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: BLUE }}>Experience</div>
              {[
                { role: "Senior Marketing Manager", co: "TechVentures Ltd · 2020–Present", bullets: ["Led demand-gen generating £4.1M ARR — +42% pipeline YoY", "Managed £2.4M multi-channel budget, 31% revenue growth"] },
                { role: "Marketing Manager", co: "BrightScale Agency · 2017–2020", bullets: ["Grew social from 8K → 34K, 68% engagement lift"] },
              ].map((e) => (
                <div key={e.role} className="mb-2.5 pl-2 border-l-[1.5px]" style={{ borderColor: BLUE }}>
                  <div className="text-[9px] font-bold text-slate-800">{e.role}</div>
                  <div className="text-[8px] font-semibold mb-1" style={{ color: BLUE }}>{e.co}</div>
                  {e.bullets.map((b) => <div key={b} className="text-[8px] text-slate-600 leading-3.5 mb-0.5">• {b}</div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
          <span className="text-[9px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "#059669" }}>ATS Score: 94</span>
          <span className="text-[9px] text-slate-400">· Professional format · Ready to send</span>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24 bg-white" id="product">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-24">
        <FeatureRow
          eyebrow="Step 1 — Upload"
          headline="Any CV. Any format. Instantly."
          body="PDF, Word, or paste your text — FuseCV reads every section accurately without any manual data entry. Your existing CV is the starting point, not the finish line."
          bullets={[
            "Accepts PDF, DOCX, DOC and plain text",
            "AI reads every section — summary, experience, skills, education",
            "No manual form filling — just upload and go",
          ]}
          visual={<UploadVisual />}
          accent={BLUE}
        />
        <FeatureRow
          eyebrow="Step 2 — Match"
          headline="Tailored to every job description."
          body="Paste a job description and AI identifies the exact keywords, skills and structure recruiters are looking for — then adds them to your CV automatically."
          bullets={[
            "Keyword gap analysis in seconds",
            "AI rewrites bullets to include missing terms naturally",
            "Separate tailored version for every role you apply to",
          ]}
          visual={<JobMatchVisual />}
          reverse
          accent={TEAL}
        />
        <FeatureRow
          eyebrow="Step 3 — Download"
          headline="Professional. Polished. Ready to send."
          body="Your rewritten CV comes back ATS-formatted, achievement-led and professionally structured — with quantified bullet points that get recruiter attention."
          bullets={[
            "Clean, ATS-friendly formatting — no tables or columns",
            "Impact-led bullet points with real metrics",
            "PDF download ready to attach and send immediately",
          ]}
          visual={<OutputVisual />}
          accent={ORANGE}
        />
      </div>
    </section>
  );
}

// ─── How It Works — Vertical timeline ────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { n: 1, color: BLUE,    icon: <Upload size={20} />,    title: "Upload your CV",             body: "Any format. AI extracts your full history, skills and structure in seconds." },
    { n: 2, color: TEAL,    icon: <FileText size={20} />,  title: "Paste the job description",  body: "Found a role? Add the JD and AI maps your experience to exactly what they're looking for." },
    { n: 3, color: ORANGE,  icon: <Cpu size={20} />,       title: "AI rewrites everything",     body: "Stronger language, ATS keywords, achievement-led bullets — all rewritten automatically." },
    { n: 4, color: "#059669", icon: <CheckCircle2 size={20} />, title: "Preview, pay & download", body: "Preview your new CV free. Pay only when you're happy. Download and apply immediately." },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: `${BLUE}10`, color: BLUE }}>
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              From upload to interview-ready<br />in four steps
            </h2>
            <p className="text-lg text-slate-500">No experience needed. No reformatting. Just results.</p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-slate-200" />

            <div className="space-y-8">
              {steps.map(({ n, color, icon, title, body }, i) => (
                <motion.div key={n} variants={fadeUp} className="flex gap-6 items-start">
                  <div className="relative shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md z-10"
                    style={{ background: color }}>
                    {icon}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>Step {n}</div>
                    <h3 className="font-bold text-slate-900 mb-1.5 text-base">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  const tiers = [
    {
      name: "Free Preview",
      price: "£0",
      per: "always free",
      desc: "See exactly what AI does to your CV before spending a penny.",
      features: [
        { text: "Upload & analyse your CV",     ok: true },
        { text: "AI rewrite preview",            ok: true },
        { text: "ATS score & keyword report",    ok: true },
        { text: "Section-by-section feedback",  ok: true },
        { text: "Download PDF",                  ok: false },
        { text: "Cover letter",                  ok: false },
      ],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Single Download",
      price: "£4.99",
      per: "one-time, per CV",
      desc: "Download one fully optimised, recruiter-ready CV — no subscription.",
      features: [
        { text: "Everything in Free Preview",   ok: true },
        { text: "Download optimised PDF",        ok: true },
        { text: "ATS-formatted layout",          ok: true },
        { text: "Job-tailored version",          ok: true },
        { text: "Cover letter",                  ok: false },
        { text: "Interview prep",                ok: false },
      ],
      cta: "Download now",
      highlight: true,
    },
    {
      name: "Pro",
      price: "£14.99",
      per: "per month",
      desc: "Unlimited downloads, cover letters and interview prep for serious job seekers.",
      features: [
        { text: "Everything in Single Download", ok: true },
        { text: "Unlimited CV downloads",        ok: true },
        { text: "Cover letter generator",        ok: true },
        { text: "Interview prep",                ok: true },
        { text: "Priority AI processing",        ok: true },
        { text: "Saved CVs & history",           ok: true },
      ],
      cta: "Go Pro",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: `${ORANGE}12`, color: ORANGE }}>
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Preview always free. Pay only when you&apos;re ready to download. No subscriptions required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map(({ name, price, per, desc, features, cta, highlight }) => (
              <motion.div key={name} variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-7 border transition-all duration-300 ${
                  highlight
                    ? "border-2 shadow-xl"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
                style={highlight ? { borderColor: BLUE, background: "#f8fbff" } : {}}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white px-4 py-1 rounded-full"
                    style={{ background: BLUE }}>
                    Most popular
                  </div>
                )}
                <div className="mb-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{price}</span>
                    <span className="text-sm text-slate-400">{per}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {features.map(({ text, ok }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm">
                      {ok
                        ? <Check size={14} strokeWidth={3} className="shrink-0" style={{ color: TEAL }} />
                        : <Minus size={14} strokeWidth={2} className="shrink-0 text-slate-300" />
                      }
                      <span className={ok ? "text-slate-700" : "text-slate-400"}>{text}</span>
                    </li>
                  ))}
                </ul>

                <motion.button onClick={handleCTA}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    highlight
                      ? "text-white shadow-md"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  style={highlight ? { background: BLUE } : {}}>
                  {cta}
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeUp} className="text-center text-xs text-slate-400 mt-8">
            All prices include VAT. Cancel Pro anytime. One-time payments are non-refundable after download.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonial — featured layout ───────────────────────────────────────────
function TestimonialsSection() {
  const featured = {
    name: "Sarah K.", role: "Software Engineer → Google",
    text: "I had been applying for 3 months with zero callbacks. After FuseCV rewrote my CV, I had four interview invites in two weeks. The ATS optimisation was the game changer — my old CV was being rejected before any human ever saw it.",
    stars: 5,
  };
  const others = [
    { name: "James O.", role: "Marketing Manager, Lagos",    text: "The before and after difference was shocking. My old CV was generic — the new one showed real impact with numbers. Got the job.", stars: 5 },
    { name: "Priya M.", role: "Graduate, University of Delhi", text: "As a graduate, I finally knew how to present myself. Three internship offers within a month.", stars: 5 },
    { name: "Kwame A.", role: "Product Manager, Accra",      text: "I tried three other CV tools. FuseCV is the only one that actually made my CV read like a senior PM's.", stars: 5 },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: "#fef3c7", color: "#d97706" }}>
              <Star size={11} className="fill-amber-500" /> Results
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              People who landed the interview
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Featured — large */}
            <motion.div variants={slideIn("left")} className="lg:col-span-3 rounded-2xl p-8 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #0055cc)` }}>
              <div className="absolute top-6 right-6 text-6xl font-black opacity-10">&ldquo;</div>
              <div className="flex gap-0.5 mb-6">
                {Array.from({ length: featured.stars }).map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-8 text-blue-50 font-medium relative z-10">
                &ldquo;{featured.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: ORANGE }}>
                  {featured.name[0]}
                </div>
                <div>
                  <div className="font-bold text-white">{featured.name}</div>
                  <div className="text-xs text-blue-200">{featured.role}</div>
                </div>
              </div>
            </motion.div>

            {/* Mini cards */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {others.map(({ name, role, text, stars }, i) => (
                <motion.div key={name} variants={fadeUp} custom={i}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 italic">&ldquo;{text}&rdquo;</p>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{name}</div>
                    <div className="text-[10px] text-slate-400">{role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Guides Teaser ────────────────────────────────────────────────────────────
function GuidesTeaser() {
  const guides = [
    { slug: "ats-cv-checker",           title: "How to Beat ATS Systems",                badge: "High Impact", desc: "75% of CVs never reach a human. Here is exactly how to fix yours." },
    { slug: "how-to-write-a-cv",        title: "How to Write a CV",                      badge: "Start Here",  desc: "The complete step-by-step guide — every section explained with examples." },
    { slug: "graduate-cv-no-experience", title: "Graduate CV With No Experience",         badge: "Graduate",    desc: "You have more to show than you think. Stand out without experience." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
                style={{ background: `${TEAL}12`, color: TEAL }}>
                <BookOpen size={11} /> Free Guides
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Learn from our expert CV guides
              </h2>
            </div>
            <Link href="/guides"
              className="flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all"
              style={{ color: BLUE }}>
              View all 43 guides <ChevronRight size={15} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {guides.map(({ slug, title, badge, desc }) => (
              <motion.div key={slug} variants={fadeUp} whileHover={{ y: -3 }}>
                <Link href={`/guides/${slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
                    style={{ background: `${BLUE}10`, color: BLUE }}>
                    {badge}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-[#004aad] transition-colors leading-snug">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
                  <span className="text-xs font-bold flex items-center gap-1" style={{ color: BLUE }}>
                    Read guide <ArrowRight size={11} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Final CTA — split design ─────────────────────────────────────────────────
function FinalCTA() {
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55, ease: bez }}
          className="rounded-3xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #003080 60%, #001a4d 100%)` }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left text */}
            <div className="p-10 sm:p-14">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1.5 rounded-full"
                style={{ background: `${TEAL}20`, color: TEAL, border: `1px solid ${TEAL}30` }}>
                <Sparkles size={11} /> Start for free
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
                Your next interview is one upload away
              </h2>
              <p className="text-blue-200 text-lg leading-relaxed mb-8">
                Join 50,000+ job seekers who improved their CV with FuseCV. Preview free. Pay only when you are ready.
              </p>
              <motion.button onClick={handleCTA}
                whileHover={{ scale: 1.04, boxShadow: `0 0 40px ${ORANGE}55` }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-base shadow-lg"
                style={{ background: ORANGE }}>
                <Upload size={18} />
                Upload My CV — It&apos;s Free
                <ArrowRight size={16} />
              </motion.button>
              <p className="mt-4 text-xs text-blue-300">No card required · Results in 60 seconds · Preview before payment</p>
            </div>

            {/* Right — stats grid */}
            <div className="p-10 sm:p-14 flex items-center" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="grid grid-cols-2 gap-5 w-full">
                {[
                  { n: "50K+", label: "CVs improved",    icon: <TrendingUp size={20} />,  color: TEAL },
                  { n: "94%",  label: "ATS pass rate",   icon: <Zap size={20} />,          color: ORANGE },
                  { n: "30+",  label: "Countries",       icon: <Globe size={20} />,         color: "#a78bfa" },
                  { n: "4.9★", label: "User rating",     icon: <Award size={20} />,         color: "#fbbf24" },
                ].map(({ n, label, icon, color }) => (
                  <div key={label} className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="flex justify-center mb-2" style={{ color }}>
                      {icon}
                    </div>
                    <div className="text-2xl font-extrabold text-white">{n}</div>
                    <div className="text-xs text-blue-300 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const links = {
    Product:  [{ l: "How it works", h: "#how-it-works" }, { l: "Pricing", h: "#pricing" }, { l: "Guides", h: "/guides" }],
    Account:  [{ l: "Sign up free", h: "/register" }, { l: "Sign in", h: "/login" }, { l: "Dashboard", h: "/dashboard" }],
    Legal:    [{ l: "Privacy Policy", h: "/privacy" }],
  };
  return (
    <footer className="bg-white border-t border-slate-100 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 sm:col-span-1">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={100} height={32} className="object-contain mb-3" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">
              AI-powered CV builder for job seekers worldwide. ATS-optimised in 60 seconds.
            </p>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{section}</div>
              <ul className="space-y-2.5">
                {items.map(({ l, h }) => (
                  <li key={l}><Link href={h} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} FuseCV. All rights reserved.</span>
          <span>Helping job seekers in 30+ countries land interviews.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function HomepageClient() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <GuidesTeaser />
      <FinalCTA />
      <Footer />
    </main>
  );
}
