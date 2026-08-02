"use client";

import { useEffect, useRef, useState } from "react";
import { useLang, useUI } from "@/lib/lang";

const MOBILE = "(max-width: 720px)";
const LINES = 2;
/* The label is measured into the cut, so it has to be the one that will
   actually be printed. Arabic is longer here, and a cut computed against
   the English would overflow the second line the moment the page flips. */

/**
 * Two lines, then "See more" sitting at the end of the sentence.
 *
 * CSS line-clamp cannot do this. It hides the overflow and draws its own
 * ellipsis, and there is no position inside that ellipsis where a button can
 * be placed and still survive a reflow. So the cut is measured and the string
 * is actually shortened, which puts the link in the text where it belongs.
 *
 * The measuring happens in a detached copy at the same width and font, never
 * on the visible paragraph, so nothing flickers through intermediate states
 * while the binary search runs. It costs about seven layout reads per entry,
 * once, on mount.
 *
 * The link is styled in body type on purpose: measuring "…text… See more" as
 * one plain string is only accurate if the whole string is one font.
 */
export function ClampedText({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [cut, setCut] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const { lang } = useLang();
  const t = useUI();
  const MORE = t("more");
  const LESS = t("showLess");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia(MOBILE);

    const measure = () => {
      if (!mq.matches) {
        setCut(null); // desktop has the room; no cut, no link
        return;
      }

      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
      const max = lh * LINES + 1; // a pixel of slack for sub-pixel line heights
      const width = el.clientWidth;
      if (!width) return;

      // A copy, laid out but not painted, at the paragraph's exact width and
      // type. visibility:hidden still lays out; display:none would not.
      const probe = document.createElement("div");
      probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;top:0;left:-9999px;width:${width}px;font:${cs.font};letter-spacing:${cs.letterSpacing};line-height:${cs.lineHeight};white-space:normal;`;
      document.body.appendChild(probe);

      const fits = (s: string) => {
        probe.textContent = s;
        return probe.scrollHeight <= max;
      };

      try {
        if (fits(children)) {
          setCut(null);
          return;
        }
        // Largest prefix where prefix + the link still fits two lines.
        let lo = 0;
        let hi = children.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          if (fits(children.slice(0, mid) + `… ${MORE}`)) lo = mid;
          else hi = mid - 1;
        }
        setCut(lo);
      } finally {
        probe.remove();
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
    /* lang is in here on purpose: switching changes the words, the
       typeface and the line height at once, so a cut measured against
       the other language is wrong in both directions. */
  }, [children, lang, MORE]);

  // No cut needed, or not measured yet: the full sentence, which is also what
  // the server renders and what a reader without JS gets.
  if (cut === null) return <p ref={ref} className="t-body entry__line">{children}</p>;

  return (
    <p ref={ref} className="t-body entry__line">
      {open ? children : children.slice(0, cut).trimEnd()}
      {open ? " " : "… "}
      <button type="button" className="line-more" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? LESS : MORE}
      </button>
    </p>
  );
}
