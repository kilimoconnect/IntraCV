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
  BookOpen, ChevronRight, Settings as SettingsIcon, Wand2,
  Palette, AlertCircle,
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
          <Link href="/cv-check"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors"
            style={{ color: ORANGE }}>
            <Zap size={12} /> Free CV Check
          </Link>
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
  const [animScore, setAnimScore] = useState(0);
  const [activeTab, setActiveTab] = useState<"profile" | "studio" | "interview" | "documents" | "settings">("profile");

  const SCORE = 85;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - animScore / 100);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setAnimScore(SCORE), 300);
    return () => clearTimeout(t);
  }, [inView]);

  const navItems = [
    { key: "profile",   label: "My Profile",                       subtitle: "View and edit your data",    icon: <User size={10} /> },
    { key: "studio",    label: "Fix and improve your CV",          subtitle: "AI-powered CV optimization", icon: <Wand2 size={10} /> },
    { key: "interview", label: "Practice real interview questions", subtitle: "AI mock interviews",         icon: <Mic size={10} /> },
    { key: "documents", label: "Access your CV and cover letters",  subtitle: "Download your documents",    icon: <FolderOpen size={10} /> },
    { key: "settings",  label: "Settings",                         subtitle: "Account preferences",        icon: <SettingsIcon size={10} /> },
  ] as const;

  const tabMeta: Record<string, { label: string; desc: string; icon: React.ReactNode; gradient: string }> = {
    profile:   { label: "My Profile",                       desc: "View and manage your career profile data",        icon: <User size={13} />,         gradient: "linear-gradient(135deg, #004aad 0%, #00c4cc 100%)" },
    studio:    { label: "Fix and improve your CV",          desc: "AI-powered CV optimization and generation",       icon: <Wand2 size={13} />,        gradient: "linear-gradient(135deg, #004aad 0%, #00c4cc 100%)" },
    interview: { label: "Practice real interview questions", desc: "AI mock interviews tailored to your profile",    icon: <Mic size={13} />,          gradient: "linear-gradient(135deg, #004aad 0%, #00c4cc 100%)" },
    documents: { label: "Access your CV and cover letters", desc: "Download and manage your saved documents",        icon: <FolderOpen size={13} />,   gradient: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)" },
    settings:  { label: "Settings",                         desc: "Manage your account and CV preferences",          icon: <SettingsIcon size={13} />, gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)" },
  };

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 32px 80px rgba(0,74,173,0.18), 0 8px 24px rgba(0,0,0,0.08)" }}>

      {/* Browser chrome */}
      <div className="h-7 flex items-center gap-2 px-3" style={{ background: "#e2e8f0", borderBottom: "1px solid #cbd5e1" }}>
        <div className="flex gap-1.5">
          {["#f87171","#fbbf24","#4ade80"].map(c => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 mx-2 h-4 rounded-full bg-white flex items-center px-2" style={{ border: "1px solid #e2e8f0" }}>
          <span className="text-[8px] font-medium" style={{ color: "#94a3b8" }}>app.fusecv.com/dashboard</span>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 430 }}>

        {/* Sidebar */}
        <div className="shrink-0 flex flex-col h-full" style={{ width: 138, background: "linear-gradient(180deg, #004aad 0%, #003590 100%)" }}>
          {/* Top accent */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)" }} />

          {/* Logo */}
          <div className="px-3 pt-2.5 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="text-[9px] font-black text-white leading-tight">FuseCV</div>
            <div className="text-[7px]" style={{ color: "rgba(255,255,255,0.45)" }}>Career Platform</div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-1.5 py-2 space-y-0.5 overflow-hidden">
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className="w-full flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all duration-150"
                  style={isActive
                    ? { background: "white", boxShadow: "0 3px 10px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5)" }
                    : { color: "rgba(255,255,255,0.8)" }
                  }>
                  <span className="shrink-0 mt-0.5" style={{ color: isActive ? "#004aad" : "rgba(255,255,255,0.75)" }}>
                    {item.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[8px] font-semibold leading-snug break-words"
                      style={{ color: isActive ? "#004aad" : "rgba(255,255,255,0.9)" }}>
                      {item.label}
                    </span>
                    <span className="block text-[6.5px] mt-0.5 leading-tight"
                      style={{ color: isActive ? "rgba(0,74,173,0.55)" : "rgba(255,255,255,0.45)" }}>
                      {item.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="p-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                style={{ background: "#ff751f", boxShadow: "0 0 0 2px rgba(255,117,31,0.4)" }}>
                J
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[7px] truncate" style={{ color: "rgba(255,255,255,0.85)" }}>james@example.com</p>
                <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.45)" }}>Active account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ background: "#F0F2F8" }}>

          {/* Top header */}
          <div className="h-8 flex items-center justify-between px-3 shrink-0"
            style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)" }}>
            <span className="text-[9px] font-black" style={{ color: "#004aad" }}>FuseCV</span>
            <span className="text-[7px] font-medium" style={{ color: "#94a3b8" }}>Sign out</span>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-2.5">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="h-full flex flex-col"
              >
                {/* Tab header */}
                <div className="flex items-center gap-2 mb-2 shrink-0">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-lg opacity-50 blur-sm scale-110"
                      style={{ background: tabMeta[activeTab].gradient }} />
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ background: tabMeta[activeTab].gradient, boxShadow: "0 3px 10px rgba(0,74,173,0.28), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                      {tabMeta[activeTab].icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9.5px] font-extrabold text-slate-900 leading-tight truncate">{tabMeta[activeTab].label}</p>
                    <p className="text-[7.5px] text-slate-500 truncate">{tabMeta[activeTab].desc}</p>
                  </div>
                </div>
                <div className="h-px shrink-0 mb-2.5"
                  style={{ background: "linear-gradient(90deg, rgba(0,74,173,0.2) 0%, rgba(0,196,204,0.1) 30%, transparent 100%)" }} />

                {/* Tab content */}
                {activeTab === "profile" && (
                  <div className="flex-1 overflow-hidden">
                    {/* CV Readiness Banner */}
                    <div className="rounded-xl overflow-hidden relative"
                      style={{ background: "linear-gradient(140deg, #07111f 0%, #001260 100%)" }}>
                      <style>{`@keyframes dms{from{background-position:200% center}to{background-position:-200% center}}`}</style>
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                      <div className="absolute top-0 right-0 w-24 h-24 -translate-y-1/2 translate-x-1/4 pointer-events-none rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)" }} />

                      {/* Ring + headline */}
                      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2.5 relative">
                        <div className="relative shrink-0">
                          <svg width="50" height="50" viewBox="0 0 50 50">
                            <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                            <circle cx="25" cy="25" r={r} fill="none" stroke="#10b981" strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={`${circ}`} strokeDashoffset={`${offset}`}
                              transform="rotate(-90 25 25)"
                              style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 3px rgba(16,185,129,0.55))" }} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[11px] font-black text-white leading-none">{animScore}</span>
                            <span className="text-[6px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 mb-0.5">
                            <p className="text-[8.5px] font-black text-white leading-snug">Your CV looks strong and job-ready</p>
                            <span className="inline-flex items-center gap-1 text-[6.5px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0"
                              style={{ background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.28)", color: "#6ee7b7" }}>
                              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                              Job Ready
                            </span>
                          </div>
                          <p className="text-[7px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.38)" }}>Current CV Strength</p>
                          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-1 rounded-full" style={{
                              width: `${animScore}%`,
                              background: "#10b981",
                              boxShadow: "0 0 6px rgba(16,185,129,0.55)",
                              transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
                            }} />
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="px-3 pb-2.5 relative">
                        <p className="text-[7px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          Keep your CV polished — generate or update it anytime
                        </p>
                        <div className="w-full flex items-center justify-center gap-1.5 font-bold py-1.5 rounded-lg text-[8px] text-white relative overflow-hidden cursor-pointer"
                          style={{ background: "linear-gradient(135deg, #ff751f 0%, #ff9340 100%)", boxShadow: "0 3px 12px rgba(255,117,31,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                          <span className="absolute inset-0 rounded-lg pointer-events-none" style={{
                            background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)",
                            backgroundSize: "250% auto", animation: "dms 3s linear infinite",
                          }} />
                          <Sparkles size={9} className="relative z-10" />
                          <span className="relative z-10">Generate Professional CV</span>
                        </div>
                      </div>

                      {/* Issues / Improvements */}
                      <div className="grid grid-cols-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="px-3 py-2" style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
                          <p className="text-[6.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#fca5a5" }}>Issues Found</p>
                          <ul className="space-y-1">
                            {["Missing LinkedIn URL", "Summary too generic"].map((issue, i) => (
                              <li key={i} className="flex items-start gap-1 text-[7px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                                <span className="shrink-0 font-bold text-red-400">–</span>{issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="px-3 py-2" style={{ background: "rgba(16,185,129,0.04)" }}>
                          <p className="text-[6.5px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#6ee7b7" }}>What We Will Improve</p>
                          <ul className="space-y-1">
                            {["Quantify impact metrics", "Add keywords for ATS"].map((item, i) => (
                              <li key={i} className="flex items-start gap-1 text-[7px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                                <CheckCircle2 size={8} className="text-emerald-400 shrink-0 mt-0.5" />{item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "studio" && (
                  <div className="flex-1 overflow-hidden space-y-2">
                    <div className="rounded-xl p-2.5 relative overflow-hidden"
                      style={{ background: "linear-gradient(140deg, #07111f 0%, #001260 100%)" }}>
                      <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                      <div className="flex items-center gap-2 relative">
                        <div className="relative shrink-0">
                          <svg width="44" height="44" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                            <circle cx="22" cy="22" r="17" fill="none" stroke="#f59e0b" strokeWidth="4"
                              strokeLinecap="round" strokeDasharray="106.8" strokeDashoffset="53.4"
                              transform="rotate(-90 22 22)"
                              style={{ filter: "drop-shadow(0 0 3px rgba(245,158,11,0.55))" }} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-white">50</span>
                            <span className="text-[5.5px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5 mb-0.5">
                            <p className="text-[8.5px] font-black text-white leading-snug">Your CV is not ready for applications</p>
                            <span className="inline-flex items-center gap-1 text-[6.5px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0"
                              style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.28)", color: "#fca5a5" }}>
                              <span className="w-1 h-1 rounded-full" style={{ background: "#ef4444" }} />
                              Needs Work
                            </span>
                          </div>
                          <p className="text-[7px] mb-1.5" style={{ color: "rgba(255,255,255,0.38)" }}>Current CV Strength</p>
                          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-1 rounded-full" style={{ width: "50%", background: "#f59e0b", boxShadow: "0 0 5px rgba(245,158,11,0.5)" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        "Led demand-gen programme generating £4.1M ARR in FY2023",
                        "Managed £2.4M multi-channel budget with 31% revenue attribution",
                        "Built cross-functional team of 12 across 4 markets",
                      ].map((b, i) => (
                        <div key={i} className="text-[8px] text-slate-600 flex items-start gap-1.5 leading-relaxed bg-white rounded-lg px-2.5 py-1.5" style={{ border: "1px solid #f1f5f9" }}>
                          <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: BLUE }} />
                          {b}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button className="flex items-center gap-1 text-[8px] font-bold px-2.5 py-1.5 rounded-lg text-white" style={{ background: ORANGE }}>
                        <Download size={9} /> Download PDF
                      </button>
                      <button className="flex items-center gap-1 text-[8px] font-medium px-2.5 py-1.5 rounded-lg text-slate-600" style={{ border: "1px solid #e2e8f0" }}>
                        <Sparkles size={9} /> Re-optimise
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "interview" && (
                  <div className="flex-1 overflow-hidden space-y-2">
                    <div className="rounded-xl p-2.5" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                      <div className="text-[7.5px] font-medium mb-1" style={{ color: "#94a3b8" }}>Question 3 of 10 · Behavioural</div>
                      <div className="text-[8.5px] font-semibold text-slate-800 leading-relaxed mb-2">
                        Describe a time you led a team through a challenging campaign. What was your approach and the outcome?
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ORANGE }}>
                          <Mic size={10} className="text-white" />
                        </div>
                        <span className="text-[7.5px]" style={{ color: "#94a3b8" }}>Tap to record your answer</span>
                      </div>
                    </div>
                    <div className="text-[8px] font-bold text-slate-600 mb-1">AI Feedback</div>
                    <div className="space-y-1">
                      {[
                        { text: "Score: 8 / 10", good: true },
                        { text: "Strong STAR structure demonstrated", good: true },
                        { text: "Add specific revenue impact figure", good: false },
                      ].map(({ text, good }, i) => (
                        <div key={i} className="text-[8px] flex items-start gap-1.5" style={{ color: good ? "#059669" : ORANGE }}>
                          <CheckCircle2 size={9} className="mt-0.5 shrink-0" />{text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="flex-1 overflow-hidden">
                    <div className="space-y-0 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #f1f5f9" }}>
                      {[
                        { name: "Senior Marketing Manager CV", type: "CV",           date: "Today, 2:14pm" },
                        { name: "TechVentures Cover Letter",   type: "Cover Letter", date: "Yesterday"     },
                        { name: "Marketing Director CV v2",    type: "CV",           date: "3 days ago"    },
                        { name: "BrightScale Application CL",  type: "Cover Letter", date: "Last week"     },
                      ].map(({ name, type, date }) => (
                        <div key={name} className="flex items-center justify-between px-2.5 py-2" style={{ borderBottom: "1px solid #f8fafc" }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: type === "CV" ? `${BLUE}15` : `${ORANGE}15` }}>
                              <FileText size={10} style={{ color: type === "CV" ? BLUE : ORANGE }} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[8px] font-semibold text-slate-700 leading-tight truncate">{name}</div>
                              <div className="text-[7px] text-slate-400">{type} · {date}</div>
                            </div>
                          </div>
                          <button className="shrink-0 ml-2">
                            <Download size={9} className="text-slate-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="flex-1 overflow-hidden space-y-2">
                    {[
                      { label: "Full Name",      value: "James Mitchell"           },
                      { label: "Email",          value: "james@example.com"        },
                      { label: "Career Focus",   value: "Senior Marketing Manager" },
                      { label: "CV Template",    value: "Professional Blue"        },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white rounded-lg px-2.5 py-2" style={{ border: "1px solid #f1f5f9" }}>
                        <p className="text-[7px] font-medium mb-0.5" style={{ color: "#94a3b8" }}>{label}</p>
                        <p className="text-[8.5px] font-semibold text-slate-800">{value}</p>
                      </div>
                    ))}
                    <button className="w-full py-1.5 rounded-lg text-[8px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #ff751f 0%, #ff9340 100%)" }}>
                      Save Changes
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
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

  const { scrollY } = useScroll();
  const mockupY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden bg-white">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
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

          <motion.p variants={fadeUp} className="text-lg text-slate-700 leading-relaxed mb-8 max-w-lg">
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

// ─── Free CV Checker Teaser ───────────────────────────────────────────────────
function CVCheckerSection() {
  const MOCK_BARS = [
    { label: "ATS Match",   score: 38, color: "#ef4444" },
    { label: "Impact",      score: 22, color: "#ef4444" },
    { label: "Keywords",    score: 44, color: "#f59e0b" },
    { label: "Readability", score: 61, color: "#f59e0b" },
  ];
  const MOCK_ISSUES = [
    { severity: "critical", text: "0 of 14 bullets contain measurable results" },
    { severity: "critical", text: "Key Achievements section missing — required at this level" },
    { severity: "warning",  text: "Skills listed as plain text — no visual grouping or categories" },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden" style={{ background: "#fafafa" }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[480px] h-[480px] rounded-full opacity-[0.045]"
          style={{ background: ORANGE }} />
        <div className="absolute inset-0 opacity-[0.013]"
          style={{ backgroundImage: "radial-gradient(circle, #ff751f 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy ── */}
          <motion.div variants={slideRight} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full border"
              style={{ background: `${ORANGE}10`, borderColor: `${ORANGE}28`, color: ORANGE }}>
              <Zap size={11} /> Free · No Account Required
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
              Find Out What&apos;s Stopping<br />Recruiters From Calling You.
            </h2>

            <p className="text-lg text-slate-500 leading-relaxed mb-7">
              Upload your CV and get a detailed, category-specific report in 60 seconds — scoring your content, format, ATS compatibility, and keyword coverage. No login needed.
            </p>

            <div className="space-y-3 mb-8">
              {[
                ["Career level detection",   "Junior / Mid-Senior / Executive — scored accordingly"],
                ["Content scoring",          "Impact, ATS, keywords, and readability analysed"],
                ["Format & presentation",    "Layout type, template quality, ATS safety check"],
                ["Before / after example",   "Real bullet from your CV rewritten with measurable results"],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${ORANGE}15` }}>
                    <Check size={11} style={{ color: ORANGE }} />
                  </div>
                  <span className="text-sm text-slate-600">
                    <strong className="text-slate-800">{title}</strong> — {desc}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/cv-check">
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: `0 12px 36px rgba(255,117,31,0.35)` }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-white font-bold text-base px-7 py-3.5 rounded-xl cursor-pointer"
                  style={{ background: ORANGE, boxShadow: "0 6px 20px rgba(255,117,31,0.22)" }}>
                  <Upload size={17} /> Check My CV Free
                  <ArrowRight size={15} />
                </motion.div>
              </Link>
              <span className="text-sm text-slate-400 flex items-center gap-1.5">
                <Shield size={13} className="text-slate-300" />
                No account · No payment · Private
              </span>
            </div>
          </motion.div>

          {/* ── Right: mini report mockup ── */}
          <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            className="relative">
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl blur-3xl scale-90 opacity-[0.08]"
              style={{ background: ORANGE }} />

            <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)" }}>

              {/* Browser bar */}
              <div className="h-7 flex items-center gap-2 px-3" style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                <div className="flex gap-1.5">
                  {["#f87171","#fbbf24","#4ade80"].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
                </div>
                <div className="flex-1 mx-2 h-4 rounded-full bg-white flex items-center px-2 border border-slate-200">
                  <span className="text-[8px] text-slate-400">fusecv.com/cv-check</span>
                </div>
              </div>

              {/* Score hero */}
              <div className="px-5 pt-4 pb-4 flex items-center gap-4 border-b border-slate-50">
                {/* Ring */}
                <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
                  <svg className="absolute inset-0 -rotate-90" width={72} height={72} viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#ef4444" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - 34 / 100)}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 leading-none">34</span>
                    <span className="text-[9px] font-semibold text-slate-400">/100</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border mb-1.5"
                    style={{ background: "rgba(124,58,237,0.07)", borderColor: "rgba(124,58,237,0.18)", color: "#7c3aed" }}>
                    <ChevronRight size={9} /> Mid-Senior Professional
                  </span>
                  <p className="text-sm font-black text-slate-800 leading-snug">Strong Experience. Weak Presentation.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Your experience is real — but not showing up for recruiters.</p>
                </div>
              </div>

              {/* Score bars */}
              <div className="px-5 py-4 space-y-2.5 border-b border-slate-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Score Breakdown</p>
                {MOCK_BARS.map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-600">{label}</span>
                      <span className="text-[11px] font-black" style={{ color }}>{score}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                      <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              <div className="px-5 py-4 space-y-2 border-b border-slate-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Issues Found</p>
                {MOCK_ISSUES.map(({ severity, text }, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                      severity === "critical" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    }`}>{severity}</span>
                    <span className="text-[11px] text-slate-600 leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              {/* Format row */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-slate-50" style={{ background: "#fafafa" }}>
                <div className="flex items-center gap-1.5">
                  <Palette size={11} className="text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-500">Format Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-amber-600">42/100</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold">Generic Template</span>
                </div>
              </div>

              {/* Upgrade strip */}
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: `${ORANGE}08`, borderTop: `1px solid ${ORANGE}18` }}>
                <TrendingUp size={12} style={{ color: ORANGE }} />
                <p className="text-[11px] font-semibold" style={{ color: "#b45309" }}>
                  FuseCV can raise this to <strong style={{ color: ORANGE }}>78+</strong> with an AI rewrite + professional theme
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100 z-10">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${TEAL}18` }}>
                <AlertCircle size={13} style={{ color: TEAL }} />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-800">3 critical issues</div>
                <div className="text-[8px] text-slate-400">found in your CV</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
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
    { num: "01", title: "Upload Your Current CV",          desc: "Use what you already have.",                            icon: <Upload size={20} className="text-white" /> },
    { num: "02", title: "Add Missing Details",             desc: "Quick prompts uncover hidden achievements.",            icon: <FileText size={20} className="text-white" /> },
    { num: "03", title: "AI Rebuilds It Professionally",   desc: "Sharper wording, stronger bullets, better structure.",  icon: <Sparkles size={20} className="text-white" /> },
    { num: "04", title: "Preview Before Paying",           desc: "Only unlock if you're genuinely impressed.",            icon: <CheckCircle2 size={20} className="text-white" /> },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: DARK }}>
      <div className="max-w-5xl mx-auto">
        <motion.div variants={stagger(0.09)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          <motion.div variants={fadeUp} className="text-center mb-8 sm:mb-14">
            <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: TEAL }}>The Process</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">Four Steps. Zero Guesswork.</h2>
            <p className="mt-3 text-sm sm:text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              A result that actually changes outcomes.
            </p>
          </motion.div>

          <motion.div variants={stagger(0.1)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, background: "rgba(255,255,255,0.08)" }}
                className="flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ background: BLUE }}>
                    {step.icon}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: TEAL }}>{step.num}</p>
                  <h3 className="font-bold text-base sm:text-lg mb-1.5 text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{step.desc}</p>
                </div>
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
      { l: "Free CV Check",  h: "/cv-check"      },
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
      <CVCheckerSection />
      <HowItWorksSection />
      <CVStudioHighlight />
      <InterviewPrepHighlight />
      <FinalCTA />
      <Footer />
    </main>
  );
}
