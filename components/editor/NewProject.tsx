"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, createStudy } from "@/lib/storage";
import { Btn, Field } from "@/components/editor/ui";

/** A project always starts with one case study — an empty project is a dead end. */
export function NewProject() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [first, setFirst] = useState("");
  const [error, setError] = useState("");

  async function create() {
    setError("");
    const err = await createProject(name);
    if (err) { setError(err); return; }

    const projectSlug = name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    const title = first.trim() || "Untitled case study";
    const err2 = await createStudy(projectSlug, title);
    if (err2) { setError(err2); return; }

    const slug = `${projectSlug}-${title}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    router.push(`/case-study/${slug}`);
    router.refresh();
  }

  if (!open) return <Btn onClick={() => setOpen(true)} tone="accent">+ New project</Btn>;

  return (
    <div style={{
      border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)",
      padding: "var(--space-6)", maxWidth: 480,
    }}>
      <Field label="Project / company name" value={name} onChange={setName} />
      <Field label="First case study title" value={first} onChange={setFirst} />
      {error && <p className="t-label" style={{ color: "#E5484D", marginBottom: "var(--space-3)" }}>{error}</p>}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Btn onClick={create} tone="accent">Create</Btn>
        <Btn onClick={() => setOpen(false)}>Cancel</Btn>
      </div>
    </div>
  );
}
