import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "CV Format Germany — German Lebenslauf Guide (2026)",
  description: "How to write a CV (Lebenslauf) for the German job market — format, photo rules, tabular structure, cover letter (Anschreiben), and what German employers expect.",
  alternates: { canonical: "https://fusecv.com/guides/cv-format-germany" },
  openGraph: { title: "CV Format Germany — German Lebenslauf Guide (2026)", description: "How to write a Lebenslauf for German employers — format, photo, Anschreiben and application package.", url: "https://fusecv.com/guides/cv-format-germany" },
};
const relatedGuides = [
  { slug: "cv-vs-resume",      title: "CV vs Resume — Key Differences" },
  { slug: "how-to-write-a-cv", title: "How to Write a CV" },
  { slug: "cover-letter-example-uk", title: "Cover Letter Example UK" },
];
export default function CvFormatGermanyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">CV Format Germany</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">CV Format Germany — German Lebenslauf Guide (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">The German job application process is highly structured and differs significantly from UK or US conventions. A well-prepared Lebenslauf (CV) and Anschreiben (cover letter) are non-negotiable. Here is exactly what German employers expect.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your German CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your CV to the professional standard expected by German and international employers in Germany.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>The German Application Package (Bewerbungsmappe)</h2>
        <p>German job applications traditionally consist of several documents submitted together:</p>
        <ol>
          <li><strong>Anschreiben</strong> — formal cover letter (1 page)</li>
          <li><strong>Lebenslauf</strong> — CV (1–2 pages)</li>
          <li><strong>Zeugnisse</strong> — work references and certificates (copies of your most recent employment references)</li>
          <li><strong>Ausbildungs-/Studiennachweise</strong> — degree certificates and transcripts</li>
        </ol>
        <p>For online applications, all documents are typically uploaded together as a single PDF. The quality and completeness of the application package is taken very seriously in Germany.</p>
        <h2>German Lebenslauf Format</h2>
        <ul>
          <li><strong>Format:</strong> Tabular (tabellarischer Lebenslauf) — the standard format in Germany. Left column: dates. Right column: information. This is a specific structural convention that differs from the narrative bullet-point format used in UK CVs.</li>
          <li><strong>Photo:</strong> A professional Bewerbungsfoto (application photo) is expected — unlike UK or US CVs. Use a high-quality, recent headshot taken by a professional photographer if possible. Business attire, plain or neutral background, facing the camera. Place it in the top right corner of the Lebenslauf.</li>
          <li><strong>Length:</strong> 1–2 pages maximum. German employers value conciseness.</li>
          <li><strong>Language:</strong> German for German companies; English for international companies in Germany. When in doubt, provide both versions or follow the language of the job posting.</li>
          <li><strong>Date format:</strong> DD.MM.YYYY (e.g., 15.03.2018)</li>
          <li><strong>Signature:</strong> Sign and date your Lebenslauf at the bottom — this is still expected in traditional German applications.</li>
        </ul>
        <h2>German Lebenslauf Structure</h2>
        <h3>Personal Details (Persönliche Daten)</h3>
        <p>Full name, date of birth (Geburtsdatum), place of birth (Geburtsort), nationality (Staatsangehörigkeit), address, phone, email, LinkedIn. Unlike UK CVs, personal details are more extensive and expected. Marital status (Familienstand) is optional but traditionally included.</p>
        <h3>Work Experience (Berufserfahrung)</h3>
        <p>Reverse chronological. Dates on the left, job title and company on the right. A brief 2–3 line description of responsibilities and achievements per role. German CVs tend to be less achievement-focused than British ones — clear, factual descriptions of responsibility are the norm.</p>
        <h3>Education (Ausbildung / Studium)</h3>
        <p>Reverse chronological. Degree name, subject, university, graduation year, grade (Abschlussnote — German grades are 1.0 best to 5.0 fail; include if 2.0 or better). Apprenticeship (Ausbildung) should also be listed if applicable — Germany's dual education system means Ausbildung is a highly valued and fully professional qualification.</p>
        <h3>Skills (Kenntnisse und Fähigkeiten)</h3>
        <p>IT skills (specific software, programming languages), language skills (with level — C2/C1/B2/B1 per CEFR framework), driving licence (Führerschein — Klasse B). Avoid generic soft skills.</p>
        <h3>Other Activities (Ehrenamtliches Engagement / Hobbys)</h3>
        <p>German CVs commonly include volunteering, sports, or hobbies — particularly if they demonstrate leadership, community involvement, or relevant skills. Keep it brief (2–4 items).</p>
        <h2>The Anschreiben (Cover Letter)</h2>
        <p>The German cover letter is formal and expected for almost every application. Key conventions:</p>
        <ul>
          <li>Formal business letter format with your address, date, company address</li>
          <li>Formal salutation: "Sehr geehrte Damen und Herren," (if no named contact) or "Sehr geehrte Frau [Name]," / "Sehr geehrter Herr [Name],"</li>
          <li>Opening: State the specific role and where you found it</li>
          <li>Body: Why you are qualified — specific achievements and competencies (2–3 paragraphs)</li>
          <li>Closing: State your availability for interview and your earliest start date (Eintrittstermin)</li>
          <li>Sign off: "Mit freundlichen Grüßen" (Sincerely) + your signature</li>
        </ul>
        <h2>German Arbeitszeugnis (Employment Reference)</h2>
        <p>Germany has a unique system of formal written employment references (Arbeitszeugnis) that every employer is required to provide. These are taken very seriously. A qualified reference says "zur vollen Zufriedenheit" (to full satisfaction). An outstanding reference says "zur vollsten Zufriedenheit." Include your most recent Arbeitszeugnisse in your application package.</p>
        <h2>Tips for International Candidates Applying in Germany</h2>
        <ul>
          <li>Have your CV translated to German if applying to German-speaking companies</li>
          <li>Include your German language level honestly — B2 is typically the minimum for non-English roles</li>
          <li>Address your work permit status in the cover letter if you are a non-EU national</li>
          <li>Research the Bundesagentur für Arbeit visa programmes if you are applying from outside the EU</li>
          <li>German companies appreciate punctuality, precision and thoroughness — your application should reflect these values</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your CV ready for the German job market</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your CV to the professional standard expected by German and international employers in Germany.</p>
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
