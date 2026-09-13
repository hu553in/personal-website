import { resume } from "@/app/site-data";

export const GET = async () => {
  try {
    const upstream = await fetch(
      new URL("export?format=pdf", resume.documentUrl),
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      }
    );
    const contentType = upstream.headers
      .get("content-type")
      ?.split(";")[0]
      ?.trim()
      .toLowerCase();

    if (upstream.status !== 200 || contentType !== "application/pdf") {
      await upstream.body?.cancel();
      throw new Error(
        `Google Docs PDF export failed: HTTP ${upstream.status}, content type ${contentType || "missing"}.`
      );
    }

    const pdf = await upstream.arrayBuffer();
    if (pdf.byteLength === 0) {
      throw new Error("Google Docs returned an empty PDF.");
    }

    return new Response(pdf, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=600, stale-while-revalidate=60",
        "Content-Disposition": `inline; filename="${resume.filename}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Unable to load resume:", error);
    return new Response("Unable to load resume. Try again.", {
      headers: { "Cache-Control": "no-store" },
      status: 502,
    });
  }
};
