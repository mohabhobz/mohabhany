import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CaseStudyView } from "@/components/CaseStudyView";
import { getProject, getStudy, listStudies } from "@/lib/storage";

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
  return { doc, project, siblings };
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

  return <CaseStudyView initial={data.doc} project={data.project} siblings={data.siblings} />;
}
