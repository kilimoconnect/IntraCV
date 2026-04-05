"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Loader2, UserCircle2, Wand2, BriefcaseBusiness, FolderOpen, Sparkles, Settings as SettingsIcon } from "lucide-react";
import AppShell from "@/components/app-shell";
import MyProfile from "./components/my-profile";
import CvStudio from "./components/cv-studio";
import InterviewPrep from "./components/interview-prep";
import Documents from "./components/documents";
import AiAssistant from "./components/ai-assistant";
import SettingsPanel from "./components/settings";

const TAB_META: Record<string, { label: string; description: string; icon: React.ElementType; gradient: string }> = {
  profile:   { label: "My Profile",          description: "View and manage your career profile data",          icon: UserCircle2,      gradient: "from-indigo-500 to-violet-600" },
  studio:    { label: "CV Studio",           description: "Design and generate your professional CV",          icon: Wand2,            gradient: "from-violet-500 to-purple-600" },
  interview: { label: "Interview Prep",      description: "Practice with AI-generated interview questions",    icon: BriefcaseBusiness,gradient: "from-blue-500 to-indigo-600" },
  documents: { label: "Documents",           description: "Access and download your saved CVs and letters",   icon: FolderOpen,       gradient: "from-emerald-500 to-teal-600" },
  assistant: { label: "AI Career Assistant", description: "Get personalised career advice powered by AI",      icon: Sparkles,         gradient: "from-amber-500 to-orange-600" },
  settings:  { label: "Settings",            description: "Manage your account and CV preferences",           icon: SettingsIcon,     gradient: "from-slate-500 to-slate-700" },
};

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const activeTab = searchParams.get("tab") || "profile";
  const [tabLoading, setTabLoading] = useState(false);
  const [visibleTab, setVisibleTab] = useState(activeTab);

  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [declaration, setDeclaration] = useState<any>(null);
  const [keyAchievements, setKeyAchievements] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [boardRoles, setBoardRoles] = useState<any[]>([]);
  const [executiveTraining, setExecutiveTraining] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [volunteer, setVolunteer] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Move hasData calculation here after all state variables are declared
  const hasData = personalInfo || summary || experiences.length || education.length || skills.length;

  useEffect(() => {
    if (!loading && !hasData && user) {
      router.push("/cv-builder");
    }
  }, [loading, hasData, user, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      const [piRes, sumRes, expRes, eduRes, skillRes, certRes, langRes, refRes, declRes,
             achRes, awardsRes, memRes, projRes, brRes, etRes, pubRes, toolRes, volRes] =
        await Promise.all([
          supabase.from("cv_personal_info").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("cv_summary").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("cv_experiences").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_education").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_skills").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_certifications").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_languages").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_referees").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_declarations").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("cv_key_achievements").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_awards").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_memberships").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_projects").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_board_roles").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_executive_training").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_publications").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_tools").select("*").eq("user_id", user.id).order("sort_order"),
          supabase.from("cv_volunteer").select("*").eq("user_id", user.id).order("sort_order"),
        ]);

      // Map Supabase snake_case → camelCase so downstream components get the expected shape
      if (piRes.data) {
        setPersonalInfo({
          fullName: piRes.data.full_name || "",
          email: piRes.data.email || "",
          phone: piRes.data.phone || "",
          location: piRes.data.location || "",
          headline: piRes.data.headline || "",
          tagline: piRes.data.tagline || "",
          linkedin: piRes.data.linkedin || "",
          website: piRes.data.website || "",
        });
      }
      setSummary(sumRes.data?.summary || "");
      setExperiences((expRes.data || []).map((e: any) => ({
        title: e.title || "",
        company: e.company || "",
        location: e.location || "",
        startDate: e.start_date || "",
        endDate: e.end_date || "",
        description: e.description || "",
      })));
      setEducation((eduRes.data || []).map((e: any) => ({
        degree: e.degree || "",
        institution: e.institution || "",
        year: e.year || "",
        description: e.description || "",
      })));
      setSkills((skillRes.data || []).map((s: any) => ({
        name: s.name || "",
        category: s.category || "",
      })));
      setCertifications((certRes.data || []).map((c: any) => ({
        name: c.name || "",
        issuer: c.issuer || "",
        year: c.year || "",
      })));
      setLanguages((langRes.data || []).map((l: any) => ({
        name: l.name || "",
        proficiency: l.proficiency || "",
      })));
      setReferees((refRes.data || []).map((r: any) => ({
        name: r.name || "",
        title: r.title || "",
        company: r.company || "",
        phone: r.phone || "",
        email: r.email || "",
      })));
      setDeclaration(declRes.data ? {
        declaration: declRes.data.declaration || "",
        place: declRes.data.place || "",
        date: declRes.data.date || "",
      } : null);
      setKeyAchievements((achRes.data || []).map((a: any) => ({
        id: a.id, achievement: a.achievement || "",
      })).filter((a: any) => a.achievement.trim()));
      setAwards((awardsRes.data || []).map((a: any) => ({
        id: a.id, title: a.title || "", description: a.description || "",
      })).filter((a: any) => a.title.trim()));
      setMemberships((memRes.data || []).map((m: any) => ({
        id: m.id, name: m.name || "",
      })).filter((m: any) => m.name.trim()));
      setProjects((projRes.data || []).map((p: any) => ({
        name: p.name || "", description: p.description || "", tech: p.tech || "",
      })));
      setBoardRoles((brRes.data || []).map((b: any) => ({
        title: b.title || "", organization: b.organization || "",
        startDate: b.start_date || "", endDate: b.end_date || "", description: b.description || "",
      })));
      setExecutiveTraining((etRes.data || []).map((t: any) => ({
        name: t.name || "", institution: t.institution || "", year: t.year || "",
      })));
      setPublications((pubRes.data || []).map((p: any) => ({
        title: p.title || "", publisher: p.publisher || "", year: p.year || "", type: p.type || "publication",
      })));
      setTools((toolRes.data || []).map((t: any) => t.name || "").filter(Boolean));
      setVolunteer((volRes.data || []).map((v: any) => v.description || "").filter(Boolean));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Brief spinner when switching tabs
  useEffect(() => {
    if (activeTab !== visibleTab) {
      setTabLoading(true);
      const t = setTimeout(() => {
        setVisibleTab(activeTab);
        setTabLoading(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [activeTab, visibleTab]);

  // Build cvData object for studio/assistant — memoized to prevent reference churn
  // Must be before early returns (Rules of Hooks)
  const cvData = useMemo(() => ({
    personalInfo, summary, experiences, education,
    skills, certifications, languages, referees,
    declaration,
    keyAchievements, awards, memberships, projects,
    boardRoles, executiveTraining, publications,
    tools, volunteer,
  }), [personalInfo, summary, experiences, education, skills, certifications, languages, referees, declaration, keyAchievements, awards, memberships, projects, boardRoles, executiveTraining, publications, tools, volunteer]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  if (!loading && !hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell activeNav={activeTab}>
      {/* Tab Header */}
      {(() => {
        const meta = TAB_META[activeTab] || TAB_META.profile;
        const Icon = meta.icon;
        return (
          <div className="mb-6 flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm shrink-0`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{meta.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
            </div>
          </div>
        );
      })()}

      {tabLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (<>

      {visibleTab === "profile" && (
        <MyProfile
          personalInfo={personalInfo}
          summary={summary}
          experiences={experiences}
          education={education}
          skills={skills}
          certifications={certifications}
          languages={languages}
          referees={referees}
          declaration={declaration}
          keyAchievements={keyAchievements}
          awards={awards}
          memberships={memberships}
          projects={projects}
          boardRoles={boardRoles}
          execTraining={executiveTraining}
          publications={publications}
          tools={tools}
          volunteer={volunteer}
        />
      )}

      {visibleTab === "studio" && (
        <CvStudio userId={user.id} cvData={cvData} />
      )}

      {visibleTab === "interview" && (
        <InterviewPrep userId={user.id} />
      )}

      {visibleTab === "documents" && (
        <Documents userId={user.id} />
      )}

      {visibleTab === "assistant" && (
        <AiAssistant userId={user.id} cvData={cvData} />
      )}

      {visibleTab === "settings" && (
        <SettingsPanel userId={user.id} userEmail={user.email || ""} />
      )}

      </>)}
    </AppShell>
  );
}
