import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Product Manager Resume — How to Write a PM Resume or CV (2026)",
  description: "How to write a product manager resume or CV — outcomes over features, OKRs, roadmap ownership, and the PM metrics that get you interviews at top tech companies.",
  alternates: { canonical: "https://fusecv.com/guides/product-manager-resume" },
  openGraph: { title: "Product Manager Resume — How to Write a PM Resume or CV", description: "How to write a PM resume — outcomes, OKRs, roadmap ownership and the metrics top tech companies look for.", url: "https://fusecv.com/guides/product-manager-resume" },
};
const relatedGuides = [
  { slug: "software-engineer-cv-example", title: "Software Engineer CV Example" },
  { slug: "resume-summary-examples",      title: "Resume Summary Examples" },
  { slug: "executive-cv-example",         title: "Executive CV Example" },
];
export default function ProductManagerResumePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Product Manager Resume</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Product Manager Resume — How to Write a PM Resume or CV (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Product management is outcomes-driven — your resume needs to prove it. The biggest mistake PMs make is writing about features they shipped instead of the outcomes those features produced. Here is how to fix that.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your PM resume improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your product manager CV with outcomes-focused language and the PM impact framing that top companies look for.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My Resume Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>The Core PM Resume Problem</h2>
        <p>Most PM resumes describe what was built — features, launches, product areas. Hiring managers at strong tech companies do not care what you built. They care what changed because you built it: user growth, retention improvements, revenue impact, cost savings, latency reduction, churn reduction, engagement uplift. Every bullet on a PM resume should connect to a business or user outcome.</p>
        <h2>PM Professional Summary Examples</h2>
        <p><strong>Mid-level PM (B2B SaaS):</strong></p>
        <blockquote>Product manager with 5 years of experience building B2B workflow tools at Series A–C stage companies. Owned the core collaboration product from MVP to $2.4M ARR. Experienced working with distributed engineering teams of 4–8 across backend, frontend and ML. Comfortable with SQL and analytics tools (Mixpanel, Amplitude). Seeking a senior PM or group PM role at a data-focused product team.</blockquote>
        <p><strong>Senior PM (consumer app):</strong></p>
        <blockquote>Senior PM with 8 years of experience in consumer mobile products. Led the onboarding redesign that reduced 30-day churn by 22% for a 4M DAU app. Experienced as a team lead across 3 PMs and have managed the full product development lifecycle from discovery through post-launch iteration. Seeking a director of product or GPM role in a consumer or marketplace business.</blockquote>
        <h2>How to Write PM Resume Bullets</h2>
        <p>The framework: <strong>what you did</strong> + <strong>how you did it</strong> + <strong>what changed as a result</strong></p>
        <p><strong>Feature-focused (weak):</strong></p>
        <ul>
          <li>"Led development of a new notification system for mobile users"</li>
          <li>"Shipped a redesigned onboarding flow for new users"</li>
        </ul>
        <p><strong>Outcome-focused (strong):</strong></p>
        <ul>
          <li>"Redesigned the notification system for 3.2M mobile users — A/B tested 6 variants over 8 weeks — increasing 7-day re-engagement rate from 31% to 47% and directly contributing to a 12% reduction in monthly churn"</li>
          <li>"Led a 0-to-1 onboarding redesign informed by 40 user interviews and funnel analysis — reduced time-to-value from 9 minutes to 2.5 minutes and improved D1 retention by 18 percentage points"</li>
          <li>"Owned the pricing and packaging workstream for our enterprise tier — defined 3 new pricing tiers through customer interviews and competitive analysis, resulting in a 34% increase in enterprise ACV within 6 months of launch"</li>
          <li>"Built and maintained a quarterly roadmap across 3 product areas and 2 engineering teams — managed stakeholder alignment with C-suite and board, delivering 87% of committed roadmap items on schedule"</li>
        </ul>
        <h2>PM Skills Section</h2>
        <ul>
          <li><strong>Discovery:</strong> User research, usability testing, Jobs-to-be-Done, customer interviews, competitive analysis</li>
          <li><strong>Analytics:</strong> SQL, Amplitude, Mixpanel, Google Analytics 4, Looker, A/B testing, funnel analysis</li>
          <li><strong>Frameworks:</strong> OKRs, RICE prioritisation, Kano model, North Star Metric, JTBD, Agile/Scrum</li>
          <li><strong>Tools:</strong> Figma (collaboration), JIRA, Notion, Confluence, Productboard, Aha!</li>
          <li><strong>Domain:</strong> API products, mobile (iOS/Android), ML/AI products, marketplace, B2B SaaS, consumer</li>
        </ul>
        <h2>PM Resume for Different Stages</h2>
        <ul>
          <li><strong>APM / Associate PM:</strong> Demonstrate analytical rigour, customer empathy, technical literacy. Projects from previous roles (engineering, consulting, design) are highly relevant. MBA is a common entry path — but outcomes still matter more than the school.</li>
          <li><strong>PM:</strong> Ownership of a specific product area. Ship history. A/B test results. Cross-functional collaboration. Prioritisation decisions and the framework behind them.</li>
          <li><strong>Senior PM:</strong> Ambiguous problem scope. Independent roadmap ownership. Mentorship of junior PMs. Influence without authority. Business outcome ownership.</li>
          <li><strong>Principal / Staff PM:</strong> Company-wide product strategy influence. Cross-org alignment. Defining product vision. Managing up to executive stakeholders.</li>
          <li><strong>Director of Product / GPM:</strong> Team management, hiring, PM coaching. Portfolio strategy across multiple product lines. Board-level communication. P&amp;L ownership in some organisations.</li>
        </ul>
        <h2>Technical Depth — How Much Is Needed?</h2>
        <p>This depends on the company. Early-stage startups and technical product roles (infrastructure, developer tools, AI/ML) expect meaningful technical literacy — comfort with APIs, an ability to read basic code, and credible conversations with senior engineers. Consumer and B2B SaaS PMs are less expected to have a technical background, but SQL proficiency and the ability to self-serve data analysis are universally valued.</p>
        <h2>Length — CV vs Resume for PMs</h2>
        <ul>
          <li><strong>US tech companies (FAANG, Series B+ startups):</strong> 1 page for 0–6 years, 2 pages maximum for senior/principal roles</li>
          <li><strong>UK and European companies:</strong> 2 pages standard for experienced PMs</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your PM resume rewritten with outcomes-first language</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your product manager CV to show the outcomes, metrics and business impact that top tech companies look for.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My PM Resume Free &rarr;</Link>
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
