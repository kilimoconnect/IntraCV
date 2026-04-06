/**
 * POST /api/pdf/generate
 *
 * Accepts the CV page HTML from the client, renders it in a headless
 * Chromium browser (server-side), and returns a pixel-perfect A4 PDF.
 *
 * WHY SERVER-SIDE?
 * Client-side approaches (html2canvas, iframe print) both have device-
 * specific issues — html2canvas has font-metric drift; iframe print is
 * blocked on iOS mobile. A server-rendered PDF has none of these problems:
 *   • Headless Chrome renders identically to the visible browser preview
 *   • The PDF is a direct file download — works on every device
 *   • No print dialog, no popup permissions, no mobile quirks
 *
 * CHROMIUM STRATEGY
 * In production (Vercel / Lambda): @sparticuz/chromium provides a pre-built
 *   Chromium binary that fits in the serverless function bundle.
 * In development: falls back to the locally installed Chrome/Chromium.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // puppeteer requires Node.js runtime
export const maxDuration = 60;  // allow up to 60 s for PDF generation

/** Find the local Chrome/Chromium executable for development */
function localChromePath(): string {
  const { platform } = process;
  if (platform === "win32") {
    return (
      process.env.CHROME_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    );
  }
  if (platform === "darwin") {
    return (
      process.env.CHROME_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    );
  }
  // Linux
  return process.env.CHROME_PATH || "/usr/bin/google-chrome";
}

export async function POST(req: NextRequest) {
  let browser: import("puppeteer-core").Browser | null = null;

  try {
    const { html, filename } = (await req.json()) as {
      html: string;
      filename?: string;
    };

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "html field is required" },
        { status: 400 }
      );
    }

    const puppeteer = await import("puppeteer-core");

    // ── Choose Chromium executable ──────────────────────────────────────────
    let executablePath: string;
    let launchArgs: string[];

    if (process.env.NODE_ENV === "production" || process.env.USE_CHROMIUM_LAMBDA) {
      // Vercel / AWS Lambda — use @sparticuz/chromium
      const chromium = await import("@sparticuz/chromium");
      executablePath = await chromium.default.executablePath();
      launchArgs = chromium.default.args;
    } else {
      // Local development — use system Chrome
      executablePath = localChromePath();
      launchArgs = [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ];
    }

    // ── Launch browser ───────────────────────────────────────────────────────
    browser = await puppeteer.default.launch({
      executablePath,
      args: launchArgs,
      headless: true,
      defaultViewport: {
        width: 794,    // A4 at 96 dpi
        height: 1123,
        deviceScaleFactor: 2, // retina-quality render
      },
    });

    const page = await browser.newPage();

    // ── Render CV HTML ────────────────────────────────────────────────────────
    // waitUntil:"networkidle0" ensures Inter and all assets are fully loaded.
    // The client sends absolute font URLs so they resolve correctly here.
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });

    // ── Generate PDF ──────────────────────────────────────────────────────────
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    await browser.close();
    browser = null;

    // ── Return as file download ───────────────────────────────────────────────
    const safeName = (filename || "cv").replace(/[^a-z0-9_\-]/gi, "_");
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[pdf/generate] error:", err);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return NextResponse.json(
      { error: "PDF generation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
