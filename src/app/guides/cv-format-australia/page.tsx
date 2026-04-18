import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CV Format Australia — Australian CV Guide (2026)",
  description:
    "How to write a CV for the Australian job market. Format, length, sections, what Australian employers expect, and common mistakes to avoid.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-australia" },
  openGraph: {
    title: "CV Format Australia — Australian CV Guide (2026)",
    description: "How to write a CV for Australian employers — format, length, sections and common mistakes.",
    url: "https://fusecv.com/guides/cv-format-australia",
  },
};
const relatedGuides = [
  { slug: "cv-vs-resume",       title: "CV vs Resume — Key Differences" },
  { slug: "how-to-write-a-cv",  title: "How to Write a CV" },
  { slug: "ats-cv-checker",     title: "ATS CV Checker" },
];
export default function CvFormatAustraliaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Australia</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Australia — Australian CV Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Australian CVs follow a similar format to the UK — but there are specific expectations, including a referee section, that differ from other markets. Here is everything you need to know.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Australian CV ready in 60 seconds</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV reformats and rewrites your CV to Australian job market standards — ATS-optimised instantly.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Australian CV vs UK CV — What's Different?</h2>
        <ul>
          <li><strong>Referees:</strong> Australian CVs often include 2–3 referee names and contact details at the bottom — this is more common than in the UK, where "references available on request" is the norm.</li>
          <li><strong>Career summary:</strong> A strong, targeted career objective or summary is expected at the top — Australian employers value directness.</li>
          <li><strong>Length:</strong> 2–4 pages is standard for experienced professionals. Australians generally accept slightly longer CVs than US employers.</li>
          <li><strong>Spelling:</strong> Australian English — "organisation" not "organization", "colour" not "color".</li>
          <li><strong>No photo:</strong> Do not include a photo unless specifically requested (rare in corporate roles).</li>
        </ul>
        <h2>Australian CV Structure</h2>
        <h3>1. Personal Details</h3>
        <p>Full name, phone (Australian mobile: 04XX XXX XXX), professional email, LinkedIn URL, suburb and state (not full address). Include your right to work if relevant (e.g., "Australian Permanent Resident" or "Working Holiday Visa holder").</p>
        <h3>2. Career Objective / Professional Summary</h3>
        <p>3–4 lines summarising your experience, speciality and career direction. Australian employers appreciate clarity about what you are looking for — unlike UK CVs, a brief objective can be appropriate here. Example: "Experienced civil engineer with 9 years of experience in infrastructure and transport projects across NSW and Victoria. Seeking a senior project engineer role with a Tier 1 contractor on major infrastructure works."</p>
        <h3>3. Key Skills / Core Competencies</h3>
        <p>A brief bullet list of your top 6–10 relevant skills. This is more commonly included in Australian CVs than UK ones — it helps recruiters scan for specific capabilities quickly.</p>
        <h3>4. Work Experience (Reverse Chronological)</h3>
        <p>Company name, job title, dates, location. 4–6 bullet points per role focusing on achievements and outcomes. Quantify where possible. Lead with strong action verbs.</p>
        <h3>5. Education and Qualifications</h3>
        <p>Degree/certificate, institution, year. Include any relevant licences (e.g., Class C Driver's Licence), trade qualifications, or industry certifications (e.g., White Card for construction).</p>
        <h3>6. Professional Memberships (if applicable)</h3>
        <p>Engineers Australia, CPA Australia, AIPM, AHRI, etc. These carry weight with Australian employers and demonstrate professional commitment.</p>
        <h3>7. Referees</h3>
        <p>List 2–3 professional referees with name, title, company, phone, and email. Always get permission before listing someone as a referee. If you prefer not to list them, "Referees available upon request" is acceptable — though listing them is more common in Australia.</p>
        <h2>What Australian Employers Look For</h2>
        <ul>
          <li><strong>STAR-formatted achievements:</strong> Situation, Task, Action, Result — many Australian employers and their recruiters expect this type of evidence-based writing.</li>
          <li><strong>Industry-specific certifications:</strong> Mining, construction, healthcare and government roles in particular have mandatory licences and certifications that must appear prominently.</li>
          <li><strong>Cultural fit signals:</strong> Volunteering, community involvement, and extracurricular leadership are valued — especially in SMEs and government roles.</li>
        </ul>
        <h2>Cover Letter in Australia</h2>
        <p>Cover letters are expected in Australia — more so than in the US. Even for roles that don't explicitly ask for one, submitting a tailored cover letter demonstrates interest and effort. Keep it to 3–4 paragraphs (350–450 words), directly addressing the selection criteria listed in the job posting.</p>
        <h2>Key Sectors and CV Tips</h2>
        <ul>
          <li><strong>Mining and resources:</strong> Include FIFO (Fly-In Fly-Out) experience if applicable, safety certifications, equipment competencies</li>
          <li><strong>Healthcare:</strong> AHPRA registration number, state-specific requirements, clinical competencies</li>
          <li><strong>Government (APS):</strong> Selection criteria-based applications — each criterion addressed separately, often with 250–400 words each</li>
          <li><strong>Tech:</strong> Standard international format — GitHub, portfolio, specific tech stack prominent</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your Australian CV optimised automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV to the standard Australian employers expect — in 60 seconds.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My CV Free &rarr;</Link>
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
