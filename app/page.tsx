import { promises as fs } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { listProjects, listStudies } from "@/lib/storage";
import { HomeView } from "@/components/HomeView";
import type { Site } from "@/lib/site";
import { readAllProjectAr } from "@/lib/project-ar";

/* Static. This page is built from JSON on disk, so there is nothing at
   request time that a build cannot do just as well. force-dynamic used to
   sit here and it meant every visitor waited for a fresh server render of
   content that changes a few times a month. Rebuild to publish. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-static";

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "content", file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    /* The Arabic file is allowed not to exist. The site is English-first
       and the switch simply has nothing to switch to until it does. */
    return null;
  }
}

export default async function Home() {
  const [site, siteAr, projects, studies] = await Promise.all([
    readJson<Site>("site.json"),
    readJson<Partial<Site>>("site.ar.json"),
    listProjects(),
    listStudies(),
  ]);

  if (!site) throw new Error("content/site.json is missing");

  /* Card names and lines come from the project files, not from site.json,
     so the Arabic for them has to be loaded here too or the board stays
     English while everything around it switches. */
  const projectsAr = await readAllProjectAr(projects.map((p) => p.slug));

  return (
    <HomeView
      site={site} siteAr={siteAr}
      projects={projects} projectsAr={projectsAr}
      studies={studies}
    />
  );
}
