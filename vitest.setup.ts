import { vi } from "vitest";

// Vitest imports the poster without the app's build-time image metadata.
vi.mock(import("@/public/hero.webp"), () => ({
  default: {
    blurDataURL: "data:image/webp;base64,UklGRg==",
    height: 464,
    src: "/hero.webp",
    width: 832,
  },
}));
