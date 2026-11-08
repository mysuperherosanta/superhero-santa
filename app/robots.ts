import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // crawling stays allowed either way so crawlers can read the noindex; the sitemap is only advertised once indexable
  return { rules: [{ userAgent: "*", allow: "/" }], ...(INDEXABLE ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}) };
}
