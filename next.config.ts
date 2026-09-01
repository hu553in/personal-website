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
        ],
        source: "/",
      },
      {
        headers: [
          {
            key: "Link",
            value: '</>; rel="alternate"; type="text/html"',
          },
        ],
        source: "/index.md",
      },
      {
        headers: [
          {
            key: "Link",
            value: '</registry.md>; rel="alternate"; type="text/markdown"',
          },
        ],
        source: "/registry",
      },
      {
        headers: [
          {
            key: "Link",
            value: '</registry>; rel="alternate"; type="text/html"',
          },
        ],
        source: "/registry.md",
      },
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
