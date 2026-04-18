import { MetadataRoute } from "next";

const SITE_URL = "https://fusecv.com";

const guides = [
  { slug: "best-cv-format-uk",            priority: 0.9 },
  { slug: "ats-cv-checker",               priority: 0.9 },
  { slug: "graduate-cv-no-experience",    priority: 0.9 },
  { slug: "why-not-getting-interviews",   priority: 0.9 },
  { slug: "software-engineer-cv-example", priority: 0.8 },
  { slug: "career-change-cv-example",     priority: 0.8 },
  { slug: "executive-cv-example",         priority: 0.8 },
  { slug: "cover-letter-example-uk",      priority: 0.9 },
  { slug: "improve-cv-fast",              priority: 0.9 },
  { slug: "resume-summary-examples",      priority: 0.8 },
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
    changeFrequency: "monthly",
    priority,
  }));

  return [...staticPages, ...guidePages];
}
