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

    const prompt = `You are a senior recruitment director who has reviewed 10,000+ CVs. Write a hook message for the CV information entry screen. The message must:

1. MUST start with exactly "${firstName}," — this is required, do not skip or rephrase the opening
2. Name the single biggest weakness in their current profile — be specific. Think: too few roles, no achievements to prove impact, thin descriptions, no career progression, profile too sparse to pass screening
3. State the real consequence (rejected before a human reads it, losing shortlists, invisible to headhunters)
4. Make clear this screen is for entering their raw information — the improvement and optimisation happens automatically on the next screen once they save. Use phrasing like "Complete your profile here and we'll handle the rest on the next step." or "Fill in your details — the transformation happens once you proceed."
5. Human tone, confident, no mention of AI. 2–3 sentences, max 260 characters
6. CTA label: 3–5 words focused on completing and saving (e.g. "Complete & Save", "Save & proceed", "Fill in & continue") — no mention of AI or technology

DO NOT mention: LinkedIn URL, phone number, website, or other contact fields.

PROFILE DATA:
${profileSummary}

Return ONLY valid JSON:
{
  "message": "<hook message, max 210 chars>",
  "cta_label": "<3–5 word action label>"
}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
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
