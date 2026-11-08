import fs from "node:fs";
import path from "node:path";

// The homepage markup was ported as-is from the hand-built single-page site.
// It is read at build time and emitted as static HTML; site.js wires up the
// interactions. Convert sections to JSX components gradually as they change.
const read = (f: string) => fs.readFileSync(path.join(process.cwd(), "content", f), "utf8");

// Below-the-fold images marked `<img data-defer …>` in home.html wait for the hero.
// On phones the story Reindeer and the trail cards sit inside Chrome's lazy-load
// distance, so `loading="lazy"` alone still fetches them while the hero is loading.
// At build time each becomes `data-src`/`data-srcset` (site.js restores them after
// window load, or sooner when scrolled near) plus a <noscript> copy for no-JS visitors.
// width/height stay on the held image, so its box doesn't change when it loads.
const deferImages = (html: string) =>
  html.replace(/<img\b[^>]*\bdata-defer\b[^>]*>/g, (tag) => {
    const plain = tag.replace(/\s+data-defer\b(="")?/, "");
    const held = tag.replace(/\s(src|srcset)="/g, ' data-$1="');
    return `${held}<noscript>${plain}</noscript>`;
  });

export default function Home() {
  const html = deferImages(read("home.html"));
  const jsonld = read("jsonld.json");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonld }} />
      {/* site.js edits this markup before React hydrates (stars, sparkles, ribbon loop, preloader) */}
      <div style={{ display: "contents" }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
