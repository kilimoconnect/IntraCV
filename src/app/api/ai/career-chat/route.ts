import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages, profile } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Build a rich, readable profile context from the user's saved data
    const lines: string[] = [];
    if (profile) {
      const p = profile;
      if (p.personalInfo?.fullName) lines.push(`Name: ${p.personalInfo.fullName}`);
      if (p.personalInfo?.headline)  lines.push(`Headline: ${p.personalInfo.headline}`);
      if (p.personalInfo?.location)  lines.push(`Location: ${p.personalInfo.location}`);
      if (p.summary)                 lines.push(`Summary: ${p.summary}`);
      if (p.experiences?.length)     lines.push(`Experience:\n${p.experiences.map((e: any) => `  - ${e.title} at ${e.company} (${e.startDate} – ${e.endDate || "present"})`).join("\n")}`);
      if (p.education?.length)       lines.push(`Education:\n${p.education.map((e: any) => `  - ${e.degree}, ${e.institution} (${e.year})`).join("\n")}`);
      if (p.skills?.length)          lines.push(`Skills: ${p.skills.map((s: any) => s.name).join(", ")}`);
      if (p.certifications?.length)  lines.push(`Certifications: ${p.certifications.map((c: any) => c.name).join(", ")}`);
      if (p.languages?.length)       lines.push(`Languages: ${p.languages.map((l: any) => `${l.name} (${l.proficiency})`).join(", ")}`);
      if (p.keyAchievements?.length) lines.push(`Key Achievements:\n${p.keyAchievements.map((a: any) => `  - ${a.achievement}`).join("\n")}`);
    }
    const profileContext = lines.length
      ? `The user's saved profile data:\n${lines.join("\n")}`
      : "No profile data available yet.";

    const systemPrompt = `You are an expert AI Career Assistant embedded in IntraCV. You help users with career advice, job search, interview preparation, salary negotiation, CV improvement, and professional development.

ALWAYS respond with valid JSON matching this exact schema (no markdown, no text outside the JSON):
{
  "reply": "1-2 sentence opening that directly addresses the question, referencing the user's specific background",
  "sections": [
    {
      "title": "Section title",
      "items": [
        { "heading": "Action or point", "body": "Detailed, specific explanation" }
      ]
    }
  ],
  "tips": ["Short actionable tip 1", "Short actionable tip 2"]
}

Rules:
- "reply" is always present
- Include "sections" and "tips" only when giving structured advice
- For simple conversational replies, use only "reply" with empty arrays
- Always reference the user's actual name, job titles, and skills from their profile
- Never use markdown syntax (###, **, *, etc.) inside any string value
- Output raw JSON only

${profileContext}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20),
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ message: content });
  } catch (err: any) {
    console.error("Career chat error:", err);
    return NextResponse.json(
      { error: err.message || "Chat failed" },
      { status: 500 }
    );
  }
}
