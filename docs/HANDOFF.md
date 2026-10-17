# Handoff — superherosantaclaus.com

_Last updated 2026-10-02. Picks up from a long Cowork design session; this repo is now the source of truth._

## Where things stand

- **Site:** one long page, `index.html` (≈100 KB, CSS + JS inline), artwork in `assets/img/` (≈1.3 MB total). Matches design version **v32** of the Claude artifact preview. From here on, edit this repo, not the artifact.
- **Repo:** local only, one commit on `main`. **Not pushed yet.** Plan: the friend (author) owns the GitHub repo and adds Nate as a collaborator; see `OWNER-TODO.md`.
- **Hosting:** GitHub Pages, `main` / root, `.nojekyll`. Cost is the domain only (~$10–20/yr).
- **Domain:** `superherosantaclaus.com`. DNS not pointed yet; registrar unknown. No `CNAME` file in the repo on purpose: add it (via Settings → Pages → Custom domain) only once DNS is set, or the github.io URL redirects to a dead domain.
- **Forms:** every "Join the list" button is a `mailto:hello@superherosantaclaus.com` link. There is no real signup form yet (see backlog #1).

## Page map

| Section id | What it is |
|---|---|
| `#hero` | Interactive scene: snowy European town backdrop, nativity stable with Holy Family + animals, Santa/Mrs. Claus/bookkeeper elf (one baked image), elf boy, elf girl, hiding Reindeer. Headline + CTA on the left (top on mobile). |
| `#story` | About Book One |
| `#trail` | Pinned horizontal "look inside" scroll (GSAP ScrollTrigger) with the hoofprint trail and Reindeer marker |
| `#fun` | What's inside (kid-facing cards) |
| `#reason` | "Santa is the helper. Christmas has a hero." — faith message |
| `#series` | The series / character cards (front + side views flip) |
| `#join` | Launch-list CTA |

**Interactions (JS at the bottom of `index.html`):** preloader; custom cursor (fine pointers only); Lenis smooth scroll; parallax via `data-depth`; tap a character → speech bubble from `data-say`; hidden-object hunt (candy cane `#cane`, star `#gstar`, peeking Reindeer `#deer`/`#peek`) with counter `#counter` and confetti `#conf`; sound toggle `#sfx`; `prefers-reduced-motion` respected.

## How the hero works (read before touching it)

All hero layers are positioned on one virtual canvas:

- `--cs` = canvas height in px. Desktop: `min(74vh, (100vw − 360px)/2.1237)`; ≥1281px wide: `min(74vh, (100vw − 600px)/2.1237)`; ≤900px: `min(44.8vw, 52vh)`.
- `--cx` = canvas left origin. Desktop: `99vw − 2.1237·cs` (scene hugs the right, copy on the left). ≤900px: centred, `50vw − 1.0622·cs`.
- Every layer: `left: calc(var(--cx) + k·var(--cs))`, width or height `= j·var(--cs)`. The k/j constants come from `design-src/layers/meta.json` (canvas 3073×1447 px; `padx` 113). E.g. stable `left = cx + 0.593cs`, `height = cs`; Santa `left = cx + 0.4927cs`, `width = 0.2281cs`.
- Ground line: `bottom: 2vh`. On ≤900px everything is lifted by `--lift: 58px` to clear the bottom controls.
- **Backdrop scales with the cast, not the viewport** (v31): `--bgh = max(2.3·cs, 100vw/1.788)`, image anchored `center bottom`. Above the image, a lavender gradient (`#d9d2ee → #aaa3d6 → #8b87bf`) fills tall phone screens and fades into the image top. If you swap the backdrop, resample its top-row colour and update those three stops plus `background-color`.
- Layers in the DOM: `.stable3 img` (stable + Holy Family + animals, `assets/img/stable.webp`), `.nativity img` (Santa, Mrs. Claus, bookkeeper elf baked together, `nativity-cast.webp`; the `.ch-santa/.ch-mrs/.ch-elf` imgs are 1×1 placeholders that only carry hit areas and speech bubbles), `.ch-boy`, `.ch-girl`, `.ch-deer` (each its own webp).

**CSS debt:** lines ~445–935 are a stack of successive override passes (`sunset scene pass`, `painted canyon backdrop`, `proportion pass`, `deep pass`, `ONE SCALE`, `ONE RENDER`, `v30`, `v31`). Only the last few actually win. A cleanup that collapses them into one hero block is worth doing before anything else in the hero — diff screenshots at the three widths before and after.

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

Images were generated with Higgsfield (`gpt_image_2_5`) and background-removed there.

## Backlog (in rough priority order)

1. **Real email signup.** Replace the `mailto:` CTAs with an embedded MailerLite (or Kit) form; the owner picks the service and creates the account (see `OWNER-TODO.md`). Keep a mailto fallback in the footer.
2. **Small hero fixes the owner flagged** ("a few small things", not yet specified). Ask him for the list. Known candidates:
   - two thin white slivers on the cast: under the elf boy's left arm, and along Santa's right edge;
   - white gaps around the donkey/lamb legs and beside Joseph's staff in the stable image (a clean family crop exists in `design-src/nativity/famcrop.webp`, but its stable background doesn't line up with `stable2`, so it needs a feathered blend or a regenerated stable);
   - Reindeer `alt` text still says "hiding behind the canyon"; there's no canyon any more.
2b. **Copy still out of step with the owner's story** (from his Oct text review; not changed yet, confirm with him first):
   - Timing: the Reindeer vanish *after New Year's* ("after the second-biggest night of the year"), but `#story` still says "The sleigh is packed" and "made for the night before Christmas".
   - Clues: there are *no* hoofprints in the book, but `#story` says Santa "follows the hoofprints", and the page has a "Follow the hoofprints ↓" link, a hoofprint trail in `#trail` and clickable hoofprints. Needs a new motif (snowy trail, footprints of the search party, the star…).
   - `#series`: he wants to rework this section, stretching one image across the whole section and dropping or folding in the three cards. Ask for specifics.
   - JSON-LD book name is still "Santa: The Reindeer Are Missing"; the series card now reads "Santa, the Reindeer Are Missing!". Pick one official title and use it everywhere.
2c. **Character pages (later):** each search-party card should click through to its own page, with games/activities per character.
3. **Collapse the hero CSS override stack** (see CSS debt above).
4. **Performance:** add `width`/`height` to all `<img>`, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero layers; consider `<picture>` with a smaller backdrop for phones. Target LCP < 2 s on mobile.
5. **Share image:** make a dedicated 1200×630 `og:image` (currently points at the book cover JPG).
6. **Analytics:** Cloudflare Web Analytics snippet (free, no cookie banner) + verify the domain in Google Search Console and submit `sitemap.xml`.
7. **More pages** from the SEO plan in `docs/private/` (parent guide, /for-churches, character pages, printables). Each gets its own canonical, JSON-LD and sitemap entry.
8. **Later, optional: a small backend for leads/SEO tracking.** Recommended stack, all free tier: Cloudflare Workers (`/api/lead`), D1 (database), Workers cron (nightly Search Console pull), Cloudflare Access (login), and a Pages dashboard. Avoid Supabase free (projects pause after ~1 week idle). Keep the marketing site static either way.

## Private docs (gitignored, `docs/private/`)

`superherosantaclaus-publishing-plan.md` (publishing path, budget, SEO/GEO, marketing calendar, trademark note on "Superhero Santa"), `seo-geo-marketing-report.md`, `superherosantaclaus-brief.md` (design brief). These are local only; the repo is public.
