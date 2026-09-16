const site = {
  description:
    "Senior software engineer with 9+ years of experience in backend and full-stack development. Go, Java/Kotlin, TypeScript, and React.",
  openGraphDescription:
    "Backend and full-stack development with Go, Java/Kotlin, TypeScript, and React.",
  openGraphTitle:
    "Ruslan Khasanshin\nSenior Software Engineer — Backend & Full-Stack",
  repository: "https://github.com/hu553in/personal-website",
  themeColor: {
    dark: "#0e0e11",
    light: "#fffdfa",
  },
  title: "Ruslan Khasanshin — Senior Software Engineer, Backend & Full-Stack",
  url: "https://hu553in.dev",
} as const;

const identity = {
  handle: "hu553in",
  name: "Ruslan Khasanshin",
  photo: "https://github.com/hu553in.png",
  role: "senior software engineer — backend & full-stack",
};

const resume = {
  documentUrl:
    "https://docs.google.com/document/d/1GAJ0YMIWsCaEFIfTp4sTN-smbZIR5uzieWYiGQdtq8g/edit",
  filename: "Ruslan_Khasanshin_Senior_Software_Engineer.pdf",
  href: "/resume.pdf",
  label: "pdf",
  title: "Resume",
} as const;

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

const openGraphImage = {
  description: "Use my template to make your own Open Graph image.",
  href: "/open-graph-image",
  role: "design tool",
  title: "Open Graph image",
} as const;

export {
  codeRegistry,
  identity,
  linkedInCoverImage,
  openGraphImage,
  registrySocialImage,
  resume,
  site,
  socialImage,
};
