# Handoff — superherosantaclaus.com

_Last updated 2026-11-07._ _First written 2026-10-18. Picks up from a long Cowork design session; this repo is now the source of truth._

## Where things stand

- **Site:** Next.js 16 App Router, static export (`output: 'export'`) → `out/`. One page so far: `app/page.tsx` renders `content/home.html` verbatim; CSS in `public/css/site.css`, interactions in `public/js/site.js`, GSAP/Lenis self-hosted in `public/vendor/`, fonts self-hosted in `public/fonts/`, artwork in `public/assets/img/` (≈1.3 MB). Matches artifact preview **v35**. From here on, edit this repo, not the artifact. Verified: builds clean, no console errors, works at `/` and under `/superherosantaclaus/` base path.
- **Repo:** [`mysuperherosanta/superhero-santa`](https://github.com/mysuperherosanta/superhero-santa), in the `mysuperherosanta` GitHub organization (moved there from the author's personal account so Nate, `n8patterson`, could be an admin). Pages is served from it at `https://mysuperherosanta.github.io/superhero-santa/` (public repo, **Settings → Pages → Source: GitHub Actions**), still `noindex` until launch.
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`; Settings → Pages → Source must be *GitHub Actions*). Base path comes from `actions/configure-pages`, so it switches automatically when the custom domain is added. Cost is the domain only (~$10–20/yr).
- **Domain:** `superherosantaclaus.com`. DNS not pointed yet; registrar unknown. Set the custom domain in Settings → Pages only once DNS is pointed, then re-run the deploy workflow.
- **Forms:** the `#join` form (first name, email, optional message) sends to the Superhero Santa Gmail inbox via FormSubmit (backlog #1). Every "Join" button scrolls to it. There is no hello@superherosantaclaus.com address; it was removed from the page and JSON-LD until a domain mailbox exists.

## Page map

| Section id | What it is |
|---|---|
| `#hero` | Interactive scene: snowy European town backdrop, nativity stable with Holy Family + animals, Santa/Mrs. Claus/bookkeeper elf (one baked image), elf boy, elf girl, hiding Reindeer. Headline + CTA on the left (top on mobile). |
| `#story` | About Book One |
| `#trail` | Pinned horizontal "look inside" scroll (GSAP ScrollTrigger) with the search party's boot-print trail and a walking Santa marker |
| `#fun` | What's inside (kid-facing cards) |
| `#reason` | "Santa is the helper. Christmas has a hero." — faith message |
| `#series` | Three series cards; card 1 (Book One) has the book-one spread full-bleed across its top |
| `#book` | Book One at a glance: cover, facts list, three page-spread slots (placeholders) |
| `#author` | About the author (placeholders) |
| `#faq` | Questions parents ask (`<details>`; two answers still have placeholders) |
| `#join` | Launch-list form |

**Interactions (`public/js/site.js`):** no splash screen; on load only the headline and hero copy animate in, while the whole cast (stable, baked Santa/Mrs. Claus/elf, boy, girl) shows at once; Lenis smooth scroll; tap a character → speech bubble from `data-say`; hidden-object hunt (candy cane `#cane`, star `#gstar`, peeking Reindeer `#deer`/`#peek`) with counter `#counter` and confetti `#conf`; sound toggle `#sfx`; `prefers-reduced-motion` respected.

## How the hero works (read before touching it)

All hero layers are positioned on one virtual canvas:

- `--cs` = canvas height in px. Desktop: `min(74vh, (100vw − 360px)/2.1237)`; ≥1281px wide: `min(74vh, (100vw − 600px)/2.1237)`; ≤900px: `min(44.8vw, 52vh)`.
- `--cx` = canvas left origin. Desktop: `99vw − 2.1237·cs` (scene hugs the right, copy on the left). ≤900px: centred, `50vw − 1.0622·cs`.
- Every layer: `left: calc(var(--cx) + k·var(--cs))`, width or height `= j·var(--cs)`. The k/j constants come from `design-src/layers/meta.json` (canvas 3073×1447 px; `padx` 113). E.g. stable `left = cx + 0.593cs`, `height = cs`; Santa `left = cx + 0.4927cs`, `width = 0.2281cs`.
- Ground line: `bottom: calc(2vh + var(--lift))`. `--lift` is 58px on ≤900px and `max(0px, 1vh + 50px − .078·cs)` on desktop, just enough for the feet to clear the bottom controls.
- **One ground:** a full-width snowbank (`.bank`, z 9) runs from the bottom up to the feet line (`.078·cs` above the canvas bottom), topped by a wavy `.cap` that is `.024·cs` tall. The cap is sized from `--cs`, not from the bank's height, so its waves never dip below the feet at any width. Every layer stands in this snow, and the snowdrift (`.hidey`) sits on top of it. **The scene doesn't move:** no layer has pointer parallax or a scroll tween, because any relative movement exposes the layers' baked snow above the bank. Nothing in the page uses `data-depth` any more, and `site.js` has no parallax code.
- Speech bubbles sit at each character's `--head` (head top as % of the `--cs`-tall box, measured from the art). A talking character comes forward (`.ch.talk`, z 12).
- **Backdrop scales with the cast, not the viewport:** `--bgh = max(min(2.2·cs, --bgcap), 100vw/2.466)`, image anchored `center bottom`. `--bgcap` keeps the domes and spires from rising behind the copy: `100vh`, `92vh` on short (≤760px tall) 901–1280px screens, `112vh` from 1700px. On ≤900px it's `max(2.5·cs + lift, 100vw/2.466)`. Above the image, a lavender gradient (`#d9d2ee → #aaa3d6 → #8b87bf`) fills tall phone screens and fades into the image top. If you swap the backdrop, resample its top-row colour and update those three stops plus `background-color`.
- Layers in the DOM: `.sky` wraps the cast image and the ground sparkles (`#sparkles`, filled by `site.js`); the rest sit directly in `#hero`. `.nativity img` is the stable, Holy Family, animals, Santa, Mrs. Claus and the bookkeeper elf baked into **one image** (`hero-cast.webp` + 520/900 px-tall copies, built by `design-src/scripts/hero-cast.py` from the full-size layers in `design-src/layers/live/`), at `left: cx + 0.1997·cs`. The `.ch-santa/.ch-mrs/.ch-elf` imgs are 1×1 placeholders that only carry hit areas and speech bubbles. The elf boy, the elf girl and the Reindeer are their own images because they move: the boy and girl **hop** when tapped (CSS `@keyframes hop` on `.fig`, animating `translate`/`scale`, so it works before GSAP loads), and the Reindeer pops up when found. All hero images are `fetchpriority=high` and have **no entrance animation**, so the whole cast appears at once. (Nov 7: the boy and girl used to animate in late; they were briefly baked into the cast image too, which removed their hop.)

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

## Go live (GitHub Pages, not indexable yet)

The site can be public on GitHub Pages before launch without search engines indexing it.
- **Switch:** `INDEXABLE` in `lib/site.ts`. While `false` (now), every page has `<meta name="robots" content="noindex, nofollow">` and `robots.txt` lists no sitemap. Crawling stays allowed so crawlers can read the noindex (blocking them in `robots.txt` would let the bare URL get listed anyway). The 404 page is always `noindex`.
- **Launch day:** set `INDEXABLE = true`, push to `main` (the workflow redeploys), then submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools and request indexing of the homepage.
- **Base path:** on `mysuperherosanta.github.io/superhero-santa/` the deploy builds with `BASE_PATH=/superhero-santa` (from `actions/configure-pages`; the Nov 7 check below used `/superherosantaclaus`, and the code is path-agnostic). Checked Nov 7: CSS, fonts, backdrop, the cast image, deferred images, and `site.js` loading GSAP/Lenis from `/superherosantaclaus/vendor/` all work, as does the form. After the custom domain is set, re-run the workflow so it rebuilds for `/`.
- Canonical, Open Graph and JSON-LD URLs always point at `https://superherosantaclaus.com/`, so nothing needs changing at launch apart from the switch.

## Owner facts (Nov 7) and what's still to come

**In:** author **Steven L. Woodfield** and his bio (`#author`, and a `Person` node that the Book and BookSeries point to in `content/jsonld.json`); **nine** sleigh Reindeer; a **ten-minute** read; Book One **coming soon in print and ebook, fall 2027**; **currently a five-book series**. The author name was given as "Seven L. Woodfield" and read as a typo for Steven (the bio and everyone call him Steve/Steven), so confirm it.

**Still placeholders** (dashed `[bracketed]` boxes: `class="ph"` inline, `.ph-box` blocks; search `content/home.html`):
- **Author photo** (`.author-photo`): replace the box with an `<img>`, square, at least 520 px.
- **One more FAQ** (`[A question parents often ask you]` / `[Your answer]`): when answered, also add it to the `FAQPage` node and to `public/llms.txt`.

**Book One section** (`#book`) is just the cover and "Coming soon!" for now (the owner's call). When the details exist (exact release date, prices, page count, ISBN, retailers, a few interior spreads), bring back a facts list and add `datePublished`, `numberOfPages`, `isbn`, `bookFormat` and `offers` to the Book node. The earlier facts-list markup is in git history (commit `0fb106b`).

**Optional:** social profile URLs, for `sameAs` on the Organization and the Person.

## Backlog (in rough priority order)

1. **Launch-list signup: done Oct 18 (simple version).**
   - `#join` has a form (first name optional, email, message optional) that posts to [FormSubmit](https://formsubmit.co), which emails each signup to the Superhero Santa Gmail inbox. No account, no backend, free. The inbox is the list.
   - `site.js` submits via AJAX and thanks the visitor in place, with confetti. Without JS the plain POST still works and redirects back to `/#join`.
   - Spam: a `_honey` honeypot. Every other "Join" button now scrolls to the form and focuses the email field.
   - **One-time activation:** the first real submission makes FormSubmit email that Gmail an "Activate form" link. Click it, or nothing arrives.
   - **Alias:** the address lives only in the form's `action` in `content/home.html`; `site.js` derives the AJAX URL from it. After activation, FormSubmit's email gives a random alias string. Replace the email in that `action` with the alias (`https://formsubmit.co/<alias>`) so the address isn't in the page source.
   - **Later, if wanted:** a Worker + D1 store with CSV export (#8).
2. **Hero fixes and story copy: done 2026-10-17** (see "Oct 17 changes" below). The owner still hasn't sent his own "few small things" list; ask for it.
2c. **Character pages (later):** each search-party card should click through to its own page, with games/activities per character.
3. ~~Collapse the hero CSS override stack~~ — done Oct 18 (see "Where it lives in `site.css`").
4. **Performance:** done. Mobile Lighthouse LCP went 5.6 s (Oct 18) → 4.5 s → 3.2 s → **2.4 s** (Nov 7, under the 2.5 s target). See "Performance + accessibility pass" and "Mobile LCP pass" below.
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
  - **Type:** headings are Fraunces weight 600, softness 30, with italic 500 accents. (Since Oct 18 the fonts are self-hosted subsets; see the perf pass below.)
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

## Performance + accessibility pass (Oct 18)

Measured on a real build (`npm run build && npx serve out`), Lighthouse 13 in headless Chrome, median of 3 runs before / 5 after. Mobile is Lighthouse's default simulated Slow 4G + 4× CPU on a Moto G-sized screen.

| | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Performance | 76 | 82 | 96 | 99 |
| Accessibility | 96 | 100 | 96 | 100 |
| Best Practices | 96 | 100 | 96 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| LCP | 5.6 s | 4.5 s | 1.0 s | 0.9 s |
| CLS | 0.009 | 0.014 | 0.001 | 0.004 |
| TBT | 8 ms | 9 ms | 0 ms | 0 ms |
| Speed Index | 4.4 s | 3.3 s | 1.5 s | 1.2 s |
| Page weight | 1,174 KB | 699 KB | 1,327 KB | 951 KB |

axe-core (WCAG 2.0–2.2 A/AA + best practice) at 1440×900, 390×844 and 1440×900 with reduced motion: **0 violations** (before: footer label contrast 4.32:1).

**Performance changes**
- **Fonts are self-hosted** (`public/fonts/`, `@font-face` at the top of `site.css`, `font-display: swap`): no Google Fonts CSS (it was render-blocking) and no third-party origins. Latin subsets with the axes trimmed to what the page uses: Fraunces roman wght 400–700 / opsz 30–144 / SOFT 30–60, Fraunces italic pinned to the only style used (500, opsz 144, SOFT 60), Nunito 400–700. 308 KB → 139 KB. Rebuild with `design-src/scripts/subset-fonts.sh`; widen its ranges if the CSS starts using other weights or axis values (anything outside is clamped).
- **Hero layers have `srcset`** (520 px and 900 px tall copies beside the 1447 px originals; `sizes` follows the `--cs` formula). Phones and 1× desktops now load ~110 KB of layers instead of ~300 KB. Regenerate with `python3 design-src/scripts/hero-variants.py` whenever a hero layer changes.
- **Phone backdrop:** portrait screens ≤900 px wide use `hero-backdrop-phone.webp`, the centre 544 px of the backdrop (32 KB vs 94 KB). The hero only ever shows ~36% of the backdrop's width there, so it's pixel-identical (diffed at 390 and 820). The media query is in two places: the end of `site.css` and the preloads in `layout.tsx`. If the backdrop sizing (`--bgh`) changes on phones, recheck that the crop is still wide enough.
- `book-one-spread.jpg` → `.webp` (145 → 115 KB). The mini cover in the hero is lazy (it's `display:none` on phones, which no longer downloads it). The 1×1 `data:` GIF hit areas became `assets/img/hit.svg`.
- Already fine: GSAP, ScrollTrigger, Lenis and `site.js` are `defer`red and TBT is ~0. `book-one-cover.jpg` (253 KB) is only referenced by JSON-LD, never loaded by the page, and re-encoding it saves nothing (already well compressed).

**Why mobile LCP was still 4.5 s after this pass (target was 2.5 s; both levers below shipped Nov 7, see "Mobile LCP pass"):** the LCP element is the hero itself (backdrop), which paints at ~110 ms unthrottled; the simulated number is driven by everything fetched in that window. FCP alone is ~2.0 s (HTML + CSS under Slow 4G). Measured experiments on a copy of `out/`:
- stripping the Next.js runtime (the page hydrates nothing; 133 KB of JS + ~55 KB of inline RSC payload in `index.html`) → **3.8 s**;
- plus deferring the below-the-fold `loading="lazy"` images (the story Reindeer and the trail cards sit inside Chrome's 1250 px lazy-load distance on phones, ~200 KB) → **3.2 s**.
The rest is fonts (139 KB) and the hero art. Getting under 2.5 s would take a design call (e.g. pinning Fraunces to one optical size, or a lighter phone hero). Real 4G phones will be well under the simulated figure.

**Accessibility changes**
- **The cast is keyboard-operable:** Santa, Mrs. Claus, the elf, the boy and the girl are `role="button"` with `tabindex="0"` and names ("Say hello to Santa Claus"); Enter/Space make them talk. The spoken line is read once through a visually hidden live region (`#saylive`); the bubbles stay `aria-hidden`. Hover still shows the bubble without announcing it.
- **Hidden-object hunt:** finding the Reindeer turns it into a "Say hello to the Reindeer" button and moves focus to it (the `#peek` button is removed). Found items get `aria-disabled` and a "…: found" label. `#counter` (`aria-live`) announces progress as before.
- **Pinned trail:** each character card is focusable (focus turns it around, like hover). Tabbing into the pinned rail used to scroll `.pin` sideways and leave the trail broken; now the page scrolls to the point where the rail shows the focused card, and `.pin` is held at `scrollLeft 0`.
- **Nav:** always visible (sticky since Nov 7; it used to hide when scrolling down). With Lenis, in-page links also move focus to the target section (`tabindex=-1`), as a native jump would.
- **Sound toggle** has a fixed name ("Sound effects") with state in `aria-pressed` (the label used to change too).
- **Form:** a bad email sets `aria-invalid` and is described by the status message.
- **Contrast / focus:** footer labels .6 → .75 opacity (4.32:1 → AA); focus rings are gold instead of red in the footer and the dark nav, where red was under 3:1. Mrs. Claus's hit area sits above her neighbours so it keeps a 24 px target on phones (stacking only).
- Checked and fine: focus order (nav → cast → hunt → copy/CTAs → trail → form → footer), visible focus everywhere, every control named, `prefers-reduced-motion` (no preloader, snow, parallax, reveals or pin; the trail becomes a native horizontal scroller).
- **Nav brand link** (Nov 7): its `aria-label` is gone, so its accessible name is its visible text ("Superhero Santa · Picture books · Book One coming soon"), which fixes axe's `label-content-name-mismatch`. The footer brand link's label already contains its visible text.
- Known gap: on phones the candy cane's focus ring is clipped at the left edge (the cane sits at `cx − .04cs`); it's still visible on three sides.

## Mobile LCP pass (Nov 7)

Two changes, both kept because the numbers justify them. Measured on a real build served with `npx serve`, Lighthouse 13.6 in headless Chrome, **median of 5 runs** per column. Mobile = Lighthouse's default simulated Slow 4G + 4× CPU.

| | Mobile before | Strip only | Defer only¹ | **Mobile after** | Desktop before | **Desktop after** |
|---|---|---|---|---|---|---|
| Performance | 84 | 88 | 86 | **93** | 98 | **99** |
| Accessibility | 100 | 100 | 100 | **100** | 100 | **100** |
| Best Practices | 100 | 100 | 100 | **100** | 100 | **100** |
| SEO | 100 | 100 | 100 | **100** | 100 | **100** |
| LCP | 4.50 s | 3.76 s | 4.13 s | **3.16 s** | 0.93 s | **0.73 s** |
| FCP | 0.80 s | 1.22 s | 0.80 s | **0.65 s** | 0.33 s | **0.29 s** |
| CLS | 0.014 | 0.000 | 0.014 | **0.014** | 0.004 | **0.004** |
| TBT | 7 ms | 0 ms | 7 ms | **0 ms** | 0 ms | **0 ms** |
| Speed Index | 3.15 s | 3.22 s | 3.17 s | **2.87 s** | 1.21 s | **1.18 s** |
| Page weight | 699 KB | 558 KB | 700 KB | **559 KB** | 951 KB | **811 KB** |

¹ "Defer only" released the images at `load` (the first version). Released at `load`, the deferral added nothing on top of the strip (3.76 s either way). Releasing them 1 s after `load` is what reached 3.16 s; see below. Page weight doesn't fall with the deferral because the images still load inside Lighthouse's trace, just after the hero.

The 5-run LCPs were within ±5 ms of each other (Lantern simulation is deterministic given the trace), so the medians are solid. Target was LCP < 2.5 s: **not reached**. CLS target < 0.05 is met.

**1. Runtime strip (`scripts/strip-runtime.mjs`, runs inside `npm run build`)**
- The homepage hydrates nothing: it's `content/home.html` rendered verbatim, and all behaviour is `site.js` + GSAP/Lenis. Yet the export shipped ~133 KB of `/_next/static/chunks` JS plus ~55 KB of inline RSC payload (`self.__next_f.push(…)`). The script deletes, from an explicit allowlist (`PAGES`: `index.html`, `404.html`, `404/index.html`):
  - every `<script src=".../_next/...">`;
  - `<link rel="preload|modulepreload" as="script">` pointing at `/_next/`;
  - the inline `__next_f` / `TURBOPACK` bootstrap scripts.
- Everything else stays: CSS, metadata, image/style preloads, JSON-LD, GSAP, Lenis and `site.js`. `index.html` goes from 102 KB to 43 KB.
- It fails the build if a listed page is missing, if any `/_next/` script or `__next_f` survives, or if the homepage loses JSON-LD, `site.js` or `site.css`. A Next upgrade that changes the output shape stops the deploy instead of shipping a half-stripped page.
- `.github/workflows/deploy.yml` already runs `npm run build`, so it picks this up with no workflow change. Base-path builds (`BASE_PATH=/superherosantaclaus npm run build`) were checked too: the `/superherosantaclaus/_next/` URLs are stripped the same way, and the page works under the prefix.
- **Trade-off:** on a stripped page React never runs. Client components, hooks and `<Link>` client-side navigation don't work there (a `<Link>` still renders an `<a>`, so it degrades to a normal full-page link). A future page that needs React interactivity simply stays off `PAGES`. Its `/_next/` chunks are still emitted, because only the listed HTML files are edited. `next dev` always loads the runtime, so judge stripped pages from a build.
- The `out/**/index.txt` / `__next.*.txt` RSC files are left in place: harmless, and a non-stripped page `<Link>`ing to `/` would use them.

**2. Deferred below-the-fold images (`data-defer`)**
- On phones the story Reindeer and the trail card images sit inside Chrome's 1250 px lazy-load distance, so `loading="lazy"` still fetched ~200 KB while the hero was loading.
- In `content/home.html` the 16 below-the-fold `<img>` (story Reindeer, trail marker, trail cards front+side, walker, Book One spread) carry `data-defer`. The hero's mini cover doesn't: it's visible on desktop.
- At build time `app/page.tsx` rewrites each into `data-src`/`data-srcset` and adds a `<noscript>` copy of the original tag.
- `site.js` (top of the file, before the reduced-motion/no-GSAP early return, so every path gets images) restores `src`/`srcset`:
  - **1 s after `window.load`**, or
  - earlier for any image the visitor scrolls within 400 px of (IntersectionObserver).

  Restored images keep `loading="lazy"`, so far-away trail cards still wait for the browser's own lazy-load distance.
- **Why 1 s after `load`, not at `load`:** unthrottled, `load` fired at ~60–80 ms but the LCP frame painted at ~110–140 ms. Images released at `load` were still requested before LCP, so the simulation counted them (no gain). On real slow connections `load` already comes after the hero, so the extra second costs nothing visible. The story Reindeer starts ~650 px below the fold on a 412×823 phone, outside the 400 px observer margin.
- **Layout:** `width`/`height` stay on the held `<img>`, so its box is identical before and after the swap (checked for all 16 at 1440, 820 and 390; the only change is a 1 px rounding on the trail marker). CLS is unchanged at 0.014.
- **CSS (end of `site.css`):** `img[data-src]{color:transparent}` hides alt text in the empty box. `@media (scripting:none){img[data-src]{display:none!important}}` hides the held copy when JS is off, so the `<noscript>` copy shows instead. It needs `!important` because `.card .art img{display:block}` is more specific.
- **No-JS check:** with JavaScript disabled, all 16 images load from the `<noscript>` copies and no held copy is visible.

**Verification (final build)**
- **Browsers and modes:** Playwright + Chrome at 1440×900, 820×1180 (touch), 390×844 (touch), 1440×900 with reduced motion, and 390×844 with JS off, at `/` and under `/superherosantaclaus/`.
- **Console:** no errors or warnings on the homepage. No `/_next/` script and no `__next_f`/`TURBOPACK` global remain.
- **Deferral:** no deferred image is requested before `load`, and none is still held 2.5 s after it.
- **Interactions:**
  - Hunt: all 3 items found and the counter updates.
  - Cast: tapping a member speaks through `#saylive`.
  - Nav: the Lenis jump to `#series` works.
  - Trail: the desktop pin slides the rail, and the phone marker works.
  - Form (FormSubmit request intercepted, nothing sent): a bad email sets `aria-invalid`, and a good one shows the thank-you.
- **Visuals:** full-page screenshots with reduced motion, before vs after, are the same height at all three widths. The only differing pixels are the randomised snow sparkles. Normal-motion section shots (story, trail, series) show every deferred image.
- **axe-core 4.14** (WCAG 2.0–2.2 A/AA + best practice): 0 violations at 390×844. At 1440×900 (and with reduced motion) it reports one `label-content-name-mismatch` on the nav brand link (`aria-label="Superhero Santa — home"`). That is **identical on the Oct 18 baseline build**, so it isn't from this pass. It's likely a rule the Oct 18 axe run didn't include; see follow-ups.

**Third pass (Nov 7, later): 3.16 s → 2.40 s, under the 2.5 s target.** Three changes, the owner's call:

| (median of 5 mobile / 3 desktop) | Mobile before | **Mobile after** | Desktop before | **Desktop after** |
|---|---|---|---|---|
| Performance | 94 | **98** | 100 | **100** |
| LCP | 3.16 s | **2.40 s** | 0.73 s | **0.62 s** |
| FCP | 0.65 s | **0.65 s** | 0.17 s | **0.17 s** |
| CLS | 0.014 | **0.010** | 0.004 | **0.001** |
| TBT | 0 ms | **0 ms** | 0 ms | **0 ms** |
| Page weight | 549 KB | **498 KB** | 801 KB | **750 KB** |

- **One cast image.** The stable and Santa/Mrs. Claus/elf are one image (`hero-cast*.webp`, see "How the hero works"). The boy and girl were baked in too for this measurement (2.40 s). Separating them again so they can hop costs 2.41 s mobile / 0.66 s desktop and +9 KB, still under target.
- **Slimmer Fraunces.** The roman file is instanced to exactly what the page uses (wght 500–650, opsz 30–144, SOFT 30): 95 KB → 55 KB, rendering identical. `@font-face` declares `font-weight:500 650`. Pinning `opsz` to 144 as well would give 29 KB, but it visibly condenses the small opsz-30 labels (bubbles, counter, ribbon), so it's not done. See `design-src/scripts/subset-fonts.sh`. If the CSS starts using a Fraunces weight outside 500–650, widen the range there and re-run.
- **GSAP after the hero.** `layout.tsx` loads only `site.js`. Its **core** runs at once with no GSAP: images, sound, cast taps, the hunt, the nav/section colours, the form, plus snow and confetti on `requestAnimationFrame`. The **motion** part (Lenis, reveals, ribbon, trail pin, hero-copy fade, star, cards, stamp) loads `vendor/gsap.min.js` → `ScrollTrigger.min.js` → `lenis.min.js` from beside `site.js` **1 s after `load`**, or on the first wheel/touch/keypress. The hero entrance (headline lines rising, then label/copy/CTAs) is a **CSS animation** (`h1rise`/`heroup` in `site.css`, using `translate` so it doesn't fight the minibook's tilt), so it still plays at once. When motion starts, `.rv` elements already on screen or scrolled past are marked `.in` before `html.fx` is added, so nothing blinks out, and the series cards only fan in if they're still below the fold.
- Verified at 1440/820/390 on the built site: GSAP absent at 300 ms with the cast and headline animating, then loaded with Lenis/pin/reveals working, no element left hidden, form OK, no console errors.

**Follow-ups found (not fixed here)**
- ~~**Reduced motion skips the form's AJAX**~~: fixed Nov 7. The form is part of `site.js`'s core, which runs for every visitor.
- ~~**404 console error**~~: fixed Nov 7. `site.js` returns at once when the page has no `#hero`, and GSAP no longer loads on every page.
- ~~**axe nav brand**~~: fixed Nov 7 (the `aria-label` is dropped; see above).
- `layout.tsx`'s two backdrop `<link rel="preload">` appear twice in the HTML (Next hoists a copy). The browser dedupes same-URL preloads, so it's cosmetic.

## Private docs (gitignored, `docs/private/`)

`superherosantaclaus-publishing-plan.md` (publishing path, budget, SEO/GEO, marketing calendar, trademark note on "Superhero Santa"), `seo-geo-marketing-report.md`, `superherosantaclaus-brief.md` (design brief). These are local only; the repo is public.
