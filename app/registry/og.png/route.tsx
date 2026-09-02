import { createOgImage } from "@/app/_og/create-image";
import { codeRegistry } from "@/app/site-data";

export const dynamic = "force-static";

export const GET = () =>
  createOgImage({
    description: codeRegistry.description,
    title: codeRegistry.title,
  });
