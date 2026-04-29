"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Lightbulb,
  PenLine,
  Check,
  AlertCircle,
  ChevronLeft,
  X,
  Wrench,
  Plus,
  Trash2,
} from "lucide-react";

// ─── Section key → API endpoint sectionKey mapping ───────────────────────────
// null  = no AI generation; user must fill manually (or navigate away)
const SECTION_API_KEY: Record<string, string | null> = {
  personal:     null,
  summary:      "summary",
  experience:   null,
  education:    null,
  skills:       null,
  certifications: null,
  achievements: "keyAchievements",
  awards:       null,
  memberships:  "memberships",
  projects:     "projects",
  boardRoles:   "boardRoles",
  execTraining: "executiveTraining",
  publications: "publications",
  tools:        "tools",
  volunteer:    "volunteer",
  languages:    "languages",
  referees:     null,
  declaration:  "declaration",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AiSection {
  key: string;
  label: string;
  priority: "required" | "recommended";
}

interface EditState {
  sectionKey:    string; // SECTIONS config key (e.g. "achievements")
  apiSectionKey: string; // API / applyAiSectionData key (e.g. "keyAchievements")
  label:         string;
  data:          any;
  source:        "ai" | "manual" | "incomplete";
}

export interface AiMissingDialogProps {
  open: boolean;
  onClose: () => void;
  missingRequired:   { key: string; label: string }[];
  missingRecommended: { key: string; label: string }[];
  /** Sections that exist but have items with incomplete required fields */
  incompleteSections: { key: string; label: string; missing: string[] }[];
  cvData: any;
  careerLevel: string;
  /** Called when data should be applied to parent state */
  onApply: (sectionKey: string, apiSectionKey: string, sectionData: any) => void;
  /** Called when the user wants to navigate to a section in the full editor */
  onNavigate: (sectionKey: string) => void;
}

// ─── Empty-data templates for manual fill ────────────────────────────────────
function getEmptyData(apiKey: string): any {
  switch (apiKey) {
    case "summary":           return { summary: "" };
    case "keyAchievements":   return { keyAchievements: [""] };
    case "memberships":       return { memberships: [""] };
    case "tools":             return { tools: [""] };
    case "volunteer":         return { volunteer: [""] };
    case "languages":         return { languages: [{ name: "", proficiency: "" }] };
    case "projects":          return { projects: [{ name: "", description: "", tech: "" }] };
    case "boardRoles":        return { boardRoles: [{ title: "", organization: "", startDate: "", endDate: "", description: "" }] };
    case "executiveTraining": return { executiveTraining: [{ name: "", institution: "", year: "" }] };
    case "publications":      return { publications: [{ title: "", publisher: "", year: "", type: "article" }] };
    case "declaration":       return { declaration: { declaration: "", place: "", date: "" } };
    default:                  return {};
  }
}

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004aad]/30 " +
  "focus:border-[#004aad]/50 transition-colors";
const labelCls = "block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1";

// ─── Inline Section Editor ────────────────────────────────────────────────────
function InlineSectionEditor({
  apiKey,
  data,
  onChange,
}: {
  apiKey: string;
  data: any;
  onChange: (d: any) => void;
}) {
  // ── Helpers for list editing
  const setItemField = (listKey: string, idx: number, field: string, val: string) => {
    const arr = [...(data[listKey] || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    onChange({ ...data, [listKey]: arr });
  };
  const setItemText = (listKey: string, idx: number, val: string) => {
    const arr = [...(data[listKey] || [])];
    arr[idx] = val;
    onChange({ ...data, [listKey]: arr });
  };
  const addItem = (listKey: string, template: any) =>
    onChange({ ...data, [listKey]: [...(data[listKey] || []), template] });
  const removeItem = (listKey: string, idx: number) => {
    const arr = [...(data[listKey] || [])];
    arr.splice(idx, 1);
    onChange({ ...data, [listKey]: arr });
  };

  switch (apiKey) {

    // ── Summary ──────────────────────────────────────────────────────────────
    case "summary":
      return (
        <div>
          <label className={labelCls}>Professional Summary</label>
          <textarea
            rows={6}
            className={`${inputCls} resize-none leading-relaxed`}
            placeholder="Write a compelling professional summary (60–90 words)…"
            value={data.summary || ""}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            {(data.summary || "").split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      );

    // ── Key Achievements ──────────────────────────────────────────────────────
    case "keyAchievements": {
      const items: string[] = data.keyAchievements || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Achievements</label>
          {items.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004aad] shrink-0" />
              <input
                className={`${inputCls} flex-1`}
                placeholder={`Achievement ${i + 1} — include a metric (e.g. 30%, $1M)`}
                value={a}
                onChange={(e) => setItemText("keyAchievements", i, e.target.value)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("keyAchievements", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("keyAchievements", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline mt-1"
          >
            <Plus className="h-3 w-3" /> Add achievement
          </button>
        </div>
      );
    }

    // ── Memberships ───────────────────────────────────────────────────────────
    case "memberships": {
      const items: string[] = data.memberships || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Professional Memberships</label>
          {items.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${inputCls} flex-1`}
                placeholder={`Organisation ${i + 1}`}
                value={m}
                onChange={(e) => setItemText("memberships", i, e.target.value)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("memberships", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("memberships", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add membership
          </button>
        </div>
      );
    }

    // ── Tools ─────────────────────────────────────────────────────────────────
    case "tools": {
      const items: string[] = data.tools || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Tools &amp; Software</label>
          <div className="grid grid-cols-2 gap-2">
            {items.map((t, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder={`Tool ${i + 1}`}
                  value={t}
                  onChange={(e) => setItemText("tools", i, e.target.value)}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem("tools", i)}
                    className="text-slate-300 hover:text-red-400 shrink-0 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addItem("tools", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add tool
          </button>
        </div>
      );
    }

    // ── Volunteer ─────────────────────────────────────────────────────────────
    case "volunteer": {
      const items: string[] = data.volunteer || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Volunteer Experience</label>
          {items.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <input
                className={`${inputCls} flex-1`}
                placeholder={`Volunteer role ${i + 1}`}
                value={v}
                onChange={(e) => setItemText("volunteer", i, e.target.value)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("volunteer", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("volunteer", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add entry
          </button>
        </div>
      );
    }

    // ── Languages ─────────────────────────────────────────────────────────────
    case "languages": {
      const LEVELS = ["Native", "Fluent", "Proficient", "Intermediate", "Basic"];
      const items: { name: string; proficiency: string }[] =
        data.languages || [{ name: "", proficiency: "" }];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Languages</label>
          {items.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Language"
                value={l.name}
                onChange={(e) => setItemField("languages", i, "name", e.target.value)}
              />
              <select
                className={`${inputCls} w-36 shrink-0`}
                value={l.proficiency}
                onChange={(e) => setItemField("languages", i, "proficiency", e.target.value)}
              >
                <option value="">Level…</option>
                {LEVELS.map((lv) => (
                  <option key={lv} value={lv}>{lv}</option>
                ))}
              </select>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("languages", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("languages", { name: "", proficiency: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add language
          </button>
        </div>
      );
    }

    // ── Projects ──────────────────────────────────────────────────────────────
    case "projects": {
      const items: { name: string; description: string; tech: string }[] =
        data.projects || [{ name: "", description: "", tech: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Projects</label>
          {items.map((p, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Project {i + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem("projects", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <input
                className={inputCls}
                placeholder="Project name"
                value={p.name}
                onChange={(e) => setItemField("projects", i, "name", e.target.value)}
              />
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Describe scope, actions taken, and measurable outcomes…"
                value={p.description}
                onChange={(e) => setItemField("projects", i, "description", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Technologies (e.g. React, Salesforce, Python) — optional"
                value={p.tech}
                onChange={(e) => setItemField("projects", i, "tech", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("projects", { name: "", description: "", tech: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add project
          </button>
        </div>
      );
    }

    // ── Board Roles ───────────────────────────────────────────────────────────
    case "boardRoles": {
      const items: {
        title: string; organization: string;
        startDate: string; endDate: string; description: string;
      }[] = data.boardRoles || [{
        title: "", organization: "", startDate: "", endDate: "", description: "",
      }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Board &amp; Advisory Roles</label>
          {items.map((b, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Role {i + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem("boardRoles", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Title (e.g. Non-Exec Director)"
                  value={b.title} onChange={(e) => setItemField("boardRoles", i, "title", e.target.value)} />
                <input className={inputCls} placeholder="Organisation"
                  value={b.organization} onChange={(e) => setItemField("boardRoles", i, "organization", e.target.value)} />
                <input className={inputCls} placeholder="Start year"
                  value={b.startDate} onChange={(e) => setItemField("boardRoles", i, "startDate", e.target.value)} />
                <input className={inputCls} placeholder="End / Ongoing"
                  value={b.endDate} onChange={(e) => setItemField("boardRoles", i, "endDate", e.target.value)} />
              </div>
              <textarea
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Governance contribution…"
                value={b.description}
                onChange={(e) => setItemField("boardRoles", i, "description", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("boardRoles", {
              title: "", organization: "", startDate: "", endDate: "", description: "",
            })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add role
          </button>
        </div>
      );
    }

    // ── Executive Training ────────────────────────────────────────────────────
    case "executiveTraining": {
      const items: { name: string; institution: string; year: string }[] =
        data.executiveTraining || [{ name: "", institution: "", year: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Executive Training</label>
          {items.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Programme {i + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem("executiveTraining", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <input className={inputCls} placeholder="Programme name"
                value={t.name} onChange={(e) => setItemField("executiveTraining", i, "name", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input className={`${inputCls} col-span-2`} placeholder="Institution"
                  value={t.institution} onChange={(e) => setItemField("executiveTraining", i, "institution", e.target.value)} />
                <input className={inputCls} placeholder="Year"
                  value={t.year} onChange={(e) => setItemField("executiveTraining", i, "year", e.target.value)} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("executiveTraining", { name: "", institution: "", year: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add programme
          </button>
        </div>
      );
    }

    // ── Publications ──────────────────────────────────────────────────────────
    case "publications": {
      const PUB_TYPES = ["article", "paper", "presentation", "book-chapter"];
      const items: { title: string; publisher: string; year: string; type: string }[] =
        data.publications || [{ title: "", publisher: "", year: "", type: "article" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Publications</label>
          {items.map((p, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Publication {i + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem("publications", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <input className={inputCls} placeholder="Title"
                value={p.title} onChange={(e) => setItemField("publications", i, "title", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input className={`${inputCls} col-span-2`} placeholder="Publisher / Conference"
                  value={p.publisher} onChange={(e) => setItemField("publications", i, "publisher", e.target.value)} />
                <input className={inputCls} placeholder="Year"
                  value={p.year} onChange={(e) => setItemField("publications", i, "year", e.target.value)} />
              </div>
              <select
                className={inputCls}
                value={p.type}
                onChange={(e) => setItemField("publications", i, "type", e.target.value)}
              >
                {PUB_TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {ty.charAt(0).toUpperCase() + ty.slice(1).replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("publications", { title: "", publisher: "", year: "", type: "article" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline"
          >
            <Plus className="h-3 w-3" /> Add publication
          </button>
        </div>
      );
    }

    // ── Declaration ───────────────────────────────────────────────────────────
    case "declaration": {
      const d = data.declaration || { declaration: "", place: "", date: "" };
      const setField = (field: string, val: string) =>
        onChange({ ...data, declaration: { ...d, [field]: val } });
      return (
        <div className="space-y-3">
          <label className={labelCls}>Declaration Statement</label>
          <textarea
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="I hereby declare that the information provided in this Curriculum Vitae is true and correct…"
            value={d.declaration}
            onChange={(e) => setField("declaration", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Place</label>
              <input className={inputCls} placeholder="City"
                value={d.place} onChange={(e) => setField("place", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input className={inputCls} placeholder="e.g. April 2026"
                value={d.date} onChange={(e) => setField("date", e.target.value)} />
            </div>
          </div>
        </div>
      );
    }

    default:
      return (
        <p className="text-sm text-slate-400">
          Editor not available — please navigate to the section to fill it in.
        </p>
      );
  }
}

// ─── Missing-section Row ──────────────────────────────────────────────────────
function MissingSectionRow({
  section,
  loading,
  hasError,
  aiCapable,
  inlineCapable,
  onAiFill,
  onManualInline,
  onNavigate,
}: {
  section: AiSection;
  loading: boolean;
  hasError: boolean;
  aiCapable: boolean;
  inlineCapable: boolean;
  onAiFill: () => void;
  onManualInline: () => void;
  onNavigate: () => void;
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
            {loading
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Lightbulb className="h-3 w-3" />}
            {loading ? "Generating…" : "AI Fill"}
          </Button>
        )}

        {inlineCapable ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onManualInline}
            className="h-7 text-xs px-2.5 gap-1 text-slate-500 hover:text-slate-700"
          >
            <PenLine className="h-3 w-3" />
            Manual
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={onNavigate}
            className="h-7 text-xs px-2.5 gap-1 text-slate-500 hover:text-slate-700"
          >
            <PenLine className="h-3 w-3" />
            Fill myself
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Incomplete-section Row ───────────────────────────────────────────────────
function IncompleteSectionRow({
  label,
  missing,
  onFix,
}: {
  label: string;
  missing: string[];
  onFix: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-orange-100 bg-orange-50/40">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
        </div>
        <p className="text-[11px] text-orange-600 mt-0.5 pl-5 truncate">
          Missing: {missing.join(", ")}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onFix}
        className="h-7 text-xs px-2.5 gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 shrink-0"
      >
        <PenLine className="h-3 w-3" />
        Fix it
      </Button>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export function AiMissingDialog({
  open,
  onClose,
  missingRequired,
  missingRecommended,
  incompleteSections,
  cvData,
  careerLevel,
  onApply,
  onNavigate,
}: AiMissingDialogProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [editing, setEditing]       = useState<EditState | null>(null);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [errorKey, setErrorKey]     = useState<string | null>(null);

  // Auto-close if there is genuinely nothing to show
  useEffect(() => {
    if (
      open &&
      missingRequired.length === 0 &&
      missingRecommended.length === 0 &&
      incompleteSections.length === 0
    ) {
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Filter out already-applied sections
  const pendingRequired    = missingRequired.filter((s) => !appliedKeys.has(s.key));
  const pendingRecommended = missingRecommended.filter((s) => !appliedKeys.has(s.key));
  const allMissingDone     = pendingRequired.length === 0 && pendingRecommended.length === 0;
  const totalToAddress     = pendingRequired.length + pendingRecommended.length + incompleteSections.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAiFill = async (section: AiSection) => {
    const apiKey = SECTION_API_KEY[section.key];
    if (!apiKey) return;

    setLoadingKey(section.key);
    setErrorKey(null);
    try {
      const res = await fetch("/api/ai/generate-missing-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, sectionKey: apiKey, careerLevel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Open the inline editor pre-populated with the AI draft
      setEditing({
        sectionKey:    section.key,
        apiSectionKey: apiKey,
        label:         section.label,
        data:          data.sectionData,
        source:        "ai",
      });
    } catch (err: any) {
      setErrorKey(section.key);
      console.error("[AiMissingDialog] generation error:", err.message);
    } finally {
      setLoadingKey(null);
    }
  };

  const handleManualInline = (section: AiSection) => {
    const apiKey = SECTION_API_KEY[section.key];
    if (!apiKey) return;
    setEditing({
      sectionKey:    section.key,
      apiSectionKey: apiKey,
      label:         section.label,
      data:          getEmptyData(apiKey),
      source:        "manual",
    });
  };

  /** Fix incomplete section inline (supported: languages) — others navigate away */
  const handleInlineFix = (s: { key: string; label: string }) => {
    if (s.key === "languages") {
      const existing = (cvData as any).languages || [];
      setEditing({
        sectionKey:    "languages",
        apiSectionKey: "languages",
        label:         s.label,
        data: {
          languages: existing.map((l: any) => ({
            name:        l.name        || "",
            proficiency: l.proficiency || "",
          })),
        },
        source: "incomplete",
      });
    } else {
      onNavigate(s.key);
      onClose();
    }
  };

  const handleApply = () => {
    if (!editing) return;
    onApply(editing.sectionKey, editing.apiSectionKey, editing.data);
    setAppliedKeys((prev) => new Set([...prev, editing.sectionKey]));
    setEditing(null);
  };

  const handleClose = () => {
    setEditing(null);
    onClose();
  };

  // ── Header copy ───────────────────────────────────────────────────────────
  const headerTitle = editing
    ? editing.source === "ai"
      ? `${editing.label} — AI Draft`
      : editing.source === "incomplete"
      ? `Fix: ${editing.label}`
      : `Fill: ${editing.label}`
    : allMissingDone && incompleteSections.length > 0
    ? "Fix incomplete fields"
    : allMissingDone
    ? "Your CV is complete!"
    : "Strengthen Your CV";

  const headerSub = editing
    ? editing.source === "ai"
      ? "Review and edit the AI draft, then click Apply"
      : editing.source === "incomplete"
      ? "Update the missing fields below, then click Apply"
      : "Fill in the fields below, then click Apply"
    : allMissingDone && incompleteSections.length > 0
    ? `${incompleteSections.length} section${incompleteSections.length !== 1 ? "s" : ""} have fields that need completing`
    : allMissingDone
    ? "All sections are filled — save your CV to continue"
    : `${totalToAddress} issue${totalToAddress !== 1 ? "s" : ""} found — use AI to fill or enter manually`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      {/* showCloseButton=false — we render our own close button in the header */}
      <DialogContent
        showCloseButton={false}
        className="max-w-lg p-0 gap-0 flex flex-col max-h-[88vh] overflow-hidden"
      >

        {/* ── Header ── */}
        <div className="flex items-start gap-3 p-5 border-b shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#004aad] flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-800 text-base leading-tight">
              {headerTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{headerSub}</p>
          </div>
          <DialogClose
            onClick={handleClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Inline editor (AI draft or manual fill) ── */}
          {editing && (
            <div className="p-5 space-y-4">

              {/* Source badge */}
              {editing.source === "ai" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#004aad] bg-[#004aad]/10 px-2.5 py-1 rounded-full">
                  <Lightbulb className="h-2.5 w-2.5" />
                  AI Generated — review &amp; edit before applying
                </span>
              )}
              {editing.source === "incomplete" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <Wrench className="h-2.5 w-2.5" />
                  Existing data — complete the missing fields
                </span>
              )}

              <InlineSectionEditor
                apiKey={editing.apiSectionKey}
                data={editing.data}
                onChange={(newData) => setEditing({ ...editing, data: newData })}
              />
            </div>
          )}

          {/* ── All done ── */}
          {!editing && allMissingDone && incompleteSections.length === 0 && (
            <div className="p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">All sections complete!</p>
                <p className="text-sm text-slate-500 mt-1">
                  Your CV looks great. Click Continue to proceed.
                </p>
              </div>
            </div>
          )}

          {/* ── Section list ── */}
          {!editing && !(allMissingDone && incompleteSections.length === 0) && (
            <div className="p-4 space-y-4">

              {/* Required missing */}
              {pendingRequired.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                      Required — missing ({pendingRequired.length})
                    </span>
                  </div>
                  {pendingRequired.map((s) => {
                    const apiKey = SECTION_API_KEY[s.key];
                    return (
                      <MissingSectionRow
                        key={s.key}
                        section={{ ...s, priority: "required" }}
                        loading={loadingKey === s.key}
                        hasError={errorKey === s.key}
                        aiCapable={!!apiKey}
                        inlineCapable={!!apiKey}
                        onAiFill={() => handleAiFill({ ...s, priority: "required" })}
                        onManualInline={() => handleManualInline({ ...s, priority: "required" })}
                        onNavigate={() => { onNavigate(s.key); onClose(); }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Recommended missing */}
              {pendingRecommended.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="h-3 w-3 rounded-full border-2 border-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      Recommended — missing ({pendingRecommended.length})
                    </span>
                  </div>
                  {pendingRecommended.map((s) => {
                    const apiKey = SECTION_API_KEY[s.key];
                    return (
                      <MissingSectionRow
                        key={s.key}
                        section={{ ...s, priority: "recommended" }}
                        loading={loadingKey === s.key}
                        hasError={errorKey === s.key}
                        aiCapable={!!apiKey}
                        inlineCapable={!!apiKey}
                        onAiFill={() => handleAiFill({ ...s, priority: "recommended" })}
                        onManualInline={() => handleManualInline({ ...s, priority: "recommended" })}
                        onNavigate={() => { onNavigate(s.key); onClose(); }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Incomplete fields */}
              {incompleteSections.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <Wrench className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                      Incomplete fields ({incompleteSections.length})
                    </span>
                  </div>
                  {incompleteSections.map((s) => (
                    <IncompleteSectionRow
                      key={s.key}
                      label={s.label}
                      missing={s.missing}
                      onFix={() => handleInlineFix(s)}
                    />
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t shrink-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(null)}
                className="gap-1.5 text-slate-600"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-[#004aad] hover:bg-[#003d8f] text-white gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Apply
              </Button>
            </div>
          ) : allMissingDone && incompleteSections.length === 0 ? (
            <Button
              onClick={handleClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Close
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">You can always fix these later</p>
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
