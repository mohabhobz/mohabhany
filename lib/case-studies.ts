import { getSupabase } from "./supabase";
import type { CaseStudy, Project } from "./types";

/* ---------- projects ---------- */

export async function sbListProjects(): Promise<Project[]> {
  const { data, error } = await getSupabase()
    .from("projects").select("*").order("order_index", { ascending: true });
  if (error) { console.error("[projects]", error.message); return []; }
  return (data ?? []).map((r) => ({
    slug: r.slug, name: r.name, logo: r.logo ?? "",
    description: r.description ?? "", order: r.order_index ?? 0,
  }));
}

export async function sbGetProject(slug: string): Promise<Project | null> {
  const { data, error } = await getSupabase()
    .from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return {
    slug: data.slug, name: data.name, logo: data.logo ?? "",
    description: data.description ?? "", order: data.order_index ?? 0,
  };
}

export async function sbSaveProject(p: Project): Promise<string | null> {
  const { error } = await getSupabase().from("projects").upsert(
    { slug: p.slug, name: p.name, logo: p.logo ?? null, description: p.description, order_index: p.order ?? 0 },
    { onConflict: "slug" },
  );
  return error ? error.message : null;
}

export async function sbDeleteProject(slug: string): Promise<string | null> {
  const { error } = await getSupabase().from("projects").delete().eq("slug", slug);
  return error ? error.message : null;
}

/* ---------- case studies ---------- */

function toStudy(r: Record<string, unknown>): CaseStudy {
  return {
    slug: r.slug as string,
    projectSlug: r.project_slug as string,
    title: (r.title as string) ?? "",
    tension: (r.tension as string) ?? "",
    meta: (r.meta as CaseStudy["meta"]) ?? [],
    problem: (r.problem as CaseStudy["problem"]) ?? { label: "The problem", body: "" },
    sections: (r.sections as CaseStudy["sections"]) ?? [],
    status: (r.status as CaseStudy["status"]) ?? "draft",
    order: (r.order_index as number) ?? 0,
    updatedAt: (r.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function sbListStudies(projectSlug?: string): Promise<CaseStudy[]> {
  let q = getSupabase().from("case_studies").select("*").order("order_index", { ascending: true });
  if (projectSlug) q = q.eq("project_slug", projectSlug);
  const { data, error } = await q;
  if (error) { console.error("[studies]", error.message); return []; }
  return (data ?? []).map(toStudy);
}

export async function sbGetStudy(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await getSupabase()
    .from("case_studies").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return toStudy(data);
}

export async function sbSaveStudy(c: CaseStudy): Promise<string | null> {
  const { error } = await getSupabase().from("case_studies").upsert(
    {
      slug: c.slug, project_slug: c.projectSlug, title: c.title, tension: c.tension,
      meta: c.meta, problem: c.problem, sections: c.sections,
      status: c.status, order_index: c.order ?? 0,
    },
    { onConflict: "slug" },
  );
  return error ? error.message : null;
}

export async function sbDeleteStudy(slug: string): Promise<string | null> {
  const { error } = await getSupabase().from("case_studies").delete().eq("slug", slug);
  return error ? error.message : null;
}

/* ---------- media ---------- */

export async function sbUpload(file: File): Promise<{ url?: string; error?: string }> {
  const sb = getSupabase();
  const ext = file.name.split(".").pop() ?? "bin";
  const p = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("media").upload(p, file, { cacheControl: "31536000" });
  if (error) return { error: error.message };
  return { url: sb.storage.from("media").getPublicUrl(p).data.publicUrl };
}
