"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Sparkles, FileText, CheckCircle2,
  ChevronDown, Zap, Shield, Eye, Target, BarChart3,
  Palette, ThumbsUp, Star, ScrollText, MessageSquare,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onCTA }: { onCTA: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button onClick={() => scrollTo("hero")} className="flex items-center">
          <Image src="/fusecv-logo.png" alt="FuseCV" width={110} height={36} className="object-contain" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => scrollTo("how-it-works")} className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
            How it works
          </button>
          <Link href="/login" className="hidden sm:block text-sm text-slate-600 hover:text-[#004aad] font-medium transition-colors">
            Sign in
          </Link>
          <button onClick={onCTA} className="bg-[#ff751f] hover:bg-[#e8661a] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-lg shadow-sm transition-all">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── CV Sample Preview (scaled) ───────────────────────────────────────────────

function CVSamplePreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0); // 0 = not measured yet → invisible

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const card = cardRef.current;
      if (!wrap || !card) return;
      const w = wrap.getBoundingClientRect().width;
      if (!w) return;
      const s = Math.min(1, w / 680);
      setScale(s);
      wrap.style.height = `${card.scrollHeight * s}px`;
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => { window.removeEventListener("resize", measure); ro.disconnect(); };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", overflow: "hidden", position: "relative" }}>
      <div
        ref={cardRef}
        style={{
          width: 680,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          opacity: scale === 0 ? 0 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Inter, system-ui, sans-serif", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0" }}>

          {/* SIDEBAR */}
          <div style={{ width: 190, flexShrink: 0, background: "#004aad", padding: "22px 14px", display: "flex", flexDirection: "column" }}>
            <div style={{ paddingBottom: 13, borderBottom: "1px solid rgba(255,255,255,0.15)", marginBottom: 13 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>James Mitchell</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.85)", marginTop: 3 }}>Senior Marketing Manager</div>
              <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.5)", marginTop: 4, fontStyle: "italic" }}>&ldquo;Turning strategy into measurable growth&rdquo;</div>
            </div>

            <SideSection label="Contact">
              {["✉  j.mitchell@email.com", "☎  +44 7700 900 123", "📍  London, UK", "in  linkedin.com/in/james"].map((l, i) => (
                <div key={i} style={{ fontSize: 8, color: "rgba(255,255,255,0.82)", lineHeight: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</div>
              ))}
            </SideSection>

            <SideSection label="Core Competencies">
              {["Brand Strategy", "Digital Marketing", "Team Leadership", "Campaign Management", "Data Analytics", "Stakeholder Engagement", "Budget Planning"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00c4cc", flexShrink: 0 }} />
                  <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.88)" }}>{s}</span>
                </div>
              ))}
            </SideSection>

            <SideSection label="Education">
              <div style={{ fontSize: 8.5, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>BSc Marketing &amp; Communications</div>
              <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>University of Manchester · 2013</div>
            </SideSection>

            <SideSection label="Certifications">
              {[{ n: "Google Analytics 4", s: "Google · 2023" }, { n: "HubSpot Marketing", s: "HubSpot · 2022" }].map((c, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 600, color: "#fff" }}>{c.n}</div>
                  <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)" }}>{c.s}</div>
                </div>
              ))}
            </SideSection>

            <SideSection label="Languages" last>
              {[{ l: "English", v: "Native" }, { l: "Spanish", v: "Conversational" }].map((x, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 600, color: "#fff" }}>{x.l}</div>
                  <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)" }}>{x.v}</div>
                </div>
              ))}
            </SideSection>
          </div>

          {/* MAIN BODY */}
          <div style={{ flex: 1, minWidth: 0, padding: "22px 20px 22px 18px", background: "#fff" }}>
            <BodySection label="Professional Summary">
              <p style={{ fontSize: 8.5, lineHeight: "14.5px", color: "#374151", margin: 0 }}>
                Results-driven Senior Marketing Manager with 9+ years of experience leading cross-functional teams and delivering high-impact campaigns across B2B and B2C markets. Proven track record of growing brand awareness, driving measurable revenue growth, and translating business objectives into focused marketing strategy, including a flagship demand-gen programme that generated £4.1M in attributable revenue in FY2023. Skilled at owning and optimising large marketing budgets — including a £2.4M annual spend — across digital, content, events and paid media channels. Equally effective at every career level, adapting communication style and strategic framing to match the audience.
              </p>
            </BodySection>

            <BodySection label="Experience">
              {[
                {
                  role: "Senior Marketing Manager", company: "TechVentures Ltd", loc: "London", dates: "2020 – Present",
                  bullets: [
                    "Led team of 8 marketers, delivering a 42% increase in qualified pipeline year-on-year",
                    "Oversaw £2.4M annual budget across digital, content, events and paid media",
                    "Launched integrated demand-gen campaign driving 31% YoY revenue growth",
                    "Introduced attribution modelling improving reporting accuracy across all channels",
                    "Partnered with Sales to align messaging, reducing sales cycle length by 18%",
                  ],
                },
                {
                  role: "Marketing Manager", company: "BrightScale Agency", loc: "Manchester", dates: "2017 – 2020",
                  bullets: [
                    "Managed multi-channel campaigns for 12 enterprise clients simultaneously",
                    "Grew client social engagement by an average of 68% within 6 months of onboarding",
                    "Developed content strategy that reduced client churn by 22%",
                    "Trained and mentored a team of 3 junior marketers across content and paid channels",
                  ],
                },
              ].map((exp, i) => (
                <div key={i} style={{ marginBottom: 11, paddingLeft: 10, borderLeft: "2px solid #004aad" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#1e293b" }}>{exp.role}</span>
                    <span style={{ fontSize: 7.5, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 6 }}>{exp.dates}</span>
                  </div>
                  <div style={{ fontSize: 8.5, color: "#004aad", fontWeight: 600, marginBottom: 4 }}>{exp.company} — {exp.loc}</div>
                  <ul style={{ margin: 0, paddingLeft: 10, listStyleType: "disc" }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ fontSize: 8, lineHeight: "13.5px", color: "#374151", marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </BodySection>

            <BodySection label="Key Achievements" last>
              {[
                "Delivered £4.1M in attributable revenue through targeted demand-gen programmes in FY2023",
                "Shortlisted for Marketing Week Award – B2B Campaign of the Year 2022",
                "Built and scaled marketing team from 2 to 8 members in under 18 months",
                "Reduced cost-per-lead by 34% through funnel optimisation and systematic A/B testing",
                "Spearheaded rebrand launch that increased website conversion rate by 27%",
              ].map((ach, i) => (
                <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(0,74,173,0.08)", border: "1.5px solid #004aad", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 7.5, fontWeight: 700, color: "#004aad" }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 8, lineHeight: "13.5px", color: "#374151", paddingTop: 1 }}>{ach}</span>
                </div>
              ))}
            </BodySection>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideSection({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ paddingBottom: last ? 0 : 13, borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.15)", marginBottom: last ? 0 : 13 }}>
      <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function BodySection({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#004aad", textTransform: "uppercase", letterSpacing: "1.5px", whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      {children}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ onCTA }: { onCTA: () => void }) {
  return (
    <section id="hero" className="relative bg-white pt-20 pb-12 px-4 sm:px-6">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 sm:w-[560px] sm:h-[560px] rounded-full -translate-y-1/2 translate-x-1/3"
          style={{ background: "radial-gradient(circle, rgba(0,74,173,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 sm:w-[400px] sm:h-[400px] rounded-full translate-y-1/3 -translate-x-1/4"
          style={{ background: "radial-gradient(circle, rgba(0,196,204,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8"
          style={{ background: "rgba(0,74,173,0.06)", borderColor: "rgba(0,74,173,0.15)", color: "#004aad" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#00c4cc" }} />
          <span>For your first, next, or biggest opportunity</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.08] tracking-tight mb-5 sm:mb-6">
          Get a CV That Reflects{" "}
          <span style={{ color: "#004aad" }}>Your Real Potential.</span>
        </h1>

        <ul className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto mb-6 sm:mb-8 space-y-2.5 text-left">
          {["Applying for your first job", "Pursuing your next promotion", "Changing careers", "Presenting executive experience"].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#ff751f" }} />
              <span>{item}</span>
            </li>
          ))}
          <li className="flex items-start gap-3 pt-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#00c4cc" }} />
            <span className="font-semibold" style={{ color: "#004aad" }}>FuseCV transforms your current CV into a stronger professional version.</span>
          </li>
        </ul>

        {/* Trust line */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-7 sm:mb-10">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No payment until satisfied</span>
          <span className="text-slate-200 hidden sm:inline">•</span>
          <span>No credit card required</span>
          <span className="text-slate-200 hidden sm:inline">•</span>
          <span>Secure upload</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14">
          <button onClick={onCTA}
            className="flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base px-8 py-3.5 sm:py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#ff751f", boxShadow: "0 8px 24px rgba(255,117,31,0.25)" }}>
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            Upload My CV
          </button>
          <button onClick={() => scrollTo("how-it-works")}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm sm:text-base px-8 py-3.5 sm:py-4 rounded-xl shadow-sm transition-all hover:shadow">
            See How It Works
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* CV Preview */}
        <div className="relative">
          <CVSamplePreview />
          <div className="absolute -inset-2 sm:-inset-4 rounded-3xl -z-10 opacity-15 blur-2xl" style={{ background: "#004aad" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof Strip ───────────────────────────────────────────────────────

function SocialProofStrip() {
  const items = [
    "✦ Students & Graduates", "✦ Job Seekers", "✦ Mid-Level Professionals",
    "✦ Career Changers", "✦ Founders & Executives",
    "✦ Students & Graduates", "✦ Job Seekers", "✦ Mid-Level Professionals",
    "✦ Career Changers", "✦ Founders & Executives",
  ];
  return (
    <section className="py-3 sm:py-4 overflow-hidden" style={{ background: "#004aad" }}>
      <div className="flex">
        {[0, 1].map(k => (
          <div key={k} aria-hidden={k === 1} className="flex items-center gap-8 sm:gap-10 animate-[marquee_22s_linear_infinite] whitespace-nowrap flex-shrink-0">
            {items.map((item, i) => (
              <span key={i} className="text-xs sm:text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Audience ─────────────────────────────────────────────────────────────────

function AudienceSection() {
  const cards = [
    { icon: "🎓", title: "Students & Graduates", subtitle: "First Impression", desc: "Create a stronger first impression with a CV that highlights your potential, not just your lack of experience.", accent: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
    { icon: "🎯", title: "Job Seekers", subtitle: "More Interviews", desc: "Increase interview opportunities with achievement-focused language that recruiters actually stop to read.", accent: "#004aad", bg: "#eff6ff", border: "#bfdbfe" },
    { icon: "📈", title: "Professionals", subtitle: "Next Level", desc: "Upgrade your CV for better roles and promotions. Show the depth of experience you've actually built.", accent: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
    { icon: "🏆", title: "Founders & Executives", subtitle: "Command Authority", desc: "Present your experience with the authority and gravitas that matches your actual level of leadership.", accent: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  ];
  return (
    <section id="audience" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Who It&apos;s For</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Built for Every Career Stage</h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-lg max-w-xl mx-auto">One platform, tailored to where you are and where you want to go.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl p-5 sm:p-6 border transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: card.bg, borderColor: card.border }}>
              <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{card.icon}</div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: card.accent }}>{card.subtitle}</p>
              <h3 className="text-slate-900 font-bold text-base sm:text-lg mb-2 sm:mb-3">{card.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection({ onCTA }: { onCTA: () => void }) {
  const features = [
    {
      icon: <FileText className="w-7 h-7 sm:w-8 sm:h-8" />, tag: "CV", title: "Professional CV",
      headline: "Your experience, rewritten to impress.",
      bullets: ["AI-powered rewrite of every section", "Achievement-focused bullet points", "6 recruiter-ready layout variants", "ATS-friendly formatting", "Tailored to the specific job you're applying for"],
      accent: "#004aad", bg: "#eff6ff", border: "#bfdbfe", tagBg: "rgba(0,74,173,0.1)",
    },
    {
      icon: <ScrollText className="w-7 h-7 sm:w-8 sm:h-8" />, tag: "Cover Letter", title: "Tailored Cover Letter",
      headline: "A compelling letter that opens doors.",
      bullets: ["Written to match the job you're applying for", "Highlights your strongest selling points", "Professional tone for any career level", "Ready to personalise and send"],
      accent: "#ff751f", bg: "#fff7ed", border: "#fed7aa", tagBg: "rgba(255,117,31,0.1)",
    },
    {
      icon: <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />, tag: "Interview Prep", title: "Practice Questions",
      headline: "Walk in prepared, walk out confident.",
      bullets: ["Role-specific interview questions", "Model answers based on your experience", "Competency, behavioural & technical questions", "Practice at your own pace"],
      accent: "#059669", bg: "#f0fdf4", border: "#a7f3d0", tagBg: "rgba(5,150,105,0.1)",
    },
  ];
  return (
    <section id="features" className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#F0F2F8" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Everything You Need</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">One Platform. Three Powerful Tools.</h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-lg max-w-xl mx-auto">Everything you need to land your next role — built into a single, seamless experience.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl p-6 sm:p-8 flex flex-col border hover:shadow-lg transition-all hover:-translate-y-0.5" style={{ background: f.bg, borderColor: f.border }}>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5 w-fit" style={{ background: f.tagBg, color: f.accent }}>{f.tag}</div>
              <div className="mb-3" style={{ color: f.accent }}>{f.icon}</div>
              <h3 className="text-slate-900 font-black text-xl sm:text-2xl mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">{f.headline}</p>
              <ul className="space-y-2.5 sm:space-y-3 flex-1">
                {f.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: f.accent }} />{b}
                  </li>
                ))}
              </ul>
              <button onClick={onCTA} className="mt-6 sm:mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: f.accent, color: "#fff" }}>
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────

function ProblemSection() {
  const problems = [
    { icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Weak summaries" },
    { icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Generic descriptions" },
    { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Missing achievements" },
    { icon: <Palette className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Outdated formatting" },
    { icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />, label: "Poor structure" },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#0a1628" }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-4" style={{ color: "#ff751f" }}>The Problem</p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5">
          Strong People Often Look<br />Weak on Paper.
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 my-8 sm:my-12">
          {problems.map((p, i) => (
            <div key={i} className="rounded-xl p-4 sm:p-5 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex justify-center mb-2 sm:mb-3" style={{ color: "#00c4cc" }}>{p.icon}</div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">{p.label}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Many capable people get ignored because their CV does not show their true value.{" "}
          <span className="text-white font-semibold">FuseCV fixes that.</span>
        </p>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection({ onCTA }: { onCTA: () => void }) {
  const steps = [
    { num: "01", title: "Upload Your Current CV", desc: "Share your existing CV in any format. We use it as the foundation, not the final product.", icon: <Upload className="w-5 h-5 text-white" /> },
    { num: "02", title: "Complete Any Missing Details", desc: "A guided form helps fill in gaps. No experience gets lost — it gets reframed properly.", icon: <FileText className="w-5 h-5 text-white" /> },
    { num: "03", title: "Get a Professionally Upgraded Version", desc: "Our AI rewrites your CV using the right language, structure, and format for your career level.", icon: <Sparkles className="w-5 h-5 text-white" /> },
    { num: "04", title: "Preview First, Unlock If Satisfied", desc: "See the full result before paying. You only pay when you're confident it's better.", icon: <Eye className="w-5 h-5 text-white" /> },
  ];
  return (
    <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>The Process</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">How FuseCV Works</h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-lg max-w-xl mx-auto">Four simple steps. A result that actually changes outcomes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#004aad" }}>{step.icon}</div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#00c4cc" }}>{step.num}</p>
                <h3 className="text-slate-900 font-bold text-base sm:text-lg mb-1.5 sm:mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <button onClick={onCTA}
            className="w-full sm:w-auto text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
            style={{ background: "#ff751f", boxShadow: "0 8px 24px rgba(255,117,31,0.25)" }}>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Start Now — Free to Try
          </button>
          <p className="text-slate-400 text-xs sm:text-sm mt-3">No credit card required to get started</p>
        </div>
      </div>
    </section>
  );
}

// ─── Value ────────────────────────────────────────────────────────────────────

function ValueSection() {
  const benefits = [
    { icon: <Target className="w-6 h-6 sm:w-7 sm:h-7" />, title: "Stronger Professional Summary", desc: "Replace vague intros with a sharp summary that clearly communicates your value." },
    { icon: <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7" />, title: "Achievement-Focused Bullets", desc: "Every role gets rewritten to lead with impact, not just responsibilities." },
    { icon: <Palette className="w-6 h-6 sm:w-7 sm:h-7" />, title: "Recruiter-Ready Formatting", desc: "Clean, professional layouts optimised for human readers and ATS systems alike." },
    { icon: <ThumbsUp className="w-6 h-6 sm:w-7 sm:h-7" />, title: "More Confidence & Credibility", desc: "Walk into every application knowing your CV does justice to your real experience." },
    { icon: <Eye className="w-6 h-6 sm:w-7 sm:h-7" />, title: "Better First Impressions", desc: "The difference between ignored and shortlisted often comes down to how your CV reads." },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "linear-gradient(135deg, #004aad 0%, #002f7a 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>What Changes</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">What We Improve</h2>
          <p className="mt-3 text-sm sm:text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>Every element of your CV gets upgraded for maximum impact.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-2xl p-5 sm:p-6 transition-all hover:scale-[1.01]" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="mb-3" style={{ color: "#00c4cc" }}>{b.icon}</div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-2">{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{b.desc}</p>
            </div>
          ))}
          <div className="bg-white rounded-2xl p-5 sm:p-6 flex items-center justify-center text-center sm:col-span-2 lg:col-span-1">
            <div>
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-3" style={{ color: "#ff751f" }} />
              <p className="text-slate-900 font-bold text-base sm:text-lg leading-snug">
                For your first opportunity, next opportunity, or biggest opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Before / After ───────────────────────────────────────────────────────────

function BeforeAfterSection() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Real Results</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">See the Difference</h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-lg">The same experience. Completely different impact.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✕</span>
              </div>
              <span className="text-red-700 font-bold text-sm uppercase tracking-wide">Before FuseCV</span>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-red-100 shadow-sm">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Experience bullet</p>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">Managed logistics and shipments.</p>
            </div>
            <ul className="mt-4 sm:mt-5 space-y-2">
              {["No measurable outcome", "No context or scale", "Reads like a task list"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-red-600 text-sm">
                  <span className="text-red-400 font-bold flex-shrink-0">✕</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-emerald-700 font-bold text-sm uppercase tracking-wide">After FuseCV</span>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-100 shadow-sm">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Experience bullet</p>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">Managed end-to-end logistics operations, improving delivery speed and reducing delays across multiple routes.</p>
            </div>
            <ul className="mt-4 sm:mt-5 space-y-2">
              {["Shows real impact", "Demonstrates scope and ownership", "Recruiter stops and reads"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust ────────────────────────────────────────────────────────────────────

function TrustSection() {
  const bullets = [
    { icon: <FileText className="w-5 h-5" />, text: "Use your existing CV — no blank form to fill" },
    { icon: <Zap className="w-5 h-5" />, text: "No need to start from zero" },
    { icon: <Eye className="w-5 h-5" />, text: "Preview your upgraded CV before paying" },
    { icon: <Shield className="w-5 h-5" />, text: "Designed to feel easy, guided, and stress-free" },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#F0F2F8" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div>
            <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Why Trust FuseCV</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">Safe, Simple,<br />Professional.</h2>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed">We built FuseCV for people who want real results without complexity. No risk, no guesswork — just a better CV.</p>
            <div className="mt-6 sm:mt-8 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl blur-md" style={{ background: "rgba(0,74,173,0.2)" }} />
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center shadow-md overflow-hidden" style={{ background: "#004aad" }}>
                  <Image src="/fusecv-icon.png" alt="FuseCV" width={40} height={56} className="object-contain" />
                </div>
              </div>
              <div>
                <p className="font-extrabold text-base sm:text-lg" style={{ color: "#004aad" }}>FuseCV</p>
                <p className="text-slate-500 text-xs sm:text-sm">Trusted by professionals at every stage</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,74,173,0.08)", color: "#004aad" }}>{b.icon}</div>
                <p className="text-slate-700 font-semibold text-sm sm:text-base leading-snug pt-1">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: "#0a1628" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[500px] h-72 sm:h-[500px] rounded-full opacity-15 blur-3xl" style={{ background: "#004aad" }} />
      </div>
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 mb-6 text-xs font-semibold" style={{ background: "rgba(0,74,173,0.3)", border: "1px solid rgba(0,74,173,0.5)", color: "#00c4cc" }}>
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          For every stage of your career
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4 sm:mb-6">
          Your Next Opportunity Starts With Better Presentation.
        </h2>
        <p className="text-sm sm:text-lg mb-7 sm:mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Don&apos;t let a weak CV stand between you and what you&apos;ve earned. Upload your CV now — it takes minutes.
        </p>
        <button onClick={onCTA}
          className="w-full sm:w-auto text-white font-bold text-sm sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mx-auto"
          style={{ background: "#ff751f", boxShadow: "0 12px 40px rgba(255,117,31,0.3)" }}>
          <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> Upload My CV Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <p className="text-xs sm:text-sm mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          No payment until satisfied · No credit card required
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-7 sm:py-8 px-4 sm:px-6" style={{ background: "#0a1628", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Image src="/fusecv-logo.png" alt="FuseCV" width={90} height={28} className="object-contain opacity-60" />
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="hover:text-white transition-colors">Create Account</Link>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()} FuseCV</p>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  function handleCTA() { router.push("/register"); }

  return (
    <div className="w-full overflow-x-hidden">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <Navbar onCTA={handleCTA} />
      <HeroSection onCTA={handleCTA} />
      <SocialProofStrip />
      <AudienceSection />
      <FeaturesSection onCTA={handleCTA} />
      <ProblemSection />
      <HowItWorksSection onCTA={handleCTA} />
      <ValueSection />
      <BeforeAfterSection />
      <TrustSection />
      <FinalCTA onCTA={handleCTA} />
      <Footer />
    </div>
  );
}
