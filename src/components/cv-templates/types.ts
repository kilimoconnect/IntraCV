export interface CVTemplateData {
  // 1️⃣ Header Container
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    headline: string;       // Professional title
    tagline?: string;       // Professional tagline
    linkedin: string;
    website: string;
  };
  // 2️⃣ Professional Summary Container
  summary: string;
  // 3️⃣ Core Skills Container
  skills: { name: string; category: string }[];
  // 4️⃣ Professional Experience Container
  experiences: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    description: string;    // bullet achievements separated by newlines
  }[];
  // 5️⃣ Key Achievements Container
  keyAchievements: string[];
  // 6️⃣ Education Container
  education: {
    degree: string;
    institution: string;
    year: string;
    description: string;    // honors, coursework
  }[];
  // 7️⃣ Certifications Container
  certifications: { name: string; issuer: string; year: string }[];
  // 8️⃣ Additional Information Container
  languages: { name: string; proficiency: string }[];
  tools: string[];
  memberships: string[];
  volunteer: string[];
  projects: { name: string; description: string; tech?: string }[];
  interests: string[];
  // Internships (important for junior/career switcher profiles)
  internships: { title: string; company: string; location?: string; startDate: string; endDate: string; description: string }[];
  // 9️⃣ Referees Container (optional)
  referees: { name: string; title: string; company: string; phone: string; email: string }[];
  // 🔟 Declaration Container (optional)
  declaration: { declaration: string; place: string; date: string };
  // 1️⃣1️⃣ Executive / 3-Page Fields
  boardRoles: { title: string; organization: string; startDate: string; endDate: string; description: string }[];
  executiveTraining: { name: string; institution: string; year: string }[];
  publications: { title: string; publisher: string; year: string; type: string }[];
  // Legacy fields
  areasOfExpertise: { name: string; description: string }[];
}

export type TemplateType = "one-page" | "two-page" | "executive";
