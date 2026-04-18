import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Write a Cover Letter — Complete Guide With Examples (2026)",
  description: "How to write a cover letter that gets read — structure, what to write in each paragraph, a full example, and the most common mistakes to avoid worldwide.",
  alternates: { canonical: "https://fusecv.com/guides/how-to-write-a-cover-letter" },
  openGraph: { title: "How to Write a Cover Letter — Complete Guide With Examples", description: "Structure, paragraph-by-paragraph guidance, a full example, and the mistakes that get cover letters ignored.", url: "https://fusecv.com/guides/how-to-write-a-cover-letter" },
};
const relatedGuides = [
  { slug: "cover-letter-example-uk",    title: "Cover Letter Example UK" },
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews" },
];
export default function HowToWriteCoverLetterPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">How to Write a Cover Letter</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">How to Write a Cover Letter — Complete Guide With Examples (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Most cover letters say nothing useful. A strong one gets you shortlisted when your CV alone wouldn't. Here is exactly what to write — paragraph by paragraph — with a full example you can adapt immediately.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Generate your cover letter with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV writes a tailored cover letter matched to your CV and the job description — ready to send in minutes.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Generate My Cover Letter &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>When Does a Cover Letter Actually Matter?</h2>
        <ul>
          <li><strong>Always matters:</strong> SMEs, start-ups, direct applications, roles with a named hiring manager, applications where you are a non-obvious fit</li>
          <li><strong>Sometimes matters:</strong> Mid-size companies with hybrid ATS/human screening processes</li>
          <li><strong>Less critical (but still worth doing):</strong> High-volume online applications at large corporations using full ATS screening</li>
        </ul>
        <p>The general rule: when in doubt, write one. Most candidates don't. A well-written letter costs you 20 minutes and can be the deciding factor in a close shortlist decision.</p>
        <h2>Cover Letter Essentials</h2>
        <ul>
          <li><strong>Length:</strong> 3–4 paragraphs, 350–450 words maximum</li>
          <li><strong>Format:</strong> Business letter format — your contact info, date, company name/address, salutation, body, closing</li>
          <li><strong>Salutation:</strong> Use a name whenever possible ("Dear Ms Johnson"). If you can't find one, "Dear Hiring Manager" is fine. "To Whom It May Concern" is outdated.</li>
          <li><strong>Closing:</strong> "Yours sincerely" if you used a name; "Yours faithfully" (UK) or "Sincerely" (US) if you used a generic salutation</li>
          <li><strong>File format:</strong> PDF, matching your CV. File name: FirstnameLastname-CoverLetter.pdf</li>
        </ul>
        <h2>Paragraph by Paragraph — What to Write</h2>
        <h3>Paragraph 1 — Who you are and why you are writing</h3>
        <p>Name the specific role. State your current position and the most relevant credential for this application. Be direct. Do not start with "I am writing to apply for the position of..." — it wastes your opening sentence.</p>
        <p><strong>Example:</strong> "I am a data engineer with 6 years of experience building cloud data pipelines, applying for the Senior Data Engineer role at Meridian Analytics. My background in AWS-native architectures and dbt-based transformation layers maps directly to the technical environment you have described."</p>
        <h3>Paragraph 2 — Why you are qualified (with specifics)</h3>
        <p>This is the most important paragraph. Pick 2–3 specific achievements or qualifications from your background that are directly relevant to this role. Do not summarise your CV — add to it. Give evidence that cannot be found by simply reading your work history.</p>
        <p><strong>Example:</strong> "In my current role at DataStream, I led the migration of our entire analytics stack from on-premise SQL Server to a modern cloud architecture using Snowflake and dbt, reducing average query time from 40 minutes to under 90 seconds and cutting infrastructure costs by 34%. I also built the ingestion framework that now processes 800M events per day with 99.97% reliability. The challenges you describe — real-time ingestion at scale and a maturing data governance framework — are ones I have solved before."</p>
        <h3>Paragraph 3 — Why this company specifically</h3>
        <p>One paragraph explaining why you are applying to this company — not just this type of role. Reference something specific and genuine: their product, their engineering culture, a recent announcement, their tech stack, their growth trajectory. Generic flattery is skipped instantly.</p>
        <p><strong>Example:</strong> "I have followed Meridian's approach to building a data mesh architecture since your CTO's talk at Data Council in 2024. The way your team has approached domain ownership and federated governance is the direction I believe the industry is moving — and it is the type of environment I want to help build, not just read about."</p>
        <h3>Paragraph 4 — Closing</h3>
        <p>Brief. Confident. Clear call to action.</p>
        <p><strong>Example:</strong> "I would welcome the opportunity to discuss how my experience applies to what you are building. I am available for a conversation at your convenience."</p>
        <h2>Full Cover Letter Example</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 not-prose text-sm leading-relaxed text-slate-700 space-y-4">
          <p>Dear Ms Okonkwo,</p>
          <p>I am a data engineer with 6 years of experience building cloud data infrastructure, applying for the Senior Data Engineer position at Meridian Analytics. My experience with AWS-native architectures and dbt-based transformation layers maps directly to the stack you have described.</p>
          <p>In my current role at DataStream Ltd, I led a full analytics infrastructure migration from on-premise SQL Server to a Snowflake and dbt-based cloud stack, reducing average query time from 40 minutes to under 90 seconds and cutting infrastructure costs by 34%. I also architected the event ingestion framework that now processes 800M events per day at 99.97% uptime. The challenges you describe — real-time ingestion at scale and building a scalable data governance layer — are problems I have solved in production.</p>
          <p>I have followed Meridian's approach to federated data ownership since your CTO's talk at Data Council last year. The architecture decisions your team has made around domain-driven design and data contracts reflect exactly the direction I believe modern data engineering should take. I am drawn to the opportunity to contribute to a team that is building that standard from the ground up, rather than retrofitting it onto a legacy stack.</p>
          <p>I would welcome the opportunity to discuss the role in more detail. I am available for a conversation at your convenience.</p>
          <p>Yours sincerely,<br />Kofi Mensah</p>
        </div>
        <h2>10 Cover Letter Mistakes That Get You Ignored</h2>
        <ol>
          <li>Starting with "I am writing to apply for..." — weak opening, wastes first sentence</li>
          <li>Summarising your CV instead of adding to it</li>
          <li>Generic company praise ("I have always admired your innovative company")</li>
          <li>Explaining what the role will do for your career — focus on what you offer, not what you want</li>
          <li>Going over 450 words — no recruiter reads a long cover letter in full</li>
          <li>Sending the same letter to every job without changing paragraphs 1 and 3</li>
          <li>No specific achievements — just roles and responsibilities restated</li>
          <li>Apologising for lack of experience — focus on what you have, not what you don't</li>
          <li>Typos and formatting inconsistencies</li>
          <li>Not following the employer's specific instructions (word limit, specific questions asked)</li>
        </ol>
        <h2>Cover Letter Differences by Country</h2>
        <ul>
          <li><strong>UK:</strong> Cover letters are expected. 3–4 paragraphs, formal tone. Address selection criteria if listed.</li>
          <li><strong>USA:</strong> Less universally expected — many job portals don't request one. When required, follow the same paragraph structure above.</li>
          <li><strong>Australia:</strong> Cover letters are expected and taken seriously. Address the key selection criteria listed in the job posting directly.</li>
          <li><strong>Germany:</strong> Anschreiben (cover letter) is formally required and part of a structured application package with Lebenslauf and documents.</li>
          <li><strong>UAE/Gulf:</strong> A cover letter or application email is common — especially for professional/managerial roles and when applying to international companies.</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Generate a tailored cover letter in minutes</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV writes a cover letter matched to your CV and the specific job — ready to send without starting from scratch.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Generate My Cover Letter Free &rarr;</Link>
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
