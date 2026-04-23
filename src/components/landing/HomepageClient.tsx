"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Lock, Zap, Eye,
  AlertCircle, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, FileText, Sparkles,
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
          <Image src="/fusecv-logo.png" alt="FuseCV" width={96} height={30} className="object-contain" priority />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.03, boxShadow: `0 6px 24px rgba(255,117,31,0.32)` }}
            whileTap={{ scale: 0.97 }}
            className="text-white text-sm font-bold px-4 py-2 rounded-lg"
            style={{ background: ORANGE }}
          >
            Check My CV Free
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Score Mockup ─────────────────────────────────────────────────────────────
function ScoreMockup() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 300);
  }, [inView]);

  const issues = [
    { icon: <XCircle size={14} />,       label: "Weak summary statement",     color: "#ef4444", bg: "#fef2f2" },
    { icon: <XCircle size={14} />,       label: "No quantified results",       color: "#ef4444", bg: "#fef2f2" },
    { icon: <AlertTriangle size={14} />, label: "Poor ATS keyword match",      color: "#f59e0b", bg: "#fffbeb" },
    { icon: <XCircle size={14} />,       label: "Generic skills section",      color: "#ef4444", bg: "#fef2f2" },
    { icon: <AlertTriangle size={14} />, label: "Formatting inconsistencies",  color: "#f59e0b", bg: "#fffbeb" },
    { icon: <CheckCircle2 size={14} />,  label: "Education correctly listed",  color: "#22c55e", bg: "#f0fdf4" },
  ];

  const bars = [
    { label: "ATS Score",     score: 38, color: "#ef4444" },
    { label: "Impact",        score: 22, color: "#ef4444" },
    { label: "Readability",   score: 61, color: "#f59e0b" },
    { label: "Keywords",      score: 44, color: "#f59e0b" },
  ];

  return (
    <div ref={ref} className="relative w-full max-w-[360px] mx-auto lg:mx-0">
      {/* Glow */}
      <div className="absolute inset-4 rounded-3xl blur-2xl opacity-10 pointer-events-none"
        style={{ background: "#ef4444" }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: ez }}
        className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">CV Analysis</p>
              <p className="text-xs text-slate-500 font-medium">marketing_cv_2024.pdf</p>
            </div>
            {/* Big score */}
            <div className="text-center">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#fee2e2" strokeWidth="6" />
                  <motion.circle
                    cx="32" cy="32" r="27" fill="none"
                    stroke="#ef4444" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 27}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                    animate={animated ? { strokeDashoffset: 2 * Math.PI * 27 * (1 - 0.29) } : {}}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-xl font-black leading-none text-slate-900"
                    initial={{ opacity: 0 }}
                    animate={animated ? { opacity: 1 } : {}}
                    transition={{ delay: 0.4 }}
                  >
                    29
                  </motion.span>
                  <span className="text-[9px] text-slate-400 font-bold">/100</span>
                </div>
              </div>
              <span className="text-[9px] font-black text-red-500 uppercase tracking-wide">Needs Work</span>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-2">
            {bars.map(({ label, score, color }, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={animated ? { width: `${score}%` } : {}}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <span className="text-[10px] font-bold w-6 text-right" style={{ color }}>{score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Issues Found</p>
          <div className="space-y-2">
            {issues.map(({ icon, label, color, bg }) => (
              <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: bg }}>
                <span style={{ color }}>{icon}</span>
                <span className="text-[11px] font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA inside card */}
        <div className="px-5 pb-5">
          <div className="rounded-xl p-3 text-center" style={{ background: `rgba(255,117,31,0.06)`, border: `1px solid rgba(255,117,31,0.15)` }}>
            <p className="text-[11px] font-black text-slate-700 mb-0.5">Your results are ready</p>
            <p className="text-[10px] text-slate-500">Upload your CV to see your real score</p>
          </div>
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
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Hook headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.08] text-slate-900 mb-5"
              style={{ letterSpacing: "-0.02em" }}
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

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0"
            >
              Check your CV free in 60 seconds.
              Get instant ATS + recruiter feedback.
            </motion.p>

            {/* Upload CTA */}
            <motion.div variants={fadeUp} className="mb-6">
              <motion.button
                onClick={handleCTA}
                whileHover={{ scale: 1.04, boxShadow: `0 14px 36px rgba(255,117,31,0.38)` }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl text-base shadow-sm"
                style={{ background: ORANGE }}
              >
                <Upload size={18} />
                Upload My CV
                <ArrowRight size={17} />
              </motion.button>
            </motion.div>

            {/* Trust line */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-5 justify-center lg:justify-start"
            >
              {[
                { icon: <Lock size={13} />,    label: "Secure upload"    },
                { icon: <Eye size={13} />,     label: "No payment"       },
                { icon: <Zap size={13} />,     label: "Instant results"  },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <span className="text-slate-300">{icon}</span>
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — score mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: ez, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <ScoreMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof Strip ────────────────────────────────────────────────────────
function SocialProof() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="border-t border-b border-slate-100 bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="flex flex-wrap justify-center gap-8 sm:gap-14"
        >
          {[
            { value: "10,000+", label: "CVs analysed"      },
            { value: "30+",     label: "Countries"          },
            { value: "60s",     label: "To get results"     },
            { value: "Free",    label: "No card required"   },
          ].map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
            </motion.div>
          ))}
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
    {
      number: "01",
      icon: <Upload size={20} />,
      title: "Upload your CV",
      body: "PDF or any format. Secure, private, takes 5 seconds.",
    },
    {
      number: "02",
      icon: <Sparkles size={20} />,
      title: "AI scans everything",
      body: "ATS compatibility, impact language, keywords, formatting — all checked instantly.",
    },
    {
      number: "03",
      icon: <FileText size={20} />,
      title: "Get your score + fixes",
      body: "See exactly what is holding you back and get an AI-rewritten version ready to download.",
    },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
            Simple. Fast. Free.
          </motion.p>
          <motion.h2 variants={fadeUp}
            className="text-3xl sm:text-4xl font-black text-slate-900"
            style={{ letterSpacing: "-0.02em" }}>
            How it works
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-3 gap-5 mb-12"
        >
          {steps.map(({ number, icon, title, body }) => (
            <motion.div
              key={number}
              variants={fadeUp}
              className="rounded-2xl p-6 border border-slate-100 bg-slate-50 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-slate-100 leading-none select-none">{number}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `rgba(255,117,31,0.1)`, color: ORANGE }}>
                {icon}
              </div>
              <h3 className="font-black text-slate-900 mb-2 text-[15px]">{title}</h3>
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
            Check My CV Free
            <ChevronRight size={15} />
          </motion.button>
          <p className="text-xs text-slate-400 mt-3 font-medium">No payment required. Preview results before you pay for anything.</p>
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
    { label: "ATS compatibility score",           pass: true  },
    { label: "Impact language analysis",          pass: true  },
    { label: "Keyword gap report",                pass: true  },
    { label: "Formatting audit",                  pass: true  },
    { label: "AI-rewritten version ready to download", pass: true },
    { label: "Cover letter (Professional plan)",  pass: true  },
    { label: "Interview question prep (Full plan)",pass: true  },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
            Free Check + Optional Upgrade
          </motion.p>
          <motion.h2 variants={fadeUp}
            className="text-3xl sm:text-4xl font-black text-slate-900"
            style={{ letterSpacing: "-0.02em" }}>
            What you get
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto"
        >
          {items.map(({ label }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm"
            >
              <CheckCircle2 size={16} style={{ color: ORANGE }} className="shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center text-xs text-slate-400 mt-6 font-medium"
        >
          CV check is always free. Download the improved version from $5.
        </motion.p>
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
      {/* Subtle orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: BLUE, top: "-30%", left: "5%" }} />
        <div className="absolute w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ background: ORANGE, bottom: "-20%", right: "5%" }} />
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-[1.1]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Stop guessing.<br />
          <span style={{ color: ORANGE }}>Find out in 60 seconds.</span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-lg mb-8 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          Upload your CV. Get your score. Fix what&apos;s broken.
        </motion.p>

        <motion.div variants={fadeUp}>
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.05, boxShadow: `0 16px 40px rgba(255,117,31,0.45)` }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 text-white font-black px-8 py-4 rounded-2xl text-base"
            style={{ background: ORANGE }}
          >
            <Upload size={18} />
            Upload My CV
            <ArrowRight size={17} />
          </motion.button>
        </motion.div>

        <motion.div variants={fadeUp}
          className="flex items-center justify-center gap-6 mt-6 text-xs font-semibold"
          style={{ color: "rgba(255,255,255,0.3)" }}>
          <span className="flex items-center gap-1.5"><Lock size={11} /> Secure</span>
          <span className="flex items-center gap-1.5"><Eye size={11} /> Free</span>
          <span className="flex items-center gap-1.5"><Zap size={11} /> Instant</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const SITE_URL = "https://fusecv.com";
  return (
    <footer style={{ background: DARK }} className="border-t border-white/5">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={80} height={24} className="object-contain brightness-0 invert opacity-60" />
          </Link>
          <div className="flex flex-wrap justify-center gap-5 text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Link href="/executive" className="hover:text-white transition-colors">Executive CV</Link>
            <Link href="/login"     className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register"  className="hover:text-white transition-colors">Sign Up Free</Link>
            <Link href={`${SITE_URL}/privacy`}  className="hover:text-white transition-colors">Privacy</Link>
            <Link href={`${SITE_URL}/terms`}    className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} FuseCV
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomepageClient() {
  return (
    <main className="bg-white">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <HowItWorks />
      <WhatYouGet />
      <FinalCTA />
      <Footer />
    </main>
  );
}
