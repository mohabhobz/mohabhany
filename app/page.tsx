import { promises as fs } from "node:fs";
import path from "node:path";
import { listProjects, listStudies } from "@/lib/storage";
import { Reveal } from "@/components/ui/Reveal";
import { SiteNav } from "@/components/ui/SiteNav";
import { WorkCard } from "@/components/ui/WorkCard";

export const dynamic = "force-dynamic";

/* Copy lives in content/site.json so the landing page can be edited without
   touching JSX. Same principle as the case studies: content is data. */
type Site = {
  intro: { eyebrow: string; headline: string; lead: string; note: string };
  clients: { label: string; title: string; note: string; items: { name: string; logo: string }[] };
  work: { label: string; title: string };
  career: {
    label: string; title: string;
    roles: { company: string; title: string; period: string; place: string; line: string; logo?: string }[];
  };
  consulting: {
    label: string; title: string;
    items: { name: string; place: string; period: string; logo: string; line: string }[];
  };
  contact: { label: string; headline: string; email: string; links: { label: string; href: string }[] };
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
                  <p className="t-body entry__line">{r.line}</p>
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
          <h2 className="t-label">{site.consulting.label}</h2>
          <p className="t-section-title section-title">{site.consulting.title}</p>
        </Reveal>

        <ul className="entries">
          {site.consulting.items.map((c, i) => (
            <Reveal as="li" key={c.name} delay={(i % 3) as 0 | 1 | 2}>
              <div className="entry">
                {/* The column keeps its width with or without a file, so
                    rows stay aligned while logos are still being found. */}
                <div className="entry__mark">
                  {c.logo && <img src={c.logo} alt="" />}
                </div>
                <div className="entry__body">
                  <p className="t-h3">{c.name}</p>
                  <p className="t-body entry__line">{c.line}</p>
                  <p className="t-label entry__meta">
                    {[c.place, c.period].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section id="contact" className="page section-block section-contact">
        <Reveal>
          <h2 className="t-label">{site.contact.label}</h2>
        </Reveal>
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
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="t-label">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </main>
    </>
  );
}
