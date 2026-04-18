import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Marketing Manager CV Example — How to Write a Marketing CV That Gets Interviews",
  description: "A complete marketing manager CV guide — channels, metrics, tools, and how to write bullet points that prove commercial impact to any hiring manager.",
  alternates: { canonical: "https://fusecv.com/guides/marketing-manager-cv-example" },
  openGraph: { title: "Marketing Manager CV Example", description: "How to write a marketing manager CV — channels, metrics, tools and impact bullet points.", url: "https://fusecv.com/guides/marketing-manager-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "executive-cv-example",       title: "Executive CV Example" },
  { slug: "ats-cv-checker",             title: "ATS CV Checker" },
];
export default function MarketingManagerCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Marketing Manager CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Marketing Manager CV Example — How to Write a Marketing CV That Gets Interviews</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Marketing CVs need to prove commercial impact — not just list channels and tools. Here is how to structure your CV, write results-focused bullet points, and position yourself for the roles you want.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your marketing CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your marketing CV with commercial impact language and the right keywords for senior marketing roles.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Marketing Hiring Managers Look For</h2>
        <p>Marketing is one of the most results-measurable functions in any business — which means hiring managers expect to see numbers. Revenue contribution, pipeline generated, CPA, CAC, ROAS, organic traffic growth, conversion rates. A marketing CV without metrics is a red flag. Every role should have at least 2–3 quantified outcomes.</p>
        <h2>Professional Summary for a Marketing Manager</h2>
        <p><strong>B2B SaaS example:</strong></p>
        <blockquote>Head of Marketing with 8 years of experience in B2B SaaS, specialising in demand generation, ABM and content marketing. Grew qualified pipeline from £3M to £11M over 2 years at a Series B fintech startup. Managed a team of 7 across paid, organic, events and content. Seeking a VP Marketing or CMO role at a growth-stage company preparing for Series C or beyond.</blockquote>
        <p><strong>Consumer/FMCG example:</strong></p>
        <blockquote>Brand marketing manager with 6 years of experience in FMCG, managing campaigns across TV, digital and shopper marketing for brands with £50M–£200M retail turnover. Led a brand relaunch that grew market share by 2.3 percentage points in 12 months. Experienced in agency management, media planning and consumer insight. Seeking a senior brand manager or marketing director role.</blockquote>
        <h2>Marketing Skills and Tools Section</h2>
        <p>Group by category:</p>
        <ul>
          <li><strong>Digital marketing:</strong> SEO, PPC (Google Ads, Meta), programmatic, email marketing, marketing automation</li>
          <li><strong>Platforms and tools:</strong> HubSpot, Salesforce, Marketo, Google Analytics 4, Semrush, Ahrefs, Tableau</li>
          <li><strong>Paid media:</strong> Google Ads, Meta Ads Manager, LinkedIn Campaign Manager, TikTok Ads</li>
          <li><strong>Content and creative:</strong> Content strategy, copywriting, brand management, Adobe Creative Suite</li>
          <li><strong>Analytics:</strong> GA4, Data Studio, Looker, A/B testing, attribution modelling</li>
        </ul>
        <h2>How to Write Marketing CV Bullet Points</h2>
        <p>The formula: channel or campaign + what you did + commercial outcome.</p>
        <ul>
          <li>"Launched a content-led SEO programme that grew organic traffic from 12,000 to 94,000 monthly sessions over 18 months, generating £1.8M in attributed pipeline"</li>
          <li>"Rebuilt the Google Ads account structure, reducing cost-per-lead from £180 to £62 while increasing lead volume by 140% on the same budget"</li>
          <li>"Ran a 6-touchpoint ABM programme targeting 80 enterprise accounts — 34 converted to opportunities, generating £4.2M in pipeline within 6 months"</li>
          <li>"Managed a £1.4M media budget across TV, OOH and digital, delivering a brand awareness uplift of 12 percentage points among the 25–44 target demographic"</li>
          <li>"Grew the email database from 22,000 to 67,000 subscribers in 12 months through lead magnet programmes, achieving a 28% average open rate"</li>
        </ul>
        <h2>Marketing Metrics to Include on Your CV</h2>
        <ul>
          <li><strong>Demand gen / B2B:</strong> MQL volume, SQL conversion rate, pipeline contribution, CAC, CPL, ROAS, channel attribution</li>
          <li><strong>SEO/content:</strong> Organic traffic growth (%), keyword rankings, domain authority, leads from organic</li>
          <li><strong>Paid media:</strong> ROAS, CPA, CTR, impression share, spend managed</li>
          <li><strong>Email:</strong> List size, open rate, click rate, revenue attributed</li>
          <li><strong>Brand:</strong> Market share, brand awareness score, NPS impact, campaign reach</li>
          <li><strong>E-commerce:</strong> Revenue, conversion rate, AOV, LTV, basket abandonment rate</li>
        </ul>
        <h2>Senior Marketing CV — Director and CMO Level</h2>
        <p>At director and CMO level, shift from individual execution to team leadership and business impact. Key elements:</p>
        <ul>
          <li>Budget ownership (total marketing budget managed)</li>
          <li>Team size and structure</li>
          <li>Revenue influence (% of company revenue attributed to marketing)</li>
          <li>Board-level reporting and investor communications</li>
          <li>Agency and vendor portfolio management</li>
          <li>Brand-building at category level, not just campaign level</li>
        </ul>
        <h2>ATS Keywords for Marketing Roles</h2>
        <p>Commonly searched terms: digital marketing, demand generation, SEO, PPC, HubSpot, Salesforce, Google Analytics, marketing automation, ABM, content marketing, brand management, lead generation, campaign management, CRM, paid social, email marketing, conversion rate optimisation, product marketing, go-to-market.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your marketing CV rewritten with commercial impact</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV adds the metrics, channels and keywords that marketing hiring managers need to see — in 60 seconds.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Marketing CV &rarr;</Link>
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
