/**
 * Server-only Flutterwave helpers (never import in client components).
 * Flutterwave V4 Client Secret is used directly as Bearer token — no
 * token exchange needed.
 */

function getSecretKey(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not set in environment");
  return key;
}

/** Create a hosted Standard payment link and return its URL */
export async function createFlutterwavePaymentLink(payload: {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  email: string;
  name: string;
  title: string;
  description: string;
}): Promise<string> {
  const secretKey = getSecretKey();

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: payload.txRef,
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: payload.redirectUrl,
      payment_options: "card",
      customer: { email: payload.email, name: payload.name },
      customizations: { title: payload.title, description: payload.description },
    }),
  });

  const json = await res.json();
  console.log("[flutterwave-server] payment link response:", JSON.stringify(json));

  if (json.status !== "success" || !json.data?.link) {
    throw new Error(json.message || json.error || "Flutterwave rejected the payment request");
  }

  return json.data.link as string;
}
