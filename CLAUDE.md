# superherosantaclaus.com — working conventions

Marketing site for the *Superhero Santa* picture-book series. Built by Nate for a friend (the author/owner).
**Read `docs/HANDOFF.md` first** — current state, how the hero works, and the backlog.

## Rules

- **Static export only.** Next.js App Router with `output: 'export'`, deployed to GitHub Pages by `.github/workflows/deploy.yml`. No route handlers, server actions, middleware/`proxy.ts`, ISR, `next/image` optimization, or anything else that needs a server. If a feature needs a backend, it goes in a separate Cloudflare Worker (see HANDOFF backlog), never in this app.
- **Base path.** The site is served from `/superherosantaclaus/` on github.io and from `/` on the custom domain. Never hardcode root-absolute URLs (`/assets/...`) in TSX: use `asset()` from `lib/site.ts` or Next's `<Link>`. Inside `content/*.html` and `public/css/site.css`, keep asset URLs **relative** (`assets/img/x.webp`, `../assets/img/x.webp`).
- **Homepage = `content/home.html` + `public/css/site.css` + `public/js/site.js`.** It's ported markup, rendered verbatim. Convert a section to JSX only when you're already rewriting it, and keep the IDs/classes `site.js` depends on.
- **New pages** (character pages, parent guide, /for-churches…) are normal App Router routes in TSX. Use `generateStaticParams` for dynamic segments. Add each to `app/sitemap.ts` and give it its own `metadata` (title, description, canonical).
- **Images** live in `public/assets/img/`. Never embed `data:` URIs. Prefer WebP, set `width`/`height`, lazy-load below the fold.
- **Scripts** are self-hosted in `public/vendor/` (GSAP 3.12.5, Lenis 1.1.18). Don't add CDN script tags; if you add a library, vendor a pinned file.
- **The hero is a measured composition.** Every cast/stable position is a multiple of `--cs` offset from `--cx` (in `site.css`). Change sizes by changing `--cs`, never by nudging individual `left:`/`bottom:` values. See HANDOFF.
- **Check every visual change at 1440×900, 820×1180 and 390×844**, from a real build (`npm run build && npm run preview`), not just `next dev`.
- **SEO tags point at the final domain** (`https://superherosantaclaus.com/`) even before DNS is live.
- **`docs/private/` is gitignored** (business plan, research). The repo is public. Never commit it.
- **`design-src/`** is source art and one-off Python scripts, not site content. Don't link to it.
- Commit messages: short imperative summary.
