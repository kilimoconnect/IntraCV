import { NextRequest, NextResponse } from "next/server";
import { getPesapalToken, getPesapalTransactionStatus } from "@/lib/pesapal-server";

// Pesapal calls this URL (GET) when a payment status changes.
// We must respond with the orderNotificationType.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get("orderTrackingId") || "";
  const orderNotificationType = searchParams.get("orderNotificationType") || "";

  console.log("[pesapal/ipn]", { orderTrackingId, orderNotificationType });

  try {
    if (orderTrackingId) {
      const token = await getPesapalToken();
      const { completed, statusDescription } = await getPesapalTransactionStatus(token, orderTrackingId);
      console.log("[pesapal/ipn] status:", statusDescription, "completed:", completed);
    }
  } catch (err) {
    console.error("[pesapal/ipn] error:", err);
  }

  // Pesapal requires this exact response
  return NextResponse.json({ orderNotificationType, orderTrackingId });
}
