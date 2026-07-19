"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { Project, CaseStudy } from "@/lib/types";

/**
 * A project as a card on the board.
 *
 * Uses `project.card`, which is its own asset — not the project cover. See
 * the note on the field in lib/types.ts for why they are separate.
 *
 * Images go through next/image, so what the browser downloads is sized to
 * the tile it lands in and served as AVIF or WebP. The full-resolution file
 * stays untouched on disk for the project page, which asks for it directly.
 * The board never pays for a 4K screenshot to draw a 340px card.
 *
 * Video cards do not autoplay. A dozen tiles each decoding video on load
 * would cost more than the rest of the page combined, and a wall of
 * competing motion is not a board, it is a distraction. They play on
 * hover, one at a time, which is the only moment anyone is looking.
 */
export function WorkCard({ project, studies }: { project: Project; studies: CaseStudy[] }) {
  const vid = useRef<HTMLVideoElement>(null);
  const href = studies[0] ? `/case-study/${studies[0].slug}` : "/work";
  const card = project.card;

  return (
    <Link
      href={href}
      className="card"
      onMouseEnter={() => vid.current?.play().catch(() => {})}
      onMouseLeave={() => { const v = vid.current; if (v) { v.pause(); v.currentTime = 0; } }}
    >
      <span className="card__media">
        {card?.kind === "video" ? (
          <video
            ref={vid}
            src={card.src}
            poster={card.poster || undefined}
            muted loop playsInline preload="none"
          />
        ) : card?.src ? (
          <Image
            src={card.src}
            alt=""
            fill
            /* One card is at most half the viewport on a laptop and the full
               width on a phone. Without this the browser assumes 100vw and
               downloads a file three times bigger than the tile. */
            sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 380px"
            style={{ objectFit: "cover" }}
          />
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
