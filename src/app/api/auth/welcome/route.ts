import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "FuseCV";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Fetch user details from Supabase
    const admin = createAdminSupabase();
    const { data: { user }, error } = await admin.auth.admin.getUserById(userId);
    if (error || !user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Only send once — track via user metadata
    if (user.user_metadata?.welcome_sent) {
      return NextResponse.json({ skipped: true });
    }

    // Respect unsubscribe preference
    if (user.user_metadata?.marketing_unsubscribed) {
      return NextResponse.json({ skipped: true });
    }

    const email = user.email!;
    const fullName = user.user_metadata?.full_name || "";
    const firstName = fullName.trim().split(" ")[0] || "there";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fusecv.com";

    if (!BREVO_API_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const emailPayload = {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: fullName || email }],
      subject: `You're in, ${firstName}! Here's how to land your next job faster 🚀`,
      headers: { "X-Entity-Ref-ID": `welcome-${userId}` },
      htmlContent: buildWelcomeEmail(firstName, siteUrl, email),
      textContent: buildWelcomeText(firstName, siteUrl),
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Welcome email failed:", JSON.stringify(err));
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    // Mark welcome email as sent so we never double-send
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...user.user_metadata, welcome_sent: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Email builders ────────────────────────────────────────────────────────────

function buildWelcomeEmail(firstName: string, siteUrl: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Welcome to FuseCV</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">
    Your AI-powered CV builder is ready. Most job seekers are doing it the hard way — you don't have to. &#8203;&zwnj;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- ── HERO HEADER ─────────────────────────────────────────────── -->
        <tr><td style="border-radius:16px 16px 0 0;background:linear-gradient(135deg,#1e1b4b 0%,#3730a3 35%,#4f46e5 65%,#7c3aed 100%);padding:16px 32px 28px;text-align:center;position:relative;overflow:hidden">
          <!-- Stripe overlay -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.025) 0px,rgba(255,255,255,0.025) 1px,transparent 1px,transparent 14px);pointer-events:none"></div>
          <!-- Glow orb -->
          <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(167,139,250,0.25) 0%,transparent 70%);pointer-events:none"></div>

          <!-- Logo -->
          <div style="display:inline-block;background:#ffffff;border-radius:12px;padding:10px 20px;margin:0 auto 16px"><img src="${siteUrl}/fusecv-logo.png" alt="FuseCV" width="140" style="display:block;max-width:140px" /></div>

          <!-- Hero copy -->
          <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 12px;letter-spacing:-0.5px;line-height:1.25">
            Welcome aboard, ${firstName}! 🎉
          </h1>
          <p style="color:rgba(255,255,255,0.8);font-size:16px;line-height:1.6;margin:0 0 28px;max-width:380px;margin-left:auto;margin-right:auto">
            Your account is confirmed. You now have everything you need to <strong style="color:#ffffff">land your next job faster</strong> than 95% of applicants.
          </p>

          <!-- Primary CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto">
            <tr><td style="border-radius:12px;background:linear-gradient(135deg,#ffffff,#f0f0ff);box-shadow:0 4px 20px rgba(0,0,0,0.25)">
              <a href="${siteUrl}/cv-builder" style="display:inline-block;padding:15px 40px;color:#4f46e5;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.2px;border-radius:12px">
                Build My CV Now &rarr;
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- ── PROBLEM → SOLUTION HOOK ─────────────────────────────────── -->
        <tr><td style="background:#ffffff;padding:40px 32px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">

          <p style="color:#64748b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">The hard truth</p>
          <h2 style="color:#0f172a;font-size:21px;font-weight:700;margin:0 0 16px;letter-spacing:-0.3px;line-height:1.3">
            Most CVs never get a human to read them
          </h2>
          <p style="color:#475569;font-size:15px;line-height:1.75;margin:0 0 24px">
            75% of CVs are rejected by Applicant Tracking Systems <em>before</em> a hiring manager sees them. The problem isn't your experience — it's how your CV is written and tailored. FuseCV was built to fix exactly that.
          </p>

          <!-- Divider -->
          <div style="border-top:2px solid #f1f5f9;margin:0 0 32px"></div>

          <!-- ── FEATURE CARDS ──────────────────────────────────────────── -->
          <p style="color:#64748b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 20px">What FuseCV does for you</p>

          <!-- Feature 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
            <tr>
              <td width="48" valign="top" style="padding-right:16px">
                <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);text-align:center;line-height:44px;font-size:22px">📄</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 4px">Upload your old CV — or start from scratch</p>
                <p style="color:#64748b;font-size:14px;line-height:1.65;margin:0">
                  Already have a CV? Upload it as a PDF or Word file and our AI reads every section — work history, education, skills, and more — and saves it all to your profile instantly. Prefer to start fresh? Fill in your details step by step. FuseCV guides you with smart recommendations on what to add, then turns everything into a polished, professional CV.
                </p>
              </td>
            </tr>
          </table>

          <!-- Feature 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
            <tr>
              <td width="48" valign="top" style="padding-right:16px">
                <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);text-align:center;line-height:44px;font-size:22px">🎯</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 4px">Tailored CVs for every job</p>
                <p style="color:#64748b;font-size:14px;line-height:1.65;margin:0">
                  Paste the job description and FuseCV rewrites your CV to match it — using the exact keywords recruiters and ATS systems scan for. One-click, every time.
                </p>
              </td>
            </tr>
          </table>

          <!-- Feature 3 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
            <tr>
              <td width="48" valign="top" style="padding-right:16px">
                <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#fef9c3,#fef08a);text-align:center;line-height:44px;font-size:22px">✍️</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 4px">Cover letters that actually get read</p>
                <p style="color:#64748b;font-size:14px;line-height:1.65;margin:0">
                  Stop sending generic cover letters. FuseCV writes a compelling, job-specific cover letter alongside your tailored CV — in seconds.
                </p>
              </td>
            </tr>
          </table>

          <!-- Feature 4 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0">
            <tr>
              <td width="48" valign="top" style="padding-right:16px">
                <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#fee2e2,#fecaca);text-align:center;line-height:44px;font-size:22px">🎤</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:15px;font-weight:700;margin:0 0 4px">Walk into interviews confident</p>
                <p style="color:#64748b;font-size:14px;line-height:1.65;margin:0">
                  Our Interview Preparation tool generates role-specific questions and model answers based on the job you're applying for — so nothing catches you off guard.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ── SOCIAL PROOF / URGENCY STRIP ──────────────────────────────── -->
        <tr><td style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);padding:24px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:center">
          <p style="color:#5b21b6;font-size:14px;font-weight:700;margin:0 0 4px;letter-spacing:0.1px">
            💼 The job market is competitive. Your CV shouldn't hold you back.
          </p>
          <p style="color:#7c3aed;font-size:13px;margin:0;line-height:1.6">
            Candidates who tailor their CV to each role are <strong>3× more likely</strong> to get an interview call.
          </p>
        </td></tr>

        <!-- ── STEP-BY-STEP QUICK START ────────────────────────────────── -->
        <tr><td style="background:#ffffff;padding:32px 32px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
          <p style="color:#64748b;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 20px">Get started in 3 steps</p>

          <!-- Step 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
            <tr>
              <td width="32" valign="top" style="padding-right:14px;padding-top:2px">
                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;line-height:28px;color:#ffffff;font-size:13px;font-weight:800">1</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 2px">Upload your CV or build your profile</p>
                <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0">Upload an existing PDF or Word CV and AI extracts everything automatically, or fill in your details from scratch. Do it once — reuse forever.</p>
              </td>
            </tr>
          </table>

          <!-- Step 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
            <tr>
              <td width="32" valign="top" style="padding-right:14px;padding-top:2px">
                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;line-height:28px;color:#ffffff;font-size:13px;font-weight:800">2</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 2px">Paste a job description</p>
                <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0">Found a role you want? Paste the job description and let the AI tailor your CV and cover letter to it instantly.</p>
              </td>
            </tr>
          </table>

          <!-- Step 3 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr>
              <td width="32" valign="top" style="padding-right:14px;padding-top:2px">
                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;line-height:28px;color:#ffffff;font-size:13px;font-weight:800">3</div>
              </td>
              <td valign="top">
                <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 2px">Download and apply</p>
                <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0">Download a polished PDF and send it. Repeat for every role — each one perfectly tailored, each one a stronger application.</p>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="width:100%">
            <tr><td style="border-radius:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);box-shadow:0 4px 15px rgba(79,70,229,0.35);text-align:center">
              <a href="${siteUrl}/cv-builder" style="display:block;padding:16px 36px;color:#ffffff;font-weight:800;font-size:15px;text-decoration:none;letter-spacing:0.2px;border-radius:12px">
                Start Building My CV &rarr;
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- ── FOOTER ─────────────────────────────────────────────────────── -->
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
</html>`;
}

function buildWelcomeText(firstName: string, siteUrl: string): string {
  return `Welcome to FuseCV, ${firstName}!

Your account is confirmed and you're ready to go.

─────────────────────────────────
THE HARD TRUTH
─────────────────────────────────
75% of CVs are rejected by Applicant Tracking Systems before a hiring manager ever sees them. It's not your experience — it's how your CV is written and whether it's tailored to the role.

FuseCV fixes that.

─────────────────────────────────
WHAT FUSECV DOES FOR YOU
─────────────────────────────────

📄 Upload your old CV — or start from scratch
Already have a CV? Upload a PDF or Word file and AI extracts every section automatically. Or fill in your details step by step. FuseCV recommends what to add and builds a polished, professional CV from your profile.

🎯 Tailored CVs for every job
Paste any job description and FuseCV rewrites your CV to match the keywords recruiters and ATS systems scan for.

✍️ Cover letters that actually get read
A compelling, job-specific cover letter written alongside your CV — in seconds, not hours.

🎤 Walk into interviews confident
Our Interview Preparation tool generates role-specific questions and model answers so nothing catches you off guard.

─────────────────────────────────
GET STARTED IN 3 STEPS
─────────────────────────────────
1. Upload your old CV (PDF/Word) or build your profile from scratch
2. Paste a job description you want to apply for
3. Download your tailored PDF and apply

Start now: ${siteUrl}/cv-builder

─────────────────────────────────
Candidates who tailor their CV to each role are 3× more likely to get an interview call. You now have the tool to do exactly that — for every single application.

Good luck out there. We're rooting for you.

— The FuseCV Team
${siteUrl}`;
}
