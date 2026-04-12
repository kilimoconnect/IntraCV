"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronRight, Plus, Trash2, X, GripVertical,
  User, FileText, Briefcase, GraduationCap, Star, Award,
  Globe, Languages, BookOpen, Wrench, Users, Heart,
  Trophy, Building2, FlaskConical, BookMarked, ClipboardList,
} from "lucide-react";
import { type CareerCategory, type CategoryCVData } from "./cv-layout-types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, multiline = false, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder:text-slate-300"
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder:text-slate-300"
        />
      )}
    </div>
  );
}

function Section({
  icon: Icon, title, count, children, defaultOpen = true, accent = "indigo",
}: {
  icon: React.ElementType; title: string; count?: number; children: React.ReactNode;
  defaultOpen?: boolean; accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span className="flex-1 text-xs font-semibold text-slate-700">{title}</span>
        {count !== undefined && (
          <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5 mr-1">
            {count}
          </span>
        )}
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

function ItemCard({ onDelete, children }: { onDelete: () => void; children: React.ReactNode }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="relative border border-slate-200 rounded-xl p-3 space-y-3 bg-slate-50/50 group">
      <button
        onClick={() => { if (confirm) { onDelete(); setConfirm(false); } else setConfirm(true); }}
        onBlur={() => setTimeout(() => setConfirm(false), 200)}
        className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all ${
          confirm ? "bg-red-500 border-red-500 text-white" : "border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
        }`}
      >
        <Trash2 className="h-3 w-3" />
        {confirm ? "Confirm" : "Remove"}
      </button>
      {children}
    </div>
  );
}

function StringArray({
  values, onChange, placeholder = "Add item…",
}: { values: string[]; onChange: (v: string[]) => void; placeholder?: string; }) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <input
            value={v}
            onChange={e => { const n = [...values]; n[i] = e.target.value; onChange(n); }}
            className="flex-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
          <button
            onClick={() => { const n = [...values]; n.splice(i, 1); onChange(n); }}
            className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...values, ""])}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> {placeholder}
      </button>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props {
  data: CategoryCVData;
  category: CareerCategory;
  onChange: (updater: (prev: CategoryCVData) => CategoryCVData) => void;
  onClose: () => void;
}

export default function CVEditorPanel({ data, category, onChange, onClose }: Props) {
  const upd = (patch: Partial<CategoryCVData>) => onChange(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div>
          <p className="text-sm font-bold text-white">Edit CV Content</p>
          <p className="text-[10px] text-indigo-200 mt-0.5">All changes update the preview instantly</p>
        </div>
        <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* ── Personal Info ── */}
        <Section icon={User} title="Personal Information" defaultOpen>
          <Field label="Full Name" value={data.fullName || ""} onChange={v => upd({ fullName: v })} placeholder="Jane Doe" />
          <Field label="Job Title" value={data.title || ""} onChange={v => upd({ title: v })} placeholder="Senior Accountant" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={data.email || ""} onChange={v => upd({ email: v })} placeholder="jane@example.com" />
            <Field label="Phone" value={data.phone || ""} onChange={v => upd({ phone: v })} placeholder="+1 234 567 8900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" value={data.location || ""} onChange={v => upd({ location: v })} placeholder="Nairobi, Kenya" />
            <Field label="LinkedIn" value={data.linkedin || ""} onChange={v => upd({ linkedin: v })} placeholder="linkedin.com/in/jane" />
          </div>
          <Field label="Website" value={data.website || ""} onChange={v => upd({ website: v })} placeholder="https://jane.dev" />
          {(category === "executive" || data.tagline) && (
            <Field label="Tagline" value={data.tagline || ""} onChange={v => upd({ tagline: v })} placeholder="C-Suite leader with 20+ years…" />
          )}
        </Section>

        {/* ── Profile Summary ── */}
        <Section icon={FileText} title="Professional Summary" defaultOpen>
          <Field
            label="Summary"
            value={data.profile || ""}
            onChange={v => upd({ profile: v })}
            multiline
            placeholder="Write a compelling professional summary…"
          />
        </Section>

        {/* ── Experience ── */}
        <Section icon={Briefcase} title="Work Experience" count={data.experience?.length ?? 0}>
          <div className="space-y-4">
            {(data.experience || []).map((exp, i) => (
              <ItemCard key={i} onDelete={() => {
                const a = [...(data.experience || [])]; a.splice(i, 1); upd({ experience: a });
              }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Job Title" value={exp.role} onChange={v => {
                    const a = [...(data.experience || [])]; a[i] = { ...a[i], role: v }; upd({ experience: a });
                  }} placeholder="Senior Manager" />
                  <Field label="Company" value={exp.company} onChange={v => {
                    const a = [...(data.experience || [])]; a[i] = { ...a[i], company: v }; upd({ experience: a });
                  }} placeholder="Acme Corp" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Dates" value={exp.dates} onChange={v => {
                    const a = [...(data.experience || [])]; a[i] = { ...a[i], dates: v }; upd({ experience: a });
                  }} placeholder="Jan 2020 – Present" />
                  <Field label="Location (optional)" value={exp.location || ""} onChange={v => {
                    const a = [...(data.experience || [])]; a[i] = { ...a[i], location: v }; upd({ experience: a });
                  }} placeholder="Nairobi, KE" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Bullet Points</p>
                  <div className="space-y-2">
                    {(exp.bullets || []).map((b, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-2" />
                        <textarea
                          value={b}
                          onChange={e => {
                            const a = [...(data.experience || [])];
                            const bs = [...(a[i].bullets || [])]; bs[j] = e.target.value;
                            a[i] = { ...a[i], bullets: bs }; upd({ experience: a });
                          }}
                          rows={2}
                          className="flex-1 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                        />
                        <button onClick={() => {
                          const a = [...(data.experience || [])];
                          const bs = [...(a[i].bullets || [])]; bs.splice(j, 1);
                          a[i] = { ...a[i], bullets: bs }; upd({ experience: a });
                        }} className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-1.5">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const a = [...(data.experience || [])];
                      a[i] = { ...a[i], bullets: [...(a[i].bullets || []), ""] }; upd({ experience: a });
                    }} className="flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      <Plus className="h-3 w-3" /> Add bullet
                    </button>
                  </div>
                </div>
              </ItemCard>
            ))}
            <button onClick={() => upd({ experience: [...(data.experience || []), { role: "", company: "", dates: "", bullets: [""] }] })}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
              <Plus className="h-3.5 w-3.5" /> Add Experience
            </button>
          </div>
        </Section>

        {/* ── History — always show for mid-senior/executive which use it ── */}
        {(category !== "junior") && (
          <Section icon={Briefcase} title="Career History" count={data.history?.length ?? 0} defaultOpen={false}>
            <div className="space-y-4">
              {(data.history || []).map((h, i) => (
                <ItemCard key={i} onDelete={() => {
                  const a = [...(data.history || [])]; a.splice(i, 1); upd({ history: a });
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Job Title" value={h.role} onChange={v => {
                      const a = [...(data.history || [])]; a[i] = { ...a[i], role: v }; upd({ history: a });
                    }} />
                    <Field label="Company" value={h.company} onChange={v => {
                      const a = [...(data.history || [])]; a[i] = { ...a[i], company: v }; upd({ history: a });
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dates" value={h.dates} onChange={v => {
                      const a = [...(data.history || [])]; a[i] = { ...a[i], dates: v }; upd({ history: a });
                    }} />
                    <Field label="Location" value={h.location || ""} onChange={v => {
                      const a = [...(data.history || [])]; a[i] = { ...a[i], location: v }; upd({ history: a });
                    }} />
                  </div>
                  <div className="space-y-2">
                    {(h.bullets || []).map((b, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <textarea value={b} onChange={e => {
                          const a = [...(data.history || [])];
                          const bs = [...(a[i].bullets || [])]; bs[j] = e.target.value;
                          a[i] = { ...a[i], bullets: bs }; upd({ history: a });
                        }} rows={2} className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        <button onClick={() => {
                          const a = [...(data.history || [])];
                          const bs = [...(a[i].bullets || [])]; bs.splice(j, 1);
                          a[i] = { ...a[i], bullets: bs }; upd({ history: a });
                        }} className="text-slate-300 hover:text-red-500 mt-1.5"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const a = [...(data.history || [])];
                      a[i] = { ...a[i], bullets: [...(a[i].bullets || []), ""] }; upd({ history: a });
                    }} className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium"><Plus className="h-3 w-3" /> Add bullet</button>
                  </div>
                </ItemCard>
              ))}
              <button onClick={() => upd({ history: [...(data.history || []), { role: "", company: "", dates: "", bullets: [""] }] })}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Add History Entry
              </button>
            </div>
          </Section>
        )}

        {/* ── Education ── */}
        <Section icon={GraduationCap} title="Education" count={data.education?.length ?? 0}>
          <div className="space-y-4">
            {(data.education || []).map((edu, i) => (
              <ItemCard key={i} onDelete={() => {
                const a = [...(data.education || [])]; a.splice(i, 1); upd({ education: a });
              }}>
                <Field label="Degree / Qualification" value={edu.degree} onChange={v => {
                  const a = [...(data.education || [])]; a[i] = { ...a[i], degree: v }; upd({ education: a });
                }} placeholder="BSc Computer Science" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="School / University" value={edu.school} onChange={v => {
                    const a = [...(data.education || [])]; a[i] = { ...a[i], school: v }; upd({ education: a });
                  }} placeholder="University of Nairobi" />
                  <Field label="Year" value={edu.year} onChange={v => {
                    const a = [...(data.education || [])]; a[i] = { ...a[i], year: v }; upd({ education: a });
                  }} placeholder="2018" />
                </div>
                {edu.details !== undefined && (
                  <Field label="Details (optional)" value={edu.details || ""} onChange={v => {
                    const a = [...(data.education || [])]; a[i] = { ...a[i], details: v }; upd({ education: a });
                  }} placeholder="First Class Honours, Thesis: …" />
                )}
              </ItemCard>
            ))}
            <button onClick={() => upd({ education: [...(data.education || []), { degree: "", school: "", year: "", details: "" }] })}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
              <Plus className="h-3.5 w-3.5" /> Add Education
            </button>
          </div>
        </Section>

        {/* ── Skills ── */}
        <Section icon={Star} title="Skills" count={data.skills?.length ?? 0}>
          <StringArray
            values={data.skills || []}
            onChange={v => upd({ skills: v })}
            placeholder="Add skill"
          />
        </Section>

        {/* ── Achievements ── */}
        {(category !== "junior" || (data.achievements && data.achievements.length > 0)) && (
          <Section icon={Trophy} title="Key Achievements" count={data.achievements?.length ?? 0} defaultOpen={false}>
            <StringArray
              values={data.achievements || []}
              onChange={v => upd({ achievements: v })}
              placeholder="Add achievement"
            />
          </Section>
        )}

        {/* ── Certifications ── */}
        <Section icon={Award} title="Certifications" count={data.certifications?.length ?? 0} defaultOpen={false}>
          <div className="space-y-4">
            {(data.certifications || []).map((c, i) => (
              <ItemCard key={i} onDelete={() => {
                const a = [...(data.certifications || [])]; a.splice(i, 1); upd({ certifications: a });
              }}>
                <Field label="Certification Name" value={c.name} onChange={v => {
                  const a = [...(data.certifications || [])]; a[i] = { ...a[i], name: v }; upd({ certifications: a });
                }} placeholder="AWS Certified Solutions Architect" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Issuer" value={c.issuer} onChange={v => {
                    const a = [...(data.certifications || [])]; a[i] = { ...a[i], issuer: v }; upd({ certifications: a });
                  }} placeholder="Amazon Web Services" />
                  <Field label="Year" value={c.year || ""} onChange={v => {
                    const a = [...(data.certifications || [])]; a[i] = { ...a[i], year: v }; upd({ certifications: a });
                  }} placeholder="2023" />
                </div>
              </ItemCard>
            ))}
            <button onClick={() => upd({ certifications: [...(data.certifications || []), { name: "", issuer: "", year: "" }] })}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </button>
          </div>
        </Section>

        {/* ── Languages ── */}
        <Section icon={Languages} title="Languages" count={data.languages?.length ?? 0} defaultOpen={false}>
          <div className="space-y-4">
            {(data.languages || []).map((l, i) => (
              <ItemCard key={i} onDelete={() => {
                const a = [...(data.languages || [])]; a.splice(i, 1); upd({ languages: a });
              }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Language" value={l.name} onChange={v => {
                    const a = [...(data.languages || [])]; a[i] = { ...a[i], name: v }; upd({ languages: a });
                  }} placeholder="English" />
                  <Field label="Proficiency" value={l.label} onChange={v => {
                    const a = [...(data.languages || [])]; a[i] = { ...a[i], label: v }; upd({ languages: a });
                  }} placeholder="Fluent" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Level: {l.level ?? 80}%
                  </label>
                  <input type="range" min={0} max={100} value={l.level ?? 80}
                    onChange={e => {
                      const a = [...(data.languages || [])]; a[i] = { ...a[i], level: +e.target.value }; upd({ languages: a });
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </ItemCard>
            ))}
            <button onClick={() => upd({ languages: [...(data.languages || []), { name: "", label: "Intermediate", level: 60 }] })}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
              <Plus className="h-3.5 w-3.5" /> Add Language
            </button>
          </div>
        </Section>

        {/* ── Projects ── */}
        {(category !== "executive" || (data.projects && data.projects.length > 0)) && (
          <Section icon={FlaskConical} title="Projects" count={data.projects?.length ?? 0} defaultOpen={false}>
            <div className="space-y-4">
              {(data.projects || []).map((p, i) => (
                <ItemCard key={i} onDelete={() => {
                  const a = [...(data.projects || [])]; a.splice(i, 1); upd({ projects: a });
                }}>
                  <Field label="Project Name" value={p.name} onChange={v => {
                    const a = [...(data.projects || [])]; a[i] = { ...a[i], name: v }; upd({ projects: a });
                  }} placeholder="Inventory Management System" />
                  <Field label="Description" value={p.description} onChange={v => {
                    const a = [...(data.projects || [])]; a[i] = { ...a[i], description: v }; upd({ projects: a });
                  }} multiline placeholder="Describe the project and your role…" />
                  <Field label="Tech Stack (optional)" value={p.tech || ""} onChange={v => {
                    const a = [...(data.projects || [])]; a[i] = { ...a[i], tech: v }; upd({ projects: a });
                  }} placeholder="React, Node.js, PostgreSQL" />
                </ItemCard>
              ))}
              <button onClick={() => upd({ projects: [...(data.projects || []), { name: "", description: "", tech: "" }] })}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Add Project
              </button>
            </div>
          </Section>
        )}

        {/* ── Awards ── */}
        <Section icon={Trophy} title="Awards & Recognition" count={data.awards?.length ?? 0} defaultOpen={false}>
            <div className="space-y-4">
              {(data.awards || []).map((a, i) => (
                <ItemCard key={i} onDelete={() => {
                  const ar = [...(data.awards || [])]; ar.splice(i, 1); upd({ awards: ar });
                }}>
                  <Field label="Award Title" value={a.title} onChange={v => {
                    const ar = [...(data.awards || [])]; ar[i] = { ...ar[i], title: v }; upd({ awards: ar });
                  }} placeholder="Employee of the Year" />
                  <Field label="Description (optional)" value={a.description || ""} onChange={v => {
                    const ar = [...(data.awards || [])]; ar[i] = { ...ar[i], description: v }; upd({ awards: ar });
                  }} placeholder="Awarded for outstanding performance…" />
                </ItemCard>
              ))}
              <button onClick={() => upd({ awards: [...(data.awards || []), { title: "", description: "" }] })}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Add Award
              </button>
            </div>
        </Section>

        {/* ── Tools & Software ── */}
        {category !== "junior" && (
          <Section icon={Wrench} title="Tools & Software" count={data.tools?.length ?? 0} defaultOpen={false}>
            <StringArray
              values={data.tools || []}
              onChange={v => upd({ tools: v })}
              placeholder="Add tool"
            />
          </Section>
        )}

        {/* ── Memberships ── */}
        <Section icon={Users} title="Professional Memberships" count={data.memberships?.length ?? 0} defaultOpen={false}>
          <StringArray
            values={data.memberships || []}
            onChange={v => upd({ memberships: v })}
            placeholder="Add membership"
          />
        </Section>

        {/* ── Volunteer ── */}
        <Section icon={Heart} title="Volunteer Experience" count={data.volunteer?.length ?? 0} defaultOpen={false}>
          <StringArray
            values={data.volunteer || []}
            onChange={v => upd({ volunteer: v })}
            placeholder="Add volunteer experience"
          />
        </Section>

        {/* ── Board Roles (Executive) ── */}
        {category === "executive" && (
          <Section icon={Building2} title="Board Roles" count={data.boardRoles?.length ?? 0} defaultOpen={false}>
            <div className="space-y-4">
              {(data.boardRoles || []).map((r, i) => (
                <ItemCard key={i} onDelete={() => {
                  const a = [...(data.boardRoles || [])]; a.splice(i, 1); upd({ boardRoles: a });
                }}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title" value={r.title} onChange={v => {
                      const a = [...(data.boardRoles || [])]; a[i] = { ...a[i], title: v }; upd({ boardRoles: a });
                    }} placeholder="Non-Executive Director" />
                    <Field label="Organization" value={r.organization} onChange={v => {
                      const a = [...(data.boardRoles || [])]; a[i] = { ...a[i], organization: v }; upd({ boardRoles: a });
                    }} placeholder="Acme Holdings" />
                  </div>
                  <Field label="Dates" value={r.dates} onChange={v => {
                    const a = [...(data.boardRoles || [])]; a[i] = { ...a[i], dates: v }; upd({ boardRoles: a });
                  }} placeholder="2020 – Present" />
                  <Field label="Description (optional)" value={r.description || ""} onChange={v => {
                    const a = [...(data.boardRoles || [])]; a[i] = { ...a[i], description: v }; upd({ boardRoles: a });
                  }} multiline placeholder="Oversight of audit and risk committees…" />
                </ItemCard>
              ))}
              <button onClick={() => upd({ boardRoles: [...(data.boardRoles || []), { title: "", organization: "", dates: "" }] })}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Add Board Role
              </button>
            </div>
          </Section>
        )}

        {/* ── Executive Training ── */}
        {category === "executive" && (
          <Section icon={BookMarked} title="Executive Training" count={data.executiveTraining?.length ?? 0} defaultOpen={false}>
            <div className="space-y-4">
              {(data.executiveTraining || []).map((t, i) => (
                <ItemCard key={i} onDelete={() => {
                  const a = [...(data.executiveTraining || [])]; a.splice(i, 1); upd({ executiveTraining: a });
                }}>
                  <Field label="Programme Name" value={t.name} onChange={v => {
                    const a = [...(data.executiveTraining || [])]; a[i] = { ...a[i], name: v }; upd({ executiveTraining: a });
                  }} placeholder="Advanced Leadership Programme" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Institution" value={t.institution} onChange={v => {
                      const a = [...(data.executiveTraining || [])]; a[i] = { ...a[i], institution: v }; upd({ executiveTraining: a });
                    }} placeholder="Harvard Business School" />
                    <Field label="Year" value={t.year} onChange={v => {
                      const a = [...(data.executiveTraining || [])]; a[i] = { ...a[i], year: v }; upd({ executiveTraining: a });
                    }} placeholder="2022" />
                  </div>
                </ItemCard>
              ))}
              <button onClick={() => upd({ executiveTraining: [...(data.executiveTraining || []), { name: "", institution: "", year: "" }] })}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Add Training
              </button>
            </div>
          </Section>
        )}

        {/* ── Publications ── */}
        {category === "executive" && (
          <Section icon={BookOpen} title="Publications" count={data.publications?.length ?? 0} defaultOpen={false}>
            <div className="space-y-4">
              {(data.publications || []).map((p, i) => (
                <ItemCard key={i} onDelete={() => {
                  const a = [...(data.publications || [])]; a.splice(i, 1); upd({ publications: a });
                }}>
                  <Field label="Title" value={p.title} onChange={v => {
                    const a = [...(data.publications || [])]; a[i] = { ...a[i], title: v }; upd({ publications: a });
                  }} placeholder="Strategic Leadership in Africa" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Publisher / Journal" value={p.publisher} onChange={v => {
                      const a = [...(data.publications || [])]; a[i] = { ...a[i], publisher: v }; upd({ publications: a });
                    }} placeholder="Harvard Business Review" />
                    <Field label="Year" value={p.year} onChange={v => {
                      const a = [...(data.publications || [])]; a[i] = { ...a[i], year: v }; upd({ publications: a });
                    }} placeholder="2023" />
                  </div>
                  <Field label="Type (optional)" value={p.type || ""} onChange={v => {
                    const a = [...(data.publications || [])]; a[i] = { ...a[i], type: v }; upd({ publications: a });
                  }} placeholder="Journal Article" />
                </ItemCard>
              ))}
              <button onClick={() => upd({ publications: [...(data.publications || []), { title: "", publisher: "", year: "" }] })}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
                <Plus className="h-3.5 w-3.5" /> Add Publication
              </button>
            </div>
          </Section>
        )}

        {/* ── References ── */}
        <Section icon={Globe} title="References" count={data.references?.length ?? 0} defaultOpen={false}>
          <div className="space-y-4">
            {(data.references || []).map((r, i) => (
              <ItemCard key={i} onDelete={() => {
                const a = [...(data.references || [])]; a.splice(i, 1); upd({ references: a });
              }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name" value={r.name} onChange={v => {
                    const a = [...(data.references || [])]; a[i] = { ...a[i], name: v }; upd({ references: a });
                  }} placeholder="John Smith" />
                  <Field label="Job Title" value={r.title} onChange={v => {
                    const a = [...(data.references || [])]; a[i] = { ...a[i], title: v }; upd({ references: a });
                  }} placeholder="Head of Finance" />
                </div>
                <Field label="Company" value={r.company} onChange={v => {
                  const a = [...(data.references || [])]; a[i] = { ...a[i], company: v }; upd({ references: a });
                }} placeholder="Acme Corp" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" value={r.phone || ""} onChange={v => {
                    const a = [...(data.references || [])]; a[i] = { ...a[i], phone: v }; upd({ references: a });
                  }} placeholder="+254 700 000 000" />
                  <Field label="Email" value={r.email || ""} onChange={v => {
                    const a = [...(data.references || [])]; a[i] = { ...a[i], email: v }; upd({ references: a });
                  }} placeholder="john@acme.com" />
                </div>
              </ItemCard>
            ))}
            <button onClick={() => upd({ references: [...(data.references || []), { name: "", title: "", company: "" }] })}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors w-full justify-center py-2 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50">
              <Plus className="h-3.5 w-3.5" /> Add Reference
            </button>
          </div>
        </Section>

        {/* ── Declaration ── */}
        {data.declaration !== undefined && (
          <Section icon={ClipboardList} title="Declaration" defaultOpen={false}>
            <Field label="Declaration Text" value={data.declaration?.declaration || ""} onChange={v =>
              upd({ declaration: { ...(data.declaration || { declaration: "" }), declaration: v } })
            } multiline placeholder="I hereby declare that the information provided…" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Place" value={data.declaration?.place || ""} onChange={v =>
                upd({ declaration: { ...(data.declaration || { declaration: "" }), place: v } })
              } placeholder="Nairobi" />
              <Field label="Date" value={data.declaration?.date || ""} onChange={v =>
                upd({ declaration: { ...(data.declaration || { declaration: "" }), date: v } })
              } placeholder="April 2025" />
            </div>
          </Section>
        )}

      </div>
    </div>
  );
}
