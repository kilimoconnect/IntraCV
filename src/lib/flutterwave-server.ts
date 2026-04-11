/**
 * Server-only Flutterwave V4 helpers.
 * Uses Web Crypto API (globalThis.crypto) only — no Node.js "crypto" import
 * so this works in both Node.js and Edge runtimes.
 *
 * V4 production base: https://api.flutterwave.com
 * V4 endpoints: /customers, /payment-methods, /charges  (NO /v4/ prefix)
 */

// ─── Production base URL ──────────────────────────────────────────────────────
const V4_BASE = "https://api.flutterwave.com";

// ─── Credential helpers ───────────────────────────────────────────────────────

function getClientId(): string {
  const v = process.env.FLUTTERWAVE_CLIENT_ID;
  if (!v) throw new Error("FLUTTERWAVE_CLIENT_ID is not set");
  return v;
}

function getClientSecret(): string {
  const v = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!v) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return v;
}

function getEncryptionKey(): string {
  const v = process.env.FLW_ENCRYPTION_KEY;
  if (!v) throw new Error("FLW_ENCRYPTION_KEY is not set");
  return v;
}

// ─── Step 1: OAuth Token ──────────────────────────────────────────────────────

export async function getV4Token(): Promise<string> {
  const body = new URLSearchParams({
    client_id: getClientId(),
    client_secret: getClientSecret(),
    grant_type: "client_credentials",
  });

  const res = await fetch(
    "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`V4 token endpoint returned non-JSON: ${text.slice(0, 300)}`);
  }
  if (!json.access_token) {
    throw new Error(`Failed to get V4 token: ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

// ─── Step 2: Encryption (RSA-OAEP via Web Crypto API) ─────────────────────────
// V4 requires each card field encrypted individually with RSA-OAEP + SHA-256.
// Public key comes from the Flutterwave dashboard (FLW_RSA_PUBLIC_KEY env var).

/** Generate a 12-character alphanumeric nonce */
export function generateNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => chars[b % chars.length]).join("");
}

/**
 * Encrypt a single card field using RSA-OAEP + SHA-256.
 * Uses the RSA public key from FLW_RSA_PUBLIC_KEY env var.
 * Returns base64-encoded ciphertext.
 */
/**
 * Encrypt a single card field using AES-256-GCM.
 * Uses the 32-byte AES key from FLW_ENCRYPTION_KEY env var.
 * nonce: 12-char alphanumeric string used as IV (send alongside ciphertext).
 * Returns base64(ciphertext + 16-byte GCM auth tag).
 */
export async function encryptFieldRSA(value: string, nonce: string): Promise<string> {
  const keyBase64 = getEncryptionKey();
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  const iv = new TextEncoder().encode(nonce); // 12 ASCII bytes → valid AES-GCM IV

  const key = await globalThis.crypto.subtle.importKey(
    "raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]
  );

  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    new TextEncoder().encode(value)
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// ─── Step 3: Create Customer ──────────────────────────────────────────────────

export interface V4CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode: string;
  billingLine1: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

export async function createV4Customer(
  token: string,
  customerData: V4CustomerData
): Promise<string> {
  const res = await fetch(`${V4_BASE}/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": globalThis.crypto.randomUUID(),
      "X-Idempotency-Key": globalThis.crypto.randomUUID(),
    },
    body: JSON.stringify({
      email: customerData.email,
      name: { first: customerData.firstName, last: customerData.lastName || "User" },
      phone: { country_code: customerData.phoneCountryCode || "1", number: customerData.phone || "0000000000" },
      address: {
        line1: customerData.billingLine1,
        city: customerData.billingCity,
        state: customerData.billingState,
        postal_code: customerData.billingPostalCode,
        country: customerData.billingCountry,
      },
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`createV4Customer non-JSON: ${text.slice(0, 300)}`);
  }
  if (!json.id) throw new Error(`Failed to create V4 customer: ${JSON.stringify(json)}`);
  return json.id as string;
}

// ─── Step 4: Create Payment Method ───────────────────────────────────────────

export interface V4EncryptedCard {
  encrypted_card_number: string;
  encrypted_expiry_month: string;
  encrypted_expiry_year: string;
  encrypted_cvv: string;
  nonce: string;
}

export async function createV4PaymentMethod(
  token: string,
  encryptedCard: V4EncryptedCard
): Promise<string> {
  const res = await fetch(`${V4_BASE}/payment-methods`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": globalThis.crypto.randomUUID(),
      "X-Idempotency-Key": globalThis.crypto.randomUUID(),
    },
    body: JSON.stringify({
      type: "card",
      card: {
        encrypted_card_number: encryptedCard.encrypted_card_number,
        encrypted_expiry_month: encryptedCard.encrypted_expiry_month,
        encrypted_expiry_year: encryptedCard.encrypted_expiry_year,
        encrypted_cvv: encryptedCard.encrypted_cvv,
        nonce: encryptedCard.nonce,
      },
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`createV4PaymentMethod non-JSON: ${text.slice(0, 300)}`);
  }
  if (!json.id) throw new Error(`Failed to create V4 payment method: ${JSON.stringify(json)}`);
  return json.id as string;
}

// ─── Step 5: Initiate Charge ──────────────────────────────────────────────────

export interface V4ChargeData {
  reference: string;
  currency: string;
  amount: number;
  customerId: string;
  paymentMethodId: string;
  redirectUrl: string;
}

export interface V4ChargeResult {
  chargeId: string;
  nextAction: { type: string; url?: string; fields?: Record<string, unknown> };
  rawResponse: Record<string, unknown>;
}

function normalizeNextAction(nextAction: Record<string, unknown>): V4ChargeResult["nextAction"] {
  if (nextAction.type === "redirect_url" || nextAction.redirect_url) {
    const inner = nextAction.redirect_url as Record<string, unknown> | undefined;
    return {
      type: "redirect_url",
      url: (inner?.url ?? nextAction.url ?? nextAction.redirect_url) as string,
    };
  }
  if (nextAction.type === "requires_additional_fields") {
    return { type: "requires_additional_fields", fields: nextAction.fields as Record<string, unknown> };
  }
  return { type: (nextAction.type as string) ?? "unknown" };
}

export async function initiateV4Charge(
  token: string,
  chargeData: V4ChargeData
): Promise<V4ChargeResult> {
  const res = await fetch(`${V4_BASE}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": globalThis.crypto.randomUUID(),
      "X-Idempotency-Key": globalThis.crypto.randomUUID(),
    },
    body: JSON.stringify({
      reference: chargeData.reference,
      currency: chargeData.currency,
      amount: chargeData.amount,
      customer_id: chargeData.customerId,
      payment_method_id: chargeData.paymentMethodId,
      redirect_url: chargeData.redirectUrl,
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`initiateV4Charge non-JSON: ${text.slice(0, 300)}`);
  }

  const chargeId = (json.id ?? (json.data as Record<string, unknown>)?.id) as string | undefined;
  if (!chargeId) throw new Error(`Failed to initiate V4 charge: ${JSON.stringify(json)}`);

  const nextAction = (json.next_action ?? (json.data as Record<string, unknown>)?.next_action ?? {}) as Record<string, unknown>;

  return { chargeId: String(chargeId), nextAction: normalizeNextAction(nextAction), rawResponse: json };
}

// ─── Step 6: Handle AVS ───────────────────────────────────────────────────────

export async function submitV4Avs(
  token: string,
  chargeId: string,
  avsData: { billingLine1: string; billingCity: string; billingState: string; billingPostalCode: string; billingCountry: string }
): Promise<V4ChargeResult> {
  const res = await fetch(`${V4_BASE}/charges/${chargeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": globalThis.crypto.randomUUID(),
      "X-Idempotency-Key": globalThis.crypto.randomUUID(),
    },
    body: JSON.stringify({
      authorization: {
        type: "avs",
        avs: {
          line1: avsData.billingLine1,
          city: avsData.billingCity,
          state: avsData.billingState,
          postal_code: avsData.billingPostalCode,
          country: avsData.billingCountry,
        },
      },
    }),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`submitV4Avs non-JSON: ${text.slice(0, 300)}`);
  }

  const chargeIdOut = ((json.id ?? (json.data as Record<string, unknown>)?.id) as string | undefined) ?? chargeId;
  const nextAction = (json.next_action ?? (json.data as Record<string, unknown>)?.next_action ?? {}) as Record<string, unknown>;

  return { chargeId: String(chargeIdOut), nextAction: normalizeNextAction(nextAction), rawResponse: json };
}

// ─── Step 7: Get Charge Status ────────────────────────────────────────────────

export async function getV4Charge(
  token: string,
  chargeId: string
): Promise<{ status: string; rawResponse: Record<string, unknown> }> {
  const res = await fetch(`${V4_BASE}/charges/${chargeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": globalThis.crypto.randomUUID(),
    },
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(text); } catch {
    throw new Error(`getV4Charge non-JSON: ${text.slice(0, 300)}`);
  }

  const status = (json.status ?? (json.data as Record<string, unknown>)?.status ?? "unknown") as string;
  return { status, rawResponse: json };
}
