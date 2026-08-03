import { FaEnvelope, FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";

import { Link } from "./primitives";

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

const about = [
  "I build products end to end and the platform foundations behind them — distributed systems, developer tooling, observability, and product UI.",
  "Over 8+ years, I’ve shipped software across insurance, travel, contact-center SaaS, and creator tooling. I’m most useful when the requirements are incomplete, the system is unfinished, and someone has to turn both into something reliable enough to ship.",
  "I tend to go deep on products I care about: tracing edge cases, tightening the model, reducing operational ambiguity, and polishing things long after the happy path works.",
] as const;

const resume = {
  href: "/resume.pdf",
  label: "pdf",
  title: "Resume",
} as const;

const work = [
  {
    description:
      "Joined while QIC’s new Go-based motor-insurance backend was still an incomplete pre-production rewrite. Helped take it through a phased production launch, built the observability foundation used across 25 services, and co-owned the backend launch of QIC Travel with one other engineer.",
    period: "since 2025",
    role: "senior backend engineer",
    site: { href: "https://qic.digital/", label: "qic.digital" },
    title: "QIC digital hub",
  },
  {
    description:
      "Built and operated five Java/Kotlin microservices for a cloud contact-center CRM. Reduced a frequently called API from approximately 800 ms to 150 ms, added approximately 800–1,000 automated tests, and acted as tech lead for five engineers during the final 18 months.",
    period: "2021–2025",
    role: "senior java developer",
    site: { href: "https://noveogroup.com/", label: "noveogroup.com" },
    title: "Noveo",
  },
  {
    description:
      "Built external and internal products with Java/Kotlin/Spring and React/TypeScript across the full development cycle. Led one project and taught programming to students and beginners.",
    period: "2017–2021",
    role: "full-stack software engineer",
    site: { href: "https://7bits.it/", label: "7bits.it" },
    title: "7bits",
  },
] as const;

const writing = [
  {
    description:
      "How a shared Go platform library, service templates, and dependency policy reduce cross-service divergence during a backend migration.",
    details: [
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
      "Technical debt isn’t just legacy: how we’re reducing divergence across Go services",
  },
  {
    description:
      "A conference talk on architecture, caching, horizontal scaling, observability, and failure handling.",
    details: [
      {
        href: "https://www.youtube.com/watch?v=Xkidzosg02E",
        label: "youtube",
      },
      { label: "russian" },
    ],
    title: "Designing a Real-World High-Scale Content Filtering System",
  },
] as const;

const stack = [
  {
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "shadcn/ui"],
    label: "product",
  },
  {
    items: ["Go", "Java/Kotlin", "Python", "Node.js", "gRPC"],
    label: "systems",
  },
  {
    items: ["PostgreSQL", "Kafka", "Redis", "ClickHouse", "Drizzle"],
    label: "data",
  },
  {
    items: ["OpenTelemetry", "Prometheus", "Grafana", "Docker", "Kubernetes"],
    label: "platform",
  },
];

const project = {
  description: [
    "A pre-launch bilingual creator platform for video, subscriptions, paid access, discovery, community, and moderation.",
    "I own the domain model, architecture, implementation, CI, and operations; product vision, design, and user workflows are developed with my wife.",
  ],
  href: "https://dev.voomy.tv/product",
  name: "voomy",
  role: "independent product",
} as const;

const interests = [
  {
    content: "AI launches watched live, like season finales.",
    id: "ai",
  },
  {
    content: "Open source that changes how I work.",
    id: "open-source",
  },
  {
    content: "Self-hosting, VPNs, and the hobbyist end of hacking.",
    id: "self-hosting",
  },
  {
    content:
      "Vibe coding sharp little utilities — most die young, and that’s fine.",
    id: "vibe-coding",
  },
  {
    content:
      "Product design, especially the tiny details nobody asked me to polish.",
    id: "product-design",
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
    content: "A full-black Toyota Yaris and any excuse for a long drive.",
    id: "yaris",
  },
  {
    content: "Fashion — deeply loved, lazily practiced.",
    id: "fashion",
  },
  {
    content:
      "An unreasonable amount of movies, series, and no-name Twitch streamers — with my wife, always.",
    id: "screens",
  },
];

const connectLinks = [
  {
    href: "https://github.com/hu553in",
    icon: FaGithub,
    label: "hu553in",
  },
  {
    href: "https://www.linkedin.com/in/ruslan-khasanshin",
    icon: FaLinkedin,
    label: "ruslan-khasanshin",
  },
  {
    href: "https://t.me/rkhasanshin",
    icon: FaTelegram,
    label: "rkhasanshin",
  },
  {
    href: "mailto:r.m.khasanshin@gmail.com",
    icon: FaEnvelope,
    label: "r.m.khasanshin@gmail.com",
  },
];

export {
  about,
  connectLinks,
  identity,
  interests,
  project,
  resume,
  site,
  stack,
  work,
  writing,
};
