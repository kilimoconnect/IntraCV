import { MetadataRoute } from "next";

const SITE_URL = "https://fusecv.com";

const guides: { slug: string; priority: number }[] = [
  // Core — highest volume globally
  { slug: "how-to-write-a-cv",                priority: 1.0 },
  { slug: "cv-vs-resume",                      priority: 0.9 },
  { slug: "ats-cv-checker",                    priority: 0.9 },
  { slug: "improve-cv-fast",                   priority: 0.9 },
  { slug: "why-not-getting-interviews",        priority: 0.9 },
  { slug: "how-long-should-a-cv-be",           priority: 0.9 },
  { slug: "employment-gaps-cv",                priority: 0.8 },
  { slug: "best-cv-format-uk",                 priority: 0.9 },
  { slug: "how-to-write-a-cover-letter",       priority: 0.9 },
  { slug: "cv-skills-examples",                priority: 0.8 },
  // Summaries & statements
  { slug: "resume-summary-examples",           priority: 0.8 },
  { slug: "cv-personal-statement-examples",    priority: 0.8 },
  // Career levels
  { slug: "graduate-cv-no-experience",         priority: 0.9 },
  { slug: "internship-cv-example",             priority: 0.8 },
  { slug: "career-change-cv-example",          priority: 0.8 },
  { slug: "executive-cv-example",              priority: 0.8 },
  // Cover letters
  { slug: "cover-letter-example-uk",           priority: 0.9 },
  // Role-specific
  { slug: "software-engineer-cv-example",      priority: 0.8 },
  { slug: "nurse-cv-example",                  priority: 0.8 },
  { slug: "teacher-cv-example",                priority: 0.8 },
  { slug: "project-manager-cv-example",        priority: 0.8 },
  { slug: "data-analyst-cv-example",           priority: 0.8 },
  { slug: "marketing-manager-cv-example",      priority: 0.8 },
  { slug: "accountant-cv-example",             priority: 0.8 },
  { slug: "sales-cv-example",                  priority: 0.8 },
  { slug: "product-manager-resume",            priority: 0.8 },
  // Country guides
  { slug: "resume-format-usa",                 priority: 0.9 },
  { slug: "cv-format-australia",               priority: 0.8 },
  { slug: "cv-format-canada",                  priority: 0.8 },
  { slug: "cv-format-south-africa",            priority: 0.8 },
  { slug: "cv-format-uae",                     priority: 0.8 },
  { slug: "cv-format-india",                   priority: 0.8 },
  { slug: "cv-format-nigeria",                 priority: 0.8 },
  { slug: "cv-format-kenya",                   priority: 0.8 },
  { slug: "cv-format-germany",                 priority: 0.8 },
  { slug: "cv-format-singapore",               priority: 0.8 },
  { slug: "cv-format-new-zealand",             priority: 0.8 },
  { slug: "cv-format-ghana",                   priority: 0.8 },
  // More role-specific
  { slug: "hr-cv-example",                     priority: 0.8 },
  { slug: "customer-service-cv-example",       priority: 0.8 },
  { slug: "graphic-designer-resume",           priority: 0.8 },
  { slug: "administrative-assistant-resume",   priority: 0.8 },
  // LinkedIn & personal branding
  { slug: "linkedin-summary-examples",         priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`,          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/guides`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const guidePages: MetadataRoute.Sitemap = guides.map(({ slug, priority }) => ({
    url: `${SITE_URL}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority,
  }));

  return [...staticPages, ...guidePages];
}
