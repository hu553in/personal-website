import { vi } from "vitest";

// Vitest does not run Next.js static image metadata generation.
vi.mock(import("@/public/hero.webp"), () => ({
  default: {
    blurDataURL: "data:image/webp;base64,UklGRg==",
    height: 464,
    src: "/hero.webp",
    width: 832,
  },
}));
