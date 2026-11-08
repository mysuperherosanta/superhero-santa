# Handoff — superherosantaclaus.com

_Last updated 2026-10-17. Picks up from a long Cowork design session; this repo is now the source of truth._

## Where things stand

- **Site:** Next.js 16 App Router, static export (`output: 'export'`) → `out/`. One page so far: `app/page.tsx` renders `content/home.html` verbatim; CSS in `public/css/site.css`, interactions in `public/js/site.js`, GSAP/Lenis self-hosted in `public/vendor/`, artwork in `public/assets/img/` (≈1.3 MB). Matches artifact preview **v35**. From here on, edit this repo, not the artifact. Verified: builds clean, no console errors, works at `/` and under `/superherosantaclaus/` base path.
- **Repo:** local only. **Not pushed yet.** Plan: the friend (author) owns the GitHub repo and adds Nate as a collaborator; see `OWNER-TODO.md`.
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`; Settings → Pages → Source must be *GitHub Actions*). Base path comes from `actions/configure-pages`, so it switches automatically when the custom domain is added. Cost is the domain only (~$10–20/yr).
- **Domain:** `superherosantaclaus.com`. DNS not pointed yet; registrar unknown. Set the custom domain in Settings → Pages only once DNS is pointed, then re-run the deploy workflow.
- **Forms:** the `#join` form (first name, email, optional message) sends to mysuperherosanta@gmail.com via FormSubmit (backlog #1). Every "Join" button scrolls to it. There is no hello@superherosantaclaus.com address; it was removed from the page and JSON-LD until a domain mailbox exists.

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

**Interactions (`public/js/site.js`):** preloader; Lenis smooth scroll; tap a character → speech bubble from `data-say`; hidden-object hunt (candy cane `#cane`, star `#gstar`, peeking Reindeer `#deer`/`#peek`) with counter `#counter` and confetti `#conf`; sound toggle `#sfx`; `prefers-reduced-motion` respected.

## How the hero works (read before touching it)

All hero layers are positioned on one virtual canvas:

- `--cs` = canvas height in px. Desktop: `min(74vh, (100vw − 360px)/2.1237)`; ≥1281px wide: `min(74vh, (100vw − 600px)/2.1237)`; ≤900px: `min(44.8vw, 52vh)`.
- `--cx` = canvas left origin. Desktop: `99vw − 2.1237·cs` (scene hugs the right, copy on the left). ≤900px: centred, `50vw − 1.0622·cs`.
- Every layer: `left: calc(var(--cx) + k·var(--cs))`, width or height `= j·var(--cs)`. The k/j constants come from `design-src/layers/meta.json` (canvas 3073×1447 px; `padx` 113). E.g. stable `left = cx + 0.593cs`, `height = cs`; Santa `left = cx + 0.4927cs`, `width = 0.2281cs`.
- Ground line: `bottom: calc(2vh + var(--lift))`. `--lift` is 58px on ≤900px and `max(0px, 1vh + 50px − .078·cs)` on desktop, just enough for the feet to clear the bottom controls.
- **One ground:** a full-width snowbank (`.bank`, z 9) runs from the bottom up to the feet line (`.078·cs` above the canvas bottom), topped by a wavy `.cap` that is `.024·cs` tall. The cap is sized from `--cs`, not from the bank's height, so its waves never dip below the feet at any width. Every layer stands in this snow, and the snowdrift (`.hidey`) sits on top of it. **The scene doesn't move:** no layer has pointer parallax or a scroll tween, because any relative movement exposes the layers' baked snow above the bank. Nothing in the page uses `data-depth` any more, and `site.js` has no parallax code.
- Speech bubbles sit at each character's `--head` (head top as % of the `--cs`-tall box, measured from the art). A talking character comes forward (`.ch.talk`, z 12).
- **Backdrop scales with the cast, not the viewport:** `--bgh = max(min(2.2·cs, --bgcap), 100vw/2.466)`, image anchored `center bottom`. `--bgcap` keeps the domes and spires from rising behind the copy: `100vh`, `92vh` on short (≤760px tall) 901–1280px screens, `112vh` from 1700px. On ≤900px it's `max(2.5·cs + lift, 100vw/2.466)`. Above the image, a lavender gradient (`#d9d2ee → #aaa3d6 → #8b87bf`) fills tall phone screens and fades into the image top. If you swap the backdrop, resample its top-row colour and update those three stops plus `background-color`.
- Layers in the DOM: `.sky` wraps the stable, the baked cast and the ground sparkles (`#sparkles`, filled by `site.js`); the rest sit directly in `#hero`. `.stable3 img` (stable + Holy Family + animals, `assets/img/stable.webp`), `.nativity img` (Santa, Mrs. Claus, bookkeeper elf baked together, `nativity-cast.webp`; the `.ch-santa/.ch-mrs/.ch-elf` imgs are 1×1 placeholders that only carry hit areas and speech bubbles), `.ch-boy`, `.ch-girl`, `.ch-deer` (each its own webp).

**Where it lives in `site.css`:** one block between the `══ HERO ══` banner and the ribbon. Order inside it: canvas variables (`--cs/--cx/--lift` on `:root`) and `#hero` (backdrop), `.sky` + sparkles, scene layers (stable, nativity, `.ch` characters with their `left: cx + k·cs` constants), speech bubbles, snowbank, hidden-object hunt (Reindeer, snowdrift + `#peek`, "Tap the snowdrift!", cane, star), counter/sound, hero copy, then the media queries (≥1281px canvas, `--bgcap` overrides, the hidden ghost button, and one `≤900px` block for phones). Desktop is the base; the `≤900px` block overrides it. Each value is set once, so edit it where it is rather than appending an override at the end of the file. (Oct 18: collapsed from the old stack of override passes. Verified pixel-identical at 15 viewport sizes, including found-Reindeer, talking and `#join` states. Computed styles match everywhere except a few no-ops that were dropped: `translate:0 0` on `.ch`, `rotate:0deg` on `.ch .fig`, the Reindeer's `transition:none`, the radius/transition on the background-less `.sticker`s, the `peek2` keyframes renamed to `peek`, and a reduced-motion mirror on the invisible Mrs. Claus placeholder.)

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

1. **Launch-list signup: done Oct 18 (simple version).**
   - `#join` has a form (first name optional, email, message optional) that posts to [FormSubmit](https://formsubmit.co), which emails each signup to **mysuperherosanta@gmail.com**. No account, no backend, free. The inbox is the list.
   - `site.js` submits via AJAX and thanks the visitor in place, with confetti. Without JS the plain POST still works and redirects back to `/#join`.
   - Spam: a `_honey` honeypot. Every other "Join" button now scrolls to the form and focuses the email field.
   - **One-time activation:** the first real submission makes FormSubmit email that Gmail an "Activate form" link. Click it, or nothing arrives.
   - FormSubmit can then issue a random alias to replace the address in `home.html` and `site.js`, if you'd rather not expose it in the page source.
   - **Later, if wanted:** a Worker + D1 store with CSV export (#8).
2. **Hero fixes and story copy: done 2026-10-17** (see "Oct 17 changes" below). The owner still hasn't sent his own "few small things" list; ask for it.
2c. **Character pages (later):** each search-party card should click through to its own page, with games/activities per character.
3. ~~Collapse the hero CSS override stack~~ — done Oct 18 (see "Where it lives in `site.css`").
4. **Performance:** add `width`/`height` to all `<img>` in `content/home.html`, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero layers; consider `<picture>` with a smaller backdrop for phones. Target LCP < 2 s on mobile.
5. **Share image:** done (`og-image.jpg`). Redo it with the title lettered in once the cover type is final.
6. **Analytics + Search Console:** add the Cloudflare Web Analytics snippet (free, no cookie banner); verify the domain in Google Search Console and Bing Webmaster Tools and submit `sitemap.xml` once DNS is live. For GEO, the biggest remaining win is facts only the owner has: author name and bio, release date, page count, price and ISBN, on the page and in `jsonld.json`.
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
- **Luxury pass (v37; now folded into each section's rules):**
  - **Type:** Fraunces now loads its full variable range plus italics (`layout.tsx`). Headings are weight 600, softness 30, with italic 500 accents.
  - **Gold:** `--gold` / `--gold-soft` for rules, fills and text on dark sections; `--gold-ink` (#7A5518, 4.5:1 or better) for small text on light backgrounds.
  - **Sections:** the peach sections are now champagne (#EED3B6) and "What's inside" is deep evergreen (#1F3A2F). The `data-bg` values in `home.html` match, and the nav switches to light text over evergreen.
  - **Components:** hero stickers became one quiet line of facts; buttons are cranberry with a lit top edge and offset shadow; the reason star is a gold gradient (`#goldstar`); the series shows Book One large with the two follow-ons stacked beside it.
- **Next.js dev "Issue" badge:** the hydration warning is silenced with `suppressHydrationWarning` on `<body>` and the content div in `page.tsx`, because `site.js` changes both before React hydrates. That's intended.
- **Trail pin:** the rail's slide spans the whole pinned distance (`duration:1`), the boot prints fade in during it, and the pin ends 60px after the last card lands. Before, the slide used only about a third of the pin, so the section held for a long stretch with nothing moving.
- **Hero copy has no halos:** the white text-shadows and the cream haze behind the copy are gone. The paragraph and facts are now ink, and the kicker is a deeper cranberry (#861620). Each measures at least 4.5:1 against the bare sky at its worst point at 1440/1024/820/390; recheck if the backdrop changes.
- **No dashed ring** around the Reindeer's snowdrift (`#peek::before` hidden). Keyboard focus still gets an outline.
- **Oct 17 owner review (Plaud recordings, applied Oct 18):**
  - **Vibrant colours (v38; now folded into each section's rules):** the beiges read as dull to the owner (colour-blind; likes rich roses, yellows, oranges, blues). The sections are now rose `#F49AB2` (story, join), tangerine `#F7A350` (trail), royal blue `#1F3F8F` (what's inside) and sunflower `#FAD25A` (series). The dark "reason" section stays dark; the owner likes it.
  - **Kickers and text:** kickers are deep cranberry `#861620` on the bright grounds and gold on the dark ones. All text is 4.5:1 or better.
  - **Hero art:** `hero-backdrop.webp` saturation +22%; the cast and stable layers get `saturate(1.14)`.
  - **Copy:** "The presents have been delivered."; "The Superhero Santa series begins with a toddler bedtime reader … A full-edition picture book and a children's book are soon to follow."; footer "Picture books with Santa that point us to Christ."
  - **Series picture** is framed from above Santa's head (`object-position 50% 30%`).
  - **Owner loves:** the head elf travelling across the trail, and "every book ends where Christmas begins". Keep both.
- **More city in the hero:** the backdrop is scaled to `2.2·cs`, capped by viewport height so the skyline never runs behind the copy (`100vh`; `92vh` on short ≤1280px screens; `112vh` from 1700px), and to `2.5·cs + lift` at ≤900px. The caps come from a contrast sweep at ten desktop sizes. Re-run it if the copy or backdrop changes. The kicker is ink with a red rule, and "Read about the book" has a frosted fill, because both now sit over deeper lavender or rooftops. Re-measured contrast is 4.76:1 or better at every width.
- **SEO/GEO pass (Oct 18):**
  - **Title:** "Superhero Santa: Christ-Centered Christmas Books for Toddlers". The description is ≤155 characters.
  - **Share image:** a 1200×630 `og-image.jpg` with alt text, built from the hero layers.
  - **Meta:** `og:site_name`/`locale`, `max-image-preview:large`, theme colour, `apple-icon.png`.
  - **Structured data:** `logo.png` (512) on the Organization. `jsonld.json` is now Organization + WebSite + WebPage + BookSeries + Book, with descriptions, image, subjects and audience. It has no author, release date or ISBN yet; add them when known.
  - **AI answer engines:** `public/llms.txt` summarises the series using only claims already on the page.
  - **Headline:** has real spaces between its lines, so crawlers read "Santa, the Reindeer Are Missing!".
  - **Images:** every `<img>` has `width`/`height`, below-the-fold images lazy-load, the stable and cast layers get `fetchpriority=high`, and the backdrop is preloaded. The hero's mini cover uses a 280px thumbnail (36 KB instead of 259 KB).
- **Hero CSS stack (#3):** collapsed Oct 18 into one hero block; v37/v38 were folded into the section rules at the same time. `site.css` went from 1117 to 454 lines with no visual change.
- **Dead hero markup removed (Nov 7):** the old painted-canyon sky (`.aurora`, `#stars`, `.sun`, `.cloud`s, `.mesa`s, `.ground`, the nativity `.glow`/`.drift`, the hidden `.castlabel`) is gone from `home.html`, along with the `display:none` rule that hid it, the `#stars` generator and the `[data-depth]` pointer parallax in `site.js`, and the `.hint` target of the intro tween. Also dropped CSS with no matching markup: `.frame.f-santa/.f-elves/.f-deer/.f-canyon`, `#join .mail`, `.mark .sh/.st`, and `.frame.f-char.turned`. Screenshots match the previous build at 1440×900, 1280×720, 820×1180 and 390×844 (hero, found Reindeer, talking elf boy, full page), with no console errors.

## Private docs (gitignored, `docs/private/`)

`superherosantaclaus-publishing-plan.md` (publishing path, budget, SEO/GEO, marketing calendar, trademark note on "Superhero Santa"), `seo-geo-marketing-report.md`, `superherosantaclaus-brief.md` (design brief). These are local only; the repo is public.
