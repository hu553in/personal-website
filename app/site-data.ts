const site = {
  description:
    "Senior software engineer working across product engineering, distributed systems, developer platforms, and product UI.",
  openGraphDescription:
    "Product engineering, distributed systems, developer platforms, and product UI.",
  openGraphTitle:
    "Ruslan Khasanshin\nSenior Software Engineer — Product & Platform",
  themeColor: {
    dark: "#0e0e11",
    light: "#fffdfa",
  },
  title: "Ruslan Khasanshin — Senior Software Engineer, Product & Platform",
  url: "https://hu553in.su",
} as const;

const identity = {
  handle: "hu553in",
  name: "Ruslan Khasanshin",
  photo: "https://github.com/hu553in.png",
  role: "senior software engineer — product & platform",
};

const socialImage = {
  alt: `${identity.name}, ${identity.role}`,
  height: 630,
  url: "/og.png",
  width: 1200,
} as const;

const codeRegistry = {
  description: "A shadcn registry for sharing reusable code across projects.",
  githubHref: "https://github.com/hu553in/personal-website/tree/main/registry",
  href: "/registry",
  licenseHref:
    "https://github.com/hu553in/personal-website/blob/main/registry/LICENSE",
  role: "code registry",
  title: "shadcn registry",
} as const;

const linkedInCoverImage = {
  description: "Use my template to make your own LinkedIn cover image.",
  href: "/linkedin-cover-image",
  role: "design tool",
  title: "LinkedIn cover image",
} as const;

const registrySocialImage = {
  ...socialImage,
  alt: `${codeRegistry.title}, ${codeRegistry.description}`,
  url: `${codeRegistry.href}/og.png`,
} as const;

export {
  codeRegistry,
  identity,
  linkedInCoverImage,
  registrySocialImage,
  site,
  socialImage,
};
