import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { getPesapalToken, getPesapalTransactionStatus } from "@/lib/pesapal-server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendPurchaseEmail } from "@/lib/purchase-emails";
import { cancelFlow } from "@/lib/email-automation";
import InterviewCallbackClient from "./callback-client";
import { FREE_QUOTA, PAID_BATCH } from "@/lib/interview-constants";

// Server Component — verification + quota grant happen during SSR,
// result is ready the moment HTML reaches the browser.
export default async function InterviewPaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const orderTrackingId = params.OrderTrackingId;
  const orderNotificationType = params.OrderNotificationType;

  let verified = false;
  let errorMsg = "";
  let remaining: number | null = null;

  if (orderNotificationType === "CANCELLED") {
    errorMsg = "Payment was cancelled. No charges were made.";
  } else if (!orderTrackingId) {
    errorMsg = "Missing payment details. Please contact support.";
  } else {
    try {
      // 1. Verify payment with Pesapal
      const token = await getPesapalToken();
      const { completed, statusDescription } = await getPesapalTransactionStatus(token, orderTrackingId);

      if (!completed) {
        errorMsg = statusDescription || "Payment not yet confirmed. Please contact support.";
      } else {
        // 2. Get user from session
        const serverSupabase = await createServerSupabase();
        const { data: { user } } = await serverSupabase.auth.getUser();

        if (!user) {
          errorMsg = "Session expired. Please log in and try again.";
        } else {
          // 3. Grant quota
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

          // ── Send purchase confirmation email ──
          // Must be awaited — unawaited promises are killed when the Server Component
          // finishes rendering and the serverless function terminates.
          const fullName = user.user_metadata?.full_name || "";
          try {
            await sendPurchaseEmail({
              type: "interview",
              toEmail: user.email!,
              toName: fullName,
            });
          } catch (e) {
            console.error("[interview-callback] email error:", e);
          }

          // ── Email automation: cancel all nurture + interview upsell flows ──
          try {
            await cancelFlow(user.id, "signup_no_purchase");
            await cancelFlow(user.id, "preview_no_purchase");
            await cancelFlow(user.id, "missing_info");
            await cancelFlow(user.id, "dormant");
            await cancelFlow(user.id, "interview_upsell");
            await cancelFlow(user.id, "cv_purchased"); // email 3 was interview nudge
          } catch (e) {
            console.error("[interview-callback] automation flow error:", e);
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
