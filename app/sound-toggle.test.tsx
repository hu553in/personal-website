import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { setSoundsEnabled } from "@/lib/sounds";

import { SoundToggle } from "./sound-toggle";

const audio = vi.hoisted(() => ({
  bind: vi.fn(),
  play: vi.fn(),
  setEnabled: vi.fn(),
  setVolume: vi.fn(),
}));

vi.mock(import("cuelume"), () => audio);

describe("interface sounds", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    });
    setSoundsEnabled(false);
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("starts silent, saves the choice and mutes without a cue", () => {
    render(<SoundToggle />);
    const toggle = screen.getByRole("button", { name: "Interface sounds" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(audio.setEnabled).toHaveBeenLastCalledWith(false);
    expect(audio.play).not.toHaveBeenCalled();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem("interface-sounds")).toBe("true");
    expect(audio.setEnabled).toHaveBeenLastCalledWith(true);
    expect(audio.play).toHaveBeenCalledExactlyOnceWith("toggle");

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(window.localStorage.getItem("interface-sounds")).toBe("false");
    expect(audio.setEnabled).toHaveBeenLastCalledWith(false);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  test("restores a saved choice without playing a sound", () => {
    window.localStorage.setItem("interface-sounds", "true");
    render(<SoundToggle />);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "true"
    );
    expect(audio.setEnabled).toHaveBeenLastCalledWith(true);
    expect(audio.play).not.toHaveBeenCalled();
  });

  test("follows preference changes from another tab", () => {
    render(<SoundToggle />);
    act(() => {
      window.localStorage.setItem("interface-sounds", "true");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "interface-sounds" })
      );
    });
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "true"
    );
    expect(audio.setEnabled).toHaveBeenLastCalledWith(true);
    expect(audio.play).not.toHaveBeenCalled();
    act(() => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);
      window.dispatchEvent(new StorageEvent("storage", { key: null }));
    });
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "false"
    );
    expect(audio.setEnabled).toHaveBeenLastCalledWith(false);
  });

  test("remains usable when storage is blocked", () => {
    vi.mocked(window.localStorage.getItem).mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.mocked(window.localStorage.setItem).mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe(
      "true"
    );
    expect(audio.setEnabled).toHaveBeenLastCalledWith(true);
  });
});
