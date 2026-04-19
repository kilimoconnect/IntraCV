import { MetadataRoute } from "next";

const SITE_URL = "https://fusecv.com";

const guides: { slug: string; priority: number; lastModified: string }[] = [
  // Core — highest volume globally
  { slug: "how-to-write-a-cv",                priority: 1.0, lastModified: "2026-01-10" },
  { slug: "cv-vs-resume",                      priority: 0.9, lastModified: "2026-01-08" },
  { slug: "ats-cv-checker",                    priority: 0.9, lastModified: "2026-01-08" },
  { slug: "improve-cv-fast",                   priority: 0.9, lastModified: "2026-01-07" },
  { slug: "why-not-getting-interviews",        priority: 0.9, lastModified: "2026-01-07" },
  { slug: "how-long-should-a-cv-be",           priority: 0.9, lastModified: "2026-01-06" },
  { slug: "employment-gaps-cv",                priority: 0.8, lastModified: "2025-12-15" },
  { slug: "best-cv-format-uk",                 priority: 0.9, lastModified: "2026-01-09" },
  { slug: "how-to-write-a-cover-letter",       priority: 0.9, lastModified: "2026-01-05" },
  { slug: "cv-skills-examples",                priority: 0.8, lastModified: "2025-12-20" },
  // Summaries & statements
  { slug: "resume-summary-examples",           priority: 0.8, lastModified: "2025-12-18" },
  { slug: "cv-personal-statement-examples",    priority: 0.8, lastModified: "2025-12-18" },
  // Career levels
  { slug: "graduate-cv-no-experience",         priority: 0.9, lastModified: "2026-01-04" },
  { slug: "internship-cv-example",             priority: 0.8, lastModified: "2025-12-10" },
  { slug: "career-change-cv-example",          priority: 0.8, lastModified: "2025-12-12" },
  { slug: "executive-cv-example",              priority: 0.8, lastModified: "2025-12-14" },
  // Cover letters
  { slug: "cover-letter-example-uk",           priority: 0.9, lastModified: "2026-01-03" },
  // Role-specific
  { slug: "software-engineer-cv-example",      priority: 0.8, lastModified: "2025-12-08" },
  { slug: "nurse-cv-example",                  priority: 0.8, lastModified: "2025-12-06" },
  { slug: "teacher-cv-example",                priority: 0.8, lastModified: "2025-12-05" },
  { slug: "project-manager-cv-example",        priority: 0.8, lastModified: "2025-12-04" },
  { slug: "data-analyst-cv-example",           priority: 0.8, lastModified: "2025-12-03" },
  { slug: "marketing-manager-cv-example",      priority: 0.8, lastModified: "2025-12-02" },
  { slug: "accountant-cv-example",             priority: 0.8, lastModified: "2025-12-01" },
  { slug: "sales-cv-example",                  priority: 0.8, lastModified: "2025-11-28" },
  { slug: "product-manager-resume",            priority: 0.8, lastModified: "2025-11-26" },
  // Country guides
  { slug: "resume-format-usa",                 priority: 0.9, lastModified: "2026-01-02" },
  { slug: "cv-format-australia",               priority: 0.8, lastModified: "2025-11-20" },
  { slug: "cv-format-canada",                  priority: 0.8, lastModified: "2025-11-18" },
  { slug: "cv-format-south-africa",            priority: 0.8, lastModified: "2025-11-15" },
  { slug: "cv-format-uae",                     priority: 0.8, lastModified: "2025-11-12" },
  { slug: "cv-format-india",                   priority: 0.8, lastModified: "2025-11-10" },
  { slug: "cv-format-nigeria",                 priority: 0.8, lastModified: "2025-11-08" },
  { slug: "cv-format-kenya",                   priority: 0.8, lastModified: "2025-11-06" },
  { slug: "cv-format-germany",                 priority: 0.8, lastModified: "2025-11-04" },
  { slug: "cv-format-singapore",               priority: 0.8, lastModified: "2025-11-02" },
  { slug: "cv-format-new-zealand",             priority: 0.8, lastModified: "2025-10-30" },
  { slug: "cv-format-ghana",                   priority: 0.8, lastModified: "2025-10-28" },
  // More role-specific
  { slug: "hr-cv-example",                     priority: 0.8, lastModified: "2025-10-25" },
  { slug: "customer-service-cv-example",       priority: 0.8, lastModified: "2025-10-22" },
  { slug: "graphic-designer-resume",           priority: 0.8, lastModified: "2025-10-20" },
  { slug: "administrative-assistant-resume",   priority: 0.8, lastModified: "2025-10-18" },
  // LinkedIn & personal branding
  { slug: "linkedin-summary-examples",         priority: 0.8, lastModified: "2025-10-15" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`,          lastModified: new Date("2026-04-14"), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/guides`,   lastModified: new Date("2026-01-10"), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/privacy`,  lastModified: new Date("2025-06-01"), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const guidePages: MetadataRoute.Sitemap = guides.map(({ slug, priority, lastModified }) => ({
    url: `${SITE_URL}/guides/${slug}`,
    lastModified: new Date(lastModified),
    changeFrequency: "monthly" as const,
    priority,
  }));

  return [...staticPages, ...guidePages];
}
