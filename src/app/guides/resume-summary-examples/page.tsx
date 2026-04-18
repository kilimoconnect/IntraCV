import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume Summary Examples — 15 Templates by Industry and Career Level",
  description:
    "15 professional summary examples for CVs and resumes — covering software engineering, nursing, teaching, marketing, finance, executives, graduates and career changers.",
  alternates: { canonical: "https://fusecv.com/guides/resume-summary-examples" },
  openGraph: {
    title: "Resume Summary Examples — 15 Templates by Industry and Career Level",
    description: "15 professional summary examples for CVs and resumes — by industry, level and role.",
    url: "https://fusecv.com/guides/resume-summary-examples",
  },
};

const relatedGuides = [
  { slug: "best-cv-format-uk",            title: "Best CV Format in the UK" },
  { slug: "improve-cv-fast",              title: "How to Improve Your CV Fast" },
  { slug: "graduate-cv-no-experience",    title: "Graduate CV With No Experience" },
];

export default function ResumeSummaryExamplesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Resume Summary Examples</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Resume Summary Examples — 15 Templates by Industry and Level
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        A strong professional summary tells recruiters who you are in four lines. A weak one gets skipped. Here are 15 examples across industries and career levels — plus the formula to write your own.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get AI to write your professional summary</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV generates a personalised professional summary based on your actual experience — tailored to your career level and target role.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Write My Summary Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>What Is a Professional Summary?</h2>
        <p>
          A professional summary (also called a personal statement, profile, or CV summary) is a 3–5 line paragraph at the top of your CV that positions you as a candidate before the recruiter reads anything else.
        </p>
        <p>
          It is not an objective ("I am looking for a role where I can grow..."). It is a positioning statement: who you are, what level you are at, what you specialise in, and what value you bring.
        </p>

        <h2>The Formula</h2>
        <p>
          <strong>[Career level / years of experience] + [job title / speciality] + [key skill or achievement] + [what you are seeking or what you bring]</strong>
        </p>
        <p>
          You do not need to include all four elements every time, and the order can vary — but a strong summary almost always answers those four questions in some way.
        </p>

        <h2>15 Professional Summary Examples</h2>

        <h3>1. Software Engineer (Mid-level)</h3>
        <blockquote>
          Backend engineer with 5 years of experience building scalable APIs and microservices in Python and Node.js. Experienced with AWS infrastructure, PostgreSQL and Redis. Seeking a senior engineer role at a product-led company where system reliability and developer experience are taken seriously.
        </blockquote>

        <h3>2. Software Engineer (Senior / Lead)</h3>
        <blockquote>
          Senior software engineer with 9 years of experience building distributed systems at scale. Led backend architecture for a fintech platform serving 1.4M daily users. Strong background in system design, technical mentorship and cross-functional collaboration. Ready to step into a lead or staff engineer role.
        </blockquote>

        <h3>3. Data Analyst</h3>
        <blockquote>
          Data analyst with 4 years of experience in e-commerce and retail analytics. Proficient in Python, SQL and Tableau. Delivered dashboards and insights that directly informed £12M in merchandising decisions. Seeking a senior analyst or BI role with a data-mature team.
        </blockquote>

        <h3>4. Marketing Manager</h3>
        <blockquote>
          B2B marketing manager with 7 years of experience in demand generation, content and ABM at SaaS companies. Grew qualified pipeline by 3x in two years at a Series B startup. Strong in HubSpot, Salesforce and marketing attribution. Seeking a Head of Marketing role at a growth-stage business.
        </blockquote>

        <h3>5. Project Manager</h3>
        <blockquote>
          PRINCE2-qualified project manager with 8 years of experience delivering digital transformation programmes across financial services. Managed portfolios of up to £6M across 12 concurrent projects. Strong stakeholder management and vendor oversight skills. Seeking a senior PM or programme manager role.
        </blockquote>

        <h3>6. Nurse (NHS)</h3>
        <blockquote>
          Registered general nurse with 6 years of experience in acute medical and surgical wards across NHS trusts. Band 6 with additional training in IV cannulation and clinical supervision. Committed to patient-centred care and evidence-based practice. Seeking a senior staff nurse or ward sister role in a teaching hospital.
        </blockquote>

        <h3>7. Teacher</h3>
        <blockquote>
          Secondary school teacher with 9 years of experience teaching GCSE and A-level English Literature and Language. Consistent record of above-average examination results and positive Ofsted observation outcomes. Experienced pastoral lead and exam coordinator. Seeking a Head of Department role in a state or independent school.
        </blockquote>

        <h3>8. Accountant (Qualified)</h3>
        <blockquote>
          ACCA-qualified accountant with 6 years of experience in management accounting and financial reporting across manufacturing and logistics. Strong in month-end close, budget variance analysis and ERP systems (SAP, Oracle). Seeking a financial controller or senior management accountant role.
        </blockquote>

        <h3>9. Human Resources</h3>
        <blockquote>
          CIPD Level 7-qualified HR business partner with 8 years of experience in generalist HR across technology and professional services. Proven track record in organisational design, ER case management and talent strategy. Commercially focused and experienced advising at VP and C-suite level. Seeking a senior HRBP or HR Director role.
        </blockquote>

        <h3>10. Customer Service Manager</h3>
        <blockquote>
          Customer service manager with 7 years of experience leading contact centre teams of 15–40 agents across retail and subscription businesses. Consistently achieved NPS scores above sector benchmarks. Skilled in Zendesk, Salesforce Service Cloud and workforce planning. Seeking a head of customer experience role.
        </blockquote>

        <h3>11. Executive (CFO)</h3>
        <blockquote>
          Chartered CFO with 20 years of senior finance leadership across FTSE 250 and private equity-backed businesses in retail and consumer goods. Led three successful exits and two IPO-readiness programmes. Deep expertise in treasury, investor relations and capital allocation. Seeking a Group CFO or COO role in a scale-up or listed business.
        </blockquote>

        <h3>12. Graduate (No Experience)</h3>
        <blockquote>
          Economics graduate from the University of Nottingham (2:1) with a dissertation focused on consumer price sensitivity and market dynamics. Six months of marketing internship experience at a mid-size e-commerce business. Strong analytical and communication skills. Seeking a graduate analyst or marketing associate role in consumer goods or digital retail.
        </blockquote>

        <h3>13. Career Changer (Teacher to L&amp;D)</h3>
        <blockquote>
          Secondary school teacher with 8 years of experience in instructional design, curriculum delivery and learner assessment — now transitioning into corporate learning and development. Skilled in adapting content for diverse audiences and measuring learning outcomes. Seeking an L&amp;D advisor or instructional designer role in a mid-large organisation.
        </blockquote>

        <h3>14. Sales Manager</h3>
        <blockquote>
          B2B sales manager with 6 years of experience selling SaaS solutions to enterprise customers. Consistently exceeded quota — averaging 118% across the past three years. Built and managed a team of 7 AEs, increasing team ARR from £1.2M to £3.8M in 18 months. Seeking a Head of Sales or VP Sales role.
        </blockquote>

        <h3>15. Operations Manager</h3>
        <blockquote>
          Operations manager with 10 years of experience in logistics and supply chain across FMCG and 3PL environments. Led a cost reduction programme that saved £4.1M annually through warehouse process redesign. CIPS Level 4 qualified. Seeking a senior operations or supply chain director role.
        </blockquote>

        <h2>What to Avoid in a Professional Summary</h2>
        <ul>
          <li><strong>"Highly motivated self-starter"</strong> — meaningless, used by everyone</li>
          <li><strong>"Seeking a challenging role"</strong> — focuses on what you want, not what you offer</li>
          <li><strong>"I am looking for..."</strong> — objectives belong on CVs from the 1990s</li>
          <li><strong>Listing soft skills only</strong> — confidence, communication, teamwork — say nothing specific</li>
          <li><strong>Going over 5 lines</strong> — recruiters will not read a wall of text at the top of the page</li>
        </ul>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get AI to write your professional summary</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV generates a personalised summary based on your actual experience — not a template. Upload your CV and see the difference.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Generate My Summary Free &rarr;
        </Link>
      </div>

      <div className="mt-12">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Related guides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`}
              className="block rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-all">
              {g.title} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
