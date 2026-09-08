import type { Metadata } from "next";

import { createSocialMetadata } from "../metadata";
import {
  BodyText,
  Divider,
  HomeLink,
  Page,
  PageHeader,
  PageTitle,
} from "../primitives";
import { identity, openGraphImage, socialImage } from "../site-data";
import { OpenGraphImageEditor } from "./open-graph-image-editor";

const title = `${openGraphImage.title} — ${identity.name}`;

export const metadata: Metadata = {
  alternates: {
    canonical: openGraphImage.href,
    types: { "text/markdown": `${openGraphImage.href}.md` },
  },
  description: openGraphImage.description,
  ...createSocialMetadata({
    description: openGraphImage.description,
    image: socialImage,
    title,
    url: openGraphImage.href,
  }),
  title,
};

const OpenGraphImagePage = () => (
  <Page>
    <PageHeader>
      <HomeLink />
      <PageTitle>{openGraphImage.title}</PageTitle>
      <BodyText>{openGraphImage.description}</BodyText>
    </PageHeader>
    <Divider />
    <OpenGraphImageEditor />
  </Page>
);

export default OpenGraphImagePage;
