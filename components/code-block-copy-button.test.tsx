import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { CodeBlockCopyButton } from "./code-block-copy-button";

const writeText = vi.fn<(text: string) => Promise<unknown>>(() =>
  Promise.resolve()
);

describe(CodeBlockCopyButton, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("copies the source and temporarily reports success", async () => {
    render(
      <CodeBlockCopyButton className="absolute" code="const value = 42;" />
    );

    expect(
      screen
        .getByRole("button", { name: "Copy code" })
        .classList.contains("absolute")
    ).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith("const value = 42;");

    screen.getByRole("button", { name: "Copied" });
    expect(screen.getByText("Code copied")).toBeDefined();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("button", { name: "Copy code" })).toBeDefined();
  });

  test("reports clipboard failures and allows a successful retry", async () => {
    writeText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    render(<CodeBlockCopyButton code="const value = 42;" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", { name: "Copy failed, retry" })
    ).toBeDefined();
    expect(screen.getByText("Copy failed")).toBeDefined();
    expect(screen.queryByText("Code copied")).toBeNull();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Copy failed, retry" })
      );
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();
    expect(screen.getByText("Code copied")).toBeDefined();
  });

  test("restarts the copied-state timeout after another successful copy", async () => {
    render(<CodeBlockCopyButton code="const value = 42;" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copied" }));
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "Copy code" })).toBeDefined();
  });

  test("ignores an older clipboard result that settles last", async () => {
    const firstWrite = Promise.withResolvers<null>();
    const secondWrite = Promise.withResolvers<null>();

    writeText
      .mockReturnValueOnce(firstWrite.promise)
      .mockReturnValueOnce(secondWrite.promise);
    render(<CodeBlockCopyButton code="const value = 42;" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await act(async () => {
      secondWrite.resolve(null);
      await secondWrite.promise;
    });

    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();

    await act(async () => {
      firstWrite.reject(new Error("Stale clipboard failure"));
      await firstWrite.promise.catch(() => null);
    });

    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();
    expect(screen.queryByText("Copy failed")).toBeNull();
  });

  test("ignores a pending clipboard result after unmount", async () => {
    const pendingWrite = Promise.withResolvers<null>();

    writeText.mockReturnValueOnce(pendingWrite.promise);
    const { unmount } = render(
      <CodeBlockCopyButton code="const value = 42;" />
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    unmount();

    await act(async () => {
      pendingWrite.resolve(null);
      await pendingWrite.promise;
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
