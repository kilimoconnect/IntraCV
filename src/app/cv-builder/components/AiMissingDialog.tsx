"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

// ─── Section key → AI generation key (null = no AI for this section) ──────────
const SECTION_API_KEY: Record<string, string | null> = {
  personal:       null,
  summary:        "summary",
  experience:     null,
  education:      null,
  skills:         "skills",
  certifications: null,
  achievements:   "keyAchievements",
  awards:         "awards",
  memberships:    null,
  projects:       "projects",
  boardRoles:     "boardRoles",
  execTraining:   "executiveTraining",
  publications:   null,
  tools:          "tools",
  volunteer:      null,
  languages:      "languages",
  referees:       null,
  declaration:    "declaration",
};

// ─── Section key → inline editor key (every section now has one) ──────────────
const SECTION_EDIT_KEY: Record<string, string> = {
  personal:       "personal",
  summary:        "summary",
  experience:     "experience",
  education:      "education",
  skills:         "skills",
  certifications: "certifications",
  achievements:   "keyAchievements",
  awards:         "awards",
  memberships:    "memberships",
  projects:       "projects",
  boardRoles:     "boardRoles",
  execTraining:   "executiveTraining",
  publications:   "publications",
  tools:          "tools",
  volunteer:      "volunteer",
  languages:      "languages",
  referees:       "referees",
  declaration:    "declaration",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AiSection {
  key: string;
  label: string;
  priority: "required" | "recommended";
}

interface EditState {
  sectionKey:    string;
  apiSectionKey: string; // key used by onApply / applyAiSectionData
  label:         string;
  data:          any;
  source:        "ai" | "manual" | "incomplete";
}

export interface AiMissingDialogProps {
  open: boolean;
  onClose: () => void;
  missingRequired:    { key: string; label: string }[];
  missingRecommended: { key: string; label: string }[];
  incompleteSections: { key: string; label: string; missing: string[] }[];
  cvData: any;
  careerLevel: string;
  onApply:   (sectionKey: string, apiSectionKey: string, sectionData: any) => void;
  onNavigate: (sectionKey: string) => void;
}

// ─── Empty templates for manual fill ─────────────────────────────────────────
function getEmptyData(editKey: string): any {
  switch (editKey) {
    case "personal":
      return { personal: { fullName: "", email: "", phone: "", location: "", headline: "", linkedin: "", website: "" } };
    case "summary":
      return { summary: "" };
    case "experience":
      return { experience: [{ title: "", company: "", location: "", startDate: "", endDate: "", description: "" }] };
    case "education":
      return { education: [{ degree: "", institution: "", year: "", description: "" }] };
    case "skills":
      return { skills: [{ name: "", category: "" }] };
    case "certifications":
      return { certifications: [{ name: "", issuer: "", year: "" }] };
    case "keyAchievements":
      return { keyAchievements: [""] };
    case "awards":
      return { awards: [{ title: "", description: "" }] };
    case "memberships":
      return { memberships: [""] };
    case "projects":
      return { projects: [{ name: "", description: "", tech: "" }] };
    case "boardRoles":
      return { boardRoles: [{ title: "", organization: "", startDate: "", endDate: "", description: "" }] };
    case "executiveTraining":
      return { executiveTraining: [{ name: "", institution: "", year: "" }] };
    case "publications":
      return { publications: [{ title: "", publisher: "", year: "", type: "article" }] };
    case "tools":
      return { tools: [""] };
    case "volunteer":
      return { volunteer: [""] };
    case "languages":
      return { languages: [{ name: "", proficiency: "" }] };
    case "referees":
      return { referees: [{ name: "", title: "", company: "", phone: "", email: "" }] };
    case "declaration":
      return { declaration: { declaration: "", place: "", date: "" } };
    default:
      return {};
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004aad]/30 " +
  "focus:border-[#004aad]/50 transition-colors";
const inputErrorCls =
  "w-full rounded-lg border-2 border-orange-400 bg-orange-50/60 px-3 py-2 text-sm text-slate-800 " +
  "placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/30 " +
  "focus:border-orange-500 transition-colors";
const labelCls = "block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1";
const labelErrorCls = "block text-[11px] font-semibold text-orange-500 uppercase tracking-wide mb-1";

// ─── Required field keys per section — used to highlight empty fields in fix mode ─
const INCOMPLETE_REQUIRED: Record<string, string[]> = {
  personal:          ["fullName", "email", "phone"],
  experience:        ["title", "company", "location", "startDate", "endDate", "description"],
  education:         ["degree", "institution", "year"],
  skills:            ["name"],
  certifications:    ["name"],
  languages:         ["name", "proficiency"],
  referees:          ["name"],
  projects:          ["name", "description"],
  boardRoles:        ["title", "organization"],
  executiveTraining: ["name"],
  publications:      ["title"],
  keyAchievements:   [],   // plain strings — whole value is checked
  awards:            ["title", "description"],
  memberships:       [],   // plain strings
  tools:             [],
  volunteer:         [],
  declaration:       ["declaration", "place"],
};

// ─── Auto-resizing textarea — grows to show all content, no hidden overflow ───
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 3,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`;
  }, [value, minRows]);
  return (
    <textarea
      ref={ref}
      rows={minRows}
      className={`${className} resize-none overflow-y-auto`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

// ─── Inline Section Editor ────────────────────────────────────────────────────
function InlineSectionEditor({
  apiKey,
  data,
  onChange,
  highlightEmpty = false,
}: {
  apiKey: string;
  data: any;
  onChange: (d: any) => void;
  highlightEmpty?: boolean;
}) {
  // Returns error style when the field is required and empty in fix mode
  const req = INCOMPLETE_REQUIRED[apiKey] || [];
  const cls = (field: string, value: string | undefined) =>
    highlightEmpty && req.includes(field) && !value?.trim() ? inputErrorCls : inputCls;
  const lbl = (field: string, value: string | undefined, text: string) => (
    <label className={highlightEmpty && req.includes(field) && !value?.trim() ? labelErrorCls : labelCls}>
      {text}{highlightEmpty && req.includes(field) && !value?.trim() ? " ⚠" : ""}
    </label>
  );

  // List helpers
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

    // ── Personal Info ──────────────────────────────────────────────────────────
    case "personal": {
      const p = data.personal || {};
      const set = (field: string, val: string) =>
        onChange({ ...data, personal: { ...p, [field]: val } });
      return (
        <div className="space-y-3">
          <label className={labelCls}>Personal Information</label>
          <div>
            {lbl("fullName", p.fullName, "Full Name *")}
            <input className={cls("fullName", p.fullName)} placeholder="Full name" value={p.fullName || ""} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              {lbl("email", p.email, "Email *")}
              <input className={cls("email", p.email)} type="email" placeholder="email@example.com" value={p.email || ""} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              {lbl("phone", p.phone, "Phone *")}
              <input className={cls("phone", p.phone)} placeholder="+1 234 567 8900" value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} placeholder="City, Country" value={p.location || ""} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Headline / Role</label>
              <input className={inputCls} placeholder="Senior Software Engineer" value={p.headline || ""} onChange={(e) => set("headline", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>LinkedIn</label>
              <input className={inputCls} placeholder="linkedin.com/in/…" value={p.linkedin || ""} onChange={(e) => set("linkedin", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input className={inputCls} placeholder="yourwebsite.com" value={p.website || ""} onChange={(e) => set("website", e.target.value)} />
            </div>
          </div>
        </div>
      );
    }

    // ── Summary ────────────────────────────────────────────────────────────────
    case "summary":
      return (
        <div>
          <label className={labelCls}>Professional Summary</label>
          <AutoTextarea
            minRows={6}
            className={`${inputCls} leading-relaxed`}
            placeholder="Write a compelling professional summary (60–90 words)…"
            value={data.summary || ""}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            {(data.summary || "").split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      );

    // ── Experience ─────────────────────────────────────────────────────────────
    case "experience": {
      const items = data.experience || [{ title: "", company: "", location: "", startDate: "", endDate: "", description: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Work Experience</label>
          {items.map((e: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Position {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("experience", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={cls("title", e.title)} placeholder="Job title *"
                  value={e.title} onChange={(ev) => setItemField("experience", i, "title", ev.target.value)} />
                <input className={cls("company", e.company)} placeholder="Company *"
                  value={e.company} onChange={(ev) => setItemField("experience", i, "company", ev.target.value)} />
                <input className={cls("location", e.location)} placeholder="Location (city, country) *"
                  value={e.location} onChange={(ev) => setItemField("experience", i, "location", ev.target.value)} />
                <input className={cls("startDate", e.startDate)} placeholder="Start date (e.g. Jan 2020) *"
                  value={e.startDate} onChange={(ev) => setItemField("experience", i, "startDate", ev.target.value)} />
                <input className={`${cls("endDate", e.endDate)} col-span-2 sm:col-span-1`} placeholder="End date (or Present) *"
                  value={e.endDate} onChange={(ev) => setItemField("experience", i, "endDate", ev.target.value)} />
              </div>
              <AutoTextarea minRows={3} className={cls("description", e.description)}
                placeholder="Key responsibilities and achievements… *"
                value={e.description} onChange={(ev) => setItemField("experience", i, "description", ev.target.value)} />
            </div>
          ))}
          <button type="button"
            onClick={() => addItem("experience", { title: "", company: "", location: "", startDate: "", endDate: "", description: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add position
          </button>
        </div>
      );
    }

    // ── Education ──────────────────────────────────────────────────────────────
    case "education": {
      const items = data.education || [{ degree: "", institution: "", year: "", description: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Education</label>
          {items.map((e: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Entry {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("education", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input className={`${cls("degree", e.degree)} col-span-2`} placeholder="Degree / Qualification *"
                  value={e.degree} onChange={(ev) => setItemField("education", i, "degree", ev.target.value)} />
                <input className={cls("year", e.year)} placeholder="Year *"
                  value={e.year} onChange={(ev) => setItemField("education", i, "year", ev.target.value)} />
              </div>
              <input className={cls("institution", e.institution)} placeholder="Institution / University *"
                value={e.institution} onChange={(ev) => setItemField("education", i, "institution", ev.target.value)} />
              <input className={inputCls} placeholder="Field of study or additional notes (optional)"
                value={e.description} onChange={(ev) => setItemField("education", i, "description", ev.target.value)} />
            </div>
          ))}
          <button type="button"
            onClick={() => addItem("education", { degree: "", institution: "", year: "", description: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add education
          </button>
        </div>
      );
    }

    // ── Skills ─────────────────────────────────────────────────────────────────
    case "skills": {
      const CATEGORIES = ["Technical", "Soft Skills", "Leadership", "Domain", "Tools", "Other"];
      const items: { name: string; category: string }[] = data.skills || [{ name: "", category: "" }];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Skills</label>
          {items.map((s: any, i: number) => (
            <div key={i} className="grid grid-cols-[1fr_140px_auto] items-center gap-2">
              <input className={cls("name", s.name)} placeholder="Skill name *"
                value={s.name} onChange={(e) => setItemField("skills", i, "name", e.target.value)} />
              <select className={inputCls}
                value={s.category} onChange={(e) => setItemField("skills", i, "category", e.target.value)}>
                <option value="">Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                type="button"
                onClick={() => removeItem("skills", i)}
                className={`text-slate-300 hover:text-red-400 transition-colors ${items.length === 1 ? "invisible" : ""}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("skills", { name: "", category: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add skill
          </button>
          {(() => {
            const filled = items.filter((s: any) => s.name?.trim()).length;
            return filled < 3 ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Minimum <strong>3 skills</strong> required — {filled} of 3 added so far</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{filled} skills added — minimum met</span>
              </div>
            );
          })()}
        </div>
      );
    }

    // ── Certifications ─────────────────────────────────────────────────────────
    case "certifications": {
      const items = data.certifications || [{ name: "", issuer: "", year: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Certifications</label>
          {items.map((c: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Certification {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("certifications", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <AutoTextarea minRows={1} className={cls("name", c.name)} placeholder="Certification name *"
                value={c.name || ""} onChange={(e) => setItemField("certifications", i, "name", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input className={`${inputCls} col-span-2`} placeholder="Issuing organisation"
                  value={c.issuer} onChange={(e) => setItemField("certifications", i, "issuer", e.target.value)} />
                <input className={inputCls} placeholder="Year"
                  value={c.year} onChange={(e) => setItemField("certifications", i, "year", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => addItem("certifications", { name: "", issuer: "", year: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add certification
          </button>
        </div>
      );
    }

    // ── Key Achievements ───────────────────────────────────────────────────────
    case "keyAchievements": {
      const items: string[] = data.keyAchievements || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Achievements</label>
          {items.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004aad] shrink-0 mt-3" />
              <AutoTextarea minRows={1} className={`${inputCls} flex-1`}
                placeholder={`Achievement ${i + 1} — include a metric (e.g. 30%, $1M)`}
                value={a} onChange={(e) => setItemText("keyAchievements", i, e.target.value)} />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem("keyAchievements", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors mt-2">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("keyAchievements", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline mt-1">
            <Plus className="h-3 w-3" /> Add achievement
          </button>
        </div>
      );
    }

    // ── Awards ─────────────────────────────────────────────────────────────────
    case "awards": {
      const items = data.awards || [{ title: "", description: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Awards &amp; Recognitions</label>
          {items.map((a: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Award {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("awards", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <AutoTextarea minRows={1} className={cls("title", a.title)} placeholder="Award title *"
                value={a.title || ""} onChange={(e) => setItemField("awards", i, "title", e.target.value)} />
              <AutoTextarea minRows={1} className={cls("description", a.description)} placeholder="Description (issuer, year, context…)"
                value={a.description || ""} onChange={(e) => setItemField("awards", i, "description", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => addItem("awards", { title: "", description: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add award
          </button>
        </div>
      );
    }

    // ── Memberships ────────────────────────────────────────────────────────────
    case "memberships": {
      const items: string[] = data.memberships || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Professional Memberships</label>
          {items.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <AutoTextarea minRows={1} className={`${inputCls} flex-1`} placeholder={`Organisation ${i + 1}`}
                value={m} onChange={(e) => setItemText("memberships", i, e.target.value)} />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem("memberships", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors mt-2">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("memberships", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add membership
          </button>
        </div>
      );
    }

    // ── Projects ───────────────────────────────────────────────────────────────
    case "projects": {
      const items: { name: string; description: string; tech: string }[] =
        data.projects || [{ name: "", description: "", tech: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Projects</label>
          {items.map((p, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Project {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("projects", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <input className={cls("name", p.name)} placeholder="Project name *"
                value={p.name} onChange={(e) => setItemField("projects", i, "name", e.target.value)} />
              <AutoTextarea minRows={3} className={cls("description", p.description)}
                placeholder="Describe scope, actions taken, and measurable outcomes… *"
                value={p.description} onChange={(e) => setItemField("projects", i, "description", e.target.value)} />
              <AutoTextarea minRows={1} className={inputCls} placeholder="Technologies (e.g. React, Salesforce, Python) — optional"
                value={p.tech || ""} onChange={(e) => setItemField("projects", i, "tech", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => addItem("projects", { name: "", description: "", tech: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add project
          </button>
        </div>
      );
    }

    // ── Board Roles ────────────────────────────────────────────────────────────
    case "boardRoles": {
      const items = data.boardRoles || [{ title: "", organization: "", startDate: "", endDate: "", description: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Board &amp; Advisory Roles</label>
          {items.map((b: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Role {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("boardRoles", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <AutoTextarea minRows={1} className={cls("title", b.title)} placeholder="Title (e.g. Non-Exec Director) *"
                value={b.title || ""} onChange={(e) => setItemField("boardRoles", i, "title", e.target.value)} />
              <AutoTextarea minRows={1} className={cls("organization", b.organization)} placeholder="Organisation *"
                value={b.organization || ""} onChange={(e) => setItemField("boardRoles", i, "organization", e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Start year"
                  value={b.startDate} onChange={(e) => setItemField("boardRoles", i, "startDate", e.target.value)} />
                <input className={inputCls} placeholder="End / Ongoing"
                  value={b.endDate} onChange={(e) => setItemField("boardRoles", i, "endDate", e.target.value)} />
              </div>
              <AutoTextarea minRows={2} className={inputCls}
                placeholder="Governance contribution…"
                value={b.description} onChange={(e) => setItemField("boardRoles", i, "description", e.target.value)} />
            </div>
          ))}
          <button type="button"
            onClick={() => addItem("boardRoles", { title: "", organization: "", startDate: "", endDate: "", description: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add role
          </button>
        </div>
      );
    }

    // ── Executive Training ─────────────────────────────────────────────────────
    case "executiveTraining": {
      const items: { name: string; institution: string; year: string }[] =
        data.executiveTraining || [{ name: "", institution: "", year: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Executive Training</label>
          {items.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Programme {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("executiveTraining", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <AutoTextarea minRows={1} className={cls("name", t.name)} placeholder="Programme name *"
                value={t.name || ""} onChange={(e) => setItemField("executiveTraining", i, "name", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input className={`${inputCls} col-span-2`} placeholder="Institution"
                  value={t.institution} onChange={(e) => setItemField("executiveTraining", i, "institution", e.target.value)} />
                <input className={inputCls} placeholder="Year"
                  value={t.year} onChange={(e) => setItemField("executiveTraining", i, "year", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addItem("executiveTraining", { name: "", institution: "", year: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add programme
          </button>
        </div>
      );
    }

    // ── Publications ───────────────────────────────────────────────────────────
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
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Publication {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("publications", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <AutoTextarea minRows={1} className={cls("title", p.title)} placeholder="Title *"
                value={p.title || ""} onChange={(e) => setItemField("publications", i, "title", e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <input className={`${inputCls} col-span-2`} placeholder="Publisher / Conference"
                  value={p.publisher} onChange={(e) => setItemField("publications", i, "publisher", e.target.value)} />
                <input className={inputCls} placeholder="Year"
                  value={p.year} onChange={(e) => setItemField("publications", i, "year", e.target.value)} />
              </div>
              <select className={inputCls} value={p.type}
                onChange={(e) => setItemField("publications", i, "type", e.target.value)}>
                {PUB_TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {ty.charAt(0).toUpperCase() + ty.slice(1).replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button type="button"
            onClick={() => addItem("publications", { title: "", publisher: "", year: "", type: "article" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add publication
          </button>
        </div>
      );
    }

    // ── Tools ──────────────────────────────────────────────────────────────────
    case "tools": {
      const items: string[] = data.tools || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Tools &amp; Software</label>
          {items.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <AutoTextarea minRows={1} className={`${inputCls} flex-1`} placeholder={`Tool ${i + 1} (e.g. SAP S/4HANA)`}
                value={t} onChange={(e) => setItemText("tools", i, e.target.value)} />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem("tools", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors mt-2">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("tools", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add tool
          </button>
          {(() => {
            const filled = items.filter((t: any) => (typeof t === "string" ? t : t?.name || t)?.trim()).length;
            return filled < 3 ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Minimum <strong>3 tools</strong> required — {filled} of 3 added so far</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{filled} tools added — minimum met</span>
              </div>
            );
          })()}
        </div>
      );
    }

    // ── Volunteer ──────────────────────────────────────────────────────────────
    case "volunteer": {
      const items: string[] = data.volunteer || [""];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Volunteer Experience</label>
          {items.map((v, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-3" />
              <AutoTextarea minRows={1} className={`${inputCls} flex-1`} placeholder={`Volunteer role ${i + 1}`}
                value={v} onChange={(e) => setItemText("volunteer", i, e.target.value)} />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem("volunteer", i)}
                  className="text-slate-300 hover:text-red-400 shrink-0 transition-colors mt-2">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("volunteer", "")}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add entry
          </button>
        </div>
      );
    }

    // ── Languages ──────────────────────────────────────────────────────────────
    case "languages": {
      const LEVELS = ["Native", "Fluent", "Proficient", "Intermediate", "Basic"];
      const items: { name: string; proficiency: string }[] =
        data.languages || [{ name: "", proficiency: "" }];
      return (
        <div className="space-y-2.5">
          <label className={labelCls}>Languages</label>
          {items.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_160px_auto] items-center gap-2">
              <input className={cls("name", l.name)} placeholder="Language (e.g. English) *"
                value={l.name} onChange={(e) => setItemField("languages", i, "name", e.target.value)} />
              <select className={cls("proficiency", l.proficiency)}
                value={l.proficiency} onChange={(e) => setItemField("languages", i, "proficiency", e.target.value)}>
                <option value="">Proficiency…</option>
                {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
              </select>
              <button
                type="button"
                onClick={() => removeItem("languages", i)}
                className={`text-slate-300 hover:text-red-400 transition-colors ${items.length === 1 ? "invisible" : ""}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addItem("languages", { name: "", proficiency: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add language
          </button>
        </div>
      );
    }

    // ── Referees ───────────────────────────────────────────────────────────────
    case "referees": {
      const items = data.referees || [{ name: "", title: "", company: "", phone: "", email: "" }];
      return (
        <div className="space-y-3">
          <label className={labelCls}>Referees</label>
          {items.map((r: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Referee {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem("referees", i)}
                    className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={cls("name", r.name)} placeholder="Full name *"
                  value={r.name} onChange={(e) => setItemField("referees", i, "name", e.target.value)} />
                <input className={inputCls} placeholder="Job title"
                  value={r.title} onChange={(e) => setItemField("referees", i, "title", e.target.value)} />
                <input className={inputCls} placeholder="Company / Organisation"
                  value={r.company} onChange={(e) => setItemField("referees", i, "company", e.target.value)} />
                <input className={inputCls} placeholder="Phone"
                  value={r.phone} onChange={(e) => setItemField("referees", i, "phone", e.target.value)} />
                <input className={`${inputCls} col-span-2`} type="email" placeholder="Email"
                  value={r.email} onChange={(e) => setItemField("referees", i, "email", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => addItem("referees", { name: "", title: "", company: "", phone: "", email: "" })}
            className="flex items-center gap-1 text-xs text-[#004aad] hover:underline">
            <Plus className="h-3 w-3" /> Add referee
          </button>
        </div>
      );
    }

    // ── Declaration ────────────────────────────────────────────────────────────
    case "declaration": {
      const d = data.declaration || { declaration: "", place: "", date: "" };
      const setField = (field: string, val: string) =>
        onChange({ ...data, declaration: { ...d, [field]: val } });
      return (
        <div className="space-y-3">
          {lbl("declaration", d.declaration, "Declaration Statement *")}
          <AutoTextarea minRows={3} className={cls("declaration", d.declaration)}
            placeholder="I hereby declare that the information provided in this Curriculum Vitae is true and correct…"
            value={d.declaration} onChange={(e) => setField("declaration", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              {lbl("place", d.place, "Place *")}
              <input className={cls("place", d.place)} placeholder="City"
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
      return <p className="text-sm text-slate-400">Editor not available for this section.</p>;
  }
}

// ─── Missing-section Row ──────────────────────────────────────────────────────
function MissingSectionRow({
  section,
  loading,
  hasError,
  aiCapable,
  onAiFill,
  onManualInline,
}: {
  section: AiSection;
  loading: boolean;
  hasError: boolean;
  aiCapable: boolean;
  onAiFill: () => void;
  onManualInline: () => void;
}) {
  const isRequired = section.priority === "required";
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
      isRequired ? "border-red-100 bg-red-50/50" : "border-amber-100 bg-amber-50/30"
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${isRequired ? "bg-red-500" : "bg-amber-400"}`} />
          <span className="text-sm font-medium text-slate-800 truncate">{section.label}</span>
        </div>
        {hasError && (
          <p className="text-[11px] text-red-500 mt-0.5 pl-4">Generation failed — try again</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {aiCapable && (
          <Button size="sm" variant="outline" disabled={loading} onClick={onAiFill}
            className="h-7 text-xs px-2.5 gap-1 border-[#004aad]/30 text-[#004aad] hover:bg-[#004aad]/5 disabled:opacity-50">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
            {loading ? "Generating…" : "AI Fill"}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onManualInline}
          className="h-7 text-xs px-2.5 gap-1 text-slate-500 hover:text-slate-700">
          <PenLine className="h-3 w-3" />
          {aiCapable ? "Manual" : "Fill in"}
        </Button>
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
      <Button size="sm" variant="ghost" onClick={onFix}
        className="h-7 text-xs px-2.5 gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 shrink-0">
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
  const [loadingKey, setLoadingKey]       = useState<string | null>(null);
  const [editing, setEditing]             = useState<EditState | null>(null);
  const [appliedKeys, setAppliedKeys]     = useState<Set<string>>(new Set());
  const [errorKey, setErrorKey]           = useState<string | null>(null);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const incompleteGroupRef                = useRef<HTMLDivElement>(null);

  // Auto-close when nothing left to show (runs on open change AND whenever section lists change)
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
  }, [open, missingRequired.length, missingRecommended.length, incompleteSections.length]);

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
    const editKey = SECTION_EDIT_KEY[section.key];
    setEditing({
      sectionKey:    section.key,
      apiSectionKey: editKey,
      label:         section.label,
      data:          getEmptyData(editKey),
      source:        "manual",
    });
  };

  /** Open inline editor for an incomplete section, pre-filled with existing data */
  const handleInlineFix = (s: { key: string; label: string }) => {
    setShowCloseWarning(false);
    const editKey = SECTION_EDIT_KEY[s.key];
    let data: any;

    switch (s.key) {
      case "personal":
        data = { personal: { ...(cvData.personalInfo || {}) } };
        break;
      case "experience":
        data = {
          experience: (cvData.experiences || []).map((e: any) => ({
            id: e.id, title: e.title || "", company: e.company || "",
            location: e.location || "", startDate: e.startDate || "",
            endDate: e.endDate || "", description: e.description || "",
          })),
        };
        break;
      case "education":
        data = {
          education: (cvData.education || []).map((e: any) => ({
            id: e.id, degree: e.degree || "", institution: e.institution || "",
            year: e.year || "", description: e.description || "",
          })),
        };
        break;
      case "skills":
        data = {
          skills: (cvData.skills || []).map((sk: any) => ({
            id: sk.id, name: sk.name || "", category: sk.category || "",
          })),
        };
        break;
      case "certifications":
        data = {
          certifications: (cvData.certifications || []).map((c: any) => ({
            id: c.id, name: c.name || "", issuer: c.issuer || "", year: c.year || "",
          })),
        };
        break;
      case "languages":
        data = {
          languages: (cvData.languages || []).map((l: any) => ({
            id: l.id, name: l.name || "", proficiency: l.proficiency || "",
          })),
        };
        break;
      case "awards":
        data = {
          awards: (cvData.awards || []).map((a: any) => ({
            id: a.id, title: a.title || "", description: a.description || "",
          })),
        };
        break;
      case "referees":
        data = {
          referees: (cvData.referees || []).map((r: any) => ({
            id: r.id, name: r.name || "", title: r.title || "",
            company: r.company || "", phone: r.phone || "", email: r.email || "",
          })),
        };
        break;
      default:
        data = getEmptyData(editKey);
    }

    setEditing({
      sectionKey:    s.key,
      apiSectionKey: editKey,
      label:         s.label,
      data,
      source: "incomplete",
    });
  };

  const handleApply = () => {
    if (!editing) return;
    onApply(editing.sectionKey, editing.apiSectionKey, editing.data);
    setAppliedKeys((prev) => new Set([...prev, editing.sectionKey]));
    setEditing(null);
  };

  const handleClose = () => {
    // Block exit if there are still incomplete fields — scroll to them and warn
    if (incompleteSections.length > 0) {
      setShowCloseWarning(true);
      setEditing(null); // exit any open editor back to list
      setTimeout(() => {
        incompleteGroupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }
    setShowCloseWarning(false);
    setEditing(null);
    onClose();
  };

  // ── Header copy ──────────────────────────────────────────────────────────
  const headerTitle = editing
    ? editing.source === "ai"
      ? `${editing.label} — AI Draft`
      : editing.source === "incomplete"
      ? `Fix: ${editing.label}`
      : `Fill: ${editing.label}`
    : allMissingDone && incompleteSections.length > 0
    ? "Fix incomplete fields"
    : "Strengthen Your CV";

  const headerSub = editing
    ? editing.source === "ai"
      ? "Review and edit the AI draft, then click Apply"
      : editing.source === "incomplete"
      ? "Update the missing fields below, then click Apply"
      : "Fill in the fields below, then click Apply"
    : allMissingDone && incompleteSections.length > 0
    ? `${incompleteSections.length} section${incompleteSections.length !== 1 ? "s" : ""} have fields that need completing`
    : totalToAddress > 0
    ? `${totalToAddress} issue${totalToAddress !== 1 ? "s" : ""} found — use AI to fill or enter manually`
    : "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl sm:max-w-3xl lg:max-w-4xl w-full p-0 gap-0 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-3 p-5 border-b shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#004aad] flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-800 text-base leading-tight">{headerTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{headerSub}</p>
          </div>
          {/* Plain button — not DialogClose so Radix can't bypass handleClose's incomplete-guard */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">

          {/* Close-blocked warning */}
          {showCloseWarning && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border-2 border-orange-400 bg-orange-50 px-4 py-3 animate-pulse">
              <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-800">
                  Complete incomplete fields before closing
                </p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Fix the {incompleteSections.length} section{incompleteSections.length !== 1 ? "s" : ""} highlighted below, then close.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseWarning(false)}
                className="shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Inline editor */}
          {editing && (
            <div className="p-5 space-y-4">
              {editing.source === "ai" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#004aad] bg-[#004aad]/10 px-2.5 py-1 rounded-full">
                  <Lightbulb className="h-2.5 w-2.5" />
                  AI Generated — review &amp; edit before applying
                </span>
              )}
              {editing.source === "incomplete" && (
                <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2.5">
                  <Wrench className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-orange-700">Fields highlighted in orange are required and currently empty</p>
                    <p className="text-[10px] text-orange-500 mt-0.5">Fill them in and click Apply to save</p>
                  </div>
                </div>
              )}
              <InlineSectionEditor
                apiKey={editing.apiSectionKey}
                data={editing.data}
                onChange={(newData) => setEditing({ ...editing, data: newData })}
                highlightEmpty={editing.source === "incomplete"}
              />
            </div>
          )}

          {/* Section list — only render when there is actually something to show */}
          {!editing && totalToAddress > 0 && (() => {
            const recWithAi    = pendingRecommended.filter((s) =>  !!SECTION_API_KEY[s.key]);
            const recWithoutAi = pendingRecommended.filter((s) => !SECTION_API_KEY[s.key]);
            return (
              <div className="p-4 space-y-4">

                {/* 1 ── Required — missing (all, AI or not) */}
                {pendingRequired.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                        Required — missing ({pendingRequired.length})
                      </span>
                    </div>
                    {pendingRequired.map((s) => (
                      <MissingSectionRow
                        key={s.key}
                        section={{ ...s, priority: "required" }}
                        loading={loadingKey === s.key}
                        hasError={errorKey === s.key}
                        aiCapable={!!SECTION_API_KEY[s.key]}
                        onAiFill={() => handleAiFill({ ...s, priority: "required" })}
                        onManualInline={() => handleManualInline({ ...s, priority: "required" })}
                      />
                    ))}
                  </div>
                )}

                {/* 2 ── Incomplete fields — fix before closing */}
                {incompleteSections.length > 0 && (
                  <div ref={incompleteGroupRef} className="space-y-2">
                    <div className={`flex items-center gap-1.5 px-1 py-1 rounded-lg transition-colors ${showCloseWarning ? "bg-orange-100 -mx-1" : ""}`}>
                      <Wrench className={`h-3.5 w-3.5 shrink-0 ${showCloseWarning ? "text-orange-600" : "text-orange-500"}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wide ${showCloseWarning ? "text-orange-700" : "text-orange-600"}`}>
                        Incomplete fields ({incompleteSections.length}) — fix before closing
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

                {/* 3 ── Recommended — with AI Fill */}
                {recWithAi.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <Lightbulb className="h-3.5 w-3.5 text-[#004aad]" />
                      <span className="text-xs font-semibold text-[#004aad] uppercase tracking-wide">
                        Recommended — AI Fill available ({recWithAi.length})
                      </span>
                    </div>
                    {recWithAi.map((s) => (
                      <MissingSectionRow
                        key={s.key}
                        section={{ ...s, priority: "recommended" }}
                        loading={loadingKey === s.key}
                        hasError={errorKey === s.key}
                        aiCapable={true}
                        onAiFill={() => handleAiFill({ ...s, priority: "recommended" })}
                        onManualInline={() => handleManualInline({ ...s, priority: "recommended" })}
                      />
                    ))}
                  </div>
                )}

                {/* 4 ── Recommended — fill manually */}
                {recWithoutAi.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <PenLine className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Recommended — fill manually ({recWithoutAi.length})
                      </span>
                    </div>
                    {recWithoutAi.map((s) => (
                      <MissingSectionRow
                        key={s.key}
                        section={{ ...s, priority: "recommended" }}
                        loading={loadingKey === s.key}
                        hasError={errorKey === s.key}
                        aiCapable={false}
                        onAiFill={() => {}}
                        onManualInline={() => handleManualInline({ ...s, priority: "recommended" })}
                      />
                    ))}
                  </div>
                )}

              </div>
            );
          })()}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t shrink-0">
          {editing ? (() => {
            // Block Apply when the edited section is below the 3-item minimum
            const applyDisabled = (() => {
              if (editing.apiSectionKey === "skills") {
                return (editing.data.skills || []).filter((s: any) => s.name?.trim()).length < 3;
              }
              if (editing.apiSectionKey === "tools") {
                return (editing.data.tools || []).filter((t: any) =>
                  (typeof t === "string" ? t : t?.name || t)?.trim()
                ).length < 3;
              }
              return false;
            })();
            return (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)} className="gap-1.5 text-slate-600">
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <div className="flex-1" />
              {applyDisabled && (
                <span className="text-xs text-amber-600 font-medium">
                  {editing.apiSectionKey === "skills" ? "Add at least 3 skills" : "Add at least 3 tools"}
                </span>
              )}
              <Button size="sm" onClick={handleApply} disabled={applyDisabled}
                className="bg-[#004aad] hover:bg-[#003d8f] text-white gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <Check className="h-3.5 w-3.5" />
                Apply
              </Button>
            </div>
            );
          })()
          ) : totalToAddress > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className={`text-xs ${incompleteSections.length > 0 ? "text-orange-600 font-medium" : "text-slate-400"}`}>
                {incompleteSections.length > 0
                  ? `Fix ${incompleteSections.length} incomplete section${incompleteSections.length !== 1 ? "s" : ""} to close`
                  : "You can always fill these later"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className={`gap-1.5 shrink-0 ${incompleteSections.length > 0 ? "border-orange-300 text-orange-700 hover:bg-orange-50" : "text-slate-600 hover:text-slate-800"}`}
              >
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </div>
          ) : null}
        </div>

      </DialogContent>
    </Dialog>
  );
}
