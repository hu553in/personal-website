import {
  EmailIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
} from "./icons";
import { Link } from "./primitives";

const site = {
  description:
    "Senior product engineer. Backend, frontend, AI, design - currently building voomy with my wife.",
  themeColor: {
    dark: "#0e0e11",
    light: "#fffdfa",
  },
  title: "Ruslan Khasanshin · senior product engineer",
  url: "https://hu553in.su",
} as const;

const identity = {
  handle: "hu553in",
  name: "Ruslan Khasanshin",
  photo: "https://github.com/hu553in.png",
  role: "senior product engineer, building voomy",
};

const about = (
  <>
    Backend engineer by trade, generalist by pull: lately frontend, serverless,
    and the design engineers posting shaders on X all have my attention. AI is
    in my loop by default. Everything feeds into{" "}
    <Link href="#voomy">voomy</Link>
    {" - my first startup, hopefully not the last."}
  </>
);

const sectionTitles = {
  about: "About",
  connect: "Connect",
  elsewhere: "Elsewhere",
  interests: "Interests",
  projects: "Projects",
  stack: "Stack",
  work: "Work",
};

const work = [
  {
    links: [{ href: "https://qic.digital/", label: "qic.digital" }],
    meta: "since 2025",
    role: "senior backend engineer",
    title: "QIC digital hub",
  },
  {
    links: [
      { href: "https://bit.ly/rkhasanshin-cv", label: "en" },
      { href: "https://bit.ly/rkhasanshin-cv-ru", label: "ru" },
    ],
    title: "CV",
  },
];

const elsewhere = [
  {
    links: [
      {
        href: "https://medium.com/qicdigitalhub/technical-debt-isnt-just-legacy-how-we-re-reducing-divergence-across-go-services-6225e55b15c1",
        label: "medium",
      },
      {
        href: "https://habr.com/en/articles/1056628/",
        label: "habr",
      },
    ],
    title:
      "Technical debt isn't just legacy: how we're reducing divergence across Go services",
  },
];

const stack = [
  {
    id: "work",
    items: ["Go", "Postgres", "Kafka", "Redis"],
    label: "work",
  },
  {
    id: "side",
    items: [
      "TypeScript",
      "Next.js",
      "Vercel",
      "shadcn/ui",
      "Tailwind CSS",
      "Drizzle",
    ],
    label: "side",
  },
  {
    id: "infra",
    items: ["Linux", "Docker", "Ansible", "Nginx", "Caddy"],
    label: "infra",
  },
  {
    id: "roots",
    items: ["Java", "Kotlin", "Spring Boot", "React", "C/C++"],
    label: "roots",
  },
];

const projects = [
  {
    description:
      "A creator platform for video, subscriptions, and community. Building it from zero with my wife: she owns the vision and a good share of the design, I write all the code. No team, just the two of us.",
    href: "https://dev.voomy.tv/product",
    name: "voomy",
    role: "founder",
  },
];

const interests = [
  {
    content: "AI launches watched live, like season finales.",
    id: "ai",
  },
  {
    content:
      "Hunting open source that hits like Docker and Ansible did the first time.",
    id: "open-source",
  },
  {
    content: "Self-hosting, VPNs, and the hobbyist end of hacking.",
    id: "self-hosting",
  },
  {
    content:
      "Vibe-coding sharp little utilities - most die young, and that's fine.",
    id: "vibe-coding",
  },
  {
    content: (
      <>
        <Link href="https://i.postimg.cc/QxJH6RfS/photo-2025-01-26-04-52-04.jpg">
          Borya the Welsh Corgi
        </Link>
        , the third founder.
      </>
    ),
    id: "borya",
  },
  {
    content:
      "A full-black Toyota Yaris, rap turned up, and the urge to drive faster than I should.",
    id: "yaris",
  },
  {
    content: "Fashion - deeply loved, lazily practiced.",
    id: "fashion",
  },
  {
    content:
      "An unreasonable amount of movies, series, and no-name Twitch streamers - with my wife, always.",
    id: "screens",
  },
];

const connectLinks = [
  {
    href: "https://github.com/hu553in",
    icon: GitHubIcon,
    label: "hu553in",
  },
  {
    href: "https://www.linkedin.com/in/ruslan-khasanshin",
    icon: LinkedInIcon,
    label: "ruslan-khasanshin",
  },
  {
    href: "https://t.me/rkhasanshin",
    icon: TelegramIcon,
    label: "rkhasanshin",
  },
  {
    href: "https://www.instagram.com/hu553in___",
    icon: InstagramIcon,
    label: "hu553in___",
  },
  {
    href: "mailto:hu553in@poke.com",
    icon: EmailIcon,
    label: "hu553in@poke.com",
  },
];

export {
  about,
  connectLinks,
  elsewhere,
  identity,
  interests,
  projects,
  sectionTitles,
  site,
  stack,
  work,
};
