import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");

// ─── Custom page renderer that preserves horizontal layout ───
// pdf-parse's default renderer loses right-aligned text (like dates).
// This groups text items by their Y position (same line) and joins them
// left-to-right, so "Finance Manager        Jan 2019 – Present" stays on one line.
function layoutPageRenderer(pageData: any) {
  return pageData.getTextContent().then((textContent: any) => {
    const items = textContent.items;
    if (!items || items.length === 0) return "";

    // Group text items by their vertical position (Y coordinate).
    // PDF Y grows upward, so we round to cluster items on the same line.
    const LINE_TOLERANCE = 3; // px — items within 3px vertically are same line
    const lines: { y: number; items: { x: number; text: string; width: number }[] }[] = [];

    for (const item of items) {
      if (!item.str || item.str.length === 0) continue;
      const x = item.transform[4]; // horizontal position
      const y = item.transform[5]; // vertical position

      // Find existing line within tolerance
      let line = lines.find((l) => Math.abs(l.y - y) <= LINE_TOLERANCE);
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push({ x, text: item.str, width: item.width || 0 });
    }

    // Sort lines top-to-bottom (highest Y first since PDF Y is bottom-up)
    lines.sort((a, b) => b.y - a.y);

    // For each line, sort items left-to-right and join with spacing
    const outputLines: string[] = [];
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);

      let lineText = "";
      let lastEnd = 0;
      for (const item of line.items) {
        // If there's a significant horizontal gap, insert separator
        const gap = item.x - lastEnd;
        if (lineText.length > 0 && gap > 15) {
          lineText += "    "; // large gap = likely separate columns (title vs date)
        } else if (lineText.length > 0 && gap > 3) {
          lineText += " ";
        }
        lineText += item.text;
        lastEnd = item.x + item.width;
      }
      outputLines.push(lineText.trim());
    }

    return outputLines.join("\n");
  });
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
      let result;
      try {
        // Try custom layout renderer first (preserves column alignment)
        result = await pdfParse(buffer, {
          pagerender: layoutPageRenderer,
        });
      } catch {
        // Fallback to default renderer if custom one fails (e.g. certain
        // PDF structures trigger "Command token too long" in pdfjs)
        console.warn("Custom PDF renderer failed, falling back to default renderer");
        result = await pdfParse(buffer);
      }
      text = result.text;
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or Word document." },
        { status: 400 }
      );
    }

    // Clean up extracted text to preserve section/role boundaries
    // 1. Normalise various dash types to standard en-dash for date ranges
    text = text.replace(/\u2013|\u2014/g, "–");
    // 2. Collapse 3+ consecutive blank lines into 2 (preserves section gaps)
    text = text.replace(/\n{4,}/g, "\n\n\n");
    // 3. Remove trailing whitespace per line
    text = text.replace(/[ \t]+$/gm, "");
    // 4. Remove null/control chars that PDF parsers sometimes inject
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Document parse error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse document" },
      { status: 500 }
    );
  }
}
