import type { Metadata, Viewport } from "next";
import { SITE_URL, asset } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Superhero Santa",
  description:
    "Superhero Santa is a toddler bedtime picture-book series about Santa Claus and the spirit of Christmas. Book One — “Santa, the Reindeer Are Missing!” — is coming soon. Join the launch list.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Superhero Santa — Book One: Santa, the Reindeer Are Missing!",
    images: ["/assets/img/book-one-cover.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // site.js adds classes (fx / rm / no-js) to <html> at runtime
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,900,100&family=Nunito:wght@400;700&display=swap"
        />
        <link rel="stylesheet" href={asset("/css/site.css")} />
      </head>
      <body>
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
