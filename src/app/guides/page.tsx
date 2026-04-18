import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CV & Resume Guides — Free Expert Advice for Job Seekers Worldwide",
  description:
    "Free CV and resume guides for job seekers worldwide. Format, writing, ATS, country-specific advice, role examples and career tips — all in one place.",
  alternates: { canonical: "https://fusecv.com/guides" },
  openGraph: {
    title: "CV & Resume Guides — Free Expert Advice for Job Seekers Worldwide",
    description: "Free CV and resume guides for job seekers worldwide.",
    url: "https://fusecv.com/guides",
  },
};

type Guide = { slug: string; title: string; description: string; badge: string };

const coreGuides: Guide[] = [
  { slug: "how-to-write-a-cv", title: "How to Write a CV", description: "The complete step-by-step guide — every section explained, with examples and formatting rules.", badge: "Start Here" },
  { slug: "cv-vs-resume", title: "CV vs Resume — Key Differences", description: "Which countries use which, what goes in each, and when to send one over the other.", badge: "Global" },
  { slug: "ats-cv-checker", title: "ATS CV Checker — Pass Automated Screening", description: "Up to 75% of CVs are rejected by software. Here is exactly how to fix yours.", badge: "High Impact" },
  { slug: "improve-cv-fast", title: "How to Improve Your CV Fast", description: "Quick wins, 15-minute fixes and the highest-impact changes — in priority order.", badge: "Quick Wins" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews", description: "The 10 most common reasons CVs get no response — and the specific fix for each.", badge: "Must Read" },
  { slug: "how-long-should-a-cv-be", title: "How Long Should a CV Be?", description: "The definitive answer by experience level, country and industry — plus what to cut.", badge: "Common Question" },
  { slug: "employment-gaps-cv", title: "Employment Gaps on a CV", description: "How to handle career breaks honestly — what to write and how to address them in interviews.", badge: "Career Gaps" },
  { slug: "best-cv-format-uk", title: "Best CV Format in the UK", description: "The exact layout, length, sections and fonts that UK recruiters expect.", badge: "UK" },
];

const summaryGuides: Guide[] = [
  { slug: "resume-summary-examples", title: "Resume Summary Examples", description: "15 professional summary examples across industries and career levels — plus the writing formula.", badge: "Examples" },
  { slug: "cv-personal-statement-examples", title: "CV Personal Statement Examples", description: "10 personal statement templates for graduates, professionals, career changers and executives.", badge: "Examples" },
];

const careerLevelGuides: Guide[] = [
  { slug: "graduate-cv-no-experience", title: "Graduate CV With No Experience", description: "You have more to show than you think. How to write a graduate CV that actually gets responses.", badge: "Graduate" },
  { slug: "career-change-cv-example", title: "Career Change CV Example", description: "How to reframe your existing experience for a completely different role.", badge: "Career Change" },
  { slug: "executive-cv-example", title: "Executive CV Example", description: "Senior CVs operate by different rules. How to position yourself at director and board level.", badge: "Executive" },
];

const coverLetterGuides: Guide[] = [
  { slug: "cover-letter-example-uk", title: "Cover Letter Example UK", description: "UK cover letter format — exactly what to write in each paragraph, with a full example.", badge: "Cover Letter" },
];

const roleGuides: Guide[] = [
  { slug: "software-engineer-cv-example", title: "Software Engineer CV Example", description: "What hiring managers and technical recruiters actually look for in a tech CV.", badge: "Tech" },
  { slug: "nurse-cv-example", title: "Nurse CV Example", description: "Clinical bullet points, registration details, mandatory training and nursing CV structure worldwide.", badge: "Healthcare" },
  { slug: "project-manager-cv-example", title: "Project Manager CV Example", description: "Delivery-focused bullet points, certifications, and the PM metrics that matter to employers.", badge: "PM" },
  { slug: "data-analyst-cv-example", title: "Data Analyst CV Example", description: "How to show business impact — not just tools — on a data analyst CV or resume.", badge: "Data" },
];

const countryGuides: Guide[] = [
  { slug: "resume-format-usa", title: "Resume Format USA", description: "American resume conventions — length, sections, ATS and what international applicants get wrong.", badge: "🇺🇸 USA" },
  { slug: "cv-format-australia", title: "CV Format Australia", description: "Australian CV expectations including referees, key skills sections and sector-specific tips.", badge: "🇦🇺 Australia" },
  { slug: "cv-format-canada", title: "CV Format Canada", description: "Canadian resume format — close to the US standard but with important local differences.", badge: "🇨🇦 Canada" },
  { slug: "cv-format-south-africa", title: "CV Format South Africa", description: "SA CV conventions — longer format, referees, BBBEE context and professional registrations.", badge: "🇿🇦 South Africa" },
  { slug: "cv-format-uae", title: "CV Format UAE", description: "Dubai and Gulf CV expectations — photo, nationality, visa status and sector-specific guidance.", badge: "🇦🇪 UAE" },
];

const badgeColour: Record<string, string> = {
  "Start Here":       "bg-orange-100 text-orange-700",
  "High Impact":      "bg-red-100 text-red-700",
  "Must Read":        "bg-red-100 text-red-700",
  "Quick Wins":       "bg-amber-100 text-amber-700",
  "Global":           "bg-blue-100 text-blue-700",
  "UK":               "bg-indigo-100 text-indigo-700",
  "Common Question":  "bg-slate-100 text-slate-700",
  "Career Gaps":      "bg-yellow-100 text-yellow-700",
  "Examples":         "bg-teal-100 text-teal-700",
  "Graduate":         "bg-blue-100 text-blue-700",
  "Career Change":    "bg-violet-100 text-violet-700",
  "Executive":        "bg-slate-100 text-slate-700",
  "Cover Letter":     "bg-emerald-100 text-emerald-700",
  "Tech":             "bg-indigo-100 text-indigo-700",
  "Healthcare":       "bg-cyan-100 text-cyan-700",
  "PM":               "bg-purple-100 text-purple-700",
  "Data":             "bg-sky-100 text-sky-700",
};

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link href={`/guides/${guide.slug}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 transition-colors leading-snug">{guide.title}</h2>
        <span className={`shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ${badgeColour[guide.badge] ?? "bg-slate-100 text-slate-600"}`}>{guide.badge}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{guide.description}</p>
      <p className="mt-3 text-xs font-semibold text-orange-500 group-hover:text-orange-600">Read guide &rarr;</p>
    </Link>
  );
}

function Section({ title, guides }: { title: string; guides: Guide[] }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guides.map((g) => <GuideCard key={g.slug} guide={g} />)}
      </div>
    </section>
  );
}

export default function GuidesIndexPage() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">CV &amp; Resume Guides</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Practical, no-fluff advice on writing, formatting and improving your CV or resume — for job seekers worldwide. 23 guides across formats, roles and countries.</p>
      </div>

      <Section title="Start Here — Core Guides" guides={coreGuides} />
      <Section title="Professional Summaries &amp; Personal Statements" guides={summaryGuides} />
      <Section title="Career Level Guides" guides={careerLevelGuides} />
      <Section title="Cover Letters" guides={coverLetterGuides} />
      <Section title="Role-Specific CV Examples" guides={roleGuides} />
      <Section title="Country &amp; Regional Formats" guides={countryGuides} />

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to improve your CV?</h2>
        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">Upload your existing CV and get a professionally reformatted, AI-optimised version in under 60 seconds. Used by job seekers across 30+ countries.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-8 py-3 font-bold text-white text-sm">
          Improve My CV Free &rarr;
        </Link>
      </div>
    </div>
  );
}
