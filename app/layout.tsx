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

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#B4202B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // site.js adds classes (fx / rm / no-js) to <html> at runtime
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..900,0..100;1,9..144,400..900,0..100&family=Nunito:wght@400;600;700&display=swap"
        />
        <link rel="stylesheet" href={asset("/css/site.css")} />
        {/* the hero backdrop is a CSS background, so the browser can't discover it early on its own */}
        <link rel="preload" as="image" href={asset("/assets/img/hero-backdrop.webp")} fetchPriority="high" />
      </head>
      {/* site.js sets the body background as sections scroll by */}
      <body suppressHydrationWarning>
        {children}
        {/* Self-hosted (public/vendor, pinned: GSAP 3.12.5, Lenis 1.1.18). defer keeps order. */}
        <script defer src={asset("/vendor/gsap.min.js")} />
        <script defer src={asset("/vendor/ScrollTrigger.min.js")} />
        <script defer src={asset("/vendor/lenis.min.js")} />
        <script defer src={asset("/js/site.js")} />
      </body>
    </html>
  );
}
