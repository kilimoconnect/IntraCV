import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { coverLetter, title } = await req.json();
    if (!coverLetter?.trim()) {
      return NextResponse.json({ error: "No cover letter content" }, { status: 400 });
    }

    const admin = createAdminSupabase();

    // Avoid duplicate saves — check if an identical cover letter exists already
    const { data: existing } = await admin
      .from("generated_documents")
      .select("id")
      .eq("user_id", user.id)
      .eq("doc_type", "cover_letter")
      .eq("content", coverLetter)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ saved: false, reason: "duplicate" });
    }

    const month = new Date().toLocaleString("default", { month: "short", year: "numeric" });
    const docTitle = title || `Cover Letter (${month})`;

    const { error } = await admin.from("generated_documents").insert({
      user_id: user.id,
      doc_type: "cover_letter",
      title: docTitle,
      content: coverLetter,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ saved: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save cover letter";
    console.error("[save-cover-letter]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
