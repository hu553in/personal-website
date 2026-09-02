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
  createDrawing,
  mockAnimationFrame,
  mockCanvas2DContext,
  mockCanvasWidth,
  mockIntersectionObserver,
  mockMediaQueries,
  mockResizeObserver,
} from "./comet-progress.test-utils";

let mediaQueries: ReturnType<typeof mockMediaQueries>;

describe(CometProgress, () => {
  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    mediaQueries = mockMediaQueries();
    mockIntersectionObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

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

    roundRect.mockClear();
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

  test.each([
    {
      expectedMax: 100,
      expectedMin: 0,
      expectedValue: 100,
      max: Number.MAX_VALUE,
      min: Number.MAX_VALUE,
      text: "100%",
      value: Number.MAX_VALUE,
    },
    {
      expectedMax: 100,
      expectedMin: 0,
      expectedValue: 0,
      max: Number.MAX_VALUE,
      min: -Number.MAX_VALUE,
      text: "0%",
      value: 0,
    },
    {
      expectedMax: 110,
      expectedMin: 10,
      expectedValue: 15,
      max: Number.NaN,
      min: 10,
      text: "5%",
      value: 15,
    },
    {
      expectedMax: 20,
      expectedMin: 0,
      expectedValue: 0,
      max: 20,
      min: Number.NaN,
      text: "0%",
      value: Number.POSITIVE_INFINITY,
    },
    {
      expectedMax: 100,
      expectedMin: 0,
      expectedValue: 100,
      max: 0,
      min: 0,
      text: "100%",
      value: 150,
    },
    {
      expectedMax: 100,
      expectedMin: 0,
      expectedValue: 0,
      max: Number.POSITIVE_INFINITY,
      min: Number.NaN,
      text: "0%",
      value: -1,
    },
    {
      expectedMax: 100,
      expectedMin: 0,
      expectedValue: 0,
      max: Number.MAX_VALUE,
      min: -Number.MAX_VALUE,
      text: "0%",
      value: Number.NaN,
    },
  ])(
    "normalizes invalid numeric inputs: $min / $max / $value",
    ({ min, max, value, expectedMin, expectedMax, expectedValue, text }) => {
      createDrawing();
      render(
        <CometProgress
          aria-label="Progress"
          min={min}
          max={max}
          value={value}
        />
      );
      const progress = screen.getByRole("progressbar");
      expect(progress.getAttribute("aria-valuemin")).toBe(String(expectedMin));
      expect(progress.getAttribute("aria-valuemax")).toBe(String(expectedMax));
      expect(progress.getAttribute("aria-valuenow")).toBe(
        String(expectedValue)
      );
      expect(progress.getAttribute("aria-valuetext")).toBe(text);
    }
  );

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
    rerender(<CometProgress aria-label="Comet progress" value={50} />);

    const progress = screen.getByRole("progressbar", {
      name: "Comet progress",
    });
    const emptyCellRadius = Number(
      progress.querySelector("pattern rect")?.getAttribute("rx")
    );
    const settledStartCells = paintedCells.filter((cell) => cell.x === 0.5);

    expect(settledStartCells).toHaveLength(5);
    expect(
      settledStartCells.every((cell) => cell.opacity === 0.5)
    ).toBeTruthy();
    expect(emptyCellRadius).toBe(0.75);
    expect(
      paintedCells.every((cell) => cell.radius === emptyCellRadius)
    ).toBeTruthy();
    expect(paintedCells.some((cell) => cell.x === 95 * 4 + 0.5)).toBeFalsy();
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

    expect(onAnimationComplete).toHaveBeenCalledOnce();

    rerender(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={100}
      />
    );

    expect(onAnimationComplete).toHaveBeenCalledOnce();

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
    expect(retainedCells.every((cell) => cell.opacity === 0.5)).toBeTruthy();
    expect(addedCells).toHaveLength(5);
    expect(addedCells.every((cell) => cell.opacity === 1)).toBeTruthy();
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
      () => ({ color: computedColor, width: "40px" }) as CSSStyleDeclaration
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
    expect(observe).toHaveBeenCalledWith(document.documentElement, {
      attributeFilter: ["class", "data-theme", "style"],
      attributes: true,
    });

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
      .mockReturnValue({
        color: "rgb(10, 20, 30)",
        width: "40px",
      } as CSSStyleDeclaration);
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
    const drawing = createDrawing(384);
    const { rerender, unmount } = render(
      <CometProgress aria-label="Progress" value={20} />
    );
    drawing.frame(0);
    rerender(<CometProgress aria-label="Progress" value={80} />);
    drawing.frame(16);
    drawing.frame(116);
    const beforeCollapse = new Map(drawing.cells);
    drawing.resize(0);
    drawing.frame(132);
    expect(drawing.frames.size).toBe(0);
    expect(drawing.cells).toStrictEqual(beforeCollapse);
    drawing.resize(768);
    drawing.frame(216);
    const resumed = new Map(drawing.cells);
    expect(resumed.size).toBeGreaterThan(beforeCollapse.size);
    unmount();
    render(<CometProgress aria-label="Progress" value={80} />);
    drawing.frame(216);
    expect(drawing.cells).toStrictEqual(resumed);
  });

  test.each([false, true])(
    "redraws completed pixels immediately after resize (collapsed: %s)",
    (collapsed) => {
      const drawing = createDrawing(200);
      render(<CometProgress aria-label="Progress" value={100} />);
      drawing.frame(0);
      expect(drawing.cells.size).toBe(250);
      if (collapsed) {
        drawing.resize(0);
        drawing.frame(16);
      }
      expect(drawing.frames.size).toBe(collapsed ? 0 : 1);
      drawing.resize(400);
      expect(drawing.cells.size).toBe(500);
      expect(new Set(drawing.cells.values())).toStrictEqual(new Set([0.75]));
    }
  );

  test("uses the fractional layout width when a parent is scaled", () => {
    const drawing = createDrawing(200.5);
    vi.spyOn(
      window.HTMLCanvasElement.prototype,
      "getBoundingClientRect"
    ).mockReturnValue(new DOMRect(0, 0, 100.25, 10));
    render(<CometProgress aria-label="Progress" value={100} />);
    drawing.frame(0);
    const canvas = screen.getByRole("progressbar").querySelector("canvas");
    expect(canvas?.width).toBe(Math.round(200.5 * window.devicePixelRatio));
    expect(drawing.cells.size).toBe(Math.ceil(200.5 / 4) * 5);
  });

  test("draws a negative custom range without animation under reduced motion", () => {
    mediaQueries.setReducedMotion(true);
    const drawing = createDrawing();
    const { rerender } = render(
      <CometProgress aria-label="Progress" min={-50} max={50} value={0} />
    );
    expect(drawing.cells.size).toBeGreaterThan(0);
    expect(drawing.cells.size).toBeLessThan(250);
    expect(drawing.frames.size).toBe(0);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
      "50%"
    );
    rerender(
      <CometProgress aria-label="Progress" min={-50} max={50} value={50} />
    );
    expect(drawing.cells.size).toBe(250);
    expect(drawing.frames.size).toBe(0);
  });
});
