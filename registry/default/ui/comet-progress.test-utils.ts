/* oxlint-disable max-classes-per-file, promise/prefer-await-to-callbacks -- Browser API mocks implement several constructable, callback-based interfaces. */

import { act } from "@testing-library/react";
import { vi } from "vitest";

const createCanvas2DMock = (canvas: HTMLCanvasElement) =>
  ({
    beginPath: vi.fn(),
    canvas,
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    globalAlpha: 1,
  }) as unknown as CanvasRenderingContext2D;

const mockCanvas2DContext = (
  createContext: (
    canvas: HTMLCanvasElement
  ) => Partial<CanvasRenderingContext2D>
) => {
  vi.spyOn(window.HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function getContext(this: HTMLCanvasElement, contextId: string) {
      if (contextId !== "2d") {
        return null;
      }

      const canvasMock = createCanvas2DMock(this);

      Object.defineProperties(
        canvasMock,
        Object.getOwnPropertyDescriptors(createContext(this))
      );

      return canvasMock;
    }
  );
};

const mockCanvasWidth = (width: number | (() => number)) => {
  const getWidth = typeof width === "function" ? width : () => width;
  const { getComputedStyle } = globalThis;

  vi.spyOn(globalThis, "getComputedStyle").mockImplementation((element) => {
    const style = getComputedStyle(element);

    return element instanceof window.HTMLCanvasElement
      ? ({
          color: style.color,
          width: `${String(getWidth())}px`,
        } as CSSStyleDeclaration)
      : style;
  });

  return vi
    .spyOn(window.HTMLCanvasElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => new window.DOMRect(0, 0, getWidth(), 20));
};

const mockAnimationFrame = () => {
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrameId = 0;

  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (callback) => {
      nextFrameId += 1;
      frames.set(nextFrameId, callback);

      return nextFrameId;
    }
  );
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((frameId) => {
    frames.delete(frameId);
  });

  return Object.assign(
    (time: number) => {
      const pending = [...frames];

      act(() => {
        for (const [frameId, runFrame] of pending) {
          if (frames.delete(frameId)) {
            runFrame(time);
          }
        }
      });
    },
    { frames }
  );
};

const createDrawing = (initialWidth = 200) => {
  let width = initialWidth;
  const cells = new Map<string, number>();
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  mockCanvasWidth(() => width);
  const frame = mockAnimationFrame();

  mockCanvas2DContext((canvas) => {
    let alpha = 1;
    let position = "";
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    // Assigning either native canvas dimension clears its bitmap, even if unchanged.
    Object.defineProperties(canvas, {
      height: {
        configurable: true,
        get: () => canvasHeight,
        set: (value: number) => {
          canvasHeight = value;
          cells.clear();
        },
      },
      width: {
        configurable: true,
        get: () => canvasWidth,
        set: (value: number) => {
          canvasWidth = value;
          cells.clear();
        },
      },
    });

    return {
      clearRect: () => {
        cells.clear();
      },
      fill: () => cells.set(position, alpha),
      get globalAlpha() {
        return alpha;
      },
      set globalAlpha(value: number) {
        alpha = value;
      },
      roundRect: (x, y) => {
        position = `${String(x)},${String(y)}`;
      },
    };
  });

  return {
    cells,
    frame,
    frames: frame.frames,
    resize(nextWidth: number) {
      width = nextWidth;
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });
    },
  };
};

const mockMediaQueries = () => {
  const listeners = new Map<string, Set<EventListener>>();
  const mediaQueries = new Map<string, MediaQueryList>();
  const addEventListener = vi.fn(
    (query: string, listener: EventListenerOrEventListenerObject) => {
      const queryListeners = listeners.get(query) ?? new Set<EventListener>();

      queryListeners.add(listener as EventListener);
      listeners.set(query, queryListeners);
    }
  );
  const removeEventListener = vi.fn(
    (query: string, listener: EventListenerOrEventListenerObject) => {
      listeners.get(query)?.delete(listener as EventListener);
    }
  );
  let reducedMotion = false;

  vi.spyOn(window, "matchMedia").mockImplementation((query) => {
    const existingQuery = mediaQueries.get(query);

    if (existingQuery) {
      return existingQuery;
    }

    const mediaQuery = {
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        addEventListener(query, listener);
      },
      dispatchEvent: vi.fn(),
      get matches() {
        return query === "(prefers-reduced-motion: reduce)" && reducedMotion;
      },
      media: query,
      onchange: null,
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        removeEventListener(query, listener);
      },
    } as unknown as MediaQueryList;

    mediaQueries.set(query, mediaQuery);

    return mediaQuery;
  });

  return {
    removeEventListener,
    setReducedMotion(matches: boolean) {
      reducedMotion = matches;

      for (const listener of listeners.get(
        "(prefers-reduced-motion: reduce)"
      ) ?? []) {
        listener({ matches } as MediaQueryListEvent);
      }
    },
  };
};

const mockIntersectionObserver = () => {
  let callback: IntersectionObserverCallback | undefined;
  let observedElement: Element | undefined;
  let isIntersecting = true;
  const disconnect = vi.fn();
  const takeRecords = vi.fn(() => []);
  const unobserve = vi.fn();
  const observe = vi.fn((element: Element) => {
    observedElement = element;

    if (!callback) {
      return;
    }

    return callback(
      [{ isIntersecting, target: element } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
  });

  vi.spyOn(globalThis, "IntersectionObserver").mockImplementation(
    class implements IntersectionObserver {
      constructor(nextCallback: IntersectionObserverCallback) {
        callback = nextCallback;
      }

      disconnect = disconnect;
      observe = observe;
      root = null;
      rootMargin = "0px";
      scrollMargin = "0px";
      takeRecords = takeRecords;
      thresholds = [0];
      unobserve = unobserve;
    }
  );

  return {
    disconnect,
    observe,
    setIntersecting(nextIsIntersecting: boolean) {
      isIntersecting = nextIsIntersecting;

      if (!(observedElement && callback)) {
        return;
      }

      return callback(
        [
          {
            isIntersecting,
            target: observedElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    },
  };
};

const mockResizeObserver = () => {
  let notifyResize: (() => void) | undefined;
  const disconnect = vi.fn();
  const observe = vi.fn();

  vi.spyOn(globalThis, "ResizeObserver").mockImplementation(
    class implements ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => {
          callback([], this);
        };
      }

      disconnect = disconnect;
      observe = observe;
      unobserve = vi.fn();
    }
  );

  return Object.assign(
    () => {
      notifyResize?.();
    },
    { disconnect, observe }
  );
};

export {
  createDrawing,
  mockAnimationFrame,
  mockCanvas2DContext,
  mockCanvasWidth,
  mockIntersectionObserver,
  mockMediaQueries,
  mockResizeObserver,
};
