import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teacher CV Example — How to Write a Teaching CV (UK, Australia, Global)",
  description: "How to write a teacher CV that gets shortlisted — sections, bullet point examples, QTS and PGCE guidance, and tips for international teaching applications.",
  alternates: { canonical: "https://fusecv.com/guides/teacher-cv-example" },
  openGraph: { title: "Teacher CV Example — How to Write a Teaching CV", description: "Complete teacher CV guide — sections, bullet examples, QTS guidance and international tips.", url: "https://fusecv.com/guides/teacher-cv-example" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",   title: "Resume Summary Examples" },
  { slug: "career-change-cv-example",  title: "Career Change CV Example" },
  { slug: "cover-letter-example-uk",   title: "Cover Letter Example UK" },
];
export default function TeacherCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Teacher CV Example</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Teacher CV Example — How to Write a Teaching CV That Gets Shortlisted</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Teaching CVs have specific expectations — qualifications, subject expertise, pupil outcomes and pastoral experience all need to be communicated clearly. Here is a complete guide for teachers applying in the UK, Australia and internationally.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your teaching CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your teacher CV with the right language and structure for education roles — in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Teacher CV Structure</h2>
        <h3>1. Personal Details</h3>
        <p>Name, phone, professional email, LinkedIn (optional), city. Include your DBS (UK) or Working With Children check (Australia) status if current — this saves time in the shortlisting process.</p>
        <h3>2. Professional Summary</h3>
        <p>3–4 lines. State your subject(s), phase (Primary, Secondary, FE/HE), years of experience, and what you bring. Example: "Secondary school English teacher (QTS) with 9 years of experience in state comprehensives in London and the South East. Consistently strong GCSE and A-level results — 78% of my A-level students achieved A*-B in 2024. Experienced head of department, with a track record in curriculum design and staff development. Seeking a HOD or senior teacher role."</p>
        <h3>3. Qualified Teacher Status and Registrations</h3>
        <p>A dedicated section for formal qualifications and registrations. Include: QTS (with year awarded), PGCE (institution, year, subject, phase), GTC/TRA registration number (UK), NESA/VIT/AITSL registration (Australia), DBS certificate status and date, any specialist qualifications (SENCO, SLT, Prevent, First Aid).</p>
        <h3>4. Teaching Experience (Work History)</h3>
        <p>Reverse chronological. For each post: school name, type (academy, independent, grammar, comprehensive), phase, subject(s) taught, year groups, dates. Then bullet points focused on outcomes and impact — not just duties.</p>
        <p><strong>Weak:</strong> "Responsible for teaching English to Year 10 and Year 11 students."</p>
        <p><strong>Strong examples:</strong></p>
        <ul>
          <li>"Delivered GCSE English Language and Literature to mixed-ability Year 10 and 11 cohorts — 82% achieved Grade 4+ in 2024, up from 71% the previous year"</li>
          <li>"Designed and implemented a Year 7 reading intervention programme for 24 students working below expected attainment, resulting in an average of 14 months' reading age progress over one academic year"</li>
          <li>"Led a department of 6 English teachers, introducing a new KS3 curriculum aligned to the Ark Curriculum Plus framework that improved consistency across all sets"</li>
          <li>"Delivered INSET on metacognitive strategies to a staff of 65, resulting in whole-school adoption of two research-backed techniques"</li>
        </ul>
        <h3>5. Education</h3>
        <p>Degree (subject, institution, year, classification), PGCE (institution, year, phase/subject), A-levels if relevant. For primary teachers, note your specialism. For secondary, your degree subject is your primary credential.</p>
        <h3>6. Professional Development</h3>
        <p>Significant CPD: National Professional Qualifications (NPQs), subject associations, external training, research projects, school partnership work. This section signals professional engagement and ambition.</p>
        <h3>7. Additional Responsibilities and Extracurricular</h3>
        <p>Form tutor, pastoral lead, subject coordinator, exam officer, Duke of Edinburgh coordinator, after-school clubs, sports coaching. These demonstrate commitment beyond the timetable.</p>
        <h2>Teaching CV Tips by Sector</h2>
        <ul>
          <li><strong>UK State School:</strong> Reference Ofsted framework language, safeguarding awareness, adaptive teaching, inclusion. Show pupil premium or disadvantaged pupil progress.</li>
          <li><strong>UK Independent School:</strong> Emphasise co-curricular, boarding duties (if applicable), A-level results, Oxbridge preparation, alumni outcomes.</li>
          <li><strong>Australia:</strong> AITSL standards alignment, NAPLAN data reference, explicit teaching methodology, cultural responsiveness, Aboriginal and Torres Strait Islander perspectives.</li>
          <li><strong>International Schools (IB, British Curriculum):</strong> IB DP/MYP/PYP experience, international context awareness, EAL experience, previous overseas postings.</li>
          <li><strong>FE/HE:</strong> PGCE (PCET), Qualified Teacher Learning and Skills (QTLS), industry links, awarding body relationships, employer partnerships.</li>
        </ul>
        <h2>Personal Statement Examples for Teachers</h2>
        <blockquote>Primary school teacher with 6 years of experience across KS1 and KS2 in inner-London schools. Experienced in phonics lead responsibilities (Little Wandle scheme lead) and SEND coordination. Strong pupil outcomes — 89% of my Year 6 class achieved Expected Standard in Reading in 2024, against a school average of 74%. Seeking a Year 3/4 class teacher or phase lead role in a school committed to evidence-based practice.</blockquote>
        <blockquote>History and Politics teacher at A-level and GCSE (QTS, 11 years) seeking a Head of Humanities or Assistant Head (Curriculum) role. Track record of strong outcomes — A-level History cohort averaged B+ over the past 3 years. Experienced in curriculum design, timetabling, staff appraisal and Ofsted preparation.</blockquote>
        <h2>Cover Letter for Teaching Jobs</h2>
        <p>Most teaching applications require a cover letter or personal statement addressing the school's person specification. Address each criterion briefly and specifically — use evidence (pupil outcomes, specific programmes, measurable contributions). Generic teaching cover letters are immediately identifiable and rarely progress.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your teaching CV improved automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your teacher CV with the right language, structure and outcomes evidence that shortlisting panels look for.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My Teaching CV &rarr;</Link>
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
