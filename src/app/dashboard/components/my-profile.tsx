"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, FileText, Briefcase, GraduationCap, Sparkles, Award,
  Globe, Users, ScrollText, Mail, Phone, MapPin, Linkedin,
  Link as LinkIcon, Pencil, Trophy, Building2, FolderKanban, Shield,
  BookMarked, PenLine, Wrench, Heart, Plus, Clock,
  AlertCircle, AlertTriangle, XCircle, Loader2, CheckCircle2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CVReadinessBanner from "./cv-readiness-banner";
import { getCategoryGaps } from "@/lib/category-gaps";

interface MyProfileProps {
  personalInfo: any;
  summary: string;
  experiences: any[];
  education: any[];
  skills: any[];
  certifications: any[];
  languages: any[];
  referees: any[];
  declaration: any;
  keyAchievements: any[];
  awards: any[];
  memberships: any[];
  projects: any[];
  boardRoles: any[];
  execTraining: any[];
  publications: any[];
  tools: any[];
  volunteer: any[];
  userId: string;
  cvData: Record<string, unknown>;
}

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

const SECTIONS_BY_CAT: Record<CareerCategory, { required: { key: string; label: string }[]; recommended: { key: string; label: string }[] }> = {
  junior: {
    required: [
      { key: "personal", label: "Personal Info" },
      { key: "summary", label: "Professional Summary" },
      { key: "experience", label: "Experience" },
      { key: "education", label: "Education" },
      { key: "skills", label: "Skills" },
      { key: "languages", label: "Languages" },
      { key: "referees", label: "References" },
    ],
    recommended: [
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
      { key: "skills", label: "Core Competencies" },
      { key: "achievements", label: "Key Achievements" },
      { key: "languages", label: "Languages" },
      { key: "referees", label: "References" },
    ],
    recommended: [
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
      { key: "summary", label: "Executive Profile" },
      { key: "experience", label: "Professional Experience" },
      { key: "education", label: "Education" },
      { key: "skills", label: "Core Leadership Competencies" },
      { key: "achievements", label: "Career Highlights" },
      { key: "languages", label: "Languages" },
      { key: "boardRoles", label: "Board & Advisory Roles" },
      { key: "referees", label: "References" },
    ],
    recommended: [
      { key: "certifications", label: "Professional Certifications" },
      { key: "execTraining", label: "Executive Training" },
      { key: "publications", label: "Publications & Speaking" },
      { key: "awards", label: "Awards & Recognition" },
      { key: "memberships", label: "Professional Affiliations" },
      { key: "projects", label: "Projects" },
    ],
  },
};

function categorizeProfile(
  experiences: any[],
  education: any[],
  boardRoles: any[],
  publications: any[],
  execTraining: any[],
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

  const labels: Record<CareerCategory, string> = {
    junior: "Junior",
    "mid-senior": "Mid-Senior",
    executive: "Executive",
  };
  const colors: Record<CareerCategory, string> = {
    junior: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-100/50",
    "mid-senior": "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200/80 shadow-sm shadow-amber-100/50",
    executive: "bg-[#004aad]/5 text-[#004aad] border-[#004aad]/20 shadow-sm",
  };

  return {
    category,
    label: labels[category],
    color: colors[category],
    score,
    requiredSections: SECTIONS_BY_CAT[category].required,
    recommendedSections: SECTIONS_BY_CAT[category].recommended,
  };
}

export default function MyProfile({
  personalInfo, summary, experiences, education, skills,
  certifications, languages, referees, declaration,
  keyAchievements, awards, memberships, projects, boardRoles, execTraining,
  publications, tools, volunteer, userId, cvData,
}: MyProfileProps) {
  const router = useRouter();
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // ─── CV Readiness Banner state ───
  interface CvReadiness { strength: number; issues: string[]; improvements: string[] }
  const [cvReadiness, setCvReadiness] = useState<CvReadiness | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(true);

  useEffect(() => {
    if (!userId || !cvData) return;
    const supabase = createClient();
    let cancelled = false;
    const SESSION_KEY = `fusecv-readiness-${userId}`;

    async function loadReadiness() {
      try {
        // 1. Hash the cvData
        const dataStr = JSON.stringify(cvData);
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(dataStr));
        const dataHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

        // 2. Check sessionStorage first (avoids DB round-trip on tab switch)
        const session = sessionStorage.getItem(SESSION_KEY);
        if (session) {
          try {
            const parsed = JSON.parse(session);
            if (parsed.hash === dataHash) {
              if (!cancelled) {
                setCvReadiness(parsed.data);
                setLoadingReadiness(false);
              }
              return;
            }
          } catch { /* corrupt session data — fall through */ }
        }

        // 3. Check both DB caches in parallel
        const [{ data: profileCache }, { data: readinessCache }] = await Promise.all([
          supabase.from("profile_analysis").select("data_hash, completeness_score").eq("user_id", userId).single(),
          supabase.from("cv_readiness_cache").select("data_hash, cv_issues, cv_improvements").eq("user_id", userId).single(),
        ]);

        // Use profile_analysis score so it matches CV Studio exactly
        const cachedScore = profileCache?.data_hash === dataHash ? profileCache.completeness_score : null;
        const cachedIssues = readinessCache?.data_hash === dataHash ? { issues: readinessCache.cv_issues, improvements: readinessCache.cv_improvements } : null;

        if (cachedScore !== null && cachedIssues !== null) {
          const readiness: CvReadiness = { strength: cachedScore, ...cachedIssues };
          if (!cancelled) { setCvReadiness(readiness); setLoadingReadiness(false); }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hash: dataHash, data: readiness }));
          return;
        }

        // 4. Call AI for whatever is missing
        const [scoreData, issuesData] = await Promise.all([
          cachedScore === null
            ? fetch("/api/ai/analyze-profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvData }) }).then(r => r.json())
            : Promise.resolve(null),
          cachedIssues === null
            ? fetch("/api/ai/cv-readiness", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvData }) }).then(r => r.json())
            : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const strength = cachedScore ?? (scoreData?.completenessScore ?? 0);
        const issues   = cachedIssues?.issues       ?? (issuesData?.cvIssues       ?? []);
        const improvements = cachedIssues?.improvements ?? (issuesData?.cvImprovements ?? []);
        const readiness: CvReadiness = { strength, issues, improvements };
        setCvReadiness(readiness);

        // 5. Persist to DB + sessionStorage
        const upserts: Promise<unknown>[] = [];
        if (cachedScore === null && scoreData) {
          upserts.push(supabase.from("profile_analysis").upsert(
            { user_id: userId, data_hash: dataHash, completeness_score: strength, strengths: scoreData.strengths ?? [], gaps: scoreData.gaps ?? [] },
            { onConflict: "user_id" }
          ));
        }
        if (cachedIssues === null && issuesData) {
          upserts.push(supabase.from("cv_readiness_cache").upsert(
            { user_id: userId, data_hash: dataHash, cv_strength: strength, cv_issues: issues, cv_improvements: improvements, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          ));
        }
        await Promise.all(upserts);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ hash: dataHash, data: readiness }));
      } catch (err) {
        console.error("[cv-readiness]", err);
      } finally {
        if (!cancelled) setLoadingReadiness(false);
      }
    }

    void loadReadiness();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleGenerateCV = () => {
    setIsGeneratingCV(true);
    router.push("/dashboard?tab=studio");
  };

  const groupedSkills = skills.reduce((acc: Record<string, string[]>, s: any) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  // ─── Universal date parser — handles virtually any CV date format ───
  const parseExpDate = (dateStr: string, endOfPeriod = false): Date | null => {
    if (!dateStr?.trim()) return null;
    const s = dateStr.trim().replace(/\s+/g, " ");
    if (/^(present|current|now|ongoing|till\s*(date|now)|to\s*date|up\s*to\s*date|date|today|continues?)$/i.test(s)) return new Date();
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const yearMatch = s.match(/\b(\d{4})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    if (!year || year < 1900 || year > 2100) return null;
    const MONTHS: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11, january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
    const monthMatch = s.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
    if (monthMatch) {
      const month = MONTHS[monthMatch[1].toLowerCase()];
      return new Date(year, endOfPeriod ? month : month, endOfPeriod ? new Date(year, month + 1, 0).getDate() : 1);
    }
    const mmYYYY = s.match(/^(\d{1,2})[\/\-\.](\d{4})$/);
    if (mmYYYY) return new Date(parseInt(mmYYYY[2]), parseInt(mmYYYY[1]) - 1, 1);
    const yyyyMM = s.match(/^(\d{4})[\/\-\.](\d{1,2})$/);
    if (yyyyMM) return new Date(parseInt(yyyyMM[1]), parseInt(yyyyMM[2]) - 1, 1);
    const ddmmyyyy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (ddmmyyyy) return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
    const yyyyddmm = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (yyyyddmm) return new Date(parseInt(yyyyddmm[1]), parseInt(yyyyddmm[3]) - 1, parseInt(yyyyddmm[2]));
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

  // ─── Career Categorization — prefer DB-saved value, fall back to computed ───
  const numericYears = typeof yearsOfExperience === "string" ? 0 : Number(yearsOfExperience);
  const computedCategory = categorizeProfile(
    experiences, education, boardRoles, publications, execTraining, numericYears
  );
  const dbCategory = (cvData as any)?.careerCategory as CareerCategory | null | undefined;
  const categoryResult: CategoryResult = dbCategory
    ? { ...computedCategory, category: dbCategory, label: { junior: "Junior", "mid-senior": "Mid-Senior", executive: "Executive" }[dbCategory], color: { junior: "bg-emerald-50 text-emerald-700 border-emerald-200", "mid-senior": "bg-[#ff751f]/10 text-[#ff751f] border-[#ff751f]/20", executive: "bg-[#004aad]/5 text-[#004aad] border-[#004aad]/20" }[dbCategory], requiredSections: SECTIONS_BY_CAT[dbCategory].required, recommendedSections: SECTIONS_BY_CAT[dbCategory].recommended }
    : computedCategory;

  // ─── Section content checks ───
  const sectionHasContent: Record<string, boolean> = {
    personal: !!personalInfo?.fullName,
    summary: !!summary?.trim(),
    experience: experiences.length > 0,
    education: education.length > 0 || certifications.length > 0,
    achievements: keyAchievements.length > 0,
    skills: skills.length > 0,
    certifications: certifications.length > 0,
    languages: languages.length > 0,
    projects: projects.length > 0,
    boardRoles: boardRoles.length > 0,
    execTraining: execTraining.length > 0,
    publications: publications.length > 0,
    tools: tools.length > 0,
    volunteer: volunteer.length > 0,
    awards: awards.length > 0,
    memberships: memberships.length > 0,
    referees: referees.length > 0,
    declaration: !!declaration?.declaration,
  };

  // Missing sections based on category
  const missingRequired = categoryResult.requiredSections.filter(s => !sectionHasContent[s.key]);
  const missingRecommended = categoryResult.recommendedSections.filter(s => !sectionHasContent[s.key]);

  // ─── Section renderers ───
  type SectionDef = { key: string; label: string; icon: any; hasContent: boolean; render: () => React.ReactNode };

  const allSections: SectionDef[] = [
    {
      key: "summary", label: "Professional Summary", icon: FileText, hasContent: sectionHasContent.summary,
      render: () => summary ? (
        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{summary}</p>
      ) : <p className="text-muted-foreground italic">No summary added</p>,
    },
    {
      key: "experience", label: "Work Experience", icon: Briefcase, hasContent: sectionHasContent.experience,
      render: () => experiences.length > 0 ? (
        <div className="space-y-4">{experiences.map((exp: any, i: number) => (
          <div key={exp.id || i}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{exp.title}</h3>
                  {exp.company && <p className="text-sm text-primary">{exp.company}{exp.location ? ` — ${exp.location}` : ""}</p>}
                </div>
                {(exp.startDate || exp.endDate) && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                  </Badge>
                )}
              </div>
              {exp.description && <p className="text-sm text-muted-foreground whitespace-pre-line mt-2">{exp.description}</p>}
            </div>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No work experience added</p>,
    },
    {
      key: "education", label: "Education", icon: GraduationCap, hasContent: sectionHasContent.education,
      render: () => education.length > 0 ? (
        <div className="space-y-4">{education.map((edu: any, i: number) => (
          <div key={edu.id || i}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{edu.degree}</h3>
                {edu.institution && <p className="text-sm text-primary">{edu.institution}</p>}
              </div>
              {edu.year && <Badge variant="outline" className="text-xs shrink-0">{edu.year}</Badge>}
            </div>
            {edu.description && <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>}
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No education added</p>,
    },
    {
      key: "achievements", label: "Key Achievements", icon: Trophy, hasContent: sectionHasContent.achievements,
      render: () => keyAchievements.length > 0 ? (
        <div className="space-y-2">{keyAchievements.map((ach: any, i: number) => (
          <div key={ach.id || i} className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
            <p className="text-sm">{ach.achievement}</p>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No key achievements added</p>,
    },
    {
      key: "awards", label: "Awards & Recognition", icon: Award, hasContent: sectionHasContent.awards,
      render: () => awards.length > 0 ? (
        <div className="space-y-3">{awards.map((award: any, i: number) => (
          <div key={award.id || i} className="border-l-2 border-amber-200 pl-3">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-sm">{award.title}</h4>
            </div>
            {award.description && <p className="text-sm text-muted-foreground">{award.description}</p>}
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No awards added</p>,
    },
    {
      key: "skills", label: "Skills", icon: Sparkles, hasContent: sectionHasContent.skills,
      render: () => skills.length > 0 ? (
        <div className="space-y-3">{Object.entries(groupedSkills).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{category}</p>
            <div className="flex flex-wrap gap-1.5">{(items as string[]).map((skill: string, i: number) => (
              <Badge key={i} variant="secondary">{skill}</Badge>
            ))}</div>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No skills added</p>,
    },
    {
      key: "certifications", label: "Certifications", icon: Award, hasContent: sectionHasContent.certifications,
      render: () => certifications.length > 0 ? (
        <div className="space-y-2">{certifications.map((cert: any, i: number) => (
          <div key={cert.id || i} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{cert.name}</p>
              {cert.issuer && <p className="text-xs text-muted-foreground">{cert.issuer}</p>}
            </div>
            {cert.year && <Badge variant="outline" className="text-xs">{cert.year}</Badge>}
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No certifications added</p>,
    },
    {
      key: "languages", label: "Languages", icon: Globe, hasContent: sectionHasContent.languages,
      render: () => languages.length > 0 ? (
        <div className="flex flex-wrap gap-3">{languages.map((lang: any, i: number) => (
          <div key={lang.id || i} className="border rounded-lg px-3 py-2 text-center">
            <p className="font-medium text-sm">{lang.name}</p>
            {lang.proficiency && <p className="text-xs text-muted-foreground">{lang.proficiency}</p>}
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No languages added</p>,
    },
    {
      key: "projects", label: "Projects", icon: FolderKanban, hasContent: sectionHasContent.projects,
      render: () => projects.length > 0 ? (
        <div className="space-y-4">{projects.map((proj: any, i: number) => (
          <div key={proj.id || i}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="space-y-2">
              <h3 className="font-semibold">{proj.name}</h3>
              {proj.description && <p className="text-sm text-muted-foreground">{proj.description}</p>}
              {proj.tech && <p className="text-xs text-primary mt-1">Technologies: {proj.tech}</p>}
            </div>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No projects added</p>,
    },
    {
      key: "boardRoles", label: "Board & Advisory Roles", icon: Shield, hasContent: sectionHasContent.boardRoles,
      render: () => boardRoles.length > 0 ? (
        <div className="space-y-4">{boardRoles.map((role: any, i: number) => (
          <div key={role.id || i}>
            {i > 0 && <Separator className="mb-4" />}
            <div className="space-y-1">
              <h3 className="font-semibold">{role.title}</h3>
              {role.organization && <p className="text-sm text-primary">{role.organization}</p>}
              {(role.startDate || role.endDate) && (
                <Badge variant="outline" className="text-xs">{role.startDate}{role.startDate && role.endDate ? " – " : ""}{role.endDate}</Badge>
              )}
              {role.description && <p className="text-sm text-muted-foreground mt-2">{role.description}</p>}
            </div>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No board roles added</p>,
    },
    {
      key: "execTraining", label: "Executive Training", icon: BookMarked, hasContent: sectionHasContent.execTraining,
      render: () => execTraining.length > 0 ? (
        <div className="space-y-2">{execTraining.map((t: any, i: number) => (
          <div key={t.id || i} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t.name}</p>
              {t.institution && <p className="text-xs text-muted-foreground">{t.institution}</p>}
            </div>
            {t.year && <Badge variant="outline" className="text-xs">{t.year}</Badge>}
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No executive training added</p>,
    },
    {
      key: "publications", label: "Publications & Speaking", icon: PenLine, hasContent: sectionHasContent.publications,
      render: () => publications.length > 0 ? (
        <div className="space-y-2">{publications.map((pub: any, i: number) => (
          <div key={pub.id || i} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{pub.title}</p>
              {pub.publisher && <p className="text-xs text-muted-foreground">{pub.publisher}</p>}
            </div>
            <div className="flex items-center gap-2">
              {pub.type && <Badge variant="outline" className="text-xs">{pub.type}</Badge>}
              {pub.year && <Badge variant="outline" className="text-xs">{pub.year}</Badge>}
            </div>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No publications added</p>,
    },
    {
      key: "tools", label: "Tools & Software", icon: Wrench, hasContent: sectionHasContent.tools,
      render: () => tools.length > 0 ? (
        <div className="flex flex-wrap gap-2">{tools.map((tool: any, i: number) => (
          <Badge key={i} variant="secondary">{typeof tool === "string" ? tool : tool.name || ""}</Badge>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No tools added</p>,
    },
    {
      key: "volunteer", label: "Volunteer Experience", icon: Heart, hasContent: sectionHasContent.volunteer,
      render: () => volunteer.length > 0 ? (
        <div className="space-y-2">{volunteer.map((vol: string, i: number) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
            <p className="text-sm">{vol}</p>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No volunteer experience added</p>,
    },
    {
      key: "memberships", label: "Professional Memberships", icon: Building2, hasContent: sectionHasContent.memberships,
      render: () => memberships.length > 0 ? (
        <div className="flex flex-wrap gap-2">{memberships.map((mem: any, i: number) => (
          <Badge key={mem.id || i} variant="secondary">{mem.name}</Badge>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No memberships added</p>,
    },
    {
      key: "referees", label: "Referees", icon: Users, hasContent: sectionHasContent.referees,
      render: () => referees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{referees.map((ref: any, i: number) => (
          <div key={ref.id || i} className="border rounded-lg p-4 space-y-1">
            <p className="font-semibold">{ref.name}</p>
            {ref.title && <p className="text-sm text-muted-foreground">{ref.title}</p>}
            {ref.company && <p className="text-sm text-primary">{ref.company}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
              {ref.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{ref.phone}</span>}
              {ref.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{ref.email}</span>}
            </div>
          </div>
        ))}</div>
      ) : <p className="text-muted-foreground italic">No referees added</p>,
    },
    {
      key: "declaration", label: "Declaration", icon: ScrollText, hasContent: sectionHasContent.declaration,
      render: () => declaration?.declaration ? (
        <>
          <p className="text-muted-foreground italic leading-relaxed">{declaration.declaration}</p>
          <p className="text-sm text-muted-foreground mt-3">
            {declaration.place}{declaration.place && declaration.date ? ", " : ""}{declaration.date}
          </p>
        </>
      ) : <p className="text-muted-foreground italic">No declaration added</p>,
    },
  ];

  // Sort: filled sections first, empty sections last
  const filledSections = allSections.filter(s => s.hasContent);
  const emptySections = allSections.filter(s => !s.hasContent);

  return (
    <div className="space-y-6 stagger-children">
      {/* ─── Edit CV button — top right ─── */}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setIsEditingCV(true); router.push("/cv-builder"); }} disabled={isEditingCV} className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm">
          {isEditingCV ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
          {isEditingCV ? "Loading..." : "Edit CV"}
        </Button>
      </div>

      {/* ─── CV Readiness Banner ─── */}
      {(() => {
        /* ── Loading skeleton — shown until data is ready ── */
        if (loadingReadiness) {
          return (
            <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(140deg, #07111f 0%, #001260 100%)" }}>
              <style>{`.mp-skel{animation:mp-pulse 1.6s ease-in-out infinite;border-radius:6px;background:rgba(255,255,255,0.1)} @keyframes mp-pulse{0%,100%{opacity:.3}50%{opacity:.6}}`}</style>
              {/* Dot grid */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
              {/* Top: ring + text skeletons */}
              <div className="px-5 pt-5 pb-4 flex items-center gap-5 relative z-10">
                {/* Ring skeleton */}
                <div className="relative flex-shrink-0 w-[80px] h-[80px]">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r={34} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                    <circle cx="40" cy="40" r={34} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7"
                      strokeLinecap="round" strokeDasharray="54 160" transform="rotate(-90 40 40)"
                      style={{ animation: "mp-pulse 1.6s ease-in-out infinite" }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.28)" }} />
                  </div>
                </div>
                {/* Text + bar skeletons */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="mp-skel h-4 w-3/4" />
                  <div className="mp-skel h-3 w-1/3" />
                  <div className="mp-skel h-1.5 w-full rounded-full" />
                </div>
              </div>
              {/* CTA skeleton */}
              <div className="px-5 pb-5 relative z-10 space-y-2.5">
                <div className="mp-skel h-3 w-2/3" />
                <div className="mp-skel h-11 w-full rounded-xl" />
              </div>
              {/* Bottom grid skeletons */}
              <div className="grid sm:grid-cols-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="px-5 py-4 space-y-2 border-b sm:border-b-0 sm:border-r" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="mp-skel h-3 w-1/3" />
                  {[75, 90, 65, 80, 70].map((w, i) => <div key={i} className="mp-skel h-2.5" style={{ width: `${w}%` }} />)}
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="mp-skel h-3 w-2/5" />
                  {[85, 70, 80, 60, 75].map((w, i) => <div key={i} className="mp-skel h-2.5" style={{ width: `${w}%` }} />)}
                </div>
              </div>
            </div>
          );
        }

        // Use shared getCategoryGaps so scores match CV Studio exactly.
        const _gaps = getCategoryGaps(categoryResult.category, cvData as Record<string, unknown>);
        const _recGaps = _gaps.filter(g => g.startsWith("[Recommended] "));
        const rawScore = cvReadiness?.strength ?? 0;
        const score = Math.max(0, rawScore - _recGaps.length * 5);
        const isReady = score >= 75;

        const missingIssues = _recGaps.map(g => g.replace("[Recommended] ", "Missing: "));
        const augmentedReadiness = cvReadiness
          ? { ...cvReadiness, issues: [...(cvReadiness.issues ?? []), ...missingIssues] }
          : cvReadiness;

        return (
          <CVReadinessBanner
            score={score}
            isReady={isReady}
            isAnalyzing={false}
            cvReadiness={augmentedReadiness}
            onGenerate={handleGenerateCV}
            isGenerating={isGeneratingCV}
          />
        );
      })()}

      {/* Header: Badges */}
      <div className="flex flex-wrap items-center gap-3">
        {experiences.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#004aad]/5 text-[#004aad] rounded-xl border border-[#004aad]/20 shadow-sm">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold">{yearsOfExperience} yrs experience</span>
          </div>
        )}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${categoryResult.color}`}>
          <Briefcase className="h-4 w-4" />
          {categoryResult.label} Level
        </div>
      </div>

      {/* Missing Sections Warning */}
      {(missingRequired.length > 0 || missingRecommended.length > 0) && (
        <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-elevated">
          {missingRequired.length > 0 && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Required sections missing for {categoryResult.label} profile ({missingRequired.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingRequired.map(s => (
                  <button key={s.key} onClick={() => router.push(`/cv-builder?tab=${s.key}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-xl text-xs font-medium text-red-700 hover:bg-red-50 hover:border-red-300 cursor-pointer transition-all shadow-sm">
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
                    disabled={loadingSection === s.key}
                    onClick={() => { setLoadingSection(s.key); router.push(`/cv-builder?tab=${s.key}`); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 hover:border-amber-300 cursor-pointer transition-all shadow-sm disabled:opacity-70 disabled:cursor-default"
                  >
                    {loadingSection === s.key
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Plus className="h-3 w-3" />}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personal Info — always first */}
      <Card className={`shadow-elevated rounded-2xl border-slate-200/60 overflow-hidden ${!personalInfo?.fullName ? "opacity-40" : ""}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-2xl bg-[#004aad] shadow-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalInfo?.fullName ? (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">{personalInfo.fullName || personalInfo.full_name}</h2>
              {personalInfo.headline && <p className="text-muted-foreground text-lg">{personalInfo.headline}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {personalInfo.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {personalInfo.email}</span>}
                {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {personalInfo.phone}</span>}
                {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {personalInfo.location}</span>}
                {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-4 w-4" /> {personalInfo.linkedin}</span>}
                {personalInfo.website && <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4" /> {personalInfo.website}</span>}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No personal information added</p>
          )}
        </CardContent>
      </Card>

      {/* Filled sections */}
      {filledSections.map((sec) => {
        const Icon = sec.icon;
        const count = sec.key === "experience" ? experiences.length
          : sec.key === "education" ? education.length
          : sec.key === "achievements" ? keyAchievements.length
          : sec.key === "skills" ? skills.length
          : sec.key === "certifications" ? certifications.length
          : sec.key === "languages" ? languages.length
          : sec.key === "projects" ? projects.length
          : sec.key === "boardRoles" ? boardRoles.length
          : sec.key === "execTraining" ? execTraining.length
          : sec.key === "publications" ? publications.length
          : sec.key === "tools" ? tools.length
          : sec.key === "volunteer" ? volunteer.length
          : sec.key === "memberships" ? memberships.length
          : sec.key === "referees" ? referees.length
          : 0;
        return (
          <Card key={sec.key} className="shadow-elevated rounded-2xl border-slate-200/60 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-2xl bg-[#004aad] shadow-sm">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {sec.label}
                {count > 0 && <Badge variant="secondary" className="ml-auto rounded-lg">{count}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>{sec.render()}</CardContent>
          </Card>
        );
      })}

      {/* Empty sections — faint */}
      {emptySections.length > 0 && (
        <>
          <Separator />
          <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">Sections without content</p>
          {emptySections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Card key={sec.key} className="opacity-40 shadow-elevated rounded-2xl border-slate-200/60 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-sm">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    {sec.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>{sec.render()}</CardContent>
              </Card>
            );
          })}
        </>
      )}
      {/* Footer */}
      <div className="border-t border-slate-200 mt-4 pt-5 pb-2 text-center space-y-1">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} FuseCV. All rights reserved.</p>
        <p className="text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-[#004aad] transition-colors">Privacy Policy</Link>
          {" · "}
          <Link href="/unsubscribe" className="hover:text-[#004aad] transition-colors">Unsubscribe</Link>
        </p>
      </div>
    </div>
  );
}
