/**
 * Server-only Flutterwave helpers (never import in client components).
 * Flutterwave V4 uses OAuth: exchange Client ID + Client Secret for an
 * access token, then use that token as Bearer for all API calls.
 */

/** Exchange V4 Client ID + Client Secret for a short-lived access token */
export async function getFlutterwaveToken(): Promise<string> {
  const clientId = process.env.FLUTTERWAVE_CLIENT_ID;
  const clientSecret = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new Error(
      "FLUTTERWAVE_CLIENT_ID or FLUTTERWAVE_SECRET_KEY is not set in environment"
    );
  }

  const res = await fetch("https://api.flutterwave.com/v4/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  const json = await res.json();
  console.log("[flutterwave-server] token response:", JSON.stringify(json));

  const token = json.data?.access_token ?? json.access_token;
  if (!token) {
    throw new Error(json.message || json.error || "Failed to obtain Flutterwave access token");
  }

  return token as string;
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
  const token = await getFlutterwaveToken();

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
