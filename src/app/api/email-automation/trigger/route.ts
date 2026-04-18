/**
 * /api/email-automation/trigger
 *
 * Called from the client (browser) to schedule a specific automation flow
 * for the currently authenticated user.
 *
 * Usage:
 *   POST /api/email-automation/trigger
 *   Body: { flow: FlowId, metadata?: Record<string,string> }
 *
 * Auth: reads the user from the Supabase session cookie — no token needed.
 * The user can only schedule flows for themselves.
 */

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { scheduleFlow, type FlowId } from "@/lib/email-automation";

// Flows that are safe for the client to trigger
const CLIENT_ALLOWED_FLOWS: FlowId[] = [
  "preview_no_purchase",
  "checkout_abandon",
  "upload_started_no_finish",
  "executive_prestige",
];

export async function POST(req: Request) {
  try {
    const { flow, metadata = {} } = await req.json();

    if (!CLIENT_ALLOWED_FLOWS.includes(flow)) {
      return NextResponse.json({ error: "Flow not allowed" }, { status: 403 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await scheduleFlow(user.id, flow, metadata);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[email-trigger]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
