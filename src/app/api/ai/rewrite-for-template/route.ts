import { NextRequest, NextResponse } from "next/server";
import { AsyncLocalStorage } from "node:async_hooks";
import OpenAI from "openai";
import { SLOT_RULES as BASE_TWO_PAGE_SLOT_RULES } from "@/app/dashboard/components/cv-template";
import { SLOT_RULES as THREE_PAGE_SLOT_RULES } from "@/app/dashboard/components/cv-template - 3pages1";
import { CATEGORY_RULES, type CategorySlotRules } from "@/app/dashboard/components/cv-category-rules";
import type { CareerCategory } from "@/app/dashboard/components/cv-layout-types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type TemplateType = "two-page" | "three-page";

const TWO_PAGE_SLOT_RULES = {
  ...BASE_TWO_PAGE_SLOT_RULES,
  tools: THREE_PAGE_SLOT_RULES.tools,
  achievements: THREE_PAGE_SLOT_RULES.achievements,
  boardRoles: THREE_PAGE_SLOT_RULES.boardRoles,
  executiveTraining: THREE_PAGE_SLOT_RULES.executiveTraining,
  publications: THREE_PAGE_SLOT_RULES.publications,
  declaration: THREE_PAGE_SLOT_RULES.declaration,
} as const;

type SlotRules = typeof TWO_PAGE_SLOT_RULES | typeof THREE_PAGE_SLOT_RULES | CategorySlotRules;

const slotRulesStore = new AsyncLocalStorage<SlotRules>();

const S = new Proxy(THREE_PAGE_SLOT_RULES as SlotRules, {
  get(_target, prop) {
    const slotRules = slotRulesStore.getStore() ?? TWO_PAGE_SLOT_RULES;
    return slotRules[prop as keyof SlotRules];
  },
}) as SlotRules;

// ─── UTILITIES ───


const SYSTEM_PROMPT = `You are a precision CV copy-fitter for a fixed-size A4 print layout.
Your goal is to fill a fixed-width UI component to exactly 85-95% capacity.
CRITICAL RULES:
- Return ONLY valid JSON.
- Every sentence MUST be COMPLETE. Never cut mid-sentence. Every sentence ends with a period.
- NEVER produce text that ends abruptly without a period.
- If a character limit forces truncation, remove the LAST sentence entirely rather than cutting it.
- Use high-impact professional language (3rd person only).
- If source material is too short, EXPAND by adding industry-standard context or specific tools.
- CHARACTER LIMITS ARE ABSOLUTE — content that exceeds limits will be cut, so stay within bounds.
- Prefer shorter, punchier sentences over long compound ones to avoid mid-sentence breaks.`;

async function ai(prompt: string): Promise<any> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });
  return JSON.parse(res.choices[0]?.message?.content || "{}");
}

// ─── BLOCK GENERATORS ───

// Truncate at last word boundary — for short labels (role, company, school…)
function trimToWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

// AI rewrite to compress over-limit content as complete sentences
async function shrinkToFit(text: string, maxChars: number, hint = "CV content"): Promise<string> {
  if (text.length <= maxChars) return text;
  const r = await ai(
    `Rewrite the following ${hint} to fit within ${maxChars} characters. ` +
    `Keep all sentences complete — never cut mid-sentence. Keep the same meaning and professional tone. ` +
    `Return JSON: {"text": ""}\nORIGINAL: ${text}`
  );
  const result = (r.text || text).trim();
  // Final safety: if AI still returned too long, trim at last sentence end
  if (result.length <= maxChars) return result;
  const safe = result.slice(0, maxChars);
  const lastPeriod = safe.lastIndexOf(".");
  return lastPeriod > 0 ? safe.slice(0, lastPeriod + 1) : safe;
}

async function blockProfile(cvData: any): Promise<string> {
  const { minChars, maxChars } = S.profile;
  const pi = cvData.personalInfo || {};
  const exps = cvData.experiences || [];
  const edu = cvData.education || [];
  const projects = cvData.projects || [];
  const skills = (cvData.skills || []).map((s: any) => s.name || s);
  const achievements = cvData.achievements || [];
  const expertise = (cvData.areasOfExpertise || []).map((a: any) => a.name || a);
  const summary = cvData.summary || "";

  // Calculate actual years of experience from current data
  const calculateYearsExperience = (experiences: any[]): number => {
    if (!experiences.length) return 0;
    const currentYear = new Date().getFullYear();
    let totalYears = 0;
    
    for (const exp of experiences) {
      const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : currentYear;
      const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : currentYear;
      totalYears += Math.max(0, endYear - startYear + 1);
    }
    
    return totalYears;
  };
  
  const actualYearsExperience = calculateYearsExperience(exps);
  
  // Build comprehensive profile from current CV data
  const expDetails = exps.slice(0, 3).map((e: any) => `${e.title} at ${e.company}${e.dates ? ` (${e.dates})` : ""}`).join("; ");
  const eduDetails = edu.slice(0, 2).map((e: any) => `${e.degree} from ${e.school}${e.year ? ` (${e.year})` : ""}`).join("; ");
  const projectDetails = projects.slice(0, 2).map((p: any) => p.name).join("; ");
  const achievementDetails = achievements.slice(0, 3).join("; ");

  const basePrompt = `Write a professional profile paragraph for ${pi.fullName || "a professional"}, ${pi.headline || "a professional"}.
    
    ACTUAL YEARS OF EXPERIENCE: ${actualYearsExperience} years (calculated from current data)
    CURRENT EXPERIENCE: ${expDetails || "Not provided"}
    EDUCATION: ${eduDetails || "Not provided"}
    PROJECTS: ${projectDetails || "Not provided"}
    SKILLS: ${skills.slice(0, 8).join(", ") || "Not provided"}
    EXPERTISE AREAS: ${expertise.slice(0, 5).join(", ") || "Not provided"}
    KEY ACHIEVEMENTS: ${achievementDetails || "Not provided"}
    OLD SUMMARY (for reference only, DO NOT copy years from here): ${summary || "Not provided"}
    
    STRICT CHARACTER REQUIREMENT: Between ${minChars} and ${maxChars} characters (currently counting spaces and punctuation).
    Rules:
    - Exactly 1 paragraph. No bullets. No lists. No line breaks.
    - MUST use ${actualYearsExperience} years of experience - this is calculated from actual employment dates.
    - IGNORE any years mentioned in the old summary - use ONLY the calculated ${actualYearsExperience} years.
    - Create a compelling profile using the CURRENT experience, education, projects, skills, and achievements provided above.
    - Weave in expertise areas naturally within the prose — do NOT list them separately.
    - Focus on current capabilities and professional impact.
    - You MUST write at least ${minChars} characters.
    - You MUST NOT exceed ${maxChars} characters.
    Return JSON: {"profile": "", "char_count": 0}`;

  let result = (await ai(basePrompt)).profile?.trim() || "";

  // If too short, retry with expansion instruction
  if (result.length < minChars) {
    const expandPrompt = `The following executive profile is too short (${result.length} chars). Expand it to exactly ${minChars}-${maxChars} characters by adding specific achievements, industry context, and leadership impact. Do NOT add bullets or line breaks.
    CURRENT TEXT: ${result}
    ADDITIONAL SOURCE: ${summary}
    Return JSON: {"profile": "", "char_count": 0}`;
    const expanded = (await ai(expandPrompt)).profile?.trim() || result;
    result = expanded.length >= minChars ? expanded : result;
  }

  if (result.length > maxChars) result = await shrinkToFit(result, maxChars, "executive profile paragraph");
  return result;
}

async function blockTagline(cvData: any): Promise<string> {
  const { taglineMaxChars } = S.header;
  const pi = cvData.personalInfo || {};
  const exps = cvData.experiences || [];
  const skills = (cvData.skills || []).map((s: any) => s.name || s);
  const summary = cvData.summary || "";
  const achievements = cvData.keyAchievements || [];
  const expertise = (cvData.areasOfExpertise || []).map((a: any) => a.name || a);

  const prompt = `Write ONE professional tagline sentence for ${pi.fullName || "a professional"} based on their full CV profile.
    ROLE: ${pi.headline || "Not provided"}
    EXPERIENCE: ${exps.length} roles — ${exps.slice(0, 3).map((e: any) => e.title).join(", ")}
    SKILLS: ${skills.slice(0, 10).join(", ")}
    EXPERTISE: ${expertise.slice(0, 5).join(", ")}
    ACHIEVEMENTS: ${achievements.slice(0, 3).map((a: any) => a.description || a).join("; ")}
    SUMMARY SNIPPET: ${(summary || "").slice(0, 150)}

    Rules:
    - Exactly 1 sentence. Period required.
    - Maximum ${taglineMaxChars} characters (including spaces).
    - Focus on professional impact, leadership, or specialization.
    - Use confident, concise language.
    - Do NOT use clichés like "dynamic" or "passionate".
    Return JSON: {"tagline": ""}`;

  const r = await ai(prompt);
  const raw = (r.tagline || "").trim();
  // Final safety trim
  return raw.length > taglineMaxChars ? trimToWord(raw, taglineMaxChars) : raw;
}

async function blockExperience(exps: any[]): Promise<any[]> {
  const top = exps.slice(0, S.experience.roles);
  const { bulletMinChars, bulletMaxChars, role1Bullets, role2Bullets } = S.experience;

  const rolesData = top.map((e, i) => {
    const count = i === 0 ? role1Bullets : role2Bullets;
    const dates = [e.startDate, e.endDate].filter(Boolean).join(" – ") || "";
    return `Role ${i+1}:
  Title: ${e.title || e.job_title || ""}
  Company: ${e.company || e.company_name || ""}
  Dates: ${dates}
  Description: ${e.description || ""}
  Write exactly ${count} achievement bullets. Target ${bulletMinChars}-${bulletMaxChars} chars per bullet.`;
  }).join("\n\n");

  const r = await ai(`Rewrite the following work experience into polished CV bullets.
    ${rolesData}
    Rules: 
    - past tense action verbs, include quantified results (KPIs, %, $) where possible
    - IMPORTANT: Always reformat dates to month and year only: "May 2020 – Feb 2022"
    - Use 3-letter month abbreviations: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
    - Format: "Month YYYY – Month YYYY"
    - If only years available, use "2020 – 2022"
    - Never include days or ordinal suffixes
    - Never return dates in any other format
    Return JSON: {"experience": [{"role": "", "company": "", "dates": "", "bullets": []}]}`);

  return (r.experience || []).map((exp: any, i: number) => ({
    role: exp.role || "",
    company: exp.company || "",
    dates: exp.dates || "",
    location: top[i]?.location || "",
    bullets: exp.bullets || []
  }));
}

async function blockHistory(exps: any[]): Promise<any[]> {
  const pool = exps.slice(2, 2 + S.history.roles);
  const { maxBulletChars, bulletsPerRole } = S.history;
  
  // Check if we have few roles to expand content
  const roleCount = pool.length;
  let bulletCount: number = bulletsPerRole;
  let minBulletChars = 80;
  
  if (roleCount <= 2) {
    // If only 1-2 roles, add more bullets and longer descriptions
    bulletCount = roleCount === 1 ? 8 : 6;
    minBulletChars = 100;
  }

  const r = await ai(`Write condensed history for: ${JSON.stringify(pool)}.
    Each role gets exactly ${bulletCount} bullets.
    Target length: ${minBulletChars}-${maxBulletChars} chars per bullet.
    If there are only ${roleCount} roles, make the bullets more detailed and comprehensive to fill space.
    IMPORTANT: Always reformat dates to month and year only: "May 2020 – Feb 2022"
    Use 3-letter month abbreviations: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
    Format: "Month YYYY – Month YYYY"
    If only years available, use "2020 – 2022"
    Never include days or ordinal suffixes
    Never return dates in any other format
    Return JSON: {"history": [{"role": "", "company": "", "dates": "", "location": "", "bullets": []}]}`)

  return (r.history || []).map((h: any, i: number) => ({
    role: h.role || "",
    company: h.company || "",
    dates: h.dates || "",
    location: h.location || pool[i]?.location || "",
    bullets: h.bullets || []
  }));
}

async function blockProjects(cvData: any): Promise<any[]> {
  const { count, descMaxChars, maxTechChars } = S.projects;
  
  // Only use real projects from database — never generate fake ones
  const rawProjects = (cvData.projects || []).filter((p: any) => (p.name || "").trim());
  if (rawProjects.length === 0) return [];

  const r = await ai(`Polish these real projects for a professional CV.
    SOURCE: ${JSON.stringify(rawProjects)}

Requirements:
- Each project name: max 36 chars, NO MARKDOWN (no asterisks, no bold formatting)
- Each description: ${descMaxChars} chars (3 sentences), focus on results and technologies used
- Each tech stack: max ${maxTechChars} chars, list key technologies
- Do NOT invent new projects — only rewrite the ones provided
- Return JSON: {"projects": [{"name": "", "description": "", "tech": ""}]}`);

  return (r.projects || []).slice(0, count).map((p: any) => ({
    name: (p.name || "").replace(/\*\*/g, "").trim(),
    description: p.description || "",
    tech: p.tech || ""
  }));
}

async function blockEducation(edus: any[]): Promise<any[]> {
  const { entries, maxDegreeChars, maxSchoolChars } = S.education; // maxDegreeChars/maxSchoolChars used in prompt only
  const r = await ai(`Format education entries.
    Source: ${JSON.stringify(edus)}
    degree: max ${maxDegreeChars} chars. school: max ${maxSchoolChars} chars.
    Return JSON: {"education": [{"degree": "", "school": "", "year": ""}]}`);  

  return (r.education || []).slice(0, entries).map((e: any) => ({
    degree: e.degree || "",
    school: e.school || "",
    year: e.year || "",
  }));
}

async function blockAwards(cvData: any): Promise<any[]> {
  // Awards are FORMAL recognitions: certificates, honors, titles received from organizations
  const existingAwards = Array.isArray(cvData.awards) ? cvData.awards.map((a: any) => a.description || a.title || a.name || (typeof a === 'string' ? a : '')) : [];
  
  const { max, maxTitleChars, maxDescChars } = S.awards;

  // Only use real awards from database — never generate fake ones
  if (existingAwards.length === 0) return [];
  
  const r = await ai(`Rewrite these FORMAL awards into polished CV format: ${JSON.stringify(existingAwards)}.
    Return EXACTLY ${existingAwards.length} award(s) — do NOT add or invent extra awards.
    Each award title: max ${maxTitleChars} chars. Each description: 40-${maxDescChars} chars.
    Focus on external recognitions, certificates, and honors received.
    Return JSON: {"awards":[{"title":"","description":""}]}`);

  return (r.awards || []).slice(0, existingAwards.length).map((a: any) => ({
    title: a.title || "",
    description: a.description || ""
  }));
}

async function blockCertifications(cvData: any): Promise<any[]> {
  const existingCerts = cvData.certifications || [];
  if (existingCerts.length === 0) return [];
  
  const { max, maxNameChars, maxIssuerChars } = S.certifications;
  
  const r = await ai(`Format and polish these professional certifications for a CV.
    SOURCE: ${JSON.stringify(existingCerts.slice(0, max))}
    Rules:
    - Certification name: max ${maxNameChars} chars, use official abbreviation if well-known
    - Issuer: max ${maxIssuerChars} chars, use standard organization name
    - Keep the year accurate
    - Order by relevance/prestige
    Return JSON: {"certifications":[{"name":"","issuer":"","year":""}]}`);

  return (r.certifications || existingCerts).slice(0, max).map((c: any) => ({
    name: trimToWord(c.name || c.cert_name || "", maxNameChars),
    issuer: trimToWord(c.issuer || c.issuing_body || "", maxIssuerChars),
    year: c.year || c.year_obtained || ""
  }));
}

// ─── BACKGROUND VALIDATION & FIX ───

function readListItemText(item: any): string {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";

  return String(
    item.description ||
    item.title ||
    item.name ||
    item.achievement ||
    item.text ||
    item.summary ||
    ""
  ).trim();
}

function normalizeStringArray(items: any): string[] {
  if (!Array.isArray(items)) return [];
  return items.map(readListItemText).filter(Boolean);
}

function formatDateRange(start?: string, end?: string): string {
  const left = typeof start === "string" ? start.trim() : "";
  const right = typeof end === "string" ? end.trim() : "";
  if (left && right) return `${left} - ${right}`;
  return left || right;
}

async function blockTools(cvData: any): Promise<string[]> {
  // Only use real tools from database — never mix in skills or other sections
  const sourceTools = normalizeStringArray(cvData.tools);
  if (sourceTools.length === 0) return [];

  const { maxLabelChars } = S.tools;
  const r = await ai(`Polish these tools/software for a professional CV.
    SOURCE: ${JSON.stringify(sourceTools)}
    Return EXACTLY ${sourceTools.length} tool(s) — do NOT add or invent extra tools.
    Each label must be ${maxLabelChars} characters or fewer.
    Use official product/platform names where possible.
    Return JSON: {"tools": [""]}`);

  return (r.tools || [])
    .slice(0, sourceTools.length)
    .map((tool: any) => trimToWord(String(tool || "").trim(), maxLabelChars))
    .filter(Boolean);
}

async function blockAchievements(cvData: any): Promise<string[]> {
  // Handle both array and raw text input for keyAchievements
  let rawAchievements: string[] = [];

  if (Array.isArray(cvData.keyAchievements)) {
    rawAchievements = [...normalizeStringArray(cvData.keyAchievements)];
  } else if (cvData.keyAchievements && typeof cvData.keyAchievements === 'string') {
    rawAchievements = cvData.keyAchievements
      .split(/[•·▪‣⁃⬤\n\r]|(?<=\.)\s+/)
      .map((s: string) => s.replace(/^[•·▪‣⁃⬤\s]+|[0-9]+\.\s*/, '').trim())
      .filter((s: string) => s.length > 10);
  }

  // Only use real achievements — never generate fake ones
  if (rawAchievements.length === 0) return [];

  const { count, minChars, maxChars } = S.achievements;
  const toRewrite = rawAchievements.slice(0, count);

  // AI-rewrite for professional quality (same pattern as blockBoardRoles, blockProfile, etc.)
  const r = await ai(`Rewrite these career achievements as high-impact professional CV bullet points.
    SOURCE: ${JSON.stringify(toRewrite)}
    Rules:
    - Return EXACTLY ${toRewrite.length} achievement(s) — do NOT add or invent extras
    - Each must be ${minChars}-${maxChars} characters
    - Start with a strong past-tense action verb
    - Quantify results with metrics (%, $, numbers) where the source supports it
    - Each must be a complete sentence ending with a period
    - Do NOT invent facts not present in the source material
    Return JSON: {"achievements": [""]}`);

  const rewritten: string[] = (r.achievements || [])
    .slice(0, toRewrite.length)
    .map((a: any) => String(a || "").trim())
    .filter((a: string) => a.length >= 20);

  // Fall back to raw if AI returned nothing usable
  return rewritten.length > 0 ? rewritten : toRewrite;
}

async function blockBoardRoles(cvData: any): Promise<any[]> {
  const roles = Array.isArray(cvData.boardRoles) ? cvData.boardRoles : [];
  if (roles.length === 0) return [];

  const { max, maxTitleChars, maxOrganizationChars, maxDatesChars, maxDescriptionChars } = S.boardRoles;
  const r = await ai(`Rewrite these board/advisory roles for an executive CV.
    SOURCE: ${JSON.stringify(roles.slice(0, max))}
    Rules:
    - Title: max ${maxTitleChars} chars, use standard board nomenclature
    - Organization: max ${maxOrganizationChars} chars
    - Description: 60-${maxDescriptionChars} chars, focus on strategic impact and governance contribution
    - Each description must be a complete sentence ending with a period
    Return JSON: {"boardRoles":[{"title":"","organization":"","dates":"","description":""}]}`);

  return (r.boardRoles || roles).slice(0, max).map((role: any, i: number) => ({
    title: trimToWord(String(role.title || "").trim(), maxTitleChars),
    organization: trimToWord(String(role.organization || "").trim(), maxOrganizationChars),
    dates: trimToWord(
      role.dates || formatDateRange(roles[i]?.startDate, roles[i]?.endDate) || "",
      maxDatesChars
    ),
    description: role.description ? String(role.description).trim() : undefined,
  })).filter((role: any) => role.title || role.organization);
}

async function blockExecutiveTraining(cvData: any): Promise<any[]> {
  const trainings = Array.isArray(cvData.executiveTraining) ? cvData.executiveTraining : [];
  if (trainings.length === 0) return [];

  const { max, maxNameChars, maxInstitutionChars } = S.executiveTraining;
  const r = await ai(`Format these executive training programs for a senior CV.
    SOURCE: ${JSON.stringify(trainings.slice(0, max))}
    Rules:
    - Program name: max ${maxNameChars} chars, use official program names
    - Institution: max ${maxInstitutionChars} chars
    - Keep year accurate
    Return JSON: {"training":[{"name":"","institution":"","year":""}]}`);

  return (r.training || trainings).slice(0, max).map((item: any) => ({
    name: trimToWord(String(item.name || item.course || "").trim(), maxNameChars),
    institution: trimToWord(String(item.institution || item.provider || "").trim(), maxInstitutionChars),
    year: String(item.year || item.completedYear || "").trim(),
  })).filter((item: any) => item.name || item.institution);
}

async function blockPublications(cvData: any): Promise<any[]> {
  const publications = Array.isArray(cvData.publications) ? cvData.publications : [];
  if (publications.length === 0) return [];

  const { max, maxTitleChars, maxPublisherChars, maxTypeChars } = S.publications;
  const r = await ai(`Format these publications/speaking engagements for an executive CV.
    SOURCE: ${JSON.stringify(publications.slice(0, max))}
    Rules:
    - Title: max ${maxTitleChars} chars, use proper citation style
    - Publisher/venue: max ${maxPublisherChars} chars
    - Type (article, conference, keynote, etc.): max ${maxTypeChars} chars
    Return JSON: {"publications":[{"title":"","publisher":"","year":"","type":""}]}`);

  return (r.publications || publications).slice(0, max).map((item: any) => ({
    title: trimToWord(String(item.title || item.name || "").trim(), maxTitleChars),
    publisher: trimToWord(String(item.publisher || item.journal || "").trim(), maxPublisherChars),
    year: String(item.year || item.publishedYear || "").trim(),
    type: trimToWord(String(item.type || item.category || "").trim(), maxTypeChars) || undefined,
  })).filter((item: any) => item.title);
}

function blockDeclaration(cvData: any): any {
  if (typeof cvData.declaration === "string") {
    return { declaration: cvData.declaration.trim() };
  }

  const declaration = cvData.declaration && typeof cvData.declaration === "object"
    ? cvData.declaration
    : {};

  const text = String(declaration.declaration || declaration.text || "").trim();
  if (!text) return undefined;

  return {
    declaration: text,
    place: String(declaration.place || declaration.location || "").trim() || undefined,
    date: String(declaration.date || "").trim() || undefined,
  };
}

async function validateAndFix(data: any): Promise<any> {
  const d = JSON.parse(JSON.stringify(data)); // deep clone
  const fixes: Promise<void>[] = [];

  // ── Profile ──
  if ((d.profile || "").length > S.profile.maxChars) {
    fixes.push((async () => { d.profile = await shrinkToFit(d.profile, S.profile.maxChars, "executive profile paragraph"); })());
  }

  // ── Tagline ──
  if ((d.tagline || "").length > S.header.taglineMaxChars) {
    d.tagline = trimToWord(d.tagline, S.header.taglineMaxChars);
  }

  // ── Skills: truncate labels ──
  d.skills = (d.skills || []).map((s: string) =>
    typeof s === "string" ? s.slice(0, S.skills.maxLabelChars) : s
  );

  // ── Experience ──
  for (const exp of d.experience || []) {
    // Remove role truncation - let CSS wordWrap handle long titles
    // exp.role    = (exp.role    || "").slice(0, S.experience.maxRoleChars);
    exp.company = (exp.company || "").slice(0, S.experience.maxCompanyChars);
    exp.dates   = (exp.dates   || "").slice(0, S.experience.maxDatesChars);
    for (let bi = 0; bi < (exp.bullets || []).length; bi++) {
      const b = exp.bullets[bi] || "";
      if (b.length > S.experience.bulletMaxChars) {
        fixes.push((async (expRef: any, idx: number, orig: string) => {
          expRef.bullets[idx] = await shrinkToFit(orig, S.experience.bulletMaxChars, "CV bullet point");
        })(exp, bi, b));
      } else if (b.length < S.experience.bulletMinChars) {
        fixes.push((async (expRef: any, idx: number, orig: string) => {
          const r = await ai(
            `Expand this CV bullet to ${S.experience.bulletMinChars}-${S.experience.bulletMaxChars} chars. ` +
            `Add specific metrics, tools, or outcomes. No period needed at start. ` +
            `Return JSON: {"bullet": ""}\nBULLET: ${orig}`
          );
          expRef.bullets[idx] = await shrinkToFit((r.bullet || orig), S.experience.bulletMaxChars, "CV bullet point");
        })(exp, bi, b));
      }
    }
  }

  // ── Career History ──
  for (const h of d.history || []) {
    // Remove role truncation - let CSS wordWrap handle long titles
    // h.role    = (h.role    || "").slice(0, S.history.maxRoleChars);
    h.company = (h.company || "").slice(0, S.history.maxCompanyChars);
    h.dates   = (h.dates   || "").slice(0, S.history.maxDatesChars);
    for (let bi = 0; bi < (h.bullets || []).length; bi++) {
      const b = h.bullets[bi] || "";
      if (b.length > S.history.maxBulletChars) {
        fixes.push((async (hRef: any, idx: number, orig: string) => {
          hRef.bullets[idx] = await shrinkToFit(orig, S.history.maxBulletChars, "CV bullet point");
        })(h, bi, b));
      }
    }
  }

  // ── Projects ──
  for (const p of d.projects || []) {
    p.name = (p.name || "").slice(0, S.projects.maxNameChars);
    if (p.tech) p.tech = p.tech.slice(0, S.projects.maxTechChars);
    const desc = p.description || "";
    if (desc.length > S.projects.descMaxChars) {
      fixes.push((async (pRef: any, orig: string) => {
        pRef.description = await shrinkToFit(orig, S.projects.descMaxChars, "project description");
      })(p, desc));
    } else if (desc.length < S.projects.descMinChars) {
      fixes.push((async (pRef: any, orig: string) => {
        const r = await ai(
          `Expand this project description to ${S.projects.descMinChars}-${S.projects.descMaxChars} chars. ` +
          `Add technical detail and business impact. No bullets. ` +
          `Return JSON: {"description": ""}\nCURRENT: ${orig}`
        );
        pRef.description = await shrinkToFit((r.description || orig), S.projects.descMaxChars, "project description");
      })(p, desc));
    }
  }

  // ── Education ──
  for (const e of d.education || []) {
    e.degree = (e.degree || "").slice(0, S.education.maxDegreeChars);
    e.school = (e.school || "").slice(0, S.education.maxSchoolChars);
  }

  // ── Certifications ──
  for (const c of d.certifications || []) {
    c.name   = (c.name   || "").slice(0, S.certifications.maxNameChars);
    c.issuer = (c.issuer || "").slice(0, S.certifications.maxIssuerChars);
  }

  // ── Awards ──
  for (const a of d.awards || []) {
    a.title = (a.title || "").slice(0, S.awards.maxTitleChars);
    if (a.description) a.description = a.description.slice(0, S.awards.maxDescChars);
  }

  // ── Languages ──
  for (const l of d.languages || []) {
    l.name  = (l.name  || "").slice(0, S.languages.maxNameChars);
    l.label = (l.label || "").slice(0, S.languages.maxLabelChars);
  }

  // ── References ──
  for (const r of d.references || []) {
    r.name    = (r.name    || "").slice(0, S.references.maxNameChars);
    r.title   = (r.title   || "").slice(0, S.references.maxTitleChars);
    r.company = (r.company || "").slice(0, S.references.maxCompanyChars);
  }

  // â”€â”€ Tools â”€â”€
  d.tools = (d.tools || [])
    .map((tool: string) => trimToWord(String(tool || "").trim(), S.tools.maxLabelChars))
    .filter(Boolean)
    .slice(0, S.tools.count);

  // â”€â”€ Achievements â”€â”€
  d.achievements = (d.achievements || []).slice(0, S.achievements.count);
  for (let aiIndex = 0; aiIndex < (d.achievements || []).length; aiIndex++) {
    const achievement = d.achievements[aiIndex] || "";
    if (achievement.length > S.achievements.maxChars) {
      fixes.push((async (achievementsRef: string[], idx: number, orig: string) => {
        achievementsRef[idx] = await shrinkToFit(orig, S.achievements.maxChars, "career highlight");
      })(d.achievements, aiIndex, achievement));
    } else if (achievement.length < S.achievements.minChars) {
      fixes.push((async (achievementsRef: string[], idx: number, orig: string) => {
        const r = await ai(
          `Expand this career highlight to ${S.achievements.minChars}-${S.achievements.maxChars} characters. ` +
          `Keep it as one sentence with concrete business impact. ` +
          `Return JSON: {"achievement": ""}\nCURRENT: ${orig}`
        );
        achievementsRef[idx] = await shrinkToFit((r.achievement || orig), S.achievements.maxChars, "career highlight");
      })(d.achievements, aiIndex, achievement));
    }
  }

  // â”€â”€ Board Roles â”€â”€
  d.boardRoles = (d.boardRoles || []).slice(0, S.boardRoles.max);
  for (const role of d.boardRoles || []) {
    role.title = trimToWord(String(role.title || "").trim(), S.boardRoles.maxTitleChars);
    role.organization = trimToWord(String(role.organization || "").trim(), S.boardRoles.maxOrganizationChars);
    role.dates = trimToWord(String(role.dates || "").trim(), S.boardRoles.maxDatesChars);
    if ((role.description || "").length > S.boardRoles.maxDescriptionChars) {
      fixes.push((async (roleRef: any, orig: string) => {
        roleRef.description = await shrinkToFit(orig, S.boardRoles.maxDescriptionChars, "board role description");
      })(role, role.description));
    }
  }

  // â”€â”€ Executive Training â”€â”€
  d.executiveTraining = (d.executiveTraining || []).slice(0, S.executiveTraining.max);
  for (const training of d.executiveTraining || []) {
    training.name = trimToWord(String(training.name || "").trim(), S.executiveTraining.maxNameChars);
    training.institution = trimToWord(String(training.institution || "").trim(), S.executiveTraining.maxInstitutionChars);
  }

  // â”€â”€ Publications â”€â”€
  d.publications = (d.publications || []).slice(0, S.publications.max);
  for (const publication of d.publications || []) {
    publication.title = trimToWord(String(publication.title || "").trim(), S.publications.maxTitleChars);
    publication.publisher = trimToWord(String(publication.publisher || "").trim(), S.publications.maxPublisherChars);
    if (publication.type) {
      publication.type = trimToWord(String(publication.type || "").trim(), S.publications.maxTypeChars);
    }
  }

  // â”€â”€ Declaration â”€â”€
  if (d.declaration?.declaration && d.declaration.declaration.length > S.declaration.maxChars) {
    fixes.push((async () => {
      d.declaration.declaration = await shrinkToFit(
        d.declaration.declaration,
        S.declaration.maxChars,
        "declaration"
      );
    })());
  }

  // Run all AI expansion fixes in parallel (background)
  await Promise.all(fixes);

  return d;
}

// ─── MAIN HANDLER ───

export async function POST(req: NextRequest) {
  try {
    const { cvData, templateType, category } = await req.json();
    if (!cvData) return NextResponse.json({ error: "No data" }, { status: 400 });

    // Map category to template type for slot rules: junior/mid-senior → two-page, executive → three-page
    const isExecutive = category === "executive";
    const isMidSenior = category === "mid-senior";
    const isJunior = category === "junior";

    // Use category-aware rules when category is provided (new layout system),
    // otherwise fall back to legacy template-based rules
    const validCategory = category as CareerCategory | undefined;
    const slotRules: SlotRules = validCategory && CATEGORY_RULES[validCategory]
      ? CATEGORY_RULES[validCategory]
      : (templateType === "three-page" ? THREE_PAGE_SLOT_RULES : TWO_PAGE_SLOT_RULES);

    return await slotRulesStore.run(slotRules, async () => {
      const pi = cvData.personalInfo || {};

      // ── Common blocks (all categories) ──
      const commonBlocksPromise = Promise.all([
        blockProfile(cvData),
        (isExecutive || isMidSenior) ? blockTagline(cvData) : Promise.resolve(""),
        blockExperience(cvData.experiences || []),
        blockHistory(cvData.experiences || []),
        (!isJunior || (cvData.projects || []).length > 0) ? blockProjects(cvData) : Promise.resolve([]),
        blockEducation(cvData.education || []),
        (async () => {
          const rawSkills = (cvData.skills || []).map((s: any) => s.name || s).filter((s: string) => s.trim());
          if (rawSkills.length === 0) return { skills: [] };
          return ai(
            `Polish these professional skills/competencies for a CV. Max ${S.skills.maxLabelChars} chars each. ` +
            `Return EXACTLY ${rawSkills.length} skill(s) — do NOT add or invent extra skills. ` +
            `Source: ${rawSkills.join(",")}. ` +
            `Return JSON: {"skills":[...]}`
          );
        })(),
        blockAwards(cvData),
        blockCertifications(cvData),
      ]);

      // ── Extended blocks (all categories get achievements/tools now) ──
      const extendedBlocksPromise = Promise.all([
        blockTools(cvData),
        blockAchievements(cvData),
        isExecutive ? blockBoardRoles(cvData) : Promise.resolve([]),
        isExecutive ? blockExecutiveTraining(cvData) : Promise.resolve([]),
        isExecutive ? blockPublications(cvData) : Promise.resolve([]),
        Promise.resolve(blockDeclaration(cvData)),
      ]);

      const [
        [profile, tagline, experience, history, projects, education, skillsRes, awardsRes, certsRes],
        [tools, achievements, boardRoles, executiveTraining, publications, declaration],
      ] = await Promise.all([commonBlocksPromise, extendedBlocksPromise]);

      // ── Memberships (mid-senior & executive) — AI-polished ──
      let memberships: string[] = [];
      if (isMidSenior || isExecutive) {
        const rawMemberships = normalizeStringArray(cvData.memberships);
        if (rawMemberships.length > 0) {
          const mRes = await ai(`Polish these professional memberships/affiliations for a CV. Use official organization names.
            SOURCE: ${JSON.stringify(rawMemberships)}
            Return JSON: {"memberships":[""]}`);
          memberships = (mRes.memberships || rawMemberships).slice(0, rawMemberships.length);
        }
      }

      // ── Volunteer — AI-polished ──
      let volunteer: string[] = [];
      if (isJunior) {
        const rawVolunteer = normalizeStringArray(cvData.volunteer);
        if (rawVolunteer.length > 0) {
          const vRes = await ai(`Rewrite these volunteer experiences as concise CV entries. Each max 80 chars, focus on impact.
            SOURCE: ${JSON.stringify(rawVolunteer)}
            Return JSON: {"volunteer":[""]}`);
          volunteer = (vRes.volunteer || rawVolunteer).slice(0, rawVolunteer.length);
        }
      }

      const finalizedData = {
        fullName: pi.fullName || "",
        title: pi.headline || "",
        email: pi.email || "",
        phone: pi.phone,
        linkedin: pi.linkedin,
        website: pi.website,
        location: pi.location,
        profile,
        tagline,
        skills: (skillsRes.skills || []).filter((s: any) => s && s.trim()),
        experience,
        history,
        projects,
        education,
        certifications: certsRes.filter((c: any) => c && c.name && c.name.trim()),
        awards: (awardsRes || []).filter((a: any) => a.title && a.title.trim()).map((a: any) => ({
          title: a.title,
          description: a.description || ""
        })),
        languages: await (async () => {
          const rawLangs = (cvData.languages || []).slice(0, S.languages.max);
          if (rawLangs.length === 0) return [];
          const lRes = await ai(`Format these languages with proper proficiency labels for a CV.
            SOURCE: ${JSON.stringify(rawLangs)}
            Use standard proficiency: Native, Fluent, Advanced, Intermediate, Basic.
            Return JSON: {"languages":[{"name":"","label":"","level":80}]}`);
          return (lRes.languages || rawLangs).slice(0, S.languages.max).map((l: any) => ({
            name: trimToWord(l.name || l.language_name || "", S.languages.maxNameChars),
            label: trimToWord(l.label || l.proficiency || "", S.languages.maxLabelChars),
            level: l.level ?? 80
          }));
        })(),
        references: await (async () => {
          const rawRefs = (cvData.referees || cvData.references || []).slice(0, S.references.count);
          if (rawRefs.length === 0) return [];
          const rRes = await ai(`Format these professional references for a CV. Clean up names, titles, and companies.
            SOURCE: ${JSON.stringify(rawRefs)}
            Return JSON: {"references":[{"name":"","title":"","company":"","phone":"","email":""}]}`);
          return (rRes.references || rawRefs).slice(0, S.references.count).map((r: any) => ({
            name: trimToWord(r.name || r.referee_name || "", S.references.maxNameChars),
            title: trimToWord(r.title || r.job_title || "", S.references.maxTitleChars),
            company: trimToWord(r.company || r.company_name || "", S.references.maxCompanyChars),
            phone: r.phone || "",
            email: r.email || ""
          }));
        })(),
        tools: (tools || []).filter((t: any) => t && t.trim()),
        achievements: (achievements || []).filter((a: any) => a && a.trim()),
        boardRoles,
        executiveTraining,
        publications,
        declaration,
        memberships: (memberships || []).filter((m: any) => m && m.trim()),
        volunteer: (volunteer || []).filter((v: any) => v && v.trim()),
      };

      const validatedData = await validateAndFix(finalizedData);

      return NextResponse.json({ success: true, data: validatedData });
    });

  } catch (error: any) {
    console.error("AI Rewrite Critical Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
