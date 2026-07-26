import { Reveal } from "@/components/ui/Reveal";

const COLORS = [
  ["--color-bg", "page background"],
  ["--color-surface", "raised cards / sections"],
  ["--color-surface-2", "feature card"],
  ["--color-line", "hairline border"],
  ["--color-line-strong", "hover border"],
  ["--color-ink", "primary text"],
  ["--color-muted", "body text"],
  ["--color-dim", "labels / captions"],
  ["--color-accent", "fills and graphics"],
  ["--color-accent-text", "accent as TEXT (darker on light)"],
];

const TYPE = [
  ["t-display", "Display — hero only", "clamp(2.5rem, 6vw, 5.5rem) · 500"],
  ["t-h1", "H1 — page title", "clamp(2rem, 4.5vw, 3.75rem) · 500"],
  ["t-h2", "H2 — section title", "clamp(1.5rem, 3.2vw, 2.25rem) · 500"],
  ["t-h3", "H3 — sub-section", "clamp(1.25rem, 2.2vw, 1.5rem) · 500"],
  ["t-lead", "Lead — intro paragraph", "clamp(1.06rem, 2vw, 1.31rem) · 400"],
  ["t-body", "Body — running text", "1.0625rem · 400 · 1.72"],
  ["t-small", "Small — secondary", "0.875rem"],
  ["t-label", "Label — mono, uppercase", "0.75rem · tracked"],
];

const SPACE = ["1", "2", "3", "4", "6", "8", "12", "16", "24", "32"];

export default function DesignSystemPage() {
  return (
    <main className="page" style={{ paddingBlock: "var(--space-24)" }}>
      <Reveal>
        <p className="t-label">Hobz design system</p>
        <h1 className="t-display" style={{ marginTop: "var(--space-4)" }}>
          The system<span className="dot">.</span>
        </h1>
        <p className="t-lead" style={{ marginTop: "var(--space-6)" }}>
          Every value used anywhere in this site is defined here. If something you
          need isn&apos;t on this page, it doesn&apos;t exist yet — add it here first.
        </p>
      </Reveal>

      {/* COLOUR */}
      <section className="section">
        <Reveal><h2 className="t-h2">Colour</h2></Reveal>
        <Reveal delay={1}>
          <p className="t-body" style={{ marginTop: "var(--space-4)" }}>
            Two layers: fixed <strong>primitives</strong> (the raw palette) and{" "}
            <strong>semantic</strong> tokens that swap with the theme. Components only
            ever use semantic tokens — which is why light and dark both work without a
            single component knowing which theme it is in.
          </p>
          <p className="t-body" style={{ marginTop: "var(--space-3)" }}>
            Toggle the theme above: every swatch below is rendering the live token.
            The palette carries no hue on purpose. Emphasis is done with contrast,
            weight and space, so the only saturated thing on any page is the work
            itself. <code style={{ color: "var(--color-accent-text)" }}>--color-accent-text</code>{" "}
            survives as a token because state still needs a name, even when that
            state is expressed in ink.
          </p>
        </Reveal>
        <div className="grid-2" style={{ marginTop: "var(--space-8)" }}>
          {COLORS.map(([token, use], i) => (
            <Reveal key={token} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-4)",
                  border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                }}
              >
                <span
                  style={{
                    width: 48, height: 48, borderRadius: "var(--radius-sm)",
                    background: `var(${token})`,
                    border: "1px solid var(--color-line-strong)",
                    flexShrink: 0,
                  }}
                />
                <span>
                  <span className="t-label" style={{ display: "block" }}>{token}</span>
                  <span className="t-small" style={{ display: "block" }}>{use}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TYPE */}
      <section className="section">
        <Reveal><h2 className="t-h2">Typography</h2></Reveal>
        <Reveal delay={1}>
          <p className="t-body" style={{ marginTop: "var(--space-4)" }}>
            Space Grotesk for everything you read. Space Mono for labels and numbers.
            Two weights: 500 and 700. Never 600.
          </p>
        </Reveal>
        <div style={{ marginTop: "var(--space-8)" }}>
          {TYPE.map(([cls, label, spec], i) => (
            <Reveal key={cls} delay={1}>
              <div
                style={{
                  borderTop: "1px solid var(--color-line)",
                  paddingBlock: "var(--space-6)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                  <span className="t-label">.{cls}</span>
                  <span className="t-label">{spec}</span>
                </div>
                <p className={cls} style={{ marginTop: "var(--space-3)" }}>{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SPACING */}
      <section className="section">
        <Reveal><h2 className="t-h2">Spacing</h2></Reveal>
        <Reveal delay={1}>
          <p className="t-body" style={{ marginTop: "var(--space-4)" }}>
            4px base. Only these steps. No arbitrary margins.
          </p>
        </Reveal>
        <div style={{ marginTop: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {SPACE.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <span className="t-label" style={{ width: 96, flexShrink: 0 }}>space-{s}</span>
              <span style={{ height: 10, width: `var(--space-${s})`, background: "var(--color-accent)", borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </section>

      {/* IMAGES */}
      <section className="section">
        <Reveal><h2 className="t-h2">Images</h2></Reveal>
        <Reveal delay={1}>
          <p className="t-body" style={{ marginTop: "var(--space-4)" }}>
            Every image sits in a <strong>frame</strong>, uses one of four fixed
            ratios, and carries a <strong>caption that explains why</strong> — never
            just what. An image with no caption does not ship.
          </p>
        </Reveal>
        <div className="grid-2" style={{ marginTop: "var(--space-8)" }}>
          <figure className="figure">
            <div className="frame frame--empty ratio-wide">ratio-wide · 16 / 9</div>
            <figcaption className="caption">
              Default for screens and full-bleed work.
            </figcaption>
          </figure>
          <figure className="figure">
            <div className="frame frame--empty ratio-phone">ratio-phone · 9 / 16</div>
            <figcaption className="caption">Mobile screens only.</figcaption>
          </figure>
        </div>
      </section>

      {/* MOTION */}
      <section className="section">
        <Reveal><h2 className="t-h2">Motion</h2></Reveal>
        <Reveal delay={1}>
          <p className="t-body" style={{ marginTop: "var(--space-4)" }}>
            One reveal, used everywhere: fade + 26px rise, 0.8s, ease-out, triggered
            once at 15% in view. Transform and opacity only. Disabled entirely when
            the visitor prefers reduced motion. Everything on this page is using it.
          </p>
        </Reveal>
        <Reveal delay={2}>
          <div
            style={{
              marginTop: "var(--space-6)", border: "1px solid var(--color-line)",
              borderRadius: "var(--radius-md)", padding: "var(--space-6)",
              fontFamily: "var(--font-mono)", fontSize: "var(--text-small)",
              color: "var(--color-muted)", lineHeight: 1.8,
            }}
          >
            duration-fast 0.2s · duration-base 0.4s · duration-slow 0.8s
            <br />
            ease-out cubic-bezier(0.2, 0.7, 0.2, 1)
          </div>
        </Reveal>
      </section>
    </main>
  );
}
