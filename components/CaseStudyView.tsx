"use client";

import type { CaseStudy, Project } from "@/lib/types";
import { LightboxProvider } from "@/components/ui/Lightbox";
import { ProjectCover } from "@/components/editor/ProjectCover";
import { ProjectShell } from "@/components/editor/ProjectShell";
import { SectionsEditor } from "@/components/editor/SectionsEditor";
import { Wordmark } from "@/components/ui/Wordmark";
import { useState } from "react";
import { useLang } from "@/lib/lang";
import { translateProject, translateStudy, type DocAr } from "@/lib/i18n-doc";

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
  initial, project, siblings, ar,
}: {
  initial: CaseStudy; project: Project; siblings: CaseStudy[];
  /** Arabic for each sibling, keyed by slug. Missing is allowed. */
  ar?: Record<string, DocAr | null>;
}) {
  const [slug, setSlug] = useState(initial.slug);
  const { lang } = useLang();
  const raw = siblings.find((s) => s.slug === slug) ?? initial;

  /* The Arabic is laid over the English rather than replacing it, so a
     study translated halfway reads as one page in two languages instead
     of a page with holes in it. */
  const tr = lang === "ar" ? ar?.[slug] ?? null : null;
  const doc = translateStudy(raw, tr);
  const proj = translateProject(project, tr);

  /* Titles in the tab strip come from each sibling's own file. */
  const sibs = siblings.map((c) =>
    lang === "ar" ? translateStudy(c, ar?.[c.slug] ?? null) : c);

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

      <ProjectCover project={proj} editing={false} onChange={noop} onUpload={noUpload} />

      <div className="glass-sheet">
        <article className="prose study-body">
          <ProjectShell
            project={proj}
            studies={sibs}
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
