import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nurse CV Example — How to Write a Nursing CV (UK, Australia, Global)",
  description: "A nursing CV guide covering what to include, how to write clinical bullet points, registration requirements, and a full example for registered nurses worldwide.",
  alternates: { canonical: "https://fusecv.com/guides/nurse-cv-example" },
  openGraph: { title: "Nurse CV Example — How to Write a Nursing CV", description: "What to include in a nursing CV — clinical bullet points, registration, and a full example.", url: "https://fusecv.com/guides/nurse-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",   title: "Resume Summary Examples" },
  { slug: "best-cv-format-uk",         title: "Best CV Format in the UK" },
  { slug: "how-to-write-a-cv",         title: "How to Write a CV" },
];
export default function NurseCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Nurse CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Nurse CV Example — How to Write a Nursing CV That Gets Shortlisted</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Nursing CVs have specific requirements — clinical competencies, registration details, and evidence-based practice statements. Here is a complete guide for registered nurses applying in the UK, Australia, and internationally.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your nursing CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your clinical CV with the right language and structure for healthcare roles — in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Makes a Nursing CV Different</h2>
        <p>Unlike a standard professional CV, a nursing CV must demonstrate: clinical competence and patient safety awareness, registration and licence status, specific ward or specialty experience, mandatory training compliance, and (at senior levels) leadership and service development contributions.</p>
        <h2>Nursing CV Structure</h2>
        <h3>1. Personal Details</h3>
        <p>Full name, phone, professional email, LinkedIn (optional), city/country. Do not include your NMC/AHPRA/nursing council PIN number here — it goes in the registration section.</p>
        <h3>2. Professional Summary</h3>
        <p>3–4 lines. State your qualification level (RN, RGN, RMN, EN), years of experience, primary specialty, and what you bring. Example: "Registered General Nurse (Band 6) with 7 years of experience in acute medical wards at NHS trusts in England. Specialised in cardiology and coronary care. Experienced in IV cannulation, medication management and clinical supervision of Band 5 and student nurses. Committed to evidence-based practice and patient-centred care."</p>
        <h3>3. Registration and Qualifications</h3>
        <p>This section is critical for nursing CVs. List: NMC registration number (UK) / AHPRA registration number (Australia) / relevant council registration, registration renewal date, PIN number, any specialist qualifications (e.g. Independent Prescriber, Non-Medical Prescriber), and degree details.</p>
        <h3>4. Clinical Experience (Work History)</h3>
        <p>For each role: hospital/organisation name, ward/department, band (UK) or grade (other countries), employment dates. Bullet points should focus on clinical skills and patient care outcomes — not just duties.</p>
        <p><strong>Weak:</strong> "Responsible for patient care on a 28-bed medical ward."</p>
        <p><strong>Strong:</strong> "Managed complex patient caseloads of 6–8 patients on a 28-bed acute medical ward, including administration of IV medications, wound care, and post-operative monitoring. Maintained zero medication errors over 18 months."</p>
        <h3>5. Key Clinical Competencies</h3>
        <p>A dedicated section listing verified skills: IV cannulation and phlebotomy, catheterisation, wound assessment and management, medication administration (oral, IV, IM, SC), NEWS2 assessment, ACLS/BLS certification, specific equipment competencies (PCA pumps, infusion pumps, ventilators), etc.</p>
        <h3>6. Mandatory Training</h3>
        <p>List current mandatory training with dates: BLS/ILS/ALS, Manual Handling, Safeguarding (Level 2/3), Information Governance, Fire Safety, Conflict Resolution. Include expiry dates where relevant.</p>
        <h3>7. Education</h3>
        <p>BSc/Diploma in Nursing (institution, year, classification), any postgraduate qualifications, and specialty certifications.</p>
        <h3>8. Professional Development</h3>
        <p>Conferences attended, audit participation, quality improvement projects, clinical research involvement.</p>
        <h2>Nursing CV Tips by Country</h2>
        <ul>
          <li><strong>UK (NHS):</strong> Reference the NHS Constitution and NHS Values. Show Band progression. Mention CQC compliance awareness. Address the NMC Code standards in your summary or cover letter.</li>
          <li><strong>Australia:</strong> Include AHPRA registration number. Reference NMBA competency standards. Specific state health system preferences (e.g., NSW Health, Queensland Health, Alfred Health).</li>
          <li><strong>UAE/Middle East:</strong> Include DHA/MOH/HAAD licence status if applicable. International clinical experience is highly valued. Language skills important.</li>
          <li><strong>Canada:</strong> NCLEX pass confirmation, provincial registration, CPR certification current.</li>
          <li><strong>USA:</strong> NCLEX-RN, state licence with licence number, speciality certifications (CCRN, CEN, OCN, etc.).</li>
        </ul>
        <h2>Professional Summary Examples for Nurses</h2>
        <blockquote>ICU nurse with 5 years of experience in adult critical care across Level 3 units. Competent in ventilator management, haemodynamic monitoring and CRRT. BLS and ALS trained. Seeking a senior staff nurse or charge nurse role in a major trauma centre.</blockquote>
        <blockquote>Mental health nurse (RMN) with 8 years of experience in inpatient and community mental health settings. Experienced in risk assessment, de-escalation and CBT-informed care. Qualified PMVA instructor. Seeking a Band 6 CPN or team lead role.</blockquote>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your nursing CV written to clinical standards</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites nursing CVs with the right clinical language, structure and competency framing that healthcare recruiters expect.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Nursing CV &rarr;</Link>
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
