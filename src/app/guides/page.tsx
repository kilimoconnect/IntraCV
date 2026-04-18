import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CV Guides — Expert Advice for UK Job Seekers",
  description:
    "Free CV guides written for UK job seekers. Learn how to format your CV, pass ATS filters, write a cover letter, and get more interviews.",
  alternates: { canonical: "https://fusecv.com/guides" },
  openGraph: {
    title: "CV Guides — Expert Advice for UK Job Seekers",
    description: "Free CV guides written for UK job seekers.",
    url: "https://fusecv.com/guides",
  },
};

const guides = [
  {
    slug: "best-cv-format-uk",
    title: "Best CV Format in the UK",
    description: "The exact layout, length, sections and fonts that UK recruiters expect to see — and the common mistakes that get CVs ignored.",
    badge: "Most Popular",
  },
  {
    slug: "ats-cv-checker",
    title: "ATS CV Checker — How to Pass Automated Screening",
    description: "Most CVs are rejected before a human reads them. Find out how ATS software works and how to make sure yours gets through.",
    badge: "High Impact",
  },
  {
    slug: "graduate-cv-no-experience",
    title: "Graduate CV With No Experience",
    description: "You have more to show than you think. How to structure a graduate CV that gets responses even without years of work history.",
    badge: "Graduates",
  },
  {
    slug: "why-not-getting-interviews",
    title: "Why You're Not Getting Interviews",
    description: "The 10 most common reasons applications go unanswered — and the specific fixes that change your response rate.",
    badge: "Must Read",
  },
  {
    slug: "software-engineer-cv-example",
    title: "Software Engineer CV Example UK",
    description: "What hiring managers and technical recruiters actually look for in a software engineering CV, with section-by-section guidance.",
    badge: "Tech",
  },
  {
    slug: "career-change-cv-example",
    title: "Career Change CV Example",
    description: "How to reframe your existing experience for a completely different role — without hiding your background or underselling yourself.",
    badge: "Career Change",
  },
  {
    slug: "executive-cv-example",
    title: "Executive CV Example UK",
    description: "Senior and board-level CVs operate by different rules. How to position yourself for executive, director and C-suite roles.",
    badge: "Executive",
  },
  {
    slug: "cover-letter-example-uk",
    title: "Cover Letter Example UK",
    description: "The UK cover letter format — exactly what to write in each paragraph, with a full example you can adapt for any role.",
    badge: "Cover Letter",
  },
  {
    slug: "improve-cv-fast",
    title: "How to Improve Your CV Fast",
    description: "Quick wins, 15-minute fixes and the changes that have the biggest impact on your response rate — in order of priority.",
    badge: "Quick Wins",
  },
  {
    slug: "resume-summary-examples",
    title: "Resume Summary Examples",
    description: "15 professional summary examples across industries and career levels — plus the formula for writing one that actually works.",
    badge: "Examples",
  },
];

const badgeColour: Record<string, string> = {
  "Most Popular": "bg-orange-100 text-orange-700",
  "High Impact":  "bg-red-100 text-red-700",
  "Must Read":    "bg-red-100 text-red-700",
  "Graduates":    "bg-blue-100 text-blue-700",
  "Tech":         "bg-indigo-100 text-indigo-700",
  "Career Change":"bg-violet-100 text-violet-700",
  "Executive":    "bg-slate-100 text-slate-700",
  "Cover Letter": "bg-emerald-100 text-emerald-700",
  "Quick Wins":   "bg-amber-100 text-amber-700",
  "Examples":     "bg-teal-100 text-teal-700",
};

export default function GuidesIndexPage() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          CV Guides for UK Job Seekers
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Practical, no-fluff advice on writing, formatting and improving your CV — plus cover letters, ATS, and getting more interviews.
        </p>
      </div>

      {/* Guides grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-base font-semibold text-slate-800 group-hover:text-orange-600 transition-colors leading-snug">
                {guide.title}
              </h2>
              <span className={`shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ${badgeColour[guide.badge] ?? "bg-slate-100 text-slate-600"}`}>
                {guide.badge}
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{guide.description}</p>
            <p className="mt-4 text-sm font-semibold text-orange-500 group-hover:text-orange-600">
              Read guide &rarr;
            </p>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to improve your CV?</h2>
        <p className="text-indigo-100 mb-6">
          Upload your existing CV and get a professionally reformatted, AI-optimised version in under 60 seconds.
        </p>
        <Link
          href="/register"
          className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-8 py-3 font-bold text-white text-sm"
        >
          Improve My CV Free &rarr;
        </Link>
      </div>
    </div>
  );
}
