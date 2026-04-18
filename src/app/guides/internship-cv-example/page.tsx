import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Internship CV Example — How to Write a CV for an Internship (No Experience)",
  description: "How to write a CV for an internship with no work experience — what to include, how to structure it, and the mistakes that get internship applications rejected.",
  alternates: { canonical: "https://fusecv.com/guides/internship-cv-example" },
  openGraph: { title: "Internship CV Example — How to Write a CV for an Internship", description: "How to write a CV for an internship with no work experience — structure, sections and examples.", url: "https://fusecv.com/guides/internship-cv-example" },
};
const relatedGuides = [
  { slug: "graduate-cv-no-experience", title: "Graduate CV With No Experience" },
  { slug: "resume-summary-examples",   title: "Resume Summary Examples" },
  { slug: "cover-letter-example-uk",   title: "Cover Letter Example UK" },
];
export default function InternshipCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Internship CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Internship CV Example — How to Write a CV for an Internship</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Internship applications are competitive — especially at top companies. Here is exactly how to write a CV that gets you shortlisted, even if you have no formal work experience.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your internship CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites and formats your internship CV to the professional standard that top employers expect — in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Companies Are Actually Looking For in an Intern</h2>
        <p>When a company reviews an internship application, they are not expecting years of experience. They are asking three questions: Is this person genuinely interested in this field? Do they show initiative and intellectual curiosity? Can they communicate clearly and professionally? Your CV should answer all three — even if your experience is limited.</p>
        <h2>Internship CV Structure</h2>
        <h3>1. Contact Details</h3>
        <p>Name, phone, professional email, LinkedIn URL (set it up if you haven't), university, city. Keep it simple and clean at the top.</p>
        <h3>2. Personal Statement / Career Objective (3–4 lines)</h3>
        <p>For an internship CV, a brief objective is appropriate — unlike experienced professional CVs where objectives are outdated. State your degree subject, year, your specific area of interest, and what you want to contribute. Example: "Third-year Economics student at the University of Edinburgh with a strong interest in investment banking and financial markets. Completed Bloomberg Market Concepts certification and participated in the Edinburgh University Finance Society's simulated trading competition. Seeking a summer analyst internship in investment banking or corporate finance."</p>
        <h3>3. Education</h3>
        <p>For internship CVs, education comes before work experience because your degree is your primary credential. Include: university, degree subject, expected classification or current grade (if strong), graduation year, relevant modules. Also include A-level/high school grades if they are strong and you are in your first or second year.</p>
        <h3>4. Work Experience (Any You Have)</h3>
        <p>Include everything — part-time jobs, volunteering, previous internships, work shadowing. Even a retail or hospitality job demonstrates reliability, customer interaction, and the ability to work in a team. Format it the same as a professional CV: company, role, dates, bullet points. Do not dismiss it because it seems unrelated.</p>
        <h3>5. Projects and Academic Work</h3>
        <p>A dedicated projects section is important for internship CVs — especially for tech, finance, engineering, and research roles. Include: final-year dissertation (title, brief description, methodology), group or individual projects relevant to the industry, hackathon participation, case study competitions, research assistant roles, and any independent study you have done in the field.</p>
        <h3>6. Extracurricular Activities and Societies</h3>
        <p>University societies, sports captaincies, student union roles, committee positions — these demonstrate exactly what internship employers want to see: initiative, leadership, time management, and ability to contribute to teams beyond what is required of you. Do not omit this section.</p>
        <h3>7. Skills</h3>
        <p>Technical skills: programming languages, software, data tools, financial modelling, laboratory equipment (depending on the field). Language proficiency. Any certifications relevant to the role (Bloomberg BMC, Google Analytics, AWS Cloud Practitioner, Coursera, etc.).</p>
        <h3>8. Awards and Achievements</h3>
        <p>Scholarships, academic prizes, competitive results, recognition for extracurricular contributions. These are particularly useful for internship CVs where work experience is limited.</p>
        <h2>Internship CV Length</h2>
        <p>One page only. No exceptions. If your CV is spilling onto a second page and you are applying for your first internship, you are padding — cut it back.</p>
        <h2>Internship CV by Industry</h2>
        <ul>
          <li><strong>Investment banking / finance:</strong> Financial modelling skills, Bloomberg BMC, relevant coursework (valuation, corporate finance), stock pitch competition experience, Finance Society involvement</li>
          <li><strong>Technology / software:</strong> GitHub profile with active repositories, programming languages, hackathon participation, open-source contributions, personal projects with descriptions</li>
          <li><strong>Consulting:</strong> Case study competition experience, analytical problem-solving evidence, leadership in societies, strong academic performance</li>
          <li><strong>Law:</strong> Mooting, law clinics, pro bono experience, law review/journal, vacation scheme (if any previous ones completed)</li>
          <li><strong>Marketing:</strong> Social media management for a society or small business, any campaign work, writing samples, Google/HubSpot certifications</li>
          <li><strong>Engineering:</strong> Final year project, MATLAB/AutoCAD/SolidWorks proficiency, relevant lab experience, engineering society projects</li>
        </ul>
        <h2>Cover Letter for Internship Applications</h2>
        <p>Most competitive internship programmes (banking, consulting, law, Big Tech) require a cover letter or motivational statement. This is where you explain specifically why you want this company and this industry — not just "because I want to learn." Do your research. Reference specific teams, products, recent deals, or company initiatives. Generic cover letters are immediately visible and almost never progress.</p>
        <h2>Common Internship CV Mistakes</h2>
        <ul>
          <li>Two-page CV with little real content — padding with irrelevant detail</li>
          <li>No projects section — missing the biggest differentiator for student CVs</li>
          <li>Generic objective statement — "seeking a challenging role to develop my skills"</li>
          <li>Not tailoring the CV to the specific firm or industry</li>
          <li>Listing every GCSE subject — only A-levels and degree are needed</li>
          <li>No quantification — even society-level work can have numbers (100 members, £5K raised, 3 events organised)</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your internship CV to the right standard</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your internship CV with the professional language and structure that top employers expect to see.</p>
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
