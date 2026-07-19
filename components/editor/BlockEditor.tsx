"use client";

import type { Block } from "@/lib/types";
import { Btn, Field } from "@/components/editor/ui";

/**
 * Figma's "Copy embed code" hands you a whole <iframe> tag, and pasting that
 * into a src makes the browser treat it as a relative path — which is how you
 * end up staring at your own 404. Pull the URL out of whatever arrives.
 */
function figmaUrl(input: string): string {
  const v = input.trim();
  if (!v) return "";

  const fromIframe = v.match(/src=["']([^"']+)["']/i);
  const url = (fromIframe ? fromIframe[1] : v).trim();

  if (!/^https?:\/\//i.test(url)) return url;           // leave it, and warn below

  // A normal figma.com/proto link works as an embed once pointed at embed.figma.com
  try {
    const u = new URL(url);
    if (u.hostname === "www.figma.com" || u.hostname === "figma.com") {
      u.hostname = "embed.figma.com";
    }
    if (!u.searchParams.has("embed-host")) u.searchParams.set("embed-host", "share");
    return u.toString();
  } catch {
    return url;
  }
}

export function BlockEditor({ block, onChange, onUpload }: {
  block: Block; onChange: (b: Block) => void;
  onUpload: (cb: (url: string) => void) => void;
}) {
  const set = (patch: Partial<Block>) => onChange({ ...block, ...patch } as Block);
  const up = (label: string, on: (v: string) => void) => (
    <div style={{ marginBottom: "var(--space-3)" }}>
      <Btn onClick={() => onUpload(on)} tone="accent">↑ Upload {label}</Btn>
    </div>
  );
  const F = Field;

  switch (block.kind) {
    case "heading":   return <F label="Text" value={block.text} onChange={(v) => set({ text: v })} />;
    case "paragraph":
    case "pullquote": return <F label="Text" value={block.text} onChange={(v) => set({ text: v })} />;
    case "quote":     return <><F label="Quote" value={block.text} onChange={(v) => set({ text: v })} /><F label="Attribution" value={block.attribution ?? ""} onChange={(v) => set({ attribution: v })} /></>;
    case "list": return (
      <label style={{ display: "block" }}>
        <span className="t-label" style={{ display: "block", marginBottom: 4 }}>
          One item per line
        </span>
        <textarea
          value={block.items.join("\n")}
          onChange={(e) => set({ items: e.target.value.split("\n") })}
          rows={Math.max(4, block.items.length + 1)}
          style={{
            width: "100%", padding: "10px 12px", background: "var(--color-bg)",
            border: "1px solid var(--color-line)", borderRadius: "var(--radius-sm)",
            color: "var(--color-ink)", font: "inherit", fontSize: 14,
            lineHeight: 1.6, resize: "vertical",
          }}
        />
      </label>
    );
    case "image": return (
      <>
        <F label="Image URL" value={block.src} onChange={(v) => set({ src: v })} />
        {up("image", (v) => set({ src: v }))}
        <F label="Alt text, describe it for search and screen readers" value={block.alt} onChange={(v) => set({ alt: v })} />
        <F label="Caption, explain why" value={block.caption} onChange={(v) => set({ caption: v })} />
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span className="t-label">Fit:</span>
          <Btn tone={(block.fit ?? "natural") === "natural" ? "accent" : undefined}
               title="Show the whole image, nothing cropped"
               onClick={() => set({ fit: "natural" })}>Whole image</Btn>
          <Btn tone={block.fit === "crop" ? "accent" : undefined}
               title="Force a fixed ratio, crops to fill"
               onClick={() => set({ fit: "crop" })}>Crop</Btn>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span className="t-label">Size:</span>
          {([["narrow", "Narrow"], ["column", "Column"], ["wide", "Full width"]] as const).map(([v, label]) => (
            <Btn key={v} tone={(block.size ?? "column") === v ? "accent" : undefined}
                 onClick={() => set({ size: v })}>{label}</Btn>
          ))}
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span className="t-label">Border:</span>
          <Btn tone={(block.framed ?? true) ? "accent" : undefined}
               title="Bordered plate around the image"
               onClick={() => set({ framed: true })}>Framed</Btn>
          <Btn tone={(block.framed ?? true) === false ? "accent" : undefined}
               title="No border, for mockups that already have their own edge"
               onClick={() => set({ framed: false })}>Bare</Btn>
        </div>
        {block.fit === "crop" && (
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
            <span className="t-label">Ratio:</span>
            {(["wide", "page", "square", "phone"] as const).map((r) => (
              <Btn key={r} tone={block.ratio === r ? "accent" : undefined}
                   onClick={() => set({ ratio: r })}>{r}</Btn>
            ))}
          </div>
        )}
      </>
    );
    case "video":     return <><F label="Video URL" value={block.src} onChange={(v) => set({ src: v })} />{up("video", (v) => set({ src: v }))}<F label="Poster image" value={block.poster} onChange={(v) => set({ poster: v })} />{up("poster", (v) => set({ poster: v }))}<F label="Caption" value={block.caption} onChange={(v) => set({ caption: v })} /></>;
    case "beforeAfter": return (
      <>
        <F label="Before image" value={block.before} onChange={(v) => set({ before: v })} />
        {up("before", (v) => set({ before: v }))}
        <F label="After image" value={block.after} onChange={(v) => set({ after: v })} />
        {up("after", (v) => set({ after: v }))}
        <F label="Caption" value={block.caption} onChange={(v) => set({ caption: v })} />
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
          <span className="t-label">Frame:</span>
          <Btn tone={(block.fit ?? "natural") === "natural" ? "accent" : undefined}
               title="Full height of the screenshot, nothing cropped"
               onClick={() => set({ fit: "natural" })}>Whole image</Btn>
          <Btn tone={block.fit === "crop" ? "accent" : undefined}
               title="Force a fixed ratio, crops to fill"
               onClick={() => set({ fit: "crop" })}>Crop</Btn>
        </div>
        {block.fit === "crop" && (
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
            <span className="t-label">Ratio:</span>
            {(["wide", "page", "square", "phone"] as const).map((r) => (
              <Btn key={r} tone={block.ratio === r ? "accent" : undefined}
                   onClick={() => set({ ratio: r })}>{r}</Btn>
            ))}
          </div>
        )}
        <p className="t-small" style={{ marginTop: "var(--space-3)" }}>
          Both images must be the same dimensions, or the halves won&apos;t line up.
        </p>
      </>
    );
    case "figma": {
      const bad = !!block.src && !/^https:\/\//i.test(block.src);
      return (
        <>
          <F label="Figma link or embed code, either works"
             value={block.src}
             onChange={(v) => set({ src: figmaUrl(v) })} />
          {bad && (
            <p className="t-label" style={{ color: "#E5484D", marginBottom: "var(--space-3)" }}>
              That is not a full URL — it must start with https://
            </p>
          )}
          <F label="Caption" value={block.caption} onChange={(v) => set({ caption: v })} />
        </>
      );
    }
    case "pdf":       return <><F label="PDF URL" value={block.src} onChange={(v) => set({ src: v })} />{up("PDF", (v) => set({ src: v }))}<F label="Label" value={block.label} onChange={(v) => set({ label: v })} /></>;
    case "stat":      return <><F label="Value" value={block.value} onChange={(v) => set({ value: v })} /><F label="Label" value={block.label} onChange={(v) => set({ label: v })} /></>;
    case "button":    return <><F label="Label" value={block.label} onChange={(v) => set({ label: v })} /><F label="Link" value={block.href} onChange={(v) => set({ href: v })} /></>;
    case "decision":  return <>
        <F label="Considered, title" value={block.considered.title} onChange={(v) => set({ considered: { ...block.considered, title: v } })} />
        <F label="Considered, body" value={block.considered.body} onChange={(v) => set({ considered: { ...block.considered, body: v } })} />
        <F label="Chosen, title" value={block.chosen.title} onChange={(v) => set({ chosen: { ...block.chosen, title: v } })} />
        <F label="Chosen, body" value={block.chosen.body} onChange={(v) => set({ chosen: { ...block.chosen, body: v } })} />
        <F label="Trade-off" value={block.tradeoff} onChange={(v) => set({ tradeoff: v })} />
      </>;
    case "meta": return (
      <>
        {block.items.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-end" }}>
            <div style={{ flex: "0 0 34%" }}>
              <F label="Label" value={m.label}
                 onChange={(v) => set({ items: block.items.map((x, j) => j === i ? { ...x, label: v } : x) })} />
            </div>
            <div style={{ flex: 1 }}>
              <F label="Value" value={m.value}
                 onChange={(v) => set({ items: block.items.map((x, j) => j === i ? { ...x, value: v } : x) })} />
            </div>
            <div style={{ marginBottom: "var(--space-2)" }}>
              <Btn onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}>Remove</Btn>
            </div>
          </div>
        ))}
        <Btn onClick={() => set({ items: [...block.items, { label: "New", value: "" }] })}>+ Add field</Btn>
      </>
    );

    case "gallery": {
      const setItem = (i: number, patch: { src?: string; alt?: string }) =>
        set({ items: block.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });

      return (
        <>
          {block.items.map((it, i) => (
            <div key={i} style={{
              border: "1px solid var(--color-line)", borderRadius: "var(--radius-sm)",
              padding: "var(--space-4)", marginBottom: "var(--space-3)",
            }}>
              <span className="t-label" style={{ display: "block", marginBottom: "var(--space-3)" }}>
                Image {i + 1}
              </span>
              <F label="Image URL" value={it.src} onChange={(v) => setItem(i, { src: v })} />
              {up(`image ${i + 1}`, (v) => setItem(i, { src: v }))}
              <F label="Alt text" value={it.alt} onChange={(v) => setItem(i, { alt: v })} />
              {block.items.length > 1 && (
                <Btn onClick={() => set({ items: block.items.filter((_, j) => j !== i) })}>
                  Remove image
                </Btn>
              )}
            </div>
          ))}

          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <Btn tone="accent" onClick={() => set({ items: [...block.items, { src: "", alt: "" }] })}>
              + Image
            </Btn>
          </div>

          <F label="Caption, explain why" value={block.caption} onChange={(v) => set({ caption: v })} />

          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
            <span className="t-label">Frame:</span>
            <Btn tone={(block.fit ?? "natural") === "natural" ? "accent" : undefined}
                 title="Each image keeps its own shape"
                 onClick={() => set({ fit: "natural" })}>Whole image</Btn>
            <Btn tone={block.fit === "crop" ? "accent" : undefined}
                 title="Force one ratio so they line up"
                 onClick={() => set({ fit: "crop" })}>Crop to match</Btn>
          </div>
          {block.fit === "crop" && (
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-2)" }}>
              <span className="t-label">Ratio:</span>
              {(["wide", "page", "square", "phone"] as const).map((r) => (
                <Btn key={r} tone={block.ratio === r ? "accent" : undefined}
                     onClick={() => set({ ratio: r })}>{r}</Btn>
              ))}
            </div>
          )}
        </>
      );
    }

    case "table": {
      const cols = block.head.length;

      const setHead = (i: number, v: string) =>
        set({ head: block.head.map((h, j) => (j === i ? v : h)) });

      const setCell = (ri: number, ci: number, v: string) =>
        set({ rows: block.rows.map((r, i) => i === ri ? r.map((c, j) => (j === ci ? v : c)) : r) });

      const addRow = () => set({ rows: [...block.rows, Array(cols).fill("")] });
      const delRow = (ri: number) => set({ rows: block.rows.filter((_, i) => i !== ri) });

      const addCol = () => set({
        head: [...block.head, "Column"],
        rows: block.rows.map((r) => [...r, ""]),
      });
      const delCol = (ci: number) => set({
        head: block.head.filter((_, i) => i !== ci),
        rows: block.rows.map((r) => r.filter((_, i) => i !== ci)),
      });

      return (
        <>
          <span className="t-label" style={{ display: "block", marginBottom: "var(--space-3)" }}>
            Headers
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            {block.head.map((h, i) => (
              <div key={i} style={{ flex: 1 }}>
                <F label={`Column ${i + 1}`} value={h} onChange={(v) => setHead(i, v)} />
                {cols > 1 && (
                  <Btn onClick={() => delCol(i)}>Remove column</Btn>
                )}
              </div>
            ))}
          </div>

          <span className="t-label" style={{ display: "block", marginBottom: "var(--space-3)" }}>
            Rows
          </span>
          {block.rows.map((r, ri) => (
            <div key={ri} style={{
              display: "flex", gap: "var(--space-2)", alignItems: "flex-end",
              marginBottom: "var(--space-3)", paddingBottom: "var(--space-3)",
              borderBottom: "1px dashed var(--color-line)",
            }}>
              {r.map((c, ci) => (
                <div key={ci} style={{ flex: 1 }}>
                  <F label={block.head[ci] || `Column ${ci + 1}`} value={c}
                     onChange={(v) => setCell(ri, ci, v)} />
                </div>
              ))}
              <div style={{ marginBottom: "var(--space-2)" }}>
                <Btn onClick={() => delRow(ri)}>Remove row</Btn>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <Btn onClick={addRow} tone="accent">+ Row</Btn>
            <Btn onClick={addCol}>+ Column</Btn>
          </div>
        </>
      );
    }

    default: return null;
  }
}

