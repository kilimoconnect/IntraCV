import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

// Every table that stores user data keyed by user_id
const USER_TABLES = [
  // CV content
  "cv_personal_info",
  "cv_summary",
  "cv_experiences",
  "cv_education",
  "cv_skills",
  "cv_certifications",
  "cv_languages",
  "cv_referees",
  "cv_declarations",
  "cv_key_achievements",
  "cv_awards",
  "cv_memberships",
  "cv_projects",
  "cv_board_roles",
  "cv_executive_training",
  "cv_publications",
  "cv_tools",
  "cv_volunteer",
  // Documents & files metadata
  "generated_documents",
  "saved_cvs",
  // Interview
  "interview_sessions",
  // AI / analysis caches
  "ai_chat_history",
  "profile_analysis",
  "cv_readiness_cache",
  "cv_hook_messages",
  // Payments / tokens
  "cv_download_tokens",
  // Settings & profile
  "user_settings",
  "profiles",
  // Email automation — must be deleted so the cron never attempts
  // to send emails for a deleted user account
  "email_automation_queue",
];

export async function DELETE() {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminSupabase();

    // 1. Delete all rows from every user-data table (run in parallel)
    await Promise.all(
      USER_TABLES.map((table) =>
        admin.from(table).delete().eq("user_id", user.id)
      )
    );

    // 2. Delete all PDF files from storage bucket cv-pdfs/{userId}/
    try {
      const { data: files } = await admin.storage
        .from("cv-pdfs")
        .list(user.id, { limit: 1000 });

      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from("cv-pdfs").remove(paths);
      }
    } catch (storageErr) {
      // Non-fatal: log but continue — auth user deletion is the critical step
      console.warn("Storage cleanup partial failure:", storageErr);
    }

    // 3. Delete the auth user — this is the point of no return
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Account deletion failed:", err);
    return NextResponse.json({ error: err.message || "Deletion failed" }, { status: 500 });
  }
}
