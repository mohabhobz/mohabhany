# mohabhany.com

Portfolio of Mohab Hany, product designer. Next.js, deployed on Vercel.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Adding a case study

Content lives in `content/` as JSON. There is no database and no CMS.

1. `npm run dev`
2. Open `/projects`. This is the studio: create a project, add a case study,
   write it, upload images.
3. It writes to `content/projects/*.json` and `content/case-studies/*.json`.
4. Commit and push. Vercel rebuilds and the change is live in about a minute.

`/projects` only exists in development. In production the whole segment
returns 404 and every write action refuses to run, so the editor cannot be
reached from the internet.

## Media

`public/uploads/` is committed with the code, so images ship with the repo and
cannot 404 in production. Keep them compressed: images are resized to 2400px
and saved as WebP, video is H.264 MP4 at CRF 20. The whole folder is 23MB and
should stay in that range.

`public/` root holds site assets that are not uploads (the portrait, the OG
image). Do not put those in `uploads/`: a collector removes any file there
that no content JSON references, and it cannot see references made from code.

## Structure

```
app/            routes. page.tsx is the landing page.
components/     ui/ is public, editor/ is the studio, blocks/ renders case studies.
content/        the site's data
lib/            storage router, types, motion helpers
styles/         tokens.css is the source of truth for every value
public/         media
```

Nothing may use a raw colour, size or duration that is not defined in
`styles/tokens.css`.
