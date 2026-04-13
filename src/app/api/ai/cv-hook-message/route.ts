import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cvData } = await req.json();
    if (!cvData) return NextResponse.json({ error: "cvData is required" }, { status: 400 });

    const currentHash = computeDataHash(cvData);

    // Check if we already have a message for this exact data hash
    const { data: existing } = await supabase
      .from("cv_hook_messages")
      .select("message, cta_label, data_hash")
      .eq("user_id", user.id)
      .maybeSingle();

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

    const prompt = `You are a career coach helping a user build a strong CV. Based on their current profile completeness, write a short motivating hook message (1–2 sentences, max 180 characters) that:
- Points out the single most important thing they are MISSING or should improve RIGHT NOW
- Feels urgent and personal (use "you", not "we")
- Ends with a clear, action-oriented CTA label (3–5 words, like "Add LinkedIn URL" or "Add your experience")

PROFILE DATA:
${profileSummary}

Return ONLY valid JSON:
{
  "message": "<hook message, max 180 chars>",
  "cta_label": "<action label, 3–5 words>"
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

    // Upsert into DB
    await supabase.from("cv_hook_messages").upsert(
      { user_id: user.id, message, cta_label, data_hash: currentHash, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ message, cta_label, cached: false });
  } catch (err: unknown) {
    console.error("CV hook message error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate hook message" },
      { status: 500 }
    );
  }
}
