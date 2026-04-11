"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowLeft } from "lucide-react";

interface Props {
  verified: boolean;
  errorMsg: string;
  remaining: number | null;
  paidBatch: number;
}

export default function InterviewCallbackClient({ verified, errorMsg, remaining, paidBatch }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!verified) return;
    // Store unlock info so interview-prep can show success toast + refresh quota
    sessionStorage.setItem("fusecv-interview-unlocked", String(remaining ?? 0));
    router.push("/dashboard?tab=interview");
  }, [verified, remaining, router]);

  if (verified) {
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
          <p className="text-sm text-slate-500 mt-1">Redirecting to your interview prep…</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
            <p className="text-2xl font-extrabold text-indigo-600">+{paidBatch}</p>
            <p className="text-xs text-indigo-500 mt-0.5">Questions unlocked</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
            <p className="text-2xl font-extrabold text-emerald-600">
              {remaining !== null ? remaining : "—"}
            </p>
            <p className="text-xs text-emerald-500 mt-0.5">Total remaining</p>
          </div>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

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
        onClick={() => router.push("/dashboard?tab=interview")}
        variant="outline"
        className="rounded-xl border-slate-200 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Interview Prep
      </Button>
    </div>
  );
}
