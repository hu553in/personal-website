import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { codeRegistry, site } from "../site-data";
import { cometProgressDocumentation } from "./comet-progress-demo";

const registryMarkdown = readFileSync(
  path.join(process.cwd(), "public/registry.md"),
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
const registryManifest = JSON.parse(
  readFileSync(path.join(process.cwd(), "registry.json"), "utf-8")
) as {
  items: {
    description?: string;
    name: string;
    registryDependencies?: string[];
    title?: string;
  }[];
};

describe("registry content", () => {
  test("keeps the public Markdown page aligned with the rendered documentation", () => {
    expect(registryMarkdown).toContain(`# ${codeRegistry.title}`);
    expect(registryMarkdown).toContain(codeRegistry.description);
    expect(registryMarkdown).toContain(codeRegistry.githubHref);
    expect(registryMarkdown).toContain(codeRegistry.licenseHref);
    expect(registryMarkdown).toContain(
      `## ${cometProgressDocumentation.title}`
    );
    expect(registryMarkdown).toContain(cometProgressDocumentation.description);
    for (const variable of [
      cometProgressDocumentation.theming.active,
      cometProgressDocumentation.theming.empty,
      ...cometProgressDocumentation.theming.fallbacks,
    ]) {
      expect(registryMarkdown).toContain(`\`${variable}\``);
    }
    expect(registryMarkdown).toContain(
      `\`\`\`bash\n${cometProgressDocumentation.installCommand}\n\`\`\``
    );
    expect(registryMarkdown).toContain(
      `\`\`\`tsx\n${cometProgressDocumentation.usage}\n\`\`\``
    );
  });

  test("keeps the registry manifest aligned with the component documentation", () => {
    const manifestItem = registryManifest.items.find(
      (item) => item.name === cometProgressDocumentation.id
    );

    expect(manifestItem).toStrictEqual(
      expect.objectContaining({
        description: cometProgressDocumentation.description,
        registryDependencies: ["utils"],
        title: cometProgressDocumentation.title,
      })
    );
  });

  test("keeps the registry discoverable from the public text surfaces", () => {
    expect(profileMarkdown).toContain(
      `### ${codeRegistry.title} (${codeRegistry.role})`
    );
    expect(profileMarkdown).toContain(codeRegistry.description);
    expect(profileMarkdown).toContain(`${site.url}${codeRegistry.href}`);
    expect(profileMarkdown).toContain(codeRegistry.githubHref);
    expect(llmsIndex).toContain(`${site.url}${codeRegistry.href}.md`);
  });
});
