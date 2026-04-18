import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format Ghana — How to Write a Ghana CV or Resume (2026)",
  description: "How to write a CV for Ghana employers — format, length, SSNIT, professional affiliations and what Ghanaian hiring managers expect. With sector-specific tips.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-ghana" },
  openGraph: { title: "CV Format Ghana — Ghana CV Guide (2026)", description: "How to write a CV for Ghana — format, SSNIT, professional affiliations and sector tips for the Ghanaian job market.", url: "https://fusecv.com/guides/cv-format-ghana" },
};
const relatedGuides = [
  { slug: "cv-format-nigeria",       title: "CV Format Nigeria" },
  { slug: "cv-format-kenya",         title: "CV Format Kenya" },
  { slug: "cv-format-south-africa",  title: "CV Format South Africa" },
];
export default function CvFormatGhanaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Ghana</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Ghana — How to Write a CV for the Ghanaian Job Market (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Ghana has one of West Africa's most dynamic and diverse economies — with growing sectors in mining, oil and gas, banking, technology and agriculture. The Ghanaian CV market blends formal British-influenced conventions with local professional norms. Here is how to position yourself effectively.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Ghana CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to the professional standard expected by Ghanaian and international employers operating in Ghana.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Ghana CV Format Overview</h2>
        <ul>
          <li><strong>Length:</strong> 2–3 pages is standard for experienced professionals. Ghanaian CVs tend to be slightly longer than Western norms — a 3-page CV for a mid-senior professional is normal and expected. Graduates and entry-level candidates should aim for 1–2 pages.</li>
          <li><strong>Language:</strong> English — the official business language of Ghana.</li>
          <li><strong>Photo:</strong> A professional passport-style photo is widely expected on Ghanaian CVs, particularly for corporate, public sector and formal business roles. Place it in the top right corner.</li>
          <li><strong>Personal details:</strong> Full name, date of birth, nationality, contact phone, email, location (town/region), Ghana Card number or passport number is sometimes requested for government applications — do not include on your standard CV unless required by a specific application form.</li>
          <li><strong>SSNIT number:</strong> Social Security and National Insurance Trust — do not include on your CV itself but have it ready for formal employment onboarding.</li>
          <li><strong>Referees:</strong> 2–3 professional referees are standard at the bottom of the CV. Include name, title, organisation and phone number.</li>
        </ul>

        <h2>Ghana CV Structure</h2>
        <h3>Personal Details</h3>
        <p>Full name, date of birth, nationality, religion (optional — sometimes included in more traditional applications, particularly for public sector), marital status (optional), contact number, email, home town/region and current city. LinkedIn is increasingly expected for professional and corporate roles.</p>
        <h3>Professional Profile / Career Objective</h3>
        <p>A 3–5 sentence summary of your professional background, key skills and career goals. Be specific about your industry, years of experience and what you are seeking. For senior roles, emphasise business value delivered and leadership scope.</p>
        <h3>Work Experience</h3>
        <p>Reverse chronological order. Company name, your job title, dates (month/year format). Achievement-focused bullet points — Ghanaian employers respond well to quantified outcomes. Include GHS (Ghanaian Cedi) amounts for cost savings or revenue generation where relevant, or use USD for international-facing roles.</p>
        <h3>Education</h3>
        <p>University of Ghana (Legon), Kwame Nkrumah University of Science and Technology (KNUST), University of Cape Coast, Ashesi University, and other accredited Ghanaian institutions are well regarded. Include degree, subject, classification and year. Also include WASSCE/O-Level and A-Level results if applying for a first job or if specifically requested.</p>
        <h3>Professional Certifications and Memberships</h3>
        <p>Highly valued in Ghana. Include: ICAG (Institute of Chartered Accountants, Ghana), GIoD (Ghana Institute of Directors), CIMG (Chartered Institute of Marketing, Ghana), PMI/PMP certification, ACCA, CIMA, CFA, SHRM, CIM (UK). State membership level and year obtained.</p>
        <h3>Skills</h3>
        <p>Technical skills, software proficiency, language capabilities. French is a genuine differentiator given Ghana's proximity to Francophone West Africa.</p>
        <h3>Referees</h3>
        <p>2–3 professional references with full contact details.</p>

        <h2>Key Industries in Ghana — CV Tips by Sector</h2>
        <ul>
          <li><strong>Mining and natural resources:</strong> Ghana is a major gold producer (Newmont, AngloGold Ashanti, Gold Fields operate there). Include mine site experience, safety certifications (MINCOM, OSHA), and technical expertise relevant to surface or underground mining. Mention specific Ghanaian regulatory experience (Minerals Commission, EPA).</li>
          <li><strong>Oil and gas:</strong> With production from the Jubilee, TEN and Sankofa fields, the petroleum sector is significant. Include TPDI (Technical and Professional Development Institute) certification, PIAC-relevant experience, and upstream or downstream specialisation.</li>
          <li><strong>Banking and finance:</strong> Major institutions include GCB Bank, Ecobank, Stanbic, Absa, Standard Chartered. ICAG membership is highly valued. Include Bank of Ghana regulatory experience if relevant. For microfinance, mention GHAMFIN-related work.</li>
          <li><strong>Technology:</strong> Ghana's tech ecosystem — centred in Accra (the Silicon Savannah) — is growing rapidly. Startups, fintech (MTN Mobile Money ecosystem, Fido, Zeepay) and international tech companies all hire locally. Include relevant programming languages, cloud platforms and any fintech-specific experience.</li>
          <li><strong>Public sector and government:</strong> Ghana Civil Service, Ghana Health Service, Ghana Education Service. Include results of the Civil Service examination where applicable. Public sector applications in Ghana often follow specific formats issued by Public Services Commission (PSC).</li>
          <li><strong>Agriculture and agribusiness:</strong> COCOBOD (cocoa sector), export horticulture, and agritech are active employment areas. Include experience with Ghana Standards Authority (GSA) certifications or export compliance.</li>
        </ul>

        <h2>Applying for International Roles in Ghana</h2>
        <p>Many international organisations — including USAID, GIZ, UN agencies, World Bank, DFID/FCDO, and international NGOs — have active programmes in Ghana. For these roles:</p>
        <ul>
          <li>Use a more internationally standardised CV format (closer to UK/US conventions) rather than the traditional Ghanaian format</li>
          <li>Omit date of birth, religion and marital status — these are not appropriate for international NGO or development sector applications</li>
          <li>Lead with impact, outcomes and development indicators — beneficiaries reached, budgets managed, results achieved</li>
          <li>Include language capabilities clearly — French, Hausa, Twi or other regional languages add significant value</li>
        </ul>

        <h2>Ghana CV Mistakes to Avoid</h2>
        <ul>
          <li>Submitting a 5-page CV — Ghanaian CVs can be longer than Western norms but should not exceed 3 pages for most roles</li>
          <li>No professional certifications listed — Ghana's formal professional membership culture means this section carries significant weight</li>
          <li>Vague work descriptions — outcome-based bullets are increasingly expected by multinational and corporate employers</li>
          <li>Missing referees — expected in the Ghanaian market; "available on request" is less effective</li>
          <li>Not tailoring for sector — a mining CV and a banking CV should look very different; generic CVs underperform</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your CV ready for the Ghana job market</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV to the professional standard expected by Ghanaian and international employers across banking, mining, tech and the public sector.</p>
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
