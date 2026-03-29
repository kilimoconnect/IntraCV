"use client";
import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Sparkles, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import type { CategoryCVData } from "./cv-layout-types";

interface AdjustPanelProps { data: CategoryCVData; onChange: (u: CategoryCVData) => void; overflowSections: Set<string>; }

async function aiCondense(st: string, content: unknown, mc?: number, cnt?: number): Promise<unknown> {
  const res = await fetch("/api/ai/condense-section", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionType: st, content, maxChars: mc, count: cnt }) });
  if (!res.ok) throw new Error("AI condense failed");
  return (await res.json()).result;
}

function Acc({ title, warn, children, aiBtn, busy }: { title: string; warn: boolean; children: React.ReactNode; aiBtn?: () => void; busy?: boolean }) {
  const [open, setOpen] = useState(warn);
  return (<div className={`border rounded-lg overflow-hidden ${warn ? "border-amber-300 bg-amber-50/50" : "border-slate-200"}`}>
    <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50/50">
      <div className="flex items-center gap-2 min-w-0">
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
        <span className="text-sm font-semibold text-slate-700 truncate">{title}</span>
        {warn && <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0"><AlertTriangle className="h-3 w-3" />Overflow</span>}
      </div>
      {aiBtn && <span role="button" onClick={e => { e.stopPropagation(); aiBtn(); }} className={`flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md shrink-0 ${busy ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>{busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}AI Fix</span>}
    </button>
    {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
  </div>);
}

export default function CvAdjustPanel({ data, onChange, overflowSections }: AdjustPanelProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const patch = useCallback((p: Partial<CategoryCVData>) => onChange({ ...data, ...p }), [data, onChange]);

  const updateExp = useCallback((idx: number, field: string, value: unknown) => {
    const exps = [...(data.experience || [])]; exps[idx] = { ...exps[idx], [field]: value }; patch({ experience: exps });
  }, [data.experience, patch]);

  const rmExpBullet = useCallback((ei: number, bi: number) => {
    const exps = [...(data.experience || [])]; const b = [...(exps[ei].bullets || [])]; b.splice(bi, 1); exps[ei] = { ...exps[ei], bullets: b }; patch({ experience: exps });
  }, [data.experience, patch]);

  const rmItem = useCallback((key: keyof CategoryCVData, idx: number) => {
    const arr = [...((data[key] as unknown[]) || [])]; arr.splice(idx, 1); patch({ [key]: arr } as Partial<CategoryCVData>);
  }, [data, patch]);

  const aiProfile = useCallback(async () => {
    if (!data.profile) return; setBusy("profile");
    try { const r = await aiCondense("profile", data.profile, 280); if (typeof r === "string") patch({ profile: r }); } catch {}
    setBusy(null);
  }, [data.profile, patch]);

  const aiBullets = useCallback(async (i: number) => {
    const exp = data.experience?.[i]; if (!exp?.bullets?.length) return; setBusy(`exp-${i}`);
    try { const r = await aiCondense("bullets", exp.bullets, 110, Math.max(2, exp.bullets.length - 1)); if (Array.isArray(r)) updateExp(i, "bullets", r); } catch {}
    setBusy(null);
  }, [data.experience, updateExp]);

  const aiAchievements = useCallback(async () => {
    if (!data.achievements?.length) return; setBusy("achievements");
    try { const r = await aiCondense("achievements", data.achievements, 110, Math.max(2, data.achievements.length - 1)); if (Array.isArray(r)) patch({ achievements: r }); } catch {}
    setBusy(null);
  }, [data.achievements, patch]);

  const aiSkills = useCallback(async () => {
    if (!data.skills?.length) return; setBusy("skills");
    try { const r = await aiCondense("skills", data.skills, 18, Math.max(6, data.skills.length - 3)); if (Array.isArray(r)) patch({ skills: r }); } catch {}
    setBusy(null);
  }, [data.skills, patch]);

  const hasOF = overflowSections.size > 0;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 pb-2 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Adjust Content</h3>
        <p className="text-xs text-slate-500 mt-1">{hasOF ? "Some sections overflow. Edit or use AI Fix to shorten." : "Fine-tune your CV content. Changes update live."}</p>
      </div>

      {hasOF && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-700">Content Overflow Detected</div>
            <div className="text-xs text-amber-600 mt-0.5">{overflowSections.size} section{overflowSections.size > 1 ? "s" : ""} may be clipped.</div>
          </div>
        </div>
      )}

      {/* Profile */}
      {data.profile && (
        <Acc title="Professional Summary" warn={overflowSections.has("profile")} aiBtn={aiProfile} busy={busy === "profile"}>
          <textarea className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-300 leading-relaxed" value={data.profile} onChange={e => patch({ profile: e.target.value })} rows={5} />
          <div className="text-xs text-slate-400 text-right">{data.profile.length} chars</div>
        </Acc>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <Acc title={`Experience (${data.experience.length} roles)`} warn={overflowSections.has("experience")}>
          <div className="space-y-3">
            {data.experience.map((exp, i) => (
              <div key={i} className="border border-slate-100 rounded-md p-2 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <input className="text-sm font-semibold text-slate-700 bg-transparent focus:outline-none flex-1 min-w-0" value={exp.role} onChange={e => updateExp(i, "role", e.target.value)} />
                  <div className="flex items-center gap-1 shrink-0">
                    <span role="button" onClick={() => aiBullets(i)} className={`flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded ${busy === `exp-${i}` ? "opacity-50" : "cursor-pointer hover:bg-indigo-100"}`}>{busy === `exp-${i}` ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}Fix</span>
                    <button onClick={() => rmItem("experience", i)} className="text-red-400 hover:text-red-600 p-0.5"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="flex gap-1 mb-1">
                  <input className="text-sm text-slate-500 bg-transparent focus:outline-none flex-1 min-w-0" value={exp.company} onChange={e => updateExp(i, "company", e.target.value)} placeholder="Company" />
                  <input className="text-sm text-slate-400 bg-transparent focus:outline-none w-[100px] text-right shrink-0" value={exp.dates} onChange={e => updateExp(i, "dates", e.target.value)} placeholder="Dates" />
                </div>
                <div className="space-y-1">
                  {exp.bullets?.map((b, bi) => (
                    <div key={bi} className="flex items-start gap-1 group">
                      <span className="text-xs text-slate-400 mt-0.5 shrink-0">{"\u2022"}</span>
                      <input className="text-sm text-slate-600 bg-transparent focus:outline-none flex-1 min-w-0" value={b} onChange={e => { const bs = [...(exp.bullets || [])]; bs[bi] = e.target.value; updateExp(i, "bullets", bs); }} />
                      <button onClick={() => rmExpBullet(i, bi)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Acc>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <Acc title={`Skills (${data.skills.length})`} warn={overflowSections.has("skills")} aiBtn={aiSkills} busy={busy === "skills"}>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm bg-slate-100 border border-slate-200 px-3 py-1 rounded-full group">{s}
                <button onClick={() => rmItem("skills", i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
        </Acc>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <Acc title={`Achievements (${data.achievements.length})`} warn={overflowSections.has("achievements")} aiBtn={aiAchievements} busy={busy === "achievements"}>
          <div className="space-y-1">
            {data.achievements.map((a, i) => (
              <div key={i} className="flex items-start gap-1 group">
                <span className="text-xs text-indigo-400 mt-0.5 shrink-0">{"\u2605"}</span>
                <input className="text-sm text-slate-600 bg-transparent focus:outline-none flex-1 min-w-0" value={a} onChange={e => { const achs = [...(data.achievements || [])]; achs[i] = e.target.value; patch({ achievements: achs }); }} />
                <button onClick={() => rmItem("achievements", i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
              </div>
            ))}
          </div>
        </Acc>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <Acc title={`Education (${data.education.length})`} warn={overflowSections.has("education")}>
          {data.education.map((edu, i) => (
            <div key={i} className="flex items-center gap-1 group">
              <div className="flex-1 min-w-0">
                <input className="text-sm font-semibold text-slate-700 bg-transparent focus:outline-none w-full" value={edu.degree} onChange={e => { const a = [...data.education]; a[i] = { ...a[i], degree: e.target.value }; patch({ education: a }); }} />
                <input className="text-sm text-slate-500 bg-transparent focus:outline-none w-full" value={`${edu.school} - ${edu.year}`} onChange={e => { const a = [...data.education]; a[i] = { ...a[i], school: e.target.value }; patch({ education: a }); }} />
              </div>
              <button onClick={() => rmItem("education", i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </Acc>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <Acc title={`Certifications (${data.certifications.length})`} warn={overflowSections.has("certifications")}>
          {data.certifications.map((c, i) => (
            <div key={i} className="flex items-center gap-1 group">
              <span className="text-sm text-slate-600 flex-1 truncate">{c.name} - {c.issuer}</span>
              <button onClick={() => rmItem("certifications", i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </Acc>
      )}

      {/* References */}
      {data.references?.length > 0 && (
        <Acc title={`References (${data.references.length})`} warn={overflowSections.has("references")}>
          {data.references.map((r, i) => (
            <div key={i} className="flex items-center gap-1 group">
              <span className="text-sm text-slate-600 flex-1 truncate">{r.name} - {r.title}</span>
              <button onClick={() => rmItem("references", i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </Acc>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <Acc title={`Languages (${data.languages.length})`} warn={overflowSections.has("languages")}>
          {data.languages.map((l, i) => (
            <div key={i} className="flex items-center gap-2 group text-sm">
              <span className="text-slate-600 font-medium">{l.name}</span>
              <span className="text-slate-400 flex-1">{l.label}</span>
              <button onClick={() => rmItem("languages", i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </Acc>
      )}
    </div>
  );
}
