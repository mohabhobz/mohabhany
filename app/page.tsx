import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";
import { listProjects, listStudies } from "@/lib/storage";
import { Reveal } from "@/components/ui/Reveal";
import { SiteNav } from "@/components/ui/SiteNav";

export const dynamic = "force-dynamic";

/* Copy lives in content/site.json so the landing page can be edited without
   touching JSX. Same principle as the case studies: content is data. */
type Site = {
  intro: { eyebrow: string; headline: string; lead: string; note: string };
  clients: { label: string; note: string; items: { name: string; logo: string }[] };
  career: {
    label: string; note: string;
    roles: { company: string; title: string; period: string; place: string; line: string; logo?: string }[];
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
        </Reveal>
        <Reveal delay={1}>
          <ul className="client-grid">
            {site.clients.items.map((c) => (
              <li key={c.name} className="client-cell">
                {c.logo && <img src={c.logo} alt="" />}
                <span className="t-label client-cell__name">{c.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={2}>
          <p className="t-small" style={{ marginTop: "var(--space-6)", maxWidth: "52ch", opacity: .7 }}>
            {site.clients.note}
          </p>
        </Reveal>
      </section>

      {/* ---------------- WORK ---------------- */}
      <section id="work" className="page section-block">
        <Reveal>
          <h2 className="t-label">Work</h2>
          <p className="t-section-title" style={{ marginTop: "var(--space-4)" }}>
            Selected projects
          </p>
        </Reveal>

        <div className="work-list">
          {projects.map((p, i) => {
            const mine = studies.filter((c) => c.projectSlug === p.slug);
            const first = mine[0];
            return (
              <Reveal key={p.slug} delay={(i % 3) as 0 | 1 | 2}>
                <Link
                  href={first ? `/case-study/${first.slug}` : "/work"}
                  className="work-row"
                >
                  <span className="logo-plate work-row__logo">
                    {p.logo ? <img src={p.logo} alt="" /> : <span className="t-label">{p.name.slice(0, 2)}</span>}
                  </span>

                  <span className="work-row__text">
                    <span className="t-h3">{p.name}</span>
                    {p.slogan && <span className="t-small work-row__slogan">{p.slogan}</span>}
                    <span className="work-row__tags">
                      {mine.map((c) => (
                        <span key={c.slug} className="t-label work-row__tag">{c.title}</span>
                      ))}
                    </span>
                  </span>

                  <span className="t-label work-row__go" aria-hidden="true">View</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- BACKGROUND ---------------- */}
      <section id="background" className="page section-block">
        <Reveal>
          <h2 className="t-label">{site.career.label}</h2>
          <p className="t-section-title" style={{ marginTop: "var(--space-4)", maxWidth: "24ch" }}>
            {site.career.note}
          </p>
        </Reveal>

        <ol className="career">
          {site.career.roles.map((r, i) => (
            <Reveal as="li" key={`${r.company}-${r.period}`} delay={(i % 3) as 0 | 1 | 2}>
              <div className="career__row">
                <span className="t-label career__period">{r.period}</span>
                <div className="career__body">
                  <p className="career__company">
                    {r.logo && <img className="career__logo" src={r.logo} alt="" />}
                    <span className="t-h3">{r.company}</span>
                  </p>
                  <p className="t-small career__title">{r.title} · {r.place}</p>
                  <p className="t-body career__line">{r.line}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
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
