import { NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";
import { geminiClient } from "@/lib/gemini";
import { detectCategory, type CareerCategory } from "@/lib/detect-category";
import { getCategoryGaps } from "@/lib/category-gaps";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");

// ─── Preserve horizontal layout when parsing PDF ──────────────────────────────
function layoutPageRenderer(pageData: any) {
  return pageData.getTextContent().then((textContent: any) => {
    const items = textContent.items;
    if (!items || items.length === 0) return "";
    const LINE_TOLERANCE = 3;
    const lines: { y: number; parts: { x: number; text: string }[] }[] = [];
    for (const item of items) {
      if (!item.str || item.str.length === 0) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      const existing = lines.find((l) => Math.abs(l.y - y) < LINE_TOLERANCE);
      if (existing) {
        existing.parts.push({ x, text: item.str });
      } else {
        lines.push({ y, parts: [{ x, text: item.str }] });
      }
    }
    lines.sort((a, b) => b.y - a.y);
    return lines
      .map((l) =>
        l.parts
          .sort((a, b) => a.x - b.x)
          .map((p) => p.text)
          .join(" ")
      )
      .join("\n");
  });
}

// ─── Extract text from buffer ─────────────────────────────────────────────────
async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const name = filename.toLowerCase();

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // PDF — try Gemini first, fall back to pdf-parse
  try {
    const genAI = geminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent([
      { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } },
      "Extract all text from this CV/resume PDF and return it as plain text. Preserve all information including dates, numbers, and contact details.",
    ]);
    const text = result.response.text();
    if (text && text.trim().length >= 50) return text;
  } catch {
    // fall through to pdf-parse
  }

  const parsed = await pdfParse(buffer, { pagerender: layoutPageRenderer });
  return parsed.text || "";
}

// ─── Step 1: Structured extraction prompt ────────────────────────────────────
const EXTRACT_SYSTEM = `You are a document classifier and CV parser. Your first job is to determine whether the uploaded document is a CV or resume. If it is not a CV or resume, return is_cv: false and stop. Only extract CV fields if is_cv is true. Return ONLY valid JSON with no extra text or markdown.`;

// Human-readable labels for document types shown to the user
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cv:               "CV / Resume",
  resume:           "CV / Resume",
  cover_letter:     "cover letter",
  reference_letter: "reference letter",
  contract:         "contract",
  invoice:          "invoice",
  report:           "report",
  article:          "article or essay",
  presentation:     "presentation",
  transcript:       "academic transcript",
  certificate:      "certificate",
  other:            "unrecognised document",
};

function buildExtractPrompt(cvText: string): string {
  return (
    "First, determine whether this document is a CV or resume.\n\n" +
    "Return a JSON object with EXACTLY these fields:\n\n" +
    "{\n" +
    '  "is_cv": <boolean — true ONLY if this document is clearly a CV, resume, or curriculum vitae; false for ANYTHING else including cover letters, reference letters, contracts, invoices, reports, articles, or academic transcripts>,\n' +
    '  "document_type": "<classify the document: \'cv\', \'resume\', \'cover_letter\', \'reference_letter\', \'contract\', \'invoice\', \'report\', \'article\', \'presentation\', \'transcript\', \'certificate\', or \'other\'>",\n' +
    '  "name": "Full name or \'Candidate\' — only if is_cv is true, otherwise empty string",\n' +
    '  "current_role": "Most recent job title — only if is_cv is true, otherwise empty string",\n' +
    '  "has_summary": <boolean — true if a professional summary / profile section exists; false if is_cv is false>,\n' +
    '  "summary_word_count": <integer — word count of the summary/profile section, 0 if absent or not a CV>,\n' +
    '  "word_count": <integer — total words in the document>,\n' +
    '  "experiences": [\n' +
    '    {\n' +
    '      "title": "Job title",\n' +
    '      "company": "Company name",\n' +
    '      "startDate": "e.g. Jan 2020 or 2020",\n' +
    '      "endDate": "e.g. Present or Dec 2023 or 2023",\n' +
    '      "description": "All bullet points and description text for this role combined"\n' +
    '    }\n' +
    '  ],\n' +
    '  "education": [{ "degree": "Degree or qualification name", "institution": "School or university name" }],\n' +
    '  "skills": [{ "name": "skill name" }],\n' +
    '  "certifications": [{ "name": "certification name" }],\n' +
    '  "languages": [{ "name": "language name" }],\n' +
    '  "has_key_achievements": <boolean — true if ANY dedicated achievements section exists, regardless of name. This includes sections labelled: "Key Achievements", "Creating Impact", "Career Highlights", "Notable Achievements", "Accomplishments", "Impact", "Key Contributions", "Value Created", "Key Results", "Major Contributions", or any section that lists standalone accomplishments outside of job descriptions>,\n' +
    '  "keyAchievements": [{ "description": "achievement text — extract ALL items from ANY achievements section regardless of what it is called, including \'Creating Impact\', \'Career Highlights\', etc." }],\n' +
    '  "boardRoles": [{ "role": "board or advisory role description" }],\n' +
    '  "publications": [{ "title": "publication or article title" }],\n' +
    '  "executiveTraining": [{ "name": "executive training or leadership programme name" }],\n' +
    '  "awards": [{ "title": "award or recognition name" }],\n' +
    '  "projects": [{ "name": "project name" }],\n' +
    '  "memberships": [{ "name": "professional association or membership name" }],\n' +
    '  "tools": [{ "name": "tool, software, or platform name" }],\n' +
    '  "volunteer": [{ "role": "volunteer role or activity" }],\n' +
    '  "has_referees": <boolean — true if the CV contains ANY references or referees section, regardless of phrasing. This includes: named referees with contact details, any variation of "available upon/on request", "furnished on request", "provided on request", "references available", "referees available", or any other phrasing indicating a references section exists>,\n' +
    '  "referees": [{ "name": "<referee full name if explicitly named; omit this array entry for \'available on request\' style — the has_referees boolean handles that>" }],\n' +
    '  "personalInfo": { "linkedin": "<LinkedIn URL if found, empty string if not>" }\n' +
    "}\n\n" +
    "IMPORTANT: If is_cv is false, set all array fields to [] and string fields to empty strings. Return ONLY the JSON object.\n\n" +
    "DOCUMENT TEXT:\n---\n" +
    buildDocWindow(cvText) +
    "\n---"
  );
}

/**
 * Build the text window sent to GPT.
 * For long CVs we include the document HEAD (main content) + TAIL (last section,
 * where References, Declaration, and sometimes Key Achievements live).
 * This prevents the 9 000-char slice from silently cutting off the end of the CV.
 */
function buildDocWindow(text: string): string {
  const HEAD = 7_500;
  const TAIL = 2_000;
  if (text.length <= HEAD + TAIL) return text;
  return (
    text.slice(0, HEAD) +
    "\n\n[... middle of document omitted for brevity ...]\n\n" +
    text.slice(-TAIL)
  );
}

// ─── Step 2: Category-specific analysis ──────────────────────────────────────
const CATEGORY_SYSTEM: Record<CareerCategory, string> = {
  junior: `You are a strict CV analyst specialising in junior and early-career CVs (0–4 years experience).
For junior candidates, key evaluation areas are: education quality, relevant skills and certifications,
project work, internship quality, and clear readable formatting.
Required sections: Professional Summary, Experience (internships count), Education, Skills, Languages, References.
Recommended: Certifications, Projects, Volunteer Experience.
Sections NOT expected at this level (do not penalise): Key Achievements, Board Roles, Publications, Executive Training.
Most junior CVs score 20–50/100. Be strict and honest. Return ONLY valid JSON.`,

  "mid-senior": `You are a strict CV analyst specialising in mid-level and senior professional CVs (4–12 years experience).
For mid-senior candidates, the most critical factors are: quantified achievements, career progression depth,
presence of a Key Achievements section, leadership scope, and role-relevant keyword density.
Required sections: Summary, Experience (3–6 roles expected), Education, Skills, Key Achievements, Languages, References.
Recommended: Certifications, Awards & Recognition, Professional Memberships, Tools & Software, Projects.
Sections NOT expected at this level: Board Roles, Publications, Executive Training.
IMPORTANT — Alternative section names: Sections labelled "Creating Impact", "Career Highlights", "Notable Achievements",
"Accomplishments", "Key Contributions", "Value Created", or similar COUNT as a Key Achievements section — do NOT flag
their absence if such a section exists. A References section may say "Available on request" — that counts as present.
Most mid-senior CVs score 25–60/100. Be strict and honest. Return ONLY valid JSON.`,

  executive: `You are a strict CV analyst specialising in executive and C-suite CVs (12+ years experience).
For executive candidates, the most critical factors are: P&L or strategic scope, board or advisory memberships,
publications or thought leadership, executive training, and breadth of senior leadership roles.
Required sections: Summary, Experience (5+ roles expected), Education, Skills, Key Achievements,
Board & Advisory Roles, Languages, References.
Recommended: Publications/Speaking Engagements, Executive Training, Professional Memberships, Awards.
IMPORTANT — Alternative section names: Sections labelled "Creating Impact", "Career Highlights", "Notable Achievements",
"Accomplishments", "Key Contributions", "Value Created", or similar COUNT as a Key Achievements section — do NOT flag
their absence if such a section exists. A References section may say "Available on request" — that counts as present.
Most executive CVs score 30–65/100. Be strict and honest. Return ONLY valid JSON.`,
};

const CATEGORY_LABELS: Record<CareerCategory, string> = {
  junior:       "Junior / Early Career",
  "mid-senior": "Mid-Senior Professional",
  executive:    "Executive / C-Suite",
};

function buildAnalysisPrompt(cvText: string, category: CareerCategory): string {
  const label = CATEGORY_LABELS[category];
  return (
    "This CV belongs to a " + label + ".\n\n" +
    "Analyse the CV and return a JSON object with EXACTLY these fields:\n\n" +
    "{\n" +
    '  "total_bullets": <integer — count all bullet points under experience roles>,\n' +
    '  "bullets_with_metrics": <integer — bullets containing a number, %, $, £, €, KSh, TZS, or explicit quantity>,\n' +
    '  "total_skills": <integer — total skills listed in the skills section>,\n' +
    '  "generic_skills_count": <integer — vague skills like: teamwork, communication, hardworking, adaptable, passionate, dedicated, motivated, organised>,\n' +
    '  "keywords_found": <integer — industry/role-specific technical keywords actually present (tools, software, methodologies, certifications)>,\n' +
    '  "keywords_total": 11,\n' +
    '  "ats_score": <0–100 — keyword density, standard section headings, clean single-column formatting>,\n' +
    '  "impact_score": <0–100 — proportion of bullets showing quantifiable achievement; 0 if bullets_with_metrics is 0>,\n' +
    '  "keyword_score": <0–100 — coverage of keywords expected at ' + label + ' level>,\n' +
    '  "readability_score": <0–100 — sentence clarity, appropriate length, professional tone, no typos>,\n' +
    '  "overall_score": <0–100 — MUST equal Math.round(ats_score*0.30 + impact_score*0.35 + keyword_score*0.20 + readability_score*0.15)>,\n' +
    '  "issues": [\n' +
    '    {\n' +
    '      "severity": "critical" or "warning",\n' +
    '      "text": "<Specific issue for a ' + label + ' — MUST reference actual numbers or content from the CV>"\n' +
    '    }\n' +
    '  ],\n' +
    '  "strengths": ["<1–2 genuine positives specific to this CV>"],\n' +
    '  "top_recommendation": "<The single most impactful fix for a ' + label + ', in one sentence>",\n' +
    '  "before_after": {\n' +
    '    "before": "<Copy a real weak bullet from their experience section — if none exist, write a representative one for their role>",\n' +
    '    "after": "<Same bullet rewritten with a specific quantified result — realistic for their industry and career level>",\n' +
    '    "score_label": "<e.g. \'+18 Impact Score\'>"\n' +
    '  },\n' +
    '  "format": {\n' +
    '    "layout_type": "<Infer from text flow — \'single-column\' if content runs top-to-bottom as one clear stream; \'two-column\' if you see parallel blocks or heavy pipe/divider use; \'table-based\' if grid-like character patterns dominate; \'sidebar\' if a persistent sidebar column is evident; \'unknown\' if unclear>",\n' +
    '    "ats_safe": <boolean — true if single-column with no tables or multi-column patterns detected>,\n' +
    '    "section_clarity": "<\'clear\' if standard section headings are consistently used (e.g. Experience, Education, Skills, Summary); \'inconsistent\' if headings vary in style or are partially present; \'confusing\' if absent or non-standard throughout>",\n' +
    '    "template_impression": "<CRITICAL: You are reading EXTRACTED TEXT — colours, badges, icons, and visual styling are completely invisible. Assess ONLY structural consistency. Use \'professional\' if sections are clearly labelled, content is consistently structured, dates follow a pattern, and experience entries are well-organised. Use \'structured\' if reasonably organised but some inconsistency. Use \'generic\' only if the structure feels truly cookie-cutter. Use \'basic\' ONLY if there is genuinely minimal structure — e.g. no clear section headings, run-on paragraphs, no formatting whatsoever. A professionally produced single-column CV MUST NOT be rated \'basic\' just because extracted text looks plain>",\n' +
    '    "format_score": <0–100 — CRITICAL scoring rules: Start at 60 for any single-column CV. ADD: consistent date format throughout all roles (+10), standard professional section headings (+10), consistent bullet structure in experience (+10), logical section order (+5), contact info present (+5). DEDUCT: multi-column or table layout detected (-20), genuinely missing or non-standard section labels (-10), clearly inconsistent date patterns where you can see different formats in the text (e.g. \'01/2020\' next to \'January 2022\') (-10), no bullet formatting in experience (-10). DO NOT deduct for: how skills look in plain text, visual colours, badge styling, font choices — these CANNOT be assessed from extracted text>,\n' +
    '    "issues": [\n' +
    '      "<List 1–3 GENUINE structural issues visible in the raw text only. FORBIDDEN issues — never include these regardless of what you see: (1) skill formatting/comma text — always an extraction artefact, never a real issue; (2) visual design, colours, or badge styling — invisible in text; (3) font or spacing observations. ALLOWED issues: (A) multi-column or table layout detected in text structure; (B) clearly inconsistent date formats where you can see concrete examples of different patterns in THIS specific text — quote both formats you see; (C) critical section completely absent (e.g. no experience section at all); (D) bullet points entirely absent from experience entries. If no genuine structural issue exists, return an empty array [].>"\n' +
    '    ],\n' +
    '    "strengths": ["<1–2 genuine format positives based only on what is observable in the text structure>"]\n' +
    '  }\n' +
    "}\n\n" +
    "Rules:\n" +
    "- issues: 3–5 items, each referencing actual CV data, relevant to " + label + " level expectations\n" +
    "- strengths: 1–2 items only — find something genuinely good\n" +
    "- overall_score MUST follow the weighted formula exactly\n" +
    "- format.issues: follow the FORBIDDEN/ALLOWED rules above strictly — quality over quantity, empty array is valid\n" +
    "- Return ONLY the JSON object\n\n" +
    "CV TEXT:\n---\n" +
    buildDocWindow(cvText) +
    "\n---"
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 5_242_880) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
    }

    const buffer  = Buffer.from(await file.arrayBuffer());
    const cvText  = await extractText(buffer, file.name);

    if (!cvText || cvText.trim().length < 80) {
      return NextResponse.json({ error: "Could not extract readable text from your CV" }, { status: 422 });
    }

    const openai = openaiClient();

    // ── Step 1: Extract structured data ──────────────────────────────────────
    const extractChat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACT_SYSTEM },
        { role: "user",   content: buildExtractPrompt(cvText) },
      ],
    });

    const structured = JSON.parse(extractChat.choices[0]?.message?.content ?? "{}");

    // ── Validate: reject non-CV documents before running expensive analysis ────
    if (structured.is_cv === false) {
      const docType      = structured.document_type || "other";
      const docTypeLabel = DOCUMENT_TYPE_LABELS[docType] ?? "unrecognised document";
      return NextResponse.json(
        {
          error:          "not_a_cv",
          document_type:  docType,
          document_label: docTypeLabel,
        },
        { status: 422 }
      );
    }

    // ── Step 2: Detect category using the same logic as the CV builder ────────
    const category = detectCategory(structured);

    // getCategoryGaps expects cvData.summary as a string and cvData.referees as an array,
    // but extraction only provides booleans/counts. Synthesise what getCategoryGaps needs.
    //
    // Synthesise boolean signals that getCategoryGaps needs as arrays/strings.
    // Each field uses multiple detection layers so real content is never missed.

    // ── Referees: 4-layer detection ──────────────────────────────────────────
    // Layer 4 broadens the raw scan: "on request" / "upon request" at end of CV
    // often indicates a references section even without the word "referee".
    const hasRefereesInText =
      /\b(referee|referees|references?)\b/i.test(cvText) ||
      /\b(available|furnished|provided)\s+(on|upon)\s+request\b/i.test(cvText) ||
      /\bon\s+request\b/i.test(cvText.slice(-2000)); // tail of doc only for "on request"
    const refereesPresent =
      structured.has_referees === true ||
      (Array.isArray(structured.referees) && structured.referees.length > 0) ||
      hasRefereesInText;

    // ── Key Achievements: 3-layer detection ──────────────────────────────────
    // Handles non-standard section names like "Creating Impact", "Career Highlights" etc.
    const hasAchievementsInText =
      /\b(creating impact|career highlights?|notable achievements?|accomplishments?|key contributions?|value created|key results|major contributions?)\b/i.test(cvText);
    const achievementsPresent =
      structured.has_key_achievements === true ||
      (Array.isArray(structured.keyAchievements) && structured.keyAchievements.length > 0) ||
      hasAchievementsInText;

    const structuredForGaps = {
      ...structured,
      // Synthesise summary string: non-empty = present, empty = absent
      summary: structured.has_summary ? "professional summary present" : "",
      // Synthesise referees array so getCategoryGaps sees at least one entry when present
      referees: refereesPresent
        ? (Array.isArray(structured.referees) && structured.referees.length > 0
            ? structured.referees
            : [{ name: "Available on request" }])
        : [],
      // Synthesise keyAchievements so getCategoryGaps doesn't fire for non-standard names
      keyAchievements: achievementsPresent
        ? (Array.isArray(structured.keyAchievements) && structured.keyAchievements.length > 0
            ? structured.keyAchievements
            : [{ description: "achievements present" }])
        : [],
    };
    const categoryGaps = getCategoryGaps(category, structuredForGaps);

    // ── Step 3: Category-specific deep analysis ───────────────────────────────
    const analysisChat = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CATEGORY_SYSTEM[category] },
        { role: "user",   content: buildAnalysisPrompt(cvText, category) },
      ],
    });

    const analysis = JSON.parse(analysisChat.choices[0]?.message?.content ?? "{}");

    // ── Step 4: Sanitise scores ───────────────────────────────────────────────
    const ats_score         = Math.min(100, Math.max(1, analysis.ats_score         ?? 38));
    const impact_score      = Math.min(100, Math.max(0, analysis.impact_score      ?? 22));
    const keyword_score     = Math.min(100, Math.max(1, analysis.keyword_score     ?? 44));
    const readability_score = Math.min(100, Math.max(1, analysis.readability_score ?? 61));
    const overall_score     = Math.min(100, Math.max(1,
      analysis.overall_score ??
      Math.round(ats_score * 0.30 + impact_score * 0.35 + keyword_score * 0.20 + readability_score * 0.15)
    ));

    const fmt = analysis.format ?? {};
    const format_score = Math.min(100, Math.max(1, fmt.format_score ?? 60));

    // ── Filter format issues that are always text-extraction artefacts ────────
    // These are false positives that appear regardless of actual visual quality.
    const FORMAT_ISSUE_BLOCKLIST = [
      /skill.*comma/i,
      /comma.*skill/i,
      /plain.*comma/i,
      /comma.*text/i,
      /no.*visual.*group/i,
      /visual.*group/i,
      /badge/i,
      /colour/i,
      /color/i,
      /font/i,
      /spacing/i,
      /icon/i,
      /capitalisation.*heading/i,
      /heading.*capitalisation/i,
      /capitaliz/i,
    ];
    const rawFmtIssues: string[] = Array.isArray(fmt.issues) ? fmt.issues : [];
    const filteredFmtIssues = rawFmtIssues.filter(
      (issue: string) => !FORMAT_ISSUE_BLOCKLIST.some((re) => re.test(issue))
    );

    // ── Step 5: Merge category gaps into issues (no duplicates) ──────────────
    // Uses semantic topic clusters so that a GPT issue and a category gap
    // about the same subject are never shown together, even if the wording differs.
    // e.g. "The CV does not include a References section" suppresses "No referees added"

    const TOPIC_CLUSTERS: string[][] = [
      ["referee", "reference"],
      ["summary", "profile", "introduction", "objective"],
      ["achievement", "accomplishment", "key achieve"],
      ["linkedin"],
      ["education", "degree", "qualification"],
      ["skills", "skill"],
      ["language"],
      ["certification", "certificate"],
      ["award", "recognition"],
      ["membership", "association"],
    ];

    function sharesTopicWith(a: string, b: string): boolean {
      const la = a.toLowerCase();
      const lb = b.toLowerCase();
      return TOPIC_CLUSTERS.some(
        (cluster) =>
          cluster.some((kw) => la.includes(kw)) &&
          cluster.some((kw) => lb.includes(kw))
      );
    }

    const issues: { severity: "critical" | "warning"; text: string }[] =
      Array.isArray(analysis.issues) ? [...analysis.issues] : [];

    const existingTexts = issues.map((i) => i.text.toLowerCase());
    for (const gap of categoryGaps) {
      const isRecommended = gap.startsWith("[Recommended]");
      const gapText       = gap.replace(/^\[Recommended\]\s*/, "");
      const alreadySeen   = existingTexts.some(
        (t) => t.includes(gapText.toLowerCase().slice(0, 30)) || sharesTopicWith(t, gapText)
      );
      if (!alreadySeen) {
        issues.push({ severity: isRecommended ? "warning" : "critical", text: gapText });
        existingTexts.push(gapText.toLowerCase());
      }
    }

    // ── Sanitise skills counts ────────────────────────────────────────────────
    // GPT sometimes returns total_skills=0 while correctly counting generic_skills
    // (comma-separated skills section text it fails to enumerate individually).
    // Fall back to the extraction-step skills array and enforce total ≥ generic.
    const rawTotal   = analysis.total_skills         || (structured.skills?.length ?? 0);
    const rawGeneric = analysis.generic_skills_count || 0;
    const total_skills_final   = Math.max(rawTotal, rawGeneric);
    const generic_skills_final = Math.min(rawGeneric, total_skills_final);

    // ── Build final result ────────────────────────────────────────────────────
    const result = {
      // Identity
      name:           structured.name         || "Candidate",
      current_role:   structured.current_role || "",
      category,
      category_label: CATEGORY_LABELS[category],
      category_gaps:  categoryGaps,

      // Metrics (from extraction step)
      word_count:          structured.word_count          || 0,
      page_estimate:       (structured.word_count || 0) > 600 ? 2 : 1,
      summary_word_count:  structured.summary_word_count  || 0,
      has_summary:         structured.has_summary         || false,

      // Counts (from analysis step)
      total_bullets:        analysis.total_bullets        || 0,
      bullets_with_metrics: analysis.bullets_with_metrics || 0,
      total_skills:         total_skills_final,
      generic_skills_count: generic_skills_final,
      keywords_found:       analysis.keywords_found       || 0,
      keywords_total:       11,

      // Content scores
      ats_score,
      impact_score,
      keyword_score,
      readability_score,
      overall_score,

      // Format & presentation
      format: {
        layout_type:        fmt.layout_type        || "unknown",
        ats_safe:           fmt.ats_safe           ?? false,
        section_clarity:    fmt.section_clarity    || "clear",
        template_impression: fmt.template_impression || "structured",
        format_score,
        issues:   filteredFmtIssues,
        strengths: Array.isArray(fmt.strengths) ? fmt.strengths : [],
      },

      // Narrative
      issues,
      strengths:          Array.isArray(analysis.strengths) ? analysis.strengths : [],
      top_recommendation: analysis.top_recommendation || "",
      before_after:       analysis.before_after       || null,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[cv-check]", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
