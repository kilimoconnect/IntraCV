"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Trash2, Loader2, Briefcase, ExternalLink, Calendar,
} from "lucide-react";

interface InterviewPrepProps {
  userId: string;
}

const STATUS_OPTIONS = [
  { value: "wishlist", label: "Wishlist", color: "bg-slate-100 text-slate-700" },
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { value: "interview", label: "Interview", color: "bg-yellow-100 text-yellow-700" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-700" },
  { value: "accepted", label: "Accepted", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
];

export default function InterviewPrep({ userId }: InterviewPrepProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [form, setForm] = useState({
    company: "", position: "", location: "", job_url: "",
    salary_range: "", status: "wishlist", applied_date: "", notes: "",
  });

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const saveJob = async () => {
    if (!form.company || !form.position) {
      toast.error("Company and position are required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("job_applications").insert({
        user_id: userId,
        ...form,
        applied_date: form.applied_date || null,
      });
      if (error) throw error;
      toast.success("Job application saved!");
      setForm({ company: "", position: "", location: "", job_url: "", salary_range: "", status: "wishlist", applied_date: "", notes: "" });
      setShowForm(false);
      loadJobs();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status } : j));
    }
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Deleted");
    }
  };

  const filtered = filterStatus === "all" ? jobs : jobs.filter((j) => j.status === filterStatus);

  const statusCounts = jobs.reduce((acc: Record<string, number>, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
            className={`rounded-lg px-3 py-2 text-center text-xs font-medium transition-all ${
              filterStatus === s.value ? "ring-2 ring-primary " + s.color : s.color + " opacity-70 hover:opacity-100"
            }`}
          >
            <div className="text-lg font-bold">{statusCounts[s.value] || 0}</div>
            {s.label}
          </button>
        ))}
      </div>

      {/* Add Job Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {filterStatus === "all" ? "All Applications" : STATUS_OPTIONS.find((s) => s.value === filterStatus)?.label}
          <span className="text-muted-foreground font-normal ml-2">({filtered.length})</span>
        </h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Application
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Job Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" />
              </div>
              <div className="space-y-2">
                <Label>Position *</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote / London" />
              </div>
              <div className="space-y-2">
                <Label>Job URL</Label>
                <Input value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <Input value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="e.g. $80k-$120k" />
              </div>
              <div className="space-y-2">
                <Label>Applied Date</Label>
                <Input type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any notes about this application..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveJob} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Application
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No job applications yet. Start tracking your job search!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const statusOpt = STATUS_OPTIONS.find((s) => s.value === job.status);
            return (
              <Card key={job.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{job.position}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusOpt?.color || ""}`}>
                          {statusOpt?.label}
                        </span>
                      </div>
                      <p className="text-sm text-primary">{job.company}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        {job.location && <span>{job.location}</span>}
                        {job.salary_range && <span>{job.salary_range}</span>}
                        {job.applied_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(job.applied_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {job.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{job.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {job.job_url && (
                        <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <select
                        value={job.status}
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                        className="text-xs border rounded px-1.5 py-1 bg-background"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <Button variant="ghost" size="sm" onClick={() => deleteJob(job.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
