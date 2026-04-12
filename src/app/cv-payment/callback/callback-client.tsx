"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";

interface Props {
  verified: boolean;
  errorMsg: string;
  plan: "starter" | "professional" | "full";
  interviewQuotaGranted?: boolean;
  downloadTokenId?: string | null;
}

export default function CallbackClient({ verified, errorMsg, plan, downloadTokenId }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!verified) return;
    // Store the server-issued one-time token (replaces the easily-faked "1" flag)
    if (downloadTokenId) {
      sessionStorage.setItem("fusecv-cv-token", downloadTokenId);
    }
    sessionStorage.setItem("fusecv-cv-plan", plan);
    sessionStorage.setItem("fusecv-auto-download", "1");
    // Interview quota is granted server-side silently — no toast/redirect needed
    router.push("/dashboard?tab=studio");
  }, [verified, downloadTokenId, plan, router]);

  if (verified) {
    const bullets = [
      "Payment verified",
      "Watermark-free CV download",
      plan === "professional" || plan === "full" ? "Cover letter activated" : null,
      plan === "full" ? "20 interview questions unlocked" : null,
      "Saved to your Documents",
    ].filter(Boolean) as string[];

    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Payment Confirmed!</h2>
          <p className="text-sm text-slate-500 mt-1">Redirecting and starting your download…</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 w-full max-w-xs text-xs text-slate-600 space-y-2">
          {bullets.map((b) => (
            <p key={b} className="flex gap-2"><span className="text-emerald-500">✓</span> {b}</p>
          ))}
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
        onClick={() => router.push("/dashboard?tab=studio")}
        variant="outline"
        className="rounded-xl border-slate-200 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CV
      </Button>
    </div>
  );
}
