import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Skills Examples — What to Put in Your Skills Section (With Examples)",
  description: "What skills to put on a CV or resume — technical skills, soft skills, and examples across 10 industries. Plus the skills that actually impress employers.",
  alternates: { canonical: "https://fusecv.com/guides/cv-skills-examples" },
  openGraph: { title: "CV Skills Examples — What to Put in Your Skills Section", description: "What skills to put on a CV — technical, soft, and industry-specific examples that impress employers.", url: "https://fusecv.com/guides/cv-skills-examples" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "how-to-write-a-cv",          title: "How to Write a CV" },
  { slug: "ats-cv-checker",             title: "ATS CV Checker" },
];
export default function CvSkillsExamplesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Skills Examples</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Skills Examples — What to Put in Your Skills Section</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">The skills section is one of the most misused parts of any CV. Here is what actually belongs there — with examples across industries, levels, and the skills that hiring managers and ATS systems actually look for.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get AI to optimise your skills section</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV reviews your CV, identifies missing skills keywords, and rewrites your skills section to pass ATS and impress hiring managers.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Actually Belongs in a CV Skills Section</h2>
        <p>The skills section should contain <strong>verifiable, specific, relevant skills</strong> — things a hiring manager or ATS can check, match against the job description, or ask you about in an interview.</p>
        <p>What does NOT belong:</p>
        <ul>
          <li>"Good communicator" — show this in your bullet points, not as a skill</li>
          <li>"Team player" — meaningless without context</li>
          <li>"Microsoft Office" — assumed for almost every role in 2026</li>
          <li>"Hard working" — a character trait, not a skill</li>
          <li>"Attention to detail" — ironic when listed without evidence</li>
        </ul>
        <h2>Types of Skills to Include</h2>
        <h3>Technical / Hard Skills</h3>
        <p>Specific, learnable abilities: software proficiency, programming languages, machinery operation, data analysis methods, financial modelling, medical procedures, legal knowledge. These are the skills ATS systems are specifically looking for.</p>
        <h3>Tools and Platforms</h3>
        <p>Software and systems you use daily or regularly: CRMs, ERPs, design tools, project management software, analytics platforms. Be specific — "Salesforce" not "CRM software".</p>
        <h3>Certifications and Qualifications</h3>
        <p>Formal credentials that verify a skill: AWS Certified Solutions Architect, PMP, ACCA, PRINCE2, Google Analytics Certified. These can be listed in skills or in a separate certifications section.</p>
        <h3>Languages</h3>
        <p>State language and proficiency level: Native, Fluent, Professional Working Proficiency, Conversational, Basic.</p>
        <h2>CV Skills Examples by Industry</h2>
        <h3>Technology / Software Engineering</h3>
        <ul>
          <li>Languages: Python, TypeScript, Java, Go, Rust, SQL</li>
          <li>Frameworks: React, Node.js, Django, Spring Boot, FastAPI</li>
          <li>Cloud: AWS (EC2, S3, Lambda, RDS), Google Cloud, Azure</li>
          <li>DevOps: Docker, Kubernetes, Terraform, GitHub Actions, CircleCI</li>
          <li>Databases: PostgreSQL, MongoDB, Redis, Elasticsearch</li>
          <li>Tools: Git, JIRA, Confluence, Datadog, Sentry</li>
        </ul>
        <h3>Finance and Accounting</h3>
        <ul>
          <li>ERP systems: SAP S/4HANA, Oracle Financials, NetSuite, Sage 200, Xero</li>
          <li>Standards: IFRS, UK GAAP, FRS 102, US GAAP</li>
          <li>Analytical: Financial modelling, DCF valuation, budget variance analysis, scenario planning</li>
          <li>Qualifications: ACA, ACCA, CIMA, CFA, CPA</li>
          <li>Tools: Advanced Excel, Power BI, Tableau, Bloomberg Terminal</li>
        </ul>
        <h3>Marketing</h3>
        <ul>
          <li>Digital: SEO, PPC, email marketing, marketing automation, CRO</li>
          <li>Platforms: HubSpot, Salesforce, Marketo, Google Ads, Meta Ads Manager</li>
          <li>Analytics: Google Analytics 4, Semrush, Ahrefs, Tableau, Looker</li>
          <li>Content: Copywriting, content strategy, brand management, PR</li>
          <li>Social: LinkedIn Campaign Manager, TikTok Ads, Instagram, X (Twitter)</li>
        </ul>
        <h3>Project Management</h3>
        <ul>
          <li>Methodologies: Agile, Scrum, PRINCE2, Waterfall, SAFe, Kanban</li>
          <li>Certifications: PMP, PRINCE2 Practitioner, AgilePM, MSP, CAPM</li>
          <li>Tools: JIRA, MS Project, Smartsheet, Monday.com, Asana, Confluence</li>
          <li>Competencies: Risk management, stakeholder management, RAID log, change control</li>
        </ul>
        <h3>Human Resources</h3>
        <ul>
          <li>HRIS systems: Workday, SAP SuccessFactors, ADP, BambooHR, Oracle HCM</li>
          <li>Qualifications: CIPD Level 5/7, SHRM-CP, PHR, CHRP</li>
          <li>Competencies: ER case management, talent acquisition, L&amp;D, organisational design, TUPE</li>
          <li>Tools: Greenhouse, Lever, Taleo, LinkedIn Recruiter</li>
        </ul>
        <h3>Healthcare (Nursing / Allied Health)</h3>
        <ul>
          <li>Clinical: IV cannulation, phlebotomy, wound care, medication management</li>
          <li>Certifications: BLS, ACLS, ALS, ILS, PMVA</li>
          <li>Systems: EMIS Web, SystmOne, Lorenzo, Meditech</li>
          <li>Regulatory: NMC registration, CQC compliance, NICE guidelines</li>
        </ul>
        <h3>Data and Analytics</h3>
        <ul>
          <li>Languages: SQL, Python (pandas, NumPy, matplotlib), R</li>
          <li>BI tools: Tableau, Power BI, Looker, Google Data Studio</li>
          <li>Cloud/data platforms: Snowflake, BigQuery, Redshift, Databricks, dbt</li>
          <li>Methods: A/B testing, regression analysis, cohort analysis, forecasting</li>
        </ul>
        <h3>Legal</h3>
        <ul>
          <li>Areas of law: Corporate, M&amp;A, employment, commercial litigation, IP, real estate</li>
          <li>Jurisdiction: England and Wales (solicitor), Scottish Law, New York Bar, Barrister (Inner Temple)</li>
          <li>Tools: Westlaw, LexisNexis, iManage, Relativity</li>
          <li>Drafting: Share purchase agreements, employment contracts, licensing agreements, due diligence reports</li>
        </ul>
        <h2>How to Format the Skills Section</h2>
        <p>For most roles, group skills by category for scannability:</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose text-sm space-y-2 text-slate-700">
          <p><strong>Languages:</strong> Python, SQL, TypeScript</p>
          <p><strong>Frameworks:</strong> React, Node.js, FastAPI</p>
          <p><strong>Cloud:</strong> AWS (EC2, Lambda, S3, RDS), Docker, Kubernetes</p>
          <p><strong>Tools:</strong> Git, JIRA, GitHub Actions, Datadog</p>
        </div>
        <p>For non-technical roles, a simple bullet list or comma-separated list works well. Do not use skill bars or percentage ratings — they are meaningless and often break ATS parsers.</p>
        <h2>How Many Skills to List</h2>
        <p>Quality over quantity. 8–15 genuinely relevant skills are ideal. A skills section with 40 items is as bad as one with 3 — it signals that the candidate has not filtered for relevance. Only list skills you are comfortable being interviewed on.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your skills section optimised automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV identifies the right skills for your role, removes irrelevant ones, and formats your skills section for maximum ATS impact.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Skills Section Free &rarr;</Link>
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
