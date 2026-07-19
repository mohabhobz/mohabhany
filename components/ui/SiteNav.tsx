"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";

const LINKS = [
  { id: "intro",      label: "Intro" },
  { id: "worked",     label: "Worked with" },
  { id: "work",       label: "Work" },
  { id: "background", label: "Background" },
  { id: "contact",    label: "Contact" },
];

/**
 * Sticky header with links that follow the scroll.
 *
 * An IntersectionObserver, not a scroll listener: the browser reports when
 * a section crosses the band rather than us recomputing positions on every
 * frame, so this costs nothing while scrolling.
 *
 * rootMargin narrows the viewport to a band just below the header. Without
 * it, two sections are usually "visible" at once and the active link flips
 * back and forth on the boundary.
 */
export function SiteNav() {
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const sections = LINKS
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className="site-nav">
      <Wordmark />

      <nav aria-label="Sections">
        <ul className="site-nav__list">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className="t-label site-nav__link"
                data-active={active === l.id}
                aria-current={active === l.id ? "true" : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
