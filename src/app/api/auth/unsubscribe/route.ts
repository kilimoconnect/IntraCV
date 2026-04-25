import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { cancelAllFlows } from "@/lib/email-automation";

// POST /api/auth/unsubscribe  — mark user as unsubscribed from marketing emails
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const admin = createAdminSupabase();

    // Find the user by email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Silent success — don't reveal whether an account exists
      return NextResponse.json({ success: true });
    }

    // Store preference in user_metadata and immediately cancel all pending queue rows
    // so the cron never sends another email to this user (don't wait for next cron run)
    await Promise.all([
      admin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, marketing_unsubscribed: true },
      }),
      cancelAllFlows(user.id),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/auth/unsubscribe  — re-subscribe (undo)
export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const admin = createAdminSupabase();

    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return NextResponse.json({ success: true });

    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, marketing_unsubscribed: false },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Re-subscribe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
