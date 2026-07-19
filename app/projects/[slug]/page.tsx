import { notFound } from "next/navigation";
import { CaseStudyEditor } from "@/components/editor/CaseStudyEditor";
import { getProject, listStudies } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Editing a project. The slug here is the PROJECT slug, not a case study:
 * you open a project and the editor gives you tabs for the studies inside
 * it, which is how the work is actually organised.
 */
export default async function EditProjectPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await getProject(slug);
  if (!project) notFound();

  const siblings = await listStudies(slug);
  if (siblings.length === 0) notFound();   // NewProject always makes one

  return <CaseStudyEditor initial={siblings[0]} project={project} siblings={siblings} />;
}
