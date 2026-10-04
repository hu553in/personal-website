import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, vi, it } from "vitest";

import { PageNavigation } from "./page-navigation";

const items = [
  { id: "about", title: "about" },
  { id: "connect", title: "connect" },
] as const;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
const flush = () =>
  act(() => {
    const pending = [...frames.keys()];
    for (const id of pending) {
      const frame = frames.get(id);
      frames.delete(id);
      frame?.(0);
    }
  });
const scroll = (y: number) => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  fireEvent.scroll(window);
  flush();
};
const mount = (sections: readonly { id: string; title: string }[] = items) => {
  render(
    <main>
      <PageNavigation items={sections} />
      {sections.map((s) => (
        <section id={s.id} key={s.id} />
      ))}
    </main>
  );
  flush();
};

describe(PageNavigation, () => {
  beforeEach(() => {
    sessionStorage.removeItem("page-navigation-reload");
    frames = new Map();
    nextFrame = 0;
    window.history.replaceState(null, "", "/?demo=1");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3000,
    });
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The browser API accepts frame callbacks.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame += 1;
      const id = nextFrame;
      frames.set(id, callback);
      return id;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      frames.delete(id);
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBounds(this: HTMLElement) {
        return new DOMRect(
          0,
          (this.id === "connect" ? 2400 : 600) - window.scrollY,
          500,
          200
        );
      }
    );
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
    } as MediaQueryList);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("activates the first section and back to top together, in both directions", () => {
    mount();
    expect(document.querySelector("[aria-current]")).toBeNull();
    expect(screen.queryByRole("button", { name: "back to top" })).toBeNull();
    scroll(349);
    expect(document.querySelector("[aria-current]")).toBeNull();
    scroll(350);
    expect(document.querySelector("[aria-current]")?.textContent).toContain(
      "about"
    );
    expect(screen.getByRole("button", { name: "back to top" })).toBeTruthy();
    scroll(349);
    expect(document.querySelector("[aria-current]")).toBeNull();
    expect(screen.queryByRole("button", { name: "back to top" })).toBeNull();
  });

  it("keeps URL changes explicit and preserves search parameters", () => {
    mount();
    scroll(1800);
    expect(window.location.hash).toBe("");
    fireEvent.click(screen.getByRole("link", { name: "connect" }));
    expect(window.location.hash).toBe("#connect");
    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: "smooth",
      top: expect.any(Number),
    });
    fireEvent.click(screen.getByRole("button", { name: "back to top" }));
    expect(window.location.href).toContain("/?demo=1");
    expect(window.location.hash).toBe("");
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "smooth",
      top: 0,
    });
  });

  it("closes the disclosure and restores focus on navigation and Escape", () => {
    mount();
    scroll(500);
    const toggle = screen.getByRole("button", { name: /on this page/u });
    fireEvent.click(toggle);
    const panel = document.querySelector(
      "#mobile-page-navigation"
    ) as HTMLElement;
    fireEvent.click(within(panel).getByRole("button", { name: "back to top" }));
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
    fireEvent.click(toggle);
    fireEvent.keyDown(toggle, { key: "Escape" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    fireEvent.pointerDown(document.body);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps the disclosure for one section and respects reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
    } as MediaQueryList);
    mount([items[0]]);
    const toggle = screen.getByRole("button", { name: /on this page/u });
    fireEvent.click(toggle);
    const panel = document.querySelector(
      "#mobile-page-navigation"
    ) as HTMLElement;
    expect(within(panel).getByRole("link", { name: "about" })).toBeTruthy();
    expect(
      within(panel).queryByRole("button", { name: "back to top" })
    ).toBeNull();
    scroll(500);
    fireEvent.click(within(panel).getByRole("button", { name: "back to top" }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "instant",
      top: 0,
    });
    expect(document.activeElement).toBe(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("aligns an initial fragment and does not override history scroll restoration", () => {
    window.history.replaceState(null, "", "/?demo=1#connect");
    mount();
    expect(window.scrollTo).toHaveBeenCalledWith({
      behavior: "instant",
      top: 2000,
    });
    vi.mocked(window.scrollTo).mockClear();
    scroll(500);
    window.history.replaceState(
      { pageNavigationScrollY: 500 },
      "",
      "/?demo=1#connect"
    );
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
      behavior: "instant",
      top: 500,
    });
    expect(document.querySelector("[aria-current]")?.textContent).toContain(
      "about"
    );
  });

  it.each([
    null,
    { pageNavigationScrollY: "500" },
    { pageNavigationScrollY: Number.NaN },
  ])("aligns a new native fragment after popstate with state %j", (state) => {
    mount();
    window.history.replaceState(state, "", "/?demo=1#connect");
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "instant",
      top: 2000,
    });
  });

  it("preserves native traversal without saved state and aligns the next fresh fragment", () => {
    const navigation = new EventTarget();
    const remove = vi.spyOn(navigation, "removeEventListener");
    vi.stubGlobal("navigation", navigation);
    mount();
    scroll(500);
    window.history.replaceState(null, "", "/?demo=1#connect");
    const traverse = new Event("navigate");
    Object.assign(traverse, {
      destination: { url: window.location.href },
      navigationType: "traverse",
    });
    act(() => navigation.dispatchEvent(traverse));
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    expect(window.scrollTo).not.toHaveBeenCalled();
    window.history.replaceState(null, "", "/?demo=1#about");
    const push = new Event("navigate");
    Object.assign(push, {
      destination: { url: window.location.href },
      navigationType: "push",
    });
    act(() => navigation.dispatchEvent(push));
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
      behavior: "instant",
      top: 600,
    });
    cleanup();
    expect(remove).toHaveBeenCalledWith("navigate", expect.any(Function));
  });

  it.each(["wheel", "touchstart", "pointerdown", "keydown"])(
    "late load preserves reading after %s",
    (event) => {
      window.history.replaceState(
        { pageNavigationScrollY: 500 },
        "",
        "/#connect"
      );
      mount();
      fireEvent(window, new Event(event));
      scroll(800);
      vi.mocked(window.scrollTo).mockClear();
      fireEvent.load(window);
      flush();
      expect(window.scrollTo).not.toHaveBeenCalled();
    }
  );

  it("late load does not repeat explicit navigation", () => {
    mount();
    fireEvent.click(screen.getByRole("link", { name: "connect" }));
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.load(window);
    flush();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("unmount cancels pending initialization and geometry frames", () => {
    window.history.replaceState({ pageNavigationScrollY: 500 }, "", "/");
    const view = render(<PageNavigation items={items} />);
    fireEvent.scroll(window);
    view.unmount();
    flush();
    fireEvent.load(window);
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("reveals the active link on list resize and closes a hidden disclosure", () => {
    const callbacks = new Set<ResizeObserverCallback>();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(notify: ResizeObserverCallback) {
          this.callback = notify;
        }
        callback: ResizeObserverCallback;
        observe() {
          callbacks.add(this.callback);
        }
        disconnect() {
          callbacks.delete(this.callback);
        }
      }
    );
    mount();
    scroll(500);
    const link = screen.getByRole("link", { name: "about" });
    const list = link.closest("ul") as HTMLElement;
    Object.defineProperty(link, "offsetParent", {
      configurable: true,
      value: list,
    });
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(
      function bounds(this: HTMLElement) {
        if (this === list) {
          return new DOMRect(0, 0, 200, 50);
        }
        if (this === link) {
          return new DOMRect(0, 80, 200, 40);
        }
        return new DOMRect(
          0,
          (this.id === "connect" ? 2400 : 600) - window.scrollY,
          500,
          200
        );
      }
    );
    const resize = () =>
      act(() => {
        const pending = [...callbacks];
        for (const notify of pending) {
          notify([], {} as ResizeObserver);
        }
      });
    expect(link.getAttribute("aria-current")).toBe("location");
    resize();
    expect(list.scrollTop).toBe(70);
    const toggle = screen.getByRole("button", { name: /on this page/u });
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    Object.defineProperty(toggle, "offsetParent", {
      configurable: true,
      value: null,
    });
    resize();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector("#mobile-page-navigation")).toBeNull();
    cleanup();
    expect(callbacks.size).toBe(0);
  });

  it("restores reading position on reload ahead of an older URL anchor", () => {
    window.history.replaceState(
      { pageNavigationScrollY: 800 },
      "",
      "/#connect"
    );
    mount();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "instant",
      top: 800,
    });
  });

  it("does not save transient native scroll while restoring a history entry", () => {
    mount();
    window.history.replaceState(
      { pageNavigationScrollY: 800 },
      "",
      "/#connect"
    );
    fireEvent.popState(window);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 2000,
    });
    fireEvent(window, new Event("scrollend"));
    expect(window.history.state.pageNavigationScrollY).toBe(800);
    fireEvent(window, new Event("pagehide"));
    expect(
      JSON.parse(sessionStorage.getItem("page-navigation-reload") ?? "null")
        .position
    ).toBe(800);
    flush();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "instant",
      top: 800,
    });
  });

  it("explicit navigation cancels a pending history restoration", () => {
    mount();
    window.history.replaceState(
      { pageNavigationScrollY: 800 },
      "",
      "/#connect"
    );
    fireEvent.popState(window);
    fireEvent.click(screen.getByRole("link", { name: "about" }));
    vi.mocked(window.scrollTo).mockClear();
    flush();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("preserves router state and restores saved reading after an entry update", () => {
    window.history.replaceState(
      { framework: "kept", pageNavigationScrollY: 800 },
      "",
      "/?demo=1#connect"
    );
    const navigation = new EventTarget();
    vi.stubGlobal("navigation", navigation);
    mount();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "instant",
      top: 800,
    });
    scroll(1200);
    fireEvent(window, new Event("scrollend"));
    expect(window.history.state).toStrictEqual({
      framework: "kept",
      pageNavigationScrollY: 1200,
    });
    const traverse = Object.assign(new Event("navigate"), {
      destination: { url: window.location.href },
      navigationType: "traverse",
    });
    act(() => navigation.dispatchEvent(traverse));
    const replace = Object.assign(new Event("navigate"), {
      destination: { url: window.location.href },
      navigationType: "replace",
    });
    act(() => navigation.dispatchEvent(replace));
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
      behavior: "instant",
      top: 1200,
    });
  });

  it("restores native fragment reading positions without Navigation API while preserving router state", () => {
    const routerState = { framework: { page: "home" } };
    window.history.replaceState(routerState, "", "/?demo=1");
    mount();
    window.history.replaceState(null, "", "/?demo=1#connect");
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    scroll(800);
    fireEvent(window, new Event("scrollend"));
    const readingState = window.history.state;
    expect(readingState).toStrictEqual({
      ...routerState,
      pageNavigationScrollY: 800,
    });
    fireEvent.click(screen.getByRole("link", { name: "about" }));
    window.history.replaceState(readingState, "", "/?demo=1#connect");
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.popState(window);
    fireEvent(window, new HashChangeEvent("hashchange"));
    flush();
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
      behavior: "instant",
      top: 800,
    });
    fireEvent(window, new Event("pagehide"));
    expect(
      JSON.parse(sessionStorage.getItem("page-navigation-reload") ?? "null")
    ).toStrictEqual({ position: 800, url: window.location.href });
  });

  it.each(["reload", "navigate"])(
    "uses the tab snapshot only on %s",
    (type) => {
      window.history.replaceState(null, "", "/#connect");
      sessionStorage.setItem(
        "page-navigation-reload",
        JSON.stringify({ position: 800, url: window.location.href })
      );
      vi.spyOn(performance, "getEntriesByType").mockReturnValue([
        { type },
      ] as PerformanceNavigationTiming[]);
      mount();
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        behavior: "instant",
        top: type === "reload" ? 800 : 2000,
      });
    }
  );

  it("keeps navigation working when session storage is unavailable", () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    mount();
    scroll(800);
    expect(() => fireEvent(window, new Event("pagehide"))).not.toThrow();
    expect(document.querySelector("[aria-current]")?.textContent).toContain(
      "about"
    );
  });

  it("restores the saved reading position without losing framework history state", () => {
    mount();
    window.history.replaceState(
      { framework: "kept", pageNavigationScrollY: 500 },
      "",
      "/?demo=1#connect"
    );
    fireEvent.popState(window);
    flush();
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      behavior: "instant",
      top: 500,
    });
    scroll(800);
    fireEvent(window, new Event("scrollend"));
    expect(window.history.state).toStrictEqual({
      framework: "kept",
      pageNavigationScrollY: 800,
    });
  });

  it("does not intercept modified links or create duplicate history entries", () => {
    mount();
    const push = vi.spyOn(window.history, "pushState");
    const link = screen.getByRole("link", { name: "connect" });
    fireEvent.click(link, { ctrlKey: true });
    expect(push).not.toHaveBeenCalled();
    window.history.replaceState(null, "", "/?demo=1");
    fireEvent.click(link);
    fireEvent.click(link);
    expect(push).toHaveBeenCalledOnce();
  });

  it("recomputes restored positions and resize without interaction flags", () => {
    mount();
    scroll(1800);
    expect(document.querySelector("[aria-current]")?.textContent).toContain(
      "connect"
    );
    scroll(500);
    fireEvent.popState(window);
    flush();
    expect(document.querySelector("[aria-current]")?.textContent).toContain(
      "about"
    );
    scroll(200);
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 1600,
    });
    fireEvent.resize(window);
    flush();
    expect(document.querySelector("[aria-current]")?.textContent).toContain(
      "about"
    );
  });
});
