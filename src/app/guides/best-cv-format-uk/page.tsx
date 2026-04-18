import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best CV Format in the UK (2026 Guide)",
  description:
    "The exact CV format UK recruiters expect: layout, length, sections, fonts and common mistakes. Updated for 2026 ATS requirements.",
  alternates: { canonical: "https://fusecv.com/guides/best-cv-format-uk" },
  openGraph: {
    title: "Best CV Format in the UK (2026 Guide)",
    description: "The exact CV format UK recruiters expect. Layout, length, sections and ATS tips.",
    url: "https://fusecv.com/guides/best-cv-format-uk",
  },
};

const relatedGuides = [
  { slug: "ats-cv-checker",             title: "ATS CV Checker — Pass Automated Screening" },
  { slug: "improve-cv-fast",            title: "How to Improve Your CV Fast" },
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
];

export default function BestCvFormatUkPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Best CV Format in the UK</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        Best CV Format in the UK (2026 Guide)
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        The exact layout, length, sections and fonts that UK recruiters expect — and the formatting mistakes that get CVs ignored before anyone reads them.
      </p>

      {/* Inline CTA */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Want your CV formatted correctly?</p>
          <p className="text-sm text-slate-500 mt-0.5">Upload your existing CV and get a properly formatted, ATS-ready version in 60 seconds.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Format My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>UK CV vs US Resume — The Key Differences</h2>
        <p>
          In the UK, the document is called a <strong>CV</strong> (curriculum vitae) — not a resume. The formats differ in important ways:
        </p>
        <ul>
          <li><strong>Length:</strong> UK CVs are typically 2 pages. US resumes are 1 page for most candidates.</li>
          <li><strong>Photo:</strong> Never include a photo on a UK CV. It is considered unprofessional and opens employers to discrimination claims.</li>
          <li><strong>Personal details:</strong> Do not include date of birth, nationality, or marital status on a UK CV.</li>
          <li><strong>References:</strong> Do not list references on the CV. "References available on request" is also unnecessary — employers know to ask.</li>
        </ul>

        <h2>The Standard UK CV Structure (2026)</h2>
        <p>UK CVs follow a consistent structure. Stick to this order unless you have a strong reason not to:</p>

        <h3>1. Contact Information</h3>
        <p>Name, phone number, email address, LinkedIn URL, and city (you don't need your full address). Make sure your email address is professional — use your name, not a nickname from university.</p>

        <h3>2. Professional Summary (3–4 lines)</h3>
        <p>A concise statement at the top of your CV that summarises who you are, your experience level, and your key value. This is not an objective ("I am looking for...") — it is a positioning statement ("Senior marketing manager with 8 years experience in FMCG...").</p>

        <h3>3. Work Experience (reverse chronological)</h3>
        <p>Start with your most recent role and work backwards. For each role, include:</p>
        <ul>
          <li>Job title, company name, location, dates (month and year)</li>
          <li>3–6 bullet points per role, focused on achievements — not just duties</li>
          <li>Numbers where possible: "Increased sales by 34%" beats "Responsible for increasing sales"</li>
        </ul>

        <h3>4. Education</h3>
        <p>List your qualifications in reverse chronological order. Include institution, qualification name, grade, and year. If you graduated more than 5 years ago, keep this section brief. If you are a recent graduate, this can go before work experience.</p>

        <h3>5. Skills</h3>
        <p>A concise list of relevant technical and professional skills. Do not pad this section with soft skills like "good communicator" — include only skills that are verifiable or industry-relevant (software, tools, languages, certifications).</p>

        <h3>6. Optional Sections</h3>
        <p>Depending on your background, you might also include: Certifications and courses, Professional memberships, Languages, Volunteering, Publications or projects.</p>

        <h2>CV Length — How Many Pages?</h2>
        <ul>
          <li><strong>Graduates and early-career:</strong> 1 page</li>
          <li><strong>3–10 years experience:</strong> 2 pages</li>
          <li><strong>Senior/executive with 10+ years:</strong> 2–3 pages</li>
        </ul>
        <p>
          Do not stretch a 1-page CV to 2 pages with large fonts and wide margins. Do not squeeze a 3-page CV onto 2 pages by making text unreadable. The number of pages should reflect your genuine experience — not a target.
        </p>

        <h2>Fonts and Formatting</h2>
        <ul>
          <li><strong>Font:</strong> Calibri, Arial, or Georgia. Size 10–12pt for body text, 14–16pt for your name.</li>
          <li><strong>Margins:</strong> 1.5–2cm on all sides</li>
          <li><strong>Line spacing:</strong> 1.15–1.5</li>
          <li><strong>Colour:</strong> Black text with optional subtle colour for headings (dark navy, dark grey). Avoid red, yellow, or high-contrast colour blocks.</li>
          <li><strong>Columns:</strong> Single-column layouts are more ATS-friendly. Multi-column formats look good visually but can cause ATS systems to scramble the content.</li>
        </ul>

        <h2>File Format — PDF or Word?</h2>
        <p>
          Send your CV as a <strong>PDF</strong> unless the application specifically asks for Word. PDF preserves your formatting across devices and operating systems. Word documents can look different depending on the version the recruiter opens.
        </p>
        <p>
          Exception: Some older ATS systems parse Word documents more reliably than PDFs. If you are uploading through an online application portal, test both formats if possible.
        </p>

        <h2>What to Leave Out</h2>
        <p>Remove these from your CV immediately:</p>
        <ul>
          <li>Photo or headshot</li>
          <li>Date of birth, nationality, marital status</li>
          <li>"References available on request"</li>
          <li>The word "CV" as a heading at the top</li>
          <li>Irrelevant early career jobs (older than 15 years, unrelated to your target role)</li>
          <li>Generic soft skills with no evidence: "team player", "good communication skills"</li>
          <li>Outdated technology (e.g. Microsoft Office listed as a skill in 2026)</li>
        </ul>

        <h2>ATS Compatibility</h2>
        <p>
          Most large UK employers use Applicant Tracking Systems (ATS) to screen CVs before a human reads them. The biggest ATS failures are:
        </p>
        <ul>
          <li>Tables and text boxes (content gets lost or scrambled)</li>
          <li>Headers and footers (often ignored by ATS parsers)</li>
          <li>Images, graphics, and icons</li>
          <li>Non-standard section headings (use "Work Experience" not "My Career Journey")</li>
          <li>Missing keywords from the job description</li>
        </ul>

        <h2>The 5-Second Test</h2>
        <p>
          A recruiter typically spends 5–10 seconds deciding whether to read a CV in full. Ask someone unfamiliar with your background to glance at your CV for 5 seconds and tell you:
        </p>
        <ul>
          <li>What do you do?</li>
          <li>How many years of experience do you have?</li>
          <li>What industry are you in?</li>
        </ul>
        <p>If they cannot answer all three, your formatting or summary needs work.</p>
      </article>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your CV formatted correctly — automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">
          FuseCV reformats and rewrites your CV to UK standards using AI. Upload your existing CV and download a polished, ATS-ready version in 60 seconds.
        </p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">
          Improve My CV Free &rarr;
        </Link>
      </div>

      {/* Related guides */}
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
