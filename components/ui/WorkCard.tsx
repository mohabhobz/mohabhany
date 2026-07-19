"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project, CaseStudy } from "@/lib/types";

/**
 * A project as a card on the board.
 *
 * The cover is the same asset the project page opens with, so the card is
 * a preview of the thing rather than a separate piece of art to maintain.
 *
 * Video covers do not autoplay. Fourteen cards each decoding video on load
 * would cost more than the rest of the page combined, and a wall of
 * competing motion is not a board, it is a distraction. They play on
 * hover, one at a time, which is also the only moment anyone is looking.
 */
export function WorkCard({ project, studies }: { project: Project; studies: CaseStudy[] }) {
  const vid = useRef<HTMLVideoElement>(null);
  const href = studies[0] ? `/case-study/${studies[0].slug}` : "/work";
  const cover = project.cover;

  return (
    <Link
      href={href}
      className="card"
      onMouseEnter={() => vid.current?.play().catch(() => {})}
      onMouseLeave={() => { const v = vid.current; if (v) { v.pause(); v.currentTime = 0; } }}
    >
      <span className="card__media">
        {cover?.kind === "video" ? (
          <video
            ref={vid}
            src={cover.src}
            poster={cover.poster || undefined}
            muted loop playsInline preload="metadata"
          />
        ) : cover?.src ? (
          <img src={cover.src} alt="" loading="lazy" />
        ) : (
          <span className="card__media--empty" />
        )}
      </span>

      <span className="card__body">
        <span className="logo-plate card__logo">
          {project.logo
            ? <img src={project.logo} alt="" />
            : <span className="t-label">{project.name.slice(0, 2)}</span>}
        </span>

        <span className="card__text">
          <span className="t-h3">{project.name}</span>
          {project.slogan && <span className="t-small card__slogan">{project.slogan}</span>}
        </span>
      </span>

      {studies.length > 0 && (
        <span className="card__tags">
          {studies.map((c) => (
            <span key={c.slug} className="t-label card__tag">{c.title}</span>
          ))}
        </span>
      )}
    </Link>
  );
}
