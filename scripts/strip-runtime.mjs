// Post-build step (runs after `next build`, see package.json "build"):
// removes the Next.js client runtime from pages that don't need it.
//
// The homepage is static HTML (content/home.html rendered verbatim) and every
// interaction lives in public/js/site.js + the vendored GSAP/Lenis. React hydrates
// nothing there, yet the export ships ~133 KB of /_next/static JS and ~55 KB of
// inline RSC payload (`self.__next_f.push(...)`). Under Lighthouse's Slow 4G that
// alone costs ~0.7 s of mobile LCP.
//
// OPT-IN PER PAGE. Only the files in PAGES are touched. On a stripped page:
//   - React never runs, so client components, hooks and `<Link>` client-side
//     navigation do nothing (links still work as ordinary full-page links);
//   - `next dev` still loads the runtime, so check stripped pages in a real build
//     (`npm run build && npm run preview`).
// A page that needs React interactivity must stay OFF this list.
//
// Kept: CSS, metadata, image/style preloads, JSON-LD and every non-Next script
// (GSAP, Lenis, site.js). The build fails if a listed page is missing, or if a
// stripped page still references /_next/ JS, so a Next upgrade that changes the
// output shape can't silently ship a half-stripped page.

import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "out");

// Paths relative to out/. Keep this list explicit.
const PAGES = [
  "index.html", // homepage: content/home.html + site.js
  "404.html", // app/not-found.tsx: plain markup, one <a> (GitHub Pages serves this for misses)
  "404/index.html", // the same page at /404/
];

const isNextSrc = (attrs) => /\bsrc="[^"]*\/_next\/[^"]*"/.test(attrs);
const isNextInline = (body) => /self\.__next_f|__next_f\b|TURBOPACK/.test(body);

function strip(html) {
  let scripts = 0;
  let inline = 0;
  let links = 0;

  // <script ...>...</script>. Next escapes "<" inside its inline payloads, so the
  // first </script> always closes the tag.
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (tag, attrs, body) => {
    if (isNextSrc(attrs)) {
      scripts++;
      return "";
    }
    if (!/\bsrc=/.test(attrs) && !/type="application\/(ld\+)?json"/.test(attrs) && isNextInline(body)) {
      inline++;
      return "";
    }
    return tag;
  });

  // <link rel="preload|modulepreload" as="script" href=".../_next/..."> (attribute order varies)
  html = html.replace(/<link\b[^>]*>/g, (tag) => {
    const nextHref = /\bhref="[^"]*\/_next\/[^"]*"/.test(tag);
    const scriptHint = /\bas="script"/.test(tag) || /\brel="modulepreload"/.test(tag);
    if (nextHref && scriptHint) {
      links++;
      return "";
    }
    return tag;
  });

  return { html, scripts, inline, links };
}

function check(file, html) {
  const problems = [];
  if (/<script\b[^>]*\bsrc="[^"]*\/_next\//.test(html)) problems.push("a /_next/ <script src> is left");
  if (/<link\b[^>]*\bhref="[^"]*\/_next\/[^"]*"[^>]*\bas="script"/.test(html)) problems.push("a /_next/ script preload is left");
  if (/__next_f/.test(html)) problems.push("an RSC payload (__next_f) is left");
  if (!/<\/html>\s*$/.test(html)) problems.push("the document no longer ends in </html>");
  if (file === "index.html") {
    if (!/<script type="application\/ld\+json">/.test(html)) problems.push("JSON-LD is missing");
    if (!/<script defer="" src="[^"]*\/js\/site\.js">/.test(html)) problems.push("site.js is missing");
    if (!/<link rel="stylesheet" href="[^"]*\/css\/site\.css"/.test(html)) problems.push("site.css is missing");
  }
  return problems;
}

let failed = false;
for (const rel of PAGES) {
  const file = path.join(OUT, rel);
  if (!fs.existsSync(file)) {
    console.error(`strip-runtime: ${rel} not found in out/ (renamed page? update PAGES in scripts/strip-runtime.mjs)`);
    failed = true;
    continue;
  }
  const before = fs.readFileSync(file, "utf8");
  const { html, scripts, inline, links } = strip(before);
  const problems = check(rel, html);
  if (problems.length) {
    console.error(`strip-runtime: ${rel}: ${problems.join("; ")}`);
    failed = true;
    continue;
  }
  fs.writeFileSync(file, html);
  const kb = (n) => (Buffer.byteLength(n) / 1024).toFixed(1);
  console.log(
    `strip-runtime: ${rel} ${kb(before)} KB -> ${kb(html)} KB ` +
      `(removed ${scripts} /_next/ scripts, ${inline} inline runtime scripts, ${links} script preloads)`,
  );
}
if (failed) process.exit(1);
