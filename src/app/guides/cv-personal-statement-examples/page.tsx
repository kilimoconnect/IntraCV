import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CV Personal Statement Examples — 10 Templates for Every Career Level",
  description: "10 CV personal statement examples for graduates, career changers, professionals and executives. Plus the formula to write your own in under 10 minutes.",
  alternates: { canonical: "https://fusecv.com/guides/cv-personal-statement-examples" },
  openGraph: { title: "CV Personal Statement Examples — 10 Templates", description: "10 CV personal statement examples for every career level — with the formula to write your own.", url: "https://fusecv.com/guides/cv-personal-statement-examples" },
};
const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "graduate-cv-no-experience",  title: "Graduate CV With No Experience" },
  { slug: "improve-cv-fast",            title: "How to Improve Your CV Fast" },
];
export default function CvPersonalStatementPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Personal Statement Examples</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Personal Statement Examples — 10 Templates for Every Career Level</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Your personal statement is the first thing a recruiter reads. It determines whether they read the rest. Here are 10 real examples across career levels — plus the exact formula to write your own.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get AI to write your personal statement</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV writes a personalised professional summary based on your actual experience and target role — not a generic template.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Write My Statement Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Personal Statement vs Professional Summary — Is There a Difference?</h2>
        <p>In the UK, the terms "personal statement", "professional summary", "profile" and "career summary" all refer to the same thing: the 3–5 line paragraph at the top of your CV that positions you as a candidate. The term "personal statement" is more common in UK usage; "professional summary" is more common in US and international contexts. They function identically.</p>
        <h2>The Formula</h2>
        <p><strong>[Years of experience] + [role/speciality] + [key achievement or credential] + [what you are looking for or what you bring]</strong></p>
        <p>You do not need all four in every statement — but the stronger ones usually hit at least three.</p>
        <h2>10 CV Personal Statement Examples</h2>
        <h3>1. Graduate — No Work Experience</h3>
        <blockquote>Marketing graduate from the University of Manchester (2:1) with experience running social media campaigns for three student-led organisations, growing combined following by 14,000 over two years. Strong analytical skills developed through a dissertation on influencer marketing ROI. Seeking a digital marketing graduate role with a brand that values data-driven creativity.</blockquote>
        <h3>2. Early Career — 2–3 Years</h3>
        <blockquote>Junior accountant with 2 years of experience in practice, supporting audit and accounts preparation for SME clients across retail and hospitality. Part-qualified ACCA (3 papers remaining). Detail-oriented with strong Excel skills and familiarity with Xero and QuickBooks. Seeking a role in industry to develop commercial accounting experience alongside completing the ACCA qualification.</blockquote>
        <h3>3. Mid-Career — Operations</h3>
        <blockquote>Operations manager with 8 years of experience in e-commerce and logistics, managing warehousing, fulfilment and last-mile delivery across two distribution centres. Delivered £1.2M in annual savings through process redesign and carrier renegotiation. CIPS Level 4 qualified. Seeking a head of operations or supply chain director role.</blockquote>
        <h3>4. Career Changer — Journalist to Content Marketing</h3>
        <blockquote>Journalist with 6 years of experience in digital media transitioning into content marketing. Track record of high-performing editorial content — two features shortlisted for Press Gazette awards; consistent top-10% engagement rates across a 120,000-subscriber newsletter. Bringing editorial discipline and audience understanding to a content or inbound marketing role at a B2B technology company.</blockquote>
        <h3>5. Senior Manager</h3>
        <blockquote>Senior HR business partner with 10 years of experience supporting business units of 200–800 people across technology and professional services. Experienced in ER case management, talent strategy, organisational design, and advising at VP level. CIPD Level 7 qualified. Seeking an HR Director or CPO role at a growth-stage business navigating rapid headcount expansion.</blockquote>
        <h3>6. Executive / C-Suite</h3>
        <blockquote>CFO with 18 years of senior finance leadership in private equity-backed and FTSE 250 businesses across retail and consumer goods. Led three successful trade sales and one IPO-readiness programme. Deep expertise in treasury, capital allocation, investor relations and M&amp;A integration. Seeking a Group CFO or COO role at a business preparing for exit or significant international expansion.</blockquote>
        <h3>7. Technical Role — Developer</h3>
        <blockquote>Full-stack engineer with 5 years of experience building consumer-facing web applications in React and Node.js. Led frontend architecture for a subscription platform serving 600,000 active users. Strong focus on performance, accessibility and test coverage. Seeking a senior engineer or lead role at a product-focused company.</blockquote>
        <h3>8. Healthcare — Allied Health</h3>
        <blockquote>Physiotherapist with 7 years of experience in MSK and neurological rehabilitation across NHS and private practice settings. HCPC registered. Experienced in caseload management, MDT working and student supervision. Seeking a senior physiotherapist or clinical specialist role in a hospital or complex rehabilitation setting.</blockquote>
        <h3>9. Sales</h3>
        <blockquote>B2B sales manager with 7 years of experience selling SaaS solutions to enterprise customers in the logistics and supply chain sector. Averaged 122% of quota over the past four years. Built and managed a team of 6 AEs, growing team ARR from £900K to £3.1M in 18 months. Seeking a Head of Sales or VP Sales role at a Series B+ SaaS company.</blockquote>
        <h3>10. Return to Work / Career Break</h3>
        <blockquote>Marketing manager returning to work after a 2-year career break for family reasons. Previously led brand and digital strategy for a £120M retail business, managing a team of 8 across paid, organic and social channels. Staying current through Google Digital Garage, HubSpot Academy certifications, and freelance consulting. Seeking a senior marketing manager role in a consumer or retail brand.</blockquote>
        <h2>What to Avoid</h2>
        <ul>
          <li>"Highly motivated self-starter" — meaningless filler used by almost every applicant</li>
          <li>"Looking for a challenging role in a dynamic environment" — focuses on what you want, not what you offer</li>
          <li>More than 5 lines — recruiters won't read a wall of text at the top of the page</li>
          <li>Repeating your job title as if it is a credential — "I am a marketing manager" tells the reader nothing new</li>
          <li>Listing soft skills without evidence — back them up with context or don't list them</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your personal statement written with AI</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV generates a personalised professional summary based on your actual experience — tailored to your career level and target role.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Generate My Summary Free &rarr;</Link>
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
