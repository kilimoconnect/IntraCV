/**
 * purchase-emails.ts
 * Server-side only — calls Brevo SMTP API directly (no HTTP round-trip).
 * Import only from Server Components / Route Handlers.
 */

const BREVO_API_KEY  = process.env.BREVO_API_KEY!;
const FROM_EMAIL     = process.env.BREVO_FROM_EMAIL  || "noreply@fusecv.com";
const FROM_NAME      = process.env.BREVO_FROM_NAME   || "FuseCV";
const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL || "https://fusecv.com";
const DASHBOARD_URL  = `${SITE_URL}/dashboard`;
const DOCUMENTS_URL  = `${SITE_URL}/dashboard?tab=documents`;
const INTERVIEW_URL  = `${SITE_URL}/dashboard?tab=interview`;

// ─── Types ────────────────────────────────────────────────────────────────────

export type PurchaseType = "starter" | "professional" | "full" | "interview";

// ─── Low-level Brevo sender ───────────────────────────────────────────────────

async function sendBrevoEmail(opts: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!BREVO_API_KEY) {
    console.warn("[purchase-emails] BREVO_API_KEY not set — skipping email");
    return;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: opts.to, name: opts.toName }],
        subject: opts.subject,
        htmlContent: opts.html,
        textContent: opts.text,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[purchase-emails] Brevo error:", err);
    }
  } catch (err) {
    console.error("[purchase-emails] Failed to send:", err);
  }
}

// ─── Shared email shell ───────────────────────────────────────────────────────

function shell({
  preheader,
  headline,
  intro,
  itemsHtml,
  ctaHref,
  ctaLabel,
  footerNote,
}: {
  preheader: string;
  headline: string;
  intro: string;
  itemsHtml: string;
  ctaHref: string;
  ctaLabel: string;
  footerNote: string;
}) {
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

        <!-- Header -->
        <tr><td style="border-radius:16px 16px 0 0;background:#ffffff;border:1px solid #e2e8f0;border-bottom:none;padding:24px 32px 20px;text-align:center">
          <img src="${SITE_URL}/fusecv-logo.png" alt="FuseCV" width="150" height="46"
            style="display:block;margin:0 auto 8px;max-width:150px;height:auto" />
          <p style="color:#64748b;margin:0;font-size:12px;letter-spacing:0.3px">AI-Powered CV Builder</p>
        </td></tr>

        <!-- Top accent bar -->
        <tr><td style="background:#004aad;height:3px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0"></td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 32px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">

          <!-- Headline -->
          <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 12px;letter-spacing:-0.4px;line-height:1.3">
            ${headline}
          </h2>

          <!-- Intro paragraph -->
          <p style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 24px">
            ${intro}
          </p>

          <!-- What's included -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:28px">
            <p style="color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px">
              What&apos;s included
            </p>
            ${itemsHtml}
          </div>

          <!-- CTA button -->
          <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px">
            <tr><td align="center">
              <a href="${ctaHref}"
                style="display:inline-block;padding:15px 40px;background:#ff751f;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;border-radius:12px;box-shadow:0 4px 15px rgba(255,117,31,0.35);letter-spacing:0.2px">
                ${ctaLabel} &rarr;
              </a>
            </td></tr>
          </table>

          <!-- Footer note -->
          <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;border-top:1px solid #f1f5f9;padding-top:20px;text-align:center">
            ${footerNote}
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center">
          <p style="color:#94a3b8;font-size:11px;margin:0 0 6px;line-height:1.6">
            FuseCV &mdash; AI-Powered CV Builder &bull;
            <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:underline">${SITE_URL.replace("https://", "")}</a>
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

// ─── Item row helper ──────────────────────────────────────────────────────────

function item(text: string) {
  return `<p style="color:#1e293b;font-size:14px;margin:0 0 10px;display:flex;align-items:flex-start;gap:10px;line-height:1.5">
    <span style="color:#10b981;font-weight:700;flex-shrink:0">✓</span> ${text}
  </p>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function starterEmail(firstName: string) {
  return {
    subject: "Your CV is ready to download — FuseCV",
    html: shell({
      preheader: "Your watermark-free CV is ready. Head to your dashboard to download it now.",
      headline: `Your CV is ready, ${firstName}! 🎉`,
      intro: `Great news — your payment has been confirmed and your professional CV is ready to download. Head to your dashboard and hit <strong>Download CV</strong> to get your watermark-free file.`,
      itemsHtml: [
        item("Watermark-free CV download (PDF)"),
        item("ATS-optimized formatting — passes automated screening"),
        item("6 premium recruiter-ready layout options"),
        item("Saved to your Documents for future access"),
      ].join(""),
      ctaHref: DOCUMENTS_URL,
      ctaLabel: "View My Documents",
      footerNote: "Questions? Reply to this email and we&apos;ll help you out.",
    }),
    text: `Hi ${firstName},\n\nYour CV is ready to download!\n\nWhat's included:\n- Watermark-free CV download (PDF)\n- ATS-optimized formatting\n- 6 premium layout options\n- Saved to your Documents\n\nView your documents: ${DOCUMENTS_URL}\n\n— The FuseCV Team`,
  };
}

function professionalEmail(firstName: string) {
  return {
    subject: "Your CV & Cover Letter are ready — FuseCV",
    html: shell({
      preheader: "Your CV and tailored cover letter are both ready. Start applying with confidence.",
      headline: `Your CV & Cover Letter are ready, ${firstName}! 🎉`,
      intro: `Payment confirmed — your Professional Package is now active. You have a watermark-free CV <strong>and</strong> a tailored cover letter ready to go. Head to your dashboard to download and use them.`,
      itemsHtml: [
        item("Watermark-free CV download (PDF)"),
        item("Tailored cover letter — matched to your target role"),
        item("ATS-optimized formatting for both documents"),
        item("6 premium recruiter-ready layout options"),
        item("Both documents saved to your Documents"),
      ].join(""),
      ctaHref: DOCUMENTS_URL,
      ctaLabel: "View My Documents",
      footerNote: "Find your cover letter under the <strong>Documents</strong> section in your dashboard.",
    }),
    text: `Hi ${firstName},\n\nYour Professional Package is ready!\n\nWhat's included:\n- Watermark-free CV download (PDF)\n- Tailored cover letter\n- ATS-optimized formatting\n- 6 premium layout options\n- Both documents saved to your Documents\n\nView your documents: ${DOCUMENTS_URL}\n\n— The FuseCV Team`,
  };
}

function fullBundleEmail(firstName: string) {
  return {
    subject: "Your Full Bundle is ready — FuseCV",
    html: shell({
      preheader: "CV, cover letter and 20 interview questions are all unlocked. Time to land that role.",
      headline: `Everything is unlocked, ${firstName}! 🚀`,
      intro: `Your Full Bundle is active. You now have a professional CV, a tailored cover letter, <strong>and</strong> 20 role-specific interview questions — everything you need to go from application to offer.`,
      itemsHtml: [
        item("Watermark-free CV download (PDF)"),
        item("Tailored cover letter — matched to your target role"),
        item("20 role-specific interview questions unlocked"),
        item("ATS-optimized formatting for both documents"),
        item("6 premium recruiter-ready layout options"),
        item("All content saved to your Documents"),
      ].join(""),
      ctaHref: DOCUMENTS_URL,
      ctaLabel: "View My Documents",
      footerNote: "Access your interview questions under the <strong>Interview Prep</strong> tab.",
    }),
    text: `Hi ${firstName},\n\nYour Full Bundle is ready!\n\nWhat's included:\n- Watermark-free CV download (PDF)\n- Tailored cover letter\n- 20 role-specific interview questions\n- ATS-optimized formatting\n- 6 premium layout options\n- All content saved to your Documents\n\nView your documents: ${DOCUMENTS_URL}\n\n— The FuseCV Team`,
  };
}

function interviewEmail(firstName: string) {
  return {
    subject: "20 interview questions unlocked — FuseCV",
    html: shell({
      preheader: "Your interview prep questions are ready. Practice them now and walk in confident.",
      headline: `20 interview questions unlocked, ${firstName}! 🎯`,
      intro: `Payment confirmed — your Interview Prep quota has been topped up with <strong>20 new questions</strong>. Head to the Interview Prep section in your dashboard to start practising.`,
      itemsHtml: [
        item("20 role-specific interview questions added to your account"),
        item("Competency, behavioural &amp; technical question types"),
        item("Model answers based on your own experience"),
        item("Practice at your own pace, as many times as you like"),
        item("Questions saved — pick up where you left off anytime"),
      ].join(""),
      ctaHref: INTERVIEW_URL,
      ctaLabel: "Start Practising",
      footerNote: "Your questions are available under the <strong>Interview Prep</strong> tab in your dashboard.",
    }),
    text: `Hi ${firstName},\n\nYour 20 interview questions are ready!\n\nWhat's included:\n- 20 role-specific questions added to your account\n- Competency, behavioural & technical types\n- Model answers based on your experience\n- Practice at your own pace\n\nStart practising: ${INTERVIEW_URL}\n\n— The FuseCV Team`,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a post-purchase confirmation email.
 * Safe to call from Server Components — never throws, only logs on failure.
 */
export async function sendPurchaseEmail({
  type,
  toEmail,
  toName,
}: {
  type: PurchaseType;
  toEmail: string;
  toName: string;
}) {
  const firstName = (toName || "").trim().split(" ")[0] || "there";

  const templates: Record<PurchaseType, ReturnType<typeof starterEmail>> = {
    starter:      starterEmail(firstName),
    professional: professionalEmail(firstName),
    full:         fullBundleEmail(firstName),
    interview:    interviewEmail(firstName),
  };

  const { subject, html, text } = templates[type];

  await sendBrevoEmail({ to: toEmail, toName: toName || toEmail, subject, html, text });
}
