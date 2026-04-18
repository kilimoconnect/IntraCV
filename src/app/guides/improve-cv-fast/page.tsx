import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Improve Your CV Fast — Changes That Take Under 30 Minutes",
  description:
    "Quick wins, 15-minute fixes and the highest-impact CV improvements — in priority order. Start seeing better results from your applications today.",
  alternates: { canonical: "https://fusecv.com/guides/improve-cv-fast" },
  openGraph: {
    title: "How to Improve Your CV Fast",
    description: "Quick wins, 15-minute fixes and the highest-impact CV improvements — in priority order.",
    url: "https://fusecv.com/guides/improve-cv-fast",
  },
};

const relatedGuides = [
  { slug: "ats-cv-checker",             title: "ATS CV Checker" },
  { slug: "best-cv-format-uk",          title: "Best CV Format in the UK" },
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
];

export default function ImproveCvFastPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">How to Improve Your CV Fast</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        How to Improve Your CV Fast — Changes That Take Under 30 Minutes
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        Some CV improvements take hours. These ones take minutes — and they have the biggest impact on whether your application gets a response.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Let AI do it in 60 seconds</p>
          <p className="text-sm text-slate-500 mt-0.5">Upload your CV and FuseCV automatically applies all of these improvements — formatting, rewriting, ATS optimisation — in under a minute.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Improve My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>The 5-Minute Wins (Remove These Now)</h2>
        <p>These are errors that immediately undermine the quality of your CV. Fix them before anything else:</p>

        <h3>Remove "References available on request"</h3>
        <p>Everyone knows you have references. This phrase takes up space and signals that you haven't updated your CV template since 2004. Delete it.</p>

        <h3>Remove your photo (UK CVs)</h3>
        <p>If you are applying for jobs in the UK, never include a photo. It is considered unprofessional and puts employers in an awkward position regarding unconscious bias. Remove it.</p>

        <h3>Remove date of birth, nationality and marital status</h3>
        <p>These are irrelevant and can open the door to discrimination. Employers should not need this information at the application stage.</p>

        <h3>Remove the heading "Curriculum Vitae" or "CV"</h3>
        <p>Your CV does not need a label. The recruiter knows what they are reading. Use the space for your name and contact details.</p>

        <h3>Fix your email address</h3>
        <p>Is your email still a nickname from your teens? A professional email is your name or an approximation of it. Set up a new one if needed — it takes two minutes.</p>

        <h2>The 15-Minute Wins (Highest Impact)</h2>

        <h3>Rewrite your professional summary</h3>
        <p>
          If your summary is vague ("I am a highly motivated individual seeking a challenging role in a dynamic environment"), replace it. Write 3–4 lines that answer: who you are, how many years of relevant experience you have, what you specialise in, and what you are looking for.
        </p>
        <p><strong>Before:</strong> "Hardworking professional looking for a new opportunity to develop my skills."</p>
        <p><strong>After:</strong> "Financial analyst with 5 years of experience in investment banking, specialising in financial modelling and M&amp;A due diligence. Seeking a senior analyst role in corporate finance."</p>

        <h3>Add numbers to your bullet points</h3>
        <p>
          Go through your work experience and add one number to every bullet that does not have one. Numbers do not need to be exact — approximate figures work.
        </p>
        <ul>
          <li>"Managed a portfolio of clients" → "Managed a portfolio of 45 clients with combined revenue of £3.2M"</li>
          <li>"Improved the onboarding process" → "Reduced onboarding time from 3 weeks to 5 days by redesigning the welcome workflow"</li>
          <li>"Led a team" → "Led a cross-functional team of 8 across two departments"</li>
        </ul>

        <h3>Replace "Responsible for" with action verbs</h3>
        <p>
          Go through every bullet point that starts with "Responsible for" and replace it with a strong action verb. "Responsible for managing" becomes "Managed". "Responsible for delivering" becomes "Delivered". "Responsible for overseeing" becomes "Led" or "Oversaw".
        </p>

        <h3>Cut the last third of your CV</h3>
        <p>
          Most people include too much. Roles from 10+ years ago rarely need more than a one-line entry. University projects from 15 years ago can go. Cut anything that is not directly relevant to the roles you are targeting. A tighter CV reads better and is more likely to be read in full.
        </p>

        <h2>The 30-Minute Improvements (Per Application)</h2>

        <h3>Tailor your keywords to the job description</h3>
        <p>
          ATS systems rank CVs against job descriptions. Read the posting. Note every skill, tool, and qualification mentioned. Check your CV against that list. Add any relevant keywords you are missing — once each, in context.
        </p>

        <h3>Mirror the job title</h3>
        <p>
          If the job is titled "Senior Product Manager" and your current title is "Lead Product Owner", mention the target title in your summary. "Experienced Senior Product Manager with 6 years..." — even if your job title was technically different, this helps with ATS matching and makes your suitability clearer to the recruiter.
        </p>

        <h3>Check your formatting for ATS compliance</h3>
        <p>
          Quickly check your CV for: tables or text boxes (remove them), multi-column layout (flatten to single column), images or icons (delete), contact details in the header/footer (move to body). These are the most common reasons CVs fail ATS screening.
        </p>

        <h2>The Before/After Test</h2>
        <p>
          After making changes, ask someone to read your CV for 30 seconds and answer three questions:
        </p>
        <ol>
          <li>What do I do?</li>
          <li>How much experience do I have?</li>
          <li>What kind of role am I targeting?</li>
        </ol>
        <p>
          If they cannot answer all three from a 30-second scan, your summary and formatting still need work.
        </p>

        <h2>Red Flags That Immediately Damage Your CV</h2>
        <ul>
          <li>Typos and grammatical errors — use spell check AND read aloud</li>
          <li>Inconsistent date formats (January 2022 in one place, 01/22 in another)</li>
          <li>Different fonts or font sizes used inconsistently</li>
          <li>Unexplained employment gaps — add a one-line explanation</li>
          <li>Using "we" instead of "I" — describe your individual contribution</li>
          <li>A link to a LinkedIn profile that does not match the CV</li>
        </ul>

        <h2>What One Hour Can Do</h2>
        <p>
          Spending one focused hour on your CV — applying the changes above — will produce a meaningfully better document. Not a perfect CV, but one that will get a higher response rate than the version you have now.
        </p>
        <p>
          If you want the same result in 60 seconds — without doing it manually — FuseCV applies all of these improvements automatically.
        </p>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Skip the manual work — improve your CV in 60 seconds</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV applies every improvement on this list automatically. Upload your current CV and download a stronger version in under a minute.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Improve My CV Now &rarr;
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
