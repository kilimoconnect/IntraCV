import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData } = await req.json();
    if (!cvData) return NextResponse.json({ error: "cvData is required" }, { status: 400 });

    const prompt = `You are an expert CV analyst and career coach.

Analyze this CV profile and return a structured readiness assessment.

PROFILE DATA:
${JSON.stringify(cvData, null, 2)}

Return ONLY valid JSON in this exact structure:
{
  "cvStrength": <integer 0-100 — overall CV strength and job-readiness>,
  "cvIssues": ["<specific issue found in this CV — max 5>"],
  "cvImprovements": ["<specific improvement our AI will make — max 5>"]
}

Rules:
- cvStrength: 0=empty/useless, 100=perfectly optimised. Factor in: has summary, experience quality, achievements, skills, education, measurable outcomes, ATS keywords.
- cvIssues: Specific issues in THIS profile (e.g. "Weak or generic professional summary", "No measurable achievements in experience", "Missing LinkedIn profile URL", "Not ATS optimized — lacks industry keywords", "Thin work descriptions — only job duties listed"). Max 5.
- cvImprovements: What the AI WILL improve when generating the CV (e.g. "Professional ATS-optimised layout", "Strong results-driven summary", "Achievement-based bullet points with metrics", "Strategic keyword integration", "Clean executive formatting"). Max 5.
- Be specific to the actual profile content — not generic.
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
    console.error("CV readiness error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Analysis failed" }, { status: 500 });
  }
}
