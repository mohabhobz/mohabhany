"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/types";
import { Btn, DeleteBtn } from "@/components/editor/ui";

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

  if (!hasCover && !editing) return null;

  return (
    <>
      <div className={hasCover ? `cover cover--${fit}` : "cover cover--empty"}>
        {hasCover && cover.kind === "video" ? (
          <video
            ref={videoRef}
            src={cover.src}
            poster={cover.poster || undefined}
            autoPlay loop playsInline
            muted
            controls={false}
            disablePictureInPicture
            preload="metadata"
          />
        ) : hasCover ? (
          <img src={cover.src} alt="" />
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
                title="Full width, lightly cropped — hints at content below"
              >Standard</Btn>
              <Btn
                tone={fit === "fill" ? "accent" : undefined}
                onClick={() => onChange({ ...project, cover: { ...cover, fit: "fill" } })}
                title="Tall cinematic band — crops more"
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
