import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accountant CV Example — How to Write an Accounting CV (UK, Global)",
  description: "How to write an accountant CV — qualifications, technical skills, bullet point examples for management accounts, audit, tax and financial control roles.",
  alternates: { canonical: "https://fusecv.com/guides/accountant-cv-example" },
  openGraph: { title: "Accountant CV Example", description: "How to write an accounting CV — qualifications, skills and impact bullet points for every accounting specialism.", url: "https://fusecv.com/guides/accountant-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "executive-cv-example",       title: "Executive CV Example" },
  { slug: "best-cv-format-uk",          title: "Best CV Format in the UK" },
];
export default function AccountantCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Accountant CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Accountant CV Example — How to Write an Accounting CV</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Accounting CVs need to show qualification status, technical competence and commercial impact. Here is a complete guide for qualified and part-qualified accountants at every level and specialism.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your accounting CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your accountant CV with the technical language and commercial impact framing that finance employers look for.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Qualifications — The Most Important Part of an Accounting CV</h2>
        <p>Professional qualifications are the primary shortlisting filter for most accounting roles. Make them immediately visible — in your summary and in a dedicated qualifications section. Key accounting qualifications by region:</p>
        <ul>
          <li><strong>UK:</strong> ACA / ICAEW, ACCA, CIMA, CIPFA (public sector), AAT (technician level)</li>
          <li><strong>USA:</strong> CPA (state-specific), CFA, CMA, CIA</li>
          <li><strong>Australia:</strong> CA (Chartered Accountants Australia and New Zealand), CPA Australia, IPA</li>
          <li><strong>South Africa:</strong> CA(SA) — SAICA, CIMA, ACCA</li>
          <li><strong>Canada:</strong> CPA (CA, CMA, CGA now unified as CPA Canada)</li>
          <li><strong>India:</strong> CA (ICAI), CMA (ICMAI), CS (ICSI)</li>
          <li><strong>International:</strong> ACCA is recognised in 180+ countries and is the most portable global accounting qualification</li>
        </ul>
        <h2>Accounting CV Professional Summary Examples</h2>
        <p><strong>Management accountant (mid-level):</strong></p>
        <blockquote>CIMA-qualified management accountant with 6 years of experience in manufacturing and logistics. Responsible for monthly management accounts, budget variance analysis and business partnering for three operational divisions. Experienced with SAP and advanced Excel modelling. Seeking a financial controller or senior management accountant role.</blockquote>
        <p><strong>Finance director:</strong></p>
        <blockquote>ICAEW-qualified finance director with 15 years of experience in private equity-backed businesses across retail and technology. Extensive M&amp;A experience — led 4 acquisitions and 2 exits as FD. Deep expertise in financial reporting (IFRS), cash management and lender relationships. Seeking a Group FD or CFO role in a business with revenues between £50M and £500M.</blockquote>
        <h2>Technical Skills for Accountants</h2>
        <ul>
          <li><strong>ERP systems:</strong> SAP, Oracle Financials, Sage, NetSuite, Xero, QuickBooks, Dynamics 365</li>
          <li><strong>Reporting standards:</strong> IFRS, UK GAAP, FRS 102, US GAAP</li>
          <li><strong>Specialist areas:</strong> Management accounts, statutory accounts, consolidations, audit, tax (corporate, VAT, personal), treasury, FP&amp;A, forensic accounting</li>
          <li><strong>Tools:</strong> Advanced Excel (VLOOKUP, pivot tables, Power Query, VBA), Power BI, Tableau, Anaplan</li>
        </ul>
        <h2>How to Write Accounting Bullet Points</h2>
        <p>Most accounting CVs read as a list of duties. The ones that get interviews quantify the scope and impact of work.</p>
        <ul>
          <li>"Prepared monthly management accounts pack for three divisions with a combined turnover of £84M, delivering to CFO and board within 5 working days of period end"</li>
          <li>"Identified a £340,000 VAT reclaim opportunity through a retrospective review of intercompany transactions — successfully submitted and recovered within 4 months"</li>
          <li>"Led the implementation of Oracle Fusion across 3 entities, replacing legacy Sage 50 systems and reducing month-end close from 10 days to 4 days"</li>
          <li>"Managed a statutory audit process for a Group with 12 subsidiaries — coordinated with Big 4 auditors and delivered clean opinion 3 weeks ahead of regulatory deadline"</li>
          <li>"Built a 5-year financial model for a £45M acquisition target, including sensitivity analysis across 12 scenarios — used as the primary valuation tool in board-level deal negotiations"</li>
        </ul>
        <h2>Accounting CV by Specialism</h2>
        <ul>
          <li><strong>Practice (audit/tax):</strong> Client portfolio size and sector, audit sign-off responsibility, manager/senior manager grade, Big 4 vs mid-tier vs boutique distinction</li>
          <li><strong>Management accounting:</strong> Month-end close ownership, budget responsibility, business partnering relationships, FP&amp;A modelling</li>
          <li><strong>Financial control:</strong> Statutory reporting ownership, group consolidations, technical accounting (IFRS), audit liaison</li>
          <li><strong>Treasury:</strong> Cash management, FX hedging, banking relationships, liquidity planning, ISDA/GMRA documentation</li>
          <li><strong>Forensic/Transactional:</strong> Due diligence, investigations, expert witness, dispute advisory</li>
        </ul>
        <h2>Part-Qualified Accountant CV</h2>
        <p>If you are part-qualified, state this explicitly in your summary: "Part-qualified ACCA (6 exams remaining, Foundations passed)" or "ACA trainee — 18 months into a 3-year training contract with a Top 10 firm." Hiding part-qualification status wastes everyone's time — most employers are happy to hire part-qualified candidates and may support further study.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your accounting CV improved automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your accountant CV with the technical language and commercial impact finance employers need to see.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Accounting CV &rarr;</Link>
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
