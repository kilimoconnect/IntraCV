import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { FREE_QUOTA, PAID_BATCH } from "@/lib/interview-constants";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transaction_id, tx_ref, expected_amount, expected_currency } = await req.json();

    if (!transaction_id) {
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // ── Verify with Flutterwave ──
    const flwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      }
    );
    const flwJson = await flwRes.json();

    if (flwJson.status !== "success" || flwJson.data?.status !== "successful") {
      return NextResponse.json(
        { verified: false, message: flwJson.message || "Payment not successful" },
        { status: 400 }
      );
    }

    const data = flwJson.data;

    if (tx_ref && data.tx_ref !== tx_ref) {
      return NextResponse.json({ verified: false, message: "Transaction reference mismatch" }, { status: 400 });
    }
    if (expected_amount && data.amount < expected_amount * 0.99) {
      return NextResponse.json({ verified: false, message: "Amount mismatch" }, { status: 400 });
    }
    if (expected_currency && data.currency !== expected_currency) {
      return NextResponse.json({ verified: false, message: "Currency mismatch" }, { status: 400 });
    }

    // ── Grant quota ──
    const admin = createAdminSupabase();
    await admin.rpc("add_interview_paid_quota", { uid: user.id, n: PAID_BATCH });

    // Return updated usage so client can refresh
    const { data: profile } = await admin
      .from("profiles")
      .select("interview_questions_generated, interview_questions_paid_quota")
      .eq("id", user.id)
      .single();

    const generated = profile?.interview_questions_generated ?? 0;
    const paidQuota = profile?.interview_questions_paid_quota ?? 0;
    const totalAllowed = FREE_QUOTA + paidQuota;
    const remaining = Math.max(0, totalAllowed - generated);

    return NextResponse.json({
      verified: true,
      usage: { generated, paidQuota, totalAllowed, remaining, freeQuota: FREE_QUOTA, paidBatch: PAID_BATCH },
    });
  } catch (err: any) {
    console.error("Interview unlock error:", err);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
