/**
 * /api/email-automation/cancel
 *
 * Cancels a specific automation flow for the currently authenticated user.
 * Only flows that the client is allowed to trigger can also be cancelled here.
 */

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { cancelFlow, type FlowId } from "@/lib/email-automation";

const CLIENT_ALLOWED_FLOWS: FlowId[] = [
  "preview_no_purchase",
  "checkout_abandon",
  "upload_started_no_finish",
  "executive_prestige",
  "missing_info", // cancelled client-side when the user completes their profile
];

export async function POST(req: Request) {
  try {
    const { flow } = await req.json();

    if (!CLIENT_ALLOWED_FLOWS.includes(flow)) {
      return NextResponse.json({ error: "Flow not allowed" }, { status: 403 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await cancelFlow(user.id, flow);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[email-cancel]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
