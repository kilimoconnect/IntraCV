"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function handleConfirm() {
      // Parse hash fragment — Supabase puts tokens here after email verification
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const error_description = params.get("error_description");

      if (error_description) {
        setStatus("error");
        setMessage(error_description);
        return;
      }

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        // Fire welcome email (best-effort, don't block redirect)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          fetch("/api/auth/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }).catch(() => {});
        }
        setStatus("success");
        setTimeout(() => router.push("/cv-builder"), 1500);
        return;
      }

      // Fallback: try code param (PKCE flow)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        // Fire welcome email (best-effort, don't block redirect)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          fetch("/api/auth/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }).catch(() => {});
        }
        setStatus("success");
        setTimeout(() => router.push("/cv-builder"), 1500);
        return;
      }

      setStatus("error");
      setMessage("Invalid or expired confirmation link.");
    }

    handleConfirm();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg overflow-hidden">
            <Image src="/fusecv-icon.png" alt="FuseCV" width={58} height={80} className="object-contain" />
          </div>
        </div>

        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <div>
              <p className="font-semibold text-slate-800">Confirming your account…</p>
              <p className="text-sm text-slate-500 mt-1">Just a moment</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-800">Email confirmed!</p>
              <p className="text-sm text-slate-500 mt-1">Redirecting you to the app…</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-semibold text-slate-800">Confirmation failed</p>
              <p className="text-sm text-slate-500 mt-1">{message || "The link may have expired."}</p>
            </div>
            <a
              href="/register"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Try signing up again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
