// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GET } from "./route";

describe("Resume PDF", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("exports the fixed document as an inline PDF with CDN caching", async () => {
    const pdf = new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 55, 10, 0, 128, 255,
    ]);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(pdf, {
        headers: {
          "Content-Disposition": 'attachment; filename="upstream.pdf"',
          "Content-Type": "application/pdf; charset=binary",
          "Set-Cookie": "upstream=value",
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        "https://docs.google.com/document/d/1GAJ0YMIWsCaEFIfTp4sTN-smbZIR5uzieWYiGQdtq8g/export?format=pdf"
      ),
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(AbortSignal),
      })
    );
    expect(response.status).toBe(200);
    expect(new Uint8Array(await response.arrayBuffer())).toStrictEqual(pdf);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'inline; filename="Ruslan_Khasanshin_Senior_Software_Engineer.pdf"'
    );
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=0, s-maxage=600, stale-while-revalidate=60"
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.has("Set-Cookie")).toBeFalsy();
  });

  test.each([
    { contentType: "application/pdf", status: 403 },
    { contentType: "application/pdf", status: 500 },
    { contentType: "text/html", status: 200 },
    { contentType: "", status: 200 },
  ])(
    "does not cache an invalid export: $status $contentType",
    async ({ contentType, status }) => {
      const cancel = vi.fn();
      const body = new ReadableStream({
        cancel,
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode("upstream error details")
          );
        },
      });
      vi.stubGlobal(
        "fetch",
        vi.fn<typeof fetch>().mockResolvedValue(
          new Response(body, {
            headers: { "Content-Type": contentType },
            status,
          })
        )
      );

      const response = await GET();

      expect(cancel).toHaveBeenCalledOnce();
      expect(response.status).toBe(502);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.has("Content-Disposition")).toBeFalsy();
      await expect(response.text()).resolves.toBe(
        "Unable to load resume. Try again."
      );
    }
  );

  test("does not cache an empty export", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(null, { headers: { "Content-Type": "application/pdf" } })
        )
    );

    const response = await GET();

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  test("reports an upstream request failure without exposing its details", async () => {
    const cause = new Error("Connection failed");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(cause));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.text()).resolves.toBe(
      "Unable to load resume. Try again."
    );
    expect(console.error).toHaveBeenCalledWith("Unable to load resume:", cause);
  });

  test("does not send a successful response when the download is interrupted", async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.error(new Error("Download interrupted"));
      },
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(body, { headers: { "Content-Type": "application/pdf" } })
        )
    );

    const response = await GET();

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
