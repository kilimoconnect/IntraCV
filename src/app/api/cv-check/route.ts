import { NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";
import { geminiClient } from "@/lib/gemini";

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
    const result  = await mammoth.extractRawText({ buffer });
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

// ─── Analysis prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a strict, professional CV analyst. Your job is to give an honest, data-driven analysis.
Most CVs score between 20–55/100. Do NOT inflate scores. Be specific — reference actual numbers from the CV.
Return ONLY valid JSON, no explanation outside the JSON.`;

function buildPrompt(cvText: string): string {
  return `Analyse the CV below and return a single JSON object with EXACTLY these fields:

{
  "name": "Full name extracted from CV, or 'Candidate' if not found",
  "current_role": "Most recent job title found",
  "word_count": <integer — count all words in the CV>,
  "page_estimate": <1 or 2 — estimate based on content volume>,
  "summary_word_count": <integer — words in the professional summary/profile section; 0 if absent>,
  "has_summary": <boolean>,
  "total_bullets": <integer — count every bullet point listed under experience roles>,
  "bullets_with_metrics": <integer — bullets that contain a number, %, $, £, €, KSh, TZS, or explicit quantity>,
  "total_skills": <integer — skills listed in the skills section>,
  "generic_skills_count": <integer — skills like: teamwork, communication, hardworking, adaptable, passionate, dedicated, motivated, organised — count these>,
  "keywords_found": <integer — count industry/role-specific technical keywords actually present (tools, software, methodologies, certifications)>,
  "keywords_total": 11,
  "ats_score": <0–100 — keyword density, clean formatting (no tables/columns), standard section names, ATS compatibility>,
  "impact_score": <0–100 — proportion of bullets showing quantifiable impact; 0 if bullets_with_metrics is 0>,
  "keyword_score": <0–100 — how well role-relevant keywords are covered>,
  "readability_score": <0–100 — sentence clarity, appropriate length, professional tone, no typos>,
  "overall_score": <0–100 — must equal Math.round(ats_score*0.30 + impact_score*0.35 + keyword_score*0.20 + readability_score*0.15)>,
  "issues": [
    {
      "severity": "critical" or "warning",
      "text": "<Specific issue — MUST reference actual numbers from the CV, e.g. '12 experience bullets found — 0 include measurable results'>"
    }
  ],
  "strengths": ["<1–2 genuine positives found in this specific CV>"],
  "top_recommendation": "<The single most impactful fix in one sentence>"
}

Rules:
- issues array: 3–5 items, mix of critical and warning, each referencing actual CV data
- strengths: 1–2 items only — find something genuinely good even in weak CVs
- overall_score must follow the formula exactly
- Return ONLY the JSON object

CV TEXT:
---
${cvText.slice(0, 9000)}
---`;
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

    const openai  = openaiClient();
    const chat    = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: buildPrompt(cvText) },
      ],
    });

    const raw    = chat.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);

    // Sanitise: ensure overall_score is honest and within range
    result.overall_score = Math.min(100, Math.max(1, result.overall_score ?? 29));
    result.ats_score     = Math.min(100, Math.max(1, result.ats_score     ?? 38));
    result.impact_score  = Math.min(100, Math.max(0, result.impact_score  ?? 22));
    result.keyword_score = Math.min(100, Math.max(1, result.keyword_score ?? 44));
    result.readability_score = Math.min(100, Math.max(1, result.readability_score ?? 61));

    if (!Array.isArray(result.issues))    result.issues    = [];
    if (!Array.isArray(result.strengths)) result.strengths = [];

    return NextResponse.json(result);
  } catch (err) {
    console.error("[cv-check]", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
