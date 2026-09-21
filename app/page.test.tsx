import { within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import Home from "./page";

const renderHome = () => {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<Home />);
  return within(container);
};

describe("home page links", () => {
  test("short links identify their destination without changing visible labels", () => {
    const page = renderHome();
    const resume = page.getByRole("link", { name: "Resume pdf" });
    expect(resume.textContent).toBe("pdf");
    expect(resume.getAttribute("href")).toBe("/resume.pdf");

    const repository = page.getByRole("link", { name: "vlt github" });
    expect(repository.textContent).toBe("github");
    expect(repository.getAttribute("href")).toBe(
      "https://github.com/hu553in/vlt"
    );

    const website = page.getByRole("link", { name: "voomy website" });
    expect(website.textContent).toBe("website");
    expect(website.getAttribute("href")).toBe("https://voomy.tv/product");
  });

  test("publication links identify the work and preserve the language label", () => {
    const page = renderHome();
    const article = page.getByRole("link", {
      name: "How we’re reducing divergence across Go services medium en",
    });
    expect(article.textContent).toBe("medium en");

    const talk = page.getByRole("link", {
      name: "Designing a Real-World High-Scale Content Filtering System youtube ru",
    });
    expect(talk.textContent).toBe("youtube ru");
    expect(talk.getAttribute("href")).toBe(
      "https://www.youtube.com/watch?v=Xkidzosg02E"
    );
  });
});
