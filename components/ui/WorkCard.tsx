"use client";

import Link from "next/link";
import Image from "next/image";
import type { Project, CaseStudy } from "@/lib/types";
import { useUI } from "@/lib/lang";

/**
 * A project on the board: the media, then a name and one line under it.
 *
 * The tile used to be the image and nothing else, on the reasoning that the
 * cover already names the client. It does, but only to someone who recognises
 * the logo. A visitor scrolling six covers could not tell what any of them
 * were, which of them were case studies, or what he did on them, so the
 * strongest pages on this site sat behind an unlabelled picture.
 *
 * The caption is OUTSIDE the media, not an overlay on it. The old overlay
 * only appeared on hover, which made it invisible on a phone, and it sat on
 * top of the artwork, which is the one thing worth looking at.
 *
 * Every tile is 16/10, cropped from the centre. Tiles used to take their own
 * shape, measured from the file once it loaded, but the board is gapless now
 * and a mixed-ratio row leaves holes in it. Uniform tiles are what a solid
 * block costs. Compose covers to 16/10 rather than fighting the crop:
 * anything important near an edge gets cut.
 *
 * Images go through next/image, so the board downloads a file sized to the
 * tile rather than the full-resolution asset the project page uses.
 */
export function WorkCard({ project, studies }: { project: Project; studies: CaseStudy[] }) {
  const t = useUI();
  const href = `/case-study/${studies[0].slug}`;
  /* `studies` arrives already filtered to published, so this counts what the
     visitor can actually reach. Counting every study would promise pages that
     do not exist yet. */
  /* The dedicated card asset if there is one, otherwise the project cover.
     The fallback matters: without it a project shows an empty tile until
     someone remembers to upload a second image, and a board full of
     placeholders is worse than a board of covers that are merely not
     ideally cropped. */
  /* Fall back on the SRC, not on the object. The editor writes an empty
     { kind, src: "" } when a card is removed or never set, and `card ??
     cover` treats that as a card, so a project with a cover and no card
     showed a blank tile with no way to tell why. */
  const card = project.card?.src ? project.card : project.cover;

  return (
    <Link href={href} className="card" aria-label={project.name}>
      <span className="card__media">
        {card?.kind === "video" ? (
          /* Plays on its own, always. A card that only moves on hover reads
             as a still image to anyone scrolling past it. */
          <video
            src={card.src}
            poster={card.poster || undefined}
            autoPlay muted loop playsInline preload="metadata"
          />
        ) : card?.src ? (
          <Image
            src={card.src}
            alt={project.name}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 420px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="card__media--empty" />
        )}

        {/* On the media, bottom left, over a gradient that only exists where
            they sit. They are metadata about the tile, so they belong on the
            tile; under the caption they pushed every card taller and only
            some cards had them, which broke the row heights. */}
        {!!project.tags?.length && (
          <span className="card__tags">
            {project.tags.includes("solo") && (
              <span className="card__tag t-label">{t("builtSolo")}</span>
            )}
            {project.tags.includes("ai") && (
              <span className="card__tag t-label" data-accent>{t("usesAI")}</span>
            )}
          </span>
        )}
      </span>

      {/* Name, then the project's own one-line slogan. No "Case Study" label:
          under a heading that reads "Selected projects", a link saying it is
          a case study says nothing a reader has not worked out. */}
      <span className="card__caption">
        <span className="card__name t-body">{project.name}</span>
        {project.slogan && (
          <span className="card__line t-small">{project.slogan}</span>
        )}
      </span>
    </Link>
  );
}
