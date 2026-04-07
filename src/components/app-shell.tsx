"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import {
  UserCircle2, Wand2, BriefcaseBusiness, FolderOpen, Sparkles, Settings as SettingsIcon,
  LogOut, Loader2, LayoutDashboard,
} from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { key: "profile", label: "My Profile", href: "/dashboard?tab=profile", icon: UserCircle2 },
  { key: "studio", label: "CV Studio", href: "/dashboard?tab=studio", icon: Wand2 },
  { key: "interview", label: "Interview Prep", href: "/dashboard?tab=interview", icon: BriefcaseBusiness },
  { key: "documents", label: "Documents", href: "/dashboard?tab=documents", icon: FolderOpen },
  { key: "assistant", label: "AI Assistant", href: "/dashboard?tab=assistant", icon: Sparkles },
  { key: "settings", label: "Settings", href: "/dashboard?tab=settings", icon: SettingsIcon },
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

  // Check for new-docs badge flag
  useEffect(() => {
    const flag = localStorage.getItem("intracv-new-docs");
    setHasNewDocs(flag === "true");
  }, [currentKey]);

  // Clear badge when visiting Documents
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
    <div className="min-h-screen bg-slate-50/50 bg-mesh">
      {/* ── Header ── */}
      <header className="border-b border-slate-200/60 glass-card-strong sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
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
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 gap-1.5"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-medium">Sign out</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* ── Desktop Sidebar ── */}
        {!hideSidebar && (
          <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200/60 bg-white/80 backdrop-blur-xl min-h-[calc(100vh-3.5rem)] sticky top-14">
            {/* Nav items */}
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentKey === item.key;
                const isLoading = loadingKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key, item.href)}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left group ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/50 ring-1 ring-indigo-500/20"
                        : isLoading
                        ? "bg-slate-100 text-slate-400"
                        : "text-slate-600 hover:bg-indigo-50/50 hover:text-slate-900 nav-item-modern"
                    }`}
                  >
                    <span className={`shrink-0 transition-transform duration-150 ${isActive ? "" : "group-hover:scale-110"}`}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.key === "documents" && hasNewDocs && !isActive && (
                      <span className="ml-auto relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                      </span>
                    )}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70 shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User footer */}
            {user && (
              <div className="p-3 border-t border-slate-200/80">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/60">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {userInitial}
                  </div>
                  <p className="text-xs text-slate-500 truncate flex-1">{user.email}</p>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Mobile Bottom Nav ── */}
        {!hideMobileNav && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 glass-card-strong border-t border-slate-200/60 z-50 px-1.5 py-2 flex gap-1 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentKey === item.key;
              const isLoading = loadingKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key, item.href)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-b from-indigo-600 to-violet-600 text-white shadow-sm"
                      : isLoading
                      ? "bg-slate-100 text-slate-400"
                      : "text-slate-500 hover:bg-slate-100"
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
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
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
        <main className="flex-1 min-w-0 p-3 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
