"use client";
import { useEffect, useRef, useState } from "react";
import { Check, X, Trash2, Plus } from "lucide-react";

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
  onDelete?: (field: string) => void;
  onAddBullet?: (field: string) => void;
  onClose: () => void;
}

function fieldLabel(field: string): string {
  const p = field.split(".");
  const num = (n: string) => `#${+n + 1}`;
  if (p[0] === "fullName") return "Full Name";
  if (p[0] === "title") return "Job Title";
  if (p[0] === "tagline") return "Tagline";
  if (p[0] === "profile") return "Professional Summary";
  if (p[0] === "email") return "Email";
  if (p[0] === "phone") return "Phone";
  if (p[0] === "location") return "Location";
  if (p[0] === "linkedin") return "LinkedIn";
  if (p[0] === "exp") {
    const n = num(p[1]);
    if (p[2] === "role") return `Experience ${n} – Role`;
    if (p[2] === "company") return `Experience ${n} – Company`;
    if (p[2] === "dates") return `Experience ${n} – Dates`;
    if (p[2] === "bullet") return `Experience ${n} – Bullet ${num(p[3])}`;
    return `Experience ${n}`;
  }
  if (p[0] === "hist") {
    const n = num(p[1]);
    if (p[2] === "role") return `History ${n} – Role`;
    if (p[2] === "company") return `History ${n} – Company`;
    if (p[2] === "dates") return `History ${n} – Dates`;
    if (p[2] === "bullet") return `History ${n} – Bullet ${num(p[3])}`;
    return `History ${n}`;
  }
  if (p[0] === "ach") return `Achievement ${num(p[1])}`;
  if (p[0] === "skill") return `Skill ${num(p[1])}`;
  if (p[0] === "edu") {
    const n = num(p[1]);
    if (p[2] === "degree") return `Education ${n} – Degree`;
    if (p[2] === "school") return `Education ${n} – School`;
    if (p[2] === "year") return `Education ${n} – Year`;
    return `Education ${n}`;
  }
  if (p[0] === "cert") {
    const n = num(p[1]);
    if (p[2] === "name") return `Cert ${n} – Name`;
    if (p[2] === "issuer") return `Cert ${n} – Issuer`;
    return `Cert ${n}`;
  }
  if (p[0] === "lang") {
    const n = num(p[1]);
    if (p[2] === "name") return `Language ${n} – Name`;
    if (p[2] === "label") return `Language ${n} – Level`;
    return `Language ${n}`;
  }
  if (p[0] === "proj") {
    const n = num(p[1]);
    if (p[2] === "name") return `Project ${n} – Title`;
    if (p[2] === "description") return `Project ${n} – Description`;
    if (p[2] === "tech") return `Project ${n} – Tech Stack`;
    return `Project ${n}`;
  }
  if (p[0] === "award") {
    const n = num(p[1]);
    if (p[2] === "description") return `Award ${n} – Description`;
    return `Award ${n} – Title`;
  }
  if (p[0] === "ref") {
    const n = num(p[1]);
    if (p[2] === "name") return `Reference ${n} – Name`;
    if (p[2] === "title") return `Reference ${n} – Title`;
    if (p[2] === "company") return `Reference ${n} – Company`;
    if (p[2] === "phone") return `Reference ${n} – Phone`;
    if (p[2] === "email") return `Reference ${n} – Email`;
    return `Reference ${n}`;
  }
  if (p[0] === "tool") return `Tool ${num(p[1])}`;
  if (p[0] === "memb") return `Membership ${num(p[1])}`;
  if (p[0] === "vol")  return `Volunteer ${num(p[1])}`;
  if (p[0] === "boardRole") {
    const n = num(p[1]);
    if (p[2] === "title")        return `Board Role ${n} – Title`;
    if (p[2] === "organization") return `Board Role ${n} – Organization`;
    if (p[2] === "dates")        return `Board Role ${n} – Dates`;
    if (p[2] === "description")  return `Board Role ${n} – Description`;
    return `Board Role ${n}`;
  }
  if (p[0] === "execTrain") {
    const n = num(p[1]);
    if (p[2] === "name")        return `Exec Training ${n} – Programme`;
    if (p[2] === "institution") return `Exec Training ${n} – Institution`;
    if (p[2] === "year")        return `Exec Training ${n} – Year`;
    return `Exec Training ${n}`;
  }
  if (p[0] === "pub") {
    const n = num(p[1]);
    if (p[2] === "title")     return `Publication ${n} – Title`;
    if (p[2] === "publisher") return `Publication ${n} – Publisher`;
    if (p[2] === "year")      return `Publication ${n} – Year`;
    return `Publication ${n}`;
  }
  if (p[0] === "decl") {
    if (p[1] === "declaration") return "Declaration Text";
    if (p[1] === "place")       return "Declaration – Place";
    if (p[1] === "date")        return "Declaration – Date";
    return "Declaration";
  }
  return field.replace(/\./g, " › ");
}

function isDeletable(field: string): boolean {
  const p = field.split(".");
  if (p[0] === "award" && p[2] === "description") return false;
  return ["ach", "skill", "proj", "award", "cert", "lang", "edu", "ref", "tool", "memb", "vol", "boardRole", "execTrain", "pub"].includes(p[0]) ||
    (p[0] === "exp" && p[2] === "bullet") ||
    (p[0] === "hist" && p[2] === "bullet");
}

function isBulletParent(field: string): boolean {
  const p = field.split(".");
  return (p[0] === "exp" || p[0] === "hist") && p[2] === "bullet";
}

export default function CVInlineEditor({ editor, onSave, onDelete, onAddBullet, onClose }: Props) {
  const [text, setText] = useState(editor.value);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(editor.value);
    setConfirmDelete(false);
    if (editor.multiline) {
      setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.select(); }, 10);
    } else {
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
    }
  }, [editor.field, editor.value, editor.multiline]);

  const save = () => {
    if (text.trim() !== "") onSave(editor.field, text);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete?.(editor.field);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "Enter" && !e.shiftKey && !editor.multiline) { e.preventDefault(); save(); }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const W = Math.min(460, typeof window !== "undefined" ? window.innerWidth - 16 : 460);
  const maxLeft = typeof window !== "undefined" ? window.innerWidth - W - 8 : 0;
  const left = Math.max(8, Math.min(editor.x, maxLeft));
  const maxTop = typeof window !== "undefined" ? window.innerHeight - 300 : 0;
  const top = Math.max(8, Math.min(editor.y, maxTop));

  const canDelete = isDeletable(editor.field) && !!onDelete;
  const canAddBullet = isBulletParent(editor.field) && !!onAddBullet;

  return (
    <>
      {/* Backdrop — semi-transparent on mobile so CV stays visible */}
      <div
        className={`fixed inset-0 z-[9998] ${isMobile ? "bg-black/30" : ""}`}
        onClick={save}
      />

      {/* Bottom sheet on mobile, floating popup on desktop */}
      <div
        className="fixed z-[9999] bg-white shadow-2xl border border-[#004aad]/20 overflow-hidden flex flex-col"
        style={isMobile
          ? { left: 0, right: 0, bottom: 0, width: "100%", borderRadius: "16px 16px 0 0" }
          : { left, top, width: W, borderRadius: "16px" }
        }
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#004aad]">
          <span className="text-xs font-semibold text-white tracking-wide">
            ✏️ {fieldLabel(editor.field)}
          </span>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input */}
        <div className="px-4 py-3">
          {editor.multiline ? (
            <textarea
              ref={textareaRef}
              className="w-full text-sm text-slate-800 leading-relaxed outline-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:border-[#00c4cc] focus:bg-white transition-colors"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              placeholder="Type here…"
            />
          ) : (
            <input
              ref={inputRef}
              className="w-full text-sm text-slate-800 outline-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-[#00c4cc] focus:bg-white transition-colors"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here…"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 gap-2">
          {/* Left: delete + add-bullet */}
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  confirmDelete
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-red-200 text-red-500 hover:bg-red-50"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {confirmDelete ? "Confirm delete" : "Delete"}
              </button>
            )}
            {canAddBullet && (
              <button
                onClick={() => { onAddBullet!(editor.field); onClose(); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add bullet
              </button>
            )}
          </div>

          {/* Right: hint + save */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">
              {editor.multiline ? "Ctrl+Enter · Esc" : "Enter · Esc"}
            </span>
            <button
              onClick={save}
              className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg bg-[#004aad] text-white hover:bg-[#e8661a] transition-colors font-medium"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
