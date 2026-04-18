import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ATS CV Checker — How to Pass Automated CV Screening (Free)",
  description:
    "Most CVs are rejected before a human reads them. Learn exactly how ATS works, what causes failures, and how to fix your CV to get through.",
  alternates: { canonical: "https://fusecv.com/guides/ats-cv-checker" },
  openGraph: {
    title: "ATS CV Checker — How to Pass Automated CV Screening",
    description: "Most CVs are rejected before a human reads them. Learn exactly how ATS works and how to pass it.",
    url: "https://fusecv.com/guides/ats-cv-checker",
  },
};

const relatedGuides = [
  { slug: "best-cv-format-uk",          title: "Best CV Format in the UK" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews" },
  { slug: "improve-cv-fast",            title: "How to Improve Your CV Fast" },
];

export default function AtsCvCheckerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">ATS CV Checker</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        ATS CV Checker — How to Pass Automated Screening (Free)
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        Up to 75% of CVs are rejected by software before a recruiter sees them. Here is exactly how ATS filters work — and what to fix so yours gets through.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Check your CV against ATS requirements — free</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV scans your CV for ATS failures, rewrites problem areas, and delivers a clean, compliant version in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Check My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>What Is ATS and Why Does It Matter?</h2>
        <p>
          ATS stands for <strong>Applicant Tracking System</strong>. It is software used by employers — from large corporations to SMEs — to manage the volume of job applications they receive. When you apply online, your CV is almost always parsed and ranked by ATS before a human ever reads it.
        </p>
        <p>
          Studies suggest that <strong>between 70–75% of CVs never reach a recruiter</strong> because they are filtered or ranked so low that they are never opened. The ATS decides who gets seen based on formatting compatibility and keyword matching.
        </p>

        <h2>How ATS Actually Works</h2>
        <p>ATS systems do two things:</p>
        <ol>
          <li><strong>Parse your CV</strong> — extract text and structure it into fields: name, contact details, job titles, employers, dates, skills, education.</li>
          <li><strong>Score or rank your CV</strong> — compare it against the job description and rank you against other applicants.</li>
        </ol>
        <p>
          If the ATS cannot correctly parse your CV — because of complex formatting, tables, or graphics — your information ends up in the wrong fields or is lost entirely. You may have 10 years of relevant experience, but if the parser cannot find it, your score drops and your CV is deprioritised.
        </p>

        <h2>The 10 Most Common ATS Failures</h2>

        <h3>1. Tables and text boxes</h3>
        <p>Content inside tables and text boxes is often not parsed by ATS at all. Many popular CV templates use table layouts for side-by-side sections — avoid them entirely.</p>

        <h3>2. Headers and footers</h3>
        <p>Content placed in the document header or footer (contact details, page numbers) is frequently invisible to ATS parsers. Always put your contact information in the main body of the document.</p>

        <h3>3. Graphics, icons and images</h3>
        <p>Skill bars, charts, photos, or icons — none of this information can be parsed. The ATS simply ignores it, meaning any text rendered as part of an image is invisible to the system.</p>

        <h3>4. Non-standard section headings</h3>
        <p>ATS systems expect specific headings: "Work Experience", "Education", "Skills". Creative alternatives like "My Journey", "Where I've Been" or "What I Bring" confuse the parser. Stick to standard headings.</p>

        <h3>5. Missing keywords</h3>
        <p>ATS ranks CVs based on how closely they match the job description. If the role requires "stakeholder management" and your CV says "managing relationships with key partners", the ATS may not connect those two phrases. Use the exact language from the job posting.</p>

        <h3>6. Multi-column layouts</h3>
        <p>Two-column CVs look professional to a human eye but cause serious problems for ATS parsers. The system reads left to right, row by row — your left column content gets mixed with your right column content, producing gibberish.</p>

        <h3>7. Non-standard date formats</h3>
        <p>Use consistent, standard date formats: "January 2022 – March 2024" or "01/2022 – 03/2024". Inconsistent or creative date formatting causes ATS to misread your employment timeline.</p>

        <h3>8. Embedded fonts and special characters</h3>
        <p>Special bullet characters, decorative fonts, and symbols may render incorrectly or as garbled text when parsed. Use standard bullets (•) and common system fonts.</p>

        <h3>9. Wrong file format</h3>
        <p>Most ATS systems handle PDF and .docx well. Avoid .pages, .odt, or image files (JPG, PNG). When in doubt, upload both formats and test which parses better.</p>

        <h3>10. Keyword stuffing or hiding text</h3>
        <p>Some candidates try to game ATS by hiding white text on a white background. This is flagged as manipulation by modern systems and can lead to automatic disqualification.</p>

        <h2>How to Make Your CV ATS-Friendly</h2>
        <ul>
          <li>Use a single-column layout with clear section headings</li>
          <li>Put all contact details in the document body — not the header</li>
          <li>Use standard fonts: Arial, Calibri, Georgia (10–12pt body, 14–16pt name)</li>
          <li>Avoid tables, text boxes, images and graphics</li>
          <li>Use standard section headings: Work Experience, Education, Skills</li>
          <li>Mirror the language in the job description — especially job titles, tools and qualifications</li>
          <li>Save as PDF unless the portal specifies Word</li>
        </ul>

        <h2>How to Identify the Right Keywords</h2>
        <p>
          Read the job description carefully. Note every skill, tool, qualification, and phrase that appears — especially anything repeated or listed as a requirement. Then check your CV against that list:
        </p>
        <ul>
          <li>Do you have the specific tools mentioned? (e.g. Salesforce, JIRA, HubSpot)</li>
          <li>Do you use the same terminology for your role? (e.g. "P&amp;L management" vs "profit and loss responsibility")</li>
          <li>Are required qualifications named correctly? (e.g. "ACCA qualified" vs "accounting qualification")</li>
        </ul>
        <p>
          You do not need to keyword-stuff your CV — using each relevant keyword once in context is enough for most ATS systems.
        </p>

        <h2>Quick ATS Audit Checklist</h2>
        <ul>
          <li>☑ Single-column layout</li>
          <li>☑ No tables, text boxes, or images</li>
          <li>☑ Contact info in body (not header/footer)</li>
          <li>☑ Standard section headings</li>
          <li>☑ Standard font (Arial, Calibri, Georgia)</li>
          <li>☑ Keywords from the job description included</li>
          <li>☑ Consistent date format throughout</li>
          <li>☑ Saved as PDF or .docx</li>
        </ul>
      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Fix your ATS issues automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV analyses your CV, removes ATS-blocking elements, adds the right keywords, and produces a clean, parseable version — in 60 seconds.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Fix My CV Free &rarr;
        </Link>
      </div>

      <div className="mt-12">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Related guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`}
              className="block rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all">
              {g.title} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
