"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { useUI, type UIKey } from "@/lib/lang";

/* The label is a key, not a word. One list, two languages, and no way
   for the two to drift out of step. */
const LINKS: { id: string; key: UIKey }[] = [
  { id: "intro",      key: "navIntro" },
  { id: "worked",     key: "navWorked" },
  { id: "work",       key: "navWork" },
  { id: "ai",         key: "usesAI" },
  { id: "background", key: "navBackground" },
  { id: "consulting", key: "navConsulting" },
  { id: "contact",    key: "navContact" },
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
  const [open, setOpen] = useState(false);
  const t = useUI();

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

  /* Escape closes the mobile menu, the expected shortcut once it is open. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-nav" data-open={open}>
      <Wordmark />

      {/* The toggle only exists on mobile (hidden by CSS on wider screens).
          It is the same button throughout: the icon swaps between a menu and
          an X via CSS on [aria-expanded], so there is one control to reason
          about, not two that can disagree. */}
      <button
        type="button"
        className="site-nav__toggle"
        aria-expanded={open}
        aria-controls="site-nav-links"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="site-nav__toggle-bar" />
        <span className="site-nav__toggle-bar" />
      </button>

      <nav aria-label={t("sections")} id="site-nav-links" className="site-nav__nav">
        <ul className="site-nav__list">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className="t-label site-nav__link"
                data-active={active === l.id}
                aria-current={active === l.id ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                {t(l.key)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
