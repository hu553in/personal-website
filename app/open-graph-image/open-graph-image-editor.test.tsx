import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { OpenGraphImageEditor } from "./open-graph-image-editor";

describe("Open Graph editor", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("downloads current text while debouncing the preview and clears obsolete errors", async () => {
    vi.useFakeTimers();
    render(<OpenGraphImageEditor />);
    const oldImage = screen.getByRole("img");
    fireEvent.error(oldImage);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "R&D + tools" },
    });
    const download = screen.getByRole("link", { name: "download PNG" });
    const downloadUrl = new URL(
      download.getAttribute("href") ?? "",
      "https://example.com"
    );
    expect(downloadUrl.searchParams.get("title")).toBe("R&D + tools");
    expect(downloadUrl.searchParams.get("download")).toBe("1");
    expect(screen.getByRole("img")).toBe(oldImage);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("alert")).toBeNull();
    const newImage = screen.getByRole("img");
    expect(
      new URL(
        newImage.getAttribute("src") ?? "",
        "https://example.com"
      ).searchParams.get("title")
    ).toBe("R&D + tools");
    fireEvent.error(newImage);
    expect(screen.getByRole("alert")).toBeTruthy();
    await act(async () => {
      fireEvent.load(newImage);
      await Promise.resolve();
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
