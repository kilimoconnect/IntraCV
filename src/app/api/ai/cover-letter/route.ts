import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData, jobTitle, company, jobDescription } = await req.json();

    if (!cvData || !jobTitle || !company) {
      return NextResponse.json({ error: "CV data, job title, and company are required" }, { status: 400 });
    }

    const prompt = `You are an expert cover letter writer. Generate a professional, compelling cover letter based on:

CANDIDATE CV DATA:
${JSON.stringify(cvData, null, 2)}

TARGET JOB:
- Position: ${jobTitle}
- Company: ${company}
${jobDescription ? `- Job Description: ${jobDescription}` : ""}

Requirements:
- Professional tone, confident but not arrogant
- Highlight relevant experience and skills that match the role
- Show knowledge of the company if possible
- Include a strong opening and closing
- Keep it concise (3-4 paragraphs)
- Do NOT use placeholder brackets like [Your Name] — use actual data from the CV
- Format as plain text with paragraph breaks`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ coverLetter: content });
  } catch (err: any) {
    console.error("Cover letter error:", err);
    return NextResponse.json(
      { error: err.message || "Cover letter generation failed" },
      { status: 500 }
    );
  }
}
