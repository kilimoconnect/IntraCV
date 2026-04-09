import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateTxRef, DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY } from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name, redirectUrl } = await req.json();
    if (!email) return NextResponse.json({ error: "Customer email is required" }, { status: 400 });

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      console.error("[cv-download-initiate] FLUTTERWAVE_SECRET_KEY is not set in environment");
      return NextResponse.json({ error: "FLUTTERWAVE_SECRET_KEY not configured on server" }, { status: 500 });
    }

    const txRef = generateTxRef(user.id);

    console.log("[cv-download-initiate] Calling Flutterwave with amount:", DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY);

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
          title: "FuseCV — Download CV",
          description: "Download your professional CV as a clean, watermark-free PDF",
        },
      }),
    });

    const flwJson = await flwRes.json();
    console.log("[cv-download-initiate] Flutterwave response:", JSON.stringify(flwJson));

    if (flwJson.status !== "success" || !flwJson.data?.link) {
      return NextResponse.json(
        { error: flwJson.message || flwJson.error || "Flutterwave rejected the request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ link: flwJson.data.link, txRef });
  } catch (err: any) {
    console.error("[cv-download-initiate] Unexpected error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message || "Failed to initiate payment" }, { status: 500 });
  }
}
