import type { Metadata, Viewport } from "next";
import { SITE_URL, asset } from "@/lib/site";

const TITLE = "Superhero Santa: Christ-Centered Christmas Books for Toddlers";
const DESCRIPTION =
  "A toddler bedtime picture-book series where Santa is the helper and Christmas has a hero. Book One, “Santa, the Reindeer Are Missing!”, is coming soon.";
const SHARE_IMAGE = {
  url: "/assets/img/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Santa, Mrs. Claus, the elves and the Reindeer beside the nativity stable in a snowy town at sunset",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · Superhero Santa" },
  description: DESCRIPTION,
  applicationName: "Superhero Santa",
  category: "books",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Superhero Santa",
    locale: "en_US",
    title: "Santa, the Reindeer Are Missing! · Superhero Santa, Book One",
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Santa, the Reindeer Are Missing! · Superhero Santa, Book One",
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  formatDetection: { telephone: false, address: false, email: false },
};

// where the hero shows at most ~36% of the backdrop's width, so hero-backdrop-phone.webp (centre crop) looks identical
const PHONE_BACKDROP = "(max-width: 900px) and (max-aspect-ratio: 1/1)";

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#B4202B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // site.js adds classes (fx / rm / no-js) to <html> at runtime
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* fonts are self-hosted subsets (public/fonts, @font-face at the top of site.css) */}
        <link rel="stylesheet" href={asset("/css/site.css")} />
        {/* the hero backdrop is a CSS background, so the browser can't discover it early on its own.
            Portrait phones and tablets get a centre crop (same media query as the end of site.css). */}
        <link rel="preload" as="image" href={asset("/assets/img/hero-backdrop-phone.webp")} media={PHONE_BACKDROP} fetchPriority="high" />
        <link rel="preload" as="image" href={asset("/assets/img/hero-backdrop.webp")} media={`not all and ${PHONE_BACKDROP}`} fetchPriority="high" />
      </head>
      {/* site.js sets the body background as sections scroll by */}
      <body suppressHydrationWarning>
        {children}
        {/* site.js loads GSAP 3.12.5 / ScrollTrigger / Lenis 1.1.18 (self-hosted in public/vendor) itself, after the hero */}
        <script defer src={asset("/js/site.js")} />
      </body>
    </html>
  );
}
