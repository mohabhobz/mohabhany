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
  const label = `Case ${studies.length === 1 ? "Study" : "Studies"}`;
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

      {/* The name is here rather than under the tile because a permanent
          caption made every card look the same regardless of the work in it.
          On hover it is information; underneath it was furniture.

          aria-hidden: the Link already carries aria-label={project.name}, and
          without this a screen reader reads the name twice. */}
      <span className="card__veil" aria-hidden="true">
        <span className="card__name">{project.name}</span>
        <span className="card__kind t-label">{label}</span>
      </span>
    </Link>
  );
}
