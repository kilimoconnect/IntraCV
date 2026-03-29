// PDF generation has moved to the client side (html2canvas + jsPDF).
// This endpoint is kept as a no-op stub to avoid 404s from any cached calls.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Server-side PDF generation is deprecated. Use client-side export." },
    { status: 410 },
  );
}
