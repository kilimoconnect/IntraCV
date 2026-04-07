"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { downloadCvAsPdf } from "@/lib/print-pdf";
import {
  Loader2, FileText, Trash2, Copy, File, Download, Eye, EyeOff, RefreshCw,
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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
    setDeleteConfirmId(null);
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadCvPDF = async (doc: any) => {
    // If a stored PDF URL exists, download it directly
    if (doc.pdf_url) {
      const a = document.createElement("a");
      a.href = doc.pdf_url;
      a.download = `${doc.title || "CV"}.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

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
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200/60 flex items-center justify-center mb-6 shadow-elevated">
          <File className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Documents Yet</h3>
        <p className="text-sm text-slate-500 max-w-xs text-center">
          Generated CVs and cover letters will appear here once you create them in CV Studio.
        </p>
      </div>
    );
  }

  const coverLetters = docs.filter((d) => d.doc_type === "cover_letter");
  const cvDocs = docs.filter((d) => d.doc_type === "cv");

  return (
    <div className="space-y-6">
      {/* Summary + Refresh */}
      <div className="flex items-center justify-between gap-4 animate-fade-in-up">
      <div className="flex gap-3">
        <div className="stat-card rounded-2xl px-5 py-3 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-slate-800">{docs.length}</div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Total</div>
        </div>
        <div className="stat-card rounded-2xl px-5 py-3 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-indigo-600">{cvDocs.length}</div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">CVs</div>
        </div>
        <div className="stat-card rounded-2xl px-5 py-3 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-violet-600">{coverLetters.length}</div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Letters</div>
        </div>
      </div>
        <Button variant="outline" size="sm" onClick={loadDocs} disabled={loading} className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Document List */}
      <div className="space-y-3 stagger-children">
        {docs.map((doc) => {
          const cv = doc.doc_type === "cv" ? parseCvContent(doc.content) : null;
          const isEngineCV = cv?.engineStyleId != null;
          const allTemplates = [...ONE_PAGE_TEMPLATES, ...TWO_PAGE_TEMPLATES];
          const config = cv?.configId ? allTemplates.find((t) => t.id === cv.configId) || ONE_PAGE_TEMPLATES[0] : null;
          const isExpanded = expandedId === doc.id;

          return (
            <Card key={doc.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                      <Badge variant={doc.doc_type === "cv" ? "default" : "secondary"} className="text-xs shrink-0">
                        {doc.doc_type === "cover_letter" ? "Cover Letter" : "CV"}
                      </Badge>
                      {doc.doc_type === "cv" && (
                        doc.pdf_url
                          ? <Badge variant="outline" className="text-[10px] shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200">PDF ready</Badge>
                          : <Badge variant="outline" className="text-[10px] shrink-0 bg-amber-50 text-amber-700 border-amber-200">PDF processing…</Badge>
                      )}
                      {cv && cv.templateType === "studio" && (
                        <Badge variant="outline" className="text-[10px] shrink-0 bg-indigo-50 text-indigo-700 border-indigo-200">CV Studio · {cv.studioCategory}</Badge>
                      )}
                    {cv && isEngineCV && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{cv.engineStyleId} · {cv.engineLayoutType}</Badge>
                      )}
                      {cv && config && !isEngineCV && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{config.name}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date(doc.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : doc.id)}>
                      {isExpanded ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {isExpanded ? "Hide" : "View"}
                    </Button>
                    {doc.doc_type === "cv" && cv && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCvPDF(doc)}
                        disabled={downloadingId === doc.id}
                        className={downloadingId === doc.id ? "min-w-[140px]" : ""}
                      >
                        {downloadingId === doc.id ? (
                          <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Preparing PDF…</>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {doc.doc_type === "cover_letter" && doc.content && (
                      <Button variant="ghost" size="sm" onClick={() => copyContent(doc.content)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(doc.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4">
                    {doc.pdf_url ? (
                      /* ── Stored PDF viewer ── */
                      <div className="border rounded-xl overflow-hidden bg-slate-50">
                        <iframe
                          src={doc.pdf_url}
                          title={doc.title}
                          className="w-full"
                          style={{ height: "80vh", border: "none" }}
                        />
                      </div>
                    ) : doc.doc_type === "cv" && cv && cv.templateType === "studio" && cv.studioData ? (
                      <div className="border rounded-xl bg-slate-50 p-4 overflow-x-auto">
                        <div id={`cv-preview-${doc.id}`} style={{ width: "794px", margin: "0 auto" }}>
                          {cv.studioCategory === "junior" && <CVLayoutJunior data={cv.studioData} theme={cv.studioTheme!} variant={cv.studioVariant!} />}
                          {cv.studioCategory === "mid-senior" && <CVLayoutMidSenior data={cv.studioData} theme={cv.studioTheme!} variant={cv.studioVariant!} />}
                          {cv.studioCategory === "executive" && <CVLayoutExecutive data={cv.studioData} theme={cv.studioTheme!} variant={cv.studioVariant!} />}
                        </div>
                      </div>
                    ) : doc.doc_type === "cv" && cv && isEngineCV ? (
                      <div className="border rounded-xl bg-slate-50 p-4 overflow-x-auto">
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
                      <div className="border rounded-xl bg-slate-50 p-4 overflow-x-auto">
                        <div id={`cv-preview-${doc.id}`} style={{ width: "794px", margin: "0 auto" }}>
                          {config.category === "two-page" ? (
                            <TwoPageConfigRenderer data={cv.data} config={config} />
                          ) : (
                            <ConfigRenderer data={cv.data} config={config} />
                          )}
                        </div>
                      </div>
                    ) : doc.content ? (
                      <div className="bg-slate-50 border rounded-lg p-4 text-sm whitespace-pre-line leading-relaxed">
                        {doc.content}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No content available.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-elevated-lg w-full max-w-sm p-7 animate-fade-in-up">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Delete Document?</h3>
              <p className="text-sm text-slate-500">
                This action cannot be undone. The document will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteDoc(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
