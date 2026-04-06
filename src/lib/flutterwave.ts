// ─── Flutterwave Inline Checkout ───

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FlutterwaveCheckout: (config: FlutterwaveConfig) => any;
  }
}

export interface FlutterwaveResponse {
  status: string;
  transaction_id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  customer: { email: string; name: string; phone_number?: string };
}

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: { email: string; name: string; phone_number?: string };
  customizations: { title: string; description: string; logo?: string };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

export function loadFlutterwaveScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.flutterwave.com/v3.js"]'
    );
    if (existing) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Flutterwave SDK"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export async function openFlutterwaveCheckout(
  config: FlutterwaveConfig
): Promise<{ close: () => void }> {
  await loadFlutterwaveScript();
  const handler = window.FlutterwaveCheckout(config);
  return {
    close: () => {
      // Try the SDK handler first
      try { handler?.close?.(); } catch { /* ignore */ }
      // Force-remove the Flutterwave iframe + backdrop from the DOM
      document
        .querySelectorAll('iframe[name="checkout"], iframe[src*="flutterwave"], div[id*="flwpugpaid498949850"]')
        .forEach((el) => el.remove());
      // Remove any remaining Flutterwave overlay divs
      document
        .querySelectorAll('div[style*="z-index"][style*="position: fixed"]')
        .forEach((el) => {
          if (el.querySelector('iframe') || el.innerHTML.includes('flutterwave')) {
            el.remove();
          }
        });
    },
  };
}

export function generateTxRef(userId: string): string {
  return `IntraCV-${userId.slice(0, 8)}-${Date.now()}`;
}

export const DOWNLOAD_AMOUNT = Number(process.env.NEXT_PUBLIC_CV_DOWNLOAD_PRICE ?? 1000);
export const DOWNLOAD_CURRENCY = process.env.NEXT_PUBLIC_CV_DOWNLOAD_CURRENCY ?? "TZS";
