export const SITE_URL = "https://mysuperherosanta.com";

/**
 * Pre-launch switch. While false, every page says <meta name="robots" content="noindex, nofollow"> and
 * robots.txt lists no sitemap, so the site can be live on GitHub Pages without search engines indexing it.
 * Crawling stays allowed on purpose: a crawler blocked by robots.txt never sees the noindex and can still list the bare URL.
 * Flip to true on launch day, push, and the deploy workflow republishes (see docs/HANDOFF.md "Go live").
 */
export const INDEXABLE = true;
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a root-relative public path (e.g. "/css/site.css") with the base path. */
export const asset = (p: string) => `${BASE_PATH}${p}`;
