# Hobz Portfolio

Personal portfolio for Mohab Hany (Hobz). Next.js + Supabase, deployed to Vercel.

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** — and **http://localhost:3000/design-system**
to see every token in the system.

## Stack — and why

| Choice | Reason |
|---|---|
| **Next.js 15 (App Router)** | Static-first rendering = very fast. Native home on Vercel. Great SEO out of the box. |
| **TypeScript** | Catches mistakes before they ship. |
| **Tailwind v4** | CSS-first config: the design tokens ARE the config, so nothing can drift. |
| **Motion** | Scroll animation on transform/opacity only — 60fps, respects reduced motion. |
| **Supabase** | Free Postgres for content. Swappable without touching the UI. |
| **next/font** | Fonts self-hosted at build time: no network request, no layout shift. |

## Supabase

Copy `.env.local.example` to `.env.local` and fill in your project URL and anon key
(Supabase → Project Settings → API).

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Deploying

Push to GitHub, import the repo in Vercel, add the two env vars, deploy.
Buy the domain (`hobz.design`) last and point it at the project.

## The rule

**Nothing may use a value that isn't in `styles/tokens.css`.**
If you need something new, add it to the tokens first, then use it.
`/design-system` is the living proof of what exists.
