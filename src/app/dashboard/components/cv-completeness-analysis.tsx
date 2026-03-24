"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, User, Briefcase, Award } from "lucide-react";
import type { CVTemplateData } from "@/components/cv-templates";

// ─── Career Level Detection ───
type CareerLevel = "junior" | "mid-senior" | "executive";

interface CareerLevelInfo {
  level: CareerLevel;
  label: string;
  icon: React.ReactNode;
  yearsExp: number;
  description: string;
}

// ─── Title Tier Classification ───
type TitleTier = "executive" | "senior" | "mid" | "junior";

const TITLE_PATTERNS: { tier: TitleTier; pattern: RegExp }[] = [
  // Executive: C-suite, Director-level, VP, Head of — people who set strategy
  { tier: "executive", pattern: /\b(director|vp|vice president|ceo|cfo|cto|coo|cio|cmo|chro|managing director|chief .+ officer|chief|head of|president|partner|principal|general manager|country manager|regional manager|dean|professor)\b/i },
  // Senior: Managers, Senior [X], Leads — people who manage teams/functions
  { tier: "senior", pattern: /\b(senior|lead|manager|supervisor|team lead|superintendent|controller|head)\b/i },
  // Mid: Individual contributors with established expertise
  { tier: "mid", pattern: /\b(analyst|officer|specialist|coordinator|consultant|engineer|accountant|advisor|planner|administrator|executive(?! )|associate(?! director))\b/i },
  // Junior: Entry-level roles
  { tier: "junior", pattern: /\b(assistant|intern|trainee|junior|graduate|entry.?level|apprentice|clerk|receptionist)\b/i },
];

function classifyTitle(title: string): TitleTier {
  const t = (title || "").trim();
  for (const { tier, pattern } of TITLE_PATTERNS) {
    if (pattern.test(t)) return tier;
  }
  return "mid"; // default to mid if unrecognized
}

// ─── Scope indicators in descriptions ───
function detectScopeSignals(exps: CVTemplateData["experiences"]): { hasBudget: boolean; hasTeamMgmt: boolean; hasStrategy: boolean; hasBoard: boolean } {
  const allDesc = exps.map((e) => `${e.title} ${e.description || ""}`).join(" ").toLowerCase();
  return {
    hasBudget: /\b(p&l|profit.?loss|budget|revenue|million|\$\d+m|\bm\b.*budget|annual.*budget)\b/i.test(allDesc),
    hasTeamMgmt: /\b(managed.*team|led.*team|supervised.*staff|direct reports|\d+\+?\s*(people|staff|employees|members|reports))\b/i.test(allDesc),
    hasStrategy: /\b(strategic|transformation|organizational change|restructur|m&a|merger|acquisition|governance|stakeholder.*board)\b/i.test(allDesc),
    hasBoard: /\b(board|advisory|governance|non.?executive|trustee)\b/i.test(allDesc),
  };
}

function detectCareerLevel(data: CVTemplateData): CareerLevelInfo {
  const exps = data.experiences || [];
  if (exps.length === 0) {
    return {
      level: "junior", label: "Junior / Career Switcher", icon: <User className="h-5 w-5" />,
      yearsExp: 0, description: "No professional experience detected yet. Your CV should emphasize education, projects, skills, and any volunteer or internship experience.",
    };
  }

  // Sort by start date descending (most recent first)
  const sorted = [...exps].sort((a, b) => {
    const ya = parseInt((a.startDate || "0").match(/(\d{4})/)?.[1] || "0");
    const yb = parseInt((b.startDate || "0").match(/(\d{4})/)?.[1] || "0");
    return yb - ya;
  });

  // Calculate years span
  let earliestYear = new Date().getFullYear();
  let latestYear = 0;
  for (const exp of exps) {
    const sy = parseInt((exp.startDate || "").match(/(\d{4})/)?.[1] || "9999");
    const ey = parseInt((exp.endDate || "").match(/(\d{4})/)?.[1] || "0");
    if (sy < earliestYear) earliestYear = sy;
    if (ey > latestYear) latestYear = ey;
    if (/ongoing|present|current/i.test(exp.endDate || "")) latestYear = new Date().getFullYear();
  }
  const yearsExp = latestYear > earliestYear ? latestYear - earliestYear : 0;

  // Classify every role's title tier
  const tiers = sorted.map((e) => classifyTitle(e.title));
  const currentTier = tiers[0]; // most recent role
  const scope = detectScopeSignals(exps);

  // Count how many roles fall in each tier
  const tierCounts = { executive: 0, senior: 0, mid: 0, junior: 0 };
  tiers.forEach((t) => tierCounts[t]++);

  // ─── Decision Logic (based on actual professional experience, not just years) ───

  // EXECUTIVE: Current role is executive-tier, OR multiple executive roles + strategic scope
  const isExecutive =
    currentTier === "executive" ||
    (tierCounts.executive >= 2) ||
    (currentTier === "senior" && scope.hasBoard && scope.hasStrategy);

  if (isExecutive) {
    return {
      level: "executive",
      label: "Researcher / Executive",
      icon: <Award className="h-5 w-5" />,
      yearsExp,
      description: `Executive-level career with ${yearsExp > 0 ? yearsExp + "+" : ""} years of experience. Current role: ${sorted[0]?.title || "N/A"}. Your CV should showcase leadership, board roles, publications, and strategic achievements.`,
    };
  }

  // MID-SENIOR: Current role is senior-tier, or has progression from junior/mid → senior,
  // or has multiple mid-tier roles showing established career
  const isMidSenior =
    currentTier === "senior" ||
    (currentTier === "mid" && (tierCounts.mid + tierCounts.senior) >= 3) ||
    (currentTier === "mid" && scope.hasTeamMgmt) ||
    (currentTier === "mid" && scope.hasBudget) ||
    (exps.length >= 4 && tierCounts.junior <= 1);

  if (isMidSenior) {
    return {
      level: "mid-senior",
      label: "Mid-Senior Professional",
      icon: <Briefcase className="h-5 w-5" />,
      yearsExp,
      description: `Established professional career with ${yearsExp > 0 ? yearsExp : "several"} years of experience. Current role: ${sorted[0]?.title || "N/A"}. Your CV should highlight key achievements, professional memberships, and demonstrate career progression.`,
    };
  }

  // JUNIOR: Everything else — early career, few roles, entry-level titles
  return {
    level: "junior",
    label: "Junior / Career Switcher",
    icon: <User className="h-5 w-5" />,
    yearsExp,
    description: `${yearsExp > 0 ? yearsExp + " years" : "Early stage"} in your career. Current role: ${sorted[0]?.title || "N/A"}. Your CV should emphasize education, projects, skills, and any volunteer or internship experience.`,
  };
}

// ─── Expected Sections per Career Level ───
interface SectionSpec {
  key: string;
  label: string;
  importance: "required" | "recommended" | "optional";
  tip: string;
}

const SECTIONS_BY_LEVEL: Record<CareerLevel, SectionSpec[]> = {
  junior: [
    { key: "summary", label: "Professional Summary", importance: "required", tip: "Write a concise 2-3 sentence summary highlighting your education, key skills, and career objective." },
    { key: "skills", label: "Skills", importance: "required", tip: "List 8-12 relevant technical and soft skills organized by category." },
    { key: "experience", label: "Professional Experience", importance: "required", tip: "Include internships, part-time roles, and freelance work. Use the STAR method for bullet points." },
    { key: "education", label: "Education", importance: "required", tip: "Include GPA (if above 3.0), relevant coursework, academic honors, and thesis topics." },
    { key: "projects", label: "Projects / Portfolio", importance: "recommended", tip: "Showcase 2-4 relevant projects with descriptions and technologies used. This compensates for limited work experience." },
    { key: "certifications", label: "Certifications", importance: "recommended", tip: "Include professional certifications, online courses, and training programs that demonstrate continuous learning." },
    { key: "volunteer", label: "Volunteer Experience", importance: "recommended", tip: "Include volunteer work, community involvement, or extracurricular activities that show leadership and initiative." },
    { key: "languages", label: "Languages", importance: "optional", tip: "List languages with proficiency levels. Multilingual ability is valued in international roles." },
    { key: "referees", label: "References", importance: "optional", tip: "Include 2-3 professional or academic references who can vouch for your abilities." },
    { key: "declaration", label: "Declaration", importance: "optional", tip: "A formal statement certifying the accuracy of CV information." },
  ],
  "mid-senior": [
    { key: "summary", label: "Professional Summary", importance: "required", tip: "Write a 3-4 sentence summary with years of experience, core expertise, and 2-3 quantified achievements." },
    { key: "skills", label: "Core Competencies", importance: "required", tip: "List 12-18 skills organized by category (Core, Technical, Leadership, Tools)." },
    { key: "experience", label: "Professional Experience", importance: "required", tip: "Include 3-5 STAR method bullet points per role. Quantify every achievement with %, $, or time metrics." },
    { key: "keyAchievements", label: "Key Achievements", importance: "required", tip: "Highlight 3-5 career-defining achievements that demonstrate impact across roles." },
    { key: "education", label: "Education", importance: "required", tip: "Include highest degree, institution, and relevant honors or specializations." },
    { key: "certifications", label: "Certifications", importance: "recommended", tip: "Professional certifications (CPA, PMP, CFA, etc.) significantly boost credibility at this level." },
    { key: "memberships", label: "Professional Memberships", importance: "recommended", tip: "Include industry associations and professional bodies to show engagement with your field." },
    { key: "languages", label: "Languages", importance: "recommended", tip: "List languages with proficiency levels. Important for multinational companies." },
    { key: "tools", label: "Tools & Software", importance: "optional", tip: "List key software, platforms, and tools you're proficient in." },
    { key: "referees", label: "References", importance: "optional", tip: "Include 2-3 senior professional references (managers, directors)." },
    { key: "declaration", label: "Declaration", importance: "optional", tip: "A formal statement certifying the accuracy of CV information." },
  ],
  executive: [
    { key: "summary", label: "Executive Profile", importance: "required", tip: "Write a compelling 4-5 sentence executive summary showcasing leadership philosophy, P&L responsibility, and transformational achievements." },
    { key: "skills", label: "Core Leadership Competencies", importance: "required", tip: "Focus on strategic competencies: P&L Management, Board Governance, M&A, Digital Transformation, Change Management." },
    { key: "experience", label: "Professional Experience", importance: "required", tip: "5-6 STAR bullets per role. Emphasize scope (budget, team size, geography), strategic decisions, and organizational impact." },
    { key: "keyAchievements", label: "Career Highlights", importance: "required", tip: "5-7 headline achievements with bold metrics: revenue growth, cost savings, market share, organizational transformation." },
    { key: "boardRoles", label: "Board & Advisory Roles", importance: "required", tip: "Include board memberships, advisory positions, and governance roles to demonstrate strategic leadership." },
    { key: "education", label: "Education", importance: "required", tip: "Include all degrees, executive education programs (MBA, EMBA), and prestigious institutions." },
    { key: "executiveTraining", label: "Executive Training", importance: "recommended", tip: "List executive development programs, leadership academies, and strategic management courses." },
    { key: "publications", label: "Publications & Speaking", importance: "recommended", tip: "Include articles, books, conference presentations, and thought leadership pieces." },
    { key: "certifications", label: "Certifications", importance: "recommended", tip: "Board-level certifications, governance training, and professional designations." },
    { key: "memberships", label: "Professional Affiliations", importance: "recommended", tip: "Industry boards, advisory councils, and prestigious professional organizations." },
    { key: "projects", label: "Major Initiatives", importance: "optional", tip: "Highlight 2-3 transformational projects you led with scope and impact." },
    { key: "languages", label: "Languages", importance: "optional", tip: "Essential for international executive roles. Include proficiency levels." },
    { key: "referees", label: "References", importance: "optional", tip: "Include 3-4 C-suite or board-level references." },
    { key: "declaration", label: "Declaration", importance: "optional", tip: "A formal statement certifying the accuracy of CV information." },
  ],
};

// ─── Check if a section has content ───
function sectionHasContent(data: CVTemplateData, key: string): boolean {
  switch (key) {
    case "summary": return !!(data.summary && data.summary.trim().length > 10);
    case "skills": return (data.skills || []).length > 0;
    case "experience": return (data.experiences || []).length > 0;
    case "keyAchievements": return (data.keyAchievements || []).length > 0;
    case "education": return (data.education || []).length > 0;
    case "certifications": return (data.certifications || []).length > 0;
    case "memberships": return (data.memberships || []).length > 0;
    case "languages": return (data.languages || []).length > 0;
    case "tools": return (data.tools || []).length > 0;
    case "volunteer": return (data.volunteer || []).length > 0;
    case "projects": return (data.projects || []).length > 0;
    case "referees": return (data.referees || []).length > 0;
    case "declaration": return !!(data.declaration?.declaration && data.declaration.declaration.trim().length > 5);
    case "boardRoles": return (data.boardRoles || []).length > 0;
    case "executiveTraining": return (data.executiveTraining || []).length > 0;
    case "publications": return (data.publications || []).length > 0;
    default: return false;
  }
}

// ─── Analysis Result ───
interface SectionAnalysis extends SectionSpec {
  present: boolean;
}

interface CompletenessResult {
  careerLevel: CareerLevelInfo;
  sections: SectionAnalysis[];
  score: number; // 0-100
  missingSections: SectionAnalysis[];
  presentSections: SectionAnalysis[];
}

function analyzeCompleteness(data: CVTemplateData): CompletenessResult {
  const careerLevel = detectCareerLevel(data);
  const specs = SECTIONS_BY_LEVEL[careerLevel.level];
  const sections: SectionAnalysis[] = specs.map((spec) => ({
    ...spec,
    present: sectionHasContent(data, spec.key),
  }));

  const missingSections = sections.filter((s) => !s.present);
  const presentSections = sections.filter((s) => s.present);

  // Weighted score: required=3, recommended=2, optional=1
  const weights = { required: 3, recommended: 2, optional: 1 };
  const totalWeight = sections.reduce((sum, s) => sum + weights[s.importance], 0);
  const earnedWeight = presentSections.reduce((sum, s) => sum + weights[s.importance], 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  return { careerLevel, sections, score, missingSections, presentSections };
}

// ─── Component Props ───
interface Props {
  data: CVTemplateData;
  onDataChange: (data: CVTemplateData) => void;
  onSave: () => Promise<void>;
}

// ─── Main Component ───
export default function CVCompletenessAnalysis({ data, onDataChange, onSave }: Props) {
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeCompleteness(data), [data]);

  const { careerLevel, sections, score, missingSections } = analysis;

  const importanceColor = (imp: string) => {
    if (imp === "required") return "text-red-600";
    if (imp === "recommended") return "text-amber-600";
    return "text-slate-400";
  };

  const importanceBadge = (imp: string) => {
    if (imp === "required") return "destructive";
    if (imp === "recommended") return "secondary";
    return "outline";
  };

  const generateMissingSection = async (sectionKey: string) => {
    setGeneratingSection(sectionKey);
    try {
      const res = await fetch("/api/ai/generate-missing-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvData: data,
          sectionKey,
          careerLevel: careerLevel.level,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const json = await res.json();

      // Merge the generated section into the CV data
      const updated = { ...data, ...json.sectionData };
      onDataChange(updated);
      await onSave();
      toast.success(`${sectionKey} section generated and saved!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate section");
    } finally {
      setGeneratingSection(null);
    }
  };

  const scoreColor =
    score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600";
  const scoreBg =
    score >= 80 ? "bg-green-50 border-green-200" : score >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">CV Completeness Analysis</CardTitle>
          <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
            {score}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Career Level */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${scoreBg}`}>
          <div className="mt-0.5">{careerLevel.icon}</div>
          <div>
            <div className="font-semibold text-sm flex items-center gap-2">
              {careerLevel.label}
              <Badge variant="outline" className="text-xs">{careerLevel.yearsExp}+ years</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{careerLevel.description}</p>
          </div>
        </div>

        {/* Score Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Completeness</span>
            <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Missing Sections */}
        {missingSections.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Missing Sections ({missingSections.length})
            </h4>
            <div className="space-y-2">
              {missingSections.map((sec) => (
                <div key={sec.key} className="border rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <XCircle className={`h-4 w-4 ${importanceColor(sec.importance)}`} />
                      <span className="font-medium text-sm">{sec.label}</span>
                      <Badge variant={importanceBadge(sec.importance) as any} className="text-[10px] px-1.5 py-0">
                        {sec.importance}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateMissingSection(sec.key)}
                      disabled={generatingSection !== null}
                      className="h-7 text-xs"
                    >
                      {generatingSection === sec.key ? (
                        <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="mr-1 h-3 w-3" /> Generate</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{sec.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Present Sections */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Present Sections ({sections.filter((s) => s.present).length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {sections
              .filter((s) => s.present)
              .map((sec) => (
                <Badge key={sec.key} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  ✓ {sec.label}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
