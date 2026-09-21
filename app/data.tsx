import { FaEnvelope, FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa6";

import { Link } from "./primitives";
import { codeRegistry } from "./site-data";

const about = [
  "I’m a backend-heavy software engineer with 9+ years of experience, working with Go, Java/Kotlin, and TypeScript. I build services, product interfaces, and tools for other developers.",
  "At work, that has meant launching insurance and travel backends and building shared observability tools. I like working through unclear requirements and staying with a product after it ships.",
] as const;

const work = [
  {
    description:
      "I helped take QIC’s Go motor-insurance backend through a phased production launch and co-owned the backend launch of QIC Travel. I developed observability tooling for 25 Go services and used it to diagnose failed document deliveries and external policy registrations after payment, helping the support team complete affected operations. I added outbox integration, retries, and alerts. Across 25 repositories, I introduced Renovate and vulnerability checks to replace months of dependency drift with regular updates and fixes.",
    period: "since 2025",
    role: "senior backend engineer",
    site: { href: "https://qic.digital", label: "qic.digital" },
    title: "QIC digital hub",
  },
  {
    description:
      "I built and operated 5 Java/Kotlin microservices for a cloud contact-center CRM, with on-call responsibility, and spent 18 months as a hands-on tech lead in a 5-engineer team. I co-designed and built a Go worker that synchronized access rules across service databases. I reduced a frequently called API’s response time from about 800 ms to 150 ms by removing N+1 queries, fetching less data from the database, and adding indexes. I also added 800–1,000 automated tests and independently migrated legacy services to Spring Boot 3.",
    period: "2021–2025",
    role: "senior java developer",
    site: { href: "https://diabolocom.com", label: "diabolocom.com" },
    title: "Diabolocom",
  },
  {
    description: (
      <>
        I developed Java/Kotlin/Spring backends and React/TypeScript interfaces
        for a{" "}
        <Link href="https://7bits.it/portfolio/saas-security-solution">
          multi-tenant cybersecurity SaaS
        </Link>
        , including content filtering, analytics, domain-list synchronization,
        and improvements to its existing DNS-processing pipeline. For an
        extended period I was the project’s sole developer, working directly
        with the US client on requirements, priorities, and releases. I also
        taught a two-semester Spring and React course to 20–30 students, with
        lectures, workshops, code reviews, and a final full-stack project.
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
      "I lead engineering for a nonprofit platform with about 117K monthly unique users, helping people facing serious health challenges find support. I own its Django/DRF backend, deployment, and observability, and work directly with users and a non-technical volunteer team.",
      "I built Next.js calendar and location-search features, timezone-aware scheduling, hierarchy-aware delegated access, and multilingual search across TypeScript, Python, and PostgreSQL. Removing N+1 queries and optimizing SQL and geospatial lookups reduced a key API’s p99 latency from about 15 seconds to 500 ms.",
      "I also replaced an old regional website by migrating its data into the platform and preserving old links through redirects. I help new volunteers learn the architecture, review their code, and work through their first tasks.",
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
      "A talk about the cybersecurity system I worked on at 7bits, covering architecture, scaling, and failure handling.",
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
      "I'm the sole engineer, responsible for the domain model, architecture, frontend, backend, testing, CI, and operations. My wife leads product vision, design, and user workflows; we make product decisions together.",
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
      "A terminal interface for browsing and editing HashiCorp Vault KV v2 secrets. Version checks prevent edits from overwriting concurrent changes.",
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
      "A web app for managing Keycloak invitations with expiry dates, usage limits, and predefined roles. It handles invitations for a production admin panel with dozens of users.",
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
      "An interactive exhibition website for the Omsk M. A. Vrubel Museum of Fine Arts. Co-developed as a graduation project in React and later migrated to Vite.",
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
      "An iPhone VPN client with a Swift tunnel extension integrating olcRTC’s Go runtime. A single subscription URL configures the connection. My family uses it to stay connected on restricted networks.",
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
      "A Telegram bot written in Go that I use daily for RSS, Atom, and JSON feed digests and channel summaries.",
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
      "A browser-only dashboard I use to monitor GitHub Actions workflows across my repositories.",
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
      "A GitHub Action that generates Neofetch-style SVG profile cards with daily ASCII art and GitHub stats.",
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
