# Handoff — superherosantaclaus.com

_Last updated 2026-10-17. Picks up from a long Cowork design session; this repo is now the source of truth._

## Where things stand

- **Site:** Next.js 16 App Router, static export (`output: 'export'`) → `out/`. One page so far: `app/page.tsx` renders `content/home.html` verbatim; CSS in `public/css/site.css`, interactions in `public/js/site.js`, GSAP/Lenis self-hosted in `public/vendor/`, artwork in `public/assets/img/` (≈1.3 MB). Matches artifact preview **v35**. From here on, edit this repo, not the artifact. Verified: builds clean, no console errors, works at `/` and under `/superherosantaclaus/` base path.
- **Repo:** local only. **Not pushed yet.** Plan: the friend (author) owns the GitHub repo and adds Nate as a collaborator; see `OWNER-TODO.md`.
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`; Settings → Pages → Source must be *GitHub Actions*). Base path comes from `actions/configure-pages`, so it switches automatically when the custom domain is added. Cost is the domain only (~$10–20/yr).
- **Domain:** `superherosantaclaus.com`. DNS not pointed yet; registrar unknown. Set the custom domain in Settings → Pages only once DNS is pointed, then re-run the deploy workflow.
- **Forms:** every "Join the list" button is a `mailto:hello@superherosantaclaus.com` link. There is no real signup form yet (see backlog #1).

## Page map

| Section id | What it is |
|---|---|
| `#hero` | Interactive scene: snowy European town backdrop, nativity stable with Holy Family + animals, Santa/Mrs. Claus/bookkeeper elf (one baked image), elf boy, elf girl, hiding Reindeer. Headline + CTA on the left (top on mobile). |
| `#story` | About Book One |
| `#trail` | Pinned horizontal "look inside" scroll (GSAP ScrollTrigger) with the search party's boot-print trail and a walking Santa marker |
| `#fun` | What's inside (kid-facing cards) |
| `#reason` | "Santa is the helper. Christmas has a hero." — faith message |
| `#series` | Three series cards; card 1 (Book One) has the book-one spread full-bleed across its top |
| `#join` | Launch-list CTA |

**Interactions (`public/js/site.js`):** preloader; Lenis smooth scroll; parallax via `data-depth`; tap a character → speech bubble from `data-say`; hidden-object hunt (candy cane `#cane`, star `#gstar`, peeking Reindeer `#deer`/`#peek`) with counter `#counter` and confetti `#conf`; sound toggle `#sfx`; `prefers-reduced-motion` respected.

## How the hero works (read before touching it)

All hero layers are positioned on one virtual canvas:

- `--cs` = canvas height in px. Desktop: `min(74vh, (100vw − 360px)/2.1237)`; ≥1281px wide: `min(74vh, (100vw − 600px)/2.1237)`; ≤900px: `min(44.8vw, 52vh)`.
- `--cx` = canvas left origin. Desktop: `99vw − 2.1237·cs` (scene hugs the right, copy on the left). ≤900px: centred, `50vw − 1.0622·cs`.
- Every layer: `left: calc(var(--cx) + k·var(--cs))`, width or height `= j·var(--cs)`. The k/j constants come from `design-src/layers/meta.json` (canvas 3073×1447 px; `padx` 113). E.g. stable `left = cx + 0.593cs`, `height = cs`; Santa `left = cx + 0.4927cs`, `width = 0.2281cs`.
- Ground line: `bottom: calc(2vh + var(--lift))`. `--lift` is 58px on ≤900px and `max(0px, 1vh + 50px − .078·cs)` on desktop, just enough for the feet to clear the bottom controls.
- **One ground (v36, end of `site.css`):** a full-width snowbank (`.bank`, z 9) runs from the bottom up to the feet line (`.078·cs` above the canvas bottom), topped by a wavy `.cap` that is `.024·cs` tall. The cap is sized from `--cs`, not from the bank's height, so its waves never dip below the feet at any width. Every layer stands in this snow, and the snowdrift (`.hidey`) sits on top of it. **The scene doesn't move:** no scene layer has `data-depth` or a scroll tween, because any relative movement exposes the layers' baked snow above the bank. Only the (hidden) sky decorations keep `data-depth`.
- Speech bubbles sit at each character's `--head` (head top as % of the `--cs`-tall box, measured from the art). A talking character comes forward (`.ch.talk`, z 12).
- **Backdrop scales with the cast, not the viewport** (v31): `--bgh = max(2.3·cs, 100vw/1.788)`, image anchored `center bottom`. Above the image, a lavender gradient (`#d9d2ee → #aaa3d6 → #8b87bf`) fills tall phone screens and fades into the image top. If you swap the backdrop, resample its top-row colour and update those three stops plus `background-color`.
- Layers in the DOM: `.stable3 img` (stable + Holy Family + animals, `assets/img/stable.webp`), `.nativity img` (Santa, Mrs. Claus, bookkeeper elf baked together, `nativity-cast.webp`; the `.ch-santa/.ch-mrs/.ch-elf` imgs are 1×1 placeholders that only carry hit areas and speech bubbles), `.ch-boy`, `.ch-girl`, `.ch-deer` (each its own webp).

**CSS debt:** in `public/css/site.css`, roughly the second half is a stack of successive override passes (`sunset scene pass`, `painted canyon backdrop`, `proportion pass`, `deep pass`, `ONE SCALE`, `ONE RENDER`, `v30`, `v31`). Only the last few actually win. A cleanup that collapses them into one hero block is worth doing before anything else in the hero — diff screenshots at the three widths before and after.

## Source art (`design-src/`)

| Path | What |
|---|---|
| `cast/cast.webp` | Original background-removed cast render (1992×834) |
| `cast/cast_clean5.webp` | Cast with white gaps between limbs removed (current) |
| `nativity/stable2.webp`, `stable3.webp` | Stable + Holy Family composites (`stable2` is live; `stable3` has an unfinished family clean-up pasted in, with visible seams; don't use as-is) |
| `nativity/famcrop.webp` | Cleaned family-region crop (620×360, belongs at (64,237) of the stable) |
| `layers/*.webp`, `meta.json` | Graded hero layers + their canvas coordinates (source of the CSS constants) |
| `characters/*-front/side.webp` | Character card art used in `#series` |
| `backdrops/european-town-A.png` | Current backdrop, full resolution (1344×752) |
| `backdrops/jerusalem.webp` | Previous backdrop (v30–31) |
| `scripts/*.py` | One-off Python/Pillow scripts from the session (edge cleanup `fringe.py`, `clean3.py`; layer builder `cast_build5.py`; zoom-grid helper `grid.py`). Paths inside are from the old sandbox; adapt before reuse. |
| `scripts/gapfix.py`, `gapfill.py` | Oct 17 sliver cleanup (numpy + Pillow only). `gapfix` makes light gaps transparent (cast, elf boy); `gapfill` fills gaps inside the opaque stable by cloning nearby straw/wood or blending across the gap. Exact runs below. |

Images were generated with Higgsfield (`gpt_image_2_5`) and background-removed there.

## Backlog (in rough priority order)

1. **Real email signup.** Replace the `mailto:` CTAs with an embedded MailerLite (or Kit) form; the owner picks the service and creates the account (see `OWNER-TODO.md`). Keep a mailto fallback in the footer.
2. **Hero fixes and story copy: done 2026-10-17** (see "Oct 17 changes" below). The owner still hasn't sent his own "few small things" list; ask for it.
2c. **Character pages (later):** each search-party card should click through to its own page, with games/activities per character.
3. **Collapse the hero CSS override stack** (see CSS debt above).
4. **Performance:** add `width`/`height` to all `<img>` in `content/home.html`, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero layers; consider `<picture>` with a smaller backdrop for phones. Target LCP < 2 s on mobile.
5. **Share image:** make a dedicated 1200×630 `og:image` (currently points at the book cover JPG).
6. **Analytics:** Cloudflare Web Analytics snippet (free, no cookie banner) + verify the domain in Google Search Console and submit `sitemap.xml`.
7. **More pages** (normal App Router routes in TSX; first candidates: `/characters/[slug]` via `generateStaticParams`, linked from the search-party cards) from the SEO plan in `docs/private/` (parent guide, /for-churches, character pages, printables). Each gets its own canonical, JSON-LD and sitemap entry.
8. **Later, optional: a small backend for leads/SEO tracking.** Recommended stack, all free tier: Cloudflare Workers (`/api/lead`), D1 (database), Workers cron (nightly Search Console pull), Cloudflare Access (login), and a Pages dashboard. Avoid Supabase free (projects pause after ~1 week idle). Keep the marketing site static either way.

## Oct 17 changes

- **Slivers and gaps.** Cleaned in place in `public/assets/img/` (the `design-src/layers/*_fh.webp` copies are the pre-fix originals):
  - `python3 gapfix.py hero-boy.webp out.webp 94,1030,102,1135 125,1010,142,1062 108,1085,132,1150 226,1015,241,1058 234,1080,258,1155 262,1010,270,1030 178,1112,190,1232,180,60 128,1175,136,1195` (gaps between the boy's arms, hands, legs and body)
  - `python3 gapfix.py nativity-cast.webp out.webp 668,928,692,986 194,954,210,994,195,32 120,1090,132,1130 240,858,250,885` (under Santa's left arm, beside the elf's scroll, between the elf's legs)
  - `python3 gapfill.py stable.webp out.webp 1298,1212,1326,1362,190,50,c55 1306,1212,1322,1252,160,50,c50 1198,1205,1228,1364,190,50,c50 1438,1308,1458,1364,212,48,c-60 250,956,264,1034,135,80,lerp 249,1030,262,1046,125,80,lerp` (donkey legs, lamb legs, Joseph's staff)
  - The red/cream strip at the stable's far-left edge is Santa's arm continuing past the clipped cast layer. It's intentional; don't clean it.
- **Title** is "Santa, the Reindeer Are Missing!" everywhere: hero `h1`, ribbon, series card, footer, `<meta>` description, OG title, JSON-LD.
- **Timing:** `#story` now opens after New Year's ("The presents are delivered. The New Year has rung in…").
- **No hoofprints:** the `#hoof` symbol is now `#boot` (the search party's boot prints). `.hoof` became `.print` in HTML/CSS/JS. The trail marker is Santa (`santa-side.webp`, no flip). The story card says "Follow the trail ↓", and the elf boy says "Which way did they go?".
- **Reindeer hiding spot** is a snowdrift: alt text, `#peek` label and the "Tap the snowdrift!" callout.
- **`#series` card 1:** the book-one spread is full-bleed across the top of the card (5:4, 4:3 below 900px). The elf boy/girl cut-outs are gone.
- **Search-party card art** (`*-front.webp`, `*-side.webp`, `reindeer*.webp`): pure-white gaps keyed out with `whitekey.py` (the gaps are 255-white; fur and aprons are off-white, so a near-white key with a 40px minimum blob is safe), ground shadows removed with `feet.py` (bottom 6% of the canvas, 10% for `santa-front` and both reindeer), and Mrs. Claus's punched-through hem rebuilt with `hemfill.py` + `hemmirror.py` (front mirrored about x=171; side rounded off where the canvas crops it). The pink halo on the side Reindeer's nose is the rendered glow; leave it.
- **Custom cursor removed** (the red dot that followed the mouse and grew into "Join" over CTAs). `data-cur="big"` stays: the confetti on CTAs uses it.
- **Hero ≤900px:** `.hero-copy` is in normal flow, and `#hero` is copy + `--cs` + lift tall instead of a full viewport, so tall phones and tablets don't get a band of empty sky. The candy cane is on the `--cs` grid. `.hero-copy` is centred with margins rather than `translateX(-50%)`, because `site.js` scrubs a transform on it and GSAP's inline transform used to wipe out the centring when a desktop-loaded page was narrowed. `main{overflow-x:clip}` stops the snowdrift and the parked series-card fan from widening the page.
- **Short desktop screens** (`min-width:901px` and `max-height:700px`): the "Read about the book" button is hidden; it landed on the cast's heads.
- **Hero ground pass:** the boy, girl and Reindeer no longer move separately from the cast (no scene parallax at all; the scroll "sink" on `.ch` is gone). Below 900px the candy cane stands in the snow just left of the boy (`left: cx − .04cs`, sized from `--cs`). It sits above him at z 10 so it stays clickable (his transparent box would otherwise swallow taps), with its base masked into the bank and an outline so its white stripes read against the snow. They all stand on one continuous snowbank, and the snowdrift sits on the bank with its base faded in. The Reindeer's peek bob moved to `.ch-deer .fig` (a CSS animation on `.ch-deer` itself would override GSAP's parallax transform), and "found" lifts it only `yPercent:-4`, so its legs end inside the snowdrift (its baked snow mound was removed from `hero-reindeer.webp`; `.ch-deer.found/.talk` stay at z 9, behind the drift). "Tap the snowdrift!" is anchored on the drift's centre (`cx + 1.98cs`) and clears the girl's head. The "?" rides above the antlers. `hero-boy`/`hero-girl` have their baked snow faded out under the bank (`fadebase.py`). Added `app/icon.svg` (favicon from the shield mark).
- **Hero CSS stack (#3)** not collapsed: these fixes didn't touch hero positioning, so it's still worth doing before the next real hero change.

## Private docs (gitignored, `docs/private/`)

`superherosantaclaus-publishing-plan.md` (publishing path, budget, SEO/GEO, marketing calendar, trademark note on "Superhero Santa"), `seo-geo-marketing-report.md`, `superherosantaclaus-brief.md` (design brief). These are local only; the repo is public.
