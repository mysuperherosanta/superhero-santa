# superherosantaclaus.com — working conventions

Marketing site for the *Superhero Santa* picture-book series. Built by Nate for a friend (the author/owner).
**Read `docs/HANDOFF.md` first** — it has the current state, how the hero works, and the backlog.

## Rules

- **Static only.** Plain `index.html` + `assets/`. No build step, no framework, no server code in this repo. Hosted on GitHub Pages from `main` / root.
- **CSS and JS stay inline in `index.html`.** Images live in `assets/img/` and are referenced by relative path. Never re-embed images as `data:` URIs (that was the old artifact format; it kills caching and image SEO).
- **Third-party scripts** come only from the CDNs already used (cdnjs GSAP 3.12.5 + ScrollTrigger, jsdelivr Lenis 1.1.18). Pin versions.
- **The hero is a measured composition.** Every cast/stable position is a multiple of `--cs` (canvas height) offset from `--cx` (canvas origin). Change sizes by changing `--cs`, never by nudging individual `left:`/`bottom:` values in px or %. See HANDOFF §"How the hero works".
- **Check every visual change at three widths:** 1440×900, 820×1180, 390×844. The hero must keep the backdrop, stable and cast in proportion at all three.
- **SEO tags point at the final domain** (`https://superherosantaclaus.com/`) even before DNS is live. Keep `canonical`, `og:url`, JSON-LD `@id`s and `sitemap.xml` in sync when adding pages; bump `<lastmod>`.
- **`design-src/` is source art and one-off image scripts, not site content.** It is public (the repo is public). Don't link to it from the site.
- **`docs/private/` is gitignored** (business plan, research). Never commit it — the repo is public.
- Commit messages: short imperative summary ("Fix boy armpit sliver in hero cast").

## Preview

```sh
python3 -m http.server 8000   # http://localhost:8000
```
