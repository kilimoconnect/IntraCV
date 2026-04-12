/**
 * POST /api/pdf/api2pdf
 *
 * Generates a PDF via api2pdf Headless Chrome, stores it in Supabase Storage,
 * creates a generated_documents record (with pdf_url), and returns the binary PDF.
 *
 * All DB/storage work uses the admin (service-role) Supabase client to bypass RLS.
 *
 * Required env vars: API2PDF_KEY, SUPABASE_SERVICE_ROLE_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

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

  // ── Auth ──
  const serverSupabase = await createServerSupabase();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let html: string;
  let filename: string;
  let userId: string | undefined;
  let docTitle: string | undefined;
  let docContent: string | undefined;
  let coverLetter: string | undefined;
  let downloadToken: string | undefined;

  try {
    const body = await req.json();
    html = body.html;
    filename = body.filename || "CV";
    userId = body.userId;
    docTitle = body.docTitle;
    docContent = body.docContent;
    coverLetter = body.coverLetter;
    downloadToken = body.downloadToken;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!html || typeof html !== "string") {
    return NextResponse.json({ error: "html field is required" }, { status: 400 });
  }

  // ── Verify one-time payment token ──
  if (!downloadToken) {
    return NextResponse.json({ error: "Payment required" }, { status: 402 });
  }

  const admin = createAdminSupabase();
  const { data: tokenRow } = await admin
    .from("cv_download_tokens")
    .select("id, used, expires_at, user_id")
    .eq("id", downloadToken)
    .single();

  if (!tokenRow) {
    return NextResponse.json({ error: "Invalid payment token" }, { status: 402 });
  }
  if (tokenRow.user_id !== user.id) {
    return NextResponse.json({ error: "Payment token does not belong to this account" }, { status: 403 });
  }
  if (tokenRow.used) {
    return NextResponse.json({ error: "Payment token already used" }, { status: 402 });
  }
  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "Payment token expired — please contact support" }, { status: 402 });
  }

  // Mark token as used atomically (only succeeds if still unused — race-condition safe)
  const { data: updatedRows } = await admin
    .from("cv_download_tokens")
    .update({ used: true })
    .eq("id", downloadToken)
    .eq("used", false)
    .select("id");

  if (!updatedRows || updatedRows.length === 0) {
    return NextResponse.json({ error: "Payment token already used" }, { status: 402 });
  }

  const safeName = filename.replace(/[^a-z0-9_\-\.]/gi, "_");

  // Helper: revert the token so the user can retry if PDF generation fails
  const revertToken = () =>
    admin.from("cv_download_tokens").update({ used: false }).eq("id", downloadToken);

  try {
    // ── Call api2pdf Headless Chrome ────────────────────────────────────────
    const Api2Pdf = (await import("api2pdf")).default;
    const client = new Api2Pdf(apiKey);

    const raw = await client.chromeHtmlToPdf(html, {
      filename: `${safeName}.pdf`,
      inline: false,
      options: {
        preferCSSPageSize: true,
        printBackground: true,
        displayHeaderFooter: false,
        marginTop: "0mm",
        marginBottom: "0mm",
        marginLeft: "0mm",
        marginRight: "0mm",
      },
    });

    if (Buffer.isBuffer(raw)) {
      await revertToken();
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
      await revertToken();
      return NextResponse.json(
        { error: apiError || "PDF generation failed" },
        { status: 502 }
      );
    }

    if (!fileUrl) {
      await revertToken();
      return NextResponse.json(
        { error: "api2pdf did not return a file URL" },
        { status: 502 }
      );
    }

    // ── Fetch PDF binary from api2pdf CDN ──────────────────────────────────
    const pdfRes = await fetch(fileUrl);
    if (!pdfRes.ok) {
      await revertToken();
      return NextResponse.json(
        { error: "Could not retrieve generated PDF" },
        { status: 502 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // ── Store in Supabase (admin client — bypasses RLS) ────────────────────
    let storageStatus = "skipped";
    if (userId) {
      try {
        const docId = crypto.randomUUID();
        const storagePath = `${userId}/${docId}.pdf`;

        // 1. Upload PDF to storage
        const { error: uploadError } = await admin.storage
          .from("cv-pdfs")
          .upload(storagePath, pdfBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          storageStatus = `upload-error: ${uploadError.message}`;
          console.error("[api2pdf] upload error:", uploadError.message);
        } else {
          // 2. Get the public URL
          const { data: urlData } = admin.storage
            .from("cv-pdfs")
            .getPublicUrl(storagePath);

          const pdfUrl = urlData?.publicUrl || null;

          // 3. Insert the document record with pdf_url already set
          if (docTitle && docContent) {
            const { error: insertError } = await admin
              .from("generated_documents")
              .insert({
                id: docId,
                user_id: userId,
                doc_type: "cv",
                title: docTitle,
                content: docContent,
                pdf_url: pdfUrl,
              });

            if (insertError) {
              storageStatus = `db-insert-error: ${insertError.message}`;
              console.error("[api2pdf] db insert error:", insertError.message);
            } else {
              storageStatus = "ok";
            }
          } else {
            storageStatus = `uploaded-no-doc-meta`;
          }

          // 4. Also save cover letter if provided
          if (coverLetter && storageStatus === "ok") {
            const clTitle = (docTitle || "CV").replace(/CV \(/, "Cover Letter (");
            await admin.from("generated_documents").insert({
              user_id: userId,
              doc_type: "cover_letter",
              title: clTitle,
              content: coverLetter,
            });
          }
        }
      } catch (storageErr) {
        storageStatus = `exception: ${storageErr instanceof Error ? storageErr.message : String(storageErr)}`;
        console.error("[api2pdf] Supabase error:", storageErr);
      }
    }

    console.log(`[api2pdf] storage status: ${storageStatus} | userId=${userId}`);

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
    // Revert token so the user can retry after an unexpected error
    if (downloadToken) await revertToken();
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
