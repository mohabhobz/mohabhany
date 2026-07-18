import { Reveal } from "@/components/ui/Reveal";

export default function Home() {
  return (
    <main className="page" style={{ paddingBlock: "var(--space-32)" }}>
      <Reveal>
        <p className="t-label">Hobz — portfolio</p>
      </Reveal>
      <Reveal delay={1}>
        <h1 className="t-display" style={{ marginTop: "var(--space-4)" }}>
          Design, measured<span className="dot">.</span>
        </h1>
      </Reveal>
      <Reveal delay={2}>
        <p className="t-lead" style={{ marginTop: "var(--space-6)" }}>
          Foundation is in place. The design system is live at{" "}
          <a href="/design-system" style={{ color: "var(--color-accent)" }}>
            /design-system
          </a>
          . Content and sections come next.
        </p>
      </Reveal>
    </main>
  );
}
