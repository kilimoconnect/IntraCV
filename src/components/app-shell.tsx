"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import {
  UserCircle2, Wand2, BriefcaseBusiness, FolderOpen, Settings as SettingsIcon,
  LogOut, Loader2, ChevronRight,
} from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { key: "profile",   label: "My Profile",                        subtitle: "View and edit your data",    href: "/dashboard?tab=profile",   icon: UserCircle2 },
  { key: "studio",    label: "Fix and improve your CV",           subtitle: "AI-powered CV optimization", href: "/dashboard?tab=studio",    icon: Wand2 },
  { key: "interview", label: "Practice real interview questions", subtitle: "AI mock interviews",         href: "/dashboard?tab=interview", icon: BriefcaseBusiness },
  { key: "documents", label: "Access your CV and cover letters",  subtitle: "Download your documents",    href: "/dashboard?tab=documents", icon: FolderOpen },
  { key: "settings",  label: "Settings",                          subtitle: "Account preferences",        href: "/dashboard?tab=settings",  icon: SettingsIcon },
];

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: string;
  hideMobileNav?: boolean;
  hideSidebar?: boolean;
}

export default function AppShell({ children, activeNav, hideMobileNav, hideSidebar }: AppShellProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [hasNewDocs, setHasNewDocs] = useState(false);
  const currentKey = activeNav || "profile";

  useEffect(() => {
    if (loadingKey && currentKey === loadingKey) setLoadingKey(null);
  }, [currentKey, loadingKey]);

  useEffect(() => {
    const flag = localStorage.getItem("fusecv-new-docs");
    setHasNewDocs(flag === "true");
  }, [currentKey]);

  useEffect(() => {
    if (currentKey === "documents") {
      localStorage.removeItem("fusecv-new-docs");
      setHasNewDocs(false);
    }
  }, [currentKey]);

  const handleNav = (key: string, href: string) => {
    if (!user) { router.push("/login"); return; }
    if (key !== currentKey) setLoadingKey(key);
    router.push(href);
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#F0F2F8] flex flex-col">

      {/* ── Top Header ── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50" style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)" }}>
        <button
          onClick={() => router.push(user ? "/dashboard" : "/")}
          className="flex items-center group"
        >
          <Image src="/fusecv-logo.png" alt="FuseCV" width={135} height={42} className="object-contain" />
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Sign out</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ── Desktop Sidebar ── */}
        {!hideSidebar && (
          <aside className="hidden md:flex flex-col w-64 shrink-0 min-h-[calc(100vh-3.5rem)] sticky top-14 h-[calc(100vh-3.5rem)]"
            style={{ background: "linear-gradient(180deg, #004aad 0%, #003590 100%)" }}>

            {/* Subtle top accent line */}
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)" }} />

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentKey === item.key;
                const isLoading = loadingKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key, item.href)}
                    disabled={isLoading}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group relative overflow-hidden ${
                      isActive
                        ? "bg-white text-[#004aad]"
                        : isLoading
                        ? "bg-white/10 text-white/40"
                        : "text-white/85 hover:text-white hover:bg-white/12"
                    }`}
                    style={isActive ? { boxShadow: "0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.5)" } : {}}
                  >
                    <span className={`shrink-0 mt-0.5 relative z-10 transition-transform duration-200 ${!isActive && !isLoading ? "group-hover:scale-110" : ""}`}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0 relative z-10">
                      <span className="block leading-snug break-words">{item.label}</span>
                      <span className={`block text-[11px] font-normal mt-0.5 leading-tight ${isActive ? "text-[#004aad]/60" : "text-white/55 group-hover:text-white/80"}`}>
                        {item.subtitle}
                      </span>
                    </span>
                    {item.key === "documents" && hasNewDocs && !isActive && (
                      <span className="ml-auto mt-1 relative flex h-2.5 w-2.5 shrink-0 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff751f] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff751f]" />
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="ml-auto mt-1 h-3.5 w-3.5 text-[#004aad]/50 shrink-0 relative z-10" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-3 h-px bg-white/15" />

            {/* User footer */}
            {user && (
              <div className="p-3">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-default group">
                  <div className="h-8 w-8 rounded-full bg-[#ff751f] flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ boxShadow: "0 0 0 2px rgba(255,117,31,0.35), 0 0 12px rgba(255,117,31,0.25)" }}>
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/90 truncate">{user.email}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">Active account</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Mobile Bottom Nav ── */}
        {!hideMobileNav && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#004aad] border-t border-white/10 z-50 px-2 py-2 flex gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentKey === item.key;
              const isLoading = loadingKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key, item.href)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#004aad] shadow-lg"
                      : isLoading
                      ? "text-white/40"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                  }`}
                >
                  <span className="relative">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    {item.key === "documents" && hasNewDocs && !isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff751f] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff751f]" />
                      </span>
                    )}
                  </span>
                  <span>{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Main Content ── */}
        <main className={`flex-1 min-w-0 p-4 sm:p-6 md:pb-8 overflow-y-auto ${hideMobileNav ? "pb-6" : "pb-24"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
