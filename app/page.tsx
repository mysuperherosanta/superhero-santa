import fs from "node:fs";
import path from "node:path";

// The homepage markup was ported as-is from the hand-built single-page site.
// It is read at build time and emitted as static HTML; site.js wires up the
// interactions. Convert sections to JSX components gradually as they change.
const read = (f: string) => fs.readFileSync(path.join(process.cwd(), "content", f), "utf8");

export default function Home() {
  const html = read("home.html");
  const jsonld = read("jsonld.json");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonld }} />
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
