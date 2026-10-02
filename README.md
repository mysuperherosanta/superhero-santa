# superherosantaclaus.com

Static marketing site for the *Superhero Santa* picture-book series. Hosted on GitHub Pages; no build step.

```
index.html      the whole page (CSS + JS inline)
assets/img/     all artwork (WebP/JPG), referenced by relative path
404.html        not-found page
robots.txt      allow all crawlers (incl. AI crawlers)
sitemap.xml     one URL for now; add pages as they ship
.nojekyll       serve files as-is (no Jekyll processing)
```

## Preview locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy (one-time setup)

1. Create an empty **public** repo `superherosantaclaus` on GitHub (Pages on private repos needs a paid plan).
2. Push:
   ```sh
   git remote add origin https://github.com/n8patterson/superherosantaclaus.git
   git push -u origin main
   ```
3. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
   The site appears at https://n8patterson.github.io/superherosantaclaus/ within a minute or two.

## Custom domain (when ready)

1. DNS at the registrar for `superherosantaclaus.com`:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (optional IPv6 `AAAA`) → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `www` `CNAME` → `n8patterson.github.io`
2. Settings → Pages → Custom domain: `superherosantaclaus.com` (this commits a `CNAME` file), then tick **Enforce HTTPS** once the certificate is issued.
3. Recommended: verify the domain under your GitHub account (Settings → Pages → Verified domains) so no one else can claim it.

Until step 2 is done, `canonical`/`og:url`/sitemap point at the final domain — that's intentional.
