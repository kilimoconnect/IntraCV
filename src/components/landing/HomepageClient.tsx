"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion, useInView, useMotionValue, useSpring,
  AnimatePresence, useScroll, useTransform, type Variants,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Sparkles, FileText, CheckCircle2,
  ChevronDown, Zap, Shield, Target, Globe, BarChart2,
  Mic, FolderOpen, Download, User, Check, TrendingUp,
  BookOpen, ChevronRight,
} from "lucide-react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BLUE   = "#004aad";
const ORANGE = "#ff751f";
const TEAL   = "#00c4cc";
const DARK   = "#0a1628";

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
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.48, ease: ez } },
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
            { label: "Features",     href: "#features"     },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Guides",       href: "/guides"       },
          ].map(({ label, href }) => (
            href.startsWith("#") ? (
              <button key={label} onClick={() => document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" })}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">{label}</button>
            ) : (
              <Link key={label} href={href} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">{label}</Link>
            )
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

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [score,     setScore]     = useState(31);
  const [activeTab, setActiveTab] = useState<"studio" | "interview" | "documents" | "profile">("studio");

  useEffect(() => {
    if (!inView) return;
    let current = 31;
    const target  = 94;
    const totalMs = 2200;
    const fps     = 60;
    const steps   = (totalMs / 1000) * fps;
    const inc     = (target - current) / steps;
    const id = setInterval(() => {
      current = Math.min(current + inc, target);
      setScore(Math.round(current));
      if (current >= target) clearInterval(id);
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [inView]);

  const tabs = [
    { id: "profile",   label: "My Profile",     icon: <User size={12} /> },
    { id: "studio",    label: "CV Studio",       icon: <Sparkles size={12} /> },
    { id: "interview", label: "Interview Prep",  icon: <Mic size={12} /> },
    { id: "documents", label: "Documents",       icon: <FolderOpen size={12} /> },
  ] as const;

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-white"
      style={{ boxShadow: "0 32px 80px rgba(0,74,173,0.15), 0 8px 24px rgba(0,0,0,0.06)" }}>
      {/* Browser chrome */}
      <div className="h-8 flex items-center gap-2 px-3 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5">
          {["#f87171","#fbbf24","#4ade80"].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 mx-3 h-5 rounded-full bg-white border border-slate-200 flex items-center px-2.5">
          <span className="text-[9px] text-slate-400 font-medium">app.fusecv.com/dashboard</span>
        </div>
      </div>

      <div className="flex" style={{ height: 360 }}>
        {/* Sidebar */}
        <div className="shrink-0 border-r border-slate-100 bg-slate-50 flex flex-col pt-2 gap-0.5 px-1.5"
          style={{ width: 132 }}>
          <div className="px-2 pt-1 pb-2 mb-1 border-b border-slate-100">
            <div className="text-[9px] font-black text-slate-800 leading-tight">FuseCV</div>
            <div className="text-[8px] text-slate-400">Career Platform</div>
          </div>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-medium transition-all text-left"
              style={activeTab === tab.id ? { background: BLUE, color: "white" } : { color: "#64748b" }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 min-w-0 overflow-hidden p-3.5">
          <AnimatePresence mode="wait">
            {activeTab === "studio" && (
              <motion.div key="studio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[11px] font-black text-slate-900">James Mitchell</div>
                    <div className="text-[9px] text-slate-400">Senior Marketing Manager</div>
                  </div>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={8} /> ATS Ready
                  </span>
                </div>
                {/* ATS Score */}
                <div className="rounded-xl p-2.5 mb-3 border border-slate-100" style={{ background: "#f8fafc" }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-semibold text-slate-600">ATS Score</span>
                    <span className="text-[10px] font-black" style={{ color: BLUE }}>{score} / 100</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "31%" }}
                      animate={inView ? { width: `${score}%` } : {}}
                      transition={{ duration: 2.2, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${TEAL}, ${BLUE})` }}
                    />
                  </div>
                </div>
                {/* Themes */}
                <div className="text-[9px] text-slate-400 font-medium mb-1.5">Color Theme</div>
                <div className="flex gap-1.5 mb-3">
                  {[["#1E293B","Corporate"],["#0C4A6E","Ocean"],["#14532D","Forest"],["#7C2D12","Sunset"],["#4C1D95","Royal"]].map(([c, n], i) => (
                    <div key={n} title={n}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110 ${i === 0 ? "ring-2 ring-offset-1" : ""}`}
                      style={{ background: c }} />
                  ))}
                </div>
                {/* CV bullets */}
                <div className="space-y-1.5 mb-3">
                  {[
                    "Led demand-gen programme generating £4.1M ARR in FY2023",
                    "Managed £2.4M multi-channel budget with 31% revenue attribution",
                  ].map((b, i) => (
                    <div key={i} className="text-[9px] text-slate-600 flex items-start gap-1.5 leading-relaxed">
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: BLUE }} />
                      {b}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-lg text-white" style={{ background: ORANGE }}>
                    <Download size={9} /> Download PDF
                  </button>
                  <button className="flex items-center gap-1 text-[9px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600">
                    <Sparkles size={9} /> Re-optimise
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="text-[10px] font-black text-slate-800 mb-1">CV Readiness</div>
                <div className="text-[9px] text-slate-400 mb-2">78% complete · 3 sections need attention</div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full" style={{ width: "78%", background: `linear-gradient(90deg, ${TEAL}, ${BLUE})` }} />
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Personal Info",    ok: true  },
                    { label: "Work Experience",  ok: true  },
                    { label: "Skills",           ok: true  },
                    { label: "Key Achievements", ok: true  },
                    { label: "Certifications",   ok: false },
                    { label: "Languages",        ok: false },
                    { label: "References",       ok: false },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2 text-[9px]">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-emerald-500" : "bg-slate-200"}`}>
                        {ok ? <Check size={7} className="text-white" /> : null}
                      </div>
                      <span className={ok ? "text-slate-700" : "text-slate-400"}>{label}</span>
                      {!ok && <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${ORANGE}18`, color: ORANGE }}>Add</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "interview" && (
              <motion.div key="interview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="text-[10px] font-black text-slate-800 mb-2">Interview Practice Session</div>
                <div className="rounded-xl p-2.5 mb-2.5 border border-blue-100" style={{ background: "#eff6ff" }}>
                  <div className="text-[8px] text-slate-400 font-medium mb-1">Question 3 of 10 · Behavioural</div>
                  <div className="text-[9px] font-semibold text-slate-800 leading-relaxed mb-2">
                    Describe a time you led a team through a challenging campaign. What was your approach and the outcome?
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ORANGE }}>
                      <Mic size={10} className="text-white" />
                    </div>
                    <span className="text-[8px] text-slate-400">Tap to record your answer</span>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-slate-600 mb-1.5">AI Feedback</div>
                <div className="space-y-1">
                  {[
                    { text: "Score: 8 / 10", good: true },
                    { text: "Strong STAR structure demonstrated", good: true },
                    { text: "Add specific revenue impact figure", good: false },
                  ].map(({ text, good }, i) => (
                    <div key={i} className="text-[9px] flex items-start gap-1.5" style={{ color: good ? "#059669" : ORANGE }}>
                      <CheckCircle2 size={9} className="mt-0.5 shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "documents" && (
              <motion.div key="documents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="text-[10px] font-black text-slate-800 mb-2.5">Saved Documents</div>
                <div className="space-y-0">
                  {[
                    { name: "Senior Marketing Manager CV", type: "CV",           date: "Today, 2:14pm"    },
                    { name: "TechVentures Cover Letter",   type: "Cover Letter", date: "Yesterday"        },
                    { name: "Marketing Director CV v2",    type: "CV",           date: "3 days ago"       },
                    { name: "BrightScale Application CL",  type: "Cover Letter", date: "Last week"        },
                  ].map(({ name, type, date }) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: type === "CV" ? `${BLUE}15` : `${ORANGE}15` }}>
                          <FileText size={11} style={{ color: type === "CV" ? BLUE : ORANGE }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-semibold text-slate-700 leading-tight truncate">{name}</div>
                          <div className="text-[8px] text-slate-400">{type} · {date}</div>
                        </div>
                      </div>
                      <button className="shrink-0 ml-2 p-1 rounded hover:bg-slate-100 transition-colors">
                        <Download size={10} className="text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

  const { scrollY } = useScroll();
  const mockupY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden bg-white">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [1, 1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full -translate-y-1/2 translate-x-1/3 opacity-[0.04]"
          style={{ background: BLUE }}
        />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(circle, #004aad 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — Copy */}
        <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border"
            style={{ background: `${TEAL}10`, borderColor: `${TEAL}30`, color: TEAL }}>
            <Sparkles size={11} /> AI-Powered Career Platform
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-5">
            The Platform Built<br />to Get You{" "}
            <span style={{ color: BLUE }}>Hired.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
            Upload your CV. AI rewrites it, scores it, tailors it to any job, and preps you for the interview — all in one place.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.03, boxShadow: `0 12px 36px rgba(255,117,31,0.35)` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 text-white font-bold text-base px-7 py-3.5 rounded-xl"
              style={{ background: ORANGE, boxShadow: "0 6px 20px rgba(255,117,31,0.25)" }}
            >
              <Upload size={17} /> Upload My CV Free
              <ArrowRight size={15} />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center gap-2 font-semibold text-base px-7 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
            >
              See How It Works <ChevronDown size={15} />
            </motion.button>
          </motion.div>

          <motion.div variants={stagger(0.06)} className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { icon: <Shield size={12} />,       text: "No card required"      },
              { icon: <CheckCircle2 size={12} />,  text: "Preview before payment" },
              { icon: <Globe size={12} />,         text: "Used in 30+ countries"  },
            ].map(({ icon, text }) => (
              <motion.span key={text} variants={fadeUp}
                className="flex items-center gap-1.5 text-xs text-slate-400">
                <span style={{ color: TEAL }}>{icon}</span>
                {text}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Dashboard Mockup */}
        <motion.div
          variants={slideLeft} initial="hidden" animate="show"
          style={{ y: mockupY }}
          className="relative"
        >
          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -left-4 z-10 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${TEAL}18` }}>
              <TrendingUp size={13} style={{ color: TEAL }} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-800">10,000+ CVs</div>
              <div className="text-[8px] text-slate-400">upgraded with AI</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -right-4 z-10 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-emerald-100"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#059669" }}>
              <CheckCircle2 size={13} className="text-white" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-800">ATS Score: 94/100</div>
              <div className="text-[8px] text-emerald-600 font-semibold">Interview-ready ↑</div>
            </div>
          </motion.div>

          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl blur-3xl scale-90 opacity-20"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` }} />

          <div className="relative">
            <DashboardMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { value: "10,000+", label: "CVs improved" },
    { value: "30+",     label: "Countries served" },
    { value: "6",       label: "AI-powered tools" },
    { value: "< 60s",   label: "To a new CV" },
  ];
  return (
    <section className="py-5 border-y border-slate-100 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-200"
        >
          {stats.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center px-4 first:pl-0 last:pr-0">
              <div className="text-xl sm:text-2xl font-black" style={{ color: BLUE }}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features Grid ────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: <Sparkles size={20} />,
      color: BLUE,
      bg: "#eff6ff",
      border: "#bfdbfe",
      title: "AI CV Builder",
      desc: "Upload your existing CV. AI rewrites every section with achievement-led language, stronger bullets, and professional formatting — ready to send in under 60 seconds.",
      tags: ["10+ colour themes", "Multiple layout variants", "PDF export"],
    },
    {
      icon: <BarChart2 size={20} />,
      color: TEAL,
      bg: "#ecfeff",
      border: "#a5f3fc",
      title: "CV Readiness Score",
      desc: "AI analyses your CV section by section and gives you a 0–100 strength score. Know exactly what's weak, what's missing, and what to fix — before you apply.",
      tags: ["Section-by-section analysis", "Specific improvement tips", "Instant results"],
    },
    {
      icon: <Target size={20} />,
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
      title: "Job Description Matching",
      desc: "Paste any job description and AI instantly rewrites your CV to match the exact keywords, skills, and requirements the recruiter is looking for — every time.",
      tags: ["Keyword extraction", "ATS optimisation", "Role-specific rewrites"],
    },
    {
      icon: <Mic size={20} />,
      color: ORANGE,
      bg: "#fff7ed",
      border: "#fed7aa",
      title: "Interview Practice",
      desc: "AI generates tailored mock interview questions based on YOUR actual CV and the target role. Record your answers, receive scored feedback, and improve before the real thing.",
      tags: ["Voice recording", "AI feedback & scoring", "Behavioural + technical questions"],
    },
    {
      icon: <FileText size={20} />,
      color: "#059669",
      bg: "#f0fdf4",
      border: "#a7f3d0",
      title: "Cover Letter Generator",
      desc: "A compelling, role-specific cover letter built from your real experience — not a generic template. Tailored to the company and job in seconds.",
      tags: ["Job-matched content", "Your real experience", "Download-ready"],
    },
    {
      icon: <FolderOpen size={20} />,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
      title: "Documents Library",
      desc: "Every CV and cover letter you generate is saved automatically. Revisit, re-download, or adapt previous versions for new applications without starting over.",
      tags: ["All versions saved", "Filter by type", "Download any time"],
    },
  ];

  return (
    <section id="features" className="py-20 bg-white px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full border"
              style={{ background: `${BLUE}08`, borderColor: `${BLUE}20`, color: BLUE }}>
              Real Features, Real Results
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Every Tool You Need<br />to Land the Role
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              FuseCV is a complete career platform — not just a CV formatter. Six AI-powered tools, one dashboard.
            </p>
          </motion.div>

          <motion.div variants={stagger(0.07)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, color, bg, border, title, desc, tags }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.09)" }}
                className="rounded-2xl p-6 border transition-shadow"
                style={{ background: bg, borderColor: border }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-white" style={{ background: color }}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-600 bg-white/70 border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const router   = useRouter();
  const supabase = createClient();
  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  const steps = [
    {
      n: "01",
      icon: <Upload size={22} />,
      color: BLUE,
      title: "Upload Your Current CV",
      desc: "PDF or Word doc — use whatever you already have. AI reads every section instantly. No manual re-typing, no blank forms.",
    },
    {
      n: "02",
      icon: <Sparkles size={22} />,
      color: "#7c3aed",
      title: "AI Optimises for Your Target Role",
      desc: "Paste the job description. AI rewrites your bullets, fixes your structure, boosts your ATS score, and tailors every word to the role.",
    },
    {
      n: "03",
      icon: <CheckCircle2 size={22} />,
      color: "#059669",
      title: "Preview, Download, and Apply",
      desc: "See your improved CV before paying anything. Download a professionally formatted PDF and apply with confidence.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6" style={{ background: DARK }}>
      <div className="max-w-5xl mx-auto">
        <motion.div variants={stagger(0.09)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full border"
              style={{ borderColor: `${TEAL}35`, background: `${TEAL}10`, color: TEAL }}>
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Three Steps.<br />Zero Guesswork.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              From your current CV to a recruiter-ready version in under 60 seconds.
            </p>
          </motion.div>

          <motion.div variants={stagger(0.1)} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {steps.map(({ n, icon, color, title, desc }, i) => (
              <motion.div
                key={n}
                variants={fadeUp}
                className="relative p-6 rounded-2xl border"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="text-6xl font-black absolute top-4 right-5 select-none pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.04)" }}>{n}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white" style={{ background: color }}>
                  {icon}
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                    style={{ background: DARK, border: `1px solid rgba(255,255,255,0.1)` }}>
                    <ChevronRight size={12} className="text-slate-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="text-center">
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.04, boxShadow: `0 16px 48px rgba(255,117,31,0.4)` }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 text-white font-bold text-base px-10 py-4 rounded-xl"
              style={{ background: ORANGE, boxShadow: "0 8px 24px rgba(255,117,31,0.25)" }}
            >
              <Upload size={17} /> Start for Free
              <ArrowRight size={15} />
            </motion.button>
            <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              No card required · Preview before you pay
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Feature Highlight: CV Studio ─────────────────────────────────────────────
function CVStudioHighlight() {
  const themes = [
    { name: "Corporate", header: "#1E293B", accent: "#4F46E5" },
    { name: "Ocean",     header: "#0C4A6E", accent: "#0EA5E9" },
    { name: "Forest",    header: "#14532D", accent: "#16A34A" },
    { name: "Sunset",    header: "#7C2D12", accent: "#EA580C" },
    { name: "Royal",     header: "#4C1D95", accent: "#7C3AED" },
    { name: "Emerald",   header: "#047857", accent: "#10B981" },
  ];
  const [active, setActive] = useState(0);
  const th = themes[active];

  return (
    <section className="py-20 bg-white px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — visual */}
          <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="relative order-2 lg:order-1">
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl blur-3xl scale-90 opacity-15"
              style={{ background: th.header }} />

            {/* CV preview card */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white">
              {/* Header bar */}
              <div className="h-14 flex items-end px-5 pb-3" style={{ background: th.header }}>
                <div>
                  <div className="text-sm font-black text-white leading-tight">James Mitchell</div>
                  <div className="text-[10px] text-white/60">Senior Marketing Manager</div>
                </div>
              </div>
              <div className="flex">
                {/* Sidebar strip */}
                <div className="w-2 shrink-0" style={{ background: th.accent }} />
                {/* Body */}
                <div className="flex-1 p-4">
                  <div className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: th.accent }}>Professional Summary</div>
                  <div className="text-[8px] text-slate-500 leading-relaxed mb-4">
                    Results-driven Senior Marketing Manager with 9+ years delivering high-impact B2B campaigns. Generated £4.1M in attributable revenue in FY2023.
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: th.accent }}>Experience</div>
                  <div className="pl-2 border-l-2 mb-3" style={{ borderColor: th.accent }}>
                    <div className="text-[8px] font-bold text-slate-800">Senior Marketing Manager · TechVentures Ltd</div>
                    <div className="text-[7px] text-slate-400 mb-1">Jan 2020 – Present · London, UK</div>
                    {["Led demand-gen programme generating £4.1M ARR · +42% pipeline YoY",
                      "Managed £2.4M multi-channel budget across paid, owned, and earned media"].map((b, i) => (
                      <div key={i} className="text-[7px] text-slate-500 flex items-start gap-1 leading-relaxed">
                        <span className="mt-1 shrink-0" style={{ color: th.accent }}>●</span> {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* ATS bar at bottom */}
              <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8px] text-slate-400">ATS Score</span>
                <span className="text-[9px] font-black" style={{ color: th.accent }}>94 / 100</span>
              </div>
            </div>

            {/* Theme picker overlay */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-full px-3 py-2 shadow-xl border border-slate-100">
              {themes.map(({ name, header }, i) => (
                <motion.button
                  key={name}
                  onClick={() => setActive(i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  title={name}
                  className={`w-5 h-5 rounded-full transition-transform ${active === i ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
                  style={{ background: header }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right — copy */}
          <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full"
              style={{ background: `${BLUE}10`, color: BLUE }}>
              CV Studio
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-5">
              Professional CVs.<br />10 Colour Themes.<br />Multiple Layouts.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-6">
              Choose from Corporate, Ocean, Forest, Sunset, Royal, Emerald, and more. Every theme is designed by professionals and exported as a pixel-perfect PDF — ready to send to any recruiter.
            </p>
            <div className="space-y-3">
              {[
                "AI rewrites your bullet points into achievement-led language",
                "ATS-optimised structure that passes screening systems",
                "One-click PDF download — no design skills needed",
                "Re-optimise instantly for different roles",
              ].map(t => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${BLUE}12` }}>
                    <Check size={11} style={{ color: BLUE }} />
                  </div>
                  <span className="text-sm text-slate-600">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Highlight: Interview Prep ────────────────────────────────────────
function InterviewPrepHighlight() {
  const questions = [
    { q: "Tell me about a time you led a team through a significant challenge.", type: "Behavioural", score: 8 },
    { q: "How do you approach managing a large marketing budget across multiple channels?", type: "Competency", score: 9 },
    { q: "Describe your process for measuring and reporting campaign performance to senior stakeholders.", type: "Situational", score: 7 },
  ];
  const [active, setActive] = useState(0);
  const aq = questions[active];

  return (
    <section className="py-20 px-4 sm:px-6" style={{ background: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full"
              style={{ background: `${ORANGE}12`, color: ORANGE }}>
              Interview Prep
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-5">
              Practice With<br />AI. Score Better.<br />Get Hired.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-6">
              AI reads your actual CV and the job description, then generates tailored interview questions — behavioural, technical, competency, and culture-fit. Record your answers, receive real feedback, and improve before the interview.
            </p>
            <div className="space-y-3">
              {[
                "Questions built from your real CV — not generic templates",
                "Voice or text answer recording",
                "AI scores each answer 0–10 with specific improvement tips",
                "Expert tips included with every question",
              ].map(t => (
                <div key={t} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${ORANGE}12` }}>
                    <Check size={11} style={{ color: ORANGE }} />
                  </div>
                  <span className="text-sm text-slate-600">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — visual */}
          <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="relative">
            <div className="absolute inset-0 rounded-2xl blur-3xl scale-90 opacity-15" style={{ background: ORANGE }} />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-5">
              {/* Question tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {questions.map(({ type }, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors"
                    style={active === i ? { background: ORANGE, color: "white" } : { background: "#f1f5f9", color: "#64748b" }}>
                    Q{i + 1} · {type}
                  </button>
                ))}
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div key={active}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}>
                  <div className="rounded-xl p-4 mb-4 border border-orange-100" style={{ background: "#fff7ed" }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: ORANGE }}>{aq.type} Question</div>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{aq.q}</p>
                  </div>

                  {/* Record answer */}
                  <div className="flex items-center gap-3 rounded-xl p-3 mb-4 border border-slate-100 bg-slate-50">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: ORANGE }}>
                      <Mic size={15} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Record Your Answer</div>
                      <div className="text-[10px] text-slate-400">Voice or type — AI will evaluate both</div>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="rounded-xl p-3 border border-emerald-100 bg-emerald-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-700">AI Feedback</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{ background: aq.score >= 8 ? "#059669" : ORANGE }}>
                        {aq.score} / 10
                      </span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { text: "Good STAR structure with clear outcome", ok: true },
                        { text: "Add a specific metric to strengthen impact", ok: false },
                      ].map(({ text, ok }, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: ok ? "#059669" : ORANGE }}>
                          <CheckCircle2 size={10} className="mt-0.5 shrink-0" /> {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const router   = useRouter();
  const supabase = createClient();
  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: DARK }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.20, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: BLUE }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 left-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: TEAL }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${TEAL}35`, background: `${TEAL}10`, color: TEAL }}>
            <Sparkles size={11} /> Your next role is waiting
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            A Better CV Opens<br />
            <span style={{ color: ORANGE }}>Doors You Deserve.</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Upload your CV free. See your improved version in under 60 seconds. No card needed until you&apos;re ready to download.
          </motion.p>

          <motion.div variants={fadeUp}>
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.04, boxShadow: `0 24px 64px rgba(255,117,31,0.45)` }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 text-white font-bold text-lg px-12 py-5 rounded-2xl mb-5"
              style={{ background: ORANGE, boxShadow: "0 12px 40px rgba(255,117,31,0.3)" }}
            >
              <Upload size={20} />
              Upload My CV Free
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {["No card required", "Preview before payment", "Results in 60 seconds"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={11} style={{ color: TEAL }} /> {t}
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
  const links = {
    Product: [
      { l: "Features",       h: "#features"     },
      { l: "How It Works",   h: "#how-it-works"  },
      { l: "CV Guides",      h: "/guides"        },
    ],
    Account: [
      { l: "Sign Up Free",  h: "/register" },
      { l: "Sign In",       h: "/login"    },
      { l: "Dashboard",     h: "/dashboard"},
    ],
    Legal: [
      { l: "Privacy Policy", h: "/privacy" },
    ],
  };

  return (
    <footer style={{ background: DARK, borderTop: "1px solid rgba(255,255,255,0.05)" }} className="pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={90} height={28} className="object-contain mb-3 brightness-0 invert opacity-60" />
            <p className="text-xs leading-relaxed max-w-[180px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              AI-powered career tools for job seekers in 30+ countries.
            </p>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>{section}</div>
              <ul className="space-y-2.5">
                {items.map(({ l, h }) => (
                  <li key={l}>
                    <Link href={h} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>
          <span>© {new Date().getFullYear()} FuseCV. All rights reserved.</span>
          <span>Built for job seekers worldwide.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomepageClient() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <CVStudioHighlight />
      <InterviewPrepHighlight />
      <FinalCTA />
      <Footer />
    </main>
  );
}
