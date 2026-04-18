import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Employment Gaps on a CV — How to Explain Them and What to Write",
  description: "How to handle employment gaps on your CV — what to write, how to explain them in interviews, and the honest approach that actually works with recruiters.",
  alternates: { canonical: "https://fusecv.com/guides/employment-gaps-cv" },
  openGraph: { title: "Employment Gaps on a CV — How to Explain Them", description: "How to handle CV employment gaps honestly — what to write and how to address them in interviews.", url: "https://fusecv.com/guides/employment-gaps-cv" },
};
const relatedGuides = [
  { slug: "why-not-getting-interviews",  title: "Why You're Not Getting Interviews" },
  { slug: "career-change-cv-example",    title: "Career Change CV Example" },
  { slug: "improve-cv-fast",             title: "How to Improve Your CV Fast" },
];
export default function EmploymentGapsCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Employment Gaps on a CV</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Employment Gaps on a CV — How to Explain Them and What to Write</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">A gap in your employment history is not the problem. An unexplained gap is. Here is the honest, practical approach that actually works with recruiters and hiring managers.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your CV reviewed and improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites and formats your CV professionally — helping you present your full career story, gaps included, in the best possible light.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Are Employment Gaps Actually a Problem?</h2>
        <p>Less than most people think. Employment gaps have become significantly more normalised in the past decade — particularly after the pandemic, during which millions of people took career breaks, were made redundant, or chose to pause for personal reasons. Recruiters and hiring managers understand this.</p>
        <p>The issue is not the gap itself — it is an unexplained gap that creates uncertainty. When a recruiter sees a gap and cannot work out why it exists, they fill that uncertainty with assumptions. Your job is to fill it for them — briefly, honestly, and without over-explaining.</p>
        <h2>Common Types of Employment Gaps and How to Handle Each</h2>
        <h3>Redundancy</h3>
        <p>Include "Redundancy — role eliminated due to company restructure" as a one-line note alongside the previous role's dates. This is one of the most common and easily understood gaps — no elaboration needed.</p>
        <h3>Career Break for Family or Caring Responsibilities</h3>
        <p>Add a one-line entry to your work history: "Career break — primary carer for [family member] / parental leave / family responsibilities." This normalises the gap immediately. You do not need to specify who you were caring for or provide any further detail.</p>
        <h3>Health-Related Break</h3>
        <p>You are not obliged to disclose health information. A simple "Career break — personal reasons" is sufficient and legally protected. If you are comfortable sharing more, "Career break — recovery from illness, now fully fit to return to work" is a complete and sufficient explanation.</p>
        <h3>Redundancy and Job Search</h3>
        <p>A gap during an active job search needs little explanation — especially if it is 3–6 months or less. If you have been searching for more than 6 months, add what you have been doing during this time: courses, freelance projects, volunteering.</p>
        <h3>Travelling</h3>
        <p>"Extended travel — [year range]" is a complete entry. If you did anything professionally useful during the travel (language learning, volunteering, remote freelance work), mention it briefly.</p>
        <h3>Study and Further Qualifications</h3>
        <p>List the qualification you were studying for as if it were a role — institution, qualification, dates. This turns the gap into a positive development entry.</p>
        <h3>Freelancing or Contracting</h3>
        <p>If you were doing freelance or contract work during a gap, list it as a proper role: "Freelance [your profession] — [year range]. Brief description of clients or projects." This turns the gap into experience.</p>
        <h2>How to Address a Gap on Your CV</h2>
        <p>The most effective approach is a single, brief, honest entry in your chronological work history for the gap period. It does not need a separate section — just a line that accounts for the time.</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose text-sm space-y-2">
          <p className="font-semibold text-slate-700">Examples of how to list gaps in your work history:</p>
          <p className="text-slate-600">• <strong>Career break</strong> — parental leave and primary carer responsibilities | Jan 2022 – Sep 2023</p>
          <p className="text-slate-600">• <strong>Redundancy and career transition</strong> — role eliminated due to restructure; completing PRINCE2 Practitioner certification | Mar 2023 – Present</p>
          <p className="text-slate-600">• <strong>Sabbatical</strong> — extended travel and voluntary work in East Africa | Jul 2021 – Feb 2022</p>
          <p className="text-slate-600">• <strong>Career break</strong> — personal reasons, now ready to return full-time | 2022–2023</p>
        </div>
        <h2>How Long a Gap Is "Too Long"?</h2>
        <p>There is no objective threshold — context matters far more than length. A 3-year gap to raise children is more universally understood than a 6-month gap with no explanation. What matters is whether you can explain the gap briefly and honestly, and whether you can demonstrate that your skills remain current.</p>
        <h2>Addressing Skills Currency After a Long Gap</h2>
        <p>For gaps longer than 12–18 months, employers may wonder whether your skills are still current. Pre-empt this by including in your CV any professional development during the gap: online courses, certifications, industry reading, freelance work, or sector volunteer roles. A brief mention in your cover letter — "I have kept my skills current through X during my career break" — also helps significantly.</p>
        <h2>The Cover Letter — A Better Place to Address Long Gaps</h2>
        <p>For gaps of more than 12 months, your cover letter is a better place to address the context briefly and confidently — in one sentence in the opening paragraph. "Following a 2-year career break caring for a family member, I am returning to the workforce..." This gets it out in the open cleanly, before the recruiter reaches the CV.</p>
        <h2>What NOT to Do</h2>
        <ul>
          <li>Do not try to hide gaps by using year-only dates (2020–2022) instead of month/year — experienced recruiters will notice and it looks evasive</li>
          <li>Do not fabricate employment dates to cover a gap</li>
          <li>Do not over-explain in the CV — one clear line is all you need</li>
          <li>Do not apologise for the gap in your cover letter — state it factually and move on</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Present your full career story with confidence</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV helps you format and rewrite your CV to present your experience — gaps and all — in the strongest possible way.</p>
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
