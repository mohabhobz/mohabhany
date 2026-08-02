/* ============================================================
   TRANSLATING A DOCUMENT

   A case study is a tree of sections, rows, cells and blocks. The
   Arabic version is not a second copy of that tree: it is a flat map
   from block id to the words in that block.

   Keyed by id, not by position. Positions move every time a block is
   added, and a translation that silently shifts one paragraph up is
   worse than no translation at all. An id that no longer exists is
   ignored; a block with no entry stays in English.
   ============================================================ */

import type { CaseStudy, Project, Block, Section } from "@/lib/types";

/** What a block can have translated. Anything not listed is structure. */
export type BlockText = {
  text?: string;
  caption?: string;
  label?: string;
  alt?: string;
  attribution?: string;
  value?: string;
  items?: string[];
  head?: string[];
  rows?: string[][];
  considered?: { title?: string; body?: string };
  chosen?: { title?: string; body?: string };
  tradeoff?: string;
  meta?: { label?: string; value?: string }[];
};

export type DocAr = {
  title?: string;
  /** Section titles, keyed by section id. */
  sections?: Record<string, string>;
  /** Block content, keyed by block id. */
  blocks?: Record<string, BlockText>;
  /** The project header above the study. */
  project?: { name?: string; slogan?: string; description?: string; role?: string; period?: string; intro?: string };
  seo?: { title?: string; description?: string };
};

const has = (v: unknown) => typeof v === "string" ? v.trim() !== "" : v != null;

function applyBlock(b: Block, tr: BlockText | undefined): Block {
  if (!tr) return b;
  const out = { ...b } as Record<string, unknown>;
  for (const [k, v] of Object.entries(tr)) {
    if (has(v)) out[k] = v;
  }
  return out as Block;
}

function applySections(sections: Section[], doc: DocAr): Section[] {
  return sections.map((sec) => ({
    ...sec,
    title: has(doc.sections?.[sec.id]) ? doc.sections![sec.id] : sec.title,
    rows: sec.rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => cell.map((b) => applyBlock(b, doc.blocks?.[b.id]))),
    })),
  }));
}

export function translateStudy(study: CaseStudy, doc: DocAr | null): CaseStudy {
  if (!doc) return study;
  return {
    ...study,
    title: has(doc.title) ? doc.title! : study.title,
    sections: applySections(study.sections, doc),
    seo: { ...study.seo, ...(doc.seo ?? {}) },
  };
}

export function translateProject(project: Project, doc: DocAr | null): Project {
  if (!doc?.project) return project;
  const p = doc.project;
  return {
    ...project,
    name:        has(p.name)        ? p.name!        : project.name,
    slogan:      has(p.slogan)      ? p.slogan!      : project.slogan,
    description: has(p.description) ? p.description! : project.description,
    role:        has(p.role)        ? p.role!        : project.role,
    period:      has(p.period)      ? p.period!      : project.period,
    intro:       has(p.intro)       ? p.intro!       : project.intro,
    sections:    project.sections ? applySections(project.sections, doc) : project.sections,
  };
}
