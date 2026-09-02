import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createDrawing,
  mockIntersectionObserver,
  mockMediaQueries,
} from "@/registry/default/ui/comet-progress.test-utils";

import { CometProgressPreview } from "./comet-progress-preview";

let mediaQueries: ReturnType<typeof mockMediaQueries>;

describe(CometProgressPreview, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    vi.spyOn(performance, "now").mockReturnValue(0);
    mediaQueries = mockMediaQueries();
    mockIntersectionObserver();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("paints intermediate progress, completes and starts another cycle", () => {
    const drawing = createDrawing(400);
    render(<CometProgressPreview />);
    const progress = screen.getByRole("progressbar", {
      name: "Comet progress demo",
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("0");

    for (let tick = 1; tick <= 10; tick += 1) {
      act(() => {
        vi.advanceTimersByTime(200);
      });
      drawing.frame(tick * 200);
    }
    expect(progress.getAttribute("aria-valuenow")).toBe("50");
    expect(drawing.cells.size).toBeGreaterThan(0);
    expect(drawing.cells.size).toBeLessThan(500);

    for (let tick = 11; tick <= 20; tick += 1) {
      act(() => {
        vi.advanceTimersByTime(200);
      });
      drawing.frame(tick * 200);
    }
    expect(progress.getAttribute("aria-valuenow")).toBe("100");
    expect(drawing.cells.size).toBe(500);
    drawing.frame(4016);
    expect(progress.getAttribute("aria-valuenow")).toBe("100");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(drawing.cells.size).toBe(0);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("5");
  });

  test("keeps a static completed frame under reduced motion", () => {
    mediaQueries.setReducedMotion(true);
    const drawing = createDrawing();
    render(<CometProgressPreview />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "100"
    );
    expect(drawing.cells.size).toBe(250);
    expect(drawing.frames.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  test("reacts to reduced-motion changes and cleans up in Strict Mode", () => {
    const drawing = createDrawing();
    const { unmount } = render(
      <StrictMode>
        <CometProgressPreview />
      </StrictMode>
    );
    expect(vi.getTimerCount()).toBe(1);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "5"
    );

    act(() => {
      mediaQueries.setReducedMotion(true);
    });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "100"
    );
    expect(drawing.cells.size).toBe(250);
    expect(drawing.frames.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      mediaQueries.setReducedMotion(false);
    });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0"
    );
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(drawing.frames.size).toBe(0);
    expect(mediaQueries.removeEventListener).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
      expect.any(Function)
    );
  });
});
