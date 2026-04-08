"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, Sparkles, ChevronDown, ChevronUp, Star,
  Mic, MicOff, Volume2, VolumeX, Plus, CheckCircle2,
  BriefcaseBusiness, Clock, PlusCircle, Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  loadFlutterwaveScript, openFlutterwaveCheckout, generateTxRef,
  DOWNLOAD_AMOUNT, DOWNLOAD_CURRENCY,
} from "@/lib/flutterwave";

const FREE_QUOTA = 5;
const PAID_BATCH = 20;

interface UsageState {
  generated: number;
  paidQuota: number;
  totalAllowed: number;
  remaining: number;
}

interface InterviewPrepProps {
  userId: string;
  cvData?: any;
}

interface InterviewQuestion {
  id: number;
  question: string;
  type: string;
  tips: string;
}

interface AnswerFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
  overallFeedback: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  job_role: string;
  company: string;
  job_description: string;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  feedbacks: Record<string, AnswerFeedback>;
  created_at: string;
  updated_at: string;
}

const QUESTION_TYPE_COLORS: Record<string, string> = {
  behavioral:    "bg-purple-100 text-purple-700 border border-purple-200",
  technical:     "bg-blue-100 text-blue-700 border border-blue-200",
  situational:   "bg-amber-100 text-amber-700 border border-amber-200",
  competency:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "culture-fit": "bg-pink-100 text-pink-700 border border-pink-200",
};

// ─── Build a concise profile summary for AI context ───
function buildProfileContext(cv: any): string {
  const lines: string[] = [];
  const pi = cv.personalInfo;
  if (pi?.headline) lines.push(`Headline: ${pi.headline}`);
  if (cv.summary) lines.push(`Summary: ${cv.summary.slice(0, 400)}`);
  const exps = (cv.experiences || []).slice(0, 4);
  if (exps.length) {
    lines.push("Experience:");
    exps.forEach((e: any) => {
      const title = e.title || e.jobTitle || "";
      const co = e.company || e.employer || "";
      const dates = [e.startDate, e.endDate].filter(Boolean).join("–");
      lines.push(`  - ${title}${co ? ` at ${co}` : ""}${dates ? ` (${dates})` : ""}`);
    });
  }
  const skills = (cv.skills || []).map((s: any) => s.name || s).filter(Boolean).slice(0, 15);
  if (skills.length) lines.push(`Skills: ${skills.join(", ")}`);
  const certs = (cv.certifications || []).map((c: any) => c.name || c).filter(Boolean).slice(0, 5);
  if (certs.length) lines.push(`Certifications: ${certs.join(", ")}`);
  return lines.join("\n");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function avgScore(feedbacks: Record<string, AnswerFeedback>): number | null {
  const vals = Object.values(feedbacks).map((f) => f.score).filter(Boolean);
  if (!vals.length) return null;
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

// ─── Speech helpers ───
function speakText(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95; u.pitch = 1;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}
function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

export default function InterviewPrep({ userId, cvData }: InterviewPrepProps) {
  // Sessions list
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Active session form
  const [simRole, setSimRole] = useState("");
  const [simCompany, setSimCompany] = useState("");
  const [simJobDescription, setSimJobDescription] = useState("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [addingMore, setAddingMore] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, AnswerFeedback>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<number, boolean>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Usage / payment state
  const [usage, setUsage] = useState<UsageState>({ generated: 0, paidQuota: 0, totalAllowed: FREE_QUOTA, remaining: FREE_QUOTA });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState<"generate" | "add" | null>(null);

  // Delete confirm state
  const [confirmDeleteSession, setConfirmDeleteSession] = useState<SessionRow | null>(null);
  const [confirmDeleteQuestion, setConfirmDeleteQuestion] = useState<InterviewQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speech
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [listeningId, setListeningId] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // ─── Load all sessions + usage on mount ───
  useEffect(() => {
    if (!userId) { setLoadingSessions(false); return; }
    const supabase = createClient();

    // Load sessions
    supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Sessions load error:", error);
        const rows = (data || []) as SessionRow[];
        setSessions(rows);
        if (rows.length > 0) applySession(rows[0]);
        setLoadingSessions(false);
      });

    // Load usage
    supabase
      .from("profiles")
      .select("interview_questions_generated, interview_questions_paid_quota")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          const generated = data.interview_questions_generated ?? 0;
          const paidQuota = data.interview_questions_paid_quota ?? 0;
          const totalAllowed = FREE_QUOTA + paidQuota;
          setUsage({ generated, paidQuota, totalAllowed, remaining: Math.max(0, totalAllowed - generated) });
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ─── Apply a session row to active state ───
  function applySession(s: SessionRow) {
    setCurrentSessionId(s.id);
    setSimRole(s.job_role || "");
    setSimCompany(s.company || "");
    setSimJobDescription(s.job_description || "");

    const qs: InterviewQuestion[] = s.questions || [];
    setQuestions(qs);

    const a: Record<number, string> = {};
    for (const [k, v] of Object.entries(s.answers || {})) a[parseInt(k)] = v as string;
    setAnswers(a);

    const f: Record<number, AnswerFeedback> = {};
    for (const [k, v] of Object.entries(s.feedbacks || {})) f[parseInt(k)] = v as AnswerFeedback;
    setFeedbacks(f);

    setExpandedQuestion(qs.length > 0 ? qs[0].id : null);
    setLastSaved(s.updated_at ? new Date(s.updated_at) : null);
    setLoadingFeedback({});
  }

  // ─── Switch session ───
  function switchSession(s: SessionRow) {
    stopSpeaking();
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    setListeningId(null);
    setSpeakingId(null);
    applySession(s);
  }

  // ─── New Session (blank form, no session selected) ───
  function startNewSession() {
    stopSpeaking();
    setCurrentSessionId(null);
    setSimRole(""); setSimCompany(""); setSimJobDescription("");
    setQuestions([]); setAnswers({}); setFeedbacks({});
    setExpandedQuestion(null); setLastSaved(null);
  }

  // ─── Save / update current session ───
  const saveSession = useCallback(async (patch: Partial<Omit<SessionRow, "id" | "user_id">>, sessionId: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("interview_sessions")
        .update(patch)
        .eq("id", sessionId)
        .eq("user_id", userId);
      if (error) throw error;
      const now = new Date();
      setLastSaved(now);
      // Update local sessions list
      setSessions((prev) => prev.map((s) =>
        s.id === sessionId ? { ...s, ...patch, updated_at: now.toISOString() } : s
      ));
    } catch (err: any) {
      console.error("Session save error:", err);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  // Debounced answer auto-save
  const scheduleAnswerSave = useCallback((updatedAnswers: Record<number, string>, sessionId: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveSession({ answers: updatedAnswers as any }, sessionId);
    }, 1500);
  }, [saveSession]);

  // ─── Generate Questions ───
  // Core generate — accepts optional pre-verified usage to skip re-check
  const generateQuestionsCore = async (currentUsage?: UsageState) => {
    const u = currentUsage ?? usage;
    if (u.remaining <= 0) {
      setPendingGenerate("generate");
      setShowPaymentModal(true);
      return;
    }
    setGeneratingQuestions(true);
    setQuestions([]); setAnswers({}); setFeedbacks({});
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: simRole, company: simCompany,
          jobDescription: simJobDescription || undefined,
          action: "generate",
          profileContext: cvData ? buildProfileContext(cvData) : undefined,
        }),
      });
      const json = await res.json();
      if (res.status === 402 || json.error === "quota_exceeded") {
        setPendingGenerate("generate");
        setShowPaymentModal(true);
        return;
      }
      if (!res.ok) throw new Error(json.error);
      const qs: InterviewQuestion[] = json.questions || [];
      setQuestions(qs);
      setExpandedQuestion(qs[0]?.id ?? null);
      if (json.usage) setUsage(json.usage);

      // INSERT a new session row
      const supabase = createClient();
      const { data: newRow, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: userId,
          job_role: simRole,
          company: simCompany,
          job_description: simJobDescription,
          questions: qs,
          answers: {},
          feedbacks: {},
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSessionId(newRow.id);
      setLastSaved(new Date());
      setSessions((prev) => [newRow as SessionRow, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const generateQuestions = () => generateQuestionsCore();

  // ─── Delete Session ───
  const deleteSession = async (session: SessionRow) => {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("interview_sessions")
        .delete()
        .eq("id", session.id)
        .eq("user_id", userId);
      if (error) throw error;
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
      // If deleting the active session, clear the view
      if (session.id === currentSessionId) {
        const remaining = sessions.filter((s) => s.id !== session.id);
        if (remaining.length > 0) {
          applySession(remaining[0]);
        } else {
          startNewSession();
        }
      }
      toast.success("Session deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete session");
    } finally {
      setDeleting(false);
      setConfirmDeleteSession(null);
    }
  };

  // ─── Delete Question from current session ───
  const deleteQuestion = async (question: InterviewQuestion) => {
    if (!currentSessionId) return;
    setDeleting(true);
    try {
      const updatedQs = questions.filter((q) => q.id !== question.id);
      const updatedAnswers = { ...answers };
      const updatedFeedbacks = { ...feedbacks };
      delete updatedAnswers[question.id];
      delete updatedFeedbacks[question.id];
      setQuestions(updatedQs);
      setAnswers(updatedAnswers);
      setFeedbacks(updatedFeedbacks);
      if (expandedQuestion === question.id) setExpandedQuestion(updatedQs[0]?.id ?? null);
      await saveSession({ questions: updatedQs as any, answers: updatedAnswers as any, feedbacks: updatedFeedbacks as any }, currentSessionId);
      toast.success("Question removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question");
    } finally {
      setDeleting(false);
      setConfirmDeleteQuestion(null);
    }
  };

  // ─── Flutterwave payment to unlock 20 more questions ───
  const handlePayForQuestions = useCallback(async () => {
    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) { toast.error("Payment gateway not configured."); return; }

    // Need user email from cvData or profile
    const email = cvData?.personalInfo?.email || "";
    if (!email) {
      toast.error("Please add your email to your profile before paying.");
      return;
    }

    setPaymentProcessing(true);
    const txRef = generateTxRef(userId);

    try {
      await loadFlutterwaveScript();
      const flwHandler = await openFlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: txRef,
        amount: DOWNLOAD_AMOUNT,
        currency: DOWNLOAD_CURRENCY,
        payment_options: "card",
        customer: { email, name: cvData?.personalInfo?.fullName || "IntraCV User" },
        customizations: {
          title: "IntraCV — Interview Questions",
          description: `Unlock ${PAID_BATCH} more interview questions`,
        },
        callback: async (response) => {
          flwHandler.close();
          if (response.status === "successful") {
            try {
              const verifyRes = await fetch("/api/payments/interview-unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  transaction_id: response.transaction_id,
                  tx_ref: txRef,
                  expected_amount: DOWNLOAD_AMOUNT,
                  expected_currency: DOWNLOAD_CURRENCY,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.verified && verifyData.usage) {
                setUsage(verifyData.usage);
                toast.success(`Payment confirmed! You have ${verifyData.usage.remaining} questions available.`, { icon: "🎉" });
                setShowPaymentModal(false);
                // Auto-proceed with the pending generate action
                if (pendingGenerate === "generate") {
                  setPendingGenerate(null);
                  setTimeout(() => generateQuestionsCore(verifyData.usage), 100);
                } else if (pendingGenerate === "add") {
                  setPendingGenerate(null);
                  setTimeout(() => addMoreQuestionsCore(verifyData.usage), 100);
                }
              } else {
                toast.error(verifyData.message || "Payment verification failed.");
              }
            } catch {
              toast.error("Could not verify payment. Contact support.");
            }
          } else {
            toast.error("Payment was not completed.");
          }
          setPaymentProcessing(false);
        },
        onclose: () => { setPaymentProcessing(false); setShowPaymentModal(false); },
      });
    } catch {
      toast.error("Could not open payment window. Please try again.");
      setPaymentProcessing(false);
    }
  }, [userId, cvData, pendingGenerate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Add More Questions to current session ───
  const addMoreQuestionsCore = async (currentUsage?: UsageState) => {
    if (!currentSessionId) return;
    const u = currentUsage ?? usage;
    if (u.remaining <= 0) {
      setPendingGenerate("add");
      setShowPaymentModal(true);
      return;
    }
    setAddingMore(true);
    try {
      const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: simRole,
          company: simCompany,
          jobDescription: simJobDescription || undefined,
          action: "generate",
          count: 5,
          startId: nextId,
          existingQuestions: questions,
          profileContext: cvData ? buildProfileContext(cvData) : undefined,
        }),
      });
      const json = await res.json();
      if (res.status === 402 || json.error === "quota_exceeded") {
        setPendingGenerate("add");
        setShowPaymentModal(true);
        return;
      }
      if (!res.ok) throw new Error(json.error);
      const newQs: InterviewQuestion[] = json.questions || [];
      const merged = [...questions, ...newQs];
      setQuestions(merged);
      setExpandedQuestion(newQs[0]?.id ?? null);
      if (json.usage) setUsage(json.usage);
      await saveSession({ questions: merged as any }, currentSessionId);
    } catch (err: any) {
      toast.error(err.message || "Failed to add more questions");
    } finally {
      setAddingMore(false);
    }
  };

  const addMoreQuestions = () => addMoreQuestionsCore();

  // ─── Submit Answer for Feedback ───
  const submitAnswer = async (questionId: number) => {
    if (listeningId === questionId) {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      setListeningId(null);
    }
    const answer = answers[questionId];
    const question = questions.find((q) => q.id === questionId);
    if (!answer?.trim() || !question) { toast.error("Please write or speak an answer first"); return; }
    if (!currentSessionId) return;

    setLoadingFeedback((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.question, answer, action: "feedback" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const updatedFeedbacks = { ...feedbacks, [questionId]: json.feedback };
      setFeedbacks(updatedFeedbacks);
      await saveSession({ answers: answers as any, feedbacks: updatedFeedbacks as any }, currentSessionId);
    } catch (err: any) {
      toast.error(err.message || "Failed to get feedback");
    } finally {
      setLoadingFeedback((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // ─── Speech-to-Text ───
  const handleMic = useCallback((questionId: number) => {
    if (listeningId === questionId) {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      setListeningId(null);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported. Try Chrome or Edge."); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = answers[questionId] || "";
    if (finalTranscript && !finalTranscript.endsWith(" ")) finalTranscript += " ";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      const updated = { ...answers, [questionId]: finalTranscript + interim };
      setAnswers(updated);
      if (currentSessionId) scheduleAnswerSave(updated, currentSessionId);
    };
    recognition.onerror = (e: any) => {
      if (e.error !== "aborted") toast.error(`Microphone error: ${e.error}`);
      setListeningId(null);
    };
    recognition.onend = () => setListeningId(null);
    recognitionRef.current = recognition;
    recognition.start();
    setListeningId(questionId);
  }, [listeningId, answers, currentSessionId, scheduleAnswerSave]);

  const handleSpeak = useCallback((questionId: number, text: string) => {
    if (speakingId === questionId) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(questionId);
    speakText(text, () => setSpeakingId(null));
  }, [speakingId]);

  const saveLabel = saving
    ? "Saving…"
    : lastSaved
      ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : null;

  if (loadingSessions) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">

      {/* ── Sessions Sidebar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sessions</p>
          <Button
            size="sm"
            variant="outline"
            onClick={startNewSession}
            className="h-7 px-2.5 text-xs rounded-lg border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        </div>
        <div className="divide-y divide-slate-100 max-h-[calc(100vh-280px)] overflow-y-auto">
          {sessions.length === 0 && (
            <p className="px-4 py-6 text-xs text-slate-400 text-center italic">No sessions yet. Generate questions to start.</p>
          )}
          {sessions.map((s) => {
            const isActive = s.id === currentSessionId;
            const answered = Object.keys(s.feedbacks || {}).length;
            const total = (s.questions || []).length;
            const avg = avgScore(s.feedbacks || {});
            return (
              <div
                key={s.id}
                className={`group relative transition-colors ${isActive ? "bg-indigo-50" : "hover:bg-slate-50"}`}
              >
                <button
                  onClick={() => switchSession(s)}
                  className="w-full text-left px-4 py-3 pr-10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                        {s.job_role || "Untitled"}
                      </p>
                      {s.company && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{s.company}</p>
                      )}
                    </div>
                    {avg !== null && (
                      <span className={`shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-lg ${
                        avg >= 8 ? "bg-emerald-100 text-emerald-700" :
                        avg >= 5 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {avg}/10
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {total > 0 && (
                      <span className="text-[11px] text-slate-400">{answered}/{total} answered</span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5 ml-auto">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDate(s.updated_at)}
                    </span>
                  </div>
                </button>
                {/* Delete session button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteSession(s); }}
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Session ── */}
      <div className="space-y-5 min-w-0">
        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                <BriefcaseBusiness className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {currentSessionId ? (simRole || "Interview Session") : "New Session"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentSessionId
                    ? "Answer the questions below or add more to this session"
                    : "Fill in the role details and generate tailored questions"}
                </p>
              </div>
            </div>
            {saveLabel && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                {saving
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {saveLabel}
              </div>
            )}
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Job Role <span className="text-red-400">*</span></Label>
                <Input
                  value={simRole}
                  onChange={(e) => setSimRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Company <span className="text-slate-400">(optional)</span></Label>
                <Input
                  value={simCompany}
                  onChange={(e) => setSimCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Job Description <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                value={simJobDescription}
                onChange={(e) => setSimJobDescription(e.target.value)}
                rows={3}
                placeholder="Paste the job description here for targeted questions..."
                className="rounded-xl border-slate-200 text-sm resize-none"
              />
            </div>
            {!currentSessionId && (
              <Button
                onClick={generateQuestions}
                disabled={generatingQuestions}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-sm shadow-blue-200 text-white"
              >
                {generatingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Questions
              </Button>
            )}
          </div>
        </div>

        {/* ── Usage indicator ── */}
        {(() => {
          const { generated, paidQuota, remaining } = usage;
          const isOnFree = generated < FREE_QUOTA;
          const freeLeft = Math.max(0, FREE_QUOTA - generated);
          const paidLeft = paidQuota > 0 ? Math.max(0, paidQuota - Math.max(0, generated - FREE_QUOTA)) : 0;
          if (remaining > 0) {
            return (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs border ${
                isOnFree
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {isOnFree
                  ? `${freeLeft} free question${freeLeft !== 1 ? "s" : ""} remaining`
                  : `${paidLeft} paid question${paidLeft !== 1 ? "s" : ""} remaining`}
              </div>
            );
          }
          return (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>Free questions used up · Unlock <strong>{PAID_BATCH} more</strong> for {DOWNLOAD_CURRENCY} {DOWNLOAD_AMOUNT.toLocaleString()}</span>
              </div>
              <Button
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="shrink-0 h-7 px-3 text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white border-0"
              >
                Unlock
              </Button>
            </div>
          );
        })()}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{questions.length} Questions</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px] bg-slate-100 text-slate-500 border-0">
                  {Object.keys(feedbacks).length}/{questions.length} answered
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addMoreQuestions}
                  disabled={addingMore || !currentSessionId}
                  className="h-7 px-2.5 text-xs rounded-lg border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
                >
                  {addingMore
                    ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    : <PlusCircle className="mr-1.5 h-3 w-3" />}
                  Add 5 More
                </Button>
              </div>
            </div>

            {questions.map((q) => {
              const isExpanded = expandedQuestion === q.id;
              const feedback = feedbacks[q.id];
              const isLoading = loadingFeedback[q.id];
              const isSpeaking = speakingId === q.id;
              const isListening = listeningId === q.id;

              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                    className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${QUESTION_TYPE_COLORS[q.type] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                          {q.type ? q.type.charAt(0).toUpperCase() + q.type.slice(1) : ""}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">Q{q.id}</span>
                        {feedback && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            feedback.score >= 8 ? "bg-emerald-100 text-emerald-700" :
                            feedback.score >= 5 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {feedback.score}/10
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm text-slate-800">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteQuestion(q); }}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                      {/* Tip + Speaker */}
                      <div className="bg-indigo-50 rounded-xl p-3 flex items-start gap-3">
                        <p className="text-xs text-indigo-800 flex-1"><span className="font-semibold">Tip:</span> {q.tips}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSpeak(q.id, q.question); }}
                          className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                            isSpeaking ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                          }`}
                          title={isSpeaking ? "Stop reading" : "Read question aloud"}
                        >
                          {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      {/* Answer */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-slate-600">Your Answer</Label>
                          <button
                            type="button"
                            onClick={() => handleMic(q.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isListening
                                ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                            }`}
                          >
                            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                            {isListening ? "Stop" : "Speak"}
                          </button>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={answers[q.id] || ""}
                            onChange={(e) => {
                              const updated = { ...answers, [q.id]: e.target.value };
                              setAnswers(updated);
                              if (currentSessionId) scheduleAnswerSave(updated, currentSessionId);
                            }}
                            rows={4}
                            placeholder="Type your answer or tap Speak to use your mic..."
                            className={`rounded-xl text-sm resize-none ${isListening ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"}`}
                          />
                          {isListening && (
                            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              Listening…
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => submitAnswer(q.id)}
                        disabled={isLoading || !(answers[q.id] || "").trim()}
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-0 shadow-sm text-white"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Star className="mr-2 h-3.5 w-3.5" />}
                        Get AI Feedback
                      </Button>

                      {feedback && (
                        <div className="mt-1 space-y-3 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-3">
                            <div className={`text-xl font-extrabold px-4 py-2 rounded-xl ${
                              feedback.score >= 8 ? "bg-emerald-100 text-emerald-700" :
                              feedback.score >= 5 ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {feedback.score}<span className="text-sm font-medium opacity-60">/10</span>
                            </div>
                            <p className="text-sm text-slate-600">{feedback.overallFeedback}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {feedback.strengths.length > 0 && (
                              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-700 mb-2">Strengths</p>
                                <ul className="space-y-1">
                                  {feedback.strengths.map((s, i) => (
                                    <li key={i} className="flex gap-1.5 text-xs text-emerald-800"><span className="mt-0.5 shrink-0">✓</span>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {feedback.improvements.length > 0 && (
                              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                <p className="text-xs font-semibold text-amber-700 mb-2">Improvements</p>
                                <ul className="space-y-1">
                                  {feedback.improvements.map((s, i) => (
                                    <li key={i} className="flex gap-1.5 text-xs text-amber-800"><span className="mt-0.5 shrink-0">→</span>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          {feedback.suggestedAnswer && (
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <p className="text-xs font-semibold text-blue-700 mb-1.5">Suggested Approach</p>
                              <p className="text-xs text-blue-900 leading-relaxed">{feedback.suggestedAnswer}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state when no session selected */}
        {!currentSessionId && questions.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Ready to practice?</p>
            <p className="text-xs text-slate-400 mt-1">Enter a job role above and generate your first set of interview questions.</p>
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      <Dialog open={showPaymentModal} onOpenChange={(o) => { if (!o && !paymentProcessing) { setShowPaymentModal(false); setPendingGenerate(null); } }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Unlock more questions</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Your {FREE_QUOTA} free questions have been used.
              Pay <strong className="text-slate-700">{DOWNLOAD_CURRENCY} {DOWNLOAD_AMOUNT.toLocaleString()}</strong> to unlock <strong className="text-slate-700">{PAID_BATCH} more questions</strong>. The count persists across all sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-800 space-y-1">
            <p className="font-semibold">What you get:</p>
            <p>• {PAID_BATCH} additional questions across any session</p>
            <p>• Add more any time you run out</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowPaymentModal(false); setPendingGenerate(null); }} disabled={paymentProcessing}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handlePayForQuestions}
              disabled={paymentProcessing}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
            >
              {paymentProcessing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
              Pay {DOWNLOAD_CURRENCY} {DOWNLOAD_AMOUNT.toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Session Confirmation ── */}
      <Dialog open={!!confirmDeleteSession} onOpenChange={(o) => { if (!o) setConfirmDeleteSession(null); }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Delete session?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{confirmDeleteSession?.job_role}</span>
              {confirmDeleteSession?.company ? ` at ${confirmDeleteSession.company}` : ""} — all questions, answers, and feedback will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setConfirmDeleteSession(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={() => confirmDeleteSession && deleteSession(confirmDeleteSession)}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}
              Delete session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Question Confirmation ── */}
      <Dialog open={!!confirmDeleteQuestion} onOpenChange={(o) => { if (!o) setConfirmDeleteQuestion(null); }}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Remove this question?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 line-clamp-3">
              "{confirmDeleteQuestion?.question}"
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setConfirmDeleteQuestion(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={() => confirmDeleteQuestion && deleteQuestion(confirmDeleteQuestion)}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}
              Remove question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
