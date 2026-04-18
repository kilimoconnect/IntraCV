/**
 * purchase-emails.ts
 * Server-side Brevo email utility for post-purchase confirmation emails.
 * Called directly from Server Components (callback pages) — no HTTP round-trip.
 */

export type PurchaseType = "starter" | "professional" | "full" | "interview";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "FuseCV";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fusecv.com";

const DOCUMENTS_URL = `${SITE_URL}/dashboard?tab=documents`;
const INTERVIEW_URL = `${SITE_URL}/dashboard?tab=interview`;

// ─── Brevo send helper ────────────────────────────────────────────────────────

async function sendBrevoEmail(opts: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!BREVO_API_KEY) {
    console.error("[purchase-emails] BREVO_API_KEY is not set");
    return;
  }

  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: opts.to, name: opts.toName || opts.to }],
    subject: opts.subject,
    headers: { "X-Entity-Ref-ID": opts.to },
    htmlContent: opts.html,
    textContent: opts.text,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Brevo error: ${JSON.stringify(err)}`);
  }
}

// ─── Shared email shell ───────────────────────────────────────────────────────

function shell(opts: {
  preheader: string;
  headline: string;
  intro: string;
  itemsHtml: string;
  ctaHref: string;
  ctaLabel: string;
  footerNote: string;
}): string {
  const { preheader, headline, intro, itemsHtml, ctaHref, ctaLabel, footerNote } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader} &#8203;&zwnj;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">

        <!-- Logo header -->
        <tr><td style="border-radius:16px 16px 0 0;background:#ffffff;border:1px solid #e2e8f0;border-bottom:none;padding:24px 32px 20px;text-align:center">
          <img src="${SITE_URL}/fusecv-logo.png" alt="FuseCV" width="150" height="46" style="display:block;margin:0 auto 8px;max-width:150px;height:auto" />
          <p style="color:#64748b;margin:0;font-size:12px;letter-spacing:0.3px">Your AI-Powered CV Builder</p>
        </td></tr>

        <!-- Accent bar -->
        <tr><td style="background:#004aad;height:3px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0"></td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 32px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
          <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 12px;letter-spacing:-0.3px">${headline}</h2>
          <p style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 24px">${intro}</p>

          ${itemsHtml}

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px">
            <tr><td style="border-radius:12px;background:#ff751f;box-shadow:0 4px 15px rgba(255,117,31,0.35);text-align:center">
              <a href="${ctaHref}" style="display:block;padding:15px 36px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.2px;border-radius:12px">
                ${ctaLabel} &rarr;
              </a>
            </td></tr>
          </table>

          <div style="border-top:1px solid #f1f5f9;padding-top:18px;margin-top:24px">
            <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">${footerNote}</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center">
          <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;line-height:1.6">
            FuseCV &mdash; AI-Powered CV Builder &bull;
            <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:underline">fusecv.com</a>
          </p>
          <p style="color:#cbd5e1;font-size:11px;margin:0;line-height:1.6">
            <a href="${SITE_URL}/privacy" style="color:#94a3b8;text-decoration:underline">Privacy Policy</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function checkItem(text: string): string {
  return `<p style="display:flex;align-items:flex-start;gap:10px;margin:0 0 10px;font-size:14px;color:#334155">
    <span style="color:#10b981;font-weight:700;flex-shrink:0">&#10003;</span>
    <span>${text}</span>
  </p>`;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function starterEmail(firstName: string): { subject: string; html: string; text: string } {
  const subject = "Your CV has been downloaded — FuseCV";
  const html = shell({
    preheader: "Your watermark-free CV has been automatically downloaded.",
    headline: `Your CV is ready, ${firstName}`,
    intro: "Payment confirmed. Your watermark-free CV has been automatically downloaded in your chosen format and theme.",
    itemsHtml: [
      checkItem("Watermark-free CV — automatically downloaded"),
      checkItem("Saved to your Documents for future access"),
    ].join(""),
    ctaHref: DOCUMENTS_URL,
    ctaLabel: "View My Documents",
    footerNote: "Need to re-download? Head to your Documents tab at any time.",
  });
  const text = `Your CV is ready, ${firstName}.

Payment confirmed. Your watermark-free CV has been automatically downloaded in your chosen format and theme.

- Watermark-free CV — automatically downloaded
- Saved to your Documents for future access

View your documents: ${DOCUMENTS_URL}

Need to re-download? Head to your Documents tab at any time.

— The FuseCV Team
${SITE_URL}`;
  return { subject, html, text };
}

function professionalEmail(firstName: string): { subject: string; html: string; text: string } {
  const subject = "Your CV has been downloaded and cover letter is ready — FuseCV";
  const html = shell({
    preheader: "Your CV downloaded automatically and your cover letter is waiting in your dashboard.",
    headline: `Your CV and cover letter are ready, ${firstName}`,
    intro: "Payment confirmed. Your watermark-free CV has been automatically downloaded in your chosen format and theme. Your tailored cover letter is ready in your Documents.",
    itemsHtml: [
      checkItem("Watermark-free CV — automatically downloaded"),
      checkItem("Tailored cover letter — ready in your Documents"),
      checkItem("Saved for future access"),
    ].join(""),
    ctaHref: DOCUMENTS_URL,
    ctaLabel: "View My Documents",
    footerNote: "You can copy or download your cover letter from the Documents tab.",
  });
  const text = `Your CV and cover letter are ready, ${firstName}.

Payment confirmed. Your watermark-free CV has been automatically downloaded in your chosen format and theme. Your tailored cover letter is ready in your Documents.

- Watermark-free CV — automatically downloaded
- Tailored cover letter — ready in your Documents
- Saved for future access

View your documents: ${DOCUMENTS_URL}

You can copy or download your cover letter from the Documents tab.

— The FuseCV Team
${SITE_URL}`;
  return { subject, html, text };
}

function fullBundleEmail(firstName: string): { subject: string; html: string; text: string } {
  const subject = "Your Full Bundle is ready — CV downloaded, everything unlocked — FuseCV";
  const html = shell({
    preheader: "CV downloaded, cover letter ready, and interview prep unlocked.",
    headline: `Full bundle unlocked, ${firstName}`,
    intro: "Payment confirmed. Your watermark-free CV has been automatically downloaded in your chosen format and theme. Everything else is waiting for you in your dashboard.",
    itemsHtml: [
      checkItem("Watermark-free CV — automatically downloaded"),
      checkItem("Tailored cover letter — ready in your Documents"),
      checkItem("20 interview questions — unlocked in Interview Prep"),
      checkItem("All documents saved for future access"),
    ].join(""),
    ctaHref: DOCUMENTS_URL,
    ctaLabel: "View My Documents",
    footerNote: "Your interview questions are in the Interview Prep section of your dashboard.",
  });
  const text = `Full bundle unlocked, ${firstName}.

Payment confirmed. Your watermark-free CV has been automatically downloaded in your chosen format and theme. Everything else is waiting in your dashboard.

- Watermark-free CV — automatically downloaded
- Tailored cover letter — ready in your Documents
- 20 interview questions — unlocked in Interview Prep
- All documents saved for future access

View your documents: ${DOCUMENTS_URL}

Your interview questions are in the Interview Prep section of your dashboard.

— The FuseCV Team
${SITE_URL}`;
  return { subject, html, text };
}

function interviewEmail(firstName: string): { subject: string; html: string; text: string } {
  const subject = "Your interview questions are unlocked — FuseCV";
  const html = shell({
    preheader: "Your interview questions are ready. Practice before your next interview.",
    headline: `Interview questions unlocked, ${firstName}`,
    intro: "Payment confirmed. Your interview questions have been unlocked and are waiting for you in the Interview Prep section of your dashboard.",
    itemsHtml: [
      checkItem("Role-specific interview questions — unlocked"),
      checkItem("Model answers tailored to your profile"),
      checkItem("Practice as many times as you need"),
    ].join(""),
    ctaHref: INTERVIEW_URL,
    ctaLabel: "Go to Interview Prep",
    footerNote: "Questions are based on the job description you entered. You can generate more at any time.",
  });
  const text = `Interview questions unlocked, ${firstName}.

Payment confirmed. Your interview questions have been unlocked and are waiting for you in the Interview Prep section of your dashboard.

- Role-specific interview questions — unlocked
- Model answers tailored to your profile
- Practice as many times as you need

Go to Interview Prep: ${INTERVIEW_URL}

Questions are based on the job description you entered. You can generate more at any time.

— The FuseCV Team
${SITE_URL}`;
  return { subject, html, text };
}

// ─── Public export ────────────────────────────────────────────────────────────

export async function sendPurchaseEmail(opts: {
  type: PurchaseType;
  toEmail: string;
  toName: string;
}): Promise<void> {
  const firstName = (opts.toName || "").trim().split(" ")[0] || "there";

  let subject: string;
  let html: string;
  let text: string;

  switch (opts.type) {
    case "starter":
      ({ subject, html, text } = starterEmail(firstName));
      break;
    case "professional":
      ({ subject, html, text } = professionalEmail(firstName));
      break;
    case "full":
      ({ subject, html, text } = fullBundleEmail(firstName));
      break;
    case "interview":
      ({ subject, html, text } = interviewEmail(firstName));
      break;
    default:
      throw new Error(`Unknown purchase type: ${opts.type}`);
  }

  await sendBrevoEmail({
    to: opts.toEmail,
    toName: opts.toName,
    subject,
    html,
    text,
  });
}
