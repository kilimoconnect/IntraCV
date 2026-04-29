"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  PenLine,
  Check,
  AlertCircle,
  ChevronLeft,
  X,
} from "lucide-react";

// ─── Section key → API endpoint sectionKey mapping ───────────────────────────
// Keys that are null require user input and cannot be AI-filled
const SECTION_API_KEY: Record<string, string | null> = {
  personal: null,
  summary: "summary",
  experience: null,
  education: null,
  skills: null,
  certifications: null,
  achievements: "keyAchievements",
  awards: null,
  memberships: "memberships",
  projects: "projects",
  boardRoles: "boardRoles",
  execTraining: "executiveTraining",
  publications: "publications",
  tools: "tools",
  volunteer: "volunteer",
  languages: "languages",
  referees: null,
  declaration: "declaration",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AiSection {
  key: string;
  label: string;
  priority: "required" | "recommended";
}

interface PreviewState {
  sectionKey: string;    // SECTIONS config key (e.g. "achievements")
  apiSectionKey: string; // API endpoint key   (e.g. "keyAchievements")
  label: string;
  sectionData: any;
}

export interface AiMissingDialogProps {
  open: boolean;
  onClose: () => void;
  missingRequired: { key: string; label: string }[];
  missingRecommended: { key: string; label: string }[];
  cvData: object;
  careerLevel: string;
  /** Called when AI data should be applied to parent state */
  onApply: (sectionKey: string, apiSectionKey: string, sectionData: any) => void;
  /** Called when user wants to navigate to a section manually */
  onNavigate: (sectionKey: string) => void;
}

// ─── AI Preview Renderer ──────────────────────────────────────────────────────
function PreviewContent({ apiKey, data }: { apiKey: string; data: any }) {
  switch (apiKey) {
    case "summary":
      return (
        <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
      );

    case "keyAchievements":
      return (
        <ul className="space-y-2">
          {(data.keyAchievements || []).map((a: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#004aad] shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      );

    case "memberships":
      return (
        <ul className="space-y-1.5">
          {(data.memberships || []).map((m: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      );

    case "projects":
      return (
        <div className="space-y-3">
          {(data.projects || []).map((p: any, i: number) => (
            <div key={i} className="rounded-lg border bg-white p-3">
              <p className="text-sm font-semibold text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {p.description}
              </p>
              {p.tech && (
                <p className="text-xs text-[#004aad] mt-1.5">🛠 {p.tech}</p>
              )}
            </div>
          ))}
        </div>
      );

    case "boardRoles":
      return (
        <div className="space-y-3">
          {(data.boardRoles || []).map((b: any, i: number) => (
            <div key={i} className="rounded-lg border bg-white p-3">
              <p className="text-sm font-semibold text-slate-800">
                {b.title} — {b.organization}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {b.startDate} – {b.endDate}
              </p>
              {b.description && (
                <p className="text-xs text-slate-600 mt-1">{b.description}</p>
              )}
            </div>
          ))}
        </div>
      );

    case "executiveTraining":
      return (
        <div className="space-y-2">
          {(data.executiveTraining || []).map((t: any, i: number) => (
            <div key={i} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.institution}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{t.year}</span>
            </div>
          ))}
        </div>
      );

    case "publications":
      return (
        <div className="space-y-2">
          {(data.publications || []).map((p: any, i: number) => (
            <div key={i} className="text-sm">
              <p className="font-medium text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {p.publisher} · {p.year}
              </p>
            </div>
          ))}
        </div>
      );

    case "tools":
      return (
        <div className="flex flex-wrap gap-2">
          {(data.tools || []).map((t: string, i: number) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
      );

    case "volunteer":
      return (
        <ul className="space-y-1.5">
          {(data.volunteer || []).map((v: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              {v}
            </li>
          ))}
        </ul>
      );

    case "languages":
      return (
        <div className="flex flex-wrap gap-2">
          {(data.languages || []).map((l: any, i: number) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-700"
            >
              {l.name}
              <span className="text-slate-400 ml-1">· {l.proficiency}</span>
            </span>
          ))}
        </div>
      );

    case "declaration": {
      const d = data.declaration;
      const text = typeof d === "string" ? d : d?.declaration || "";
      const place = typeof d === "object" ? d?.place : "";
      return (
        <div className="text-sm text-slate-700 space-y-1 leading-relaxed">
          <p className="italic">&ldquo;{text}&rdquo;</p>
          {place && <p className="text-xs text-slate-400">Place: {place}</p>}
        </div>
      );
    }

    default:
      return (
        <pre className="text-xs text-slate-600 whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}

// ─── Section Row ──────────────────────────────────────────────────────────────
function SectionRow({
  section,
  loading,
  hasError,
  aiCapable,
  onAiFill,
  onFillMyself,
}: {
  section: AiSection;
  loading: boolean;
  hasError: boolean;
  aiCapable: boolean;
  onAiFill: () => void;
  onFillMyself: () => void;
}) {
  const isRequired = section.priority === "required";
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
        isRequired
          ? "border-red-100 bg-red-50/50"
          : "border-amber-100 bg-amber-50/30"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full shrink-0 ${
              isRequired ? "bg-red-500" : "bg-amber-400"
            }`}
          />
          <span className="text-sm font-medium text-slate-800 truncate">
            {section.label}
          </span>
        </div>
        {hasError && (
          <p className="text-[11px] text-red-500 mt-0.5 pl-4">
            Generation failed — try again
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {aiCapable && (
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={onAiFill}
            className="h-7 text-xs px-2.5 gap-1 border-[#004aad]/30 text-[#004aad] hover:bg-[#004aad]/5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {loading ? "Generating…" : "AI Fill"}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onFillMyself}
          className="h-7 text-xs px-2.5 gap-1 text-slate-500 hover:text-slate-700"
        >
          <PenLine className="h-3 w-3" />
          {aiCapable ? "Manual" : "Fill myself"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export function AiMissingDialog({
  open,
  onClose,
  missingRequired,
  missingRecommended,
  cvData,
  careerLevel,
  onApply,
  onNavigate,
}: AiMissingDialogProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [errorKey, setErrorKey] = useState<string | null>(null);

  // Filter out sections the user has already applied in this session
  const pendingRequired = missingRequired.filter(
    (s) => !appliedKeys.has(s.key)
  );
  const pendingRecommended = missingRecommended.filter(
    (s) => !appliedKeys.has(s.key)
  );
  const totalRemaining = pendingRequired.length + pendingRecommended.length;
  const allDone = totalRemaining === 0;

  // ── Handlers ──
  const handleAiFill = async (section: AiSection) => {
    const apiKey = SECTION_API_KEY[section.key];
    if (!apiKey) return;

    setLoadingKey(section.key);
    setErrorKey(null);
    try {
      const res = await fetch("/api/ai/generate-missing-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvData,
          sectionKey: apiKey,
          careerLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setPreview({
        sectionKey: section.key,
        apiSectionKey: apiKey,
        label: section.label,
        sectionData: data.sectionData,
      });
    } catch (err: any) {
      setErrorKey(section.key);
      console.error("[AI Missing Dialog] generation error:", err.message);
    } finally {
      setLoadingKey(null);
    }
  };

  const handleApply = () => {
    if (!preview) return;
    onApply(preview.sectionKey, preview.apiSectionKey, preview.sectionData);
    setAppliedKeys((prev) => new Set([...prev, preview.sectionKey]));
    setPreview(null);
  };

  const handleEditMyself = () => {
    if (!preview) return;
    // Apply the data first so it's pre-populated when user opens the section
    onApply(preview.sectionKey, preview.apiSectionKey, preview.sectionData);
    setAppliedKeys((prev) => new Set([...prev, preview.sectionKey]));
    const key = preview.sectionKey;
    setPreview(null);
    onNavigate(key);
    onClose();
  };

  const handleFillMyself = (key: string) => {
    onNavigate(key);
    onClose();
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  // ── Render ──
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg p-0 gap-0 flex flex-col max-h-[88vh] overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-start gap-3 p-5 border-b shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#004aad] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-800 text-base leading-tight">
              {preview
                ? `${preview.label} — AI Draft`
                : allDone
                ? "Your CV is complete!"
                : "Strengthen Your CV"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              {preview
                ? "Review the AI draft, then apply it or edit it yourself"
                : allDone
                ? "All sections have been filled. Save your CV to continue."
                : `${totalRemaining} section${totalRemaining !== 1 ? "s" : ""} missing — let AI draft them or fill them yourself`}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Preview mode */}
          {preview && (
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-[#004aad]/20 bg-[#004aad]/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#004aad] mb-3">
                  AI Generated Draft
                </p>
                <PreviewContent
                  apiKey={preview.apiSectionKey}
                  data={preview.sectionData}
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                AI drafts are examples — always review and verify before saving.
              </p>
            </div>
          )}

          {/* All done */}
          {!preview && allDone && (
            <div className="p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">All sections complete!</p>
                <p className="text-sm text-slate-500 mt-1">
                  Your CV looks great. Click Save &amp; Continue to proceed.
                </p>
              </div>
            </div>
          )}

          {/* Section list */}
          {!preview && !allDone && (
            <div className="p-4 space-y-4">
              {/* Required */}
              {pendingRequired.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                      Required ({pendingRequired.length})
                    </span>
                  </div>
                  {pendingRequired.map((s) => (
                    <SectionRow
                      key={s.key}
                      section={{ ...s, priority: "required" }}
                      loading={loadingKey === s.key}
                      hasError={errorKey === s.key}
                      aiCapable={!!SECTION_API_KEY[s.key]}
                      onAiFill={() =>
                        handleAiFill({ ...s, priority: "required" })
                      }
                      onFillMyself={() => handleFillMyself(s.key)}
                    />
                  ))}
                </div>
              )}

              {/* Recommended */}
              {pendingRecommended.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1 mt-1">
                    <span className="h-3 w-3 rounded-full border-2 border-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      Recommended ({pendingRecommended.length})
                    </span>
                  </div>
                  {pendingRecommended.map((s) => (
                    <SectionRow
                      key={s.key}
                      section={{ ...s, priority: "recommended" }}
                      loading={loadingKey === s.key}
                      hasError={errorKey === s.key}
                      aiCapable={!!SECTION_API_KEY[s.key]}
                      onAiFill={() =>
                        handleAiFill({ ...s, priority: "recommended" })
                      }
                      onFillMyself={() => handleFillMyself(s.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t shrink-0">
          {preview ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(null)}
                className="gap-1.5 text-slate-600"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditMyself}
                className="gap-1.5"
              >
                <PenLine className="h-3.5 w-3.5" />
                Apply &amp; edit
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-[#004aad] hover:bg-[#003d8f] text-white gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Apply this
              </Button>
            </div>
          ) : allDone ? (
            <Button
              onClick={handleClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Close
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                You can always complete these sections later
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Skip for now
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
