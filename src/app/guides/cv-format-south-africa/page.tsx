import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CV Format South Africa — SA CV Guide (2026)",
  description: "How to write a CV for the South African job market. What SA employers expect, format, length, BBBEE considerations and common mistakes.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-south-africa" },
  openGraph: { title: "CV Format South Africa — SA CV Guide (2026)", description: "How to write a CV for South African employers — format, length and what to include.", url: "https://fusecv.com/guides/cv-format-south-africa" },
};
const relatedGuides = [
  { slug: "cv-vs-resume", title: "CV vs Resume — Key Differences" },
  { slug: "how-to-write-a-cv", title: "How to Write a CV" },
  { slug: "ats-cv-checker", title: "ATS CV Checker" },
];
export default function CvFormatSouthAfricaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format South Africa</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format South Africa — SA CV Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">South African CV conventions blend UK-style formatting with local requirements. Here is what employers in South Africa actually expect — including the information that surprises international candidates.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your CV ready for the South African market</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to professional standards — ATS-optimised and formatted correctly in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>South African CV Format — The Basics</h2>
        <ul>
          <li><strong>Length:</strong> 3–5 pages is standard in South Africa — longer than UK or US norms. Senior professionals may go to 6 pages.</li>
          <li><strong>Personal details:</strong> Unlike UK/US CVs, South African CVs traditionally include: ID number (optional but sometimes requested), date of birth, nationality, language proficiency, and criminal record status (clean). These are often included due to employment legislation requirements.</li>
          <li><strong>Photo:</strong> A professional photo is commonly included in South African CVs, though it is not mandatory. Use a business-appropriate headshot.</li>
          <li><strong>References:</strong> Always include 3 professional references with full contact details at the end of your CV. This is standard in South Africa.</li>
          <li><strong>BBBEE status:</strong> Broad-Based Black Economic Empowerment status may be included, particularly when applying for roles at large corporates or public sector organisations where employment equity is a priority.</li>
        </ul>
        <h2>SA CV Structure</h2>
        <h3>1. Personal Details</h3>
        <p>Full name, contact number, email, physical address (city and province), ID number (optional), date of birth, nationality, languages spoken, and driver's licence (if applicable).</p>
        <h3>2. Career Objective / Profile</h3>
        <p>3–5 lines summarising your experience, expertise and career goals. Be specific. South African employers value candidates who are clear about what they bring and what they are looking for.</p>
        <h3>3. Core Competencies / Skills</h3>
        <p>A list of 8–12 key professional skills relevant to the role. Both technical and soft skills are commonly listed — though technical skills should come first.</p>
        <h3>4. Work Experience</h3>
        <p>Reverse chronological order. Company name, job title, employment dates, brief company description if not widely known. 5–8 bullet points per role covering duties and achievements. South African CVs traditionally include more detail per role than UK or US documents.</p>
        <h3>5. Education and Qualifications</h3>
        <p>All qualifications listed in reverse chronological order — include matric (high school), degree, postgraduate qualifications, and professional certifications. SAQA-aligned qualifications should be named correctly (NQF Level, if applicable).</p>
        <h3>6. Training and Development</h3>
        <p>Courses, workshops, and professional development activities — commonly listed as a separate section in South Africa.</p>
        <h3>7. Professional Memberships</h3>
        <p>SAICA, SACNASP, ECSA, HPCSA, SACSSP — professional body membership is important for regulated professions and should be listed with membership numbers where appropriate.</p>
        <h3>8. References</h3>
        <p>3 professional references with name, job title, company, phone number and email. Always obtain written permission before listing anyone as a reference.</p>
        <h2>Industry-Specific Notes</h2>
        <ul>
          <li><strong>Mining and engineering:</strong> Include GCC (Government Certificate of Competency), ECSA registration, safety training, and equipment competencies</li>
          <li><strong>Finance and accounting:</strong> SAICA, CIMA, or ACCA qualifications are essential; include CA(SA) designation if applicable</li>
          <li><strong>Healthcare:</strong> HPCSA registration number mandatory; include practice number and speciality registration</li>
          <li><strong>Legal:</strong> Law Society registration, admission date, courts of practice</li>
          <li><strong>IT:</strong> Standard international format works; local employers also value certifications from AWS, Microsoft, Cisco, and Oracle</li>
        </ul>
        <h2>Applying to South African Companies From Abroad</h2>
        <p>If you are applying from outside South Africa, make sure to: address your work permit or visa situation clearly (in the cover letter, not the CV), state if you are a South African citizen or have the right to work, and be explicit about your relocation plans or willingness to relocate.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get a professional CV that stands out in South Africa</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV uses AI to improve your CV to the standard SA employers expect — in 60 seconds.</p>
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
