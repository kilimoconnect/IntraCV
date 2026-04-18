import { MetadataRoute } from "next";

const SITE_URL = "https://fusecv.com";

const guides: { slug: string; priority: number }[] = [
  // Core guides
  { slug: "how-to-write-a-cv",              priority: 1.0 },
  { slug: "best-cv-format-uk",              priority: 0.9 },
  { slug: "cv-vs-resume",                   priority: 0.9 },
  { slug: "ats-cv-checker",                 priority: 0.9 },
  { slug: "improve-cv-fast",                priority: 0.9 },
  { slug: "why-not-getting-interviews",     priority: 0.9 },
  { slug: "how-long-should-a-cv-be",        priority: 0.9 },
  { slug: "employment-gaps-cv",             priority: 0.8 },
  // Career levels
  { slug: "graduate-cv-no-experience",      priority: 0.9 },
  { slug: "executive-cv-example",           priority: 0.8 },
  { slug: "career-change-cv-example",       priority: 0.8 },
  // Summaries & statements
  { slug: "resume-summary-examples",        priority: 0.8 },
  { slug: "cv-personal-statement-examples", priority: 0.8 },
  // Cover letters
  { slug: "cover-letter-example-uk",        priority: 0.9 },
  // Role-specific
  { slug: "software-engineer-cv-example",   priority: 0.8 },
  { slug: "nurse-cv-example",               priority: 0.8 },
  { slug: "project-manager-cv-example",     priority: 0.8 },
  { slug: "data-analyst-cv-example",        priority: 0.8 },
  // Country guides
  { slug: "resume-format-usa",              priority: 0.9 },
  { slug: "cv-format-australia",            priority: 0.8 },
  { slug: "cv-format-canada",               priority: 0.8 },
  { slug: "cv-format-south-africa",         priority: 0.8 },
  { slug: "cv-format-uae",                  priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/landing`,  lastModified: now, changeFrequency: "monthly", priority: 1.0 },
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
