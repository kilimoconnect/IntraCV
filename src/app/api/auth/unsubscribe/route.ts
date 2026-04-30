import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { cancelAllFlows } from "@/lib/email-automation";

// POST /api/auth/unsubscribe  — mark user as unsubscribed from marketing emails
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const admin = createAdminSupabase();

    // Find the user by email — paginate through all users so we never miss anyone
    // (Supabase's listUsers is capped at perPage per call; a single call would silently
    // miss users beyond the first page at larger user counts)
    let foundUser: Awaited<ReturnType<typeof admin.auth.admin.listUsers>>["data"]["users"][0] | undefined;
    let page = 1;
    const PER_PAGE = 1000;
    while (!foundUser) {
      const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
      foundUser = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!foundUser && data.users.length < PER_PAGE) break; // exhausted all pages
      page++;
    }

    const user = foundUser;
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

    let foundUser2: Awaited<ReturnType<typeof admin.auth.admin.listUsers>>["data"]["users"][0] | undefined;
    let page2 = 1;
    while (!foundUser2) {
      const { data, error: listError } = await admin.auth.admin.listUsers({ page: page2, perPage: 1000 });
      if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
      foundUser2 = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!foundUser2 && data.users.length < 1000) break;
      page2++;
    }

    const user = foundUser2;
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
