# superherosantaclaus.com — working conventions

Marketing site for the *Superhero Santa* picture-book series. Built by Nate for a friend (the author/owner).
**Read `docs/HANDOFF.md` first** — current state, how the hero works, and the backlog.

## Rules

- **Static export only.** Next.js App Router with `output: 'export'`, deployed to GitHub Pages by `.github/workflows/deploy.yml`. No route handlers, server actions, middleware/`proxy.ts`, ISR, `next/image` optimization, or anything else that needs a server. If a feature needs a backend, it goes in a separate Cloudflare Worker (see HANDOFF backlog), never in this app.
- **Base path.** The site is served from `/superherosantaclaus/` on github.io and from `/` on the custom domain. Never hardcode root-absolute URLs (`/assets/...`) in TSX: use `asset()` from `lib/site.ts` or Next's `<Link>`. Inside `content/*.html` and `public/css/site.css`, keep asset URLs **relative** (`assets/img/x.webp`, `../assets/img/x.webp`).
- **Homepage = `content/home.html` + `public/css/site.css` + `public/js/site.js`.** It's ported markup, rendered verbatim. Convert a section to JSX only when you're already rewriting it, and keep the IDs/classes `site.js` depends on.
- **New pages** (character pages, parent guide, /for-churches…) are normal App Router routes in TSX. Use `generateStaticParams` for dynamic segments. Add each to `app/sitemap.ts` and give it its own `metadata` (title, description, canonical).
- **No React on the homepage or 404 (runtime strip).** `npm run build` runs `scripts/strip-runtime.mjs` after `next build`. It removes the Next.js client runtime (`/_next/` JS and the inline RSC payload) from the pages listed in its `PAGES` (`index.html`, `404.html`, `404/index.html`). On those pages React never runs: client components, hooks and effects do nothing, and `<Link>` behaves as a plain full-page link. **A page that needs React interactivity must stay off that list.** New App Router pages are not stripped unless you add them. `next dev` still loads the runtime, so stripped pages only show their real behaviour in a build.
- **Images** live in `public/assets/img/`. Never embed `data:` URIs. Prefer WebP, set `width`/`height`, lazy-load below the fold. On the homepage, below-the-fold images also get `data-defer` (`<img data-defer … loading="lazy" width height>`). `app/page.tsx` turns those into `data-src` plus a `<noscript>` copy, and `site.js` loads them 1 s after `load`, or sooner when the visitor scrolls near one. Never put `data-defer` on anything visible in the first screen at any width.
- **Scripts** are self-hosted in `public/vendor/` (GSAP 3.12.5, Lenis 1.1.18). Don't add CDN script tags; if you add a library, vendor a pinned file. `site.js` loads GSAP/ScrollTrigger/Lenis itself after the hero (see HANDOFF "Mobile LCP pass"), so don't add `<script>` tags for them in `layout.tsx`, and keep anything the visitor needs right away in `site.js`'s core, not in `motion()`.
- **The hero is a measured composition.** Every cast/stable position is a multiple of `--cs` offset from `--cx` (in `site.css`). Change sizes by changing `--cs`, never by nudging individual `left:`/`bottom:` values. See HANDOFF.
- **Check every visual change at 1440×900, 820×1180 and 390×844**, from a real build (`npm run build && npm run preview`), not just `next dev`.
- **SEO tags point at the final domain** (`https://superherosantaclaus.com/`) even before DNS is live.
- **`docs/private/` is gitignored** (business plan, research). The repo is public. Never commit it.
- **`design-src/`** is source art and one-off Python scripts, not site content. Don't link to it.
- Commit messages: short imperative summary.
