import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { cvData } = await req.json();
    if (!cvData) return NextResponse.json({ error: "cvData is required" }, { status: 400 });

    // Build a compact representation of the CV for the AI to analyze
    const experiences = (cvData.experiences || []).map((e: any, i: number) => ({
      index: i,
      title: e.title,
      company: e.company,
      bullets: (Array.isArray(e.description) ? e.description : String(e.description || "").split("\n")).filter((l: string) => l.trim()),
    }));

    const prompt = `You are a senior CV editor. Analyze this CV for duplicate and misplaced content, then return a CLEANED version.

═══ CURRENT CV DATA ═══

SUMMARY:
${cvData.summary || "(empty)"}

EXPERIENCE (${experiences.length} roles):
${experiences.map((e: any) => `[${e.index}] ${e.title} at ${e.company}:\n${e.bullets.map((b: string) => `  ${b}`).join("\n")}`).join("\n\n")}

KEY ACHIEVEMENTS (${(cvData.keyAchievements || []).length}):
${(cvData.keyAchievements || []).map((a: string, i: number) => `  [${i}] ${a}`).join("\n")}

SKILLS (${(cvData.skills || []).length}):
${(cvData.skills || []).map((s: any) => s.name).join(", ")}

═══ INSTRUCTIONS ═══

1. IDENTIFY DUPLICATES:
   - Find bullet points in Experience that say the SAME thing as a Key Achievement (even if worded differently)
   - Find bullet points repeated across different roles
   - Find achievements that are just rephrased experience bullets

2. REALLOCATE CONTENT:
   - Key Achievements should be UNIQUE career-defining highlights NOT already covered by experience bullets
   - Experience bullets should be role-specific STAR achievements, not generic statements
   - If an achievement duplicates an experience bullet, REMOVE it from Key Achievements and keep the detailed version in Experience
   - If content belongs in a different section, move it

3. DEDUPLICATE:
   - Remove redundant bullets that say the same thing in different words
   - Keep the MORE DETAILED and SPECIFIC version
   - Ensure each bullet is unique across the entire CV

4. IMPROVE KEY ACHIEVEMENTS:
   - After removing duplicates, if fewer than 3 achievements remain, generate NEW ones from the career data
   - Each achievement should highlight a DIFFERENT career-defining moment not covered in experience bullets
   - Achievements should be cross-role or career-level accomplishments

5. CLEAN SUMMARY:
   - Remove any content that duplicates specific experience bullets
   - Keep it as a high-level career overview (50-80 words)

RETURN ONLY JSON with this EXACT structure:
{
  "summary": "cleaned summary text",
  "experiences": [
    {
      "index": 0,
      "bullets": ["• cleaned bullet 1", "• cleaned bullet 2"]
    }
  ],
  "keyAchievements": ["unique achievement 1", "unique achievement 2"],
  "changes": [
    "Removed duplicate: 'X' in Experience[0] overlapped with Achievement[2]",
    "Moved: 'Y' from Achievements to Experience[1]"
  ]
}

RULES:
- Keep the same number of experience entries (use "index" to match)
- Each experience should have 4-6 unique bullets
- Key Achievements should have 3-5 UNIQUE items not found in experience bullets
- "changes" should list every deduplication action taken
- If NO duplicates found, still return the data with changes: ["No duplicates found"]`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a meticulous CV editor. Return ONLY valid JSON. No markdown, no explanation." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let result: any;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      else throw new Error("Failed to parse AI response");
    }

    // Apply changes to the CV data
    const updatedCV = { ...cvData };

    // Update summary
    if (result.summary) {
      updatedCV.summary = result.summary;
    }

    // Update experience bullets
    if (result.experiences && Array.isArray(result.experiences)) {
      const exps = [...(updatedCV.experiences || [])];
      for (const change of result.experiences) {
        const idx = change.index;
        if (idx >= 0 && idx < exps.length && change.bullets) {
          const bulletStr = change.bullets
            .map((b: string) => (b.startsWith("•") ? b : `• ${b}`))
            .join("\n");
          exps[idx] = { ...exps[idx], description: bulletStr };
        }
      }
      updatedCV.experiences = exps;
    }

    // Update key achievements
    if (result.keyAchievements && Array.isArray(result.keyAchievements)) {
      updatedCV.keyAchievements = result.keyAchievements;
    }

    const changes = result.changes || [];
    console.log(`[Deduplicate CV] ${changes.length} changes:`, changes);

    return NextResponse.json({
      updatedCV,
      changes,
      duplicatesFound: changes.length > 0 && changes[0] !== "No duplicates found",
    });
  } catch (err: any) {
    console.error("[Deduplicate CV] Error:", err);
    return NextResponse.json({ error: err.message || "Deduplication failed" }, { status: 500 });
  }
}
