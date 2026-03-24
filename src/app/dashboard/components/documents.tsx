"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, FileText, Trash2, Copy, File, Download, Eye, EyeOff,
} from "lucide-react";
import { ConfigRenderer, TwoPageConfigRenderer, ONE_PAGE_TEMPLATES, TWO_PAGE_TEMPLATES } from "@/components/cv-templates";
import type { CVTemplateData } from "@/components/cv-templates";
import { CVEngine } from "@/components/cv-engine";
import type { LayoutType } from "@/components/cv-engine";

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
}

// Parse saved CV JSON content — handles both old (templateConfigId) and new (engineStyleId) formats
function parseCvContent(raw: string): ParsedCV | null {
  try {
    const parsed = JSON.parse(raw);
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
    await new Promise((r) => setTimeout(r, 500));

    try {
      const { toPng } = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;

      const container = document.getElementById(`cv-preview-${doc.id}`);
      if (!container) { toast.error("Preview not ready"); return; }

      const pages = container.querySelectorAll(".cv-template > div") as NodeListOf<HTMLElement>;
      const targetEls = pages.length > 0
        ? Array.from(pages)
        : [container.querySelector(".cv-template") as HTMLElement].filter(Boolean);

      if (targetEls.length === 0) { toast.error("No CV content found"); return; }

      // A4 dimensions in mm
      const A4_W = 210;
      const A4_H = 297;
      // Template design dimensions in px
      const TPL_W = 794;
      const TPL_H = 1123;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < targetEls.length; i++) {
        if (i > 0) pdf.addPage("a4", "portrait");
        const element = targetEls[i];

        const dataUrl = await toPng(element, {
          width: TPL_W,
          height: TPL_H,
          pixelRatio: 3,
          backgroundColor: "#ffffff",
          cacheBust: true,
          skipAutoScale: true,
          filter: (node: HTMLElement) => {
            if (node.tagName === "SCRIPT") return false;
            return true;
          },
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, A4_W, A4_H, undefined, "FAST");
      }

      const name = cv.data.personalInfo?.fullName || "CV";
      pdf.save(`${name.replace(/\s+/g, "_")}_CV.pdf`);
      toast.success("PDF downloaded!");
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
      <Card>
        <CardContent className="py-16 text-center">
          <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Documents Yet</h3>
          <p className="text-sm text-muted-foreground">
            Generated CVs and cover letters will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const coverLetters = docs.filter((d) => d.doc_type === "cover_letter");
  const cvDocs = docs.filter((d) => d.doc_type === "cv");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex gap-4">
        <div className="border rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold">{docs.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="border rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold">{cvDocs.length}</div>
          <div className="text-xs text-muted-foreground">CVs</div>
        </div>
        <div className="border rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold">{coverLetters.length}</div>
          <div className="text-xs text-muted-foreground">Cover Letters</div>
        </div>
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
                    <Button variant="ghost" size="sm" onClick={() => deleteDoc(doc.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4">
                    {doc.doc_type === "cv" && cv && isEngineCV ? (
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
    </div>
  );
}
