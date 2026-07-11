import type { NextConfig } from "next";

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
      {
        headers: [
          {
            key: "Link",
            value: '</index.md>; rel="alternate"; type="text/markdown"',
          },
          { key: "Vary", value: "Accept" },
        ],
        source: "/",
      },
    ]);
  },
  poweredByHeader: false,
  reactCompiler: true,
  rewrites() {
    return Promise.resolve({
      afterFiles: [],
      // The root page is prerendered, so the Markdown content negotiation
      // must run before the filesystem match.
      beforeFiles: [
        {
          destination: "/index.md",
          has: [
            {
              key: "accept",
              type: "header",
              value: "(.*text/markdown.*)",
            },
          ],
          source: "/",
        },
      ],
      fallback: [],
    });
  },
};

export default nextConfig;
