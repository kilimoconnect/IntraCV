import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ═══════════════════════════════════════════════
// STRUCTURED CV GENERATOR
// Takes the current generated CV and produces:
//   - 3 summary versions (short, medium, long)
//   - 2 bullet versions per experience (concise, detailed)
//   - Industry classification
// ═══════════════════════════════════════════════

async function callAI(prompt: string): Promise<any> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No AI response");
  return JSON.parse(content);
}

function buildExperienceSummary(exps: any[]): string {
  return exps.map((e: any) =>
    `${e.title || ""} at ${e.company || ""} (${e.startDate || ""}–${e.endDate || ""}): ${(e.description || "").substring(0, 200)}`
  ).join("\n");
}

// ─── Step 1: Industry Classification ───
async function classifyIndustry(cvData: any): Promise<string> {
  const exps = cvData.experiences || [];
  const skills = (cvData.skills || []).map((s: any) => s.name || s).join(", ");
  const certs = (cvData.certifications || []).map((c: any) => c.name || c).join(", ");

  const result = await callAI(`You are an expert career classifier.

Based on this professional's profile, classify their industry category.

TITLE: ${cvData.personalInfo?.headline || ""}
EXPERIENCE: ${buildExperienceSummary(exps)}
SKILLS: ${skills}
CERTIFICATIONS: ${certs}

Choose EXACTLY ONE category:
- CORPORATE: Finance, accounting, management, banking, consulting, legal
- TECH: Software engineering, data science, IT, cybersecurity, product management
- CREATIVE: Design, marketing, advertising, media, arts, content creation
- ACADEMIC: Research, teaching, academia, scientific, medical, healthcare

Return ONLY JSON: { "industry_category": "CORPORATE|TECH|CREATIVE|ACADEMIC", "reason": "brief explanation" }`);

  return result.industry_category || "CORPORATE";
}

// ─── Step 2: Generate 3 Summary Versions ───
async function generateSummaryVersions(cvData: any, industryCategory: string): Promise<{
  summary_short: string;
  summary_medium: string;
  summary_long: string;
}> {
  const exps = cvData.experiences || [];
  const skills = (cvData.skills || []).map((s: any) => s.name || s).join(", ");
  const certs = (cvData.certifications || []).map((c: any) => c.name || c).join(", ");
  const edu = (cvData.education || []).map((e: any) => `${e.degree} (${e.institution})`).join(", ");
  const currentSummary = cvData.summary || "";

  const result = await callAI(`You are an expert CV writer specializing in ${industryCategory} professionals.

CURRENT SUMMARY: ${currentSummary}
CANDIDATE: ${cvData.personalInfo?.fullName || ""}, ${cvData.personalInfo?.headline || ""}
EXPERIENCE: ${buildExperienceSummary(exps)}
SKILLS: ${skills}
EDUCATION: ${edu}
CERTIFICATIONS: ${certs}

Generate THREE versions of the Professional Summary, each building on the previous:

1. summary_short (30-50 words): Punchy 2-3 sentence elevator pitch. Focus on years of experience, core expertise, and one standout achievement. Perfect for 1-page CVs.

2. summary_medium (60-90 words): Balanced 4-5 sentence summary. Includes years of experience, key expertise areas, 2 quantified achievements, and career objective. Perfect for 2-page CVs.

3. summary_long (100-140 words): Comprehensive 6-8 sentence narrative. Covers full career arc, key differentiators, multiple achievements with metrics, professional philosophy, and strategic career goals. Perfect for 3-page executive CVs.

Rules:
- Third person only (no "I"/"my")
- Strong opening: "Results-driven", "Accomplished", "Strategic"
- Include REAL metrics from the experience data
- Each version must stand alone as a complete summary
- ${industryCategory} industry tone and terminology

Return ONLY JSON: { "summary_short": "", "summary_medium": "", "summary_long": "" }`);

  return result;
}

// ─── Step 3: Generate 2 Bullet Versions Per Experience ───
async function generateBulletVersions(cvData: any, industryCategory: string): Promise<any[]> {
  const exps = cvData.experiences || [];
  const results: any[] = [];

  // Process in batches of 3 to avoid token limits
  for (let i = 0; i < exps.length; i += 3) {
    const batch = exps.slice(i, i + 3);
    const batchPrompt = batch.map((exp: any, idx: number) => {
      const bullets = (exp.description || "").split("\n").filter((l: string) => l.trim());
      return `
JOB ${i + idx + 1}:
Title: ${exp.title || ""}
Company: ${exp.company || ""}
Period: ${exp.startDate || ""} – ${exp.endDate || ""}
Current Bullets:
${bullets.map((b: string) => `• ${b.replace(/^[•\-*]\s*/, "")}`).join("\n")}`;
    }).join("\n\n");

    const result = await callAI(`You are an expert CV bullet point writer for ${industryCategory} professionals.

${batchPrompt}

For EACH job, generate TWO versions of the bullet points:

1. bullets_concise: Shorter, punchier bullets (15-25 words each). Focus on the core action + result. Keep the same number of bullets or fewer. Each bullet starts with a strong action verb. Include metrics where possible. Perfect for compact/1-page CVs.

2. bullets_detailed: Fuller, more descriptive bullets (30-50 words each). Expand on context, method, and impact using the STAR method (Situation-Task-Action-Result). Keep the same number of bullets. Each bullet starts with a strong action verb and includes specific metrics. Perfect for 2-3 page CVs.

Rules:
- Use REAL data from the original bullets — do NOT fabricate metrics
- Every bullet must start with a past-tense action verb (Achieved, Implemented, Managed, etc.)
- ${industryCategory} industry language
- Preserve the essence and facts of each original bullet

Return ONLY JSON: { "jobs": [{ "job_index": ${i + 1}, "bullets_concise": ["..."], "bullets_detailed": ["..."] }] }
Include one entry per job in the same order.`);

    const jobs = result.jobs || [];
    for (let j = 0; j < batch.length; j++) {
      const jobResult = jobs[j] || {};
      results.push({
        title: batch[j].title,
        company: batch[j].company,
        startDate: batch[j].startDate,
        endDate: batch[j].endDate,
        location: batch[j].location,
        bullets_concise: (jobResult.bullets_concise || []).map((b: string) => b.replace(/^[•\-*]\s*/, "")),
        bullets_detailed: (jobResult.bullets_detailed || []).map((b: string) => b.replace(/^[•\-*]\s*/, "")),
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════
// POST HANDLER
// ═══════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const { cvData } = await req.json();
    if (!cvData) {
      return NextResponse.json({ error: "Missing cvData" }, { status: 400 });
    }

    console.log("[Structured CV] Starting generation…");

    // Step 1: Classify industry
    console.log("[Structured CV] Classifying industry…");
    const industryCategory = await classifyIndustry(cvData);
    console.log(`[Structured CV] Industry: ${industryCategory}`);

    // Step 2: Generate 3 summary versions
    console.log("[Structured CV] Generating summary versions…");
    const summaryVersions = await generateSummaryVersions(cvData, industryCategory);
    console.log("[Structured CV] Summaries generated");

    // Step 3: Generate 2 bullet versions per experience
    console.log("[Structured CV] Generating bullet versions…");
    const experienceVersions = await generateBulletVersions(cvData, industryCategory);
    console.log(`[Structured CV] Bullets generated for ${experienceVersions.length} jobs`);

    const structuredCV = {
      industry_category: industryCategory,
      summary_short: summaryVersions.summary_short,
      summary_medium: summaryVersions.summary_medium,
      summary_long: summaryVersions.summary_long,
      experience_versions: experienceVersions,
      // Pass through unchanged sections
      personalInfo: cvData.personalInfo,
      skills: cvData.skills,
      education: cvData.education,
      certifications: cvData.certifications,
      languages: cvData.languages,
      tools: cvData.tools,
      memberships: cvData.memberships,
      volunteer: cvData.volunteer,
      projects: cvData.projects,
      interests: cvData.interests,
      referees: cvData.referees,
      declaration: cvData.declaration,
      boardRoles: cvData.boardRoles,
      executiveTraining: cvData.executiveTraining,
      publications: cvData.publications,
      areasOfExpertise: cvData.areasOfExpertise,
      internships: cvData.internships,
      keyAchievements: cvData.keyAchievements,
    };

    console.log("[Structured CV] ✓ Complete");
    return NextResponse.json({ structuredCV });
  } catch (err: any) {
    console.error("[Structured CV] Error:", err);
    return NextResponse.json(
      { error: err.message || "Structured CV generation failed" },
      { status: 500 }
    );
  }
}
