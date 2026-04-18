import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Long Should a CV Be? — The Definitive Answer by Experience Level",
  description: "How many pages should a CV be? The definitive answer by experience level, country, and industry — plus what to cut when your CV is too long.",
  alternates: { canonical: "https://fusecv.com/guides/how-long-should-a-cv-be" },
  openGraph: { title: "How Long Should a CV Be?", description: "The definitive answer on CV length — by experience level, country and industry.", url: "https://fusecv.com/guides/how-long-should-a-cv-be" },
};
const relatedGuides = [
  { slug: "best-cv-format-uk",   title: "Best CV Format in the UK" },
  { slug: "improve-cv-fast",     title: "How to Improve Your CV Fast" },
  { slug: "how-to-write-a-cv",   title: "How to Write a CV" },
];
export default function HowLongCvPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">How Long Should a CV Be</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">How Long Should a CV Be? — The Definitive Answer</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">One page, two pages, three? The correct answer depends on your experience level, your target country, and your industry. Here is the definitive guide — plus what to cut when your CV is too long.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your CV length right automatically</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV reformats and trims your CV to the right length for your experience level — without losing anything important.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>CV Length by Experience Level</h2>
        <ul>
          <li><strong>Graduate / no experience (0–2 years):</strong> 1 page. You do not have enough relevant experience to fill two pages without padding — and padding is immediately visible to recruiters.</li>
          <li><strong>Early career (2–5 years):</strong> 1–2 pages. At the upper end of this range, 2 pages is acceptable if the content genuinely justifies it.</li>
          <li><strong>Mid-career (5–10 years):</strong> 2 pages. This is the standard for most professional roles.</li>
          <li><strong>Senior professional (10–15 years):</strong> 2 pages. Still 2 pages — cut the earliest roles or summarise them briefly.</li>
          <li><strong>Executive / 15+ years:</strong> 2–3 pages. Three pages is acceptable at director and C-suite level where the breadth of experience genuinely warrants it.</li>
        </ul>
        <h2>CV Length by Country</h2>
        <ul>
          <li><strong>USA:</strong> 1 page (junior/mid), 2 pages (senior). US employers are stricter about length than any other market.</li>
          <li><strong>UK:</strong> 2 pages standard. Graduates: 1 page. Executives: 2–3 pages.</li>
          <li><strong>Australia:</strong> 2–4 pages. Australians accept longer CVs than US or UK employers.</li>
          <li><strong>South Africa:</strong> 3–5 pages. The longest standard of any major English-speaking market.</li>
          <li><strong>Canada:</strong> 1–2 pages (US-influenced).</li>
          <li><strong>Germany:</strong> 1–2 pages (Lebenslauf format).</li>
          <li><strong>India:</strong> 2–3 pages for corporate roles; longer for government/academic applications.</li>
          <li><strong>UAE/Gulf:</strong> 2–3 pages standard in most sectors.</li>
        </ul>
        <h2>What Happens If Your CV Is Too Long?</h2>
        <p>Recruiters typically spend 7–30 seconds on an initial scan. A 4-page CV from a mid-career professional signals poor editorial judgment — the candidate cannot prioritise. It also increases the likelihood that the recruiter will not read the most important parts.</p>
        <h2>What Happens If Your CV Is Too Short?</h2>
        <p>A one-page CV from a senior professional with 15 years of experience looks like the candidate is hiding something — or has not bothered to prepare a proper document. It also deprives the recruiter of the evidence they need to progress the application.</p>
        <h2>What to Cut When Your CV Is Too Long</h2>
        <ol>
          <li><strong>Roles older than 15 years</strong> — summarise in one line or remove entirely (unless directly relevant)</li>
          <li><strong>Irrelevant early-career jobs</strong> — the Saturday job from university does not need 5 bullet points</li>
          <li><strong>"References available on request"</strong> — delete it entirely</li>
          <li><strong>Generic soft skills lists</strong> — "good communicator, team player, works well under pressure" adds no value</li>
          <li><strong>Excessive education detail</strong> — if you graduated 10+ years ago, the university module list can go</li>
          <li><strong>Redundant bullet points</strong> — if three bullets say the same thing with different wording, keep the strongest one</li>
          <li><strong>Lengthy role descriptions for short-term positions</strong> — a 3-month contract does not need 6 bullet points</li>
        </ol>
        <h2>What to Add When Your CV Is Too Short</h2>
        <ul>
          <li>A professional summary (if missing)</li>
          <li>More detail on your key achievements — add numbers and context</li>
          <li>A dedicated skills section</li>
          <li>Certifications, professional development, or courses</li>
          <li>Voluntary work, projects, or extracurricular contributions</li>
        </ul>
        <h2>The Golden Rule</h2>
        <p>The right length is the length that includes everything relevant and nothing that isn't. Do not pad to hit a page target. Do not cut aggressively to fit an arbitrary limit. The page count is a consequence of the quality of your content — not a target in itself.</p>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your CV length right — automatically</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV trims, formats and rewrites your CV to the right length and standard for your experience level and target market.</p>
        <Link href="/register" className="inline-block rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors px-7 py-3 font-bold text-white text-sm">Improve My CV Free &rarr;</Link>
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
