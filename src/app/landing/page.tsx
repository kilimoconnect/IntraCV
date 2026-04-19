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
  TrendingUp, Users, Award, Layers, ChevronRight, X,
  BarChart2, Lock, RefreshCw, Briefcase,
} from "lucide-react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BLUE   = "#004aad";
const ORANGE = "#ff751f";
const TEAL   = "#00c4cc";

// ─── Motion Variants ─────────────────────────────────────────────────────────
type BezierEase = [number, number, number, number];
const bez: BezierEase = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: bez } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5 } },
};
const stagger = (delay = 0.08): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: delay } },
});
const slideRight: Variants = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: bez } },
};
const slideLeft: Variants = {
  hidden: { opacity: 0, x: 30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: bez } },
};

// ─── Count-Up Hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1.8) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv   = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  useEffect(() => {
    if (inView) mv.set(target);
  }, [inView, target, mv]);

  return { ref, display };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleCTA = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/register");
  }, [router, supabase]);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/landing" className="flex items-center">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={110} height={36} className="object-contain" priority />
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#004aad] transition-colors">How it works</button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#004aad] transition-colors">Features</button>
          <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#004aad] transition-colors">FAQ</button>
          <Link href="/login" className="hover:text-[#004aad] transition-colors">Sign in</Link>
        </div>
        <motion.button
          onClick={handleCTA}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-[#ff751f] hover:bg-[#e8661a] text-white text-sm font-bold px-5 py-2 rounded-xl shadow-md transition-colors"
        >
          Improve My CV Free
        </motion.button>
      </div>
    </motion.nav>
  );
}

// ─── CV Mockup (Hero visual) ──────────────────────────────────────────────────
function CVMockup() {
  return (
    <div className="w-full font-sans bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-[38%] flex-shrink-0 p-5" style={{ background: BLUE }}>
          <div className="pb-3 mb-3 border-b border-white/20">
            <div className="text-sm font-bold text-white leading-tight">James Mitchell</div>
            <div className="text-[10px] text-white/80 mt-0.5">Senior Marketing Manager</div>
          </div>
          {[["Contact", ["j.mitchell@email.com", "+44 7700 900 123", "London, UK"]], ["Skills", ["Brand Strategy", "Digital Marketing", "Campaign Mgmt", "Data Analytics"]]].map(([label, items]) => (
            <div key={label as string} className="mb-3">
              <div className="text-[7px] font-bold uppercase tracking-widest mb-1.5" style={{ color: TEAL }}>{label as string}</div>
              {(items as string[]).map((item) => (
                <div key={item} className="text-[8px] text-white/80 leading-4">{item}</div>
              ))}
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="flex-1 p-5">
          <div className="mb-3">
            <div className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: BLUE }}>Summary</div>
            <div className="h-px bg-slate-200 mb-2" />
            <div className="text-[8px] leading-4 text-slate-600">Results-driven Senior Marketing Manager with 9+ years delivering high-impact campaigns. Generated £4.1M in attributable revenue in FY2023 through targeted demand-gen programmes.</div>
          </div>
          <div className="mb-3">
            <div className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: BLUE }}>Experience</div>
            <div className="h-px bg-slate-200 mb-2" />
            {[
              { role: "Senior Marketing Manager", co: "TechVentures Ltd", date: "2020–Present", bullets: ["Led team of 8 marketers, +42% pipeline YoY", "Managed £2.4M budget across all channels", "Launched demand-gen driving 31% revenue growth"] },
              { role: "Marketing Manager", co: "BrightScale Agency", date: "2017–2020",  bullets: ["Managed campaigns for 12 enterprise clients", "Grew social engagement avg 68% per client"] },
            ].map((e) => (
              <div key={e.role} className="mb-2.5 pl-2 border-l-2" style={{ borderColor: BLUE }}>
                <div className="flex justify-between">
                  <span className="text-[8px] font-bold text-slate-800">{e.role}</span>
                  <span className="text-[7px] text-slate-400">{e.date}</span>
                </div>
                <div className="text-[7.5px] font-semibold mb-1" style={{ color: BLUE }}>{e.co}</div>
                {e.bullets.map((b) => <div key={b} className="text-[7px] text-slate-600 leading-3.5 mb-0.5">• {b}</div>)}
              </div>
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

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-14" style={{ background: "#080f1e" }}>
      {/* Gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BLUE}55 0%, transparent 70%)` }} />
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${TEAL}44 0%, transparent 70%)` }} />
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(ellipse, ${ORANGE}20 0%, transparent 65%)` }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — Copy */}
        <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: `${TEAL}40`, background: `${TEAL}12`, color: TEAL }}>
            <Sparkles size={12} />
            <span>AI-Powered · Trusted by thousands worldwide</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] tracking-tight text-white mb-5">
            Your CV is costing you{" "}
            <span className="relative inline-block">
              <span style={{ color: ORANGE }}>interviews</span>
              <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <motion.path d="M2 6 C50 2 150 2 198 6" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 1 }} />
              </motion.svg>
            </span>
            <br />
            <span style={{ color: TEAL }}>Fix it in 60 seconds</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={fadeUp} className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
            Upload your CV and AI rewrites it — ATS-optimised, professionally formatted, tailored to the job. 75% of CVs never reach a human. Make sure yours does.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10">
            <motion.button onClick={handleCTA} whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${ORANGE}55` }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-base transition-all"
              style={{ background: ORANGE }}>
              <Upload size={18} />
              Upload My CV Free
              <ArrowRight size={16} />
            </motion.button>
            <motion.button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-300 text-base border border-white/10 hover:border-white/25 transition-all">
              See how it works
              <ChevronDown size={16} />
            </motion.button>
          </motion.div>

          {/* Trust row */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { icon: <Shield size={13} />, text: "No card required" },
              { icon: <Globe size={13} />, text: "Works for all countries" },
              { icon: <Clock size={13} />, text: "Ready in 60 seconds" },
              { icon: <Lock size={13} />, text: "Your data stays private" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span style={{ color: TEAL }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — CV Mockup */}
        <motion.div style={{ y: heroY }} variants={slideLeft} initial="hidden" animate="show"
          className="relative hidden lg:block">
          {/* Floating badges */}
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-5 -left-6 z-10 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#059669" }}>
              <CheckCircle2 size={14} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-800">ATS Score</div>
              <div className="text-[10px] font-semibold" style={{ color: "#059669" }}>94 / 100 ↑</div>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -right-4 z-10 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100">
            <Zap size={14} style={{ color: ORANGE }} />
            <div className="text-[10px] font-bold text-slate-800">AI Rewriting...</div>
          </motion.div>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-1/2 -right-8 z-10 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <div className="text-[10px] font-bold text-slate-800">Interview invite!</div>
          </motion.div>

          {/* Glow behind card */}
          <div className="absolute inset-0 rounded-2xl blur-2xl scale-95" style={{ background: `linear-gradient(135deg, ${BLUE}44, ${TEAL}33)` }} />
          <div className="relative">
            <CVMockup />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
        <ChevronDown size={16} className="text-white/30" />
      </motion.div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, display } = useCountUp(value);
  return (
    <motion.div variants={fadeUp} ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: BLUE }}>
        {display.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
    </motion.div>
  );
}

function StatsBar() {
  const stats = [
    { value: 50000, suffix: "+", label: "CVs Improved" },
    { value: 94,    suffix: "%", label: "ATS Pass Rate" },
    { value: 60,    suffix: "s", label: "Average Time" },
    { value: 30,    suffix: "+", label: "Countries" },
  ];

  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => <StatItem key={s.label} {...s} />)}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pain Section ─────────────────────────────────────────────────────────────
function PainSection() {
  const pains = [
    { icon: <X size={16} className="text-red-500" />, text: "Spending hours rewriting your CV for every job" },
    { icon: <X size={16} className="text-red-500" />, text: "Not hearing back despite sending dozens of applications" },
    { icon: <X size={16} className="text-red-500" />, text: "ATS software rejecting your CV before any human sees it" },
    { icon: <X size={16} className="text-red-500" />, text: "Generic CVs that don't match the job description" },
    { icon: <X size={16} className="text-red-500" />, text: "Not knowing if your layout or content is the problem" },
    { icon: <X size={16} className="text-red-500" />, text: "Watching less-qualified candidates get the interviews" },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>
              The Problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sound familiar?
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              75% of CVs are rejected by ATS before a recruiter sees them. The issue is rarely your experience — it is how your CV is written.
            </p>
          </motion.div>

          <motion.div variants={stagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            {pains.map(({ icon, text }) => (
              <motion.div key={text} variants={fadeUp}
                className="flex items-start gap-3 bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <span className="text-sm text-slate-700 font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0066cc)` }}>
            <div className="text-xl font-bold mb-2">FuseCV fixes all of this — automatically.</div>
            <p className="text-blue-100 text-sm">Upload your CV and AI rewrites, reformats and optimises it for every job in under 60 seconds.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Before / After ───────────────────────────────────────────────────────────
function BeforeAfterSection() {
  const before = [
    "Responsible for marketing activities",
    "Worked with the sales team",
    "Managed social media accounts",
    "Helped with content creation",
  ];
  const after = [
    "Led demand-gen programme generating £4.1M ARR in FY2023",
    "Aligned with Sales to reduce average sales cycle by 18%",
    "Grew social following from 8K to 34K with 68% engagement lift",
    "Built content engine that drove 42% YoY pipeline growth",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${BLUE}12`, color: BLUE }}>
              Transformation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              See the difference AI makes
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              The same experience. Completely different impact. One gets filtered out. The other gets the interview.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <motion.div variants={slideRight} className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"><X size={11} className="text-white" /></div>
                <span className="font-bold text-red-600 text-sm">Before FuseCV</span>
                <span className="ml-auto text-xs font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">ATS Score: 31%</span>
              </div>
              <div className="space-y-3">
                {before.map((b) => (
                  <div key={b} className="flex items-start gap-2.5 text-sm text-red-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="italic">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-red-200 text-xs text-red-500 font-medium">
                Rejected by ATS — no human ever reads it
              </div>
            </motion.div>

            {/* After */}
            <motion.div variants={slideLeft} className="rounded-2xl border-2 p-6" style={{ borderColor: `${TEAL}60`, background: `${TEAL}08` }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#059669" }}>
                  <CheckCircle2 size={11} className="text-white" />
                </div>
                <span className="font-bold text-sm" style={{ color: "#059669" }}>After FuseCV</span>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: "#059669", background: "#d1fae5" }}>ATS Score: 94%</span>
              </div>
              <div className="space-y-3">
                {after.map((a) => (
                  <div key={a} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: TEAL }} />
                    <span className="font-medium">{a}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t text-xs font-medium" style={{ borderColor: `${TEAL}30`, color: "#059669" }}>
                Passes ATS · shortlisted within 48 hours
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { n: "01", icon: <Upload size={22} />, title: "Upload your CV", body: "Paste a PDF, Word doc or start from scratch. AI reads every section in seconds — no manual data entry." },
    { n: "02", icon: <Target size={22} />, title: "Paste the job description", body: "Found a role? Add the job description and AI tailors your CV to match exactly what the recruiter is looking for." },
    { n: "03", icon: <Sparkles size={22} />, title: "AI rewrites and optimises", body: "Your CV is rewritten with impact-focused language, ATS-friendly formatting and the right keywords — automatically." },
    { n: "04", icon: <FileText size={22} />, title: "Download and apply", body: "Get a polished PDF ready to send. Repeat for every role — each application perfectly tailored, in under 60 seconds." },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${ORANGE}15`, color: ORANGE }}>
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              From upload to interview in 4 steps
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              No CV writing experience needed. No hours spent reformatting. Just results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(({ n, icon, title, body }, i) => (
              <motion.div key={n} variants={fadeUp} custom={i}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-300 relative">
                <div className="absolute top-4 right-4 text-5xl font-black select-none" style={{ color: `${BLUE}08` }}>{n}</div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-white" style={{ background: BLUE }}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: <Zap size={20} />, color: ORANGE, title: "ATS Optimisation", body: "AI scans your CV against ATS algorithms and adds the right keywords — so your application actually gets seen." },
    { icon: <Target size={20} />, color: BLUE, title: "Job Tailoring", body: "Paste any job description and your CV is rewritten to match it perfectly. Every application stands out." },
    { icon: <FileText size={20} />, color: TEAL, title: "Cover Letter Generator", body: "A compelling, job-specific cover letter written alongside your CV — in seconds." },
    { icon: <BarChart2 size={20} />, color: "#7c3aed", title: "CV Scoring & Feedback", body: "Instant ATS score, section-by-section feedback and specific suggestions to improve every part of your CV." },
    { icon: <Briefcase size={20} />, color: "#dc2626", title: "Interview Prep", body: "Role-specific interview questions and model answers based on the job you applied for." },
    { icon: <RefreshCw size={20} />, color: "#059669", title: "Unlimited Rewrites", body: "Apply to as many roles as you want. Every version of your CV is saved and accessible in your dashboard." },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${TEAL}12`, color: TEAL }}>
              Everything you need
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              One tool. Your entire job search.
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Everything from CV writing to interview prep — built for modern job seekers in a competitive market.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, color, title, body }) => (
              <motion.div key={title} variants={fadeUp} whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.09)" }}
                className="rounded-2xl p-6 border border-slate-100 bg-white shadow-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white" style={{ background: color }}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah K.", role: "Software Engineer → Google", text: "I had been applying for 3 months with no callbacks. After FuseCV rewrote my CV, I had 4 interview invites in 2 weeks. The ATS optimisation was the game changer.", stars: 5 },
    { name: "James O.", role: "Marketing Manager, Lagos", text: "The before and after difference was shocking. My old CV was generic — the new one actually showed my impact with real numbers. Got the job I wanted.", stars: 5 },
    { name: "Priya M.", role: "Graduate, University of Delhi", text: "As a fresh graduate with no work experience, I didn't know what to put on my CV. FuseCV helped me structure everything and write it professionally. Three internship offers.", stars: 5 },
    { name: "David L.", role: "Finance Manager, London", text: "Worth every penny. The job-tailoring feature means I can apply to roles confidently knowing my CV matches exactly what they're asking for. Highly recommend.", stars: 5 },
    { name: "Amina B.", role: "Nurse, NHS", text: "So easy to use and the results were professional and polished. My ward manager said it was the best application she'd received in months.", stars: 5 },
    { name: "Kwame A.", role: "Product Manager, Accra", text: "I tried three other CV tools. FuseCV is the only one that actually made my CV read like a senior PM's. The metrics framing advice alone is worth it.", stars: 5 },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Star size={11} className="fill-amber-500" /> Real results
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Job seekers who got interviews
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Used by professionals across 30+ countries — from graduates to executives.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }) => (
              <motion.div key={name} variants={fadeUp} whileHover={{ y: -3 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
                <div className="border-t border-slate-100 pt-4">
                  <div className="font-bold text-slate-900 text-sm">{name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Is FuseCV free to use?", a: "Yes — you can upload your CV, get your AI analysis and see your improved version for free. Downloading the final PDF requires a one-time payment. No subscriptions, no hidden fees." },
    { q: "Does FuseCV really pass ATS systems?", a: "Yes. FuseCV's AI is trained specifically on ATS parsing logic. It adds the right keywords, formats sections correctly, and removes common elements that cause ATS rejection — like tables, columns, headers and footers in the wrong format." },
    { q: "How long does it take?", a: "Under 60 seconds for most CVs. Upload, paste a job description, and your tailored, ATS-optimised CV is ready to download." },
    { q: "Is my CV data safe?", a: "Yes. Your CV is processed securely and never shared with third parties. You can delete your account and all associated data at any time from your dashboard." },
    { q: "Does it work for all industries and countries?", a: "FuseCV works for any industry and all English-language job markets — UK, USA, Australia, Canada, UAE, India, Nigeria, Kenya, Singapore and more. Country-specific formatting conventions are applied automatically." },
    { q: "What if I don't have much experience?", a: "FuseCV works especially well for graduates and career changers. It helps you identify transferable skills, frame academic projects professionally, and write bullet points that highlight what you do have rather than apologising for what you don't." },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${BLUE}10`, color: BLUE }}>
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Common questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div key={q} variants={fadeUp}
                className="rounded-2xl border border-slate-200 overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left bg-white hover:bg-slate-50 transition-colors">
                  <span className="font-semibold text-slate-900 text-sm">{q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                    <ChevronDown size={16} className="text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                      <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                        {a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
    <section className="py-24 relative overflow-hidden" style={{ background: "#080f1e" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: BLUE }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: TEAL }} />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${TEAL}40`, background: `${TEAL}12`, color: TEAL }}>
            <Sparkles size={11} /> Start for free today
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Stop losing interviews<br />to a bad CV
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Thousands of job seekers across 30+ countries have used FuseCV to land interviews at companies they love. Upload your CV and see the difference in 60 seconds.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button onClick={handleCTA} whileHover={{ scale: 1.04, boxShadow: `0 0 40px ${ORANGE}55` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base"
              style={{ background: ORANGE }}>
              <Upload size={18} />
              Upload My CV — It&apos;s Free
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
            {["No credit card required", "Results in 60 seconds", "Used in 30+ countries"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: TEAL }} />
                {t}
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
    Product:  [{ l: "How it works", h: "#how-it-works" }, { l: "Features", h: "#features" }, { l: "Guides", h: "/guides" }, { l: "FAQ", h: "#faq" }],
    Account:  [{ l: "Sign up free", h: "/register" }, { l: "Sign in", h: "/login" }, { l: "Dashboard", h: "/dashboard" }],
    Legal:    [{ l: "Privacy Policy", h: "/privacy" }],
  };

  return (
    <footer className="bg-slate-900 border-t border-white/5 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 sm:col-span-1">
            <Image src="/fusecv-logo.png" alt="FuseCV" width={100} height={32} className="object-contain mb-3 brightness-0 invert" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">
              AI-powered CV builder for job seekers worldwide. ATS-optimised in 60 seconds.
            </p>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{section}</div>
              <ul className="space-y-2.5">
                {items.map(({ l, h }) => (
                  <li key={l}>
                    <Link href={h} className="text-sm text-slate-500 hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} FuseCV. All rights reserved.</span>
          <span>Built for job seekers in 30+ countries worldwide.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <PainSection />
      <BeforeAfterSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
