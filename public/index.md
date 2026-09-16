# Ruslan Khasanshin

hu553in · senior software engineer — backend & full-stack

## About

I’m a backend-heavy software engineer with 9+ years of experience, working with Go, Java/Kotlin, and
TypeScript. I build services, product interfaces, and tools for other developers.

At work, that has meant launching insurance and travel backends, building shared observability
tools, and synchronizing access rules across services. I like working through unclear requirements
and staying with a product after it ships.

## Work

### Resume

[pdf](/resume.pdf)

### QIC digital hub

senior backend engineer · since 2025 · [qic.digital](https://qic.digital)

Helped take an incomplete Go rewrite of QIC’s motor-insurance backend through a phased production
launch, then supported live policy purchases. Co-owned the backend launch of QIC Travel with a small
team. Designed and implemented the observability layer of a shared Go library adopted across 25
services, including tracing, metrics, and 30+ operational alerts.

### Diabolocom

senior java developer · 2021–2025 · [diabolocom.com](https://diabolocom.com)

Built and operated 5 Java/Kotlin microservices for a cloud contact-center CRM. Co-designed and
implemented a Go worker that synchronized access rules across services using RabbitMQ, incremental
updates, and batching. Reduced response time for a frequently called API from about 800 ms to 150 ms
and added 800–1,000 automated tests. Acted as hands-on tech lead in a 5-engineer team for the final
18 months.

### 7bits

full-stack software engineer · 2017–2021 · [7bits.it](https://7bits.it)

Built Java/Kotlin/Spring backends and React/TypeScript interfaces across the full development cycle.
On a [multi-tenant cybersecurity SaaS](https://7bits.it/portfolio/saas-security-solution), developed
content-filtering controls, analytics, and domain-list synchronization, and improved the existing
DNS-processing pipeline. Led 1 project and taught introductory programming courses.

## Volunteer

### Nonprofit information platform

volunteer lead software engineer · since 2024

I lead engineering for a production nonprofit information platform, owning its Django/DRF backend,
deployment, and observability. I work directly with users and a non-technical volunteer team, and
deliver Next.js features including a calendar and location-based search.

I built timezone-aware scheduling, hierarchy-aware delegated access, and consistent multilingual
search across TypeScript, Python, and PostgreSQL. Query optimization and profiling reduced p99
latency on a primary API path from about 15 seconds to 500 ms.

## Skills

- **backend**: Go, Java/Kotlin, Spring, Node.js, Bun, Python, Django, gRPC/Protobuf
- **frontend**: TypeScript, JavaScript, React, Next.js
- **data**: PostgreSQL, PostGIS, Redis, ClickHouse
- **messaging**: Kafka, RabbitMQ
- **platform**: Docker, Kubernetes, OpenTelemetry, Prometheus, Grafana
- **delivery**: GitLab CI, GitHub Actions, Testcontainers, Playwright, Ansible

## Projects

### voomy (independent product)

A pre-launch bilingual creator platform for video, subscriptions, paid access, discovery, community,
and moderation.

I own the domain model, architecture, implementation, CI, and operations. My wife leads product
vision, design, and user workflows; we make product decisions together.

[website](https://voomy.tv/product)

### vlt (TUI app)

A terminal interface for browsing and editing HashiCorp Vault KV v2 secrets.

[github](https://github.com/hu553in/vlt)

### Invites for Keycloak (web app)

A web app for Keycloak invitation links and user registration, with a Spring Boot backend.

[github](https://github.com/hu553in/invites-keycloak)

### Vrubel Museum exhibitions (interactive)

An interactive exhibition website for the Omsk M. A. Vrubel Museum of Fine Arts. Co-developed as a
graduation project using React and Vite.

[website](https://vrubel-museum-exhibitions.vercel.app) ·
[github](https://github.com/hu553in/vrubel-museum-exhibitions)

### Dota 2 schedule bot (telegram bot)

A Telegram bot for Dota 2 schedules, live matches, results, and favorites, hosted on Cloudflare.

[telegram](https://t.me/d2_schedule_bot) · [github](https://github.com/hu553in/dota2-schedule-bot)

### One Last Chance (iOS app)

An iPhone VPN client for olcRTC, configured through a single subscription URL.

[github](https://github.com/hu553in/one-last-chance)

### Telekilogram (telegram bot)

A Telegram bot written in Go for RSS, Atom, and JSON feed digests and channel summaries.

[telegram](https://t.me/hu553in_telekilogram_bot) ·
[github](https://github.com/hu553in/telekilogram)

### SPA crawler (CLI tool)

A CLI built with Playwright and Crawlee for mirroring single-page applications as static files.

[github](https://github.com/hu553in/spa-crawler)

### GitHub workflow dashboard (web dashboard)

A browser-only GitHub Actions workflow dashboard for multiple repositories.

[website](https://gh-workflow-dashboard.vercel.app) ·
[github](https://github.com/hu553in/gh-workflow-dashboard)

### Skills (agent workflows)

My collection of reusable agent skills.

[website](https://skills.sh/hu553in/skills) · [github](https://github.com/hu553in/skills)

### Tizen tool (CLI tool)

A Python CLI for building and signing Tizen TV packages using Tizen Studio in Docker.

[github](https://github.com/hu553in/tizen-tool)

### Grooming studio website (landing page)

A website for a pet grooming studio in Omsk, built with React and Vite.

[website](https://xn-----flcj2bnpjd0gcb.xn--p1ai) ·
[github](https://github.com/hu553in/grooming-studio)

### ASCII profile card (github action)

A GitHub Action that generates Neofetch-style SVG profile cards with daily ASCII art and live GitHub
stats.

[page](https://github.com/marketplace/actions/ascii-profile-card) ·
[github](https://github.com/hu553in/ascii-profile-card)

### shadcn registry (code registry)

A shadcn registry for sharing reusable code across projects.

[page](https://hu553in.dev/registry) ·
[github](https://github.com/hu553in/personal-website/tree/main/registry)

## Writing & speaking

### How we’re reducing divergence across Go services

How a shared Go platform library, a service template, and a dependency policy reduce cross-service
divergence during a backend migration.

[medium en](https://medium.com/qicdigitalhub/technical-debt-isnt-just-legacy-how-we-re-reducing-divergence-across-go-services-6225e55b15c1)
· [habr ru](https://habr.com/ru/articles/1056628)

### Designing a Real-World High-Scale Content Filtering System

A conference talk on architecture, caching, horizontal scaling, observability, and failure handling.

[youtube ru](https://www.youtube.com/watch?v=Xkidzosg02E)

## Interests

1. AI launches watched live, like season finales.
2. Open source that changes how I work.
3. Self-hosting, VPNs, and the hobbyist end of hacking.
4. Vibe coding sharp little utilities — most die young, and that’s fine.
5. Product design, especially the tiny details nobody asked me to polish.
6. [Borya the Welsh Corgi](/borya.jpg), voomy’s third founder.
7. An all-black Toyota Yaris and any excuse for a long drive.
8. Fashion — deeply loved, lazily practiced.
9. An unreasonable amount of time watching movies, series, and obscure Twitch streams — with my
   wife, always.

## Connect

- GitHub: [hu553in](https://github.com/hu553in)
- LinkedIn: [ruslan-khasanshin](https://www.linkedin.com/in/ruslan-khasanshin)
- Telegram: [rkhasanshin](https://t.me/rkhasanshin)
- Email: [r.m.khasanshin@gmail.com](mailto:r.m.khasanshin@gmail.com)

## Miscellany

### LinkedIn cover image (design tool)

Use my template to make your own LinkedIn cover image.

[page](https://hu553in.dev/linkedin-cover-image)

### Open Graph image (design tool)

Use my template to make your own Open Graph image.

[page](https://hu553in.dev/open-graph-image)
