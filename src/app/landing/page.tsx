"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ onUpload }: { onUpload: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">FuseCV</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            How it works
          </button>
          <button
            onClick={onUpload}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm shadow-blue-200 transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onUpload }: { onUpload: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden px-6 pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-50 rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Brand badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          For your first opportunity, next opportunity, or biggest opportunity
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
          Get a CV That Reflects{" "}
          <span className="text-blue-700">Your Real Potential.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
          Whether you&apos;re applying for your first job, pursuing your next promotion,
          changing careers, or presenting executive experience — FuseCV transforms your
          current CV into a stronger professional version.
        </p>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-1 text-sm text-slate-400 mb-10 flex-wrap">
          <span>No payment until satisfied</span>
          <span className="mx-2 text-slate-200">•</span>
          <span>No credit card required</span>
          <span className="mx-2 text-slate-200">•</span>
          <span>🔒 Secure upload</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onUpload}
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold text-base px-10 py-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Upload My CV
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-base px-10 py-4 rounded-xl shadow-sm transition-all hover:shadow"
          >
            See How It Works
          </button>
        </div>

        {/* Preview mockup */}
        <div className="mt-16 relative mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
            {/* Mock CV header */}
            <div className="bg-slate-900 px-8 py-5">
              <div className="w-40 h-5 bg-white/80 rounded mb-2" />
              <div className="w-24 h-3 bg-white/40 rounded" />
              <div className="flex gap-4 mt-3">
                {[60, 48, 55].map((w, i) => (
                  <div key={i} className="h-2 bg-white/25 rounded" style={{ width: w }} />
                ))}
              </div>
            </div>
            <div className="bg-blue-700 h-1.5" />
            {/* Mock CV body */}
            <div className="px-8 py-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-700 rounded" />
                  <div className="w-32 h-3 bg-slate-800 rounded" />
                </div>
                {[100, 90, 95].map((w, i) => (
                  <div key={i} className="h-2.5 bg-slate-100 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-700 rounded" />
                  <div className="w-24 h-3 bg-slate-800 rounded" />
                </div>
                <div className="pl-3 border-l-2 border-blue-200 space-y-1.5">
                  <div className="flex justify-between">
                    <div className="w-36 h-2.5 bg-slate-700 rounded" />
                    <div className="w-16 h-2 bg-slate-200 rounded" />
                  </div>
                  {[95, 85, 90].map((w, i) => (
                    <div key={i} className="h-2 bg-slate-100 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {[44, 56, 38, 50, 42].map((w, i) => (
                  <div key={i} className="h-6 bg-blue-50 border border-blue-100 rounded-full" style={{ width: w }} />
                ))}
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-blue-100 rounded-3xl -z-10 opacity-30 blur-xl" />
        </div>
      </div>
    </section>
  );
}

function SocialProofStrip() {
  const items = [
    "✦ Students & Graduates",
    "✦ Job Seekers",
    "✦ Mid-Level Professionals",
    "✦ Career Changers",
    "✦ Founders & Executives",
    "✦ Students & Graduates",
    "✦ Job Seekers",
    "✦ Mid-Level Professionals",
    "✦ Career Changers",
    "✦ Founders & Executives",
  ];

  return (
    <section className="bg-slate-900 py-4 overflow-hidden">
      <div className="flex items-center gap-0">
        <div className="flex items-center gap-10 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {items.map((item, i) => (
            <span key={i} className="text-slate-400 text-sm font-medium flex-shrink-0">
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-10 animate-[marquee_20s_linear_infinite] whitespace-nowrap" aria-hidden>
          {items.map((item, i) => (
            <span key={i} className="text-slate-400 text-sm font-medium flex-shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  const cards = [
    {
      emoji: "🎓",
      title: "Students & Graduates",
      subtitle: "First Impression",
      desc: "Create a stronger first impression with a CV that highlights your potential, not just your lack of experience.",
      color: "from-violet-50 to-purple-50",
      accent: "text-violet-700",
      border: "border-violet-100",
    },
    {
      emoji: "🎯",
      title: "Job Seekers",
      subtitle: "More Interviews",
      desc: "Increase interview opportunities with achievement-focused language that recruiters actually stop to read.",
      color: "from-blue-50 to-sky-50",
      accent: "text-blue-700",
      border: "border-blue-100",
    },
    {
      emoji: "📈",
      title: "Professionals",
      subtitle: "Next Level",
      desc: "Upgrade your CV for better roles and promotions. Show the depth of experience you've actually built.",
      color: "from-emerald-50 to-teal-50",
      accent: "text-emerald-700",
      border: "border-emerald-100",
    },
    {
      emoji: "🏆",
      title: "Founders & Executives",
      subtitle: "Command Authority",
      desc: "Present your experience with the authority and gravitas that matches your actual level of leadership.",
      color: "from-amber-50 to-orange-50",
      accent: "text-amber-700",
      border: "border-amber-100",
    },
  ];

  return (
    <section id="audience" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Who It&apos;s For</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Built for Every Career Stage
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            One platform, tailored to where you are and where you want to go.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-0.5`}
            >
              <div className="text-3xl mb-4">{card.emoji}</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${card.accent} mb-1`}>{card.subtitle}</p>
              <h3 className="text-slate-900 font-bold text-lg mb-3">{card.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    { icon: "📝", label: "Weak summaries" },
    { icon: "📋", label: "Generic job descriptions" },
    { icon: "🏅", label: "Missing achievements" },
    { icon: "🗓", label: "Outdated formatting" },
    { icon: "📐", label: "Poor structure" },
  ];

  return (
    <section className="py-24 px-6 bg-slate-950">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-red-400 font-semibold text-sm uppercase tracking-widest mb-4">The Problem</p>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
          Strong People Often Look<br />Weak on Paper.
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-12">
          {problems.map((p, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center hover:border-slate-700 transition-colors"
            >
              <div className="text-2xl mb-3">{p.icon}</div>
              <p className="text-slate-300 text-sm font-medium">{p.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto">
          <p className="text-slate-400 text-lg leading-relaxed">
            Many capable people get ignored because their CV does not show their true value.{" "}
            <span className="text-white font-semibold">FuseCV fixes that.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ onUpload }: { onUpload: () => void }) {
  const steps = [
    {
      num: "01",
      title: "Upload Your Current CV",
      desc: "Share your existing CV in any format. We use it as the foundation, not the final product.",
      icon: "⬆️",
    },
    {
      num: "02",
      title: "Complete Any Missing Details",
      desc: "A guided form helps fill in gaps. No experience gets lost — it gets reframed properly.",
      icon: "✏️",
    },
    {
      num: "03",
      title: "Get a Professionally Upgraded Version",
      desc: "Our AI rewrites your CV using the right language, structure, and format for your career level.",
      icon: "✨",
    },
    {
      num: "04",
      title: "Preview First, Unlock If Satisfied",
      desc: "See the full result before paying. You only pay when you're confident it's better.",
      icon: "🔓",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">The Process</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            How FuseCV Works
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Four simple steps. A result that actually changes outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-md transition-all hover:border-blue-100">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center text-xl shadow-sm">
                  {step.icon}
                </div>
              </div>
              <div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">{step.num}</p>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onUpload}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-base px-10 py-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
          >
            Start Now — Free to Try
          </button>
          <p className="text-slate-400 text-sm mt-3">No credit card required to get started</p>
        </div>
      </div>
    </section>
  );
}

function ValueSection() {
  const benefits = [
    { icon: "🎯", title: "Stronger Professional Summary", desc: "Replace vague intros with a sharp summary that clearly communicates your value." },
    { icon: "📊", title: "Achievement-Focused Bullets", desc: "Every role gets rewritten to lead with impact, not just responsibilities." },
    { icon: "🎨", title: "Recruiter-Ready Formatting", desc: "Clean, professional layouts optimised for human readers and ATS systems alike." },
    { icon: "💪", title: "More Confidence & Credibility", desc: "Walk into every application knowing your CV does justice to your real experience." },
    { icon: "👁", title: "Better First Impressions", desc: "The difference between ignored and shortlisted often comes down to how your CV reads." },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-blue-700 to-blue-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-3">What Changes</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            What We Improve
          </h2>
          <p className="text-blue-200 mt-4 text-lg max-w-xl mx-auto">
            Every element of your CV gets upgraded for maximum impact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-blue-100 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
          {/* Filler card with brand line */}
          <div className="bg-white rounded-2xl p-6 flex items-center justify-center text-center sm:col-span-2 lg:col-span-1">
            <div>
              <div className="text-blue-700 text-4xl font-black mb-3">✦</div>
              <p className="text-slate-900 font-bold text-lg leading-snug">
                For your first opportunity, next opportunity, or biggest opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Real Results</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            See the Difference
          </h2>
          <p className="text-slate-500 mt-4 text-lg">
            The same experience. Completely different impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✕</span>
              </div>
              <span className="text-red-700 font-bold text-sm uppercase tracking-wide">Before FuseCV</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Experience bullet</p>
              <p className="text-slate-700 text-base leading-relaxed font-medium">
                Managed logistics and shipments.
              </p>
            </div>
            <ul className="mt-5 space-y-2">
              {["No measurable outcome", "No context or scale", "Reads like a task list"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-red-600 text-sm">
                  <span className="text-red-400">✕</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-emerald-700 font-bold text-sm uppercase tracking-wide">After FuseCV</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Experience bullet</p>
              <p className="text-slate-800 text-base leading-relaxed font-medium">
                Managed end-to-end logistics operations, improving delivery speed and reducing delays across multiple routes.
              </p>
            </div>
            <ul className="mt-5 space-y-2">
              {["Shows real impact", "Demonstrates scope and ownership", "Recruiter stops and reads"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-emerald-600 text-sm">
                  <span className="text-emerald-500">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const bullets = [
    { icon: "📄", text: "Use your existing CV — no blank form to fill" },
    { icon: "🚀", text: "No need to start from zero" },
    { icon: "👁", text: "Preview your upgraded CV before paying" },
    { icon: "🧭", text: "Designed to feel easy, guided, and stress-free" },
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Why Trust FuseCV</p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Safe, Simple,<br />Professional.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              We built FuseCV for people who want real results without complexity. No risk, no guesswork — just a better CV.
            </p>
          </div>

          <div className="space-y-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                  {b.icon}
                </div>
                <p className="text-slate-700 font-semibold text-base leading-snug pt-1.5">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onUpload }: { onUpload: () => void }) {
  return (
    <section className="py-28 px-6 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          ✦ For every stage of your career
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
          Your Next Opportunity Starts With Better Presentation.
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Don&apos;t let a weak CV stand between you and what you&apos;ve earned. Upload your CV now — it takes minutes.
        </p>

        <button
          onClick={onUpload}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-14 py-5 rounded-xl shadow-2xl shadow-blue-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Upload My CV Now
        </button>

        <p className="text-slate-600 text-sm mt-5">
          No payment until satisfied · No credit card required
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
            <span className="text-white font-black text-xs">F</span>
          </div>
          <span className="text-slate-400 text-sm">FuseCV © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6 text-slate-600 text-sm">
          <a href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="/login" className="hover:text-slate-400 transition-colors">Sign In</a>
          <a href="/register" className="hover:text-slate-400 transition-colors">Create Account</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  function handleUpload() {
    router.push("/register");
  }

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Navbar onUpload={handleUpload} />
      <HeroSection onUpload={handleUpload} />
      <SocialProofStrip />
      <AudienceSection />
      <ProblemSection />
      <HowItWorksSection onUpload={handleUpload} />
      <ValueSection />
      <BeforeAfterSection />
      <TrustSection />
      <FinalCTA onUpload={handleUpload} />
      <Footer />
    </>
  );
}
