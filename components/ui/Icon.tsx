/**
 * A closed set of section icons.
 *
 * Deliberately not an icon library: a fixed vocabulary keeps stroke weight,
 * corner radius and optical size identical everywhere, and stops the page
 * turning into a sticker album. Sixteen covers a case study.
 */

export const ICONS = {
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
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

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
