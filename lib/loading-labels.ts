import { listProjects, listStudies } from "@/lib/storage";
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
 */
export async function loadingLabels(): Promise<LoadingLabels> {
  const [projects, studies] = await Promise.all([listProjects(), listStudies()]);
  const live = studies.filter((s) => s.status === "published");

  const labels: LoadingLabels = {};
  for (const s of live) {
    const project = projects.find((p) => p.slug === s.projectSlug);
    if (!project) continue;
    const count = live.filter((x) => x.projectSlug === s.projectSlug).length;
    labels[s.slug] = `Loading ${project.name} Case ${count === 1 ? "Study" : "Studies"}`;
  }
  return labels;
}
