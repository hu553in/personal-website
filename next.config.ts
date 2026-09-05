import type { NextConfig } from "next";

import { codeRegistry, linkedInCoverImage } from "./app/site-data";

const markdownAlternates = [
  { html: "/", markdown: "/index.md" },
  { html: codeRegistry.href, markdown: `${codeRegistry.href}.md` },
  {
    html: linkedInCoverImage.href,
    markdown: `${linkedInCoverImage.href}.md`,
  },
] as const;

const nextConfig: NextConfig = {
  headers() {
    return Promise.resolve([
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        source: "/fonts/:path*",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
        source: "/theme-toggle.gif",
      },
      ...markdownAlternates.flatMap(({ html, markdown }) => [
        {
          headers: [
            {
              key: "Link",
              value: `<${markdown}>; rel="alternate"; type="text/markdown"`,
            },
          ],
          source: html,
        },
        {
          headers: [
            {
              key: "Link",
              value: `<${html}>; rel="alternate"; type="text/html"`,
            },
          ],
          source: markdown,
        },
      ]),
    ]);
  },
  poweredByHeader: false,
  reactCompiler: true,
  redirects() {
    return Promise.resolve([
      {
        destination: "/index.md",
        permanent: false,
        source: "/llms-full.txt",
      },
    ]);
  },
};

export default nextConfig;
