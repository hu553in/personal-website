import { FaEnvelope, FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";

import { Link } from "./primitives";
import { codeRegistry } from "./site-data";

const about = [
  "I’m a backend-heavy software engineer with 9+ years of experience, working with Go, Java/Kotlin, and TypeScript. I build services, product interfaces, and tools for other developers.",
  "At work, that has meant launching insurance and travel backends, building shared observability tools, and synchronizing access rules across services. I like working through unclear requirements and staying with a product after it ships.",
] as const;

const work = [
  {
    description:
      "Helped take an incomplete Go rewrite of QIC’s motor-insurance backend through a phased production launch, then supported live policy purchases. Co-owned the backend launch of QIC Travel with a small team. Designed and implemented the observability layer of a shared Go library adopted across 25 services, including tracing, metrics, and 30+ operational alerts.",
    period: "since 2025",
    role: "senior backend engineer",
    site: { href: "https://qic.digital", label: "qic.digital" },
    title: "QIC digital hub",
  },
  {
    description:
      "Built and operated 5 Java/Kotlin microservices for a cloud contact-center CRM. Co-designed and implemented a Go worker that synchronized access rules across services using RabbitMQ, incremental updates, and batching. Reduced response time for a frequently called API from about 800 ms to 150 ms and added 800–1,000 automated tests. Acted as hands-on tech lead in a 5-engineer team for 18 months.",
    period: "2021–2025",
    role: "senior java developer",
    site: { href: "https://diabolocom.com", label: "diabolocom.com" },
    title: "Diabolocom",
  },
  {
    description: (
      <>
        Built Java/Kotlin/Spring backends and React/TypeScript interfaces across
        the full development cycle. On a{" "}
        <Link href="https://7bits.it/portfolio/saas-security-solution">
          multi-tenant cybersecurity SaaS
        </Link>
        , developed content-filtering controls, analytics, and domain-list
        synchronization, and improved the existing DNS-processing pipeline. Led
        1 project and taught introductory programming courses.
      </>
    ),
    period: "2017–2021",
    role: "full-stack software engineer",
    site: { href: "https://7bits.it", label: "7bits.it" },
    title: "7bits",
  },
] as const;

const volunteer = [
  {
    description: [
      "I lead engineering for a production nonprofit information platform, owning its Django/DRF backend, deployment, and observability. I work directly with users and a non-technical volunteer team, and deliver Next.js features including a calendar and location-based search.",
      "I built timezone-aware scheduling, hierarchy-aware delegated access, and consistent multilingual search across TypeScript, Python, and PostgreSQL. Query optimization and profiling reduced p99 latency on a primary API path from about 15 seconds to 500 ms.",
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
    title: "How we’re reducing divergence across Go services",
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
    items: [
      "Go",
      "Java/Kotlin",
      "Spring",
      "Node.js",
      "Bun",
      "Python",
      "Django",
      "gRPC/Protobuf",
    ],
    label: "backend",
  },
  {
    items: ["TypeScript", "JavaScript", "React", "Next.js"],
    label: "frontend",
  },
  {
    items: ["PostgreSQL", "PostGIS", "Redis", "ClickHouse"],
    label: "data",
  },
  {
    items: ["Kafka", "RabbitMQ"],
    label: "messaging",
  },
  {
    items: ["Docker", "Kubernetes", "OpenTelemetry", "Prometheus", "Grafana"],
    label: "platform",
  },
  {
    items: [
      "GitLab CI",
      "GitHub Actions",
      "Testcontainers",
      "Playwright",
      "Ansible",
    ],
    label: "delivery",
  },
];

const projects = [
  {
    description: [
      "A pre-launch bilingual creator platform for video, subscriptions, paid access, discovery, community, and moderation.",
      "I own the domain model, architecture, implementation, CI, and operations. My wife leads product vision, design, and user workflows; we make product decisions together.",
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
    name: "Invites for Keycloak",
    role: "web app",
  },
  {
    description: [
      "An interactive exhibition website for the Omsk M. A. Vrubel Museum of Fine Arts. Co-developed as a graduation project using React and Vite.",
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
      "An iPhone VPN client for olcRTC, configured through a single subscription URL.",
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
    content: "An all-black Toyota Yaris and any excuse for a long drive.",
    id: "yaris",
  },
  {
    content: "Fashion — deeply loved, lazily practiced.",
    id: "fashion",
  },
  {
    content: (
      <>
        An unreasonable amount of time watching movies, series, and obscure
        Twitch streams — <i>with my wife, always</i>.
      </>
    ),
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
  skills,
  volunteer,
  work,
  writing,
};
