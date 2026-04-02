import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { geminiClient } from "@/lib/gemini";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");

// ─── Gemini Visual Parser prompt ───
const GEMINI_PARSE_PROMPT = `You are a CV/resume layout parser. Analyze this PDF and convert it to clean, structured Markdown.

CRITICAL LAYOUT RULES:
1. If the CV has a SIDEBAR (left or right column), process the sidebar content FIRST, then the main body — this prevents column interleaving.
2. Use ## for section headers (e.g. ## Experience, ## Education, ## Skills).
3. Use - for bullet points under each role or section.
4. Preserve ALL dates exactly as written — never drop or reformat them.
5. Keep ALL contact details (email, phone, LinkedIn, location) exactly as written.
6. Keep ALL numbers, percentages, currency values (%, $, TZS, KSh, etc.) exactly as written.
7. For each job role: write the job title, company, and date range on the same line or adjacent lines — never separate them.
8. Do NOT summarize, truncate, combine, or rephrase any content.
9. Do NOT add any commentary or explanation — output ONLY the Markdown document.
10. Separate major sections with a blank line.

Output the complete CV as Markdown now.`;

// ─── Gemini Visual Parser: PDF → clean Markdown ───
async function parsePdfWithGemini(buffer: Buffer): Promise<string> {
  const genAI = geminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "application/pdf",
      },
    },
    GEMINI_PARSE_PROMPT,
  ]);

  const text = result.response.text();
  if (!text || text.trim().length < 50) {
    throw new Error("Gemini returned empty or too-short output");
  }
  return text;
}

// ─── Fallback: custom pdf-parse renderer that preserves horizontal layout ───
// pdf-parse's default renderer loses right-aligned text (like dates).
// This groups text items by their Y position (same line) and joins them
// left-to-right, so "Finance Manager        Jan 2019 – Present" stays on one line.
function layoutPageRenderer(pageData: any) {
  return pageData.getTextContent().then((textContent: any) => {
    const items = textContent.items;
    if (!items || items.length === 0) return "";

    const LINE_TOLERANCE = 3;
    const lines: { y: number; items: { x: number; text: string; width: number }[] }[] = [];

    for (const item of items) {
      if (!item.str || item.str.length === 0) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      let line = lines.find((l) => Math.abs(l.y - y) <= LINE_TOLERANCE);
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push({ x, text: item.str, width: item.width || 0 });
    }

    lines.sort((a, b) => b.y - a.y);

    const outputLines: string[] = [];
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
      let lineText = "";
      let lastEnd = 0;
      for (const item of line.items) {
        const gap = item.x - lastEnd;
        if (lineText.length > 0 && gap > 15) lineText += "    ";
        else if (lineText.length > 0 && gap > 3) lineText += " ";
        lineText += item.text;
        lastEnd = item.x + item.width;
      }
      outputLines.push(lineText.trim());
    }

    return outputLines.join("\n");
  });
}

async function parsePdfFallback(buffer: Buffer): Promise<string> {
  let result;
  try {
    result = await pdfParse(buffer, { pagerender: layoutPageRenderer });
  } catch {
    console.warn("Custom PDF renderer failed, falling back to default renderer");
    result = await pdfParse(buffer);
  }
  return result.text as string;
}

function cleanText(text: string): string {
  return text
    .replace(/\u2013|\u2014/g, "–")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let text: string;

    if (fileName.endsWith(".pdf")) {
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;

      if (hasGeminiKey) {
        try {
          // Step 1 — Gemini 1.5 Pro: treat PDF as a native visual document,
          // producing layout-aware Markdown that preserves sidebar order and dates.
          text = await parsePdfWithGemini(buffer);
          console.log("[parse-pdf] Gemini visual parse succeeded");
        } catch (geminiErr) {
          console.warn("[parse-pdf] Gemini failed, falling back to pdf-parse:", geminiErr);
          text = await parsePdfFallback(buffer);
        }
      } else {
        text = await parsePdfFallback(buffer);
      }
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or Word document." },
        { status: 400 }
      );
    }

    text = cleanText(text);

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Document parse error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse document" },
      { status: 500 }
    );
  }
}
