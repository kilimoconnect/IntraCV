"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui/button";
import {
  User, Wand2, BriefcaseBusiness, FolderOpen, Bot, Settings as SettingsIcon,
  LogOut, Loader2,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "profile", label: "My Profile", href: "/dashboard?tab=profile", icon: User },
  { key: "studio", label: "CV Studio", href: "/dashboard?tab=studio", icon: Wand2 },
  { key: "interview", label: "Interview Prep", href: "/dashboard?tab=interview", icon: BriefcaseBusiness },
  { key: "documents", label: "Documents", href: "/dashboard?tab=documents", icon: FolderOpen },
  { key: "assistant", label: "AI Career Assistant", href: "/dashboard?tab=assistant", icon: Bot },
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
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  // Determine active key from prop or pathname
  const currentKey = activeNav || "profile";

  // Clear spinner once the active tab matches what was clicked
  useEffect(() => {
    if (loadingKey && currentKey === loadingKey) setLoadingKey(null);
  }, [currentKey, loadingKey]);

  const handleNav = (key: string, href: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (key !== currentKey) setLoadingKey(key);
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold cursor-pointer" onClick={() => router.push(user ? "/dashboard" : "/")}>
            IntraCV
          </h1>
          <div className="flex items-center gap-3">
            {user && (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* ── Desktop Sidebar ── */}
        {!hideSidebar && <aside className="hidden md:flex flex-col w-56 shrink-0 border-r bg-white min-h-[calc(100vh-3.5rem)] p-3 gap-1 sticky top-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key, item.href)}
                disabled={loadingKey === item.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : loadingKey === item.key
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {loadingKey === item.key ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                {item.label}
              </button>
            );
          })}
        </aside>}

        {/* ── Mobile Bottom Nav ── */}
        {!hideMobileNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 px-1 py-1.5 flex gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key, item.href)}
                disabled={loadingKey === item.key}
                className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground"
                  : loadingKey === item.key ? "bg-accent text-foreground"
                  : "text-muted-foreground"
                }`}
              >
                {loadingKey === item.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {item.label.split(" ")[0]}
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
