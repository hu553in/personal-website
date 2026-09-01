import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { CometProgressPreview } from "./comet-progress-preview";

vi.mock("@/registry/default/ui/comet-progress", () => ({
  CometProgress: ({
    onAnimationComplete,
    value,
  }: {
    onAnimationComplete?: () => void;
    value: number;
  }) => (
    <button data-value={value} type="button" onClick={onAnimationComplete}>
      Complete animation
    </button>
  ),
}));

const animationFrames = new Map<number, FrameRequestCallback>();
let nextAnimationFrameId = 0;

/* oxlint-disable promise/prefer-await-to-callbacks -- Animation frames use a callback-only browser API. */
const runNextAnimationFrame = () => {
  const nextFrame = animationFrames.entries().next().value as
    | [number, FrameRequestCallback]
    | undefined;

  if (!nextFrame) {
    throw new Error("Expected a queued animation frame.");
  }

  const [frameId, callback] = nextFrame;

  animationFrames.delete(frameId);
  callback(0);
};

const setReducedMotion = (matches: boolean) => {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches,
  } as MediaQueryList);
};

beforeEach(() => {
  animationFrames.clear();
  nextAnimationFrameId = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    nextAnimationFrameId += 1;
    animationFrames.set(nextAnimationFrameId, callback);

    return nextAnimationFrameId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frameId) => {
    animationFrames.delete(frameId);
  });
  setReducedMotion(false);
});
/* oxlint-enable promise/prefer-await-to-callbacks */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("replays immediately after the comet tail exits", () => {
  render(<CometProgressPreview />);
  const progress = screen.getByRole("button", { name: "Complete animation" });

  expect(progress.dataset["value"]).toBe("0");

  act(runNextAnimationFrame);
  expect(progress.dataset["value"]).toBe("100");

  fireEvent.click(progress);
  expect(progress.dataset["value"]).toBe("0");

  act(runNextAnimationFrame);
  expect(progress.dataset["value"]).toBe("100");
});

test("keeps the completed frame under reduced motion", () => {
  setReducedMotion(true);
  render(<CometProgressPreview />);
  const progress = screen.getByRole("button", { name: "Complete animation" });

  act(runNextAnimationFrame);
  fireEvent.click(progress);

  expect(progress.dataset["value"]).toBe("100");
  expect(animationFrames.size).toBe(0);
});

test("cancels a queued replay when unmounted", () => {
  const { unmount } = render(<CometProgressPreview />);
  const progress = screen.getByRole("button", { name: "Complete animation" });

  act(runNextAnimationFrame);
  fireEvent.click(progress);
  unmount();

  expect(cancelAnimationFrame).toHaveBeenCalledWith(2);
  expect(animationFrames.size).toBe(0);
});
