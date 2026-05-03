import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { verifyV3Transaction } from "@/lib/flutterwave-server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendPurchaseEmail } from "@/lib/purchase-emails";
import { cancelFlow, scheduleFlow, resetFlow } from "@/lib/email-automation";
import CallbackClient from "../callback/callback-client";

export default async function CvFlutterwaveCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const transactionId = params.transaction_id;
  const txRef = params.tx_ref;
  const status = params.status;
  const plan = (params.plan ?? "starter") as "starter" | "professional" | "full";

  let verified = false;
  let errorMsg = "";
  let interviewQuotaGranted = false;
  let downloadTokenId: string | null = null;

  if (status === "cancelled") {
    errorMsg = "Payment was cancelled. No charges were made.";
  } else if (!transactionId) {
    errorMsg = "Missing payment details. Please contact support.";
  } else {
    try {
      const serverSupabase = await createServerSupabase();
      const { data: { user } } = await serverSupabase.auth.getUser();

      const { status: txStatus } = await verifyV3Transaction(transactionId);

      if (txStatus === "successful") {
        verified = true;

        if (user) {
          const admin = createAdminSupabase();

          // ── Issue one-time download token (idempotent on tx_ref) ──
          const { data: tokenRow } = await admin
            .from("cv_download_tokens")
            .upsert(
              { user_id: user.id, plan, order_tracking_id: txRef ?? transactionId },
              { onConflict: "order_tracking_id", ignoreDuplicates: true }
            )
            .select("id, used")
            .single();

          downloadTokenId = (tokenRow && !tokenRow.used) ? tokenRow.id : null;

          // ── Full Package — grant 20 interview questions ──
          if (plan === "full") {
            try {
              await admin.rpc("add_interview_paid_quota", { uid: user.id, n: 20 });
              interviewQuotaGranted = true;
            } catch (quotaErr) {
              console.error("[flw-cv-callback] Failed to grant interview quota:", quotaErr);
            }
          }

          // ── Send purchase confirmation email (first callback only) ──
          if (downloadTokenId) {
            const fullName = user.user_metadata?.full_name || "";
            try {
              await sendPurchaseEmail({ type: plan, toEmail: user.email!, toName: fullName });
            } catch (e) {
              console.error("[flw-cv-callback] email error:", e);
            }

            // ── Email automation ──
            try {
              await cancelFlow(user.id, "checkout_abandon");
              await cancelFlow(user.id, "payment_failed");
              await cancelFlow(user.id, "signup_no_purchase");
              await cancelFlow(user.id, "preview_no_purchase");
              await cancelFlow(user.id, "missing_info");
              await cancelFlow(user.id, "executive_prestige");
              await cancelFlow(user.id, "upload_started_no_finish");

              if (plan !== "full") {
                await scheduleFlow(user.id, "cv_purchased", { plan });
              }
              if (plan === "starter") {
                await scheduleFlow(user.id, "interview_upsell", { plan });
              }
              await resetFlow(user.id, "repeat_buyer", { plan });
            } catch (e) {
              console.error("[flw-cv-callback] automation flow error:", e);
            }
          }
        }
      } else {
        errorMsg = `Payment status: ${txStatus}. Please contact support if you were charged.`;

        const { data: { user } } = await serverSupabase.auth.getUser();
        if (user) {
          try { await scheduleFlow(user.id, "payment_failed"); } catch { /* ignore */ }
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
            <Loader2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800">FuseCV</span>
        </div>
        <div className="px-6 pb-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          }>
            <CallbackClient
              verified={verified}
              errorMsg={errorMsg}
              plan={plan}
              interviewQuotaGranted={interviewQuotaGranted}
              downloadTokenId={downloadTokenId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
