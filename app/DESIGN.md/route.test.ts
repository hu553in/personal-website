// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { site } from "../site-data";
import { GET } from "./route";

const read = (file: string) =>
  readFileSync(path.join(process.cwd(), file), "utf-8");

describe("DESIGN.md", () => {
  it("serves the repository file unchanged as an inline Markdown document", async () => {
    const response = GET();
    const body = await response.text();

    expect(Object.fromEntries(response.headers)).toStrictEqual({
      "cache-control": "public, max-age=0, must-revalidate",
      "content-disposition": 'inline; filename="DESIGN.md"',
      "content-type": "text/markdown; charset=utf-8",
    });
    expect(body.startsWith("# Design\n")).toBeTruthy();
    expect(body).toBe(read("DESIGN.md"));
  });

  it("is discoverable from the public text surfaces", () => {
    expect(read("public/llms.txt")).toContain(`${site.url}/DESIGN.md`);
    expect(read("README.md")).toContain(`${site.url}/DESIGN.md`);
  });
});
