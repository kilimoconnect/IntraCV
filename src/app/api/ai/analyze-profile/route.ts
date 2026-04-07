import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData, jobDescription } = await req.json();
    if (!cvData) {
      return NextResponse.json({ error: "cvData is required" }, { status: 400 });
    }

    const hasJD = Boolean(jobDescription?.trim());

    const prompt = `You are an expert CV analyst and career coach.

Analyze this candidate's profile data and return a structured assessment.

PROFILE DATA:
${JSON.stringify(cvData, null, 2)}

${hasJD ? `JOB DESCRIPTION TO COMPARE AGAINST:\n${jobDescription}\n` : ""}

Return ONLY valid JSON in this exact structure:
{
  "completenessScore": <integer 0-100 — overall profile completeness and strength>,
  "strengths": ["<specific strength from the profile>"],
  "gaps": ["<specific gap, missing info, or weakness in the profile>"]${hasJD ? `,
  "atsScore": <integer 0-100 — realistic match score between profile and JD>,
  "missingSkills": ["<skill or keyword in JD that is absent from the profile>"],
  "weakAreas": ["<specific aspect of the profile that is weak relative to JD requirements>"]` : ""}
}

Rules:
- completenessScore: factor in presence and quality of summary, experience, education, skills, achievements, certifications, references. 0=empty, 100=perfectly complete.
- strengths: 3–5 specific strengths that will work well in a CV (e.g. "Progressive leadership across 3 companies spanning 12 years")
- gaps: 3–5 gaps that ONLY the user can fix manually — things the AI cannot auto-generate during CV creation. Focus on: missing data fields (LinkedIn URL, website, phone), entirely absent sections (no certifications listed, no languages, no references), or structural issues (only 1 experience entry for a 10-year career). DO NOT include gaps about phrasing, bullet point quality, metrics/quantification, writing style, or thin descriptions — those are fixed automatically by AI during CV generation.${hasJD ? `
- atsScore: 0=no match at all, 100=perfect match. Be realistic and accurate.
- missingSkills: 3–7 specific skills/tools/certifications from the JD not found in the profile
- weakAreas: 3–5 specific weaknesses relative to JD requirements (e.g. "Summary doesn't mention cloud architecture which is core to the role")` : ""}
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
