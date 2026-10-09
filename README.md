# Village Cooking Channel · a fan tribute

> **Unofficial fan tribute** made for a club recruitment project. Not affiliated with or endorsed by Village Cooking Channel. All channel names belong to their owners.

A multi-page, motion-heavy tribute to the Tamil YouTube channel **Village Cooking Channel** from Chinna Veeramangalam, Pudukkottai: six family members, one wood fire, food for a hundred.

## Pages & features

**Home**
- Preloader: a banana leaf fills with real load progress, then splits open along a torn seam.
- Hero: a seamless drone-loop video, a giant title, and the family "slapped" on screen like a torn magazine cut-out as you scroll (pinned, scrubbed GSAP timeline).
- Manifesto with a word-by-word ink fill, plus a scroll-velocity marquee.
- Origin story: pinned horizontal passport pages with ink stamps that thump in.
- Numbers bento with count-ups and 3D tilt.
- **Meet the family**: a 3D card wheel around a real-time three.js banana tree. Back cards pass behind the tree; it snaps per card and works with the arrow keys and the buttons.
- Most watched: a channel card, a featured player with a FLIP swap, and a lightbox that only loads YouTube (youtube-nocookie) on click.
- Every feast is shared: a banana-leaf meal that unrolls with scroll.
- **Join the Feast**: a recipe form written into a notebook photo. On success, a PowerPoint-style circle wipe hands off to a banana-leaf paper-plane video.
- Newsletter strip.

**/kitchen**: signature dishes on a banana-leaf band, filter chips with GSAP Flip, and an accessible drawer / bottom sheet with "How they cook it".

**/story**: a self-drawing timeline, value cards and the "Ellarum vaanga" quote.

**Also**: a leaf-wipe page transition, custom cursor, a 404 ("This pot is empty."), an OG image, sitemap and robots.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · GSAP 3 (ScrollTrigger, SplitText, Flip) · Lenis · three.js + React Three Fiber + drei · Supabase · zod

## How the form works

1. The client validates with the same zod schema as the server (`lib/validation.ts`): blur validation, `aria-invalid` / `aria-describedby`, and a live region for announcements.
2. `POST /api/submit`:
   - honeypot check: if `website` is filled, it answers "ok" and stores nothing
   - per-IP rate limit: 5 requests / 10 minutes, in memory
   - zod validation
   - insert into `recipe_submissions` using the **service-role** key (server only)
   - returns `{ ok, count }`
3. `GET /api/submissions/count`: a cached count (`'use cache'`, revalidated every 30 s) for the live counter.
4. `POST /api/newsletter`: upserts into `newsletter_subscribers` and ignores duplicates.

Both tables have RLS enabled with **no public policies**; only the server can read or write. Schema: `supabase/schema.sql`.

> Local development without Supabase env vars falls back to an in-memory store (dev only, nothing is persisted). Production returns friendly 500s instead.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Run `supabase/schema.sql` once in the Supabase SQL editor.

| Variable | Where | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | server | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **secret**, never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | optional | custom domain for canonical/OG URLs (the Vercel URL is used otherwise) |

### Content

All copy lives in `data/*.ts`: site/footer, stats, members, videos (paste YouTube IDs into `youtubeId`), dishes, timeline, join.
Before publishing, fill in `CLUB_NAME` and `MY_NAME` in `data/site.ts`.

### Assets

Generated assets are committed. To rebuild them from `assets-src/`:

```bash
node scripts/build-assets.mjs        # form.webp + hero cut-out shadow
node scripts/build-members.mjs       # member portraits, avatar, banner
node scripts/build-form-assets.mjs   # curry-leaf cut-out, mobile props band
```

The banana tree GLB was converted from spec-gloss to metal-rough and compressed with gltf-transform (7.4 MB → 0.44 MB; Draco + 1024px WebP). The original is in `assets-src/banana_tree.glb`, and the Draco decoder is self-hosted in `public/draco/`.

## Accessibility & performance notes

- Turmeric text uses `--turmeric-ink` and error text uses `--ember-ink` so both meet contrast; turmeric is otherwise used as a fill with deep-green text.
- `prefers-reduced-motion`: Lenis is off, there is no pinning or scrubbing, the loader and transitions simply fade, and the family wheel becomes a swipeable row.
- The 3D canvas is dynamically imported, only renders while on screen, and falls back to a still image on low-end devices or a low FPS probe.
- The leaf-plane video only mounts when the form section is near the viewport.

## Credits

- 3D model: [“Banana tree”](https://sketchfab.com/3d-models/banana-tree-3b658ecad29f4d9a9606dbf8fea7c9bb) by Alnazir, CC BY 4.0.
- Visuals generated for this concept.
- Fonts: Bricolage Grotesque, Instrument Serif, Manrope, Catamaran (Google Fonts, OFL).

---

Unofficial fan tribute. Not affiliated with or endorsed by Village Cooking Channel.
