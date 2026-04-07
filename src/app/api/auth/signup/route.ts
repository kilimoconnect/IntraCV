import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "FuseCV";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Derive site URL from request origin so it works even without NEXT_PUBLIC_SITE_URL
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const admin = createAdminSupabase();

    // Generate a signup confirmation link (creates the user + returns the link)
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      // User may already exist
      if (error.message.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const confirmationUrl = data.properties?.action_link;
    if (!confirmationUrl) {
      return NextResponse.json({ error: "Could not generate confirmation link" }, { status: 500 });
    }

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not set");
      return NextResponse.json({ error: "Email service not configured. Please contact support." }, { status: 500 });
    }

    const emailPayload = {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: fullName || email }],
      subject: "Confirm your FuseCV account",
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">FuseCV</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">AI-Powered CV Builder</p>
          </div>
          <div style="padding: 40px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Confirm your email address</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
              Hi ${fullName || "there"}, welcome to FuseCV! Click the button below to activate your account and start building your professional CV.
            </p>
            <a href="${confirmationUrl}"
              style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px;">
              Activate My Account →
            </a>
            <p style="color: #94a3b8; font-size: 12px; margin: 32px 0 0; line-height: 1.6;">
              This link expires in 24 hours. If you didn't create a FuseCV account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      textContent: `Welcome to FuseCV!\n\nClick the link below to confirm your email address:\n\n${confirmationUrl}\n\nThis link expires in 24 hours.`,
    };

    // Try up to 2 times
    let brevoRes: Response | null = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });
      if (brevoRes.ok) break;
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
    }

    if (!brevoRes || !brevoRes.ok) {
      const brevoErr = await brevoRes?.json().catch(() => ({}));
      console.error("Brevo send failed:", JSON.stringify(brevoErr));
      return NextResponse.json({ error: `Email delivery failed: ${brevoErr?.message || "unknown error"}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
