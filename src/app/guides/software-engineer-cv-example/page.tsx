import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software Engineer CV Example UK — What Hiring Managers Actually Look For",
  description:
    "A practical guide to writing a software engineer CV in the UK. Sections, skills formatting, project descriptions, and ATS tips for tech roles.",
  alternates: { canonical: "https://fusecv.com/guides/software-engineer-cv-example" },
  openGraph: {
    title: "Software Engineer CV Example UK",
    description: "What hiring managers actually look for in a software engineering CV — with section-by-section guidance.",
    url: "https://fusecv.com/guides/software-engineer-cv-example",
  },
};

const relatedGuides = [
  { slug: "ats-cv-checker",          title: "ATS CV Checker" },
  { slug: "resume-summary-examples", title: "Resume Summary Examples" },
  { slug: "best-cv-format-uk",       title: "Best CV Format in the UK" },
];

export default function SoftwareEngineerCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Software Engineer CV Example</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Software Engineer CV Example UK — What Hiring Managers Actually Look For
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        Technical roles have specific CV expectations that generic advice does not cover. Here is what actually matters — and how to structure each section.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your engineering CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your tech CV to highlight the right skills, quantify impact and pass ATS screening at top tech employers.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Improve My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>What Hiring Managers and Recruiters Look For First</h2>
        <p>In tech hiring, a recruiter typically does an initial screen before a technical reviewer sees the CV. Both have different priorities:</p>
        <ul>
          <li><strong>Recruiter:</strong> Does this candidate have the right technologies? Are they the right level? Does the CV make sense?</li>
          <li><strong>Technical reviewer:</strong> What systems have they worked on? What is the scale? Do they understand software beyond just writing code?</li>
        </ul>
        <p>Your CV needs to satisfy both. It needs to be scannable enough for the recruiter and specific enough for the technical reviewer.</p>

        <h2>Professional Summary for a Software Engineer</h2>
        <p>
          Your summary should lead with your level, your speciality, and the technologies you work with most. Do not start with "I am a passionate developer who loves coding."
        </p>

        <p><strong>Weak:</strong></p>
        <blockquote>
          Passionate software developer with experience in various technologies and a desire to contribute to innovative teams.
        </blockquote>

        <p><strong>Strong:</strong></p>
        <blockquote>
          Backend engineer with 6 years of experience building distributed systems in Python and Go. Specialises in high-throughput APIs and microservices architecture. Experience across fintech and e-commerce at scale — most recently serving 2M+ daily active users.
        </blockquote>

        <h2>The Technical Skills Section</h2>
        <p>
          Do not list skills alphabetically or randomly. Group them by category so a technical reviewer can scan in seconds:
        </p>

        <p><strong>Example structure:</strong></p>
        <ul>
          <li><strong>Languages:</strong> Python, TypeScript, Go, SQL</li>
          <li><strong>Frameworks:</strong> FastAPI, Node.js, React, Django</li>
          <li><strong>Cloud &amp; DevOps:</strong> AWS (EC2, Lambda, RDS), Docker, Kubernetes, Terraform</li>
          <li><strong>Databases:</strong> PostgreSQL, Redis, MongoDB</li>
          <li><strong>Tools:</strong> Git, JIRA, GitHub Actions, Datadog</li>
        </ul>

        <p>
          Only list technologies you are genuinely comfortable being interviewed on. A senior engineer who lists Kubernetes but cannot answer basic questions about it in an interview will lose the offer.
        </p>

        <h2>How to Write Work Experience Bullets for Tech Roles</h2>
        <p>
          The biggest mistake engineers make is writing duty lists rather than impact statements. Hiring managers want to understand what you built, why it mattered, and what the result was.
        </p>

        <p><strong>Duty-style (weak):</strong></p>
        <ul>
          <li>Responsible for developing backend services using Python</li>
          <li>Worked with the team on database optimisation</li>
          <li>Involved in code reviews and sprint planning</li>
        </ul>

        <p><strong>Impact-style (strong):</strong></p>
        <ul>
          <li>Re-architected the payment processing service from a monolith to microservices, reducing average API response time from 800ms to 120ms</li>
          <li>Identified and resolved N+1 query bottleneck in the order service, reducing database load by 60% during peak traffic</li>
          <li>Led backend code review process across a team of 6 engineers, reducing production bug rate by 35% over two quarters</li>
        </ul>

        <p>
          The formula: <strong>what you built or did</strong> + <strong>the technical approach</strong> + <strong>the measurable outcome</strong>. Not every bullet will have a number — but try to include at least two per role.
        </p>

        <h2>Should You Include a GitHub or Portfolio Link?</h2>
        <p>
          Yes — if it is current and reflects the quality of your work. A GitHub profile with active repositories, a README that explains each project, and visible commit history strengthens your application significantly.
        </p>
        <p>
          Do not link to a GitHub with no activity, empty repositories, or projects from a bootcamp three years ago with no recent updates.
        </p>
        <p>
          If you have a portfolio site showcasing projects — especially for frontend or full-stack roles — include that link too. Put both in your contact section at the top of the CV.
        </p>

        <h2>How to Describe Projects on a Software Engineer CV</h2>
        <p>
          Whether listing side projects, open-source contributions, or university work, use this structure for each:
        </p>
        <ul>
          <li><strong>Name and one-line description</strong> — what the project does</li>
          <li><strong>Technologies used</strong></li>
          <li><strong>Your specific role</strong> (if collaborative)</li>
          <li><strong>Scale or outcomes</strong> — users, GitHub stars, performance metrics</li>
        </ul>

        <p><strong>Example:</strong></p>
        <blockquote>
          <strong>PriceAlert</strong> — Real-time price tracking tool for e-commerce products. Built with Python (BeautifulSoup, Celery), Redis and PostgreSQL. Handles 5,000 monitored products with sub-minute update frequency. 400+ GitHub stars.
        </blockquote>

        <h2>ATS Considerations for Tech CVs</h2>
        <p>
          Tech CVs often fail ATS screening for specific reasons:
        </p>
        <ul>
          <li><strong>Technology names formatted incorrectly:</strong> Write "Node.js" not "NodeJS", "PostgreSQL" not "Postgres SQL". ATS systems match exact strings.</li>
          <li><strong>Missing the job description's specific stack:</strong> If the job says "React" and your CV says "frontend frameworks", the ATS may not match. Be specific.</li>
          <li><strong>Acronyms without expansion:</strong> Write "CI/CD (Continuous Integration/Continuous Deployment)" the first time — some parsers look for the full term.</li>
        </ul>

        <h2>Length and Format</h2>
        <ul>
          <li><strong>Junior engineers (0–3 years):</strong> 1 page</li>
          <li><strong>Mid-level (3–7 years):</strong> 1–2 pages</li>
          <li><strong>Senior/lead (7+ years):</strong> 2 pages</li>
          <li>Single-column layout only — avoid multi-column even if it looks good</li>
          <li>No profile photos, icons, skill bars or graphics</li>
        </ul>

        <h2>What to Leave Out</h2>
        <ul>
          <li>Technologies you used once three years ago and cannot confidently discuss</li>
          <li>Non-technical jobs that are not relevant to the role</li>
          <li>University module lists (unless they are directly relevant)</li>
          <li>"References available on request"</li>
          <li>Your date of birth or photo</li>
        </ul>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your software engineering CV optimised with AI</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV rewrites your tech CV to highlight the right skills, quantify your impact and make sure it passes ATS screening at top employers.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Improve My Engineering CV &rarr;
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
