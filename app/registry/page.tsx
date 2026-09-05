import type { Metadata } from "next";
import { Fragment } from "react";

import { createSocialMetadata } from "../metadata";
import { PageNavigation } from "../page-navigation";
import {
  BodyText,
  Divider,
  HomeLink,
  MetaLine,
  Page,
  PageHeader,
  PageTitle,
} from "../primitives";
import { codeRegistry, identity, registrySocialImage } from "../site-data";
import {
  CometProgressDemo,
  cometProgressDocumentation,
} from "./comet-progress-demo";

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
  ...createSocialMetadata({
    description: codeRegistry.description,
    image: registrySocialImage,
    title: metadataTitle,
    url: codeRegistry.href,
  }),
  title: metadataTitle,
};

const RegistryPage = () => (
  <Page>
    <PageHeader>
      <HomeLink />
      <PageTitle>{codeRegistry.title}</PageTitle>
      <BodyText>{codeRegistry.description}</BodyText>
      <MetaLine items={registryLinks} />
    </PageHeader>

    <PageNavigation
      items={registryItems.map(({ id, title }) => ({ id, title }))}
      titlePosition="after-home-link"
    />

    <Divider />

    {registryItems.map((item, index) => (
      <Fragment key={item.id}>
        {index > 0 ? <Divider /> : null}
        {item.content}
      </Fragment>
    ))}
  </Page>
);

export default RegistryPage;
