import type { Metadata } from "next";
import { Fragment } from "react";

import { BodyText, Divider, Link, MetaLine } from "../primitives";
import { codeRegistry, identity, registrySocialImage } from "../site-data";
import {
  CometProgressDemo,
  cometProgressDocumentation,
} from "./comet-progress-demo";
import { RegistryNavigation } from "./registry-navigation";

const registryLinks = [
  {
    href: codeRegistry.licenseHref,
    label: "license (MIT)",
  },
  {
    href: codeRegistry.githubHref,
    label: "github",
  },
] as const;
const metadataTitle = `${codeRegistry.title} — ${identity.name}`;

const registryItems = [
  {
    content: <CometProgressDemo />,
    id: cometProgressDocumentation.id,
    title: cometProgressDocumentation.title,
  },
] as const;

export const metadata: Metadata = {
  alternates: {
    canonical: codeRegistry.href,
    types: {
      "text/markdown": `${codeRegistry.href}.md`,
    },
  },
  description: codeRegistry.description,
  openGraph: {
    description: codeRegistry.description,
    images: [registrySocialImage],
    title: metadataTitle,
    type: "website",
    url: codeRegistry.href,
  },
  title: metadataTitle,
  twitter: {
    card: "summary_large_image",
    description: codeRegistry.description,
    images: [registrySocialImage],
    title: metadataTitle,
  },
};

const RegistryPage = () => (
  <main className="relative mx-auto flex w-full max-w-160 flex-col px-6 py-24 sm:py-32">
    <header className="flex flex-col gap-3 pb-4 min-[69rem]:pb-10">
      <Link
        className="text-muted-foreground font-mono text-[13px]"
        href="/"
        variant="quiet"
      >
        ← home
      </Link>
      <h1 className="text-2xl sm:text-3xl">{codeRegistry.title}</h1>
      <BodyText>{codeRegistry.description}</BodyText>
      <MetaLine items={registryLinks} />
    </header>

    <RegistryNavigation
      items={registryItems.map(({ id, title }) => ({ id, title }))}
    />

    <Divider />

    {registryItems.map((item, index) => (
      <Fragment key={item.id}>
        {index > 0 ? <Divider /> : null}
        {item.content}
      </Fragment>
    ))}
  </main>
);

export default RegistryPage;
