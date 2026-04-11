/**
 * Server-only Pesapal V3 helpers.
 * Docs: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference
 */

const PESAPAL_BASE = "https://pay.pesapal.com/v3/api";

function getConsumerKey(): string {
  const v = process.env.PESAPAL_CONSUMER_KEY;
  if (!v) throw new Error("PESAPAL_CONSUMER_KEY is not set");
  return v;
}

function getConsumerSecret(): string {
  const v = process.env.PESAPAL_CONSUMER_SECRET;
  if (!v) throw new Error("PESAPAL_CONSUMER_SECRET is not set");
  return v;
}

// ─── Auth Token ───────────────────────────────────────────────────────────────

export async function getPesapalToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: getConsumerKey(),
      consumer_secret: getConsumerSecret(),
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Pesapal auth non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }
  if (!json.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(json)}`);
  return json.token as string;
}

// ─── Register IPN URL ─────────────────────────────────────────────────────────
// Returns the ipn_id needed for every order submission.

export async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Pesapal IPN register non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }
  const ipnId = json.ipn_id as string | undefined;
  if (!ipnId) throw new Error(`Pesapal IPN register failed: ${JSON.stringify(json)}`);
  return ipnId;
}

// ─── Submit Order ─────────────────────────────────────────────────────────────

export interface PesapalOrderPayload {
  id: string;           // unique merchant reference
  currency: string;
  amount: number;
  description: string;
  callbackUrl: string;
  ipnId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PesapalOrderResult {
  orderTrackingId: string;
  merchantReference: string;
  redirectUrl: string;
}

export async function submitPesapalOrder(
  token: string,
  payload: PesapalOrderPayload
): Promise<PesapalOrderResult> {
  const res = await fetch(`${PESAPAL_BASE}/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      id: payload.id,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      callback_url: payload.callbackUrl,
      notification_id: payload.ipnId,
      billing_address: {
        email_address: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName || "User",
      },
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Pesapal submitOrder non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }
  const redirectUrl = json.redirect_url as string | undefined;
  if (!redirectUrl) throw new Error(`Pesapal submitOrder failed: ${JSON.stringify(json)}`);

  return {
    orderTrackingId: json.order_tracking_id as string,
    merchantReference: json.merchant_reference as string,
    redirectUrl,
  };
}

// ─── Get Transaction Status ───────────────────────────────────────────────────
// status_code: 1 = Completed, 0 = Invalid, 2 = Failed, 3 = Reversed

export async function getPesapalTransactionStatus(
  token: string,
  orderTrackingId: string
): Promise<{ completed: boolean; statusDescription: string; rawResponse: Record<string, unknown> }> {
  const res = await fetch(
    `${PESAPAL_BASE}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Pesapal getStatus non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }

  const statusCode = json.status_code as number | undefined;
  const statusDescription = (json.payment_status_description ?? json.message ?? "Unknown") as string;

  return {
    completed: statusCode === 1,
    statusDescription,
    rawResponse: json,
  };
}

// ─── One-shot: create payment link ───────────────────────────────────────────
// Registers IPN, submits order, returns redirect URL.

export async function createPesapalPaymentLink(payload: {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callbackUrl: string;
  ipnBaseUrl: string;   // e.g. https://yoursite.com
  email: string;
  firstName: string;
  lastName: string;
}): Promise<{ redirectUrl: string; orderTrackingId: string }> {
  const token = await getPesapalToken();
  const ipnUrl = `${payload.ipnBaseUrl}/api/payments/pesapal/ipn`;
  const ipnId = await registerIPN(token, ipnUrl);
  const result = await submitPesapalOrder(token, {
    id: payload.id,
    currency: payload.currency,
    amount: payload.amount,
    description: payload.description,
    callbackUrl: payload.callbackUrl,
    ipnId,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
  });
  return { redirectUrl: result.redirectUrl, orderTrackingId: result.orderTrackingId };
}
