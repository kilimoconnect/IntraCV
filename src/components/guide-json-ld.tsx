"use client";

import { usePathname } from "next/navigation";

const SITE = "https://fusecv.com";

const GUIDES: Record<string, { title: string; description: string; datePublished: string }> = {
  "how-to-write-a-cv":               { title: "How to Write a CV",                              description: "How to write a CV from scratch — sections to include, what to write in each, how to format it, and how to make it stand out.",           datePublished: "2024-10-01" },
  "cv-vs-resume":                     { title: "CV vs Resume — What's the Difference?",          description: "The key differences between a CV and a resume, when to use each, and how to format both correctly for UK and international job applications.", datePublished: "2024-10-05" },
  "ats-cv-checker":                   { title: "ATS CV Checker — How to Pass ATS Screening",     description: "How ATS systems work, how to optimise your CV to pass automated screening, and the most common ATS mistakes to avoid.",                    datePublished: "2024-10-08" },
  "improve-cv-fast":                  { title: "How to Improve Your CV Fast",                    description: "Quick, practical tips to improve your CV today — better bullet points, stronger summary, and formatting fixes that get results.",            datePublished: "2024-10-10" },
  "why-not-getting-interviews":       { title: "Why You're Not Getting Interviews",               description: "The most common reasons your CV isn't getting interviews — and exactly what to fix to start landing callbacks.",                            datePublished: "2024-10-12" },
  "how-long-should-a-cv-be":         { title: "How Long Should a CV Be?",                       description: "The ideal CV length for every career stage — graduate, mid-level, senior, and executive — with formatting advice and examples.",             datePublished: "2024-10-15" },
  "employment-gaps-cv":               { title: "How to Explain Employment Gaps on Your CV",      description: "How to address career gaps honestly and positively on your CV without letting them cost you interviews.",                                    datePublished: "2024-10-18" },
  "best-cv-format-uk":                { title: "Best CV Format in the UK",                       description: "The best CV format for UK job seekers — layout, fonts, sections, and length explained with examples.",                                      datePublished: "2024-10-20" },
  "how-to-write-a-cover-letter":      { title: "How to Write a Cover Letter",                    description: "A step-by-step guide to writing a cover letter that gets read — structure, tone, what to include, and common mistakes to avoid.",           datePublished: "2024-10-22" },
  "cv-skills-examples":               { title: "CV Skills Examples — What to Put on Your CV",   description: "The best skills to include on your CV by industry and role, with examples and formatting advice.",                                           datePublished: "2024-10-25" },
  "resume-summary-examples":          { title: "Resume Summary Examples",                        description: "Professional resume summary examples for every career level — graduate, professional, and executive — with writing tips.",                    datePublished: "2024-11-01" },
  "cv-personal-statement-examples":   { title: "CV Personal Statement Examples",                 description: "Strong CV personal statement examples with a step-by-step guide to writing one that grabs a recruiter's attention.",                         datePublished: "2024-11-05" },
  "graduate-cv-no-experience":        { title: "Graduate CV With No Experience",                  description: "How to write a graduate CV when you have little or no work experience — what to include, how to frame it, and examples.",                   datePublished: "2024-11-08" },
  "internship-cv-example":            { title: "Internship CV Example",                          description: "A complete internship CV example with tips on what to include when you're just starting out in your career.",                               datePublished: "2024-11-10" },
  "career-change-cv-example":         { title: "Career Change CV Example",                       description: "How to write a CV when switching careers — how to reframe your experience, highlight transferable skills, and win interviews.",              datePublished: "2024-11-12" },
  "executive-cv-example":             { title: "Executive CV Example",                           description: "A senior executive CV example with guidance on how to present leadership, strategy, and board-level achievements.",                          datePublished: "2024-11-15" },
  "cover-letter-example-uk":          { title: "Cover Letter Example UK",                        description: "A UK cover letter example with a guide to writing one that stands out — format, tone, length, and what recruiters want to see.",             datePublished: "2024-11-18" },
  "software-engineer-cv-example":     { title: "Software Engineer CV Example",                   description: "A software engineer CV example with tips on how to showcase technical skills, projects, and achievements.",                                  datePublished: "2024-11-20" },
  "nurse-cv-example":                 { title: "Nurse CV Example",                               description: "A nursing CV example with guidance on clinical experience, NMC registration, and key skills to highlight.",                                 datePublished: "2024-11-22" },
  "teacher-cv-example":               { title: "Teacher CV Example",                             description: "A teacher CV example with advice on how to present qualifications, classroom experience, and educational achievements.",                     datePublished: "2024-11-25" },
  "project-manager-cv-example":       { title: "Project Manager CV Example",                     description: "A project manager CV example highlighting delivery experience, certifications, and stakeholder management skills.",                          datePublished: "2024-11-28" },
  "data-analyst-cv-example":          { title: "Data Analyst CV Example",                        description: "A data analyst CV example with tips on showcasing technical tools, analytical skills, and quantified results.",                             datePublished: "2024-12-01" },
  "marketing-manager-cv-example":     { title: "Marketing Manager CV Example",                   description: "A marketing manager CV example with guidance on how to present campaigns, budgets, and measurable impact.",                                  datePublished: "2024-12-03" },
  "accountant-cv-example":            { title: "Accountant CV Example",                          description: "An accountant CV example with tips on presenting qualifications, software skills, and financial achievements.",                              datePublished: "2024-12-05" },
  "sales-cv-example":                 { title: "Sales CV Example",                               description: "A sales CV example focused on targets, results, and revenue — everything a hiring manager wants to see.",                                   datePublished: "2024-12-08" },
  "product-manager-resume":           { title: "Product Manager Resume Example",                 description: "A product manager resume example with tips on roadmap experience, cross-functional leadership, and measurable product outcomes.",             datePublished: "2024-12-10" },
  "resume-format-usa":                { title: "Resume Format USA — How to Write an American Resume", description: "How to format a resume for the US job market — layout, length, what to include, and key differences from a UK CV.",              datePublished: "2024-12-12" },
  "cv-format-australia":              { title: "CV Format Australia — Australian CV Guide",       description: "How to write a CV for the Australian job market — format, length, key sections, and what Australian recruiters expect.",                    datePublished: "2024-12-15" },
  "cv-format-canada":                 { title: "CV Format Canada — Canadian Resume Guide",        description: "How to format a CV or resume for the Canadian job market with examples and formatting tips.",                                               datePublished: "2024-12-18" },
  "cv-format-south-africa":           { title: "CV Format South Africa",                         description: "How to write a CV for the South African job market — format, length, and what to include.",                                                datePublished: "2024-12-20" },
  "cv-format-uae":                    { title: "CV Format UAE — Dubai CV Guide",                  description: "How to write a CV for the UAE and Dubai job market — what to include, format, and cultural considerations.",                               datePublished: "2024-12-22" },
  "cv-format-india":                  { title: "CV Format India — Indian CV Guide",               description: "How to write a CV for the Indian job market — format, biodata vs CV, and what recruiters in India expect.",                               datePublished: "2025-01-05" },
  "cv-format-nigeria":                { title: "CV Format Nigeria — Nigerian CV Guide",           description: "How to write a CV for the Nigerian job market — format, length, and key sections.",                                                        datePublished: "2025-01-08" },
  "cv-format-kenya":                  { title: "CV Format Kenya — Kenyan CV Guide",               description: "How to write a CV for the Kenyan job market — format, sections, and tips for standing out.",                                              datePublished: "2025-01-10" },
  "cv-format-germany":                { title: "CV Format Germany — German Lebenslauf Guide",     description: "How to write a CV or Lebenslauf for the German job market — format, photo requirements, and key differences.",                            datePublished: "2025-01-12" },
  "cv-format-singapore":              { title: "CV Format Singapore — Singapore CV Guide",        description: "How to write a CV for the Singapore job market — format, length, and what employers expect.",                                              datePublished: "2025-01-15" },
  "cv-format-new-zealand":            { title: "CV Format New Zealand — NZ CV Guide",             description: "How to write a CV for the New Zealand job market — format, tone, and key sections.",                                                       datePublished: "2025-01-18" },
  "cv-format-ghana":                  { title: "CV Format Ghana — Ghanaian CV Guide",             description: "How to write a CV for the Ghanaian job market — format, sections, and tips.",                                                             datePublished: "2025-01-20" },
  "hr-cv-example":                    { title: "HR CV Example",                                  description: "An HR CV example with tips on showcasing people management, recruitment, and HR strategy experience.",                                      datePublished: "2025-01-22" },
  "customer-service-cv-example":      { title: "Customer Service CV Example",                    description: "A customer service CV example with tips on presenting communication skills, metrics, and service achievements.",                             datePublished: "2025-01-25" },
  "graphic-designer-resume":          { title: "Graphic Designer Resume Example",                description: "A graphic designer resume example with tips on presenting a portfolio, software skills, and creative achievements.",                         datePublished: "2025-01-28" },
  "administrative-assistant-resume":  { title: "Administrative Assistant Resume Example",         description: "An administrative assistant resume example with tips on organisation skills, software proficiency, and office experience.",                 datePublished: "2025-02-01" },
  "linkedin-summary-examples":        { title: "LinkedIn Summary Examples",                      description: "Professional LinkedIn summary examples for every career stage — how to write one that gets profile views and connection requests.",           datePublished: "2025-02-05" },
};

export default function GuideJsonLd() {
  const pathname = usePathname();
  const slug = pathname.replace(/^\/guides\//, "").replace(/\/$/, "");
  const guide = GUIDES[slug];
  if (!guide) return null;

  const url = `${SITE}/guides/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}/#article`,
        headline: guide.title,
        description: guide.description,
        url,
        datePublished: guide.datePublished,
        dateModified: "2026-01-01",
        author: {
          "@type": "Organization",
          "@id": `${SITE}/#organization`,
          name: "FuseCV",
          url: SITE,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE}/#organization`,
          name: "FuseCV",
          url: SITE,
          logo: {
            "@type": "ImageObject",
            url: `${SITE}/fusecv-logo.png`,
            width: 135,
            height: 42,
          },
        },
        image: {
          "@type": "ImageObject",
          url: `${SITE}/og-image.png`,
          width: 1200,
          height: 630,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",      item: SITE },
          { "@type": "ListItem", position: 2, name: "CV Guides", item: `${SITE}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
