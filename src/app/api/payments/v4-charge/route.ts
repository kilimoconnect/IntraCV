import { NextRequest, NextResponse } from "next/server";
import {
  getV4Token,
  generateNonce,
  encryptFieldRSA,
  createV4Customer,
  createV4PaymentMethod,
  initiateV4Charge,
  submitV4Avs,
} from "@/lib/flutterwave-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
      billingLine1,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      email,
      phone,
      amount,
      currency,
      redirectUrl,
      reference,
    } = body as {
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
      cardholderName: string;
      billingLine1: string;
      billingCity: string;
      billingState: string;
      billingPostalCode: string;
      billingCountry: string;
      email: string;
      phone: string;
      amount: number;
      currency: string;
      redirectUrl: string;
      reference: string;
      paymentType: "cv" | "interview";
    };

    // Validate required fields
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !email || !amount || !currency || !redirectUrl || !reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Get OAuth token
    const token = await getV4Token();

    // Step 2: Encrypt card fields with AES-256-GCM using FLW_ENCRYPTION_KEY
    const nonce = generateNonce();
    const [encrypted_card_number, encrypted_expiry_month, encrypted_expiry_year, encrypted_cvv] =
      await Promise.all([
        encryptFieldRSA(cardNumber.replace(/\s/g, ""), nonce),
        encryptFieldRSA(expiryMonth, nonce),
        encryptFieldRSA(expiryYear, nonce),
        encryptFieldRSA(cvv, nonce),
      ]);

    // Step 3: Create customer
    const nameParts = (cardholderName || "FuseCV User").trim().split(/\s+/);
    const firstName = nameParts[0] ?? "FuseCV";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // Parse phone into country code + number
    let phoneCountryCode = "1";
    let phoneNumber = phone || "0000000000";
    if (phone && phone.startsWith("+")) {
      const match = phone.match(/^\+(\d{1,3})([\d\s\-().]+)$/);
      if (match) {
        phoneCountryCode = match[1];
        phoneNumber = match[2].replace(/\D/g, "") || "0000000000";
      }
    } else if (phone) {
      phoneNumber = phone.replace(/\D/g, "") || "0000000000";
    }

    const customerId = await createV4Customer(token, {
      email,
      firstName,
      lastName,
      phone: phoneNumber,
      phoneCountryCode,
      billingLine1: billingLine1 || "N/A",
      billingCity: billingCity || "N/A",
      billingState: billingState || "N/A",
      billingPostalCode: billingPostalCode || "00000",
      billingCountry: billingCountry || "US",
    });

    // Step 4: Create payment method
    const paymentMethodId = await createV4PaymentMethod(token, {
      encrypted_card_number,
      encrypted_expiry_month,
      encrypted_expiry_year,
      encrypted_cvv,
      nonce,
    });

    // Step 5: Initiate charge
    const chargeResult = await initiateV4Charge(token, {
      reference,
      currency,
      amount,
      customerId,
      paymentMethodId,
      redirectUrl,
    });

    // Step 6: If AVS required, automatically submit billing address
    let finalResult = chargeResult;
    if (chargeResult.nextAction.type === "requires_additional_fields") {
      finalResult = await submitV4Avs(token, chargeResult.chargeId, {
        billingLine1: billingLine1 || "N/A",
        billingCity: billingCity || "N/A",
        billingState: billingState || "N/A",
        billingPostalCode: billingPostalCode || "00000",
        billingCountry: billingCountry || "US",
      });
    }

    return NextResponse.json({
      chargeId: finalResult.chargeId,
      nextAction: finalResult.nextAction,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[v4-charge] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
