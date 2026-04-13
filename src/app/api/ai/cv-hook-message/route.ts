import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { openaiClient } from "@/lib/openai";

// Lightweight hash of CV section counts + presence flags.
// Changing any section count or adding/removing a section triggers a new AI call.
function computeDataHash(cvData: Record<string, unknown>): string {
  const get = (key: string) =>
    Array.isArray(cvData[key]) ? (cvData[key] as unknown[]).length : 0;

  const parts = [
    `exp:${get("experiences")}`,
    `edu:${get("education")}`,
    `ski:${get("skills")}`,
    `cer:${get("certifications")}`,
    `lan:${get("languages")}`,
    `ref:${get("referees")}`,
    `ach:${get("keyAchievements")}`,
    `awd:${get("awards")}`,
    `mem:${get("memberships")}`,
    `pro:${get("projects")}`,
    `brd:${get("boardRoles")}`,
    `etr:${get("executiveTraining")}`,
    `pub:${get("publications")}`,
    `tls:${get("tools")}`,
    `vol:${get("volunteer")}`,
    `sum:${cvData.summary ? 1 : 0}`,
    `pi:${cvData.personalInfo ? 1 : 0}`,
  ];
  return parts.join("|");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cvData } = await req.json();
    if (!cvData) return NextResponse.json({ error: "cvData is required" }, { status: 400 });

    const currentHash = computeDataHash(cvData);

    // Check if we already have a message for this exact data hash.
    // Wrapped in try/catch — table may not exist yet in production.
    let existing: { message: string; cta_label: string; data_hash: string } | null = null;
    let tableExists = true;
    try {
      const { data, error } = await supabase
        .from("cv_hook_messages")
        .select("message, cta_label, data_hash")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        // relation does not exist → table not yet migrated
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          tableExists = false;
        } else {
          throw error;
        }
      } else {
        existing = data;
      }
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      if (msg.includes("does not exist") || (dbErr as any)?.code === "42P01") {
        tableExists = false;
      } else {
        throw dbErr;
      }
    }

    if (existing && existing.data_hash === currentHash) {
      return NextResponse.json({ message: existing.message, cta_label: existing.cta_label, cached: true });
    }

    // Build a compact profile summary for the AI prompt
    const pi = cvData.personalInfo as Record<string, string> | null;
    const expCount = Array.isArray(cvData.experiences) ? cvData.experiences.length : 0;
    const eduCount = Array.isArray(cvData.education) ? cvData.education.length : 0;
    const skillCount = Array.isArray(cvData.skills) ? cvData.skills.length : 0;
    const certCount = Array.isArray(cvData.certifications) ? cvData.certifications.length : 0;
    const langCount = Array.isArray(cvData.languages) ? cvData.languages.length : 0;
    const refCount = Array.isArray(cvData.referees) ? cvData.referees.length : 0;
    const achCount = Array.isArray(cvData.keyAchievements) ? cvData.keyAchievements.length : 0;
    const boardCount = Array.isArray(cvData.boardRoles) ? cvData.boardRoles.length : 0;
    const pubCount = Array.isArray(cvData.publications) ? cvData.publications.length : 0;
    const hasLinkedIn = Boolean(pi?.linkedin?.trim());
    const hasWebsite = Boolean(pi?.website?.trim());
    const hasPhone = Boolean(pi?.phone?.trim());
    const hasSummary = Boolean(cvData.summary);

    const profileSummary = `
Name: ${pi?.fullName || "Unknown"}
Experience entries: ${expCount}
Education entries: ${eduCount}
Skills: ${skillCount}
Certifications: ${certCount}
Languages: ${langCount}
References: ${refCount}
Key Achievements: ${achCount}
Board Roles: ${boardCount}
Publications: ${pubCount}
Has professional summary: ${hasSummary}
Has LinkedIn URL: ${hasLinkedIn}
Has website: ${hasWebsite}
Has phone number: ${hasPhone}
Career level: ${cvData.careerCategory || "unknown"}
`.trim();

    const firstName = (pi?.fullName || "").split(" ")[0] || "there";

    const prompt = `You are a senior recruitment director who has reviewed 10,000+ CVs. Write a hook message for the CV information entry screen.

Rules:
1. MUST start with exactly "${firstName}," — required, never skip
2. Identify 2–3 DIFFERENT weaknesses from across these areas — vary them, do NOT fixate on one topic like achievements:
   - Too few experience roles for their career level
   - No or weak professional summary
   - Skills list too thin or generic
   - No certifications or qualifications listed
   - No education details
   - No references added
   - Career progression not visible
   - Key achievements missing
   - No projects or extracurricular work
   - Profile overall too sparse to pass ATS screening
3. State the real-world consequence of these gaps combined (screened out, losing shortlists, salary ceiling, invisible to headhunters)
4. Close with a confident line that this screen is for entering raw information — the improvement and polish happens on the next screen once they save. E.g. "Fill in everything here — we'll handle the transformation on the next step."
5. Human tone, no mention of AI. 3–4 sentences max, under 300 characters
6. CTA label: 3–5 words on completing and saving

DO NOT mention: LinkedIn URL, phone number, website.
DO NOT repeat the same weakness on every message — look at what is actually missing in the profile data.

PROFILE DATA:
${profileSummary}

Return ONLY valid JSON:
{
  "message": "<hook message, under 300 chars>",
  "cta_label": "<3–5 word action label>"
}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: "No AI response" }, { status: 500 });

    const { message, cta_label } = JSON.parse(raw) as { message: string; cta_label: string };

    // Upsert into DB — skip silently if table hasn't been migrated yet
    if (tableExists) {
      await supabase.from("cv_hook_messages").upsert(
        { user_id: user.id, message, cta_label, data_hash: currentHash, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }

    return NextResponse.json({ message, cta_label, cached: false });
  } catch (err: unknown) {
    console.error("CV hook message error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate hook message" },
      { status: 500 }
    );
  }
}
