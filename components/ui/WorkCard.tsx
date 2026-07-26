import Link from "next/link";
import Image from "next/image";
import type { Project, CaseStudy } from "@/lib/types";

/**
 * A project on the board: the media, and nothing else.
 *
 * No logo, no title, no tags. The cover already says which project this is,
 * and repeating it underneath was three labels competing with the one thing
 * worth looking at, which made every card the same regardless of the work
 * inside it.
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
  const href = `/case-study/${studies[0].slug}`;
  /* `studies` arrives already filtered to published, so this counts what the
     visitor can actually reach. Counting every study would promise pages that
     do not exist yet. */
  /* The dedicated card asset if there is one, otherwise the project cover.
     The fallback matters: without it a project shows an empty tile until
     someone remembers to upload a second image, and a board full of
     placeholders is worse than a board of covers that are merely not
     ideally cropped. */
  const card = project.card ?? project.cover;

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
      </span>

      {/* No overlay, no name, no label.

          The name was on the tile twice: once in this caption and once in the
          cover artwork, which carries the client's own logo. The word "Case
          Study" was a third thing, saying what a link under a heading that
          reads "Selected projects" already says.

          It also could not work on a phone. The caption only appeared on
          hover, so on touch it was invisible, and the accessible name of the
          link never depended on it: the Link carries aria-label already. */}
    </Link>
  );
}
