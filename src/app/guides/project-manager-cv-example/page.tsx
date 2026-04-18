import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Project Manager CV Example — How to Write a PM CV That Gets Interviews",
  description: "A complete project manager CV guide — sections, bullet point examples, certifications to include, and how to quantify your delivery record for any industry.",
  alternates: { canonical: "https://fusecv.com/guides/project-manager-cv-example" },
  openGraph: { title: "Project Manager CV Example", description: "How to write a project manager CV that gets interviews — with bullet examples and certification guidance.", url: "https://fusecv.com/guides/project-manager-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",   title: "Resume Summary Examples" },
  { slug: "executive-cv-example",      title: "Executive CV Example" },
  { slug: "ats-cv-checker",            title: "ATS CV Checker" },
];
export default function ProjectManagerCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Project Manager CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Project Manager CV Example — How to Write a PM CV That Gets Interviews</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Project managers are judged on delivery — so your CV needs to prove it. Here is exactly how to structure a PM CV, write delivery-focused bullet points, and position your certifications correctly.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your PM CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your project manager CV to highlight delivery, scope, budget and outcomes — the metrics hiring managers actually want to see.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Hiring Managers Look for in a PM CV</h2>
        <p>When a hiring manager reviews a project manager CV, they are looking for evidence of four things: scale (how large were the projects?), delivery (did you actually deliver?), methodology (how do you manage projects?), and stakeholder complexity (who did you work with?). Your CV must answer all four — clearly and quickly.</p>
        <h2>Project Manager CV Structure</h2>
        <h3>Professional Summary</h3>
        <p>Lead with your methodology credentials, years of experience, industry background, and the scale of what you have managed. Example: "PRINCE2 Practitioner and PMP-certified project manager with 10 years of experience delivering IT and digital transformation projects in financial services. Managed programmes up to £8M in value across distributed teams of 40+. Consistent track record of on-time, within-budget delivery in regulated environments."</p>
        <h3>Core Competencies</h3>
        <p>Include: project/programme methodologies (Agile, PRINCE2, Waterfall, Scrum, SAFe), tools (JIRA, MS Project, Smartsheet, Asana, Monday.com), and PM competencies (risk management, stakeholder management, change management, benefits realisation, resource planning).</p>
        <h3>Work Experience — How to Write PM Bullets</h3>
        <p>Every bullet should include at least one of: budget size, team size, timeline, project scope, or delivery outcome. Generic duty lists are the most common failure on PM CVs.</p>
        <p><strong>Weak:</strong> "Managed multiple projects simultaneously while coordinating with stakeholders."</p>
        <p><strong>Strong examples:</strong></p>
        <ul>
          <li>"Led end-to-end delivery of a £3.2M core banking system migration, on time and 6% under budget, across a team of 18 internal and 7 vendor resources"</li>
          <li>"Managed a portfolio of 9 concurrent digital transformation workstreams, maintaining programme-level RAID log and reporting weekly to a Steering Committee of 6 executives"</li>
          <li>"Recovered a £1.8M ERP implementation that was 4 months behind schedule — restructured the delivery plan and achieved go-live within 10 weeks of appointment"</li>
          <li>"Reduced average project change request processing time from 12 days to 3 days by redesigning the governance framework"</li>
        </ul>
        <h3>Certifications</h3>
        <p>List these prominently — either in a dedicated section or in your skills block: PMP (PMI), PRINCE2 Foundation/Practitioner, AgilePM, MSP (Managing Successful Programmes), CAPM, Scrum Master (CSM, PSM), SAFe Agilist, ITIL (for IT PMs), Change Management (Prosci, APMG).</p>
        <h3>Education</h3>
        <p>Degree, institution, year. For senior PMs, education is less important than the delivery record — but relevant degrees (engineering, business, IT, construction management) add credibility.</p>
        <h2>PM CV Tips by Industry</h2>
        <ul>
          <li><strong>IT/Technology:</strong> Emphasise Agile/Scrum, JIRA, vendor management, technical integration projects</li>
          <li><strong>Construction:</strong> Contract management (NEC/JCT), programme planning, health and safety management</li>
          <li><strong>Finance/Banking:</strong> Regulatory compliance, risk frameworks, governance, change management</li>
          <li><strong>Healthcare:</strong> NHS programme structure, CQC compliance, clinical change management</li>
          <li><strong>Consulting:</strong> Client-facing delivery, proposal writing, business development, multiple concurrent accounts</li>
        </ul>
        <h2>Programme Manager vs Project Manager CV</h2>
        <p>If you are applying for a programme manager role, shift the emphasis from individual project delivery to portfolio governance, benefits realisation, dependency management across workstreams, executive stakeholder management, and strategic alignment. Programme managers are judged on outcomes, not just delivery.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your PM CV rewritten with delivery-focused language</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your project manager CV to highlight the budget, scope and outcomes that hiring managers need to see.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My PM CV &rarr;</Link>
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
