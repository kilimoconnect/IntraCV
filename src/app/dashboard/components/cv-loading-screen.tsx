"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Crafting your professional profile…",
  "Tailoring content to your target role…",
  "Highlighting your key achievements…",
  "Optimizing for maximum impact…",
  "Polishing every detail…",
  "Finalizing your professional CV…",
];

export default function CVLoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 3200);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.random() * 3 + 0.5;
      });
    }, 400);
    return () => clearInterval(progTimer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative flex flex-col items-center max-w-md w-full px-8">
        {/* Animated document icon */}
        <div className="relative mb-10">
          <div className="w-24 h-32 rounded-lg bg-white shadow-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden animate-pulse">
            {/* Page lines */}
            <div className="space-y-2 w-14">
              <div className="h-1.5 rounded-full bg-slate-200 w-full" />
              <div className="h-1.5 rounded-full bg-slate-100 w-10" />
              <div className="h-1.5 rounded-full bg-slate-200 w-full" />
              <div className="h-1.5 rounded-full bg-slate-100 w-8" />
              <div className="h-1.5 rounded-full bg-slate-200 w-12" />
              <div className="h-1.5 rounded-full bg-slate-100 w-full" />
            </div>
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
          </div>
          {/* Floating pen icon */}
          <div className="absolute -right-3 -bottom-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: "2s" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          Building Your CV
        </h2>

        {/* Cycling messages */}
        <div className="h-6 flex items-center justify-center mb-8">
          <p
            key={msgIdx}
            className="text-sm text-slate-500 text-center animate-[fadeIn_0.5s_ease-in-out]"
          >
            {MESSAGES[msgIdx]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 95)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">
            This usually takes a few seconds
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
