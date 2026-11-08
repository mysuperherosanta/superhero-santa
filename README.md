# mysuperherosanta.com

Marketing site for the *Superhero Santa* picture-book series. **Next.js (App Router) static export**, hosted free on **GitHub Pages**. `next build` writes plain files to `out/`; a GitHub Action builds and deploys on every push to `main`.

Working on it? Read `CLAUDE.md` and `docs/HANDOFF.md`. Site owner checklist: `OWNER-TODO.md`.

```
app/layout.tsx        <head> metadata, fonts, stylesheet, scripts
app/page.tsx          homepage: renders content/home.html at build time
app/not-found.tsx     404 page (exported as 404.html)
app/sitemap.ts        sitemap.xml   — add every new page here
app/robots.ts         robots.txt
content/home.html     homepage markup (ported from the hand-built page)
content/jsonld.json   structured data for the homepage
public/css/site.css   all site CSS
public/js/site.js     all interactions (hidden-object hunt, form, …); loads GSAP/Lenis after the hero
public/vendor/        GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.18 (self-hosted, pinned)
public/assets/img/    artwork
lib/site.ts           SITE_URL + base-path helper
.github/workflows/deploy.yml   build + deploy to Pages
design-src/           source art + one-off image scripts (not part of the site)
```

## Develop

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out
npm run preview      # serve ./out
```

## Deploy (one-time setup)

1. The repo is `mysuperherosanta/superhero-santa` (the `mysuperherosanta` organization; Nate is an admin). It must be **public** for free GitHub Pages.
2. Push:
   ```sh
   git remote add origin https://github.com/mysuperherosanta/superhero-santa.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Source: GitHub Actions**. The workflow runs on the push (or re-run it from the Actions tab) and publishes to `https://mysuperherosanta.github.io/superhero-santa/`.

The workflow reads the base path from GitHub Pages itself (`/superhero-santa` on github.io, empty once a custom domain is attached), so nothing needs editing when the domain goes live.

## Custom domain (when ready)

1. DNS at the registrar (Cloudflare) for `mysuperherosanta.com`, every record **DNS only (grey cloud)**:
   - Apex `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (optional `AAAA`) → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `www` `CNAME` → `mysuperherosanta.github.io`
2. Settings → Pages → Custom domain: `mysuperherosanta.com`, then tick **Enforce HTTPS** once the certificate is issued. (With Actions deploys, no `CNAME` file is needed in the repo.)
3. Re-run the deploy workflow so the build picks up the empty base path.
4. Recommended: verify the domain under the owner's GitHub account (Settings → Pages → Verified domains).

`canonical`, `og:url`, JSON-LD and the sitemap already point at the final domain; that's intentional.
