/**
 * Single source of truth for career category detection.
 *
 * Experience (title seniority + role count + years) is the PRIMARY basis.
 * Hard count gates enforce this: you need enough roles to justify the layout.
 * All other sections (board roles, publications, skills, etc.) are secondary
 * confirmations — they can tip a borderline profile but cannot override a
 * weak experience base.
 *
 * Category thresholds:
 *   score >= 60  → executive
 *   score >= 30  → mid-senior
 *   else         → junior
 *
 * Hard gates (applied after scoring):
 *   0 experiences            → always junior
 *   1-2 exp, no exec title   → capped at junior (29)
 *   1-4 exp                  → capped at mid-senior (59)
 */

export type CareerCategory = "junior" | "mid-senior" | "executive";

// ─── Regex patterns ────────────────────────────────────────────────────────

const EXEC_TITLES = /\b(chief|ceo|cfo|cto|coo|cio|cmo|cpo|president|vice\s*president|vp|managing\s*director|md|executive\s*director|group\s*director|partner|head\s*of|country\s*manager|regional\s*director|general\s*manager|gm|board\s*member|chairman|chairperson)\b/i;
const MID_TITLES  = /\b(senior|sr\.?|lead|manager|director|team\s*lead|principal|supervisor|coordinator|specialist|consultant|architect|associate\s*director)\b/i;
const JUNIOR_TITLES = /\b(junior|jr\.?|intern|trainee|entry|assistant|graduate|apprentice|associate|analyst|officer|clerk|attachment|industrial\s*training)\b/i;

const EXEC_SCOPE = /\b(p&l|profit\s*and\s*loss|board|strategy|transformation|million|billion|revenue|shareholder|governance|merger|acquisition|m&a|ipo|fundrais|c-suite|enterprise-wide|group-wide|multi-?country|global\s*(?:operations|strategy|team))\b/i;
const MID_SCOPE  = /\b(managed\s*(?:a\s*)?team|budget|cross-functional|department|division|portfolio|stakeholder|kpi|roadmap|mentored|coached|process\s*improvement|implemented|scaled|grew\s*(?:team|revenue))\b/i;

const ADVANCED_DEGREE = /\b(mba|m\.?b\.?a|phd|ph\.?d|doctorate|masters?|m\.?sc|m\.?a\.?|executive\s*(program|education)|emba)\b/i;

// ─── Years-of-experience helper ────────────────────────────────────────────

function calcYearsOfExperience(experiences: any[]): number {
  let totalMonths = 0;
  for (const exp of experiences) {
    const start = exp?.startDate || exp?.start_date || "";
    const end   = exp?.endDate   || exp?.end_date   || "";
    if (!start) continue;

    const parseDate = (s: string): Date | null => {
      if (!s) return null;
      if (/present|current|now|ongoing|to\s*date|till\s*date/i.test(s)) return new Date();

      const MONTHS: Record<string, number> = {
        jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11,
        january:0, february:1, march:2, april:3, june:5, july:6, august:7,
        september:8, october:9, november:10, december:11,
      };

      // Extract a 4-digit year anywhere in the string
      const yearMatch = s.match(/\b(19|20)\d{2}\b/);
      if (!yearMatch) return null;
      const year = parseInt(yearMatch[0], 10);

      // Try to find a month name anywhere (e.g. "Jan 2020", "2020 January", "01-Jan-2020")
      const monthNameMatch = s.match(/\b([A-Za-z]{3,9})\b/);
      if (monthNameMatch) {
        const m = MONTHS[monthNameMatch[1].toLowerCase()];
        if (m !== undefined) return new Date(year, m);
      }

      // Try MM/YYYY, MM-YYYY, YYYY/MM, YYYY-MM
      const numParts = s.replace(/[^\d]+/g, " ").trim().split(/\s+/).filter(Boolean);
      if (numParts.length >= 2) {
        const [a, b] = numParts.map(Number);
        if (a >= 1 && a <= 12 && b > 1000) return new Date(b, a - 1);  // MM YYYY
        if (b >= 1 && b <= 12 && a > 1000) return new Date(a, b - 1);  // YYYY MM
      }

      // Year only
      return new Date(year, 0);
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

export function detectCategory(cvData: Record<string, unknown>): CareerCategory {
  const experiences    = Array.isArray(cvData.experiences)       ? cvData.experiences       as any[] : [];
  const education      = Array.isArray(cvData.education)          ? cvData.education          as any[] : [];
  const boardRoles     = Array.isArray(cvData.boardRoles)         ? cvData.boardRoles         as any[] : [];
  const publications   = Array.isArray(cvData.publications)       ? cvData.publications       as any[] : [];
  const execTraining   = Array.isArray(cvData.executiveTraining)  ? cvData.executiveTraining  as any[] : [];
  const achievements   = Array.isArray(cvData.keyAchievements)    ? cvData.keyAchievements    as any[] : [];
  const skills         = Array.isArray(cvData.skills)             ? cvData.skills             as any[] : [];
  const certifications = Array.isArray(cvData.certifications)     ? cvData.certifications     as any[] : [];
  const languages      = Array.isArray(cvData.languages)          ? cvData.languages          as any[] : [];

  // ── No experience at all → always junior ──
  if (experiences.length === 0) return "junior";

  let score = 0;

  // ════════════════════════════════════════════════════════════
  // PRIMARY: Experience (titles + count + years) — max 80 pts
  // These three together determine the base category.
  // ════════════════════════════════════════════════════════════

  // 1. Title seniority (max 40 pts)
  let execTitleCount = 0, midTitleCount = 0;
  for (const exp of experiences) {
    const t = exp?.title || exp?.jobTitle || "";
    if (EXEC_TITLES.test(t))        execTitleCount++;
    else if (MID_TITLES.test(t))    midTitleCount++;
  }
  if      (execTitleCount >= 2)  score += 40;
  else if (execTitleCount === 1) score += 32;
  else if (midTitleCount >= 3)   score += 24;
  else if (midTitleCount >= 1)   score += 16;
  else                           score += 8;  // titles exist but unrecognised

  // 2. Role count — career depth (max 25 pts)
  if      (experiences.length >= 6) score += 25;
  else if (experiences.length >= 4) score += 18;
  else if (experiences.length >= 3) score += 12;
  else if (experiences.length >= 2) score += 6;
  else                              score += 2;  // single role

  // 3. Years of experience (max 15 pts)
  const yearsExp = calcYearsOfExperience(experiences);
  let yearsPoints = 0;
  if      (yearsExp >= 15) yearsPoints = 15;
  else if (yearsExp >= 10) yearsPoints = 11;
  else if (yearsExp >= 6)  yearsPoints = 7;
  else if (yearsExp >= 3)  yearsPoints = 4;
  else if (yearsExp >= 1)  yearsPoints = 2;
  score += yearsPoints;

  // Track primary score (title + count + years) to use in clearlyExecutive gate below
  const primaryScore = score;

  // ════════════════════════════════════════════════════════════
  // SECONDARY: Role content & other sections — max 35 pts
  // Can confirm a borderline profile; cannot override a weak experience base.
  // ════════════════════════════════════════════════════════════

  // 4. Scope / responsibility keywords in role descriptions (max 12 pts)
  let execScopeHits = 0, midScopeHits = 0;
  for (const exp of experiences) {
    const desc = exp?.description || "";
    if (EXEC_SCOPE.test(desc)) execScopeHits++;
    if (MID_SCOPE.test(desc))  midScopeHits++;
  }
  if      (execScopeHits >= 2)  score += 12;
  else if (execScopeHits === 1) score += 8;
  else if (midScopeHits >= 2)   score += 6;
  else if (midScopeHits === 1)  score += 3;

  // 5. Board roles (max 8 pts)
  if      (boardRoles.length >= 2) score += 8;
  else if (boardRoles.length === 1) score += 5;

  // 6. Education (max 5 pts)
  if (education.some((e: any) => ADVANCED_DEGREE.test(e?.degree || ""))) score += 5;
  else if (education.length > 0) score += 2;

  // 7. Publications (max 4 pts)
  if      (publications.length >= 2) score += 4;
  else if (publications.length === 1) score += 2;

  // 8. Executive training (max 3 pts)
  if      (execTraining.length >= 2) score += 3;
  else if (execTraining.length === 1) score += 2;

  // 9. Achievements, skills, certifications (max 3 pts total — tiebreaker only)
  if (achievements.length >= 3)    score += 1;
  if (skills.length >= 6)          score += 1;
  if (certifications.length >= 1)  score += 1;

  // ════════════════════════════════════════════════════════════
  // GATE 1 — EXPERIENCE COUNT (primary basis)
  // ════════════════════════════════════════════════════════════

  // 1-2 jobs with no executive title → junior
  if (experiences.length <= 2 && execTitleCount === 0) {
    score = Math.min(score, 29);
  }

  // Fewer than 5 jobs → cannot be executive
  if (experiences.length < 5) {
    score = Math.min(score, 59);
  }

  // ════════════════════════════════════════════════════════════
  // GATE 2 — CONTENT VOLUME (second filter, avoids blank pages)
  // Junior  = 1 page → base sections only; no multi-section extras needed
  // Mid-Sr  = 2 pages → needs meaningful content beyond the basics
  // Exec    = 3 pages → needs rich multi-section content to fill all pages
  //
  // Count sections that carry content beyond the base (exp + edu + skills).
  // ════════════════════════════════════════════════════════════

  // Sections that add content to page 2 (mid-senior extras)
  const page2Sections = [
    achievements.length > 0,
    certifications.length > 0,
    languages.length > 0,
    Array.isArray(cvData.projects)     && (cvData.projects     as any[]).length > 0,
    Array.isArray(cvData.awards)       && (cvData.awards       as any[]).length > 0,
    Array.isArray(cvData.memberships)  && (cvData.memberships  as any[]).length > 0,
    Array.isArray(cvData.tools)        && (cvData.tools        as any[]).length > 0,
  ].filter(Boolean).length;

  // Sections that add content to page 3 (executive extras)
  const page3Sections = [
    boardRoles.length > 0,
    publications.length > 0,
    execTraining.length > 0,
  ].filter(Boolean).length;

  // Mid-senior needs page-2 content, but only cap junior if experience is also weak.
  // Strong experience (10+ years, exec title, or 2+ mid titles) overrides the volume gate —
  // a lean CV from a senior professional is still mid-senior.
  const strongExperience = execTitleCount >= 1 || yearsExp >= 10 || midTitleCount >= 2 || (yearsExp >= 7 && midTitleCount >= 1);
  if (page2Sections < 2 && !strongExperience) {
    score = Math.min(score, 29);
  }

  // Executive needs at least 2 page-3 sections to avoid a mostly-blank third page.
  // Exception: if primary factors (title + count + years) alone score ≥ 60, the
  // profile is unambiguously executive — no board/pub/training needed to confirm it.
  const clearlyExecutive = primaryScore >= 60;
  if (page3Sections < 2 && !clearlyExecutive) {
    score = Math.min(score, 59);
  }

  // ── Determine category ──
  if (score >= 60) return "executive";
  if (score >= 30) return "mid-senior";
  return "junior";
}
