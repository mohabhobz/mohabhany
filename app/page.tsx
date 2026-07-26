import Image from "next/image";
import { promises as fs } from "node:fs";
import path from "node:path";
import { listProjects, listStudies } from "@/lib/storage";
import { Reveal } from "@/components/ui/Reveal";
import { SiteNav } from "@/components/ui/SiteNav";
import { WorkCard } from "@/components/ui/WorkCard";
import { DrawnMark } from "@/components/ui/DrawnMark";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { ClientList } from "@/components/ui/ClientList";
import { ClampedText } from "@/components/ui/ClampedText";

/* Static. This page is built from JSON on disk, so there is nothing at
   request time that a build cannot do just as well. force-dynamic used to
   sit here and it meant every visitor waited for a fresh server render of
   content that changes a few times a month. Rebuild to publish. */
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-static";

/* Copy lives in content/site.json so the landing page can be edited without
   touching JSX. Same principle as the case studies: content is data. */
type Site = {
  intro: { eyebrow: string; headline: string; lead: string; note: string };
  clients: { label: string; title: string; note: string; items: { name: string; logo: string }[] };
  work: { label: string; title: string };
  ai: {
    label: string; title: string; note: string;
    items: { name: string; href: string; logo: string; line: string }[];
  };
  career: {
    label: string; title: string;
    roles: { company: string; title: string; period: string; place: string; line: string; logo?: string }[];
  };
  consulting: {
    label: string; title: string; meta?: string; note?: string;
    items: { name: string; place: string; period: string; logo: string; line: string }[];
  };
  contact: { label: string; headline: string; email: string; links: { label: string; href: string; icon?: string; brand?: string }[] };
};

async function getSite(): Promise<Site> {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "site.json"), "utf8");
  return JSON.parse(raw) as Site;
}

export default async function Home() {
  const [site, projects, studies] = await Promise.all([
    getSite(), listProjects(), listStudies(),
  ]);

  return (
    <>
    <SiteNav />
    <main>
      {/* ---------------- INTRO ---------------- */}
      <section id="intro" className="page section-intro">
        <Reveal>
          <p className="t-label">{site.intro.eyebrow}</p>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="t-display" style={{ marginTop: "var(--space-6)", maxWidth: "14ch" }}>
            {site.intro.headline}<span className="dot">.</span>
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="t-lead" style={{ marginTop: "var(--space-8)", maxWidth: "58ch" }}>
            {site.intro.lead}
          </p>
        </Reveal>
        <Reveal delay={3}>
          <p className="t-label" style={{ marginTop: "var(--space-6)" }}>{site.intro.note}</p>
        </Reveal>
      </section>

      {/* ---------------- WORKED WITH ---------------- */}
      <section id="worked" className="page section-block">
        <Reveal>
          <h2 className="t-label">{site.clients.label}</h2>
          <p className="t-section-title section-title">{site.clients.title}</p>
        </Reveal>
        <ul className="client-grid">
          {/* Staggered per tile, but the step resets every five. Fourteen
              logos at a full 0.07s each would take a second to finish and
              the last row would still be arriving after you had scrolled
              past it. */}
          {site.clients.items.map((c, i) => (
            <Reveal as="li" key={c.name} delay={(i % 5) as 0 | 1 | 2 | 3 | 4} className="client-cell">
              {c.logo && <img src={c.logo} alt="" />}
              <span className="t-label client-cell__name">{c.name}</span>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={2}>
          <p className="t-small client-note">{site.clients.note}</p>
        </Reveal>
      </section>

      {/* ---------------- WORK ---------------- */}
      <section id="work" className="page section-block">
        <Reveal>
          <h2 className="t-label">{site.work.label}</h2>
          <p className="t-section-title section-title">{site.work.title}</p>
        </Reveal>

        <div className="work-board">
          {/* Published only. A card that leads to a 404 is worse than a
              project the visitor never knew existed. */}
          {projects
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

      {/* ---------------- BACKGROUND ---------------- */}
      <section id="background" className="page section-block">
        <Reveal>
          <h2 className="t-label">{site.career.label}</h2>
          <p className="t-section-title section-title">{site.career.title}</p>
        </Reveal>

        <ol className="entries">
          {site.career.roles.map((r, i) => (
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

      {/* ---------------- AI ---------------- */}
      <section id="ai" className="page section-block">
        <Reveal>
          <h2 className="t-label">{site.ai.label}</h2>
          <p className="t-section-title section-title">{site.ai.title}</p>
        </Reveal>
        <Reveal delay={1}>
          <p className="t-body ai-note">{site.ai.note}</p>
        </Reveal>

        <ul className="entries">
          {site.ai.items.map((a, i) => (
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
                         traceable, not whether it is described well. */
                      <a href={a.href} target="_blank" rel="noopener noreferrer" className="entry__link">
                        {a.name} <span aria-hidden="true">↗</span>
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

      {/* ---------------- CONSULTING ---------------- */}
      <section id="consulting" className="page section-block">
        <Reveal>
          {/* Label, title, a period-and-places line, and one sentence of what
              this work is. The clients themselves follow underneath.

              No mark above it. One stood here, standing in for the company
              logo that a freelance entry does not have, and it read as a
              stray black disc rather than as a heading. */}
          <h2 className="t-label">{site.consulting.label}</h2>
          <p className="t-section-title section-title">{site.consulting.title}</p>
          {site.consulting.meta && (
            <p className="t-label" style={{ marginTop: "var(--space-4)", opacity: .7 }}>
              {site.consulting.meta}
            </p>
          )}
          {site.consulting.note && (
            <p className="t-body" style={{ marginTop: "var(--space-4)", maxWidth: "52ch" }}>
              {site.consulting.note}
            </p>
          )}
        </Reveal>

        {/* Four, then a word. See ClientList. */}
        <ClientList items={site.consulting.items} initial={4} />
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section id="contact" className="page section-block section-contact">
        <Reveal>
          <h2 className="t-label">{site.contact.label}</h2>
        </Reveal>

        {/* Text and portrait side by side on desktop, stacked on mobile.
            The face goes last in the DOM so a screen reader and a narrow
            screen both get the invitation before the photograph. */}
        <div className="contact-grid">
          <div className="contact-grid__text">
            <Reveal delay={1}>
              {/* mailto, not a form: one click and they are already writing. */}
              <a href={`mailto:${site.contact.email}`} className="say-hello">
                {site.contact.headline}
              </a>
            </Reveal>
            <Reveal delay={2}>
              <p className="t-body" style={{ marginTop: "var(--space-6)" }}>{site.contact.email}</p>
            </Reveal>
            <Reveal delay={3}>
              <ul className="contact-links">
                {site.contact.links.map((l) => (
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
