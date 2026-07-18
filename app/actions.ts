"use server";

/* ============================================================
   LOCAL FILE STORE
   content/projects/<slug>.json
   content/case-studies/<slug>.json
   Media → public/uploads/
   ============================================================ */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { CaseStudy, Project } from "@/lib/types";

const ROOT = process.cwd();
const P_DIR = path.join(ROOT, "content", "projects");
const C_DIR = path.join(ROOT, "content", "case-studies");
const UPLOADS = path.join(ROOT, "public", "uploads");

const ensure = (d: string) => fs.mkdir(d, { recursive: true });
const slugify = (v: string) =>
  v.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");

async function readAll<T>(dir: string): Promise<T[]> {
  try {
    await ensure(dir);
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    return await Promise.all(
      files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8")) as T),
    );
  } catch { return []; }
}

async function readOne<T>(dir: string, slug: string): Promise<T | null> {
  try { return JSON.parse(await fs.readFile(path.join(dir, `${slug}.json`), "utf8")) as T; }
  catch { return null; }
}

/* ---------- projects ---------- */

export async function localListProjects(): Promise<Project[]> {
  const all = await readAll<Project>(P_DIR);
  return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
}

export async function localGetProject(slug: string): Promise<Project | null> {
  return readOne<Project>(P_DIR, slug);
}

export async function localSaveProject(p: Project): Promise<string | null> {
  try {
    await ensure(P_DIR);
    await fs.writeFile(path.join(P_DIR, `${p.slug}.json`), JSON.stringify(p, null, 2), "utf8");
    return null;
  } catch (e) { return e instanceof Error ? e.message : "Could not save project"; }
}

export async function localCreateProject(name: string): Promise<string | null> {
  const slug = slugify(name);
  if (!slug) return "Please give the project a name";
  if (await localGetProject(slug)) return "That project already exists";
  return localSaveProject({ slug, name: name.trim(), logo: "", description: "" });
}

/** Removes the project and every case study inside it. */
export async function localDeleteProject(slug: string): Promise<string | null> {
  try {
    const studies = (await readAll<CaseStudy>(C_DIR)).filter((c) => c.projectSlug === slug);
    await Promise.all(studies.map((c) => fs.unlink(path.join(C_DIR, `${c.slug}.json`))));
    await fs.unlink(path.join(P_DIR, `${slug}.json`));
    return null;
  } catch (e) { return e instanceof Error ? e.message : "Could not delete project"; }
}

/* ---------- case studies ---------- */

export async function localListStudies(projectSlug?: string): Promise<CaseStudy[]> {
  const all = await readAll<CaseStudy>(C_DIR);
  const list = projectSlug ? all.filter((c) => c.projectSlug === projectSlug) : all;
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug));
}

export async function localGetStudy(slug: string): Promise<CaseStudy | null> {
  return readOne<CaseStudy>(C_DIR, slug);
}

export async function localSaveStudy(c: CaseStudy): Promise<string | null> {
  try {
    await ensure(C_DIR);
    const stamped = { ...c, updatedAt: new Date().toISOString() };
    await fs.writeFile(path.join(C_DIR, `${c.slug}.json`), JSON.stringify(stamped, null, 2), "utf8");
    return null;
  } catch (e) { return e instanceof Error ? e.message : "Could not save case study"; }
}

export async function localCreateStudy(projectSlug: string, title: string): Promise<string | null> {
  const slug = slugify(`${projectSlug}-${title}`);
  if (!slug) return "Please give it a title";
  if (await localGetStudy(slug)) return "That case study already exists";

  return localSaveStudy({
    slug, projectSlug,
    title: title.trim() || "Untitled case study",
    tension: "Write the tension in one line — what made this hard.",
    /* Role and Period live on the Project — they are true for the whole
       tenure. A case study only carries what is specific to it. */
    meta: [
      { label: "Shipped", value: "" },
      { label: "Platform", value: "" },
      { label: "Team", value: "" },
    ],
    problem: { label: "The problem", body: "State the problem you found and framed." },
    sections: [], status: "draft", updatedAt: new Date().toISOString(),
  });
}

export async function localDeleteStudy(slug: string): Promise<string | null> {
  try { await fs.unlink(path.join(C_DIR, `${slug}.json`)); return null; }
  catch (e) { return e instanceof Error ? e.message : "Could not delete"; }
}

/* ---------- media ---------- */

export async function localUpload(form: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = form.get("file");
    if (!(file instanceof File)) return { error: "No file received" };
    await ensure(UPLOADS);
    const ext = file.name.split(".").pop() ?? "bin";
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 40).replace(/\.[^.]+$/, "");
    const name = `${Date.now()}-${safe}.${ext}`;
    await fs.writeFile(path.join(UPLOADS, name), Buffer.from(await file.arrayBuffer()));
    return { url: `/uploads/${name}` };
  } catch (e) { return { error: e instanceof Error ? e.message : "Upload failed" }; }
}
