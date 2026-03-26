"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Sparkles, ChevronDown, ChevronUp, Star,
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

export default function InterviewPrep({ userId }: InterviewPrepProps) {
  const [loading, setLoading] = useState(false);
  const [simRole, setSimRole] = useState("");
  const [simCompany, setSimCompany] = useState("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, AnswerFeedback>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<number, boolean>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

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
        body: JSON.stringify({ jobRole: simRole, company: simCompany, action: "generate" }),
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
    const answer = answers[questionId];
    const question = questions.find((q) => q.id === questionId);
    if (!answer?.trim() || !question) {
      toast.error("Please write an answer first");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interview Simulator */}
      {
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
                Enter a job role to generate tailored interview questions. Practice your answers and get AI feedback.
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
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground"><strong>Tip:</strong> {q.tips}</p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Your Answer</Label>
                            <Textarea
                              value={answers[q.id] || ""}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              rows={4}
                              placeholder="Type your answer here... Be specific and use examples from your experience."
                            />
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
      }
    </div>
  );
}
