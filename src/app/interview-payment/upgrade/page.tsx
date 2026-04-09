"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles, ArrowLeft, Loader2, CheckCircle2, Zap, Shield, RefreshCw,
} from "lucide-react";
import { DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY } from "@/lib/flutterwave";

const FREE_QUOTA = 5;
const PAID_BATCH = 20;

const features = [
  { icon: Zap,          label: `${PAID_BATCH} new questions added to your account`,         color: "text-indigo-500", bg: "bg-indigo-50" },
  { icon: CheckCircle2, label: "Works across all sessions — existing sessions unaffected",   color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Sparkles,     label: "AI-personalised to your target role and company",            color: "text-violet-500", bg: "bg-violet-50" },
  { icon: RefreshCw,    label: "Top up again any time you run out",                          color: "text-blue-500",   bg: "bg-blue-50" },
  { icon: Shield,       label: "Count persists — deleting sessions does not reset it",       color: "text-amber-500",  bg: "bg-amber-50" },
];

function UpgradeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const pendingAction = params.get("action") || "generate";
  const email = params.get("email") || "";
  const name = params.get("name") || "FuseCV User";

  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!email) {
      toast.error("Please add your email to your profile before paying.");
      router.back();
      return;
    }
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/interview-payment/callback?action=${pendingAction}`;
      const res = await fetch("/api/payments/interview-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, redirectUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.link) throw new Error(data.error || "Failed to create payment link");
      window.location.href = data.link;
    } catch (err: any) {
      toast.error(err.message || "Could not open payment page. Please try again.");
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Shared sub-components
  // ─────────────────────────────────────────────────────────────────
  const PricingBadge = () => (
    <div className="shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
                    flex flex-col items-center justify-center shadow-md shadow-indigo-200">
      <span className="text-2xl font-extrabold text-white leading-none">{PAID_BATCH}</span>
      <span className="text-[10px] text-indigo-100 font-medium mt-0.5">questions</span>
    </div>
  );

  const ComparisonTable = () => (
    <div className="rounded-2xl overflow-hidden border border-slate-200">
      <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
        {["Plan", "Questions", "Price"].map((h) => (
          <div key={h} className="px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider first:text-left text-center">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-3 border-b border-slate-100 bg-white">
        <div className="px-4 py-3 text-sm text-slate-500 font-medium">Free</div>
        <div className="px-4 py-3 text-sm text-slate-500 text-center">{FREE_QUOTA}</div>
        <div className="px-4 py-3 text-sm text-slate-400 text-center">—</div>
      </div>
      <div className="grid grid-cols-3 bg-indigo-50">
        <div className="px-4 py-3 text-sm text-indigo-700 font-bold">Top-Up</div>
        <div className="px-4 py-3 text-sm text-indigo-600 font-bold text-center">+{PAID_BATCH}</div>
        <div className="px-4 py-3 text-sm text-indigo-600 font-bold text-center">{DOWNLOAD_AMOUNT.toLocaleString()}</div>
      </div>
    </div>
  );

  const PayButton = ({ className = "" }: { className?: string }) => (
    <Button
      onClick={handlePay}
      disabled={loading}
      className={`bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                  text-white border-0 font-bold shadow-lg shadow-indigo-200 disabled:opacity-60 ${className}`}
    >
      {loading
        ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Opening payment…</>
        : <><Sparkles className="mr-2 h-5 w-5" />Pay {DOWNLOAD_CURRENCY} {DOWNLOAD_AMOUNT.toLocaleString()}</>}
    </Button>
  );

  // ─────────────────────────────────────────────────────────────────
  // MOBILE layout  (< lg)
  // ─────────────────────────────────────────────────────────────────
  const MobileLayout = () => (
    <div className="flex flex-col min-h-screen bg-white lg:hidden">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-5 pt-12 pb-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <button onClick={() => router.back()}
          className="relative flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold leading-tight">Unlock More<br />Interview Questions</h1>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            Your {FREE_QUOTA} free questions have been used. Keep practising with a top-up.
          </p>
        </div>
      </div>

      {/* Pricing card — overlaps hero */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">One-time top-up</p>
            <p className="text-3xl font-extrabold text-slate-900 leading-none">
              {DOWNLOAD_CURRENCY} {DOWNLOAD_AMOUNT.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1.5">One payment · {PAID_BATCH} questions</p>
          </div>
          <PricingBadge />
        </div>
      </div>

      {/* Features + table */}
      <div className="px-5 pt-6 pb-4 flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What you get</p>
        <div className="space-y-3">
          {features.map(({ icon: Icon, label, color, bg }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-sm text-slate-600 leading-snug pt-1.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6"><ComparisonTable /></div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 space-y-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <PayButton className="w-full h-13 rounded-2xl text-base" />
        <button onClick={() => router.back()} disabled={loading}
          className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
          Maybe later
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // DESKTOP layout  (≥ lg) — centred card, side-by-side columns
  // ─────────────────────────────────────────────────────────────────
  const DesktopLayout = () => (
    <div className="hidden lg:flex min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex">

        {/* Left panel — gradient, branding, pricing */}
        <div className="relative w-80 shrink-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-8 flex flex-col text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="relative flex-1 flex flex-col">
            {/* Logo / back */}
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-8 transition-colors self-start">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            {/* Icon + heading */}
            <div className="h-14 w-14 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center mb-5">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold leading-tight mb-2">Unlock More<br />Interview Questions</h1>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Your {FREE_QUOTA} free questions have been used. Pay once and get {PAID_BATCH} more across all sessions.
            </p>

            {/* Pricing */}
            <div className="mt-auto pt-8">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">One-time top-up</p>
              <p className="text-4xl font-extrabold leading-none">
                {DOWNLOAD_CURRENCY}<br />{DOWNLOAD_AMOUNT.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <PricingBadge />
                <p className="text-xs text-indigo-200 leading-snug">questions<br />unlocked instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — features, table, CTA */}
        <div className="flex-1 flex flex-col p-8">
          <h2 className="text-base font-bold text-slate-800 mb-5">What you get</h2>
          <div className="space-y-3 mb-6">
            {features.map(({ icon: Icon, label, color, bg }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                </div>
                <p className="text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </div>

          <div className="mb-6"><ComparisonTable /></div>

          <div className="mt-auto space-y-3">
            <PayButton className="w-full h-12 rounded-2xl text-base" />
            <button onClick={() => router.back()} disabled={loading}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileLayout />
      <DesktopLayout />
    </>
  );
}

export default function InterviewUpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}
