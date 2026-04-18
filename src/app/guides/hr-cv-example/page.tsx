import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "HR CV Example — How to Write a Human Resources CV or Resume (2026)",
  description: "How to write an HR CV or resume — HRBP, talent acquisition, L&D and HR generalist roles. With bullet point examples, skills and what HR hiring managers look for.",
  alternates: { canonical: "https://fusecv.com/guides/hr-cv-example" },
  openGraph: { title: "HR CV Example — How to Write a Human Resources CV (2026)", description: "How to write an HR CV — HRBP, talent acquisition, L&D and generalist roles with real examples.", url: "https://fusecv.com/guides/hr-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",      title: "Resume Summary Examples" },
  { slug: "executive-cv-example",         title: "Executive CV Example" },
  { slug: "career-change-cv-example",     title: "Career Change CV Example" },
];
export default function HrCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">HR CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">HR CV Example — How to Write a Human Resources CV or Resume (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Human resources professionals are often the ones reviewing CVs — which makes writing your own a uniquely visible challenge. An HR CV needs to demonstrate both people impact and business acumen. Here is how to write one that stands out.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your HR CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your HR CV with impact-focused language and the business metrics that HR hiring panels look for.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>The Core HR CV Problem</h2>
        <p>Most HR CVs read like a job description. They list responsibilities — "managed recruitment," "delivered training," "handled employee relations." What they fail to show is impact: how many people hired, how fast, at what cost per hire, how employee engagement or retention changed under their watch. HR is increasingly expected to demonstrate its business value — your CV should do the same.</p>

        <h2>HR Professional Summary Examples</h2>
        <p><strong>HR Generalist (3–5 years):</strong></p>
        <blockquote>HR generalist with 4 years of experience supporting 200-person tech scale-up through a period of rapid growth from Series A to Series B. Managed full-cycle recruitment across engineering and commercial functions (60+ hires in 18 months), introduced a structured onboarding programme that reduced 90-day attrition by 35%, and led the HR workstream for a company-wide restructure. Studying for CIPD Level 5. Seeking an HR Business Partner role.</blockquote>
        <p><strong>HRBP (Senior):</strong></p>
        <blockquote>Senior HR Business Partner with 9 years of experience in financial services and professional services. Partner to C-suite leaders across a 1,200-person UK workforce. Led two large-scale organisational design projects, managing a reduction of 180 roles over 12 months in full compliance with UK employment law. Experienced in TUPE transfers, complex ER cases, talent management frameworks and succession planning. CIPD Level 7 qualified.</blockquote>
        <p><strong>Talent Acquisition Lead:</strong></p>
        <blockquote>Talent acquisition lead with 6 years of in-house recruitment experience at high-growth SaaS companies. Scaled the team from 80 to 340 headcount over 3 years, with a focus on engineering and product roles. Reduced average time-to-hire from 58 days to 31 days and cost-per-hire by 28% through direct sourcing and employer brand investment. Experienced with Workable, Greenhouse, Lever and LinkedIn Recruiter.</blockquote>

        <h2>HR CV Bullet Point Examples</h2>
        <ul>
          <li>"Led end-to-end recruitment for 85 roles in FY2024 — engineering, commercial, and operations — reducing average time-to-hire from 62 days to 34 days"</li>
          <li>"Designed and launched a structured onboarding programme for 200 new starters — 90-day attrition fell from 24% to 11% within 12 months of launch"</li>
          <li>"Partnered with the CPO to redesign the engineering performance review cycle — participation rate increased from 67% to 94% and average eNPS rose from 28 to 41"</li>
          <li>"Managed 14 complex ER cases concurrently including disciplinary, grievance and capability proceedings — 100% resolved without tribunal referral"</li>
          <li>"Negotiated a recognition agreement with Unite, the first in the company's 18-year history, avoiding a threatened industrial action ballot"</li>
          <li>"Built the HR function from scratch for a 120-person subsidiary post-acquisition — HRIS, payroll, contracts, policies and benefit schemes all implemented within 90 days"</li>
          <li>"Reduced agency recruitment spend by £180K annually by building a direct sourcing pipeline and internal referral programme"</li>
          <li>"Designed and delivered a management development programme for 35 first-line managers — 360 feedback scores improved by an average of 19 points over 6 months"</li>
        </ul>

        <h2>HR Skills Section</h2>
        <ul>
          <li><strong>Employment law:</strong> UK Employment Rights Act, TUPE, ACAS Code of Practice, IR35, settlement agreements, tribunal preparation</li>
          <li><strong>Recruitment:</strong> Full-cycle hiring, Boolean search, LinkedIn Recruiter, Greenhouse, Workable, Lever, BambooHR, structured interviewing, assessment centres</li>
          <li><strong>Compensation &amp; benefits:</strong> Salary benchmarking, Willis Towers Watson, Radford, Korn Ferry, benefits design, pension auto-enrolment</li>
          <li><strong>L&amp;D:</strong> Learning needs analysis, LMS platforms (Cornerstone, Docebo, TalentLMS), 70/20/10 model, leadership development</li>
          <li><strong>HR systems:</strong> Workday, SAP SuccessFactors, BambooHR, HiBob, Personio, Sage HR</li>
          <li><strong>Analytics:</strong> Workforce planning, attrition modelling, headcount forecasting, Excel, Power BI, Tableau</li>
        </ul>

        <h2>Qualifications to Include</h2>
        <ul>
          <li><strong>CIPD:</strong> Level 3 (Foundation), Level 5 (Associate — the most common practitioner qualification), Level 7 (Advanced — the benchmark for senior HR and HRBPs). Always state the level and year completed or "in progress."</li>
          <li><strong>SHRM-CP / SHRM-SCP:</strong> US-based certification — include if working in or targeting the US market</li>
          <li><strong>PHR / SPHR:</strong> HR Certification Institute — another US-based credential</li>
          <li><strong>Degree:</strong> HR Management, Psychology, Business, or any discipline — HR is one of the more degree-agnostic professions</li>
          <li><strong>Coaching:</strong> ILM, ICF or equivalent coaching qualification — particularly relevant for HRBPs and OD roles</li>
        </ul>

        <h2>HR CV by Specialism</h2>
        <ul>
          <li><strong>HR Generalist / Administrator:</strong> HRIS management, onboarding, contract administration, policy compliance, basic ER support. Focus on breadth and operational accuracy.</li>
          <li><strong>Recruiter / Talent Acquisition:</strong> Volume of hires, time-to-fill, source of hire, cost-per-hire, quality of hire metrics. ATS proficiency and direct sourcing capability are key.</li>
          <li><strong>HR Business Partner:</strong> Strategic partnership, organisational design, talent management, leadership coaching. Show the business problems you solved, not just the HR activities.</li>
          <li><strong>Reward &amp; Compensation:</strong> Benchmarking methodology, grading structures, bonus design, global mobility, total reward statements.</li>
          <li><strong>L&amp;D / OD:</strong> Programme design, facilitation, impact measurement, e-learning development, culture and engagement projects.</li>
          <li><strong>HR Director / CPO:</strong> Board-level influence, people strategy, M&amp;A HR integration, CHRO relationship, executive compensation, workforce transformation at scale.</li>
        </ul>

        <h2>Common HR CV Mistakes</h2>
        <ul>
          <li>Using HR jargon without impact — "supported change management initiatives" says nothing</li>
          <li>No headcount context — always state the size of the organisation or workforce you supported</li>
          <li>Not quantifying recruitment output — hires per year, time-to-hire, cost-per-hire</li>
          <li>Listing ER activities without outcomes — note resolution rate, tribunal avoidance, business risk managed</li>
          <li>Missing CIPD level or qualification status — always include it prominently</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your HR CV rewritten with impact metrics</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your HR CV to show the business outcomes, workforce metrics and people impact that hiring managers need to see.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My HR CV Free &rarr;</Link>
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
