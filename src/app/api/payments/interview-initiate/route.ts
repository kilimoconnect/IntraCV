import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateTxRef, DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY } from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name, redirectUrl } = await req.json();
    if (!email) return NextResponse.json({ error: "Customer email is required" }, { status: 400 });

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });

    const txRef = generateTxRef(user.id);

    // ── Create Flutterwave Standard (hosted) payment link ──
    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: DOWNLOAD_AMOUNT,
        currency: DOWNLOAD_CURRENCY,
        redirect_url: redirectUrl,
        payment_options: "card",
        customer: { email, name: name || "FuseCV User" },
        customizations: {
          title: "FuseCV — Interview Questions",
          description: "Unlock 20 more AI-powered interview questions",
        },
      }),
    });

    const flwJson = await flwRes.json();
    if (flwJson.status !== "success" || !flwJson.data?.link) {
      console.error("Flutterwave initiate error:", flwJson);
      return NextResponse.json({ error: flwJson.message || "Failed to create payment link" }, { status: 500 });
    }

    return NextResponse.json({ link: flwJson.data.link, txRef });
  } catch (err: any) {
    console.error("Interview initiate error:", err);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
