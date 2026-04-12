/**
 * Single source of truth for career category detection.
 * Used by both CV Builder and CV Studio to guarantee consistent results.
 *
 * Category thresholds (score out of ~100):
 *   score >= 60  → executive
 *   score >= 30  → mid-senior
 *   else         → junior
 */

export type CareerCategory = "junior" | "mid-senior" | "executive";

// ─── Regex patterns ────────────────────────────────────────────────────────

const EXEC_TITLES = /\b(chief|ceo|cfo|cto|coo|cio|cmo|cpo|president|vice\s*president|vp|managing\s*director|md|executive\s*director|group\s*director|partner|head\s*of|country\s*manager|regional\s*director|general\s*manager|gm|board\s*member|chairman|chairperson)\b/i;
const MID_TITLES  = /\b(senior|sr\.?|lead|manager|director|team\s*lead|principal|supervisor|coordinator|specialist|consultant|architect|head|associate\s*director)\b/i;
const JUNIOR_TITLES = /\b(junior|jr\.?|intern|trainee|entry|assistant|graduate|apprentice|associate|analyst|officer|clerk|attachment|industrial\s*training)\b/i;

const EXEC_SCOPE = /\b(p&l|profit\s*and\s*loss|board|strategy|transformation|million|billion|revenue|shareholder|governance|merger|acquisition|m&a|ipo|fundrais|c-suite|enterprise-wide|group-wide|multi-?country|global\s*(?:operations|strategy|team))\b/i;
const MID_SCOPE  = /\b(managed\s*(?:a\s*)?team|budget|cross-functional|department|division|portfolio|stakeholder|kpi|roadmap|mentored|coached|process\s*improvement|implemented|scaled|grew\s*(?:team|revenue))\b/i;

const ADVANCED_DEGREE = /\b(mba|m\.?b\.?a|phd|ph\.?d|doctorate|masters?|m\.?sc|m\.?a\.?|executive\s*(program|education)|emba)\b/i;

// ─── Years-of-experience helper ────────────────────────────────────────────

/** Compute total years of experience from an array of experience objects. */
function calcYearsOfExperience(experiences: any[]): number {
  let totalMonths = 0;
  for (const exp of experiences) {
    const start = exp?.startDate || exp?.start_date || "";
    const end   = exp?.endDate   || exp?.end_date   || "";
    if (!start) continue;

    const parseDate = (s: string): Date | null => {
      if (!s) return null;
      // "Present" / "Current" → today
      if (/present|current/i.test(s)) return new Date();
      // Try native parse first (handles ISO, "Jan 2020", "2020-01" etc.)
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
      // "MM/YYYY" or "YYYY"
      const parts = s.split(/[\/\-]/);
      if (parts.length === 2) return new Date(parseInt(parts[1]), parseInt(parts[0]) - 1);
      if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return new Date(parseInt(parts[0]), 0);
      return null;
    };

    const s = parseDate(start);
    const e = parseDate(end) ?? new Date();
    if (!s) continue;
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months > 0) totalMonths += months;
  }
  return Math.round(totalMonths / 12);
}

// ─── Main export ───────────────────────────────────────────────────────────

/**
 * Detect the career category from raw CV data.
 *
 * Accepts either:
 *  - the flat `cvData` object used by CV Studio  (keys: experiences, education, …)
 *  - any object that has the same shape
 */
export function detectCategory(cvData: Record<string, unknown>): CareerCategory {
  const experiences   = Array.isArray(cvData.experiences)       ? cvData.experiences       as any[] : [];
  const education     = Array.isArray(cvData.education)          ? cvData.education          as any[] : [];
  const boardRoles    = Array.isArray(cvData.boardRoles)         ? cvData.boardRoles         as any[] : [];
  const publications  = Array.isArray(cvData.publications)       ? cvData.publications       as any[] : [];
  const execTraining  = Array.isArray(cvData.executiveTraining)  ? cvData.executiveTraining  as any[] : [];
  const achievements  = Array.isArray(cvData.keyAchievements)    ? cvData.keyAchievements    as any[] : [];
  const skills        = Array.isArray(cvData.skills)             ? cvData.skills             as any[] : [];
  const certifications = Array.isArray(cvData.certifications)    ? cvData.certifications     as any[] : [];

  let score = 0;

  // ── 1. Title analysis (max 35 pts) ──
  let execTitleCount = 0, midTitleCount = 0, juniorTitleCount = 0;
  for (const exp of experiences) {
    const t = exp?.title || exp?.jobTitle || "";
    if (EXEC_TITLES.test(t))   execTitleCount++;
    else if (MID_TITLES.test(t))   midTitleCount++;
    else if (JUNIOR_TITLES.test(t)) juniorTitleCount++;
  }
  if      (execTitleCount >= 2)  score += 35;
  else if (execTitleCount === 1) score += 28;
  else if (midTitleCount >= 3)   score += 22;
  else if (midTitleCount >= 1)   score += 15;
  else if (juniorTitleCount >= 1) score += 5;
  else if (experiences.length > 0) score += 10; // titles exist but don't match patterns

  // ── 2. Scope / responsibility keywords in descriptions (max 20 pts) ──
  let execScopeHits = 0, midScopeHits = 0;
  for (const exp of experiences) {
    const desc = exp?.description || "";
    if (EXEC_SCOPE.test(desc)) execScopeHits++;
    if (MID_SCOPE.test(desc))  midScopeHits++;
  }
  if      (execScopeHits >= 2) score += 20;
  else if (execScopeHits === 1) score += 14;
  else if (midScopeHits >= 2)  score += 10;
  else if (midScopeHits === 1) score += 6;

  // ── 3. Education (max 10 pts) ──
  if (education.some((e: any) => ADVANCED_DEGREE.test(e?.degree || ""))) score += 10;
  else if (education.length > 0) score += 4;

  // ── 4. Board roles (max 10 pts) ──
  if      (boardRoles.length >= 2) score += 10;
  else if (boardRoles.length === 1) score += 7;

  // ── 5. Publications (max 5 pts) ──
  if      (publications.length >= 2) score += 5;
  else if (publications.length === 1) score += 3;

  // ── 6. Executive training (max 5 pts) ──
  if      (execTraining.length >= 2) score += 5;
  else if (execTraining.length === 1) score += 3;

  // ── 7. Number of roles / career depth (max 10 pts) ──
  if      (experiences.length >= 6) score += 10;
  else if (experiences.length >= 4) score += 7;
  else if (experiences.length >= 2) score += 4;
  else if (experiences.length === 1) score += 2;

  // ── 8. Years of experience — supporting factor only (max 5 pts) ──
  const yearsExp = calcYearsOfExperience(experiences);
  if      (yearsExp >= 15) score += 5;
  else if (yearsExp >= 8)  score += 3;
  else if (yearsExp >= 3)  score += 1;

  // ── 9. Achievements, skills, certifications ──
  if      (achievements.length >= 6)    score += 10;
  else if (achievements.length >= 3)    score += 6;
  else if (achievements.length >= 1)    score += 3;

  if      (skills.length >= 12) score += 6;
  else if (skills.length >= 6)  score += 3;

  if      (certifications.length >= 3) score += 5;
  else if (certifications.length >= 1) score += 2;

  // ── Determine category ──
  if (score >= 60) return "executive";
  if (score >= 30) return "mid-senior";
  return "junior";
}
