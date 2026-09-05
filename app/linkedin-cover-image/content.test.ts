import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { linkedInCoverImage, site } from "../site-data";

const coverImageMarkdown = readFileSync(
  path.join(process.cwd(), "public/linkedin-cover-image.md"),
  "utf-8"
);
const profileMarkdown = readFileSync(
  path.join(process.cwd(), "public/index.md"),
  "utf-8"
);
const llmsIndex = readFileSync(
  path.join(process.cwd(), "public/llms.txt"),
  "utf-8"
);

describe("LinkedIn cover image content", () => {
  test("keeps the Markdown page aligned with the rendered page", () => {
    expect(coverImageMarkdown).toContain(`# ${linkedInCoverImage.title}`);
    expect(coverImageMarkdown).toContain(linkedInCoverImage.description);
    expect(coverImageMarkdown).toContain(
      `${site.url}${linkedInCoverImage.href}`
    );
  });

  test("keeps the editor discoverable from the public text surfaces", () => {
    expect(profileMarkdown).toContain(
      `### ${linkedInCoverImage.title} (${linkedInCoverImage.role})`
    );
    expect(profileMarkdown).toContain(
      `[page](${site.url}${linkedInCoverImage.href})`
    );
    expect(profileMarkdown).toContain(linkedInCoverImage.description);
    expect(llmsIndex).toContain(`${site.url}${linkedInCoverImage.href}.md`);
  });
});
