"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Lock, Zap, Eye,
  CheckCircle2, XCircle, Search, FileText, Sparkles,
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

// ─── Role Profiles ────────────────────────────────────────────────────────────
interface RoleProfile {
  category: string;
  score: number;
  issues: string[];     // exactly 3 hyper-specific issues
}

const PROFILES: Record<string, RoleProfile> = {
  tech: {
    category: "Software Engineer",
    score: 27,
    issues: [
      "No GitHub or portfolio URL detected",
      "Tech stack first appears on page 2, not the header",
      "0 of 6 experience bullets show delivery metrics",
    ],
  },
  marketing: {
    category: "Marketing Professional",
    score: 31,
    issues: [
      "No campaign ROI, growth %, or revenue figures found",
      "CRM tools (HubSpot, Salesforce) not mentioned",
      "Only 2 of 9 expected marketing keywords present",
    ],
  },
  design: {
    category: "Designer",
    score: 26,
    issues: [
      "No Behance, Dribbble, or portfolio URL detected",
      "Figma and Adobe CC absent from skills section",
      "0 client projects include measurable outcomes",
    ],
  },
  finance: {
    category: "Finance Professional",
    score: 33,
    issues: [
      "No portfolio size, AUM, or P&L responsibility stated",
      "Certifications (CFA, CPA) not visible in top third",
      "GAAP and IFRS keywords absent from 4 expected locations",
    ],
  },
  sales: {
    category: "Sales Professional",
    score: 30,
    issues: [
      "No quota attainment % or revenue figures found",
      "0 of 5 roles include deal size or pipeline metrics",
      "CRM experience not mentioned in any position",
    ],
  },
  hr: {
    category: "HR Professional",
    score: 30,
    issues: [
      "Hiring volume and time-to-fill data not found",
      "HRIS systems (Workday, BambooHR) not listed",
      "0 initiatives include measurable business impact",
    ],
  },
  management: {
    category: "Manager / Director",
    score: 32,
    issues: [
      "Team size not mentioned in any of 3 roles",
      "Budget responsibility absent from all experience",
      "No OKR, KPI, or strategic framework referenced",
    ],
  },
  healthcare: {
    category: "Healthcare Professional",
    score: 35,
    issues: [
      "Registration number and license not prominently displayed",
      "Patient volume and outcome data absent",
      "3 of 8 required clinical keywords missing",
    ],
  },
  education: {
    category: "Teacher / Educator",
    score: 34,
    issues: [
      "No student outcomes or results data found",
      "Teaching certifications not in top section",
      "Curriculum framework keywords absent",
    ],
  },
  default: {
    category: "",
    score: 29,
    issues: [
      "Summary too short to stand out to recruiters",
      "0 achievements include measurable results",
      "Only 4 of 11 expected keywords found",
    ],
  },
};

function detectProfile(title: string): RoleProfile {
  const t = title.toLowerCase();
  if (/software|engineer|developer|devops|sre|data scien|machine learn|ml |ai |backend|frontend|fullstack|full.stack|cloud|architect|qa|quality|sysadmin|infrastructure/.test(t)) return PROFILES.tech;
  if (/market|growth|seo|sem|content|social media|brand|digital|campaign|demand gen|product market/.test(t)) return PROFILES.marketing;
  if (/design|ux|ui|user experience|user interface|creative|graphic|visual|figma|product design|motion/.test(t)) return PROFILES.design;
  if (/financ|account|audit|cfo|controller|treasurer|invest|banking|actuar|analyst|risk|wealth/.test(t)) return PROFILES.finance;
  if (/sales|account exec|business dev|bdm|revenue|commercial|enterprise|sdr|bdr|presales/.test(t)) return PROFILES.sales;
  if (/\bhr\b|human resource|people ops|recruit|talent|compensation|benefit|hrbp|l&d|learning/.test(t)) return PROFILES.hr;
  if (/manag|director|head of|vp |vice pres|ceo|coo|cto|president|chief|operation|program|project|strategy/.test(t)) return PROFILES.management;
  if (/nurs|doctor|physician|surgeon|pharmacist|physiother|radiolog|clinical|medical|health|dental|midwif/.test(t)) return PROFILES.healthcare;
  if (/teach|professor|lecturer|tutor|educator|academic|principal|school|curriculum|instructor/.test(t)) return PROFILES.education;
  return PROFILES.default;
}

// ─── Score Card (clean, tool-like) ────────────────────────────────────────────
function ScoreCard({ jobTitle }: { jobTitle: string }) {
  const profile    = useMemo(() => jobTitle.trim().length >= 3 ? detectProfile(jobTitle) : PROFILES.default, [jobTitle]);
  const [animated, setAnimated] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    setAnimated(false);
    const t = setTimeout(() => { setAnimated(true); setProfileKey(k => k + 1); }, 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, inView]);

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 300);
  }, [inView]);

  const circumference = 2 * Math.PI * 30;
  const hasRole = jobTitle.trim().length >= 3;

  return (
    <div ref={ref} className="relative w-full max-w-[340px] mx-auto lg:mx-0">
      {/* Subtle glow */}
      <div className="absolute inset-6 rounded-3xl blur-2xl opacity-[0.07] pointer-events-none"
        style={{ background: "#ef4444" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: ez }}
        className="relative bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.10), 0 1px 0 rgba(0,0,0,0.04)" }}
      >
        {/* Tool header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={profile.category || "default"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              {hasRole ? `${profile.category} Analysis` : "CV Analysis"}
            </motion.span>
          </AnimatePresence>
          {/* Live indicator */}
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-green-400"
            />
            <span className="text-[9px] font-bold text-slate-400">LIVE</span>
          </div>
        </div>

        {/* Score + issues */}
        <div className="px-5 py-5">
          {/* Score row */}
          <div className="flex items-center gap-4 mb-5">
            {/* Circle */}
            <div className="relative w-[72px] h-[72px] shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="30" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                <motion.circle
                  key={`ring-${profileKey}`}
                  cx="34" cy="34" r="30" fill="none"
                  stroke="#ef4444" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={animated ? { strokeDashoffset: circumference * (1 - profile.score / 100) } : {}}
                  transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`score-${profileKey}`}
                    className="text-[22px] font-black leading-none text-slate-900"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >{profile.score}</motion.span>
                </AnimatePresence>
                <span className="text-[8px] text-slate-400 font-bold mt-0.5">/100</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-black text-red-500">Needs Attention</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`label-${profileKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-400 font-medium leading-snug"
                >
                  {hasRole
                    ? `Issues typical for ${profile.category} CVs`
                    : "Common CV issues detected"
                  }
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* 3 issues */}
          <div className="space-y-2 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">
              3 critical issues found
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={`issues-${profileKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {profile.issues.map((issue, i) => (
                  <motion.div
                    key={issue}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: animated ? 0.3 + i * 0.12 : 0, duration: 0.3 }}
                    className="flex items-start gap-2.5 bg-red-50 rounded-lg px-3 py-2"
                  >
                    <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700 leading-snug">{issue}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA nudge */}
          <div className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: `rgba(255,117,31,0.06)`, border: `1px solid rgba(255,117,31,0.2)` }}>
            <p className="text-[11px] font-black text-slate-800">
              {hasRole ? `Showing ${profile.category} preview` : "This is a sample preview"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Upload your CV to see your real score
            </p>
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

      {/* Personalised badge */}
      <AnimatePresence>
        {hasRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: ez }}
            className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-lg px-3 py-2 border border-slate-100 flex items-center gap-1.5"
          >
            <Sparkles size={11} style={{ color: BLUE }} />
            <span className="text-[10px] font-black text-slate-800">Personalised preview</span>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [jobTitle, setJobTitle]         = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(jobTitle), 280);
    return () => clearTimeout(t);
  }, [jobTitle]);

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

            {/* Job title input */}
            <motion.div variants={fadeUp} className="mb-6 max-w-sm mx-auto lg:mx-0">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Personalise your preview
              </label>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3.5 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCTA()}
                  placeholder="e.g. Software Engineer, Nurse, Teacher…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all placeholder:text-slate-300"
                />
              </div>
              <AnimatePresence>
                {jobTitle.trim().length >= 3 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] text-emerald-600 mt-1.5 font-semibold overflow-hidden"
                  >
                    ✓ Preview personalised for &ldquo;{jobTitle.trim()}&rdquo;
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

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
            <ScoreCard jobTitle={debouncedTitle} />
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
