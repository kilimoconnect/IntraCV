"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CreditCard, Lock, AlertCircle, ChevronDown } from "lucide-react";
import { generateTxRef, DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY } from "@/lib/flutterwave";

// ─── Country list ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "NG", name: "Nigeria" },
  { code: "TZ", name: "Tanzania" },
  { code: "UG", name: "Uganda" },
  { code: "RW", name: "Rwanda" },
  { code: "ET", name: "Ethiopia" },
  { code: "ZM", name: "Zambia" },
  { code: "MW", name: "Malawi" },
  { code: "ZW", name: "Zimbabwe" },
];

// ─── Card number formatter ─────────────────────────────────────────────────────
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// ─── Expiry formatter ──────────────────────────────────────────────────────────
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

// ─── Input component ───────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

// ─── Main card form ────────────────────────────────────────────────────────────
function CardForm() {
  const params = useSearchParams();
  const type = (params.get("type") ?? "cv") as "cv" | "interview";
  const email = params.get("email") ?? "";
  const name = params.get("name") ?? "";
  const redirectUrl = params.get("redirectUrl") ?? "";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState(decodeURIComponent(name));
  const [phone, setPhone] = useState("");
  const [billingLine1, setBillingLine1] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const decodedEmail = decodeURIComponent(email);
  const decodedRedirectUrl = decodeURIComponent(redirectUrl);

  const amount = DOWNLOAD_AMOUNT;
  const currency = DOWNLOAD_CURRENCY;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);

      // Parse expiry
      const expiryDigits = expiry.replace(/\D/g, "");
      const expiryMonth = expiryDigits.slice(0, 2);
      const expiryYear = expiryDigits.slice(2, 4);

      if (!expiryMonth || !expiryYear || expiryDigits.length < 4) {
        setError("Please enter a valid expiry date (MM/YY).");
        setSubmitting(false);
        return;
      }

      // Generate reference
      const reference = generateTxRef(decodedEmail.slice(0, 8) || "user");

      // Build the redirect URL that Flutterwave will call back after 3DS
      // We append charge_id as a placeholder that will be replaced if possible
      const callbackRedirectUrl = decodedRedirectUrl;

      try {
        const res = await fetch("/api/payments/v4-charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardNumber: cardNumber.replace(/\s/g, ""),
            expiryMonth,
            expiryYear,
            cvv,
            cardholderName,
            billingLine1,
            billingCity,
            billingState,
            billingPostalCode,
            billingCountry,
            email: decodedEmail,
            phone,
            amount,
            currency,
            redirectUrl: callbackRedirectUrl,
            reference,
            paymentType: type,
          }),
        });

        // Safely parse — if the server crashes it may return plain text not JSON
        const rawText = await res.text();
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(rawText);
        } catch {
          console.error("[v4-charge] non-JSON response from server:", rawText);
          setError(`Server error: ${rawText.slice(0, 200)}`);
          setSubmitting(false);
          return;
        }

        if (!res.ok || data.error) {
          setError((data.error as string) || "Payment failed. Please check your card details and try again.");
          setSubmitting(false);
          return;
        }

        const { chargeId, nextAction } = data as {
          chargeId: string;
          nextAction: { type: string; url?: string };
        };

        if (nextAction.type === "redirect_url" && nextAction.url) {
          // 3DS redirect — Flutterwave will redirect back to our callback URL
          window.location.href = nextAction.url;
          return;
        }

        if (nextAction.type === "succeeded" || nextAction.type === "successful") {
          // Charge succeeded immediately (no 3DS needed)
          const verifyUrl = new URL(decodedRedirectUrl);
          verifyUrl.searchParams.set("charge_id", chargeId);
          verifyUrl.searchParams.set("status", "successful");
          window.location.href = verifyUrl.toString();
          return;
        }

        // Fallback: redirect to callback with charge_id
        const fallbackUrl = new URL(decodedRedirectUrl);
        fallbackUrl.searchParams.set("charge_id", chargeId);
        window.location.href = fallbackUrl.toString();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(msg);
        setSubmitting(false);
      }
    },
    [
      cardNumber,
      expiry,
      cvv,
      cardholderName,
      phone,
      billingLine1,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      decodedEmail,
      decodedRedirectUrl,
      type,
      amount,
      currency,
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">FuseCV</p>
              <p className="text-xs text-slate-500">
                {type === "interview" ? "Interview Questions Unlock" : "CV Download"}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-extrabold text-slate-800">
                {currency} {amount.toFixed(2)}
              </p>
              <p className="text-xs font-semibold text-emerald-600">✓ One-time payment</p>
              <p className="text-[10px] text-slate-400">No subscription · No recurring charges</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="px-6 py-6 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Card number */}
          <Field label="Card Number">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className={inputCls}
              required
              autoComplete="cc-number"
            />
          </Field>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry Date">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className={inputCls}
                required
                autoComplete="cc-exp"
              />
            </Field>
            <Field label="CVV">
              <input
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={inputCls}
                required
                autoComplete="cc-csc"
              />
            </Field>
          </div>

          {/* Cardholder name */}
          <Field label="Cardholder Name">
            <input
              type="text"
              placeholder="Full name on card"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={inputCls}
              required
              autoComplete="cc-name"
            />
          </Field>

          {/* Phone */}
          <Field label="Phone Number">
            <input
              type="tel"
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              autoComplete="tel"
            />
          </Field>

          {/* Billing address section */}
          <div className="pt-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Billing Address
            </p>
            <div className="space-y-4">
              <Field label="Address Line 1">
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={billingLine1}
                  onChange={(e) => setBillingLine1(e.target.value)}
                  className={inputCls}
                  autoComplete="street-address"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="City">
                  <input
                    type="text"
                    placeholder="New York"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    className={inputCls}
                    autoComplete="address-level2"
                  />
                </Field>
                <Field label="State / Province">
                  <input
                    type="text"
                    placeholder="NY"
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                    className={inputCls}
                    autoComplete="address-level1"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal Code">
                  <input
                    type="text"
                    placeholder="10001"
                    value={billingPostalCode}
                    onChange={(e) => setBillingPostalCode(e.target.value)}
                    className={inputCls}
                    autoComplete="postal-code"
                  />
                </Field>
                <Field label="Country">
                  <div className="relative">
                    <select
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      className={`${inputCls} appearance-none pr-10`}
                      autoComplete="country"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing payment…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay {currency} {amount.toFixed(2)} securely
              </>
            )}
          </button>

          {/* Security note */}
          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3" />
            Secured by Flutterwave · 256-bit SSL encryption
          </p>
        </form>
      </div>
    </div>
  );
}

export default function CardPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <CardForm />
    </Suspense>
  );
}
