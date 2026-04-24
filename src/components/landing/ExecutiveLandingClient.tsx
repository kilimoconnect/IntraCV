"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion, useInView, AnimatePresence, useScroll, useTransform, type Variants,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Sparkles, FileText, CheckCircle2,
  Shield, Target, Globe, BarChart2, TrendingUp,
  Award, Briefcase, Users, Building2, Crown, Star,
  ChevronRight, Check, Zap, BookOpen,
} from "lucide-react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BLUE   = "#004aad";
const ORANGE = "#ff751f";
const DARK   = "#0a1628";
const GOLD   = "#b8860b";

type Ease4 = [number, number, number, number];
const ez: Ease4 = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: ez } },
};
const stagger = (d = 0.08): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: d } },
});
const slideLeft: Variants = {
  hidden: { opacity: 0, x: 36 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.62, ease: ez } },
};
const slideRight: Variants = {
  hidden: { opacity: 0, x: -36 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.62, ease: ez } },
};

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
      transition={{ duration: 0.48, ease: ez }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white shadow-sm border-b border-slate-100" : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={100} height={32} className="object-contain" priority />
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          {[
            { label: "Why Executive?", href: "#why-executive" },
            { label: "Features",       href: "#features"      },
            { label: "How It Works",   href: "#how-it-works"  },
          ].map(({ label, href }) => (
            <button key={label}
              onClick={() => document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" })}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >{label}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors">
            Sign in
          </Link>
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.04, boxShadow: `0 8px 28px rgba(255,117,31,0.35)` }}
            whileTap={{ scale: 0.96 }}
            className="text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm"
            style={{ background: ORANGE }}
          >
            Get Started Free
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
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,74,173,0.07) 0%, transparent 70%)`,
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ background: `rgba(0,74,173,0.06)`, borderColor: `rgba(0,74,173,0.18)`, color: BLUE }}>
                <Crown size={11} />
                Built for C-Suite, Founders & Board Members
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black leading-[1.1] text-slate-900 mb-5">
              Your Leadership<br />
              <span style={{ color: BLUE }}>Deserves Better</span><br />
              Presentation
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Senior candidates are not evaluated on experience alone — positioning matters.
              Upload your CV and our AI rewrites it to communicate authority, strategic impact,
              and boardroom-level credibility from the first line.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <motion.button
                onClick={handleCTA}
                whileHover={{ scale: 1.04, boxShadow: `0 12px 32px rgba(255,117,31,0.38)` }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3.5 rounded-xl shadow-sm text-sm"
                style={{ background: ORANGE }}
              >
                <Upload size={16} />
                Upload My CV Free
                <ArrowRight size={15} />
              </motion.button>
              <motion.button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-sm hover:border-slate-300 transition-colors"
              >
                See How It Works
              </motion.button>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-xs text-slate-500 font-medium">
              {["No card required", "Preview before payment", "Confidential & secure"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={12} className="text-green-500" />{t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — executive CV card */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate="show"
            className="order-1 lg:order-2 flex justify-center"
          >
            <ExecutiveCVMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Executive CV Mockup ──────────────────────────────────────────────────────
function ExecutiveCVMockup() {
  const themes = [
    { name: "Navy",      bg: "#0a1628", accent: "#004aad" },
    { name: "Charcoal",  bg: "#1c1c1e", accent: "#6366f1" },
    { name: "Slate",     bg: "#1e293b", accent: "#0ea5e9" },
    { name: "Forest",    bg: "#14532d", accent: "#22c55e" },
    { name: "Burgundy",  bg: "#4c1d1d", accent: "#ef4444" },
    { name: "Executive", bg: "#1a1207", accent: "#b8860b" },
  ];
  const [active, setActive] = useState(0);

  return (
    <div className="relative w-full max-w-sm">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl blur-3xl opacity-20 pointer-events-none"
        style={{ background: themes[active].bg, transform: "scale(0.85) translateY(10%)" }} />

      {/* Card */}
      <motion.div
        layout
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
        style={{ background: "white" }}
      >
        {/* CV Header */}
        <div className="p-5 text-white" style={{ background: themes[active].bg }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ background: themes[active].accent, color: "white" }}>JM</div>
            <div>
              <div className="font-black text-base tracking-wide">James Mwangi</div>
              <div className="text-xs opacity-70 mt-0.5">Chief Executive Officer</div>
              <div className="flex gap-3 mt-1.5 text-[10px] opacity-60">
                <span>Nairobi, Kenya</span>
                <span>•</span>
                <span>j.mwangi@exec.com</span>
              </div>
            </div>
          </div>

          {/* Competencies strip */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["Strategic Leadership", "P&L Management", "Board Governance", "M&A"].map((tag) => (
              <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${themes[active].accent}33`, color: themes[active].accent === "#b8860b" ? "#d4a017" : themes[active].accent }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CV Body */}
        <div className="p-4 space-y-3">
          {/* Summary */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest mb-1.5"
              style={{ color: themes[active].accent === "#b8860b" ? GOLD : themes[active].accent }}>
              Executive Summary
            </div>
            <div className="text-[9px] text-slate-500 leading-relaxed">
              Results-driven CEO with 18+ years leading high-growth organisations across East Africa.
              Delivered $240M+ revenue growth and led 3 successful acquisitions. Board member of 2 listed companies.
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Experience */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest mb-2"
              style={{ color: themes[active].accent === "#b8860b" ? GOLD : themes[active].accent }}>
              Leadership Experience
            </div>
            {[
              { title: "Chief Executive Officer", co: "Equity Group Holdings", years: "2018–Present", bullet: "Scaled operations to $1.2B AUM across 6 markets" },
              { title: "Managing Director", co: "KCB Group", years: "2013–2018", bullet: "Led digital transformation increasing mobile users 340%" },
            ].map((e) => (
              <div key={e.co} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-bold text-slate-800">{e.title}</span>
                  <span className="text-[8px] text-slate-400">{e.years}</span>
                </div>
                <div className="text-[8px] text-slate-500 font-medium mb-0.5">{e.co}</div>
                <div className="text-[8px] text-slate-400">• {e.bullet}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme picker */}
        <div className="px-4 pb-4 flex items-center gap-2">
          <span className="text-[9px] text-slate-400 font-medium mr-1">Theme:</span>
          {themes.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setActive(i)}
              title={t.name}
              className="transition-transform"
              style={{
                width: 14, height: 14, borderRadius: "50%",
                background: t.bg,
                outline: active === i ? `2px solid ${t.accent}` : "none",
                outlineOffset: 2,
                transform: active === i ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `rgba(0,74,173,0.1)` }}>
          <Award size={14} style={{ color: BLUE }} />
        </div>
        <div>
          <div className="text-[10px] font-black text-slate-800">Board-Level</div>
          <div className="text-[9px] text-slate-400">AI-crafted copy</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `rgba(255,117,31,0.1)` }}>
          <TrendingUp size={14} style={{ color: ORANGE }} />
        </div>
        <div>
          <div className="text-[10px] font-black text-slate-800">2,400+ Execs</div>
          <div className="text-[9px] text-slate-400">already upgraded</div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const stats = [
    { value: "2,400+",  label: "Executive CVs built"      },
    { value: "6",       label: "Premium layout options"    },
    { value: "$5",      label: "Starting price"            },
    { value: "< 60s",   label: "To a board-ready CV"       },
  ];

  return (
    <section ref={ref} className="border-y border-slate-100" style={{ background: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: BLUE }}>{value}</div>
              <div className="text-sm text-slate-500 font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Why Executive section ────────────────────────────────────────────────────
function WhyExecutive() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const painPoints = [
    {
      icon: <Shield size={20} />,
      title: "Generic CVs undersell seniority",
      body: "A CV that lists responsibilities instead of communicating scale, impact, and authority is invisible to search firms and boards — no matter how strong your record.",
      color: "#eff6ff", accent: BLUE,
    },
    {
      icon: <Target size={20} />,
      title: "Positioning decides who gets called",
      body: "Two candidates with the same experience can get completely different responses based entirely on how their CV is written. Language, framing, and emphasis are the difference.",
      color: "#fff7ed", accent: ORANGE,
    },
    {
      icon: <Building2 size={20} />,
      title: "Board searches are different",
      body: "Executive search firms, headhunters, and remuneration committees evaluate CVs differently. They are looking for governance credibility, strategic scope, and organisational impact — not job duties.",
      color: "#f0fdf4", accent: "#16a34a",
    },
    {
      icon: <Users size={20} />,
      title: "Your CV opens rooms — or closes them",
      body: "A board position, a CEO transition, a PE-backed role — these decisions begin with a document. If your CV does not establish authority immediately, you are already behind.",
      color: "#fdf4ff", accent: "#9333ea",
    },
  ];

  return (
    <section id="why-executive" className="py-20 lg:py-24 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
            The Executive Difference
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Why executive CVs require<br />a different standard
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
            Most CV tools are built for job seekers — not leaders. FuseCV&apos;s AI understands
            the language of the boardroom.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 gap-5"
        >
          {painPoints.map(({ icon, title, body, color, accent }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
              className="rounded-2xl p-6 border border-slate-100 transition-shadow"
              style={{ background: color }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${accent}18`, color: accent }}>
                {icon}
              </div>
              <h3 className="font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const features = [
    {
      icon: <Sparkles size={22} />,
      title: "AI That Speaks the Boardroom Language",
      body: "Our AI is trained to write at the executive register — strategic scope, P&L ownership, governance language, transformation narratives. Not generic bullet points.",
      tags: ["C-Suite Tone", "Strategic Framing", "Authority Language"],
      color: "#eff6ff", accent: BLUE,
    },
    {
      icon: <FileText size={22} />,
      title: "Executive-Only CV Layouts",
      body: "Dedicated two-page executive templates with sidebar highlights for board roles, key achievements, and executive training — designed specifically for senior candidates.",
      tags: ["6 Themes", "2-Page Format", "Board Roles Section"],
      color: "#fff7ed", accent: ORANGE,
    },
    {
      icon: <Award size={22} />,
      title: "Key Achievements Highlighted",
      body: "Quantified impact front and centre. Revenue figures, team scale, market expansion, M&A — the numbers that establish credibility are given the prominence they deserve.",
      tags: ["Quantified Impact", "Metrics-First", "Achievements Block"],
      color: "#f0fdf4", accent: "#16a34a",
    },
    {
      icon: <BarChart2 size={22} />,
      title: "CV Readiness Score",
      body: "Instant analysis of your CV&apos;s effectiveness — gaps in positioning, missing impact statements, language that undersells your seniority. Fixed before it costs you a role.",
      tags: ["Gap Analysis", "Instant Score", "Actionable Fixes"],
      color: "#fdf4ff", accent: "#9333ea",
    },
    {
      icon: <BookOpen size={22} />,
      title: "Executive Interview Preparation",
      body: "Role-specific interview questions for C-suite and board-level conversations — with model answers built from your actual career data and experience.",
      tags: ["Board Questions", "Leadership Scenarios", "Model Answers"],
      color: "#fff1f2", accent: "#e11d48",
    },
    {
      icon: <Shield size={22} />,
      title: "Confidential & Secure",
      body: "Your career data is encrypted and never shared. Designed for leaders who require discretion — your CV is not used for training or shared with third parties.",
      tags: ["Encrypted", "Private", "No Data Sharing"],
      color: "#f8fafc", accent: "#64748b",
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-24 bg-slate-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
            Built for Leaders
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Everything a senior CV needs
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-xl mx-auto">
            Purpose-built features for executives, founders, and board-level candidates.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map(({ icon, title, body, tags, color, accent }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.09)" }}
              className="rounded-2xl p-6 border border-slate-100 transition-shadow"
              style={{ background: color }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${accent}18`, color: accent }}>
                {icon}
              </div>
              <h3 className="font-black text-slate-900 mb-2 text-[15px]">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{body}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${accent}15`, color: accent }}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  const steps = [
    {
      number: "01",
      icon: <Upload size={22} />,
      title: "Upload your current CV",
      body: "Upload any format. Our AI reads and extracts every detail — roles, board positions, executive training, key achievements, publications.",
    },
    {
      number: "02",
      icon: <Sparkles size={22} />,
      title: "AI rewrites at the executive register",
      body: "The AI rewrites your experience using strategic language, quantified impact, and boardroom-appropriate framing — in under 60 seconds.",
    },
    {
      number: "03",
      icon: <FileText size={22} />,
      title: "Choose your executive layout",
      body: "Select from 6 premium two-page executive templates with dedicated sections for board roles, executive training, and strategic achievements.",
    },
    {
      number: "04",
      icon: <Award size={22} />,
      title: "Download and deploy",
      body: "Download your board-ready CV from $5. No watermarks. Professional PDF. Matched cover letter available if needed.",
    },
  ];

  return (
    <section id="how-it-works" ref={ref}
      className="py-20 lg:py-24"
      style={{ background: DARK }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
            Simple Process
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-white mb-4">
            From upload to board-ready<br />in four steps
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            No forms to fill out. No templates to wrestle with. Upload and let the AI do the work.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 gap-5 mb-12"
        >
          {steps.map(({ number, icon, title, body }) => (
            <motion.div
              key={number}
              variants={fadeUp}
              className="rounded-2xl p-6 border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl font-black shrink-0" style={{ color: "rgba(255,255,255,0.12)", lineHeight: 1 }}>{number}</div>
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `rgba(255,117,31,0.15)`, color: ORANGE }}>
                    {icon}
                  </div>
                  <h3 className="font-black text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"} className="text-center">
          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.04, boxShadow: `0 12px 32px rgba(255,117,31,0.4)` }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl text-sm"
            style={{ background: ORANGE }}
          >
            <Upload size={16} />
            Start for Free
            <ArrowRight size={15} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Who It's For ─────────────────────────────────────────────────────────────
function WhoItsFor() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const profiles = [
    {
      icon: <Crown size={20} />,
      title: "C-Suite Executives",
      desc: "CEOs, CFOs, COOs, CMOs, and CTOs preparing for a new appointment, board role, or executive search engagement.",
      color: "#eff6ff", accent: BLUE,
    },
    {
      icon: <Briefcase size={20} />,
      title: "Founders & Entrepreneurs",
      desc: "Founders transitioning from their own company to a corporate executive role, advisory position, or board seat.",
      color: "#fff7ed", accent: ORANGE,
    },
    {
      icon: <Building2 size={20} />,
      title: "Board Members & Directors",
      desc: "Non-executive directors, independent board members, and governance professionals building a portfolio career.",
      color: "#f0fdf4", accent: "#16a34a",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Senior Managers Moving Up",
      desc: "VPs, GMs, and Directors ready for their first C-suite appointment and needing a CV that communicates readiness.",
      color: "#fdf4ff", accent: "#9333ea",
    },
    {
      icon: <Globe size={20} />,
      title: "International Executives",
      desc: "Senior professionals relocating across borders and needing a CV that translates experience into a new market's expectations.",
      color: "#fff1f2", accent: "#e11d48",
    },
    {
      icon: <Star size={20} />,
      title: "Investors & Advisors",
      desc: "Private equity partners, venture capitalists, and senior advisors who serve on boards and need a compelling biography-style CV.",
      color: "#fffbeb", accent: "#d97706",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>
            Who Uses FuseCV Executive
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Built for leaders at every<br />level of the top tier
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {profiles.map(({ icon, title, desc, color, accent }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-2xl p-6 border border-slate-100"
              style={{ background: color }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${accent}18`, color: accent }}>
                {icon}
              </div>
              <h3 className="font-black text-slate-900 mb-2 text-sm">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Positioning Highlight ────────────────────────────────────────────────────
function PositioningHighlight() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 lg:py-24 bg-slate-50" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
          >
            <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: ORANGE }}>
              The Difference AI Makes
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-5">
              From responsibilities<br />to authority
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Most CVs describe what someone did. The strongest executive CVs establish
              why that person&apos;s leadership mattered — and what changed because of them.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Our AI rewrites your experience to lead with scale, impact, and strategic ownership.
              Every bullet becomes a case for your candidacy.
            </p>

            <motion.div variants={stagger(0.1)} initial="hidden" animate={inView ? "show" : "hidden"} className="space-y-3">
              {[
                "Quantified impact statements — revenue, team size, market reach",
                "Leadership narrative that communicates authority",
                "Board-appropriate language and governance framing",
                "Strategic scope front and centre — not buried in duties",
              ].map((item) => (
                <motion.div key={item} variants={fadeUp} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: BLUE }} />
                  <span className="text-sm text-slate-600 font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — before/after card */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
              {/* Before */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-500">Before</span>
                </div>
                <p className="text-sm text-slate-400 italic leading-relaxed">
                  &quot;Responsible for managing the finance team and overseeing budgeting processes
                  across the organisation. Worked with various departments to ensure financial
                  compliance and reporting accuracy.&quot;
                </p>
              </div>
              {/* After */}
              <div className="p-5" style={{ background: `rgba(0,74,173,0.03)` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: `rgba(0,74,173,0.1)`, color: BLUE }}>After — AI Rewritten</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  &quot;Directed a 42-person finance function across 4 markets, delivering $18M in
                  cost efficiencies over 3 years. Redesigned group-wide financial controls
                  ahead of a $340M IPO, achieving clean audit outcomes across all subsidiaries.&quot;
                </p>
              </div>
            </div>

            {/* Sparkle badge */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-1.5"
            >
              <Zap size={13} style={{ color: ORANGE }} />
              <span className="text-[10px] font-black text-slate-800">AI-rewritten in 60s</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const router   = useRouter();
  const supabase = createClient();

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden" style={{ background: DARK }}>
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: BLUE, top: "-20%", left: "10%" }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: ORANGE, bottom: "-15%", right: "10%" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
              <Crown size={10} className="inline mr-1" />
              For Leaders
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-[1.1]">
            Your leadership record<br />
            <span style={{ color: ORANGE }}>deserves to be read.</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Upload your CV. AI rewrites it at the executive register. Preview free.
            Download from $5. The strongest version of your career story — ready in under 60 seconds.
          </motion.p>

          <motion.div variants={fadeUp}>
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.05, boxShadow: `0 16px 40px rgba(255,117,31,0.45)` }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 text-white font-bold px-8 py-4 rounded-2xl text-base"
              style={{ background: ORANGE }}
            >
              <Upload size={18} />
              Upload My CV Free
              <ArrowRight size={17} />
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center mt-6 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {["No card required", "Preview before you pay", "Confidential & secure", "Download in 60 seconds"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={11} className="text-green-400" />{t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const SITE_URL = "https://fusecv.com";
  return (
    <footer style={{ background: DARK }} className="border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image src="/fusecv-logo.png" alt="FuseCV" width={90} height={28} className="object-contain brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
              AI-powered CV platform built for executives, founders, and senior leaders.
            </p>
          </div>
          {[
            {
              heading: "Product",
              links: [
                { label: "Executive CV",      href: "/executive"       },
                { label: "CV Studio",         href: "/dashboard?tab=studio" },
                { label: "Interview Prep",    href: "/dashboard?tab=interview" },
                { label: "Cover Letter",      href: "/dashboard?tab=studio" },
              ],
            },
            {
              heading: "Account",
              links: [
                { label: "Sign Up Free", href: "/register" },
                { label: "Sign In",      href: "/login"    },
                { label: "Dashboard",    href: "/dashboard" },
              ],
            },
            {
              heading: "Legal",
              links: [
                { label: "Privacy Policy",    href: `${SITE_URL}/privacy`  },
                { label: "Terms of Service",  href: `${SITE_URL}/terms`    },
                { label: "Contact",           href: `${SITE_URL}/contact`  },
              ],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>{heading}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} FuseCV. All rights reserved.
          </p>
          <Link href="/" className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.3)" }}>
            Back to main site
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page Assembly ────────────────────────────────────────────────────────────
export default function ExecutiveLandingClient() {
  return (
    <main className="bg-white">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <WhyExecutive />
      <FeaturesSection />
      <HowItWorksSection />
      <WhoItsFor />
      <PositioningHighlight />
      <FinalCTA />
      <Footer />
    </main>
  );
}
