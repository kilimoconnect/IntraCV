import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";


// ═══════════════════════════════════════════════════════════════
// LAYOUT CONSTANTS — mirrors config-renderer.tsx
// ═══════════════════════════════════════════════════════════════
const PAGE_H = 1123, STRIPE_H = 4, HDR_H = 110, FTR_H = 28, DIV_H = 17, MINI_HDR_H = 40;
const SH_H = 20, LINE_PX = 14.5, WORDS_PER_LINE = 11;
const EXP_JOB_OVERHEAD = 38, EXP_BULLET_PX = 15, ACH_ITEM_PX = 17;
const EDU_ENTRY_PX = 50, CERT_ITEM_PX = 28, ADDL_ITEM_PX = 17, REF_PERSON_PX = 68;

// ═══════════════════════════════════════════════════════════════
// PROFILE ANALYZER + PLAN BUILDER — reads profile, computes targets
// ═══════════════════════════════════════════════════════════════
interface Plan {
  summaryTargetWords: number;
  skillTargetCount: number;
  expTargetBulletsPerJob: number;
  expTargetWordsPerBullet: number;
  achTargetCount: number;
  achTargetWords: number;
  eduTargetDescWords: number;
  certTargetCount: number;
  addlTargetItems: number;
  refTargetCount: number;
  declTargetWords: number;
  maxRoles: number;
  // Per-section fill instruction for AI
  expFill: string;
  achFill: string;
  summFill: string;
  skillsFill: string;
}

function sumW(pairs: [boolean, number][]): number {
  return pairs.filter(([on]) => on).reduce((s, [, w]) => s + w, 0);
}
function secPx(w: number, tw: number, av: number): number {
  return tw > 0 ? Math.floor((w / tw) * av) : 0;
}

function buildPlan(cvData: any, templateType: string): Plan {
  // ── 1. Read raw profile ──
  const exps = cvData.experiences || cvData.experience || [];
  const rawSkills = cvData.skills || [];
  const rawEdu = cvData.education || [];
  const rawCerts = cvData.certifications || [];
  const rawAch = cvData.keyAchievements || [];
  const rawRefs = cvData.referees || [];
  const rawSummary = cvData.summary || "";
  const hasDecl = !!cvData.declaration?.declaration;

  // Count raw items
  const jobCount = exps.length;
  const jobBullets = exps.map((e: any) => {
    const d = e.description || "";
    return d.split("\n").filter((l: string) => l.trim()).length;
  });
  const totalBullets = jobBullets.reduce((s: number, b: number) => s + b, 0);
  const avgBulletsPerJob = jobCount > 0 ? Math.round(totalBullets / jobCount) : 0;
  const summaryWordCount = rawSummary.split(/\s+/).filter((w: string) => w).length;

  let addlItems = 0;
  if (cvData.languages?.length) addlItems += cvData.languages.length;
  if (cvData.tools?.length) addlItems += 1;
  if (cvData.memberships?.length) addlItems += 1;
  if (cvData.volunteer?.length) addlItems += 1;
  if (cvData.projects?.length) addlItems += cvData.projects.length;
  if (cvData.interests?.length) addlItems += 1;

  // ── 2. Detect active sections ──
  const h = {
    summary: true, skills: true, experience: jobCount > 0, achievements: true,
    education: rawEdu.length > 0, certifications: rawCerts.length > 0,
    additional: addlItems > 0, referees: rawRefs.length > 0, declaration: hasDecl,
  };

  // ── 3. Compute container px per section ──
  let summPx: number, skillsPx: number, expPx: number, achPx: number, eduPx: number;
  let certPx: number, addlPx: number, refPx: number, declPx: number;

  if (templateType === "two-page") {
    const p1Av = PAGE_H - STRIPE_H - HDR_H - FTR_H;
    const p1Div = (h.summary && h.skills ? 1 : 0) + (h.skills && h.experience ? 1 : 0);
    const p1tw = sumW([[h.summary, 1], [h.skills, 1.5], [h.experience, 5]]);
    const p1S = p1Av - p1Div * DIV_H;
    const p2Av = PAGE_H - STRIPE_H - MINI_HDR_H - FTR_H;
    const p2Div = (h.achievements && h.education ? 1 : 0) + (h.education && h.certifications ? 1 : 0);
    const p2tw = sumW([[h.achievements, 2], [h.education, 2.5], [h.certifications, 1.5],
      [h.additional, 1.5], [h.referees, 2], [h.declaration, 1]]);
    const p2S = p2Av - p2Div * DIV_H;
    summPx = secPx(1, p1tw, p1S); skillsPx = secPx(1.5, p1tw, p1S); expPx = secPx(5, p1tw, p1S);
    achPx = secPx(2, p2tw, p2S); eduPx = secPx(2.5, p2tw, p2S); certPx = secPx(1.5, p2tw, p2S);
    addlPx = secPx(1.5, p2tw, p2S); refPx = secPx(2, p2tw, p2S); declPx = secPx(1, p2tw, p2S);
  } else {
    const body = PAGE_H - STRIPE_H - HDR_H - FTR_H;
    let dc = 0;
    if (h.summary && h.skills) dc++;
    if (h.skills && h.experience) dc++;
    if (h.experience && h.achievements) dc++;
    const sa = body - dc * DIV_H;
    const tw = sumW([[h.summary,1],[h.skills,1.5],[h.experience,5],[h.achievements,1.5],
      [h.education,2],[h.certifications,1],[h.additional,1],[h.referees,1.5],[h.declaration,1]]);
    summPx = secPx(1, tw, sa); skillsPx = secPx(1.5, tw, sa); expPx = secPx(5, tw, sa);
    achPx = secPx(1.5, tw, sa); eduPx = secPx(2, tw, sa); certPx = secPx(1, tw, sa);
    addlPx = secPx(1, tw, sa); refPx = secPx(1.5, tw, sa); declPx = secPx(1, tw, sa);
  }

  // ── 4. Estimate raw content px ──
  const rawExpPx = exps.reduce((s: number, _: any, i: number) =>
    s + EXP_JOB_OVERHEAD + jobBullets[i] * EXP_BULLET_PX, 0);
  const rawSummPx = summaryWordCount > 0
    ? Math.ceil(summaryWordCount / WORDS_PER_LINE) * LINE_PX : 0;
  const rawSkillsPx = rawSkills.length * 8;
  const rawAchPx = rawAch.length * ACH_ITEM_PX;
  const rawEduPx = rawEdu.length * EDU_ENTRY_PX;
  const rawCertPx = rawCerts.length * CERT_ITEM_PX;
  const rawAddlPx = addlItems * ADDL_ITEM_PX;
  const rawRefPx = rawRefs.length * REF_PERSON_PX;

  // ── 5. Compare & build fill instructions ──
  const expContent = Math.max(0, expPx - SH_H);
  const achContent = Math.max(0, achPx - SH_H);
  const summContent = Math.max(0, summPx - SH_H);
  const skillsContent = Math.max(0, skillsPx - SH_H);
  const eduContent = Math.max(0, eduPx - SH_H);

  const expRatio = rawExpPx > 0 ? expContent / rawExpPx : 2;
  const achRatio = rawAchPx > 0 ? achContent / rawAchPx : 2;
  const summRatio = rawSummPx > 0 ? summContent / rawSummPx : 2;
  const skillsRatio = rawSkillsPx > 0 ? skillsContent / rawSkillsPx : 2;

  function fillMsg(ratio: number): string {
    if (ratio > 1.3) return `EXPAND significantly (~${Math.round((ratio - 1) * 100)}% more). Add more detail, items, and descriptions to fill the space.`;
    if (ratio > 1.1) return `EXPAND slightly (~${Math.round((ratio - 1) * 100)}% more). Add a bit more detail.`;
    if (ratio < 0.7) return `CONDENSE significantly (~${Math.round((1 - ratio) * 100)}% less). Keep only the most impactful content.`;
    if (ratio < 0.9) return `CONDENSE slightly (~${Math.round((1 - ratio) * 100)}% less). Trim less important details.`;
    return `MAINTAIN — content fits well as-is.`;
  }

  // ── 6. Compute targets from profile ──
  const summaryTargetWords = Math.max(25, Math.floor(summContent / LINE_PX) * WORDS_PER_LINE);
  const skillTargetCount = Math.max(rawSkills.length, Math.floor(skillsContent / 8));

  // Experience: divide container evenly across ACTUAL jobs
  // Cap roles to category maximums to prevent over-crowding
  const maxRoles = templateType === "two-page" ? 4 : templateType === "three-page" ? 5 : 3;
  const effectiveJobCount = Math.min(jobCount, maxRoles);
  let expTargetBulletsPerJob = 3, expTargetWordsPerBullet = 15;
  if (effectiveJobCount > 0) {
    const pxPerJob = Math.floor(expContent / effectiveJobCount);
    expTargetBulletsPerJob = Math.max(2, Math.min(8, Math.floor((pxPerJob - EXP_JOB_OVERHEAD) / EXP_BULLET_PX)));
    // Compute words-per-bullet from available body width
    // Body width: one-page ~722px, two-page sidebar layout ~514px
    const bodyW = templateType === "two-page" ? 514 : 722;
    // chars per line at bullet font size (9.5px, ratio 0.52)
    const cpl = Math.floor(bodyW / (9.5 * 0.52));
    // average chars per word ~5.5; target ~1.5 lines per bullet
    const wordsPerLine = Math.floor(cpl / 5.5);
    expTargetWordsPerBullet = Math.max(12, Math.min(20, Math.round(wordsPerLine * 1.5)));
  }

  // Achievements: fill container
  const achTargetCount = Math.max(rawAch.length || 3, Math.floor(achContent / ACH_ITEM_PX));
  // Same calculation for achievement word targets
  const achBodyW = templateType === "two-page" ? 722 : 722;
  const achCpl = Math.floor(achBodyW / (9.5 * 0.52));
  const achTargetWords = Math.max(12, Math.min(20, Math.round(Math.floor(achCpl / 5.5) * 1.5)));

  // Education: per-entry description words
  const eduCount = rawEdu.length || 1;
  const pxPerEdu = Math.floor(eduContent / eduCount);
  const eduTargetDescWords = Math.max(8, Math.min(30, Math.floor((pxPerEdu - 30) / LINE_PX * WORDS_PER_LINE)));

  // Others: fill based on container
  const certTargetCount = Math.max(rawCerts.length, Math.floor(Math.max(0, certPx - SH_H) / CERT_ITEM_PX));
  const addlTargetItems = Math.max(addlItems, Math.floor(Math.max(0, addlPx - SH_H) / ADDL_ITEM_PX));
  const refTargetCount = Math.max(rawRefs.length, Math.min(4, Math.floor(Math.max(0, refPx - SH_H) / REF_PERSON_PX)));
  const declTargetWords = Math.max(15, Math.floor(Math.max(0, declPx - SH_H) / LINE_PX * WORDS_PER_LINE));

  // Build per-job fill instructions
  const perJobInstructions = exps.map((e: any, i: number) => {
    const cur = jobBullets[i];
    const target = expTargetBulletsPerJob;
    const diff = target - cur;
    const title = e.title || e.jobTitle || "Untitled";
    if (diff > 2) return `"${title}": has ${cur} bullets, needs ${target} → ADD ${diff} more bullets with details about scope, impact, technologies`;
    if (diff > 0) return `"${title}": has ${cur} bullets, needs ${target} → ADD ${diff} more bullets`;
    if (diff < -1) return `"${title}": has ${cur} bullets, needs ${target} → KEEP only the ${target} strongest`;
    return `"${title}": has ${cur} bullets → MAINTAIN (target: ${target})`;
  }).join("\n");

  const expFill = `${fillMsg(expRatio)}\nPER-JOB ANALYSIS:\n${perJobInstructions}`;
  const achFill = rawAch.length > 0
    ? `Profile has ${rawAch.length} achievements, container fits ${achTargetCount}. ${fillMsg(achRatio)}`
    : `No achievements in profile. Generate ${achTargetCount} achievements based on experience.`;

  return {
    summaryTargetWords, skillTargetCount,
    expTargetBulletsPerJob, expTargetWordsPerBullet,
    achTargetCount, achTargetWords,
    eduTargetDescWords, certTargetCount, addlTargetItems, refTargetCount, declTargetWords,
    maxRoles,
    expFill, achFill,
    summFill: fillMsg(summRatio),
    skillsFill: `Profile has ${rawSkills.length} skills, container fits ~${skillTargetCount}. ${fillMsg(skillsRatio)}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// AI CALLER
// ═══════════════════════════════════════════════════════════════
async function callAI(prompt: string): Promise<any> {
  const resp = await openaiClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.35,
    response_format: { type: "json_object" },
  });
  const text = resp.choices[0]?.message?.content;
  if (!text) throw new Error("Empty AI response");
  return JSON.parse(text);
}

// ═══════════════════════════════════════════════════════════════
// SECTION GENERATORS — profile-driven, not hardcoded
// ═══════════════════════════════════════════════════════════════

function genHeader(cvData: any, targetRole: string, jd: string) {
  return callAI(`You are a CV header writer. Enhance only the headline and tagline.

PERSONAL INFO:
${JSON.stringify(cvData.personalInfo || {}, null, 2)}
TARGET ROLE: ${targetRole || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}

Rules:
- Keep fullName, email, phone, location, linkedin, website EXACTLY as-is
- Write a compelling headline (max 8 words)
- Write a tagline (max 12 words)
- If no headline exists, create one from their experience
- If no tagline exists, create one

Return ONLY JSON:
{ "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "headline": "", "tagline": "", "linkedin": "", "website": "" } }`);
}

function genSummary(cvData: any, tr: string, jd: string, p: Plan) {
  const exps = cvData.experiences || cvData.experience || [];
  const ctx = exps.map((e: any) =>
    `${e.title || e.jobTitle || ""} at ${e.company || e.employer || ""} (${e.startDate || ""}–${e.endDate || ""})`
  ).join("; ");
  const tw = p.summaryTargetWords;

  return callAI(`You are a CV summary writer. Write a professional summary.

SPACE: Target ${tw} words. ${p.summFill}

TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}
CANDIDATE:
- Headline: ${cvData.personalInfo?.headline || ""}
- Experience: ${ctx}
- Skills: ${(cvData.skills || []).map((s: any) => s.name || s).join(", ")}
- Education: ${(cvData.education || []).map((e: any) => e.degree || e).join(", ")}

Write EXACTLY ${tw} words (±3). Rules:
- Open with years of experience and core expertise
- Include 2-3 quantified achievements
- Mention key technologies/tools
- End with career objective aligned to target role
- Third person, strong professional language
- CRITICAL: Must be ${tw} words — shorter creates gaps, longer gets clipped

Return ONLY JSON: { "summary": "" }`);
}

function genSkills(cvData: any, tr: string, jd: string, p: Plan) {
  const t = p.skillTargetCount;
  const expCtx = (cvData.experiences || cvData.experience || []).slice(0, 6)
    .map((e: any) => `${e.title || ""} at ${e.company || ""}`)
    .join(", ");
  const existingTools = (cvData.tools || []).map((t: any) => t.name || t).join(", ");
  return callAI(`You are a CV skills writer. Create a categorized skills list.

SPACE: Container fits ~${t} skills. ${p.skillsFill}

CANDIDATE EXPERIENCE: ${expCtx || "Not provided"}
EXISTING TOOLS: ${existingTools || "None"}
RAW SKILLS: ${JSON.stringify(cvData.skills || [], null, 2)}
TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}

Rules:
- Return EXACTLY ${t} skills
- Group into 2-4 categories (e.g. Technical, Leadership, Domain, Industry)
- Omit clearly generic or irrelevant skills (e.g. "teamwork", "communication") that obviously don't match the candidate's profession — if unsure, keep them
- Supplement with industry-standard skills inferred from the candidate's job titles and experience — filling gaps is expected and required
- Prioritize skills matching the target role/JD
- Each skill name: 1-3 words. Categories: 1-2 words.

Return ONLY JSON: { "skills": [{ "name": "", "category": "" }] }`);
}

function genExperience(cvData: any, tr: string, jd: string, p: Plan) {
  const rawExps = cvData.experiences || cvData.experience || [];
  const jobCount = rawExps.length;
  const bpj = p.expTargetBulletsPerJob;
  const wpb = p.expTargetWordsPerBullet;

  return callAI(`You are a CV experience writer. Rewrite professional experience to PERFECTLY fill the allocated space.

SPACE ANALYSIS:
- ${jobCount} positions in profile, each needs ~${bpj} bullet points of ~${wpb} words
- ${p.expFill}

RAW EXPERIENCE:
${JSON.stringify(rawExps, null, 2)}
TARGET ROLE: ${tr || "Not specified"}
JOB DESCRIPTION: ${jd || "Not provided"}

RULES:
1. Return ALL ${jobCount} positions from the raw data
2. Each position gets ${bpj} bullet points — follow the per-job analysis above
3. Each bullet: ${wpb - 3} to ${wpb} words
4. Bullets separated by newlines, each starting with "• "
5. Start each bullet with a strong ACTION VERB
6. Include quantified results where possible ($, %, time, count)
7. Keep title, company, location, dates EXACTLY as provided
8. NEVER fabricate — enhance wording, expand on existing details
9. When expanding: add context about scope, team size, processes, and business impact
10. When condensing: merge similar points, keep strongest achievements
11. Only reference software or tools explicitly mentioned in the raw description — do not invent tool names

Return ONLY JSON: { "experiences": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "" }] }`);
}

function genAchievements(cvData: any, tr: string, jd: string, p: Plan) {
  const exps = cvData.experiences || cvData.experience || [];
  const ctx = exps.map((e: any) =>
    `${e.title || ""} at ${e.company || ""}: ${e.description || ""}`
  ).join("\n");
  const tc = p.achTargetCount;
  const tw = p.achTargetWords;

  return callAI(`You are a CV achievements writer. Write key achievements to fill the space.

SPACE: Container fits ${tc} achievements of ~${tw} words each.
${p.achFill}

CANDIDATE BACKGROUND:
${ctx}
SKILLS: ${(cvData.skills || []).map((s: any) => s.name || s).join(", ")}
TARGET ROLE: ${tr || "Not specified"}

RULES:
1. Return EXACTLY ${tc} achievements
2. Each: ${tw - 3} to ${tw} words
3. Include quantified results (%, $, numbers, team size, time)
4. Start with strong action verbs
5. Draw from actual experience — enhance but don't fabricate
6. Cover diverse areas: cost savings, revenue, efficiency, leadership, process improvement

Return ONLY JSON: { "keyAchievements": [""] }`);
}

function genEducation(cvData: any, p: Plan) {
  const rawEdu = cvData.education || [];
  const count = rawEdu.length;

  return callAI(`You are a CV education writer. Enhance education entries.

SPACE: ${count} entries, each description up to ${p.eduTargetDescWords} words.

RAW EDUCATION:
${JSON.stringify(rawEdu, null, 2)}

RULES:
- Return ALL ${count} entries
- Keep degree, institution, year EXACTLY as provided
- Write or enhance description: honors, GPA, relevant coursework (${p.eduTargetDescWords} words)
- If no notable details, write a brief relevant description

Return ONLY JSON: { "education": [{ "degree": "", "institution": "", "year": "", "description": "" }] }`);
}

function genAdditional(cvData: any, tr: string, jd: string, p: Plan) {
  const expCtx = (cvData.experiences || cvData.experience || []).slice(0, 4)
    .map((e: any) => `${e.title || ""} at ${e.company || ""}`)
    .join(", ");
  return callAI(`You are a CV writer. Compile additional information.

SPACE: Container fits ~${p.addlTargetItems} line items total.

CANDIDATE EXPERIENCE: ${expCtx || "Not provided"}

RAW DATA:
- Languages: ${JSON.stringify(cvData.languages || [])}
- Tools: ${JSON.stringify(cvData.tools || [])}
- Memberships: ${JSON.stringify(cvData.memberships || [])}
- Volunteer: ${JSON.stringify(cvData.volunteer || [])}
- Projects: ${JSON.stringify(cvData.projects || [])}
- Interests: ${JSON.stringify(cvData.interests || [])}
TARGET ROLE: ${tr || "Not specified"}

RULES:
- Only include categories that have data
- Total items across ALL categories: ~${p.addlTargetItems}
- Keep items concise (each value ≤ 60 characters)
- Prioritize items relevant to the target role
- For languages: if proficiency is not stated, default to "Fluent"
- For tools: if the list has fewer than 4 items, supplement with specific industry-standard software for the candidate's profession (e.g. "Salesforce CRM", "Power BI", "AutoCAD") — be specific, not generic
- Omit tools that are clearly and obviously unrelated to the candidate's field — if unsure, keep them

Return ONLY JSON:
{
  "languages": [{ "name": "", "proficiency": "" }],
  "tools": [""],
  "memberships": [""],
  "volunteer": [""],
  "projects": [{ "name": "", "description": "", "tech": "" }],
  "interests": [""]
}`);
}

function genCertifications(cvData: any, p: Plan) {
  const rawCerts = cvData.certifications || [];
  const count = Math.max(rawCerts.length, p.certTargetCount);

  return callAI(`You are a CV certifications writer.

SPACE: Container fits ${count} certifications.

RAW CERTIFICATIONS:
${JSON.stringify(rawCerts, null, 2)}

RULES:
- Return ${rawCerts.length} certifications (all from raw data)
- Keep name, issuer, year as provided — only enhance if needed

Return ONLY JSON: { "certifications": [{ "name": "", "issuer": "", "year": "" }] }`);
}

function genReferees(cvData: any, p: Plan) {
  const rawRefs = cvData.referees || [];
  if (rawRefs.length === 0) return Promise.resolve({ referees: [] });

  return callAI(`You are a CV referees writer.

SPACE: Container fits ${p.refTargetCount} referees.

RAW REFEREES:
${JSON.stringify(rawRefs, null, 2)}

RULES:
- Return ${Math.min(p.refTargetCount, rawRefs.length)} referees
- Keep all contact info exactly as provided
- Only enhance title/company formatting if needed

Return ONLY JSON: { "referees": [{ "name": "", "title": "", "company": "", "phone": "", "email": "" }] }`);
}

function genDeclaration(cvData: any, p: Plan) {
  const rawDecl = cvData.declaration;
  if (!rawDecl?.declaration) return Promise.resolve({ declaration: { declaration: "", place: "", date: "" } });

  return callAI(`You are a CV declaration writer.

SPACE: Max ${p.declTargetWords} words.

RAW DECLARATION:
${JSON.stringify(rawDecl, null, 2)}

RULES:
- Keep declaration text under ${p.declTargetWords} words
- Keep place and date exactly as provided
- Standard professional declaration language

Return ONLY JSON: { "declaration": { "declaration": "", "place": "", "date": "" } }`);
}

// ═══════════════════════════════════════════════════════════════
// POST HANDLER — profile-driven generation
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const { cvData, templateType, targetRole, jobDescription } = await req.json();

    if (!cvData) {
      return NextResponse.json({ error: "CV data is required" }, { status: 400 });
    }

    const plan = buildPlan(cvData, templateType || "one-page");
    console.log("[CV Gen] Plan:", JSON.stringify(plan));

    const tr = targetRole || "";
    const jd = jobDescription || "";

    // Generate all sections in parallel
    const [header, summary, skills, experience, achievements, education, certs, additional, referees, declaration] =
      await Promise.allSettled([
        genHeader(cvData, tr, jd),
        genSummary(cvData, tr, jd, plan),
        genSkills(cvData, tr, jd, plan),
        genExperience(cvData, tr, jd, plan),
        genAchievements(cvData, tr, jd, plan),
        genEducation(cvData, plan),
        genCertifications(cvData, plan),
        genAdditional(cvData, tr, jd, plan),
        genReferees(cvData, plan),
        genDeclaration(cvData, plan),
      ]);

    const val = (r: PromiseSettledResult<any>) => (r.status === "fulfilled" ? r.value : null);

    const headerData = val(header);
    const summaryData = val(summary);
    const skillsData = val(skills);
    const expData = val(experience);
    const achData = val(achievements);
    const eduData = val(education);
    const certData = val(certs);
    const addlData = val(additional);
    const refData = val(referees);
    const declData = val(declaration);

    // ─── Hard-trim safety net (sentence-safe) ───
    // Helper: truncate at last complete sentence
    const trimAtSentence = (text: string, maxChars: number): string => {
      if (!text || text.length <= maxChars) return text;
      const cut = text.slice(0, maxChars);
      const lastEnd = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"));
      if (lastEnd > maxChars * 0.4) return cut.slice(0, lastEnd + 1).trimEnd();
      const lastSpace = cut.lastIndexOf(" ");
      return lastSpace > 0 ? cut.slice(0, lastSpace).trimEnd() + "." : cut.trimEnd() + ".";
    };

    const trimmedSkills = (skillsData?.skills || cvData.skills || []).slice(0, plan.skillTargetCount);

    // Cap roles to maxRoles before trimming bullets
    const allExps = (expData?.experiences || cvData.experiences || cvData.experience || []);
    const cappedExps = allExps.slice(0, plan.maxRoles);
    const trimmedExps = cappedExps.map((e: any) => {
      if (!e.description) return e;
      const bullets = e.description.split("\n").filter((l: string) => l.trim());
      const trimmed = bullets.slice(0, plan.expTargetBulletsPerJob).map((b: string) =>
        trimAtSentence(b.trim(), plan.expTargetWordsPerBullet * 6)
      );
      return { ...e, description: trimmed.join("\n") };
    });
    const trimmedAch = (achData?.keyAchievements || []).slice(0, plan.achTargetCount).map((a: string) => {
      // Sentence-safe achievement trim
      return trimAtSentence(a, plan.achTargetWords * 6);
    });
    const trimmedEdu = (eduData?.education || cvData.education || []);
    const trimmedCerts = (certData?.certifications || cvData.certifications || []);
    const trimmedRefs = (refData?.referees || cvData.referees || []).slice(0, plan.refTargetCount);

    // Sentence-safe summary trim
    let summaryText = summaryData?.summary || cvData.summary || "";
    const summMaxChars = plan.summaryTargetWords * 6; // avg 6 chars/word
    if (summaryText.length > summMaxChars + 30) {
      summaryText = trimAtSentence(summaryText, summMaxChars);
    }

    const generatedCV = {
      personalInfo: headerData?.personalInfo || cvData.personalInfo,
      summary: summaryText,
      skills: trimmedSkills,
      experiences: trimmedExps,
      keyAchievements: trimmedAch,
      education: trimmedEdu,
      certifications: trimmedCerts,
      languages: (addlData?.languages || cvData.languages || []).map((l: any) =>
        typeof l === "string" ? { name: l, proficiency: "Fluent" } :
        { ...l, proficiency: l.proficiency?.trim() || "Fluent" }
      ),
      tools: addlData?.tools || cvData.tools || [],
      memberships: addlData?.memberships || cvData.memberships || [],
      volunteer: addlData?.volunteer || cvData.volunteer || [],
      projects: addlData?.projects || cvData.projects || [],
      interests: addlData?.interests || cvData.interests || [],
      referees: trimmedRefs,
      declaration: declData?.declaration || cvData.declaration || { declaration: "", place: "", date: "" },
      areasOfExpertise: cvData.areasOfExpertise || [],
    };

    console.log("[CV Gen] Complete — skills:", trimmedSkills.length, "exps:", trimmedExps.length, "ach:", trimmedAch.length, "edu:", trimmedEdu.length);

    return NextResponse.json({ generatedCV, plan });
  } catch (err: any) {
    console.error("CV generation error:", err);
    return NextResponse.json(
      { error: err.message || "CV generation failed" },
      { status: 500 }
    );
  }
}
