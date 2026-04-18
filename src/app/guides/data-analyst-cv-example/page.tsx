import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Analyst CV Example — How to Write a Data Analyst Resume or CV",
  description: "How to write a data analyst CV or resume that gets interviews — skills section, tools, impact-focused bullet points and ATS optimisation for data roles.",
  alternates: { canonical: "https://fusecv.com/guides/data-analyst-cv-example" },
  openGraph: { title: "Data Analyst CV Example", description: "How to write a data analyst CV — skills, tools, impact bullets and ATS tips.", url: "https://fusecv.com/guides/data-analyst-cv-example" },
};
const relatedGuides = [
  { slug: "software-engineer-cv-example", title: "Software Engineer CV Example" },
  { slug: "resume-summary-examples",      title: "Resume Summary Examples" },
  { slug: "ats-cv-checker",               title: "ATS CV Checker" },
];
export default function DataAnalystCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Data Analyst CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Data Analyst CV Example — How to Write a Data Analyst CV or Resume</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Data analyst CVs need to demonstrate both technical competence and business impact. Here is how to structure yours, write strong bullets, and position your skills to get past ATS and impress the hiring manager.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your data analyst CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV with impact-focused language and the right technical keywords for data analyst roles.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Data Analyst Employers Look For</h2>
        <p>Hiring managers reviewing data analyst applications want to see: the technical stack you work with (SQL, Python, R, Tableau, Power BI), the scale and complexity of data you have handled, the business decisions your analysis has influenced, and your ability to communicate insights to non-technical audiences.</p>
        <h2>Professional Summary for a Data Analyst</h2>
        <p><strong>Example (mid-level):</strong></p>
        <blockquote>Data analyst with 4 years of experience in e-commerce and retail analytics. Proficient in SQL, Python (pandas, matplotlib) and Power BI. Built dashboards and ad-hoc analyses that directly informed £15M+ in product and merchandising decisions. Strong communicator — experienced translating complex data outputs into clear recommendations for senior leadership.</blockquote>
        <p><strong>Example (senior):</strong></p>
        <blockquote>Senior data analyst with 8 years of experience across fintech and insurance. Expert in SQL, Python and Tableau. Led the analytics function through a migration from legacy reporting to a cloud-based data warehouse (Snowflake + dbt), reducing report generation time from 2 days to 4 hours. Experienced leading a team of 3 junior analysts.</blockquote>
        <h2>Technical Skills Section</h2>
        <p>Group your tools by category for maximum scannability:</p>
        <ul>
          <li><strong>Query languages:</strong> SQL (PostgreSQL, MySQL, BigQuery, Redshift), dbt</li>
          <li><strong>Programming:</strong> Python (pandas, NumPy, matplotlib, seaborn), R</li>
          <li><strong>BI and visualisation:</strong> Tableau, Power BI, Looker, Google Data Studio</li>
          <li><strong>Cloud and data platforms:</strong> Google BigQuery, AWS Redshift, Snowflake, Databricks</li>
          <li><strong>Other tools:</strong> Excel (advanced), JIRA, Confluence, Git</li>
          <li><strong>Statistical methods:</strong> A/B testing, regression analysis, cohort analysis, forecasting</li>
        </ul>
        <h2>How to Write Data Analyst Bullet Points</h2>
        <p>The key: every bullet should show what decision was enabled or what outcome was achieved — not just what you built.</p>
        <ul>
          <li>"Built a customer churn prediction model using Python and logistic regression, identifying 1,200 at-risk accounts that generated £340K in retained revenue through targeted outreach"</li>
          <li>"Automated weekly KPI reporting using SQL and Power BI, eliminating 8 hours of manual work per week and reducing report delivery time from Monday to Friday"</li>
          <li>"Designed and analysed A/B test for homepage redesign across 450,000 users — results informed a decision that increased conversion rate by 1.8% (worth ~£280K ARR)"</li>
          <li>"Created a self-service analytics dashboard used by 60+ non-technical stakeholders to monitor performance against quarterly OKRs"</li>
        </ul>
        <h2>Projects and GitHub</h2>
        <p>Include a projects section if you have personal or academic projects that demonstrate relevant skills — especially if you are early in your career. Link to a GitHub profile or portfolio if it contains well-documented, current work. A Kaggle competition placement or a published Tableau public dashboard also adds credibility.</p>
        <h2>Data Analyst vs Data Scientist — CV Differences</h2>
        <ul>
          <li><strong>Data analyst:</strong> Emphasis on SQL, BI tools, business reporting, descriptive analytics, stakeholder communication</li>
          <li><strong>Data scientist:</strong> Emphasis on machine learning, Python/R, modelling, statistical methods, research</li>
        </ul>
        <p>Make sure your CV clearly positions you in the right category — the overlap causes confusion for ATS systems and human reviewers alike.</p>
        <h2>ATS Keywords for Data Analyst Roles</h2>
        <p>Common keywords that appear in data analyst job descriptions: SQL, Python, R, Tableau, Power BI, data visualisation, A/B testing, Excel, statistics, data cleaning, ETL, business intelligence, stakeholder management, KPI reporting, data modelling, Snowflake, BigQuery.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your data analyst CV optimised automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV adds the right keywords, rewrites your bullet points with impact, and formats your technical skills correctly — in 60 seconds.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Data CV &rarr;</Link>
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
