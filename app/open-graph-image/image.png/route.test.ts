import { describe, expect, test } from "vitest";

import { GET as profileImage } from "../../og.png/route";
import { GET } from "./route";

describe("Open Graph editor export", () => {
  test("exports the exact site OG by default", async () => {
    const response = GET(
      new Request("https://example.com/open-graph-image/image.png?download=1")
    );
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(new Uint8Array(await response.arrayBuffer())).toStrictEqual(
      new Uint8Array(await profileImage().arrayBuffer())
    );
  });

  test("renders custom text at OG resolution", async () => {
    const response = GET(
      new Request(
        "https://example.com/open-graph-image/image.png?title=Test&description=Custom"
      )
    );
    const bytes = await response.arrayBuffer();
    expect(new Uint8Array(bytes)).not.toStrictEqual(
      new Uint8Array(await profileImage().arrayBuffer())
    );
    const dimensions = new DataView(bytes);
    expect(dimensions.getUint32(16)).toBe(1200);
    expect(dimensions.getUint32(20)).toBe(630);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  test("rejects unbounded text", () => {
    for (const query of [
      `title=${"a".repeat(121)}`,
      `description=${"a".repeat(241)}`,
    ]) {
      expect(
        GET(
          new Request(`https://example.com/open-graph-image/image.png?${query}`)
        ).status
      ).toBe(400);
    }
  });
});
