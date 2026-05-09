import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData, jobDescription, company, jobTitle, category } = await req.json();
    if (!cvData) {
      return NextResponse.json({ error: "cvData is required" }, { status: 400 });
    }

    const hasJD = Boolean(jobDescription?.trim());

    // Human-readable label and calibration context for each career level
    const categoryLabels: Record<string, string> = {
      junior:         "Junior (0–3 years experience, entry-level)",
      "mid-senior":   "Mid-Senior (4–12 years experience, managerial or specialist)",
      executive:      "Executive (12+ years, C-suite / Director / VP level)",
    };
    const categoryLabel = category ? (categoryLabels[category] ?? category) : null;

    const categoryContext = categoryLabel
      ? `CANDIDATE CAREER LEVEL: ${categoryLabel}
Calibrate ALL scores and feedback to this level. If the candidate's career level does not match the seniority of the target role, flag this explicitly. A Junior applying for a Director/VP/C-suite role should receive a heavily penalised ATS score and a clear gap about the level mismatch. An Executive applying for a junior role should be flagged as overqualified. Always compare the candidate's actual level against the expectations of the role.`
      : "";

    const prompt = `You are an expert CV analyst and career coach.

Analyze this candidate's profile and return a structured assessment.

${categoryContext}

PROFILE DATA:
${JSON.stringify(cvData, null, 2)}

${hasJD ? `ROLE BEING APPLIED FOR: ${jobTitle ?? "Not specified"} at ${company ?? "Not specified"}

JOB DESCRIPTION:
${jobDescription}
` : ""}

Return ONLY valid JSON in this exact structure:
{
  "completenessScore": <integer 0-100 — overall profile completeness and strength>,
  "strengths": ["<specific strength from the profile>"],
  "gaps": ["<specific gap, missing info, or weakness in the profile>"]${hasJD ? `,
  "atsScore": <integer 0-100 — realistic match score between profile and JD, calibrated to candidate career level>,
  "missingSkills": ["<skill or keyword in JD that is absent from the profile>"],
  "weakAreas": ["<specific aspect of the profile that is weak relative to JD requirements>"]` : ""}
}

Rules:
- completenessScore: factor in presence and quality of summary, experience, education, skills, achievements, certifications, references. 0=empty, 100=perfectly complete.
- strengths: 3–5 specific strengths evident in the profile (e.g. "Progressive leadership across 3 companies spanning 12 years"). Be specific — reference actual data.
- gaps: 3–5 gaps that ONLY the user can fix manually. Focus on: missing data fields (LinkedIn URL, website, phone), entirely absent sections (no certifications, no languages, no references), structural issues (only 1 role listed for a 10-year career), or career-level mismatch with the target role (e.g. "Profile is classified as Junior but the ${jobTitle ?? "role"} requires Director-level experience — significant experience gap"). DO NOT include gaps about phrasing, bullet quality, metrics/quantification, or writing style — those are auto-fixed during CV generation.${hasJD ? `
- atsScore: 0=no match at all, 100=perfect match. Be realistic. Penalise career-level mismatches heavily (Junior vs Director role ≤ 30, regardless of skill overlap). Reward strong skill and experience alignment.
- missingSkills: 3–7 specific skills, tools, or certifications mentioned in the JD but absent from the profile
- weakAreas: 3–5 specific weaknesses relative to both the JD requirements AND the candidate's career level (e.g. "No P&L management experience listed but the Director role requires it", "Summary omits cloud architecture which is central to the JD")` : ""}
- Reference actual profile content in your responses — be specific, not generic
- Return ONLY JSON, no extra text`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No AI response" }, { status: 500 });

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Profile analysis error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
