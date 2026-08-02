import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CaseStudyView } from "@/components/CaseStudyView";
import { getProject, getStudy, listStudies } from "@/lib/storage";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { DocAr } from "@/lib/i18n-doc";
import { readProjectAr } from "@/lib/project-ar";

/* The Arabic for one study, if it has been written. Absent is a normal
   state, not an error: a study with no Arabic file simply stays English
   when the page is switched, rather than emptying out. */
async function readAr(slug: string): Promise<DocAr | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "content", "case-studies", `${slug}.ar.json`), "utf8");
    return JSON.parse(raw) as DocAr;
  } catch { return null; }
}

/* Prerendered, one file per published study. generateStaticParams below
   lists them at build time, so a case study arrives from the CDN as HTML
   instead of being rendered per visit. */
export const dynamic = "force-static";

/* Every published study, baked at build. Drafts are absent from this list
   and 404 at runtime, so an unpublished URL stays unguessable. */
export async function generateStaticParams() {
  const all = await listStudies();
  return all
    .filter((s) => s.status === "published")
    .map((s) => ({ slug: s.slug }));
}

async function load(slug: string) {
  const doc = await getStudy(slug);
  /* Drafts are not on the internet. Same 404 as a slug that does not exist,
     so an unpublished URL cannot be distinguished from a made-up one. */
  if (!doc || doc.status !== "published") return null;

  const project = await getProject(doc.projectSlug);
  if (!project) return null;

  const siblings = (await listStudies(doc.projectSlug)).filter((c) => c.status === "published");
  /* One file per sibling, because switching between studies inside a
     project is a local state swap and the Arabic has to already be on
     the page for that to stay instant. */
  const studyAr = Object.fromEntries(
    await Promise.all(siblings.map(async (c) => [c.slug, await readAr(c.slug)] as const)),
  ) as Record<string, DocAr | null>;

  /* The project header is the same words as the card on the landing page,
     so it is read from the project file rather than repeated in each of
     that project's studies. Merged in here so the view sees one object. */
  const projectAr = await readProjectAr(doc.projectSlug);
  const ar = Object.fromEntries(
    Object.entries(studyAr).map(([slug, d]) => [slug, { ...(d ?? {}), project: projectAr ?? undefined }]),
  ) as Record<string, DocAr | null>;

  return { doc, project, siblings, ar };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { doc, project } = data;
  const title = doc.seo?.title || `${project.name} — ${doc.title}`;
  const description = doc.seo?.description || project.description;
  /* Its own address, not the one inherited from the layout. A page that
     names the home page as its canonical is asking not to be indexed. */
  const url = `/case-study/${doc.slug}`;
  /* Falls back to the site card rather than nothing: a case study shared
     with no image is a grey box in every chat app. */
  const image = doc.seo?.ogImage || project.card?.src || "/og.jpg";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CaseStudyPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();

  return <CaseStudyView initial={data.doc} project={data.project} siblings={data.siblings} ar={data.ar} />;
}
