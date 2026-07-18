import { notFound } from "next/navigation";
import { CaseStudyEditor } from "@/components/editor/CaseStudyEditor";
import { getProject, getStudy, listStudies } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function CaseStudyPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getStudy(slug);
  if (!doc) notFound();

  const project = (await getProject(doc.projectSlug)) ?? {
    slug: doc.projectSlug, name: doc.projectSlug, logo: "", description: "",
  };
  const siblings = await listStudies(doc.projectSlug);

  return <CaseStudyEditor initial={doc} project={project} siblings={siblings} />;
}
