/**
 * Server-only Flutterwave V4 helpers (never import in client components).
 * Implements the full V4 card payment flow:
 *   1. OAuth token exchange
 *   2. AES-256-GCM card field encryption
 *   3. Customer creation
 *   4. Payment method creation
 *   5. Charge initiation
 *   6. Charge status retrieval
 */

import crypto from "crypto";

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

function getEncryptionKey(): Buffer {
  const v = process.env.FLW_ENCRYPTION_KEY;
  if (!v) throw new Error("FLW_ENCRYPTION_KEY is not set");
  return Buffer.from(v, "base64");
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

  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Failed to get V4 token: ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

// ─── Step 2: Encryption helpers ───────────────────────────────────────────────

/** Generate a 12-character alphanumeric nonce */
export function generateNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    nonce += chars[bytes[i] % chars.length];
  }
  return nonce;
}

/**
 * Encrypt a single card field using AES-256-GCM.
 * The nonce is used as the IV (converted to 12-byte buffer from UTF-8).
 * Auth tag (16 bytes) is appended to the ciphertext, then the whole thing is base64-encoded.
 */
export function encryptField(data: string, keyBase64: string, nonce: string): string {
  const key = Buffer.from(keyBase64, "base64");
  const iv = Buffer.from(nonce, "utf8"); // 12 bytes (nonce is 12 chars)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes
  const combined = Buffer.concat([encrypted, authTag]);
  return combined.toString("base64");
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
  const res = await fetch("https://api.flutterwave.com/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      email: customerData.email,
      name: {
        first: customerData.firstName,
        last: customerData.lastName || "User",
      },
      phone: {
        country_code: customerData.phoneCountryCode || "1",
        number: customerData.phone || "0000000000",
      },
      address: {
        line1: customerData.billingLine1,
        city: customerData.billingCity,
        state: customerData.billingState,
        postal_code: customerData.billingPostalCode,
        country: customerData.billingCountry,
      },
    }),
  });

  const json = await res.json();
  if (!json.id) {
    throw new Error(`Failed to create V4 customer: ${JSON.stringify(json)}`);
  }
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
  const res = await fetch("https://api.flutterwave.com/payment-methods", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
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

  const json = await res.json();
  if (!json.id) {
    throw new Error(`Failed to create V4 payment method: ${JSON.stringify(json)}`);
  }
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
  nextAction: {
    type: string;
    url?: string;
    fields?: Record<string, unknown>;
  };
  rawResponse: Record<string, unknown>;
}

export async function initiateV4Charge(
  token: string,
  chargeData: V4ChargeData
): Promise<V4ChargeResult> {
  const res = await fetch("https://api.flutterwave.com/charges", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
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

  const json = await res.json();
  const chargeId = json.id ?? json.data?.id;
  if (!chargeId) {
    throw new Error(`Failed to initiate V4 charge: ${JSON.stringify(json)}`);
  }

  const nextAction = json.next_action ?? json.data?.next_action ?? {};
  let nextActionNormalized: V4ChargeResult["nextAction"];

  if (nextAction.type === "redirect_url" || nextAction.redirect_url) {
    nextActionNormalized = {
      type: "redirect_url",
      url: nextAction.redirect_url?.url ?? nextAction.url ?? nextAction.redirect_url,
    };
  } else if (nextAction.type === "requires_additional_fields") {
    nextActionNormalized = {
      type: "requires_additional_fields",
      fields: nextAction.fields,
    };
  } else {
    // Unknown / already succeeded
    nextActionNormalized = { type: nextAction.type ?? "unknown" };
  }

  return {
    chargeId: String(chargeId),
    nextAction: nextActionNormalized,
    rawResponse: json,
  };
}

// ─── Step 6: Handle AVS (requires_additional_fields) ─────────────────────────

export interface V4AvsData {
  billingLine1: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

export async function submitV4Avs(
  token: string,
  chargeId: string,
  avsData: V4AvsData
): Promise<V4ChargeResult> {
  const res = await fetch(`https://api.flutterwave.com/charges/${chargeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      billing_address: {
        line1: avsData.billingLine1,
        city: avsData.billingCity,
        state: avsData.billingState,
        postal_code: avsData.billingPostalCode,
        country: avsData.billingCountry,
      },
    }),
  });

  const json = await res.json();
  const chargeIdOut = json.id ?? json.data?.id ?? chargeId;
  const nextAction = json.next_action ?? json.data?.next_action ?? {};
  let nextActionNormalized: V4ChargeResult["nextAction"];

  if (nextAction.type === "redirect_url" || nextAction.redirect_url) {
    nextActionNormalized = {
      type: "redirect_url",
      url: nextAction.redirect_url?.url ?? nextAction.url ?? nextAction.redirect_url,
    };
  } else {
    nextActionNormalized = { type: nextAction.type ?? "unknown" };
  }

  return {
    chargeId: String(chargeIdOut),
    nextAction: nextActionNormalized,
    rawResponse: json,
  };
}

// ─── Step 7: Get Charge Status ────────────────────────────────────────────────

export async function getV4Charge(
  token: string,
  chargeId: string
): Promise<{ status: string; rawResponse: Record<string, unknown> }> {
  const res = await fetch(`https://api.flutterwave.com/charges/${chargeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  const status = json.status ?? json.data?.status ?? "unknown";
  return { status: String(status), rawResponse: json };
}
