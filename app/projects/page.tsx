import { listProjects, listStudies } from "@/lib/storage";
import { ProjectsAdmin } from "@/components/editor/ProjectsAdmin";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, studies] = await Promise.all([listProjects(), listStudies()]);
  return <ProjectsAdmin projects={projects} studies={studies} />;
}
