"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Upload, Sparkles, FileText, CheckCircle2,
  ChevronDown, Zap, Shield, Eye, Target,
  Palette, ThumbsUp, Star, ScrollText, MessageSquare,
  X, Globe, Clock,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
            Upload My CV Free
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── CV Sample Preview (scaled) ───────────────────────────────────────────────

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

function CVSamplePreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

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
      <div ref={cardRef} style={{ width: 680, transformOrigin: "top left", transform: `scale(${scale})`, opacity: scale === 0 ? 0 : 1, transition: "opacity 0.2s" }}>
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
                Results-driven Senior Marketing Manager with 9+ years of experience leading cross-functional teams and delivering high-impact campaigns across B2B and B2C markets. Proven track record of growing brand awareness, driving measurable revenue growth, and translating business objectives into focused marketing strategy, including a flagship demand-gen programme that generated £4.1M in attributable revenue in FY2023. Skilled at owning and optimising large marketing budgets — including a £2.4M annual spend — across digital, content, events and paid media channels.
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ onCTA }: { onCTA: () => void }) {
  return (
    <section id="hero" className="relative bg-white pt-20 pb-12 px-4 sm:px-6">
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
          <span>No card required · Preview before you pay</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight mb-5 sm:mb-6">
          Your CV Might Be{" "}
          <span style={{ color: "#004aad" }}>Costing You Opportunities.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-7 sm:mb-9 leading-relaxed">
          FuseCV transforms your current CV into a recruiter-ready version that highlights your real value, wins more interviews, and helps you compete for better roles.
        </p>

        {/* Trust ticks */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500 mb-7 sm:mb-10">
          {["No payment until satisfied", "No credit card required", "Secure upload"].map((t, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#10b981" }} />
              {t}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14">
          <button onClick={onCTA}
            className="flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base px-8 py-3.5 sm:py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#ff751f", boxShadow: "0 8px 24px rgba(255,117,31,0.25)" }}>
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Upload My CV Free
          </button>
          <button onClick={() => scrollTo("before-after")}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm sm:text-base px-8 py-3.5 sm:py-4 rounded-xl shadow-sm transition-all hover:shadow">
            See Before &amp; After
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
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

// ─── Marquee Strip ────────────────────────────────────────────────────────────

function MarqueeStrip() {
  const items = [
    "✦ Students & Graduates", "✦ Job Seekers", "✦ Mid-Level Professionals",
    "✦ Career Changers", "✦ Founders & Executives",
    "✦ Students & Graduates", "✦ Job Seekers", "✦ Mid-Level Professionals",
    "✦ Career Changers", "✦ Founders & Executives",
  ];
  return (
    <div className="py-3 sm:py-4 overflow-hidden" style={{ background: "#004aad" }}>
      <div className="flex">
        {[0, 1].map(k => (
          <div key={k} aria-hidden={k === 1}
            className="flex items-center gap-8 sm:gap-10 animate-[marquee_22s_linear_infinite] whitespace-nowrap flex-shrink-0">
            {items.map((item, i) => (
              <span key={i} className="text-xs sm:text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pain / Agitation ─────────────────────────────────────────────────────────

function PainSection() {
  const traits = ["Average", "Generic", "Forgettable", "Low impact"];
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6" style={{ background: "#0a1628" }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-4" style={{ color: "#ff751f" }}>The Problem</p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Good People Get Rejected Every Day
        </h2>
        <p className="text-slate-400 text-base sm:text-lg mb-8 sm:mb-10">
          Not because they lack skill. Because their CV says:
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          {traits.map((t, i) => (
            <div key={i} className="px-5 sm:px-7 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold"
              style={{ background: "rgba(255,117,31,0.1)", border: "1.5px solid rgba(255,117,31,0.25)", color: "#ff751f" }}>
              {t}
            </div>
          ))}
        </div>
        <p className="text-slate-400 text-sm sm:text-base mb-8 italic">
          While stronger candidates on paper get the interview.
        </p>
        <div className="inline-block rounded-2xl px-6 sm:px-12 py-5 sm:py-7 max-w-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-white font-bold text-lg sm:text-2xl leading-snug">
            Your experience may be valuable.
          </p>
          <p className="text-slate-300 text-base sm:text-xl mt-2">
            Your CV may be hiding it.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof ─────────────────────────────────────────────────────────────

function SocialProofSection() {
  const stats = [
    { icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />, value: "10,000+", label: "CVs upgraded" },
    { icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />, value: "4.8★", label: "Average rating" },
    { icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />, value: "30+", label: "Countries" },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#F0F2F8" }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Trusted Worldwide</p>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Trusted by Ambitious Professionals<br className="hidden sm:block" /> at Every Career Stage
        </h2>
        <p className="text-slate-500 text-sm sm:text-base mb-8 sm:mb-12">
          Students · Managers · Career Changers · Founders · Executives
        </p>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-100 shadow-sm flex flex-col items-center gap-2 sm:gap-3">
              <div style={{ color: "#004aad" }}>{s.icon}</div>
              <p className="text-xl sm:text-4xl font-black" style={{ color: "#004aad" }}>{s.value}</p>
              <p className="text-slate-500 text-xs sm:text-sm text-center leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Before / After ───────────────────────────────────────────────────────────

function BeforeAfterSection() {
  const reasons = ["Specific", "Credible", "Senior-level", "Impact-driven"];
  return (
    <section id="before-after" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Real Results</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Same Person. Different Result.</h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-lg">One rewrite changes everything.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
          {/* Before */}
          <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✕</span>
              </div>
              <span className="text-red-700 font-bold text-sm uppercase tracking-wide">Before</span>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-red-100 shadow-sm">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Experience bullet</p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium">Managed team and campaigns.</p>
            </div>
          </div>
          {/* After */}
          <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-emerald-700 font-bold text-sm uppercase tracking-wide">After</span>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-100 shadow-sm">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Experience bullet</p>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-semibold">
                Led an 8-person team delivering 42% pipeline growth while managing a £2.4M annual marketing budget.
              </p>
            </div>
          </div>
        </div>
        {/* Why recruiters prefer */}
        <div className="rounded-2xl p-5 sm:p-6 border border-slate-100" style={{ background: "#F0F2F8" }}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Why recruiters prefer this</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {reasons.map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,74,173,0.08)", color: "#004aad" }}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Story Section ────────────────────────────────────────────────────────────

function StorySection() {
  const steps = [
    { emoji: "📄", text: "James applied for weeks with no replies." },
    { emoji: "⬆️", text: "Uploaded his CV to FuseCV." },
    { emoji: "⚡", text: "New version ready in minutes." },
    { emoji: "🎯", text: "Landed 4 interviews in 14 days.", highlight: true },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Real Story</p>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What Happens When Your CV Finally<br className="hidden sm:block" /> Matches Your Ability
          </h2>
        </div>
        <div className="relative max-w-xl mx-auto">
          <div className="absolute left-6 sm:left-8 top-6 bottom-6 w-px" style={{ background: "rgba(0,74,173,0.12)" }} />
          <div className="space-y-5 sm:space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5 sm:gap-6 items-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl relative z-10 shadow-sm ${s.highlight ? "" : "bg-white"}`}
                  style={s.highlight ? { background: "#004aad" } : { border: "2px solid rgba(0,74,173,0.15)" }}>
                  {s.emoji}
                </div>
                <p className={`text-base sm:text-xl font-semibold leading-snug ${s.highlight ? "font-bold" : "text-slate-700"}`}
                  style={s.highlight ? { color: "#004aad" } : {}}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-10 text-center italic">
          Use real user story when available
        </p>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection({ onCTA }: { onCTA: () => void }) {
  const steps = [
    { num: "01", title: "Upload Your Current CV", desc: "Use what you already have.", icon: <Upload className="w-5 h-5 text-white" /> },
    { num: "02", title: "Add Missing Details", desc: "Quick prompts uncover hidden achievements.", icon: <FileText className="w-5 h-5 text-white" /> },
    { num: "03", title: "AI Rebuilds It Professionally", desc: "Sharper wording, stronger bullets, better structure.", icon: <Sparkles className="w-5 h-5 text-white" /> },
    { num: "04", title: "Preview Before Paying", desc: "Only unlock if you're genuinely impressed.", icon: <Eye className="w-5 h-5 text-white" /> },
  ];
  return (
    <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#0a1628" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>The Process</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">Four Steps. Zero Guesswork.</h2>
          <p className="mt-3 text-sm sm:text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            A result that actually changes outcomes.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ background: "#004aad" }}>
                  {step.icon}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#00c4cc" }}>{step.num}</p>
                <h3 className="font-bold text-base sm:text-lg mb-1.5 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <button onClick={onCTA}
            className="w-full sm:w-auto text-white font-bold text-sm sm:text-base px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
            style={{ background: "#ff751f", boxShadow: "0 8px 24px rgba(255,117,31,0.25)" }}>
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Upload My CV Free
          </button>
          <p className="text-xs sm:text-sm mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            No credit card required to get started
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Offer Stack ──────────────────────────────────────────────────────────────

function OfferStackSection({ onCTA }: { onCTA: () => void }) {
  const items = [
    { icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Professional CV Upgrade", desc: "Rewritten for stronger first impressions.", accent: "#004aad", bg: "#eff6ff", border: "#bfdbfe" },
    { icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />, title: "ATS Optimization", desc: "Built to pass screening systems.", accent: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
    { icon: <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Tailored Cover Letter", desc: "Match the role you want.", accent: "#ff751f", bg: "#fff7ed", border: "#fed7aa" },
    { icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Interview Prep Questions", desc: "Role-specific preparation.", accent: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
    { icon: <Palette className="w-5 h-5 sm:w-6 sm:h-6" />, title: "Multiple Layout Options", desc: "Choose premium recruiter-ready styles.", accent: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#F0F2F8" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Everything Included</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">One Platform. Everything You Need.</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 mt-4 sm:mt-5">
            <span className="text-sm sm:text-base text-slate-500">Total Value: <strong className="text-slate-700">High</strong></span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-sm sm:text-base text-slate-500">Your Risk: <strong style={{ color: "#004aad" }}>Zero upfront</strong></span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl p-5 sm:p-6 border hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: item.bg, borderColor: item.border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${item.accent}18`, color: item.accent }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
          {/* CTA card */}
          <div className="rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center border hover:shadow-lg transition-all bg-white sm:col-span-2 lg:col-span-1"
            style={{ borderColor: "rgba(0,74,173,0.2)" }}>
            <Sparkles className="w-8 h-8 mb-3" style={{ color: "#ff751f" }} />
            <p className="text-slate-900 font-bold text-base sm:text-lg mb-4">Start free. Pay only if you love it.</p>
            <button onClick={onCTA}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: "#ff751f" }}>
              Upload My CV Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ─────────────────────────────────────────────────────────────

function AudienceSection() {
  const cards = [
    { icon: "🎓", title: "Students & Graduates", desc: "Look stronger than your limited experience. We reframe what you have into what recruiters want to see.", accent: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
    { icon: "🎯", title: "Job Seekers", desc: "Increase interview chances fast. Achievement-focused language that recruiters actually stop to read.", accent: "#004aad", bg: "#eff6ff", border: "#bfdbfe" },
    { icon: "📈", title: "Mid-Level Professionals", desc: "Compete for promotions and better roles. Show the depth of experience you've actually built.", accent: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
    { icon: "🔄", title: "Career Changers", desc: "Translate transferable value clearly. Your experience applies — we help recruiters see that.", accent: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { icon: "🏆", title: "Founders & Executives", desc: "Present authority and leadership. The gravitas your experience actually deserves.", accent: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  ];
  return (
    <section id="audience" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <p className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Who It&apos;s For</p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Built for Every Career Move</h2>
          <p className="text-slate-500 mt-3 text-sm sm:text-lg max-w-xl mx-auto">One platform, tailored to where you are and where you want to go.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl p-5 sm:p-6 border transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: card.bg, borderColor: card.border }}>
              <div className="text-2xl sm:text-3xl mb-3">{card.icon}</div>
              <h3 className="text-slate-900 font-bold text-base sm:text-lg mb-2">{card.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Emotional Section ────────────────────────────────────────────────────────

function EmotionalSection() {
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #004aad 0%, #002f7a 100%)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/3"
          style={{ background: "#00c4cc" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10 blur-3xl translate-y-1/3 -translate-x-1/4"
          style={{ background: "#ff751f" }} />
      </div>
      <div className="relative max-w-3xl mx-auto text-center">
        <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-4" style={{ color: "#00c4cc" }}>Remember This</p>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5">
          You Worked Too Hard to<br className="hidden sm:block" /> Look Average on Paper
        </h2>
        <p className="text-base sm:text-xl mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          Years of effort can be ignored in seconds.
        </p>
        <p className="text-base sm:text-xl font-semibold text-white">
          FuseCV helps your CV reflect what you&apos;ve actually earned.
        </p>
      </div>
    </section>
  );
}

// ─── Trust Section ────────────────────────────────────────────────────────────

function TrustSection() {
  const bullets = [
    { icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />, text: "No blank forms from scratch — uses your existing CV" },
    { icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Preview first, pay only if satisfied" },
    { icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Secure, private process" },
    { icon: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Built for real outcomes" },
    { icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Fast — new version ready in minutes" },
    { icon: <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />, text: "No risk. No guesswork." },
  ];
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6" style={{ background: "#F0F2F8" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div>
            <p className="font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3" style={{ color: "#00c4cc" }}>Why People Choose FuseCV</p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">
              Safe, Simple,<br />Professional.
            </h2>
            <p className="text-slate-500 text-sm sm:text-lg leading-relaxed">
              We built FuseCV for people who want real results without complexity. No risk, no guesswork — just a better CV.
            </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,74,173,0.08)", color: "#004aad" }}>{b.icon}</div>
                <p className="text-slate-700 font-semibold text-sm leading-snug pt-0.5">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Urgency Section ──────────────────────────────────────────────────────────

function UrgencySection({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6" style={{ background: "#0a1628", borderTop: "1px solid rgba(255,117,31,0.2)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 mb-5 text-xs font-semibold"
          style={{ background: "rgba(255,117,31,0.12)", border: "1px solid rgba(255,117,31,0.25)", color: "#ff751f" }}>
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          Don&apos;t Wait
        </div>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
          Every Week With a Weak CV<br className="hidden sm:block" /> Can Cost Real Opportunities
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mb-2">
          Jobs close. Recruiters move fast. Strong roles get flooded.
        </p>
        <p className="font-semibold text-white text-sm sm:text-base mb-8">
          Your next opportunity may already be open.
        </p>
        <button onClick={onCTA}
          className="w-full sm:w-auto text-white font-bold text-sm sm:text-base px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
          style={{ background: "#ff751f", boxShadow: "0 8px 24px rgba(255,117,31,0.25)" }}>
          <Upload className="w-4 h-4 flex-shrink-0" /> Upload My CV Free
        </button>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: "#0a1628" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[500px] h-72 sm:h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: "#004aad" }} />
      </div>
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-2 sm:mb-3">
          You Already Built the Experience.
        </h2>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6 sm:mb-8"
          style={{ color: "#ff751f" }}>
          Now Present It Like It Matters.
        </h2>
        <button onClick={onCTA}
          className="w-full sm:w-auto text-white font-bold text-sm sm:text-lg px-8 sm:px-14 py-4 sm:py-5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mx-auto"
          style={{ background: "#ff751f", boxShadow: "0 12px 40px rgba(255,117,31,0.3)" }}>
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          Upload My CV Free
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        </button>
        <p className="text-xs sm:text-sm mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          No card required · Preview first · Pay only if satisfied
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

// ─── Exit Popup ───────────────────────────────────────────────────────────────

function ExitPopup({ onCTA }: { onCTA: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      try { if (sessionStorage.getItem("fusecv_exit_shown")) return; } catch { /* */ }
      triggered = true;
      try { sessionStorage.setItem("fusecv_exit_shown", "1"); } catch { /* */ }
      setShow(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) trigger();
    };
    // Wait 3s before enabling exit-intent so it doesn't fire immediately
    const init = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);
    // Mobile fallback: trigger after 45s on page
    const mobile = setTimeout(trigger, 45000);

    return () => {
      clearTimeout(init);
      clearTimeout(mobile);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setShow(false); }}>
      <div className="relative bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full text-center shadow-2xl">
        <button onClick={() => setShow(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          aria-label="Close">
          <X className="w-4 h-4 text-slate-500" />
        </button>
        <div className="text-3xl sm:text-4xl mb-4">⚠️</div>
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 mb-3 leading-snug">
          Wait — Your CV Could Be the Only Thing Holding You Back
        </h3>
        <p className="text-slate-500 text-sm sm:text-base mb-6">
          Upload it free now and see what changes in minutes.
        </p>
        <button
          onClick={() => { setShow(false); onCTA(); }}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm sm:text-base mb-3 transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: "#ff751f" }}>
          <Upload className="w-4 h-4 flex-shrink-0" />
          Fix My CV Free
        </button>
        <button onClick={() => setShow(false)}
          className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
          No thanks, I&apos;ll stay with my current CV
        </button>
      </div>
    </div>
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
      <MarqueeStrip />
      <PainSection />
      <SocialProofSection />
      <BeforeAfterSection />
      <StorySection />
      <HowItWorksSection onCTA={handleCTA} />
      <OfferStackSection onCTA={handleCTA} />
      <AudienceSection />
      <EmotionalSection />
      <TrustSection />
      <UrgencySection onCTA={handleCTA} />
      <FinalCTA onCTA={handleCTA} />
      <Footer />
      <ExitPopup onCTA={handleCTA} />
    </div>
  );
}
