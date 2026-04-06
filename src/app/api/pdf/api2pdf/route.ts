/**
 * POST /api/pdf/api2pdf
 *
 * Accepts the full CV HTML from the client, sends it to the api2pdf
 * Headless Chrome service, and streams the PDF back as a file download.
 *
 * Optionally stores the PDF in Supabase Storage (cv-pdfs bucket) and
 * updates the generated_documents record with the public PDF URL.
 *
 * Required env var:  API2PDF_KEY  (get free key at portal.api2pdf.com)
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.API2PDF_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PDF service not configured. Contact support." },
      { status: 503 }
    );
  }

  let html: string;
  let filename: string;
  let docId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await req.json();
    html = body.html;
    filename = body.filename || "CV";
    docId = body.docId;
    userId = body.userId;
    console.log(`[api2pdf] invoked — docId=${docId} userId=${userId} filename=${filename}`);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!html || typeof html !== "string") {
    return NextResponse.json({ error: "html field is required" }, { status: 400 });
  }

  // Sanitise filename — keep only alphanumeric, dash, underscore, dot
  const safeName = filename.replace(/[^a-z0-9_\-\.]/gi, "_");

  try {
    // ── Call api2pdf Headless Chrome ────────────────────────────────────────
    const Api2Pdf = (await import("api2pdf")).default;
    const client = new Api2Pdf(apiKey);

    const raw = await client.chromeHtmlToPdf(html, {
      filename: `${safeName}.pdf`,
      inline: false,        // force download, not browser-open
      options: {
        preferCSSPageSize: true,    // honour @page { size: 210mm 297mm }
        printBackground: true,      // preserve coloured sidebar / gradients
        displayHeaderFooter: false, // no Chrome header/footer chrome
        marginTop: "0mm",
        marginBottom: "0mm",
        marginLeft: "0mm",
        marginRight: "0mm",
      },
    });

    // api2pdf returns Buffer when outputBinary:true, or a JSON result object.
    if (Buffer.isBuffer(raw)) {
      return NextResponse.json(
        { error: "Unexpected binary response from api2pdf" },
        { status: 502 }
      );
    }

    const result = raw;
    const success = result.Success ?? result.success;
    const fileUrl = result.FileUrl ?? result.fileUrl;
    const apiError = result.Error ?? result.error;

    if (!success) {
      console.error("[api2pdf] generation failed:", apiError);
      return NextResponse.json(
        { error: apiError || "PDF generation failed" },
        { status: 502 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: "api2pdf did not return a file URL" },
        { status: 502 }
      );
    }

    // ── Fetch the PDF binary from api2pdf's CDN ──────────────────────────────
    const pdfRes = await fetch(fileUrl);
    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Could not retrieve generated PDF" },
        { status: 502 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // ── Store in Supabase Storage and update document record ─────────────────
    let storageStatus = "skipped";
    if (docId && userId) {
      try {
        const admin = createAdminSupabase();
        const storagePath = `${userId}/${docId}.pdf`;

        const { error: uploadError } = await admin.storage
          .from("cv-pdfs")
          .upload(storagePath, pdfBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          storageStatus = `upload-error: ${uploadError.message}`;
          console.error("[api2pdf] storage upload error:", uploadError.message);
        } else {
          const { data: urlData } = admin.storage
            .from("cv-pdfs")
            .getPublicUrl(storagePath);

          if (urlData?.publicUrl) {
            const { error: updateError } = await admin
              .from("generated_documents")
              .update({ pdf_url: urlData.publicUrl })
              .eq("id", docId)
              .eq("user_id", userId);

            if (updateError) {
              storageStatus = `db-update-error: ${updateError.message}`;
              console.error("[api2pdf] db update error:", updateError.message);
            } else {
              storageStatus = "ok";
            }
          } else {
            storageStatus = "no-public-url";
          }
        }
      } catch (storageErr) {
        storageStatus = `exception: ${storageErr instanceof Error ? storageErr.message : String(storageErr)}`;
        console.error("[api2pdf] Supabase storage error:", storageErr);
      }
    }

    console.log(`[api2pdf] storage status: ${storageStatus} | docId=${docId} | userId=${userId}`);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "X-Pdf-Stored": storageStatus,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api2pdf] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
