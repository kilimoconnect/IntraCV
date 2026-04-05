"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { downloadCvAsPdf } from "@/lib/print-pdf";
import {
  Loader2, FileText, Trash2, Copy, File, Download, Eye, EyeOff,
} from "lucide-react";
import { ConfigRenderer, TwoPageConfigRenderer, ONE_PAGE_TEMPLATES, TWO_PAGE_TEMPLATES } from "@/components/cv-templates";
import type { CVTemplateData } from "@/components/cv-templates";
import { CVEngine } from "@/components/cv-engine";
import type { LayoutType } from "@/components/cv-engine";
import CVLayoutJunior from "./cv-layout-junior";
import CVLayoutMidSenior from "./cv-layout-mid-senior";
import CVLayoutExecutive from "./cv-layout-executive";
import type { CareerCategory, CategoryCVData, LayoutVariant, ThemeName } from "./cv-layout-types";

interface DocumentsProps {
  userId: string;
}

interface ParsedCV {
  data: CVTemplateData;
  // New engine format
  engineStyleId?: string;
  engineLayoutType?: LayoutType;
  // Old template format
  configId?: string;
  templateType: string;
  // Studio format
  studioData?: CategoryCVData;
  studioCategory?: CareerCategory;
  studioVariant?: LayoutVariant;
  studioTheme?: ThemeName;
}

// Parse saved CV JSON content — handles old engine, template, and new studio formats
function parseCvContent(raw: string): ParsedCV | null {
  try {
    const parsed = JSON.parse(raw);
    // Studio format (saved from CV Studio payment flow)
    if (parsed.studioData && parsed.studioCategory) {
      return {
        data: {} as CVTemplateData,
        templateType: "studio",
        studioData: parsed.studioData as CategoryCVData,
        studioCategory: parsed.studioCategory as CareerCategory,
        studioVariant: (parsed.studioVariant || "A") as LayoutVariant,
        studioTheme: (parsed.studioTheme || "corporate") as ThemeName,
      };
    }
    // New engine format
    if (parsed.data && parsed.engineStyleId) {
      return {
        data: parsed.data,
        engineStyleId: parsed.engineStyleId,
        engineLayoutType: parsed.engineLayoutType || "sidebar-left",
        templateType: parsed.templateType || "one-page",
      };
    }
    // Old template format
    if (parsed.data && parsed.templateConfigId) {
      return { data: parsed.data, configId: parsed.templateConfigId, templateType: parsed.templateType || "one-page" };
    }
    // Legacy format: content IS the CVTemplateData directly
    if (parsed.personalInfo) {
      return { data: parsed as CVTemplateData, configId: ONE_PAGE_TEMPLATES[0].id, templateType: "one-page" };
    }
  } catch { /* not JSON */ }
  return null;
}

export default function Documents({ userId }: DocumentsProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("generated_documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const deleteDoc = async (id: string) => {
    const { error } = await supabase.from("generated_documents").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted");
    }
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadCvPDF = async (doc: any) => {
    const cv = parseCvContent(doc.content);
    if (!cv) { toast.error("Could not parse CV data"); return; }

    setExpandedId(doc.id);
    setDownloadingId(doc.id);

    // Wait for the preview to render
    await new Promise((r) => setTimeout(r, 800));

    try {
      const container = document.getElementById(`cv-preview-${doc.id}`);
      if (!container) { toast.error("Preview not ready — please expand the document first"); return; }

      const fullName = cv.studioData?.fullName || cv.data?.personalInfo?.fullName || "CV";
      const filename = `${fullName.replace(/\s+/g, "_")}_CV`;
      await downloadCvAsPdf(container, filename);
    } catch (err: any) {
      console.error(err);
      toast.error("PDF export failed");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center px-8">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-emerald-200">
          <File className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No Documents Yet</h3>
        <p className="text-sm text-slate-500">Generated CVs and cover letters will appear here.</p>
      </div>
    );
  }

  const coverLetters = docs.filter((d) => d.doc_type === "cover_letter");
  const cvDocs = docs.filter((d) => d.doc_type === "cv");

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: docs.length, gradient: "from-slate-700 to-slate-900" },
          { label: "CVs", value: cvDocs.length, gradient: "from-indigo-500 to-violet-600" },
          { label: "Cover Letters", value: coverLetters.length, gradient: "from-emerald-500 to-teal-600" },
        ].map(({ label, value, gradient }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
            <div className={`text-2xl font-extrabold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {docs.map((doc) => {
          const cv = doc.doc_type === "cv" ? parseCvContent(doc.content) : null;
          const isEngineCV = cv?.engineStyleId != null;
          const allTemplates = [...ONE_PAGE_TEMPLATES, ...TWO_PAGE_TEMPLATES];
          const config = cv?.configId ? allTemplates.find((t) => t.id === cv.configId) || ONE_PAGE_TEMPLATES[0] : null;
          const isExpanded = expandedId === doc.id;

          return (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${doc.doc_type === "cv" ? "bg-indigo-100" : "bg-emerald-100"}`}>
                        <FileText className={`h-3.5 w-3.5 ${doc.doc_type === "cv" ? "text-indigo-600" : "text-emerald-600"}`} />
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800 truncate">{doc.title}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${doc.doc_type === "cv" ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                        {doc.doc_type === "cover_letter" ? "Cover Letter" : "CV"}
                      </span>
                      {cv && cv.templateType === "studio" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-violet-50 text-violet-700 border border-violet-200">CV Studio · {cv.studioCategory}</span>
                      )}
                      {cv && isEngineCV && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-600 border border-slate-200">{cv.engineStyleId}</span>
                      )}
                      {cv && config && !isEngineCV && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-600 border border-slate-200">{config.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {new Date(doc.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : doc.id)} className="rounded-xl text-slate-600 hover:bg-slate-100 text-xs gap-1.5">
                      {isExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {isExpanded ? "Hide" : "View"}
                    </Button>
                    {doc.doc_type === "cv" && cv && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCvPDF(doc)}
                        disabled={downloadingId === doc.id}
                        className={`rounded-xl text-xs gap-1.5 ${downloadingId === doc.id ? "min-w-[140px] text-slate-600 hover:bg-slate-100" : "text-slate-600 hover:bg-slate-100"}`}
                      >
                        {downloadingId === doc.id ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing PDF…</>
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                    {doc.doc_type === "cover_letter" && doc.content && (
                      <Button variant="ghost" size="sm" onClick={() => copyContent(doc.content)} className="rounded-xl text-slate-600 hover:bg-slate-100">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteDoc(doc.id)} className="rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4">
                    {doc.doc_type === "cv" && cv && cv.templateType === "studio" && cv.studioData ? (
                      <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 overflow-x-auto">
                        <div id={`cv-preview-${doc.id}`} style={{ width: "794px", margin: "0 auto" }}>
                          {cv.studioCategory === "junior" && <CVLayoutJunior data={cv.studioData} theme={cv.studioTheme!} variant={cv.studioVariant!} />}
                          {cv.studioCategory === "mid-senior" && <CVLayoutMidSenior data={cv.studioData} theme={cv.studioTheme!} variant={cv.studioVariant!} />}
                          {cv.studioCategory === "executive" && <CVLayoutExecutive data={cv.studioData} theme={cv.studioTheme!} variant={cv.studioVariant!} />}
                        </div>
                      </div>
                    ) : doc.doc_type === "cv" && cv && isEngineCV ? (
                      <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 overflow-x-auto">
                        <div id={`cv-preview-${doc.id}`} style={{ width: "794px", margin: "0 auto" }}>
                          <CVEngine
                            data={cv.data}
                            styleId={cv.engineStyleId!}
                            layoutType={cv.engineLayoutType!}
                            targetPages={cv.templateType === "one-page" ? 1 : cv.templateType === "two-page" ? 2 : 3}
                          />
                        </div>
                      </div>
                    ) : doc.doc_type === "cv" && cv && config ? (
                      <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 overflow-x-auto">
                        <div id={`cv-preview-${doc.id}`} style={{ width: "794px", margin: "0 auto" }}>
                          {config.category === "two-page" ? (
                            <TwoPageConfigRenderer data={cv.data} config={config} />
                          ) : (
                            <ConfigRenderer data={cv.data} config={config} />
                          )}
                        </div>
                      </div>
                    ) : doc.content ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm whitespace-pre-line leading-relaxed text-slate-700">
                        {doc.content}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No content available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
