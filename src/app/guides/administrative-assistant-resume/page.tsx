import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Administrative Assistant Resume — How to Write an Admin CV (2026)",
  description: "How to write an administrative assistant resume or CV — software skills, organisational impact and the bullet points that get admin and EA roles. With examples.",
  alternates: { canonical: "https://fusecv.com/guides/administrative-assistant-resume" },
  openGraph: { title: "Administrative Assistant Resume — How to Write an Admin CV (2026)", description: "How to write an administrative assistant resume — skills, bullet examples and structure for admin and EA roles.", url: "https://fusecv.com/guides/administrative-assistant-resume" },
};
const relatedGuides = [
  { slug: "cv-skills-examples",         title: "CV Skills Examples" },
  { slug: "resume-summary-examples",    title: "Resume Summary Examples" },
  { slug: "career-change-cv-example",   title: "Career Change CV Example" },
];
export default function AdminAssistantResumePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/guides" className="hover:text-orange-500">Guides</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">Administrative Assistant Resume</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Administrative Assistant Resume — How to Write an Admin CV That Gets You Hired (2026)</h1>
      <p className="text-lg text-slate-500 mb-8 leading-relaxed">Administrative and executive assistant roles are competitive precisely because the skills transfer so widely. To stand out, your CV needs to go beyond "organised and reliable" and show what you actually managed — scale, complexity, and measurable impact.</p>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-800 text-sm">Get your admin CV improved with AI</p>
          <p className="text-sm text-slate-500 mt-0.5">FuseCV rewrites your administrative assistant CV with professional impact language and the structure employers expect.</p>
        </div>
        <Link href="/register" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 text-sm font-bold text-white">Improve My CV Free &rarr;</Link>
      </div>
      <article className="prose prose-slate prose-lg max-w-none">
        <h2>What Employers Look For in an Admin CV</h2>
        <p>Hiring managers for admin and EA roles look for three things: software proficiency (do you know the tools?), organisational scope (how many people or projects did you support, at what level?), and reliability signals (low error rates, positive references, tenure). The mistake most admin CVs make is being vague about scope — stating "provided administrative support" without saying for how many people, at what seniority level, across what type of organisation.</p>

        <h2>Administrative Assistant Resume Summary Examples</h2>
        <p><strong>Administrative Assistant (entry to mid-level):</strong></p>
        <blockquote>Administrative assistant with 3 years of experience supporting a 15-person finance team at a mid-size professional services firm. Responsible for diary management, travel coordination, expense processing, document preparation and meeting facilitation. Proficient in Microsoft 365 (Outlook, Teams, SharePoint, Excel) and experienced with Concur and DocuSign. Known for accuracy and turnaround speed — processed 200+ monthly expense claims with a 0.3% error rate. Seeking an administrative or EA role supporting a senior leadership team in a fast-paced environment.</blockquote>
        <p><strong>Executive Assistant (C-suite support):</strong></p>
        <blockquote>Executive assistant with 7 years of experience supporting C-suite and board-level executives at FTSE 250 and Series C companies. Most recently EA to the CEO and CFO of a 600-person SaaS business — managing full diary and inbox, international travel logistics, board pack preparation, investor communication and all-hands event coordination. Trusted with confidential information and experienced working with chairman-level governance. Proficient in G Suite, Notion, Zoom and Salesforce. Seeking a Chief of Staff or Senior EA role in a high-growth business.</blockquote>
        <p><strong>Office Manager:</strong></p>
        <blockquote>Office manager with 5 years of experience running office operations for a 120-person creative agency across two London sites. Managed vendor contracts, facilities, IT procurement, health &amp; safety compliance, and onboarding operations. Reduced office supply costs by 22% through supplier consolidation and negotiated a new lease 18% below market rate. Seeking an office manager or operations coordinator role at a scale-up or agency.</blockquote>

        <h2>Admin CV Bullet Point Examples</h2>
        <ul>
          <li>"Managed the diary and travel arrangements for a team of 8 senior managers — coordinated 150+ meetings per month across 6 time zones with no scheduling conflicts over a 2-year period"</li>
          <li>"Prepared and distributed monthly board packs for a 12-member board — zero errors reported over 18 months, with consistent on-time delivery 48 hours before each meeting"</li>
          <li>"Coordinated 3 international company offsites per year (40–200 attendees) — managed venue sourcing, vendor contracts, travel logistics and on-site operations end-to-end"</li>
          <li>"Processed 200+ monthly expense reports across the finance team using Concur — maintained a 99.7% accuracy rate and reduced average processing time from 5 days to 2 days"</li>
          <li>"Migrated the department's document management from shared drives to SharePoint — created folder taxonomy, trained 15 team members, and reduced file retrieval time significantly"</li>
          <li>"Drafted correspondence, proposals and reports on behalf of the Managing Director — zero revisions requested on 90% of documents over 12 months"</li>
          <li>"Onboarded 34 new starters in 2024 — coordinated equipment setup, IT access, induction schedules and buddy pairings, consistently receiving 5/5 onboarding experience scores"</li>
        </ul>

        <h2>Admin and EA Skills Section</h2>
        <ul>
          <li><strong>Microsoft 365:</strong> Outlook, Word, Excel, PowerPoint, Teams, SharePoint, OneDrive — be specific; "Microsoft Office" without detail is not enough in 2026</li>
          <li><strong>Google Workspace:</strong> Gmail, Calendar, Docs, Sheets, Slides, Drive</li>
          <li><strong>Diary and scheduling tools:</strong> Calendly, Doodle, Microsoft Bookings</li>
          <li><strong>Travel and expenses:</strong> Concur, Expensify, TravelPerk, Egencia</li>
          <li><strong>Project management:</strong> Notion, Asana, Monday.com, Trello, ClickUp</li>
          <li><strong>Document management:</strong> DocuSign, Adobe Acrobat, SharePoint</li>
          <li><strong>Communication:</strong> Slack, Zoom, Microsoft Teams</li>
          <li><strong>CRM / business systems:</strong> Salesforce, HubSpot — relevant if supporting sales or client-facing leadership</li>
        </ul>

        <h2>Admin CV by Role Type</h2>
        <ul>
          <li><strong>Administrative Assistant:</strong> Operational support — scheduling, filing, correspondence, data entry, reception cover. Focus on accuracy, volume and software proficiency.</li>
          <li><strong>PA (Personal Assistant):</strong> One-to-one support for a senior manager or director — diary management, travel, email handling, gatekeeper responsibilities. Show level of principal and trust placed.</li>
          <li><strong>Executive Assistant (EA):</strong> Strategic support for C-suite executives — board materials, investor relations, complex stakeholder management, representing the executive in internal communications. Show scope and seniority of executives supported.</li>
          <li><strong>Office Manager:</strong> Operational infrastructure — facilities, vendors, health &amp; safety, IT procurement, office culture, space planning. Show the size of the office and any cost or efficiency improvements.</li>
          <li><strong>Chief of Staff:</strong> Strategic and operational leadership — cross-functional project management, OKR tracking, leadership team coordination, sometimes line management. Show business impact and executive influence.</li>
        </ul>

        <h2>Common Admin CV Mistakes</h2>
        <ul>
          <li>Not stating the seniority level of who you supported — "provided PA support" should say "PA to the CEO and CFO of a 400-person company"</li>
          <li>Listing soft skills without evidence — "excellent attention to detail" needs a proof point (error rate, revision rate, time period)</li>
          <li>Generic skills section — listing "Microsoft Office" without specifying which tools at what level</li>
          <li>Underselling the scope — admin professionals often manage significant budgets, logistics and sensitive information; be explicit about it</li>
          <li>No quantification — how many meetings per week? How many people in the team? How many events per year? Numbers make every bullet more credible</li>
        </ul>
      </article>
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Get your admin CV rewritten to the right standard</h2>
        <p className="text-indigo-100 text-sm mb-5">FuseCV rewrites your administrative assistant CV with impact-focused language and the professional structure that employers expect.</p>
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
