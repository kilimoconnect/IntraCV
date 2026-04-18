import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change CV Example — How to Reframe Your Experience for a New Industry",
  description:
    "Changing career? Learn how to reframe your existing experience, identify transferable skills, and write a career change CV that actually gets responses.",
  alternates: { canonical: "https://fusecv.com/guides/career-change-cv-example" },
  openGraph: {
    title: "Career Change CV Example",
    description: "How to reframe your existing experience for a completely different role — without hiding your background.",
    url: "https://fusecv.com/guides/career-change-cv-example",
  },
};

const relatedGuides = [
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "cover-letter-example-uk",    title: "Cover Letter Example UK" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews" },
];

export default function CareerChangeCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Career Change CV Example</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Career Change CV Example — How to Reframe Your Experience
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        Changing careers does not mean starting from zero. It means communicating your existing experience in a new language. Here is how to do that.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your career change CV rewritten with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV reframes your existing experience for your target industry — highlighting transferable skills and positioning you for the new role.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Reframe My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>The Core Challenge of a Career Change CV</h2>
        <p>
          A career change CV has one job: to show a hiring manager in a new industry that your existing experience is directly relevant — even if the job titles and industries do not match.
        </p>
        <p>
          Most career changers fail at this because they either present their old CV unchanged (and get ignored), or they try to hide their previous career (and lose credibility). The right approach is neither: it is to <strong>reframe</strong>.
        </p>

        <h2>Step 1 — Identify Your Transferable Skills</h2>
        <p>
          Transferable skills are competencies you developed in one context that are genuinely valuable in another. They include:
        </p>
        <ul>
          <li><strong>Leadership and management:</strong> Managing teams, projects, or client relationships</li>
          <li><strong>Communication:</strong> Writing, presenting, negotiating, training</li>
          <li><strong>Analysis and problem-solving:</strong> Data interpretation, process improvement, decision-making</li>
          <li><strong>Commercial awareness:</strong> Budget management, revenue targets, cost reduction</li>
          <li><strong>Technical skills that transfer:</strong> Software, project management tools, CRM systems</li>
          <li><strong>Industry knowledge:</strong> Even partial industry knowledge (healthcare, finance, technology) is valuable in adjacent roles</li>
        </ul>
        <p>
          Write down every meaningful thing you have done in your career. Then ask yourself: what skill does this demonstrate? What result did it produce? Which of these is relevant to my target role?
        </p>

        <h2>Step 2 — Research the Target Role Thoroughly</h2>
        <p>
          Before rewriting your CV, read 10–15 job descriptions for the type of role you are targeting. Note:
        </p>
        <ul>
          <li>The skills and competencies mentioned most frequently</li>
          <li>The tools, systems, or qualifications they require</li>
          <li>The language they use to describe responsibilities</li>
        </ul>
        <p>
          This gives you a vocabulary to adopt. When you rewrite your CV, mirror this language. If the job descriptions say "stakeholder management" and you have been doing that for years under a different name, use their term.
        </p>

        <h2>Step 3 — Choose the Right CV Format</h2>
        <p>
          Most candidates should use a <strong>reverse-chronological CV</strong> — most recent role first. Career changers often consider a functional CV (skills-first, chronology buried), but this approach has significant problems: it signals to recruiters that you are hiding something, and many ATS systems do not handle it well.
        </p>
        <p>
          The better approach is a <strong>hybrid format</strong>:
        </p>
        <ul>
          <li>A strong professional summary at the top that explicitly addresses the career change</li>
          <li>A skills section that leads with your most relevant transferable competencies</li>
          <li>Work experience in reverse chronological order, with bullets reframed to highlight transferable value</li>
        </ul>

        <h2>Step 4 — Write a Career Change Professional Summary</h2>
        <p>
          Your summary needs to do something most summaries do not: it needs to address the context of the change directly without making it sound like an apology.
        </p>

        <p><strong>Example — Moving from teaching to L&amp;D/corporate training:</strong></p>
        <blockquote>
          Secondary school teacher with 7 years of experience designing and delivering curriculum for groups of 25–30 students across mixed ability levels. Skilled in instructional design, performance assessment and tailoring delivery to diverse learning needs. Transitioning into corporate learning and development, bringing structured training methodology and measurable outcome focus from an education background.
        </blockquote>
        <p>
          Notice: it does not hide the teaching background. It positions it as the relevant experience it is. It names the target direction explicitly. It uses corporate L&amp;D language.
        </p>

        <h2>Step 5 — Reframe Your Work Experience Bullets</h2>
        <p>
          This is where most of the work happens. For each role, identify what you actually did and then ask: how would someone in my target industry describe this?
        </p>

        <p><strong>Before (teacher applying for L&amp;D role):</strong></p>
        <ul>
          <li>Taught GCSE English to Year 10 and Year 11 students</li>
          <li>Organised parent evenings and staff meetings</li>
          <li>Created lesson plans for term curriculum</li>
        </ul>

        <p><strong>After (reframed for L&amp;D):</strong></p>
        <ul>
          <li>Designed and delivered structured learning programmes for cohorts of 28–32 learners, adapting content delivery to different learning styles and achievement levels</li>
          <li>Facilitated multi-stakeholder communication across 120+ parent relationships and 15-person staff teams, coordinating feedback and communicating performance outcomes clearly</li>
          <li>Developed modular instructional content mapped to defined learning objectives, with embedded assessment checkpoints to measure comprehension and progression</li>
        </ul>

        <h2>Step 6 — Address the Gap in Your Cover Letter</h2>
        <p>
          Your CV should reframe your experience. Your cover letter should explain the transition directly — briefly, confidently, and in one paragraph.
        </p>
        <blockquote>
          After seven years in secondary education, I am making a deliberate move into corporate learning and development. My background gives me something most L&amp;D professionals develop over time: deep expertise in instructional design, facilitation and measurable learning outcomes. I am attracted to this role specifically because of your focus on skills-based learning and your team's commitment to measurable training impact.
        </blockquote>

        <h2>Common Career Change CV Mistakes</h2>
        <ul>
          <li>Using your old CV unchanged and hoping for the best</li>
          <li>Hiding your previous career entirely — it raises red flags</li>
          <li>Apologising for the change in your summary</li>
          <li>Applying without any bridge qualifications or self-development (a relevant online course makes a significant difference)</li>
          <li>Sending the same CV to every role without adapting it to the specific position</li>
        </ul>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Let AI reframe your experience for the new role</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV analyses your existing CV and rewrites it for your target industry — using the right language and highlighting the right skills.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Reframe My CV Free &rarr;
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
