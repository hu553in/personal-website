import type { MetadataRoute } from "next";

import { codeRegistry, linkedInCoverImage, site } from "./site-data";

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
      url: `${site.url}${codeRegistry.href}`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.5,
      url: `${site.url}${linkedInCoverImage.href}`,
    },
  ];
}
