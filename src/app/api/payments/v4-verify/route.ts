import { NextRequest, NextResponse } from "next/server";
import { verifyV3Transaction } from "@/lib/flutterwave-server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

const PAID_BATCH = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // V3 Standard redirect returns transaction_id in callback URL
    const transactionId = searchParams.get("transaction_id");
    const type = searchParams.get("type") as "cv" | "interview" | null;

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
    }

    // Verify via V3 endpoint (using V4 OAuth token as Bearer)
    const { status, rawResponse } = await verifyV3Transaction(transactionId);

    if (status !== "successful") {
      return NextResponse.json(
        { verified: false, status, message: "Payment not yet confirmed" },
        { status: 400 }
      );
    }

    // ── CV payment: just verify and return ──
    if (!type || type === "cv") {
      return NextResponse.json({
        verified: true,
        status,
        transactionId,
        rawResponse,
      });
    }

    // ── Interview payment: also grant quota ──
    if (type === "interview") {
      const serverSupabase = await createServerSupabase();
      const {
        data: { user },
      } = await serverSupabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const admin = createAdminSupabase();
      await admin.rpc("add_interview_paid_quota", { uid: user.id, n: PAID_BATCH });

      const { data: profile } = await admin
        .from("profiles")
        .select("interview_questions_generated, interview_questions_paid_quota")
        .eq("id", user.id)
        .single();

      const generated = profile?.interview_questions_generated ?? 0;
      const paidQuota = profile?.interview_questions_paid_quota ?? 0;
      const totalAllowed = 5 + paidQuota;
      const remaining = Math.max(0, totalAllowed - generated);

      return NextResponse.json({
        verified: true,
        status,
        transactionId,
        usage: {
          generated,
          paidQuota,
          totalAllowed,
          remaining,
          freeQuota: 5,
          paidBatch: PAID_BATCH,
        },
      });
    }

    return NextResponse.json({ verified: true, status, transactionId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[v4-verify] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
