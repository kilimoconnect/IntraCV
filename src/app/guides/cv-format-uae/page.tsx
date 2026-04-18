import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format UAE — How to Write a CV for Dubai and the Gulf (2026)",
  description: "CV format for the UAE and Gulf region — what to include, photo rules, nationality, visa status, and industry-specific tips for Dubai, Abu Dhabi and beyond.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-uae" },
  openGraph: { title: "CV Format UAE — How to Write a CV for Dubai and the Gulf", description: "What UAE and Gulf employers expect in a CV — photo, nationality, visa status and more.", url: "https://fusecv.com/guides/cv-format-uae" },
};
const relatedGuides = [
  { slug: "cv-vs-resume",      title: "CV vs Resume — Key Differences" },
  { slug: "how-to-write-a-cv", title: "How to Write a CV" },
  { slug: "executive-cv-example", title: "Executive CV Example" },
];
export default function CvFormatUaePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format UAE</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format UAE — How to Write a CV for Dubai and the Gulf (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">The UAE job market is one of the most competitive and internationally diverse in the world. CV expectations in Dubai and across the Gulf differ from UK and US norms — here is exactly what to include.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your CV ready for the UAE market</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites and formats your CV to the professional standard expected in Dubai and across the Gulf.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Makes a UAE CV Different</h2>
        <ul>
          <li><strong>Photo:</strong> A professional headshot is expected on UAE CVs — unlike UK or US documents. Use a recent, high-quality photo in formal business attire against a plain background.</li>
          <li><strong>Personal details:</strong> Include nationality, date of birth, and visa status (e.g., "UAE Employment Visa — transferable", "Visit Visa", "New application from [country]"). This information is legally required in many UAE hiring processes.</li>
          <li><strong>Length:</strong> 2–3 pages is standard. Longer than 3 pages is unusual for most professional roles.</li>
          <li><strong>Languages:</strong> Include a languages section. Arabic proficiency — even at a conversational level — is a significant advantage in most sectors.</li>
          <li><strong>Driving licence:</strong> Include "UAE Driving Licence" or your home country licence if applicable. This matters for many professional and managerial roles.</li>
        </ul>
        <h2>UAE CV Structure</h2>
        <h3>Personal Details (with photo)</h3>
        <p>Name, phone number (+971 format for UAE numbers), professional email, LinkedIn URL, residential area (e.g., Dubai Marina, Business Bay — not full address), nationality, date of birth, visa status, marital status (optional but common in the Gulf).</p>
        <h3>Career Objective / Professional Summary</h3>
        <p>3–4 lines. Be specific about the type of role you are seeking and your key qualifications. UAE hiring managers appreciate direct, professional summaries. Example: "Finance manager with 10 years of experience across Big 4 audit and corporate finance in the UAE and KSA. CA qualified (ICAEW). Experienced in IFRS reporting, treasury management and Group consolidations across FMCG and real estate sectors. Seeking a senior finance or CFO role in a multinational or government entity."</p>
        <h3>Work Experience</h3>
        <p>Reverse chronological. For each role: company name, brief company description (size, sector) if not widely known in the UAE market, your job title, dates, country. Bullet points focused on achievements and deliverables. Quantify wherever possible.</p>
        <h3>Education</h3>
        <p>Degree, institution, country, year. Internationally recognised qualifications (UK, US, European) are valued. If your qualification is from a less internationally recognised institution, note any accreditation (e.g., CAA-accredited in the UAE).</p>
        <h3>Professional Certifications</h3>
        <p>Very important in the UAE market: ACCA, ICAEW, CFA, PMP, CIMA, CIPD, chartered engineering bodies, medical licences (DHA/MOH/HAAD for healthcare professionals), legal qualifications, and sector-specific certifications.</p>
        <h3>Languages</h3>
        <p>Arabic (even conversational level), English, Hindi, Urdu, French — list all languages with proficiency level (Native, Fluent, Conversational, Basic).</p>
        <h2>Key Sectors in the UAE and What They Look For</h2>
        <ul>
          <li><strong>Finance and banking:</strong> ACCA/ICAEW/CFA essential; IFRS, Vision 2030/UAE economic plan awareness, Islamic finance knowledge advantageous</li>
          <li><strong>Oil and gas / energy:</strong> ADNOC, DEWA supplier experience; HSE certifications; OPITO training</li>
          <li><strong>Real estate:</strong> RERA registration (brokers); UAE market knowledge; international project experience</li>
          <li><strong>Healthcare:</strong> DHA, DOH, or MOH licence mandatory; specialty certifications; experience in JCI-accredited hospitals valued</li>
          <li><strong>Technology:</strong> Standard international tech CV format works; UAE government digital transformation projects (Smart Dubai, etc.) are strong references</li>
          <li><strong>Hospitality:</strong> Brand-name hotel group experience; multilingual; years in the Gulf/Middle East</li>
        </ul>
        <h2>Emiratisation (Nitaqat) Awareness</h2>
        <p>Many large employers in the UAE are required to meet Emiratisation quotas. As an expat applicant, being aware of this context and demonstrating a willingness to mentor, work alongside, and support Emirati colleagues can be a positive signal — particularly for senior roles in UAE government entities and major conglomerates.</p>
        <h2>Applying From Overseas to UAE Jobs</h2>
        <ul>
          <li>Include "Available for immediate relocation" or your expected availability date</li>
          <li>State clearly whether you have a UAE visit visa or are applying from your home country</li>
          <li>Note your salary expectations if asked — this is more common in the UAE hiring process than in UK/US markets</li>
          <li>Many UAE recruiters use LinkedIn heavily — ensure your profile is current and matches your CV exactly</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your UAE CV ready — professionally formatted</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV to the standard UAE and Gulf employers expect — in 60 seconds.</p>
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
