"use client";

import Image from "next/image";
import type { Project, CaseStudy } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { SiteNav } from "@/components/ui/SiteNav";
import { WorkCard } from "@/components/ui/WorkCard";
import { DrawnMark } from "@/components/ui/DrawnMark";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { ClientList } from "@/components/ui/ClientList";
import { ClampedText } from "@/components/ui/ClampedText";
import { useLang } from "@/lib/lang";
import { fill } from "@/lib/merge";
import type { Site } from "@/lib/site";
import { translateProject } from "@/lib/i18n-doc";
import type { ProjectAr } from "@/lib/project-ar";

/**
 * The landing page, in whichever language is selected.
 *
 * Both copies of the content arrive as props and the switch happens here,
 * with no request and no route change. The page is still prerendered: what
 * ships in the HTML is the English, which is what a visitor who never
 * touches the switch sees and the only version a crawler is offered.
 *
 * The Arabic file holds words only. `fill` lays it over the English so
 * logos, links and brand colours are inherited rather than duplicated.
 */
export function HomeView({
  site, siteAr, projects, projectsAr, studies,
}: {
  site: Site; siteAr: Partial<Site> | null;
  projects: Project[];
  /** Arabic per project, keyed by slug. Missing is allowed. */
  projectsAr?: Record<string, ProjectAr | null>;
  studies: CaseStudy[];
}) {
  const { lang } = useLang();
  const s: Site = lang === "ar" && siteAr ? fill(site, siteAr) : site;
  const projs = lang === "ar"
    ? projects.map((p) => translateProject(p, { project: projectsAr?.[p.slug] ?? undefined }))
    : projects;

  return (
    <>
    <SiteNav />
    <main>
      {/* ---------------- INTRO ---------------- */}
      <section id="intro" className="page section-intro">
        <Reveal>
          <p className="t-label">{s.intro.eyebrow}</p>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="t-display" style={{ marginTop: "var(--space-6)", maxWidth: "14ch" }}>
            {s.intro.headline}<span className="dot">.</span>
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="t-lead" style={{ marginTop: "var(--space-8)", maxWidth: "58ch" }}>
            {s.intro.lead}
          </p>
        </Reveal>
        <Reveal delay={3}>
          <p className="t-label" style={{ marginTop: "var(--space-6)" }}>{s.intro.note}</p>
        </Reveal>
      </section>

      {/* ---------------- WORKED WITH ---------------- */}
      <section id="worked" className="page section-block">
        <Reveal>
          <h2 className="t-label">{s.clients.label}</h2>
          <p className="t-section-title section-title">{s.clients.title}</p>
        </Reveal>
        <ul className="client-grid">
          {/* Staggered per tile, but the step resets every five. Fourteen
              logos at a full 0.07s each would take a second to finish and
              the last row would still be arriving after you had scrolled
              past it. */}
          {s.clients.items.map((c, i) => (
            <Reveal as="li" key={c.name} delay={(i % 5) as 0 | 1 | 2 | 3 | 4} className="client-cell">
              {c.logo && <img src={c.logo} alt="" />}
              <span className="t-label client-cell__name">{c.name}</span>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={2}>
          <p className="t-small client-note">{s.clients.note}</p>
        </Reveal>
      </section>

      {/* ---------------- WORK ---------------- */}
      <section id="work" className="page section-block">
        <Reveal>
          <h2 className="t-label">{s.work.label}</h2>
          <p className="t-section-title section-title">{s.work.title}</p>
        </Reveal>

        <div className="work-board">
          {/* Published only. A card that leads to a 404 is worse than a
              project the visitor never knew existed. */}
          {projs
            .map((p) => ({
              project: p,
              live: studies.filter((c) => c.projectSlug === p.slug && c.status === "published"),
            }))
            .filter(({ live }) => live.length > 0)
            .map(({ project, live }, i) => (
              <Reveal key={project.slug} delay={(i % 3) as 0 | 1 | 2}>
                <WorkCard project={project} studies={live} />
              </Reveal>
            ))}
        </div>

      </section>

      {/* ---------------- AI ---------------- */}
      <section id="ai" className="page section-block">
        <Reveal>
          <h2 className="t-label">{s.ai.label}</h2>
          <p className="t-section-title section-title">{s.ai.title}</p>
        </Reveal>
        <Reveal delay={1}>
          <p className="t-body ai-note">{s.ai.note}</p>
        </Reveal>

        <ul className="entries">
          {s.ai.items.map((a, i) => (
            <Reveal as="li" key={a.name} delay={(i % 3) as 0 | 1 | 2}>
              <div className="entry">
                <div className="entry__mark">
                  {/* A logo that is not a path is the name of a mark we draw,
                      because neither of those two survives both themes as a
                      flat image. Anything starting with / is a real file. */}
                  {a.logo && !a.logo.startsWith("/")
                    ? <DrawnMark name={a.logo} />
                    : a.logo && <img src={a.logo} alt="" />}
                </div>
                <div className="entry__body">
                  <p className="t-h3">
                    {a.href ? (
                      /* A live URL is the whole point of this section: the
                         2026 screening question is whether the thing is
                         traceable, not whether it is described well.

                         An href starting with / is a page on this site, so
                         it opens here and keeps its arrow pointing forward.
                         Anything else is somebody else's server and opens
                         in a new tab, which is what the diagonal arrow has
                         always meant. */
                      <a
                        href={a.href}
                        {...(a.href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                        className="entry__link"
                      >
                        {a.name} <span aria-hidden="true">{a.href.startsWith("/") ? "→" : "↗"}</span>
                      </a>
                    ) : a.name}
                  </p>
                  <ClampedText>{a.line}</ClampedText>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------------- BACKGROUND ---------------- */}
      <section id="background" className="page section-block">
        <Reveal>
          <h2 className="t-label">{s.career.label}</h2>
          <p className="t-section-title section-title">{s.career.title}</p>
        </Reveal>

        <ol className="entries">
          {s.career.roles.map((r, i) => (
            <Reveal as="li" key={`${r.company}-${r.period}`} delay={(i % 3) as 0 | 1 | 2}>
              <div className="entry">
                <div className="entry__mark">
                  {r.logo && <img src={r.logo} alt="" />}
                </div>
                <div className="entry__body">
                  <p className="t-h3">{r.company}</p>
                  <p className="t-small entry__sub">{r.title} · {r.place}</p>
                  <ClampedText>{r.line}</ClampedText>
                  <p className="t-label entry__meta">{r.period}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------------- CONSULTING ---------------- */}
      <section id="consulting" className="page section-block">
        <Reveal>
          {/* Label, title, a period-and-places line, and one sentence of what
              this work is. The clients themselves follow underneath.

              No mark above it. One stood here, standing in for the company
              logo that a freelance entry does not have, and it read as a
              stray black disc rather than as a heading. */}
          <h2 className="t-label">{s.consulting.label}</h2>
          <p className="t-section-title section-title">{s.consulting.title}</p>
          {s.consulting.meta && (
            <p className="t-label" style={{ marginTop: "var(--space-4)", opacity: .7 }}>
              {s.consulting.meta}
            </p>
          )}
          {s.consulting.note && (
            <p className="t-body" style={{ marginTop: "var(--space-4)", maxWidth: "52ch" }}>
              {s.consulting.note}
            </p>
          )}
        </Reveal>

        {/* Four, then a word. See ClientList. */}
        <ClientList items={s.consulting.items} initial={4} />
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section id="contact" className="page section-block section-contact">
        <Reveal>
          <h2 className="t-label">{s.contact.label}</h2>
        </Reveal>

        {/* Text and portrait side by side on desktop, stacked on mobile.
            The face goes last in the DOM so a screen reader and a narrow
            screen both get the invitation before the photograph. */}
        <div className="contact-grid">
          <div className="contact-grid__text">
            <Reveal delay={1}>
              {/* mailto, not a form: one click and they are already writing. */}
              <a href={`mailto:${s.contact.email}`} className="say-hello">
                {s.contact.headline}
              </a>
            </Reveal>
            <Reveal delay={2}>
              <p className="t-body" style={{ marginTop: "var(--space-6)" }}>{s.contact.email}</p>
            </Reveal>
            <Reveal delay={3}>
              <ul className="contact-links">
                {s.contact.links.map((l) => (
                  <li key={l.href}>
                    {/* The mark carries the link, so the name is only for
                        screen readers. A visible label beside a recognisable
                        logo is the same word twice. */}
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social"
                      aria-label={l.label}
                      style={l.brand ? ({ "--brand": l.brand } as React.CSSProperties) : undefined}
                    >
                      <SocialIcon name={l.icon ?? ""} />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={2}>
            {/* A face at the point of contact. Everything above this section is
                work; this is the person you would be writing to. */}
            <figure className="contact-portrait">
              <Image
                src="/mohab-hany.jpg"
                alt="Mohab Hany"
                width={1600}
                height={2000}
                sizes="(max-width: 900px) 65vw, 380px"
                /* 92, not the default 75. The source is a clean master and
                   next/image re-encodes it; at 75 that second pass showed on
                   the face, where skin and beard turn blocky before anything
                   else in the frame does. */
                quality={92}
                className="contact-portrait__img"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* The year is computed, not typed. A hard-coded one is correct for a
          few months and then quietly dates the site, which is the opposite of
          what a portfolio should signal. */}
      <footer className="site-footer page">
        <p className="site-footer__credit">
          Design and code by{" "}
          <a href="https://www.linkedin.com/in/mohabhany/" target="_blank" rel="noopener noreferrer">
            Mohab Hany
          </a>
          {" · "}© {new Date().getFullYear()}
        </p>
      </footer>
    </main>
    </>
    );
}
