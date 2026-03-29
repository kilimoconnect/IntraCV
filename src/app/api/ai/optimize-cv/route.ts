import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData, targetRole, jobDescription } = await req.json();

    if (!cvData) {
      return NextResponse.json({ error: "CV data is required" }, { status: 400 });
    }

    const prompt = `You are an expert CV/resume optimizer. Analyze and optimize this CV data for maximum impact.
${targetRole ? `Target role: ${targetRole}` : ""}
${jobDescription ? `\nJOB DESCRIPTION:\n${jobDescription}\n\nTailor all suggestions to match this specific job description. Highlight missing keywords, skills, and requirements from the JD that should be added to the CV.` : ""}

CV DATA:
${JSON.stringify(cvData, null, 2)}

Provide a comprehensive optimization report as JSON:
{
  "overallScore": <number 1-100>,
  "sections": [
    {
      "name": "<section name>",
      "score": <number 1-10>,
      "improvements": ["<specific actionable improvement>"]
    }
  ],
  "keywordSuggestions": ["<keyword to add>"],
  "atsScore": <number 1-100>,
  "atsTips": ["<ATS optimization tip>"],
  "summary": "<overall assessment in 2-3 sentences>"
}

Rules:
- Be specific and actionable
- Focus on ATS (Applicant Tracking System) compatibility
- Suggest power words and metrics
- Return ONLY valid JSON`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ optimization: parsed });
  } catch (err: any) {
    console.error("CV optimization error:", err);
    return NextResponse.json(
      { error: err.message || "Optimization failed" },
      { status: 500 }
    );
  }
}
