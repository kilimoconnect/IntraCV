"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Mail, Lock, Sparkles } from "lucide-react";
import AppShell from "@/components/app-shell";
import Image from "next/image";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success the browser is redirected — no need to setGoogleLoading(false)
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setResent(true);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnconfirmed(false);
    setResent(false);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setUnconfirmed(true);
        setError("Your email isn't confirmed yet.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: pi } = await supabase
          .from("cv_personal_info")
          .select("full_name, email, career_category")
          .eq("user_id", authUser.id)
          .maybeSingle();

        // If personal info is saved the user has been through the builder — go to dashboard.
        // Field-level validation belongs in the cv-builder, not here. Repeating it on
        // every login caused an infinite loop for any account with a partially-empty
        // field (e.g. current job with null end_date, or pre-referees-change profiles).
        router.push(pi?.full_name && pi?.email ? "/dashboard" : "/cv-builder");
      } else {
        router.push("/cv-builder");
      }
    }
  };

  return (
    <AppShell hideSidebar hideMobileNav>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
        <div className="w-full max-w-sm">
          {/* Brand mark */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-[#004aad]/20 rounded-2xl blur-md" />
              <div className="relative h-20 w-20 rounded-2xl bg-[#004aad] flex items-center justify-center shadow-lg shadow-[#ff751f]/20 overflow-hidden">
                <Image src="/fusecv-icon.png" alt="FuseCV" width={58} height={80} className="object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-[#004aad]">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your FuseCV account</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 space-y-5">

            {/* Google sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative text-center text-xs text-slate-400 bg-white px-3 mx-auto w-fit">
                or sign in with email
              </div>
            </div>

            {error && (
              <div className={`rounded-xl px-4 py-3 text-sm border ${unconfirmed ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-700"}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${unconfirmed ? "bg-amber-500" : "bg-red-500"}`} />
                  {error}
                </div>
                {unconfirmed && (
                  <div className="mt-2 pl-3.5">
                    {resent ? (
                      <p className="text-xs text-emerald-700 font-medium">✓ Confirmation email resent — check your inbox</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 disabled:opacity-60"
                      >
                        {resending ? "Resending…" : "Resend confirmation email"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 rounded-xl border-slate-200 focus:border-[#00c4cc] focus:ring-[#00c4cc]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 rounded-xl border-slate-200 focus:border-[#00c4cc] focus:ring-[#00c4cc]"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-10 bg-[#ff751f] hover:bg-[#e8661a] text-white font-semibold shadow-sm shadow-[#ff751f]/20 border-0"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
                  : <><LogIn className="mr-2 h-4 w-4" />Sign In</>
                }
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative text-center text-xs text-slate-400 bg-white px-3 mx-auto w-fit">
                New to FuseCV?
              </div>
            </div>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#004aad]" />
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
