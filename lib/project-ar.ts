import { promises as fs } from "node:fs";
import path from "node:path";
import type { DocAr } from "@/lib/i18n-doc";

export type ProjectAr = NonNullable<DocAr["project"]>;

/* Arabic for a project lives beside the project, not beside a case study.
   The card on the landing page and the header above a study are the same
   words, and a project with three studies would otherwise carry three
   copies of them, free to disagree. */
const DIR = () => path.join(process.cwd(), "content", "projects");

export async function readProjectAr(slug: string): Promise<ProjectAr | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(DIR(), `${slug}.ar.json`), "utf8")) as ProjectAr;
  } catch { return null; }
}

/** Every project's Arabic, keyed by slug. */
export async function readAllProjectAr(slugs: string[]): Promise<Record<string, ProjectAr | null>> {
  const pairs = await Promise.all(slugs.map(async (s) => [s, await readProjectAr(s)] as const));
  return Object.fromEntries(pairs);
}
