import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

const SECTION_PROMPTS: Record<string, string> = {
  personal: `Analyze this CV personal information section. Check for:
- Missing critical fields (name, email, phone)
- Unprofessional email address
- Missing LinkedIn or portfolio for tech roles
- Location format issues
- Headline quality (is it compelling and specific?)
Return feedback as JSON.`,

  summary: `Analyze this CV professional summary. Check for:
- Too short (under 2 sentences) or too long (over 5 sentences)
- Generic/vague language instead of specific achievements
- Missing keywords relevant to the profession
- First-person vs third-person consistency
- Spelling or grammar issues
Return feedback as JSON.`,

  experience: `Analyze this CV work experience section. Check for:
- Missing dates or inconsistent date formats
- Employment gaps
- Weak action verbs (e.g. "responsible for" instead of "led", "managed", "delivered")
- Missing quantifiable achievements (numbers, percentages, metrics)
- Descriptions that are too short or too vague
- Job titles that are unclear
Return feedback as JSON.`,

  education: `Analyze this CV education section. Check for:
- Missing institution names or degrees
- Missing graduation years
- Incomplete or unclear degree names
- Order (should be most recent first)
Return feedback as JSON.`,

  expertise: `Analyze this CV areas of expertise section. Check for:
- Too few areas listed (less than 3)
- Areas that are too vague or generic
- Missing descriptions where they would add value
- Relevance and specificity
Return feedback as JSON.`,

  skills: `Analyze this CV skills section. Check for:
- Skills not categorized properly
- Too few skills listed
- Outdated or irrelevant skills
- Missing in-demand skills for the role implied by experience
- Soft skills vs hard skills balance
Return feedback as JSON.`,

  certifications: `Analyze this CV certifications section. Check for:
- Missing issuer or year
- Expired certifications that should be noted
- Certifications that may not be relevant
Return feedback as JSON.`,

  languages: `Analyze this CV languages section. Check for:
- Missing proficiency levels
- Inconsistent proficiency labels
- Too few details
Return feedback as JSON.`,

  referees: `Analyze this CV referees section. Check for:
- Missing contact details (phone or email)
- Missing title or company
- Too few referees (typically 2-3 recommended)
- Incomplete information
Return feedback as JSON.`,

  declaration: `Analyze this CV declaration section. Check for:
- Missing or incomplete declaration text
- Missing place or date
- Overly generic declaration
Return feedback as JSON.`,
};

export async function POST(req: NextRequest) {
  try {
    const { section, data } = await req.json();

    if (!section || !data) {
      return NextResponse.json({ error: "Section name and data are required" }, { status: 400 });
    }

    const sectionPrompt = SECTION_PROMPTS[section];
    if (!sectionPrompt) {
      return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }

    const prompt = `You are a professional CV/resume reviewer. ${sectionPrompt}

Return ONLY valid JSON with this structure:
{
  "score": <number 1-10>,
  "issues": [
    { "type": "error" | "warning" | "suggestion", "message": "<specific feedback>" }
  ],
  "overallFeedback": "<one sentence summary>"
}

Rules:
- "error" = critical problem that must be fixed
- "warning" = important improvement recommended
- "suggestion" = nice-to-have enhancement
- Be specific and actionable in every message
- If the section data is empty or has no entries, flag it as an error
- Maximum 5 issues, prioritize the most impactful ones
- Return ONLY the JSON, no markdown

SECTION DATA:
${JSON.stringify(data, null, 2)}`;

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
    return NextResponse.json({ analysis: parsed });
  } catch (err: any) {
    console.error("AI analysis error:", err);
    return NextResponse.json(
      { error: err.message || "AI analysis failed" },
      { status: 500 }
    );
  }
}
