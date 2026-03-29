import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

// ─── Helper: summarize experience for context ───
function expSummary(cvData: any): string {
  return (cvData.experiences || [])
    .map((e: any) => `${e.title || ""} at ${e.company || ""} (${e.startDate}–${e.endDate})`)
    .join("; ");
}

// ─── Section-specific prompts ───
function getSectionPrompt(sectionKey: string, cvData: any, careerLevel: string): string {
  const pi = cvData.personalInfo || {};
  const name = pi.fullName || pi.name || "the candidate";
  const headline = pi.headline || "";
  const career = expSummary(cvData);
  const skills = (cvData.skills || []).map((s: any) => s.name || s).join(", ");

  const context = `
CANDIDATE: ${name}, ${headline}
CAREER: ${career}
SKILLS: ${skills}
CAREER LEVEL: ${careerLevel}
`;

  switch (sectionKey) {
    case "keyAchievements":
      return `You are an expert CV writer. Generate key career achievements for this professional.
${context}
EXISTING EXPERIENCE:
${JSON.stringify(cvData.experiences || [], null, 2)}

Write ${careerLevel === "executive" ? "5-7" : "3-5"} KEY achievements. Each:
- A complete sentence of 15-25 words
- Include a specific quantified result (%, $, time, team size)
- Use past tense action verbs (Increased, Streamlined, Achieved, Delivered)
- Draw from the actual career data — do not fabricate
- Each highlights a DIFFERENT aspect of the career

Return ONLY JSON: { "keyAchievements": ["achievement1", "achievement2", ...] }`;

    case "memberships":
      return `You are an expert CV writer. Suggest professional memberships relevant to this candidate.
${context}
Based on the candidate's profession, industry, and career level, suggest 2-4 professional organizations or associations they should belong to.
- Only suggest real, well-known professional bodies
- Relevant to their field (e.g., accounting → NBAA, ACCA; engineering → IET; management → CIM)
- Include the full name of the organization

Return ONLY JSON: { "memberships": ["membership1", "membership2", ...] }`;

    case "projects":
      return `You are an expert CV writer. Generate notable projects for this professional.
${context}
EXISTING EXPERIENCE:
${JSON.stringify(cvData.experiences || [], null, 2)}

Generate ${careerLevel === "junior" ? "3-4" : "2-3"} significant projects derived from the candidate's actual work experience. Each:
- name: Clear, descriptive project title
- description: 2-3 sentences describing scope, actions, and measurable outcomes
- tech: Key tools/technologies used (if applicable)

Return ONLY JSON: { "projects": [{ "name": "", "description": "", "tech": "" }] }`;

    case "volunteer":
      return `You are an expert CV writer. Suggest volunteer experience entries for this candidate.
${context}
Suggest 2-3 plausible volunteer activities that would complement this professional's career:
- Related to their industry or transferable skills
- Include specific roles (e.g., "Financial literacy mentor" not just "Volunteer")
- Each entry should be a descriptive string

Return ONLY JSON: { "volunteer": ["entry1", "entry2", ...] }`;

    case "boardRoles":
      return `You are an expert CV writer. Generate board and advisory role entries for this executive.
${context}
EXISTING EXPERIENCE:
${JSON.stringify(cvData.experiences || [], null, 2)}

Generate 2-3 board or advisory roles that would be appropriate for this executive based on their career:
- title: Board/advisory role title
- organization: Organization name (plausible, industry-relevant)
- startDate: Estimated start date
- endDate: "Ongoing" or estimated end
- description: 1-2 sentences about contributions and governance activities

Return ONLY JSON: { "boardRoles": [{ "title": "", "organization": "", "startDate": "", "endDate": "", "description": "" }] }`;

    case "publications":
      return `You are an expert CV writer. Suggest publications for this professional.
${context}
Suggest 2-3 plausible publications (articles, papers, or presentations) that align with this professional's expertise:
- title: Publication/presentation title
- publisher: Journal, conference, or platform name
- year: Plausible year
- type: "article" | "paper" | "presentation" | "book-chapter"

Return ONLY JSON: { "publications": [{ "title": "", "publisher": "", "year": "", "type": "" }] }`;

    case "executiveTraining":
      return `You are an expert CV writer. Suggest executive training programs for this professional.
${context}
EXISTING EDUCATION:
${JSON.stringify(cvData.education || [], null, 2)}
EXISTING CERTIFICATIONS:
${JSON.stringify(cvData.certifications || [], null, 2)}

Suggest 2-3 executive training programs that would complement this professional's career:
- name: Program name (use real, well-known programs)
- institution: Institution name (e.g., Harvard Business School, INSEAD, Wharton)
- year: Plausible year based on career timeline

Return ONLY JSON: { "executiveTraining": [{ "name": "", "institution": "", "year": "" }] }`;

    case "languages":
      return `You are an expert CV writer. List languages for this candidate.
${context}
LOCATION: ${pi.location || "Not specified"}

Based on the candidate's location, name, and career context, list their likely languages with proficiency levels.
- Include the primary language of their country/region
- Include English if they work in an international context
- Proficiency: "Native", "Fluent", "Proficient", "Intermediate", "Basic"

Return ONLY JSON: { "languages": [{ "name": "", "proficiency": "" }] }`;

    case "tools":
      return `You are an expert CV writer. List tools and software for this professional.
${context}
Based on the candidate's profession, experience, and skills, list 5-8 key software tools and platforms they likely use:
- Include industry-standard tools for their field
- Include general productivity tools (e.g., MS Office Suite, Google Workspace)
- Be specific (e.g., "SAP ERP" not just "ERP")

Return ONLY JSON: { "tools": ["tool1", "tool2", ...] }`;

    case "summary":
      return `You are an expert CV summary writer.
${context}
Write a POWERFUL professional summary of 50-80 words (3-4 sentences):
1. Years of experience + core expertise area + professional designation
2. 2-3 specific quantified achievements from real career data
3. Key competencies and what differentiates this candidate
4. Career objective
- Third person only (no "I"/"my")
- MUST include at least 2 specific numbers/metrics

Return ONLY JSON: { "summary": "" }`;

    case "declaration":
      return `Generate a professional declaration for ${name}.
Return ONLY JSON: { "declaration": { "declaration": "I, ${name}, hereby declare that the information provided in this Curriculum Vitae is true and correct to the best of my knowledge and belief.", "place": "${pi.location || ""}", "date": "${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}" } }`;

    default:
      return `Generate content for the "${sectionKey}" section of a CV for ${name} (${headline}). Career: ${career}. Return JSON with the section key and appropriate data.`;
  }
}

// ─── API Route ───
export async function POST(req: NextRequest) {
  try {
    const { cvData, sectionKey, careerLevel } = await req.json();
    if (!cvData || !sectionKey) {
      return NextResponse.json({ error: "cvData and sectionKey are required" }, { status: 400 });
    }

    const prompt = getSectionPrompt(sectionKey, cvData, careerLevel || "mid-senior");

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert CV writer. Return ONLY valid JSON, no markdown, no explanation." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let sectionData: any;
    try {
      sectionData = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sectionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    console.log(`[Generate Missing] Section: ${sectionKey}, Level: ${careerLevel}, Keys: ${Object.keys(sectionData).join(", ")}`);

    return NextResponse.json({ sectionData, sectionKey });
  } catch (err: any) {
    console.error("[Generate Missing Section] Error:", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
