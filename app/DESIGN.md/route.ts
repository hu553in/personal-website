import design from "../../DESIGN.md?raw";

export const dynamic = "force-static";

export const GET = () =>
  new Response(design, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Disposition": 'inline; filename="DESIGN.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
