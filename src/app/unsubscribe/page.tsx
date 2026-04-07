"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MailX, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "done" | "error";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<PageShell><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div></PageShell>}>
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [status, setStatus] = useState<Status>("idle");
  const [resubscribed, setResubscribed] = useState(false);

  // Auto-trigger unsubscribe when the page loads with an email param
  useEffect(() => {
    if (email) handleUnsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function handleUnsubscribe() {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function handleResubscribe() {
    setResubscribed(true);
    await fetch("/api/auth/unsubscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }

  return (
    <div className="min-h-screen bg-[#F0F2F8] flex flex-col">

      {/* ── Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur-sm group-hover:blur-md transition-all" />
            <Image src="/icon.svg" alt="FuseCV" width={30} height={30} className="relative rounded-lg" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            FuseCV
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* ── Main card ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-8 text-center space-y-5">

            {/* Loading */}
            {status === "loading" && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Updating your preferences…</h1>
                  <p className="text-sm text-slate-500 mt-1">Just a moment</p>
                </div>
              </>
            )}

            {/* No email param — show manual form */}
            {status === "idle" && !email && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <MailX className="h-8 w-8 text-slate-500" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Unsubscribe from FuseCV emails</h1>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Use the unsubscribe link in any FuseCV email to be removed automatically, or contact us at{" "}
                    <a href="mailto:privacy@fusecv.com" className="text-indigo-600 hover:underline font-medium">
                      privacy@fusecv.com
                    </a>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-0">
                      Go to FuseCV
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Success */}
            {status === "done" && !resubscribed && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">You&apos;ve been unsubscribed</h1>
                  {email && (
                    <p className="text-sm font-medium text-slate-500 mt-1 truncate">{email}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                    You won&apos;t receive marketing or welcome emails from FuseCV anymore.
                    <br />
                    <span className="text-xs text-slate-400 mt-1 block">
                      Note: Account security emails (password resets, email confirmations) will still be sent as they are required to keep your account secure.
                    </span>
                  </p>
                </div>

                {/* Re-subscribe option */}
                <div className="pt-1 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
                    onClick={handleResubscribe}
                  >
                    <MailCheck className="h-4 w-4 mr-2 text-indigo-500" />
                    Undo — keep me subscribed
                  </Button>
                  <Link href="/dashboard">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-0 text-sm">
                      Go to my Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Re-subscribed */}
            {resubscribed && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center border border-indigo-200">
                    <MailCheck className="h-9 w-9 text-indigo-500" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">You&apos;re back!</h1>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Your email preferences have been restored. We&apos;re glad you&apos;re staying.
                  </p>
                </div>
                <div className="pt-1">
                  <Link href="/dashboard">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-0">
                      Go to my Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Error */}
            {status === "error" && (
              <>
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center border border-red-200">
                    <MailX className="h-9 w-9 text-red-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Something went wrong</h1>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We couldn&apos;t update your preferences right now. Please try again or contact us at{" "}
                    <a href="mailto:privacy@fusecv.com" className="text-indigo-600 hover:underline font-medium">
                      privacy@fusecv.com
                    </a>.
                  </p>
                </div>
                <div className="pt-1 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={handleUnsubscribe}
                  >
                    Try again
                  </Button>
                </div>
              </>
            )}

          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400 text-center mt-5 leading-relaxed">
            FuseCV — AI-Powered CV Builder ·{" "}
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F8] flex flex-col">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon.svg" alt="FuseCV" width={30} height={30} className="rounded-lg" />
          <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">FuseCV</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">{children}</div>
    </div>
  );
}
