import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateTxRef, DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY } from "@/lib/flutterwave";
import { createPaymentLink } from "@/lib/flutterwave-server";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name, redirectUrl } = await req.json();
    if (!email) return NextResponse.json({ error: "Customer email is required" }, { status: 400 });

    const txRef = generateTxRef(user.id);
    const link = await createPaymentLink({
      txRef,
      amount: DOWNLOAD_AMOUNT,
      currency: DOWNLOAD_CURRENCY,
      redirectUrl,
      email,
      name: name || "FuseCV User",
      title: "FuseCV — Download CV",
      description: "Download your professional CV as a clean, watermark-free PDF",
    });

    return NextResponse.json({ link, txRef });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate payment";
    console.error("[cv-download-initiate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
