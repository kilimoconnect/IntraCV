import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const CV_TABLES = [
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
  "generated_documents",
  "user_settings",
  "interview_sessions",
];

export async function DELETE() {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminSupabase();

    // Delete all user data from every CV table
    await Promise.all(
      CV_TABLES.map((table) =>
        admin.from(table).delete().eq("user_id", user.id)
      )
    );

    // Delete the auth user (cascades any remaining auth-linked data)
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Account deletion failed:", err);
    return NextResponse.json({ error: err.message || "Deletion failed" }, { status: 500 });
  }
}
