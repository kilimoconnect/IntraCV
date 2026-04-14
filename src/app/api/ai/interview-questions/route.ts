import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { FREE_QUOTA, PAID_BATCH } from "@/lib/interview-constants";

async function getUsage(userId: string) {
  const admin = createAdminSupabase();
  const { data } = await admin
    .from("profiles")
    .select("interview_questions_generated, interview_questions_paid_quota")
    .eq("id", userId)
    .single();
  const generated = data?.interview_questions_generated ?? 0;
  const paidQuota = data?.interview_questions_paid_quota ?? 0;
  const totalAllowed = FREE_QUOTA + paidQuota;
  const remaining = Math.max(0, totalAllowed - generated);
  return { generated, paidQuota, totalAllowed, remaining };
}

async function incrementGenerated(userId: string, count: number) {
  const admin = createAdminSupabase();
  await admin.rpc("add_interview_generated", { uid: userId, n: count });
}

export async function POST(req: NextRequest) {
  try {
    const openai = openaiClient();
    const body = await req.json();
    const { jobRole, company, jobDescription, action, question, answer,
            existingQuestions, count, startId, profileContext } = body;

    // ─── Auth ───
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();

    // Generate interview questions
    if (action === "generate") {
      // Auth is required to enforce quota
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!jobRole) {
        return NextResponse.json({ error: "Job role is required" }, { status: 400 });
      }

      const requested = Math.max(1, Math.min(20, count || 5));

      // ── Quota check ──
      const usage = await getUsage(user.id);
      if (usage.remaining <= 0) {
        return NextResponse.json({
          error: "quota_exceeded",
          usage: { generated: usage.generated, paidQuota: usage.paidQuota, remaining: 0, freeQuota: FREE_QUOTA, paidBatch: PAID_BATCH },
        }, { status: 402 });
      }

      // Cap to remaining quota
      const u2 = await getUsage(user.id);
      let actualCount = Math.min(requested, u2.remaining);

      const idOffset = startId || 1;

      const jdContext = jobDescription
        ? `\n\nThe job description is:\n"""\n${jobDescription.slice(0, 3000)}\n"""\n\nUse the specific requirements, responsibilities, and qualifications from this job description to tailor the questions. Reference specific skills, tools, or responsibilities mentioned in the JD.`
        : "";

      const profileCtx = profileContext
        ? `\n\nCANDIDATE PROFILE — you MUST use this to personalise questions. Reference their specific job titles, companies, projects, achievements, tools, and skills. Ask about real situations from their background rather than generic scenarios:\n${profileContext}\n`
        : "";

      const existingContext = existingQuestions?.length
        ? `\n\nALREADY ASKED (do NOT repeat or rephrase these):\n${existingQuestions.map((q: any, i: number) => `${i + 1}. ${q.question}`).join("\n")}\n`
        : "";

      const prompt = `Generate ${actualCount} realistic interview questions for a "${jobRole}" position${company ? ` at ${company}` : ""}.${jdContext}${profileCtx}${existingContext}

${!existingQuestions?.length ? `Include a mix of:
- 1 behavioral question (STAR method)
- 1 technical/role-specific question
- 1 situational question
- 1 competency-based question
- 1 culture-fit or motivational question` : `Include a variety of question types (behavioral, technical, situational, competency, culture-fit). Do not repeat any already-asked questions.`}

Return ONLY valid JSON. Use sequential IDs starting from ${idOffset}:
{
  "questions": [
    {
      "id": ${idOffset},
      "question": "The interview question text",
      "type": "behavioral" | "technical" | "situational" | "competency" | "culture-fit",
      "tips": "Detailed guidance: explain the best framework or structure to use (e.g. STAR for behavioral), 2-3 specific things the interviewer is looking for, what concrete examples or evidence to draw on, and one common mistake to avoid. 3-5 sentences."
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert interview coach. Generate realistic, deeply personalised interview questions that reference the candidate's actual background, experience, tools, and achievements. If a candidate profile is provided, ALWAYS weave in specifics from it. You MUST return ONLY valid JSON with a 'questions' key containing the array. No other text." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return NextResponse.json({ error: "No response from AI" }, { status: 500 });

      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed[Object.keys(parsed)[0]] || [];

      // ── Increment lifetime counter ──
      if (questions.length > 0) {
        await incrementGenerated(user.id, questions.length);
      }

      // Return usage info so client can refresh display
      const updatedUsage = await getUsage(user.id);

      return NextResponse.json({ questions, usage: updatedUsage });
    }

    // Provide feedback on an answer
    if (action === "feedback") {
      if (!question || !answer) {
        return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
      }

      const prompt = `You are an expert interview coach. Evaluate this interview answer and provide detailed, constructive feedback.

Interview Question: "${question}"
Candidate's Answer: "${answer}"

Provide feedback in this JSON format:
{
  "score": <number 1-10>,
  "strengths": ["specific strength with explanation", "another strength with why it works"],
  "improvements": ["specific improvement with how to fix it", "another actionable improvement"],
  "suggestedAnswer": "A comprehensive model answer (4-6 sentences) showing the ideal structure, key points to cover, specific language or frameworks to use (e.g. STAR), and how to close strongly. Write it as if delivering the answer in an interview.",
  "overallFeedback": "A detailed paragraph (4-5 sentences) covering: what the candidate did well, what is missing or weak, how the answer would land with a hiring manager, and one specific action to improve for next time."
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a supportive but honest interview coach. Give actionable feedback. You MUST return ONLY valid JSON. No other text." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return NextResponse.json({ error: "No response from AI" }, { status: 500 });

      const cleanedFb = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const feedback = JSON.parse(cleanedFb);
      return NextResponse.json({ feedback });
    }

    return NextResponse.json({ error: "Invalid action. Use 'generate' or 'feedback'." }, { status: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Interview questions error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
