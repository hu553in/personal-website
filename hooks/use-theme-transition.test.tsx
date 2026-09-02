import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useThemeTransition } from "./use-theme-transition";

const setTheme = vi.hoisted(() => vi.fn());

vi.mock(import("next-themes"), () => ({
  useTheme: () => ({
    setTheme,
    theme: "light",
    themes: ["light", "dark", "system"],
  }),
}));

const Probe = () => {
  const { setTheme: setThemeWithTransition } = useThemeTransition();

  return (
    <button
      type="button"
      onClick={() => {
        setThemeWithTransition("dark");
      }}
    >
      Switch theme
    </button>
  );
};

const ToggleProbe = () => {
  const { setTheme: setThemeWithTransition } = useThemeTransition();

  return (
    <button
      type="button"
      onClick={() => {
        setThemeWithTransition((theme) =>
          theme === "dark" ? "light" : "dark"
        );
      }}
    >
      Toggle theme
    </button>
  );
};

const setReducedMotion = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches })),
  });
};

describe(useThemeTransition, () => {
  beforeEach(() => {
    setTheme.mockClear();
    setReducedMotion(false);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("switches instantly when the View Transitions API is unavailable", () => {
    render(<Probe />);

    fireEvent.click(screen.getByRole("button", { name: "Switch theme" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  test("wraps the switch in a view transition", () => {
    const consumeReadyFailure = vi.fn();
    // oxlint-disable promise/prefer-await-to-callbacks -- The View Transitions API is callback-based.
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();

      return { ready: { catch: consumeReadyFailure } };
    });
    // oxlint-enable promise/prefer-await-to-callbacks
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });
    render(<Probe />);

    fireEvent.click(screen.getByRole("button", { name: "Switch theme" }));

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(consumeReadyFailure).toHaveBeenCalledOnce();
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  /* oxlint-disable node/callback-return, promise/prefer-await-to-callbacks -- The View Transitions API owns these deferred callbacks. */
  test("preserves rapid functional updates across deferred transitions", () => {
    const transitionCallbacks: (() => void)[] = [];
    const startViewTransition = vi.fn((callback: () => void) => {
      transitionCallbacks.push(callback);

      return { ready: { catch: vi.fn() } };
    });

    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });
    render(<ToggleProbe />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    act(() => {
      for (const callback of transitionCallbacks) {
        callback();
      }
    });

    expect(startViewTransition).toHaveBeenCalledTimes(2);
    expect(setTheme).toHaveBeenCalledExactlyOnceWith("light");
  });
  /* oxlint-enable node/callback-return, promise/prefer-await-to-callbacks */

  test("skips the transition under reduced motion", () => {
    const startViewTransition = vi.fn();
    setReducedMotion(true);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });
    render(<Probe />);

    fireEvent.click(screen.getByRole("button", { name: "Switch theme" }));

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
