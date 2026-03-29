// ═══════════════════════════════════════════════════════════
// Puppeteer-Based PDF Generation
// ═══════════════════════════════════════════════════════════
// Receives the rendered CV HTML, launches Chromium via Puppeteer,
// and "prints" the page to a pixel-perfect A4 PDF.
//
// POST /api/pdf/generate
// Body: { html: string, pageCount: number, fullName?: string, industryCategory?: string }
// Returns: PDF binary (application/pdf)
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

// Allow up to 60s for PDF generation on Vercel
export const maxDuration = 60;

// Remote Chromium binary for Vercel/Lambda (downloaded at runtime, cached in /tmp)
const CHROMIUM_REMOTE_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar";

async function launchBrowser() {
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) {
    // Local dev: use system Chrome (set CHROME_EXECUTABLE_PATH to override)
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ||
      (process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : "/usr/bin/google-chrome");

    return puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--font-render-hinting=none"],
    });
  }

  // Vercel/serverless: use @sparticuz/chromium-min (downloads Chromium from GitHub)
  const chromium = (await import("@sparticuz/chromium-min")).default;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(CHROMIUM_REMOTE_URL),
    headless: chromium.headless as boolean,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { html, pageCount, fullName, industryCategory } = await req.json();
    if (!html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    const pages = pageCount || 1;

    // Smart file naming: Full_Name_Industry_CV_2026.pdf
    const safeName = (fullName || "CV").replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
    const industry = (industryCategory || "").charAt(0).toUpperCase() + (industryCategory || "").slice(1).toLowerCase();
    const year = new Date().getFullYear();
    const fileName = industry
      ? `${safeName}_${industry}_CV_${year}.pdf`
      : `${safeName}_CV_${year}.pdf`;

    const browser = await launchBrowser();

    const page = await browser.newPage();

    // A4 dimensions at 96 DPI: 794 × 1123 px
    // PDF uses mm: 210 × 297 mm
    await page.setViewport({ width: 794, height: 1123 * pages });

    // Set the HTML content with Paged.js for proper pagination
    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=794">
  <!-- Google Fonts -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Georgia&display=swap" />
  <!-- Paged.js polyfill for CSS Paged Media -->
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  <style>
    @page {
      size: 210mm 297mm;
      margin: 12mm 14mm 16mm 14mm;
    }
    @page :first {
      margin-top: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: white;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    /* ─── New Architect renderer: .cv-page-sheet = one A4 page ─── */
    .cv-page-sheet {
      width: 794px;
      height: 1123px;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .cv-page-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    /* ─── Legacy renderer: .cv-template continuous flow ─── */
    .cv-template {
      width: 100%;
      min-height: auto;
    }
    /* Break rules */
    .cv-section-flow > * {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    h2 {
      break-after: avoid;
      page-break-after: avoid;
    }
    [style*="break-inside"] {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    /* Page number in bottom-center (Paged.js renders @page margin boxes) */
    .pagedjs_margin-bottom-center::after {
      content: counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #94a3b8;
      font-family: 'Inter', sans-serif;
    }
    .pagedjs_first_page .pagedjs_margin-bottom-center::after {
      content: none;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    await page.setContent(fullHTML, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts?.ready);

    // Wait for Paged.js to finish pagination
    await page.waitForFunction(
      () => (window as any).PagedPolyfill?.ready || document.querySelector('.pagedjs_pages'),
      { timeout: 15000 }
    ).catch(() => {
      console.warn('[PDF Gen] Paged.js did not signal ready — proceeding with native pagination');
    });

    // Small delay for Paged.js to finalize rendering
    await new Promise((r) => setTimeout(r, 500));

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    // Return PDF as binary
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("[PDF Gen] Error:", err);
    return NextResponse.json(
      { error: err.message || "PDF generation failed" },
      { status: 500 },
    );
  }
}
