import type { Metadata } from "next";

type SocialImage = Readonly<{
  alt: string;
  height: number;
  url: string;
  width: number;
}>;

const createSocialMetadata = ({
  description,
  image,
  title,
  url,
}: Readonly<{
  description: string;
  image: SocialImage;
  title: string;
  url: string;
}>): Pick<Metadata, "openGraph" | "twitter"> => ({
  openGraph: {
    description,
    images: [image],
    title,
    type: "website",
    url,
  },
  twitter: {
    card: "summary_large_image",
    description,
    images: [image],
    title,
  },
});

export { createSocialMetadata };
