import { createHash } from "node:crypto";

import { describe, expect, test } from "vitest";

import { GET as getProfileImage } from "../og.png/route";
import { GET as getRegistryImage } from "../registry/og.png/route";

const imageWidth = 1200;
const imageHeight = 630;
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

describe.each([
  [
    "profile",
    getProfileImage,
    "210e61f5dbb71f0dc82716fed35d8fda656f513d2bf396491b5ec55b8f2e5d6a",
  ],
  [
    "registry",
    getRegistryImage,
    "f2f6a899dcb1bb6759a6229413f1fdd2be432224c3396ce199eed8df9ee5f8a1",
  ],
])("%s Open Graph image", (_name, getImage, expectedHash) => {
  test("renders the public PNG contract", async () => {
    const response = getImage();
    const image = new Uint8Array(await response.arrayBuffer());
    const dimensions = new DataView(image.buffer);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect([...image.subarray(0, pngSignature.length)]).toStrictEqual(
      pngSignature
    );
    expect(dimensions.getUint32(16)).toBe(imageWidth);
    expect(dimensions.getUint32(20)).toBe(imageHeight);
    expect(createHash("sha256").update(image).digest("hex")).toBe(expectedHash);
  });
});
