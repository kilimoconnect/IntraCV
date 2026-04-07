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
  { key: "profile",   label: "My Profile",     href: "/dashboard?tab=profile",   icon: UserCircle2 },
  { key: "studio",    label: "CV Studio",       href: "/dashboard?tab=studio",    icon: Wand2 },
  { key: "interview", label: "Interview Prep",  href: "/dashboard?tab=interview", icon: BriefcaseBusiness },
  { key: "documents", label: "Documents",       href: "/dashboard?tab=documents", icon: FolderOpen },
  { key: "settings",  label: "Settings",        href: "/dashboard?tab=settings",  icon: SettingsIcon },
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
    const flag = localStorage.getItem("intracv-new-docs");
    setHasNewDocs(flag === "true");
  }, [currentKey]);

  useEffect(() => {
    if (currentKey === "documents") {
      localStorage.removeItem("intracv-new-docs");
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
      <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => router.push(user ? "/dashboard" : "/")}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur-sm group-hover:blur-md transition-all" />
            <Image src="/icon.svg" alt="IntraCV" width={30} height={30} className="relative rounded-lg" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            IntraCV
          </span>
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

        {/* ── Dark Desktop Sidebar ── */}
        {!hideSidebar && (
          <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#0F172A] min-h-[calc(100vh-3.5rem)] sticky top-14 h-[calc(100vh-3.5rem)]">

            {/* Brand accent bar at top */}
            <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40"
                        : isLoading
                        ? "bg-white/5 text-slate-500"
                        : "text-slate-400 hover:text-white hover:bg-white/8"
                    }`}
                    style={!isActive && !isLoading ? { '--tw-bg-opacity': '1' } as React.CSSProperties : {}}
                  >
                    {/* Active item glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/10 blur-xl" />
                    )}
                    <span className={`shrink-0 relative z-10 transition-transform duration-200 ${!isActive && !isLoading ? "group-hover:scale-110" : ""}`}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="truncate relative z-10">{item.label}</span>
                    {item.key === "documents" && hasNewDocs && !isActive && (
                      <span className="ml-auto relative flex h-2.5 w-2.5 shrink-0 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400" />
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/60 shrink-0 relative z-10" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-3 h-px bg-white/8" />

            {/* User footer */}
            {user && (
              <div className="p-3">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/6 hover:bg-white/10 transition-colors cursor-default group">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Active account</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Mobile Bottom Nav ── */}
        {!hideMobileNav && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 z-50 px-2 py-2 flex gap-1">
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
                      ? "bg-gradient-to-b from-indigo-600 to-violet-600 text-white shadow-lg"
                      : isLoading
                      ? "text-slate-600"
                      : "text-slate-400 hover:text-white hover:bg-white/8"
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
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
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
        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
