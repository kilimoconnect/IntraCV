import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export interface ReviewSuggestion {
  section: string;
  severity: "critical" | "warning" | "tip";
  issue: string;
  suggestion: string;
}

export interface ProfileReview {
  score: number; // 0-100
  summary: string;
  suggestions: ReviewSuggestion[];
}

export async function POST(req: NextRequest) {
  try {
    const { cvData } = await req.json();
    if (!cvData) return NextResponse.json({ error: "No data" }, { status: 400 });

    // ── Extract all 18 CV builder sections ──
    const pi            = cvData.personalInfo || {};
    const summary       = cvData.summary || "";
    const experiences   = cvData.experiences || [];
    const education     = cvData.education || [];
    const skills        = (cvData.skills || []).map((s: any) => s.name || s);
    const expertise     = (cvData.areasOfExpertise || []).map((a: any) => a.name || a);
    const certifications= cvData.certifications || [];
    const achievements  = (cvData.keyAchievements || []).map((a: any) => a.description || a);
    const memberships   = (cvData.memberships || []).map((m: any) => m.name || m);
    const projects      = cvData.projects || [];
    const boardRoles    = cvData.boardRoles || [];
    const execTraining  = cvData.execTraining || [];
    const publications  = cvData.publications || [];
    const tools         = (cvData.tools || []).map((t: any) => t.name || t);
    const volunteer     = (cvData.volunteer || []).map((v: any) => v.description || v);
    const languages     = cvData.languages || [];
    const referees      = cvData.referees || [];
    const declaration   = cvData.declaration || {};

    // ── Build section snapshot for the AI ──
    const sections = [
      { name: "Personal Info",       data: `Name: ${pi.fullName || "—"} | Headline: ${pi.headline || "—"} | Location: ${pi.location || "—"} | Email: ${pi.email || "—"} | Phone: ${pi.phone || "—"}` },
      { name: "Summary",             data: summary ? `${summary.slice(0, 300)}${summary.length > 300 ? "…" : ""}` : "MISSING" },
      { name: "Experience",          data: experiences.length > 0
          ? experiences.map((e: any) => `${e.title || "?"} @ ${e.company || "?"} | ${e.startDate || "?"} – ${e.endDate || "present"} | Description: ${(e.description || "").slice(0, 120)}`).join("\n")
          : "MISSING" },
      { name: "Education",           data: education.length > 0
          ? education.map((e: any) => `${e.degree || "?"} from ${e.institution || e.school || "?"} (${e.year || "?"})`).join("; ")
          : "MISSING" },
      { name: "Skills",              data: skills.length > 0 ? `${skills.length} skills: ${skills.slice(0, 20).join(", ")}` : "MISSING" },
      { name: "Areas of Expertise",  data: expertise.length > 0 ? expertise.join(", ") : "Not provided" },
      { name: "Certifications",      data: certifications.length > 0 ? certifications.map((c: any) => `${c.name} (${c.issuer || "?"}, ${c.year || "?"})`).join("; ") : "Not provided" },
      { name: "Key Achievements",    data: achievements.length > 0 ? achievements.slice(0, 5).join(" | ") : "Not provided" },
      { name: "Memberships",         data: memberships.length > 0 ? memberships.join(", ") : "Not provided" },
      { name: "Projects",            data: projects.length > 0 ? projects.map((p: any) => `${p.name}: ${(p.description || "").slice(0, 80)}`).join(" | ") : "Not provided" },
      { name: "Board Roles",         data: boardRoles.length > 0 ? boardRoles.map((b: any) => `${b.title} @ ${b.organization}`).join("; ") : "Not provided" },
      { name: "Executive Training",  data: execTraining.length > 0 ? execTraining.map((t: any) => `${t.program} (${t.institution}, ${t.year})`).join("; ") : "Not provided" },
      { name: "Publications",        data: publications.length > 0 ? publications.map((p: any) => `${p.title} (${p.publisher}, ${p.year})`).join("; ") : "Not provided" },
      { name: "Tools & Software",    data: tools.length > 0 ? tools.join(", ") : "Not provided" },
      { name: "Volunteer",           data: volunteer.length > 0 ? volunteer.join("; ") : "Not provided" },
      { name: "Languages",           data: languages.length > 0 ? languages.map((l: any) => `${l.name} (${l.proficiency || l.label || "?"})`).join(", ") : "Not provided" },
      { name: "Referees",            data: referees.length > 0 ? referees.map((r: any) => `${r.name}, ${r.title} @ ${r.company}`).join("; ") : "Not provided" },
      { name: "Declaration",         data: declaration.declaration ? `Present (${(declaration.declaration).slice(0, 60)}…)` : "Not provided" },
    ];

    const sectionBlock = sections.map(s => `[${s.name}]\n${s.data}`).join("\n\n");

    const prompt = `You are a senior CV consultant reviewing all sections of a professional's CV before it is built.
Analyse every section below and return specific, actionable improvement suggestions.

CV SECTIONS:
${sectionBlock}

Instructions:
1. Score the CV from 0–100 based on completeness, quality, and professional impact across ALL sections.
2. Write a 1-sentence summary of the CV's overall state.
3. Return up to 10 suggestions. Each suggestion must reference a specific section by its exact name.
   Focus on:
   - Sections marked MISSING that are critical
   - Weak, vague, or incomplete content
   - Missing quantified results (%, $, KPIs) in experience/achievements
   - ATS keyword gaps
   - Career narrative consistency
   - Professional credibility (certifications, memberships, publications relevant to career)
   - Sections that would strengthen the profile if populated

Severity rules:
- "critical" — blocks a strong CV (missing summary, no experience dates, no skills)
- "warning" — significantly weakens the CV (vague descriptions, no achievements, no tools listed)
- "tip" — would enhance the CV (add languages, memberships, publications if relevant)

Return ONLY valid JSON:
{
  "score": 0,
  "summary": "",
  "suggestions": [
    { "section": "", "severity": "critical|warning|tip", "issue": "", "suggestion": "" }
  ]
}`;

    const openai = openaiClient();
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const review: ProfileReview = JSON.parse(res.choices[0]?.message?.content || "{}");

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Profile review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
