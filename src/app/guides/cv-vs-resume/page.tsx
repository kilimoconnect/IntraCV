import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CV vs Resume — Key Differences and Which One to Send",
  description:
    "CV vs resume: what is the difference, which countries use which, what goes in each, and when to use one over the other. Complete global guide.",
  alternates: { canonical: "https://fusecv.com/guides/cv-vs-resume" },
  openGraph: {
    title: "CV vs Resume — Key Differences and Which One to Send",
    description: "CV vs resume: differences, which countries use which, and when to send each.",
    url: "https://fusecv.com/guides/cv-vs-resume",
  },
};

const relatedGuides = [
  { slug: "how-to-write-a-cv",      title: "How to Write a CV" },
  { slug: "best-cv-format-uk",      title: "Best CV Format in the UK" },
  { slug: "resume-format-usa",      title: "Resume Format USA" },
];

export default function CvVsResumePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV vs Resume</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
        CV vs Resume — Key Differences and Which One to Send
      </h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        The terms are used interchangeably in some countries and mean completely different things in others. Here is what you actually need to know — by country.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your CV or resume improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">Upload your document and get a professionally formatted, ATS-optimised version in 60 seconds — whatever you call it.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">
          Improve My CV Free &rarr;
        </Link>
      </div>

      <article className="prose prose-slate prose-lg max-w-none">

        <h2>The Short Answer</h2>
        <ul>
          <li><strong>UK, Europe, Australia, New Zealand, Africa, Middle East, Asia:</strong> The document is called a <strong>CV</strong>. It is 1–3 pages depending on experience level.</li>
          <li><strong>USA and Canada:</strong> The document is called a <strong>resume</strong>. It is typically 1 page (junior/mid) or 2 pages (senior). "CV" in North America refers specifically to academic or research documents — much longer and more detailed.</li>
          <li><strong>India:</strong> Both terms are used interchangeably. The format is similar to the UK CV.</li>
        </ul>

        <h2>What Is a CV?</h2>
        <p>
          CV stands for <em>curriculum vitae</em> (Latin: "course of life"). In countries that use the term, it refers to the standard professional job application document — a structured summary of your work history, education, and skills, typically 1–3 pages in length.
        </p>
        <p>
          In the UK, a CV is the document you submit for virtually every professional job application. It is not an exhaustive life history — that is a common misconception. It is a targeted, well-structured professional document.
        </p>

        <h2>What Is a Resume?</h2>
        <p>
          In North America, a resume (from the French <em>résumé</em>, meaning "summary") is the standard job application document. It is typically more concise than a UK/international CV — usually 1 page for candidates with fewer than 10 years of experience, 2 pages for more experienced candidates.
        </p>
        <p>
          In the US, the word "CV" is used exclusively in academic and research contexts — a professor applying for a faculty position submits a CV that may run 10–20 pages, listing all publications, research, teaching experience, and conference presentations.
        </p>

        <h2>Key Differences: CV vs Resume at a Glance</h2>

        <div className="overflow-x-auto not-prose my-6">
          <table className="w-full text-sm border-collapse border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">Feature</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">CV (UK/International)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">Resume (US/Canada)</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {[
                ["Length", "1–3 pages", "1–2 pages"],
                ["Purpose", "Professional job applications", "Professional job applications"],
                ["Photo", "Never (UK/Europe)", "Never"],
                ["Objective/Summary", "Professional summary", "Resume objective or summary"],
                ["Used in", "UK, Europe, AUS, NZ, Africa, Middle East, Asia", "USA, Canada"],
                ["Academic version", "Standard CV (shorter)", "Separate long-form 'CV' (academic only)"],
              ].map(([f, cv, res]) => (
                <tr key={f} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{f}</td>
                  <td className="px-4 py-2.5">{cv}</td>
                  <td className="px-4 py-2.5">{res}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Which One Should You Send?</h2>
        <p>Follow the country, not the company:</p>
        <ul>
          <li><strong>Applying for a job in the UK, Australia, South Africa, India, UAE, Nigeria, Kenya, Germany, Singapore:</strong> Send a CV.</li>
          <li><strong>Applying for a job in the US or Canada:</strong> Send a resume.</li>
          <li><strong>Applying to a US company's UK office:</strong> Use the UK standard — send a CV.</li>
          <li><strong>Applying to an academic or research position anywhere:</strong> An academic CV is appropriate regardless of country.</li>
        </ul>
        <p>
          If you are unsure, look at the job posting. Most employers use the local terminology — "submit your resume" means US-style, "send your CV" means international style.
        </p>

        <h2>Do the Formats Actually Differ?</h2>
        <p>
          For most industries and seniority levels, the practical differences between a UK CV and a US resume are minor:
        </p>
        <ul>
          <li>Both use reverse-chronological work history</li>
          <li>Both lead with contact information and a summary</li>
          <li>Both emphasise achievements over duties</li>
          <li>Both require ATS-friendly formatting</li>
        </ul>
        <p>
          The main differences are length (US resumes skew shorter), the absence of personal details in both (no photo, DOB, marital status), and the terminology used in the document.
        </p>

        <h2>What About "Biodata"?</h2>
        <p>
          In some South Asian countries (India, Bangladesh, Pakistan), you may encounter the term <strong>biodata</strong>. This typically refers to a personal profile document that may include information not found in a UK CV or US resume (date of birth, religion, languages). The biodata format is used primarily for government, education, and traditional sectors. For corporate and multinational applications in these regions, a standard CV or resume format is expected.
        </p>

        <h2>International CV Formats by Region</h2>
        <ul>
          <li><strong>Australia:</strong> Same as UK CV — 2–3 pages standard, no photo, achievements-focused</li>
          <li><strong>Canada:</strong> Resume format (1–2 pages) for most roles; similar to US</li>
          <li><strong>Germany:</strong> Lebenslauf — includes a photo (professional headshot), date of birth, and is structured differently from UK/US formats</li>
          <li><strong>France:</strong> CV français — may include a photo and personal details; typically 1 page</li>
          <li><strong>South Africa:</strong> UK-style CV — 2–3 pages, no photo required</li>
          <li><strong>Nigeria/Kenya/Ghana:</strong> UK-style CV — 2 pages standard; may include nationality</li>
          <li><strong>UAE/Gulf:</strong> UK-style CV with 2–3 pages; including nationality is sometimes expected for visa processing</li>
          <li><strong>India:</strong> Both CV and resume terms used; 2–3 pages standard, sometimes includes a photo</li>
          <li><strong>Singapore:</strong> UK-style 2-page CV; international corporate standard</li>
        </ul>

        <h2>The Universal Rules (Regardless of Format)</h2>
        <ul>
          <li>Lead with your strongest selling point — never bury it</li>
          <li>Use numbers to quantify impact wherever possible</li>
          <li>Use the exact terminology from the job description</li>
          <li>Keep formatting clean and ATS-compatible (single column, no images)</li>
          <li>Tailor the document for each application</li>
        </ul>

      </article>

      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Improve your CV or resume — whatever country you're in</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV improves your document to the professional standard expected in your target market — ATS-ready and formatted correctly in 60 seconds.</p>
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
