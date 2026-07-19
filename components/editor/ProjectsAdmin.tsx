"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project, CaseStudy } from "@/lib/types";
import { saveProject } from "@/lib/storage";
import { NewProject } from "@/components/editor/NewProject";
import { Btn } from "@/components/editor/ui";
import { Wordmark } from "@/components/ui/Wordmark";

/**
 * The project list, reorderable.
 *
 * Drag and drop is the native HTML5 API, not a library. The whole feature
 * is a dragged index, a hovered index, and a splice; pulling in dnd-kit
 * would add more kilobytes than the rest of this page weighs, on a screen
 * only one person ever opens.
 *
 * Order is written back as `order` on each project, which is what
 * listProjects already sorts by. The landing board picks the change up on
 * its next render.
 */
export function ProjectsAdmin({
  projects: initial, studies,
}: { projects: Project[]; studies: CaseStudy[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = items.some((p, i) => p.slug !== initial[i]?.slug);

  const drop = (to: number) => {
    if (drag === null || drag === to) { setDrag(null); setOver(null); return; }
    const next = [...items];
    const [moved] = next.splice(drag, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDrag(null);
    setOver(null);
  };

  async function saveOrder() {
    setSaving(true);
    /* Sequential, not Promise.all: the local store writes one JSON file per
       project and firing a dozen writes at once is how you get a half
       written file. There are never enough projects for this to be slow. */
    for (let i = 0; i < items.length; i++) {
      await saveProject({ ...items[i], order: i });
    }
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      <header className="studio-bar">
        <Wordmark href="/" />
        <span className="t-label">Studio · local only</span>
        <div className="studio-bar__actions">
          {dirty && (
            <Btn onClick={saveOrder} tone="accent" disabled={saving}>
              {saving ? "Saving…" : "Save order"}
            </Btn>
          )}
          <Link href="/" className="t-label">View site →</Link>
        </div>
      </header>

      <main className="page" style={{ paddingBlock: "var(--space-16)" }}>
        <p className="t-label">Projects</p>
        <h1 className="t-section-title section-title">
          {items.length} project{items.length === 1 ? "" : "s"}
        </h1>

        <p className="t-small" style={{ marginTop: "var(--space-6)", opacity: .6, maxWidth: "56ch" }}>
          Drag to reorder. This is the order the board on the landing page uses.
          Only published case studies appear on the public site.
        </p>

        <ol className="p-list">
          {items.map((p, i) => {
            const mine = studies.filter((c) => c.projectSlug === p.slug);
            const live = mine.filter((c) => c.status === "published").length;
            return (
              <li
                key={p.slug}
                draggable
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => { e.preventDefault(); setOver(i); }}
                onDrop={() => drop(i)}
                onDragEnd={() => { setDrag(null); setOver(null); }}
                className="p-row"
                data-dragging={drag === i}
                data-over={over === i && drag !== i}
              >
                <span className="p-row__grip t-label" aria-hidden="true">⠿</span>

                <span className="logo-plate p-row__logo">
                  {p.logo ? <img src={p.logo} alt="" /> : <span className="t-label">{p.name.slice(0, 2)}</span>}
                </span>

                <span className="p-row__text">
                  <Link href={`/projects/${p.slug}`} className="t-h3">{p.name}</Link>
                  <span className="t-small p-row__meta">
                    {mine.length} case stud{mine.length === 1 ? "y" : "ies"}
                    {" · "}
                    {live > 0
                      ? <span className="p-row__live">{live} published</span>
                      : <span className="p-row__draft">nothing published</span>}
                  </span>
                </span>

                <span className="p-row__go">
                  <Link href={`/projects/${p.slug}`} className="t-label">Edit</Link>
                  {live > 0 && (
                    <Link
                      href={`/case-study/${mine.find((c) => c.status === "published")!.slug}`}
                      className="t-label"
                    >View</Link>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        <div style={{ marginTop: "var(--space-12)" }}>
          <NewProject />
        </div>
      </main>
    </>
  );
}
