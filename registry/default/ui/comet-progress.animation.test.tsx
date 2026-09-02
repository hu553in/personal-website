import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { CometProgress } from "./comet-progress";
import {
  createDrawing,
  mockAnimationFrame,
  mockCanvas2DContext,
  mockCanvasWidth,
  mockIntersectionObserver,
  mockMediaQueries,
  mockResizeObserver,
} from "./comet-progress.test-utils";

let intersectionObserver: ReturnType<typeof mockIntersectionObserver>;
let mediaQueries: ReturnType<typeof mockMediaQueries>;

describe("CometProgress animation", () => {
  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    mediaQueries = mockMediaQueries();
    intersectionObserver = mockIntersectionObserver();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test.each([4, 200, 1024])(
    "settles initial and updated 100% on the first frame at width %i",
    (width) => {
      const drawing = createDrawing(width);
      const complete = vi.fn();
      const bar = (value: number) => (
        <CometProgress
          aria-label="Comet progress"
          value={value}
          onAnimationComplete={complete}
        />
      );
      const { rerender, unmount } = render(bar(100));
      drawing.frame(0);
      expect(drawing.cells.size).toBe((width / 4) * 5);
      expect(new Set(drawing.cells.values())).toStrictEqual(new Set([0.75]));
      expect(complete).toHaveBeenCalledOnce();
      drawing.frame(16);
      expect(complete).toHaveBeenCalledOnce();

      rerender(bar(0));
      expect(drawing.cells.size).toBe(0);
      expect(drawing.frames.size).toBe(0);
      rerender(bar(100));
      drawing.frame(32);
      expect(drawing.cells.size).toBe((width / 4) * 5);
      expect(new Set(drawing.cells.values())).toStrictEqual(new Set([0.75]));
      expect(complete).toHaveBeenCalledTimes(2);
      unmount();
      expect(drawing.frames.size).toBe(0);
    }
  );

  test("reports completion with the latest callback and rearms below 100% while offscreen", () => {
    const drawing = createDrawing(8);
    vi.mocked(Math.random).mockReturnValue(0);
    const previousOnAnimationComplete = vi.fn();
    const onAnimationComplete = vi.fn();

    const { rerender } = render(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={previousOnAnimationComplete}
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
    drawing.frame(0);

    expect(onAnimationComplete).toHaveBeenCalledOnce();
    expect(previousOnAnimationComplete).not.toHaveBeenCalled();
    expect(drawing.cells.size).toBe(10);
    expect(new Set(drawing.cells.values())).toStrictEqual(new Set([0.5]));
    drawing.frame(16);
    expect(onAnimationComplete).toHaveBeenCalledOnce();

    act(() => {
      intersectionObserver.setIntersecting(false);
    });
    rerender(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={50}
      />
    );
    rerender(
      <CometProgress
        aria-label="Comet progress"
        onAnimationComplete={onAnimationComplete}
        value={100}
      />
    );
    drawing.frame(32);
    expect(onAnimationComplete).toHaveBeenCalledOnce();
    act(() => {
      intersectionObserver.setIntersecting(true);
    });
    drawing.frame(48);
    expect(onAnimationComplete).toHaveBeenCalledTimes(2);
  });

  test("anchors shimmer deadlines to the current animation clock", () => {
    vi.mocked(performance.now).mockReturnValue(10_000);
    mockCanvasWidth(40);
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const runAnimationFrame = mockAnimationFrame();
    const paintedCells: { opacity: number; x: number; y: number }[] = [];
    let opacity = 1;

    mockCanvas2DContext(() => ({
      get globalAlpha() {
        return opacity;
      },
      set globalAlpha(value: number) {
        opacity = value;
      },
      roundRect: (x, y) => {
        paintedCells.push({ opacity, x, y });
      },
    }));

    render(<CometProgress aria-label="Comet progress" value={50} />);
    random.mockReturnValue(1);
    runAnimationFrame(10_000);

    const initialOpacity = paintedCells.find(
      (cell) => cell.x === 0.5 && cell.y === 8.5
    )?.opacity;

    paintedCells.length = 0;
    runAnimationFrame(10_300);

    const opacityBeforeDeadline = paintedCells.find(
      (cell) => cell.x === 0.5 && cell.y === 8.5
    )?.opacity;

    expect(initialOpacity).toBeDefined();
    expect(opacityBeforeDeadline).toBe(initialOpacity);

    paintedCells.length = 0;
    runAnimationFrame(10_500);

    const opacityAfterDeadline = paintedCells.find(
      (cell) => cell.x === 0.5 && cell.y === 8.5
    )?.opacity;

    expect(opacityAfterDeadline).toBeGreaterThan(opacityBeforeDeadline ?? 1);
  });

  test("pauses outside the viewport and resumes without a time jump", () => {
    const drawing = createDrawing(40);
    render(<CometProgress aria-label="Comet progress" value={50} />);
    drawing.frame(0);
    const beforePause = new Map(drawing.cells);
    vi.mocked(Math.random).mockReturnValue(1);
    act(() => {
      intersectionObserver.setIntersecting(false);
    });

    drawing.frame(100_000);
    expect(drawing.frames.size).toBe(0);
    expect(drawing.cells).toStrictEqual(beforePause);

    act(() => {
      intersectionObserver.setIntersecting(true);
    });

    drawing.frame(100_000);
    expect(drawing.cells).toStrictEqual(beforePause);
    drawing.frame(100_016);
    expect(drawing.cells).not.toStrictEqual(beforePause);
    expect(drawing.frames.size).toBe(1);
  });

  test("sleeps while empty and resumes when progress advances", () => {
    mockCanvasWidth(40);
    vi.spyOn(Math, "random").mockReturnValue(1);
    const runAnimationFrame = mockAnimationFrame();
    const roundRect = vi.fn();

    mockCanvas2DContext(() => ({ roundRect }));

    const { rerender } = render(
      <CometProgress aria-label="Comet progress" value={0} />
    );

    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    runAnimationFrame(0);
    expect(roundRect).not.toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    rerender(<CometProgress aria-label="Comet progress" value={50} />);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);

    runAnimationFrame(16);
    runAnimationFrame(32);

    expect(roundRect.mock.calls.length).toBeGreaterThan(0);
  });

  test("sleeps at zero width and resumes after progress advances and the canvas expands", () => {
    let currentCanvasWidth = 0;
    mockCanvasWidth(() => currentCanvasWidth);
    const notifyResize = mockResizeObserver();
    vi.spyOn(Math, "random").mockReturnValue(1);
    const runAnimationFrame = mockAnimationFrame();
    const roundRect = vi.fn();

    mockCanvas2DContext(() => ({ roundRect }));

    const { rerender } = render(
      <CometProgress aria-label="Comet progress" value={0} />
    );

    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    runAnimationFrame(0);

    expect(roundRect).not.toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    rerender(<CometProgress aria-label="Comet progress" value={50} />);

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);

    runAnimationFrame(16);

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(roundRect).not.toHaveBeenCalled();

    currentCanvasWidth = 40;
    act(() => {
      notifyResize();
    });
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);

    runAnimationFrame(32);
    runAnimationFrame(48);

    expect(roundRect.mock.calls.length).toBeGreaterThan(0);
  });

  test("switches animation when reduced-motion preference changes", () => {
    mockCanvasWidth(40);
    mockAnimationFrame();
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));

    render(<CometProgress aria-label="Comet progress" value={50} />);

    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    act(() => {
      mediaQueries.setReducedMotion(true);
    });

    expect(cancelAnimationFrame).toHaveBeenCalledOnce();

    act(() => {
      mediaQueries.setReducedMotion(false);
    });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  test("cleans up animation and browser observers", () => {
    mockCanvasWidth(40);
    const resizeObserver = mockResizeObserver();
    mockAnimationFrame();
    const colorObserverDisconnect = vi.fn();
    const removeWindowListener = vi.spyOn(window, "removeEventListener");

    vi.spyOn(globalThis, "MutationObserver").mockImplementation(
      class implements MutationObserver {
        readonly records: MutationRecord[] = [];

        disconnect = colorObserverDisconnect;
        observe = vi.fn();
        takeRecords = () => this.records;
      }
    );
    mockCanvas2DContext(() => ({ roundRect: vi.fn() }));

    const { unmount } = render(
      <CometProgress aria-label="Comet progress" value={50} />
    );

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
    expect(intersectionObserver.disconnect).toHaveBeenCalledOnce();
    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(colorObserverDisconnect).toHaveBeenCalledOnce();
    expect(mediaQueries.removeEventListener).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)",
      expect.any(Function)
    );
    expect(mediaQueries.removeEventListener).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
      expect.any(Function)
    );
    expect(removeWindowListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  test("fades the front gradually and keeps its diffuse tip away from the outer rows", () => {
    mockCanvasWidth(384);
    vi.spyOn(Math, "random").mockReturnValue(1);
    const runAnimationFrame = mockAnimationFrame();
    const paintedCells: { opacity: number; x: number; y: number }[] = [];
    let opacity = 1;
    mockCanvas2DContext(() => ({
      get globalAlpha() {
        return opacity;
      },
      set globalAlpha(value: number) {
        opacity = value;
      },
      roundRect: (x, y) => {
        paintedCells.push({ opacity, x, y });
      },
    }));

    render(<CometProgress aria-label="Comet progress" value={50} />);
    runAnimationFrame(0);

    const topRow = paintedCells
      .filter((cell) => cell.y === 0.5)
      .toSorted((a, b) => a.x - b.x);
    const centerRow = paintedCells
      .filter((cell) => cell.y === 8.5)
      .toSorted((a, b) => a.x - b.x);
    const bottomRow = paintedCells
      .filter((cell) => cell.y === 16.5)
      .toSorted((a, b) => a.x - b.x);
    const settledEdge = topRow.at(0);
    const topTip = topRow.at(-1);
    const diffuseTip = centerRow.at(-1);
    const bottomTip = bottomRow.at(-1);

    if (!diffuseTip || !topTip || !bottomTip) {
      throw new Error(
        "Expected the diffuse center and both outer tips to be painted."
      );
    }

    const topTipGap = diffuseTip.x - topTip.x;
    const bottomTipGap = diffuseTip.x - bottomTip.x;
    const centerOpacities = centerRow.map((cell) => cell.opacity);

    expect(centerRow.length).toBeGreaterThan(40);
    expect(settledEdge?.opacity).toBeGreaterThan(0.6);
    expect(diffuseTip.opacity).toBeLessThan(0.15);
    expect(
      centerOpacities
        .slice(1)
        .every(
          (cellOpacity, index) => cellOpacity <= (centerOpacities[index] ?? 0)
        )
    ).toBeTruthy();
    expect(topTipGap).toBeGreaterThanOrEqual(40);
    expect(topTipGap).toBeLessThanOrEqual(48);
    expect(bottomTipGap).toBe(topTipGap);
  });

  test("retargets row tips independently", () => {
    mockCanvasWidth(160);
    const rowTipRandomValues = [
      0, 0, 1, 1, 0, 0, 0.25, 0, 0.75, 0.75, 0, 0.25, 0.5, 0, 0.5,
    ];
    let randomIndex = 0;

    vi.spyOn(Math, "random").mockImplementation(() => {
      const value = rowTipRandomValues[randomIndex] ?? 1;

      randomIndex += 1;

      return value;
    });
    const runAnimationFrame = mockAnimationFrame();
    const roundRect = vi.fn();
    mockCanvas2DContext(() => ({ roundRect }));

    render(<CometProgress aria-label="Comet progress" value={50} />);

    const getRightmostCellByRow = () => {
      const rightmostByRow = new Map<number, number>();

      for (const [x, y] of roundRect.mock.calls) {
        const numericX = Number(x);
        const numericY = Number(y);

        rightmostByRow.set(
          numericY,
          Math.max(rightmostByRow.get(numericY) ?? 0, numericX)
        );
      }

      return [...rightmostByRow.entries()]
        .toSorted(([firstRow], [secondRow]) => firstRow - secondRow)
        .map(([, x]) => x);
    };

    runAnimationFrame(0);
    const initialTips = getRightmostCellByRow();

    roundRect.mockClear();
    runAnimationFrame(200);
    const retargetedTips = getRightmostCellByRow();
    const movements = retargetedTips.map(
      (tip, index) => tip - (initialTips[index] ?? tip)
    );

    expect(initialTips).toHaveLength(5);
    expect(retargetedTips).toHaveLength(5);
    expect(movements.some((movement) => movement > 0)).toBeTruthy();
    expect(new Set(movements).size).toBeGreaterThan(1);
  });

  test("advances decorative row tips no more than one column after a slow animation frame", () => {
    mockCanvasWidth(384);
    const rowTipRandomValues = Array.from({ length: 5 }, () => [
      0, 0, 1,
    ]).flat();
    let randomIndex = 0;

    vi.spyOn(Math, "random").mockImplementation(() => {
      const value = rowTipRandomValues[randomIndex] ?? 1;

      randomIndex += 1;

      return value;
    });
    const runAnimationFrame = mockAnimationFrame();
    const roundRect = vi.fn();
    mockCanvas2DContext(() => ({ roundRect }));

    render(<CometProgress aria-label="Comet progress" value={50} />);
    runAnimationFrame(0);

    const rightmostPaintedColumns: number[] = [];

    for (let time = 66; time <= 1980; time += 66) {
      roundRect.mockClear();
      runAnimationFrame(time);

      if (roundRect.mock.calls.length > 0) {
        rightmostPaintedColumns.push(
          Math.max(...roundRect.mock.calls.map(([x]) => Number(x))) / 4
        );
      }
    }

    const columnJumps = rightmostPaintedColumns
      .slice(1)
      .map(
        (column, index) => column - (rightmostPaintedColumns[index] ?? column)
      );

    expect(rightmostPaintedColumns.length).toBeGreaterThan(1);
    expect(columnJumps.some((jump) => jump > 0)).toBeTruthy();
    expect(Math.max(...columnJumps)).toBeLessThanOrEqual(1);
  });

  test.each([30, 60, 144])(
    "settles a large intermediate jump in 200ms at %i fps",
    (fps) => {
      const drawing = createDrawing(1024);
      const { rerender, unmount } = render(
        <CometProgress aria-label="Comet progress" value={20} />
      );
      drawing.frame(0);
      rerender(<CometProgress aria-label="Comet progress" value={80} />);
      drawing.frame(0);
      for (let time = 1000 / fps; time < 200; time += 1000 / fps) {
        drawing.frame(time);
      }
      drawing.frame(200);
      const settled = new Map(drawing.cells);
      unmount();
      render(<CometProgress aria-label="Comet progress" value={80} />);
      drawing.frame(0);
      expect(settled).toStrictEqual(drawing.cells);
    }
  );

  test("keeps moving when progress changes before every frame", () => {
    const drawing = createDrawing(1024);
    const { rerender, unmount } = render(
      <CometProgress aria-label="Comet progress" value={0} />
    );
    drawing.frame(0);
    for (let value = 1; value <= 60; value += 1) {
      rerender(<CometProgress aria-label="Comet progress" value={value} />);
      drawing.frame(value * 16);
    }
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "60"
    );
    expect(drawing.cells.size).toBeGreaterThan(0);
    drawing.frame(1160);
    const settled = new Map(drawing.cells);
    unmount();
    render(<CometProgress aria-label="Comet progress" value={60} />);
    drawing.frame(1160);
    expect(settled).toStrictEqual(drawing.cells);
  });

  test("restarts from zero when reset during an intermediate transition", () => {
    const drawing = createDrawing(1024);
    const { rerender } = render(
      <CometProgress aria-label="Comet progress" value={80} />
    );
    drawing.frame(0);
    rerender(<CometProgress aria-label="Comet progress" value={90} />);
    drawing.frame(16);
    rerender(<CometProgress aria-label="Comet progress" value={0} />);
    expect(drawing.cells.size).toBe(0);
    rerender(<CometProgress aria-label="Comet progress" value={10} />);
    drawing.frame(32);
    expect(drawing.cells.size).toBe(0);
    drawing.frame(232);
    expect(drawing.cells.size).toBeGreaterThan(0);
    expect(drawing.cells.size).toBeLessThan(256);
  });

  test("does not schedule frames after synchronous unmount in the completion callback", () => {
    const drawing = createDrawing();
    const complete = vi.fn();
    const { unmount } = render(
      <CometProgress
        aria-label="Comet progress"
        value={100}
        onAnimationComplete={complete}
      />
    );
    complete.mockImplementation(unmount);
    drawing.frame(0);
    drawing.frame(16);
    drawing.frame(32);
    expect(complete).toHaveBeenCalledOnce();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(drawing.frames.size).toBe(0);
  });

  test("pauses offscreen and cleans up in Strict Mode", () => {
    const drawing = createDrawing();
    const { unmount } = render(
      <StrictMode>
        <CometProgress aria-label="Comet progress" value={50} />
      </StrictMode>
    );
    expect(drawing.frames.size).toBe(1);
    drawing.frame(0);
    expect(drawing.cells.size).toBeGreaterThan(0);
    act(() => {
      intersectionObserver.setIntersecting(false);
    });
    expect(drawing.frames.size).toBe(0);
    act(() => {
      intersectionObserver.setIntersecting(true);
    });
    expect(drawing.frames.size).toBe(1);
    unmount();
    expect(drawing.frames.size).toBe(0);
  });
});
