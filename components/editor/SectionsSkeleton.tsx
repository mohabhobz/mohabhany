/**
 * Placeholder for case study content while it loads.
 * Roughly the shape of a real section, so the page doesn't jolt
 * when the content lands.
 */
export function SectionsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading case study" style={{ marginTop: "var(--space-16)" }}>
      <div className="skel" style={{ height: 34, width: "34%" }} />

      <div style={{ marginTop: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="skel" style={{ height: 14, width: "96%" }} />
        <div className="skel" style={{ height: 14, width: "88%" }} />
        <div className="skel" style={{ height: 14, width: "62%" }} />
      </div>

      <div className="skel" style={{ height: 300, marginTop: "var(--space-12)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-12)" }}>
        <div className="skel" style={{ height: 140 }} />
        <div className="skel" style={{ height: 140 }} />
        <div className="skel" style={{ height: 140 }} />
      </div>
    </div>
  );
}
