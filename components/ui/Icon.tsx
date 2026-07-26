/**
 * A closed set of section icons.
 *
 * Deliberately not an icon library: a fixed vocabulary keeps stroke weight,
 * corner radius and optical size identical everywhere, and stops the page
 * turning into a sticker album. This set covers a case study several times
 * over; the search in the studio is how you find the right one, not a licence
 * to add a hundred more.
 *
 * Every path is drawn on the same 24x24 grid with the same 1.5 stroke, so a
 * new one only looks right if it respects that grid. ICON_KEYWORDS is what the
 * studio search matches against, so an icon is findable by what it means, not
 * only by what it is called.
 */

export const ICONS = {
  // --- originals ---
  problem:    "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  research:   "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  insight:    "M9 18h6M10 22h4M15.1 14c.2-1 .7-1.6 1.5-2.4 1-.9 1.5-2.2 1.5-3.6a6 6 0 1 0-12 0c0 1.4.5 2.7 1.5 3.6.8.8 1.3 1.4 1.5 2.4",
  decision:   "M12 21V14M12 14L5 7M5 7h4M5 7v4M12 14L19 7M19 7h-4M19 7v4",
  structure:  "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  design:     "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.6 7.6M11 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  filter:     "M22 3H2l8 9.5V19l4 2v-8.5L22 3Z",
  price:      "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  outcome:    "M3 17l6-6 4 4 8-8M21 7h-5M21 7v5",
  users:      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  mobile:     "M5 2h14v20H5zM12 18h.01",
  map:        "M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3ZM9 3v15M15 6v15",
  search:     "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  layers:     "M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
  reflection: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16v-4M12 8h.01",
  speed:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",

  // --- added ---
  lock:       "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  shield:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  building:   "M3 21h18M6 21V4h12v17M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01M10 21v-4h4v4",
  compass:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM16 8l-2.5 5.5L8 16l2.5-5.5L16 8Z",
  check:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 12l3 3 5-6",
  target:     "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  chat:       "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z",
  code:       "M16 18l6-6-6-6M8 6l-6 6 6 6",
  ai:         "M12 3l1.8 4.9L19 10l-5.2 2L12 17l-2-5L5 10l5-2 2-5ZM19 15l.6 1.6L21 17l-1.4.4L19 19l-.6-1.6L17 17l1.4-.4.6-1.6Z",
  calendar:   "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  link:       "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5",
  chart:      "M3 3v18h18M7 16v-5M12 16V8M17 16v-9",
  eye:        "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  flag:       "M4 22V4s1-1 4-1 4 2 7 2 4-1 4-1v11s-1 1-4 1-4-2-7-2-4 1-4 1",
  docs:       "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2ZM4 19.5A2.5 2.5 0 0 1 6.5 17H20",
  globe:      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z",
  accessibility: "M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 8h16M9 22l3-7 3 7M12 15V8",
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/**
 * What the studio search matches, beyond the name itself. Each icon lists the
 * words someone might actually type looking for it, so "problem" is found by
 * "warning" or "risk" and "ai" by "spark" or "magic".
 */
export const ICON_KEYWORDS: Record<IconName, string[]> = {
  problem:    ["warning", "alert", "risk", "danger", "caution", "issue"],
  research:   ["search", "magnify", "discover", "find", "study", "explore"],
  insight:    ["idea", "lightbulb", "learning", "aha", "concept"],
  decision:   ["branch", "fork", "choice", "split", "path", "route"],
  structure:  ["grid", "layout", "sections", "blocks", "organise"],
  design:     ["pen", "craft", "figma", "ui", "visual", "art"],
  filter:     ["funnel", "narrow", "refine", "sort"],
  price:      ["money", "cost", "dollar", "revenue", "budget", "gmv"],
  outcome:    ["growth", "trend up", "result", "impact", "increase", "win"],
  users:      ["people", "team", "audience", "customers", "stakeholders"],
  mobile:     ["phone", "app", "ios", "android", "device"],
  map:        ["location", "geography", "region", "navigate"],
  search:     ["magnify", "find", "lookup", "seo", "query"],
  layers:     ["stack", "system", "tokens", "levels", "depth"],
  reflection: ["info", "note", "learning", "retrospective", "takeaway"],
  speed:      ["clock", "time", "fast", "performance", "duration"],
  lock:       ["secure", "security", "private", "nda", "confidential", "protected"],
  shield:     ["security", "safe", "trust", "protection", "compliance", "guard"],
  building:   ["company", "government", "org", "office", "enterprise", "institution"],
  compass:    ["direction", "benchmark", "reference", "strategy", "guide", "north"],
  check:      ["done", "tick", "approved", "verified", "success", "complete"],
  target:     ["goal", "aim", "focus", "objective", "bullseye"],
  chat:       ["message", "conversation", "ai", "assistant", "talk", "bubble"],
  code:       ["dev", "engineering", "handover", "json", "developer"],
  ai:         ["spark", "sparkles", "magic", "artificial intelligence", "generate", "llm"],
  calendar:   ["date", "schedule", "timeline", "sprint", "when"],
  link:       ["url", "connect", "chain", "hyperlink", "reference"],
  chart:      ["bar", "graph", "metrics", "analytics", "data", "stats"],
  eye:        ["view", "visibility", "preview", "accessibility", "see", "watch"],
  flag:       ["milestone", "goal", "mark", "priority", "launch"],
  docs:       ["book", "documentation", "guide", "read", "content", "spec"],
  globe:      ["world", "web", "international", "rtl", "language", "global"],
  accessibility: ["a11y", "wcag", "inclusive", "disability", "access"],
};

export function Icon({ name, size = 28 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flexShrink: 0 }}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Names whose name or keywords contain the query. Empty query returns all. */
export function searchIcons(query: string): IconName[] {
  const q = query.trim().toLowerCase();
  if (!q) return ICON_NAMES;
  return ICON_NAMES.filter(
    (n) => n.includes(q) || ICON_KEYWORDS[n].some((k) => k.includes(q)),
  );
}
