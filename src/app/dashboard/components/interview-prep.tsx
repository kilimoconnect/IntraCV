"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Sparkles, ChevronDown, ChevronUp, Star,
  Mic, MicOff, Volume2, VolumeX,
} from "lucide-react";

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
  behavioral: "bg-purple-100 text-purple-700",
  technical: "bg-blue-100 text-blue-700",
  situational: "bg-amber-100 text-amber-700",
  competency: "bg-emerald-100 text-emerald-700",
  "culture-fit": "bg-pink-100 text-pink-700",
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

  // Speech state
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [listeningId, setListeningId] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // ─── Text-to-Speech: AI reads question aloud ───
  const handleSpeak = useCallback((questionId: number, text: string) => {
    if (speakingId === questionId) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(questionId);
    speakText(text, () => setSpeakingId(null));
  }, [speakingId]);

  // ─── Speech-to-Text: user speaks answer via microphone ───
  const handleMic = useCallback((questionId: number) => {
    // Toggle off
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
    // If there's existing text, add a space separator
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
      setAnswers((prev) => ({
        ...prev,
        [questionId]: finalTranscript + interim,
      }));
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        toast.error(`Microphone error: ${event.error}`);
      }
      setListeningId(null);
    };

    recognition.onend = () => {
      setListeningId(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListeningId(questionId);
  }, [listeningId, answers]);

  // Interview Simulator handlers
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
      setQuestions(json.questions || []);
      setExpandedQuestion(json.questions?.[0]?.id ?? null);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const submitAnswer = async (questionId: number) => {
    // Stop mic if active
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
      setFeedbacks((prev) => ({ ...prev, [questionId]: json.feedback }));
    } catch (err: any) {
      toast.error(err.message || "Failed to get feedback");
    } finally {
      setLoadingFeedback((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Role Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Practice Interview Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a job role to generate tailored interview questions. Paste a job description for even more targeted questions. Practice your answers by typing or using your microphone.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Role *</Label>
                <Input
                  value={simRole}
                  onChange={(e) => setSimRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company (optional)</Label>
                <Input
                  value={simCompany}
                  onChange={(e) => setSimCompany(e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Description (optional)</Label>
              <Textarea
                value={simJobDescription}
                onChange={(e) => setSimJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste the job description here for more targeted questions..."
                className="text-sm"
              />
            </div>
            <Button onClick={generateQuestions} disabled={generatingQuestions}>
              {generatingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Questions
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((q) => {
              const isExpanded = expandedQuestion === q.id;
              const feedback = feedbacks[q.id];
              const isLoading = loadingFeedback[q.id];
              const isSpeaking = speakingId === q.id;
              const isListening = listeningId === q.id;
              return (
                <Card key={q.id}>
                  <CardContent className="py-4">
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="w-full text-left flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={QUESTION_TYPE_COLORS[q.type] || "bg-gray-100 text-gray-700"}>
                            {q.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Q{q.id}</span>
                        </div>
                        <p className="font-medium text-sm">{q.question}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 mt-1 shrink-0" /> : <ChevronDown className="h-4 w-4 mt-1 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {/* Tip + Speaker */}
                        <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground"><strong>Tip:</strong> {q.tips}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSpeak(q.id, q.question); }}
                            className={`shrink-0 p-1.5 rounded-md transition-colors ${
                              isSpeaking
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                            title={isSpeaking ? "Stop reading" : "Read question aloud"}
                          >
                            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Answer area with mic */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Your Answer</Label>
                            <button
                              type="button"
                              onClick={() => handleMic(q.id)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                isListening
                                  ? "bg-red-100 text-red-700 animate-pulse"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                              title={isListening ? "Stop recording" : "Speak your answer"}
                            >
                              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                              {isListening ? "Stop" : "Speak"}
                            </button>
                          </div>
                          <div className="relative">
                            <Textarea
                              value={answers[q.id] || ""}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              rows={4}
                              placeholder="Type your answer or tap the mic button to speak..."
                              className={isListening ? "border-red-300 ring-1 ring-red-200" : ""}
                            />
                            {isListening && (
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-red-600 font-medium">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Listening...
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => submitAnswer(q.id)}
                          disabled={isLoading || !(answers[q.id] || "").trim()}
                        >
                          {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Star className="mr-2 h-3 w-3" />}
                          Get AI Feedback
                        </Button>

                        {/* Feedback Display */}
                        {feedback && (
                          <div className="mt-3 space-y-3 border-t pt-3">
                            <div className="flex items-center gap-3">
                              <div className={`text-lg font-bold px-3 py-1 rounded-lg ${
                                feedback.score >= 8 ? "bg-green-100 text-green-700" :
                                feedback.score >= 5 ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {feedback.score}/10
                              </div>
                              <p className="text-sm text-muted-foreground">{feedback.overallFeedback}</p>
                            </div>

                            {feedback.strengths.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {feedback.strengths.map((s, i) => <li key={i}>+ {s}</li>)}
                                </ul>
                              </div>
                            )}

                            {feedback.improvements.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-1">Improvements</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {feedback.improvements.map((s, i) => <li key={i}>• {s}</li>)}
                                </ul>
                              </div>
                            )}

                            {feedback.suggestedAnswer && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-700 mb-1">Suggested Approach</p>
                                <p className="text-xs text-blue-900">{feedback.suggestedAnswer}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
