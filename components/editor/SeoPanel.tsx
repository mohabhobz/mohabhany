"use client";

import { useState } from "react";
import type { CaseStudy } from "@/lib/types";
import { Btn, Field } from "@/components/editor/ui";

/**
 * The fields search engines and link previews actually read.
 * Deliberately no "keywords" field — Google stopped reading meta keywords
 * in 2009, and filling one in is busywork that looks like SEO but isn't.
 */
export function SeoPanel({ doc, onChange, onUpload }: {
  doc: CaseStudy;
  onChange: (next: CaseStudy) => void;
  onUpload: (cb: (url: string) => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const seo = doc.seo ?? {};
  const set = (patch: Partial<NonNullable<CaseStudy["seo"]>>) =>
    onChange({ ...doc, seo: { ...seo, ...patch } });

  const title = seo.title || doc.title;
  const desc = seo.description ?? "";

  if (!open) return <Btn onClick={() => setOpen(true)}>SEO</Btn>;

  return (
    <div style={{
      position: "fixed", inset: "auto 0 0 0", zIndex: 60,
      background: "var(--color-surface)", borderTop: "1px solid var(--color-line)",
      padding: "var(--space-6) var(--gutter)", maxHeight: "70vh", overflowY: "auto",
    }}>
      <div style={{ maxWidth: "var(--width-prose)", marginInline: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <span className="t-label">Search &amp; sharing</span>
          <Btn onClick={() => setOpen(false)}>Close</Btn>
        </div>

        <Field label={`Page title — ${title.length}/60 characters`}
          value={seo.title ?? ""} onChange={(v) => set({ title: v })} />
        <Field label={`Description — ${desc.length}/155 characters`}
          value={desc} onChange={(v) => set({ description: v })} />

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <Btn tone="accent" onClick={() => onUpload((ogImage) => set({ ogImage }))}>
            ↑ Share image
          </Btn>
          {seo.ogImage && <span className="t-small">Set — 1200×630 works best</span>}
        </div>

        {/* What it will look like in results */}
        <div style={{
          border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)",
          padding: "var(--space-4)", background: "var(--color-bg)",
        }}>
          <div className="t-label" style={{ marginBottom: "var(--space-2)" }}>Preview</div>
          <div style={{ color: "var(--color-accent-text)", fontSize: 17 }}>
            {title.slice(0, 60) || "Untitled"}
          </div>
          <div className="t-small" style={{ marginTop: 4 }}>
            {desc.slice(0, 155) || "Add a description — this is the line people decide on."}
          </div>
        </div>

        <p className="t-small" style={{ marginTop: "var(--space-4)" }}>
          Alt text on each image matters as much as anything here — it is set on
          the image block itself.
        </p>
      </div>
    </div>
  );
}
