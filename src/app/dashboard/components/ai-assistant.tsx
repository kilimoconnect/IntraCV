"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send, Bot, UserIcon, Trash2 } from "lucide-react";

interface AiAssistantProps {
  userId: string;
  cvSummary: string;
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistant({ userId, cvSummary }: AiAssistantProps) {
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
      // Save user message
      await supabase.from("ai_chat_history").insert({
        user_id: userId, role: "user", content: userMsg.content,
      });

      const res = await fetch("/api/ai/career-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          cvSummary,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const assistantMsg: ChatMessage = { role: "assistant", content: json.message };
      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant message
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">AI Career Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask about career advice, interview tips, salary negotiation, and more.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground">
            <Trash2 className="mr-2 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Hi! I&apos;m your AI Career Assistant. Ask me anything about your career, job search, or interview preparation.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["How can I improve my CV?", "Interview tips for tech roles", "How to negotiate salary?", "Career path advice"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs border rounded-full px-3 py-1.5 hover:bg-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <UserIcon className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your career..."
          rows={1}
          className="resize-none min-h-[40px]"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || sending} size="sm" className="h-10 px-3">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
