# Hobz Design System

The tokens live in **`styles/tokens.css`**. The rendered reference is at **`/design-system`**.
This file explains the *rules* — the things a token can't enforce on its own.

---

## 1. Colour

Nine colours. That's the whole palette.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0B0D0B` | page background |
| `--color-surface` | `#111311` | raised cards, alternating sections |
| `--color-surface-2` | `#15170F` | the one feature card |
| `--color-line` | `#23271F` | hairline borders |
| `--color-line-strong` | `#2F342B` | hover / emphasis borders |
| `--color-ink` | `#F4F5F2` | primary text |
| `--color-muted` | `#8A9084` | body text |
| `--color-dim` | `#6C726A` | labels, captions, meta |
| `--color-accent` | `#FF5C1A` | the single accent |
| `--color-accent-ink` | `#1A0D05` | text sitting on orange |

**The orange rule.** Orange marks *one* thing per view — the result that matters,
the chosen option, the primary action. The moment it becomes decoration it stops
meaning anything. The trailing full stop (`.dot`) is the exception: it's the
signature, one per heading maximum.

---

## 2. Typography

**Three families, and no fourth.**

- **Space Grotesk** — everything you read.
- **Space Mono** — labels, meta, numbers, captions. Anything the eye should treat as *data*.
- **IBM Plex Sans Arabic** — all Arabic. Never render Arabic in a Latin font.

**Two weights: 500 and 700.** Never 600 — it muddies the hierarchy. Body text is 400.

**Use the classes, not raw sizes.** `.t-display` `.t-h1` `.t-h2` `.t-h3` `.t-lead`
`.t-body` `.t-small` `.t-label`. If you're writing `font-size:` anywhere outside
`tokens.css`, something is wrong.

**Measure is a rule, not a suggestion.** Body copy is capped at `62ch`, leads at
`56ch`, headings at `19ch`. Long lines are the single most common way a portfolio
becomes unreadable.

---

## 3. Images

Three rules, and they are strict:

1. **Every image sits in a `.frame`** — bordered, rounded, clipped. No bare `<img>`.
2. **One of four ratios only:** `.ratio-wide` (16/9, default), `.ratio-page` (4/3),
   `.ratio-square`, `.ratio-phone` (9/16, mobile screens).
3. **Every image has a caption that explains *why*.**

> ❌ "The checkout screen."
> ✅ "Checkout — the summary moved above the fold and fields dropped from 9 to 5,
> after testing showed people abandoned at the address step."

An image with no caption doesn't ship. The caption is where the thinking lives; the
picture on its own only proves you can draw.

### The logo plate

Company logos sit in `.logo-plate` — a 96px white tile with padding.

**It stays white in dark mode on purpose.** Client logos are drawn for light
backgrounds; most are dark ink with no light variant, so on a near-black page they
either vanish or look broken. A consistent white plate is what real agency sites do,
and it keeps every client logo legible without needing a second asset.

`--color-logo-plate` is therefore the one colour token that does *not* change with
the theme. That is deliberate, not an oversight.

---

## 4. Spacing & layout

4px base. Only the defined steps (`--space-1` … `--space-32`). No arbitrary margins.

- `.page` — 1180px, the full-width container.
- `.prose` — 880px, for case-study reading columns.
- `.section` — the standard vertical rhythm between sections.

---

## 5. Motion

**One reveal, used everywhere.** Fade + 26px rise, 0.8s, `cubic-bezier(0.2,0.7,0.2,1)`,
fired once when 15% of the element is in view.

Use the `<Reveal>` component. Stagger related items with `delay={1|2|3|4}` — never
more than 4 steps, or the page feels slow instead of considered.

**Non-negotiables:**
- Animate **transform and opacity only.** Anything that triggers layout will drop frames.
- **`prefers-reduced-motion` disables it completely.** This is an accessibility
  requirement, not a nicety.
- Motion should make the page feel *deliberate*, never make the reader wait.

---

## 6. Adding something new

If you need a value that doesn't exist:

1. Add it to `styles/tokens.css`.
2. Show it on `/design-system`.
3. Then use it.

Never the other way around. A design system stops working the first time someone
writes a one-off value "just this once".
