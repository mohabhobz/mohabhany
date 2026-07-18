import Link from "next/link";
import { listProjects, listStudies } from "@/lib/storage";
import { Reveal } from "@/components/ui/Reveal";
import { NewProject } from "@/components/editor/NewProject";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await listProjects();
  const all = await listStudies();

  return (
    <main className="page" style={{ paddingBlock: "var(--space-24)" }}>
      <Reveal>
        <p className="t-label">Selected work</p>
        <h1 className="t-h1" style={{ marginTop: "var(--space-4)" }}>
          Projects<span className="dot">.</span>
        </h1>
      </Reveal>

      {projects.length === 0 && (
        <Reveal delay={1}>
          <p className="t-body" style={{ marginTop: "var(--space-8)" }}>
            No projects yet. Create one below — it saves to <code>content/projects/</code>.
          </p>
        </Reveal>
      )}

      <div style={{ marginTop: "var(--space-12)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {projects.map((p, i) => {
          const studies = all.filter((c) => c.projectSlug === p.slug);
          const first = studies[0];
          return (
            <Reveal key={p.slug} delay={(i % 3) as 0 | 1 | 2}>
              <div style={{
                display: "flex", gap: "var(--space-6)", alignItems: "flex-start",
                border: "1px solid var(--color-line)", borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)", background: "var(--color-surface)", flexWrap: "wrap",
              }}>
                <div className="logo-plate">
                  {p.logo ? <img src={p.logo} alt={p.name} /> : <span className="t-label">LOGO</span>}
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h2 className="t-h3">{p.name}</h2>
                  <p className="t-small" style={{ marginTop: "var(--space-2)" }}>{p.description}</p>
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-4)" }}>
                    {studies.map((c) => (
                      <Link key={c.slug} href={`/case-study/${c.slug}`} className="t-label" style={{
                        border: "1px solid var(--color-line)", borderRadius: "var(--radius-pill)",
                        padding: "6px 12px", color: "var(--color-ink)",
                      }}>
                        {c.title}{c.status === "draft" ? " · draft" : ""}
                      </Link>
                    ))}
                    {studies.length === 0 && <span className="t-label">No case studies yet</span>}
                  </div>
                </div>
                {first && (
                  <Link href={`/case-study/${first.slug}`} className="t-label" style={{
                    border: "1px solid var(--color-accent)", color: "var(--color-accent-text)",
                    borderRadius: "var(--radius-pill)", padding: "8px 16px",
                  }}>Open →</Link>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      <div style={{ marginTop: "var(--space-16)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-line)" }}>
        <NewProject />
      </div>
    </main>
  );
}
