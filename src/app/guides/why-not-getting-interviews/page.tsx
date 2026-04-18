import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why You're Not Getting Interviews — 10 Real Reasons and How to Fix Them",
  description:
    "Sending applications and hearing nothing back? These are the 10 most common reasons your CV isn't getting responses — and the specific fixes that change your results.",
  alternates: { canonical: "https://fusecv.com/guides/why-not-getting-interviews" },
  openGraph: {
    title: "Why You're Not Getting Interviews — 10 Real Reasons",
    description: "The 10 most common reasons CVs don't get responses — and exactly how to fix each one.",
    url: "https://fusecv.com/guides/why-not-getting-interviews",
  },
};

const relatedGuides = [
  { slug: "ats-cv-checker",          title: "ATS CV Checker" },
  { slug: "improve-cv-fast",         title: "How to Improve Your CV Fast" },
  { slug: "best-cv-format-uk",       title: "Best CV Format in the UK" },
];

export default function WhyNotGettingInterviewsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Why Not Getting Interviews</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Why You're Not Getting Interviews — 10 Real Reasons
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        You have been applying. You have the experience. But responses are not coming. Here are the actual reasons — and a specific fix for each one.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Find out what's wrong with your CV</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV reviews your CV against common failure points and produces a corrected, ATS-optimised version in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Review My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>Reason 1: Your CV is Being Filtered by ATS Before Anyone Reads It</h2>
        <p>
          Most medium and large employers use Applicant Tracking Systems (ATS) to filter applications before a recruiter reviews them. If your CV uses tables, multi-column layouts, graphics, or non-standard headings, the parser may scramble or lose your content — and your application scores low automatically.
        </p>
        <p><strong>Fix:</strong> Use a single-column layout, standard section headings (Work Experience, Education, Skills), and no images or text boxes. Save as PDF. Use keywords from the job description verbatim.</p>

        <h2>Reason 2: Your CV is Generic — Not Tailored to the Role</h2>
        <p>
          Sending the same CV to every job is one of the fastest ways to get no responses. ATS systems score CVs against job descriptions, and recruiters can tell immediately when a CV has not been adapted for the role.
        </p>
        <p><strong>Fix:</strong> For each application, adjust your professional summary to reflect the specific role and company. Add the keywords and tools mentioned in the job description. Reorder or emphasise the experience most relevant to that position.</p>

        <h2>Reason 3: Your Professional Summary is Weak or Missing</h2>
        <p>
          The top third of your CV determines whether a recruiter reads the rest. A weak summary — or no summary at all — means the recruiter has to work to understand who you are and why you are relevant. Most won't.
        </p>
        <p><strong>Fix:</strong> Write a 3–4 line professional summary that leads with your most important credential: years of experience, speciality, and top value. "Senior software engineer with 8 years building fintech products, specialising in backend systems and team leadership."</p>

        <h2>Reason 4: You Are Missing Keywords from the Job Description</h2>
        <p>
          ATS systems rank CVs by keyword match. If the job requires "stakeholder management" and your CV says "managing client relationships", the system may not give you credit for having that skill.
        </p>
        <p><strong>Fix:</strong> Copy the job description into a document. Highlight every tool, skill, and qualification listed. Check your CV against that list and integrate missing phrases naturally — once each is enough for most systems.</p>

        <h2>Reason 5: Your Work Experience Reads Like a Job Description</h2>
        <p>
          Listing duties tells recruiters what your job required. It does not tell them what you actually accomplished. Recruiters reviewing hundreds of CVs skip past duty lists and look for evidence of impact.
        </p>
        <p><strong>Fix:</strong> Rewrite your bullet points using this formula: action verb + what you did + measurable outcome. "Reduced customer complaint resolution time by 40% by redesigning the escalation process." Numbers do not need to be exact — approximations work.</p>

        <h2>Reason 6: Unexplained Employment Gaps</h2>
        <p>
          Gaps in your employment history are not automatically disqualifying — but unexplained gaps create uncertainty that recruiters resolve by moving on to the next candidate.
        </p>
        <p><strong>Fix:</strong> Address gaps briefly and honestly: "2022 — career break for family reasons" or "2021–2022 — freelance consulting while completing a qualification". You do not need to elaborate — just acknowledge it so it does not look like an oversight.</p>

        <h2>Reason 7: Your CV is Too Long or Too Short</h2>
        <p>
          A one-page CV from someone with 15 years of experience looks like it is hiding something. A three-page CV from a graduate looks like padding. Both signal poor judgment about what is relevant.
        </p>
        <p><strong>Fix:</strong> Graduates: 1 page. 3–10 years experience: 2 pages. Senior professionals with 10+ years: 2–3 pages. Cut anything older than 15 years or unrelated to your target role.</p>

        <h2>Reason 8: You Are Targeting the Wrong Level</h2>
        <p>
          Applying for roles significantly above or below your current level reduces your response rate. A recruiter with a brief for a senior manager is not going to progress a candidate with two years of junior experience, regardless of CV quality.
        </p>
        <p><strong>Fix:</strong> Research the typical requirements for the roles you are applying for. If you are consistently a step below the requirements, consider targeting one level down and building towards the next step. If you are overqualified, address this in your cover letter.</p>

        <h2>Reason 9: You Are Not Including a Cover Letter</h2>
        <p>
          Many candidates skip the cover letter because it takes time. In competitive markets, a brief, well-written cover letter — particularly for SMEs and non-automated applications — can significantly influence whether your CV gets read.
        </p>
        <p><strong>Fix:</strong> Write a 3-paragraph cover letter: who you are and the role you want, why you are qualified, and why this specific company. Keep it under 400 words. For applications through portals, paste it into the message box even if no letter is required.</p>

        <h2>Reason 10: Your Contact Details or Formatting Are Wrong</h2>
        <p>
          You would be surprised how often applications fail because of a typo in an email address, a phone number formatted incorrectly, or a CV that does not render properly on the recruiter's screen.
        </p>
        <p><strong>Fix:</strong> Double-check your email and phone number. Open your CV on another device and in a different PDF viewer. Send a copy to a friend and ask them to open it. Make sure the formatting holds.</p>

        <h2>The Honest Summary</h2>
        <p>
          Low response rates are almost always a CV or targeting problem — not a you problem. The candidates who get consistent responses are not necessarily more qualified. They have CVs that communicate their value clearly, pass ATS filters, and are tailored to the roles they apply for.
        </p>
        <p>
          Fixing your CV is the highest-leverage action you can take before any other job search activity.
        </p>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Fix your CV and start getting responses</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV rewrites your CV to fix the most common reasons applications go unanswered. Upload once, download an improved version in 60 seconds.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Improve My CV Free &rarr;
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
