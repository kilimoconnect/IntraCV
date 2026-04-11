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

function getRsaPublicKey(): string {
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
/** Wrap a PKCS#1 RSA public key (DER) into an SPKI envelope so Web Crypto can import it */
function pkcs1ToSpki(pkcs1: Uint8Array): Uint8Array {
  // AlgorithmIdentifier: SEQUENCE { OID rsaEncryption (1.2.840.113549.1.1.1), NULL }
  const algId = new Uint8Array([
    0x30, 0x0d,
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00,
  ]);
  const encodeLen = (n: number): number[] =>
    n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, (n >> 8) & 0xff, n & 0xff];
  // BIT STRING: tag 0x03, length, 0x00 (no unused bits), then PKCS#1 bytes
  const bitStr = new Uint8Array([0x03, ...encodeLen(pkcs1.length + 1), 0x00, ...pkcs1]);
  const inner = new Uint8Array([...algId, ...bitStr]);
  return new Uint8Array([0x30, ...encodeLen(inner.length), ...inner]);
}

export async function encryptFieldRSA(value: string): Promise<string> {
  const raw = getRsaPublicKey();

  // Normalise: handle \n stored as literal backslash-n in Vercel env vars
  const normalised = raw.replace(/\\n/g, "\n").trim();

  // Strip PEM headers if present; otherwise treat as raw base64 DER
  const b64 = normalised.includes("-----")
    ? normalised.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")
    : normalised.replace(/\s+/g, "");

  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    throw new Error(`FLW_ENCRYPTION_KEY is not valid base64 (stripped length: ${b64.length})`);
  }

  // Try SPKI format first; if it fails, try wrapping as PKCS#1
  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await globalThis.crypto.subtle.importKey(
      "spki", keyBytes.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false, ["encrypt"]
    );
  } catch {
    // Fallback: treat as PKCS#1 RSA public key and wrap into SPKI
    try {
      const spkiBytes = pkcs1ToSpki(keyBytes);
      cryptoKey = await globalThis.crypto.subtle.importKey(
        "spki", spkiBytes.buffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false, ["encrypt"]
      );
    } catch (err2: unknown) {
      const msg = err2 instanceof Error ? err2.message : String(err2);
      throw new Error(
        `FLW_ENCRYPTION_KEY (${keyBytes.length} bytes) is not a valid RSA public key (tried SPKI and PKCS#1): ${msg}`
      );
    }
  }

  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
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
