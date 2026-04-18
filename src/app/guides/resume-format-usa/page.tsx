import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume Format USA — American Resume Guide (2026)",
  description:
    "How to format a resume for the US job market. Length, sections, ATS rules, what Americans expect — and what trips up international applicants.",
  alternates: { canonical: "https://fusecv.com/guides/resume-format-usa" },
  openGraph: {
    title: "Resume Format USA — American Resume Guide (2026)",
    description: "How to format a resume for US employers — length, sections, ATS, and what international applicants get wrong.",
    url: "https://fusecv.com/guides/resume-format-usa",
  },
};
const relatedGuides = [
  { slug: "cv-vs-resume",            title: "CV vs Resume — Key Differences" },
  { slug: "ats-cv-checker",          title: "ATS CV Checker" },
  { slug: "resume-summary-examples", title: "Resume Summary Examples" },
];
export default function ResumeFormatUsaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Resume Format USA</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Resume Format USA — American Resume Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">The US resume has specific conventions that differ from UK and international CVs. Here is exactly what American employers expect — and the common mistakes international job seekers make.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your resume formatted for the US market</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites and reformats your resume to US standards — ATS-ready in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My Resume Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>US Resume vs UK CV — Key Differences</h2>
        <ul>
          <li><strong>Length:</strong> 1 page for 0–8 years experience; 2 pages for senior professionals. US employers are more strict about length than UK recruiters.</li>
          <li><strong>No photo:</strong> Never include a photo on a US resume. It creates legal risk for employers (discrimination claims).</li>
          <li><strong>No personal details:</strong> No date of birth, nationality, marital status, or Social Security number on a resume.</li>
          <li><strong>Objective vs Summary:</strong> Modern US resumes use a "resume summary" rather than an old-style "objective". Objectives are considered outdated.</li>
          <li><strong>Spelling:</strong> Use American English — "color" not "colour", "organization" not "organisation", "analyze" not "analyse".</li>
        </ul>
        <h2>US Resume Structure</h2>
        <h3>1. Header</h3>
        <p>Full name (large, prominent), phone number (US format: 555-867-5309), professional email, LinkedIn URL, city and state (not full address), and optionally GitHub or portfolio URL for tech roles.</p>
        <h3>2. Resume Summary (3–4 lines)</h3>
        <p>A concise positioning statement. Lead with years of experience, job title/speciality, and top achievement. Example: "Senior product manager with 8 years of experience at SaaS companies. Launched 3 products that collectively reached $12M ARR. Expert in Agile methodology, roadmap prioritisation and cross-functional team leadership."</p>
        <h3>3. Work Experience</h3>
        <p>Reverse chronological. Each role: company name, job title, city/state, dates (month/year). 3–5 bullet points per role using the PAR formula: Problem → Action → Result. Start every bullet with an action verb. Quantify wherever possible.</p>
        <h3>4. Education</h3>
        <p>Degree, major, university name, graduation year. GPA only if above 3.5 and you graduated within the past 3 years. Omit high school once you have a college degree.</p>
        <h3>5. Skills</h3>
        <p>Hard skills only — software, tools, methodologies, certifications. List as a clean bulleted or comma-separated list.</p>
        <h3>6. Certifications (if applicable)</h3>
        <p>PMP, AWS, Google Analytics, Salesforce, etc. Include certification name, issuing body, and year.</p>
        <h2>US Resume Formatting Rules</h2>
        <ul>
          <li>Font: Calibri, Arial, or Garamond — 10–12pt body, 14–16pt name</li>
          <li>Margins: 0.5–1 inch on all sides</li>
          <li>Single column layout (ATS-safe)</li>
          <li>Clean, minimal design — no decorative graphics or coloured headers</li>
          <li>Save as PDF or .docx — check what the company's ATS accepts</li>
          <li>File name: FirstnameLastname_Resume.pdf</li>
        </ul>
        <h2>ATS in the US — More Aggressive Than Most Markets</h2>
        <p>US employers — especially large corporations and tech companies — rely heavily on ATS. Greenhouse, Workday, Lever, iCIMS and Taleo are among the most common. These systems parse your resume for keyword matches against the job description.</p>
        <ul>
          <li>Use the exact job title from the posting in your summary</li>
          <li>Include all tools and technologies mentioned in the job description that you actually have</li>
          <li>Avoid PDF if the ATS portal has issues — test with .docx if you receive no responses</li>
        </ul>
        <h2>Mistakes International Applicants Make on US Resumes</h2>
        <ul>
          <li>Sending a 3-page CV — US employers expect concise, especially at junior/mid levels</li>
          <li>Using UK/Australian spelling — "colour", "organised" stands out immediately</li>
          <li>Including a photo — automatic disqualification at many companies</li>
          <li>Writing a street address instead of just city and state</li>
          <li>Listing "References available upon request" — unnecessary and dated</li>
          <li>Using European date format (DD/MM/YYYY) instead of MM/DD/YYYY</li>
          <li>Not addressing work authorisation — if you are not a US citizen/permanent resident, many companies ask about this early. You do not need to mention it on the resume but be ready to address it in the application.</li>
        </ul>
        <h2>The Cover Letter in the US</h2>
        <p>Cover letters are less expected in the US than in the UK — many US job applications do not require or expect one. However, when a job posting explicitly requests one, or when you are applying directly to a small company or start-up, a strong cover letter can differentiate you significantly.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your resume ready for the US market</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV formats and rewrites your resume to American standards — the right length, the right language, ATS-optimised.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Resume Free &rarr;</Link>
      </div>
      <div className="mt-12">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Related guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="block rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all">{g.title} &rarr;</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
