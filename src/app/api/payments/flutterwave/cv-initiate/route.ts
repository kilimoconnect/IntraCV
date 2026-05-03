import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateTxRef } from "@/lib/flutterwave";
import { createPaymentLink } from "@/lib/flutterwave-server";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, name, redirectUrl, amount } = await req.json();
    if (!email) return NextResponse.json({ error: "Customer email is required" }, { status: 400 });

    const VALID_AMOUNTS = [5, 7, 10];
    const chargeAmount = VALID_AMOUNTS.includes(Number(amount)) ? Number(amount) : 5;

    const txRef = generateTxRef(user.id);

    const link = await createPaymentLink({
      txRef,
      amount: chargeAmount,
      currency: "USD",
      redirectUrl,
      email,
      name: name || "FuseCV User",
      title: "FuseCV — CV Download",
      description: "FuseCV plan — CV download and optional extras",
    });

    return NextResponse.json({ link, txRef });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate payment";
    console.error("[flutterwave/cv-initiate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
