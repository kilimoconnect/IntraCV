"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowLeft } from "lucide-react";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Pesapal redirect sends OrderTrackingId in the callback URL
  const orderTrackingId = params.get("OrderTrackingId");
  const orderNotificationType = params.get("OrderNotificationType");

  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (orderNotificationType === "CANCELLED") {
      setState("error");
      setErrorMsg("Payment was cancelled. No charges were made.");
      return;
    }

    if (!orderTrackingId) {
      setState("error");
      setErrorMsg("Missing payment details. Please contact support.");
      return;
    }

    fetch(`/api/payments/v4-verify?OrderTrackingId=${encodeURIComponent(orderTrackingId)}&type=interview`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          setRemaining(data.usage?.remaining ?? null);
          setState("success");
        } else {
          setErrorMsg(data.message || data.error || "Verification failed. Please contact support.");
          setState("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error during verification. Please contact support.");
        setState("error");
      });
  }, [orderTrackingId, orderNotificationType]);

  const goToDashboard = () => router.push("/dashboard?tab=interview");

  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
          <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">Verifying your payment…</h2>
          <p className="text-sm text-slate-500 mt-1">Please wait, this only takes a moment.</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">Payment Not Confirmed</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">{errorMsg}</p>
        </div>
        <Button onClick={goToDashboard} variant="outline" className="rounded-xl border-slate-200 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Interview Prep
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Payment Confirmed!</h2>
        <p className="text-sm text-slate-500 mt-1">Your questions have been unlocked successfully.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
          <p className="text-2xl font-extrabold text-indigo-600">+20</p>
          <p className="text-xs text-indigo-500 mt-0.5">Questions unlocked</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
          <p className="text-2xl font-extrabold text-emerald-600">
            {remaining !== null ? remaining : "—"}
          </p>
          <p className="text-xs text-emerald-500 mt-0.5">Total remaining</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 w-full max-w-xs text-sm text-slate-600 space-y-2">
        <p className="font-semibold text-slate-700 text-xs uppercase tracking-wider">What&apos;s next</p>
        <p className="flex gap-2 text-xs"><span className="text-emerald-500">✓</span> Generate new interview sessions</p>
        <p className="flex gap-2 text-xs"><span className="text-emerald-500">✓</span> Add more questions to existing sessions</p>
        <p className="flex gap-2 text-xs"><span className="text-emerald-500">✓</span> Questions work across all sessions</p>
      </div>

      <Button
        onClick={goToDashboard}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 shadow-sm shadow-indigo-200 gap-2 px-6"
      >
        <Sparkles className="h-4 w-4" />
        Start Practising
      </Button>
    </div>
  );
}

export default function InterviewPaymentCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2" />
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800">FuseCV</span>
        </div>
        <div className="px-6 pb-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            }
          >
            <CallbackContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
