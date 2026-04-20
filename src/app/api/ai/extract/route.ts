import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

// ─── Post-extraction validation ───
function validateExperiences(experiences: any[]): any[] {
  if (!Array.isArray(experiences) || experiences.length === 0) return experiences;

  const cleaned = experiences.map((exp) => {
    const c = { ...exp };

    // Normalize and validate dates
    c.startDate = normalizeDate(c.startDate || "");
    c.endDate   = normalizeDate(c.endDate   || "");

    // Handle full range in one field: "Jan 2020 – Dec 2022" in startDate
    const rangeInStart = (c.startDate || "").match(/^(.+?)\s*[–\-]\s*(.+)$/);
    if (rangeInStart && /\d{4}/.test(rangeInStart[1]) && /\d{4}|present/i.test(rangeInStart[2])) {
      c.startDate = rangeInStart[1].trim();
      c.endDate   = rangeInStart[2].trim();
    }

    // Handle full range in endDate field too
    const rangeInEnd = (c.endDate || "").match(/^(.+?)\s*[–\-]\s*(.+)$/);
    if (rangeInEnd && /\d{4}/.test(rangeInEnd[1]) && /\d{4}|present/i.test(rangeInEnd[2])) {
      if (!c.startDate) c.startDate = rangeInEnd[1].trim();
      c.endDate = rangeInEnd[2].trim();
    }

    // Skip garbage entries with no title AND no company
    if (!c.title && !c.company) return null;

    return c;
  }).filter(Boolean);

  // ── Detect and flag suspiciously short durations (< 2 months) ──
  // These often indicate the AI fabricated or mixed up dates
  cleaned.forEach((exp: any) => {
    if (exp.startDate && exp.endDate && exp.endDate !== "Present") {
      const start = parseDateToMonths(exp.startDate);
      const end = parseDateToMonths(exp.endDate);
      if (start > 0 && end > 0 && end < start) {
        // End date is before start date — swap them
        const tmp = exp.startDate;
        exp.startDate = exp.endDate;
        exp.endDate = tmp;
      }
    }
  });

  return cleaned;
}

// Parse a date string like "Jan 2020" or "2020" into total months for comparison
function parseDateToMonths(dateStr: string): number {
  if (!dateStr) return 0;
  const months: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    january: 1, february: 2, march: 3, april: 4, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  // Try "Mon YYYY" or "Month YYYY"
  const match = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const m = months[match[1].toLowerCase()] || 0;
    return parseInt(match[2], 10) * 12 + m;
  }
  // Try just "YYYY"
  const yearOnly = dateStr.match(/^(\d{4})$/);
  if (yearOnly) return parseInt(yearOnly[1], 10) * 12;
  return 0;
}

// ─── Normalize a single date string ───
// Converts "01", "04", "01/04" etc. to empty string
// Converts "01 April 2020" → "April 2020", "04/2020" → "April 2020"
function normalizeDate(raw: string): string {
  if (!raw) return "";
  const s = raw.trim();

  // If it's just a 1-2 digit number (a day), it's garbage — clear it
  if (/^\d{1,2}$/.test(s)) return "";

  // DD Month YYYY → strip the leading day number
  // e.g. "01 April 2020" → "April 2020"
  const ddMonthYear = s.match(/^\d{1,2}[\s/-]([A-Za-z]+[\s.,-]+\d{4})$/);
  if (ddMonthYear) return ddMonthYear[1].trim();

  // DD/MM/YYYY or MM/YYYY → convert to "Mon YYYY"
  const slashFull = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashFull) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mon = parseInt(slashFull[2], 10) - 1;
    return `${months[mon] ?? slashFull[2]} ${slashFull[3]}`;
  }

  // MM/YYYY → "Mon YYYY"
  const slashMonYear = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMonYear) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mon = parseInt(slashMonYear[1], 10) - 1;
    return `${months[mon] ?? slashMonYear[1]} ${slashMonYear[2]}`;
  }

  // Already has a 4-digit year somewhere — keep as-is
  if (/\d{4}/.test(s)) return s;

  // Anything without a 4-digit year and not "Present" is garbage
  if (/^(present|current|now|to date|till date)$/i.test(s)) return "Present";

  return "";
}

function validateDates(data: any): any {
  // Validate experiences
  if (data.experiences?.length) {
    data.experiences = validateExperiences(data.experiences);
  }

  // Validate board roles
  if (data.boardRoles?.length) {
    data.boardRoles = data.boardRoles.filter((b: any) => b.title || b.organization);
  }

  // Remove empty strings from simple arrays
  for (const key of ["memberships", "keyAchievements", "volunteer", "interests"]) {
    if (Array.isArray(data[key])) {
      data[key] = data[key].filter((item: any) => {
        if (typeof item === "string") return item.trim().length > 0;
        return true;
      });
    }
  }
  // Tools are now objects { name, company } — filter out entries with no name
  if (Array.isArray(data.tools)) {
    data.tools = data.tools
      .map((t: any) => typeof t === "string" ? { name: t, company: "" } : t)
      .filter((t: any) => t?.name?.trim?.().length > 0);
  }

  // Fix declaration: use current date instead of old CV date
  if (data.declaration) {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    data.declaration.date = `${day} ${month} ${year}`;
  }

  return data;
}

// ─── Comprehensive post-extraction validation ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateAllSections(data: any): any {
  // Ensure personalInfo always has required fields
  if (!data.personalInfo || typeof data.personalInfo !== "object") {
    data.personalInfo = { fullName: "", email: "", phone: "", location: "", headline: "", linkedin: "", website: "" };
  } else {
    const pi = data.personalInfo;
    pi.fullName = (pi.fullName || "").trim();
    pi.email = (pi.email || "").trim();
    pi.phone = (pi.phone || "").trim();
    pi.location = (pi.location || "").trim();
    pi.headline = (pi.headline || "").trim();
    pi.linkedin = (pi.linkedin || "").trim();
    pi.website = (pi.website || "").trim();
  }

  // Ensure summary is a string
  if (typeof data.summary !== "string") {
    data.summary = "";
  }

  // Validate skills array — ensure each has name and category
  if (Array.isArray(data.skills)) {
    data.skills = data.skills
      .filter((s: any) => s && typeof s === "object" && (s.name || "").trim())
      .map((s: any) => ({
        name: (s.name || "").trim(),
        category: (s.category || "Other").trim(),
      }));
  } else {
    data.skills = [];
  }

  // Validate education array
  if (Array.isArray(data.education)) {
    data.education = data.education
      .filter((e: any) => e && typeof e === "object" && ((e.degree || "").trim() || (e.institution || "").trim()))
      .map((e: any) => ({
        degree: (e.degree || "").trim(),
        institution: (e.institution || "").trim(),
        year: (e.year || "").trim(),
        description: (e.description || "").trim(),
      }));
  } else {
    data.education = [];
  }

  // Validate certifications array
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications
      .filter((c: any) => c && typeof c === "object" && (c.name || "").trim())
      .map((c: any) => ({
        name: (c.name || "").trim(),
        issuer: (c.issuer || "").trim(),
        year: (c.year || "").trim(),
      }));
  } else {
    data.certifications = [];
  }

  // Validate languages array
  if (Array.isArray(data.languages)) {
    data.languages = data.languages
      .filter((l: any) => l && typeof l === "object" && (l.name || "").trim())
      .map((l: any) => ({
        name: (l.name || "").trim(),
        proficiency: (l.proficiency || "").trim(),
      }));
  } else {
    data.languages = [];
  }

  // Validate referees array
  if (Array.isArray(data.referees)) {
    data.referees = data.referees
      .filter((r: any) => r && typeof r === "object" && (r.name || "").trim())
      .map((r: any) => ({
        name: (r.name || "").trim(),
        title: (r.title || "").trim(),
        company: (r.company || "").trim(),
        phone: (r.phone || "").trim(),
        email: (r.email || "").trim(),
      }));
  } else {
    data.referees = [];
  }

  // Validate projects array
  if (Array.isArray(data.projects)) {
    data.projects = data.projects
      .filter((p: any) => p && typeof p === "object" && ((p.name || "").trim() || (p.description || "").trim()))
      .map((p: any) => ({
        name: (p.name || "").trim(),
        description: (p.description || "").trim(),
        tech: (p.tech || "").trim(),
      }));
  } else {
    data.projects = [];
  }

  // Validate internships array
  if (Array.isArray(data.internships)) {
    data.internships = data.internships
      .filter((i: any) => i && typeof i === "object" && ((i.title || "").trim() || (i.company || "").trim()))
      .map((i: any) => ({
        title: (i.title || "").trim(),
        company: (i.company || "").trim(),
        location: (i.location || "").trim(),
        startDate: normalizeDate(i.startDate || ""),
        endDate: normalizeDate(i.endDate || ""),
        description: (i.description || "").trim(),
      }));
  } else {
    data.internships = [];
  }

  // Validate areasOfExpertise
  if (Array.isArray(data.areasOfExpertise)) {
    data.areasOfExpertise = data.areasOfExpertise
      .filter((a: any) => a && typeof a === "object" && (a.name || "").trim())
      .map((a: any) => ({
        name: (a.name || "").trim(),
        description: (a.description || "").trim(),
      }));
  } else {
    data.areasOfExpertise = [];
  }

  // Validate executive fields
  if (Array.isArray(data.executiveTraining)) {
    data.executiveTraining = data.executiveTraining
      .filter((t: any) => t && typeof t === "object" && (t.name || "").trim())
      .map((t: any) => ({
        name: (t.name || "").trim(),
        institution: (t.institution || "").trim(),
        year: (t.year || "").trim(),
      }));
  } else {
    data.executiveTraining = [];
  }

  if (Array.isArray(data.publications)) {
    data.publications = data.publications
      .filter((p: any) => p && typeof p === "object" && (p.title || "").trim())
      .map((p: any) => ({
        title: (p.title || "").trim(),
        publisher: (p.publisher || "").trim(),
        year: (p.year || "").trim(),
        type: (p.type || "publication").trim(),
      }));
  } else {
    data.publications = [];
  }

  // Validate awards array
  if (Array.isArray(data.awards)) {
    data.awards = data.awards
      .filter((a: any) => a && typeof a === "object" && (a.title || "").trim())
      .map((a: any) => ({
        title: (a.title || "").trim(),
        description: (a.description || "").trim(),
      }));
  } else {
    data.awards = [];
  }

  // ─── Fallback: mine achievements from experience descriptions if empty ───
  const rawAchievements: string[] = Array.isArray(data.keyAchievements)
    ? data.keyAchievements.filter((a: any) => typeof a === "string" ? a.trim().length > 0 : !!(a?.achievement?.trim()))
    : [];

  if (rawAchievements.length === 0 && Array.isArray(data.experiences) && data.experiences.length > 0) {
    const ACHIEVEMENT_SIGNALS = /(?:\d+\s*%|\$\s*\d|\d+\s*(?:million|billion|m|b)\b|\d+x\b|\d+\s*(?:staff|employees|team members|people|countries|sites|branches|clients|customers)|(?:increased|grew|grew|reduced|cut|saved|generated|delivered|achieved|exceeded|surpassed|launched|built|led|managed|established|transformed|negotiated|secured|raised|streamlined|deployed|implemented)\b.*?\d)/i;
    const MIN_WORDS = 5;
    const MAX_WORDS = 40;
    const mined: string[] = [];

    for (const exp of data.experiences) {
      const desc: string = (exp.description || "").trim();
      if (!desc) continue;
      const lines = desc.split(/\n/);
      for (const raw of lines) {
        const line = raw.replace(/^[-•*>\s]+/, "").trim();
        const wordCount = line.split(/\s+/).length;
        if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) continue;
        if (ACHIEVEMENT_SIGNALS.test(line)) {
          mined.push(line);
        }
      }
    }

    if (mined.length > 0) {
      data.keyAchievements = [...new Set(mined)].slice(0, 12);
    }
  }

  // Ensure declaration object structure
  if (data.declaration && typeof data.declaration === "object") {
    data.declaration = {
      declaration: (data.declaration.declaration || "").trim(),
      place: (data.declaration.place || "").trim(),
      date: (data.declaration.date || "").trim(),
    };
    // Remove empty declaration
    if (!data.declaration.declaration) {
      data.declaration = null;
    }
  } else {
    data.declaration = null;
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const prompt = `You are an expert CV/resume parser with years of experience reading professional documents. Your task is to extract EVERY piece of information from this CV into a structured JSON object.

CRITICAL RULES FOR EXPERIENCE EXTRACTION:
1. Each job/role is a SEPARATE entry in the "experiences" array.
2. Each entry MUST have its OWN startDate and endDate — NEVER mix dates from one role into another.
3. Read the CV top-to-bottom. For each role you encounter, identify:
   - The job title (on or near the role header line)
   - The company name (on or near the role header line — see COMPANY NAME rules below)
   - The date range that is closest to / on the same line as that role header
   - The description/bullets that follow that header UNTIL the next role header begins
4. Order experiences from MOST RECENT first (reverse chronological).
5. If a role says "Present" or "Current" or "To Date" or "Till Date", set endDate to "Present".
6. NEVER assign a date range from Role A to Role B. Each role's dates must come from its own header line.
7. If a role has no visible dates, leave startDate and endDate as empty strings — do NOT guess or fabricate dates.
8. DURATION ACCURACY IS CRITICAL: The date range for each role must reflect the ACTUAL duration shown in the CV. Do NOT shorten, compress, or fabricate date ranges.
9. CHRONOLOGICAL CONSISTENCY: Roles should not have overlapping dates (unless the person explicitly held concurrent positions). If the CV shows a career progression at the same company (e.g. promotions), each role MUST have its own distinct non-overlapping date range.
10. LOOK FOR DATE PATTERNS: CVs typically show dates near the job title or company name. Common patterns:
    - Right-aligned dates on the same line as the title
    - Dates on a separate line between title and description
    - Dates in parentheses after the company name
    - Date ranges like "June 2007 - October 2009" or "Jun 2007 – Oct 2009"
11. When multiple roles are at the SAME company, pay extra attention — each role has its own date range showing the period in that specific position.

DATE FORMAT RULES (CRITICAL):
- startDate and endDate MUST always contain a Month AND a Year (e.g. "Jan 2020", "April 2020", "2020").
- NEVER put a day number alone (e.g. "01", "04", "15") in startDate or endDate.
- If the CV shows "01 April 2020", extract startDate as "April 2020" (drop the day).
- If the CV shows "04/2020" or "4/2020", extract as "Apr 2020".
- If the CV shows "01/04/2020" (DD/MM/YYYY), extract as "Apr 2020".
- If the date range appears as a single string like "Jan 2020 – Mar 2022", split it: startDate="Jan 2020", endDate="Mar 2022".
- Use 3-letter month abbreviations: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.
- If only a year is available (e.g. "2020"), use just the year.

COMPANY NAME RULES (CRITICAL):
- The company name is often on the SAME line as the job title, or on the IMMEDIATELY FOLLOWING line.
- Common CV layouts for role headers:
  a) "Job Title | Company Name | Jan 2020 – Dec 2022"
  b) "Job Title – Company Name (Jan 2020 – Dec 2022)"
  c) "Job Title\nCompany Name\nJan 2020 – Dec 2022"
  d) "Job Title, Company Name, Location\nJan 2020 – Dec 2022"
  e) "Company Name\nJob Title\nJan 2020 – Dec 2022"
- If the company name appears on the next line after the title, ALWAYS extract it as the company.
- Do NOT leave company blank if a company name exists anywhere near the role header.
- Do NOT confuse the company name with the location or dates.

Return ONLY valid JSON with this exact structure (use empty strings/arrays for missing fields):
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "headline": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "",
  "experiences": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "description": ""
    }
  ],
  "skills": [
    { "name": "", "category": "" }
  ],
  "certifications": [
    { "name": "", "issuer": "", "year": "" }
  ],
  "languages": [
    { "name": "", "proficiency": "" }
  ],
  "memberships": [""],
  "keyAchievements": [""],
  "projects": [
    { "name": "", "description": "", "tech": "" }
  ],
  "boardRoles": [
    { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "" }
  ],
  "executiveTraining": [
    { "name": "", "institution": "", "year": "" }
  ],
  "publications": [
    { "title": "", "publisher": "", "year": "", "type": "" }
  ],
  "referees": [
    { "name": "", "title": "", "company": "", "phone": "", "email": "" }
  ],
  "areasOfExpertise": [
    { "name": "", "description": "" }
  ],
  "awards": [
    { "title": "", "description": "" }
  ],
  "tools": [{ "name": "", "company": "" }],
  "volunteer": [""],
  "interests": [""],
  "internships": [
    { "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "description": "" }
  ],
  "declaration": {
    "declaration": "",
    "place": "",
    "date": ""
  }
}

SECTION-BY-SECTION EXTRACTION RULES:

PERSONAL INFO:
- Extract full name, email, phone (including country code), location (city + country), LinkedIn URL, website/portfolio URL.
- For headline: use the professional title or tagline near the top of the CV. If none exists, infer from the most recent job title.

SUMMARY / PROFILE:
- Extract the entire professional summary, executive profile, or career objective paragraph. Preserve it fully — do not truncate.

EXPERIENCES:
- Extract ALL roles including part-time, contract, freelance, and consulting positions.
- For description: combine ALL bullet points and paragraphs under that role into one string, separated by newlines ("\\n").
- Include quantified results (%, $, numbers) exactly as written.
- For location: extract city and/or country for each role. Look near the company name or date line.
- startDate/endDate: Always Month+Year format. Drop day numbers. Use "Present" for current roles.

EDUCATION:
- Extract university/college level qualifications ONLY: bachelor's degrees, master's degrees, PhDs, diplomas, HND, foundation degrees, and other tertiary/higher education.
- Do NOT put secondary school leaving certificates here — those go in CERTIFICATIONS (see below).
- "year" should be the graduation/completion year (or year range like "2015-2019").
- "description" should include honors, GPA, thesis title, or relevant coursework if mentioned.

SKILLS:
- Extract ALL professional competencies and skills — from dedicated Skills sections AND from bullet-point or dash-separated lists embedded inside a Professional Profile, Executive Summary, or Career Objective section.
- If the profile/summary contains a list like "- Quality Management  - Process Enhancement  - Team Management", extract EACH item as a separate skill with category "Core".
- A skill item is a short noun phrase (1–5 words). Full narrative sentences belong in the summary, not here.
- Do NOT include software tools or platforms here — those go in the "tools" array.
- Categorize each: "Technical", "Soft Skills", "Leadership", "Core", "Industry", or "Other".
- Focus on professional competencies like "Financial Management", "Strategic Planning", "Risk Assessment", etc.

CERTIFICATIONS:
- Extract name, issuing body, and year for each certification, license, or professional credential.
- ALSO extract secondary/high school leaving certificates and national examination results as certifications. This includes: CSEE (Certificate of Secondary Education), ACSEE (Advanced Certificate of Secondary Education), O-Level / A-Level results, GCSE, WAEC, KCSE, ZIMSEC, NECO, IGCSE, Matric, and any similar national secondary school certificates. Use the school name as the issuing body and the year range (e.g. "1999–2002") as the year.
- If a CV section is labelled "Qualifications", "Academic Qualifications", or similar and lists certificates with school names and year ranges, extract ALL entries there as certifications.

LANGUAGES:
- Extract language name and proficiency level (e.g., "Native", "Fluent", "Intermediate", "Basic").

MEMBERSHIPS:
- Extract professional bodies, associations, societies, or affiliations as simple strings.

KEY ACHIEVEMENTS:
- Extract achievements from dedicated "Key Achievements", "Achievements", "Key Accomplishments", "Career Highlights", or "Key Result Areas" sections.
- ALSO extract bullet points from the Professional Profile/Summary that describe quantified results, specific accomplishments, or named outcomes (not generic competency names).
- ALSO scan each experience role description and pull out individual bullet lines that contain: quantified results (%, $, numbers), specific metric-driven outcomes, or named accomplishments — for example "Increased revenue by 35%", "Reduced costs by $2M", "Led team of 50 engineers", "Launched product used by 1M+ users".
- Each extracted achievement must be a complete, standalone sentence or bullet point — do NOT copy the entire experience description.
- Do NOT fabricate or invent achievements not present in the CV.
- If no achievements-type content exists anywhere, return an empty array.

PROJECTS:
- Extract projects ONLY from dedicated "Projects", "Notable Projects", "Key Projects" sections.
- Do NOT fabricate projects from experience descriptions.
- If no projects section exists, return an empty array.

BOARD ROLES:
- Extract board positions, committee roles, or governance roles with organization, dates, and description.

EXECUTIVE TRAINING:
- Extract leadership programs, executive education, advanced professional development. NOT regular degrees.

PUBLICATIONS:
- Extract papers, articles, books, conference presentations. Set type to "publication" or "speaking".

REFEREES:
- Extract referee/reference name, their job title, company, phone, and email.
- If the CV says "References available on request" or similar, return an empty array — do NOT create a referee entry for that phrase.
- Only extract actual named individuals with at least a name and title/company.

AREAS OF EXPERTISE:
- Extract any "Core Competencies", "Areas of Expertise", "Key Areas", "Specializations" sections.
- ALSO extract bullet-point or dash-separated competency lists embedded in Professional Profile or Summary sections — short noun phrases like "Production Planning", "Cost Control", "Quality Management".

AWARDS:
- Extract any awards, recognitions, honors, or prizes from dedicated "Awards", "Awards & Recognition", or "Honors" sections.
- Each award needs a title and optional description.
- Do NOT fabricate awards — only extract what is explicitly listed in the CV.
- If no awards section exists, return an empty array.

TOOLS:
- Extract software, platforms, systems, and tools from dedicated "Tools", "Software", "Technical Tools" sections.
- Examples: "SAP", "Salesforce", "JIRA", "Microsoft Excel", "QuickBooks".
- For each tool, identify which company the candidate used it at by cross-referencing the experience section.
  If a tool appears under or immediately after a specific role/company, set "company" to that company name.
  If a tool is listed generically with no clear company link, set "company" to "" (empty string).
- Do NOT duplicate items that are already in the skills array.
- Return as objects: { "name": "SAP", "company": "Acme Corp" }

VOLUNTEER:
- Extract community service, volunteer work, or pro-bono activities as descriptive strings.

INTERNSHIPS:
- Extract entries with titles like "Intern", "Trainee", "Attachment", "Industrial Training", "Work Placement" separately.

DECLARATION:
- Extract any declaration/affirmation statement, place, and date.

FINAL REMINDERS:
- Do NOT skip any section. Extract EVERYTHING.
- Do NOT mix dates between different experiences.
- Do NOT leave a field empty if the information exists somewhere in the CV.
- Return ONLY the JSON — no markdown fences, no explanation.

CV CONTENT (Markdown-formatted):
${text}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a precise CV data extraction engine. The input is Markdown-formatted CV content produced by a visual layout parser — section headers appear as ## headings and bullets as - items. Extract EVERY piece of information into perfectly structured JSON. Pay extreme attention to matching dates with their correct job roles — NEVER mix dates between roles. When you see numbers, percentages, or currency values (%, $, TZS, KSh) in experience descriptions, ensure they are captured verbatim in the description field."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.05,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    // Post-extraction validation: fix date mixing, remove empty entries
    const dateValidated = validateDates(parsed);

    // Comprehensive validation: ensure all sections have proper structure
    const validated = validateAllSections(dateValidated);

    return NextResponse.json({ data: validated });
  } catch (err: any) {
    console.error("AI extraction error:", err);
    return NextResponse.json(
      { error: err.message || "AI extraction failed" },
      { status: 500 }
    );
  }
}
