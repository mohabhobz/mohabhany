"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy, Project } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { saveProject, saveStudy, uploadFile, USING_SUPABASE } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import { SignIn } from "@/components/editor/SignIn";
import { ProjectShell } from "@/components/editor/ProjectShell";
import { ProjectCover } from "@/components/editor/ProjectCover";
import { Wordmark } from "@/components/ui/Wordmark";
import { SectionsEditor } from "@/components/editor/SectionsEditor";
import { LightboxProvider } from "@/components/ui/Lightbox";
import { Btn } from "@/components/editor/ui";
import { SeoPanel } from "@/components/editor/SeoPanel";

export function CaseStudyEditor({ initial, project, siblings = [] }: {
  initial: CaseStudy; project: Project; siblings?: CaseStudy[];
}) {
  /* Every case study in this project is already on the page — the server
     sent them with `siblings`. So switching tabs is a state change, not a
     navigation: nothing refetches, nothing remounts, the shell never blinks. */
  const [docs, setDocs] = useState<Record<string, CaseStudy>>(() => {
    const map: Record<string, CaseStudy> = {};
    for (const s of siblings) map[s.slug] = s;
    map[initial.slug] = initial;
    return map;
  });
  const [activeSlug, setActiveSlug] = useState(initial.slug);
  const [savedSnapshot, setSavedSnapshot] = useState<Record<string, string>>(
    () => Object.fromEntries(Object.entries(
      (() => { const m: Record<string, CaseStudy> = {}; for (const s of siblings) m[s.slug] = s; m[initial.slug] = initial; return m; })(),
    ).map(([k, v]) => [k, JSON.stringify(v)])),
  );

  const doc = docs[activeSlug] ?? initial;
  const setDoc = (next: CaseStudy) =>
    setDocs((m) => ({ ...m, [next.slug]: next }));
  const [editing, setEditing] = useState(!USING_SUPABASE);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const auth = useAuth();
  const router = useRouter();
  /* Tabs are state, and the URL stays on /projects/<project>. Rewriting it
     to /case-study/<slug> would mean a refresh landed on the read-only
     public page instead of back in the editor. */
  const goTo = (slug: string) => {
    if (slug === activeSlug) return;

    /* Unsaved work is easy to lose when switching feels this cheap. */
    const dirty = JSON.stringify(doc) !== savedSnapshot[activeSlug];
    if (dirty && !confirm("You have unsaved changes here. Switch anyway?")) return;

    setActiveSlug(slug);
  };

  const canEdit = USING_SUPABASE ? auth.signedIn : true;
  useEffect(() => { if (!canEdit) setEditing(false); }, [canEdit]);

  const save = (next: CaseStudy) => setDoc({ ...next, updatedAt: new Date().toISOString() });

  const notify = (m: string) => {
    setMessage(m); setSaving("saved"); setTimeout(() => setSaving("idle"), 2500);
  };

  async function persist(status?: CaseStudy["status"]) {
    const next = status ? { ...doc, status } : doc;
    setSaving("saving"); setMessage("");
    const err = await saveStudy(next);
    if (err) { setSaving("error"); setMessage(err); return; }
    setDoc(next);
    setSavedSnapshot((m) => ({ ...m, [next.slug]: JSON.stringify(next) }));
    notify(status === "published" ? "Published" : "Draft saved");
  }

  function pickAndUpload(onUrl: (url: string) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,application/pdf";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setSaving("saving"); setMessage(`Uploading ${file.name}…`);
      const { url, error } = await uploadFile(file);
      if (error || !url) { setSaving("error"); setMessage(error ?? "Upload failed"); return; }
      onUrl(url); notify("Uploaded");
    };
    input.click();
  }


  return (
    <LightboxProvider>
      <div style={{
        /* 1fr auto 1fr, not space-between: the middle column is centred on
           the page rather than on whatever is left over, so it stays put
           when the buttons on the right change. */
        position: "sticky", top: 0, zIndex: 40,
        display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "var(--space-3)",
        alignItems: "center",
        padding: "var(--space-3) var(--gutter)",
        background: "color-mix(in srgb, var(--color-bg) 88%, transparent)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifySelf: "start" }}>
          <Wordmark />
        </div>

        <span className="t-label" style={{ justifySelf: "center", textAlign: "center" }}>
          {USING_SUPABASE ? "supabase" : "local"} · {doc.status}
          {saving !== "idle" && ` · ${saving === "saving" ? "saving…" : message}`}
        </span>

        <div style={{
          display: "flex", gap: "var(--space-2)", alignItems: "center",
          justifySelf: "end", flexWrap: "wrap",
        }}>
          {canEdit ? (
            <>
              <Btn onClick={() => setEditing(!editing)}>{editing ? "Preview" : "Edit"}</Btn>
              <SeoPanel doc={doc} onChange={save} onUpload={pickAndUpload} />
              <Btn onClick={() => persist()}>Save draft</Btn>
              <Btn onClick={() => persist("published")} tone="accent">Publish</Btn>
              {USING_SUPABASE && <Btn onClick={auth.signOut}>Sign out</Btn>}
            </>
          ) : auth.ready && <SignIn signIn={auth.signIn} />}
        </div>
      </div>

      {/* Full-bleed, before the reading column starts. */}
      <ProjectCover
        project={project}
        editing={editing}
        onChange={async (next) => { await saveProject(next); notify("Cover updated"); router.refresh(); }}
        onUpload={pickAndUpload}
      />

      {/* The sheet that rides over the pinned cover. */}
      <div className="glass-sheet">
      <article className="prose" style={{ paddingBlock: "var(--space-24)" }}>
        {/* project identity → composable project sections → tabs */}
        <ProjectShell
          project={project}
          studies={siblings.map((s) => docs[s.slug] ?? s)}
          currentSlug={doc.slug}
          currentTitle={doc.title}
          editing={editing}
          onRenameCurrent={(title) => save({ ...doc, title })}
          onNavigate={goTo}
          onUpload={pickAndUpload}
          onNotify={notify}
        />

        {/* Everything below is yours to compose — no fixed content. */}
        {/* Keyed on the slug so React swaps the subtree cleanly and the
            reveal animations replay for the new content. */}
        <SectionsEditor
          key={activeSlug}
          sections={doc.sections}
          onChange={(sections) => save({ ...doc, sections })}
          editing={editing}
          onUpload={pickAndUpload}
        />
      </article>
      </div>
    </LightboxProvider>
  );
}
