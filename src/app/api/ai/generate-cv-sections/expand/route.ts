import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { currentCV, templateType, targetRole, jobDescription, fillRatio } = await req.json();

    if (!currentCV) {
      return NextResponse.json({ error: "Current CV data required" }, { status: 400 });
    }

    // Calculate how much more content we need
    const deficit = Math.round((1 - fillRatio) * 100);
    const isOnePage = templateType === "one-page";

    const prompt = `You are an expert CV writer. The current CV content only fills ${Math.round(fillRatio * 100)}% of the page. We need approximately ${deficit}% more content to fill the A4 page completely.

TARGET ROLE: ${targetRole || "Not specified"}
JOB DESCRIPTION: ${jobDescription || "Not provided"}

CURRENT CV CONTENT:
- Summary (${currentCV.summary?.length || 0} chars): ${currentCV.summary || ""}
- Experience entries: ${currentCV.experiences?.length || 0} (total bullets: ${currentCV.experiences?.reduce((a: number, e: any) => a + (e.description?.split("\\n").length || 0), 0)})
- Skills: ${currentCV.skills?.length || 0}
- Achievements: ${currentCV.keyAchievements?.length || 0}
- Education entries: ${currentCV.education?.length || 0}

To fill the remaining ${deficit}% of the page, EXPAND the following sections. Rules:
${isOnePage ? `
- Add 1-2 more bullet points to each experience entry (maintain action verb + quantified result format)
- Expand the summary by 1-2 more sentences
- Add 1-2 more key achievements
- Each bullet MUST start with "• " and contain quantified results
` : `
- Add 2-3 more bullet points to each experience entry
- Expand the summary by 2-3 more sentences
- Add 2-3 more key achievements  
- Add more detail to education descriptions
`}
- NEVER fabricate facts — only expand on existing themes with plausible enhancements
- Maintain the same professional tone and format
- Experience bullet format: newline-separated, each starting with "• "

Return ONLY JSON with the expanded sections (only include sections that were expanded):
{
  "summary": "expanded summary text",
  "experiences": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "expanded bullets" }],
  "keyAchievements": ["expanded list"]
}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No AI response" }, { status: 500 });
    }

    const expanded = JSON.parse(content);
    return NextResponse.json({ expandedCV: expanded });
  } catch (err: any) {
    console.error("CV expansion error:", err);
    return NextResponse.json(
      { error: err.message || "CV expansion failed" },
      { status: 500 }
    );
  }
}
