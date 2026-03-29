"use client";
import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

export interface InlineEditorState {
  field: string;
  value: string;
  x: number;
  y: number;
  width: number;
  multiline: boolean;
}

interface Props {
  editor: InlineEditorState;
  onSave: (field: string, value: string) => void;
  onClose: () => void;
}

export default function CVInlineEditor({ editor, onSave, onClose }: Props) {
  const [text, setText] = useState(editor.value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editor.multiline) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    } else {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editor.multiline]);

  const save = () => {
    if (text.trim() !== "") onSave(editor.field, text);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "Enter" && !e.shiftKey && !editor.multiline) { e.preventDefault(); save(); }
    if (e.key === "Enter" && e.metaKey) { e.preventDefault(); save(); }
  };

  const W = Math.max(editor.width, 260);
  const maxLeft = typeof window !== "undefined" ? window.innerWidth - W - 12 : 0;
  const left = Math.max(8, Math.min(editor.x, maxLeft));
  const top = editor.y;

  const sharedStyle: React.CSSProperties = {
    width: W,
    fontSize: 13,
    lineHeight: "1.5",
    color: "#1e293b",
    fontFamily: "inherit",
    outline: "none",
    background: "transparent",
    border: "none",
    padding: 0,
    resize: "none",
  };

  return (
    <>
      {/* Backdrop — click to save */}
      <div className="fixed inset-0 z-[9998]" onClick={save} />

      {/* Floating editor box */}
      <div
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-indigo-400 overflow-hidden"
        style={{ left, top, width: W }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-50 border-b border-indigo-100">
          <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide truncate max-w-[180px]">
            {editor.field.replace(/\./g, " › ")}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onClose} className="p-0.5 text-slate-400 hover:text-red-500 rounded">
              <X className="h-3.5 w-3.5" />
            </button>
            <button onClick={save} className="p-0.5 text-indigo-500 hover:text-indigo-700 rounded">
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Input area */}
        <div className="px-3 py-2">
          {editor.multiline ? (
            <textarea
              ref={textareaRef}
              style={sharedStyle}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
            />
          ) : (
            <input
              ref={inputRef}
              style={sharedStyle}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400">
          {editor.multiline ? "⌘Enter to save · Esc to cancel" : "Enter to save · Esc to cancel"}
        </div>
      </div>
    </>
  );
}
