import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Sales CV Example — How to Write a Sales Resume or CV That Gets Interviews",
  description: "How to write a sales CV or resume — quotas, metrics, deal sizes, and how to prove your number on paper. With examples for SDR, AE, and sales manager roles.",
  alternates: { canonical: "https://fusecv.com/guides/sales-cv-example" },
  openGraph: { title: "Sales CV Example", description: "How to write a sales CV — quotas, metrics, deal sizes and impact bullets for SDR, AE and sales manager roles.", url: "https://fusecv.com/guides/sales-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "executive-cv-example",       title: "Executive CV Example" },
  { slug: "marketing-manager-cv-example", title: "Marketing Manager CV Example" },
];
export default function SalesCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Sales CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Sales CV Example — How to Write a Sales CV That Proves Your Number</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Sales is the most metrics-driven profession there is — and your CV should reflect that. If your sales CV doesn't show quota attainment, deal size, and revenue numbers, it isn't doing its job. Here is how to fix that.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your sales CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your sales CV to highlight the numbers, quotas and deal metrics that sales hiring managers need to see.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Sales Hiring Managers Look For First</h2>
        <p>When a sales leader or recruiter opens your CV, they scan for one thing immediately: your number. Quota attainment. Revenue generated. Deal size. Win rate. If that information is not visible within the first 10 seconds, your CV has failed its most important test. Every sales CV should have clear, specific metrics in the first third of the document.</p>
        <h2>Professional Summary for Sales Roles</h2>
        <p><strong>SDR (Sales Development Representative):</strong></p>
        <blockquote>SDR with 2 years of experience in B2B SaaS at a Series B startup targeting enterprise accounts. Consistently achieved 115–130% of monthly meeting-booked quota. Top-performing SDR in a team of 12 for 3 consecutive quarters. Experienced in outbound prospecting using LinkedIn Sales Navigator, Outreach, and Cognism. Looking to transition into an Account Executive role.</blockquote>
        <p><strong>Account Executive (mid-market):</strong></p>
        <blockquote>B2B Account Executive with 5 years of experience closing mid-market deals in the HR tech and workforce management sector. Average deal size of £45K ARR with a 90-day sales cycle. Averaged 118% of quota over 4 years. Experienced carrying a £600K–£800K annual quota. Seeking an AE or senior AE role at a Series B+ SaaS company with a strong outbound motion.</blockquote>
        <p><strong>Sales Manager:</strong></p>
        <blockquote>Sales manager with 7 years of B2B SaaS experience — 4 years as an individual contributor (consistently 120%+ quota) and 3 years managing a team of 6–8 AEs. Team ARR grew from £1.1M to £3.6M during my tenure as manager. Experienced in hiring, coaching, pipeline management and forecasting. Seeking a Head of Sales or VP Sales role at a high-growth SaaS company.</blockquote>
        <h2>The Key Sales Metrics to Include</h2>
        <ul>
          <li><strong>Quota attainment:</strong> "Averaged 122% of quota over 3 years" — the most important single metric for any sales role</li>
          <li><strong>Quota size:</strong> "Carried a £750K annual quota" — shows the scale you operate at</li>
          <li><strong>ARR/revenue generated:</strong> "Generated £2.4M ARR in FY2024" — total revenue contribution</li>
          <li><strong>Average deal size:</strong> "Average deal size £32K ARR" — indicates the market and complexity</li>
          <li><strong>Win rate:</strong> "35% close rate on qualified opportunities" — shows your conversion efficiency</li>
          <li><strong>Sales cycle length:</strong> "Average 75-day sales cycle" — contextualises the complexity of your deals</li>
          <li><strong>Ranking in team:</strong> "Top 3 of 18 AEs by revenue in FY2023" — competitive context</li>
          <li><strong>Team metrics (managers):</strong> "Team grew from £900K to £3.1M ARR over 18 months"</li>
        </ul>
        <h2>Sales CV Bullet Point Examples</h2>
        <ul>
          <li>"Closed £1.8M in new ARR in FY2024 against a £1.5M quota (120%), ranked 2nd of 14 AEs"</li>
          <li>"Sourced and closed the company's largest ever deal — a £340K ARR enterprise contract with a FTSE 100 retailer — through an 8-month consultative sales process involving 6 stakeholders"</li>
          <li>"Built a pipeline from zero in a new territory (Northern Europe), generating £420K in ARR in 9 months"</li>
          <li>"Rebuilt the SDR team's outbound sequence, improving reply rates from 3% to 11% and increasing qualified meetings booked by 60% month-over-month"</li>
          <li>"Promoted from SDR to AE in 14 months — the fastest progression in the company's history"</li>
          <li>"Managed a book of business of 42 mid-market accounts totalling £1.9M ARR, achieving 97% net revenue retention"</li>
        </ul>
        <h2>Sales Tools to Include in Your Skills Section</h2>
        <ul>
          <li><strong>CRM:</strong> Salesforce, HubSpot, Pipedrive, Zoho</li>
          <li><strong>Outbound/engagement:</strong> Outreach, SalesLoft, Apollo, Lemlist</li>
          <li><strong>Prospecting:</strong> LinkedIn Sales Navigator, Cognism, ZoomInfo, Lusha</li>
          <li><strong>Revenue intelligence:</strong> Gong, Chorus, Clari, Forecasting tools</li>
          <li><strong>Methodology:</strong> MEDDIC, MEDDPICC, Sandler, Challenger, SPIN, BANT, Command of the Message</li>
        </ul>
        <h2>CV Tips by Sales Level</h2>
        <ul>
          <li><strong>SDR/BDR:</strong> Meetings booked, sequences built, connect rates, outbound volume. Show self-starting initiative and learning pace.</li>
          <li><strong>Account Executive:</strong> Quota attainment, deal size, ARR generated, win rate, largest deals closed, verticals worked.</li>
          <li><strong>Account Manager:</strong> NRR (net revenue retention), expansion ARR, churn prevented, upsell and cross-sell revenue, NPS management.</li>
          <li><strong>Sales Manager:</strong> Team quota attainment, ARR growth under management, headcount built, ramp time reduced, hiring and culture contribution.</li>
          <li><strong>VP Sales / CRO:</strong> Total ARR owned, revenue growth %, GTM strategy built, team built from ground up, board/investor engagement, M&amp;A integration.</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your sales CV rewritten with the right numbers</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your sales CV to prove your number — quota attainment, ARR, deal size and the metrics sales hiring managers need to see.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Sales CV &rarr;</Link>
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
