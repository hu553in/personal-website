import { readFileSync } from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const design = readFileSync(path.join(process.cwd(), "DESIGN.md"));

export const GET = () =>
  new Response(design, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Disposition": 'inline; filename="DESIGN.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
