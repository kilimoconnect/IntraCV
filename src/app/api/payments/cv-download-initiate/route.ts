import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateTxRef } from "@/lib/flutterwave";
import { createPesapalPaymentLink } from "@/lib/pesapal-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name, redirectUrl, amount } = await req.json();
    if (!email) return NextResponse.json({ error: "Customer email is required" }, { status: 400 });

    const VALID_AMOUNTS = [0.5, 1, 1.5];
    const chargeAmount = VALID_AMOUNTS.includes(Number(amount)) ? Number(amount) : 0.5;

    const txRef = generateTxRef(user.id);
    const nameParts = (name || "FuseCV User").trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "User";

    const base = process.env.NEXT_PUBLIC_SITE_URL || siteUrl;
    const { redirectUrl: link, orderTrackingId } = await createPesapalPaymentLink({
      id: txRef,
      currency: "USD",
      amount: chargeAmount,
      description: "FuseCV plan — CV download and optional extras",
      callbackUrl: redirectUrl,
      ipnBaseUrl: base,
      email,
      firstName,
      lastName,
    });

    return NextResponse.json({ link, txRef, orderTrackingId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate payment";
    console.error("[cv-download-initiate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
