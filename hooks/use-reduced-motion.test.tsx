import { act, cleanup, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useReducedMotion } from "./use-reduced-motion";

const Snapshot = ({ serverSnapshot }: { serverSnapshot?: boolean }) => (
  <span>{String(useReducedMotion(serverSnapshot))}</span>
);

describe(useReducedMotion, () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("uses the requested server snapshot without reading browser preferences", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(() => {
      throw new Error("Browser preference accessed during SSR");
    });
    expect(renderToString(<Snapshot />)).toBe("<span>true</span>");
    expect(renderToString(<Snapshot serverSnapshot={false} />)).toBe(
      "<span>false</span>"
    );
    expect(matchMedia).not.toHaveBeenCalled();
  });

  test("reads live preferences and removes its subscription on unmount", () => {
    let matches = false;
    const query = new EventTarget();
    const remove = vi.spyOn(query, "removeEventListener");
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          addEventListener: query.addEventListener.bind(query),
          get matches() {
            return matches;
          },
          removeEventListener: query.removeEventListener.bind(query),
        }) as MediaQueryList
    );
    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBeFalsy();
    act(() => {
      matches = true;
      query.dispatchEvent(new Event("change"));
    });
    expect(result.current).toBeTruthy();
    unmount();
    expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
