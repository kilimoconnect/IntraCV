"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Award, BarChart3, Briefcase, CheckCircle2, Copy, CreditCard, Download, FileText, GraduationCap, Loader2, Lock, Palette, PenLine, RefreshCw, Sparkles, Target, UserPen, X, Zap } from "lucide-react";
import CVCanvasPreview from "./cv-canvas-preview";
import CVLayoutJunior from "./cv-layout-junior";
import CVLayoutMidSenior from "./cv-layout-mid-senior";
import CVLayoutExecutive from "./cv-layout-executive";
import CVInlineEditor, { type InlineEditorState } from "./cv-inline-editor";
import { useOverflowDetect } from "./cv-overflow-detect";
import { type CareerCategory, type CategoryCVData, type LayoutVariant, type ThemeName, LAYOUT_OPTIONS, THEME_LIST } from "./cv-layout-types";
import { fitContentToLayout } from "./cv-content-fitter";
import { printCvAsPdf } from "@/lib/printCv";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { generateTxRef } from "@/lib/flutterwave";

// ─── CV Pricing Plans ───
const CURRENCY = "USD";
const CV_PLANS = [
  { id: "starter"      as const, label: "Starter",       amount: 3,  badge: null,              badgeClass: "",                                             desc: "CV only, saved to documents" },
  { id: "professional" as const, label: "Professional",  amount: 7,  badge: "⭐ MOST POPULAR",  badgeClass: "bg-indigo-100 text-indigo-700",                desc: "CV and cover letter activated and saved to documents" },
  { id: "full"         as const, label: "Full Package",  amount: 10, badge: "🔥 BEST VALUE",    badgeClass: "bg-amber-100 text-amber-700",                  desc: "CV, cover letter and 20 interview questions unlocked" },
] as const;
type PlanId = "starter" | "professional" | "full";

interface Props {
  userId: string;
  cvData: Record<string, unknown>;
}

type LooseObject = Record<string, unknown>;

// ─── Career category detection from profile data ───

const EXEC_TITLES = /\b(chief|ceo|cfo|cto|coo|cio|cmo|cpo|president|vice\s*president|vp|managing\s*director|md|executive\s*director|group\s*director|partner|head\s*of|country\s*manager|regional\s*director|general\s*manager|gm|board\s*member|chairman|chairperson)\b/i;
const MID_TITLES = /\b(senior|sr\.?|lead|manager|director|team\s*lead|principal|supervisor|coordinator|specialist|consultant|architect|head|associate\s*director)\b/i;
const JUNIOR_TITLES = /\b(junior|jr\.?|intern|trainee|entry|assistant|graduate|apprentice|associate|analyst|officer|clerk|attachment|industrial\s*training)\b/i;
const EXEC_SCOPE = /\b(p&l|profit\s*and\s*loss|board|strategy|transformation|million|billion|revenue|shareholder|governance|merger|acquisition|m&a)\b/i;
const MID_SCOPE = /\b(managed\s*(?:a\s*)?team|budget|cross-functional|department|division|portfolio|stakeholder|kpi|roadmap|mentored|coached|process\s*improvement)\b/i;

function detectCategory(cvData: Record<string, unknown>): CareerCategory {
  const experiences  = Array.isArray(cvData.experiences)       ? cvData.experiences       : [];
  const education    = Array.isArray(cvData.education)          ? cvData.education          : [];
  const boardRoles   = Array.isArray(cvData.boardRoles)         ? cvData.boardRoles         : [];
  const publications = Array.isArray(cvData.publications)       ? cvData.publications       : [];
  const execTraining = Array.isArray(cvData.executiveTraining)  ? cvData.executiveTraining  : [];
  const achievements = Array.isArray(cvData.keyAchievements)    ? cvData.keyAchievements    : [];
  const skills       = Array.isArray(cvData.skills)             ? cvData.skills             : [];
  const certifications = Array.isArray(cvData.certifications)   ? cvData.certifications     : [];

  let score = 0;

  // ── Seniority signals from job titles ──
  let execTitleCount = 0, midTitleCount = 0, juniorTitleCount = 0;
  for (const exp of experiences) {
    const t = (exp as any)?.title || "";
    if (EXEC_TITLES.test(t)) execTitleCount++;
    else if (MID_TITLES.test(t)) midTitleCount++;
    else if (JUNIOR_TITLES.test(t)) juniorTitleCount++;
  }
  if (execTitleCount >= 2) score += 35;
  else if (execTitleCount === 1) score += 28;
  else if (midTitleCount >= 3) score += 22;
  else if (midTitleCount >= 1) score += 15;
  else if (juniorTitleCount >= 1) score += 2;
  else if (experiences.length > 0) score += 10;

  // ── Scope / keyword signals ──
  let execScopeHits = 0, midScopeHits = 0;
  for (const exp of experiences) {
    const desc = (exp as any)?.description || "";
    if (EXEC_SCOPE.test(desc)) execScopeHits++;
    if (MID_SCOPE.test(desc)) midScopeHits++;
  }
  if (execScopeHits >= 2) score += 20;
  else if (execScopeHits === 1) score += 14;
  else if (midScopeHits >= 2) score += 10;
  else if (midScopeHits === 1) score += 6;

  // ── Education ──
  if (education.some((e: any) => /\b(mba|phd|doctorate|masters?|m\.?sc|emba)\b/i.test(e?.degree || ""))) score += 10;
  else if (education.length > 0) score += 4;

  // ── Executive-specific sections ──
  if (boardRoles.length >= 2) score += 10; else if (boardRoles.length === 1) score += 7;
  if (publications.length >= 2) score += 5; else if (publications.length === 1) score += 3;
  if (execTraining.length >= 2) score += 5; else if (execTraining.length === 1) score += 3;

  // ── Content volume signals ──
  if (experiences.length >= 7) score += 15;
  else if (experiences.length >= 5) score += 10;
  else if (experiences.length >= 3) score += 6;
  else if (experiences.length >= 2) score += 3;

  if (achievements.length >= 6) score += 10;
  else if (achievements.length >= 3) score += 6;
  else if (achievements.length >= 1) score += 3;

  if (skills.length >= 12) score += 6;
  else if (skills.length >= 6) score += 3;

  if (certifications.length >= 3) score += 5;
  else if (certifications.length >= 1) score += 2;

  // Guard each category against missing data for its distinctive sections:
  // - executive requires at least one of: board roles, publications, exec training
  // - mid-senior requires at least: achievements OR 3+ roles
  // Falls back down the chain when the data isn't there.
  const hasExecSections   = boardRoles.length > 0 || publications.length > 0 || execTraining.length > 0;
  const hasMidSeniorData  = achievements.length > 0 || experiences.length >= 3;
  if (score >= 60) return hasExecSections ? "executive" : hasMidSeniorData ? "mid-senior" : "junior";
  if (score >= 25) return hasMidSeniorData ? "mid-senior" : "junior";
  return "junior";
}

// ─── Helpers ───

function asObject(value: unknown): LooseObject {
  return typeof value === "object" && value !== null ? (value as LooseObject) : {};
}

function asObjectArray(value: unknown): LooseObject[] {
  return Array.isArray(value)
    ? value.filter((item): item is LooseObject => typeof item === "object" && item !== null)
    : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function asTextArray(
  value: unknown,
  keys: string[] = ["description", "title", "name", "text", "summary"]
) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item !== "object" || item === null) return "";
      const record = item as LooseObject;
      for (const key of keys) {
        const candidate = record[key];
        if (typeof candidate === "string" && candidate.trim().length > 0) return candidate.trim();
      }
      return "";
    })
    .filter((item): item is string => item.length > 0);
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function formatDateRange(start?: string, end?: string) {
  const left = (start || "").trim();
  const right = (end || "").trim();
  if (left && right) return `${left} - ${right}`;
  return left || right;
}

// ─── Category card definitions ───

const CATEGORY_CARDS: {
  id: CareerCategory;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  required: string[];
  recommended: string[];
}[] = [
  {
    id: "junior",
    label: "Junior",
    subtitle: "Early Career",
    description: "Clean, modern single-column layout. Perfect for graduates and professionals with up to 3 years of experience.",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    required: ["Personal Info", "Professional Summary", "Experience", "Education", "Skills", "References"],
    recommended: ["Projects", "Certifications", "Volunteer Experience", "Languages"],
  },
  {
    id: "mid-senior",
    label: "Mid-Senior",
    subtitle: "Experienced Professional",
    description: "Professional two-column layout with sidebar. Ideal for professionals with 3-15 years of progressive experience.",
    icon: Briefcase,
    color: "text-indigo-600",
    bgGradient: "from-indigo-50 to-blue-50",
    borderColor: "border-indigo-200 hover:border-indigo-400",
    required: ["Personal Info", "Professional Summary", "Experience", "Education", "Core Competencies", "Key Achievements", "References"],
    recommended: ["Certifications", "Professional Memberships", "Tools & Software", "Languages", "Projects"],
  },
  {
    id: "executive",
    label: "Executive",
    subtitle: "Senior Leadership",
    description: "Distinguished premium layout with grand header. Designed for C-suite, directors, and senior leaders with 15+ years.",
    icon: Award,
    color: "text-purple-600",
    bgGradient: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200 hover:border-purple-400",
    required: ["Personal Info", "Executive Profile", "Professional Experience", "Education", "Core Leadership Competencies", "Career Highlights", "Board & Advisory Roles", "References"],
    recommended: ["Executive Training", "Publications & Speaking", "Certifications", "Professional Affiliations", "Languages"],
  },
];

// ─── Mini Layout Previews (wireframe thumbnails) ───

function JuniorMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Top banner */}
      <div style={{ width: "100%", height: "18%", backgroundColor: "#1E293B" }} />
      {/* Accent contact strip */}
      <div style={{ width: "100%", height: "5%", backgroundColor: "#4F46E5" }} />
      {/* Body lines */}
      <div style={{ padding: "6% 8%", display: "flex", flexDirection: "column", gap: "4%" }}>
        {/* Summary block */}
        <div style={{ width: "100%", height: 4, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ width: "85%", height: 4, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ width: "92%", height: 4, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
          <div style={{ width: 3, height: 10, backgroundColor: "#4F46E5", borderRadius: 1 }} />
          <div style={{ width: "35%", height: 4, backgroundColor: "#4F46E5", borderRadius: 2 }} />
        </div>
        {/* Experience lines */}
        <div style={{ width: "70%", height: 3, backgroundColor: "#CBD5E1", borderRadius: 2 }} />
        <div style={{ width: "100%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ width: "95%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ width: "88%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        {/* Skills pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
          {[40, 55, 35, 48, 42, 50].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, maxWidth: 44, height: 8, backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 10 }} />
          ))}
        </div>
        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
          <div>
            <div style={{ width: "60%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2, marginBottom: 3 }} />
            <div style={{ width: "90%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
            <div style={{ width: "70%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2, marginTop: 2 }} />
          </div>
          <div>
            <div style={{ width: "50%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2, marginBottom: 3 }} />
            <div style={{ width: "80%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
            <div style={{ width: "65%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2, marginTop: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MidSeniorMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex" }}>
      {/* Full-height left sidebar */}
      <div style={{ width: "34%", height: "100%", backgroundColor: "#1E293B", padding: "8% 5%", display: "flex", flexDirection: "column", gap: "5%" }}>
        {/* Name in sidebar */}
        <div>
          <div style={{ width: "80%", height: 5, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9, marginBottom: 3 }} />
          <div style={{ width: "60%", height: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.5 }} />
        </div>
        {/* Contact */}
        <div>
          <div style={{ width: "50%", height: 2, backgroundColor: "#4F46E5", borderRadius: 1, marginBottom: 3 }} />
          {[75, 80, 65].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#fff", opacity: 0.4, borderRadius: 1, marginBottom: 2 }} />
          ))}
        </div>
        {/* Skills */}
        <div>
          <div style={{ width: "65%", height: 2, backgroundColor: "#4F46E5", borderRadius: 1, marginBottom: 3 }} />
          {[90, 85, 88, 80, 92, 75].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#4F46E5", flexShrink: 0 }} />
              <div style={{ width: `${w}%`, height: 2, backgroundColor: "#fff", opacity: 0.35, borderRadius: 1 }} />
            </div>
          ))}
        </div>
        {/* Education */}
        <div>
          <div style={{ width: "55%", height: 2, backgroundColor: "#4F46E5", borderRadius: 1, marginBottom: 3 }} />
          <div style={{ width: "85%", height: 2, backgroundColor: "#fff", opacity: 0.5, borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: "60%", height: 2, backgroundColor: "#fff", opacity: 0.3, borderRadius: 1 }} />
        </div>
      </div>
      {/* Right main body */}
      <div style={{ flex: 1, padding: "8% 6%", display: "flex", flexDirection: "column", gap: "4%" }}>
        {/* Summary heading with line */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: "40%", height: 4, backgroundColor: "#4F46E5", borderRadius: 2 }} />
          <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
        </div>
        <div style={{ width: "100%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        <div style={{ width: "90%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        {/* Experience with left border */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <div style={{ width: "35%", height: 4, backgroundColor: "#4F46E5", borderRadius: 2 }} />
          <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
        </div>
        <div style={{ borderLeft: "2px solid #4F46E5", paddingLeft: 6 }}>
          <div style={{ width: "65%", height: 3, backgroundColor: "#CBD5E1", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ width: "95%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 2, marginBottom: 2 }} />
          <div style={{ width: "88%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 2, marginBottom: 2 }} />
          <div style={{ width: "92%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
        </div>
        {/* Achievements */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <div style={{ width: "40%", height: 4, backgroundColor: "#4F46E5", borderRadius: 2 }} />
          <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
        </div>
        {[90, 85, 88].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, border: "1.5px solid #4F46E5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 5, color: "#4F46E5", fontWeight: 700 }}>{i + 1}</span>
            </div>
            <div style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Centered elegant header */}
      <div style={{ width: "100%", height: "22%", backgroundColor: "#1E293B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
        <div style={{ width: 20, height: 1.5, backgroundColor: "#7C3AED" }} />
        <div style={{ width: "55%", height: 6, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9 }} />
        <div style={{ width: "35%", height: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.5 }} />
        <div style={{ width: 20, height: 1.5, backgroundColor: "#7C3AED" }} />
      </div>
      {/* Contact strip */}
      <div style={{ width: "100%", height: "4%", backgroundColor: "#6D28D9" }} />
      {/* Body: left main + right dark sidebar */}
      <div style={{ display: "flex", height: "74%" }}>
        {/* Left main */}
        <div style={{ flex: 1, padding: "5% 5%", display: "flex", flexDirection: "column", gap: "3%" }}>
          {/* Heading with dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: 2, border: "1.5px solid #7C3AED" }} />
            <div style={{ width: "45%", height: 3, backgroundColor: "#7C3AED", borderRadius: 2 }} />
            <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          </div>
          <div style={{ width: "100%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
          <div style={{ width: "88%", height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
          {/* Experience with thick left border */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
            <div style={{ width: 4, height: 4, borderRadius: 2, border: "1.5px solid #7C3AED" }} />
            <div style={{ width: "40%", height: 3, backgroundColor: "#7C3AED", borderRadius: 2 }} />
            <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          </div>
          <div style={{ borderLeft: "2.5px solid #7C3AED", paddingLeft: 5 }}>
            <div style={{ width: "60%", height: 3, backgroundColor: "#CBD5E1", borderRadius: 2, marginBottom: 3 }} />
            <div style={{ width: "95%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 2, marginBottom: 2 }} />
            <div style={{ width: "90%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 2, marginBottom: 2 }} />
            <div style={{ width: "85%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
          </div>
          {/* Star achievements */}
          {[85, 90].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F3E8FF", border: "1px solid #D8B4FE", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 5, color: "#7C3AED" }}>★</span>
              </div>
              <div style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />
            </div>
          ))}
        </div>
        {/* Right dark sidebar */}
        <div style={{ width: "36%", backgroundColor: "#1E293B", padding: "5% 5%", display: "flex", flexDirection: "column", gap: "5%" }}>
          <div>
            <div style={{ width: "60%", height: 2, backgroundColor: "#7C3AED", borderRadius: 1, opacity: 0.7, marginBottom: 4 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {[1,2,3,4,5,6].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 2, height: 2, backgroundColor: "#7C3AED" }} />
                  <div style={{ width: "80%", height: 2, backgroundColor: "#fff", opacity: 0.25, borderRadius: 1 }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ width: "50%", height: 2, backgroundColor: "#7C3AED", borderRadius: 1, opacity: 0.7, marginBottom: 4 }} />
            <div style={{ width: "85%", height: 2, backgroundColor: "#fff", opacity: 0.4, borderRadius: 1, marginBottom: 2 }} />
            <div style={{ width: "60%", height: 2, backgroundColor: "#fff", opacity: 0.25, borderRadius: 1 }} />
          </div>
          <div>
            <div style={{ width: "55%", height: 2, backgroundColor: "#7C3AED", borderRadius: 1, opacity: 0.7, marginBottom: 4 }} />
            <div style={{ width: "90%", height: 2, backgroundColor: "#fff", opacity: 0.3, borderRadius: 1, marginBottom: 2 }} />
            <div style={{ width: "70%", height: 2, backgroundColor: "#fff", opacity: 0.2, borderRadius: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Variant Mini Preview Dispatcher ───

function VariantMiniPreview({ category, variant }: { category: CareerCategory; variant: LayoutVariant }) {
  if (category === "junior") {
    if (variant === "A") return <JuniorMiniPreview />;
    if (variant === "B") return <JuniorBMiniPreview />;
    return <JuniorCMiniPreview />;
  }
  if (category === "mid-senior") {
    if (variant === "A") return <MidSeniorMiniPreview />;
    if (variant === "B") return <MidSeniorBMiniPreview />;
    return <MidSeniorCMiniPreview />;
  }
  if (variant === "A") return <ExecutiveMiniPreview />;
  if (variant === "B") return <ExecutiveBMiniPreview />;
  return <ExecutiveCMiniPreview />;
}

// Junior B — light left sidebar + accent border + right body
function JuniorBMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <div style={{ width: "30%", height: "100%", backgroundColor: "#F8FAFC", borderRight: "2px solid #4F46E5", padding: "8% 5%", display: "flex", flexDirection: "column", gap: "6%" }}>
        <div><div style={{ width: "80%", height: 5, backgroundColor: "#1E293B", borderRadius: 2, marginBottom: 3 }} /><div style={{ width: "55%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2 }} /></div>
        <div>{[70,80,60].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1, marginBottom: 2 }} />)}</div>
        <div><div style={{ width: "50%", height: 2, backgroundColor: "#4F46E5", borderRadius: 1, marginBottom: 3 }} />{[85,70].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1, marginBottom: 2 }} />)}</div>
      </div>
      <div style={{ flex: 1, padding: "6% 6%", display: "flex", flexDirection: "column", gap: "4%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: "40%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2 }} /><div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} /></div>
        {[100,90,95].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><div style={{ width: "35%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2 }} /><div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} /></div>
        {[65,100,92,88].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>{[38,48,42,35].map((w,i) => <div key={i} style={{ width: `${w}%`, maxWidth: 40, height: 7, backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8 }} />)}</div>
      </div>
    </div>
  );
}

// Junior C — split header (name left, contact right), two-column body
function JuniorCMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "14%", borderBottom: "2.5px solid #4F46E5", display: "flex", alignItems: "center", padding: "0 6%" }}>
        <div style={{ flex: 1 }}><div style={{ width: "55%", height: 6, backgroundColor: "#1E293B", borderRadius: 2, marginBottom: 2 }} /><div style={{ width: "30%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2 }} /></div>
        <div style={{ textAlign: "right" }}>{[60,50,55].map((w,i) => <div key={i} style={{ width: w, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1, marginBottom: 1, marginLeft: "auto" }} />)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "5%", padding: "5% 6%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4%" }}>
          <div><div style={{ width: "40%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2, marginBottom: 2 }} /><div style={{ width: 30, height: 1.5, backgroundColor: "#4F46E5", borderRadius: 1 }} /></div>
          {[100,88,95].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
          <div style={{ marginTop: 2 }}><div style={{ width: "35%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2, marginBottom: 2 }} /><div style={{ width: 30, height: 1.5, backgroundColor: "#4F46E5", borderRadius: 1 }} /></div>
          {[60,100,90].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4%" }}>
          <div><div style={{ width: "45%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2, marginBottom: 2 }} /><div style={{ width: 25, height: 1.5, backgroundColor: "#4F46E5", borderRadius: 1 }} /></div>
          {[90,85,80,75,88].map((w,i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: "#4F46E5", flexShrink: 0 }} /><div style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1 }} /></div>)}
          <div style={{ marginTop: 2 }}><div style={{ width: "50%", height: 3, backgroundColor: "#4F46E5", borderRadius: 2, marginBottom: 2 }} /><div style={{ width: 25, height: 1.5, backgroundColor: "#4F46E5", borderRadius: 1 }} /></div>
          {[85,65].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1, marginBottom: 2 }} />)}
        </div>
      </div>
    </div>
  );
}

// Mid-Senior B — dark top header bar + light right sidebar
function MidSeniorBMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "14%", backgroundColor: "#1E293B", display: "flex", alignItems: "center", padding: "0 5%" }}>
        <div style={{ flex: 1 }}><div style={{ width: "55%", height: 6, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9, marginBottom: 2 }} /><div style={{ width: "35%", height: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.5 }} /></div>
        <div>{[55,50,45].map((w,i) => <div key={i} style={{ width: w, height: 2, backgroundColor: "#fff", opacity: 0.5, borderRadius: 1, marginBottom: 1 }} />)}</div>
      </div>
      <div style={{ width: "100%", height: "2%", backgroundColor: "#4F46E5" }} />
      <div style={{ display: "flex", height: "84%" }}>
        <div style={{ flex: 1, padding: "5% 5%", display: "flex", flexDirection: "column", gap: "3%" }}>
          <div style={{ width: "45%", height: 4, backgroundColor: "#4F46E5", borderRadius: 2, borderBottom: "2px solid #4F46E5", paddingBottom: 2 }} />
          {[100,90,95].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
          <div style={{ width: "40%", height: 4, backgroundColor: "#4F46E5", borderRadius: 2, marginTop: 2 }} />
          {[60,95,88,92].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        </div>
        <div style={{ width: "32%", backgroundColor: "#F8FAFC", borderLeft: "1.5px solid #E2E8F0", padding: "5% 4%", display: "flex", flexDirection: "column", gap: "5%" }}>
          <div><div style={{ width: "60%", height: 2, backgroundColor: "#4F46E5", borderRadius: 1, marginBottom: 3 }} />{[85,80,75,90,70].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1, marginBottom: 2, borderBottom: "0.5px solid #E2E8F0", paddingBottom: 1 }} />)}</div>
          <div><div style={{ width: "55%", height: 2, backgroundColor: "#4F46E5", borderRadius: 1, marginBottom: 3 }} /><div style={{ width: "85%", height: 2, backgroundColor: "#CBD5E1", borderRadius: 1, marginBottom: 2 }} /><div style={{ width: "60%", height: 2, backgroundColor: "#CBD5E1", borderRadius: 1 }} /></div>
        </div>
      </div>
    </div>
  );
}

// Mid-Senior C — full-width, no sidebar, card-based with colored heading badges
function MidSeniorCMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "16%", backgroundColor: "#1E293B", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 6%" }}>
        <div style={{ width: "55%", height: 6, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9, marginBottom: 3 }} />
        <div style={{ width: "35%", height: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.5, marginBottom: 3 }} />
        <div style={{ display: "flex", gap: 8 }}>{[40,35,30].map((w,i) => <div key={i} style={{ width: w, height: 2, backgroundColor: "#fff", opacity: 0.4, borderRadius: 1 }} />)}</div>
      </div>
      <div style={{ width: "100%", height: "2%", backgroundColor: "#4F46E5" }} />
      <div style={{ padding: "4% 6%", display: "flex", flexDirection: "column", gap: "3.5%" }}>
        {/* Heading badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ padding: "2px 8px", backgroundColor: "#4F46E5", borderRadius: 3 }}><div style={{ width: 40, height: 3 }} /></div><div style={{ flex: 1, height: 1.5, backgroundColor: "#E2E8F0" }} /></div>
        {[100,88].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        {/* Skills row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{[40,50,35,45,38].map((w,i) => <div key={i} style={{ width: `${w}%`, maxWidth: 42, height: 8, backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 3 }} />)}</div>
        {/* Experience card */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ padding: "2px 8px", backgroundColor: "#4F46E5", borderRadius: 3 }}><div style={{ width: 35, height: 3 }} /></div><div style={{ flex: 1, height: 1.5, backgroundColor: "#E2E8F0" }} /></div>
        <div style={{ padding: "4% 4%", backgroundColor: "#FAFBFF", border: "1px solid #E2E8F0", borderRadius: 4 }}>
          <div style={{ width: "50%", height: 3, backgroundColor: "#CBD5E1", borderRadius: 2, marginBottom: 3 }} />
          {[92,88,85].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1, marginBottom: 2 }} />)}
        </div>
        {/* Two-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[1,2].map((_,i) => <div key={i} style={{ display: "flex", gap: 4, alignItems: "flex-start", padding: "3%", backgroundColor: "#FAFBFF", border: "1px solid #E2E8F0", borderRadius: 3 }}>
            <span style={{ fontSize: 6, color: "#4F46E5" }}>★</span>
            <div style={{ width: "85%", height: 2, backgroundColor: "#E2E8F0", borderRadius: 1 }} />
          </div>)}
        </div>
      </div>
    </div>
  );
}

// Executive B — wide dark left sidebar with monogram circle
function ExecutiveBMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <div style={{ width: "36%", height: "100%", backgroundColor: "#1E293B", padding: "6% 4%", display: "flex", flexDirection: "column", alignItems: "center", gap: "5%" }}>
        <div style={{ width: 24, height: 24, borderRadius: 12, border: "1.5px solid #7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, color: "#7C3AED", fontWeight: 800 }}>JD</span></div>
        <div style={{ textAlign: "center", width: "100%" }}><div style={{ width: "80%", height: 4, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9, margin: "0 auto 3px" }} /><div style={{ width: "55%", height: 2, backgroundColor: "#fff", borderRadius: 1, opacity: 0.5, margin: "0 auto" }} /></div>
        <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "6%" }}>{[75,80,65].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#fff", opacity: 0.4, borderRadius: 1, marginBottom: 2 }} />)}</div>
        <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "6%" }}><div style={{ width: "50%", height: 2, backgroundColor: "#7C3AED", borderRadius: 1, opacity: 0.7, marginBottom: 4 }} />{[90,85,80,88].map((w,i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}><div style={{ width: 3, height: 3, backgroundColor: "#7C3AED", flexShrink: 0 }} /><div style={{ width: `${w}%`, height: 2, backgroundColor: "#fff", opacity: 0.3, borderRadius: 1 }} /></div>)}</div>
        <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "6%" }}><div style={{ width: "50%", height: 2, backgroundColor: "#7C3AED", borderRadius: 1, opacity: 0.7, marginBottom: 4 }} /><div style={{ width: "80%", height: 2, backgroundColor: "#fff", opacity: 0.4, borderRadius: 1, marginBottom: 2 }} /><div style={{ width: "55%", height: 2, backgroundColor: "#fff", opacity: 0.25, borderRadius: 1 }} /></div>
      </div>
      <div style={{ flex: 1, padding: "6% 5%", display: "flex", flexDirection: "column", gap: "3%" }}>
        <div style={{ width: "50%", height: 4, backgroundColor: "#7C3AED", borderRadius: 2, borderBottom: "2px solid #7C3AED", paddingBottom: 2 }} />
        {[100,88,92].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        <div style={{ width: "45%", height: 4, backgroundColor: "#7C3AED", borderRadius: 2, marginTop: 2 }} />
        {[60,95,88,90].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
        {[85,90].map((w,i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, marginTop: i === 0 ? 2 : 0 }}><span style={{ fontSize: 6, color: "#7C3AED" }}>★</span><div style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1 }} /></div>)}
      </div>
    </div>
  );
}

// Executive C — thin top accent, large name, two-column body
function ExecutiveCMiniPreview() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "2%", backgroundColor: "#7C3AED" }} />
      <div style={{ padding: "5% 6% 3%", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ width: "60%", height: 8, backgroundColor: "#1E293B", borderRadius: 2, marginBottom: 3 }} />
        <div style={{ width: "35%", height: 3, backgroundColor: "#7C3AED", borderRadius: 2, marginBottom: 3 }} />
        <div style={{ display: "flex", gap: 10 }}>{[45,40,35].map((w,i) => <div key={i} style={{ width: w, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1 }} />)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "5%", padding: "4% 6%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 3, height: 10, backgroundColor: "#7C3AED", borderRadius: 1 }} /><div style={{ width: "45%", height: 3, backgroundColor: "#1E293B", borderRadius: 2 }} /></div>
          {[100,88,92].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}><div style={{ width: 3, height: 10, backgroundColor: "#7C3AED", borderRadius: 1 }} /><div style={{ width: "40%", height: 3, backgroundColor: "#1E293B", borderRadius: 2 }} /></div>
          {[60,95,88].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 2 }} />)}
          {[85,90].map((w,i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, marginTop: i === 0 ? 2 : 0 }}><span style={{ fontSize: 5, color: "#7C3AED" }}>—</span><div style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1 }} /></div>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "3%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 3, height: 10, backgroundColor: "#7C3AED", borderRadius: 1 }} /><div style={{ width: "50%", height: 3, backgroundColor: "#1E293B", borderRadius: 2 }} /></div>
          {[90,85,80,88,82].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1, borderBottom: i < 4 ? "0.5px solid #F1F5F9" : "none", paddingBottom: 1 }} />)}
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}><div style={{ width: 3, height: 10, backgroundColor: "#7C3AED", borderRadius: 1 }} /><div style={{ width: "45%", height: 3, backgroundColor: "#1E293B", borderRadius: 2 }} /></div>
          {[85,60].map((w,i) => <div key={i} style={{ width: `${w}%`, height: 2, backgroundColor: "#E2E8F0", borderRadius: 1, marginBottom: 2 }} />)}
        </div>
      </div>
    </div>
  );
}

// ─── AI Condense Helper ───

async function aiCondense(sectionType: string, content: unknown, maxChars?: number, count?: number): Promise<unknown> {
  const res = await fetch("/api/ai/condense-section", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sectionType, content, maxChars, count }),
  });
  if (!res.ok) throw new Error("AI condense failed");
  return (await res.json()).result;
}

// ─── Main Component ───

export default function CvStudio({ userId, cvData }: Props) {
  const supabase = createClient();

  const detectedCategory = detectCategory(cvData);
  const [step, setStep] = useState<"choose-path" | "analyze-profile" | "select" | "pick-layout" | "generating" | "preview" | "error">("choose-path");
  const [cvPath, setCvPath] = useState<"improve" | "apply" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<LayoutVariant>("A");
  const [aiData, setAiData] = useState<CategoryCVData | null>(null);
  const [error, setError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("corporate");
  const [editMode, setEditMode] = useState(false);
  const [inlineEditor, setInlineEditor] = useState<InlineEditorState | null>(null);
  const [navigatingToBuilder, setNavigatingToBuilder] = useState(false);
  const router = useRouter();
  const [fixingOverflow, setFixingOverflow] = useState(false);
  const [autoFixAttempts, setAutoFixAttempts] = useState(0);
  const autoFixAttemptsRef = useRef(0);
  // Store original AI data (before any tightening) so retries can re-fit from a clean slate
  const rawAiDataRef = useRef<CategoryCVData | null>(null);
  const [showManualTrimPanel, setShowManualTrimPanel] = useState(false);
  // Allow experienced users to override the enforced category recommendation
  const [categoryOverride, setCategoryOverride] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showJobOptimizer, setShowJobOptimizer] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<{ atsScore: number; missingSkills: string[]; weakAreas: string[] } | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterUnlocked, setCoverLetterUnlocked] = useState(false);
  const [cvPaidReady, setCvPaidReady] = useState(false); // returned from payment redirect
  const [autoDownload, setAutoDownload] = useState(false); // auto-trigger download on return
  const [copiedCL, setCopiedCL] = useState(false);
  const [shouldAutoOptimize, setShouldAutoOptimize] = useState(false);
  const [profileAnalysis, setProfileAnalysis] = useState<{
    completenessScore: number;
    strengths: string[];
    gaps: string[];
    atsScore?: number;
    missingSkills?: string[];
    weakAreas?: string[];
  } | null>(null);
  const [profileAnalyzing, setProfileAnalyzing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const overflowSections = useOverflowDetect(previewRef, [aiData, selectedTheme, selectedVariant]);

  // ── Detect return from CV payment redirect ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const paid = sessionStorage.getItem("fusecv-cv-paid");
    const pending = sessionStorage.getItem("fusecv-pending-cv");
    if (paid === "1" && pending) {
      try {
        const saved = JSON.parse(pending);
        if (saved.aiData) setAiData(saved.aiData);
        if (saved.selectedCategory) setSelectedCategory(saved.selectedCategory);
        if (saved.selectedVariant) setSelectedVariant(saved.selectedVariant);
        if (saved.selectedTheme) setSelectedTheme(saved.selectedTheme);
        if (saved.coverLetter) {
          setCoverLetter(saved.coverLetter);
          setCoverLetterUnlocked(true);
        }
        if (saved.jobDescription) setJobDescription(saved.jobDescription);
        if (saved.company) setCompany(saved.company);
        if (saved.jobTitle) setJobTitle(saved.jobTitle);
        if (saved.companyAddress) setCompanyAddress(saved.companyAddress);
        if (saved.cvPath) setCvPath(saved.cvPath);
        if (saved.plan) setSelectedPlan(saved.plan as PlanId);
        // Restore step so the CV preview renders and previewRef becomes available
        setStep("preview");
        setCvPaidReady(true);
        if (sessionStorage.getItem("fusecv-auto-download") === "1") {
          setAutoDownload(true);
          sessionStorage.removeItem("fusecv-auto-download");
        }
      } catch { /* ignore */ }
      sessionStorage.removeItem("fusecv-cv-paid");
      sessionStorage.removeItem("fusecv-pending-cv");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-download once state is restored and previewRef is in the DOM ──
  useEffect(() => {
    if (!autoDownload || !cvPaidReady || !aiData || !selectedCategory) return;
    let attempts = 0;
    const MAX = 30; // 30 × 100 ms = 3 s max wait
    let rafId: number;
    let timerId: ReturnType<typeof setTimeout>;

    const tryDownload = async () => {
      if (previewRef.current) {
        setCvPaidReady(false);
        setAutoDownload(false);
        localStorage.setItem("fusecv-new-docs", "true");
        await executePdfDownload();
      } else if (attempts < MAX) {
        attempts++;
        timerId = setTimeout(() => { rafId = requestAnimationFrame(tryDownload); }, 100);
      } else {
        // previewRef never appeared — fall back to manual button
        setAutoDownload(false);
      }
    };

    // Initial frame delay so React can paint the preview step
    rafId = requestAnimationFrame(() => { timerId = setTimeout(tryDownload, 200); });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, cvPaidReady, aiData, selectedCategory]);

  // ── Cached profile analysis: only re-run if CV data changed ──
  useEffect(() => {
    let cancelled = false;

    async function loadOrRunAnalysis() {
      // Build a simple hash of the CV data to detect changes
      const dataStr = JSON.stringify(cvData);
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(dataStr));
      const dataHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

      // Check for cached analysis in the database
      const { data: cached } = await supabase
        .from("profile_analysis")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (cached && cached.data_hash === dataHash) {
        // Data hasn't changed — use cached result
        if (!cancelled) {
          setProfileAnalysis({
            completenessScore: cached.completeness_score,
            strengths: cached.strengths,
            gaps: cached.gaps,
          });
        }
        return;
      }

      // Data changed or no cache — run fresh analysis
      if (!cancelled) setProfileAnalyzing(true);
      try {
        const res = await fetch("/api/ai/analyze-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cvData }),
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data = await res.json();
        if (cancelled) return;

        setProfileAnalysis(data);

        // Save to database for next time
        await supabase.from("profile_analysis").upsert(
          {
            user_id: userId,
            data_hash: dataHash,
            completeness_score: data.completenessScore ?? 0,
            strengths: data.strengths ?? [],
            gaps: data.gaps ?? [],
          },
          { onConflict: "user_id" }
        );
      } catch {
        if (!cancelled) toast.error("Profile analysis failed.");
      } finally {
        if (!cancelled) setProfileAnalyzing(false);
      }
    }

    loadOrRunAnalysis();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const getFieldValue = useCallback((field: string): string => {
    if (!aiData) return "";
    const p = field.split(".");
    if (p[0] === "profile") return aiData.profile || "";
    if (p[0] === "fullName") return aiData.fullName || "";
    if (p[0] === "title") return aiData.title || "";
    if (p[0] === "tagline") return aiData.tagline || "";
    if (p[0] === "email") return aiData.email || "";
    if (p[0] === "phone") return aiData.phone || "";
    if (p[0] === "location") return aiData.location || "";
    if (p[0] === "linkedin") return aiData.linkedin || "";
    if (p[0] === "exp") { const e = aiData.experience?.[+p[1]]; if (!e) return ""; if (p[2] === "role") return e.role || ""; if (p[2] === "company") return e.company || ""; if (p[2] === "dates") return e.dates || ""; if (p[2] === "bullet") return e.bullets?.[+p[3]] || ""; }
    if (p[0] === "hist") { const e = aiData.history?.[+p[1]]; if (!e) return ""; if (p[2] === "role") return e.role || ""; if (p[2] === "company") return e.company || ""; if (p[2] === "dates") return e.dates || ""; if (p[2] === "bullet") return e.bullets?.[+p[3]] || ""; }
    if (p[0] === "skill") return aiData.skills?.[+p[1]] || "";
    if (p[0] === "ach") return aiData.achievements?.[+p[1]] || "";
    if (p[0] === "edu") { const e = aiData.education?.[+p[1]]; if (!e) return ""; if (p[2] === "degree") return e.degree || ""; if (p[2] === "school") return e.school || ""; if (p[2] === "year") return e.year || ""; }
    if (p[0] === "cert") { const e = aiData.certifications?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "issuer") return e.issuer || ""; }
    if (p[0] === "lang") { const e = aiData.languages?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "label") return e.label || ""; }
    if (p[0] === "ref") { const e = aiData.references?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "title") return e.title || ""; if (p[2] === "company") return e.company || ""; if (p[2] === "phone") return e.phone || ""; if (p[2] === "email") return e.email || ""; }
    if (p[0] === "proj") { const e = aiData.projects?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "description") return e.description || ""; if (p[2] === "tech") return e.tech || ""; }
    if (p[0] === "award") { const e = aiData.awards?.[+p[1]]; if (!e) return ""; if (p[2] === "description") return e.description || ""; return e.title || ""; }
    if (p[0] === "tool") return aiData.tools?.[+p[1]] || "";
    if (p[0] === "memb") return aiData.memberships?.[+p[1]] || "";
    if (p[0] === "vol") return aiData.volunteer?.[+p[1]] || "";
    if (p[0] === "decl") { const d = aiData.declaration; if (!d) return ""; if (p[1] === "declaration") return d.declaration || ""; if (p[1] === "place") return d.place || ""; if (p[1] === "date") return d.date || ""; }
    if (p[0] === "boardRole") { const e = aiData.boardRoles?.[+p[1]]; if (!e) return ""; if (p[2] === "title") return e.title || ""; if (p[2] === "dates") return e.dates || ""; if (p[2] === "organization") return e.organization || ""; if (p[2] === "description") return e.description || ""; }
    if (p[0] === "execTrain") { const e = aiData.executiveTraining?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "institution") return e.institution || ""; if (p[2] === "year") return e.year || ""; }
    if (p[0] === "pub") { const e = aiData.publications?.[+p[1]]; if (!e) return ""; if (p[2] === "title") return e.title || ""; if (p[2] === "publisher") return e.publisher || ""; if (p[2] === "year") return e.year || ""; }
    return "";
  }, [aiData]);

  const setFieldValue = useCallback((field: string, value: string) => {
    setAiData(prev => {
      if (!prev) return prev;
      const p = field.split(".");
      if (p[0] === "profile") return { ...prev, profile: value };
      if (p[0] === "fullName") return { ...prev, fullName: value };
      if (p[0] === "title") return { ...prev, title: value };
      if (p[0] === "tagline") return { ...prev, tagline: value };
      if (p[0] === "email") return { ...prev, email: value };
      if (p[0] === "phone") return { ...prev, phone: value };
      if (p[0] === "location") return { ...prev, location: value };
      if (p[0] === "linkedin") return { ...prev, linkedin: value };
      if (p[0] === "exp") {
        const exps = [...(prev.experience || [])]; const i = +p[1];
        if (p[2] === "role") exps[i] = { ...exps[i], role: value };
        else if (p[2] === "company") exps[i] = { ...exps[i], company: value };
        else if (p[2] === "dates") exps[i] = { ...exps[i], dates: value };
        else if (p[2] === "bullet") { const bs = [...(exps[i].bullets || [])]; bs[+p[3]] = value; exps[i] = { ...exps[i], bullets: bs }; }
        return { ...prev, experience: exps };
      }
      if (p[0] === "hist") {
        const hist = [...(prev.history || [])]; const i = +p[1];
        if (p[2] === "role") hist[i] = { ...hist[i], role: value };
        else if (p[2] === "company") hist[i] = { ...hist[i], company: value };
        else if (p[2] === "dates") hist[i] = { ...hist[i], dates: value };
        else if (p[2] === "bullet") { const bs = [...(hist[i].bullets || [])]; bs[+p[3]] = value; hist[i] = { ...hist[i], bullets: bs }; }
        return { ...prev, history: hist };
      }
      if (p[0] === "skill") { const s = [...(prev.skills || [])]; s[+p[1]] = value; return { ...prev, skills: s }; }
      if (p[0] === "ach") { const a = [...(prev.achievements || [])]; a[+p[1]] = value; return { ...prev, achievements: a }; }
      if (p[0] === "edu") {
        const edu = [...(prev.education || [])]; const i = +p[1];
        if (p[2] === "degree") edu[i] = { ...edu[i], degree: value };
        else if (p[2] === "school") edu[i] = { ...edu[i], school: value };
        else if (p[2] === "year") edu[i] = { ...edu[i], year: value };
        return { ...prev, education: edu };
      }
      if (p[0] === "cert") {
        const cert = [...(prev.certifications || [])]; const i = +p[1];
        if (p[2] === "name") cert[i] = { ...cert[i], name: value };
        else if (p[2] === "issuer") cert[i] = { ...cert[i], issuer: value };
        return { ...prev, certifications: cert };
      }
      if (p[0] === "lang") {
        const lang = [...(prev.languages || [])]; const i = +p[1];
        if (p[2] === "name") lang[i] = { ...lang[i], name: value };
        else if (p[2] === "label") lang[i] = { ...lang[i], label: value };
        return { ...prev, languages: lang };
      }
      if (p[0] === "ref") {
        const refs = [...(prev.references || [])]; const i = +p[1];
        if (p[2] === "name") refs[i] = { ...refs[i], name: value };
        else if (p[2] === "title") refs[i] = { ...refs[i], title: value };
        else if (p[2] === "company") refs[i] = { ...refs[i], company: value };
        else if (p[2] === "phone") refs[i] = { ...refs[i], phone: value };
        else if (p[2] === "email") refs[i] = { ...refs[i], email: value };
        return { ...prev, references: refs };
      }
      if (p[0] === "proj") {
        const proj = [...(prev.projects || [])]; const i = +p[1];
        if (p[2] === "name") proj[i] = { ...proj[i], name: value };
        else if (p[2] === "description") proj[i] = { ...proj[i], description: value };
        else if (p[2] === "tech") proj[i] = { ...proj[i], tech: value };
        return { ...prev, projects: proj };
      }
      if (p[0] === "award") {
        const awards = [...(prev.awards || [])]; const i = +p[1];
        if (p[2] === "description") awards[i] = { ...awards[i], description: value };
        else awards[i] = { ...awards[i], title: value };
        return { ...prev, awards };
      }
      if (p[0] === "tool") { const t = [...(prev.tools || [])]; t[+p[1]] = value; return { ...prev, tools: t }; }
      if (p[0] === "memb") { const m = [...(prev.memberships || [])]; m[+p[1]] = value; return { ...prev, memberships: m }; }
      if (p[0] === "vol") { const v = [...(prev.volunteer || [])]; v[+p[1]] = value; return { ...prev, volunteer: v }; }
      if (p[0] === "decl") {
        const decl = { ...(prev.declaration || { declaration: "" }) };
        if (p[1] === "declaration") decl.declaration = value;
        else if (p[1] === "place") decl.place = value;
        else if (p[1] === "date") decl.date = value;
        return { ...prev, declaration: decl };
      }
      if (p[0] === "boardRole") {
        const roles = [...(prev.boardRoles || [])]; const i = +p[1];
        if (p[2] === "title") roles[i] = { ...roles[i], title: value };
        else if (p[2] === "dates") roles[i] = { ...roles[i], dates: value };
        else if (p[2] === "organization") roles[i] = { ...roles[i], organization: value };
        else if (p[2] === "description") roles[i] = { ...roles[i], description: value };
        return { ...prev, boardRoles: roles };
      }
      if (p[0] === "execTrain") {
        const tr = [...(prev.executiveTraining || [])]; const i = +p[1];
        if (p[2] === "name") tr[i] = { ...tr[i], name: value };
        else if (p[2] === "institution") tr[i] = { ...tr[i], institution: value };
        else if (p[2] === "year") tr[i] = { ...tr[i], year: value };
        return { ...prev, executiveTraining: tr };
      }
      if (p[0] === "pub") {
        const pubs = [...(prev.publications || [])]; const i = +p[1];
        if (p[2] === "title") pubs[i] = { ...pubs[i], title: value };
        else if (p[2] === "publisher") pubs[i] = { ...pubs[i], publisher: value };
        else if (p[2] === "year") pubs[i] = { ...pubs[i], year: value };
        return { ...prev, publications: pubs };
      }
      return prev;
    });
  }, []);

  const deleteField = useCallback((field: string) => {
    setAiData(prev => {
      if (!prev) return prev;
      const p = field.split(".");
      if (p[0] === "ach") { const a = [...(prev.achievements || [])]; a.splice(+p[1], 1); return { ...prev, achievements: a }; }
      if (p[0] === "skill") { const s = [...(prev.skills || [])]; s.splice(+p[1], 1); return { ...prev, skills: s }; }
      if (p[0] === "proj") { const pr = [...(prev.projects || [])]; pr.splice(+p[1], 1); return { ...prev, projects: pr }; }
      if (p[0] === "award") { const aw = [...(prev.awards || [])]; aw.splice(+p[1], 1); return { ...prev, awards: aw }; }
      if (p[0] === "exp" && p[2] === "bullet") {
        const exps = [...(prev.experience || [])]; const i = +p[1];
        const bs = [...(exps[i].bullets || [])]; bs.splice(+p[3], 1);
        exps[i] = { ...exps[i], bullets: bs }; return { ...prev, experience: exps };
      }
      if (p[0] === "hist" && p[2] === "bullet") {
        const hist = [...(prev.history || [])]; const i = +p[1];
        const bs = [...(hist[i].bullets || [])]; bs.splice(+p[3], 1);
        hist[i] = { ...hist[i], bullets: bs }; return { ...prev, history: hist };
      }
      if (p[0] === "tool") { const t = [...(prev.tools || [])]; t.splice(+p[1], 1); return { ...prev, tools: t }; }
      if (p[0] === "memb") { const m = [...(prev.memberships || [])]; m.splice(+p[1], 1); return { ...prev, memberships: m }; }
      if (p[0] === "vol") { const v = [...(prev.volunteer || [])]; v.splice(+p[1], 1); return { ...prev, volunteer: v }; }
      if (p[0] === "ref") { const r = [...(prev.references || [])]; r.splice(+p[1], 1); return { ...prev, references: r }; }
      if (p[0] === "edu") { const e = [...(prev.education || [])]; e.splice(+p[1], 1); return { ...prev, education: e }; }
      if (p[0] === "cert") { const c = [...(prev.certifications || [])]; c.splice(+p[1], 1); return { ...prev, certifications: c }; }
      if (p[0] === "lang") { const l = [...(prev.languages || [])]; l.splice(+p[1], 1); return { ...prev, languages: l }; }
      if (p[0] === "boardRole") { const r = [...(prev.boardRoles || [])]; r.splice(+p[1], 1); return { ...prev, boardRoles: r }; }
      if (p[0] === "execTrain") { const t = [...(prev.executiveTraining || [])]; t.splice(+p[1], 1); return { ...prev, executiveTraining: t }; }
      if (p[0] === "pub") { const pb = [...(prev.publications || [])]; pb.splice(+p[1], 1); return { ...prev, publications: pb }; }
      return prev;
    });
  }, []);

  const addBullet = useCallback((field: string) => {
    setAiData(prev => {
      if (!prev) return prev;
      const p = field.split(".");
      if (p[0] === "exp") {
        const exps = [...(prev.experience || [])]; const i = +p[1];
        const bs = [...(exps[i].bullets || []), "New bullet point"];
        exps[i] = { ...exps[i], bullets: bs }; return { ...prev, experience: exps };
      }
      if (p[0] === "hist") {
        const hist = [...(prev.history || [])]; const i = +p[1];
        const bs = [...(hist[i].bullets || []), "New bullet point"];
        hist[i] = { ...hist[i], bullets: bs }; return { ...prev, history: hist };
      }
      return prev;
    });
  }, []);

  // Progressive tightenFactor values per attempt (tighter budget each time)
  const TIGHTEN_FACTORS: number[] = [0.92, 0.85, 0.75];

  // Auto-trigger progressive tighten up to 3 times; show manual trim panel after 3 failures
  useEffect(() => {
    if (overflowSections.size === 0) {
      // Overflow resolved — reset counter and hide manual panel
      autoFixAttemptsRef.current = 0;
      setAutoFixAttempts(0);
      setShowManualTrimPanel(false);
      return;
    }
    if (autoFixAttemptsRef.current >= 3) {
      // All auto-attempts exhausted — show manual trim panel
      setShowManualTrimPanel(true);
      return;
    }
    if (!aiData || !selectedCategory) return;

    const t = setTimeout(() => {
      const attempt = autoFixAttemptsRef.current; // 0-based index
      const factor = TIGHTEN_FACTORS[Math.min(attempt, TIGHTEN_FACTORS.length - 1)];
      autoFixAttemptsRef.current += 1;
      setAutoFixAttempts(autoFixAttemptsRef.current);

      // Re-fit from the original AI data with a tighter budget
      // Using rawAiDataRef avoids compounding truncations across retries
      const base = rawAiDataRef.current ?? aiData;
      const tightened = fitContentToLayout(base, selectedCategory, selectedVariant, factor);
      setAiData(tightened);
    }, 900); // slight delay so the canvas has time to measure
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overflowSections.size, aiData]);

  const handleCvClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cv-field]");
    if (!el) return;
    const field = el.dataset.cvField!;
    const rect = el.getBoundingClientRect();
    const multiline = el.tagName === "P" || (el.dataset.cvMultiline === "true");
    setInlineEditor({
      field,
      value: getFieldValue(field),
      x: rect.left,
      y: rect.top,
      width: Math.max(rect.width, 260),
      multiline,
    });
  }, [getFieldValue]);

  const handleGenerate = useCallback(async (category: CareerCategory) => {
    setSelectedCategory(category);
    setStep("generating");
    setError("");

    try {
      const res = await fetch("/api/ai/rewrite-for-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, category }),
      });

      if (!res.ok) {
        const errPayload = asObject(await res.json().catch(() => ({ error: "AI rewrite failed" })));
        throw new Error(asString(errPayload.error) || `HTTP ${res.status}`);
      }

      const payload = asObject(await res.json());
      const data = asObject(payload.data);
      const rawDeclaration = asObject(cvData.declaration);
      const generatedDeclaration = asObject(data.declaration);

      // Helper: check if original DB data has meaningful content for a section
      const dbHas = (key: string): boolean => {
        const val = cvData[key];
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'object') return Object.values(val as Record<string,unknown>).some(v => !!v);
        return !!val;
      };

      const filled: CategoryCVData = {
        fullName: asString(data.fullName),
        title: asString(data.title),
        email: asString(data.email),
        phone: asString(data.phone),
        linkedin: asString(data.linkedin),
        website: asString(data.website),
        location: asString(data.location),
        tagline: dbHas("summary") ? asString(data.tagline) : "",
        profile: dbHas("summary") ? asString(data.profile) : "",
        skills: dbHas("skills") ? asStringArray(data.skills) : [],
        languages: dbHas("languages") ? asObjectArray(data.languages).map((l) => ({
          name: asString(l.name),
          level: asNumber(l.level, 50),
          label: asString(l.label) || asString(l.proficiency) || "Intermediate",
        })) : [],
        experience: dbHas("experiences") ? asObjectArray(data.experience).map((e) => ({
          role: asString(e.role),
          company: asString(e.company),
          dates: asString(e.dates),
          location: asString(e.location) || undefined,
          bullets: asStringArray(e.bullets),
        })) : [],
        education: dbHas("education") ? asObjectArray(data.education).map((e) => ({
          degree: asString(e.degree),
          school: asString(e.school),
          year: asString(e.year),
          details: asString(e.details),
        })) : [],
        certifications: dbHas("certifications") ? asObjectArray(data.certifications).map((c) => ({
          name: asString(c.name),
          issuer: asString(c.issuer),
          year: asString(c.year),
        })) : [],
        references: (dbHas("referees") || dbHas("references")) ? asObjectArray(data.references).map((r) => ({
          name: asString(r.name),
          title: asString(r.title),
          company: asString(r.company),
          phone: asString(r.phone),
          email: asString(r.email),
        })) : [],
        projects: dbHas("projects") ? asObjectArray(data.projects).map((p) => ({
          name: asString(p.name),
          description: asString(p.description),
          tech: asString(p.tech) || undefined,
        })) : [],
        achievements: dbHas("keyAchievements") ? asStringArray(data.achievements) : [],
        memberships: dbHas("memberships") ? asStringArray(data.memberships) : [],
        tools: dbHas("tools") ? asStringArray(data.tools) : [],
        volunteer: dbHas("volunteer") ? asStringArray(data.volunteer) : [],
        boardRoles: dbHas("boardRoles") ? asObjectArray(data.boardRoles).map((role) => ({
          title: asString(role.title),
          organization: asString(role.organization),
          dates: asString(role.dates) || formatDateRange(asString(role.startDate), asString(role.endDate)),
          description: asString(role.description) || undefined,
        })) : [],
        executiveTraining: dbHas("executiveTraining") ? asObjectArray(data.executiveTraining).map((t) => ({
          name: asString(t.name),
          institution: asString(t.institution),
          year: asString(t.year),
        })) : [],
        publications: dbHas("publications") ? asObjectArray(data.publications).map((p) => ({
          title: asString(p.title),
          publisher: asString(p.publisher),
          year: asString(p.year),
          type: asString(p.type) || undefined,
        })) : [],
        history: dbHas("experiences") ? asObjectArray(data.history).map((h) => ({
          role: asString(h.role),
          company: asString(h.company),
          dates: asString(h.dates),
          location: asString(h.location) || undefined,
          bullets: asStringArray(h.bullets),
        })) : [],
        awards: dbHas("awards") ? asObjectArray(data.awards).map((a) => ({
          title: asString(a.title),
          description: asString(a.description) || undefined,
        })) : [],
        declaration: dbHas("declaration")
          ? (asString(generatedDeclaration.declaration)
            ? {
                declaration: asString(generatedDeclaration.declaration),
                place: asString(generatedDeclaration.place) || asString(rawDeclaration.place) || undefined,
                date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
              }
            : asString(rawDeclaration.declaration)
            ? {
                declaration: asString(rawDeclaration.declaration),
                place: asString(rawDeclaration.place) || undefined,
                date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
              }
            : undefined)
          : undefined,
      };

      // ── Engine: fit content to layout geometry (sentence-safe truncation) ──
      const fitted = fitContentToLayout(filled, category, selectedVariant);

      // Reset overflow retry state for fresh generation
      autoFixAttemptsRef.current = 0;
      setAutoFixAttempts(0);
      setShowManualTrimPanel(false);

      // ── If JD is available, optimize inline (single generation phase) ──
      if (shouldAutoOptimize && jobDescription.trim()) {
        setShouldAutoOptimize(false);
        try {
          const optRes = await fetch("/api/ai/optimize-for-job", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cvData: fitted,
              jobDescription,
              analysis: jobAnalysis,
              category,
              company,
              companyAddress,
              jobTitle,
            }),
          });
          if (optRes.ok) {
            const optData = asObject(await optRes.json());
            const optimized = optData.optimizedCvData
              ? fitContentToLayout(optData.optimizedCvData as CategoryCVData, category, selectedVariant)
              : fitted;
            rawAiDataRef.current = optimized;
            setAiData(optimized);
            if (typeof optData.coverLetter === "string" && optData.coverLetter) {
              setCoverLetter(optData.coverLetter);
            }
          } else {
            rawAiDataRef.current = fitted;
            setAiData(fitted);
          }
        } catch {
          rawAiDataRef.current = fitted;
          setAiData(fitted);
        }
      } else {
        rawAiDataRef.current = fitted;
        setAiData(fitted);
      }

      setStep("preview");
    } catch (err: unknown) {
      console.error("CV generation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate CV");
      setStep("error");
    }
  }, [cvData, shouldAutoOptimize, jobDescription, jobAnalysis, company, companyAddress, jobTitle]);

  const executePdfDownload = useCallback(async () => {
    const element = previewRef.current;
    if (!element || !aiData || !selectedCategory) return;

    // Set state synchronously before any await so React paints the overlay
    setDownloadingPdf(true);
    setPdfGenerating(true);

    // Yield to the browser so the overlay renders before heavy work
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    try {
      const fullName = aiData.fullName || "CV";
      const safeName = fullName.replace(/\s+/g, "_");
      const cat = `_${selectedCategory}`;
      const filename = `${safeName}${cat}_CV_${new Date().getFullYear()}`;

      const month = new Date().toLocaleString("default", { month: "short", year: "numeric" });
      const docTitle = `${fullName} — ${selectedCategory === "mid-senior" ? "Mid-Senior" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} CV (${month})`;
      const docContent = JSON.stringify({
        studioData: aiData,
        studioCategory: selectedCategory,
        studioVariant: selectedVariant,
        studioTheme: selectedTheme,
      });

      try {
        await printCvAsPdf(element, {
          filename,
          useApi2Pdf: true,
          userId,
          docTitle,
          docContent,
          coverLetter: coverLetter ?? undefined,
        });
      } catch (apiErr) {
        console.warn("[pdf] api2pdf failed, falling back to print dialog:", apiErr);
        toast.error("Cloud PDF failed — opening print dialog as fallback.");
        let printOk = false;
        try {
          await printCvAsPdf(element, { filename, useApi2Pdf: false });
          printOk = true;
        } catch (fallbackErr) {
          console.error("Fallback print failed", fallbackErr);
        }
        if (!printOk) {
          // Both PDF methods failed — save CV data to Documents without PDF so nothing is lost
          fetch("/api/documents/save-cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: docTitle, content: docContent }),
          }).catch(() => {});
          if (coverLetter) {
            const clTitle = docTitle.replace(/CV \(/, "Cover Letter (");
            fetch("/api/documents/save-cover-letter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ coverLetter, title: clTitle }),
            }).catch(() => {});
          }
          localStorage.setItem("fusecv-new-docs", "true");
          toast.error(
            "PDF download failed — your CV has been saved to Documents. You can retry from there.",
            { duration: 7000 }
          );
        }
      }
    } finally {
      setDownloadingPdf(false);
      setPdfGenerating(false);
    }
  }, [aiData, selectedCategory, selectedVariant, selectedTheme, coverLetter, userId]);

  const handleAnalyzeProfile = useCallback(async () => {
    if (!jobDescription.trim() || profileAnalyzing) return;
    setProfileAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, jobDescription }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setProfileAnalysis(data);
      if (data.atsScore !== undefined) {
        setJobAnalysis({ atsScore: data.atsScore, missingSkills: data.missingSkills || [], weakAreas: data.weakAreas || [] });
      }
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setProfileAnalyzing(false);
    }
  }, [cvData, jobDescription, profileAnalyzing]);

  const handleAnalyzeJD = useCallback(async () => {
    if (!aiData || !jobDescription.trim() || analyzing) return;
    setAnalyzing(true);
    setJobAnalysis(null);
    try {
      const res = await fetch("/api/ai/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: aiData, jobDescription }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setJobAnalysis(data);
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [aiData, jobDescription, analyzing]);

  const handleOptimizeForJob = useCallback(async () => {
    if (!aiData || !jobDescription.trim() || optimizing) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/ai/optimize-for-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: aiData, jobDescription, analysis: jobAnalysis, category: selectedCategory, company, companyAddress, jobTitle }),
      });
      if (!res.ok) throw new Error("Optimization failed");
      const data = await res.json();
      if (data.optimizedCvData) {
        const fitted = fitContentToLayout(data.optimizedCvData as CategoryCVData, selectedCategory!, selectedVariant);
        rawAiDataRef.current = fitted;
        setAiData(fitted);
      }
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter as string);
      }
      toast.success("CV optimized! Cover letter generated below.");
      setShowJobOptimizer(false);
      setJobAnalysis(null);
    } catch (err) {
      console.error(err);
      toast.error("Optimization failed. Please try again.");
    } finally {
      setOptimizing(false);
    }
  }, [aiData, jobDescription, jobAnalysis, selectedCategory, optimizing]);

  const handlePayAndDownload = useCallback(async (plan: PlanId) => {
    if (!aiData || paymentProcessing) return;

    const personalInfo = cvData?.personalInfo as Record<string, string> | undefined;
    const customerEmail = aiData.email || personalInfo?.email || "";
    if (!customerEmail) {
      toast.error("Please add your email address to your profile before downloading.");
      return;
    }

    const planDef = CV_PLANS.find((p) => p.id === plan)!;

    // Spin the button immediately
    setPaymentProcessing(true);

    // Store CV state (+ job fields + plan) so we can restore everything on return
    sessionStorage.setItem("fusecv-pending-cv", JSON.stringify({
      aiData, selectedCategory, selectedVariant, selectedTheme, coverLetter,
      jobDescription, company, jobTitle, companyAddress, cvPath, plan,
    }));

    try {
      const callbackUrl = `${window.location.origin}/cv-payment/callback?plan=${plan}`;
      const res = await fetch("/api/payments/cv-download-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          name: aiData.fullName || personalInfo?.fullName || "FuseCV User",
          redirectUrl: callbackUrl,
          amount: planDef.amount,
        }),
      });
      const data = await res.json();
      if (!data.link) throw new Error(data.error || "Failed to create payment link");
      window.location.href = data.link;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment setup failed";
      toast.error(msg);
      setPaymentProcessing(false);
    }
  }, [aiData, cvData, selectedCategory, selectedVariant, selectedTheme, coverLetter, jobDescription, company, jobTitle, companyAddress, cvPath, paymentProcessing]);

  const handlePlanSelect = useCallback((planId: PlanId) => {
    setSelectedPlan(planId);
    // Professional / Full on Path 1 — need job details first
    if ((planId === "professional" || planId === "full") && cvPath !== "apply") {
      setShowPricingModal(false);
      setCvPath("apply");
      setStep("analyze-profile");
      toast.info("Add job details to generate your cover letter");
      return;
    }
    // All other cases — proceed to payment
    setShowPricingModal(false);
    void handlePayAndDownload(planId);
  }, [cvPath, handlePayAndDownload]);

  // ── Category Selection ──
  if (step === "select") {
    // ── Recommendation reason from raw profile data ──
    const _exps = Array.isArray(cvData.experiences) ? cvData.experiences as any[] : [];
    const _boards = Array.isArray(cvData.boardRoles) ? cvData.boardRoles as any[] : [];
    const _startYears = _exps
      .map((e: any) => e?.startDate ? new Date(e.startDate).getFullYear() : null)
      .filter((y): y is number => y !== null);
    const _yearsSpan = _startYears.length > 0 ? new Date().getFullYear() - Math.min(..._startYears) : 0;
    const _sortedExps = [..._exps].sort((a: any, b: any) => {
      const aEnd = a?.endDate ? new Date(a.endDate).getTime() : Date.now();
      const bEnd = b?.endDate ? new Date(b.endDate).getTime() : Date.now();
      return bEnd - aEnd;
    });
    const _currentTitle = (_sortedExps[0] as any)?.title?.trim() || "";
    const _recCat = CATEGORY_CARDS.find(c => c.id === detectedCategory)!;
    const _recReasonParts: string[] = [];
    if (_yearsSpan > 0) _recReasonParts.push(`${_yearsSpan}${detectedCategory === "executive" ? "+" : ""} years of experience`);
    if (_currentTitle) _recReasonParts.push(`most recent: ${_currentTitle}`);
    if (detectedCategory === "executive" && _boards.length > 0) _recReasonParts.push(`${_boards.length} board role${_boards.length > 1 ? "s" : ""}`);
    if (_exps.length > 0) _recReasonParts.push(`${_exps.length} role${_exps.length !== 1 ? "s" : ""}`);
    const _recReason = _recReasonParts.join(" · ");

    // Lock reasons for non-recommended categories
    const _lockReasons: Record<CareerCategory, string> = {
      junior:       "Your profile has management/senior-level roles — a junior layout won't accommodate your content.",
      "mid-senior": "Your profile signals executive-level seniority — this layout won't give you the space needed.",
      executive:    "Your profile is better suited to a mid-senior or junior layout at this stage.",
    };

    return (
      <div className="max-w-5xl mx-auto py-10 px-4">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your CV Layout</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            The layout category is determined automatically from your profile data to ensure your content
            fits perfectly without overflow or gaps.
          </p>
        </div>

        {/* ── Matched category banner ── */}
        {_recCat && (
          <div className={`mb-8 flex items-center justify-between gap-4 p-4 rounded-xl border-2 bg-gradient-to-r ${_recCat.bgGradient} ${_recCat.borderColor.split(" ")[0]}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`shrink-0 p-2.5 rounded-xl bg-white shadow-sm ${_recCat.color}`}>
                <_recCat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Matched category</span>
                  <span className={`text-sm font-extrabold ${_recCat.color}`}>{_recCat.label}</span>
                  <span className="text-xs text-slate-500">— {_recCat.subtitle}</span>
                </div>
                {_recReason && (
                  <div className="text-xs text-slate-500 mt-0.5">{_recReason}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* Override toggle — for experienced users only */}
              <button
                onClick={() => setCategoryOverride(prev => !prev)}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline underline-offset-2 whitespace-nowrap transition-colors"
              >
                {categoryOverride ? "Lock selection" : "Override"}
              </button>
              <button
                onClick={() => { setCategoryOverride(false); setSelectedCategory(detectedCategory); setStep("pick-layout"); }}
                className={`text-xs font-bold px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 ${_recCat.color} hover:shadow-md transition-all whitespace-nowrap`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Override warning */}
        {categoryOverride && (
          <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>
              <strong>Override active.</strong> You can now select any category, but content may overflow or leave gaps if it doesn&apos;t match your profile volume. The system is designed to fit your content automatically — overriding may produce a suboptimal CV.
            </span>
          </div>
        )}

        {/* ── Category cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.icon;
            const isMatched   = cat.id === detectedCategory;
            const isClickable = isMatched || categoryOverride;
            const lockReason  = !isMatched ? _lockReasons[cat.id as CareerCategory] : "";

            return (
              <div
                key={cat.id}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  isMatched
                    ? `bg-gradient-to-br ${cat.bgGradient} ${cat.borderColor} shadow-xl ring-2 ring-offset-2 ${cat.borderColor.split(" ")[0].replace("border", "ring")}`
                    : categoryOverride
                    ? "bg-white border-amber-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    : "bg-white/60 border-slate-100 opacity-40 saturate-0 cursor-not-allowed select-none"
                }`}
              >
                {/* Lock overlay for non-matched + not overriding */}
                {!isMatched && !categoryOverride && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/50 backdrop-blur-[1px]">
                    <Lock className="h-6 w-6 text-slate-400" />
                    <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed max-w-[160px]">
                      {lockReason}
                    </p>
                  </div>
                )}

                {/* Override warning badge */}
                {!isMatched && categoryOverride && (
                  <div className="absolute top-3 right-3 z-10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-700">
                    ⚠ Override
                  </div>
                )}

                {/* Matched badge */}
                {isMatched && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white shadow-sm border border-slate-200 text-slate-700">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                    Matched
                  </div>
                )}

                {/* Card body — clickable only when appropriate */}
                <button
                  disabled={!isClickable}
                  onClick={() => {
                    if (!isClickable) return;
                    setSelectedCategory(cat.id);
                    setStep("pick-layout");
                  }}
                  className="w-full text-left px-5 pt-5 pb-5 disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 rounded-lg bg-white shadow-sm ${isMatched ? cat.color : categoryOverride ? "text-amber-500" : "text-slate-300"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`text-base font-bold ${isMatched ? cat.color : categoryOverride ? "text-slate-600" : "text-slate-400"}`}>{cat.label}</div>
                      <div className="text-[11px] text-slate-500">{cat.subtitle}</div>
                    </div>
                  </div>

                  <p className={`text-[11px] leading-relaxed mb-3 ${isMatched || categoryOverride ? "text-slate-600" : "text-slate-400"}`}>
                    {cat.description}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Sections included</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.required.slice(0, 5).map((s) => (
                        <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${isMatched ? "bg-white/80 border-slate-200 text-slate-600" : "bg-white/50 border-slate-100 text-slate-400"}`}>{s}</span>
                      ))}
                      {cat.required.length > 5 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/50 text-slate-400">+{cat.required.length - 5} more</span>
                      )}
                    </div>
                  </div>

                  <div className={`mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    isMatched
                      ? `border-white/60 bg-white/80 ${cat.color} shadow-sm`
                      : categoryOverride
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-100 bg-slate-50/50 text-slate-300"
                  }`}>
                    {isMatched ? <><Sparkles className="h-4 w-4" /> Select Layout</> : categoryOverride ? <><AlertCircle className="h-4 w-4" /> Override & Select</> : <><Lock className="h-4 w-4" /> Locked</>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom hint */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          {categoryOverride
            ? "Override is active — select any category. Switching back? Click \"Lock selection\" above."
            : "Category is matched automatically. For advanced use, click \"Override\" above to unlock all options."}
        </p>
      </div>
    );
  }

  // ── Choose Path ──
  if (step === "choose-path") {
    return (
      <div className="max-w-xl mx-auto pt-4 pb-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">CV Studio</h2>
          <p className="text-sm text-slate-500 mt-1">What do you want to do?</p>
        </div>

        {/* Path cards */}
        <div className="space-y-4">
          {/* Path 1 — Improve my CV */}
          <button
            onClick={() => { setCvPath("improve"); setStep("analyze-profile"); }}
            className="w-full text-left group flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-200"
          >
            <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-base">Improve my CV</p>
              <p className="text-sm text-slate-500 mt-0.5">Get a clean, professional CV in seconds</p>
            </div>
            <ArrowLeft className="h-5 w-5 text-slate-300 rotate-180 shrink-0 mt-0.5 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* Path 2 — Apply for a job */}
          <button
            onClick={() => { setCvPath("apply"); setStep("analyze-profile"); }}
            className="w-full text-left group flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-200"
          >
            <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-base">Apply for a job</p>
              <p className="text-sm text-slate-500 mt-0.5">Optimize your CV for a specific job and increase your chances</p>
            </div>
            <ArrowLeft className="h-5 w-5 text-slate-300 rotate-180 shrink-0 mt-0.5 group-hover:text-violet-400 transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  // ── Profile Analysis (initial step, auto-runs) ──
  if (step === "analyze-profile") {
    const ps = profileAnalysis?.completenessScore ?? 0;
    const psColor = ps >= 75 ? "text-emerald-600" : ps >= 50 ? "text-amber-600" : "text-red-600";
    const psBar   = ps >= 75 ? "bg-emerald-500"   : ps >= 50 ? "bg-amber-500"   : "bg-red-500";
    const jdScore = profileAnalysis?.atsScore;
    const jdColor = jdScore !== undefined ? (jdScore >= 75 ? "text-emerald-600" : jdScore >= 50 ? "text-amber-600" : "text-red-600") : "";
    const jdBar   = jdScore !== undefined ? (jdScore >= 75 ? "bg-emerald-500"   : jdScore >= 50 ? "bg-amber-500"   : "bg-red-500")   : "";
    const hasJDResult = jdScore !== undefined;

    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-4">
        {/* Back + Header */}
        <button
          onClick={() => setStep("choose-path")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cvPath === "apply" ? "bg-violet-100 text-violet-600" : "bg-indigo-100 text-indigo-600"}`}>
            {cvPath === "apply" ? <Briefcase className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">CV Studio</h2>
            <p className="text-xs text-slate-500">
              {cvPath === "apply" ? "Optimize your CV for a specific job" : "Design and generate your professional CV"}
            </p>
          </div>
        </div>

        {/* Profile Analysis sub-header */}
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
          <p className="text-sm font-semibold text-slate-700">Profile Analysis</p>
          <span className="text-xs text-slate-400">— AI reviews your profile before generating your CV</span>
        </div>

        {/* Banner when returning from plan selection */}
        {selectedPlan && (cvPath === "apply") && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-800">
            <span className="text-base">{selectedPlan === "full" ? "🔥" : "⭐"}</span>
            <span>
              <strong>{CV_PLANS.find(p => p.id === selectedPlan)?.label}</strong> plan selected —
              fill in the job details below to generate your tailored CV and cover letter.
            </span>
          </div>
        )}

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-elevated divide-y divide-slate-100 overflow-hidden">

          {/* Loading */}
          {profileAnalyzing && !profileAnalysis && (
            <div className="flex items-center gap-3 px-6 py-5 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
              <span className="text-sm">Analyzing your profile…</span>
            </div>
          )}

          {/* Completeness score */}
          {profileAnalysis && (
            <div className="flex items-center gap-4 px-6 py-5">
              <div className={`text-4xl font-black tabular-nums shrink-0 ${psColor}`}>{ps}%</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Profile Completeness</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-2 rounded-full ${psBar}`} style={{ width: `${ps}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {ps >= 75 ? "Strong profile — ready to generate a great CV"
                   : ps >= 50 ? "Good profile — a few gaps to address"
                   : "Thin profile — consider adding more detail before generating"}
                </p>
              </div>
            </div>
          )}

          {/* Strengths */}
          {profileAnalysis && profileAnalysis.strengths.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">Profile Strengths</p>
              <ul className="space-y-1.5">
                {profileAnalysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {profileAnalysis && profileAnalysis.gaps.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">Profile Gaps</p>
              <ul className="space-y-1.5 mb-4">
                {profileAnalysis.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setNavigatingToBuilder(true); router.push("/cv-builder"); }}
                disabled={navigatingToBuilder}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-70"
              >
                {navigatingToBuilder
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <UserPen className="h-3.5 w-3.5" />}
                Edit Profile to fix these gaps
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                You can also proceed as is — gaps won&apos;t stop CV generation.
              </p>
            </div>
          )}

          {/* ── JD Section — only shown for "Apply for a job" path ── */}
          {cvPath === "apply" && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold text-slate-800">Paste Job Description</span>
            </div>

            {/* Company name + Job title (side by side) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className={`w-full text-xs p-2.5 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 placeholder:text-slate-400 ${(jobTitle.trim() || jobDescription.trim()) && !company.trim() ? "border-red-200" : "border-slate-200"}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Product Manager"
                  className={`w-full text-xs p-2.5 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 placeholder:text-slate-400 ${(company.trim() || jobDescription.trim()) && !jobTitle.trim() ? "border-red-200" : "border-slate-200"}`}
                />
              </div>
            </div>

            {/* Company address */}
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">Company Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="e.g. 10 Downing St, London, UK"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 placeholder:text-slate-400"
              />
            </div>

            {/* Job description */}
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (hasJDResult) setProfileAnalysis((prev) => prev ? { ...prev, atsScore: undefined, missingSkills: undefined, weakAreas: undefined } : null);
                  setJobAnalysis(null);
                }}
                rows={5}
                placeholder="Paste the full job description here — requirements, responsibilities, qualifications…"
                className={`w-full text-xs p-3 border rounded-xl bg-slate-50 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 placeholder:text-slate-400 transition ${(company.trim() || jobTitle.trim()) && !jobDescription.trim() ? "border-red-200" : "border-slate-200"}`}
              />
            </div>

            {jobDescription.trim() && !hasJDResult && (
              <button
                onClick={() => void handleAnalyzeProfile()}
                disabled={profileAnalyzing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 shadow-lg shadow-violet-200/40 transition-all duration-200 hover:shadow-xl"
              >
                {profileAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {profileAnalyzing ? "Analyzing…" : "Analyze Profile vs Job Description"}
              </button>
            )}

            {/* JD Results */}
            {hasJDResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-xl border bg-slate-50">
                  <div className={`text-3xl font-black tabular-nums shrink-0 ${jdColor}`}>{jdScore}%</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 mb-1">ATS Match Score</p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${jdBar}`} style={{ width: `${jdScore}%` }} />
                    </div>
                  </div>
                </div>

                {profileAnalysis?.missingSkills && profileAnalysis.missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Missing Skills / Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profileAnalysis.missingSkills.map((s, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profileAnalysis?.weakAreas && profileAnalysis.weakAreas.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Weak Areas</p>
                    <ul className="space-y-1.5">
                      {profileAnalysis.weakAreas.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* ── CTA ── */}
          <div className="px-6 py-5 bg-slate-50">
            {(() => {
              if (cvPath === "apply") {
                const hasAny = company.trim() || jobTitle.trim() || jobDescription.trim();
                const hasAll = company.trim() && jobTitle.trim() && jobDescription.trim();
                const incomplete = !!(hasAny && !hasAll);
                return (
                  <>
                    <button
                      onClick={() => {
                        if (!hasAll) return;
                        setShouldAutoOptimize(true);
                        setStep("select");
                      }}
                      disabled={!hasAll || (profileAnalyzing && !profileAnalysis)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 shadow-lg shadow-violet-200/40 transition-all duration-200 hover:shadow-xl"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Tailored CV →
                    </button>
                    {!hasAll && (
                      <p className="text-center text-xs text-slate-400 mt-2">
                        {incomplete
                          ? "Please fill in all three: company name, job title, and job description."
                          : "Fill in the job details above to continue."}
                      </p>
                    )}
                    {hasAll && !profileAnalysis && profileAnalyzing && (
                      <p className="text-center text-xs text-slate-400 mt-2">Wait for profile analysis to complete…</p>
                    )}
                  </>
                );
              }
              // Path: "improve" — no JD required
              return (
                <button
                  onClick={() => setStep("select")}
                  disabled={profileAnalyzing && !profileAnalysis}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 shadow-lg shadow-indigo-200/40 transition-all duration-200 hover:shadow-xl"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate My CV →
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ── Layout Picker (within selected category) ──
  if (step === "pick-layout" && selectedCategory) {
    const cat = CATEGORY_CARDS.find((c) => c.id === selectedCategory)!;
    const layouts = LAYOUT_OPTIONS[selectedCategory];
    const Icon = cat.icon;
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <button onClick={() => setStep("select")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to categories
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-white shadow-sm border ${cat.borderColor.split(" ")[0]} ${cat.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{cat.label} Layouts</h2>
            <p className="text-xs text-slate-500">{cat.subtitle} — choose a design</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-8 max-w-lg">
          Pick the layout design that appeals to you. Your CV content will be AI-generated and fitted to the chosen design.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {layouts.map((layout) => (
            <button
              key={layout.variant}
              onClick={() => { setSelectedVariant(layout.variant); void handleGenerate(selectedCategory); }}
              className={`group relative text-left rounded-2xl border-2 bg-gradient-to-br ${cat.bgGradient} ${cat.borderColor} shadow-elevated transition-all duration-200 hover:shadow-xl hover:-translate-y-1 overflow-hidden`}
            >
              {/* Mini preview */}
              <div className="px-5 pt-5 pb-3">
                <div className="relative mx-auto rounded-lg overflow-hidden shadow-sm border border-slate-200/60" style={{ width: "100%", aspectRatio: "210/297", backgroundColor: "#fff" }}>
                  <VariantMiniPreview category={selectedCategory} variant={layout.variant} />
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className={`text-sm font-bold ${cat.color} mb-1`}>{layout.name}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{layout.description}</p>
                <div className={`flex items-center justify-center gap-2 py-2 rounded-xl bg-white/80 border border-slate-200 text-sm font-medium ${cat.color} group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-50 group-hover:shadow-sm transition-all duration-200`}>
                  <Sparkles className="h-4 w-4" />
                  Select & Generate
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Generating ──
  if (step === "generating") {
    const cat = CATEGORY_CARDS.find((c) => c.id === selectedCategory);
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">
          {shouldAutoOptimize
            ? <>Building your <span className="font-semibold">tailored {cat?.label} CV</span> &amp; cover letter…</>
            : <>Generating your <span className="font-semibold">{cat?.label} CV</span>…</>}
        </p>
        <p className="text-xs text-slate-400">
          {shouldAutoOptimize ? "Optimizing for the job description — this may take 20–30 seconds" : "This may take 10–15 seconds"}
        </p>
      </div>
    );
  }

  // ── Error ──
  if (step === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-600">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setStep("select")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {selectedCategory && (
            <button
              onClick={() => void handleGenerate(selectedCategory)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Preview ──
  if (!aiData || !selectedCategory) return null;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-white shadow-elevated rounded-2xl">
        {/* Top row: back + badge + actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => { setStep("select"); setAiData(null); }}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Change Layout</span>
              <span className="sm:hidden">Back</span>
            </button>

            <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
              selectedCategory === "junior" ? "bg-emerald-100 text-emerald-700" :
              selectedCategory === "mid-senior" ? "bg-indigo-100 text-indigo-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              {CATEGORY_CARDS.find((c) => c.id === selectedCategory)?.label} Layout
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => void handleGenerate(selectedCategory)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-md border border-slate-200 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Regenerate</span>
              <span className="sm:hidden">Redo</span>
            </button>
            <button
              onClick={() => { setNavigatingToBuilder(true); router.push("/cv-builder"); }}
              disabled={navigatingToBuilder}
              className="flex items-center gap-1 sm:gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-70"
            >
              {navigatingToBuilder ? <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> : <UserPen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Profile</span>
            </button>
            <button
              onClick={() => {
                if (overflowSections.size > 0 && autoFixAttempts >= 3) {
                  setShowManualTrimPanel(prev => !prev);
                } else {
                  setEditMode(!editMode);
                  setInlineEditor(null);
                }
              }}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-md border px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs transition-colors ${
                editMode
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : overflowSections.size > 0 && autoFixAttempts >= 3
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : overflowSections.size > 0
                    ? "border-amber-200 bg-amber-50/50 text-amber-500"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {editMode ? <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : (overflowSections.size > 0 && fixingOverflow) ? <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> : <PenLine className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              <span className="hidden sm:inline">
                {editMode ? "Done Editing" : overflowSections.size > 0 && fixingOverflow ? "Auto-fixing…" : overflowSections.size > 0 && autoFixAttempts >= 3 ? "Fix Overflow" : "Edit CV"}
              </span>
              <span className="sm:hidden">{editMode ? "Done" : "Edit"}</span>
              {!editMode && overflowSections.size > 0 && autoFixAttempts >= 3 && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">{overflowSections.size}</span>
              )}
            </button>
            <button
              onClick={() => setShowPricingModal(true)}
              disabled={downloadingPdf || paymentProcessing}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-white shadow-lg shadow-indigo-200/40 transition-all duration-200 hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-60"
            >
              {downloadingPdf ? <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> : <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              {downloadingPdf ? "Generating..." : "Download"}
            </button>
          </div>
        </div>

        {/* Theme picker */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">CV Theme</span>
            </div>
            <span
              key={selectedTheme}
              className="text-[11px] font-bold text-indigo-600 animate-fade-in-up"
            >
              {THEME_LIST.find(t => t.name === selectedTheme)?.label ?? selectedTheme}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {THEME_LIST.map((t, i) => {
              const active = selectedTheme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTheme(t.name)}
                  title={`${t.label} — tap to apply`}
                  style={{
                    backgroundColor: t.color,
                    animationDelay: `${i * 30}ms`,
                    transform: active ? "scale(1.25)" : "scale(1)",
                    boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${t.color}` : "none",
                  }}
                  className={`relative h-6 w-6 sm:h-7 sm:w-7 rounded-full border transition-all duration-200 shrink-0 animate-fade-in-up
                    ${active
                      ? "border-transparent z-10"
                      : "border-white/60 hover:scale-110 hover:z-10 hover:shadow-md"
                    }`}
                >
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 leading-none">Tap any swatch to instantly preview it on your CV</p>
        </div>
      </div>

      {/* Manual Trim Panel — shown after 3 auto-fix attempts still fail */}
      {showManualTrimPanel && overflowSections.size > 0 && !fixingOverflow && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-amber-800">Content is still overflowing</span>
            </div>
            <button onClick={() => setShowManualTrimPanel(false)} className="text-amber-500 hover:text-amber-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            The AI couldn&apos;t fully fix the overflow automatically. Use the quick actions below to trim content from the sections that are overflowing.
          </p>
          <div className="flex flex-wrap gap-2">
            {(overflowSections.has("experience") || overflowSections.has("_page")) && aiData && (
              <button
                onClick={() => {
                  setAiData(prev => {
                    if (!prev) return prev;
                    const exps = prev.experience?.map(e => ({
                      ...e,
                      bullets: e.bullets && e.bullets.length > 2 ? e.bullets.slice(0, -1) : e.bullets,
                    })) ?? [];
                    return { ...prev, experience: exps };
                  });
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
              >
                − Remove 1 bullet per role
              </button>
            )}
            {overflowSections.has("skills") && aiData && (
              <button
                onClick={() => {
                  setAiData(prev => {
                    if (!prev) return prev;
                    const trimCount = Math.max(6, (prev.skills?.length ?? 0) - 3);
                    return { ...prev, skills: prev.skills?.slice(0, trimCount) ?? [] };
                  });
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
              >
                − Remove 3 skills
              </button>
            )}
            {overflowSections.has("achievements") && aiData && (
              <button
                onClick={() => {
                  setAiData(prev => {
                    if (!prev) return prev;
                    const achs = prev.achievements ?? [];
                    return { ...prev, achievements: achs.slice(0, Math.max(2, achs.length - 1)) };
                  });
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
              >
                − Remove 1 achievement
              </button>
            )}
            {overflowSections.has("profile") && aiData && (
              <button
                onClick={() => {
                  setAiData(prev => {
                    if (!prev || !prev.profile) return prev;
                    const words = prev.profile.split(/\s+/);
                    const shorter = words.slice(0, Math.max(30, Math.floor(words.length * 0.8))).join(" ");
                    const lastPeriod = shorter.lastIndexOf(".");
                    return { ...prev, profile: lastPeriod > shorter.length * 0.4 ? shorter.slice(0, lastPeriod + 1) : shorter + "." };
                  });
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
              >
                − Shorten profile summary
              </button>
            )}
            <button
              onClick={() => {
                setEditMode(true);
                setShowManualTrimPanel(false);
              }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium flex items-center gap-1"
            >
              <PenLine className="h-3 w-3" /> Edit manually
            </button>
          </div>
          <p className="text-[10px] text-amber-600">Sections overflowing: {Array.from(overflowSections).filter(s => s !== "_page").join(", ") || "unknown"}</p>
        </div>
      )}

      {/* CV Preview — inline editing */}
      {editMode && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
            <PenLine className="h-3.5 w-3.5 shrink-0" />
            <span>Click any text in the CV to edit it inline. Press <kbd className="bg-white border border-indigo-200 rounded px-1 py-0.5 text-[10px]">Enter</kbd> to save or <kbd className="bg-white border border-indigo-200 rounded px-1 py-0.5 text-[10px]">Esc</kbd> to cancel.</span>
          </div>
          {overflowSections.size > 0 && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {autoFixAttempts < 3 ? (
                  <span>{overflowSections.size} section{overflowSections.size > 1 ? "s" : ""} overflowing — auto-fixing… (attempt {autoFixAttempts}/3)</span>
                ) : (
                  <span>{overflowSections.size} section{overflowSections.size > 1 ? "s" : ""} still overflowing — use the trim panel above.</span>
                )}
              </div>
              {autoFixAttempts >= 3 && (
                <button
                  onClick={() => {
                    // Reset counter so auto-fix tries again with tighter budgets
                    autoFixAttemptsRef.current = 0;
                    setAutoFixAttempts(0);
                    setShowManualTrimPanel(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {/* ── Payment Modal ── */}
      {cvPaidReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              {autoDownload || downloadingPdf
                ? <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                : <CheckCircle2 className="h-8 w-8 text-emerald-500" />}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-800">Payment Confirmed!</h2>
              <p className="text-sm text-slate-500 mt-1">
                {autoDownload || downloadingPdf
                  ? "Preparing your download…"
                  : "Your CV is ready to download."}
              </p>
            </div>
            {!autoDownload && (
              <button
                onClick={async () => {
                  setCvPaidReady(false);
                  localStorage.setItem("fusecv-new-docs", "true");
                  await executePdfDownload();
                }}
                disabled={downloadingPdf}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
              >
                {downloadingPdf
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</>
                  : <><Download className="h-4 w-4" /> Download My CV</>}
              </button>
            )}
          </div>
        </div>
      )}

      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Choose Your Plan</h2>
              <button onClick={() => setShowPricingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {CV_PLANS
                .filter((p) => cvPath === "apply" ? p.id !== "starter" : true)
                .map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={paymentProcessing}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                      selectedPlan === plan.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    } disabled:opacity-60`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{plan.label}</span>
                        {plan.badge && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${plan.badgeClass}`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-base text-indigo-700 shrink-0 ml-2">
                        {CURRENCY} {plan.amount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{plan.desc}</p>
                    {(plan.id === "professional" || plan.id === "full") && cvPath !== "apply" && (
                      <p className="text-[10px] text-violet-500 mt-1.5 font-medium">
                        ↩ Requires job details — you&apos;ll be asked to add them
                      </p>
                    )}
                  </button>
                ))}
            </div>

            {paymentProcessing && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to payment…
              </div>
            )}

            <p className="text-center text-[11px] text-slate-400 mt-2">
              Powered by Pesapal · Secure &amp; Encrypted
            </p>
          </div>
        </div>
      )}

      {/* ── PDF Generating full-screen overlay ── */}
      {pdfGenerating && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5">
            {/* Spinning ring */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-base font-semibold text-slate-800">Generating your PDF…</p>
              <p className="text-xs text-slate-500">This usually takes 5–15 seconds</p>
            </div>
            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-indigo-400"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optimizing overlay banner */}
      {optimizing && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-200 bg-violet-50 text-violet-700">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span className="text-xs font-medium">Tailoring your CV to the job description…</span>
        </div>
      )}

      {/* ── Cover Letter Modal ── */}
      {coverLetterUnlocked && showCoverLetter && coverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-600" />
                <h2 className="text-base font-bold text-slate-800">Your Cover Letter</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetter);
                    setCopiedCL(true);
                    setTimeout(() => setCopiedCL(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedCL ? "Copied!" : "Copy"}
                </button>
                <button onClick={() => setShowCoverLetter(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{coverLetter}</pre>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
              <p className="text-xs text-slate-400">AI-generated · Review before sending</p>
              <button
                onClick={() => setShowCoverLetter(false)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cover Letter banner — only when a cover letter was generated (job description provided) ── */}
      {aiData && coverLetter && !showCoverLetter && !showJobOptimizer && (
        coverLetterUnlocked ? (
          <button
            onClick={() => setShowCoverLetter(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50 text-sm font-semibold text-violet-700 hover:from-violet-100 hover:to-purple-100 hover:border-violet-400 transition-all shadow-sm"
          >
            <FileText className="h-4 w-4" />
            View Generated Cover Letter
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-400 cursor-default select-none">
            <Lock className="h-3.5 w-3.5" />
            Cover Letter Included — Download your CV to unlock it
          </div>
        )
      )}

      <div className="relative">
        <CVCanvasPreview previewRef={previewRef} editMode={editMode} onCvClick={handleCvClick}>
          {selectedCategory === "junior" && <CVLayoutJunior data={aiData} theme={selectedTheme} variant={selectedVariant} />}
          {selectedCategory === "mid-senior" && <CVLayoutMidSenior data={aiData} theme={selectedTheme} variant={selectedVariant} />}
          {selectedCategory === "executive" && <CVLayoutExecutive data={aiData} theme={selectedTheme} variant={selectedVariant} />}
        </CVCanvasPreview>
        {inlineEditor && (
          <CVInlineEditor
            editor={inlineEditor}
            onSave={setFieldValue}
            onDelete={deleteField}
            onAddBullet={addBullet}
            onClose={() => setInlineEditor(null)}
          />
        )}
      </div>
    </div>
  );
}
