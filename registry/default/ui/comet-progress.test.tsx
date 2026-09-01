import { act, cleanup, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from "vitest";

import { CometProgress } from "./comet-progress";
import type { CometProgressProps } from "./comet-progress";
import {
  mockAnimationFrame,
  mockCanvas2DContext,
  mockCanvasWidth,
  mockIntersectionObserver,
  mockMediaQueries,
  mockResizeObserver,
} from "./comet-progress.test-utils";

let mediaQueries: ReturnType<typeof mockMediaQueries>;

beforeEach(() => {
  vi.spyOn(performance, "now").mockReturnValue(0);
  mediaQueries = mockMediaQueries();
  mockIntersectionObserver();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CometProgress", () => {
  test("requires and exposes an accessible name", () => {
    expectTypeOf<{ value: number }>().not.toMatchTypeOf<CometProgressProps>();
    expectTypeOf<{
      "aria-labelledby": string;
      value: number;
    }>().toMatchTypeOf<CometProgressProps>();
    mockCanvasWidth(40);
    mockAnimationFrame();
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));

    render(
      <>
        <span id="progress-label">Task progress</span>
        <CometProgress aria-labelledby="progress-label" value={42} />
      </>
    );

    expect(
      screen.getByRole("progressbar", { name: "Task progress" })
    ).toBeDefined();
  });

  test("exposes clamped progress and paints through the advancing front", () => {
    const canvasWidth = 384;
    mockCanvasWidth(canvasWidth);
    const runAnimationFrame = mockAnimationFrame();

    const roundRect = vi.fn();
    mockCanvas2DContext(() => ({ roundRect }));

    const { rerender } = render(
      <CometProgress aria-label="Comet progress" max={10} value={4} />
    );
    const progress = screen.getByRole("progressbar", {
      name: "Comet progress",
    });

    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("10");
    expect(progress.getAttribute("aria-valuenow")).toBe("4");
    expect(progress.getAttribute("aria-valuetext")).toBe("40%");
    expect(progress.querySelector("pattern rect")?.getAttribute("fill")).toBe(
      "var(--comet-progress-empty, color-mix(in oklab, var(--muted-foreground) 10%, transparent))"
    );

    runAnimationFrame(performance.now());

    expect(roundRect.mock.calls.length).toBeGreaterThan(0);
    expect(roundRect.mock.calls.length).toBeLessThan((canvasWidth / 4) * 5);

    rerender(<CometProgress aria-label="Comet progress" max={10} value={12} />);

    const completeProgress = screen.getByRole("progressbar", {
      name: "Comet progress",
    });

    expect(completeProgress.getAttribute("aria-valuenow")).toBe("10");
    expect(completeProgress.getAttribute("aria-valuetext")).toBe("100%");
  });

  test("supports a custom range and accessible value formatter", () => {
    mockCanvasWidth(40);
    mockAnimationFrame();
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));
    const getValueText = vi.fn(
      (value: number, min: number, max: number) =>
        `${String(value)} of ${String(min)}–${String(max)}`
    );
    const { rerender } = render(
      <CometProgress
        aria-label="Comet progress"
        getValueText={getValueText}
        max={20}
        min={10}
        value={15}
      />
    );
    const progress = screen.getByRole("progressbar", {
      name: "Comet progress",
    });

    expect(progress.getAttribute("aria-valuemin")).toBe("10");
    expect(progress.getAttribute("aria-valuemax")).toBe("20");
    expect(progress.getAttribute("aria-valuenow")).toBe("15");
    expect(progress.getAttribute("aria-valuetext")).toBe("15 of 10–20");
    expect(getValueText).toHaveBeenLastCalledWith(15, 10, 20);

    rerender(
      <CometProgress
        aria-label="Comet progress"
        getValueText={getValueText}
        max={20}
        min={10}
        value={5}
      />
    );

    expect(progress.getAttribute("aria-valuenow")).toBe("10");
    expect(progress.getAttribute("aria-valuetext")).toBe("10 of 10–20");
    expect(getValueText).toHaveBeenLastCalledWith(10, 10, 20);
  });

  test("falls back to a finite, non-zero range for extreme numeric inputs", () => {
    mockCanvasWidth(40);
    mockAnimationFrame();
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));
    const { rerender } = render(
      <CometProgress
        aria-label="Comet progress"
        max={Number.MAX_VALUE}
        min={Number.MAX_VALUE}
        value={Number.MAX_VALUE}
      />
    );
    const progress = screen.getByRole("progressbar", {
      name: "Comet progress",
    });

    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.getAttribute("aria-valuenow")).toBe("100");
    expect(progress.getAttribute("aria-valuetext")).toBe("100%");

    rerender(
      <CometProgress
        aria-label="Comet progress"
        max={Number.MAX_VALUE}
        min={-Number.MAX_VALUE}
        value={0}
      />
    );

    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.getAttribute("aria-valuetext")).toBe("0%");

    rerender(
      <CometProgress
        aria-label="Comet progress"
        max={Number.NaN}
        min={10}
        value={15}
      />
    );

    expect(progress.getAttribute("aria-valuemin")).toBe("10");
    expect(progress.getAttribute("aria-valuemax")).toBe("110");
    expect(progress.getAttribute("aria-valuenow")).toBe("15");
    expect(progress.getAttribute("aria-valuetext")).toBe("5%");

    rerender(
      <CometProgress
        aria-label="Comet progress"
        max={20}
        min={Number.NaN}
        value={Number.POSITIVE_INFINITY}
      />
    );

    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("20");
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.getAttribute("aria-valuetext")).toBe("0%");
  });

  test("preserves one static texture when reduced motion is enabled", () => {
    mockCanvasWidth(384);
    mediaQueries.setReducedMotion(true);
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const requestAnimationFrameMock = vi.spyOn(
      globalThis,
      "requestAnimationFrame"
    );
    const paintedCells: { opacity: number; radius: number; x: number }[] = [];
    let opacity = 1;
    mockCanvas2DContext(() => ({
      get globalAlpha() {
        return opacity;
      },
      set globalAlpha(value: number) {
        opacity = value;
      },
      roundRect: (x, _y, _width, _height, radius) => {
        paintedCells.push({ opacity, radius: Number(radius), x });
      },
    }));

    const { rerender } = render(
      <CometProgress aria-label="Comet progress" value={0} />
    );

    expect(paintedCells).toHaveLength(0);
    expect(requestAnimationFrameMock).not.toHaveBeenCalled();

    random.mockReturnValue(1);
    rerender(<CometProgress aria-label="Comet progress" value={80} />);

    const progress = screen.getByRole("progressbar", {
      name: "Comet progress",
    });
    const emptyCellRadius = Number(
      progress.querySelector("pattern rect")?.getAttribute("rx")
    );
    const settledStartCells = paintedCells.filter((cell) => cell.x === 0.5);

    expect(settledStartCells).toHaveLength(5);
    expect(settledStartCells.every((cell) => cell.opacity === 0.5)).toBe(true);
    expect(emptyCellRadius).toBe(0.75);
    expect(paintedCells.every((cell) => cell.radius === emptyCellRadius)).toBe(
      true
    );
    expect(paintedCells.some((cell) => cell.x === 95 * 4 + 0.5)).toBe(false);
    expect(requestAnimationFrameMock).not.toHaveBeenCalled();
  });

  test("reports completion without animation under reduced motion", () => {
    mockCanvasWidth(40);
    mediaQueries.setReducedMotion(true);
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));
    const onAnimationComplete = vi.fn();
    const { rerender } = render(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={100}
      />
    );

    expect(onAnimationComplete).toHaveBeenCalledTimes(1);

    rerender(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={100}
      />
    );

    expect(onAnimationComplete).toHaveBeenCalledTimes(1);

    rerender(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={0}
      />
    );
    rerender(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={100}
      />
    );

    expect(onAnimationComplete).toHaveBeenCalledTimes(2);
  });

  test("preserves existing shimmer cells when ResizeObserver adds columns", () => {
    mediaQueries.setReducedMotion(true);
    let canvasWidth = 8;
    mockCanvasWidth(() => canvasWidth);
    const notifyResize = mockResizeObserver();
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const paintedCells: { opacity: number; x: number }[] = [];
    let opacity = 1;

    mockCanvas2DContext(() => ({
      get globalAlpha() {
        return opacity;
      },
      set globalAlpha(value: number) {
        opacity = value;
      },
      roundRect: (x) => {
        paintedCells.push({ opacity, x });
      },
    }));

    render(<CometProgress aria-label="Comet progress" value={100} />);

    paintedCells.length = 0;
    random.mockReturnValue(1);
    canvasWidth = 12;
    notifyResize();

    const retainedCells = paintedCells.filter(
      (cell) => cell.x === 0.5 || cell.x === 4.5
    );
    const addedCells = paintedCells.filter((cell) => cell.x === 8.5);

    expect(retainedCells).toHaveLength(5 * 2);
    expect(retainedCells.every((cell) => cell.opacity === 0.5)).toBe(true);
    expect(addedCells).toHaveLength(5);
    expect(addedCells.every((cell) => cell.opacity === 1)).toBe(true);
  });

  test("redraws a reduced-motion frame when inherited styles change", () => {
    mediaQueries.setReducedMotion(true);
    vi.spyOn(Math, "random").mockReturnValue(0);
    mockCanvasWidth(40);
    const observe = vi.fn();
    const disconnect = vi.fn();
    let notifyStyleChange: (() => void) | undefined;
    /* oxlint-disable promise/prefer-await-to-callbacks -- MutationObserver exposes a callback-only browser API. */
    vi.spyOn(globalThis, "MutationObserver").mockImplementation(
      class implements MutationObserver {
        readonly records: MutationRecord[] = [];

        constructor(callback: MutationCallback) {
          notifyStyleChange = () => {
            callback([], this);
          };
        }

        disconnect = disconnect;
        observe = observe;
        takeRecords = () => this.records;
      }
    );
    /* oxlint-enable promise/prefer-await-to-callbacks */
    let computedColor = "rgb(10, 20, 30)";

    vi.spyOn(globalThis, "getComputedStyle").mockImplementation(
      () => ({ color: computedColor }) as CSSStyleDeclaration
    );
    const paintedColors: string[] = [];
    const roundRect = vi.fn();
    mockCanvas2DContext(() => ({
      get fillStyle() {
        return paintedColors.at(-1) ?? "";
      },
      set fillStyle(value: string | CanvasGradient | CanvasPattern) {
        if (typeof value === "string") {
          paintedColors.push(value);
        }
      },
      roundRect,
    }));

    render(<CometProgress aria-label="Comet progress" value={100} />);

    expect(paintedColors).toContain("rgb(10, 20, 30)");
    expect(observe).toHaveBeenCalled();

    computedColor = "rgb(220, 210, 240)";
    paintedColors.length = 0;
    roundRect.mockClear();
    notifyStyleChange?.();

    expect(paintedColors).toContain("rgb(220, 210, 240)");
    expect(roundRect).toHaveBeenCalledTimes(10 * 5);
  });

  test("does not recompute inherited color for value-only updates", async () => {
    mediaQueries.setReducedMotion(true);
    mockCanvasWidth(40);
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));
    const getComputedStyleMock = vi
      .spyOn(globalThis, "getComputedStyle")
      .mockReturnValue({ color: "rgb(10, 20, 30)" } as CSSStyleDeclaration);
    const { rerender } = render(
      <CometProgress aria-label="Comet progress" value={10} />
    );
    const callsAfterMount = getComputedStyleMock.mock.calls.length;

    rerender(<CometProgress aria-label="Comet progress" value={20} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(getComputedStyleMock).toHaveBeenCalledTimes(callsAfterMount);
  });

  test("updates the backing store when the device pixel ratio changes", () => {
    mediaQueries.setReducedMotion(true);
    mockCanvasWidth(40);
    const devicePixelRatio = vi
      .spyOn(window, "devicePixelRatio", "get")
      .mockReturnValue(1);
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));

    render(<CometProgress aria-label="Comet progress" value={100} />);
    const canvas = screen
      .getByRole("progressbar", { name: "Comet progress" })
      .querySelector("canvas");

    expect(canvas?.width).toBe(40);

    devicePixelRatio.mockReturnValue(2);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(canvas?.width).toBe(80);
  });

  test("waits for a measurable width instead of inventing columns", () => {
    mediaQueries.setReducedMotion(true);
    vi.spyOn(Math, "random").mockReturnValue(0);
    let canvasWidth = 0;
    mockCanvasWidth(() => canvasWidth);
    const notifyResize = mockResizeObserver();
    const roundRect = vi.fn();
    mockCanvas2DContext(() => ({ roundRect }));

    render(<CometProgress aria-label="Comet progress" value={100} />);
    const canvas = screen
      .getByRole("progressbar", { name: "Comet progress" })
      .querySelector("canvas");

    expect(roundRect).not.toHaveBeenCalled();
    expect(canvas?.width).toBe(0);

    canvasWidth = 40;
    notifyResize();

    expect(roundRect).toHaveBeenCalledTimes(10 * 5);
    expect(canvas?.width).toBe(40);
  });

  test("preserves an advancing front through a collapsed resize", () => {
    let canvasWidth = 40;
    mockCanvasWidth(() => canvasWidth);
    const notifyResize = mockResizeObserver();
    vi.spyOn(Math, "random").mockReturnValue(1);
    const runAnimationFrame = mockAnimationFrame();
    const paintedCells: { x: number; y: number }[] = [];
    mockCanvas2DContext(() => ({
      roundRect: (x, y) => {
        paintedCells.push({ x, y });
      },
    }));

    const { rerender } = render(
      <CometProgress aria-label="Comet progress" value={0} />
    );

    rerender(<CometProgress aria-label="Comet progress" value={50} />);
    runAnimationFrame(0);
    runAnimationFrame(16);

    const rightmostBeforeResize = Math.max(
      ...paintedCells.filter((cell) => cell.y === 8.5).map((cell) => cell.x)
    );

    paintedCells.length = 0;
    canvasWidth = 0;
    notifyResize();
    runAnimationFrame(32);

    expect(paintedCells).toHaveLength(0);

    canvasWidth = 80;
    notifyResize();
    runAnimationFrame(48);

    const rightmostAfterResize = Math.max(
      ...paintedCells.filter((cell) => cell.y === 8.5).map((cell) => cell.x)
    );

    expect(rightmostAfterResize).toBeGreaterThan(rightmostBeforeResize);
    expect(rightmostAfterResize - rightmostBeforeResize).toBeLessThan(12);
  });

  test("preserves exit progress across a live resize after reaching 100%", () => {
    let canvasWidth = 40;
    mockCanvasWidth(() => canvasWidth);
    const notifyResize = mockResizeObserver();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const runAnimationFrame = mockAnimationFrame();
    const paintedCells: { x: number; y: number }[] = [];
    const roundRect = vi.fn((x: number, y: number) => {
      paintedCells.push({ x, y });
    });
    mockCanvas2DContext(() => ({ roundRect }));

    render(<CometProgress aria-label="Comet progress" value={100} />);
    runAnimationFrame(0);
    runAnimationFrame(66);

    paintedCells.length = 0;
    roundRect.mockClear();
    canvasWidth = 0;
    notifyResize();
    runAnimationFrame(132);

    expect(roundRect).not.toHaveBeenCalled();

    canvasWidth = 400;
    notifyResize();
    const resumedAt = 198;
    runAnimationFrame(resumedAt);

    const resizedCenterTip = Math.max(
      ...paintedCells.filter((cell) => cell.y === 8.5).map((cell) => cell.x)
    );

    expect(resizedCenterTip).toBeGreaterThan(352);
    expect(resizedCenterTip).toBeLessThan(368);

    for (let frameIndex = 1; frameIndex <= 80; frameIndex += 1) {
      paintedCells.length = 0;
      roundRect.mockClear();
      runAnimationFrame(resumedAt + frameIndex * 66);
    }

    expect(roundRect).toHaveBeenCalledTimes(100 * 5);
  });
});
