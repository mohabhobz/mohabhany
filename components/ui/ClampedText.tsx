"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A paragraph that clamps, and only offers "See more" when it actually clamped.
 *
 * The clamp itself lives in CSS and only applies below 720px, so on a desktop
 * this measures no overflow and renders no button. That is the point of doing
 * it by measurement rather than by string length: the same component is
 * correct at every width, and nothing has to guess where the text wraps.
 *
 * The measurement is scrollHeight against clientHeight. A -webkit-box clamp
 * leaves the full text in the box and hides the overflow, so the two differ
 * by exactly the hidden lines. One pixel of slack absorbs sub-pixel line
 * heights, which are common with a clamp() type scale.
 */
export function ClampedText({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // While open the box is its full height and nothing overflows, so the
      // answer would always be "no". Leave the last collapsed reading alone.
      if (open) return;
      setClipped(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    // Rotating the phone or resizing the window changes where the text wraps,
    // and crossing 720px turns the clamp on or off entirely.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, children]);

  return (
    <>
      <p ref={ref} className={`t-body entry__line${open ? " is-open" : ""}`}>
        {children}
      </p>
      {clipped && (
        <button
          type="button"
          className="t-label line-more"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "See less" : "See more"}
        </button>
      )}
    </>
  );
}
