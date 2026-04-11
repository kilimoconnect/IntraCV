import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content } = await req.json();
    if (!content) return NextResponse.json({ error: "No CV content" }, { status: 400 });

    const admin = createAdminSupabase();

    const { data, error } = await admin
      .from("generated_documents")
      .insert({ user_id: user.id, doc_type: "cv", title, content })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ saved: true, id: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save CV";
    console.error("[save-cv]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
