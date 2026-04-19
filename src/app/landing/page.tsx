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
  GraduationCap, TrendingUp, Repeat2, Trophy, Heart,
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
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv     = useMotionValue(0);
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
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/landing" className="flex items-center">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={110} height={36} className="object-contain" priority />
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#004aad] transition-colors">How it works</button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#004aad] transition-colors">Features</button>
          <Link href="/guides" className="hover:text-[#004aad] transition-colors">Guides</Link>
          <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#004aad] transition-colors">FAQ</button>
          <Link href="/login" className="hover:text-[#004aad] transition-colors">Sign in</Link>
        </div>
        <motion.button
          onClick={handleCTA}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-[#ff751f] hover:bg-[#e8661a] text-white text-sm font-bold px-5 py-2 rounded-xl shadow-md transition-colors"
        >
          Upload My CV Free
        </motion.button>
      </div>
    </motion.nav>
  );
}

// ─── Hero CV Mockup (compact, used in hero) ───────────────────────────────────
function CVMockup() {
  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="flex">
        <div className="w-[38%] flex-shrink-0 p-4 sm:p-5" style={{ background: BLUE }}>
          <div className="pb-3 mb-3 border-b border-white/20">
            <div className="text-xs sm:text-sm font-bold text-white leading-tight">James Mitchell</div>
            <div className="text-[9px] sm:text-[10px] text-white/80 mt-0.5">Senior Marketing Manager</div>
          </div>
          {[
            ["Contact", ["j.mitchell@email.com", "+44 7700 900 123", "London, UK"]],
            ["Skills", ["Brand Strategy", "Digital Marketing", "Campaign Mgmt", "Data Analytics"]],
          ].map(([label, items]) => (
            <div key={label as string} className="mb-3">
              <div className="text-[7px] font-bold uppercase tracking-widest mb-1.5" style={{ color: TEAL }}>{label as string}</div>
              {(items as string[]).map((item) => (
                <div key={item} className="text-[8px] text-white/80 leading-4">{item}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 sm:p-5">
          <div className="mb-3">
            <div className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: BLUE }}>Summary</div>
            <div className="h-px bg-slate-200 mb-2" />
            <div className="text-[8px] leading-4 text-slate-600">Results-driven Senior Marketing Manager with 9+ years delivering high-impact campaigns. Generated £4.1M in attributable revenue in FY2023 through targeted demand-gen programmes.</div>
          </div>
          <div className="mb-3">
            <div className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: BLUE }}>Experience</div>
            <div className="h-px bg-slate-200 mb-2" />
            {[
              { role: "Senior Marketing Manager", co: "TechVentures Ltd", date: "2020–Present", bullets: ["Led team of 8 marketers, +42% pipeline YoY", "Managed £2.4M budget across all channels"] },
              { role: "Marketing Manager", co: "BrightScale Agency", date: "2017–2020", bullets: ["Grew social engagement avg 68% per client"] },
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

// ─── Full Optimized CV (used in transformation section) ───────────────────────
function FullOptimizedCV() {
  return (
    <div className="relative">
      {/* Floating ATS badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-3 z-20 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-emerald-200"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "#059669" }}>
          <CheckCircle2 size={12} className="text-white" />
        </div>
        <div>
          <div className="text-[9px] font-bold text-slate-800">ATS Score</div>
          <div className="text-[9px] font-extrabold" style={{ color: "#059669" }}>94 / 100 ↑</div>
        </div>
      </motion.div>

      {/* After FuseCV label */}
      <div className="absolute -top-4 left-4 z-20 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full text-white shadow-md"
        style={{ background: "#059669" }}>
        ✓ After FuseCV
      </div>

      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl blur-2xl scale-95 opacity-50"
        style={{ background: `linear-gradient(135deg, ${BLUE}33, ${TEAL}22)` }} />

      {/* CV body */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-300 bg-white">
        <div className="flex">

          {/* ── Sidebar ── */}
          <div className="w-[34%] sm:w-[32%] shrink-0 p-4 sm:p-5" style={{ background: BLUE }}>
            {/* Avatar initials */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-base sm:text-lg text-white border-2"
              style={{ background: `${TEAL}55`, borderColor: TEAL }}>
              JM
            </div>

            {[
              {
                heading: "Contact",
                items: ["j.mitchell@email.com", "+44 7700 900 123", "London, UK", "linkedin.com/in/jmitchell"],
              },
              {
                heading: "Key Skills",
                items: ["Demand Generation", "Brand Strategy", "Digital Marketing", "Budget Management", "Campaign Analytics", "Team Leadership", "Stakeholder Mgmt"],
              },
              {
                heading: "Education",
                items: ["BA Marketing", "University of Leeds", "2011–2014 · First Class"],
              },
            ].map(({ heading, items }) => (
              <div key={heading} className="mb-4">
                <div className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-[0.18em] mb-2" style={{ color: TEAL }}>
                  {heading}
                </div>
                {items.map((item) => (
                  <div key={item} className="text-[8px] sm:text-[9px] text-white/80 leading-[1.55]">{item}</div>
                ))}
              </div>
            ))}
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 p-4 sm:p-5 min-w-0">

            {/* Name & title */}
            <div className="pb-3 mb-4 border-b-2" style={{ borderColor: BLUE }}>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">James Mitchell</h2>
              <div className="text-[10px] sm:text-xs font-bold mt-0.5" style={{ color: BLUE }}>Senior Marketing Manager</div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <div className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-[0.15em] mb-1.5" style={{ color: BLUE }}>
                Professional Summary
              </div>
              <p className="text-[8px] sm:text-[9px] text-slate-600 leading-[1.6]">
                Results-driven Senior Marketing Manager with 9+ years delivering high-impact B2B campaigns. Generated{" "}
                <strong className="text-slate-800">£4.1M attributable revenue</strong> in FY2023 through integrated demand-gen strategies. Proven ability to align Marketing with Sales to accelerate pipeline and reduce cycle times.
              </p>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <div className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-[0.15em] mb-2.5" style={{ color: BLUE }}>
                Experience
              </div>
              {[
                {
                  role: "Senior Marketing Manager",
                  co: "TechVentures Ltd",
                  date: "Jan 2020 – Present",
                  bullets: [
                    "Led demand-gen programme generating £4.1M ARR in FY2023 — +42% pipeline YoY",
                    "Managed £2.4M multi-channel budget with 31% revenue growth attribution",
                    "Aligned with Sales to reduce average deal cycle by 18% via lead scoring",
                    "Built and led team of 8 marketers; improved team retention by 35%",
                  ],
                },
                {
                  role: "Marketing Manager",
                  co: "BrightScale Agency",
                  date: "Mar 2017 – Dec 2019",
                  bullets: [
                    "Scaled social audience from 8K → 34K across all client accounts — 68% engagement lift",
                    "Managed integrated campaigns for 12 enterprise clients worth £6.8M combined revenue",
                  ],
                },
              ].map((e) => (
                <div key={e.role} className="mb-3 pl-2.5 sm:pl-3 border-l-2" style={{ borderColor: BLUE }}>
                  <div className="flex items-start justify-between gap-2 mb-0.5 flex-wrap">
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-extrabold text-slate-900">{e.role}</div>
                      <div className="text-[8px] sm:text-[9px] font-semibold" style={{ color: BLUE }}>{e.co}</div>
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-slate-400 shrink-0">{e.date}</div>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {e.bullets.map((b) => (
                      <li key={b} className="text-[8px] sm:text-[9px] text-slate-600 leading-[1.5] flex items-start gap-1.5">
                        <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ background: TEAL }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Metric highlights */}
            <div>
              <div className="text-[7px] sm:text-[8px] font-extrabold uppercase tracking-[0.15em] mb-2" style={{ color: BLUE }}>
                Key Metrics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { n: "£4.1M", label: "ARR generated" },
                  { n: "+42%",  label: "Pipeline growth" },
                  { n: "34K",   label: "Audience built" },
                  { n: "−18%",  label: "Sales cycle" },
                ].map(({ n, label }) => (
                  <div key={label} className="rounded-lg px-2 py-1.5 text-center" style={{ background: `${BLUE}08` }}>
                    <div className="text-[10px] sm:text-xs font-extrabold" style={{ color: BLUE }}>{n}</div>
                    <div className="text-[7px] text-slate-500 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap"
          style={{ background: "#f0fdf4" }}>
          <span className="text-[8px] text-slate-500">Optimised by FuseCV · ATS-formatted · Ready to send</span>
          <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full text-white"
            style={{ background: "#059669" }}>
            ATS Score: 94 / 100 ✓
          </span>
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
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${BLUE}55 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${TEAL}44 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(ellipse, ${ORANGE}20 0%, transparent 65%)` }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left — Copy */}
        <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{ borderColor: `${TEAL}40`, background: `${TEAL}12`, color: TEAL }}
          >
            <Sparkles size={12} />
            <span>AI-Powered · Trusted by thousands worldwide</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] tracking-tight text-white mb-5"
          >
            Your CV Is Costing You{" "}
            <span className="relative inline-block">
              <span style={{ color: ORANGE }}>Interviews</span>
              <motion.svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <motion.path
                  d="M2 6 C50 2 150 2 198 6"
                  stroke={ORANGE}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 1 }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg">
            FuseCV transforms weak, generic CVs into recruiter-ready versions that show your real value, pass ATS systems, and help you win more interviews — in as little as 60 seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10">
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${ORANGE}55` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-base transition-all"
              style={{ background: ORANGE }}
            >
              <Upload size={18} />
              Upload My CV Free
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-300 text-base border border-white/10 hover:border-white/25 transition-all"
            >
              See How It Works
              <ChevronDown size={16} />
            </motion.button>
          </motion.div>

          {/* Trust bar */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { icon: <Shield size={13} />, text: "No credit card required" },
              { icon: <Lock size={13} />,   text: "Secure private upload" },
              { icon: <Globe size={13} />,  text: "Used in 30+ countries" },
              { icon: <CheckCircle2 size={13} />, text: "Preview before payment" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span style={{ color: TEAL }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — CV Mockup (visible on all screen sizes) */}
        <motion.div style={{ y: heroY }} variants={slideLeft} initial="hidden" animate="show"
          className="relative w-full max-w-sm mx-auto lg:max-w-none">

          {/* Before badge */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-5 left-3 sm:left-0 z-10 bg-white rounded-xl px-3 py-2 shadow-xl border border-red-100"
          >
            <div className="text-[9px] font-bold text-red-500 uppercase tracking-wide mb-0.5">Before FuseCV</div>
            <div className="text-[8px] text-slate-500">Generic · Weak wording · Low ATS</div>
          </motion.div>

          {/* After badge */}
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 right-3 sm:right-0 z-10 bg-white rounded-xl px-3 py-2 shadow-xl border border-emerald-100"
          >
            <div className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#059669" }}>After FuseCV</div>
            <div className="text-[8px] text-slate-500">Achievement-led · ATS-ready</div>
          </motion.div>

          {/* ATS score badge */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-1/3 -right-2 sm:right-0 lg:-right-6 z-10 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#059669" }}>
              <CheckCircle2 size={12} className="text-white" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-800">ATS Score</div>
              <div className="text-[9px] font-semibold" style={{ color: "#059669" }}>94 / 100 ↑</div>
            </div>
          </motion.div>

          <div className="absolute inset-0 rounded-2xl blur-2xl scale-95" style={{ background: `linear-gradient(135deg, ${BLUE}44, ${TEAL}33)` }} />
          <div className="relative"><CVMockup /></div>
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
        <ChevronDown size={16} className="text-white/30" />
      </motion.div>
    </section>
  );
}

// ─── Social Proof Strip ───────────────────────────────────────────────────────
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
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by Job Seekers Worldwide</p>
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => <StatItem key={s.label} {...s} />)}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Identity Section ─────────────────────────────────────────────────────────
function IdentitySection() {
  const personas = [
    { icon: <GraduationCap size={22} />, color: BLUE,    emoji: "🎓", title: "Students & Graduates",        body: "Stand out even with limited experience. Let your projects, skills and potential do the talking." },
    { icon: <Target size={22} />,        color: ORANGE,  emoji: "💼", title: "Job Seekers",                 body: "Turn silence into interviews. Get your CV past ATS and in front of the right people." },
    { icon: <TrendingUp size={22} />,    color: TEAL,    emoji: "📈", title: "Mid-Level Professionals",     body: "Position yourself for promotions and better roles. Show your impact in numbers, not duties." },
    { icon: <Repeat2 size={22} />,       color: "#7c3aed", emoji: "🔄", title: "Career Changers",           body: "Translate your existing experience into a new industry. Frame transferable skills with confidence." },
    { icon: <Trophy size={22} />,        color: "#d97706", emoji: "🏆", title: "Founders & Executives",     body: "Present leadership with authority and credibility. Senior CVs require a completely different approach." },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${BLUE}10`, color: BLUE }}>
              For Every Career Stage
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Built for Every Career Stage
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Whether you are just starting out or leading a team, FuseCV helps you present yourself at your best.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {personas.map(({ icon, color, emoji, title, body }, i) => (
              <motion.div key={title} variants={fadeUp} custom={i}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.09)" }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>
                    {icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
            {/* CTA card */}
            <motion.div variants={fadeUp}
              className="rounded-2xl p-6 text-white flex flex-col justify-between"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #0055cc)` }}>
              <div>
                <div className="text-2xl mb-3">✨</div>
                <h3 className="font-bold text-base mb-2">Whoever you are,<br />your CV can be better.</h3>
                <p className="text-blue-100 text-xs leading-relaxed">FuseCV adapts to your career level, industry and target role automatically.</p>
              </div>
              <Link href="/register" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white hover:text-blue-100 transition-colors">
                Get started free <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Problem Section ──────────────────────────────────────────────────────────
function ProblemSection() {
  const problems = [
    "Sounds generic and could apply to anyone",
    "Hides real achievements behind vague duties",
    "Lacks the recruiter keywords that get shortlisted",
    "Fails ATS screening before a human ever reads it",
    "Undersells years of valuable experience",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>
              The Problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Strong People Often Look Weak on Paper
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Most rejections are not about your ability. They happen because your CV is letting you down.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="space-y-3 mb-10">
              <p className="text-sm font-semibold text-slate-700 mb-4">Your CV might be getting rejected because it:</p>
              {problems.map((text) => (
                <motion.div key={text} variants={fadeUp}
                  className="flex items-start gap-3 bg-red-50 rounded-xl p-4 border border-red-100">
                  <X size={15} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">{text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}
              className="rounded-2xl p-7 text-center text-white"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #0066cc)` }}>
              <div className="text-lg font-bold mb-2">FuseCV fixes all of it — automatically.</div>
              <p className="text-blue-100 text-sm">Upload your CV and AI rewrites, reformats and optimises it in under 60 seconds.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Transformation Section ───────────────────────────────────────────────────
function TransformationSection() {
  const before = [
    "Responsible for marketing activities",
    "Worked with the sales team",
    "Managed social media accounts",
    "Helped with content creation",
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${BLUE}12`, color: BLUE }}>
              Transformation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Same Experience. Completely Different Outcome.
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              The words you use to describe your experience determine whether you get the interview. FuseCV gets it right.
            </p>
          </motion.div>

          {/* Layout: Before card left (compact) + Full optimized CV right (large) */}
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 items-start">

            {/* ── Before card ── */}
            <motion.div variants={slideRight} className="flex flex-col gap-5">
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X size={11} className="text-white" />
                  </div>
                  <span className="font-bold text-red-600 text-sm">Before FuseCV</span>
                  <span className="ml-auto text-xs font-semibold text-red-400 bg-red-100 px-2 py-0.5 rounded-full">ATS: 31%</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Experience bullets on CV:</p>
                <div className="space-y-2.5 mb-6">
                  {before.map((b) => (
                    <div key={b} className="flex items-start gap-2.5 text-sm text-red-700 bg-red-100/60 rounded-lg px-3 py-2">
                      <X size={12} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="italic leading-snug">{b}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-red-100 px-4 py-3 border border-red-200">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-red-500 mb-0.5">Outcome</div>
                  <div className="text-sm font-bold text-red-700">Rejected by ATS — never seen by a human</div>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center gap-3 justify-center">
                <div className="flex-1 h-px bg-slate-200" />
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <div className="text-xs font-bold uppercase tracking-widest">FuseCV rewrites this</div>
                  <ArrowRight size={18} className="lg:rotate-90" />
                </div>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Result callout */}
              <div className="rounded-2xl p-5 border-2 border-emerald-200 text-center" style={{ background: "#f0fdf4" }}>
                <div className="text-emerald-600 text-2xl mb-2">🎯</div>
                <div className="font-extrabold text-emerald-800 text-sm mb-1">Shortlisted. Interview-ready.</div>
                <div className="text-xs text-emerald-600">ATS passes it · recruiter reads it · you get the call</div>
              </div>
            </motion.div>

            {/* ── After: Full optimized CV ── */}
            <motion.div variants={slideLeft} className="pt-6 lg:pt-0">
              <FullOptimizedCV />
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
    { n: "01", icon: <Upload size={22} />, title: "Upload Your CV", body: "PDF, Word doc, or start from scratch. AI reads every section instantly — no manual data entry needed." },
    { n: "02", icon: <Target size={22} />, title: "Add the Job Description", body: "Paste any role you want to apply for. AI tailors your CV to match exactly what the recruiter is looking for." },
    { n: "03", icon: <Sparkles size={22} />, title: "AI Rewrites Everything", body: "Better wording, ATS optimisation, stronger structure — your CV is transformed automatically in seconds." },
    { n: "04", icon: <FileText size={22} />, title: "Download & Apply", body: "Your tailored, recruiter-ready version is ready in minutes. Repeat for every role without starting over." },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${ORANGE}15`, color: ORANGE }}>
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              From Upload to Interview in 4 Steps
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

// ─── Features Section ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: <Zap size={20} />,      color: ORANGE,    title: "ATS Optimisation",         body: "Pass hiring systems. AI formats your CV and adds the right keywords so your application actually gets seen." },
    { icon: <Target size={20} />,   color: BLUE,      title: "Job Tailoring",             body: "Match every application. Paste any job description and your CV is instantly rewritten to fit." },
    { icon: <FileText size={20} />, color: TEAL,      title: "Cover Letter Generator",   body: "Apply faster with stronger supporting letters. A compelling, job-specific cover letter in seconds." },
    { icon: <BarChart2 size={20} />, color: "#7c3aed", title: "CV Scoring & Feedback",   body: "Know exactly what to improve. Instant ATS score and section-by-section suggestions." },
    { icon: <Briefcase size={20} />, color: "#dc2626", title: "Interview Prep",           body: "Role-specific questions and answers. Walk into every interview knowing what to say." },
    { icon: <RefreshCw size={20} />, color: "#059669", title: "Unlimited Rewrites",       body: "Tailor every role without starting over. Every version of your CV is saved in your dashboard." },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: `${TEAL}12`, color: TEAL }}>
              Everything You Need
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              One Platform. Everything You Need to Get Hired.
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              From first upload to interview-ready — every tool you need in one place.
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

// ─── Emotional Benefits Section ───────────────────────────────────────────────
function EmotionalSection() {
  const benefits = [
    { icon: "💪", text: "More confidence in every application" },
    { icon: "✨", text: "Better first impressions with recruiters" },
    { icon: "📬", text: "More interview invitations" },
    { icon: "🚀", text: "Better opportunities and faster progression" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 rounded-full" style={{ background: `${ORANGE}12`, color: ORANGE }}>
                <Heart size={11} /> Why It Matters
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
                You Worked Too Hard<br />to Look Average on Paper
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                Years of effort, skill and dedication can be dismissed in seconds by an ATS or a busy recruiter. FuseCV helps your CV reflect what you have actually earned — and opens the doors you deserve.
              </p>
            </motion.div>
            <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="space-y-3">
              {benefits.map(({ icon, text }) => (
                <motion.div key={text} variants={fadeUp}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium text-slate-700">{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — quote card */}
          <motion.div variants={slideLeft} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="relative rounded-3xl p-8 text-white overflow-hidden" style={{ background: `linear-gradient(135deg, #080f1e, ${BLUE}cc)` }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: TEAL }} />
              <div className="relative">
                <div className="text-4xl font-black mb-6" style={{ color: TEAL }}>&ldquo;</div>
                <p className="text-lg font-medium leading-relaxed text-white mb-8">
                  A strong CV doesn&apos;t get you the job. But a weak one guarantees you won&apos;t even get the chance to show what you can do.
                </p>
                <div className="border-t border-white/10 pt-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: ORANGE }}>F</div>
                  <div>
                    <div className="font-bold text-white text-sm">FuseCV Team</div>
                    <div className="text-xs text-white/50 mt-0.5">AI-powered CV optimisation</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah K.", role: "Software Engineer → Google",      text: "After FuseCV rewrote my CV, I got 4 interview invites in 2 weeks. I had been applying for 3 months with zero callbacks before that. The ATS optimisation was the game changer.", stars: 5 },
    { name: "James O.", role: "Marketing Manager, Lagos",        text: "My old CV sounded generic. The new one actually showed my real impact with numbers. Got the job I wanted within a month of using FuseCV.", stars: 5 },
    { name: "Priya M.", role: "Graduate, University of Delhi",   text: "As a graduate, I finally knew how to present myself professionally. I didn't know what to put on my CV — FuseCV helped me structure everything. Three internship offers.", stars: 5 },
    { name: "David L.", role: "Finance Manager, London",         text: "Worth every penny. The job-tailoring feature means I apply to roles knowing my CV matches exactly what they're asking for. Highly recommend.", stars: 5 },
    { name: "Amina B.", role: "Nurse, NHS",                      text: "So easy to use and the results were professional and polished. My ward manager said it was the best application she had received in months.", stars: 5 },
    { name: "Kwame A.", role: "Product Manager, Accra",          text: "I tried three other CV tools. FuseCV is the only one that made my CV read like a senior PM's. The metrics framing advice alone is worth it.", stars: 5 },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Star size={11} className="fill-amber-500" /> Real Results
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Real Job Seekers. Real Results.
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Used by professionals across 30+ countries — graduates, career changers, and executives.
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
    { q: "Is FuseCV free to try?",          a: "Yes. You can upload your CV, get your AI analysis and preview your improved version for free. Downloading the final PDF requires a one-time payment. No subscriptions, no hidden fees." },
    { q: "Does it really pass ATS systems?", a: "Yes. FuseCV's AI is built specifically on ATS parsing logic. Formatting and keyword structure are optimised for modern screening tools — removing common failure points like tables, columns and incorrect header formats." },
    { q: "Does it work outside the UK?",    a: "Absolutely. FuseCV is used in 30+ countries including the USA, Australia, Canada, UAE, India, Nigeria, Kenya, Singapore and more. Country-specific formatting conventions are applied automatically." },
    { q: "What if I have little experience?", a: "We help students and graduates highlight projects, skills, education, and potential. FuseCV is especially effective at drawing out what you do have rather than apologising for what you don't." },
    { q: "Is my data private?",             a: "Yes. Secure private upload process. Your CV is processed securely and never shared with third parties. You can delete your account and all associated data at any time from your dashboard." },
    { q: "How long does it take?",          a: "Under 60 seconds for most CVs. Upload, paste a job description, and your tailored, ATS-optimised CV is ready to preview and download." },
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
              Common Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div key={q} variants={fadeUp} className="rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-sm">{q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                    <ChevronDown size={16} className="text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{a}</div>
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
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: BLUE }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: TEAL }} />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${TEAL}40`, background: `${TEAL}12`, color: TEAL }}>
            <Sparkles size={11} /> Start for free today
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Your Next Opportunity Starts<br />With Better Presentation
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Don&apos;t let a weak CV block a strong future. Upload yours and see what a recruiter-ready version looks like — in 60 seconds.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={handleCTA}
              whileHover={{ scale: 1.04, boxShadow: `0 0 40px ${ORANGE}55` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base"
              style={{ background: ORANGE }}
            >
              <Upload size={18} />
              Upload My CV — It&apos;s Free
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            {["No card required", "Results in 60 seconds", "Preview before payment"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} style={{ color: TEAL }} />{t}
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
    Product: [{ l: "How it works", h: "#how-it-works" }, { l: "Features", h: "#features" }, { l: "Guides", h: "/guides" }, { l: "FAQ", h: "#faq" }],
    Account: [{ l: "Sign up free", h: "/register" }, { l: "Sign in", h: "/login" }, { l: "Dashboard", h: "/dashboard" }],
    Legal:   [{ l: "Privacy Policy", h: "/privacy" }],
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
                  <li key={l}><Link href={h} className="text-sm text-slate-500 hover:text-white transition-colors">{l}</Link></li>
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
      <IdentitySection />
      <ProblemSection />
      <TransformationSection />
      <HowItWorksSection />
      <FeaturesSection />
      <EmotionalSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
