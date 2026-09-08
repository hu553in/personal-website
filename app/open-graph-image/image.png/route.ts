import { createOgImage } from "@/app/_og/create-image";
import { identity } from "@/app/site-data";

import { fields } from "../fields";

export const GET = (request: Request) => {
  const params = new URL(request.url).searchParams;
  const title = params.get("title") ?? identity.name;
  const description = params.get("description") ?? identity.role;

  const copy = { description, title };
  if (fields.some((field) => copy[field.key].length > field.maxLength)) {
    return new Response(
      fields
        .map(
          (field) => `${field.label}: maximum ${field.maxLength} characters.`
        )
        .join(" "),
      { status: 400 }
    );
  }

  const response = createOgImage({
    description,
    title,
  });
  response.headers.set("Cache-Control", "no-store");
  if (params.has("download")) {
    response.headers.set(
      "Content-Disposition",
      'attachment; filename="open-graph-image.png"'
    );
  }
  return response;
};
