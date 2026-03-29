import { NextRequest, NextResponse } from "next/server";
import { openaiClient } from "@/lib/openai";

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
    const { experiences, personalInfo, summary, skills, education, certifications } = await request.json();

    if (!experiences || experiences.length === 0) {
      return NextResponse.json({ error: "No experiences provided" }, { status: 400 });
    }

    // Build comprehensive CV context for reference generation
    const experienceContext = experiences.map((exp: any, index: number) => 
      `EXPERIENCE ${index + 1}:\nRole: ${exp.title || ""} at ${exp.company || ""}\nDates: ${exp.startDate || ""} - ${exp.endDate || "Present"}\nDescription: ${exp.description || ""}`
    ).join("\n\n");

    const educationContext = education ? education.map((edu: any, index: number) => 
      `EDUCATION ${index + 1}: ${edu.degree || ""} from ${edu.institution || ""} (${edu.year || ""})`
    ).join("\n") : "No education provided";

    const skillsContext = skills ? skills.slice(0, 10).map((s: any) => s.name || s).join(", ") : "No specific skills listed";

    const careerLevel = experiences.length > 5 ? "senior" : experiences.length > 2 ? "mid-level" : "junior";
    const mostRecentRole = experiences[0]?.title || "Professional";
    const mostRecentCompany = experiences[0]?.company || "Company";

    const prompt = `EVALUATE THE ENTIRE CV and generate 2-3 professional references who would provide strong recommendations for this candidate.

COMPLETE CV PROFILE:
${experienceContext}

${educationContext}

PROFESSIONAL SUMMARY: ${summary || "No summary provided"}

KEY SKILLS: ${skillsContext}

CANDIDATE NAME: ${personalInfo?.fullName || "Professional"}
CAREER LEVEL: ${careerLevel}
MOST RECENT ROLE: ${mostRecentRole}
MOST RECENT COMPANY: ${mostRecentCompany}

ANALYSIS REQUIREMENTS:
- Evaluate ALL experiences, education, and skills to understand the candidate's career trajectory
- Identify the most appropriate reference providers (supervisors, senior managers, project leads)
- Consider career level and seniority when determining reference titles
- Look for patterns of leadership, technical expertise, and professional growth
- Create references that would logically have worked closely with the candidate

REFERENCE REQUIREMENTS:
- Create realistic references who would have supervised or worked closely with the candidate
- Each reference should have: name, job title, company, phone, email
- Names should sound professional and realistic for the industry
- Job titles should be appropriate for the candidate's career level and recent roles
- Companies should match where the candidate actually worked
- Phone numbers should be realistic format (xxx-xxx-xxxx)
- Emails should be professional format (firstname.lastname@company.com)
- Make them sound like strong, positive references who can attest to the candidate's abilities
- Consider the full career context when determining appropriate reference relationships

Return JSON: {"references": [{"name": "", "title": "", "company": "", "phone": "", "email": ""}]}`;

    const openai = openaiClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional CV writer who creates realistic and appropriate professional references."
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
      references: parsed.references || [
        {
          name: "John Smith",
          title: "Senior Manager", 
          company: experiences[0]?.company || "Previous Company",
          phone: "555-123-4567",
          email: "john.smith@company.com"
        },
        {
          name: "Sarah Johnson",
          title: "Director",
          company: experiences[0]?.company || "Previous Company", 
          phone: "555-987-6543",
          email: "sarah.johnson@company.com"
        }
      ]
    });

  } catch (err: any) {
    console.error("Reference generation error:", err);
    return NextResponse.json(
      { error: err.message || "Reference generation failed" },
      { status: 500 }
    );
  }
}
