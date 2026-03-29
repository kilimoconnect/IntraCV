"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Award, Briefcase, Download, GraduationCap, Loader2, Palette, PenLine, RefreshCw, Sparkles, X } from "lucide-react";
import CVCanvasPreview from "./cv-canvas-preview";
import CVLayoutJunior from "./cv-layout-junior";
import CVLayoutMidSenior from "./cv-layout-mid-senior";
import CVLayoutExecutive from "./cv-layout-executive";
import CVInlineEditor, { type InlineEditorState } from "./cv-inline-editor";
import { useOverflowDetect } from "./cv-overflow-detect";
import { type CareerCategory, type CategoryCVData, type LayoutVariant, type ThemeName, LAYOUT_OPTIONS, THEME_LIST } from "./cv-layout-types";
import { fitContentToLayout } from "./cv-content-fitter";

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
  const experiences = Array.isArray(cvData.experiences) ? cvData.experiences : [];
  const education = Array.isArray(cvData.education) ? cvData.education : [];
  const boardRoles = Array.isArray(cvData.boardRoles) ? cvData.boardRoles : [];
  const publications = Array.isArray(cvData.publications) ? cvData.publications : [];
  const execTraining = Array.isArray(cvData.executiveTraining) ? cvData.executiveTraining : [];

  let score = 0;
  let execTitleCount = 0, midTitleCount = 0;
  for (const exp of experiences) {
    const t = (exp as any)?.title || "";
    if (EXEC_TITLES.test(t)) execTitleCount++;
    else if (MID_TITLES.test(t)) midTitleCount++;
  }
  if (execTitleCount >= 2) score += 35;
  else if (execTitleCount === 1) score += 28;
  else if (midTitleCount >= 3) score += 22;
  else if (midTitleCount >= 1) score += 15;
  else if (experiences.length > 0) score += 10;

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

  if (education.some((e: any) => /\b(mba|phd|doctorate|masters?|m\.?sc|emba)\b/i.test(e?.degree || ""))) score += 10;
  else if (education.length > 0) score += 4;
  if (boardRoles.length >= 2) score += 10; else if (boardRoles.length === 1) score += 7;
  if (publications.length >= 2) score += 5; else if (publications.length === 1) score += 3;
  if (execTraining.length >= 2) score += 5; else if (execTraining.length === 1) score += 3;
  if (experiences.length >= 6) score += 10;
  else if (experiences.length >= 4) score += 7;
  else if (experiences.length >= 2) score += 4;

  if (score >= 60) return "executive";
  if (score >= 30) return "mid-senior";
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

// ─── Main Component ───

export default function CvStudio({ userId, cvData }: Props) {
  void userId;

  const detectedCategory = detectCategory(cvData);
  const [step, setStep] = useState<"select" | "pick-layout" | "generating" | "preview" | "error">("select");
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<LayoutVariant>("A");
  const [aiData, setAiData] = useState<CategoryCVData | null>(null);
  const [error, setError] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("corporate");
  const [editMode, setEditMode] = useState(false);
  const [inlineEditor, setInlineEditor] = useState<InlineEditorState | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const overflowSections = useOverflowDetect(previewRef, [aiData, selectedTheme, selectedVariant]);

  const getFieldValue = useCallback((field: string): string => {
    if (!aiData) return "";
    const p = field.split(".");
    if (p[0] === "profile") return aiData.profile || "";
    if (p[0] === "fullName") return aiData.fullName || "";
    if (p[0] === "title") return aiData.title || "";
    if (p[0] === "exp") { const e = aiData.experience?.[+p[1]]; if (!e) return ""; if (p[2] === "role") return e.role || ""; if (p[2] === "company") return e.company || ""; if (p[2] === "dates") return e.dates || ""; if (p[2] === "bullet") return e.bullets?.[+p[3]] || ""; }
    if (p[0] === "skill") return aiData.skills?.[+p[1]] || "";
    if (p[0] === "ach") return aiData.achievements?.[+p[1]] || "";
    if (p[0] === "edu") { const e = aiData.education?.[+p[1]]; if (!e) return ""; if (p[2] === "degree") return e.degree || ""; if (p[2] === "school") return e.school || ""; if (p[2] === "year") return e.year || ""; }
    if (p[0] === "cert") { const e = aiData.certifications?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "issuer") return e.issuer || ""; }
    if (p[0] === "lang") { const e = aiData.languages?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "label") return e.label || ""; }
    if (p[0] === "ref") { const e = aiData.references?.[+p[1]]; if (!e) return ""; if (p[2] === "name") return e.name || ""; if (p[2] === "title") return e.title || ""; }
    return "";
  }, [aiData]);

  const setFieldValue = useCallback((field: string, value: string) => {
    setAiData(prev => {
      if (!prev) return prev;
      const p = field.split(".");
      if (p[0] === "profile") return { ...prev, profile: value };
      if (p[0] === "fullName") return { ...prev, fullName: value };
      if (p[0] === "title") return { ...prev, title: value };
      if (p[0] === "exp") {
        const exps = [...(prev.experience || [])]; const i = +p[1];
        if (p[2] === "role") exps[i] = { ...exps[i], role: value };
        else if (p[2] === "company") exps[i] = { ...exps[i], company: value };
        else if (p[2] === "dates") exps[i] = { ...exps[i], dates: value };
        else if (p[2] === "bullet") { const bs = [...(exps[i].bullets || [])]; bs[+p[3]] = value; exps[i] = { ...exps[i], bullets: bs }; }
        return { ...prev, experience: exps };
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
        return { ...prev, references: refs };
      }
      return prev;
    });
  }, []);

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
      const fitted = fitContentToLayout(filled, category);

      setAiData(fitted);
      setStep("preview");
    } catch (err: unknown) {
      console.error("CV generation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate CV");
      setStep("error");
    }
  }, [cvData]);

  const handleDownload = useCallback(async () => {
    try {
      const element = previewRef.current;
      if (!element) return;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${aiData?.fullName || "CV"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, [aiData]);

  // ── Category Selection ──
  if (step === "select") {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose Your CV Layout</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Select the layout that best matches your career level. Each layout has a unique design optimized for your stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.icon;
            const isMatch = cat.id === detectedCategory;
            const isDisabled = !isMatch;
            return (
              <button
                key={cat.id}
                onClick={() => { if (!isDisabled) { setSelectedCategory(cat.id); setStep("pick-layout"); } }}
                disabled={isDisabled}
                className={`group relative text-left rounded-2xl border-2 bg-gradient-to-br overflow-hidden transition-all ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed grayscale border-slate-200"
                    : `${cat.bgGradient} ${cat.borderColor} hover:shadow-xl hover:-translate-y-1 ring-2 ring-offset-2 ${cat.borderColor.split(" ")[0].replace("border", "ring")}`
                }`}
              >
                {isMatch && (
                  <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white shadow-sm border border-slate-200 text-slate-700">
                    Your Level
                  </div>
                )}
                {/* ── Card Info ── */}
                <div className="px-5 pt-5 pb-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 rounded-lg bg-white shadow-sm ${isDisabled ? "text-slate-400" : cat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`text-base font-bold ${isDisabled ? "text-slate-400" : cat.color}`}>{cat.label}</div>
                      <div className="text-[11px] text-slate-500">{cat.subtitle}</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{cat.description}</p>

                  <div className="space-y-1.5">
                    <div className="text-[9px] font-semibold text-slate-700 uppercase tracking-wider">Sections</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.required.slice(0, 5).map((s) => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600">{s}</span>
                      ))}
                      {cat.required.length > 5 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/50 text-slate-400">+{cat.required.length - 5} more</span>
                      )}
                    </div>
                  </div>

                  <div className={`mt-4 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-sm font-medium transition-colors ${
                    isDisabled
                      ? "bg-slate-100 text-slate-400"
                      : `bg-white/80 ${cat.color} group-hover:bg-white`
                  }`}>
                    <Sparkles className="h-4 w-4" />
                    {isDisabled ? "Not Available" : "Generate"}
                  </div>
                </div>
              </button>
            );
          })}
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
        <button onClick={() => { setStep("select"); setSelectedCategory(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
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
              className={`group relative text-left rounded-2xl border-2 bg-gradient-to-br ${cat.bgGradient} ${cat.borderColor} transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden`}
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
                <div className={`flex items-center justify-center gap-2 py-2 rounded-lg bg-white/80 border border-slate-200 text-sm font-medium ${cat.color} group-hover:bg-white transition-colors`}>
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
          AI is generating your <span className="font-semibold">{cat?.label}</span> CV layout...
        </p>
        <p className="text-xs text-slate-400">This may take 10-15 seconds</p>
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
      <div className="flex flex-col gap-2 sm:gap-3 px-1 sm:px-2">
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
              onClick={() => { setEditMode(!editMode); setInlineEditor(null); }}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-md border px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs transition-colors ${
                editMode
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : overflowSections.size > 0
                    ? "border-amber-300 bg-amber-50 text-amber-700 animate-pulse"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {editMode ? <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <PenLine className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              <span className="hidden sm:inline">{editMode ? "Done Editing" : overflowSections.size > 0 ? "Fix Overflow" : "Edit CV"}</span>
              <span className="sm:hidden">{editMode ? "Done" : "Edit"}</span>
              {!editMode && overflowSections.size > 0 && (
                <span className="ml-0.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">{overflowSections.size}</span>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 sm:gap-1.5 rounded-md bg-indigo-600 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs text-white hover:bg-indigo-700"
            >
              <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* Theme picker row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 shrink-0" />
          <div className="flex gap-1">
            {THEME_LIST.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTheme(t.name)}
                className={`relative h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 transition-all shrink-0 ${
                  selectedTheme === t.name ? "border-slate-400 shadow-sm" : "border-slate-200 hover:border-slate-300"
                }`}
                style={{ backgroundColor: t.color }}
                title={t.label}
              >
                {selectedTheme === t.name && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CV Preview — inline editing */}
      {editMode && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
          <PenLine className="h-3.5 w-3.5 shrink-0" />
          <span>Click any text in the CV to edit it inline. Press <kbd className="bg-white border border-indigo-200 rounded px-1 py-0.5 text-[10px]">Enter</kbd> to save or <kbd className="bg-white border border-indigo-200 rounded px-1 py-0.5 text-[10px]">Esc</kbd> to cancel.</span>
        </div>
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
            onClose={() => setInlineEditor(null)}
          />
        )}
      </div>
    </div>
  );
}
