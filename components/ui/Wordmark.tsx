import type { CSSProperties } from "react";

/**
 * The wordmark reads "Hobz" and rolls into "Mohab Hany" on hover or focus.
 *
 * Both labels sit in the SAME grid cell, so the box is always as wide as
 * the longer one and hovering can never move anything beside it.
 *
 * Each label is split into characters so the swap can be staggered: the
 * short mark rolls up and out while the full name rolls up into its place,
 * one letter behind the next. It reads as a single continuous upward
 * motion rather than two things crossfading through each other.
 *
 * Screen readers get the name once from aria-label. Splitting text into
 * per-character spans destroys it for assistive tech, which is exactly why
 * both labels are aria-hidden.
 */
function Letters({ text, variant }: { text: string; variant: "short" | "full" }) {
  return (
    <span className={`wordmark__part wordmark__part--${variant}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span
          key={i}
          className="wordmark__ch"
          style={{ "--i": i } as CSSProperties}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <a href={href} className="wordmark" aria-label="Mohab Hany, home">
      <Letters text="Hobz" variant="short" />
      <Letters text="Mohab Hany" variant="full" />
    </a>
  );
}
