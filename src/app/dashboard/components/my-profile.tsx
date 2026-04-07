"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, FileText, Briefcase, GraduationCap, Sparkles, Award,
  Globe, Users, ScrollText, Mail, Phone, MapPin, Linkedin,
  Link as LinkIcon, Pencil, Trophy, Building2, FolderKanban, Shield,
  BookMarked, PenLine, Wrench, Heart, Plus, Clock,
  AlertCircle, AlertTriangle, XCircle, Loader2,
} from "lucide-react";
import React, { useState } from "react";

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
    executive: "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200/80 shadow-sm shadow-purple-100/50",
  };

  // ── Required & recommended sections per category ──
  const SECTIONS_BY_CAT: Record<CareerCategory, { required: { key: string; label: string }[]; recommended: { key: string; label: string }[] }> = {
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
  publications, tools, volunteer,
}: MyProfileProps) {
  const router = useRouter();
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);

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

  // ─── Career Categorization ───
  const numericYears = typeof yearsOfExperience === "string" ? 0 : Number(yearsOfExperience);
  const categoryResult = categorizeProfile(
    experiences, education, boardRoles, publications, execTraining, numericYears
  );

  // ─── Section content checks ───
  const sectionHasContent: Record<string, boolean> = {
    personal: !!personalInfo?.fullName,
    summary: !!summary?.trim(),
    experience: experiences.length > 0,
    education: education.length > 0,
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
        <div className="flex flex-wrap gap-2">{tools.map((tool: string, i: number) => (
          <Badge key={i} variant="secondary">{tool}</Badge>
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
      {/* Header: Badges + Actions */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-3">
          {experiences.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl border border-blue-200/80 shadow-sm shadow-blue-100/50">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">{yearsOfExperience} yrs experience</span>
            </div>
          )}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${categoryResult.color}`}>
            <Briefcase className="h-4 w-4" />
            {categoryResult.label} Level
          </div>
        </div>
        
        {/* Actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button size="sm" variant="default" onClick={handleGenerateCV} disabled={isGeneratingCV} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/40 rounded-xl border-0">
            {isGeneratingCV ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isGeneratingCV ? "Loading..." : "Generate CV"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/cv-builder")} className="w-full sm:w-auto rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm">
            <Pencil className="mr-2 h-4 w-4" /> Edit CV
          </Button>
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
                  <button key={s.key} onClick={() => router.push(`/cv-builder?tab=${s.key}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 hover:border-amber-300 cursor-pointer transition-all shadow-sm">
                    <Plus className="h-3 w-3" />
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
            <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
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
                <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
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
    </div>
  );
}
