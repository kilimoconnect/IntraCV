import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { verifyV3Transaction } from "@/lib/flutterwave-server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendPurchaseEmail } from "@/lib/purchase-emails";
import { cancelFlow } from "@/lib/email-automation";
import InterviewCallbackClient from "../callback/callback-client";
import { FREE_QUOTA, PAID_BATCH } from "@/lib/interview-constants";

export default async function InterviewFlutterwaveCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const transactionId = params.transaction_id;
  const status = params.status;

  let verified = false;
  let errorMsg = "";
  let remaining: number | null = null;

  if (status === "cancelled") {
    errorMsg = "Payment was cancelled. No charges were made.";
  } else if (!transactionId) {
    errorMsg = "Missing payment details. Please contact support.";
  } else {
    try {
      const { status: txStatus } = await verifyV3Transaction(transactionId);

      if (txStatus !== "successful") {
        errorMsg = `Payment status: ${txStatus}. Please contact support if you were charged.`;
      } else {
        const serverSupabase = await createServerSupabase();
        const { data: { user } } = await serverSupabase.auth.getUser();

        if (!user) {
          errorMsg = "Session expired. Please log in and try again.";
        } else {
          const admin = createAdminSupabase();
          await admin.rpc("add_interview_paid_quota", { uid: user.id, n: PAID_BATCH });

          const { data: profile } = await admin
            .from("profiles")
            .select("interview_questions_generated, interview_questions_paid_quota")
            .eq("id", user.id)
            .single();

          const generated = profile?.interview_questions_generated ?? 0;
          const paidQuota = profile?.interview_questions_paid_quota ?? 0;
          remaining = Math.max(0, FREE_QUOTA + paidQuota - generated);
          verified = true;

          const fullName = user.user_metadata?.full_name || "";
          try {
            await sendPurchaseEmail({ type: "interview", toEmail: user.email!, toName: fullName });
          } catch (e) {
            console.error("[flw-interview-callback] email error:", e);
          }

          try {
            await cancelFlow(user.id, "checkout_abandon");
            await cancelFlow(user.id, "signup_no_purchase");
            await cancelFlow(user.id, "preview_no_purchase");
            await cancelFlow(user.id, "missing_info");
            await cancelFlow(user.id, "executive_prestige");
            await cancelFlow(user.id, "upload_started_no_finish");
            await cancelFlow(user.id, "interview_upsell");
            await cancelFlow(user.id, "cv_purchased");
          } catch (e) {
            console.error("[flw-interview-callback] automation flow error:", e);
          }
        }
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : "Verification failed. Please contact support.";
    }
  }

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
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          }>
            <InterviewCallbackClient
              verified={verified}
              errorMsg={errorMsg}
              remaining={remaining}
              paidBatch={PAID_BATCH}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
