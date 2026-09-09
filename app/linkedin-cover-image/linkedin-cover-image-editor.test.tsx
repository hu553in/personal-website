import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { LinkedInCoverImageEditor } from "./linkedin-cover-image-editor";

const audio = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock(import("@/lib/sounds"), () => audio);

const screenshotMock = vi.hoisted(() => ({
  domToPng: vi.fn<() => Promise<string>>(),
}));

const createDeferred = <Value,>() => {
  let settle!: (value: Value) => void;
  // oxlint-disable-next-line promise/avoid-new -- The pending export state needs test-controlled settlement.
  const promise = new Promise<Value>((resolve) => {
    settle = resolve;
  });

  return { promise, resolve: settle };
};

vi.mock(import("modern-screenshot"), () => ({
  domToPng: screenshotMock.domToPng,
}));

describe("LinkedIn cover image editor", () => {
  const downloads: HTMLAnchorElement[] = [];

  beforeEach(() => {
    downloads.length = 0;
    audio.play.mockClear();
    screenshotMock.domToPng.mockReset();
    screenshotMock.domToPng.mockResolvedValue("data:image/png;base64,cG5n");
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(new Blob(["font"], { type: "font/woff2" }), {
            status: 200,
          })
        )
      )
    );
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function captureDownload(this: HTMLAnchorElement) {
        downloads.push(this);
      }
    );
    vi.spyOn(console, "error").mockImplementation(vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("updates every line of the cover as it is typed", () => {
    render(<LinkedInCoverImageEditor />);

    const edits = [
      ["Role", "Staff Engineer"],
      ["Specialty", "Infrastructure & Product"],
      ["Expertise", "Systems // Platforms"],
      ["Stack", "TypeScript, Go"],
      ["Website", "example.com"],
    ] as const;

    for (const [label, value] of edits) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
      expect(screen.getByText(value)).toBeDefined();
    }
  });

  test("fits the 1584 by 396 cover image with a responsive SVG viewport", () => {
    render(<LinkedInCoverImageEditor />);
    const preview = screen.getByRole("figure", {
      name: "LinkedIn cover image preview at 1584 by 396 pixels",
    });
    const viewport = preview.querySelector("svg");
    const coverImage = preview.querySelector("foreignObject > div");

    expect(viewport?.getAttribute("viewBox")).toBe("0 0 1584 396");
    expect(coverImage?.getAttribute("style")).toContain("height: 396px");
    expect(coverImage?.getAttribute("style")).toContain("width: 1584px");
    expect(preview.style.aspectRatio).toBe("1584 / 396");
  });

  test.each([
    {
      button: "download 1x",
      filename: "ruslan-khasanshin-linkedin-cover-image.png",
      scale: 1,
      status: "Downloaded 1x PNG.",
    },
    {
      button: "download 2x",
      filename: "ruslan-khasanshin-linkedin-cover-image-2x.png",
      scale: 2,
      status: "Downloaded 2x PNG.",
    },
  ] as const)("downloads the $scale× PNG", async (exportCase) => {
    render(<LinkedInCoverImageEditor />);

    fireEvent.click(screen.getByRole("button", { name: exportCase.button }));

    await screen.findByText(exportCase.status);

    expect(screenshotMock.domToPng).toHaveBeenCalledExactlyOnceWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        backgroundColor: "#080808",
        height: 396,
        scale: exportCase.scale,
        style: {
          transform: "none",
          transformOrigin: "top left",
        },
        width: 1584,
      })
    );
    expect(downloads).toHaveLength(1);
    expect(downloads[0]?.download).toBe(exportCase.filename);
    expect(downloads[0]?.href).toBe("data:image/png;base64,cG5n");
    expect(audio.play).toHaveBeenCalledExactlyOnceWith("success");
  });

  test("disables both downloads while the PNG renders", async () => {
    const pendingExport = createDeferred<string>();

    screenshotMock.domToPng.mockReturnValueOnce(pendingExport.promise);
    render(<LinkedInCoverImageEditor />);

    const download1x = screen.getByRole("button", { name: "download 1x" });
    const download2x = screen.getByRole("button", { name: "download 2x" });

    fireEvent.click(download2x);

    await screen.findByText("Preparing 2x PNG…");
    expect(audio.play).not.toHaveBeenCalled();
    expect((download1x as HTMLButtonElement).disabled).toBeTruthy();
    expect((download2x as HTMLButtonElement).disabled).toBeTruthy();
    expect(
      (screen.getByLabelText("Role") as HTMLInputElement).disabled
    ).toBeTruthy();

    await act(async () => {
      pendingExport.resolve("data:image/png;base64,cG5n");
      await pendingExport.promise;
    });

    await screen.findByText("Downloaded 2x PNG.");
    expect(audio.play).toHaveBeenCalledExactlyOnceWith("success");
    expect((download1x as HTMLButtonElement).disabled).toBeFalsy();
    expect((download2x as HTMLButtonElement).disabled).toBeFalsy();
    expect(
      (screen.getByLabelText("Role") as HTMLInputElement).disabled
    ).toBeFalsy();
  });

  test("waits for fonts before rendering the PNG", async () => {
    const fontsReady = createDeferred<null>();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: fontsReady.promise },
    });
    render(<LinkedInCoverImageEditor />);
    fireEvent.click(screen.getByRole("button", { name: "download 1x" }));
    await screen.findByText("Preparing 1x PNG…");
    expect(screenshotMock.domToPng).not.toHaveBeenCalled();
    await act(async () => {
      fontsReady.resolve(null);
      await fontsReady.promise;
    });
    await screen.findByText("Downloaded 1x PNG.");
    expect(screenshotMock.domToPng).toHaveBeenCalledOnce();
  });

  test("reports an export failure and lets the user retry", async () => {
    screenshotMock.domToPng.mockRejectedValueOnce(new Error("Render failed"));
    render(<LinkedInCoverImageEditor />);

    fireEvent.click(screen.getByRole("button", { name: "download 1x" }));

    await expect(
      screen.findByText("Unable to download PNG. Try again.")
    ).resolves.toBeDefined();
    expect(audio.play).not.toHaveBeenCalled();
    expect(
      (
        screen.getByRole("button", {
          name: "download 1x",
        }) as HTMLButtonElement
      ).disabled
    ).toBeFalsy();

    fireEvent.click(screen.getByRole("button", { name: "download 1x" }));

    await expect(
      screen.findByText("Downloaded 1x PNG.")
    ).resolves.toBeDefined();
    expect(screenshotMock.domToPng).toHaveBeenCalledTimes(2);
  });
});
