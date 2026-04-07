import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/cv-builder";

  const supabase = await createServerSupabase();

  // PKCE flow — code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("exchangeCodeForSession error:", error.message);
  }

  // OTP / token_hash flow (used by generateLink)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("verifyOtp error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
