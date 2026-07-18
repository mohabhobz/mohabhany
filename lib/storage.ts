/* ============================================================
   STORAGE ROUTER
   Local JSON files while building; Supabase once configured.
   Components call these and never know which store is behind them.
   ============================================================ */

import type { CaseStudy, Project } from "./types";
import { isSupabaseConfigured } from "./supabase";
import {
  localCreateProject, localCreateStudy, localDeleteProject, localDeleteStudy,
  localGetProject, localGetStudy, localListProjects, localListStudies,
  localSaveProject, localSaveStudy, localUpload,
} from "@/app/actions";
import {
  sbDeleteProject, sbDeleteStudy, sbGetProject, sbGetStudy, sbListProjects,
  sbListStudies, sbSaveProject, sbSaveStudy, sbUpload,
} from "./case-studies";

export const USING_SUPABASE = isSupabaseConfigured;

/* projects */
export const listProjects = (): Promise<Project[]> =>
  USING_SUPABASE ? sbListProjects() : localListProjects();

export const getProject = (slug: string): Promise<Project | null> =>
  USING_SUPABASE ? sbGetProject(slug) : localGetProject(slug);

export const saveProject = (p: Project): Promise<string | null> =>
  USING_SUPABASE ? sbSaveProject(p) : localSaveProject(p);

export const createProject = (name: string): Promise<string | null> =>
  USING_SUPABASE ? sbSaveProject({
    slug: name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    name: name.trim(), logo: "", description: "",
  }) : localCreateProject(name);

export const deleteProject = (slug: string): Promise<string | null> =>
  USING_SUPABASE ? sbDeleteProject(slug) : localDeleteProject(slug);

/* case studies */
export const listStudies = (projectSlug?: string): Promise<CaseStudy[]> =>
  USING_SUPABASE ? sbListStudies(projectSlug) : localListStudies(projectSlug);

export const getStudy = (slug: string): Promise<CaseStudy | null> =>
  USING_SUPABASE ? sbGetStudy(slug) : localGetStudy(slug);

export const saveStudy = (c: CaseStudy): Promise<string | null> =>
  USING_SUPABASE ? sbSaveStudy(c) : localSaveStudy(c);

export const createStudy = (projectSlug: string, title: string): Promise<string | null> =>
  USING_SUPABASE
    ? sbSaveStudy({
        slug: `${projectSlug}-${title}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        projectSlug, title, tension: "", meta: [],
        problem: { label: "The problem", body: "" }, sections: [],
        status: "draft", updatedAt: new Date().toISOString(),
      })
    : localCreateStudy(projectSlug, title);

export const deleteStudy = (slug: string): Promise<string | null> =>
  USING_SUPABASE ? sbDeleteStudy(slug) : localDeleteStudy(slug);

/* media */
export async function uploadFile(file: File): Promise<{ url?: string; error?: string }> {
  if (USING_SUPABASE) return sbUpload(file);
  const form = new FormData();
  form.append("file", file);
  return localUpload(form);
}
