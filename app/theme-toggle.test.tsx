import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeToggle } from "./theme-toggle";

const themeMock = vi.hoisted(() => {
  const state = {
    resolvedTheme: "light" as string | undefined,
    systemTheme: "light" as "light" | "dark" | undefined,
    theme: "light",
  };
  const setTheme = vi.fn(
    (nextTheme: string | ((currentTheme: string) => string)) => {
      state.theme =
        typeof nextTheme === "function" ? nextTheme(state.theme) : nextTheme;
    }
  );

  return { setTheme, state };
});

vi.mock(import("next-themes"), () => ({
  useTheme: () => ({
    resolvedTheme: themeMock.state.resolvedTheme,
    setTheme: themeMock.setTheme,
    systemTheme: themeMock.state.systemTheme,
    theme: themeMock.state.theme,
    themes: ["light", "dark", "system"],
  }),
}));

const pressD = (target: Document | Element, init: KeyboardEventInit = {}) => {
  fireEvent.keyDown(target, { code: "KeyD", key: "d", ...init });
  fireEvent.keyUp(target, { code: "KeyD", key: "d", ...init });
};

describe("theme toggle", () => {
  beforeEach(() => {
    themeMock.state.resolvedTheme = "light";
    themeMock.state.systemTheme = "light";
    themeMock.state.theme = "light";
    themeMock.setTheme.mockClear();
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test.each([
    {
      currentTheme: "light",
      expectedTheme: "system",
      resolvedTheme: "light",
      systemTheme: "dark",
    },
    {
      currentTheme: "dark",
      expectedTheme: "system",
      resolvedTheme: "dark",
      systemTheme: "light",
    },
    {
      currentTheme: "system",
      expectedTheme: "dark",
      resolvedTheme: "light",
      systemTheme: "light",
    },
    {
      currentTheme: "system",
      expectedTheme: "light",
      resolvedTheme: "dark",
      systemTheme: "dark",
    },
  ] as const)(
    "switches from $currentTheme/$resolvedTheme to $expectedTheme",
    ({ currentTheme, expectedTheme, resolvedTheme, systemTheme }) => {
      themeMock.state.theme = currentTheme;
      themeMock.state.resolvedTheme = resolvedTheme;
      themeMock.state.systemTheme = systemTheme;
      render(<ThemeToggle />);

      fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

      expect(themeMock.state.theme).toBe(expectedTheme);
    }
  );

  test.each([
    { currentTheme: "light", expectedTheme: "dark" },
    { currentTheme: "dark", expectedTheme: "light" },
    {
      currentTheme: "system",
      expectedTheme: "dark",
      resolvedTheme: "light",
      systemTheme: "light",
    },
    {
      currentTheme: "system",
      expectedTheme: "light",
      resolvedTheme: "dark",
      systemTheme: "dark",
    },
  ] as const)(
    "switches with d from $currentTheme/$resolvedTheme to $expectedTheme",
    ({ currentTheme, expectedTheme, resolvedTheme, systemTheme }) => {
      themeMock.state.theme = currentTheme;
      themeMock.state.resolvedTheme = resolvedTheme;
      themeMock.state.systemTheme = systemTheme ?? "light";
      render(<ThemeToggle />);

      pressD(document.body, { key: "в" });

      expect(themeMock.state.theme).toBe(expectedTheme);
    }
  );

  /* oxlint-disable node/callback-return, promise/prefer-await-to-callbacks -- The View Transitions API owns these deferred callbacks. */
  test("shares pending theme state between clicks and the keyboard shortcut", () => {
    const transitionCallbacks: (() => void)[] = [];
    const startViewTransition = vi.fn((callback: () => void) => {
      transitionCallbacks.push(callback);

      return { ready: { catch: vi.fn() } };
    });

    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
    } as MediaQueryList);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });
    themeMock.state.systemTheme = "dark";
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    pressD(document.body);

    act(() => {
      for (const callback of transitionCallbacks) {
        callback();
      }
    });

    expect(startViewTransition).toHaveBeenCalledTimes(2);
    expect(themeMock.setTheme).toHaveBeenCalledOnce();
    expect(themeMock.state.theme).toBe("light");
  });
  /* oxlint-enable node/callback-return, promise/prefer-await-to-callbacks */

  test("does not intercept typing in editable controls", () => {
    const { getByLabelText } = render(
      <>
        <ThemeToggle />
        <input aria-label="Title" />
        <textarea aria-label="Description" />
        <select aria-label="Category" />
        <div aria-label="Comment" contentEditable />
      </>
    );

    for (const name of ["Title", "Description", "Category", "Comment"]) {
      pressD(getByLabelText(name));
    }

    expect(themeMock.setTheme).not.toHaveBeenCalled();
  });

  test("ignores modified, repeated, composing, prevented, and unrelated events", () => {
    render(<ThemeToggle />);

    pressD(document.body, { altKey: true });
    pressD(document.body, { ctrlKey: true });
    pressD(document.body, { metaKey: true });
    pressD(document.body, { key: "D", shiftKey: true });
    pressD(document.body, { repeat: true });
    pressD(document.body, { isComposing: true });
    fireEvent.keyDown(document.body, { code: "KeyF", key: "f" });
    fireEvent.keyUp(document.body, { code: "KeyF", key: "f" });

    const preventedEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      code: "KeyD",
      key: "d",
    });
    preventedEvent.preventDefault();
    document.body.dispatchEvent(preventedEvent);

    expect(themeMock.setTheme).not.toHaveBeenCalled();
  });
});
