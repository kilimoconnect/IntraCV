import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  const supabase = await createServerSupabase();

  // PKCE flow — code exchange (Google OAuth and magic link)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const user = data.user;
      const isNewUser = !user.user_metadata?.welcome_sent;

      if (isNewUser) {
        // New Google OAuth signup — send welcome email + schedule automation flows.
        // Must be awaited before returning: Vercel terminates the serverless function
        // as soon as a response is sent, killing any unawaited async work mid-flight.
        try {
          await fetch(`${origin}/api/auth/welcome`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          });
        } catch (e) {
          console.error("[auth/callback] welcome email error:", e);
        }
        // Send new users to the CV builder to complete their profile
        return NextResponse.redirect(`${origin}/cv-builder`);
      }

      // Returning user — honour the ?next param or fall back to dashboard
      return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
    }
    console.error("exchangeCodeForSession error:", error?.message);
  }

  // OTP / token_hash flow (used by email confirmation links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!error) {
      return NextResponse.redirect(`${origin}${next ?? "/cv-builder"}`);
    }
    console.error("verifyOtp error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
