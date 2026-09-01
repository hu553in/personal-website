import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { RegistryNavigation } from "./registry-navigation";

const items = [
  { id: "comet-progress", title: "Comet progress" },
  { id: "number-ticker", title: "Number ticker" },
] as const;

let notifyIntersection: IntersectionObserverCallback = vi.fn();

const renderNavigation = () => {
  render(
    <>
      <RegistryNavigation items={items} />
      <section id="comet-progress" />
      <section id="number-ticker" />
    </>
  );

  return {
    firstLink: screen.getByRole("link", { name: "Comet progress" }),
    firstSection: document.querySelector("#comet-progress"),
    picker: screen.getByRole("combobox", {
      name: "Registry component",
    }) as HTMLSelectElement,
    secondLink: screen.getByRole("link", { name: "Number ticker" }),
    secondSection: document.querySelector("#number-ticker"),
  };
};

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

test("tracks the current section and navigates from the mobile picker", () => {
  const { firstLink, firstSection, picker, secondLink, secondSection } =
    renderNavigation();
  const scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
  const pushState = vi.spyOn(window.history, "pushState");
  const replaceState = vi.spyOn(window.history, "replaceState");

  expect(firstLink.getAttribute("aria-current")).toBe("location");
  expect(picker.value).toBe("comet-progress");

  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 100,
  });
  fireEvent.wheel(window);
  fireEvent.scroll(window);
  act(() => {
    notifyIntersection(
      [
        {
          boundingClientRect: { top: 200 },
          isIntersecting: true,
          target: secondSection,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    );
  });

  expect(firstLink.getAttribute("aria-current")).toBeNull();
  expect(secondLink.getAttribute("aria-current")).toBe("location");
  expect(picker.value).toBe("number-ticker");
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
  act(() => {
    notifyIntersection(
      [
        {
          boundingClientRect: { top: 200 },
          isIntersecting: true,
          target: firstSection,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    );
  });

  expect(secondLink.getAttribute("aria-current")).toBe("location");
  expect(window.location.hash).toBe("#number-ticker");

  fireEvent.change(picker, { target: { value: "comet-progress" } });

  expect(window.location.hash).toBe("#comet-progress");
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

test("preserves a hashless URL during browser scroll restoration", () => {
  window.history.replaceState(null, "", "/registry#number-ticker");
  const getBoundingClientRect = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue(new DOMRect(0, 0, 0, 0));
  const { firstLink, secondLink } = renderNavigation();

  expect(secondLink.getAttribute("aria-current")).toBe("location");
  fireEvent.wheel(window);
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

test("restores the first item and hash when scrolling above its activation line", () => {
  window.history.replaceState(null, "", "/registry#number-ticker");
  const getBoundingClientRect = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue(new DOMRect(0, 240, 0, 0));
  const replaceState = vi.spyOn(window.history, "replaceState");
  const pushState = vi.spyOn(window.history, "pushState");

  const { firstLink, picker, secondLink } = renderNavigation();

  expect(secondLink.getAttribute("aria-current")).toBe("location");
  replaceState.mockClear();
  getBoundingClientRect.mockReturnValue(new DOMRect(0, 200, 0, 0));

  fireEvent.wheel(window);
  fireEvent.scroll(window);

  expect(firstLink.getAttribute("aria-current")).toBe("location");
  expect(secondLink.getAttribute("aria-current")).toBeNull();
  expect(picker.value).toBe("comet-progress");
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
