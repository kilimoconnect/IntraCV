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
const EXTRACT_SYSTEM = `You are a CV parser. Extract structured data from the CV text and return ONLY valid JSON with no extra text or markdown.`;

function buildExtractPrompt(cvText: string): string {
  return (
    "Parse this CV and return a JSON object with EXACTLY these fields:\n\n" +
    "{\n" +
    '  "name": "Full name or \'Candidate\'",\n' +
    '  "current_role": "Most recent job title",\n' +
    '  "has_summary": <boolean — true if a professional summary / profile section exists>,\n' +
    '  "summary_word_count": <integer — word count of the summary/profile section, 0 if absent>,\n' +
    '  "word_count": <integer — total words in the entire CV>,\n' +
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
    '  "keyAchievements": [{ "description": "achievement text" }],\n' +
    '  "boardRoles": [{ "role": "board or advisory role description" }],\n' +
    '  "publications": [{ "title": "publication or article title" }],\n' +
    '  "executiveTraining": [{ "name": "executive training or leadership programme name" }],\n' +
    '  "awards": [{ "title": "award or recognition name" }],\n' +
    '  "projects": [{ "name": "project name" }],\n' +
    '  "memberships": [{ "name": "professional association or membership name" }],\n' +
    '  "tools": [{ "name": "tool, software, or platform name" }],\n' +
    '  "volunteer": [{ "role": "volunteer role or activity" }],\n' +
    '  "personalInfo": { "linkedin": "<LinkedIn URL if found, empty string if not>" }\n' +
    "}\n\n" +
    "Return ONLY the JSON object.\n\n" +
    "CV TEXT:\n---\n" +
    cvText.slice(0, 9000) +
    "\n---"
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
Most mid-senior CVs score 25–60/100. Be strict and honest. Return ONLY valid JSON.`,

  executive: `You are a strict CV analyst specialising in executive and C-suite CVs (12+ years experience).
For executive candidates, the most critical factors are: P&L or strategic scope, board or advisory memberships,
publications or thought leadership, executive training, and breadth of senior leadership roles.
Required sections: Summary, Experience (5+ roles expected), Education, Skills, Key Achievements,
Board & Advisory Roles, Languages, References.
Recommended: Publications/Speaking Engagements, Executive Training, Professional Memberships, Awards.
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
    '    "layout_type": "<Infer from text patterns — \'single-column\' if clean linear flow with no side-by-side content, \'two-column\' if content appears side-by-side or uses pipes/dividers, \'table-based\' if table-like characters present, \'sidebar\' if clear sidebar column pattern, \'unknown\' if unclear>",\n' +
    '    "ats_safe": <boolean — true only if single-column with no tables or complex columns inferred>,\n' +
    '    "section_clarity": "<\'clear\' if all headings use standard professional names (Experience, Education, Skills etc.), \'inconsistent\' if mixed, \'confusing\' if non-standard or absent>",\n' +
    '    "template_impression": "<\'basic\' = plain text or default Word/Google Docs, \'generic\' = simple commonly-used free template, \'structured\' = consistently formatted but visually plain, \'professional\' = strong visual structure indicators>",\n' +
    '    "format_score": <0–100 — assess visual presentation quality from text signals: deduct for table/column layout (-20), non-standard section headers (-10), generic/plain appearance (-15), inconsistent date or bullet formatting (-10), no apparent visual hierarchy (-10); add for clean linear structure (+15), consistent professional formatting (+15), clear section organisation (+10)>,\n' +
    '    "issues": ["<2–3 specific format or presentation problems observable from the text structure, e.g. \'Skills listed as plain comma text with no visual grouping or categories\', \'Inconsistent date format across roles — mix of MM/YYYY and month names\', \'Section headings lack consistent capitalisation\'>"],\n' +
    '    "strengths": ["<0–1 genuine format positives — can be an empty array>"]\n' +
    '  }\n' +
    "}\n\n" +
    "Rules:\n" +
    "- issues: 3–5 items, each referencing actual CV data, relevant to " + label + " level expectations\n" +
    "- strengths: 1–2 items only — find something genuinely good\n" +
    "- overall_score MUST follow the weighted formula exactly\n" +
    "- format.issues: 2–3 items focused purely on presentation/layout/structure, not content\n" +
    "- Return ONLY the JSON object\n\n" +
    "CV TEXT:\n---\n" +
    cvText.slice(0, 9000) +
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

    // ── Step 2: Detect category using the same logic as the CV builder ────────
    const category     = detectCategory(structured);
    const categoryGaps = getCategoryGaps(category, structured);

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
    const format_score = Math.min(100, Math.max(1, fmt.format_score ?? 35));

    // ── Step 5: Merge category gaps into issues (no duplicates) ──────────────
    const issues: { severity: "critical" | "warning"; text: string }[] =
      Array.isArray(analysis.issues) ? [...analysis.issues] : [];

    const existingTexts = issues.map((i) => i.text.toLowerCase());
    for (const gap of categoryGaps) {
      const isRecommended = gap.startsWith("[Recommended]");
      const gapText       = gap.replace(/^\[Recommended\]\s*/, "");
      const fingerprint   = gapText.toLowerCase().slice(0, 30);
      const alreadySeen   = existingTexts.some((t) => t.includes(fingerprint));
      if (!alreadySeen) {
        issues.push({ severity: isRecommended ? "warning" : "critical", text: gapText });
        existingTexts.push(fingerprint);
      }
    }

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
      total_skills:         analysis.total_skills         || 0,
      generic_skills_count: analysis.generic_skills_count || 0,
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
        section_clarity:    fmt.section_clarity    || "inconsistent",
        template_impression: fmt.template_impression || "generic",
        format_score,
        issues:   Array.isArray(fmt.issues)    ? fmt.issues    : [],
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
