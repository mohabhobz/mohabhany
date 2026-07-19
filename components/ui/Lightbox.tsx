"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Shot = { src: string; alt: string };
type Ctx = { open: (shot: Shot) => void };

const LightboxCtx = createContext<Ctx>({ open: () => {} });
export const useLightbox = () => useContext(LightboxCtx);

/**
 * Two states, because a screenshot has two things worth seeing.
 *
 * FIT      the whole image at once, scaled to the viewport. This is where
 *          the preview opens: you came here to see the composition, and an
 *          image that opens already cropped has failed before you touch it.
 * ACTUAL   full width of the viewport, scrolled. This is where the detail
 *          is, and a tall page screenshot is unreadable any other way.
 *
 * Clicking the image toggles between them. The cursor says which way it
 * will go, so the affordance never has to be explained.
 */
export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [shot, setShot] = useState<Shot | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const open = useCallback((s: Shot) => { if (s.src) { setShot(s); setZoomed(false); } }, []);
  const close = useCallback(() => { setShot(null); setZoomed(false); }, []);

  useEffect(() => {
    if (!shot) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [shot, close]);

  /* Zooming into a tall screenshot should start at the top of it, not wherever
     the previous scroll position happened to be. */
  useEffect(() => {
    if (zoomed) scrollRef.current?.scrollTo({ top: 0 });
  }, [zoomed]);

  if (!shot) return <LightboxCtx.Provider value={{ open }}>{children}</LightboxCtx.Provider>;

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={shot.alt || "Image preview"}
        onClick={close}
        className="lb"
        data-zoomed={zoomed}
      >
        <div
          ref={scrollRef}
          className="lb__scroll"
          /* Only the backdrop closes. Clicks that land on the scrolling
             area while zoomed would otherwise close the preview mid-read. */
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <img
            src={shot.src}
            alt={shot.alt}
            className="lb__img"
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
          />
        </div>

        <button
          ref={closeRef}
          onClick={close}
          aria-label="Close preview"
          className="lb__close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <span className="t-label lb__hint">
          {zoomed
            ? "Scroll to read · click the image to fit · Esc to close"
            : "Click the image to zoom · Esc to close"}
        </span>
      </div>
    </LightboxCtx.Provider>
  );
}
