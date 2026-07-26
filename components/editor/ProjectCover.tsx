"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { Btn, DeleteBtn } from "@/components/editor/ui";
import { useSiteReady } from "@/components/ui/Loading";
import { useCoverInk } from "@/lib/useCoverInk";

export function ProjectCover({ project, editing, onChange, onUpload }: {
  project: Project;
  editing: boolean;
  onChange: (next: Project) => void;
  onUpload: (cb: (url: string) => void) => void;
}) {
  const cover = project.cover;
  const hasCover = !!cover?.src;
  const fit = cover?.fit ?? "fit";
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  /**
   * React's `muted` prop is unreliable — it renders as an attribute, and
   * browsers read the DOM *property*. A cover video must never make noise,
   * so set it directly and keep it set.
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    const enforce = () => { v.muted = true; v.volume = 0; };
    v.addEventListener("volumechange", enforce);
    return () => v.removeEventListener("volumechange", enforce);
  }, [cover?.src]);

  /**
   * Starts the cover once the loading screen is gone.
   *
   * autoPlay is deliberately NOT on the element: it fires the moment the
   * video mounts, which is behind the overlay, so the opening seconds play
   * to nobody and the visitor meets the cover already halfway through.
   *
   * This effect is declared AFTER the muted effect above and that order
   * matters. Effects run in declaration order, and a browser rejects play()
   * on a video it does not yet consider muted, so starting it first would
   * fail every time and fail silently.
   *
   * The catch is required for the same reason: play() rejects in cases we
   * cannot detect from here, such as a device in low power mode, and an
   * unhandled rejection would surface in the console of anyone who opens
   * dev tools on this site.
   */
  const ready = useSiteReady();
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !ready) return;
    v.play().catch(() => {});
  }, [ready, cover?.src]);

  /* Fades the scroll cue out once the reader has taken the hint. */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The mark reads whichever cover is showing, video or image, and only
     while the cover is under it. Once scrolled past, active goes false, the
     attribute is cleared, and the mark returns to the theme ink. */
  const isVideoCover = hasCover && cover?.kind === "video";
  useCoverInk(isVideoCover ? videoRef : imgRef, hasCover && !scrolled);

  if (!hasCover && !editing) return null;

  return (
    <>
      <div className={hasCover
        ? `cover cover--${fit} cover--sticky${scrolled ? " is-scrolled" : ""}`
        : "cover cover--empty"}>
        {hasCover && cover.kind === "video" ? (
          <video
            ref={videoRef}
            src={cover.src}
            poster={cover.poster || undefined}
            loop playsInline
            muted
            controls={false}
            disablePictureInPicture
            preload="metadata"
          />
        ) : hasCover ? (
          <img ref={imgRef} src={cover.src} alt="" />
        ) : (
          <span className="t-label">Cover — image or video</span>
        )}

        {hasCover && (
          <span className="scroll-cue" aria-hidden="true">
            <span className="bar" />
            <span className="t-label">Scroll</span>
          </span>
        )}
      </div>

      {editing && (
        <div className="page" style={{
          display: "flex", gap: "var(--space-2)", flexWrap: "wrap",
          paddingTop: "var(--space-4)", alignItems: "center",
        }}>
          <Btn tone="accent" onClick={() => onUpload((src) =>
            onChange({ ...project, cover: { kind: "image", src, fit } }))}>
            ↑ Cover image
          </Btn>
          <Btn tone="accent" onClick={() => onUpload((src) =>
            onChange({ ...project, cover: { kind: "video", src, poster: cover?.poster, fit } }))}>
            ↑ Cover video
          </Btn>

          {/* The board tile is its own asset, not a crop of the cover. */}
          <span className="t-label" style={{ marginLeft: "var(--space-2)" }}>Board card:</span>
          <Btn onClick={() => onUpload((src) =>
            onChange({ ...project, card: { kind: "image", src } }))}>
            ↑ Card image
          </Btn>
          <Btn onClick={() => onUpload((src) =>
            onChange({ ...project, card: { kind: "video", src, poster: project.card?.poster } }))}>
            ↑ Card video
          </Btn>
          {project.card && (
            <DeleteBtn label="Remove card"
              onConfirm={() => onChange({ ...project, card: undefined })} />
          )}
          {cover?.kind === "video" && (
            <Btn onClick={() => onUpload((poster) =>
              onChange({ ...project, cover: { ...cover, poster } }))}>
              ↑ Poster
            </Btn>
          )}

          {hasCover && (
            <>
              <span className="t-label" style={{ marginLeft: "var(--space-2)" }}>Frame:</span>
              <Btn
                tone={fit === "fit" ? "accent" : undefined}
                onClick={() => onChange({ ...project, cover: { ...cover, fit: "fit" } })}
                title="Full width, lightly cropped, hints at content below"
              >Standard</Btn>
              <Btn
                tone={fit === "fill" ? "accent" : undefined}
                onClick={() => onChange({ ...project, cover: { ...cover, fit: "fill" } })}
                title="Tall cinematic band, crops more"
              >Cinematic</Btn>

              <DeleteBtn label="Remove cover"
                onConfirm={() => onChange({ ...project, cover: undefined })} />
            </>
          )}
        </div>
      )}
    </>
  );
}
