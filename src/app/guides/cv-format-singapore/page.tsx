import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format Singapore — How to Write a Singapore Resume or CV (2026)",
  description: "How to write a CV for Singapore employers — format, length, MOM pass requirements, key industries and what Singapore hiring managers expect from your resume.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-singapore" },
  openGraph: { title: "CV Format Singapore — Singapore Resume Guide (2026)", description: "How to write a CV for Singapore — format, pass requirements, sectors and what employers expect.", url: "https://fusecv.com/guides/cv-format-singapore" },
};
const relatedGuides = [
  { slug: "resume-format-usa",       title: "Resume Format USA" },
  { slug: "cv-format-australia",     title: "CV Format Australia" },
  { slug: "cv-format-uae",           title: "CV Format UAE" },
];
export default function CvFormatSingaporePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Singapore</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Singapore — How to Write a Singapore CV or Resume (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Singapore is one of Asia's most competitive job markets — a major hub for finance, technology, logistics, pharma and professional services. Its CV conventions blend Western standards with regional expectations. Here is exactly what Singapore employers expect.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Singapore CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to the professional standard expected by Singapore employers across finance, tech and corporate sectors.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Singapore CV Format Overview</h2>
        <ul>
          <li><strong>Length:</strong> 2 pages for most professionals. Senior and executive roles may extend to 3 pages. A single page is acceptable for fresh graduates and those with under 2 years of experience.</li>
          <li><strong>Language:</strong> English — the primary business language of Singapore.</li>
          <li><strong>Photo:</strong> Not mandatory, but common practice across Singapore and broadly accepted. If included, use a professional headshot in business attire.</li>
          <li><strong>Personal details:</strong> Name, email, phone, LinkedIn. NRIC (National Registration Identity Card) number should NOT be included on a CV — the Personal Data Protection Act (PDPA) makes this a privacy concern. Nationality and work pass status are however relevant and often expected.</li>
          <li><strong>File format:</strong> PDF is standard for email and portal applications. Some government-linked companies (GLCs) and agencies have specific portal requirements.</li>
          <li><strong>Font and layout:</strong> Clean, professional formatting. Arial, Calibri or Times New Roman. Avoid decorative or heavily formatted CVs for corporate and financial roles.</li>
        </ul>

        <h2>Work Pass and Residency — What to Include</h2>
        <p>Singapore's work visa landscape is regulated by the Ministry of Manpower (MOM). Employers and recruiters need to understand your right to work early in the process:</p>
        <ul>
          <li><strong>Singapore Citizens (SC) and Permanent Residents (PR):</strong> State "Singapore Citizen" or "Singapore PR" clearly in your personal details or professional summary. This is a significant advantage in the local job market due to Fair Consideration Framework (FCF) requirements.</li>
          <li><strong>Employment Pass (EP) holders:</strong> State "Employment Pass holder" and your pass expiry date if it is due for renewal. Also state nationality.</li>
          <li><strong>Dependant's Pass or Long-Term Visit Pass:</strong> State if you have a Letter of Consent (LOC) or need employer sponsorship. Be transparent early — recruiters will ask.</li>
          <li><strong>Candidates requiring sponsorship:</strong> Confirm you are applying for EP or S Pass eligibility. Note your nationality, as MOM has fixed levy and quota requirements that affect eligibility.</li>
        </ul>

        <h2>Singapore CV Structure</h2>
        <h3>Personal Details</h3>
        <p>Full name, phone, email, LinkedIn. Nationality and residency status. Location (District or area — "Tampines," "Orchard," "CBD" are understood references; avoid full address for privacy).</p>
        <h3>Professional Summary</h3>
        <p>2–4 lines summarising your expertise, industry focus and what you offer. State industry experience explicitly (e.g., "8 years in financial services across Singapore and Hong Kong"). Strong summaries reference MAS regulations, SGX-listed company experience, or relevant regional expertise.</p>
        <h3>Work Experience</h3>
        <p>Reverse chronological. Company name, role title, dates (month/year format). 3–5 achievement-focused bullet points per role. Singapore employers respond well to impact metrics — revenue generated, cost savings, team size, project scale in SGD. For roles at international companies, note the regional scope (e.g., "APAC remit" or "SEA market responsibility").</p>
        <h3>Education</h3>
        <p>Degree, institution, graduation year. Include NUS, NTU, SMU if applicable — these are highly regarded locally. For overseas degrees, include the full institution name and country. Include professional certifications below (CFA, ACCA, PMP, AWS etc.).</p>
        <h3>Skills</h3>
        <p>Technical skills, software, languages. Mandarin proficiency is a genuine differentiator for many regional roles — always include language skills with level (conversational, business-level, native).</p>

        <h2>Key Industries in Singapore — CV Tips by Sector</h2>
        <ul>
          <li><strong>Banking and financial services:</strong> MAS regulatory knowledge, experience with MAS notices, AML/KYC compliance, capital markets, private banking (HNW/UHNW clients), fund administration. Reference MAS licensing if relevant.</li>
          <li><strong>Technology:</strong> Singapore is a major APAC tech hub. Include cloud platforms (AWS, Azure, GCP), APAC market experience, and any Singapore-specific compliance (PDPA, Monetary Authority circulars for fintech).</li>
          <li><strong>Logistics and supply chain:</strong> Singapore's status as a global port hub means this sector values regional network knowledge — Southeast Asian trade lanes, Tier 1 logistics players, freight forwarding and customs expertise.</li>
          <li><strong>Pharma and biomedical:</strong> A-STAR affiliation, HSA (Health Sciences Authority) regulatory knowledge, MedTech manufacturing experience. Singapore is a major APAC biopharma hub.</li>
          <li><strong>Public sector and statutory boards:</strong> Government-linked companies (GLCs) — Temasek, GIC, PSA, ST Engineering — tend to have structured application processes. Emphasise national service completion (if applicable) and Singapore academic credentials.</li>
        </ul>

        <h2>Fair Consideration Framework (FCF) — What It Means for Your CV</h2>
        <p>Singapore's FCF requires employers to fairly consider Singaporeans before hiring foreign nationals. Job advertisements must be posted on MyCareersFuture.sg for at least 14 days for positions earning up to SGD$20,000/month. For foreign applicants, this means your CV needs to clearly demonstrate skills unavailability locally — regional expertise, specialist technical skills, or language capability that complements the local talent pool.</p>

        <h2>Common Singapore CV Mistakes</h2>
        <ul>
          <li>Including NRIC number — this is a PDPA risk and modern employers do not expect it on a CV</li>
          <li>Not stating nationality or pass type — Singapore recruiters need this information early; leaving it out causes delays</li>
          <li>No regional scope context — for APAC-facing roles, always state the geographic remit of your responsibilities</li>
          <li>Too short (1 page) for experienced professionals — Singapore follows a 2-page norm for anyone with 3+ years of experience</li>
          <li>Missing certifications — professional qualifications carry more weight in Singapore's formal hiring culture; always include them</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your CV ready for the Singapore job market</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV to the professional standard expected by Singapore employers across banking, tech, logistics and corporate sectors.</p>
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
