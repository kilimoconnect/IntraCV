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
      type: "signup",
      email,
      options: { redirectTo: `${origin}/auth/confirm` },
    });

    if (error || !data.properties?.action_link) {
      return NextResponse.json({ error: "Could not generate link" }, { status: 400 });
    }

    const confirmationUrl = data.properties.action_link;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email }],
        subject: "Confirm your FuseCV account",
        htmlContent: `
          <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;border-radius:16px 16px 0 0">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800">FuseCV</h1>
            </div>
            <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px">
              <h2 style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 8px">Confirm your email</h2>
              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px">
                Click below to activate your FuseCV account.
              </p>
              <a href="${confirmationUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px">
                Activate My Account →
              </a>
              <p style="color:#94a3b8;font-size:12px;margin:24px 0 0">Link expires in 24 hours.</p>
            </div>
          </div>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
