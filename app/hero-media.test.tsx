import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { HeroMedia } from "./hero-media";

let reducedMotion = false;
let notifyMotionChange = () => {};
const removeEventListener = vi.fn();

describe(HeroMedia, () => {
  beforeEach(() => {
    reducedMotion = false;
    removeEventListener.mockClear();
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          addEventListener: (_event: string, listener: () => void) => {
            notifyMotionChange = listener;
          },
          matches: reducedMotion,
          removeEventListener,
        }) as unknown as MediaQueryList
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("server-renders a static poster without video", () => {
    const html = renderToString(<HeroMedia />);
    const document = new DOMParser().parseFromString(html, "text/html");
    const poster = document.querySelector("img");
    expect(poster?.getAttribute("alt")).toBe("");
    expect(document.querySelector("video")).toBeNull();
  });

  test("does not mount video for reduced motion and follows preference changes", () => {
    reducedMotion = true;
    const { container, unmount } = render(<HeroMedia />);
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();

    act(() => {
      reducedMotion = false;
      notifyMotionChange();
    });
    const video = container.querySelector("video");
    expect(video?.autoplay).toBeTruthy();
    expect(video?.muted).toBeTruthy();

    act(() => {
      reducedMotion = true;
      notifyMotionChange();
    });
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  test("resets video readiness and controls when reduced motion is toggled", () => {
    const { container } = render(<HeroMedia />);
    const poster = container.querySelector("img");
    const video = container.querySelector("video") as HTMLVideoElement;
    fireEvent.loadedData(video);
    fireEvent.play(video);
    expect(video.style.opacity).toBe("1");
    expect(
      screen.getByRole("button", { name: "Pause animation" })
    ).toBeTruthy();

    act(() => {
      reducedMotion = true;
      notifyMotionChange();
    });
    expect(container.querySelector("video")).toBeNull();
    act(() => {
      reducedMotion = false;
      notifyMotionChange();
    });
    const replacement = container.querySelector("video") as HTMLVideoElement;
    expect(replacement).not.toBe(video);
    expect(replacement.style.opacity).toBe("0");
    expect(screen.getByRole("button", { name: "Play animation" })).toBeTruthy();
    expect(container.querySelector("img")).toBe(poster);
    fireEvent.loadedData(replacement);
    fireEvent.play(replacement);
    expect(replacement.style.opacity).toBe("1");
    expect(
      screen.getByRole("button", { name: "Pause animation" })
    ).toBeTruthy();
  });

  test("keeps the same poster while the first video frame loads", () => {
    reducedMotion = true;
    const { container } = render(<HeroMedia />);
    const poster = container.querySelector("img");
    act(() => {
      reducedMotion = false;
      notifyMotionChange();
    });
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(container.querySelector("img")).toBe(poster);
    expect(video.style.opacity).toBe("0");
    fireEvent.loadedData(video);
    expect(video.style.opacity).toBe("1");
    fireEvent.pause(video);
    expect(video.style.opacity).toBe("1");
    fireEvent.loadStart(video);
    expect(video.style.opacity).toBe("0");
    expect(container.querySelector("img")).toBe(poster);
  });

  test("lets visitors pause and resume with the control reflecting playback", async () => {
    const { container } = render(<HeroMedia />);
    const video = container.querySelector("video") as HTMLVideoElement;
    let paused = false;
    vi.spyOn(video, "paused", "get").mockImplementation(() => paused);
    const pause = vi.spyOn(video, "pause").mockImplementation(() => {
      paused = true;
      fireEvent.pause(video);
    });
    const play = vi.spyOn(video, "play").mockImplementation(() => {
      paused = false;
      fireEvent.play(video);
      return Promise.resolve();
    });
    fireEvent.play(video);
    fireEvent.click(screen.getByRole("button", { name: "Pause animation" }));
    expect(pause).toHaveBeenCalledOnce();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Play animation" }));
      await Promise.resolve();
    });
    expect(play).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Pause animation" })
    ).toBeTruthy();

    fireEvent.click(video);
    expect(pause).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Play animation" })).toBeTruthy();
    await act(async () => {
      fireEvent.click(video);
      await Promise.resolve();
    });
    expect(play).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: "Pause animation" })
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Pause animation" }));
    play.mockRejectedValueOnce(new Error("Playback blocked"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Play animation" }));
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Play animation" })).toBeTruthy();
  });

  test("keeps the MP4 fallback available when WebM fails", () => {
    const { container } = render(<HeroMedia />);
    const sources = container.querySelectorAll("source");
    fireEvent.error(sources.item(0));
    expect(container.querySelector("video")).not.toBeNull();
    expect(container.querySelector("img")).not.toBeNull();

    fireEvent.error(sources.item(1));
    expect(container.querySelector("img")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("falls back to the poster when video playback fails", () => {
    const { container } = render(<HeroMedia />);
    fireEvent.error(container.querySelector("video") as HTMLVideoElement);
    expect(container.querySelector("img")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
