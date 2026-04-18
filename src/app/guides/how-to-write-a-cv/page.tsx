import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Write a CV — Complete Step-by-Step Guide (2026)",
  description:
    "How to write a CV from scratch — sections to include, what to write in each, how to format it, and how to make it stand out. Full guide with examples.",
  alternates: { canonical: "https://fusecv.com/guides/how-to-write-a-cv" },
  openGraph: {
    title: "How to Write a CV — Complete Step-by-Step Guide (2026)",
    description: "How to write a CV from scratch — every section, with examples and formatting tips.",
    url: "https://fusecv.com/guides/how-to-write-a-cv",
  },
};

const relatedGuides = [
  { slug: "best-cv-format-uk",       title: "Best CV Format in the UK" },
  { slug: "resume-summary-examples", title: "Resume Summary Examples" },
  { slug: "improve-cv-fast",         title: "How to Improve Your CV Fast" },
];

export default function HowToWriteACvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">How to Write a CV</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        How to Write a CV — Complete Step-by-Step Guide (2026)
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        Everything you need to write a CV that gets responses — every section explained, with examples, formatting rules and the mistakes that get applications ignored.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Already have a CV? Improve it in 60 seconds</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites and reformats your existing CV using AI — ATS-optimised and professionally formatted in under a minute.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Improve My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>What Is a CV?</h2>
        <p>A CV (curriculum vitae) is a document that summarises your professional background — work history, education, skills and achievements — for a prospective employer. In the UK, Australia, New Zealand and most of Europe, the document is called a CV. In the US and Canada, it is usually called a resume (though "CV" is used in academic and research contexts).</p>

        <h2>Before You Start Writing</h2>
        <p>A strong CV is targeted — written with a specific role or industry in mind. Before you open a blank document:</p>
        <ul>
          <li>Read 5–10 job descriptions for the type of role you are applying for</li>
          <li>Note the skills, tools and qualifications mentioned most often</li>
          <li>Identify the language employers in your target industry use</li>
        </ul>
        <p>This research shapes every section of your CV — from the summary to the bullet points in your work experience.</p>

        <h2>CV Structure — Every Section Explained</h2>

        <h3>1. Contact Information</h3>
        <p>Top of the page. Include: full name, phone number, professional email address, LinkedIn URL, city and country. Do not include: date of birth, photo (UK/Europe), full home address, nationality or marital status.</p>

        <h3>2. Professional Summary (3–5 lines)</h3>
        <p>A brief positioning statement that tells the recruiter who you are immediately. Lead with your experience level, your speciality, and your strongest credential.</p>
        <p><strong>Example:</strong> "Digital marketing manager with 7 years of experience in SEO, content strategy and paid media across e-commerce and SaaS. Grew organic traffic by 280% at a D2C brand over 18 months. Seeking a senior or head-of role in a data-driven marketing team."</p>

        <h3>3. Work Experience</h3>
        <p>List in reverse chronological order (most recent first). For each role:</p>
        <ul>
          <li>Job title, company name, location, dates (month and year)</li>
          <li>4–6 bullet points per role</li>
          <li>Focus on achievements, not duties — use numbers wherever possible</li>
          <li>Start each bullet with a strong action verb: Led, Built, Reduced, Grew, Delivered, Designed</li>
        </ul>
        <p><strong>Weak bullet:</strong> "Responsible for managing the customer support team."</p>
        <p><strong>Strong bullet:</strong> "Led a team of 12 customer support agents, reducing average resolution time from 48 hours to 6 hours and achieving a 94% CSAT score."</p>

        <h3>4. Education</h3>
        <p>List qualifications in reverse chronological order. Include: institution, qualification and subject, grade (if strong), year of completion. If you graduated more than 5 years ago, keep this brief. Graduates should put this before work experience.</p>

        <h3>5. Skills</h3>
        <p>A concise list of verifiable, relevant skills — tools, software, languages, certifications. Do not pad with soft skills ("good communicator", "team player") — these belong in your bullet points as demonstrated evidence, not in a list.</p>

        <h3>6. Optional Sections</h3>
        <p>Depending on your background: certifications, languages, publications, projects, volunteering, professional memberships, or awards.</p>

        <h2>How Long Should Your CV Be?</h2>
        <ul>
          <li><strong>Graduates and early career (0–3 years):</strong> 1 page</li>
          <li><strong>Mid-career (3–10 years):</strong> 2 pages</li>
          <li><strong>Senior professionals (10+ years):</strong> 2–3 pages</li>
        </ul>

        <h2>Formatting Rules</h2>
        <ul>
          <li>Font: Arial, Calibri, or Georgia — 10–12pt body, 14–16pt name</li>
          <li>Margins: 1.5–2cm on all sides</li>
          <li>Single column layout (multi-column breaks ATS systems)</li>
          <li>No tables, text boxes, images or graphics</li>
          <li>Save as PDF unless the employer specifies Word</li>
          <li>File name: FirstnameLastname-CV.pdf</li>
        </ul>

        <h2>How to Write CV Bullet Points That Get Noticed</h2>
        <p>The formula: <strong>Action verb + what you did + measurable result</strong></p>
        <ul>
          <li>"Launched a customer referral programme that generated 1,200 new users in Q3 at a cost-per-acquisition 40% below paid channel average"</li>
          <li>"Renegotiated supplier contracts across 6 vendors, achieving £340,000 in annual savings without quality compromise"</li>
          <li>"Designed and delivered onboarding training for 45 new hires across 3 international offices, reducing ramp time by 3 weeks"</li>
        </ul>

        <h2>Tailoring Your CV for Each Application</h2>
        <p>A generic CV sent to 100 jobs performs worse than a tailored CV sent to 10. For each application:</p>
        <ul>
          <li>Adjust your professional summary to reflect the specific role and company</li>
          <li>Add keywords from the job description that match your genuine experience</li>
          <li>Reorder bullet points to lead with the most relevant achievements</li>
          <li>Ensure your job titles align with the terminology the employer uses</li>
        </ul>

        <h2>ATS — Making Your CV Machine-Readable</h2>
        <p>Most employers use software to screen CVs before a human reads them. To pass:</p>
        <ul>
          <li>Use standard section headings: Work Experience, Education, Skills</li>
          <li>Avoid tables, multi-column layouts, images and text boxes</li>
          <li>Place contact details in the document body — not the header/footer</li>
          <li>Mirror the exact terminology used in the job description</li>
        </ul>

        <h2>The 10 Most Common CV Mistakes</h2>
        <ol>
          <li>No professional summary — or a vague one</li>
          <li>Listing duties instead of achievements</li>
          <li>No numbers or metrics in bullet points</li>
          <li>Sending the same CV to every job without tailoring</li>
          <li>Using a multi-column or table-based template</li>
          <li>Including a photo (UK/Europe applications)</li>
          <li>Typos and inconsistent formatting</li>
          <li>Going too long (10+ years experience on 4 pages) or too short (15 years of experience squeezed onto 1 page)</li>
          <li>Using the same generic phrases as everyone else</li>
          <li>"References available on request" — delete it</li>
        </ol>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Let AI write and improve your CV for you</h2>
        <p className="text-indigo-100 text-sm mb-5">Upload your existing CV — or build from scratch — and get an ATS-optimised, professionally formatted version in 60 seconds.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Build My CV Free &rarr;
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
