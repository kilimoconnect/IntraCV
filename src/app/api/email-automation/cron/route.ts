/**
 * /api/email-automation/cron
 *
 * Called by Vercel Cron (or any external scheduler) every 15 minutes.
 * Processes the email_automation_queue table and sends due emails via Brevo.
 *
 * Protected by CRON_SECRET env var — Vercel passes it as a Bearer token
 * automatically when configured in vercel.json.
 */

import { NextResponse } from "next/server";
import { processQueue } from "@/lib/email-automation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processQueue();
    console.log("[email-cron] Done:", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("[email-cron] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
