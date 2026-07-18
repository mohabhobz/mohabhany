"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CaseStudy, Project } from "@/lib/types";
import { createStudy, deleteStudy, saveProject, uploadFile } from "@/lib/storage";
import { Btn, DeleteBtn, Editable, Field, Toolbar } from "@/components/editor/ui";
import { SectionsEditor } from "@/components/editor/SectionsEditor";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The project header — name, logo, description — plus the tabs for the
 * case studies inside it. Project data lives here and here only, so a logo
 * change applies to every case study under it.
 */
export function ProjectShell({
  project, studies, currentSlug, currentTitle, editing,
  onRenameCurrent, onNavigate, onUpload, onNotify,
}: {
  project: Project;
  studies: CaseStudy[];
  currentSlug: string;
  /** Live title of the open study, so the active tab reflects unsaved edits. */
  currentTitle: string;
  editing: boolean;
  onRenameCurrent: (title: string) => void;
  /** Soft navigation between case studies — no page reload. */
  onNavigate: (slug: string) => void;
  onUpload: (cb: (url: string) => void) => void;
  onNotify?: (msg: string) => void;
}) {
  const router = useRouter();
  const [p, setP] = useState(project);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  async function persistProject(next: Project) {
    setP(next);
    const err = await saveProject(next);
    onNotify?.(err ?? "Project saved");
    router.refresh();
  }

  function pickLogo() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const { url, error } = await uploadFile(file);
      if (error || !url) { onNotify?.(error ?? "Upload failed"); return; }
      persistProject({ ...p, logo: url });
    };
    input.click();
  }

  async function addStudy() {
    setError("");
    const err = await createStudy(p.slug, newTitle);
    if (err) { setError(err); return; }
    const slug = `${p.slug}-${newTitle}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    setAdding(false); setNewTitle("");
    router.push(`/case-study/${slug}`);
    router.refresh();
  }

  async function removeStudy(slug: string) {
    await deleteStudy(slug);
    const rest = studies.filter((s) => s.slug !== slug);
    router.push(rest.length ? `/case-study/${rest[0].slug}` : "/work");
    router.refresh();
  }

  return (
    <header>
      {/* ---------- project identity ---------- */}
      <Reveal>
        {/* Logo sits beside the name and a single-line slogan — both short,
            so no dead space opens up next to the logo. The long description
            then runs the full width of the container underneath. */}
        <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center", flexWrap: "wrap" }}>
          <div className="logo-plate">
            {p.logo ? <img src={p.logo} alt={p.name} /> : <span className="t-label">LOGO</span>}
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 className="t-h1">
              {editing
                ? <Editable value={p.name} onChange={(v) => persistProject({ ...p, name: v })} placeholder="Company name" />
                : p.name}
            </h1>
            {(p.slogan || editing) && (
              <p className="t-lead" style={{ marginTop: "var(--space-2)", maxWidth: "40ch" }}>
                {editing
                  ? <Editable value={p.slogan ?? ""} onChange={(v) => persistProject({ ...p, slogan: v })} placeholder="One line — what the company is." />
                  : p.slogan}
              </p>
            )}
          </div>
        </div>

        {(p.description || editing) && (
          <p className="t-body" style={{ marginTop: "var(--space-8)", maxWidth: "none" }}>
            {editing
              ? <Editable value={p.description} onChange={(v) => persistProject({ ...p, description: v })} placeholder="The longer description — what you owned across your whole time there." />
              : p.description}
          </p>
        )}

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--space-6)",
          marginTop: "var(--space-12)", paddingTop: "var(--space-6)",
          borderTop: "1px solid var(--color-line)",
        }}>
          <div>
            <div className="t-label">Role</div>
            <div style={{ marginTop: 6 }}>
              {editing
                ? <Editable value={p.role ?? ""} onChange={(v) => persistProject({ ...p, role: v })} placeholder="Your role" />
                : p.role}
            </div>
          </div>
          <div>
            <div className="t-label">Period</div>
            <div style={{ marginTop: 6 }}>
              {editing
                ? <Editable value={p.period ?? ""} onChange={(v) => persistProject({ ...p, period: v })} placeholder="Oct 2022 – Oct 2024" />
                : p.period}
            </div>
          </div>
        </div>

        {editing && (
          <Toolbar>
            <Btn onClick={pickLogo} tone="accent">↑ Upload logo</Btn>
            {p.logo && <DeleteBtn label="Remove logo" onConfirm={() => persistProject({ ...p, logo: "" })} />}
          </Toolbar>
        )}
      </Reveal>

      {/* ---------- composable project intro ----------
           Same block system as a case study: cover, video, outcomes, text.
           Anything you can put in a case study, you can put here. */}
      <SectionsEditor
        sections={p.sections ?? []}
        onChange={(sections) => persistProject({ ...p, sections })}
        editing={editing}
        onUpload={onUpload}
        addLabel="+ Add section to intro"
      />

      {/* ---------- case studies inside this project ---------- */}
      <Reveal delay={2}>
        <div style={{ marginTop: "var(--space-24)" }}>
          <h2 className="t-h1" style={{ marginBottom: "var(--space-8)" }}>
            Case studies<span className="dot">.</span>
          </h2>
          <div style={{
            display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center",
            borderBottom: "1px solid var(--color-line)", paddingBottom: "var(--space-3)",
          }}>
            {/* Always visible — in preview they are navigation, in edit they
                are also where you rename the open study. */}
            {(editing || studies.length > 1) && studies.map((s) => {
              const active = s.slug === currentSlug;
              const label = active ? currentTitle : s.title || s.slug;

              const chrome: React.CSSProperties = {
                fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".06em",
                textTransform: "uppercase", padding: "7px 14px",
                borderRadius: "var(--radius-pill)",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-line)"}`,
                background: active ? "var(--color-accent)" : "transparent",
                color: active ? "var(--color-accent-ink)" : "var(--color-dim)",
                display: "inline-flex", alignItems: "center", gap: 8,
              };

              /* The open tab is editable in place. */
              if (active && editing) {
                return (
                  <span key={s.slug} style={chrome}>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onRenameCurrent(e.currentTarget.textContent ?? "")}
                      style={{
                        outline: "none", minWidth: 40,
                        borderBottom: "1px dashed var(--color-accent-ink)",
                      }}
                    >{label}</span>
                    {editing && s.status === "draft" && <span style={{ opacity: .7, fontSize: 10 }}>draft</span>}
                  </span>
                );
              }

              return (
                <button key={s.slug} onClick={() => onNavigate(s.slug)} style={chrome}>
                  {label}
                  {editing && s.status === "draft" && <span style={{ opacity: .7, fontSize: 10 }}>draft</span>}
                </button>
              );
            })}

            {editing && !adding && <Btn onClick={() => setAdding(true)} tone="accent">+ Case study</Btn>}
            {editing && studies.length > 1 && (
              <DeleteBtn label="Delete this one" onConfirm={() => removeStudy(currentSlug)} />
            )}
          </div>

          {editing && adding && (
            <div style={{
              border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)",
              padding: "var(--space-4)", marginTop: "var(--space-3)", maxWidth: 440,
            }}>
              <Field label={`New case study in ${p.name || "this project"}`} value={newTitle} onChange={setNewTitle} />
              {error && <p className="t-label" style={{ color: "#E5484D", marginBottom: "var(--space-3)" }}>{error}</p>}
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <Btn onClick={addStudy} tone="accent">Create</Btn>
                <Btn onClick={() => setAdding(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </header>
  );
}
