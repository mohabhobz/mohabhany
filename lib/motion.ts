/**
 * The motion scale. These mirror the CSS tokens in styles/tokens.css and
 * exist because Motion needs numbers, not `var()`.
 *
 * Two rules govern everything on this site:
 *
 *   RESPONDING to the user (hover, focus, press)  → 0.6s
 *   ARRIVING on its own (scroll reveals, covers)  → 0.8s
 *
 * The floor is 0.6s everywhere, by decision. This used to read "responding
 * is FAST, 0.2s" on the argument that feedback must feel instant. That has
 * been overridden on purpose: motion on this site is meant to be noticed,
 * and at 0.2s an interaction finished before the eye reached it.
 *
 * fast, base and reveal are all 0.6 now. They are kept as separate names so
 * call sites still read in the language of their intent, and so the scale
 * can be pulled apart again later by editing three values rather than
 * hunting through selectors.
 *
 * The distinction is not decorative. A hover is feedback and must feel
 * instant or the interface feels laggy. A reveal is the page presenting
 * itself and needs time to read as deliberate rather than as a flicker.
 * Mixing the two is the single most common way a site's motion stops
 * feeling designed.
 *
 * One easing everywhere: ease-out. Things decelerate into place, the way
 * objects do. ease-in on an entrance means it arrives at full speed and
 * stops dead, which reads as a glitch.
 */
export const DURATION = { fast: 0.6, base: 0.6, reveal: 0.6, slow: 0.8 } as const;

/** cubic-bezier(0.2, 0.7, 0.2, 1) — identical to --ease-out. */
export const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

export const REVEAL = {
  distance: 26,      // --reveal-distance
  stagger: 0.07,     // --reveal-stagger
  /** How much of the element must be in view before it starts. */
  amount: 0.15,
} as const;
