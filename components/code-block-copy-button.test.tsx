import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, vi, it } from "vitest";

import { CodeBlockCopyButton } from "./code-block-copy-button";

const audio = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock(import("@/lib/sounds"), () => audio);

const writeText = vi.fn<(text: string) => Promise<unknown>>(() =>
  Promise.resolve()
);

describe(CodeBlockCopyButton, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockClear();
    audio.play.mockClear();
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

  it("copies the source and temporarily reports success", async () => {
    render(
      <CodeBlockCopyButton className="absolute" code="const value = 42;" />
    );

    expect(
      screen
        .getByRole("button", { name: "copy code" })
        .classList.contains("absolute")
    ).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "copy code" }));
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith("const value = 42;");
    expect(audio.play).toHaveBeenCalledExactlyOnceWith("success");

    screen.getByRole("button", { name: "copied" });
    expect(screen.getByText("code copied")).toBeDefined();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("button", { name: "copy code" })).toBeDefined();
  });

  it("reports clipboard failures and allows a successful retry", async () => {
    writeText.mockRejectedValueOnce(new Error("Clipboard unavailable"));
    render(<CodeBlockCopyButton code="const value = 42;" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "copy code" }));
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", { name: "copy failed, retry" })
    ).toBeDefined();
    expect(screen.getByText("copy failed")).toBeDefined();
    expect(screen.queryByText("code copied")).toBeNull();
    expect(audio.play).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "copy failed, retry" })
      );
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: "copied" })).toBeDefined();
    expect(screen.getByText("code copied")).toBeDefined();
    expect(audio.play).toHaveBeenCalledExactlyOnceWith("success");
  });

  it("restarts the copied-state timeout after another successful copy", async () => {
    render(<CodeBlockCopyButton code="const value = 42;" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "copy code" }));
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "copied" }));
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "copied" })).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "copy code" })).toBeDefined();
  });

  it("ignores an older clipboard result that settles last", async () => {
    const firstWrite = Promise.withResolvers<null>();
    const secondWrite = Promise.withResolvers<null>();

    writeText
      .mockReturnValueOnce(firstWrite.promise)
      .mockReturnValueOnce(secondWrite.promise);
    render(<CodeBlockCopyButton code="const value = 42;" />);

    fireEvent.click(screen.getByRole("button", { name: "copy code" }));
    fireEvent.click(screen.getByRole("button", { name: "copy code" }));

    await act(async () => {
      secondWrite.resolve(null);
      await secondWrite.promise;
    });

    expect(screen.getByRole("button", { name: "copied" })).toBeDefined();

    await act(async () => {
      firstWrite.reject(new Error("Stale clipboard failure"));
      await firstWrite.promise.catch(() => null);
    });

    expect(screen.getByRole("button", { name: "copied" })).toBeDefined();
    expect(screen.queryByText("copy failed")).toBeNull();
  });

  it("ignores a pending clipboard result after unmount", async () => {
    const pendingWrite = Promise.withResolvers<null>();

    writeText.mockReturnValueOnce(pendingWrite.promise);
    const { unmount } = render(
      <CodeBlockCopyButton code="const value = 42;" />
    );

    fireEvent.click(screen.getByRole("button", { name: "copy code" }));
    unmount();

    await act(async () => {
      pendingWrite.resolve(null);
      await pendingWrite.promise;
    });

    expect(vi.getTimerCount()).toBe(0);
    expect(audio.play).not.toHaveBeenCalled();
  });
});
