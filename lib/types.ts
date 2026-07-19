/* ============================================================
   CASE STUDY SCHEMA
   The whole page is data. Renderer and editor both read this.
   Stored as JSONB in Supabase; safe to version.
   ============================================================ */

export type BlockKind =
  | "heading" | "paragraph" | "list" | "pullquote" | "quote"
  | "image" | "gallery" | "beforeAfter" | "video" | "pdf" | "figma"
  | "stat" | "decision" | "table" | "button" | "divider" | "meta";

export type Ratio = "wide" | "page" | "square" | "phone";

export type Block =
  | { id: string; kind: "heading";   level: 2 | 3; text: string }
  | { id: string; kind: "paragraph"; text: string }
  | { id: string; kind: "list";      items: string[] }
  | { id: string; kind: "pullquote"; text: string }
  | { id: string; kind: "quote";     text: string; attribution?: string }
  /** fit "natural" (default) shows the whole image; "crop" forces the ratio.
      framed = the bordered plate; off for mockups that carry their own edge.
      size   = how much of the column (or beyond it) the image takes. */
  | { id: string; kind: "image";     src: string; alt: string; caption: string; ratio: Ratio;
      fit?: "natural" | "crop"; framed?: boolean; size?: "narrow" | "column" | "wide" }
  | { id: string; kind: "gallery";   items: { src: string; alt: string }[]; caption: string; ratio: Ratio; fit?: "natural" | "crop" }
  | { id: string; kind: "beforeAfter"; before: string; after: string; caption: string; ratio?: Ratio; fit?: "natural" | "crop" }
  | { id: string; kind: "video";     src: string; poster: string; caption: string }
  | { id: string; kind: "pdf";       src: string; label: string }
  | { id: string; kind: "figma";     src: string; caption: string }
  | { id: string; kind: "stat";      value: string; label: string }
  | { id: string; kind: "decision";  considered: { title: string; body: string };
                                     chosen:     { title: string; body: string }; tradeoff: string }
  | { id: string; kind: "table";     head: string[]; rows: string[][] }
  | { id: string; kind: "button";    label: string; href: string }
  | { id: string; kind: "divider" }
  /** Role / Shipped / Platform / Team — add it where you want it, or not at all. */
  | { id: string; kind: "meta"; items: { label: string; value: string }[] };

/** Column widths available for a row. */
export type RowLayout = "1" | "1-1" | "1-1-1" | "1-1-1-1" | "2-1" | "1-2";

export type Row = { id: string; layout: RowLayout; cells: Block[][] };

export type Section = {
  id: string;
  title?: string;
  /** Optional glyph beside the title — see components/ui/Icon. */
  icon?: string;
  number?: string;
  rows: Row[];
};

/* ============================================================
   THE HIERARCHY

   Project  ── name · logo · description
      └── CaseStudy (1..n)  ── title · meta · problem
             └── Section (0..n)
                    └── Row → cells → Block

   Project data lives in ONE place. Change the logo once and every
   case study under it changes.
   ============================================================ */

export type Project = {
  slug: string;
  name: string;
  logo?: string;
  /** How the project appears on the board on the landing page.

      Deliberately separate from `cover`. The cover is the full-bleed
      opening of the project page and is sized for that: a wide video or a
      large screenshot. A card is a small tile in a grid, seen at a fraction
      of the size, and often wants a different crop or a different image
      entirely. Reusing one asset for both means one of the two is always
      wrong, and it means the landing page pays to download something built
      for a page nobody has opened yet. */
  card?: {
    kind: "image" | "video";
    src: string;
    poster?: string;
  };

  /** Full-bleed cover at the very top of the page — image or video. */
  cover?: {
    kind: "image" | "video";
    src: string;
    poster?: string;
    /** "fill" crops to a band; "fit" shows the whole frame. */
    fit?: "fill" | "fit";
  };
  /** One line beside the logo — what the company is. */
  slogan?: string;
  /** The longer paragraph, full width below. */
  description: string;

  /* ---- your time there, above any single case study ---- */
  role?: string;      // "Senior Product Designer"
  period?: string;    // "Oct 2022 – Oct 2024"
  /** A few paragraphs: the company, your remit, what changed while you were there. */
  intro?: string;
  /** Composable intro content — cover, video, outcomes, anything.
      Same block system as a case study, so there is only one to learn. */
  sections?: Section[];

  order?: number;
};

export type CaseStudy = {
  slug: string;
  projectSlug: string;

  /** The only fixed field — the tab needs a label and the page needs a name. */
  title: string;

  /** Everything else is yours to compose. */
  sections: Section[];

  /** What search engines and link previews actually use. */
  seo?: { title?: string; description?: string; ogImage?: string };

  status: "draft" | "published";
  order?: number;
  updatedAt: string;
};

export const CELLS_PER_LAYOUT: Record<RowLayout, number> = {
  "1": 1, "1-1": 2, "1-1-1": 3, "1-1-1-1": 4, "2-1": 2, "1-2": 2,
};

export const GRID_FOR_LAYOUT: Record<RowLayout, string> = {
  "1": "1fr",
  "1-1": "1fr 1fr",
  "1-1-1": "1fr 1fr 1fr",
  "1-1-1-1": "1fr 1fr 1fr 1fr",
  "2-1": "2fr 1fr",
  "1-2": "1fr 2fr",
};

export const uid = () => Math.random().toString(36).slice(2, 10);

/** A new block, pre-filled so nothing renders empty. */
export function newBlock(kind: BlockKind): Block {
  const id = uid();
  switch (kind) {
    case "heading":   return { id, kind, level: 2, text: "Section heading" };
    case "paragraph": return { id, kind, text: "Write the thinking here — what you decided and why." };
    case "list":      return { id, kind, items: ["First point", "Second point"] };
    case "pullquote": return { id, kind, text: "The line you want remembered." };
    case "quote":     return { id, kind, text: "What someone actually said.", attribution: "Source" };
    case "image":     return { id, kind, src: "", alt: "", caption: "Explain why this matters — not what it is.", ratio: "wide", fit: "natural", framed: true, size: "column" };
    case "gallery":   return { id, kind, items: [{ src: "", alt: "" }, { src: "", alt: "" }], caption: "", ratio: "wide", fit: "natural" };
    case "beforeAfter": return { id, kind, before: "", after: "", caption: "Drag to compare.", ratio: "wide", fit: "natural" };
    case "video":     return { id, kind, src: "", poster: "", caption: "" };
    case "pdf":       return { id, kind, src: "", label: "Download the PDF" };
    case "figma":     return { id, kind, src: "", caption: "Prototype is view-only." };
    case "stat":      return { id, kind, value: "58% → 13%", label: "what changed, in one line" };
    case "decision":  return { id, kind,
                        considered: { title: "Option A", body: "What you considered." },
                        chosen:     { title: "Option B", body: "What you chose." },
                        tradeoff:   "The trade-off you accepted." };
    case "table":     return { id, kind, head: ["Before", "After"], rows: [["…", "…"]] };
    case "button":    return { id, kind, label: "See it live", href: "#" };
    case "divider":   return { id, kind };
    case "meta":      return { id, kind, items: [
                        { label: "Shipped", value: "" },
                        { label: "Platform", value: "" },
                        { label: "Team", value: "" },
                      ] };
  }
}

export const BLOCK_LABELS: Record<BlockKind, string> = {
  heading: "Heading", paragraph: "Paragraph", list: "Bullet list",
  pullquote: "Pull quote", quote: "Quote", image: "Image", gallery: "Gallery",
  beforeAfter: "Before / after", video: "Video", pdf: "PDF", figma: "Figma",
  stat: "Stat card", decision: "Decision A/B", table: "Table",
  button: "Link button", divider: "Divider", meta: "Meta grid",
};
