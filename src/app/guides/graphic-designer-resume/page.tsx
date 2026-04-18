import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Graphic Designer Resume — How to Write a Design CV or Resume (2026)",
  description: "How to write a graphic designer resume or CV — portfolio links, software, creative impact and what design hiring managers look for. With examples for junior, mid and senior roles.",
  alternates: { canonical: "https://fusecv.com/guides/graphic-designer-resume" },
  openGraph: { title: "Graphic Designer Resume — How to Write a Design CV (2026)", description: "How to write a graphic designer resume — portfolio, software skills and impact examples for every level.", url: "https://fusecv.com/guides/graphic-designer-resume" },
};
const relatedGuides = [
  { slug: "software-engineer-cv-example",  title: "Software Engineer CV Example" },
  { slug: "resume-summary-examples",       title: "Resume Summary Examples" },
  { slug: "cv-skills-examples",            title: "CV Skills Examples" },
];
export default function GraphicDesignerResumePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Graphic Designer Resume</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Graphic Designer Resume — How to Write a Design CV That Gets You Hired (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">A graphic designer resume has one job that no other resume has: prove you can communicate visually before anyone reads a word. But the content matters too — software skills, project scope, business impact and a portfolio link that actually works.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your design CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your graphic designer CV with impact-focused language and the technical depth that creative hiring managers want to see.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>Portfolio First — Always</h2>
        <p>Your portfolio link is the most important element of a graphic designer resume. Place it immediately below your name and contact details — not buried at the bottom. Make it a clean, clickable URL (Behance, personal site, or a curated PDF). Before submitting any application, click the link yourself. A broken portfolio link on a design CV is an immediate red flag. A password-protected Behance page that the recruiter cannot access is nearly as bad — check your visibility settings.</p>

        <h2>Graphic Designer Resume Summary Examples</h2>
        <p><strong>Junior Designer (1–3 years):</strong></p>
        <blockquote>Brand and digital designer with 2 years of in-house and freelance experience. Skilled in Adobe Creative Suite (Illustrator, Photoshop, InDesign) and Figma. Designed brand identities for 8 small business clients, managed social media creative for a 40K-follower brand, and contributed to a product packaging redesign that increased retail shelf pickup rate by 17% in consumer testing. Portfolio: www.yourportfolio.com. Seeking a junior or mid-weight designer role in a brand or digital agency.</blockquote>
        <p><strong>Mid-weight Designer (3–6 years):</strong></p>
        <blockquote>Brand and campaign designer with 5 years of agency and in-house experience. Specialised in integrated campaigns across print, OOH and digital — working with FMCG and retail clients. Led the visual identity for a global campaign that ran across 12 markets and won a Drum Award for Creative Excellence in 2024. Proficient in Adobe CC, Figma and After Effects. Seeking a senior designer or design lead role at a brand or creative agency. Portfolio: www.yourportfolio.com</blockquote>
        <p><strong>Senior / Lead Designer:</strong></p>
        <blockquote>Senior brand designer and creative lead with 9 years of experience, the last 4 in-house at a Series B DTC e-commerce brand. Built and managed a 4-person design team, establishing the brand's visual language from Series A through to its acquisition in 2024. Oversaw all creative output from brand identity and packaging to performance marketing assets. Comfortable presenting to CEO and board. Seeking a Creative Director or Head of Brand role. Portfolio: www.yourportfolio.com</blockquote>

        <h2>Graphic Design Resume Bullet Examples</h2>
        <ul>
          <li>"Redesigned the product packaging line for a personal care brand — new shelf design tested 24% better in retail pickup studies vs. original"</li>
          <li>"Led the creation of a campaign visual identity deployed across TV, OOH, digital and print across 8 European markets — delivered on a 6-week timeline with zero revisions requested from client"</li>
          <li>"Built a brand guideline system (typography, colour, motion, illustration) adopted by 6 internal teams and 3 external agencies — reduced brand inconsistencies in output by an estimated 60%"</li>
          <li>"Designed and A/B tested 40+ landing page hero variants for paid campaigns — best-performing variant achieved a 34% improvement in CTA click rate"</li>
          <li>"Managed 3 junior designers — conducted weekly design crits, individual development plans, and reduced revision rounds from an average of 4 to 1.8 per project"</li>
          <li>"Created the complete visual identity for a fintech startup from zero — logo, typeface selection, colour palette, UI component library and pitch deck templates — delivered in 3 weeks"</li>
        </ul>

        <h2>Design Software and Tools — What to Include</h2>
        <ul>
          <li><strong>Industry-standard (Adobe CC):</strong> Illustrator, Photoshop, InDesign, After Effects, Premiere Pro, Lightroom, Acrobat</li>
          <li><strong>UI/UX and product design:</strong> Figma (by far the most common), Sketch, Adobe XD</li>
          <li><strong>Motion and video:</strong> After Effects, Cinema 4D, DaVinci Resolve, Rive</li>
          <li><strong>3D and packaging:</strong> Cinema 4D, Blender, KeyShot, Esko ArtPro (for packaging specialists)</li>
          <li><strong>Collaboration and handoff:</strong> Figma, Zeplin, Notion, Asana, Jira (relevant if working with engineering teams)</li>
          <li><strong>AI design tools:</strong> Midjourney, Adobe Firefly, DALL-E — worth including in 2026 as hiring managers increasingly expect awareness of AI in creative workflows</li>
        </ul>

        <h2>The Design Portfolio — What to Include and How Many Pieces</h2>
        <p>Quality always beats quantity. Three outstanding case studies will outperform twelve generic samples. For each portfolio piece, structure it as a mini case study: the brief, your role, your process, and the outcome. Include the business context where possible — why did the client need this? What changed because of the design? Outcomes can include: sales uplift, engagement rates on social, award wins, press coverage, client feedback, or production efficiency.</p>
        <ul>
          <li><strong>Junior:</strong> 5–8 pieces — include student work, personal projects and any freelance/live work</li>
          <li><strong>Mid-weight:</strong> 6–10 pieces — focus on commercial work; include at least 2–3 detailed case studies</li>
          <li><strong>Senior/Lead:</strong> 8–12 pieces — include team-led or directed work with clear role description; show range and strategic thinking</li>
        </ul>

        <h2>Graphic Designer Resume by Specialism</h2>
        <ul>
          <li><strong>Brand designer:</strong> Identity systems, visual language, logo design, brand guidelines, tone of voice. Include breadth of media (digital, print, physical).</li>
          <li><strong>UI/UX designer:</strong> While this is often a separate role, highlight any crossover. Include Figma proficiency, design systems, accessibility and user research involvement.</li>
          <li><strong>Motion designer:</strong> After Effects, Lottie/Rive for web animation, video production. Show reel or looping examples are essential.</li>
          <li><strong>Packaging designer:</strong> Dieline knowledge, print production, retail context. Include knowledge of substrates, finishes and printing processes.</li>
          <li><strong>Art Director:</strong> Creative leadership, client management, brief interpretation, campaign thinking. Show you can translate strategy into visual ideas.</li>
        </ul>

        <h2>Design Resume Mistakes to Avoid</h2>
        <ul>
          <li>Broken or inaccessible portfolio link — check it before every application</li>
          <li>A CV that looks bad — a designer's CV is itself a design sample. Keep it clean, typographically consistent, well-structured</li>
          <li>Listing tools without context — "Proficient in Photoshop" means nothing without showing what you used it for</li>
          <li>No quantified outcomes — design decisions have measurable effects; include them whenever possible</li>
          <li>Overly creative CV layout that breaks ATS parsing — use structure (even within a designed CV) that is scannable as plain text</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your graphic designer CV to the right standard</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your design CV with impact-focused language and the professional framing that creative agencies and in-house teams expect.</p>
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
