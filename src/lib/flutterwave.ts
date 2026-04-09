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

function nukeFlutterwaveModal() {
  // Remove all iframes (Flutterwave injects one for checkout)
  document.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.src || iframe.getAttribute("name") || "";
    if (
      src.includes("flutterwave") ||
      src.includes("checkout") ||
      src.includes("rave") ||
      iframe.style.position === "fixed"
    ) {
      iframe.remove();
    }
  });
  // Remove any full-screen fixed overlays that appeared (Flutterwave backdrop)
  document.querySelectorAll("body > div").forEach((div) => {
    const s = (div as HTMLElement).style;
    if (
      (s.position === "fixed" || s.position === "absolute") &&
      (s.zIndex && parseInt(s.zIndex) > 999)
    ) {
      div.remove();
    }
  });
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
      // Nuke the modal immediately, then again after short delays
      // (Flutterwave may re-render the "Thanks" screen after callback)
      nukeFlutterwaveModal();
      setTimeout(nukeFlutterwaveModal, 300);
      setTimeout(nukeFlutterwaveModal, 800);
      setTimeout(nukeFlutterwaveModal, 1500);
    },
  };
}

export function generateTxRef(userId: string): string {
  return `FuseCV-${userId.slice(0, 8)}-${Date.now()}`;
}

export const DOWNLOAD_AMOUNT = Number(process.env.NEXT_PUBLIC_CV_DOWNLOAD_PRICE ?? 5);
export const DOWNLOAD_CURRENCY = process.env.NEXT_PUBLIC_CV_DOWNLOAD_CURRENCY ?? "USD";
