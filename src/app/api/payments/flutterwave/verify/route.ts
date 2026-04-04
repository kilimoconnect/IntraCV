import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transaction_id, tx_ref, expected_amount, expected_currency } = await req.json();

    if (!transaction_id) {
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const json = await res.json();

    if (json.status !== "success" || json.data?.status !== "successful") {
      return NextResponse.json(
        { verified: false, message: json.message || "Payment not successful" },
        { status: 400 }
      );
    }

    const data = json.data;

    // Guard: tx_ref must match what we generated
    if (tx_ref && data.tx_ref !== tx_ref) {
      return NextResponse.json({ verified: false, message: "Transaction reference mismatch" }, { status: 400 });
    }

    // Guard: amount must be >= expected (allow small float drift)
    if (expected_amount && data.amount < expected_amount * 0.99) {
      return NextResponse.json({ verified: false, message: "Amount mismatch" }, { status: 400 });
    }

    // Guard: currency must match
    if (expected_currency && data.currency !== expected_currency) {
      return NextResponse.json({ verified: false, message: "Currency mismatch" }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      transaction_id: data.id,
      tx_ref: data.tx_ref,
      amount: data.amount,
      currency: data.currency,
      customer: data.customer,
    });
  } catch (err) {
    console.error("Flutterwave verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
