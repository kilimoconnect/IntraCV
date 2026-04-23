/**
 * normalizeDate — converts any date string to a consistent "MMM YYYY" format.
 *
 * Input formats handled:
 *   "January 2020" / "Jan 2020"     → "Jan 2020"
 *   "01/2020" / "1/2020"            → "Jan 2020"
 *   "01-2020" / "01.2020"           → "Jan 2020"
 *   "2020-01" / "2020/01"           → "Jan 2020"
 *   "2020"                          → "2020"   (year-only kept as is)
 *   "Present" / "Current" / "Now" / "Ongoing" / "Till Date" / … → "Present"
 *   Anything unrecognised            → returned unchanged
 *
 * All rendered date fields across CV templates and the CV engine should
 * pass their raw value through this function so the final PDF shows a
 * uniform date style regardless of how the data was entered or extracted.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTH_MAP: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

const SHORT_MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  // common alternates
  sept: 8,
};

const ONGOING_KEYWORDS = new Set([
  "present", "current", "now", "ongoing", "till date", "to date",
  "up to date", "today", "continues", "date", "till present",
  "to present", "currently",
]);

function resolveMonthName(name: string): number {
  const lower = name.toLowerCase().replace(/\.$/, ""); // strip trailing dot
  if (lower in FULL_MONTH_MAP) return FULL_MONTH_MAP[lower];
  if (lower in SHORT_MONTH_MAP) return SHORT_MONTH_MAP[lower];
  // Try first 3 chars for any partial abbreviation
  const prefix = lower.slice(0, 3);
  return SHORT_MONTH_MAP[prefix] ?? -1;
}

export function normalizeDate(raw: string | undefined | null): string {
  if (!raw) return raw ?? "";
  const s = raw.trim();
  if (!s) return s;

  // ── Ongoing / present keywords ────────────────────────────────────────────
  if (ONGOING_KEYWORDS.has(s.toLowerCase())) return "Present";

  // ── "Month YYYY" or "Mon YYYY" ────────────────────────────────────────────
  const monthNameYear = s.match(/^([A-Za-z]+\.?)\s+(\d{4})$/);
  if (monthNameYear) {
    const mIdx = resolveMonthName(monthNameYear[1]);
    const year = monthNameYear[2];
    if (mIdx !== -1 && year) return `${MONTHS[mIdx]} ${year}`;
  }

  // ── MM/YYYY  MM-YYYY  MM.YYYY  (1 or 2 digit month) ─────────────────────
  const mmYYYY = s.match(/^(\d{1,2})[\/\-\.](\d{4})$/);
  if (mmYYYY) {
    const m = parseInt(mmYYYY[1], 10);
    if (m >= 1 && m <= 12) return `${MONTHS[m - 1]} ${mmYYYY[2]}`;
  }

  // ── YYYY/MM  YYYY-MM  YYYY.MM ────────────────────────────────────────────
  const yyyyMM = s.match(/^(\d{4})[\/\-\.](\d{1,2})$/);
  if (yyyyMM) {
    const m = parseInt(yyyyMM[2], 10);
    if (m >= 1 && m <= 12) return `${MONTHS[m - 1]} ${yyyyMM[1]}`;
  }

  // ── Year only ─────────────────────────────────────────────────────────────
  if (/^\d{4}$/.test(s)) return s;

  // ── Fallback: return original (already normalised, or unrecognised) ───────
  return s;
}

/**
 * Convenience helper — normalise both ends of a date range and join them.
 * Returns e.g. "Jan 2020 – Present" or "Jan 2018 – Dec 2022".
 */
export function normalizeDateRange(
  start: string | undefined | null,
  end: string | undefined | null,
  separator = " – "
): string {
  const left  = normalizeDate(start);
  const right = normalizeDate(end);
  if (left && right) return `${left}${separator}${right}`;
  return left || right || "";
}
