// ═══════════════════════════════════════════════════════════
// CV CONSTRAINT ENGINE — Section height estimation & validation
// ═══════════════════════════════════════════════════════════
// Estimates the rendered height (px) of every CV section based on
// data content, font sizes, and available width — without rendering.
// Used by the Pagination Engine to assign sections to pages.
// ═══════════════════════════════════════════════════════════

import { type CategoryCVData } from "./cv-layout-types";
import { FS, LH, GAP, textHeight, bulletsHeight } from "./cv-design-system";

// ── Section Identifiers ──
export type SectionId =
  | "profile" | "skills" | "experience" | "education"
  | "certifications" | "languages" | "references" | "projects"
  | "achievements" | "memberships" | "tools" | "boardRoles"
  | "executiveTraining" | "publications" | "volunteer" | "declaration"
  | "history" | "awards";

// ── Measurement result for one section ──
export interface SectionMeasure {
  id: SectionId;
  fullHeight: number;  // natural height if given unlimited space
  minHeight: number;   // minimum truncated height (heading + 1 item)
  present: boolean;    // whether the section has data at all
}

// ── Heading overhead (common to most sections) ──
const HEADING_H = Math.ceil(FS.lgx * LH.tight) + GAP.heading; // ≈20px

// ═══════════════════════════════════════════════════════════
// MAIN API — measure every section
// ═══════════════════════════════════════════════════════════

/**
 * Estimate the rendered height of every possible section.
 * @param data    - CV data object
 * @param width   - available content width in px (body or sidebar)
 * @returns array of SectionMeasure (one per SectionId, including absent ones)
 */
export function measureAllSections(
  data: CategoryCVData,
  width: number,
): SectionMeasure[] {
  const d = data;
  const w = width;
  const out: SectionMeasure[] = [];

  // ── Profile / Summary ──
  {
    const present = !!d.profile;
    const body = present ? textHeight(d.profile, FS.smt, LH.relaxed, w) : 0;
    const full = present ? HEADING_H + body : 0;
    out.push({ id: "profile", fullHeight: full, minHeight: present ? HEADING_H + 30 : 0, present });
  }

  // ── Skills ──
  {
    const count = d.skills?.length ?? 0;
    if (count > 0) {
      const pillW = 90;
      const perRow = Math.max(1, Math.floor(w / (pillW + GAP.pill)));
      const rows = Math.ceil(count / perRow);
      const full = HEADING_H + rows * 24;
      out.push({ id: "skills", fullHeight: full, minHeight: HEADING_H + 24, present: true });
    } else {
      out.push({ id: "skills", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Experience (top roles) ──
  {
    const exps = d.experience ?? [];
    if (exps.length > 0) {
      let h = HEADING_H;
      for (const exp of exps) {
        h += Math.ceil(FS.md * LH.tight) + 2;  // role line
        h += Math.ceil(FS.smt * LH.tight) + 3;  // company line
        h += bulletsHeight(exp.bullets ?? [], FS.smt, LH.normal, w);
        h += GAP.subsection;
      }
      out.push({ id: "experience", fullHeight: h, minHeight: HEADING_H + 50, present: true });
    } else {
      out.push({ id: "experience", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Education ──
  {
    const edu = d.education ?? [];
    if (edu.length > 0) {
      let h = HEADING_H;
      for (const e of edu) {
        h += Math.ceil(FS.md * LH.tight) + 2;  // degree
        h += Math.ceil(FS.smt * LH.tight) + 2;  // school + year
        if (e.details) h += textHeight(e.details, FS.sm, LH.normal, w);
        h += GAP.item;
      }
      out.push({ id: "education", fullHeight: h, minHeight: HEADING_H + 18, present: true });
    } else {
      out.push({ id: "education", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Certifications ──
  {
    const certs = d.certifications ?? [];
    const present = certs.length > 0;
    const full = present ? HEADING_H + certs.length * 16 : 0;
    out.push({ id: "certifications", fullHeight: full, minHeight: present ? HEADING_H + 16 : 0, present });
  }

  // ── Languages ──
  {
    const langs = d.languages ?? [];
    const present = langs.length > 0;
    const full = present ? HEADING_H + langs.length * 18 : 0;
    out.push({ id: "languages", fullHeight: full, minHeight: present ? HEADING_H + 18 : 0, present });
  }

  // ── References ──
  {
    const refs = d.references ?? [];
    if (refs.length > 0) {
      const cols = Math.min(refs.length, 3);
      const rows = Math.ceil(refs.length / cols);
      const cardH = 65;
      const full = HEADING_H + rows * (cardH + GAP.card);
      out.push({ id: "references", fullHeight: full, minHeight: HEADING_H + cardH, present: true });
    } else {
      out.push({ id: "references", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Projects ──
  {
    const projs = d.projects ?? [];
    if (projs.length > 0) {
      const cardH = 72;
      const cols = Math.min(projs.length, 2);
      const rows = Math.ceil(projs.length / cols);
      const full = HEADING_H + rows * (cardH + GAP.card);
      out.push({ id: "projects", fullHeight: full, minHeight: HEADING_H + cardH, present: true });
    } else {
      out.push({ id: "projects", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Achievements ──
  {
    const achs = d.achievements ?? [];
    if (achs.length > 0) {
      let h = HEADING_H;
      for (const a of achs) {
        h += textHeight(a, FS.smt, LH.normal, w - 14) + 3;
      }
      out.push({ id: "achievements", fullHeight: h, minHeight: HEADING_H + 16, present: true });
    } else {
      out.push({ id: "achievements", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Memberships ──
  {
    const mems = d.memberships ?? [];
    const present = mems.length > 0;
    const full = present ? HEADING_H + mems.length * 14 : 0;
    out.push({ id: "memberships", fullHeight: full, minHeight: present ? HEADING_H + 14 : 0, present });
  }

  // ── Tools ──
  {
    const tools = d.tools ?? [];
    if (tools.length > 0) {
      const perRow = Math.max(1, Math.floor(w / 82));
      const rows = Math.ceil(tools.length / perRow);
      const full = HEADING_H + rows * 22;
      out.push({ id: "tools", fullHeight: full, minHeight: HEADING_H + 22, present: true });
    } else {
      out.push({ id: "tools", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Board Roles (executive) ──
  {
    const br = d.boardRoles ?? [];
    if (br.length > 0) {
      let h = HEADING_H;
      for (const role of br) {
        h += 18 + 12; // title + org
        if (role.description) h += textHeight(role.description, FS.sm, LH.normal, w);
        h += GAP.subsection;
      }
      out.push({ id: "boardRoles", fullHeight: h, minHeight: HEADING_H + 30, present: true });
    } else {
      out.push({ id: "boardRoles", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Executive Training ──
  {
    const et = d.executiveTraining ?? [];
    const present = et.length > 0;
    const full = present ? HEADING_H + et.length * 16 : 0;
    out.push({ id: "executiveTraining", fullHeight: full, minHeight: present ? HEADING_H + 16 : 0, present });
  }

  // ── Publications ──
  {
    const pubs = d.publications ?? [];
    const present = pubs.length > 0;
    const full = present ? HEADING_H + pubs.length * 18 : 0;
    out.push({ id: "publications", fullHeight: full, minHeight: present ? HEADING_H + 18 : 0, present });
  }

  // ── Volunteer ──
  {
    const vols = d.volunteer ?? [];
    if (vols.length > 0) {
      let h = HEADING_H;
      for (const v of vols) {
        h += textHeight(v, FS.smt, LH.normal, w) + 4;
      }
      out.push({ id: "volunteer", fullHeight: h, minHeight: HEADING_H + 16, present: true });
    } else {
      out.push({ id: "volunteer", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Declaration ──
  {
    const present = !!d.declaration?.declaration;
    if (present) {
      const body = textHeight(d.declaration!.declaration, FS.smt, LH.normal, w);
      const full = HEADING_H + body + 16; // +16 for place/date line
      out.push({ id: "declaration", fullHeight: full, minHeight: HEADING_H + 20, present: true });
    } else {
      out.push({ id: "declaration", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── History (continuation experience roles) ──
  {
    const hist = d.history ?? [];
    if (hist.length > 0) {
      let h = HEADING_H;
      for (const exp of hist) {
        h += Math.ceil(FS.md * LH.tight) + 2;
        h += Math.ceil(FS.smt * LH.tight) + 3;
        h += bulletsHeight(exp.bullets ?? [], FS.smt, LH.normal, w);
        h += GAP.subsection;
      }
      out.push({ id: "history", fullHeight: h, minHeight: HEADING_H + 40, present: true });
    } else {
      out.push({ id: "history", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  // ── Awards ──
  {
    const awards = d.awards ?? [];
    if (awards.length > 0) {
      let h = HEADING_H;
      for (const a of awards) {
        h += Math.ceil(FS.md * LH.tight); // title
        if (a.description) h += textHeight(a.description, FS.sm, LH.normal, w);
        h += GAP.item;
      }
      out.push({ id: "awards", fullHeight: h, minHeight: HEADING_H + 14, present: true });
    } else {
      out.push({ id: "awards", fullHeight: 0, minHeight: 0, present: false });
    }
  }

  return out;
}

// ═══════════════════════════════════════════════════════════
// HELPERS — lookup
// ═══════════════════════════════════════════════════════════

/** Build a Map<SectionId, SectionMeasure> from the array. */
export function measureMap(measures: SectionMeasure[]): Map<SectionId, SectionMeasure> {
  const m = new Map<SectionId, SectionMeasure>();
  for (const s of measures) m.set(s.id, s);
  return m;
}

/** Sum fullHeight of the given section IDs. */
export function sumHeights(ids: SectionId[], mmap: Map<SectionId, SectionMeasure>): number {
  let total = 0;
  for (const id of ids) {
    const m = mmap.get(id);
    if (m?.present) total += m.fullHeight + GAP.section;
  }
  return total;
}
