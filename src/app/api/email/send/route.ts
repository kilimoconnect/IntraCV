import { NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@fusecv.com";
const FROM_NAME = process.env.BREVO_FROM_NAME || "FuseCV";

interface SendEmailBody {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export async function POST(req: Request) {
  try {
    const body: SendEmailBody = await req.json();
    const { to, toName, subject, html, text } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
        textContent: text || "",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "Brevo error" }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
