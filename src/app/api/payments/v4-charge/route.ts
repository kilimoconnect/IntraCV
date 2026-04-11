import { NextResponse } from "next/server";

// V4 direct charge is not used — payment is handled via V3 Standard redirect.
// This route is kept as a stub to avoid 404s from any lingering references.
export async function POST() {
  return NextResponse.json(
    { error: "Direct charge not supported. Use /api/payments/cv-download-initiate or /api/payments/interview-initiate." },
    { status: 410 }
  );
}
