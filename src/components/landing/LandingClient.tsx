"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Lock, Zap, Eye,
  AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, FileText, Sparkles, Search,
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
type IssueType = "error" | "warn" | "ok";
interface Issue { type: IssueType; label: string }
interface BarData { label: string; score: number }
interface RoleProfile {
  category: string;
  filename: string;
  score: number;
  label: string;       // e.g. "Needs Work"
  labelColor: string;
  ringColor: string;
  bars: BarData[];
  issues: Issue[];
  nudge: string;
}

const PROFILES: Record<string, RoleProfile> = {
  tech: {
    category: "Software / Engineering",
    filename: "software_engineer_cv.pdf",
    score: 27,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 40 },
      { label: "Impact",      score: 22 },
      { label: "Readability", score: 65 },
      { label: "Keywords",    score: 31 },
    ],
    issues: [
      { type: "error", label: "No GitHub / portfolio link found"       },
      { type: "error", label: "Tech stack buried on page 2"            },
      { type: "error", label: "Zero quantified delivery metrics"       },
      { type: "warn",  label: "System design experience unclear"       },
      { type: "warn",  label: "Missing cloud / DevOps keywords"        },
      { type: "ok",    label: "Education & certifications listed"      },
    ],
    nudge: "Common issues found in Software Engineer CVs. Upload yours to see exactly what's missing.",
  },
  marketing: {
    category: "Marketing / Growth",
    filename: "marketing_manager_cv.pdf",
    score: 31,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 35 },
      { label: "Impact",      score: 28 },
      { label: "Readability", score: 58 },
      { label: "Keywords",    score: 41 },
    ],
    issues: [
      { type: "error", label: "No campaign ROI or growth metrics"      },
      { type: "error", label: "Missing CRM tools (HubSpot, Salesforce)"},
      { type: "error", label: "Personal brand summary too generic"     },
      { type: "warn",  label: "No channel strategy highlighted"        },
      { type: "warn",  label: "SEO / paid media keywords absent"       },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Common issues found in Marketing CVs. Upload yours to see exactly what's missing.",
  },
  design: {
    category: "Design / Creative",
    filename: "ux_designer_cv.pdf",
    score: 26,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 33 },
      { label: "Impact",      score: 20 },
      { label: "Readability", score: 62 },
      { label: "Keywords",    score: 29 },
    ],
    issues: [
      { type: "error", label: "Portfolio / Behance link missing"       },
      { type: "error", label: "Tool stack not listed (Figma, Adobe)"   },
      { type: "error", label: "No client or project outcomes stated"   },
      { type: "warn",  label: "Design process not described"           },
      { type: "warn",  label: "Accessibility / UX research absent"     },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Common issues found in Design CVs. Upload yours to see exactly what's missing.",
  },
  finance: {
    category: "Finance / Accounting",
    filename: "finance_analyst_cv.pdf",
    score: 33,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 42 },
      { label: "Impact",      score: 29 },
      { label: "Readability", score: 60 },
      { label: "Keywords",    score: 38 },
    ],
    issues: [
      { type: "error", label: "No P&L or portfolio size mentioned"     },
      { type: "error", label: "Missing certifications (CFA, CPA, ACA)" },
      { type: "error", label: "Achievement bullets too task-focused"   },
      { type: "warn",  label: "GAAP / IFRS terminology absent"         },
      { type: "warn",  label: "Soft skills overshadow hard numbers"    },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Common issues found in Finance CVs. Upload yours to see exactly what's missing.",
  },
  sales: {
    category: "Sales / Business Dev",
    filename: "sales_executive_cv.pdf",
    score: 30,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 38 },
      { label: "Impact",      score: 25 },
      { label: "Readability", score: 64 },
      { label: "Keywords",    score: 36 },
    ],
    issues: [
      { type: "error", label: "Quota attainment % never mentioned"     },
      { type: "error", label: "No deal size or revenue figures"        },
      { type: "error", label: "CRM proficiency not listed"             },
      { type: "warn",  label: "Territory / sector experience vague"    },
      { type: "warn",  label: "Missing pipeline management keywords"   },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Common issues found in Sales CVs. Upload yours to see exactly what's missing.",
  },
  hr: {
    category: "HR / People Ops",
    filename: "hr_manager_cv.pdf",
    score: 30,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 37 },
      { label: "Impact",      score: 24 },
      { label: "Readability", score: 63 },
      { label: "Keywords",    score: 33 },
    ],
    issues: [
      { type: "error", label: "No hiring volume or time-to-fill data"  },
      { type: "error", label: "HRIS systems not listed"                },
      { type: "error", label: "DEI or culture initiatives absent"      },
      { type: "warn",  label: "Employment law knowledge not shown"     },
      { type: "warn",  label: "L&D impact metrics missing"             },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Common issues found in HR CVs. Upload yours to see exactly what's missing.",
  },
  management: {
    category: "Management / Operations",
    filename: "operations_manager_cv.pdf",
    score: 32,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 43 },
      { label: "Impact",      score: 27 },
      { label: "Readability", score: 61 },
      { label: "Keywords",    score: 40 },
    ],
    issues: [
      { type: "error", label: "Team size never mentioned"              },
      { type: "error", label: "Budget responsibility absent"           },
      { type: "error", label: "Strategic initiatives not highlighted"  },
      { type: "warn",  label: "KPI / OKR framework not referenced"    },
      { type: "warn",  label: "Cross-functional leadership unclear"    },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Common issues found in Management CVs. Upload yours to see exactly what's missing.",
  },
  healthcare: {
    category: "Healthcare / Medical",
    filename: "healthcare_professional_cv.pdf",
    score: 35,
    label: "Needs Work",
    labelColor: "#f59e0b",
    ringColor: "#f59e0b",
    bars: [
      { label: "ATS Score",   score: 45 },
      { label: "Impact",      score: 31 },
      { label: "Readability", score: 63 },
      { label: "Keywords",    score: 42 },
    ],
    issues: [
      { type: "error", label: "Certifications not prominently placed"  },
      { type: "error", label: "No patient outcome or volume data"      },
      { type: "warn",  label: "Specialisation keywords too sparse"     },
      { type: "warn",  label: "Publication / research history absent"  },
      { type: "warn",  label: "Continuing education not listed"        },
      { type: "ok",    label: "Qualifications correctly formatted"     },
    ],
    nudge: "Common issues found in Healthcare CVs. Upload yours to see exactly what's missing.",
  },
  education: {
    category: "Education / Teaching",
    filename: "teacher_cv.pdf",
    score: 34,
    label: "Needs Work",
    labelColor: "#f59e0b",
    ringColor: "#f59e0b",
    bars: [
      { label: "ATS Score",   score: 44 },
      { label: "Impact",      score: 30 },
      { label: "Readability", score: 67 },
      { label: "Keywords",    score: 39 },
    ],
    issues: [
      { type: "error", label: "No student outcome or results data"     },
      { type: "error", label: "Curriculum development not described"   },
      { type: "warn",  label: "Teaching certifications not prominent"  },
      { type: "warn",  label: "Publication record absent"              },
      { type: "warn",  label: "Tech / EdTech tools not mentioned"      },
      { type: "ok",    label: "Qualifications correctly listed"        },
    ],
    nudge: "Common issues found in Teaching CVs. Upload yours to see exactly what's missing.",
  },
  default: {
    category: "",
    filename: "your_cv.pdf",
    score: 29,
    label: "Needs Work",
    labelColor: "#ef4444",
    ringColor: "#ef4444",
    bars: [
      { label: "ATS Score",   score: 38 },
      { label: "Impact",      score: 22 },
      { label: "Readability", score: 61 },
      { label: "Keywords",    score: 44 },
    ],
    issues: [
      { type: "error", label: "Weak summary statement"                 },
      { type: "error", label: "No quantified results"                  },
      { type: "warn",  label: "Poor ATS keyword match"                 },
      { type: "error", label: "Generic skills section"                 },
      { type: "warn",  label: "Formatting inconsistencies"             },
      { type: "ok",    label: "Education correctly listed"             },
    ],
    nudge: "Upload your CV to see your real personalised score.",
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

// ─── Score Mockup ─────────────────────────────────────────────────────────────
function ScoreMockup({ jobTitle }: { jobTitle: string }) {
  const profile  = useMemo(() => jobTitle.trim().length >= 3 ? detectProfile(jobTitle) : PROFILES.default, [jobTitle]);
  const [animated, setAnimated] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // Re-animate whenever profile changes
  useEffect(() => {
    if (!inView) return;
    setAnimated(false);
    const t = setTimeout(() => {
      setAnimated(true);
      setProfileKey(k => k + 1);
    }, 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, inView]);

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 300);
  }, [inView]);

  const circumference = 2 * Math.PI * 27;
  const barColor = (score: number) => score >= 60 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div ref={ref} className="relative w-full max-w-[360px] mx-auto lg:mx-0">
      {/* Glow */}
      <div className="absolute inset-4 rounded-3xl blur-2xl opacity-10 pointer-events-none"
        style={{ background: profile.ringColor }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: ez }}
        className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0 pr-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={profile.category || "default-cat"}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                    {profile.category ? `${profile.category} Analysis` : "CV Analysis"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate">{profile.filename}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Circular score */}
            <div className="text-center shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <motion.circle
                    key={`ring-${profileKey}`}
                    cx="32" cy="32" r="27" fill="none"
                    stroke={profile.ringColor} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={animated ? { strokeDashoffset: circumference * (1 - profile.score / 100) } : {}}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`score-${profileKey}`}
                      className="text-xl font-black leading-none text-slate-900"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >{profile.score}</motion.span>
                  </AnimatePresence>
                  <span className="text-[9px] text-slate-400 font-bold">/100</span>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: profile.labelColor }}>
                {profile.label}
              </span>
            </div>
          </div>

          {/* Bars */}
          <div className="space-y-2">
            {profile.bars.map(({ label, score }, i) => {
              const color = barColor(score);
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      key={`bar-${profileKey}-${i}`}
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={animated ? { width: `${score}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-6 text-right" style={{ color }}>{score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Issues Found</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={`issues-${profileKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              {profile.issues.map(({ type, label }) => {
                const cfg = type === "error"
                  ? { icon: <XCircle size={13} />, color: "#ef4444", bg: "#fef2f2" }
                  : type === "warn"
                    ? { icon: <AlertTriangle size={13} />, color: "#f59e0b", bg: "#fffbeb" }
                    : { icon: <CheckCircle2 size={13} />, color: "#22c55e", bg: "#f0fdf4" };
                return (
                  <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: cfg.bg }}>
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="text-[11px] font-semibold text-slate-700">{label}</span>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nudge */}
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`nudge-${profileKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-3 text-center"
              style={{ background: `rgba(255,117,31,0.06)`, border: `1px solid rgba(255,117,31,0.15)` }}
            >
              <p className="text-[11px] font-black text-slate-700 mb-0.5">
                {jobTitle.trim().length >= 3 ? `Personalised for ${jobTitle.trim()}` : "Your results are ready"}
              </p>
              <p className="text-[10px] text-slate-500">{profile.nudge}</p>
            </motion.div>
          </AnimatePresence>
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
        {jobTitle.trim().length >= 3 && (
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const router   = useRouter();
  const supabase = createClient();
  const [jobTitle, setJobTitle] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");

  // Debounce job title updates to the mockup (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(jobTitle), 300);
    return () => clearTimeout(t);
  }, [jobTitle]);

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCTA();
  }, [handleCTA]);

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

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-7 max-w-md mx-auto lg:mx-0"
            >
              Check your CV free in 60 seconds.
              Get instant ATS + recruiter feedback.
            </motion.p>

            {/* Job title input — personalises the mockup */}
            <motion.div variants={fadeUp} className="mb-5 max-w-sm mx-auto lg:mx-0">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Enter your job title for a personalised preview
              </label>
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3.5 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Software Engineer, Nurse, Teacher…"
                  className="w-full pl-9 pr-4 py-3 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:bg-white transition-all placeholder:text-slate-300"
                />
              </div>
              {jobTitle.trim().length >= 3 && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-slate-400 mt-1.5 font-medium"
                >
                  ✓ Preview updated for <span className="font-bold text-slate-600">{jobTitle.trim()}</span>
                </motion.p>
              )}
            </motion.div>

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

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-5 justify-center lg:justify-start"
            >
              {[
                { icon: <Lock size={13} />,  label: "Secure upload"   },
                { icon: <Eye size={13} />,   label: "No payment"      },
                { icon: <Zap size={13} />,   label: "Instant results" },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <span className="text-slate-300">{icon}</span>
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: ez, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <ScoreMockup jobTitle={debouncedTitle} />
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
            { value: "10,000+", label: "CVs analysed"    },
            { value: "30+",     label: "Countries"        },
            { value: "60s",     label: "To get results"   },
            { value: "Free",    label: "No card required" },
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
          <p className="text-xs text-slate-400 mt-3 font-medium">
            No payment required. Preview results before you pay for anything.
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
    "ATS compatibility score",
    "Impact language analysis",
    "Keyword gap report",
    "Formatting audit",
    "AI-rewritten version ready to download",
    "Cover letter (Professional plan)",
    "Interview question prep (Full plan)",
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
          {items.map((label) => (
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
            <Image src="/fusecv-logo.png" alt="FuseCV" width={80} height={24}
              className="object-contain brightness-0 invert opacity-60" />
          </Link>
          <div className="flex flex-wrap justify-center gap-5 text-xs font-medium"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <Link href="/"           className="hover:text-white transition-colors">Home</Link>
            <Link href="/executive"  className="hover:text-white transition-colors">Executive CV</Link>
            <Link href="/login"      className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register"   className="hover:text-white transition-colors">Sign Up Free</Link>
            <Link href={`${SITE_URL}/privacy`} className="hover:text-white transition-colors">Privacy</Link>
            <Link href={`${SITE_URL}/terms`}   className="hover:text-white transition-colors">Terms</Link>
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
    </main>
  );
}
