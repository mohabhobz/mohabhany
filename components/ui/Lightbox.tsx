"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Shot = { src: string; alt: string };
type Ctx = { open: (shot: Shot) => void };

const LightboxCtx = createContext<Ctx>({ open: () => {} });
export const useLightbox = () => useContext(LightboxCtx);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [shot, setShot] = useState<Shot | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = useCallback((s: Shot) => { if (s.src) setShot(s); }, []);
  const close = useCallback(() => setShot(null), []);

  useEffect(() => {
    if (!shot) return;
    /* Escape is the key people reach for, and the page behind must not
       scroll away underneath the image. */
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

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}

      {shot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shot.alt || "Image preview"}
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "color-mix(in srgb, var(--color-bg) 94%, transparent)",
            backdropFilter: "blur(8px)",
            display: "grid", placeItems: "center",
            padding: "var(--space-8)",
            animation: "lb-in .2s var(--ease-out)",
          }}
        >
          {/* The original file at its own resolution — never a resized copy. */}
          <img
            src={shot.src}
            alt={shot.alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%", maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "var(--radius-md)",
              cursor: "default",
            }}
          />

          <button
            ref={closeRef}
            onClick={close}
            aria-label="Close preview"
            style={{
              position: "fixed", top: "var(--space-6)", right: "var(--space-6)",
              width: 44, height: 44, display: "grid", placeItems: "center",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-line-strong)",
              background: "var(--color-surface)", color: "var(--color-ink)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <span className="t-label" style={{
            position: "fixed", bottom: "var(--space-6)", left: "50%",
            transform: "translateX(-50%)",
          }}>
            Click anywhere or press Esc to close
          </span>
        </div>
      )}
    </LightboxCtx.Provider>
  );
}
