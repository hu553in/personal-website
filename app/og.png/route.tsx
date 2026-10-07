import { createOgImage } from "@/app/_og/create-image";
import { identity, roleDescription } from "@/app/site-data";

export const dynamic = "force-static";

export const GET = () =>
  createOgImage({ description: roleDescription, title: identity.name });
