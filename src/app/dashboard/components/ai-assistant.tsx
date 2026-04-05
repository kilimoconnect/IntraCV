"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send, Sparkles, UserCircle2, Trash2, ArrowUpCircle } from "lucide-react";

interface AiAssistantProps {
  userId: string;
  cvData: Record<string, unknown>;
}

interface AiResponseSection {
  title: string;
  items: { heading: string; body: string }[];
}

interface AiResponse {
  reply: string;
  sections?: AiResponseSection[];
  tips?: string[];
}

function parseAiContent(content: string): AiResponse | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed.reply === "string") return parsed as AiResponse;
  } catch { /* not JSON */ }
  return null;
}

function AssistantBubble({ content }: { content: string }) {
  const data = parseAiContent(content);

  if (!data) {
    return <div className="whitespace-pre-wrap leading-relaxed text-sm">{content}</div>;
  }

  return (
    <div className="space-y-3 text-sm">
      {data.reply && (
        <p className="leading-relaxed">{data.reply}</p>
      )}

      {data.sections?.map((sec, si) => (
        <div key={si}>
          <p className="font-semibold text-foreground mb-1.5">{sec.title}</p>
          <div className="space-y-2">
            {sec.items.map((item, ii) => (
              <div key={ii} className="rounded-lg border bg-white/60 px-3 py-2 shadow-sm">
                <p className="font-medium text-foreground text-xs mb-0.5">{item.heading}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {data.tips && data.tips.length > 0 && (
        <div>
          <p className="font-semibold text-foreground mb-1.5">Quick Tips</p>
          <ul className="space-y-1.5">
            {data.tips.map((tip, ti) => (
              <li key={ti} className="flex gap-2 text-xs text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How can I improve my CV?",
  "Interview tips for tech roles",
  "How to negotiate salary?",
  "Career path advice",
];

export default function AiAssistant({ userId, cvData }: AiAssistantProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_chat_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data || []).map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      await supabase.from("ai_chat_history").insert({
        user_id: userId, role: "user", content: userMsg.content,
      });

      const res = await fetch("/api/ai/career-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          profile: cvData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const assistantMsg: ChatMessage = { role: "assistant", content: json.message };
      setMessages((prev) => [...prev, assistantMsg]);

      await supabase.from("ai_chat_history").insert({
        user_id: userId, role: "assistant", content: json.message,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to get response");
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    await supabase.from("ai_chat_history").delete().eq("user_id", userId);
    setMessages([]);
    toast.success("Chat history cleared");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">AI Career Assistant</h3>
            <p className="text-xs text-muted-foreground">Career advice, interview tips &amp; more</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-semibold text-slate-700 mb-1">Your AI Career Coach</h4>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Ask me anything about your career, job search, or interview preparation. I&apos;m trained on your CV data.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full px-3 py-1.5 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
              msg.role === "user"
                ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-sm rounded-tr-sm"
                : "bg-white border border-slate-100 rounded-tl-sm"
            }`}>
              {msg.role === "user"
                ? <div className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</div>
                : <AssistantBubble content={msg.content} />
              }
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                <UserCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your career..."
          rows={1}
          className="resize-none min-h-[36px] border-0 shadow-none focus-visible:ring-0 p-0 text-sm bg-transparent flex-1"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150 ${
            input.trim() && !sending
              ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
        >
          {sending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <ArrowUpCircle className="h-4 w-4" />
          }
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
