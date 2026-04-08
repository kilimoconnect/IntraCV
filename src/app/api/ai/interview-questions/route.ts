import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const openai = openaiClient();
    const { jobRole, company, jobDescription, action, question, answer, existingQuestions, count, startId, profileContext } = await req.json();

    // Generate interview questions
    if (action === "generate") {
      if (!jobRole) {
        return NextResponse.json({ error: "Job role is required" }, { status: 400 });
      }

      const numToGenerate = Math.max(1, Math.min(20, count || 5));
      const idOffset = startId || 1;

      const jdContext = jobDescription
        ? `\n\nThe job description is:\n"""\n${jobDescription.slice(0, 3000)}\n"""\n\nUse the specific requirements, responsibilities, and qualifications from this job description to tailor the questions. Reference specific skills, tools, or responsibilities mentioned in the JD.`
        : "";

      const profileCtx = profileContext
        ? `\n\nCANDIDATE PROFILE (use this to personalise questions — reference their actual experience, skills, and background):\n${profileContext}\n`
        : "";

      const existingContext = existingQuestions?.length
        ? `\n\nALREADY ASKED (do NOT repeat or rephrase these):\n${existingQuestions.map((q: any, i: number) => `${i + 1}. ${q.question}`).join("\n")}\n`
        : "";

      const prompt = `Generate ${numToGenerate} realistic interview questions for a "${jobRole}" position${company ? ` at ${company}` : ""}.${jdContext}${profileCtx}${existingContext}

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
      "tips": "Brief tip on how to approach this question"
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert interview coach. Generate realistic, challenging interview questions. You MUST return ONLY valid JSON with a 'questions' key containing the array. No other text." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: "No response from AI" }, { status: 500 });
      }

      // Strip markdown fences if present (model may wrap JSON in ```json ... ```)
      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed[Object.keys(parsed)[0]] || [];

      return NextResponse.json({ questions });
    }

    // Provide feedback on an answer
    if (action === "feedback") {
      if (!question || !answer) {
        return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
      }

      const prompt = `You are an expert interview coach. Evaluate this interview answer and provide constructive feedback.

Interview Question: "${question}"
Candidate's Answer: "${answer}"

Provide feedback in this JSON format:
{
  "score": <number 1-10>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "suggestedAnswer": "A brief model answer or key points to include",
  "overallFeedback": "2-3 sentence summary of the feedback"
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
      if (!content) {
        return NextResponse.json({ error: "No response from AI" }, { status: 500 });
      }

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
