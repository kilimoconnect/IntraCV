import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, content } = await req.json();
    if (!id || !content) return NextResponse.json({ error: "Missing id or content" }, { status: 400 });

    const admin = createAdminSupabase();
    const { error } = await admin
      .from("generated_documents")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ saved: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update CV";
    console.error("[update-cv]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
