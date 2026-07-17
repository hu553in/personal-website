import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";

import "./globals.css";

import { connectLinks, identity, site, work } from "./data";
import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/index.md",
    },
  },
  description: site.description,
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { type: "image/svg+xml", url: "/favicon.svg" },
      { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
      { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
    ],
  },
  metadataBase: new URL(site.url),
  openGraph: {
    description: site.description,
    images: [{ height: 630, url: "/og.png", width: 1200 }],
    title: site.title,
    type: "website",
    url: "/",
  },
  title: site.title,
  twitter: {
    card: "summary_large_image",
    description: site.description,
    images: ["/og.png"],
    title: site.title,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: site.themeColor.light, media: "(prefers-color-scheme: light)" },
    { color: site.themeColor.dark, media: "(prefers-color-scheme: dark)" },
  ],
  viewportFit: "cover",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  image: identity.photo,
  jobTitle: "Senior Product Engineer",
  name: identity.name,
  sameAs: connectLinks
    .map((link) => link.href)
    .filter((href) => href.startsWith("https://")),
  url: site.url,
  worksFor: {
    "@type": "Organization",
    name: work[0]?.title,
    url: work[0]?.links[0]?.href,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* The theme-transition mask GIF loads lazily on first toggle;
            prefetch it so the first lap is smooth even on slow networks. */}
        <link as="image" href="/theme-toggle.gif" rel="prefetch" />
        <script
          type="application/ld+json"
          // oxlint-disable-next-line react/no-danger -- Canonical Next.js JSON-LD pattern; the payload is JSON.stringify of local static data.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
