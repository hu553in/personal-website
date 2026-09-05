import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { PageNavigation } from "./page-navigation";

const items = [
  { id: "comet-progress", title: "Comet progress" },
  { id: "number-ticker", title: "Number ticker" },
] as const;

let notifyIntersection: IntersectionObserverCallback = vi.fn();
let restoreFragment: FrameRequestCallback = () => {};

const intersectSection = (target: Element, top = 200) => {
  act(() => {
    notifyIntersection(
      [
        {
          boundingClientRect: { top },
          isIntersecting: true,
          target,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    );
  });
};

const renderNavigation = () => {
  render(
    <>
      <PageNavigation items={items} />
      <section id="comet-progress" />
      <section id="number-ticker" />
    </>
  );

  const [desktopNavigation, mobileNavigation] = screen.getAllByRole(
    "navigation",
    { name: "Page sections" }
  );

  if (!(desktopNavigation && mobileNavigation)) {
    throw new Error("Expected desktop and mobile page navigation");
  }

  const disclosure = within(mobileNavigation).getByText("On this page")
    .parentElement as HTMLElement;

  return {
    disclosure,
    firstLink: within(desktopNavigation).getByRole("link", {
      name: "Comet progress",
    }),
    firstSection: document.querySelector("#comet-progress") as HTMLElement,
    mobileNavigation,
    secondLink: within(desktopNavigation).getByRole("link", {
      name: "Number ticker",
    }),
    secondSection: document.querySelector("#number-ticker") as HTMLElement,
  };
};

describe(PageNavigation, () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/registry");
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 4000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as MediaQueryList);
    vi.stubGlobal(
      "IntersectionObserver",
      class implements IntersectionObserver {
        readonly root = null;
        readonly rootMargin = "";
        readonly scrollMargin = "";
        readonly thresholds = [0];

        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- IntersectionObserver is callback-based by design.
        constructor(callback: IntersectionObserverCallback) {
          notifyIntersection = callback;
        }

        disconnect = vi.fn();
        observe = vi.fn();
        // oxlint-disable-next-line eslint/class-methods-use-this -- The platform method has no instance-dependent behavior in this mock.
        takeRecords = () => [];
        unobserve = vi.fn();
      }
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("tracks the current section and navigates from the mobile disclosure", () => {
    const {
      disclosure,
      firstLink,
      firstSection,
      mobileNavigation,
      secondLink,
      secondSection,
    } = renderNavigation();
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
    const pushState = vi.spyOn(window.history, "pushState");
    const replaceState = vi.spyOn(window.history, "replaceState");

    expect(firstLink.getAttribute("aria-current")).toBe("location");
    expect(within(disclosure).getByText("Comet progress")).toBeDefined();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 100,
    });
    fireEvent.scroll(window);
    intersectSection(secondSection);

    expect(firstLink.getAttribute("aria-current")).toBeNull();
    expect(secondLink.getAttribute("aria-current")).toBe("location");
    expect(within(disclosure).getByText("Number ticker")).toBeDefined();
    expect(window.location.hash).toBe("#number-ticker");
    expect(replaceState).toHaveBeenLastCalledWith(
      window.history.state,
      "",
      "#number-ticker"
    );
    expect(pushState).not.toHaveBeenCalled();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 3200,
    });
    fireEvent.scroll(window);
    intersectSection(firstSection);

    expect(secondLink.getAttribute("aria-current")).toBe("location");
    expect(window.location.hash).toBe("#number-ticker");

    fireEvent.click(disclosure);
    fireEvent.click(
      within(mobileNavigation).getByRole("link", { name: "Comet progress" })
    );

    expect(window.location.hash).toBe("#comet-progress");
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(disclosure);
    expect(pushState).toHaveBeenLastCalledWith(
      window.history.state,
      "",
      "#comet-progress"
    );
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  test("restores hash navigation without duplicating the current history entry", () => {
    window.history.replaceState(null, "", "/registry#number-ticker");
    const { firstLink, secondLink } = renderNavigation();
    const pushState = vi.spyOn(window.history, "pushState");
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

    expect(secondLink.getAttribute("aria-current")).toBe("location");

    fireEvent.click(secondLink);

    expect(pushState).not.toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", "/registry#comet-progress");
    fireEvent(window, new HashChangeEvent("hashchange"));

    expect(firstLink.getAttribute("aria-current")).toBe("location");
    expect(secondLink.getAttribute("aria-current")).toBeNull();
  });

  test("restores a fragment that appears after the navigation mounts", () => {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- requestAnimationFrame is callback-based by design.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      restoreFragment = callback;
      return 1;
    });
    const { firstLink, firstSection, secondLink } = renderNavigation();

    window.history.replaceState(null, "", "/registry#number-ticker");
    act(() => restoreFragment(0));
    intersectSection(firstSection);

    expect(firstLink.getAttribute("aria-current")).toBeNull();
    expect(secondLink.getAttribute("aria-current")).toBe("location");

    fireEvent.wheel(window);
    intersectSection(firstSection);

    expect(firstLink.getAttribute("aria-current")).toBe("location");
    expect(secondLink.getAttribute("aria-current")).toBeNull();
  });

  test("preserves a hashless URL during browser scroll restoration", () => {
    window.history.replaceState(null, "", "/registry#number-ticker");
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 0, 0, 0));
    const { firstLink, secondLink } = renderNavigation();

    expect(secondLink.getAttribute("aria-current")).toBe("location");
    window.history.replaceState(null, "", "/registry");

    const replaceState = vi.spyOn(window.history, "replaceState");

    fireEvent(window, new PopStateEvent("popstate"));
    getBoundingClientRect.mockReturnValue(new DOMRect(0, 200, 0, 0));
    fireEvent.scroll(window);

    expect(firstLink.getAttribute("aria-current")).toBe("location");
    expect(secondLink.getAttribute("aria-current")).toBeNull();
    expect(window.location.hash).toBe("");
    expect(replaceState).not.toHaveBeenCalled();
  });

  test("restores the first item and hash after the user scrolls above its activation line", () => {
    window.history.replaceState(null, "", "/registry#number-ticker");
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 240, 0, 0));
    const replaceState = vi.spyOn(window.history, "replaceState");
    const pushState = vi.spyOn(window.history, "pushState");

    const { disclosure, firstLink, secondLink } = renderNavigation();

    expect(secondLink.getAttribute("aria-current")).toBe("location");
    replaceState.mockClear();
    getBoundingClientRect.mockReturnValue(new DOMRect(0, 200, 0, 0));

    fireEvent.wheel(window);
    fireEvent.scroll(window);

    expect(firstLink.getAttribute("aria-current")).toBe("location");
    expect(secondLink.getAttribute("aria-current")).toBeNull();
    expect(within(disclosure).getByText("Comet progress")).toBeDefined();
    expect(window.location.hash).toBe("#comet-progress");
    expect(replaceState).toHaveBeenLastCalledWith(
      window.history.state,
      "",
      "#comet-progress"
    );
    expect(pushState).not.toHaveBeenCalled();
  });

  test("avoids smooth scrolling when motion is reduced", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const { secondLink } = renderNavigation();
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

    fireEvent.click(secondLink);

    expect(scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "auto",
      block: "start",
    });
  });

  test("omits the mobile disclosure for a single section", () => {
    render(
      <>
        <PageNavigation items={[items[0]]} />
        <section id="comet-progress" />
      </>
    );

    expect(
      screen.getAllByRole("navigation", { name: "Page sections" })
    ).toHaveLength(1);
  });

  test("closes the mobile disclosure from outside and with Escape", () => {
    const { disclosure, mobileNavigation } = renderNavigation();

    fireEvent.click(disclosure);
    const mobileLink = within(mobileNavigation).getByRole("link", {
      name: "Number ticker",
    });
    mobileLink.focus();
    expect(disclosure.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(document.body);
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(disclosure);

    fireEvent.click(disclosure);
    within(mobileNavigation)
      .getByRole("link", { name: "Number ticker" })
      .focus();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(disclosure);
  });

  test("reveals the active mobile item without scrolling the page", () => {
    const { disclosure, mobileNavigation, secondSection } = renderNavigation();
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

    fireEvent.click(disclosure);

    const list = within(mobileNavigation).getByRole("list");
    const activeLink = within(mobileNavigation).getByRole("link", {
      name: "Number ticker",
    });

    Object.defineProperty(activeLink, "offsetParent", {
      configurable: true,
      value: list,
    });
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      value: 0,
      writable: true,
    });
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 200, 100)
    );
    vi.spyOn(activeLink, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 120, 200, 40)
    );

    intersectSection(secondSection);

    expect(list.scrollTop).toBe(60);
    expect(window.scrollY).toBe(0);
    expect(window.location.hash).toBe("");
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test("keeps the chosen item active during programmatic scrolling", () => {
    const { firstLink, firstSection, secondLink } = renderNavigation();

    fireEvent.click(secondLink);
    fireEvent.scroll(window);
    fireEvent.keyDown(window, { key: "Shift" });
    intersectSection(firstSection);

    expect(firstLink.getAttribute("aria-current")).toBeNull();
    expect(secondLink.getAttribute("aria-current")).toBe("location");
    expect(window.location.hash).toBe("#number-ticker");
    fireEvent.keyDown(window, { key: "ArrowDown" });
    intersectSection(firstSection);

    expect(firstLink.getAttribute("aria-current")).toBe("location");

    fireEvent.click(secondLink);
    fireEvent.scroll(window);
    fireEvent(window, new Event("scrollend"));
    intersectSection(firstSection);

    expect(firstLink.getAttribute("aria-current")).toBe("location");
    expect(secondLink.getAttribute("aria-current")).toBeNull();
    expect(window.location.hash).toBe("#comet-progress");
  });
});
