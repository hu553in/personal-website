import { readFileSync } from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { projects } from "./data";
import Home from "./page";
import { site } from "./site-data";

const profileMarkdown = readFileSync(
  path.join(process.cwd(), "public/index.md"),
  "utf-8"
);

describe("project portfolio", () => {
  test("renders every project and keeps descriptions and links in the Markdown profile", () => {
    const document = new DOMParser().parseFromString(
      renderToStaticMarkup(<Home />),
      "text/html"
    );
    const section = document.querySelector("#projects");
    expect(section).not.toBeNull();
    const markdownProjects =
      profileMarkdown.split("## Projects\n")[1]?.split("\n## ")[0] ?? "";
    expect(
      [...markdownProjects.matchAll(/^### (?<heading>.+)$/gmu)].map(
        (match) => match.groups?.["heading"]
      )
    ).toStrictEqual(
      projects.map((project) => `${project.name} (${project.role})`)
    );
    for (const project of projects) {
      expect(section?.textContent).toContain(project.name);
      for (const paragraph of project.description) {
        expect(section?.textContent).toContain(paragraph);
        expect(profileMarkdown.replaceAll(/\s+/gu, " ")).toContain(
          paragraph.replaceAll(/\s+/gu, " ")
        );
      }
      for (const link of project.links) {
        expect(section?.querySelector(`a[href="${link.href}"]`)).not.toBeNull();
        expect(profileMarkdown).toContain(
          link.href.startsWith("/") ? `${site.url}${link.href}` : link.href
        );
      }
    }
    expect(new Set(projects.map((project) => project.name)).size).toBe(
      projects.length
    );
  });
});
