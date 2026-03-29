import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a precision CV copy-fitter. Your job is to shorten CV text to fit within a character budget while preserving impact and professionalism.

RULES:
- Return ONLY valid JSON.
- Every sentence MUST be complete — never cut mid-sentence.
- Use high-impact professional language, 3rd person.
- Preserve the most important keywords, metrics, and achievements.
- Remove filler words, redundant phrases, and less impactful content first.
- If shortening bullet points, keep the strongest ones and condense the rest.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionType, content, maxChars, count } = body;

    if (!sectionType || !content) {
      return NextResponse.json({ error: "Missing sectionType or content" }, { status: 400 });
    }

    let prompt: string;

    switch (sectionType) {
      case "profile":
        prompt = `Condense this professional summary to fit within ${maxChars || 300} characters. Keep it impactful and complete.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": "condensed text here"}`;
        break;

      case "bullets":
        prompt = `Condense these experience bullet points. Each bullet should be max ${maxChars || 120} characters. Keep the ${count || 4} most impactful bullets. Every bullet must be a complete sentence ending with a period.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": ["bullet1", "bullet2"]}`;
        break;

      case "achievements":
        prompt = `Condense these achievements. Each should be max ${maxChars || 120} characters. Keep the ${count || 4} most impactful ones. Every achievement must be a complete sentence.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": ["achievement1", "achievement2"]}`;
        break;

      case "skills":
        prompt = `Select the ${count || 10} most relevant and impactful skills from this list. Each skill label max ${maxChars || 18} characters.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": ["skill1", "skill2"]}`;
        break;

      case "generic-text":
        prompt = `Condense this text to fit within ${maxChars || 200} characters while preserving key information. Must end with a complete sentence.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": "condensed text"}`;
        break;

      case "generic-list":
        prompt = `Condense this list to the ${count || 3} most important items. Each max ${maxChars || 100} characters.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": ["item1", "item2"]}`;
        break;

      default:
        prompt = `Condense this CV content to be shorter while preserving key information.
SOURCE: ${JSON.stringify(content)}
Return JSON: {"result": ${Array.isArray(content) ? '["item1"]' : '"condensed text"'}}`;
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
    return NextResponse.json({ success: true, result: parsed.result });
  } catch (error: any) {
    console.error("AI Condense Error:", error);
    return NextResponse.json({ error: error.message || "Condense failed" }, { status: 500 });
  }
}
