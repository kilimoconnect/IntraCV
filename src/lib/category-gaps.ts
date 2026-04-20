import type { CareerCategory } from "./detect-category";

export function getCategoryGaps(category: CareerCategory, cvData: Record<string, unknown>): string[] {
  const required: string[] = [];
  const recommended: string[] = [];

  const pi          = (cvData.personalInfo as any) ?? {};
  const summary     = (cvData.summary as string) ?? "";
  const exps        = Array.isArray(cvData.experiences)      ? cvData.experiences      : [];
  const edu         = Array.isArray(cvData.education)         ? cvData.education         : [];
  const skills      = Array.isArray(cvData.skills)            ? cvData.skills            : [];
  const certs       = Array.isArray(cvData.certifications)    ? cvData.certifications    : [];
  const langs       = Array.isArray(cvData.languages)         ? cvData.languages         : [];
  const refs        = Array.isArray(cvData.referees)          ? cvData.referees          : [];
  const achieve     = Array.isArray(cvData.keyAchievements)   ? cvData.keyAchievements   : [];
  const awards      = Array.isArray(cvData.awards)            ? cvData.awards            : [];
  const projects    = Array.isArray(cvData.projects)          ? cvData.projects          : [];
  const boards      = Array.isArray(cvData.boardRoles)        ? cvData.boardRoles        : [];
  const pubs        = Array.isArray(cvData.publications)      ? cvData.publications      : [];
  const execTrain   = Array.isArray(cvData.executiveTraining) ? cvData.executiveTraining : [];
  const memberships = Array.isArray(cvData.memberships)       ? cvData.memberships       : [];
  const tools       = Array.isArray(cvData.tools)             ? cvData.tools             : [];
  const volunteer   = Array.isArray(cvData.volunteer)         ? cvData.volunteer         : [];

  // ── Required for all categories ──
  if (!summary.trim())      required.push("No professional summary — add one to introduce yourself");
  if (!pi.linkedin?.trim()) required.push("Missing LinkedIn URL");
  if (edu.length === 0 && certs.length === 0) required.push("No education entries added");
  if (skills.length === 0)  required.push("No skills listed");
  if (refs.length === 0)    required.push("No referees added");

  if (category === "junior") {
    if (exps.length === 0)      required.push("No work experience added — even internships count");
    if (certs.length === 0)     required.push("No certifications listed");
    if (langs.length === 0)     required.push("No languages listed");
    if (projects.length === 0)  recommended.push("No projects — add personal or academic projects to stand out");
    if (memberships.length === 0) recommended.push("No memberships or associations listed");
    if (tools.length === 0)     recommended.push("No tools & software listed");
    if (volunteer.length === 0) recommended.push("No volunteer experience listed");
  }

  if (category === "mid-senior") {
    if (exps.length < 3)       required.push(`Only ${exps.length} experience entr${exps.length === 1 ? "y" : "ies"} — mid-senior CVs typically show 3–6 roles`);
    if (achieve.length === 0)  required.push("No key achievements listed — critical at mid-senior level");
    if (certs.length === 0)    required.push("No certifications listed");
    if (langs.length === 0)    required.push("No languages listed");
    if (awards.length === 0)   recommended.push("No awards or recognition listed");
    if (memberships.length === 0) recommended.push("No professional memberships or associations");
    if (tools.length === 0)    recommended.push("No tools & software listed");
    if (projects.length === 0) recommended.push("No projects listed — strengthens technical depth");
  }

  if (category === "executive") {
    if (exps.length < 5)       required.push(`Only ${exps.length} experience entr${exps.length === 1 ? "y" : "ies"} — executive CVs typically show 5+ roles`);
    if (achieve.length === 0)  required.push("No key achievements listed — essential for executive profiles");
    if (boards.length === 0)   required.push("No board roles — add any board or advisory positions");
    if (pubs.length === 0 && execTrain.length === 0) required.push("No publications or executive training listed");
    if (certs.length === 0)    required.push("No certifications listed");
    if (langs.length === 0)    required.push("No languages listed");
    if (memberships.length === 0) recommended.push("No professional memberships or associations");
    if (awards.length === 0)   recommended.push("No awards or recognition listed");
    if (tools.length === 0)    recommended.push("No tools & software listed");
  }

  return [
    ...required,
    ...recommended.map(r => `[Recommended] ${r}`),
  ];
}
