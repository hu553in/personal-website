import type { MetadataRoute } from "next";

import { site } from "./data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "monthly",
      priority: 1,
      url: site.url,
    },
  ];
}
