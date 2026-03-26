"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Target,
  ScrollText,
  Trophy,
  Building2,
  FolderKanban,
  Shield,
  BookMarked,
  PenLine,
  Wrench,
  Heart,
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
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
interface AreaOfExpertise {
  id: string;
  name: string;
  description: string;
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
type CareerCategory = "junior" | "mid-senior" | "executive";

const EXECUTIVE_TITLES = /\b(chief|ceo|cfo|cto|coo|cio|cmo|cpo|president|vice\s*president|vp|managing\s*director|md|executive\s*director|group\s*director|partner|head\s*of|country\s*manager|regional\s*director|general\s*manager|gm|board\s*member|chairman|chairperson)\b/i;
const MID_TITLES = /\b(senior|sr\.?|lead|manager|director|team\s*lead|principal|supervisor|coordinator|specialist|consultant|architect|head|associate\s*director)\b/i;
const JUNIOR_TITLES = /\b(junior|jr\.?|intern|trainee|entry|assistant|graduate|apprentice|associate|analyst|officer|clerk|attachment|industrial\s*training)\b/i;

const EXEC_SCOPE_KEYWORDS = /\b(p&l|profit\s*and\s*loss|board|strategy|transformation|million|billion|revenue|shareholder|governance|merger|acquisition|m&a|ipo|fundrais|c-suite|enterprise-wide|group-wide|multi-?country|global\s*(?:operations|strategy|team))\b/i;
const MID_SCOPE_KEYWORDS = /\b(managed\s*(?:a\s*)?team|budget|cross-functional|department|division|portfolio|stakeholder|kpi|roadmap|mentored|coached|process\s*improvement|implemented|scaled|grew\s*(?:team|revenue))\b/i;

interface CategoryResult {
  category: CareerCategory;
  label: string;
  color: string;
  score: number;
  requiredSections: { key: string; label: string }[];
  recommendedSections: { key: string; label: string }[];
}

function categorizeProfile(
  experiences: Experience[],
  education: Education[],
  boardRoles: BoardRole[],
  publications: Publication[],
  execTraining: ExecTraining[],
  yearsExp: number
): CategoryResult {
  let score = 0; // 0-100 scale: 0-35 junior, 36-65 mid, 66+ executive

  // ── 1. Title analysis (max 35 pts) ──
  let execTitleCount = 0, midTitleCount = 0, juniorTitleCount = 0;
  for (const exp of experiences) {
    const t = exp.title || "";
    if (EXECUTIVE_TITLES.test(t)) execTitleCount++;
    else if (MID_TITLES.test(t)) midTitleCount++;
    else if (JUNIOR_TITLES.test(t)) juniorTitleCount++;
  }
  if (execTitleCount >= 2) score += 35;
  else if (execTitleCount === 1) score += 28;
  else if (midTitleCount >= 3) score += 22;
  else if (midTitleCount >= 1) score += 15;
  else if (juniorTitleCount >= 1) score += 5;
  else if (experiences.length > 0) score += 10; // titles exist but don't match patterns

  // ── 2. Scope/responsibility indicators in descriptions (max 20 pts) ──
  let execScopeHits = 0, midScopeHits = 0;
  for (const exp of experiences) {
    const desc = exp.description || "";
    if (EXEC_SCOPE_KEYWORDS.test(desc)) execScopeHits++;
    if (MID_SCOPE_KEYWORDS.test(desc)) midScopeHits++;
  }
  if (execScopeHits >= 2) score += 20;
  else if (execScopeHits === 1) score += 14;
  else if (midScopeHits >= 2) score += 10;
  else if (midScopeHits === 1) score += 6;

  // ── 3. Education signals (max 10 pts) ──
  const hasAdvancedDegree = education.some(e =>
    /\b(mba|m\.?b\.?a|phd|ph\.?d|doctorate|masters?|m\.?sc|m\.?a\.?|executive\s*(program|education)|emba)\b/i.test(e.degree || "")
  );
  if (hasAdvancedDegree) score += 10;
  else if (education.length > 0) score += 4;

  // ── 4. Board roles (max 10 pts) ──
  if (boardRoles.length >= 2) score += 10;
  else if (boardRoles.length === 1) score += 7;

  // ── 5. Publications & thought leadership (max 5 pts) ──
  if (publications.length >= 2) score += 5;
  else if (publications.length === 1) score += 3;

  // ── 6. Executive training (max 5 pts) ──
  if (execTraining.length >= 2) score += 5;
  else if (execTraining.length === 1) score += 3;

  // ── 7. Number of roles / career depth (max 10 pts) ──
  if (experiences.length >= 6) score += 10;
  else if (experiences.length >= 4) score += 7;
  else if (experiences.length >= 2) score += 4;
  else if (experiences.length === 1) score += 2;

  // ── 8. Years of experience — supporting factor only (max 5 pts) ──
  if (yearsExp >= 15) score += 5;
  else if (yearsExp >= 8) score += 3;
  else if (yearsExp >= 3) score += 1;

  // ── Determine category ──
  let category: CareerCategory;
  if (score >= 60) category = "executive";
  else if (score >= 30) category = "mid-senior";
  else category = "junior";

  // ── Required & recommended sections per category ──
  const SECTIONS: Record<CareerCategory, { required: { key: string; label: string }[]; recommended: { key: string; label: string }[] }> = {
    junior: {
      required: [
        { key: "personal", label: "Personal Info" },
        { key: "summary", label: "Professional Summary" },
        { key: "experience", label: "Experience" },
        { key: "education", label: "Education" },
        { key: "skills", label: "Skills" },
        { key: "referees", label: "References" },
      ],
      recommended: [
        { key: "projects", label: "Projects" },
        { key: "certifications", label: "Certifications" },
        { key: "volunteer", label: "Volunteer Experience" },
        { key: "languages", label: "Languages" },
      ],
    },
    "mid-senior": {
      required: [
        { key: "personal", label: "Personal Info" },
        { key: "summary", label: "Professional Summary" },
        { key: "experience", label: "Experience" },
        { key: "education", label: "Education" },
        { key: "skills", label: "Core Competencies" },
        { key: "achievements", label: "Key Achievements" },
        { key: "referees", label: "References" },
      ],
      recommended: [
        { key: "certifications", label: "Certifications" },
        { key: "awards", label: "Awards & Recognition" },
        { key: "memberships", label: "Professional Memberships" },
        { key: "tools", label: "Tools & Software" },
        { key: "languages", label: "Languages" },
        { key: "projects", label: "Projects" },
      ],
    },
    executive: {
      required: [
        { key: "personal", label: "Personal Info" },
        { key: "summary", label: "Executive Profile" },
        { key: "experience", label: "Professional Experience" },
        { key: "education", label: "Education" },
        { key: "skills", label: "Core Leadership Competencies" },
        { key: "achievements", label: "Career Highlights" },
        { key: "boardRoles", label: "Board & Advisory Roles" },
        { key: "referees", label: "References" },
      ],
      recommended: [
        { key: "execTraining", label: "Executive Training" },
        { key: "publications", label: "Publications & Speaking" },
        { key: "awards", label: "Awards & Recognition" },
        { key: "certifications", label: "Certifications" },
        { key: "memberships", label: "Professional Affiliations" },
        { key: "languages", label: "Languages" },
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
    score,
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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMobileAddSection, setShowMobileAddSection] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ sections: string[]; firstKey: string } | null>(null);

  // Section tab navigation
  const [activeTab, setActiveTab] = useState("personal");
  const [manuallyShown, setManuallyShown] = useState<Set<string>>(new Set());

  // Core sections always visible; optional sections only if they have data or user added them
  const CORE_KEYS = new Set(["personal", "summary", "experience", "education", "skills"]);
  const ALL_SECTIONS = [
    { key: "personal", label: "Personal Info", icon: User },
    { key: "summary", label: "Summary", icon: FileText },
    { key: "experience", label: "Experience", icon: Briefcase },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "skills", label: "Skills", icon: Sparkles },
    { key: "expertise", label: "Areas of Expertise", icon: Target },
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
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [areasOfExpertise, setAreasOfExpertise] = useState<AreaOfExpertise[]>([]);
  const [keyAchievements, setKeyAchievements] = useState<KeyAchievement[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [boardRoles, setBoardRoles] = useState<BoardRole[]>([]);
  const [execTraining, setExecTraining] = useState<ExecTraining[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [declaration, setDeclaration] = useState({ declaration: "", place: "", date: "" });
  const [tools, setTools] = useState<string[]>([]);
  const [volunteer, setVolunteer] = useState<string[]>([]);

  // ─── AI Review state ───
  const [reviewLoading, setReviewLoading] = useState(false);
  const [review, setReview] = useState<null | {
    score: number;
    summary: string;
    suggestions: { section: string; severity: "critical" | "warning" | "tip"; issue: string; suggestion: string }[];
  }>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  // ─── Load existing data from DB ───
  const loadFromDB = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const [piRes, sumRes, expRes, eduRes, skillRes, certRes, langRes, refRes, exprtRes, declRes,
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
          supabase.from("cv_areas_of_expertise").select("*").eq("user_id", user.id).order("sort_order"),
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
      if (exprtRes.data && exprtRes.data.length > 0) {
        found = true;
        setAreasOfExpertise(exprtRes.data.map((a: any) => ({
          id: a.id,
          name: a.name || "",
          description: a.description || "",
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
        setTools(toolRes.data.map((t: any) => t.name || "").filter(Boolean));
      }
      if (volRes.data && volRes.data.length > 0) {
        found = true;
        setVolunteer(volRes.data.map((v: any) => v.description || "").filter(Boolean));
      }

      if (found) {
        setHasExistingData(true);
        setStep("edit");
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

  // ─── Handle ?tab= query param from My Profile ───
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && !loadingProfile && hasExistingData) {
      setStep("edit");
      if (!manuallyShown.has(tab)) {
        setManuallyShown(prev => new Set([...prev, tab]));
      }
      setActiveTab(tab);
    }
  }, [searchParams, loadingProfile, hasExistingData]);

  // ─── Generate Achievements from Experience ───
  const generateAchievementsFromExperience = async () => {
    if (!experiences.length) {
      console.log('No experiences to generate from');
      return;
    }
    
    try {
      console.log('Starting achievement generation with', experiences.length, 'experiences');
      
      const response = await fetch("/api/ai/generate-achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          experiences: experiences, // All experiences
          summary: summary,
          skills: skills,
          education: education,
          certifications: certifications,
          projects: projects,
          areasOfExpertise: areasOfExpertise
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Achievement API response:', data);
        
        if (data.achievements && data.achievements.length > 0) {
          const generatedAchievements = data.achievements.map((achievement: string) => ({
            id: uid(),
            achievement: achievement.trim()
          }));
          setKeyAchievements(generatedAchievements);
          console.log('Generated', generatedAchievements.length, 'achievements');
        } else {
          console.error('No achievements returned from AI');
          alert('Failed to generate achievements. Please try again or add them manually.');
        }
      } else {
        console.error('Achievement generation API failed:', response.status, response.statusText);
        alert(`Achievement generation failed (${response.status}). Please try again or add them manually.`);
      }
    } catch (error) {
      console.error("Failed to generate achievements:", error);
      alert('Failed to generate achievements. Please try again or add them manually.');
    }
  };

  // ─── Generate References from Experience ───
  const generateReferencesFromExperience = async () => {
    if (!experiences.length) {
      console.log('No experiences to generate references from');
      return;
    }
    
    try {
      console.log('Starting reference generation with', experiences.length, 'experiences');
      
      const response = await fetch("/api/ai/generate-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          experiences: experiences, // All experiences
          personalInfo: personalInfo,
          summary: summary,
          skills: skills,
          education: education,
          certifications: certifications
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reference API response:', data);
        
        if (data.references && data.references.length > 0) {
          const generatedReferences = data.references.map((ref: any) => ({
            id: uid(),
            name: ref.name || "",
            title: ref.title || "",
            company: ref.company || "",
            phone: ref.phone || "",
            email: ref.email || ""
          }));
          setReferees(generatedReferences);
          console.log('Generated', generatedReferences.length, 'references');
        } else {
          console.error('No references returned from AI');
          alert('Failed to generate references. Please try again or add them manually.');
        }
      } else {
        console.error('Reference generation API failed:', response.status, response.statusText);
        alert(`Reference generation failed (${response.status}). Please try again or add them manually.`);
      }
    } catch (error) {
      console.error("Failed to generate references:", error);
      alert('Failed to generate references. Please try again or add them manually.');
    }
  };

  // ─── File Upload + AI Extract ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setExtracting(false);
    setExtractionProgress(10);

    try {
      // Step 1: Parse PDF to text
      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/ai/parse-pdf", { method: "POST", body: formData });
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
      if (d.skills?.length) {
        setSkills(d.skills.map((s: any) => ({
          id: uid(), name: s.name || s || "", category: s.category || "",
        })));
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
      if (d.areasOfExpertise?.length) {
        setAreasOfExpertise(d.areasOfExpertise.map((a: any) => ({
          id: uid(), name: a.name || a || "", description: a.description || "",
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
        setTools(d.tools.map((t: any) => typeof t === "string" ? t : t.name || "").filter(Boolean));
      }
      if (d.volunteer?.length) {
        setVolunteer(d.volunteer.map((v: any) => typeof v === "string" ? v : v.description || "").filter(Boolean));
      }

      setExtractionProgress(100);
      toast.success("CV extracted successfully! Review and edit below.");
      setStep("edit");
    } catch (err: any) {
      console.error("Upload/extraction error:", err);
      toast.error(err.message || "Failed to extract CV");
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  // ─── AI Profile Review ───
  const runReview = async () => {
    if (!user) return;
    setReviewLoading(true);
    setReviewOpen(true);
    try {
      const payload = {
        cvData: {
          personalInfo,
          summary,
          experiences,
          education,
          skills,
          certifications,
          languages,
          referees,
          areasOfExpertise,
          keyAchievements,
          memberships,
          projects,
          boardRoles,
          execTraining,
          publications,
          tools,
          volunteer,
        },
      };
      const res = await fetch("/api/ai/review-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.review) setReview(data.review);
      else toast.error("Failed to get review");
    } catch {
      toast.error("Review failed");
    } finally {
      setReviewLoading(false);
    }
  };

  // ─── Save all sections to DB ───
  const saveToDatabase = async () => {
    if (!user) {
      toast.error("You must be logged in to save");
      return;
    }
    setSaving(true);
    try {
      // 1. Personal Info — upsert (unique per user)
      const { error: piErr } = await supabase.from("cv_personal_info").upsert({
        user_id: user.id,
        full_name: personalInfo.fullName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location,
        headline: personalInfo.headline,
        linkedin: personalInfo.linkedin,
        website: personalInfo.website,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (piErr) throw piErr;

      // 2. Summary — upsert (unique per user)
      const { error: sumErr } = await supabase.from("cv_summary").upsert({
        user_id: user.id,
        summary,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (sumErr) throw sumErr;

      // 3. Experiences — delete all then insert fresh
      await supabase.from("cv_experiences").delete().eq("user_id", user.id);
      if (experiences.filter((e) => e.title).length > 0) {
        const { error: expErr } = await supabase.from("cv_experiences").insert(
          experiences.filter((e) => e.title).map((e, i) => ({
            user_id: user.id,
            title: e.title,
            company: e.company,
            location: e.location,
            start_date: e.startDate,
            end_date: e.endDate,
            description: e.description,
            sort_order: i,
          }))
        );
        if (expErr) throw expErr;
      }

      // 4. Education — delete all then insert fresh
      await supabase.from("cv_education").delete().eq("user_id", user.id);
      if (education.filter((e) => e.degree).length > 0) {
        const { error: eduErr } = await supabase.from("cv_education").insert(
          education.filter((e) => e.degree).map((e, i) => ({
            user_id: user.id,
            degree: e.degree,
            institution: e.institution,
            year: e.year,
            description: e.description,
            sort_order: i,
          }))
        );
        if (eduErr) throw eduErr;
      }

      // 5. Skills — delete all then insert fresh
      await supabase.from("cv_skills").delete().eq("user_id", user.id);
      if (skills.filter((s) => s.name).length > 0) {
        const { error: skillErr } = await supabase.from("cv_skills").insert(
          skills.filter((s) => s.name).map((s, i) => ({
            user_id: user.id,
            name: s.name,
            category: s.category,
            sort_order: i,
          }))
        );
        if (skillErr) throw skillErr;
      }

      // 6. Certifications — delete all then insert fresh
      await supabase.from("cv_certifications").delete().eq("user_id", user.id);
      if (certifications.filter((c) => c.name).length > 0) {
        const { error: certErr } = await supabase.from("cv_certifications").insert(
          certifications.filter((c) => c.name).map((c, i) => ({
            user_id: user.id,
            name: c.name,
            issuer: c.issuer,
            year: c.year,
            sort_order: i,
          }))
        );
        if (certErr) throw certErr;
      }

      // 7. Languages — delete all then insert fresh
      await supabase.from("cv_languages").delete().eq("user_id", user.id);
      if (languages.filter((l) => l.name).length > 0) {
        const { error: langErr } = await supabase.from("cv_languages").insert(
          languages.filter((l) => l.name).map((l, i) => ({
            user_id: user.id,
            name: l.name,
            proficiency: l.proficiency,
            sort_order: i,
          }))
        );
        if (langErr) throw langErr;
      }

      // 8. Referees — delete all then insert fresh
      await supabase.from("cv_referees").delete().eq("user_id", user.id);
      if (referees.filter((r) => r.name).length > 0) {
        const { error: refErr } = await supabase.from("cv_referees").insert(
          referees.filter((r) => r.name).map((r, i) => ({
            user_id: user.id,
            name: r.name,
            title: r.title,
            company: r.company,
            phone: r.phone,
            email: r.email,
            sort_order: i,
          }))
        );
        if (refErr) throw refErr;
      }

      // 9. Areas of Expertise — delete all then insert fresh
      await supabase.from("cv_areas_of_expertise").delete().eq("user_id", user.id);
      if (areasOfExpertise.filter((a) => a.name).length > 0) {
        const { error: exprtErr } = await supabase.from("cv_areas_of_expertise").insert(
          areasOfExpertise.filter((a) => a.name).map((a, i) => ({
            user_id: user.id,
            name: a.name,
            description: a.description,
            sort_order: i,
          }))
        );
        if (exprtErr) throw exprtErr;
      }

      // 10. Declaration — upsert (unique per user)
      const { error: declErr } = await supabase.from("cv_declarations").upsert({
        user_id: user.id,
        declaration: declaration.declaration,
        place: declaration.place,
        date: declaration.date,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (declErr) throw declErr;

      // 11. Key Achievements
      await supabase.from("cv_key_achievements").delete().eq("user_id", user.id);
      if (keyAchievements.filter((a) => a.achievement).length > 0) {
        const { error: achErr } = await supabase.from("cv_key_achievements").insert(
          keyAchievements.filter((a) => a.achievement).map((a, i) => ({
            user_id: user.id, achievement: a.achievement, sort_order: i,
          }))
        );
        if (achErr) throw achErr;
      }

      // 12. Awards
      await supabase.from("cv_awards").delete().eq("user_id", user.id);
      if (awards.filter((a) => a.title).length > 0) {
        const { error: awardErr } = await supabase.from("cv_awards").insert(
          awards.filter((a) => a.title).map((a, i) => ({
            user_id: user.id, title: a.title, description: a.description, sort_order: i,
          }))
        );
        if (awardErr) throw awardErr;
      }

      // 13. Memberships
      await supabase.from("cv_memberships").delete().eq("user_id", user.id);
      if (memberships.filter((m) => m.name).length > 0) {
        const { error: memErr } = await supabase.from("cv_memberships").insert(
          memberships.filter((m) => m.name).map((m, i) => ({
            user_id: user.id, name: m.name, sort_order: i,
          }))
        );
        if (memErr) throw memErr;
      }

      // 13. Projects
      await supabase.from("cv_projects").delete().eq("user_id", user.id);
      if (projects.filter((p) => p.name).length > 0) {
        const { error: projErr } = await supabase.from("cv_projects").insert(
          projects.filter((p) => p.name).map((p, i) => ({
            user_id: user.id, name: p.name, description: p.description, tech: p.tech, sort_order: i,
          }))
        );
        if (projErr) throw projErr;
      }

      // 14. Board Roles
      await supabase.from("cv_board_roles").delete().eq("user_id", user.id);
      if (boardRoles.filter((b) => b.title).length > 0) {
        const { error: brErr } = await supabase.from("cv_board_roles").insert(
          boardRoles.filter((b) => b.title).map((b, i) => ({
            user_id: user.id, title: b.title, organization: b.organization,
            start_date: b.startDate, end_date: b.endDate, description: b.description, sort_order: i,
          }))
        );
        if (brErr) throw brErr;
      }

      // 15. Executive Training
      await supabase.from("cv_executive_training").delete().eq("user_id", user.id);
      if (execTraining.filter((t) => t.name).length > 0) {
        const { error: etErr } = await supabase.from("cv_executive_training").insert(
          execTraining.filter((t) => t.name).map((t, i) => ({
            user_id: user.id, name: t.name, institution: t.institution, year: t.year, sort_order: i,
          }))
        );
        if (etErr) throw etErr;
      }

      // 16. Publications
      await supabase.from("cv_publications").delete().eq("user_id", user.id);
      if (publications.filter((p) => p.title).length > 0) {
        const { error: pubErr } = await supabase.from("cv_publications").insert(
          publications.filter((p) => p.title).map((p, i) => ({
            user_id: user.id, title: p.title, publisher: p.publisher, year: p.year, type: p.type, sort_order: i,
          }))
        );
        if (pubErr) throw pubErr;
      }

      // 17. Tools
      await supabase.from("cv_tools").delete().eq("user_id", user.id);
      if (tools.filter(Boolean).length > 0) {
        const { error: toolErr } = await supabase.from("cv_tools").insert(
          tools.filter(Boolean).map((t, i) => ({ user_id: user.id, name: t, sort_order: i }))
        );
        if (toolErr) throw toolErr;
      }

      // 18. Volunteer
      await supabase.from("cv_volunteer").delete().eq("user_id", user.id);
      if (volunteer.filter(Boolean).length > 0) {
        const { error: volErr } = await supabase.from("cv_volunteer").insert(
          volunteer.filter(Boolean).map((v, i) => ({ user_id: user.id, description: v, sort_order: i }))
        );
        if (volErr) throw volErr;
      }


      toast.success("CV saved successfully!");
      setHasExistingData(true);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save: " + (err.message || err));
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
        supabase.from("cv_areas_of_expertise").delete().eq("user_id", user.id),
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
      setAreasOfExpertise([]);
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
    expertise: areasOfExpertise.length,
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
      { field: "startDate", label: "Start Date" },
      { field: "description", label: "Description" },
    ],
    education: [
      { field: "degree", label: "Degree" },
      { field: "institution", label: "Institution" },
    ],
    skills: [{ field: "name", label: "Skill Name" }],
    certifications: [{ field: "name", label: "Name" }],
    languages: [{ field: "name", label: "Language" }],
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
    awards: [{ field: "title", label: "Award Title" }],
    memberships: [{ field: "name", label: "Name" }],
    expertise: [{ field: "name", label: "Area Name" }],
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
  const SECTIONS = ALL_SECTIONS.filter(
    (s) => CORE_KEYS.has(s.key) || sectionHasContent(s.key) || manuallyShown.has(s.key)
  );
  const hiddenSections = ALL_SECTIONS.filter(
    (s) => !CORE_KEYS.has(s.key) && !sectionHasContent(s.key) && !manuallyShown.has(s.key)
  );

  // ─── Calculate Years of Experience ───
  const calculateYearsOfExperience = () => {
    if (!experiences || experiences.length === 0) return 0;
    
    const now = new Date();
    let totalMonths = 0;
    
    experiences.forEach((exp) => {
      if (!exp.startDate) return;
      
      // Parse start date (handle various formats)
      const startDate = new Date(exp.startDate);
      if (isNaN(startDate.getTime())) {
        // Try to parse month-year formats like "Jan 2020"
        const monthYearMatch = exp.startDate.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i);
        if (monthYearMatch) {
          const month = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`).getMonth();
          startDate.setFullYear(parseInt(monthYearMatch[2], 10), month, 1);
        } else if (/^\d{4}$/.test(exp.startDate)) {
          startDate.setFullYear(parseInt(exp.startDate, 10), 0, 1); // January of that year
        } else {
          return; // Skip if we can't parse
        }
      }
      
      // Parse end date
      let endDate;
      if (exp.endDate === "Present" || exp.endDate === "present" || !exp.endDate) {
        endDate = now;
      } else {
        endDate = new Date(exp.endDate);
        if (isNaN(endDate.getTime())) {
          const monthYearMatch = exp.endDate.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i);
          if (monthYearMatch) {
            const month = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`).getMonth();
            endDate.setFullYear(parseInt(monthYearMatch[2], 10), month, 1);
          } else if (/^\d{4}$/.test(exp.endDate)) {
            endDate.setFullYear(parseInt(exp.endDate, 10), 11, 31); // December of that year
          } else {
            return; // Skip if we can't parse
          }
        }
      }
      
      // Calculate months difference
      if (endDate >= startDate) {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        totalMonths += Math.max(0, months);
      }
    });
    
    // Convert to years (rounded to 1 decimal place)
    const years = totalMonths / 12;
    return years < 1 ? "< 1" : years.toFixed(1);
  };

  const yearsOfExperience = calculateYearsOfExperience();

  // ─── Sections with incomplete items (for sidebar highlighting) ───
  const sectionsWithIssues = new Set<string>();
  if (getItemMissing("personal", personalInfo).length > 0) sectionsWithIssues.add("personal");
  experiences.forEach((e) => { if (getItemMissing("experience", e).length > 0) sectionsWithIssues.add("experience"); });
  education.forEach((e) => { if (getItemMissing("education", e).length > 0) sectionsWithIssues.add("education"); });
  skills.forEach((s) => { if (getItemMissing("skills", s).length > 0) sectionsWithIssues.add("skills"); });
  certifications.forEach((c) => { if (getItemMissing("certifications", c).length > 0) sectionsWithIssues.add("certifications"); });
  languages.forEach((l) => { if (getItemMissing("languages", l).length > 0) sectionsWithIssues.add("languages"); });
  referees.forEach((r) => { if (getItemMissing("referees", r).length > 0) sectionsWithIssues.add("referees"); });
  keyAchievements.forEach((a) => { if (getItemMissing("achievements", a).length > 0) sectionsWithIssues.add("achievements"); });
  memberships.forEach((m) => { if (getItemMissing("memberships", m).length > 0) sectionsWithIssues.add("memberships"); });
  projects.forEach((p) => { if (getItemMissing("projects", p).length > 0) sectionsWithIssues.add("projects"); });
  boardRoles.forEach((b) => { if (getItemMissing("boardRoles", b).length > 0) sectionsWithIssues.add("boardRoles"); });
  execTraining.forEach((t) => { if (getItemMissing("execTraining", t).length > 0) sectionsWithIssues.add("execTraining"); });
  publications.forEach((p) => { if (getItemMissing("publications", p).length > 0) sectionsWithIssues.add("publications"); });
  areasOfExpertise.forEach((a) => { if (getItemMissing("expertise", a).length > 0) sectionsWithIssues.add("expertise"); });
  tools.forEach((t) => { if (!t?.trim()) sectionsWithIssues.add("tools"); });
  volunteer.forEach((v) => { if (!v?.trim()) sectionsWithIssues.add("volunteer"); });

  // ─── Career Categorization ───
  const numericYears = typeof yearsOfExperience === "string" ? 0 : Number(yearsOfExperience);
  const categoryResult = categorizeProfile(
    experiences, education, boardRoles, publications, execTraining, numericYears
  );

  
  const missingRequired = categoryResult.requiredSections.filter(s => !sectionHasContent(s.key));
  const missingRecommended = categoryResult.recommendedSections.filter(s => !sectionHasContent(s.key));

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
          <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Upload Your CV</h2>
              <p className="text-muted-foreground">Upload a PDF or Word document and our AI will extract all sections automatically</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <label
                  htmlFor="cv-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 sm:p-12 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {uploading || extracting ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="font-medium">{uploading ? "Parsing document..." : "AI extracting sections..."}</p>
                      <Progress value={extractionProgress} className="w-64 mt-4" />
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="font-medium">Click to upload PDF or Word document</p>
                      <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
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

            <div className="text-center">
              <Button variant="outline" onClick={() => setStep("edit")}>
                Or fill in manually
              </Button>
            </div>

            {hasExistingData && (
              <div className="text-center">
                <Button variant="link" onClick={() => setStep("edit")}>
                  Continue editing existing CV →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP: EDIT (Tabbed Sections) ─── */}
        {step === "edit" && (
          <div className="space-y-4">
            {/* ── Top Save Bar ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">Edit Your CV</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Review and edit each section</p>
                </div>
                {experiences && experiences.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm font-medium">{yearsOfExperience} yrs</span>
                  </div>
                )}
                <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border text-xs sm:text-sm font-medium ${categoryResult.color}`}>
                  <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {categoryResult.label}
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button
                  onClick={async () => {
                    // 1. Check missing required sections
                    if (missingRequired.length > 0) {
                      setValidationErrors({ sections: missingRequired.map(s => s.label), firstKey: missingRequired[0].key });
                      return;
                    }

                    // 2. Check per-item missing fields across all sections
                    const incompleteItems: { section: string; key: string; count: number }[] = [];

                    const piMissing = getItemMissing("personal", personalInfo);
                    if (piMissing.length > 0) incompleteItems.push({ section: "Personal Info", key: "personal", count: piMissing.length });

                    experiences.forEach((exp) => { if (getItemMissing("experience", exp).length > 0) incompleteItems.push({ section: "Experience", key: "experience", count: 0 }); });
                    education.forEach((edu) => { if (getItemMissing("education", edu).length > 0) incompleteItems.push({ section: "Education", key: "education", count: 0 }); });
                    skills.forEach((s) => { if (getItemMissing("skills", s).length > 0) incompleteItems.push({ section: "Skills", key: "skills", count: 0 }); });
                    certifications.forEach((c) => { if (getItemMissing("certifications", c).length > 0) incompleteItems.push({ section: "Certifications", key: "certifications", count: 0 }); });
                    languages.forEach((l) => { if (getItemMissing("languages", l).length > 0) incompleteItems.push({ section: "Languages", key: "languages", count: 0 }); });
                    referees.forEach((r) => { if (getItemMissing("referees", r).length > 0) incompleteItems.push({ section: "Referees", key: "referees", count: 0 }); });
                    keyAchievements.forEach((a) => { if (getItemMissing("achievements", a).length > 0) incompleteItems.push({ section: "Achievements", key: "achievements", count: 0 }); });
                    memberships.forEach((m) => { if (getItemMissing("memberships", m).length > 0) incompleteItems.push({ section: "Memberships", key: "memberships", count: 0 }); });
                    projects.forEach((p) => { if (getItemMissing("projects", p).length > 0) incompleteItems.push({ section: "Projects", key: "projects", count: 0 }); });
                    boardRoles.forEach((b) => { if (getItemMissing("boardRoles", b).length > 0) incompleteItems.push({ section: "Board Roles", key: "boardRoles", count: 0 }); });
                    execTraining.forEach((t) => { if (getItemMissing("execTraining", t).length > 0) incompleteItems.push({ section: "Exec Training", key: "execTraining", count: 0 }); });
                    publications.forEach((p) => { if (getItemMissing("publications", p).length > 0) incompleteItems.push({ section: "Publications", key: "publications", count: 0 }); });
                    areasOfExpertise.forEach((a) => { if (getItemMissing("expertise", a).length > 0) incompleteItems.push({ section: "Areas of Expertise", key: "expertise", count: 0 }); });
                    tools.forEach((t) => { if (!t?.trim()) incompleteItems.push({ section: "Tools", key: "tools", count: 0 }); });
                    volunteer.forEach((v) => { if (!v?.trim()) incompleteItems.push({ section: "Volunteer", key: "volunteer", count: 0 }); });

                    if (incompleteItems.length > 0) {
                      const uniqueSections = [...new Set(incompleteItems.map(i => i.section))];
                      setValidationErrors({ sections: uniqueSections, firstKey: incompleteItems[0].key });
                      return;
                    }

                    await saveToDatabase();
                    router.push("/dashboard");
                  }}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save & Continue"}
                </Button>
              </div>
            </div>

            {/* ── Missing Sections Panel ── */}
            {(missingRequired.length > 0 || missingRecommended.length > 0) && (
              <div className="border rounded-lg overflow-hidden">
                {missingRequired.length > 0 && (
                  <div className="bg-red-50 border-b border-red-200 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">Required sections missing ({missingRequired.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingRequired.map(s => (
                        <button
                          key={s.key}
                          onClick={() => {
                            if (!manuallyShown.has(s.key)) {
                              setManuallyShown(prev => new Set([...prev, s.key]));
                            }
                            setActiveTab(s.key);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-red-200 rounded-md text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="h-3 w-3" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {missingRecommended.length > 0 && (
                  <div className="bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700">Recommended sections ({missingRecommended.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingRecommended.map(s => (
                        <button
                          key={s.key}
                          onClick={() => {
                            if (!manuallyShown.has(s.key)) {
                              setManuallyShown(prev => new Set([...prev, s.key]));
                            }
                            setActiveTab(s.key);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-200 rounded-md text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── AI Review Panel ── */}
            {reviewOpen && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setReviewOpen(r => !r)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-violet-600" />
                    <span className="font-semibold text-violet-800">AI Profile Review</span>
                    {review && !reviewLoading && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                        review.score >= 75 ? "bg-green-100 text-green-700" :
                        review.score >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        Score: {review.score}/100
                      </span>
                    )}
                  </div>
                  {reviewOpen ? <ChevronUp className="h-4 w-4 text-violet-600" /> : <ChevronDown className="h-4 w-4 text-violet-600" />}
                </button>

                <div className="p-4 space-y-4 bg-white">
                  {reviewLoading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                      <p className="text-sm text-muted-foreground">Analysing your profile…</p>
                    </div>
                  )}

                  {!reviewLoading && review && (
                    <>
                      {/* Score bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Overall CV Strength</span>
                          <span className={review.score >= 75 ? "text-green-600" : review.score >= 50 ? "text-amber-600" : "text-red-600"}>
                            {review.score}/100
                          </span>
                        </div>
                        <Progress
                          value={review.score}
                          className="h-2"
                        />
                        <p className="text-sm text-muted-foreground pt-1">{review.summary}</p>
                      </div>

                      <Separator />

                      {/* Suggestions */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {review.suggestions.length} Suggestions
                        </p>
                        {review.suggestions.map((s, i) => {
                          const Icon = s.severity === "critical" ? XCircle : s.severity === "warning" ? AlertCircle : CheckCircle2;
                          const colors = s.severity === "critical"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : s.severity === "warning"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-green-200 bg-green-50 text-green-700";
                          const iconColor = s.severity === "critical" ? "text-red-500" : s.severity === "warning" ? "text-amber-500" : "text-green-500";
                          return (
                            <div key={i} className={`rounded-lg border p-3 ${colors}`}>
                              <div className="flex items-start gap-2">
                                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">{s.section}</span>
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${
                                      s.severity === "critical" ? "border-red-300 text-red-600" :
                                      s.severity === "warning" ? "border-amber-300 text-amber-600" :
                                      "border-green-300 text-green-600"
                                    }`}>{s.severity}</Badge>
                                  </div>
                                  <p className="text-xs font-medium mt-0.5 opacity-80">{s.issue}</p>
                                  <p className="text-xs mt-1 opacity-90">{s.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button size="sm" variant="outline" onClick={runReview} disabled={reviewLoading} className="text-violet-700 border-violet-200 hover:bg-violet-50">
                          <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Re-analyse
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
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
                  className="w-full mt-2 bg-green-600 hover:bg-green-700"
                  onClick={saveToDatabase}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? "Saving..." : "Confirm & Save"}
                </Button>
              </div>
            </aside>

            {/* ── Mobile Tab Bar ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.key;
                const hasIssues = sectionsWithIssues.has(sec.key);
                return (
                  <button
                    key={sec.key}
                    onClick={() => setActiveTab(sec.key)}
                    className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium shrink-0 transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : hasIssues ? "text-red-600 bg-red-50" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {sec.label.split(" ")[0]}
                    {hasIssues && !isActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </button>
                );
              })}
              {hiddenSections.length > 0 && (
                <button
                  onClick={() => setShowMobileAddSection(true)}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium shrink-0 transition-colors text-primary border border-dashed border-primary/40 bg-primary/5"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              )}
            </div>

            {/* ── Mobile Add Section Sheet ── */}
            {showMobileAddSection && (
              <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileAddSection(false)} />
                {/* Sheet */}
                <div className="relative bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
                  <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Add Section</h3>
                    <button onClick={() => setShowMobileAddSection(false)} className="text-muted-foreground p-1">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
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
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1">{sec.label}</span>
                          <Plus className="h-4 w-4 shrink-0 text-primary" />
                        </button>
                      );
                    })}
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

              <Card>
                <CardContent className="p-3 pt-4 sm:p-6 sm:pt-6">
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
                    <Textarea
                      rows={8}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Brief professional summary highlighting your key strengths, experience, and career goals..."
                    />
                  )}

                  {/* ── Experience ── */}
                  {currentKey === "experience" && (
                    <div className="space-y-4">
                      {experiences.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No experiences added yet</p>
                      )}
                      {experiences.map((exp, i) => {
                        const expMissing = getItemMissing("experience", exp);
                        return (
                        <div key={exp.id} className={`border rounded-lg p-3 sm:p-4 space-y-3 ${expMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
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
                              <Label className="text-xs">City, Country</Label>
                              <Input value={exp.location} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, location: e.target.value } : x))} placeholder="e.g. Nairobi, Kenya" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Start Date <span className="text-red-500">*</span></Label>
                              <Input className={!exp.startDate?.trim() ? "border-red-300 bg-red-50/30" : ""} value={exp.startDate} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, startDate: e.target.value } : x))} placeholder="e.g. Jan 2020" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End Date</Label>
                              <Input value={exp.endDate} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, endDate: e.target.value } : x))} placeholder="e.g. Present" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description <span className="text-red-500">*</span></Label>
                            <Textarea className={!exp.description?.trim() ? "border-red-300 bg-red-50/30" : ""} rows={3} value={exp.description} onChange={(e) => setExperiences(experiences.map((x) => x.id === exp.id ? { ...x, description: e.target.value } : x))} />
                          </div>
                        </div>
                        );
                      })}
                      <Button variant="outline" className="w-full" onClick={() => setExperiences([...experiences, { id: uid(), title: "", company: "", location: "", startDate: "", endDate: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                    </div>
                  )}

                  {/* ── Education ── */}
                  {currentKey === "education" && (
                    <div className="space-y-4">
                      {education.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No education entries added yet</p>
                      )}
                      {education.map((edu, i) => {
                        const eduMissing = getItemMissing("education", edu);
                        return (
                        <div key={edu.id} className={`border rounded-lg p-3 sm:p-4 space-y-3 ${eduMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
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
                              <Label className="text-xs">Year</Label>
                              <Input value={edu.year} onChange={(e) => setEducation(education.map((x) => x.id === edu.id ? { ...x, year: e.target.value } : x))} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea rows={2} value={edu.description} onChange={(e) => setEducation(education.map((x) => x.id === edu.id ? { ...x, description: e.target.value } : x))} />
                          </div>
                        </div>
                        );
                      })}
                      <Button variant="outline" className="w-full" onClick={() => setEducation([...education, { id: uid(), degree: "", institution: "", year: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Education
                      </Button>
                    </div>
                  )}

                  {/* ── Skills ── */}
                  {currentKey === "skills" && (
                    <div className="space-y-3">
                      {skills.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No skills added yet</p>
                      )}
                      {skills.map((skill) => (
                        <div key={skill.id} className={`flex gap-2 items-center ${!skill.name?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!skill.name?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Skill name *" value={skill.name} onChange={(e) => setSkills(skills.map((s) => s.id === skill.id ? { ...s, name: e.target.value } : s))} />
                          <Input className="w-40" placeholder="Category" value={skill.category} onChange={(e) => setSkills(skills.map((s) => s.id === skill.id ? { ...s, category: e.target.value } : s))} />
                          <Button variant="ghost" size="sm" onClick={() => setSkills(skills.filter((s) => s.id !== skill.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setSkills([...skills, { id: uid(), name: "", category: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Skill
                      </Button>
                    </div>
                  )}

                  {/* ── Certifications ── */}
                  {currentKey === "certifications" && (
                    <div className="space-y-3">
                      {certifications.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No certifications added yet</p>
                      )}
                      {certifications.map((cert) => (
                        <div key={cert.id} className={`flex gap-2 items-center ${!cert.name?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!cert.name?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Name *" value={cert.name} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c))} />
                          <Input className="w-40" placeholder="Issuer" value={cert.issuer} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, issuer: e.target.value } : c))} />
                          <Input className="w-24" placeholder="Year" value={cert.year} onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, year: e.target.value } : c))} />
                          <Button variant="ghost" size="sm" onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setCertifications([...certifications, { id: uid(), name: "", issuer: "", year: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Certification
                      </Button>
                    </div>
                  )}

                  {/* ── Languages ── */}
                  {currentKey === "languages" && (
                    <div className="space-y-3">
                      {languages.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No languages added yet</p>
                      )}
                      {languages.map((lang) => (
                        <div key={lang.id} className={`flex gap-2 items-center ${!lang.name?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!lang.name?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Language *" value={lang.name} onChange={(e) => setLanguages(languages.map((l) => l.id === lang.id ? { ...l, name: e.target.value } : l))} />
                          <Input className="w-28 sm:w-48" placeholder="Proficiency" value={lang.proficiency} onChange={(e) => setLanguages(languages.map((l) => l.id === lang.id ? { ...l, proficiency: e.target.value } : l))} />
                          <Button variant="ghost" size="sm" onClick={() => setLanguages(languages.filter((l) => l.id !== lang.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setLanguages([...languages, { id: uid(), name: "", proficiency: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Language
                      </Button>
                    </div>
                  )}

                  {/* ── Referees ── */}
                  {currentKey === "referees" && (
                    <div className="space-y-4">
                      {referees.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No referees added yet</p>
                      )}
                      {referees.map((ref, i) => {
                        const refMissing = getItemMissing("referees", ref);
                        return (
                        <div key={ref.id} className={`border rounded-lg p-3 sm:p-4 space-y-3 ${refMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
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
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setReferees([...referees, { id: uid(), name: "", title: "", company: "", phone: "", email: "" }])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Referee
                        </Button>
                        {referees.length === 0 && experiences.length > 0 && (
                          <Button variant="secondary" className="flex-1" onClick={generateReferencesFromExperience}>
                            <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Areas of Expertise ── */}
                  {currentKey === "expertise" && (
                    <div className="space-y-3">
                      {areasOfExpertise.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No areas of expertise added yet</p>
                      )}
                      {areasOfExpertise.map((area) => (
                        <div key={area.id} className={`flex gap-2 items-start ${!area.name?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!area.name?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Area name (e.g. Project Management) *" value={area.name} onChange={(e) => setAreasOfExpertise(areasOfExpertise.map((a) => a.id === area.id ? { ...a, name: e.target.value } : a))} />
                          <Input className="flex-1" placeholder="Brief description (optional)" value={area.description} onChange={(e) => setAreasOfExpertise(areasOfExpertise.map((a) => a.id === area.id ? { ...a, description: e.target.value } : a))} />
                          <Button variant="ghost" size="sm" onClick={() => setAreasOfExpertise(areasOfExpertise.filter((a) => a.id !== area.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setAreasOfExpertise([...areasOfExpertise, { id: uid(), name: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Area of Expertise
                      </Button>
                    </div>
                  )}

                  {/* ── Key Achievements ── */}
                  {currentKey === "achievements" && (
                    <div className="space-y-3">
                      {keyAchievements.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No achievements added yet</p>
                      )}
                      {keyAchievements.map((ach) => (
                        <div key={ach.id} className={`flex gap-2 items-center ${!ach.achievement?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!ach.achievement?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Key achievement or accomplishment *" value={ach.achievement} onChange={(e) => setKeyAchievements(keyAchievements.map((a) => a.id === ach.id ? { ...a, achievement: e.target.value } : a))} />
                          <Button variant="ghost" size="sm" onClick={() => setKeyAchievements(keyAchievements.filter((a) => a.id !== ach.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setKeyAchievements([...keyAchievements, { id: uid(), achievement: "" }])}>
                          <Plus className="mr-2 h-4 w-4" /> Add Achievement
                        </Button>
                        {keyAchievements.length === 0 && experiences.length > 0 && (
                          <Button variant="secondary" className="flex-1" onClick={generateAchievementsFromExperience}>
                            <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Awards ── */}
                  {currentKey === "awards" && (
                    <div className="space-y-3">
                      {awards.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No awards added yet</p>
                      )}
                      {awards.map((award) => (
                        <div key={award.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium">Award</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setAwards(awards.filter((a) => a.id !== award.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <Input placeholder="Award title *" value={award.title} onChange={(e) => setAwards(awards.map((a) => a.id === award.id ? { ...a, title: e.target.value } : a))} />
                          <Textarea placeholder="Award description (optional)" value={award.description} onChange={(e) => setAwards(awards.map((a) => a.id === award.id ? { ...a, description: e.target.value } : a))} rows={2} />
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setAwards([...awards, { id: uid(), title: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Award
                      </Button>
                    </div>
                  )}

                  {/* ── Memberships ── */}
                  {currentKey === "memberships" && (
                    <div className="space-y-3">
                      {memberships.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No memberships added yet</p>
                      )}
                      {memberships.map((mem) => (
                        <div key={mem.id} className={`flex gap-2 items-center ${!mem.name?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!mem.name?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Professional membership or affiliation *" value={mem.name} onChange={(e) => setMemberships(memberships.map((m) => m.id === mem.id ? { ...m, name: e.target.value } : m))} />
                          <Button variant="ghost" size="sm" onClick={() => setMemberships(memberships.filter((m) => m.id !== mem.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setMemberships([...memberships, { id: uid(), name: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Membership
                      </Button>
                    </div>
                  )}

                  {/* ── Projects ── */}
                  {currentKey === "projects" && (
                    <div className="space-y-4">
                      {projects.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No projects added yet</p>
                      )}
                      {projects.map((proj, i) => {
                        const projMissing = getItemMissing("projects", proj);
                        return (
                        <div key={proj.id} className={`border rounded-lg p-4 space-y-3 ${projMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
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
                      <Button variant="outline" className="w-full" onClick={() => setProjects([...projects, { id: uid(), name: "", description: "", tech: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Project
                      </Button>
                    </div>
                  )}

                  {/* ── Board / Leadership Roles ── */}
                  {currentKey === "boardRoles" && (
                    <div className="space-y-4">
                      {boardRoles.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No board or leadership roles added yet</p>
                      )}
                      {boardRoles.map((role, i) => {
                        const brMissing = getItemMissing("boardRoles", role);
                        return (
                        <div key={role.id} className={`border rounded-lg p-4 space-y-3 ${brMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
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
                      <Button variant="outline" className="w-full" onClick={() => setBoardRoles([...boardRoles, { id: uid(), title: "", organization: "", startDate: "", endDate: "", description: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Board Role
                      </Button>
                    </div>
                  )}

                  {/* ── Executive Training ── */}
                  {currentKey === "execTraining" && (
                    <div className="space-y-3">
                      {execTraining.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No executive training added yet</p>
                      )}
                      {execTraining.map((tr) => (
                        <div key={tr.id} className={`flex gap-2 items-center ${!tr.name?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!tr.name?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="Program name *" value={tr.name} onChange={(e) => setExecTraining(execTraining.map((t) => t.id === tr.id ? { ...t, name: e.target.value } : t))} />
                          <Input className="w-40" placeholder="Institution" value={tr.institution} onChange={(e) => setExecTraining(execTraining.map((t) => t.id === tr.id ? { ...t, institution: e.target.value } : t))} />
                          <Input className="w-24" placeholder="Year" value={tr.year} onChange={(e) => setExecTraining(execTraining.map((t) => t.id === tr.id ? { ...t, year: e.target.value } : t))} />
                          <Button variant="ghost" size="sm" onClick={() => setExecTraining(execTraining.filter((t) => t.id !== tr.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setExecTraining([...execTraining, { id: uid(), name: "", institution: "", year: "" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Training
                      </Button>
                    </div>
                  )}

                  {/* ── Publications / Speaking ── */}
                  {currentKey === "publications" && (
                    <div className="space-y-4">
                      {publications.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No publications or speaking engagements added yet</p>
                      )}
                      {publications.map((pub, i) => {
                        const pubMissing = getItemMissing("publications", pub);
                        return (
                        <div key={pub.id} className={`border rounded-lg p-4 space-y-3 ${pubMissing.length > 0 ? "border-red-300 bg-red-50/30" : ""}`}>
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
                      <Button variant="outline" className="w-full" onClick={() => setPublications([...publications, { id: uid(), title: "", publisher: "", year: "", type: "publication" }])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Publication
                      </Button>
                    </div>
                  )}

                  {/* ── Tools & Software ── */}
                  {currentKey === "tools" && (
                    <div className="space-y-3">
                      {tools.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No tools or software added yet</p>
                      )}
                      {tools.map((tool, i) => (
                        <div key={i} className={`flex gap-2 items-center ${!tool?.trim() ? "bg-red-50/30 border border-red-300 rounded-lg p-1.5" : ""}`}>
                          <Input className={`flex-1 ${!tool?.trim() ? "border-red-300 bg-red-50/30" : ""}`} placeholder="e.g. SAP ERP, Microsoft Excel, Figma *" value={tool} onChange={(e) => { const t = [...tools]; t[i] = e.target.value; setTools(t); }} />
                          <Button variant="ghost" size="sm" onClick={() => setTools(tools.filter((_, j) => j !== i))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setTools([...tools, ""])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tool
                      </Button>
                    </div>
                  )}

                  {/* ── Volunteer ── */}
                  {currentKey === "volunteer" && (
                    <div className="space-y-3">
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
                      <Button variant="outline" className="w-full" onClick={() => setVolunteer([...volunteer, ""])}>
                        <Plus className="mr-2 h-4 w-4" /> Add Volunteer Experience
                      </Button>
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
              </Card>

              {/* ── Footer Navigation ── */}
              <div className="flex items-center justify-between mt-6 pb-20 md:pb-0">
                <Button
                  variant="outline"
                  onClick={() => safeIdx > 0 && setActiveTab(SECTIONS[safeIdx - 1].key)}
                  disabled={safeIdx === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {safeIdx < SECTIONS.length - 1 ? (
                  <Button onClick={() => setActiveTab(SECTIONS[safeIdx + 1].key)}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={saveToDatabase} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? "Saving..." : "Confirm & Save"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── Validation Errors Dialog ── */}
      <AlertDialog open={!!validationErrors} onOpenChange={(open) => { if (!open) setValidationErrors(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-6 w-6 text-red-500" /> Cannot Save — Incomplete Fields
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">Incomplete fields</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              The following sections have items with missing required information. Please complete all highlighted fields before saving.
            </p>
            <div className="flex flex-wrap gap-2">
              {validationErrors?.sections.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700">
                  <XCircle className="h-3.5 w-3.5" />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (validationErrors) {
                  const key = validationErrors.firstKey;
                  if (!manuallyShown.has(key)) {
                    setManuallyShown(prev => new Set([...prev, key]));
                  }
                  setActiveTab(key);
                }
                setValidationErrors(null);
              }}
            >
              Go to First Issue
            </AlertDialogAction>
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
