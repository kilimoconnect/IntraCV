import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Graduate CV With No Experience — What to Include & How to Write It",
  description:
    "No work experience? You have more to show than you think. How to write a graduate CV that gets responses, with a full structure and examples.",
  alternates: { canonical: "https://fusecv.com/guides/graduate-cv-no-experience" },
  openGraph: {
    title: "Graduate CV With No Experience — What to Include & How to Write It",
    description: "How to write a graduate CV that gets responses — even with no work experience.",
    url: "https://fusecv.com/guides/graduate-cv-no-experience",
  },
};

const relatedGuides = [
  { slug: "best-cv-format-uk",          title: "Best CV Format in the UK" },
  { slug: "why-not-getting-interviews", title: "Why You're Not Getting Interviews" },
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
];

export default function GraduateCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Graduate CV No Experience</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Graduate CV With No Experience — What to Include and How to Write It
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        No formal work experience does not mean nothing to show. Most graduates undersell themselves by only listing what they think counts — here is what actually does.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Build your graduate CV with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">Upload your draft CV and get a professionally formatted, ATS-optimised graduate version in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Improve My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>You Have More to Show Than You Think</h2>
        <p>
          Most graduates approach their first CV with the assumption that they have nothing relevant to include. This is almost never true.
        </p>
        <p>
          Recruiters reviewing graduate applications know the candidates are recent graduates. They are not comparing you against professionals with 10 years of experience. They are asking: <em>Does this person show initiative? Can they communicate clearly? Will they learn quickly?</em>
        </p>
        <p>
          Your job is to present what you have in a way that answers those questions.
        </p>

        <h2>What Counts as Experience on a Graduate CV</h2>

        <h3>Internships and work placements</h3>
        <p>Even one or two weeks of work experience in a relevant field belongs on your CV. Treat it like any other job: job title, organisation, dates, and bullet points describing what you did and what you contributed.</p>

        <h3>Part-time and casual work</h3>
        <p>Retail, hospitality, tutoring, delivery, freelancing — all of this demonstrates real-world skills: customer handling, time management, reliability, working under pressure. Do not leave it off because it seems unrelated to the role.</p>

        <h3>University projects and dissertations</h3>
        <p>
          A final-year dissertation is a significant piece of independent research. List it. Include the title, a one-line description of what it involved, and any notable outcomes (grade, publication, real-world application).
        </p>
        <p>
          Group projects demonstrate collaboration. Independent projects demonstrate initiative. Both are worth including — especially for roles in engineering, data, technology, business and research.
        </p>

        <h3>Extracurricular activities and societies</h3>
        <p>
          Captain of the football team? Events coordinator for a student society? Volunteer at a charity? These demonstrate leadership, organisation and initiative — qualities that are genuinely difficult to assess from academic results alone.
        </p>

        <h3>Volunteering</h3>
        <p>Any structured volunteering role should be listed. Include the organisation, your role, how long you were involved, and what you contributed.</p>

        <h3>Online courses and certifications</h3>
        <p>Google Analytics, HubSpot, AWS Cloud Practitioner, Coursera, Codecademy, LinkedIn Learning — if you completed a course and received a certificate, list it. It demonstrates self-directed learning, which employers value highly in graduates.</p>

        <h2>The Graduate CV Structure</h2>
        <p>Unlike experienced-professional CVs, graduate CVs typically lead with education:</p>

        <ol>
          <li><strong>Contact details</strong> — name, phone, email, LinkedIn, city</li>
          <li><strong>Personal statement</strong> — 3–4 lines positioning you as a candidate</li>
          <li><strong>Education</strong> — degree, A-levels, grades, relevant modules</li>
          <li><strong>Work experience / internships</strong> — even part-time counts</li>
          <li><strong>Projects and dissertations</strong></li>
          <li><strong>Skills</strong> — software, tools, languages</li>
          <li><strong>Extracurricular and volunteering</strong></li>
        </ol>

        <h2>How to Write a Personal Statement for a Graduate CV</h2>
        <p>Your personal statement (also called a professional summary) is 3–4 lines at the top of your CV. It should answer:</p>
        <ul>
          <li>Who are you? (degree subject, university)</li>
          <li>What do you bring? (relevant skills, experience, interests)</li>
          <li>What are you looking for? (the type of role or industry)</li>
        </ul>

        <p><strong>Weak example:</strong></p>
        <blockquote>
          I am a motivated and hardworking recent graduate looking for an opportunity to develop my skills in a dynamic and fast-paced environment.
        </blockquote>
        <p>This says nothing. Every graduate writes something like this.</p>

        <p><strong>Strong example:</strong></p>
        <blockquote>
          Economics graduate from the University of Leeds with a 2:1, a dissertation on behavioural pricing, and six months of marketing internship experience. Strong analytical skills developed through data-focused modules and independent research. Seeking a graduate role in marketing analytics or consumer insights.
        </blockquote>

        <h2>How to Write Bullet Points Without Much Experience</h2>
        <p>Use this formula for each bullet: <strong>action verb + what you did + outcome or scale</strong></p>
        <ul>
          <li>"Managed social media for the university debating society, growing Instagram following by 40% in one term"</li>
          <li>"Conducted primary research for dissertation involving 120 survey participants and regression analysis"</li>
          <li>"Handled customer complaints independently during peak retail periods, maintaining a calm and solutions-focused approach"</li>
        </ul>
        <p>Notice that every bullet starts with a strong verb (managed, conducted, handled). Avoid starting with "Responsible for..."</p>

        <h2>Common Graduate CV Mistakes</h2>
        <ul>
          <li><strong>Listing every module you studied</strong> — pick 4–6 most relevant ones only</li>
          <li><strong>Padding with soft skills</strong> — "team player", "excellent communicator" tell employers nothing</li>
          <li><strong>Using a generic objective</strong> — replace with a specific personal statement</li>
          <li><strong>No quantification</strong> — add numbers wherever you can, even approximate ones</li>
          <li><strong>Sending the same CV to every job</strong> — tailor the keywords and summary for each application</li>
          <li><strong>Leaving off any experience</strong> because you think it does not count — let the recruiter decide</li>
        </ul>

        <h2>Length for a Graduate CV</h2>
        <p>
          One page is standard for a graduate CV with limited experience. If you have substantial internship experience, project work, or volunteering, two pages is acceptable — but only if every section earns its place.
        </p>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Turn your experience into a strong graduate CV</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV rewrites and reformats your CV to highlight what actually matters to employers — even if your experience is limited.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Build My Graduate CV &rarr;
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
