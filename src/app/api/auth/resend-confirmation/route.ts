import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "FuseCV";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const admin = createAdminSupabase();

    // Re-generate confirmation link for existing unconfirmed user
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${origin}/auth/confirm` },
    });

    if (error || !data.properties?.action_link) {
      return NextResponse.json({ error: "Could not generate link" }, { status: 400 });
    }

    const confirmationUrl = data.properties.action_link;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

    const emailPayload = {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email }],
      subject: "Confirm your FuseCV account",
      headers: { "X-Entity-Ref-ID": email },
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Confirm your FuseCV account</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">
    One click to activate your account and start building your professional CV &#8203;&zwnj;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">

        <!-- Header -->
        <tr><td style="border-radius:16px 16px 0 0;overflow:hidden;background:linear-gradient(135deg,#3730a3 0%,#4f46e5 40%,#7c3aed 100%);padding:24px 32px;text-align:center;position:relative">
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px);pointer-events:none"></div>
          <!-- Logo -->
          <img src="${siteUrl}/fusecv-logo.png" alt="FuseCV" width="120" style="display:block;margin:0 auto 12px;max-width:120px" />
          <p style="color:rgba(255,255,255,0.75);margin:0;font-size:13px;font-style:italic;letter-spacing:0.3px">Your AI-Powered CV Builder</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
          <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 12px;letter-spacing:-0.3px">Confirm your email address</h2>
          <p style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 28px">
            You're one step away from building a job-winning CV with AI. Tap the button below to activate your account.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td style="border-radius:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);box-shadow:0 4px 15px rgba(79,70,229,0.35)">
              <a href="${confirmationUrl}" style="display:inline-block;padding:15px 36px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.2px;border-radius:12px">
                Activate My Account &rarr;
              </a>
            </td></tr>
          </table>

          <!-- Fallback link -->
          <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0 0 8px">
            Button not working? Copy and paste this link into your browser:
          </p>
          <p style="margin:0 0 28px">
            <a href="${confirmationUrl}" style="color:#6366f1;font-size:11px;word-break:break-all">${confirmationUrl}</a>
          </p>

          <div style="border-top:1px solid #f1f5f9;padding-top:20px">
            <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">
              This link expires in <strong>24 hours</strong>. If you didn't create a FuseCV account, you can safely ignore this email.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center">
          <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;line-height:1.6">
            FuseCV &mdash; AI-Powered CV Builder &bull;
            <a href="${siteUrl}" style="color:#94a3b8;text-decoration:underline">fusecv.com</a>
          </p>
          <p style="color:#cbd5e1;font-size:11px;margin:0;line-height:1.6">
            <a href="${siteUrl}/privacy" style="color:#94a3b8;text-decoration:underline">Privacy Policy</a>
            &nbsp;&bull;&nbsp;
            <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#94a3b8;text-decoration:underline">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      textContent: `Welcome to FuseCV!\n\nClick the link below to confirm your email address and activate your account:\n\n${confirmationUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create a FuseCV account, you can safely ignore this email.\n\n— The FuseCV Team\n${siteUrl}`,
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
