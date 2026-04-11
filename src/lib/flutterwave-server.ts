/**
 * Server-only Flutterwave V3 helpers.
 * Uses the V3 secret key (FLWSECK-xxx) directly as Bearer token.
 * No OAuth exchange needed.
 */

const V3_BASE = "https://api.flutterwave.com/v3";

function getSecretKey(): string {
  const v = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!v) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return v;
}

// ─── Create a hosted payment link (Standard redirect) ─────────────────────────

export async function createPaymentLink(payload: {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  email: string;
  name: string;
  title: string;
  description: string;
}): Promise<string> {
  const res = await fetch(`${V3_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: payload.txRef,
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: payload.redirectUrl,
      payment_options: "card",
      customer: {
        email: payload.email,
        name: payload.name,
      },
      customizations: {
        title: payload.title,
        description: payload.description,
      },
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`createPaymentLink non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }

  const link = (json.data as Record<string, unknown>)?.link as string | undefined;
  if (!link) {
    throw new Error(`Failed to create payment link: ${JSON.stringify(json)}`);
  }
  return link;
}

// ─── Verify a completed transaction ──────────────────────────────────────────
// After V3 redirect, Flutterwave sends transaction_id in the callback URL.

export async function verifyV3Transaction(
  transactionId: string
): Promise<{ status: string; rawResponse: Record<string, unknown> }> {
  const res = await fetch(`${V3_BASE}/transactions/${transactionId}/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`verifyV3Transaction non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (json.data ?? {}) as Record<string, unknown>;
  const status = (data.status ?? json.status ?? "unknown") as string;
  return { status, rawResponse: json };
}
