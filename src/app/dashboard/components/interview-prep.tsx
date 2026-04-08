"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Sparkles, ChevronDown, ChevronUp, Star,
  Mic, MicOff, Volume2, VolumeX, RotateCcw, CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface InterviewPrepProps {
  userId: string;
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

const QUESTION_TYPE_COLORS: Record<string, string> = {
  behavioral:   "bg-purple-100 text-purple-700 border border-purple-200",
  technical:    "bg-blue-100 text-blue-700 border border-blue-200",
  situational:  "bg-amber-100 text-amber-700 border border-amber-200",
  competency:   "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "culture-fit":"bg-pink-100 text-pink-700 border border-pink-200",
};

// ─── Speech helpers ───

function speakText(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export default function InterviewPrep({ userId }: InterviewPrepProps) {
  const [simRole, setSimRole] = useState("");
  const [simCompany, setSimCompany] = useState("");
  const [simJobDescription, setSimJobDescription] = useState("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, AnswerFeedback>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<number, boolean>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Persistence state
  const [loadingSession, setLoadingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speech state
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [listeningId, setListeningId] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // ─── Load saved session on mount ───
  useEffect(() => {
    if (!userId) { setLoadingSession(false); return; }
    const supabase = createClient();
    supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error("Session load error:", error); }
        if (data) {
          setSimRole(data.job_role || "");
          setSimCompany(data.company || "");
          setSimJobDescription(data.job_description || "");

          const qs: InterviewQuestion[] = data.questions || [];
          setQuestions(qs);

          // JSON keys are strings — convert back to numbers
          const savedAnswers: Record<number, string> = {};
          for (const [k, v] of Object.entries(data.answers || {})) {
            savedAnswers[parseInt(k)] = v as string;
          }
          setAnswers(savedAnswers);

          const savedFeedbacks: Record<number, AnswerFeedback> = {};
          for (const [k, v] of Object.entries(data.feedbacks || {})) {
            savedFeedbacks[parseInt(k)] = v as AnswerFeedback;
          }
          setFeedbacks(savedFeedbacks);

          if (qs.length > 0) {
            setExpandedQuestion(qs[0]?.id ?? null);
            setLastSaved(new Date(data.updated_at));
          }
        }
        setLoadingSession(false);
      });
  }, [userId]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ─── Persist session to DB ───
  const persistSession = useCallback(async (patch: {
    job_role?: string;
    company?: string;
    job_description?: string;
    questions?: InterviewQuestion[];
    answers?: Record<number, string>;
    feedbacks?: Record<number, AnswerFeedback>;
  }) => {
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("interview_sessions")
        .upsert(
          { user_id: userId, ...patch },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      setLastSaved(new Date());
    } catch (err: any) {
      console.error("Session save error:", err);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  // Debounced save for answer text changes
  const scheduleAnswerSave = useCallback((updatedAnswers: Record<number, string>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistSession({ answers: updatedAnswers });
    }, 1500);
  }, [persistSession]);

  // ─── Text-to-Speech ───
  const handleSpeak = useCallback((questionId: number, text: string) => {
    if (speakingId === questionId) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(questionId);
    speakText(text, () => setSpeakingId(null));
  }, [speakingId]);

  // ─── Speech-to-Text ───
  const handleMic = useCallback((questionId: number) => {
    if (listeningId === questionId) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setListeningId(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = answers[questionId] || "";
    if (finalTranscript && !finalTranscript.endsWith(" ")) {
      finalTranscript += " ";
    }

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      const updated = { ...answers, [questionId]: finalTranscript + interim };
      setAnswers(updated);
      scheduleAnswerSave(updated);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        toast.error(`Microphone error: ${event.error}`);
      }
      setListeningId(null);
    };

    recognition.onend = () => setListeningId(null);

    recognitionRef.current = recognition;
    recognition.start();
    setListeningId(questionId);
  }, [listeningId, answers, scheduleAnswerSave]);

  // ─── Generate Questions ───
  const generateQuestions = async () => {
    if (!simRole.trim()) {
      toast.error("Please enter a job role");
      return;
    }
    setGeneratingQuestions(true);
    setQuestions([]);
    setAnswers({});
    setFeedbacks({});
    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: simRole,
          company: simCompany,
          jobDescription: simJobDescription || undefined,
          action: "generate",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const qs: InterviewQuestion[] = json.questions || [];
      setQuestions(qs);
      setExpandedQuestion(qs[0]?.id ?? null);

      // Save full session immediately after generation
      await persistSession({
        job_role: simRole,
        company: simCompany,
        job_description: simJobDescription,
        questions: qs,
        answers: {},
        feedbacks: {},
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // ─── Submit Answer for Feedback ───
  const submitAnswer = async (questionId: number) => {
    if (listeningId === questionId) {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
      setListeningId(null);
    }

    const answer = answers[questionId];
    const question = questions.find((q) => q.id === questionId);
    if (!answer?.trim() || !question) {
      toast.error("Please write or speak an answer first");
      return;
    }
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

      // Save answers + feedbacks after each feedback received
      await persistSession({ answers, feedbacks: updatedFeedbacks });
    } catch (err: any) {
      toast.error(err.message || "Failed to get feedback");
    } finally {
      setLoadingFeedback((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // ─── New Session ───
  const startNewSession = () => {
    setQuestions([]);
    setAnswers({});
    setFeedbacks({});
    setExpandedQuestion(null);
    setLastSaved(null);
    // Clear DB session
    if (userId) {
      const supabase = createClient();
      supabase
        .from("interview_sessions")
        .upsert(
          { user_id: userId, job_role: simRole, company: simCompany, job_description: simJobDescription, questions: [], answers: {}, feedbacks: {} },
          { onConflict: "user_id" }
        )
        .then(() => {});
    }
  };

  // ─── Save status label ───
  const saveLabel = saving
    ? "Saving…"
    : lastSaved
      ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : null;

  if (loadingSession) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Role Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Practice Interview Questions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Generate tailored questions and get instant AI feedback on your answers</p>
            </div>
          </div>
          {/* Save status */}
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
            <Label className="text-xs font-medium text-slate-600">Job Description <span className="text-slate-400">(optional — for targeted questions)</span></Label>
            <Textarea
              value={simJobDescription}
              onChange={(e) => setSimJobDescription(e.target.value)}
              rows={3}
              placeholder="Paste the job description here..."
              className="rounded-xl border-slate-200 text-sm resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={generateQuestions}
              disabled={generatingQuestions}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-sm shadow-blue-200 text-white"
            >
              {generatingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {questions.length > 0 ? "Regenerate Questions" : "Generate Questions"}
            </Button>
            {questions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewSession}
                className="rounded-xl text-slate-500 hover:text-slate-700 text-xs"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                New Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{questions.length} Questions</p>
            <Badge variant="secondary" className="text-[11px] bg-slate-100 text-slate-500 border-0">
              {Object.keys(feedbacks).length}/{questions.length} answered
            </Badge>
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
                        {q.type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Q{q.id}</span>
                      {feedback && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
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
                  <div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-0.5 transition-colors ${isExpanded ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                    {/* Tip + Speaker */}
                    <div className="bg-indigo-50 rounded-xl p-3 flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-indigo-800"><span className="font-semibold">Tip:</span> {q.tips}</p>
                      </div>
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

                    {/* Answer area with mic */}
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
                            scheduleAnswerSave(updated);
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

                    {/* Feedback Display */}
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
                                  <li key={i} className="flex gap-1.5 text-xs text-emerald-800">
                                    <span className="mt-0.5 shrink-0">✓</span>{s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {feedback.improvements.length > 0 && (
                            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                              <p className="text-xs font-semibold text-amber-700 mb-2">Improvements</p>
                              <ul className="space-y-1">
                                {feedback.improvements.map((s, i) => (
                                  <li key={i} className="flex gap-1.5 text-xs text-amber-800">
                                    <span className="mt-0.5 shrink-0">→</span>{s}
                                  </li>
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
    </div>
  );
}
