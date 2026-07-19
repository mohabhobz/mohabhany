"use client";

import type { CaseStudy, Project } from "@/lib/types";
import { LightboxProvider } from "@/components/ui/Lightbox";
import { ProjectCover } from "@/components/editor/ProjectCover";
import { ProjectShell } from "@/components/editor/ProjectShell";
import { SectionsEditor } from "@/components/editor/SectionsEditor";
import { Wordmark } from "@/components/ui/Wordmark";
import { useState } from "react";

/**
 * The public case study. Read only.
 *
 * Same renderers as the studio, all with editing={false} — one code path
 * means the page a visitor sees and the page being edited can never drift.
 * What is missing here is the chrome: no Edit, no SEO, no Save, no
 * Publish, and a header carrying the wordmark and nothing else.
 *
 * Switching between the studies inside a project is a local state swap, not
 * a navigation: every published sibling is already on the page.
 */
export function CaseStudyView({
  initial, project, siblings,
}: { initial: CaseStudy; project: Project; siblings: CaseStudy[] }) {
  const [slug, setSlug] = useState(initial.slug);
  const doc = siblings.find((s) => s.slug === slug) ?? initial;

  const goTo = (next: string) => {
    if (next === slug) return;
    setSlug(next);
    window.history.replaceState(null, "", `/case-study/${next}`);
  };

  /* The renderers take these because the studio needs them. Nothing on this
     page can reach a code path that calls them. */
  const noop = async () => {};
  const noUpload = () => {};

  return (
    <LightboxProvider>
      <header className="public-bar">
        <Wordmark href="/" />
      </header>

      <ProjectCover project={project} editing={false} onChange={noop} onUpload={noUpload} />

      <div className="glass-sheet">
        <article className="prose" style={{ paddingBlock: "var(--space-24)" }}>
          <ProjectShell
            project={project}
            studies={siblings}
            currentSlug={doc.slug}
            currentTitle={doc.title}
            editing={false}
            onRenameCurrent={noop}
            onNavigate={goTo}
            onUpload={noUpload}
            onNotify={noop}
          />

          <SectionsEditor
            key={doc.slug}
            sections={doc.sections}
            onChange={noop}
            editing={false}
            onUpload={noUpload}
          />
        </article>
      </div>
    </LightboxProvider>
  );
}
