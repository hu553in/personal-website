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
import { identity, linkedInCoverImage, socialImage } from "../site-data";
import { LinkedInCoverImageEditor } from "./linkedin-cover-image-editor";

const metadataTitle = `${linkedInCoverImage.title} — ${identity.name}`;

export const metadata: Metadata = {
  alternates: {
    canonical: linkedInCoverImage.href,
    types: {
      "text/markdown": `${linkedInCoverImage.href}.md`,
    },
  },
  description: linkedInCoverImage.description,
  ...createSocialMetadata({
    description: linkedInCoverImage.description,
    image: socialImage,
    title: metadataTitle,
    url: linkedInCoverImage.href,
  }),
  title: metadataTitle,
};

const LinkedInCoverImagePage = () => (
  <Page>
    <PageHeader>
      <HomeLink />
      <PageTitle>{linkedInCoverImage.title}</PageTitle>
      <BodyText>{linkedInCoverImage.description}</BodyText>
    </PageHeader>

    <Divider />
    <LinkedInCoverImageEditor />
  </Page>
);

export default LinkedInCoverImagePage;
