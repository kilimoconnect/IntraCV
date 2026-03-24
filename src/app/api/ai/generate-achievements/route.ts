import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured');
}

export async function POST(request: NextRequest) {
  // Check API key first
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const { experiences, summary, skills, education, certifications, projects, areasOfExpertise } = await request.json();

    if (!experiences || experiences.length === 0) {
      return NextResponse.json({ error: "No experiences provided" }, { status: 400 });
    }

    // Build comprehensive CV context
    const experienceContext = experiences.map((exp: any, index: number) => 
      `EXPERIENCE ${index + 1}:\nRole: ${exp.title || ""} at ${exp.company || ""}\nDates: ${exp.startDate || ""} - ${exp.endDate || "Present"}\nDescription: ${exp.description || ""}`
    ).join("\n\n");

    const educationContext = education ? education.map((edu: any, index: number) => 
      `EDUCATION ${index + 1}: ${edu.degree || ""} from ${edu.institution || ""} (${edu.year || ""})`
    ).join("\n") : "No education provided";

    const certificationContext = certifications ? certifications.map((cert: any, index: number) => 
      `CERTIFICATION ${index + 1}: ${cert.name || ""} from ${cert.issuer || ""} (${cert.year || ""})`
    ).join("\n") : "No certifications provided";

    const projectContext = projects ? projects.map((proj: any, index: number) => 
      `PROJECT ${index + 1}: ${proj.name || ""}\nDescription: ${proj.description || ""}\nTechnologies: ${proj.tech || ""}`
    ).join("\n\n") : "No projects provided";

    const expertiseContext = areasOfExpertise ? areasOfExpertise.map((area: any) => area.name || area).join(", ") : "No specific expertise listed";

    const prompt = `EVALUATE THE ENTIRE CV and generate 3-5 powerful achievement statements that showcase the candidate's overall career impact.

COMPLETE CV PROFILE:
${experienceContext}

${educationContext}

${certificationContext}

${projectContext}

PROFESSIONAL SUMMARY: ${summary || "No summary provided"}

KEY SKILLS: ${skills?.join(", ") || "No skills listed"}

AREAS OF EXPERTISE: ${expertiseContext}

ANALYSIS REQUIREMENTS:
- Evaluate ALL experiences, education, certifications, projects, and skills
- Identify patterns of excellence, career progression, and key impact areas
- Look for quantified achievements, leadership growth, technical expertise, and strategic contributions
- Consider the full career trajectory and overall professional value
- Extract achievements that represent the candidate's best work across their entire career

ACHIEVEMENT REQUIREMENTS:
- Each achievement should be one complete sentence (40-80 characters)
- Focus on measurable impact, leadership, process improvements, or strategic contributions
- Include quantified results when possible (% improvements, $ savings, time reductions)
- Use strong action verbs (Implemented, Led, Developed, Managed, Optimized, Transformed, etc.)
- Make them impressive but realistic based on the complete CV profile
- Do not use bullet points or numbering

Return JSON: {"achievements": ["achievement1", "achievement2", "achievement3"]}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional CV writer who excels at extracting and crafting compelling achievement statements from work experience."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({ 
      achievements: parsed.achievements || [
        "Successfully led key initiatives delivering measurable business impact",
        "Implemented process improvements resulting in significant efficiency gains", 
        "Managed cross-functional teams to achieve strategic organizational goals"
      ]
    });

  } catch (err: any) {
    console.error("Achievement generation error:", err);
    return NextResponse.json(
      { error: err.message || "Achievement generation failed" },
      { status: 500 }
    );
  }
}
