import { listProjects, listStudies } from "@/lib/storage";
import { readProjectAr } from "@/lib/project-ar";
import type { LoadingLabels } from "@/components/ui/Loading";

/**
 * The sentence the loading screen shows for each case study, built on the
 * server so the client never fetches anything just to name a page.
 *
 * Named after the PROJECT, not the study. Opening any Nawy study reads
 * "Loading Nawy Case Studies", because the visitor picked Nawy from the
 * board and Nawy is what they are getting.
 *
 * The plural counts published studies IN THAT PROJECT: Nawy has a website
 * and a mobile study, so it is plural whichever one was clicked; a project
 * with a single study stays singular. Drafts do not count, because a draft
 * has no public page and promising two studies when one is a draft would
 * be a small lie told by an animation.
 *
 * Both languages are built here and shipped together. The overlay is raised
 * the instant a link is pressed, before any request, so there is nowhere
 * later to go and fetch the Arabic from: it has to already be on the page.
 * Two short strings per study is a cheap way to buy that.
 *
 * Arabic has no plural switch on the noun here. "حالة دراسية" and "حالات
 * دراسية" would need the count in front to read correctly, and a number
 * mid-sentence in a typing animation reads as a bug rather than a fact, so
 * the Arabic states the project and the section and stops.
 */
export async function loadingLabels(): Promise<LoadingLabels> {
  const [projects, studies] = await Promise.all([listProjects(), listStudies()]);
  const live = studies.filter((s) => s.status === "published");

  const arNames = Object.fromEntries(
    await Promise.all(projects.map(async (p) => [p.slug, (await readProjectAr(p.slug))?.name] as const)),
  ) as Record<string, string | undefined>;

  const labels: LoadingLabels = {};
  for (const s of live) {
    const project = projects.find((p) => p.slug === s.projectSlug);
    if (!project) continue;
    const count = live.filter((x) => x.projectSlug === s.projectSlug).length;
    labels[s.slug] = {
      en: `Loading ${project.name} Case ${count === 1 ? "Study" : "Studies"}`,
      ar: `جاري تحميل ${arNames[project.slug] ?? project.name}`,
    };
  }
  return labels;
}
