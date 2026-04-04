import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData, jobDescription, analysis, category } = await req.json();
    if (!cvData || !jobDescription?.trim()) {
      return NextResponse.json({ error: "cvData and jobDescription are required" }, { status: 400 });
    }

    const missingSkills: string[] = analysis?.missingSkills || [];
    const weakAreas: string[] = analysis?.weakAreas || [];

    const prompt = `You are an expert CV writer and career coach specializing in ATS optimization.

TASK: Optimize this candidate's CV for the provided job description, then write a tailored cover letter.

CURRENT CV DATA (JSON — preserve ALL fields and schema):
${JSON.stringify(cvData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

GAP ANALYSIS:
- Missing skills: ${missingSkills.join(", ") || "none identified"}
- Weak areas: ${weakAreas.join("; ") || "none identified"}
- Career level: ${category || "mid-senior"}

OPTIMIZATION RULES:
1. Profile/summary: rewrite to naturally incorporate key JD keywords and position requirements.
2. Experience bullets: enhance with stronger action verbs and quantified results that resonate with JD requirements. Do NOT invent fake numbers — improve phrasing of existing ones.
3. Skills: add missing skills the candidate plausibly has based on their existing experience. Do not fabricate expertise.
4. Achievements: align existing achievements to JD priorities if possible.
5. NEVER change personal info (fullName, email, phone, location, linkedin, title).
6. NEVER invent new jobs, qualifications, or degrees.
7. Keep the exact same JSON schema — all fields, same keys, same nesting.

COVER LETTER RULES:
- 3–4 paragraphs, professional and confident tone
- Extract company name from JD if possible, otherwise use "the organization"
- Reference specific JD requirements and match them to the candidate's real experience
- Strong opening hook, strong closing with call to action
- No placeholder brackets like [Company Name] or [Your Name] — use actual data
- Plain text with \\n for paragraph breaks

Return ONLY valid JSON:
{
  "optimizedCvData": { ...complete CV data object with all fields, same schema as input... },
  "coverLetter": "<full cover letter text>"
}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No AI response" }, { status: 500 });

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Job optimization error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Optimization failed" },
      { status: 500 }
    );
  }
}
