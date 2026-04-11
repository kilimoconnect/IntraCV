import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getPesapalToken, getPesapalTransactionStatus } from "@/lib/pesapal-server";
import CallbackClient from "./callback-client";

// Server Component — verification happens during SSR so the result is
// ready the moment the HTML reaches the browser (no client fetch needed).
export default async function CvPaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const orderTrackingId = params.OrderTrackingId;
  const orderNotificationType = params.OrderNotificationType;

  let verified = false;
  let errorMsg = "";

  if (orderNotificationType === "CANCELLED") {
    errorMsg = "Payment was cancelled. No charges were made.";
  } else if (!orderTrackingId) {
    errorMsg = "Missing payment details. Please contact support.";
  } else {
    try {
      const token = await getPesapalToken();
      const { completed, statusDescription } = await getPesapalTransactionStatus(
        token,
        orderTrackingId
      );
      if (completed) {
        verified = true;
      } else {
        errorMsg = statusDescription || "Payment not yet confirmed. Please contact support.";
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
            <CallbackClient verified={verified} errorMsg={errorMsg} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
