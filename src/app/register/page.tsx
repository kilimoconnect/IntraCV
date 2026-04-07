"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
import AppShell from "@/components/app-shell";
import Image from "next/image";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signUp(email, password, { full_name: fullName });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/cv-builder");
    }
  };

  return (
    <AppShell hideSidebar hideMobileNav>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
        <div className="w-full max-w-sm">
          {/* Brand mark */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md" />
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Image src="/icon.svg" alt="FuseCV" width={32} height={32} className="rounded-lg" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Get started free
            </h1>
            <p className="text-sm text-slate-500 mt-1">Create your FuseCV account in seconds</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-9 rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>
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
                    className="pl-9 rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-sm shadow-indigo-200 border-0"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
                  : <><UserPlus className="mr-2 h-4 w-4" />Create Account</>
                }
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative text-center text-xs text-slate-400 bg-white px-3 mx-auto w-fit">
                Already have an account?
              </div>
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign in instead
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
