# Parked

Work that is finished enough to keep and not good enough to ship. Nothing
in this folder is imported, so none of it reaches the bundle.

## LiquidHero.tsx.txt

A WebGL2 ink-in-water effect for the hero: a filament falls from the top,
blooms on impact, dissipates, and loops. Removed 19 July 2026 — the idea
was right and the execution was not. To be revisited last, after the
content work is done.

**To bring it back:**

1. `git mv docs/parked/LiquidHero.tsx.txt components/ui/LiquidHero.tsx`
2. Restore the `.liquid` block and the `--liquid-ink` / `--liquid-deep`
   token pair from commit `fe2b398`
3. Mount `<LiquidHero />` as the first child of `#intro` in `app/page.tsx`

**What was wrong with it, for whoever picks it up:**

- The stream is a gaussian around a wandering centre line. Real ink is not
  one filament, it is several that separate and rejoin, and it never has a
  single centre.
- The bloom is a warped distance field, so it stays radial underneath the
  warping. Real spreading is driven by the velocity it arrived with, which
  is why it rolls outward in a torus rather than growing as a disc.
- The two are separate fields added together. The transition between them
  is a crossfade, not an impact.

A real fluid solve (advected density on a coarse grid, two passes) would
fix all three and is probably the honest way to do this.
