import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format Nigeria — Nigerian CV Guide (2026)",
  description: "How to write a CV for the Nigerian job market. Format, length, what employers expect in Lagos, Abuja and beyond — plus international application tips.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-nigeria" },
  openGraph: { title: "CV Format Nigeria — Nigerian CV Guide (2026)", description: "How to write a CV for Nigerian employers — format, sections and what to include.", url: "https://fusecv.com/guides/cv-format-nigeria" },
};
const relatedGuides = [
  { slug: "cv-vs-resume",            title: "CV vs Resume — Key Differences" },
  { slug: "cv-format-south-africa",  title: "CV Format South Africa" },
  { slug: "how-to-write-a-cv",       title: "How to Write a CV" },
];
export default function CvFormatNigeriaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Nigeria</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Nigeria — Nigerian CV Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Nigeria is Africa's largest economy with a rapidly growing professional job market. CV conventions reflect a blend of British formatting traditions and local expectations. Here is what Nigerian employers — from multinationals to banks to oil and gas companies — actually want to see.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Nigerian CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to the professional standard expected by Nigerian and international employers.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Nigerian CV Format — The Basics</h2>
        <ul>
          <li><strong>Length:</strong> 2–4 pages for most professionals. Senior professionals may go up to 5 pages.</li>
          <li><strong>Photo:</strong> A professional passport-style photo is commonly included — use a formal headshot with a plain background.</li>
          <li><strong>Personal details:</strong> Full name, phone, email, LinkedIn, current address (including state), nationality ("Nigerian" or dual nationality). Date of birth and marital status are often included in traditional and formal sector applications.</li>
          <li><strong>State of Origin:</strong> For government and public sector roles, state of origin is often required. For private sector and MNC roles, it is less commonly needed.</li>
          <li><strong>References:</strong> Nigerian CVs typically include 2–3 professional references with full contact details. Always obtain permission before listing anyone.</li>
        </ul>
        <h2>Nigerian CV Structure</h2>
        <h3>1. Personal Information</h3>
        <p>Full name (bold, large), contact number, email, address (city and state), LinkedIn URL, date of birth, nationality, state of origin (for some applications), marital status (optional), languages spoken.</p>
        <h3>2. Career Objective / Professional Summary</h3>
        <p>3–5 sentences. For freshers/NYSC: career objective. For experienced professionals: professional summary focusing on expertise, achievements and career direction. Example: "Finance professional with 7 years of experience in banking and financial analysis across Lagos and Abuja. ACA (ICAN) qualified with a track record in credit risk assessment, portfolio management and regulatory reporting for Tier 1 banks. Seeking a senior credit officer or branch manager role."</p>
        <h3>3. Work Experience</h3>
        <p>Reverse chronological. Company name, location (city), job title, dates. Bullet points on key responsibilities and achievements. Include sector context where not obvious — Nigerian employers value knowing the company type and scale. Quantify where possible.</p>
        <h3>4. Education</h3>
        <p>University: institution, degree, class of degree (First Class, Second Class Upper/Lower, Third Class), year. WAEC/NECO: O-Level results, year. Post-secondary qualifications. Professional certifications. Include NYSC discharge certificate year if applicable.</p>
        <h3>5. Professional Certifications</h3>
        <p>ICAN (Institute of Chartered Accountants of Nigeria), ANAN, CIBN, CIIN, NSE (Nigerian Society of Engineers), NBA (Nigerian Bar Association), NMA (Nigerian Medical Association), ACCA, CIMA, CFA, PMP, CIPM, CIHRM, PMI, and others relevant to your profession.</p>
        <h3>6. Skills</h3>
        <p>Technical skills, IT skills, language proficiency, professional competencies. Be specific — list software, tools, and systems you use regularly.</p>
        <h3>7. References</h3>
        <p>2–3 professional referees with name, title, organisation, phone, and email. "References available on request" is less common — listing actual referees is the Nigerian convention.</p>
        <h2>Key Sectors in Nigeria and CV Tips</h2>
        <ul>
          <li><strong>Banking and finance:</strong> CBN regulatory experience, AML/KYC compliance, credit analysis, ICAN qualification, specific bank or asset management experience</li>
          <li><strong>Oil and gas:</strong> NUPENG/PENGASSAN membership if applicable, HSE certifications, NIPEX registration, IOC/NNPC experience, SURF/subsea/processing experience for engineers</li>
          <li><strong>Telecoms (MTN, Airtel, Glo):</strong> Project management certifications, network engineering (4G/5G), ITIL, vendor management experience</li>
          <li><strong>Legal:</strong> NBA call to bar year and number, chambers affiliation, LLM/LLB, specialist areas of law</li>
          <li><strong>Healthcare:</strong> MDCN registration number, NYSC completion, postgraduate college qualifications (WACP, FMC), hospital affiliations</li>
          <li><strong>FMCG/consumer goods:</strong> Experience with Unilever, Nestlé, PZ Cussons, Dangote Group — brand name employers carry significant weight</li>
        </ul>
        <h2>NYSC (National Youth Service Corps)</h2>
        <p>If you have completed NYSC, state the year and location of service. Nigerian employers — particularly in the formal sector — almost universally expect NYSC completion for university graduates. Your discharge certificate year should appear in your education section.</p>
        <h2>Applying From Nigeria to International Roles</h2>
        <p>When applying to UK, USA, Canada, or UAE roles: remove the photo (except UAE), remove date of birth and marital status, remove state of origin, remove the declaration, simplify the personal details section, and follow the target country's CV or resume format. Your professional certifications (ICAN, ACCA, CIBN) are internationally recognised — present them prominently.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your Nigerian CV written to professional standards</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV improves your CV to the standard Nigerian and international employers expect — in 60 seconds.</p>
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
