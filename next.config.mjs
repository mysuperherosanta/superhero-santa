// Static export for GitHub Pages: `next build` writes plain files to ./out.
// BASE_PATH is set by the deploy workflow: "/superherosantaclaus" while the site
// lives at <user>.github.io/superherosantaclaus, "" once a custom domain is attached.
const basePath = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
