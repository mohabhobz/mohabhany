import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CaseStudyView } from "@/components/CaseStudyView";
import { getProject, getStudy, listStudies } from "@/lib/storage";

export const dynamic = "force-dynamic";

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
  return {
    title: doc.seo?.title || `${project.name} — ${doc.title}`,
    description: doc.seo?.description || project.description,
    openGraph: {
      title: doc.seo?.title || `${project.name} — ${doc.title}`,
      description: doc.seo?.description || project.description,
      images: doc.seo?.ogImage ? [doc.seo.ogImage] : undefined,
    },
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
