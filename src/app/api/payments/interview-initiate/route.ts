import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateTxRef, DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY } from "@/lib/flutterwave";
import { createFlutterwavePaymentLink } from "@/lib/flutterwave-server";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name, redirectUrl } = await req.json();
    if (!email) return NextResponse.json({ error: "Customer email is required" }, { status: 400 });

    const txRef = generateTxRef(user.id);

    const link = await createFlutterwavePaymentLink({
      txRef,
      amount: DOWNLOAD_AMOUNT,
      currency: DOWNLOAD_CURRENCY,
      redirectUrl,
      email,
      name: name || "FuseCV User",
      title: "FuseCV — Interview Questions",
      description: "Unlock 20 more AI-powered interview questions",
    });

    return NextResponse.json({ link, txRef });
  } catch (err: any) {
    console.error("[interview-initiate] error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message || "Failed to initiate payment" }, { status: 500 });
  }
}
