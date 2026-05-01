import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

// ─── Build a comprehensive profile context from all available CV data ───
function buildFullContext(cvData: any, careerLevel: string): string {
  const pi = cvData.personalInfo || {};
  const name = pi.fullName || pi.name || "the candidate";
  const headline = pi.headline || "";

  const experiences = (cvData.experiences || [])
    .map((e: any) =>
      `  • ${e.title || ""}${e.company ? ` at ${e.company}` : ""}${e.location ? `, ${e.location}` : ""} (${e.startDate || "?"}–${e.endDate || "present"})\n    ${(e.description || "").substring(0, 200)}`
    )
    .join("\n");

  const education = (cvData.education || [])
    .map((e: any) => `  • ${e.degree || ""} — ${e.institution || ""} (${e.year || ""})${e.description ? `: ${e.description}` : ""}`)
    .join("\n");

  const skills = (cvData.skills || []).map((s: any) => s.name || s).join(", ");

  const certifications = (cvData.certifications || []).map((c: any) => c.name || "").filter(Boolean).join(", ");

  const languages = (cvData.languages || [])
    .map((l: any) => `${l.name || ""} (${l.proficiency || ""})`)
    .join(", ");

  const achievements = (cvData.keyAchievements || [])
    .map((a: any) => (typeof a === "string" ? a : a.achievement || ""))
    .filter(Boolean)
    .join("; ");

  const memberships = (cvData.memberships || [])
    .map((m: any) => m.name || m)
    .filter(Boolean)
    .join(", ");

  const projects = (cvData.projects || [])
    .map((p: any) => `${p.name || ""}${p.description ? `: ${p.description.substring(0, 100)}` : ""}`)
    .filter(Boolean)
    .join("; ");

  const publications = (cvData.publications || [])
    .map((p: any) => p.title || "")
    .filter(Boolean)
    .join("; ");

  return `=== CANDIDATE PROFILE ===
Name: ${name}
Headline / Role: ${headline}
Location: ${pi.location || "Not specified"}
Career Level: ${careerLevel}

--- EXPERIENCE ---
${experiences || "  None on record"}

--- EDUCATION ---
${education || "  None on record"}

--- SKILLS ---
${skills || "None on record"}

--- CERTIFICATIONS ---
${certifications || "None on record"}

--- LANGUAGES ---
${languages || "None on record"}

--- EXISTING ACHIEVEMENTS ---
${achievements || "None on record"}

--- MEMBERSHIPS ---
${memberships || "None on record"}

--- PROJECTS ---
${projects || "None on record"}

--- PUBLICATIONS ---
${publications || "None on record"}
=========================`;
}

// ─── Section-specific prompts ───
function getSectionPrompt(sectionKey: string, cvData: any, careerLevel: string): string {
  const pi = cvData.personalInfo || {};
  const name = pi.fullName || pi.name || "the candidate";

  // Rich context passed to every section prompt
  const context = buildFullContext(cvData, careerLevel);

  switch (sectionKey) {
    case "skills": {
      const skillExp = (cvData.experiences || []);
      const skillExpLines = skillExp
        .map((e: any, i: number) =>
          `  ${i + 1}. ${e.title || "Role"} at ${e.company || "?"} (${e.startDate || "?"}–${e.endDate || "present"})\n     ${(e.description || "").substring(0, 300)}`
        )
        .join("\n");
      return `You are an expert CV writer. Derive skills ONLY from the experience descriptions below.

CANDIDATE EXPERIENCE (read every description carefully — skills must come from here):
${skillExpLines || "  No experience listed"}

HARD RULES:
1. Every skill must be directly evidenced or strongly implied by the job descriptions above — do NOT invent skills not supported by the text
2. Be specific: "Procurement Management" not "Management"; "Financial Reporting" not "Finance"
3. Category must be exactly one of: Technical, Soft Skills, Leadership, Domain, Tools
4. Do not repeat the same category more than 3 times
5. Do not include tools or software here (those belong in the Tools section)

Generate 6-10 skills grounded in the experience above.

Return ONLY JSON: { "skills": [{ "name": "", "category": "" }] }`;
    }

    case "awards": {
      const awardExp = (cvData.experiences || []);
      const awardCompanies: string[] = [...new Set(
        awardExp.map((e: any) => (e.company || "").trim()).filter(Boolean)
      )] as string[];
      const awardAllowed = awardCompanies.length
        ? awardCompanies.map((c: string, i: number) => `  ${i + 1}. "${c}"`).join("\n")
        : "  (no companies found — infer a plausible internal team name)";
      return `You are an expert CV writer. Generate realistic internal awards for this candidate.

CANDIDATE EXPERIENCE:
${awardExp.map((e: any, i: number) => `  ${i + 1}. ${e.title || "Role"} at ${e.company || "?"} (${e.startDate || "?"}–${e.endDate || "present"})\n     ${(e.description || "").substring(0, 150)}`).join("\n")}

ALLOWED ISSUERS — the award description MUST say the award was given BY one of these exact companies only:
${awardAllowed}

HARD RULES:
1. The issuer in the description MUST be one of the companies listed above — copied character-for-character
2. Do NOT invent external bodies, industry councils, or associations not present in the experience
3. Each award must relate to work actually done at that specific company (use the description text for context)
4. Year must fall within the candidate's tenure at that company

Suggest 2-3 internal employee awards:
- title: Specific internal award title (e.g. "Employee of the Year", "Best Operational Efficiency Award", "Top Performer Q3")
- description: One sentence — issuer (exact company name), year, and what they achieved to earn it

Return ONLY JSON: { "awards": [{ "title": "", "description": "" }] }`;
    }

    case "keyAchievements":
      return `You are an expert CV writer. Study the full candidate profile below, then generate key career achievements.

${context}

Write ${careerLevel === "executive" ? "5-7" : "3-5"} KEY achievements. Rules:
- Each is a complete sentence of 15-25 words
- Every achievement must include a specific quantified result (%, $, headcount, time saved)
- Use strong past-tense action verbs (Increased, Delivered, Streamlined, Negotiated, Launched)
- Draw ONLY from the actual experience and context above — do not fabricate companies or roles
- Each achievement highlights a DIFFERENT aspect of the career

Return ONLY JSON: { "keyAchievements": ["achievement1", "achievement2", ...] }`;

    case "memberships":
      return `You are an expert CV writer. Study the full candidate profile below, then suggest relevant professional memberships.

${context}

Suggest 2-4 professional bodies or associations this candidate should realistically belong to:
- Must be real, well-known organisations relevant to their industry and country
- Match the career level (e.g. accounting → ICPAK, ACCA; engineering → IET; management → CIM, PMI)
- Do not suggest organisations already listed in the profile

Return ONLY JSON: { "memberships": ["Full Organisation Name 1", "Full Organisation Name 2", ...] }`;

    case "projects":
      return `You are an expert CV writer. Study the full candidate profile below, then generate notable project entries.

${context}

Generate ${careerLevel === "junior" ? "3-4" : "2-3"} significant projects derived ONLY from the actual work experience shown above. Each:
- name: Specific, descriptive project title (not generic)
- description: 2-3 sentences covering scope, specific actions taken, and measurable outcome
- tech: Comma-separated tools/technologies actually relevant to their field (leave blank if not applicable)

Return ONLY JSON: { "projects": [{ "name": "", "description": "", "tech": "" }] }`;

    case "volunteer":
      return `You are an expert CV writer. Study the full candidate profile below, then suggest volunteer experience.

${context}

Suggest 2-3 plausible volunteer activities that complement this professional's career background:
- Must relate to their industry, skills, or community context
- Use specific role descriptions (e.g. "Financial literacy mentor at a community NGO", not just "Volunteer")
- Each entry is a single descriptive string

Return ONLY JSON: { "volunteer": ["entry1", "entry2", ...] }`;

    case "boardRoles": {
      // Extract ALL unique companies from the full experience list
      const allExp = (cvData.experiences || []);
      const uniqueCompanies: string[] = [...new Set(
        allExp.map((e: any) => (e.company || "").trim()).filter(Boolean)
      )] as string[];

      const expLines = allExp
        .map((e: any, i: number) =>
          `  ${i + 1}. ${e.title || "Role"} at ${e.company || "?"} (${e.startDate || "?"}–${e.endDate || "present"})`
        )
        .join("\n");

      const allowedList = uniqueCompanies.length
        ? uniqueCompanies.map((c, i) => `  ${i + 1}. "${c}"`).join("\n")
        : "  (no companies found)";

      return `You are an expert CV writer. Generate realistic board and advisory roles for this candidate.

CANDIDATE EXPERIENCE:
${expLines || "  No experience listed"}

ALLOWED COMPANY NAMES — the "organization" field MUST use one of these exact names only:
${allowedList}

HARD RULES — violating any rule makes the output invalid:
1. The "organization" value MUST be copied EXACTLY from the ALLOWED list above — no abbreviations, no variations, no invented names
2. If the candidate has fewer than 2 companies on record, you may repeat a company name for different roles
3. The governance title must match seniority: C-suite → "Non-Executive Director" or "Board Chair"; VP/Director → "Advisory Board Member" or "Audit Committee Member"
4. "startDate" must be a year that falls AFTER the candidate's first senior role in the experience above
5. "description" must reference the candidate's specific expertise from their role at that company

Generate 2-3 board / advisory roles using ONLY the company names from the allowed list:
- title: Governance title (see rule 3)
- organization: EXACT company name from the allowed list (copy it character-for-character)
- startDate: Year
- endDate: "Ongoing" or estimated year
- description: 1-2 sentences on governance contribution

Return ONLY JSON: { "boardRoles": [{ "title": "", "organization": "", "startDate": "", "endDate": "", "description": "" }] }`;
    }

    case "publications":
      return `You are an expert CV writer. Study the full candidate profile below, then suggest relevant publications.

${context}

Suggest 2-3 plausible publications (articles, papers, or presentations) aligned with this professional's documented expertise:
- title: Specific, credible publication or presentation title
- publisher: Real journal, conference, or professional platform name
- year: Plausible year matching career timeline
- type: "article" | "paper" | "presentation" | "book-chapter"

Return ONLY JSON: { "publications": [{ "title": "", "publisher": "", "year": "", "type": "" }] }`;

    case "executiveTraining":
      return `You are an expert CV writer. Study the full candidate profile below, then suggest executive training programmes.

${context}

Suggest 2-3 executive education programmes that would complement this professional's career and NOT duplicate their existing education or certifications listed above:
- name: Real, well-known programme name
- institution: Reputable institution (e.g. Harvard Business School, INSEAD, IMD, Wharton, Strathmore)
- year: Plausible year based on career timeline

Return ONLY JSON: { "executiveTraining": [{ "name": "", "institution": "", "year": "" }] }`;

    case "languages":
      return `You are an expert CV writer. Study the full candidate profile below, then list this candidate's languages.

${context}

Based on the candidate's location, name, education, and career context, list their realistic languages with proficiency:
- Always include the primary language(s) of their country or region
- Include English if they work in a professional or international context
- Do NOT duplicate languages already listed in the profile above
- Proficiency levels: "Native", "Fluent", "Proficient", "Intermediate", "Basic"

Return ONLY JSON: { "languages": [{ "name": "", "proficiency": "" }] }`;

    case "tools": {
      const toolExp = (cvData.experiences || []);
      const toolExpLines = toolExp
        .map((e: any, i: number) =>
          `  ${i + 1}. ${e.title || "Role"} at ${e.company || "?"} (${e.startDate || "?"}–${e.endDate || "present"})\n     ${(e.description || "").substring(0, 300)}`
        )
        .join("\n");
      return `You are an expert CV writer. Generate a list of tools and software this candidate realistically uses in their roles.

CANDIDATE EXPERIENCE (use this as your primary source):
${toolExpLines || "  No experience listed"}

GENERATION RULES — apply in order:
1. First priority: include any tools explicitly named in the job descriptions above (e.g. "SAP", "Excel", "Salesforce")
2. Second priority: include well-known industry-standard tools for each job title and sector — every professional role has standard software; always generate these even when descriptions are vague
3. Be specific with names: "SAP S/4HANA" not "ERP"; "Microsoft Excel" not "Office Suite"; "QuickBooks" not "Accounting Software"; "Salesforce CRM" not "CRM"
4. Do NOT invent tools from unrelated industries or fabricate software that does not exist
5. Generate 5–8 tools total — you MUST return at least 5 even if descriptions are short

Examples by role:
- Procurement / Supply Chain → SAP MM, Ariba, Microsoft Excel, Oracle ERP, Coupa
- Finance / Accounting → QuickBooks, SAP FICO, Microsoft Excel, Xero, Power BI
- HR → SAP SuccessFactors, Workday, BambooHR, Microsoft Teams
- Software Engineer → Git, VS Code, Jira, Docker, AWS
- Marketing → Google Analytics, HubSpot, Meta Ads Manager, Canva, Mailchimp

Return ONLY JSON: { "tools": ["tool1", "tool2", ...] }`;
    }

    case "summary":
      return `You are an expert CV writer. Study the full candidate profile below, then write a powerful professional summary.

${context}

Write a professional summary of 60-90 words (3-4 sentences):
1. Open with: years of experience + core expertise + professional designation (if applicable)
2. Include 2-3 specific quantified achievements drawn directly from the profile above
3. Highlight key differentiating competencies relevant to their career level
4. Close with a forward-looking career objective
- Third person only — no "I" or "my"
- Every number or metric must be grounded in the profile data above

Return ONLY JSON: { "summary": "" }`;

    case "declaration":
      return `Generate a professional declaration statement for ${name}.
Return ONLY JSON: { "declaration": { "declaration": "I, ${name}, hereby declare that the information provided in this Curriculum Vitae is true and correct to the best of my knowledge and belief.", "place": "${pi.location || ""}", "date": "${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}" } }`;

    default:
      return `You are an expert CV writer. Study the full candidate profile below, then generate content for the "${sectionKey}" section.

${context}

Return ONLY valid JSON with the section key and appropriate data structure.`;
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
        { role: "system", content: "You are a senior CV writer. You MUST study the full candidate profile provided and base ALL generated content strictly on the actual data given — do not invent companies, roles, or credentials not present in the profile. Return ONLY valid JSON, no markdown, no explanation." },
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
