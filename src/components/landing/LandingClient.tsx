"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Lock, Zap, Eye,
  CheckCircle2, XCircle, FileText, User,
  TrendingUp, AlertCircle,
} from "lucide-react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const ORANGE = "#ff751f";
const DARK   = "#0a1628";
const BLUE   = "#004aad";

type Ease4 = [number, number, number, number];
const ez: Ease4 = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: ez } },
};
const stagger = (d = 0.08): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
});

// ─── Score Card ───────────────────────────────────────────────────────────────
const BARS = [
  { label: "ATS Match",  score: 38, color: "#ef4444" },
  { label: "Impact",     score: 22, color: "#ef4444" },
  { label: "Keywords",   score: 44, color: "#f59e0b" },
];

const ISSUES: { severity: "critical" | "warning"; text: string }[] = [
  { severity: "critical", text: "Summary too generic — won't pass ATS screening"  },
  { severity: "critical", text: "0 of 5 bullet points include measurable results"  },
  { severity: "warning",  text: "7 high-value keywords missing for your target role" },
];

function ScoreCard() {

  const [animated, setAnimated] = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 350);
  }, [inView]);

  const circumference = 2 * Math.PI * 28;

  return (
    <div ref={ref} className="relative w-full max-w-[360px] mx-auto lg:mx-0">
      {/* Ambient glow */}
      <div className="absolute inset-8 rounded-3xl blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: "#ef4444" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: ez }}
        className="relative bg-white rounded-2xl overflow-hidden border border-slate-100"
        style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.11), 0 1px 0 rgba(0,0,0,0.05)" }}
      >
        {/* ── Window chrome ── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            FuseCV · Analysis Report
          </span>
          <div className="flex items-center gap-1">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold text-slate-400">LIVE</span>
          </div>
        </div>

        {/* ── Identity row ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ background: "#94a3b8" }}>
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900 truncate">Your CV Report</p>
            <p className="text-[10px] text-slate-400 font-medium">Analysed just now · 1 page</p>
          </div>
          <span className="shrink-0 text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Weak
          </span>
        </div>

        {/* ── Score + breakdown ── */}
        <div className="flex gap-4 px-5 py-4 border-b border-slate-100">
          {/* Circle */}
          <div className="relative w-[68px] h-[68px] shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#fee2e2" strokeWidth="5" />
              <motion.circle
                cx="32" cy="32" r="28" fill="none"
                stroke="#ef4444" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={animated ? { strokeDashoffset: circumference * 0.71 } : {}}
                transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-xl font-black leading-none text-slate-900"
                initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}}
                transition={{ delay: 0.45 }}
              >29</motion.span>
              <span className="text-[8px] text-slate-400 font-bold">/100</span>
            </div>
          </div>

          {/* Bars */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Score Breakdown
            </p>
            <div className="space-y-1.5">
              {BARS.map(({ label, score, color }, i) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 w-16 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={animated ? { width: `${score}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <span className="text-[9px] font-bold w-5 text-right shrink-0" style={{ color }}>{score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Issues ── */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={12} className="text-red-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Issues Found
            </p>
          </div>
          <div className="space-y-2">
            {ISSUES.map(({ severity, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -6 }}
                animate={animated ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.11, duration: 0.28 }}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2"
                style={{ background: severity === "critical" ? "#fef2f2" : "#fffbeb" }}
              >
                <XCircle size={12}
                  className={severity === "critical" ? "text-red-500 mt-0.5 shrink-0" : "text-amber-500 mt-0.5 shrink-0"} />
                <span className="text-[11px] font-semibold text-slate-700 leading-snug flex-1">{text}</span>
                <span className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                  severity === "critical"
                    ? "bg-red-200 text-red-700"
                    : "bg-amber-200 text-amber-700"
                }`}>
                  {severity}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Potential score teaser ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={animated ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-3 px-5 py-3 border-b border-slate-100"
          style={{ background: "linear-gradient(90deg, rgba(0,74,173,0.04) 0%, rgba(0,74,173,0.01) 100%)" }}
        >
          <TrendingUp size={14} style={{ color: BLUE }} className="shrink-0" />
          <div className="flex-1">
            <p className="text-[11px] font-black text-slate-800">
              Fix these issues → score jumps to <span style={{ color: BLUE }}>78/100</span>
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">Based on similar CVs we&apos;ve improved</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-black text-red-500 line-through">29</span>
            <ArrowRight size={10} style={{ color: BLUE }} />
            <span className="text-[10px] font-black" style={{ color: BLUE }}>78</span>
          </div>
        </motion.div>

        {/* ── CTA nudge ── */}
        <div className="px-5 py-4 text-center" style={{ background: `rgba(255,117,31,0.04)` }}>
          <p className="text-[12px] font-black text-slate-800 mb-0.5">Your real report is waiting</p>
          <p className="text-[10px] text-slate-400">Upload your CV to see your actual score</p>
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-1.5"
      >
        <Zap size={12} style={{ color: ORANGE }} />
        <span className="text-[10px] font-black text-slate-800">Results in 60s</span>
      </motion.div>

    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
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
      transition={{ duration: 0.4, ease: ez }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white shadow-sm border-b border-slate-100" : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={90} height={28} className="object-contain" priority />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login"
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            Sign in
          </Link>
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.03, boxShadow: `0 6px 24px rgba(255,117,31,0.32)` }}
            whileTap={{ scale: 0.97 }}
            className="text-white text-sm font-black px-4 py-2 rounded-lg flex items-center gap-1.5"
            style={{ background: ORANGE }}
          >
            <Upload size={14} />
            Upload My CV
          </motion.button>
        </div>
      </div>
    </motion.nav>
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
    <section className="min-h-screen flex items-center pt-14 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left copy */}
          <motion.div
            variants={stagger(0.09)}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.h1
              variants={fadeUp}
              className="text-[2.6rem] sm:text-5xl lg:text-[3.25rem] font-black leading-[1.06] text-slate-900 mb-5"
              style={{ letterSpacing: "-0.025em" }}
            >
              Your CV Might Be<br />
              Why You&apos;re{" "}
              <span style={{
                background: `linear-gradient(135deg, #ef4444 0%, ${ORANGE} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Not Getting<br />Interviews.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-7 max-w-md mx-auto lg:mx-0"
            >
              Upload your CV. Get your score in 60 seconds.
            </motion.p>

            {/* Primary CTA */}
            <motion.div variants={fadeUp} className="mb-3">
              <motion.button
                onClick={handleCTA}
                whileHover={{ scale: 1.04, boxShadow: `0 16px 40px rgba(255,117,31,0.38)` }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl text-base shadow-sm"
                style={{ background: ORANGE }}
              >
                <Upload size={18} />
                Upload My CV
                <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Loss aversion */}
            <motion.p variants={fadeUp} className="text-xs text-slate-400 mb-5 font-medium max-w-xs mx-auto lg:mx-0">
              Every application with a weak CV may cost you an opportunity.
            </motion.p>

            {/* Trust strip */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-5 justify-center lg:justify-start"
            >
              {[
                { icon: <Lock size={12} />,  label: "Secure upload"   },
                { icon: <Eye size={12} />,   label: "Free check"      },
                { icon: <Zap size={12} />,   label: "Instant results" },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <span className="text-slate-300">{icon}</span>
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — score card */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: ez, delay: 0.15 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <ScoreCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof ─────────────────────────────────────────────────────────────
function SocialProof() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const stats = [
    { value: "10,000+", label: "CVs analysed"    },
    { value: "30+",     label: "Countries"        },
    { value: "60s",     label: "To get results"   },
    { value: "Free",    label: "No card required" },
  ];

  return (
    <section ref={ref} className="py-10 border-t border-slate-100 bg-slate-50">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-wrap justify-center gap-8 sm:gap-14 mb-8"
        >
          {stats.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Human quote */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="max-w-xl mx-auto rounded-2xl bg-white border border-slate-100 px-6 py-5 text-center shadow-sm"
        >
          <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-3">
            &ldquo;I had been applying for months with no replies. FuseCV showed me exactly what was wrong — I got 3 interview calls the week after fixing my CV.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-black">
              J
            </div>
            <span className="text-xs font-bold text-slate-500">James K. — Software Engineer, London</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  const steps = [
    { n: "1", icon: <Upload size={22} />,     title: "Upload CV",      body: "PDF or Word. Takes 5 seconds." },
    { n: "2", icon: <Sparkles size={22} />,   title: "Get Your Score", body: "ATS, keywords, impact — checked instantly." },
    { n: "3", icon: <FileText size={22} />,   title: "Fix & Apply",    body: "See what to fix. Download the improved version." },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeUp}
            className="text-3xl sm:text-4xl font-black text-slate-900"
            style={{ letterSpacing: "-0.02em" }}>
            Three steps. 60 seconds.
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-3 gap-4 mb-12"
        >
          {steps.map(({ n, icon, title, body }) => (
            <motion.div
              key={n}
              variants={fadeUp}
              className="rounded-2xl p-6 border border-slate-100 bg-slate-50 relative overflow-hidden text-center"
            >
              <div className="absolute top-3 right-4 text-6xl font-black text-slate-100 leading-none select-none">{n}</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                style={{ background: `rgba(255,117,31,0.1)`, color: ORANGE }}>
                {icon}
              </div>
              <h3 className="font-black text-slate-900 mb-1.5 text-base">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"} className="text-center">
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.04, boxShadow: `0 12px 32px rgba(255,117,31,0.35)` }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 text-white font-black px-7 py-3.5 rounded-2xl text-sm"
            style={{ background: ORANGE }}
          >
            <Upload size={16} />
            Upload My CV
            <ArrowRight size={15} />
          </motion.button>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            Free CV check. Upgrade only if useful.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── What You Get ─────────────────────────────────────────────────────────────
function WhatYouGet() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const items = [
    { label: "ATS compatibility score",               free: true  },
    { label: "Impact language analysis",              free: true  },
    { label: "Keyword gap report",                    free: true  },
    { label: "Formatting audit",                      free: true  },
    { label: "AI-rewritten CV ready to download",     free: false },
    { label: "Cover letter",                          free: false },
    { label: "Interview question prep",               free: false },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-10"
        >
          <motion.h2 variants={fadeUp}
            className="text-3xl sm:text-4xl font-black text-slate-900 mb-2"
            style={{ letterSpacing: "-0.02em" }}>
            What you get
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-slate-400 font-medium">
            Free check included. Download the improved version only if you want it.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="space-y-2 max-w-md mx-auto"
        >
          {items.map(({ label, free }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={15} style={{ color: free ? ORANGE : BLUE }} className="shrink-0" />
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                free
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {free ? "FREE" : "UPGRADE"}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden" style={{ background: DARK }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: BLUE, top: "-20%", left: "-5%" }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: ORANGE, bottom: "-15%", right: "0" }} />
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="relative max-w-xl mx-auto px-5 sm:px-8 text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-3xl sm:text-4xl lg:text-[2.8rem] font-black text-white mb-4 leading-[1.1]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Stop guessing.<br />
          <span style={{ color: ORANGE }}>Upload yours now.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-base mb-8"
          style={{ color: "rgba(255,255,255,0.45)" }}>
          See what recruiters see in the first 6 seconds.
        </motion.p>

        <motion.div variants={fadeUp} className="mb-4">
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.05, boxShadow: `0 18px 44px rgba(255,117,31,0.48)` }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 text-white font-black px-9 py-4 rounded-2xl text-base"
            style={{ background: ORANGE }}
          >
            <Upload size={18} />
            Upload My CV
            <ArrowRight size={17} />
          </motion.button>
        </motion.div>

        <motion.p variants={fadeUp} className="text-xs font-semibold mb-8"
          style={{ color: "rgba(255,255,255,0.3)" }}>
          Free CV check. Upgrade only if useful.
        </motion.p>

        <motion.div variants={fadeUp}
          className="flex items-center justify-center gap-6 text-xs font-semibold"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          <span className="flex items-center gap-1.5"><Lock size={11} /> Secure</span>
          <span className="flex items-center gap-1.5"><Eye size={11} /> Free</span>
          <span className="flex items-center gap-1.5"><Zap size={11} /> Instant</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Sticky mobile CTA ────────────────────────────────────────────────────────
function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const h = () => setShow(window.scrollY > 420);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.28, ease: ez }}
          className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-sm border-t border-slate-100 px-5 py-3 shadow-2xl"
        >
          <button
            onClick={handleCTA}
            className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl text-sm"
            style={{ background: ORANGE }}
          >
            <Upload size={16} />
            Upload My CV — Free
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const SITE_URL = "https://fusecv.com";
  return (
    <footer style={{ background: DARK }} className="border-t border-white/5">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={72} height={22}
              className="object-contain brightness-0 invert opacity-50" />
          </Link>
          <div className="flex flex-wrap justify-center gap-5 text-xs font-medium"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <Link href="/"          className="hover:text-white transition-colors">Home</Link>
            <Link href="/executive" className="hover:text-white transition-colors">Executive CV</Link>
            <Link href="/login"     className="hover:text-white transition-colors">Sign In</Link>
            <Link href={`${SITE_URL}/privacy`} className="hover:text-white transition-colors">Privacy</Link>
            <Link href={`${SITE_URL}/terms`}   className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
            © {new Date().getFullYear()} FuseCV
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingClient() {
  return (
    <main className="bg-white">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <HowItWorks />
      <WhatYouGet />
      <FinalCTA />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}
