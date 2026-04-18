import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format Canada — Canadian Resume Guide (2026)",
  description: "How to write a CV or resume for the Canadian job market. Length, sections, what Canadian employers expect, and tips for international applicants.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-canada" },
  openGraph: { title: "CV Format Canada — Canadian Resume Guide (2026)", description: "How to format a resume for Canadian employers — length, sections and common mistakes.", url: "https://fusecv.com/guides/cv-format-canada" },
};
const relatedGuides = [
  { slug: "resume-format-usa",   title: "Resume Format USA" },
  { slug: "cv-vs-resume",        title: "CV vs Resume — Key Differences" },
  { slug: "ats-cv-checker",      title: "ATS CV Checker" },
];
export default function CvFormatCanadaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Canada</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Canada — Canadian Resume Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Canadian employers generally use the term "resume" and follow a format closer to the US than the UK — but with some important differences. Here is what you need to know to apply successfully in Canada.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Canadian resume ready in 60 seconds</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV reformats and rewrites your resume to Canadian standards — ATS-optimised instantly.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My Resume Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Resume vs CV in Canada</h2>
        <p>In Canada, "resume" is the standard term for a job application document in the private sector. "CV" is typically used in academic, research, and medical contexts — similar to the US. However, the terms are sometimes used interchangeably, and submitting a well-formatted 2-page document under either name is generally fine.</p>
        <h2>Canadian Resume Format</h2>
        <ul>
          <li><strong>Length:</strong> 1–2 pages for most candidates. Senior executives may go to 3 pages.</li>
          <li><strong>No photo:</strong> Canadian human rights legislation protects against discrimination. Never include a photo.</li>
          <li><strong>No personal details:</strong> No date of birth, SIN (Social Insurance Number), marital status, or nationality on your resume.</li>
          <li><strong>Language:</strong> Canadian English uses British spellings for some words ("colour", "organisation") but American spellings for others — check the company's usage and match it.</li>
          <li><strong>Bilingual note:</strong> If you are applying for roles in Quebec or bilingual roles across Canada, French proficiency is valuable. Note your French level clearly in a Languages section.</li>
        </ul>
        <h2>Canadian Resume Structure</h2>
        <h3>Contact Information</h3>
        <p>Full name, Canadian phone number (format: 416-555-0192), professional email, LinkedIn URL, city and province. Do not include your full street address.</p>
        <h3>Professional Summary</h3>
        <p>3–4 lines. State your experience level, speciality and strongest credential. Example: "Chartered accountant (CPA, CA) with 9 years of experience in public practice and industry across Ontario and British Columbia. Specialised in corporate tax, M&amp;A due diligence, and financial reporting. Seeking a senior finance manager or controller role at a growth-stage company."</p>
        <h3>Work Experience</h3>
        <p>Reverse chronological. Each role: company name, city and province, job title, dates (Month Year format). 4–6 bullet points per role focused on achievements with numbers.</p>
        <h3>Education</h3>
        <p>Degree, university (Canadian institutions are well-recognised; international degrees should note equivalency if not obvious), graduation year. If you are a new immigrant, note ICES/WES credential assessment if you have obtained one.</p>
        <h3>Certifications and Professional Designations</h3>
        <p>Key Canadian professional designations to list prominently: CPA (Chartered Professional Accountant), P.Eng (Professional Engineer), PMP (Project Management Professional), CSC (Canadian Securities Course), CHRP/CHRL (HR), RPN/RN (nursing), and others specific to your profession.</p>
        <h2>Applying to Canadian Jobs From Abroad</h2>
        <ul>
          <li>Address your immigration status clearly in your cover letter — many Canadian employers can sponsor Express Entry candidates, but they need to know upfront</li>
          <li>If you hold an LMIA-exempt work permit (IEC, PGWP, etc.), state it — it makes the hiring process much simpler for the employer</li>
          <li>Get your foreign credentials assessed by WES (World Education Services) — this is strongly recommended and expected by most professional employers</li>
          <li>Note if you are currently in Canada (e.g., "Currently located in Toronto — eligible to work in Canada")</li>
        </ul>
        <h2>ATS in Canada</h2>
        <p>Large Canadian employers — banks, telecoms, mining companies, government — use ATS extensively. The same rules apply as everywhere: single column layout, standard section headings, no tables or images, keywords from the job description. Government of Canada positions go through a rigorous screening process — tailor every application carefully to the Statement of Merit Criteria.</p>
        <h2>Quebec and French-Language CVs</h2>
        <p>For roles in Quebec, your CV should be in French (or bilingual French/English for federally regulated roles). Quebec HR and staffing practices also differ somewhat — cover letters are more commonly expected, and the CV format may include slightly more personal context than in English Canada.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your Canadian resume optimised automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your resume to the standard Canadian employers expect — in 60 seconds.</p>
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
