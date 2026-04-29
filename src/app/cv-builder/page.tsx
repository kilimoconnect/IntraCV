"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { detectCategory, type CareerCategory } from "@/lib/detect-category";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AppShell from "@/components/app-shell";
import { AiMissingDialog } from "./components/AiMissingDialog";
import {
  Upload,
  FileText,
  Loader2,
  Save,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Users,
  Sparkles,
  LogOut,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  ScrollText,
  Trophy,
  Building2,
  FolderKanban,
  Shield,
  BookMarked,
  PenLine,
  Wrench,
  Heart,
  AlertCircle,
  XCircle,
  Clock,
  Info,
  Lightbulb,
} from "lucide-react";

// ─── Types ───
interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}
interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
}
interface Skill {
  id: string;
  name: string;
  category: string;
}
interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}
interface Language {
  id: string;
  name: string;
  proficiency: string;
}
interface Referee {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
}
interface KeyAchievement {
  id: string;
  achievement: string;
}
interface Award {
  id: string;
  title: string;
  description: string;
}
interface Membership {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  description: string;
  tech: string;
}
interface BoardRole {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}
interface ExecTraining {
  id: string;
  name: string;
  institution: string;
  year: string;
}
interface Publication {
  id: string;
  title: string;
  publisher: string;
  year: string;
  type: string;
}

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// ─── Career Category System ───
interface CategoryResult {
  category: CareerCategory;
  label: string;
  color: string;
  requiredSections: { key: string; label: string }[];
  recommendedSections: { key: string; label: string }[];
}

function categorizeProfile(
  experiences: Experience[],
  education: Education[],
  boardRoles: BoardRole[],
  publications: Publication[],
  execTraining: ExecTraining[],
  skills: Skill[],
  keyAchievements: KeyAchievement[],
  certifications: Certification[],
  languages: Language[],
): CategoryResult {
  // Delegate scoring to the shared algorithm so CV Builder and CV Studio
  // always agree on the detected category.
  const category = detectCategory({
    experiences,
    education,
    boardRoles,
    publications,
    executiveTraining: execTraining,
    skills,
    keyAchievements,
    certifications,
    languages,
  });

  // ── Required & recommended sections per category ──
  const SECTIONS: Record<CareerCategory, { required: { key: string; label: string }[]; recommended: { key: string; label: string }[] }> = {
    junior: {
      required: [
        { key: "personal", label: "Personal Info" },
        { key: "summary", label: "Professional Summary" },
        { key: "experience", label: "Experience" },
        { key: "education", label: "Education" },
        { key: "skills", label: "Skills" },
        { key: "languages", label: "Languages" },
      ],
      recommended: [
        { key: "referees", label: "References" },
        { key: "certifications", label: "Professional Certifications" },
        { key: "projects", label: "Projects" },
        { key: "volunteer", label: "Volunteer Experience" },
      ],
    },
    "mid-senior": {
      required: [
        { key: "personal", label: "Personal Info" },
        { key: "summary", label: "Professional Summary" },
        { key: "experience", label: "Experience" },
        { key: "education", label: "Education" },
        { key: "skills", label: "Skills" },
        { key: "achievements", label: "Key Achievements" },
        { key: "languages", label: "Languages" },
      ],
      recommended: [
        { key: "referees", label: "References" },
        { key: "certifications", label: "Professional Certifications" },
        { key: "awards", label: "Awards & Recognition" },
        { key: "memberships", label: "Professional Memberships" },
        { key: "tools", label: "Tools & Software" },
        { key: "projects", label: "Projects" },
      ],
    },
    executive: {
      required: [
        { key: "personal", label: "Personal Info" },
        { key: "summary", label: "Professional Summary" },
        { key: "experience", label: "Experience" },
        { key: "education", label: "Education" },
        { key: "skills", label: "Skills" },
        { key: "achievements", label: "Key Achievements" },
        { key: "languages", label: "Languages" },
        { key: "boardRoles", label: "Board & Advisory Roles" },
      ],
      recommended: [
        { key: "referees", label: "References" },
        { key: "certifications", label: "Professional Certifications" },
        { key: "execTraining", label: "Executive Training" },
        { key: "publications", label: "Publications & Speaking" },
        { key: "awards", label: "Awards & Recognition" },
        { key: "memberships", label: "Professional Memberships" },
        { key: "projects", label: "Projects" },
      ],
    },
  };

  const labels: Record<CareerCategory, string> = {
    junior: "Junior",
    "mid-senior": "Mid-Senior",
    executive: "Executive",
  };
  const colors: Record<CareerCategory, string> = {
    junior: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "mid-senior": "bg-amber-50 text-amber-700 border-amber-200",
    executive: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return {
    category,
    label: labels[category],
    color: colors[category],
    requiredSections: SECTIONS[category].required,
    recommendedSections: SECTIONS[category].recommended,
  };
}

export default function CVBuilderPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <CVBuilderPage />
    </Suspense>
  );
}

function CVBuilderPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // ─── State ───
  const [step, setStep] = useState<"upload" | "edit">("upload");
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [navigatingToDashboard, setNavigatingToDashboard] = useState(false);
  const [pendingAutoSave, setPendingAutoSave] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMobileAddSection, setShowMobileAddSection] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ sections: { key: string; label: string }[]; firstKey: string } | null>(null);

  // ─── AI Missing Sections Dialog ───
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [pendingAiDialog, setPendingAiDialog] = useState(false);
  // True while saving after upload — shows loading screen before dialog opens
  const [preparingDialog, setPreparingDialog] = useState(false);
  // Only show once per browser session — ref persists across re-renders
  const aiDialogShownRef = useRef(false);
  // Trigger a save after AI section data is applied to state
  const [pendingApplySave, setPendingApplySave] = useState(false);

  // Section tab navigation
  const [activeTab, setActiveTab] = useState("personal");
  const [manuallyShown, setManuallyShown] = useState<Set<string>>(new Set());

  const SECTION_HINTS: Record<string, string> = {
    personal: "Your contact details appear at the top of every CV. Make sure your name, email, phone and LinkedIn URL are all correct — these are how recruiters reach you.",
    summary: "Write 3–5 sentences introducing yourself to the recruiter. Focus on your years of experience, core strengths, and what kind of role you are targeting.",
    experience: "List every job you have held, starting with the most recent. Each entry needs a job title, company name, start and end dates, and a description of your key responsibilities and results.",
    education: "Add your degrees, diplomas, and academic qualifications. Include the institution, the qualification name, and the year you completed it. List the most recent first.",
    skills: "List your core professional skills — things like leadership, financial modelling, project management, or specific technical abilities. These act as keywords recruiters search for.",
    certifications: "Add professional licences and credentials only — e.g. PMP, ACCA, CPA, AWS Certified, NEBOSH. Do not include school leaving certificates (O-Level, A-Level, KCSE, WAEC) — those belong in Education.",
    achievements: "Highlight specific career wins and measurable results — e.g. 'Grew revenue by 40% in 12 months' or 'Led a team of 25 across 3 countries'. These are the lines that get CVs shortlisted.",
    awards: "List any formal awards, prizes, or industry recognition you have received. Include the award name and a brief description of what it was for.",
    memberships: "List the professional bodies or associations you belong to — e.g. ICPAK, CIPR, ICF, PMI, Law Society. These signal credibility in your field.",
    projects: "Describe key projects you have led or contributed to. Include the project name, what it involved, the outcome, and any tools or technologies used.",
    boardRoles: "Include any positions you hold or have held as a board member, trustee, or advisor to an organisation. These are important signals at executive level.",
    execTraining: "Add executive education programmes or leadership courses you have completed — e.g. Harvard Executive Programme, INSEAD, IMD, or similar.",
    publications: "List articles, research papers, books, or conference presentations where you are the author or contributor. These demonstrate thought leadership in your field.",
    tools: "List the software, platforms, and tools you use regularly at work — e.g. SAP, Salesforce, Microsoft Excel, AutoCAD, Xero. Be specific.",
    volunteer: "Include community service, pro bono work, or voluntary roles. This shows character and leadership beyond your day job.",
    languages: "List each language you speak and your level — e.g. Native, Fluent, Professional, Conversational. Always include your mother tongue.",
    referees: "Add at least 2 professional references — people who have managed you or worked closely with you. Include their name, title, organisation, and contact details.",
    declaration: "A signed statement confirming your CV information is accurate. This is standard practice in many East African and South Asian job markets.",
  };

  // Core sections always visible; optional sections only if they have data or user added them
  const CORE_KEYS = new Set(["personal", "summary", "experience", "education"]);
  const ALL_SECTIONS = [
    { key: "personal", label: "Personal Info", icon: User },
    { key: "summary", label: "Summary", icon: FileText },
    { key: "experience", label: "Experience", icon: Briefcase },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "skills", label: "Skills", icon: Sparkles },
    { key: "certifications", label: "Certifications", icon: Award },
    { key: "achievements", label: "Key Achievements", icon: Trophy },
    { key: "awards", label: "Awards", icon: Award },
    { key: "memberships", label: "Memberships", icon: Building2 },
    { key: "projects", label: "Projects", icon: FolderKanban },
    { key: "boardRoles", label: "Board Roles", icon: Shield },
    { key: "execTraining", label: "Exec. Training", icon: BookMarked },
    { key: "publications", label: "Publications", icon: PenLine },
    { key: "tools", label: "Tools & Software", icon: Wrench },
    { key: "volunteer", label: "Volunteer", icon: Heart },
    { key: "languages", label: "Languages", icon: Globe },
    { key: "referees", label: "Referees", icon: Users },
    { key: "declaration", label: "Declaration", icon: ScrollText },
  ] as const;

  // ─── Form Data ───
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    linkedin: "",
    website: "",
  });
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const firstExpCardRef      = useRef<HTMLDivElement>(null);
  const justAddedExpRef      = useRef(false);
  const sectionCardRef       = useRef<HTMLDivElement>(null);
  const scrollToItemIdRef    = useRef<string | null>(null);
  const lastSavedCategoryRef = useRef<string | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [keyAchievements, setKeyAchievements] = useState<KeyAchievement[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [boardRoles, setBoardRoles] = useState<BoardRole[]>([]);
  const [execTraining, setExecTraining] = useState<ExecTraining[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [declaration, setDeclaration] = useState({ declaration: "", place: "", date: "" });
  const [tools, setTools] = useState<{ name: string; company: string }[]>([]);
  const [volunteer, setVolunteer] = useState<string[]>([]);

  // ─── Hook message banner ───
  const [hookMessage, setHookMessage] = useState<{ message: string; cta_label: string } | null>(null);
  const [hookLoading, setHookLoading] = useState(false);
  const [hookDismissed, setHookDismissed] = useState(false);
  const hookFetchedRef = useRef(false);

  // ─── Load existing data from DB ───
  const loadFromDB = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
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

      let found = false;

      if (piRes.data) {
        found = true;
        setPersonalInfo({
          fullName: piRes.data.full_name || "",
          email: piRes.data.email || "",
          phone: piRes.data.phone || "",
          location: piRes.data.location || "",
          headline: piRes.data.headline || "",
          linkedin: piRes.data.linkedin || "",
          website: piRes.data.website || "",
        });
        if (piRes.data.career_category) lastSavedCategoryRef.current = piRes.data.career_category;
      }
      if (sumRes.data?.summary) {
        found = true;
        setSummary(sumRes.data.summary);
      }
      if (expRes.data && expRes.data.length > 0) {
        found = true;
        setExperiences(expRes.data.map((e: any) => ({
          id: e.id,
          title: e.title || "",
          company: e.company || "",
          location: e.location || "",
          startDate: e.start_date || "",
          endDate: e.end_date || "",
          description: e.description || "",
        })));
      }
      if (eduRes.data && eduRes.data.length > 0) {
        found = true;
        setEducation(eduRes.data.map((e: any) => ({
          id: e.id,
          degree: e.degree || "",
          institution: e.institution || "",
          year: e.year || "",
          description: e.description || "",
        })));
      }
      if (skillRes.data && skillRes.data.length > 0) {
        found = true;
        setSkills(skillRes.data.map((s: any) => ({
          id: s.id,
          name: s.name || "",
          category: s.category || "",
        })));
      }
      if (certRes.data && certRes.data.length > 0) {
        found = true;
        setCertifications(certRes.data.map((c: any) => ({
          id: c.id,
          name: c.name || "",
          issuer: c.issuer || "",
          year: c.year || "",
        })));
      }
      if (langRes.data && langRes.data.length > 0) {
        found = true;
        setLanguages(langRes.data.map((l: any) => ({
          id: l.id,
          name: l.name || "",
          proficiency: l.proficiency || "",
        })));
      }
      if (refRes.data && refRes.data.length > 0) {
        found = true;
        setReferees(refRes.data.map((r: any) => ({
          id: r.id,
          name: r.name || "",
          title: r.title || "",
          company: r.company || "",
          phone: r.phone || "",
          email: r.email || "",
        })));
      }
      if (declRes.data) {
        found = true;
        setDeclaration({
          declaration: declRes.data.declaration || "",
          place: declRes.data.place || "",
          date: declRes.data.date || "",
        });
      }
      if (achRes.data && achRes.data.length > 0) {
        found = true;
        setKeyAchievements(achRes.data.map((a: any) => ({ id: a.id, achievement: a.achievement || "" })));
      }
      if (awardsRes.data && awardsRes.data.length > 0) {
        found = true;
        setAwards(awardsRes.data.map((a: any) => ({ id: a.id, title: a.title || "", description: a.description || "" })));
      }
      if (memRes.data && memRes.data.length > 0) {
        found = true;
        setMemberships(memRes.data.map((m: any) => ({ id: m.id, name: m.name || "" })));
      }
      if (projRes.data && projRes.data.length > 0) {
        found = true;
        setProjects(projRes.data.map((p: any) => ({ id: p.id, name: p.name || "", description: p.description || "", tech: p.tech || "" })));
      }
      if (brRes.data && brRes.data.length > 0) {
        found = true;
        setBoardRoles(brRes.data.map((b: any) => ({ id: b.id, title: b.title || "", organization: b.organization || "", startDate: b.start_date || "", endDate: b.end_date || "", description: b.description || "" })));
      }
      if (etRes.data && etRes.data.length > 0) {
        found = true;
        setExecTraining(etRes.data.map((t: any) => ({ id: t.id, name: t.name || "", institution: t.institution || "", year: t.year || "" })));
      }
      if (pubRes.data && pubRes.data.length > 0) {
        found = true;
        setPublications(pubRes.data.map((p: any) => ({ id: p.id, title: p.title || "", publisher: p.publisher || "", year: p.year || "", type: p.type || "publication" })));
      }
      if (toolRes.data && toolRes.data.length > 0) {
        found = true;
        setTools(toolRes.data.map((t: any) => ({ name: t.name || "", company: t.company || "" })).filter((t: any) => t.name));
      }
      if (volRes.data && volRes.data.length > 0) {
        found = true;
        setVolunteer(volRes.data.map((v: any) => v.description || "").filter(Boolean));
      }

      if (found) {
        setHasExistingData(true);
        setStep("edit");
        setPendingAiDialog(true); // Trigger missing-sections dialog after state commits
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) loadFromDB();
  }, [user, loadFromDB]);

  // ─── Fetch hook message when entering edit step ───
  useEffect(() => {
    if (step !== "edit" || hookFetchedRef.current || !user) return;
    hookFetchedRef.current = true;
    setHookLoading(true);
    const cvSnapshot = {
      personalInfo,
      summary,
      experiences,
      education,
      skills,
      certifications,
      languages,
      referees,
      keyAchievements,
      awards,
      memberships,
      projects,
      boardRoles,
      executiveTraining: execTraining,
      publications,
      tools,
      volunteer,
    };
    fetch("/api/ai/cv-hook-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData: cvSnapshot }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.message) setHookMessage({ message: data.message, cta_label: data.cta_label });
      })
      .catch(() => { /* silent fail — banner is non-critical */ })
      .finally(() => setHookLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ─── Auto-save extracted data once React has committed the new state ───
  // After the save resolves, open the AI dialog so it always reflects the
  // freshly-persisted profile rather than in-flight state.
  useEffect(() => {
    if (!pendingAutoSave) return;
    setPendingAutoSave(false);
    saveToDatabase().then(() => {
      aiDialogShownRef.current = false; // fresh upload → always show dialog
      setPendingAiDialog(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoSave]);

  // ─── Open AI missing-sections dialog once React state is committed ───
  // Fires after upload extraction or initial load — never more than once per session.
  useEffect(() => {
    if (!pendingAiDialog) return;
    setPendingAiDialog(false);
    setPreparingDialog(false); // clear loading screen
    if (aiDialogShownRef.current) return;
    aiDialogShownRef.current = true;
    // Only open if there is actually something to fix
    if (missingRequired.length > 0 || missingRecommended.length > 0 || incompleteSections.length > 0) {
      setShowAiDialog(true);
    }
  }, [pendingAiDialog]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-save when AI section data is applied from the dialog ───
  useEffect(() => {
    if (!pendingApplySave) return;
    setPendingApplySave(false);
    saveToDatabase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingApplySave]);

  // ─── Scroll to new experience card after adding ───
  useEffect(() => {
    if (!justAddedExpRef.current) return;
    justAddedExpRef.current = false;
    if (!firstExpCardRef.current) return;
    firstExpCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    // Focus the first input (Job Title) after scroll animation
    const timer = setTimeout(() => {
      firstExpCardRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, [experiences]);

  // ─── Scroll to section card (and optionally a specific item) on goToSection ───
  useEffect(() => {
    if (scrollTrigger === 0) return;
    const capturedItemId = scrollToItemIdRef.current;
    scrollToItemIdRef.current = null;
    const outer = setTimeout(() => {
      sectionCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const inner = setTimeout(() => {
        const el = capturedItemId
          ? document.getElementById(capturedItemId)
          : sectionCardRef.current?.querySelector<HTMLElement>('[id^="cv-item-"].border-red-300');
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.querySelector<HTMLInputElement>("input.border-red-300, textarea.border-red-300")?.focus();
        } else {
          sectionCardRef.current?.querySelector<HTMLInputElement>("input, textarea")?.focus();
        }
      }, 350);
      return () => clearTimeout(inner);
    }, 300);
    return () => clearTimeout(outer);
  }, [scrollTrigger]);

  // ─── Handle ?tab= / ?section= query params ───
  useEffect(() => {
    const tab = searchParams.get("tab") || searchParams.get("section");
    if (tab && !loadingProfile) {
      setStep("edit");
      // Use goToSection so scroll + auto-add fire the same as clicking a badge
      goToSection(tab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadingProfile]);

  // ─── Handle ?strengthen=1 — open AI dialog immediately ───
  useEffect(() => {
    if (
      searchParams.get("strengthen") === "1" &&
      !loadingProfile &&
      step === "edit" &&
      (missingRequired.length > 0 || missingRecommended.length > 0 || incompleteSections.length > 0)
    ) {
      setShowAiDialog(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadingProfile, step]);

  // ─── File Upload + AI Extract ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size — Vercel serverless limit is 4.5MB
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Please upload a CV smaller than 4MB.");
      e.target.value = "";
      return;
    }

    // Schedule upload_started_no_finish — cancelled below if extraction succeeds
    if (!sessionStorage.getItem("fusecv-upload-tracked")) {
      sessionStorage.setItem("fusecv-upload-tracked", "1");
      fetch("/api/email-automation/trigger", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: "upload_started_no_finish" }),
      }).catch(() => {});
    }

    setUploading(true);
    setExtracting(false);
    setExtractionProgress(10);

    try {
      // Step 1: Parse PDF to text
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/ai/parse-pdf", { method: "POST", body: formData });
      if (parseRes.status === 413) throw new Error("File too large. Please upload a CV smaller than 4MB.");
      const parseData = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseData.error || "PDF parsing failed");

      setExtractionProgress(40);
      setUploading(false);
      setExtracting(true);

      // Step 2: AI extraction
      const extractRes = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: parseData.text }),
      });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || "AI extraction failed");

      setExtractionProgress(90);

      // Step 3: Apply extracted data to form
      const d = extractData.data;
      if (d.personalInfo) {
        setPersonalInfo({
          fullName: d.personalInfo.fullName || "",
          email: d.personalInfo.email || "",
          phone: d.personalInfo.phone || "",
          location: d.personalInfo.location || "",
          headline: d.personalInfo.headline || "",
          linkedin: d.personalInfo.linkedin || "",
          website: d.personalInfo.website || "",
        });
      }
      if (d.summary) setSummary(d.summary);
      if (d.experiences?.length) {
        setExperiences(d.experiences.map((e: any) => ({
          id: uid(), title: e.title || "", company: e.company || "",
          location: e.location || "",
          startDate: e.startDate || "", endDate: e.endDate || "", description: e.description || "",
        })));
      }
      if (d.education?.length) {
        setEducation(d.education.map((e: any) => ({
          id: uid(), degree: e.degree || "", institution: e.institution || "",
          year: e.year || "", description: e.description || "",
        })));
      }
      {
        const extractedSkills = (d.skills || [])
          .map((s: any) => ({ id: uid(), name: (s.name || s || "").trim(), category: s.category || "" }))
          .filter((s: any) => s.name.length > 0);

        const expertiseAsSkills = (d.areasOfExpertise || [])
          .map((a: any) => ({ id: uid(), name: (a.name || "").trim(), category: "Core" }))
          .filter((a: any) => a.name.length > 0);

        let merged = [
          ...extractedSkills,
          ...expertiseAsSkills.filter((a: any) => {
            const existingNames = new Set(extractedSkills.map((s: any) => s.name.toLowerCase()));
            return !existingNames.has(a.name.toLowerCase());
          }),
        ];

        // Fallback: if still empty, mine the summary text for short competency phrases
        // Scan ALL lines that look like a dash/bullet-separated competency list
        if (merged.length === 0 && d.summary) {
          const summaryLines = (d.summary as string).split(/\n/);
          const competencyLines = summaryLines.filter((l: string) =>
            (l.match(/[-•–]\s*[A-Z]/g) || []).length >= 2
          );
          const allItems: string[] = [];
          for (const line of competencyLines) {
            const items = line
              .split(/\s*[-–•]\s*/)
              .map((s: string) => s.replace(/[^a-zA-Z &/]/g, "").trim())
              .filter((s: string) => s.length > 3 && s.split(" ").length <= 5);
            allItems.push(...items);
          }
          if (allItems.length > 0) {
            merged = allItems.map((name: string) => ({ id: uid(), name, category: "Core" }));
          }
        }

        if (merged.length > 0) setSkills(merged);
      }
      if (d.certifications?.length) {
        setCertifications(d.certifications.map((c: any) => ({
          id: uid(), name: c.name || "", issuer: c.issuer || "", year: c.year || "",
        })));
      }
      if (d.languages?.length) {
        setLanguages(d.languages.map((l: any) => ({
          id: uid(), name: l.name || "", proficiency: l.proficiency || "",
        })));
      }
      if (d.referees?.length) {
        setReferees(d.referees.map((r: any) => ({
          id: uid(), name: r.name || "", title: r.title || "", company: r.company || "",
          phone: r.phone || "", email: r.email || "",
        })));
      }
      if (d.keyAchievements) {
        let achievements: any[] = [];
        
        if (Array.isArray(d.keyAchievements)) {
          // Handle array format - filter out empty strings and objects
          achievements = d.keyAchievements
            .filter((a: any) => {
              if (typeof a === "string") return a.trim().length > 0;
              return a && (a.achievement || "").trim().length > 0;
            })
            .map((a: any) => ({
              id: uid(), 
              achievement: typeof a === "string" ? a.trim() : (a.achievement || "").trim(),
            }));
        } else if (typeof d.keyAchievements === 'string') {
          // Handle raw text upload - split by bullet points or lines
          achievements = d.keyAchievements
            .split(/[•·▪‣⁃⬤\n\r]|(?<=\.)\s+/)
            .map((s: string) => s.replace(/^[•·▪‣⁃⬤\s]+|[0-9]+\.\s*/, '').trim())
            .filter((s: string) => s.length > 10)
            .map((achievement: string) => ({ id: uid(), achievement }));
        }
        
        setKeyAchievements(achievements);
      }
      if (d.memberships?.length) {
        setMemberships(d.memberships.filter((m: any) => m && m.trim()).map((m: any) => ({
          id: uid(), name: typeof m === "string" ? m : m.name || "",
        })));
      }
      if (d.projects?.length) {
        setProjects(d.projects.map((p: any) => ({
          id: uid(), name: p.name || "", description: p.description || "", tech: p.tech || "",
        })));
      }
      if (d.boardRoles?.length) {
        setBoardRoles(d.boardRoles.map((b: any) => ({
          id: uid(), title: b.title || "", organization: b.organization || "",
          startDate: b.startDate || "", endDate: b.endDate || "", description: b.description || "",
        })));
      }
      if (d.executiveTraining?.length) {
        setExecTraining(d.executiveTraining.map((t: any) => ({
          id: uid(), name: t.name || "", institution: t.institution || "", year: t.year || "",
        })));
      }
      if (d.publications?.length) {
        setPublications(d.publications.map((p: any) => ({
          id: uid(), title: p.title || "", publisher: p.publisher || "", year: p.year || "", type: p.type || "publication",
        })));
      }
      if (d.declaration) {
        setDeclaration({
          declaration: typeof d.declaration === "string" ? d.declaration : d.declaration.declaration || "",
          place: d.declaration.place || "",
          date: d.declaration.date || "",
        });
      }
      if (d.awards?.length) {
        setAwards(d.awards
          .filter((a: any) => a && typeof a === "object" && (a.title || "").trim())
          .map((a: any) => ({
            id: uid(), title: (a.title || "").trim(), description: (a.description || "").trim(),
          })));
      }
      if (d.tools?.length) {
        setTools(d.tools.map((t: any) => typeof t === "string" ? { name: t, company: "" } : { name: t.name || "", company: t.company || "" }).filter((t: any) => t.name));
      }
      if (d.volunteer?.length) {
        setVolunteer(d.volunteer.map((v: any) => typeof v === "string" ? v : v.description || "").filter(Boolean));
      }
      if (d.internships?.length) {
        setExperiences(prev => [
          ...prev,
          ...d.internships.map((i: any) => ({
            id: uid(), title: i.title || "", company: i.company || "",
            location: i.location || "",
            startDate: i.startDate || "", endDate: i.endDate || "", description: i.description || "",
          })),
        ]);
      }

      setExtractionProgress(100);
      setStep("edit");
      setPreparingDialog(true); // show loading screen while auto-saving before dialog opens
      setPendingAutoSave(true); // save → then opens AI dialog (see pendingAutoSave effect)

      // Upload completed successfully — cancel the abandon flow
      fetch("/api/email-automation/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: "upload_started_no_finish" }),
      }).catch(() => {});
    } catch (err: any) {
      console.error("Upload/extraction error:", err);
      toast.error(err.message || "Failed to extract CV");
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };


  // ─── Save all sections to DB — returns true on success, false on failure ───
  const saveToDatabase = async (options?: { silent?: boolean }): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to save");
      return false;
    }
    // Prevent concurrent saves — without this guard, auto-save after CV upload can race
    // with a manual save: both delete the rows, both insert, resulting in duplicates.
    if (saving) return false;
    setSaving(true);
    try {
      const now = new Date().toISOString();

      // Compute category — saved as authoritative value for CV Studio
      const detectedCareerCategory = detectCategory({
        experiences, education, boardRoles, publications,
        executiveTraining: execTraining,
        skills, keyAchievements, certifications,
        languages,
      });

      // Helper: delete all rows for a section then insert fresh ones.
      // IMPORTANT: delete MUST succeed before insert runs — if it fails and we insert
      // anyway we get duplicate rows on every save. Throw so Promise.allSettled records
      // the failure and the error toast names the section.
      const saveList = async (
        table: string,
        rows: object[],
      ) => {
        const { error: delError } = await supabase.from(table).delete().eq("user_id", user.id);
        if (delError) throw new Error(`${table} delete: ${delError.message}`);
        if (rows.length > 0) {
          const { error } = await supabase.from(table).insert(rows);
          if (error) throw new Error(`${table}: ${error.message}`);
        }
      };

      // ── All sections fire in parallel ──
      const results = await Promise.allSettled([

        // Personal info (upsert — try with career_category, fall back if column not yet migrated)
        (async () => {
          const base = {
            user_id: user.id,
            full_name: personalInfo.fullName?.trim() || null,
            email: personalInfo.email?.trim() || null,
            phone: personalInfo.phone?.trim() || null,
            location: personalInfo.location?.trim() || null,
            headline: personalInfo.headline?.trim() || null,
            linkedin: personalInfo.linkedin?.trim() || null,
            website: personalInfo.website?.trim() || null,
            updated_at: now,
          };
          const { error } = await supabase.from("cv_personal_info").upsert(
            { ...base, career_category: detectedCareerCategory },
            { onConflict: "user_id" }
          );
          if (error) {
            if (error.message?.includes("career_category") || error.code === "PGRST204") {
              // Column not yet in production — save without it
              const { error: err2 } = await supabase.from("cv_personal_info").upsert(base, { onConflict: "user_id" });
              if (err2) throw err2;
            } else {
              throw error;
            }
          }
        })(),

        // Summary (upsert)
        supabase.from("cv_summary").upsert({
          user_id: user.id, summary, updated_at: now,
        }, { onConflict: "user_id" }).then(({ error }) => { if (error) throw error; }),

        // Experiences
        saveList("cv_experiences", experiences.filter((e) => e.title?.trim()).map((e, i) => ({
          user_id: user.id,
          title: e.title.trim(),
          company: e.company?.trim() || null,
          location: e.location?.trim() || null,
          start_date: e.startDate?.trim() || null,
          // Empty endDate = current job — store as null, not empty string
          end_date: e.endDate?.trim() || null,
          description: e.description?.trim() || null,
          sort_order: i,
        }))),

        // Education
        saveList("cv_education", education.filter((e) => e.degree?.trim()).map((e, i) => ({
          user_id: user.id,
          degree: e.degree.trim(),
          institution: e.institution?.trim() || null,
          year: e.year?.trim() || null,
          description: e.description?.trim() || null,
          sort_order: i,
        }))),

        // Skills
        saveList("cv_skills", skills.filter((s) => s.name?.trim()).map((s, i) => ({
          user_id: user.id, name: s.name.trim(), category: s.category?.trim() || null, sort_order: i,
        }))),

        // Certifications
        saveList("cv_certifications", certifications.filter((c) => c.name?.trim()).map((c, i) => ({
          user_id: user.id, name: c.name.trim(), issuer: c.issuer?.trim() || null, year: c.year?.trim() || null, sort_order: i,
        }))),

        // Languages
        saveList("cv_languages", languages.filter((l) => l.name?.trim()).map((l, i) => ({
          user_id: user.id, name: l.name.trim(), proficiency: l.proficiency?.trim() || null, sort_order: i,
        }))),

        // Referees — only save entries with at least a name
        saveList("cv_referees", referees.filter((r) => r.name?.trim()).map((r, i) => ({
          user_id: user.id,
          name: r.name.trim(),
          title: r.title?.trim() || null,
          company: r.company?.trim() || null,
          phone: r.phone?.trim() || null,
          email: r.email?.trim() || null,
          sort_order: i,
        }))),

        // Declaration (upsert — skip if completely empty)
        supabase.from("cv_declarations").upsert({
          user_id: user.id,
          declaration: declaration.declaration?.trim() || null,
          place: declaration.place?.trim() || null,
          date: declaration.date?.trim() || null,
          updated_at: now,
        }, { onConflict: "user_id" }).then(({ error }) => { if (error) throw new Error(`cv_declarations: ${error.message}`); }),

        // Key achievements
        saveList("cv_key_achievements", keyAchievements.filter((a) => a.achievement?.trim()).map((a, i) => ({
          user_id: user.id, achievement: a.achievement.trim(), sort_order: i,
        }))),

        // Awards
        saveList("cv_awards", awards.filter((a) => a.title?.trim()).map((a, i) => ({
          user_id: user.id, title: a.title.trim(), description: a.description?.trim() || null, sort_order: i,
        }))),

        // Memberships
        saveList("cv_memberships", memberships.filter((m) => m.name?.trim()).map((m, i) => ({
          user_id: user.id, name: m.name.trim(), sort_order: i,
        }))),

        // Projects
        saveList("cv_projects", projects.filter((p) => p.name?.trim()).map((p, i) => ({
          user_id: user.id, name: p.name.trim(), description: p.description?.trim() || null, tech: p.tech?.trim() || null, sort_order: i,
        }))),

        // Board roles
        saveList("cv_board_roles", boardRoles.filter((b) => b.title?.trim()).map((b, i) => ({
          user_id: user.id,
          title: b.title.trim(),
          organization: b.organization?.trim() || null,
          start_date: b.startDate?.trim() || null,
          end_date: b.endDate?.trim() || null,
          description: b.description?.trim() || null,
          sort_order: i,
        }))),

        // Executive training
        saveList("cv_executive_training", execTraining.filter((t) => t.name?.trim()).map((t, i) => ({
          user_id: user.id, name: t.name.trim(), institution: t.institution?.trim() || null, year: t.year?.trim() || null, sort_order: i,
        }))),

        // Publications
        saveList("cv_publications", publications.filter((p) => p.title?.trim()).map((p, i) => ({
          user_id: user.id, title: p.title.trim(), publisher: p.publisher?.trim() || null, year: p.year?.trim() || null, type: p.type?.trim() || null, sort_order: i,
        }))),

        // Tools (try with company column; fall back if migration not yet applied)
        (async () => {
          const { error: delError } = await supabase.from("cv_tools").delete().eq("user_id", user.id);
          if (delError) console.warn("[saveList] delete failed for cv_tools:", delError.message);
          const validTools = tools.filter((t) => t.name?.trim());
          if (validTools.length === 0) return;
          const { error } = await supabase.from("cv_tools").insert(
            validTools.map((t, i) => ({ user_id: user.id, name: t.name.trim(), company: t.company?.trim() || null, sort_order: i }))
          );
          if (error) {
            if (error.message?.includes("company")) {
              const { error: err2 } = await supabase.from("cv_tools").insert(
                validTools.map((t, i) => ({ user_id: user.id, name: t.name.trim(), sort_order: i }))
              );
              if (err2) throw new Error(`cv_tools: ${err2.message}`);
            } else throw new Error(`cv_tools: ${error.message}`);
          }
        })(),

        // Volunteer
        saveList("cv_volunteer", volunteer.filter((v) => v?.trim()).map((v, i) => ({
          user_id: user.id, description: v.trim(), sort_order: i,
        }))),

        // Sync user_settings (non-blocking best-effort)
        supabase.from("user_settings").upsert({
          user_id: user.id, full_name: personalInfo.fullName, phone: personalInfo.phone,
          location: personalInfo.location, headline: personalInfo.headline,
          linkedin: personalInfo.linkedin, website: personalInfo.website, updated_at: now,
        }, { onConflict: "user_id" }),
      ]);

      // Label each promise by index so error messages identify the failing section
      const SECTION_NAMES = [
        "Personal Info", "Summary", "Experience", "Education", "Skills",
        "Certifications", "Languages", "References", "Declaration",
        "Achievements", "Awards", "Memberships", "Projects", "Board Roles",
        "Exec Training", "Publications", "Tools", "Volunteer", "Settings",
      ];

      const failedResults = results
        .map((r, i) => r.status === "rejected" ? { name: SECTION_NAMES[i] ?? `Section ${i}`, reason: (r as PromiseRejectedResult).reason } : null)
        .filter(Boolean) as { name: string; reason: any }[];

      if (failedResults.length > 0) {
        const names = failedResults.map(f => f.name).join(", ");
        failedResults.forEach(f => console.error(`[save] ${f.name} failed:`, f.reason?.message ?? f.reason));
        toast.warning(`Saved with errors in: ${names}. Check your data and try again.`);
      } else if (!options?.silent) {
        const prev = lastSavedCategoryRef.current ?? detectedCareerCategory;
        const categoryLabels: Record<string, string> = { junior: "Junior", "mid-senior": "Mid-Senior", executive: "Executive" };
        const catRank: Record<string, number> = { junior: 0, "mid-senior": 1, executive: 2 };
        if (prev !== detectedCareerCategory) {
          const upgraded = (catRank[detectedCareerCategory] ?? 0) > (catRank[prev] ?? 0);
          if (upgraded) {
            toast.success(`Profile upgraded: ${categoryLabels[prev] ?? prev} → ${categoryLabels[detectedCareerCategory] ?? detectedCareerCategory}`);
          } else {
            toast.info(`Profile recategorised: ${categoryLabels[prev] ?? prev} → ${categoryLabels[detectedCareerCategory] ?? detectedCareerCategory}`);
          }
        } else {
          toast.success("CV saved successfully!");
        }
      }
      lastSavedCategoryRef.current = detectedCareerCategory;
      setHasExistingData(true);
      return failedResults.length === 0;
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save: " + (err.message || err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete all CV data and reset to upload ───
  const deleteAllCVData = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await Promise.all([
        supabase.from("cv_personal_info").delete().eq("user_id", user.id),
        supabase.from("cv_summary").delete().eq("user_id", user.id),
        supabase.from("cv_experiences").delete().eq("user_id", user.id),
        supabase.from("cv_education").delete().eq("user_id", user.id),
        supabase.from("cv_skills").delete().eq("user_id", user.id),
        supabase.from("cv_certifications").delete().eq("user_id", user.id),
        supabase.from("cv_languages").delete().eq("user_id", user.id),
        supabase.from("cv_referees").delete().eq("user_id", user.id),
        supabase.from("cv_declarations").delete().eq("user_id", user.id),
        supabase.from("cv_key_achievements").delete().eq("user_id", user.id),
        supabase.from("cv_awards").delete().eq("user_id", user.id),
        supabase.from("cv_memberships").delete().eq("user_id", user.id),
        supabase.from("cv_projects").delete().eq("user_id", user.id),
        supabase.from("cv_board_roles").delete().eq("user_id", user.id),
        supabase.from("cv_executive_training").delete().eq("user_id", user.id),
        supabase.from("cv_publications").delete().eq("user_id", user.id),
        supabase.from("cv_tools").delete().eq("user_id", user.id),
        supabase.from("cv_volunteer").delete().eq("user_id", user.id),
        supabase.from("saved_cvs").delete().eq("user_id", user.id),
        supabase.from("generated_documents").delete().eq("user_id", user.id),
        supabase.from("ai_chat_history").delete().eq("user_id", user.id),
      ]);

      // Reset local state
      setPersonalInfo({ fullName: "", email: "", phone: "", location: "", headline: "", linkedin: "", website: "" });
      setSummary("");
      setExperiences([]);
      setEducation([]);
      setSkills([]);
      setCertifications([]);
      setLanguages([]);
      setReferees([]);
      setKeyAchievements([]);
      setAwards([]);
      setMemberships([]);
      setProjects([]);
      setBoardRoles([]);
      setExecTraining([]);
      setPublications([]);
      setDeclaration({ declaration: "", place: "", date: "" });
      setTools([]);
      setVolunteer([]);
      setHasExistingData(false);
      setActiveTab("personal");
      setStep("upload");
      setShowResetConfirm(false);
      toast.success("All CV data deleted. Upload a new CV.");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete data: " + (err.message || err));
    } finally {
      setDeleting(false);
    }
  };


  // ─── Apply AI-generated section data to the correct state setter ───
  // apiSectionKey is the key used by /api/ai/generate-missing-section
  const applyAiSectionData = (
    _sectionKey: string,
    apiSectionKey: string,
    sectionData: any,
  ) => {
    switch (apiSectionKey) {
      case "summary":
        if (sectionData.summary) setSummary(sectionData.summary);
        break;
      case "keyAchievements":
        if (Array.isArray(sectionData.keyAchievements)) {
          setKeyAchievements(
            sectionData.keyAchievements.map((a: string) => ({
              id: uid(),
              achievement: typeof a === "string" ? a : (a as any).achievement || "",
            }))
          );
        }
        break;
      case "memberships":
        if (Array.isArray(sectionData.memberships)) {
          setMemberships(
            sectionData.memberships.map((m: string) => ({ id: uid(), name: m }))
          );
        }
        break;
      case "projects":
        if (Array.isArray(sectionData.projects)) {
          setProjects(
            sectionData.projects.map((p: any) => ({
              id: uid(),
              name: p.name || "",
              description: p.description || "",
              tech: p.tech || "",
            }))
          );
        }
        break;
      case "boardRoles":
        if (Array.isArray(sectionData.boardRoles)) {
          setBoardRoles(
            sectionData.boardRoles.map((b: any) => ({
              id: uid(),
              title: b.title || "",
              organization: b.organization || "",
              startDate: b.startDate || "",
              endDate: b.endDate || "",
              description: b.description || "",
            }))
          );
        }
        break;
      case "executiveTraining":
        if (Array.isArray(sectionData.executiveTraining)) {
          setExecTraining(
            sectionData.executiveTraining.map((t: any) => ({
              id: uid(),
              name: t.name || "",
              institution: t.institution || "",
              year: t.year || "",
            }))
          );
        }
        break;
      case "publications":
        if (Array.isArray(sectionData.publications)) {
          setPublications(
            sectionData.publications.map((p: any) => ({
              id: uid(),
              title: p.title || "",
              publisher: p.publisher || "",
              year: p.year || "",
              type: p.type || "publication",
            }))
          );
        }
        break;
      case "tools":
        if (Array.isArray(sectionData.tools)) {
          setTools(
            sectionData.tools.map((t: any) => ({
              name: typeof t === "string" ? t : t.name || "",
              company: typeof t === "object" ? t.company || "" : "",
            }))
          );
        }
        break;
      case "volunteer":
        if (Array.isArray(sectionData.volunteer)) {
          setVolunteer(
            sectionData.volunteer.map((v: any) =>
              typeof v === "string" ? v : v.description || ""
            )
          );
        }
        break;
      case "languages":
        if (Array.isArray(sectionData.languages)) {
          setLanguages(
            sectionData.languages.map((l: any) => ({
              id: uid(),
              name: l.name || "",
              proficiency: l.proficiency || "",
            }))
          );
        }
        break;
      case "declaration":
        if (sectionData.declaration) {
          const d = sectionData.declaration;
          setDeclaration({
            declaration: typeof d === "string" ? d : d.declaration || "",
            place: typeof d === "object" ? d.place || "" : "",
            date: typeof d === "object" ? d.date || "" : "",
          });
        }
        break;
      // ── Inline-editor cases for non-AI sections ──────────────────────────
      case "personal":
        if (sectionData.personal) {
          const p = sectionData.personal;
          setPersonalInfo({
            fullName: p.fullName || "",
            email:    p.email    || "",
            phone:    p.phone    || "",
            location: p.location || "",
            headline: p.headline || "",
            linkedin: p.linkedin || "",
            website:  p.website  || "",
          });
        }
        break;
      case "experience":
        if (Array.isArray(sectionData.experience)) {
          setExperiences(
            sectionData.experience.map((e: any) => ({
              id:          e.id || uid(),
              title:       e.title       || "",
              company:     e.company     || "",
              location:    e.location    || "",
              startDate:   e.startDate   || "",
              endDate:     e.endDate     || "",
              description: e.description || "",
            }))
          );
        }
        break;
      case "education":
        if (Array.isArray(sectionData.education)) {
          setEducation(
            sectionData.education.map((e: any) => ({
              id:          e.id || uid(),
              degree:      e.degree      || "",
              institution: e.institution || "",
              year:        e.year        || "",
              description: e.description || "",
            }))
          );
        }
        break;
      case "skills":
        if (Array.isArray(sectionData.skills)) {
          setSkills(
            sectionData.skills.map((s: any) => ({
              id:       s.id || uid(),
              name:     s.name     || "",
              category: s.category || "",
            }))
          );
        }
        break;
      case "certifications":
        if (Array.isArray(sectionData.certifications)) {
          setCertifications(
            sectionData.certifications.map((c: any) => ({
              id:     c.id || uid(),
              name:   c.name   || "",
              issuer: c.issuer || "",
              year:   c.year   || "",
            }))
          );
        }
        break;
      case "awards":
        if (Array.isArray(sectionData.awards)) {
          setAwards(
            sectionData.awards.map((a: any) => ({
              id:          a.id || uid(),
              title:       a.title       || "",
              description: a.description || "",
            }))
          );
        }
        break;
      case "referees":
        if (Array.isArray(sectionData.referees)) {
          setReferees(
            sectionData.referees.map((r: any) => ({
              id:      r.id || uid(),
              name:    r.name    || "",
              title:   r.title   || "",
              company: r.company || "",
              phone:   r.phone   || "",
              email:   r.email   || "",
            }))
          );
        }
        break;
    }
    // Ensure the section becomes visible in the sidebar
    setManuallyShown((prev) => new Set([...prev, _sectionKey]));
  };

  // ─── Loading state ───
  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  // Helper: count filled items for a section (for the sidebar badges)
  const sectionCounts: Record<string, number> = {
    personal: personalInfo.fullName ? 1 : 0,
    summary: summary ? 1 : 0,
    experience: experiences.length,
    education: education.length,
    skills: skills.length,
    certifications: certifications.length,
    achievements: keyAchievements.length,
    awards: awards.length,
    memberships: memberships.length,
    projects: projects.length,
    boardRoles: boardRoles.length,
    execTraining: execTraining.length,
    publications: publications.length,
    languages: languages.length,
    referees: referees.length,
    tools: tools.length,
    volunteer: volunteer.length,
    declaration: declaration.declaration ? 1 : 0,
  };

  // ─── Helper: Check if a section has content ───
  const sectionHasContent = (key: string): boolean => {
    switch (key) {
      case "personal": return !!(personalInfo.fullName && personalInfo.email);
      case "summary": return summary.trim().length > 10;
      case "experience": return experiences.length > 0;
      case "education": return education.length > 0;
      case "skills": return skills.length > 0;
      case "certifications": return certifications.length > 0;
      case "achievements": return keyAchievements.some(a => a.achievement && a.achievement.trim().length > 0);
      case "awards": return awards.some(a => a.title && a.title.trim().length > 0);
      case "memberships": return memberships.length > 0;
      case "projects": return projects.length > 0;
      case "boardRoles": return boardRoles.length > 0;
      case "execTraining": return execTraining.length > 0;
      case "publications": return publications.length > 0;
      case "tools": return tools.length > 0;
      case "volunteer": return volunteer.length > 0;
      case "languages": return languages.length > 0;
      case "referees": return referees.length > 0;
      case "declaration": return declaration.declaration.trim().length > 5;
      default: return false;
    }
  };

  // ─── Per-item required field validation ───
  const REQUIRED_FIELDS: Record<string, { field: string; label: string }[]> = {
    personal: [
      { field: "fullName", label: "Full Name" },
      { field: "email", label: "Email" },
      { field: "phone", label: "Phone" },
    ],
    experience: [
      { field: "title", label: "Job Title" },
      { field: "company", label: "Company" },
      { field: "location", label: "City, Country" },
      { field: "startDate", label: "Start Date" },
      { field: "endDate", label: "End Date" },
      { field: "description", label: "Description" },
    ],
    education: [
      { field: "degree", label: "Degree" },
      { field: "institution", label: "Institution" },
      { field: "year", label: "Year" },
    ],
    skills: [{ field: "name", label: "Skill Name" }],
    certifications: [{ field: "name", label: "Name" }],
    languages: [{ field: "name", label: "Language" }, { field: "proficiency", label: "Proficiency" }],
    referees: [{ field: "name", label: "Name" }],
    projects: [
      { field: "name", label: "Project Name" },
      { field: "description", label: "Description" },
    ],
    boardRoles: [
      { field: "title", label: "Title" },
      { field: "organization", label: "Organization" },
    ],
    execTraining: [{ field: "name", label: "Program Name" }],
    publications: [{ field: "title", label: "Title" }],
    achievements: [{ field: "achievement", label: "Achievement" }],
    awards: [{ field: "title", label: "Award Title" }, { field: "description", label: "Description" }],
    memberships: [{ field: "name", label: "Name" }],
  };

  const getItemMissing = (sectionKey: string, item: any): string[] => {
    const rules = REQUIRED_FIELDS[sectionKey];
    if (!rules) return [];
    const missing: string[] = [];
    for (const r of rules) {
      if (!item[r.field]?.toString().trim()) missing.push(r.label);
    }
    if (sectionKey === "referees" && !item.phone?.trim() && !item.email?.trim()) {
      missing.push("Phone or Email");
    }
    return missing;
  };

  // Only show optional sections that have data or were manually added
  // Use sectionCounts (strict item count) for sidebar visibility, not sectionHasContent (which is broader, for validation)
  const sectionHasData = (key: string) => (sectionCounts[key] ?? 0) > 0;

  // Also always show sections that are REQUIRED for the user's detected category
  // (so the user can see what's needed without having to manually add them first)
  const _quickYears = (() => {
    const now = new Date();
    let m = 0;
    experiences.forEach((exp) => {
      const s = exp.startDate?.trim(); if (!s) return;
      const sd = new Date(s); if (isNaN(sd.getTime())) { const ym = s.match(/\b(\d{4})\b/); if (!ym) return; sd.setFullYear(parseInt(ym[1]), 0, 1); }
      const ed = /^(present|current|now|ongoing)$/i.test(exp.endDate?.trim() || "") || !exp.endDate ? now : (() => { const d = new Date(exp.endDate); if (!isNaN(d.getTime())) return d; const ym = exp.endDate.match(/\b(\d{4})\b/); return ym ? new Date(parseInt(ym[1]), 11, 31) : now; })();
      if (ed >= sd) m += (ed.getFullYear() - sd.getFullYear()) * 12 + (ed.getMonth() - sd.getMonth());
    });
    return m / 12;
  })();
  const _quickCategory = categorizeProfile(experiences, education, boardRoles, publications, execTraining, skills, keyAchievements, certifications, languages);
  const requiredKeys = new Set(_quickCategory.requiredSections.map((s) => s.key));

  const SECTIONS = ALL_SECTIONS.filter(
    (s) => CORE_KEYS.has(s.key) || requiredKeys.has(s.key) || sectionHasData(s.key) || manuallyShown.has(s.key)
  );
  const hiddenSections = ALL_SECTIONS.filter(
    (s) => !CORE_KEYS.has(s.key) && !requiredKeys.has(s.key) && !sectionHasData(s.key) && !manuallyShown.has(s.key)
  );

  // ─── Universal date parser — handles virtually any CV date format ───
  const parseExpDate = (dateStr: string, endOfPeriod = false): Date | null => {
    if (!dateStr?.trim()) return null;
    const s = dateStr.trim().replace(/\s+/g, " ");
    // "Present" / "Current" / "Now" / "Till Date" / "To Date" / "Ongoing" / "Till Now" / "Up to date"
    if (/^(present|current|now|ongoing|till\s*(date|now)|to\s*date|up\s*to\s*date|date|today|continues?)$/i.test(s)) return new Date();
    // Standard JS parse first (handles ISO 8601, RFC 2822, "Month Day, Year", etc.)
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    // Extract 4-digit year anywhere in the string
    const yearMatch = s.match(/\b(\d{4})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    if (!year || year < 1900 || year > 2100) return null;
    // Full or abbreviated English month name anywhere: "Jan 2020", "January 2020", "2020 Jan", "Jan, 2020"
    const MONTHS: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11, january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
    const monthMatch = s.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
    if (monthMatch) {
      const month = MONTHS[monthMatch[1].toLowerCase()];
      return new Date(year, endOfPeriod ? month : month, endOfPeriod ? new Date(year, month + 1, 0).getDate() : 1);
    }
    // Numeric-only formats — extract month if present
    // "MM/YYYY" or "M/YYYY"
    const mmYYYY = s.match(/^(\d{1,2})[\/\-\.](\d{4})$/);
    if (mmYYYY) return new Date(parseInt(mmYYYY[2]), parseInt(mmYYYY[1]) - 1, 1);
    // "YYYY/MM" or "YYYY-MM" or "YYYY.MM"
    const yyyyMM = s.match(/^(\d{4})[\/\-\.](\d{1,2})$/);
    if (yyyyMM) return new Date(parseInt(yyyyMM[1]), parseInt(yyyyMM[2]) - 1, 1);
    // "DD/MM/YYYY" or "DD-MM-YYYY" or "DD.MM.YYYY"
    const ddmmyyyy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (ddmmyyyy) return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
    // "YYYY/DD/MM" or "YYYY-DD-MM"
    const yyyyddmm = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (yyyyddmm) return new Date(parseInt(yyyyddmm[1]), parseInt(yyyyddmm[3]) - 1, parseInt(yyyyddmm[2]));
    // Year only (already extracted above)
    return new Date(year, endOfPeriod ? 11 : 0, endOfPeriod ? 31 : 1);
  };

  // ─── Calculate Years of Experience ───
  const calculateYearsOfExperience = () => {
    if (!experiences || experiences.length === 0) return 0;
    const now = new Date();
    let totalMonths = 0;
    experiences.forEach((exp) => {
      const startDate = parseExpDate(exp.startDate);
      if (!startDate) return;
      const endDate = /^(present|current|now|ongoing|till\s*date|to\s*date)$/i.test(exp.endDate?.trim() || "")
        ? now
        : (parseExpDate(exp.endDate, true) ?? (!exp.endDate ? now : null));
      if (!endDate || endDate < startDate) return;
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    });
    const years = totalMonths / 12;
    return years < 1 ? "< 1" : parseFloat(years.toFixed(1));
  };

  const yearsOfExperience = calculateYearsOfExperience();

  // ─── Sections with incomplete items (for sidebar highlighting) ───
  const sectionsWithIssues = new Set<string>();
  if (getItemMissing("personal", personalInfo).length > 0) sectionsWithIssues.add("personal");
  if (!summary || summary.trim().length < 10) sectionsWithIssues.add("summary");
  experiences.forEach((e) => { if (getItemMissing("experience", e).length > 0) sectionsWithIssues.add("experience"); });
  education.forEach((e) => { if (getItemMissing("education", e).length > 0) sectionsWithIssues.add("education"); });
  skills.forEach((s) => { if (getItemMissing("skills", s).length > 0) sectionsWithIssues.add("skills"); });
  certifications.forEach((c) => { if (getItemMissing("certifications", c).length > 0) sectionsWithIssues.add("certifications"); });
  languages.forEach((l) => { if (getItemMissing("languages", l).length > 0) sectionsWithIssues.add("languages"); });
  referees.filter(r => r.name?.trim() || r.phone?.trim() || r.email?.trim()).forEach((r) => { if (getItemMissing("referees", r).length > 0) sectionsWithIssues.add("referees"); });
  keyAchievements.forEach((a) => { if (getItemMissing("achievements", a).length > 0) sectionsWithIssues.add("achievements"); });
  memberships.forEach((m) => { if (getItemMissing("memberships", m).length > 0) sectionsWithIssues.add("memberships"); });
  projects.forEach((p) => { if (getItemMissing("projects", p).length > 0) sectionsWithIssues.add("projects"); });
  boardRoles.forEach((b) => { if (getItemMissing("boardRoles", b).length > 0) sectionsWithIssues.add("boardRoles"); });
  execTraining.forEach((t) => { if (getItemMissing("execTraining", t).length > 0) sectionsWithIssues.add("execTraining"); });
  publications.forEach((p) => { if (getItemMissing("publications", p).length > 0) sectionsWithIssues.add("publications"); });
  awards.forEach((a) => { if (getItemMissing("awards", a).length > 0) sectionsWithIssues.add("awards"); });
  tools.forEach((t) => { if (!t?.name?.trim()) sectionsWithIssues.add("tools"); });
  volunteer.forEach((v) => { if (!v?.trim()) sectionsWithIssues.add("volunteer"); });

  // ─── Career Categorization ───
  const categoryResult = categorizeProfile(
    experiences, education, boardRoles, publications, execTraining,
    skills, keyAchievements, certifications, languages
  );

  
  const missingRequired = categoryResult.requiredSections.filter(s => !sectionHasContent(s.key));
  const missingRecommended = categoryResult.recommendedSections.filter(s => !sectionHasContent(s.key));

  // ─── Sections with data but incomplete required fields (for AI dialog) ───
  // E.g. experience entries missing location, languages missing proficiency.
  // Excluded: sections already in missingRequired/missingRecommended (no data at all).
  const _missingKeys = new Set([
    ...missingRequired.map((s) => s.key),
    ...missingRecommended.map((s) => s.key),
  ]);
  const _collectMissing = (items: any[], key: string): string[] =>
    [...new Set(items.flatMap((item) => getItemMissing(key, item)))];
  const incompleteSections: { key: string; label: string; missing: string[] }[] = [];
  const _tryAddIncomplete = (key: string, label: string, getMissing: () => string[]) => {
    if (_missingKeys.has(key)) return;
    const m = getMissing();
    if (m.length > 0) incompleteSections.push({ key, label, missing: m });
  };
  _tryAddIncomplete("personal", "Personal Info", () => getItemMissing("personal", personalInfo));
  _tryAddIncomplete("experience", "Experience", () => _collectMissing(experiences, "experience"));
  _tryAddIncomplete("education", "Education", () => _collectMissing(education, "education"));
  _tryAddIncomplete("skills", "Skills", () => _collectMissing(skills, "skills"));
  _tryAddIncomplete("certifications", "Certifications", () => _collectMissing(certifications, "certifications"));
  _tryAddIncomplete("languages", "Languages", () => _collectMissing(languages, "languages"));
  _tryAddIncomplete("referees", "References", () =>
    _collectMissing(referees.filter((r) => r.name?.trim()), "referees")
  );
  _tryAddIncomplete("achievements", "Key Achievements", () => _collectMissing(keyAchievements, "achievements"));
  _tryAddIncomplete("awards", "Awards", () => _collectMissing(awards, "awards"));
  _tryAddIncomplete("memberships", "Memberships", () => _collectMissing(memberships, "memberships"));
  _tryAddIncomplete("projects", "Projects", () => _collectMissing(projects, "projects"));
  _tryAddIncomplete("boardRoles", "Board Roles", () => _collectMissing(boardRoles, "boardRoles"));
  _tryAddIncomplete("execTraining", "Exec. Training", () => _collectMissing(execTraining, "execTraining"));
  _tryAddIncomplete("publications", "Publications", () => _collectMissing(publications, "publications"));

  // Navigate to a section and add one blank item if the section is currently empty.
  const goToSection = (key: string) => {
    if (!manuallyShown.has(key)) setManuallyShown(prev => new Set([...prev, key]));
    setActiveTab(key);
    setScrollTrigger(t => t + 1);
    switch (key) {
      case "experience":
        if (experiences.length === 0) { justAddedExpRef.current = true; setExperiences([{ id: uid(), title: "", company: "", location: "", startDate: "", endDate: "", description: "" }]); }
        break;
      case "education":
        if (education.length === 0) setEducation([{ id: uid(), degree: "", institution: "", year: "", description: "" }]);
        break;
      case "skills":
        if (skills.length === 0) setSkills([{ id: uid(), name: "", category: "" }]);
        break;
      case "certifications":
        if (certifications.length === 0) setCertifications([{ id: uid(), name: "", issuer: "", year: "" }]);
        break;
      case "languages":
        if (languages.length === 0) setLanguages([{ id: uid(), name: "", proficiency: "" }]);
        break;
      case "referees":
        if (referees.length === 0) setReferees([{ id: uid(), name: "", title: "", company: "", phone: "", email: "" }]);
        break;
      case "achievements":
        if (keyAchievements.length === 0) setKeyAchievements([{ id: uid(), achievement: "" }]);
        break;
      case "awards":
        if (awards.length === 0) setAwards([{ id: uid(), title: "", description: "" }]);
        break;
      case "memberships":
        if (memberships.length === 0) setMemberships([{ id: uid(), name: "" }]);
        break;
      case "projects":
        if (projects.length === 0) setProjects([{ id: uid(), name: "", description: "", tech: "" }]);
        break;
      case "boardRoles":
        if (boardRoles.length === 0) setBoardRoles([{ id: uid(), title: "", organization: "", startDate: "", endDate: "", description: "" }]);
        break;
      case "execTraining":
        if (execTraining.length === 0) setExecTraining([{ id: uid(), name: "", institution: "", year: "" }]);
        break;
      case "publications":
        if (publications.length === 0) setPublications([{ id: uid(), title: "", publisher: "", year: "", type: "publication" }]);
        break;
      case "tools":
        if (tools.length === 0) setTools([{ name: "", company: "" }]);
        break;
      case "volunteer":
        if (volunteer.length === 0) setVolunteer([""]);
        break;
    }
  };

  // Recomputes category from the latest React state and reveals any newly required sections
  // in the sidebar so the user sees them before saving.
  const recalculateCategoryAndUpdate = () => {
    const fresh = categorizeProfile(
      experiences, education, boardRoles, publications, execTraining,
      skills, keyAchievements, certifications, languages,
    );
    setManuallyShown(prev => {
      const next = new Set(prev);
      fresh.requiredSections.forEach(s => next.add(s.key));
      return next;
    });
    return fresh;
  };

  const handleSectionSave = async () => {
    recalculateCategoryAndUpdate();

    // Check for incomplete required fields in the current section before saving
    const sectionItemMap: Record<string, { items: any[]; key: string }> = {
      experience:   { items: experiences,    key: "experience" },
      education:    { items: education,      key: "education" },
      skills:       { items: skills,         key: "skills" },
      certifications: { items: certifications, key: "certifications" },
      languages:    { items: languages,      key: "languages" },
      referees:     { items: referees,       key: "referees" },
      achievements: { items: keyAchievements, key: "achievements" },
      awards:       { items: awards,         key: "awards" },
      memberships:  { items: memberships,    key: "memberships" },
      projects:     { items: projects,       key: "projects" },
      boardRoles:   { items: boardRoles,     key: "boardRoles" },
      execTraining: { items: execTraining,   key: "execTraining" },
      publications: { items: publications,   key: "publications" },
    };

    if (currentKey === "personal") {
      const missing = getItemMissing("personal", personalInfo);
      if (missing.length > 0) {
        toast.warning(`Missing required fields: ${missing.join(", ")}`);
        setScrollTrigger(t => t + 1);
        return;
      }
    } else if (sectionItemMap[currentKey] && currentKey !== "referees") {
      // Referees is recommended — skip per-field validation so it never blocks saving.
      const { items, key } = sectionItemMap[currentKey];
      const firstIncomplete = items.find((item: any) => getItemMissing(key, item).length > 0);
      if (firstIncomplete) {
        const missing = getItemMissing(key, firstIncomplete);
        toast.warning(`Missing required fields: ${missing.join(", ")}`);
        scrollToItemIdRef.current = `cv-item-${firstIncomplete.id}`;
        setScrollTrigger(t => t + 1);
        return;
      }
    }

    await saveToDatabase();
  };

  // ─── Save & Continue (shared by top button and hook CTA) ───
  // Defined here — after missingRequired — to avoid TDZ in the dependency array.
  const handleSaveAndContinue = async () => {
    if (saving || navigatingToDashboard) return;

    // Recalculate category fresh from current state before validating
    const fresh = recalculateCategoryAndUpdate();
    const freshMissing = fresh.requiredSections.filter(s => !sectionHasContent(s.key));

    // 1. Required sections missing → jump to first one
    if (freshMissing.length > 0) {
      setValidationErrors({ sections: freshMissing.map(s => ({ key: s.key, label: s.label })), firstKey: freshMissing[0].key });
      setActiveTab(freshMissing[0].key);
      if (!manuallyShown.has(freshMissing[0].key)) {
        setManuallyShown(prev => new Set([...prev, freshMissing[0].key]));
      }
      return;
    }

    // 2. Per-item missing fields → jump to first incomplete section
    const incompleteItems: { section: string; key: string; count: number; itemId?: string }[] = [];
    const piMissing = getItemMissing("personal", personalInfo);
    if (piMissing.length > 0) incompleteItems.push({ section: "Personal Info", key: "personal", count: piMissing.length });
    experiences.forEach((exp) => { if (getItemMissing("experience", exp).length > 0) incompleteItems.push({ section: "Experience", key: "experience", count: 0, itemId: `cv-item-${exp.id}` }); });
    education.forEach((edu) => { if (getItemMissing("education", edu).length > 0) incompleteItems.push({ section: "Education", key: "education", count: 0, itemId: `cv-item-${edu.id}` }); });
    skills.forEach((s) => { if (getItemMissing("skills", s).length > 0) incompleteItems.push({ section: "Skills", key: "skills", count: 0, itemId: `cv-item-${s.id}` }); });
    certifications.forEach((c) => { if (getItemMissing("certifications", c).length > 0) incompleteItems.push({ section: "Certifications", key: "certifications", count: 0, itemId: `cv-item-${c.id}` }); });
    languages.forEach((l) => { if (getItemMissing("languages", l).length > 0) incompleteItems.push({ section: "Languages", key: "languages", count: 0, itemId: `cv-item-${l.id}` }); });
    // Referees is a recommended section — never block "Continue" due to incomplete referee fields.
    keyAchievements.forEach((a) => { if (getItemMissing("achievements", a).length > 0) incompleteItems.push({ section: "Achievements", key: "achievements", count: 0, itemId: `cv-item-${a.id}` }); });
    memberships.forEach((m) => { if (getItemMissing("memberships", m).length > 0) incompleteItems.push({ section: "Memberships", key: "memberships", count: 0, itemId: `cv-item-${m.id}` }); });
    projects.forEach((p) => { if (getItemMissing("projects", p).length > 0) incompleteItems.push({ section: "Projects", key: "projects", count: 0, itemId: `cv-item-${p.id}` }); });
    boardRoles.forEach((b) => { if (getItemMissing("boardRoles", b).length > 0) incompleteItems.push({ section: "Board Roles", key: "boardRoles", count: 0, itemId: `cv-item-${b.id}` }); });
    execTraining.forEach((t) => { if (getItemMissing("execTraining", t).length > 0) incompleteItems.push({ section: "Exec Training", key: "execTraining", count: 0, itemId: `cv-item-${t.id}` }); });
    publications.forEach((p) => { if (getItemMissing("publications", p).length > 0) incompleteItems.push({ section: "Publications", key: "publications", count: 0, itemId: `cv-item-${p.id}` }); });
    awards.forEach((a) => { if (getItemMissing("awards", a).length > 0) incompleteItems.push({ section: "Awards & Recognition", key: "awards", count: 0, itemId: `cv-item-${a.id}` }); });
    tools.forEach((t) => { if (!t?.name?.trim()) incompleteItems.push({ section: "Tools", key: "tools", count: 0 }); });
    volunteer.forEach((v) => { if (!v?.trim()) incompleteItems.push({ section: "Volunteer", key: "volunteer", count: 0 }); });

    if (incompleteItems.length > 0) {
      const uniqueSections = [...new Map(incompleteItems.map(i => [i.key, { key: i.key, label: i.section }])).values()];
      setValidationErrors({ sections: uniqueSections, firstKey: incompleteItems[0].key });
      setActiveTab(incompleteItems[0].key);
      if (!manuallyShown.has(incompleteItems[0].key)) {
        setManuallyShown(prev => new Set([...prev, incompleteItems[0].key]));
      }
      if (incompleteItems[0].itemId) scrollToItemIdRef.current = incompleteItems[0].itemId;
      setScrollTrigger(t => t + 1);
      return;
    }

    setNavigatingToDashboard(true);
    const ok = await saveToDatabase({ silent: true });
    if (ok) {
      router.push("/dashboard");
    } else {
      setNavigatingToDashboard(false);
    }
  };

  // Ensure activeTab points to a visible section
  const activeIdx = SECTIONS.findIndex((s) => s.key === activeTab);
  const safeIdx = activeIdx >= 0 ? activeIdx : 0;
  const currentKey = SECTIONS[safeIdx]?.key ?? "personal";

  // ─── Render ───
  return (
    <AppShell hideMobileNav>
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* ─── STEP: UPLOAD ─── */}
        {step === "upload" && (
          <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-center">
            <div className="w-full max-w-lg mx-auto space-y-5 px-1">

              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#004aad] shadow-lg shadow-[#ff751f]/20 mb-2">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Upload Your CV</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                  Upload a PDF or Word document and our AI will extract all sections automatically
                </p>
              </div>

              {/* Drop zone card */}
              <Card className="border-2 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <label
                    htmlFor="cv-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 sm:p-12 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors gap-3"
                  >
                    {uploading || extracting ? (
                      <>
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="font-medium text-sm sm:text-base text-center">
                          {uploading ? "Parsing document…" : "AI extracting sections…"}
                        </p>
                        <Progress value={extractionProgress} className="w-full max-w-xs mt-1" />
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-slate-500" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm sm:text-base">Click to upload PDF or Word document</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-muted-foreground/70">PDF, DOC, DOCX · max 4 MB</p>
                      </>
                    )}
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading || extracting}
                    />
                  </label>
                </CardContent>
              </Card>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Manual entry button */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-medium"
                onClick={() => {
                  setStep("edit");
                  aiDialogShownRef.current = false;
                  setPendingAiDialog(true);
                }}
              >
                Fill in manually
              </Button>

              {hasExistingData && (
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setStep("edit");
                      aiDialogShownRef.current = false;
                      setPendingAiDialog(true);
                    }}
                  >
                    Continue editing existing CV →
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STEP: EDIT (Tabbed Sections) ─── */}
        {step === "edit" && preparingDialog && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#004aad]/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#004aad] animate-spin" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-base">Saving your CV…</p>
              <p className="text-sm text-slate-500 mt-1">Almost ready — your profile will open in a moment</p>
            </div>
          </div>
        )}
        {step === "edit" && !preparingDialog && (
          <div className="space-y-4">
            {/* ── Top Save Bar ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">Edit Your CV</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Review and edit each section</p>
                </div>
                {experiences && experiences.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-[#004aad]/5 text-[#004aad] rounded-md border border-[#004aad]/20">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm font-medium">{yearsOfExperience} yrs</span>
                  </div>
                )}
                <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border text-xs sm:text-sm font-medium ${categoryResult.color}`}>
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {categoryResult.label}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 self-end sm:self-auto">
                {missingRequired.length > 0 && (
                  <p className="text-xs text-red-600 font-medium">Complete {missingRequired.length} required section{missingRequired.length > 1 ? "s" : ""} below to save</p>
                )}
                <Button
                  disabled={saving}
                  onClick={handleSaveAndContinue}
                  className="flex items-center gap-2 bg-[#ff751f] hover:bg-[#e8661a] text-white border-0"
                >
                  {(saving || navigatingToDashboard) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {navigatingToDashboard ? "Opening dashboard…" : saving ? "Saving…" : "Generate My CV →"}
                </Button>
              </div>
            </div>

            {/* ── AI Hook Message Banner ── */}
            {!hookDismissed && (hookLoading || hookMessage) && (
              <div className={`relative flex items-start gap-3 rounded-lg border px-4 py-3 text-sm
                ${hookLoading
                  ? "border-slate-200 bg-slate-50 text-slate-500 animate-pulse"
                  : "border-[#004aad]/20 bg-[#004aad]/5 text-[#0f172a]"}`}>
                {hookLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin text-slate-400" />
                    <span>Analysing your profile…</span>
                  </>
                ) : hookMessage ? (
                  <>
                    <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-[#004aad]" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{hookMessage.message}</span>
                    </div>
                    <button
                      onClick={() => setHookDismissed(true)}
                      aria-label="Dismiss"
                      className="shrink-0 text-[#004aad]/60 hover:text-[#004aad] transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>
            )}

            {/* ── CV Issues Notification Banner ── */}
            {(missingRequired.length > 0 || missingRecommended.length > 0 || incompleteSections.length > 0) && (
              <button
                type="button"
                onClick={() => setShowAiDialog(true)}
                className="w-full text-left group rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-50 hover:border-orange-300 transition-colors px-4 py-3 flex items-center gap-3"
              >
                {/* Icon */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-orange-600" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-orange-800 leading-tight">
                    {missingRequired.length > 0
                      ? `${missingRequired.length} required section${missingRequired.length !== 1 ? "s" : ""} missing`
                      : missingRecommended.length > 0
                      ? `${missingRecommended.length} recommended section${missingRecommended.length !== 1 ? "s" : ""} to add`
                      : `${incompleteSections.length} section${incompleteSections.length !== 1 ? "s" : ""} have incomplete fields`}
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5 truncate">
                    {[
                      ...missingRequired.map(s => s.label),
                      ...missingRecommended.map(s => s.label),
                      ...incompleteSections.map(s => s.label),
                    ].join(", ")}
                  </p>
                </div>

                {/* CTA */}
                <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-100 group-hover:bg-orange-200 rounded-lg px-3 py-1.5 transition-colors">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Fix
                </span>
              </button>
            )}

            
            <div className="flex gap-4 md:gap-6">
            {/* ── Sidebar Navigation ── */}
            <aside className="w-56 shrink-0 hidden md:block">
              <div className="sticky top-20 space-y-1">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const count = sectionCounts[sec.key];
                  const isActive = activeTab === sec.key;
                  const hasIssues = sectionsWithIssues.has(sec.key);
                  return (
                    <button
                      key={sec.key}
                      onClick={() => setActiveTab(sec.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : hasIssues
                          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {hasIssues && !isActive ? <AlertCircle className="h-4 w-4 shrink-0 text-red-500" /> : <Icon className="h-4 w-4 shrink-0" />}
                      <span className="flex-1 truncate">{sec.label}</span>
                      {hasIssues && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}
                      {count !== undefined && count > 0 && (
                        <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}

                {hiddenSections.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-[10px] text-muted-foreground px-3 py-1 uppercase tracking-wider">Add Section</p>
                    {hiddenSections.map((sec) => {
                      const Icon = sec.icon;
                      return (
                        <button
                          key={sec.key}
                          onClick={() => {
                            setManuallyShown((prev) => new Set(prev).add(sec.key));
                            setActiveTab(sec.key);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left text-muted-foreground/60 hover:bg-muted hover:text-foreground border border-dashed border-transparent hover:border-muted-foreground/20"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{sec.label}</span>
                          <Plus className="h-3 w-3 shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Upload New
                </Button>
                <Button
                  size="sm"
                  className="w-full mt-2 bg-[#ff751f] hover:bg-[#e8661a] text-white border-0"
                  onClick={handleSaveAndContinue}
                  disabled={saving}
                >
                  {(saving || navigatingToDashboard) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {navigatingToDashboard ? "Opening dashboard…" : saving ? "Saving…" : "Generate My CV →"}
                </Button>
              </div>
            </aside>

            {/* ── Mobile Bottom Nav Bar ── */}
            <div
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex items-center gap-2 px-3"
              style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))', paddingTop: '10px' }}
            >
              {/* Upload New */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 shrink-0"
                title="Upload New"
              >
                <Upload className="h-4 w-4" />
              </button>

              {/* Prev */}
              <button
                onClick={() => safeIdx > 0 && setActiveTab(SECTIONS[safeIdx - 1].key)}
                disabled={safeIdx === 0}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {/* Current section — tap to open full section list */}
              <button
                onClick={() => setShowMobileAddSection(true)}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-left min-w-0"
              >
                {(() => { const Icon = SECTIONS[safeIdx].icon; return <Icon className="h-4 w-4 shrink-0 text-primary" />; })()}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{SECTIONS[safeIdx].label}</p>
                  <p className="text-[10px] text-slate-400">{safeIdx + 1} of {SECTIONS.length}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Next or Save on last section */}
              {safeIdx < SECTIONS.length - 1 ? (
                <button
                  onClick={() => setActiveTab(SECTIONS[safeIdx + 1].key)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 shrink-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={async () => { setNavigatingToDashboard(true); const ok = await saveToDatabase({ silent: true }); if (ok) { router.push("/dashboard"); } else { setNavigatingToDashboard(false); } }}
                  disabled={saving}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#004aad] text-white disabled:opacity-50 shrink-0"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
              )}
            </div>

            {/* ── Mobile Section Picker Sheet ── */}
            {showMobileAddSection && (
              <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileAddSection(false)} />
                <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
                  {/* Handle */}
                  <div className="flex justify-center pt-2 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-slate-300" />
                  </div>
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                    <h3 className="font-semibold text-sm text-slate-800">All Sections</h3>
                    <button onClick={() => setShowMobileAddSection(false)} className="text-muted-foreground p-1">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Vertical section list */}
                  <div className="overflow-y-auto flex-1 p-3 space-y-1">
                    {/* Active / visible sections */}
                    {SECTIONS.map((sec) => {
                      const Icon = sec.icon;
                      const isActive = sec.key === activeTab;
                      const hasIssues = sectionsWithIssues.has(sec.key);
                      const filled = sectionHasContent(sec.key);
                      return (
                        <button
                          key={sec.key}
                          onClick={() => { setActiveTab(sec.key); setShowMobileAddSection(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : hasIssues
                              ? "bg-red-50 text-red-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1">{sec.label}</span>
                          {isActive && <Check className="h-4 w-4 shrink-0" />}
                          {!isActive && filled && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                          {!isActive && hasIssues && <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
                        </button>
                      );
                    })}
                    {/* Hidden / not-yet-added sections */}
                    {hiddenSections.length > 0 && (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-4 pt-3 pb-1">Add more sections</p>
                        {hiddenSections.map((sec) => {
                          const Icon = sec.icon;
                          return (
                            <button
                              key={sec.key}
                              onClick={() => {
                                setManuallyShown((prev) => new Set(prev).add(sec.key));
                                setActiveTab(sec.key);
                                setShowMobileAddSection(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left text-slate-400 border border-dashed border-slate-200 hover:bg-slate-50 hover:text-slate-600"
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              <span className="flex-1">{sec.label}</span>
                              <Plus className="h-4 w-4 shrink-0 text-primary" />
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Section Content ── */}
            <div className="flex-1 min-w-0 pb-24 md:pb-0">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {(() => { const Icon = SECTIONS[safeIdx].icon; return <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />; })()}
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold truncate">{SECTIONS[safeIdx].label}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Step {safeIdx + 1} of {SECTIONS.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {Object.values(sectionCounts).filter((v) => v && v > 0).length}/{SECTIONS.length} filled
                  </Badge>
                </div>
              </div>

              <div ref={sectionCardRef}><Card>
                <CardContent className="p-3 pt-4 sm:p-6 sm:pt-6">
                  {SECTION_HINTS[currentKey] && (
                    <div className="flex items-start gap-3 rounded-lg bg-[#004aad]/[0.05] border border-[#004aad]/20 px-4 py-3 mb-5">
                      <Info className="h-4 w-4 text-[#004aad] shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 leading-relaxed">{SECTION_HINTS[currentKey]}</p>
                    </div>
                  )}
                  {/* ── Personal Info ── */}
                  {currentKey === "personal" && (() => {
                    const piMissing = getItemMissing("personal", personalInfo);
                    return <div className="space-y-4">
                      {piMissing.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Missing: <strong>{piMissing.join(", ")}</strong></span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name <span className="text-red-500">*</span></Label>
                        <Input className={!personalInfo.fullName?.trim() ? "border-red-300 bg-red-50/30" : ""} value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <Input className={!personalInfo.email?.trim() ? "border-red-300 bg-red-50/30" : ""} type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone <span className="text-red-500">*</span></Label>
                        <Input className={!personalInfo.phone?.trim() ? "border-red-300 bg-red-50/30" : ""} value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Headline / Job Title</Label>
                        <Input value={personalInfo.headline} onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input value={personalInfo.linkedin} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input value={personalInfo.website} onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })} />
                      </div>
                    </div>
                    </div>;
                  })()}

                  {/* ── Summary ── */}
                  {currentKey === "summary" && (
                    <div className="space-y-3">
                      {(!summary || summary.trim().length < 10) && (
                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>A professional summary is required. Describe your experience, skills, and career goals.</span>
                        </div>
                      )}
                      <Textarea
                        rows={8}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief professional summary highlighting your key strengths, experience, and career goals..."
                        className={!summary || summary.trim().length < 10 ? "border-red-300 focus-visible:ring-red-400" : ""}
                      />
                      <p className="text-xs text-muted-foreground text-right">{summary.trim().length} characters{summary.trim().length < 100 ? " — aim for at least 100" : ""}</p>
                    </div>
                  )}

                  {/* ── Experience ── */}
                  {currentKey === "experience" && (
                    <div className="space-y-4">
                      {experiences.length > 0 && (
                        <Button variant="outline" className="w-full" onClick={() => { justAddedExpRef.current = true; setExperiences([{ id: uid(), title: "", company: "", location: "", startDate: "", endDate: "", description: "" }, ...experiences]); }}>
                          <Plus className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                      )}
                      {experiences.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No experiences added yet</p>
                      )}
                      {experiences.map((exp, i) => {
                        const expMissing = getItemMissing("experience", exp);
                        return (
                        <div key={exp.id} id={`cv-item-${exp.id}`} ref={i === 0 ? firstExpCardRef : undefined} className={`border rounded-lg p-3 sm:p-4 space-y-3 ${expMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {expMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {expMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Job Title <span className="text-red-500">*</span></Label>
                              <Input className={!exp.title?.trim() ? "border-red-300 bg-red-50/30" : ""} value={exp.title} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, title: e.target.value } : x))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Company <span className="text-red-500">*</span></Label>
                              <Input className={!exp.company?.trim() ? "border-red-300 bg-red-50/30" : ""} value={exp.company} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">City, Country <span className="text-red-500">*</span></Label>
                              <Input className={!exp.location?.trim() ? "border-red-300 bg-red-50/30" : ""} value={exp.location} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, location: e.target.value } : x))} placeholder="e.g. London, United Kingdom" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Start Date <span className="text-red-500">*</span></Label>
                              <Input className={!exp.startDate?.trim() ? "border-red-300 bg-red-50/30" : ""} value={exp.startDate} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, startDate: e.target.value } : x))} placeholder="e.g. Jan 2020" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Date <span className="text-red-500">*</span></Label>
                              <Input className={!exp.endDate?.trim() ? "border-red-300 bg-red-50/30" : ""} value={exp.endDate} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, endDate: e.target.value } : x))} placeholder="e.g. Present" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                            <Textarea className={!exp.description?.trim() ? "border-red-300 bg-red-50/30" : ""} rows={3} value={exp.description} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, description: e.target.value } : x))} />
                          </div>
                        </div>
                        );
                      })}
                      <Button variant="outline" className="w-full" onClick={() => { justAddedExpRef.current = true; setExperiences([{ id: uid(), title: "", company: "", location: "", startDate: "", endDate: "", description: "" }, ...experiences]); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                    </div>
                  )}

                  {/* ── Education ── */}
                  {currentKey === "education" && (
                    <div className="space-y-4">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setEducation([{ id: uid(), degree: "", institution: "", year: "", description: "" }, ...education])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Education
                        </Button>
                      )}
                      {education.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No education entries added yet</p>
                      )}
                      {education.map((edu, i) => {
                        const eduMissing = getItemMissing("education", edu);
                        return (
                        <div key={edu.id} id={`cv-item-${edu.id}`} className={`border rounded-lg p-3 sm:p-4 space-y-3 ${eduMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {eduMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {eduMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setEducation(education.filter((e) => e.id !== edu.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Degree <span className="text-red-500">*</span></Label>
                              <Input className={!edu.degree?.trim() ? "border-red-300 bg-red-50/30" : ""} value={edu.degree} onChange={(e) => setEducation(education.map((x) => x.id === edu.id ? { ...x, degree: e.target.value } : x))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Institution <span className="text-red-500">*</span></Label>
                              <Input className={!edu.institution?.trim() ? "border-red-300 bg-red-50/30" : ""} value={edu.institution} onChange={(e) => setEducation(education.map((x) => x.id === edu.id ? { ...x, institution: e.target.value } : x))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Year <span className="text-red-500">*</span></Label>
                              <Input className={!edu.year?.trim() ? "border-red-300 bg-red-50/30" : ""} value={edu.year} onChange={(e) => setEducation(education.map((x) => x.id === edu.id ? { ...x, year: e.target.value } : x))} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea rows={2} value={edu.description} onChange={(e) => setEducation(education.map((x) => x.id === edu.id ? { ...x, description: e.target.value } : x))} />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Skills ── */}
                  {currentKey === "skills" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setSkills([{ id: uid(), name: "", category: "" }, ...skills])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Skill
                        </Button>
                      )}
                      {skills.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No skills added yet</p>
                      )}
                      {skills.map((skill) => {
                        const skillMissing = getItemMissing("skills", skill);
                        return (
                        <div key={skill.id} id={`cv-item-${skill.id}`} className={`rounded-lg border p-3 space-y-2 ${skillMissing.length > 0 ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                              {skillMissing.length > 0 && <span className="flex items-center gap-1 text-[11px] text-red-600 shrink-0"><AlertCircle className="h-3 w-3" />Missing: {skillMissing.join(", ")}</span>}
                              <Input className={`flex-1 ${skillMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Skill name *" value={skill.name} onChange={(e) => setSkills(skills.map((s) => s.id === skill.id ? { ...s, name: e.target.value } : s))} />
                            </div>
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setSkills(skills.filter((s) => s.id !== skill.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <Input placeholder="Category (e.g. Leadership, Technical)" value={skill.category} onChange={(e) => setSkills(skills.map((s) => s.id === skill.id ? { ...s, category: e.target.value } : s))} />
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Certifications ── */}
                  {currentKey === "certifications" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setCertifications([{ id: uid(), name: "", issuer: "", year: "" }, ...certifications])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Certification
                        </Button>
                      )}
                      {certifications.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No certifications added yet</p>
                      )}
                      {certifications.map((cert) => {
                        const certMissing = getItemMissing("certifications", cert);
                        return (
                        <div key={cert.id} id={`cv-item-${cert.id}`} className={`rounded-lg border p-3 space-y-2 ${certMissing.length > 0 ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                          {certMissing.length > 0 && <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {certMissing.join(", ")}</span>}
                          <div className="flex items-center justify-between gap-2">
                            <Input className={`flex-1 ${certMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Certification name *" value={cert.name} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c))} />
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Issuing organisation" value={cert.issuer} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, issuer: e.target.value } : c))} />
                            <Input placeholder="Year" value={cert.year} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, year: e.target.value } : c))} />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Languages ── */}
                  {currentKey === "languages" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setLanguages([{ id: uid(), name: "", proficiency: "" }, ...languages])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Language
                        </Button>
                      )}
                      {languages.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No languages added yet</p>
                      )}
                      {languages.map((lang) => {
                        const langMissing = getItemMissing("languages", lang);
                        return (
                        <div key={lang.id} id={`cv-item-${lang.id}`} className={`rounded-lg border p-3 space-y-2 ${langMissing.length > 0 ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                          {langMissing.length > 0 && <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {langMissing.join(", ")}</span>}
                          <div className="flex items-center justify-between gap-2">
                            <Input className={`flex-1 ${langMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Language *" value={lang.name} onChange={(e) => setLanguages(languages.map((l) => l.id === lang.id ? { ...l, name: e.target.value } : l))} />
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setLanguages(languages.filter((l) => l.id !== lang.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <Input className={!lang.proficiency?.trim() ? "border-red-300 bg-red-50/30" : ""} placeholder="Proficiency (e.g. Fluent, Native, Conversational) *" value={lang.proficiency} onChange={(e) => setLanguages(languages.map((l) => l.id === lang.id ? { ...l, proficiency: e.target.value } : l))} />
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Referees ── */}
                  {currentKey === "referees" && (
                    <div className="space-y-4">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setReferees([{ id: uid(), name: "", title: "", company: "", phone: "", email: "" }, ...referees])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Referee
                        </Button>
                      )}
                      {referees.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No referees added yet</p>
                      )}
                      {referees.map((ref, i) => {
                        const refMissing = getItemMissing("referees", ref);
                        return (
                        <div key={ref.id} id={`cv-item-${ref.id}`} className={`border rounded-lg p-3 sm:p-4 space-y-3 ${refMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {refMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {refMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setReferees(referees.filter((r) => r.id !== ref.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                              <Input className={!ref.name?.trim() ? "border-red-300 bg-red-50/30" : ""} value={ref.name} onChange={(e) => setReferees(referees.map((r) => r.id === ref.id ? { ...r, name: e.target.value } : r))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input value={ref.title} onChange={(e) => setReferees(referees.map((r) => r.id === ref.id ? { ...r, title: e.target.value } : r))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Company</Label>
                              <Input value={ref.company} onChange={(e) => setReferees(referees.map((r) => r.id === ref.id ? { ...r, company: e.target.value } : r))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Phone</Label>
                              <Input className={!ref.phone?.trim() && !ref.email?.trim() ? "border-red-300 bg-red-50/30" : ""} value={ref.phone} onChange={(e) => setReferees(referees.map((r) => r.id === ref.id ? { ...r, phone: e.target.value } : r))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Email</Label>
                              <Input className={!ref.phone?.trim() && !ref.email?.trim() ? "border-red-300 bg-red-50/30" : ""} value={ref.email} onChange={(e) => setReferees(referees.map((r) => r.id === ref.id ? { ...r, email: e.target.value } : r))} />
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Key Achievements ── */}
                  {currentKey === "achievements" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setKeyAchievements([{ id: uid(), achievement: "" }, ...keyAchievements])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Achievement
                        </Button>
                      )}
                      {keyAchievements.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No achievements added yet</p>
                      )}
                      {keyAchievements.map((ach) => {
                        const achMissing = getItemMissing("achievements", ach);
                        return (
                        <div key={ach.id} id={`cv-item-${ach.id}`} className={`rounded-lg border p-2 space-y-1 ${achMissing.length > 0 ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                          {achMissing.length > 0 && <span className="flex items-center gap-1 text-[11px] text-red-600 px-1"><AlertCircle className="h-3 w-3" />Missing: {achMissing.join(", ")}</span>}
                          <div className="flex gap-2 items-center">
                            <Input className={`flex-1 border-0 shadow-none focus-visible:ring-0 ${achMissing.length > 0 ? "placeholder:text-red-400" : ""}`} placeholder="Key achievement or accomplishment *" value={ach.achievement} onChange={(e) => setKeyAchievements(keyAchievements.map((a) => a.id === ach.id ? { ...a, achievement: e.target.value } : a))} />
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setKeyAchievements(keyAchievements.filter((a) => a.id !== ach.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Awards ── */}
                  {currentKey === "awards" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setAwards([{ id: uid(), title: "", description: "" }, ...awards])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Award
                        </Button>
                      )}
                      {awards.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No awards added yet</p>
                      )}
                      {awards.map((award, i) => {
                        const awardMissing = getItemMissing("awards", award);
                        return (
                        <div key={award.id} id={`cv-item-${award.id}`} className={`border rounded-lg p-4 space-y-3 ${awardMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {awardMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {awardMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setAwards(awards.filter((a) => a.id !== award.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Award Title <span className="text-red-500">*</span></Label>
                            <Input className={!award.title?.trim() ? "border-red-300 bg-red-50/30" : ""} placeholder="e.g. Employee of the Year" value={award.title} onChange={(e) => setAwards(awards.map((a) => a.id === award.id ? { ...a, title: e.target.value } : a))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                            <Textarea className={!award.description?.trim() ? "border-red-300 bg-red-50/30" : ""} placeholder="Brief description of the award" value={award.description} onChange={(e) => setAwards(awards.map((a) => a.id === award.id ? { ...a, description: e.target.value } : a))} rows={2} />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Memberships ── */}
                  {currentKey === "memberships" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setMemberships([{ id: uid(), name: "" }, ...memberships])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Membership
                        </Button>
                      )}
                      {memberships.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No memberships added yet</p>
                      )}
                      {memberships.map((mem) => {
                        const memMissing = getItemMissing("memberships", mem);
                        return (
                        <div key={mem.id} id={`cv-item-${mem.id}`} className={`rounded-lg border p-2 space-y-1 ${memMissing.length > 0 ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                          {memMissing.length > 0 && <span className="flex items-center gap-1 text-[11px] text-red-600 px-1"><AlertCircle className="h-3 w-3" />Missing: {memMissing.join(", ")}</span>}
                          <div className="flex gap-2 items-center">
                            <Input className={`flex-1 border-0 shadow-none focus-visible:ring-0 ${memMissing.length > 0 ? "placeholder:text-red-400 border-red-300 bg-red-50/30" : ""}`} placeholder="Professional membership or affiliation *" value={mem.name} onChange={(e) => setMemberships(memberships.map((m) => m.id === mem.id ? { ...m, name: e.target.value } : m))} />
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setMemberships(memberships.filter((m) => m.id !== mem.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Projects ── */}
                  {currentKey === "projects" && (
                    <div className="space-y-4">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setProjects([{ id: uid(), name: "", description: "", tech: "" }, ...projects])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Project
                        </Button>
                      )}
                      {projects.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No projects added yet</p>
                      )}
                      {projects.map((proj, i) => {
                        const projMissing = getItemMissing("projects", proj);
                        return (
                        <div key={proj.id} id={`cv-item-${proj.id}`} className={`border rounded-lg p-4 space-y-3 ${projMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {projMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {projMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setProjects(projects.filter((p) => p.id !== proj.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Project Name <span className="text-red-500">*</span></Label>
                              <Input className={!proj.name?.trim() ? "border-red-300 bg-red-50/30" : ""} value={proj.name} onChange={(e) => setProjects(projects.map((p) => p.id === proj.id ? { ...p, name: e.target.value } : p))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Technologies</Label>
                              <Input value={proj.tech} onChange={(e) => setProjects(projects.map((p) => p.id === proj.id ? { ...p, tech: e.target.value } : p))} placeholder="e.g. React, Node.js" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                            <Textarea className={!proj.description?.trim() ? "border-red-300 bg-red-50/30" : ""} rows={2} value={proj.description} onChange={(e) => setProjects(projects.map((p) => p.id === proj.id ? { ...p, description: e.target.value } : p))} />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Board / Leadership Roles ── */}
                  {currentKey === "boardRoles" && (
                    <div className="space-y-4">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setBoardRoles([{ id: uid(), title: "", organization: "", startDate: "", endDate: "", description: "" }, ...boardRoles])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Board Role
                        </Button>
                      )}
                      {boardRoles.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No board or leadership roles added yet</p>
                      )}
                      {boardRoles.map((role, i) => {
                        const brMissing = getItemMissing("boardRoles", role);
                        return (
                        <div key={role.id} id={`cv-item-${role.id}`} className={`border rounded-lg p-4 space-y-3 ${brMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {brMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {brMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setBoardRoles(boardRoles.filter((b) => b.id !== role.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Title / Role <span className="text-red-500">*</span></Label>
                              <Input className={!role.title?.trim() ? "border-red-300 bg-red-50/30" : ""} value={role.title} onChange={(e) => setBoardRoles(boardRoles.map((b) => b.id === role.id ? { ...b, title: e.target.value } : b))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Organization <span className="text-red-500">*</span></Label>
                              <Input className={!role.organization?.trim() ? "border-red-300 bg-red-50/30" : ""} value={role.organization} onChange={(e) => setBoardRoles(boardRoles.map((b) => b.id === role.id ? { ...b, organization: e.target.value } : b))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Start Date</Label>
                              <Input value={role.startDate} onChange={(e) => setBoardRoles(boardRoles.map((b) => b.id === role.id ? { ...b, startDate: e.target.value } : b))} placeholder="e.g. Jan 2020" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Date</Label>
                              <Input value={role.endDate} onChange={(e) => setBoardRoles(boardRoles.map((b) => b.id === role.id ? { ...b, endDate: e.target.value } : b))} placeholder="e.g. Present" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea rows={2} value={role.description} onChange={(e) => setBoardRoles(boardRoles.map((b) => b.id === role.id ? { ...b, description: e.target.value } : b))} />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Executive Training ── */}
                  {currentKey === "execTraining" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setExecTraining([{ id: uid(), name: "", institution: "", year: "" }, ...execTraining])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Training
                        </Button>
                      )}
                      {execTraining.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No executive training added yet</p>
                      )}
                      {execTraining.map((tr) => {
                        const trMissing = getItemMissing("execTraining", tr);
                        return (
                        <div key={tr.id} id={`cv-item-${tr.id}`} className={`rounded-lg border p-3 space-y-2 ${trMissing.length > 0 ? "bg-red-50/30 border-red-300" : ""}`}>
                          {trMissing.length > 0 && <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {trMissing.join(", ")}</span>}
                          <div className="flex gap-2">
                            <Input className={`flex-1 ${trMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Program name *" value={tr.name} onChange={(e) => setExecTraining(execTraining.map((t) => t.id === tr.id ? { ...t, name: e.target.value } : t))} />
                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setExecTraining(execTraining.filter((t) => t.id !== tr.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Institution" value={tr.institution} onChange={(e) => setExecTraining(execTraining.map((t) => t.id === tr.id ? { ...t, institution: e.target.value } : t))} />
                            <Input placeholder="Year" value={tr.year} onChange={(e) => setExecTraining(execTraining.map((t) => t.id === tr.id ? { ...t, year: e.target.value } : t))} />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Publications / Speaking ── */}
                  {currentKey === "publications" && (
                    <div className="space-y-4">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setPublications([{ id: uid(), title: "", publisher: "", year: "", type: "publication" }, ...publications])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Publication
                        </Button>
                      )}
                      {publications.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No publications or speaking engagements added yet</p>
                      )}
                      {publications.map((pub, i) => {
                        const pubMissing = getItemMissing("publications", pub);
                        return (
                        <div key={pub.id} id={`cv-item-${pub.id}`} className={`border rounded-lg p-4 space-y-3 ${pubMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">#{i + 1}</Badge>
                              {pubMissing.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="h-3 w-3" />Missing: {pubMissing.join(", ")}</span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setPublications(publications.filter((p) => p.id !== pub.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Title <span className="text-red-500">*</span></Label>
                              <Input className={!pub.title?.trim() ? "border-red-300 bg-red-50/30" : ""} value={pub.title} onChange={(e) => setPublications(publications.map((p) => p.id === pub.id ? { ...p, title: e.target.value } : p))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Publisher / Venue</Label>
                              <Input value={pub.publisher} onChange={(e) => setPublications(publications.map((p) => p.id === pub.id ? { ...p, publisher: e.target.value } : p))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Year</Label>
                              <Input value={pub.year} onChange={(e) => setPublications(publications.map((p) => p.id === pub.id ? { ...p, year: e.target.value } : p))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Type</Label>
                              <Input value={pub.type} onChange={(e) => setPublications(publications.map((p) => p.id === pub.id ? { ...p, type: e.target.value } : p))} placeholder="publication or speaking" />
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Tools & Software ── */}
                  {currentKey === "tools" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setTools([{ name: "", company: "" }, ...tools])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Tool
                        </Button>
                      )}
                      {tools.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No tools or software added yet</p>
                      )}
                      {tools.map((tool, i) => (
                        <div key={i} className={`flex gap-2 items-center rounded-lg border p-2 ${!tool.name?.trim() ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                          <Input
                            className={`flex-1 border-0 shadow-none focus-visible:ring-0 ${!tool.name?.trim() ? "placeholder:text-red-400" : ""}`}
                            placeholder="e.g. SAP ERP, Microsoft Excel, Figma *"
                            value={tool.name}
                            onChange={(e) => { const t = [...tools]; t[i] = { ...t[i], name: e.target.value }; setTools(t); }}
                          />
                          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setTools(tools.filter((_, j) => j !== i))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Volunteer ── */}
                  {currentKey === "volunteer" && (
                    <div className="space-y-3">
                      {(
                        <Button variant="outline" className="w-full" onClick={() => setVolunteer(["", ...volunteer])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Volunteer Experience
                        </Button>
                      )}
                      {volunteer.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No volunteer experience added yet</p>
                      )}
                      {volunteer.map((vol, i) => (
                        <div key={i} className={`flex gap-2 items-start ${!vol?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Textarea className={`flex-1 ${!vol?.trim() ? "border-red-300 bg-red-50/30" : ""}`} rows={2} placeholder="Describe your volunteer work or community service *" value={vol} onChange={(e) => { const v = [...volunteer]; v[i] = e.target.value; setVolunteer(v); }} />
                          <Button variant="ghost" size="sm" onClick={() => setVolunteer(volunteer.filter((_, j) => j !== i))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}


                  {/* ── Declaration ── */}
                  {currentKey === "declaration" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Declaration Statement</Label>
                        <Textarea
                          rows={6}
                          value={declaration.declaration}
                          onChange={(e) => setDeclaration({ ...declaration, declaration: e.target.value })}
                          placeholder="I hereby declare that the information provided above is true and correct to the best of my knowledge..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Place</Label>
                          <Input value={declaration.place} onChange={(e) => setDeclaration({ ...declaration, place: e.target.value })} placeholder="e.g. Nairobi" />
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input value={declaration.date} onChange={(e) => setDeclaration({ ...declaration, date: e.target.value })} placeholder="e.g. March 2026" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card></div>

              {/* ── Footer Navigation (mobile only) ── */}
              <div className="flex md:hidden flex-col mt-4 gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => safeIdx > 0 && setActiveTab(SECTIONS[safeIdx - 1].key)}
                    disabled={safeIdx === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#004aad]/40 text-[#004aad] hover:bg-[#004aad]/5"
                    onClick={handleSectionSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  {safeIdx < SECTIONS.length - 1 ? (
                    <Button
                      className="flex-1"
                      onClick={() => setActiveTab(SECTIONS[safeIdx + 1].key)}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-[#ff751f] hover:bg-[#e8661a] text-white border-0"
                      onClick={handleSaveAndContinue}
                      disabled={saving}
                    >
                      {(saving || navigatingToDashboard) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      {navigatingToDashboard ? "Opening dashboard…" : saving ? "Saving…" : "Generate My CV →"}
                    </Button>
                  )}
                </div>
                {/* Generate My CV — always visible on mobile */}
                <Button
                  className="w-full bg-[#ff751f] hover:bg-[#e8661a] text-white border-0"
                  onClick={handleSaveAndContinue}
                  disabled={saving || navigatingToDashboard}
                >
                  {(saving || navigatingToDashboard) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {navigatingToDashboard ? "Opening dashboard…" : saving ? "Saving…" : "Generate My CV →"}
                </Button>
              </div>

              {/* ── Footer Navigation (desktop only) ── */}
              <div className="hidden md:flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => safeIdx > 0 && setActiveTab(SECTIONS[safeIdx - 1].key)}
                  disabled={safeIdx === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-[#004aad]/40 text-[#004aad] hover:bg-[#004aad]/5"
                    onClick={handleSectionSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  {safeIdx < SECTIONS.length - 1 ? (
                    <Button onClick={() => setActiveTab(SECTIONS[safeIdx + 1].key)}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSaveAndContinue} disabled={saving} className="bg-[#ff751f] hover:bg-[#e8661a] text-white border-0">
                      {(saving || navigatingToDashboard) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      {navigatingToDashboard ? "Opening dashboard…" : saving ? "Saving…" : "Generate My CV →"}
                    </Button>
                  )}
                </div>
              </div>
              {/* Spacer for mobile bottom bar */}
              <div className="h-20 md:hidden" />
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── AI Missing Sections Dialog ── */}
      <AiMissingDialog
        open={showAiDialog}
        onClose={() => setShowAiDialog(false)}
        missingRequired={missingRequired}
        missingRecommended={missingRecommended}
        incompleteSections={incompleteSections}
        cvData={{
          personalInfo,
          summary,
          experiences,
          education,
          skills,
          certifications,
          languages,
          referees,
          keyAchievements,
          awards,
          memberships,
          projects,
          boardRoles,
          executiveTraining: execTraining,
          publications,
          tools,
          volunteer,
        }}
        careerLevel={categoryResult.category}
        onApply={(sectionKey, apiSectionKey, sectionData) => {
          applyAiSectionData(sectionKey, apiSectionKey, sectionData);
          setPendingApplySave(true); // save after React commits the new state
        }}
        onNavigate={(key) => {
          setShowAiDialog(false);
          goToSection(key);
        }}
      />

      {/* ── Validation Errors Dialog ── */}
      <AlertDialog open={!!validationErrors} onOpenChange={(open) => { if (!open) setValidationErrors(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-6 w-6 text-red-500" /> Cannot Continue — Incomplete Fields
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">Incomplete fields</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              {(validationErrors?.sections.length ?? 0) === 1
                ? "The following section has an item with missing required information. Please complete all highlighted fields before continuing."
                : `The following ${validationErrors?.sections.length} sections have items with missing required information. Please complete all highlighted fields before continuing.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {validationErrors?.sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setValidationErrors(null); goToSection(s.key); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {(validationErrors?.sections.length ?? 0) > 1 && (
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (validationErrors) goToSection(validationErrors.firstKey);
                  setValidationErrors(null);
                }}
              >
                Go to First Issue
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirmation Dialog: Upload New ── */}
      <AlertDialog open={showResetConfirm} onOpenChange={(open) => { if (!deleting) setShowResetConfirm(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Delete All CV Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your saved CV data from the database and take you to the upload page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={deleteAllCVData}
              disabled={deleting}
            >
              {deleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
              ) : (
                "Delete & Upload New"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
