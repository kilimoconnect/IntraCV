import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData, jobDescription } = await req.json();
    if (!cvData || !jobDescription?.trim()) {
      return NextResponse.json({ error: "cvData and jobDescription are required" }, { status: 400 });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze this candidate's CV against the provided job description and return a detailed gap analysis.

CV DATA:
${JSON.stringify(cvData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in this exact structure:
{
  "atsScore": <integer 0-100 — realistic score of how well the CV matches the JD>,
  "missingSkills": ["<skill or keyword in JD but absent from CV>"],
  "weakAreas": ["<specific weakness of the CV relative to JD requirements>"]
}

Rules:
- atsScore: 0=no match, 100=perfect match. Factor in keywords, skills, experience level, and role alignment.
- missingSkills: 3–8 specific skills, tools, certifications, or keywords from the JD not found in the CV.
- weakAreas: 3–5 specific actionable weaknesses (e.g. "Summary doesn't mention cloud architecture which is a core JD requirement").
- Be specific, not generic. Reference actual JD content.
- Return ONLY JSON, no extra text.`;

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
    console.error("JD analysis error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
