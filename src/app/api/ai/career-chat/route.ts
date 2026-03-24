import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, cvSummary } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI Career Assistant. You help users with:
- Career advice and planning
- Job search strategies
- Interview preparation tips
- Salary negotiation guidance
- Resume/CV improvement suggestions
- Industry insights and trends
- Professional development recommendations

${cvSummary ? `The user's CV summary for context:\n${cvSummary}` : ""}

Be concise, actionable, and supportive. Format responses with markdown for readability.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20),
      ],
      temperature: 0.7,
      max_tokens: 1000,
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
