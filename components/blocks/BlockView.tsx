"use client";

import { useEffect, useRef, useState } from "react";
import type { Block } from "@/lib/types";
import { useLightbox } from "@/components/ui/Lightbox";

/* Design-system frame. Every visual block goes through this.
   natural = show the whole image; crop = force the chosen ratio. */
/**
 * A cropped frame is a WINDOW, not a crop.
 *
 * The image sits at full width and its own natural height, and the frame
 * scrolls. A tall page screenshot therefore stays readable in place: you
 * can run down the whole page without opening the lightbox, and the layout
 * still holds the ratio you chose.
 *
 * object-fit: cover would have thrown the rest of the image away. Keeping
 * it and letting the frame scroll costs nothing and loses nothing.
 *
 * `focus` sets where the window starts. Top is the default because a page
 * screenshot that opens halfway down has hidden the header, which is the
 * part that says what screen this is.
 */
/**
 * Content scale, applied at render time rather than baked into the stored URL,
 * so a change in the studio shows up immediately instead of rewriting every
 * saved link.
 *
 * Figma splits this across two parameters. "Responsive" is `content-scaling`;
 * everything else is `scaling` with `content-scaling` left at its default. The
 * editor offers one list in Figma's own wording and this is where that single
 * choice is turned back into the right parameter.
 * https://developers.figma.com/docs/embeds/embed-figma-prototype/
 */
function protoSrc(src: string, scaling?: string): string {
  try {
    const u = new URL(src);
    if (scaling === "responsive") {
      u.searchParams.set("content-scaling", "responsive");
      u.searchParams.delete("scaling");
    } else if (scaling) {
      u.searchParams.set("scaling", scaling);
      u.searchParams.delete("content-scaling");
    }
    return u.toString();
  } catch {
    /* The caller already checks for https:// and shows its own warning, so a
       URL that will not parse is handed back untouched rather than swallowed. */
    return src;
  }
}

function Frame({ ratio, fit, framed = true, focus, children }: {
  ratio?: string; fit?: "natural" | "crop"; framed?: boolean;
  focus?: "top" | "center" | "bottom";
  children: React.ReactNode;
}) {
  const natural = (fit ?? "natural") === "natural";
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (natural || !el) return;
    /* After the image reports its height, put the window where it was asked
       to start. Runs on load rather than on mount: at mount the image has no
       height yet and every position resolves to zero. */
    const place = () => {
      const over = el.scrollHeight - el.clientHeight;
      if (over <= 0) return;
      el.scrollTop = focus === "bottom" ? over : focus === "center" ? over / 2 : 0;
    };
    place();
    const img = el.querySelector("img");
    img?.addEventListener("load", place);
    return () => img?.removeEventListener("load", place);
  }, [natural, focus]);

  const cls = [
    "frame",
    natural ? "frame--natural" : `ratio-${ratio ?? "wide"} frame--scroll`,
    framed ? "" : "frame--bare",
  ].filter(Boolean).join(" ");

  return <div ref={box} className={cls}>{children}</div>;
}
function Empty({ label }: { label: string }) {
  return <div className="frame--empty" style={{ position: "absolute", inset: 0 }}>{label}</div>;
}

function BeforeAfter({ before, after, fit = "natural", ratio = "wide" }: {
  before: string; after: string;
  fit?: "natural" | "crop"; ratio?: string;
}) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  const natural = fit === "natural";

  /* In natural mode the BEFORE image sits in normal flow and sets the height,
     so a tall screenshot is never sliced. The AFTER image is laid over it —
     the two are the same export, so they line up exactly. */
  return (
    <div
      ref={box}
      className={natural ? "frame frame--natural" : `frame ratio-${ratio}`}
      style={{ position: "relative", cursor: "ew-resize", userSelect: "none" }}
      onMouseDown={(e) => { drag.current = true; move(e.clientX); }}
      onMouseMove={(e) => drag.current && move(e.clientX)}
      onMouseUp={() => (drag.current = false)}
      onMouseLeave={() => (drag.current = false)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      {before ? (
        <img src={before} alt="Before" loading="lazy" decoding="async"
          style={natural
            ? { width: "100%", height: "auto", display: "block" }
            : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div className="frame--empty" style={{ minHeight: 260 }}>BEFORE</div>
      )}

      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${pos}%)` }}>
        {after ? (
          <img src={after} alt="After" loading="lazy" decoding="async"
            style={{ width: "100%", height: "100%", objectFit: natural ? "fill" : "cover" }} />
        ) : (
          <div className="frame--empty" style={{ position: "absolute", inset: 0 }}>AFTER</div>
        )}
      </div>

      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, background: "var(--color-accent)" }}>
        <span style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 36, height: 36, borderRadius: "var(--radius-pill)", background: "var(--color-accent)",
          color: "var(--color-accent-ink)", display: "grid", placeItems: "center", fontSize: 14,
        }}>⇄</span>
      </div>
    </div>
  );
}

export function BlockView({ block }: { block: Block }) {
  const { open } = useLightbox();

  switch (block.kind) {
    case "heading":
      return block.level === 2
        ? <h2 className="t-h2">{block.text}</h2>
        : <h3 className="t-h3">{block.text}</h3>;

    case "paragraph":
      return <p className="t-body">{block.text}</p>;

    case "list":
      return (
        <ul className="t-list">
          {block.items.filter((it) => it.trim()).map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );

    case "pullquote":
      return (
        <p style={{
          borderLeft: "2px solid var(--color-accent)", paddingLeft: "var(--space-6)",
          fontSize: "var(--text-h3)", fontWeight: "var(--weight-medium)",
          lineHeight: 1.35, letterSpacing: "var(--tracking-snug)",
          maxWidth: "30ch", marginBlock: "var(--space-8)",
        }}>{block.text}</p>
      );

    case "quote":
      return (
        <blockquote style={{
          background: "var(--color-surface)", border: "1px solid var(--color-line)",
          borderRadius: "var(--radius-md)", padding: "var(--space-6)", maxWidth: "60ch",
        }}>
          <p style={{ fontSize: "var(--text-body)", lineHeight: 1.6 }}>{block.text}</p>
          {block.attribution && (
            <cite className="t-label" style={{ display: "block", marginTop: "var(--space-3)", fontStyle: "normal" }}>
              {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "image":
      return (
        <figure className={`figure img-${block.size ?? "column"}`}>
          <Frame ratio={block.ratio} fit={block.fit} framed={block.framed ?? true} focus={block.focus}>
            {block.src
              ? <img src={block.src} alt={block.alt} className="zoomable" loading="lazy" decoding="async"
                     onClick={() => open({ src: block.src, alt: block.alt })} />
              : <div className="frame--empty" style={{ minHeight: 220 }}>IMAGE</div>}
          </Frame>
          {block.caption && <figcaption className="caption">{block.caption}</figcaption>}
        </figure>
      );

    case "gallery":
      return (
        <figure className="figure">
          <div className={block.items.length > 2 ? "grid-3" : "grid-2"}>
            {block.items.map((it, i) => (
              <Frame key={i} ratio={block.ratio} fit={block.fit}>
                {it.src ? <img src={it.src} alt={it.alt} className="zoomable" loading="lazy" decoding="async"
                               onClick={() => open({ src: it.src, alt: it.alt })} />
                        : <div className="frame--empty" style={{ minHeight: 200 }}>IMAGE {i + 1}</div>}
              </Frame>
            ))}
          </div>
          {block.caption && <figcaption className="caption">{block.caption}</figcaption>}
        </figure>
      );

    case "beforeAfter":
      return (
        <figure className="figure">
          <BeforeAfter before={block.before} after={block.after} fit={block.fit} ratio={block.ratio} />
          {block.caption && <figcaption className="caption">{block.caption}</figcaption>}
        </figure>
      );

    case "video":
      return (
        <figure className="figure">
          <div className="frame ratio-wide">
            {block.src ? (
              /* preload=none + poster: the video costs nothing until played */
              <video
                src={block.src}
                poster={block.poster || undefined}
                controls
                preload="none"
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : <div className="frame--empty" style={{ height: "100%" }}>VIDEO</div>}
          </div>
          {block.caption && <figcaption className="caption">{block.caption}</figcaption>}
        </figure>
      );

    case "pdf":
      return (
        <a href={block.src || "#"} target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "var(--space-3)",
            border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)",
            padding: "var(--space-4) var(--space-6)", color: "var(--color-ink)",
          }}>
          <span aria-hidden="true">↓</span>
          <span>{block.label}</span>
        </a>
      );

    case "figma":
      return (
        <figure className="figure">
          <div style={{ border: "1px solid var(--color-line)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {/^https:\/\//i.test(block.src) ? (
              /* A ratio, not a fixed height. The iframe is cross-origin, so
                 nothing here can measure the Figma frame inside it; the ratio
                 is set per block in the studio to match the frame it came
                 from. A fixed height was wrong twice over: it letterboxed a
                 phone flow and, at 620px on a 375px screen, left a desktop
                 prototype unreadable. */
              <iframe title="Figma prototype" src={protoSrc(block.src, block.scaling)}
                style={{
                  width: "100%",
                  aspectRatio: block.ratio || "16 / 10",
                  border: 0, display: "block",
                }}
                allowFullScreen loading="lazy" />
            ) : (
              <div className="frame--empty" style={{ height: 260 }}>
                {block.src
                  ? "NOT A VALID URL — MUST START WITH HTTPS://"
                  : "FIGMA PROTOTYPE — PASTE THE LINK OR EMBED CODE"}
              </div>
            )}
          </div>
          {block.caption && <figcaption className="caption">{block.caption}</figcaption>}
        </figure>
      );

    case "stat":
      return (
        <div style={{
          border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)",
          padding: "var(--space-6)", background: "var(--color-surface)", height: "100%",
        }}>
          {/* Ink. Size and weight carry the emphasis here, not hue. */}
          <div style={{
            fontSize: "var(--text-h2)", fontWeight: "var(--weight-bold)",
            color: "var(--color-ink)", letterSpacing: "var(--tracking-tight)", lineHeight: 1.05,
          }}>{block.value}</div>
          <div className="t-small" style={{ marginTop: "var(--space-3)" }}>{block.label}</div>
        </div>
      );

    case "decision":
      return (
        <div className="grid-2">
          {[{ ...block.considered, win: false }, { ...block.chosen, win: true }].map((o, i) => (
            <div key={i} style={{
              border: `1px solid ${o.win ? "var(--color-accent)" : "var(--color-line)"}`,
              borderRadius: "var(--radius-md)", padding: "var(--space-6)", background: "var(--color-surface)",
            }}>
              <div className="t-label" style={{ color: o.win ? "var(--color-accent-text)" : undefined }}>
                {o.win ? "CHOSEN" : "CONSIDERED"}
              </div>
              <h4 className="t-h3" style={{ marginBlock: "var(--space-3)" }}>{o.title}</h4>
              <p className="t-small">{o.body}</p>
            </div>
          ))}
          {block.tradeoff && (
            <p className="t-body" style={{ gridColumn: "1 / -1", marginTop: "var(--space-2)" }}>
              <strong>The trade-off:</strong> {block.tradeoff}
            </p>
          )}
        </div>
      );

    case "table":
      return (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--color-line)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <thead>
            <tr>{block.head.map((h, i) => (
              <th key={i} className="t-label" style={{ textAlign: "left", padding: "var(--space-4)", background: "var(--color-surface)", borderBottom: "1px solid var(--color-line)" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {block.rows.map((r, ri) => (
              <tr key={ri}>{r.map((c, ci) => (
                <td key={ci} className="t-small" style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-line)", verticalAlign: "top" }}>{c}</td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      );

    case "button": {
      /* Anything off-site opens in its own tab — a visitor who follows a link
         to the live product should still have the case study behind them.
         Anchors and internal paths stay in place. */
      const external = /^https?:\/\//i.test(block.href);
      return (
        <a
          href={block.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer noopener" : undefined}
          style={{
          display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
          border: "1px solid var(--color-accent)", color: "var(--color-accent-text)",
          borderRadius: "var(--radius-pill)", padding: "var(--space-3) var(--space-6)",
        }}>
          {block.label}
          <span aria-hidden="true">{external ? "↗" : "→"}</span>
          {external && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      );
    }

    case "divider":
      return <hr style={{ border: 0, borderTop: "1px solid var(--color-line)", marginBlock: "var(--space-8)" }} />;

    case "meta":
      return (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "var(--space-6)", paddingTop: "var(--space-6)",
          borderTop: "1px solid var(--color-line)",
        }}>
          {block.items.map((m, i) => (
            <div key={i}>
              <div className="t-label">{m.label}</div>
              <div style={{ marginTop: 6 }}>{m.value}</div>
            </div>
          ))}
        </div>
      );
  }
}
