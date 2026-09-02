import type { MetadataRoute } from "next";

import { site } from "./site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "monthly",
      priority: 1,
      url: site.url,
    },
    {
      changeFrequency: "monthly",
      priority: 0.8,
      url: `${site.url}/registry`,
    },
  ];
}
