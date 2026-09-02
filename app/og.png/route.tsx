import { createOgImage } from "@/app/_og/create-image";
import { identity } from "@/app/site-data";

export const dynamic = "force-static";

export const GET = () =>
  createOgImage({ description: identity.role, title: identity.name });
