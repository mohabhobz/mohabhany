import type { MetadataRoute } from "next";
import { listStudies } from "@/lib/storage";

const SITE = "https://mohabhany.com";

/* Built from the same source as the pages themselves, so a new case study
   appears in the sitemap by existing rather than by being remembered. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const studies = (await listStudies()).filter((s) => s.status === "published");
  return [
    { url: SITE, lastModified: new Date(), priority: 1 },
    ...studies.map((s) => ({
      url: `${SITE}/case-study/${s.slug}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
      priority: 0.8,
    })),
  ];
}
