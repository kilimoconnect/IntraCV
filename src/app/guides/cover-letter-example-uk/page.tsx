import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cover Letter Example UK — Format, Structure and What to Write",
  description:
    "The UK cover letter format — exactly what to write in each paragraph, a full example you can adapt, and the most common mistakes to avoid.",
  alternates: { canonical: "https://fusecv.com/guides/cover-letter-example-uk" },
  openGraph: {
    title: "Cover Letter Example UK — Format, Structure and What to Write",
    description: "Exactly what to write in each paragraph of a UK cover letter, with a full example.",
    url: "https://fusecv.com/guides/cover-letter-example-uk",
  },
};

const relatedGuides = [
  { slug: "best-cv-format-uk",          title: "Best CV Format in the UK" },
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews" },
];

export default function CoverLetterExampleUkPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Cover Letter Example UK</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Cover Letter Example UK — Format, Structure and What to Write
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        Most cover letters are ignored because they repeat the CV or say nothing useful. Here is exactly what to write — section by section — with a full UK example you can adapt.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Generate a tailored cover letter with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV writes a cover letter matched to your CV and the specific job description — ready to send in minutes.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Generate My Cover Letter &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>Does a Cover Letter Actually Matter?</h2>
        <p>
          For large corporate employers with high-volume applications and ATS screening: usually less so. For SMEs, agencies, and direct applications: yes, significantly. A well-written cover letter is the difference between getting an interview and being passed over, particularly when you are a borderline candidate on paper.
        </p>
        <p>
          Even when a cover letter is not required, sending one (pasted into the message box or added as a supporting document) can set you apart. Most candidates don't bother.
        </p>

        <h2>UK Cover Letter Format</h2>
        <ul>
          <li><strong>Length:</strong> 3–4 paragraphs, 350–450 words maximum</li>
          <li><strong>Format:</strong> Standard business letter, left-aligned</li>
          <li><strong>Salutation:</strong> Use a name if you can find one — "Dear Ms Ahmed" beats "Dear Hiring Manager". If you cannot find the name, "Dear Hiring Manager" is fine; "To Whom It May Concern" is outdated.</li>
          <li><strong>Closing:</strong> "Yours sincerely" if you used a name, "Yours faithfully" if you used "Dear Hiring Manager"</li>
          <li><strong>File format:</strong> Match your CV — PDF unless otherwise specified</li>
        </ul>

        <h2>What to Write in Each Paragraph</h2>

        <h3>Paragraph 1 — Who You Are and the Role You Want</h3>
        <p>
          Name the specific role. State your current position and most relevant qualification for this application. This paragraph should be 2–3 sentences maximum. Do not start with "I am writing to apply for..."
        </p>
        <p><strong>Example:</strong></p>
        <blockquote>
          I am a senior marketing manager with eight years of experience in B2B SaaS, applying for the Head of Marketing position at [Company Name]. My background in demand generation and product marketing at growth-stage companies maps directly to the brief outlined in your job description.
        </blockquote>

        <h3>Paragraph 2 — Why You Are Qualified (with specifics)</h3>
        <p>
          This is the most important paragraph. Pick two or three specific achievements or competencies from your background that are directly relevant to this role. Do not summarise your CV — add to it.
        </p>
        <p><strong>Example:</strong></p>
        <blockquote>
          In my current role at [Employer], I led a demand generation programme that grew qualified pipeline from £2M to £8.4M in 18 months, primarily through content and organic search. I also rebuilt the marketing team from four to eleven people, establishing the function that now drives 60% of the company's new business. Your focus on building a data-driven marketing function from the ground up is something I have done before and can do again.
        </blockquote>

        <h3>Paragraph 3 — Why This Company</h3>
        <p>
          One brief paragraph on why you are applying to this company specifically — not just this type of role. Reference something specific: their product, their market approach, a recent development, their culture, their growth trajectory. Generic statements ("I am excited by your fast-paced environment") are skipped.
        </p>
        <p><strong>Example:</strong></p>
        <blockquote>
          I have followed [Company]'s expansion into the European enterprise market closely and I am drawn to the challenge you are describing: building the marketing infrastructure to support a business that is scaling internationally while maintaining the product focus that made you successful in the UK.
        </blockquote>

        <h3>Paragraph 4 — Closing and Call to Action</h3>
        <p>
          Brief, confident close. Invite next steps without being passive.
        </p>
        <p><strong>Example:</strong></p>
        <blockquote>
          I would welcome the opportunity to discuss how my experience applies to what you are building. I am available for interview at your convenience.
        </blockquote>

        <h2>Full Cover Letter Example (UK — Marketing Manager)</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose text-sm leading-relaxed text-slate-700 space-y-4">
          <p>Dear Ms Ahmed,</p>
          <p>
            I am a senior marketing manager with eight years of experience in B2B SaaS, applying for the Head of Marketing position at Apex Software. My background in demand generation and product marketing at growth-stage companies maps directly to the brief you have outlined.
          </p>
          <p>
            In my current role at DataFlow Ltd, I led a demand generation programme that grew qualified pipeline from £2M to £8.4M in 18 months through content, paid and organic search. I also rebuilt the marketing team from four to eleven people, creating the function that now accounts for 60% of new business revenue. The programme I designed became the template for our expansion into Germany and the Netherlands. Your focus on building a scalable, data-driven marketing function is something I have done before and am ready to do again.
          </p>
          <p>
            I have followed Apex Software's growth in the enterprise procurement market closely and I am attracted to the specific challenge you are describing: establishing marketing as a growth engine for a business that is entering a critical scale-up phase. The combination of product depth and the commercial ambition I see in your recent hires is exactly the kind of environment I work best in.
          </p>
          <p>
            I would welcome the opportunity to discuss how my experience applies to what you are building. I am available for a conversation at your convenience.
          </p>
          <p>Yours sincerely,<br />James Okafor</p>
        </div>

        <h2>Common Cover Letter Mistakes</h2>
        <ul>
          <li><strong>Summarising your CV</strong> — the recruiter has your CV. Tell them something they cannot get from it.</li>
          <li><strong>Starting with "I am writing to apply for..."</strong> — begins weakly and wastes the first sentence.</li>
          <li><strong>Explaining what the job means to your career</strong> — recruiters are interested in what you bring to them, not what the role does for you.</li>
          <li><strong>Going over 450 words</strong> — longer cover letters are rarely read in full.</li>
          <li><strong>Generic company flattery</strong> — "I have always admired your company" without saying why is instantly ignored.</li>
          <li><strong>Sending the same letter to every job</strong> — recruiters can tell. It takes 5 minutes to personalise paragraphs 1 and 3.</li>
        </ul>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Generate a tailored cover letter in minutes</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV writes a cover letter matched to your CV and the specific job description — ready to send without starting from scratch.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Generate My Cover Letter &rarr;
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
