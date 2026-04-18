import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format Kenya — Kenyan CV Guide (2026)",
  description: "How to write a CV for the Kenyan job market. Format, sections, what Nairobi employers expect, professional body registrations, and international application tips.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-kenya" },
  openGraph: { title: "CV Format Kenya — Kenyan CV Guide (2026)", description: "How to write a CV for Kenyan employers — format, sections and what to include.", url: "https://fusecv.com/guides/cv-format-kenya" },
};
const relatedGuides = [
  { slug: "cv-format-south-africa", title: "CV Format South Africa" },
  { slug: "cv-format-nigeria",      title: "CV Format Nigeria" },
  { slug: "how-to-write-a-cv",      title: "How to Write a CV" },
];
export default function CvFormatKenyaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Kenya</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Kenya — Kenyan CV Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Kenya's job market — led by Nairobi as East Africa's commercial hub — has a mix of international companies, NGOs, government bodies, and a fast-growing tech sector. Here is what Kenyan employers expect from a professional CV.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Kenyan CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to the professional standard expected by Kenyan and international employers.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Kenyan CV Format — Overview</h2>
        <ul>
          <li><strong>Length:</strong> 2–4 pages standard. Senior professionals: up to 5 pages. NGO and UN applications may have their own specific requirements.</li>
          <li><strong>Photo:</strong> A professional passport photo is commonly included — formal attire, plain background.</li>
          <li><strong>Personal details:</strong> Full name, phone, email, LinkedIn, current location (county/city), nationality. Date of birth and ID/Passport number are sometimes included for formal applications.</li>
          <li><strong>References:</strong> List 2–3 professional references with full contact details at the end of the CV. This is the Kenyan convention — "references available on request" is less common.</li>
        </ul>
        <h2>Kenyan CV Structure</h2>
        <h3>1. Personal Details</h3>
        <p>Full name, phone (+254 format for Kenyan numbers), email, LinkedIn, location, nationality. For government and formal applications: date of birth and ID/passport number.</p>
        <h3>2. Professional Summary / Career Objective</h3>
        <p>3–5 sentences. Be specific. Example: "Financial analyst with 5 years of experience in commercial banking and microfinance at institutions regulated by the CBK. CPA(K) qualified. Experienced in credit assessment, financial modelling and portfolio performance reporting. Seeking a senior analyst or credit manager role in a Tier 1 bank or development finance institution."</p>
        <h3>3. Work Experience</h3>
        <p>Reverse chronological. Include company name, location, job title, employment dates, and 4–6 bullet points per role. Mix of responsibilities and quantified achievements. Kenyan employers in finance, banking and NGO sectors respond particularly well to evidence-based bullet points.</p>
        <h3>4. Education</h3>
        <p>University degree (institution, qualification, grade/classification, year), KCSE results (grade), professional qualifications. Key university brands that carry weight in Kenya: University of Nairobi, Strathmore University, USIU, JKUAT, and international institutions.</p>
        <h3>5. Professional Certifications and Registrations</h3>
        <p>CPA(K) — ICPAK (Institute of Certified Public Accountants of Kenya), IEK (Institution of Engineers of Kenya), LSK (Law Society of Kenya), KMPDU (Kenya Medical Practitioners), Architectural Association of Kenya, HRMPK, and others relevant to regulated professions.</p>
        <h3>6. Skills</h3>
        <p>Technical skills, software (Sage, QuickBooks, SAP, SPSS, R, Python), languages (English, Kiswahili, other local or international languages — note Kiswahili proficiency explicitly), and professional competencies.</p>
        <h3>7. References</h3>
        <p>2–3 referees with name, title, organisation, phone, and email. Always get written permission before listing anyone.</p>
        <h2>Key Sectors in Kenya</h2>
        <ul>
          <li><strong>Banking and finance:</strong> CBK regulated experience, CPA(K)/ACCA/CFA, Islamic finance (significant in Kenya), microfinance, mobile money (M-Pesa ecosystem)</li>
          <li><strong>Technology:</strong> Kenya is a major tech hub — mention Nairobi tech ecosystem experience, fintech, agritech, healthtech. GitHub profile important for developers.</li>
          <li><strong>NGO/Development:</strong> UN, World Bank, USAID, DFID, Gates Foundation experience is premium. Log frame experience, M&amp;E skills, proposal writing, reporting to donors.</li>
          <li><strong>Government:</strong> IPPD familiarity, PSC application format, specific ministry experience</li>
          <li><strong>Healthcare:</strong> KMPDU registration number, KEMRI/KEMSA/MOH experience, public health programming</li>
          <li><strong>Agriculture:</strong> KEPHIS, commodity trading (tea, coffee, horticulture), value chain experience</li>
        </ul>
        <h2>NGO and UN Applications in Kenya</h2>
        <p>Kenya hosts many UN agencies (UNEP, UN-Habitat, UNHCR) and international NGOs. These organisations typically have their own application formats — often requiring a P11 (UN Personal History Form) or a specific application portal rather than a standard CV. However, a strong professional CV is still the starting point for most positions and should be maintained separately.</p>
        <h2>Applying From Kenya to International Jobs</h2>
        <p>When applying to UK, USA, Canada, or Gulf roles: remove the photo (unless UAE), remove date of birth and ID number, simplify personal details, and follow the target country's format. Your CPA(K) and IEK qualifications are internationally recognised. Kenyan experience at international NGOs, UN agencies, or multinational corporations is valued globally.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your Kenyan CV to the right standard</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV for Kenyan and international employers — in 60 seconds.</p>
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
