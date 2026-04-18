import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format India — Indian Resume Guide (2026)",
  description: "How to write a CV or resume for the Indian job market — format, sections, what Indian employers expect, and tips for both domestic and international applications.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-india" },
  openGraph: { title: "CV Format India — Indian Resume Guide (2026)", description: "How to write a CV for the Indian job market — format, sections and what employers expect.", url: "https://fusecv.com/guides/cv-format-india" },
};
const relatedGuides = [
  { slug: "cv-vs-resume",       title: "CV vs Resume — Key Differences" },
  { slug: "how-to-write-a-cv",  title: "How to Write a CV" },
  { slug: "ats-cv-checker",     title: "ATS CV Checker" },
];
export default function CvFormatIndiaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format India</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format India — Indian Resume Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">India uses both "CV" and "resume" interchangeably, but the format expectations differ from Western markets. Here is exactly what Indian employers — from MNCs to startups to PSUs — expect to see.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your Indian CV or resume improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to the professional standard expected by Indian and international employers — in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>CV vs Resume in India</h2>
        <p>In India, both terms are widely used. For corporate, MNC, and startup roles, the format is essentially the same as a UK or international CV — 2–3 pages, reverse chronological, achievements-focused. For government (UPSC, PSC), academic, and public sector roles, a longer, more detailed format may be expected including declarations and personal information.</p>
        <h2>What Indian Employers Generally Expect</h2>
        <ul>
          <li><strong>Length:</strong> Freshers: 1 page. Experienced professionals: 2–3 pages. Senior management: 3–4 pages acceptable.</li>
          <li><strong>Photo:</strong> A professional photo is commonly included on Indian CVs for most sectors — use a formal headshot with a neutral background. However, for MNC applications and international roles from India, a photo is not expected and may be left out.</li>
          <li><strong>Personal details:</strong> Date of birth, nationality, and marital status are frequently included on Indian CVs — particularly for traditional sectors and government roles. For startups and MNCs, these are less common.</li>
          <li><strong>Declaration:</strong> Many Indian CVs include a formal declaration at the end: "I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief." This is standard for government applications but optional for private sector.</li>
        </ul>
        <h2>Indian CV Structure</h2>
        <h3>1. Personal Details</h3>
        <p>Name, mobile number, email, LinkedIn URL, city. Add date of birth, nationality and languages known if applying to traditional sectors. For MNCs and tech companies, keep it minimal.</p>
        <h3>2. Career Objective / Professional Summary</h3>
        <p>Freshers: a career objective (2–3 sentences on your goals and what you bring). Experienced professionals: a professional summary (achievements, speciality, what you seek). Avoid generic statements — be specific about your background and direction.</p>
        <h3>3. Work Experience</h3>
        <p>Reverse chronological. Company name, designation (job title), employment dates. Bullet points on responsibilities and achievements. Indian CVs often include more duties than Western documents — but wherever possible, convert duties to achievements with numbers.</p>
        <h3>4. Education</h3>
        <p>List in reverse chronological order. For freshers: Class 10 and Class 12 boards, percentage/CGPA, year. Degree: institution, branch/specialisation, CGPA/percentage, year. Post-graduates: MBA college and specialisation. IIT/IIM/NIT alumni: mention prominently — these carry significant weight with Indian employers.</p>
        <h3>5. Skills</h3>
        <p>Technical skills (software, programming languages, tools, certifications) and language skills. For IT and engineering roles, this is a critical section.</p>
        <h3>6. Certifications and Courses</h3>
        <p>NPTEL, Coursera, NASSCOM, professional certifications (PMP, ACCA, CFA, SAP, Salesforce, AWS), competitive exam scores (GATE, GMAT, GRE, CAT).</p>
        <h3>7. Projects (for freshers and tech roles)</h3>
        <p>For students and early-career professionals, a projects section is essential — final year project, internship projects, academic research, open-source contributions. Include technology stack, your role, and outcomes.</p>
        <h3>8. Achievements and Awards</h3>
        <p>Academic rank, scholarships, extracurricular recognitions, professional awards. For freshers, this section compensates for limited work experience.</p>
        <h2>Sector-Specific Notes</h2>
        <ul>
          <li><strong>IT/Software:</strong> GitHub profile, competitive programming (Codeforces, LeetCode ratings), specific frameworks and cloud platforms. FAANG-style CVs should follow clean 1-page US resume format.</li>
          <li><strong>Finance (CA/CFA):</strong> ICAI membership and year of qualification prominently placed. Articleship firm name matters. Big 4 vs national firm distinction is significant.</li>
          <li><strong>Management (MBA):</strong> College tier matters enormously — IIM, XLRI, SPJIMR, MDI carry distinct weight. List club positions, case competition wins, summer internship company.</li>
          <li><strong>Government/PSU:</strong> Detailed format with declarations, marks in competitive exams, caste category if applicable for reservations, full academic history.</li>
          <li><strong>Healthcare:</strong> MCI registration number, medical college name, DNB/MD/MS speciality, hospital affiliations.</li>
        </ul>
        <h2>Applying From India to International Jobs</h2>
        <p>When applying to roles in the UK, USA, Australia, UAE or Canada from India: remove the photo, remove date of birth and marital status, remove the declaration section, convert to a single-column clean format, and use the CV format expected in your target country. Your Indian qualifications — especially from IITs, IIMs, AIIMS, or ICAI — are internationally recognised and should be presented clearly.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your CV ready for Indian and global markets</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV to the professional standard expected by Indian and international employers — in 60 seconds.</p>
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
