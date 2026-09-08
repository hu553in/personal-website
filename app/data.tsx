import { FaEnvelope, FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";

import { Link } from "./primitives";
import { codeRegistry } from "./site-data";

const about = [
  "I build products end to end and the platform foundations behind them — distributed systems, developer tooling, observability, and product UI.",
  "Over eight years, I’ve shipped software across insurance, travel, contact-center SaaS, creator tooling, and nonprofit infrastructure. I’m most useful when the requirements are incomplete, the system is unfinished, and someone has to turn that ambiguity into something reliable in production.",
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
      "Joined while QIC’s new Go-based motor-insurance backend was still an incomplete pre-production rewrite. Helped take it through a phased production launch, built the observability foundation used across 25 services, and co-owned the backend launch of QIC Travel as part of a small backend team.",
    period: "since 2025",
    role: "senior backend engineer",
    site: { href: "https://qic.digital", label: "qic.digital" },
    title: "QIC digital hub",
  },
  {
    description:
      "Built and operated five Java/Kotlin microservices for a cloud contact-center CRM. Reduced response time for a frequently called API from approximately 800 ms to 150 ms, added approximately 800–1,000 automated tests, and acted as tech lead for five engineers during the final 18 months.",
    period: "2021–2025",
    role: "senior java developer",
    site: { href: "https://noveogroup.com", label: "noveogroup.com" },
    title: "Noveo",
  },
  {
    description:
      "Built external and internal products with Java/Kotlin/Spring and React/TypeScript across the full development cycle. Led one project and taught introductory programming courses.",
    period: "2017–2021",
    role: "full-stack software engineer",
    site: { href: "https://7bits.it", label: "7bits.it" },
    title: "7bits",
  },
] as const;

const volunteer = [
  {
    description: [
      "I lead engineering for a production, location-aware nonprofit platform. I own the Django/DRF backend, deployment, and observability, contribute across the Next.js frontend, and work directly with users and a non-technical volunteer team to turn loosely defined needs into complete product changes.",
      "The work includes a timezone-aware scheduling engine, PostGIS-backed search, hierarchy-aware delegated administration, multilingual search, and a multi-stage performance program that reduced a key p99 from about 15 seconds to 500 ms.",
    ],
    period: "since 2024",
    role: "volunteer lead software engineer",
    title: "Nonprofit information platform",
  },
] as const;

const writing = [
  {
    description:
      "How a shared Go platform library, a service template, and a dependency policy reduce cross-service divergence during a backend migration.",
    details: [
      {
        href: "https://medium.com/qicdigitalhub/technical-debt-isnt-just-legacy-how-we-re-reducing-divergence-across-go-services-6225e55b15c1",
        label: "medium en",
      },
      {
        href: "https://habr.com/ru/articles/1056628",
        label: "habr ru",
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
        label: "youtube ru",
      },
    ],
    title: "Designing a Real-World High-Scale Content Filtering System",
  },
] as const;

const skills = [
  {
    items: ["TypeScript", "JavaScript", "React", "Next.js"],
    label: "product",
  },
  {
    items: [
      "Node.js",
      "Bun",
      "Go",
      "Java/Kotlin",
      "Python",
      "Django",
      "gRPC/Protobuf",
    ],
    label: "backend",
  },
  {
    items: ["PostgreSQL", "PostGIS", "ClickHouse", "Redis", "Kafka"],
    label: "data",
  },
  {
    items: ["OpenTelemetry", "Prometheus", "Grafana", "Docker", "Kubernetes"],
    label: "platform",
  },
  {
    items: ["GitLab CI", "GitHub Actions", "Ansible"],
    label: "ops",
  },
];

const projects = [
  {
    description: [
      "A pre-launch bilingual creator platform for video, subscriptions, paid access, discovery, community, and moderation.",
      "I own the domain model, architecture, implementation, CI, and operations; product vision, design, and user workflows are developed with my wife.",
    ],
    links: [
      {
        href: "https://voomy.tv/product",
        label: "website",
      },
    ],
    name: "voomy",
    role: "independent product",
  },
  {
    description: [
      "An Electron desktop app for live speech transcription and translated captions.",
    ],
    links: [
      {
        href: "https://github.com/hu553in/relay",
        label: "github",
      },
    ],
    name: "Relay",
    role: "desktop app",
  },
  {
    description: [
      "A terminal interface for browsing and editing HashiCorp Vault KV v2 secrets.",
    ],
    links: [
      {
        href: "https://github.com/hu553in/vlt",
        label: "github",
      },
    ],
    name: "vlt",
    role: "TUI app",
  },
  {
    description: [
      "A web app for Keycloak invitation links and user registration, with a Spring Boot backend.",
    ],
    links: [
      {
        href: "https://github.com/hu553in/invites-keycloak",
        label: "github",
      },
    ],
    name: "Invites for your Keycloak",
    role: "web app",
  },
  {
    description: [
      "An exhibition website for the Omsk M. A. Vrubel Museum of Fine Arts, built with React and Vite.",
    ],
    links: [
      {
        href: "https://vrubel-museum-exhibitions.vercel.app",
        label: "website",
      },
      {
        href: "https://github.com/hu553in/vrubel-museum-exhibitions",
        label: "github",
      },
    ],
    name: "Vrubel Museum exhibitions",
    role: "interactive",
  },
  {
    description: [
      "A Telegram bot for Dota 2 schedules, live matches, results, and favorites, hosted on Cloudflare.",
    ],
    links: [
      {
        href: "https://t.me/d2_schedule_bot",
        label: "telegram",
      },
      {
        href: "https://github.com/hu553in/dota2-schedule-bot",
        label: "github",
      },
    ],
    name: "Dota 2 schedule bot",
    role: "telegram bot",
  },
  {
    description: [
      "A minimal iPhone client for connecting to olcRTC through a single subscription URL.",
    ],
    links: [
      {
        href: "https://github.com/hu553in/one-last-chance",
        label: "github",
      },
    ],
    name: "One Last Chance",
    role: "iOS app",
  },
  {
    description: [
      "A Telegram bot written in Go for RSS, Atom, and JSON feed digests and channel summaries.",
    ],
    links: [
      {
        href: "https://t.me/hu553in_telekilogram_bot",
        label: "telegram",
      },
      {
        href: "https://github.com/hu553in/telekilogram",
        label: "github",
      },
    ],
    name: "Telekilogram",
    role: "telegram bot",
  },
  {
    description: [
      "A CLI built with Playwright and Crawlee for mirroring single-page applications as static files.",
    ],
    links: [
      {
        href: "https://github.com/hu553in/spa-crawler",
        label: "github",
      },
    ],
    name: "SPA crawler",
    role: "CLI tool",
  },
  {
    description: [
      "A browser-only GitHub Actions workflow dashboard for multiple repositories.",
    ],
    links: [
      {
        href: "https://gh-workflow-dashboard.vercel.app",
        label: "website",
      },
      {
        href: "https://github.com/hu553in/gh-workflow-dashboard",
        label: "github",
      },
    ],
    name: "GitHub workflow dashboard",
    role: "web dashboard",
  },
  {
    description: ["My collection of reusable agent skills."],
    links: [
      {
        href: "https://skills.sh/hu553in/skills",
        label: "website",
      },
      {
        href: "https://github.com/hu553in/skills",
        label: "github",
      },
    ],
    name: "Skills",
    role: "agent workflows",
  },
  {
    description: [
      "A Python CLI for building and signing Tizen TV packages using Tizen Studio in Docker.",
    ],
    links: [
      {
        href: "https://github.com/hu553in/tizen-tool",
        label: "github",
      },
    ],
    name: "Tizen tool",
    role: "CLI tool",
  },
  {
    description: [
      "A website for a pet grooming studio in Omsk, built with React and Vite.",
    ],
    links: [
      {
        href: "https://xn-----flcj2bnpjd0gcb.xn--p1ai",
        label: "website",
      },
      {
        href: "https://github.com/hu553in/grooming-studio",
        label: "github",
      },
    ],
    name: "Grooming studio website",
    role: "landing page",
  },
  {
    description: [
      "A GitHub Action that generates Neofetch-style SVG profile cards with daily ASCII art and live GitHub stats.",
    ],
    links: [
      {
        href: "https://github.com/marketplace/actions/ascii-profile-card",
        label: "page",
      },
      {
        href: "https://github.com/hu553in/ascii-profile-card",
        label: "github",
      },
    ],
    name: "ASCII profile card",
    role: "github action",
  },
  {
    description: [codeRegistry.description],
    links: [
      {
        ariaLabel: `${codeRegistry.title} page`,
        href: codeRegistry.href,
        label: "page",
      },
      {
        href: codeRegistry.githubHref,
        label: "github",
      },
    ],
    name: codeRegistry.title,
    role: codeRegistry.role,
  },
] as const;

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
        <Link href="/borya.jpg">Borya the Welsh Corgi</Link>, voomy’s third
        founder.
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
  interests,
  projects,
  resume,
  skills,
  volunteer,
  work,
  writing,
};
