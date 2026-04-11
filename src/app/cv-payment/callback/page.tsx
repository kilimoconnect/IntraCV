"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Download, ArrowLeft } from "lucide-react";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  // V3 Standard redirect sends transaction_id, tx_ref, status in callback URL
  const transactionId = params.get("transaction_id");
  const status = params.get("status");

  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status && status !== "successful") {
      setState("error");
      setErrorMsg("Payment was not completed. No charges were made.");
      return;
    }

    if (!transactionId) {
      setState("error");
      setErrorMsg("Missing transaction details. Please contact support.");
      return;
    }

    fetch(`/api/payments/v4-verify?transaction_id=${encodeURIComponent(transactionId)}&type=cv`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          sessionStorage.setItem("fusecv-cv-paid", "1");
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
  }, [transactionId, status]);

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
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="rounded-xl border-slate-200 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Success
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">Payment Confirmed!</h2>
        <p className="text-sm text-slate-500 mt-1">Your CV download is ready.</p>
      </div>
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 w-full max-w-xs text-xs text-slate-600 space-y-2">
        <p className="flex gap-2"><span className="text-emerald-500">✓</span> Payment verified</p>
        <p className="flex gap-2"><span className="text-emerald-500">✓</span> No watermarks</p>
        <p className="flex gap-2"><span className="text-emerald-500">✓</span> Saved to your Documents</p>
      </div>
      <Button
        onClick={() => router.push("/dashboard")}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 shadow-sm gap-2 px-6"
      >
        <Download className="h-4 w-4" />
        Go Back &amp; Download CV
      </Button>
    </div>
  );
}

export default function CvPaymentCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2" />
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Download className="h-4 w-4 text-white" />
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
