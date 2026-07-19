"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { Project, CaseStudy } from "@/lib/types";

/**
 * A project on the board: the media, and nothing else.
 *
 * No logo, no title, no tags. The cover already says which project this is
 * — repeating it underneath was three labels competing with the one thing
 * worth looking at, and it made every card the same regardless of the work
 * inside it.
 *
 * The tile takes the media's own shape. A fixed ratio would crop a phone
 * mockup to a letterbox and letterbox a landscape screenshot; both are
 * worse than an uneven grid. Ratio is measured once the file reports its
 * dimensions, with 16/10 held until then so nothing jumps.
 *
 * Images still go through next/image, so the board downloads a file sized
 * to the tile rather than the full-resolution asset the project page uses.
 */
export function WorkCard({ project, studies }: { project: Project; studies: CaseStudy[] }) {
  const [ratio, setRatio] = useState<string>();
  const href = `/case-study/${studies[0].slug}`;
  /* The dedicated card asset if there is one, otherwise the project cover.
     The fallback matters: without it a project shows an empty tile until
     someone remembers to upload a second image, and a board full of
     placeholders is worse than a board of covers that are merely not
     ideally cropped. */
  const card = project.card ?? project.cover;

  const style = { aspectRatio: ratio } as CSSProperties;

  return (
    <Link href={href} className="card" aria-label={project.name}>
      <span className="card__media" style={style}>
        {card?.kind === "video" ? (
          /* Plays on its own, always. A card that only moves on hover reads
             as a still image to anyone scrolling past it. */
          <video
            src={card.src}
            poster={card.poster || undefined}
            autoPlay muted loop playsInline preload="metadata"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth) setRatio(`${v.videoWidth} / ${v.videoHeight}`);
            }}
          />
        ) : card?.src ? (
          <Image
            src={card.src}
            alt={project.name}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 420px"
            style={{ objectFit: "cover" }}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth) setRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
            }}
          />
        ) : (
          <span className="card__media--empty" />
        )}
      </span>
    </Link>
  );
}
