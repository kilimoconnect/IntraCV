import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Executive CV Example UK — How to Position Yourself at Board Level",
  description:
    "Senior and board-level CVs operate by different rules. Learn how to write an executive CV that communicates authority, scale and strategic impact.",
  alternates: { canonical: "https://fusecv.com/guides/executive-cv-example" },
  openGraph: {
    title: "Executive CV Example UK",
    description: "How to position yourself for executive, director and C-suite roles with the right CV format and language.",
    url: "https://fusecv.com/guides/executive-cv-example",
  },
};

const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "best-cv-format-uk",          title: "Best CV Format in the UK" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews" },
];

export default function ExecutiveCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Executive CV Example</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Executive CV Example UK — How to Position Yourself at Board Level
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        An executive CV is not a longer version of a standard CV. It is a different document with a different purpose — communicating authority, scale and strategic leadership from the first paragraph.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your executive CV written to the right standard</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV uses AI to rewrite your CV with executive positioning — communicating scale, strategy and impact the way board-level roles require.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Upgrade My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>How Executive CVs Are Different</h2>
        <p>
          At the senior level, the hiring process is fundamentally different. Roles are often filled through executive search firms, headhunters, or referrals — not online job boards. Your CV is read by people who are evaluating whether you are the right calibre for a specific strategic need.
        </p>
        <p>
          They are not looking for a list of responsibilities. They are looking for evidence of leadership at scale, commercial impact, and the kind of judgment that comes with senior experience.
        </p>
        <p>
          This means the language, structure and emphasis of an executive CV must reflect that standard from the first sentence.
        </p>

        <h2>Length — How Long Should an Executive CV Be?</h2>
        <p>
          Two to three pages is appropriate at director and C-suite level. A one-page executive CV looks like you are hiding experience. A four-page CV suggests poor editorial judgment.
        </p>
        <p>
          The goal is to include everything that matters and exclude everything that does not — not to compress or pad to a target length.
        </p>

        <h2>The Executive CV Structure</h2>

        <h3>1. Contact details</h3>
        <p>Name, mobile, professional email, LinkedIn URL, location (city and country if you work internationally). No photo. No date of birth.</p>

        <h3>2. Executive summary (5–8 lines)</h3>
        <p>
          The most important section on an executive CV. This is not an objective. It is a positioning statement that should immediately establish:
        </p>
        <ul>
          <li>The type of leader you are</li>
          <li>The scale of what you have led</li>
          <li>Your areas of strategic specialisation</li>
          <li>The kind of transformation or value you deliver</li>
        </ul>

        <p><strong>Weak executive summary:</strong></p>
        <blockquote>
          Highly experienced senior executive with over 20 years of experience in the financial services industry. Proven track record of success in leadership and management. Seeking a challenging new opportunity.
        </blockquote>

        <p><strong>Strong executive summary:</strong></p>
        <blockquote>
          Chief Operating Officer with 18 years of P&amp;L leadership across FTSE 250 and private equity-backed businesses in financial services and insurtech. Track record of operational transformation — most recently leading a 3-year programme that reduced operating costs by £22M while scaling headcount from 400 to 1,200. Board-level experience in M&amp;A integration, regulatory change, and international expansion across UK, Ireland and the Nordics. Known for building high-performance leadership teams and translating strategic direction into measurable commercial outcomes.
        </blockquote>

        <p>Notice the difference. The strong version is specific, quantified, and positions the candidate as someone with a defined track record at a clear level of seniority.</p>

        <h3>3. Core competencies (optional)</h3>
        <p>
          A brief list of 6–10 strategic capabilities — not skills, but leadership competencies: P&amp;L Management, Board Governance, M&amp;A Integration, Organisational Transformation, International Expansion, Regulatory Compliance, Investor Relations. These help executive search firms quickly categorise your profile.
        </p>

        <h3>4. Career history (reverse chronological)</h3>
        <p>
          For each role, include: job title, organisation (with a one-line descriptor if it is not widely known), location, dates, and 4–6 bullet points.
        </p>
        <p>
          Executive CV bullets must communicate outcomes, not activities. Every bullet should answer: what changed because you were in this role?
        </p>

        <h3>5. Education</h3>
        <p>
          Degree, institution, year. If you have an MBA or professional qualification (ACCA, CIMA, CFA), list it prominently. Drop A-levels and secondary education unless there is a specific reason to include them.
        </p>

        <h3>6. Board positions and non-executive directorships</h3>
        <p>
          If you hold or have held board positions, NED roles, advisory roles or trusteeships, list them separately. This is a significant differentiator at the executive level.
        </p>

        <h2>How to Quantify Impact at Senior Level</h2>
        <p>
          Senior leaders often struggle to quantify because their impact is indirect — delivered through the teams and functions they lead. Here are the metrics that matter at executive level:
        </p>
        <ul>
          <li><strong>P&amp;L scale:</strong> "Accountable for a £180M P&amp;L across three business units"</li>
          <li><strong>Team size:</strong> "Led an organisation of 850 people across UK, Germany and the UAE"</li>
          <li><strong>Revenue growth:</strong> "Drove 34% revenue growth over three years through market expansion and portfolio repositioning"</li>
          <li><strong>Cost reduction:</strong> "Delivered £28M in annualised cost savings through operational redesign"</li>
          <li><strong>Programme outcomes:</strong> "Led digital transformation programme that migrated 1.2M customers to a new platform, on time and 8% under budget"</li>
          <li><strong>M&amp;A:</strong> "Oversaw acquisition of three competitors, integrating 600 staff and achieving synergy targets within 18 months"</li>
        </ul>

        <h2>What to Leave Out of an Executive CV</h2>
        <ul>
          <li>Early-career roles (more than 15–20 years ago) unless they are directly relevant to your narrative</li>
          <li>Responsibilities rather than achievements — "responsible for" language signals junior thinking</li>
          <li>Generic soft skills: "excellent communicator", "results-driven", "team player"</li>
          <li>References and "references available on request"</li>
          <li>Photo, date of birth, nationality</li>
          <li>Excessive technical detail about tools or software (unless it is a technical executive role)</li>
        </ul>

        <h2>LinkedIn Alignment</h2>
        <p>
          At the executive level, your LinkedIn profile is read alongside your CV. Executive search firms and headhunters will look at both. Make sure:
        </p>
        <ul>
          <li>Job titles and employment dates match exactly</li>
          <li>Your LinkedIn headline reflects your current positioning, not just your job title</li>
          <li>Your About section echoes your executive summary</li>
          <li>You have at least one professional photo (unlike the CV, LinkedIn expects one)</li>
        </ul>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Position yourself at the right level — automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV rewrites your executive CV with the language, structure and impact framing that board-level roles require.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Upgrade My Executive CV &rarr;
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
