import type { Locator, Page } from "playwright/test";
import { expect, test } from "playwright/test";

const mobilePanel = (page: Page) => page.locator("#mobile-page-navigation");
const toggle = (page: Page) =>
  page.getByRole("button", { name: /On this page/u });
const visibleNavigation = (page: Page) =>
  page
    .getByRole("navigation", { name: "Page sections" })
    .filter({ visible: true });
const openPage = async (page: Page, path = "/") => {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  // A working disclosure proves hydration finished before history/scroll actions.
  await page.setViewportSize({ height: 660, width: 390 });
  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
  await toggle(page).click();
};
const expectInsideViewport = async (locator: Locator) => {
  await expect(locator).toBeInViewport({ ratio: 1 });
  const bounds = await locator.boundingBox();
  if (!bounds) {
    throw new Error("Navigation element has no bounds");
  }
  const height = await locator.page().evaluate(() => window.innerHeight);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(height + 1);
};

test("the upward disclosure centers its trigger between the separators", async ({
  page,
}) => {
  await openPage(page);
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  await toggle(page).click();
  await expect(mobilePanel(page)).toHaveCSS("border-top-width", "1px");
  await expect(mobilePanel(page)).toHaveCSS("border-bottom-width", "0px");
  await expect(toggle(page).locator("xpath=ancestor::nav")).toHaveCSS(
    "border-top-width",
    "1px"
  );
  await expect
    .poll(async () => {
      const panel = await mobilePanel(page).boundingBox();
      const navigation = await visibleNavigation(page).boundingBox();
      return panel && navigation
        ? panel.y + panel.height - navigation.y
        : Infinity;
    })
    .toBeLessThanOrEqual(1);
  await expect
    .poll(async () => {
      const panel = await mobilePanel(page).boundingBox();
      const row = await toggle(page).boundingBox();
      const divider = await page.locator("main > hr").first().boundingBox();
      if (!panel || !row || !divider) {
        return Infinity;
      }
      return Math.abs(
        row.y + row.height / 2 - (panel.y + panel.height + divider.y) / 2
      );
    })
    .toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    height
  );
});

for (const path of ["/", "/registry"]) {
  test(`the downward disclosure centers Back to top on ${path}`, async ({
    page,
  }) => {
    await openPage(page, path);
    await page.evaluate(() => scrollTo({ behavior: "instant", top: 1600 }));
    await expect(toggle(page)).not.toHaveText("On this page");
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    await toggle(page).click();
    const back = mobilePanel(page).getByRole("button", { name: "Back to top" });
    await expect(back).toBeVisible();
    await expect
      .poll(async () => {
        const panel = await mobilePanel(page).boundingBox();
        const navigation = await visibleNavigation(page).boundingBox();
        return panel && navigation
          ? panel.y - navigation.y - navigation.height
          : -Infinity;
      })
      .toBeGreaterThanOrEqual(-1);
    const spacing = await back.evaluate((button) => {
      const row = button.getBoundingClientRect();
      const footer = button.parentElement;
      const panel = footer?.parentElement;
      if (!footer || !panel) {
        throw new Error("Back to top has no panel");
      }
      return {
        above: row.top - footer.getBoundingClientRect().top - footer.clientTop,
        below:
          panel.getBoundingClientRect().bottom -
          (panel.offsetHeight - panel.clientHeight - panel.clientTop) -
          row.bottom,
      };
    });
    expect(Math.abs(spacing.above - spacing.below)).toBeLessThanOrEqual(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight)
    ).toBe(height);
  });
}

for (const path of ["/", "/registry"]) {
  test(`desktop navigation remains usable in a short viewport on ${path}`, async ({
    page,
  }) => {
    await openPage(page, path);
    await page.setViewportSize({ height: 250, width: 1440 });
    await page.evaluate(() =>
      scrollTo({
        behavior: "instant",
        top: document.documentElement.scrollHeight,
      })
    );
    const navigation = visibleNavigation(page);
    const active = navigation.locator('[aria-current="location"]');
    await expect(active).toHaveCount(1);
    await expectInsideViewport(active);
    const back = navigation.getByRole("button", { name: "Back to top" });
    await expectInsideViewport(back);
    await active.click();
    await expectInsideViewport(active);
    await back.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });
}

for (const height of [660, 500]) {
  test(`mobile navigation reaches its last item and Back to top at 390×${height}`, async ({
    page,
  }) => {
    await openPage(page);
    await page.setViewportSize({ height, width: 390 });
    await toggle(page).click();
    const last = mobilePanel(page).getByRole("link", { name: "Miscellany" });
    await expectInsideViewport(mobilePanel(page));
    await mobilePanel(page)
      .locator("ul")
      .evaluate((list) => {
        list.scrollTop = list.scrollHeight;
      });
    await expectInsideViewport(last);
    await expectInsideViewport(mobilePanel(page));
    await last.click();
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(toggle(page)).toContainText("Miscellany");
    await toggle(page).click();
    const back = mobilePanel(page).getByRole("button", { name: "Back to top" });
    await expectInsideViewport(back);
    await back.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(toggle(page)).toBeFocused();
  });
}

test("one-section registry supports keyboard dismissal and responsive closing", async ({
  page,
}) => {
  await openPage(page, "/registry");
  await toggle(page).click();
  await expect(mobilePanel(page).getByRole("link")).toHaveCount(1);
  await mobilePanel(page).getByRole("link").focus();
  await page.keyboard.press("Escape");
  await expect(toggle(page)).toBeFocused();
  await expect(mobilePanel(page)).toHaveCount(0);
  await toggle(page).click();
  await page.setViewportSize({ height: 1000, width: 1440 });
  await expect(mobilePanel(page)).toHaveCount(0);
  await page.setViewportSize({ height: 660, width: 390 });
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
});

test("scrollspy visits every section in both directions without changing the URL", async ({
  page,
}) => {
  await openPage(page);
  await page.setViewportSize({ height: 1000, width: 1440 });
  const expected = await visibleNavigation(page)
    .getByRole("link")
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")?.slice(1))
    );
  const observed = await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    // Browser evaluation must keep the frame-driven scanner inside its serialized callback.
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const scan = async (positions: number[]) => {
      const ids: string[] = [];
      for (const y of positions) {
        scrollTo({ behavior: "instant", top: y });
        // Observe each intermediate position after both scroll and React updates.
        // oxlint-disable-next-line eslint/no-await-in-loop, promise/avoid-new
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
        const id = document
          .querySelector('[aria-current="location"]')
          ?.getAttribute("href")
          ?.slice(1);
        if (id && ids.at(-1) !== id) {
          ids.push(id);
        }
      }
      return ids;
    };
    const positions = [
      ...Array.from({ length: Math.ceil(max / 20) }, (_, index) => index * 20),
      max,
    ];
    return {
      down: await scan(positions),
      up: await scan(positions.toReversed()),
    };
  });
  expect(observed.down).toEqual(expected);
  expect(observed.up).toEqual(expected.toReversed());
  await expect(page).toHaveURL("/");
});

for (const withoutNavigationAPI of [false, true]) {
  test(`native fragments retain reading position across history and reload${withoutNavigationAPI ? " without Navigation API" : ""}`, async ({
    page,
  }) => {
    if (withoutNavigationAPI) {
      await page.addInitScript(() =>
        Object.defineProperty(window, "navigation", {
          configurable: true,
          value: undefined,
        })
      );
    }
    await openPage(page);
    await page.setViewportSize({ height: 1000, width: 1440 });
    await page.evaluate(() => {
      location.hash = "connect";
    });
    await expect(page).toHaveURL(/#connect$/u);
    await expect(
      visibleNavigation(page).getByRole("link", {
        exact: true,
        name: "Connect",
      })
    ).toHaveAttribute("aria-current", "location");
    await page.evaluate(() => scrollTo({ behavior: "instant", top: 1600 }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(1600);
    await visibleNavigation(page)
      .getByRole("link", { exact: true, name: "Work" })
      .click();
    await expect(page).toHaveURL(/#work$/u);
    const workPosition = await page.evaluate(() => scrollY);
    await page.evaluate(() => {
      document.documentElement.dataset["historyDocument"] = "same";
    });
    await page.goBack();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(1600);
    await expect(page.locator("html")).toHaveAttribute(
      "data-history-document",
      "same"
    );
    await page.goForward();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(workPosition);
    await page.goBack();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(1600);
    await page.reload();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(1600);
    await expect(page).toHaveURL(/#connect$/u);
  });
}

test("an initial deep link selects its section and Back to top preserves the query", async ({
  page,
}) => {
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto("/?source=navigation-test#connect");
  await expect(
    visibleNavigation(page).getByRole("link", { exact: true, name: "Connect" })
  ).toHaveAttribute("aria-current", "location");
  await visibleNavigation(page)
    .getByRole("button", { name: "Back to top" })
    .click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page).toHaveURL("/?source=navigation-test");
  await expect(
    visibleNavigation(page).locator('[aria-current="location"]')
  ).toHaveCount(0);
});

test.describe("animated navigation", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a new section interrupts smooth scrolling and history restores the interrupted position", async ({
    page,
  }) => {
    await openPage(page);
    await page.setViewportSize({ height: 1000, width: 1440 });
    const work = visibleNavigation(page).getByRole("link", {
      exact: true,
      name: "Work",
    });
    const workPosition = await page
      .locator("section#work")
      .evaluate((section) =>
        Math.round(section.getBoundingClientRect().top + scrollY)
      );
    const lastPosition = await page.evaluate(
      () => document.documentElement.scrollHeight - innerHeight
    );
    await work.evaluate((link) => {
      window.addEventListener("scrollend", () => {
        link.dataset["settledPosition"] = String(scrollY);
      });
      link.addEventListener(
        "click",
        () => {
          link.dataset["interruptedPosition"] = String(scrollY);
        },
        { capture: true, once: true }
      );
    });
    await visibleNavigation(page)
      .getByRole("link", { exact: true, name: "Miscellany" })
      .click();
    await expect
      .poll(() => page.evaluate(() => scrollY), { intervals: [16] })
      .toBeGreaterThan(0);
    await work.click();
    const interruptedPosition = Number(
      await work.getAttribute("data-interrupted-position")
    );
    expect(interruptedPosition).toBeGreaterThan(0);
    expect(interruptedPosition).toBeLessThan(lastPosition);
    // Wait for completion, not a matching frame while the animation is still moving.
    await expect
      .poll(async () =>
        Math.round(Number(await work.getAttribute("data-settled-position")))
      )
      .toBe(workPosition);
    await expect(work).toHaveAttribute("aria-current", "location");

    await page.goBack();
    await expect(page).toHaveURL(/#miscellany$/u);
    // Firefox can expose fractional CSS pixels after restoring a smooth-scroll frame.
    await expect
      .poll(() =>
        page.evaluate(
          (position) => Math.abs(scrollY - position),
          interruptedPosition
        )
      )
      .toBeLessThan(1);
    await page.goForward();
    await expect(page).toHaveURL(/#work$/u);
    await expect
      .poll(() => page.evaluate(() => Math.round(scrollY)))
      .toBe(workPosition);
    await visibleNavigation(page)
      .getByRole("button", { name: "Back to top" })
      .click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page).toHaveURL("/");
  });
});
