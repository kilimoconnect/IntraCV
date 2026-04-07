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

    const admin = createAdminSupabase();

    // Generate a signup confirmation link (creates the user + returns the link)
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { full_name: fullName || "" },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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

    // Send confirmation email via Brevo
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!brevoRes.ok) {
      const brevoErr = await brevoRes.json();
      console.error("Brevo error:", brevoErr);
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
