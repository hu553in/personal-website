# Ruslan Khasanshin

hu553in · senior software engineer — backend & full-stack

## About

I’m a backend-heavy software engineer with 9+ years of experience, working with Go, Java/Kotlin, and
TypeScript. I build services, product interfaces, and tools for other developers.

At work, that has meant launching insurance and travel backends and building shared observability
tools. I like working through unclear requirements and staying with a product after it ships.

## Work

### Resume

[pdf](/resume.pdf)

### QIC digital hub

senior backend engineer · since 2025 · [qic.digital](https://qic.digital)

I helped take QIC’s Go motor-insurance backend through a phased production launch and co-owned the
backend launch of QIC Travel. I developed observability tooling for 25 Go services and used it to
diagnose failed document deliveries and external policy registrations after payment, helping the
support team complete affected operations. I added outbox integration, retries, and alerts. Across
25 repositories, I introduced Renovate and vulnerability checks to replace months of dependency
drift with regular updates and fixes.

### Diabolocom

senior java developer · 2021–2025 · [diabolocom.com](https://diabolocom.com)

I built and operated 5 Java/Kotlin microservices for a cloud contact-center CRM, with on-call
responsibility, and spent 18 months as a hands-on tech lead in a 5-engineer team. I co-designed and
built a Go worker that synchronized access rules across service databases. I reduced a frequently
called API’s response time from about 800 ms to 150 ms by removing N+1 queries, fetching less data
from the database, and adding indexes. I also added 800–1,000 automated tests and independently
migrated legacy services to Spring Boot 3.

### 7bits

full-stack software engineer · 2017–2021 · [7bits.it](https://7bits.it)

I developed Java/Kotlin/Spring backends and React/TypeScript interfaces for a
[multi-tenant cybersecurity SaaS](https://7bits.it/portfolio/saas-security-solution), including
content filtering, analytics, domain-list synchronization, and improvements to its existing
DNS-processing pipeline. For an extended period I was the project’s sole developer, working directly
with the US client on requirements, priorities, and releases. I also taught a two-semester Spring
and React course to 20–30 students, with lectures, workshops, code reviews, and a final full-stack
project.

## Volunteer

### Nonprofit information platform

volunteer lead software engineer · since 2024

I lead engineering for a nonprofit platform with about 117K monthly unique users, helping people
facing serious health challenges find support. I own its Django/DRF backend, deployment, and
observability, and work directly with users and a non-technical volunteer team.

I built Next.js calendar and location-search features, timezone-aware scheduling, hierarchy-aware
delegated access, and multilingual search across TypeScript, Python, and PostgreSQL. Removing N+1
queries and optimizing SQL and geospatial lookups reduced a key API’s p99 latency from about 15
seconds to 500 ms.

I also replaced an old regional website by migrating its data into the platform and preserving old
links through redirects. I help new volunteers learn the architecture, review their code, and work
through their first tasks.

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

I'm the sole engineer, responsible for the domain model, architecture, frontend, backend, testing,
CI, and operations. My wife leads product vision, design, and user workflows; we make product
decisions together.

[website](https://voomy.tv/product)

### vlt (TUI app)

A terminal interface for browsing and editing HashiCorp Vault KV v2 secrets. Version checks prevent
edits from overwriting concurrent changes.

[github](https://github.com/hu553in/vlt)

### Invites for Keycloak (web app)

A web app for managing Keycloak invitations with expiry dates, usage limits, and predefined roles.
It handles invitations for a production admin panel with dozens of users.

[github](https://github.com/hu553in/invites-keycloak)

### Vrubel Museum exhibitions (interactive)

An interactive exhibition website for the Omsk M. A. Vrubel Museum of Fine Arts. Co-developed as a
graduation project in React and later migrated to Vite.

[website](https://vrubel-museum-exhibitions.vercel.app) ·
[github](https://github.com/hu553in/vrubel-museum-exhibitions)

### Dota 2 schedule bot (telegram bot)

A Telegram bot for Dota 2 schedules, live matches, results, and favorites, hosted on Cloudflare.

[telegram](https://t.me/d2_schedule_bot) · [github](https://github.com/hu553in/dota2-schedule-bot)

### One Last Chance (iOS app)

An iPhone VPN client with a Swift tunnel extension integrating olcRTC’s Go runtime. A single
subscription URL configures the connection. My family uses it to stay connected on restricted
networks.

[github](https://github.com/hu553in/one-last-chance)

### Telekilogram (telegram bot)

A Telegram bot written in Go that I use daily for RSS, Atom, and JSON feed digests and channel
summaries.

[telegram](https://t.me/hu553in_telekilogram_bot) ·
[github](https://github.com/hu553in/telekilogram)

### SPA crawler (CLI tool)

A CLI built with Playwright and Crawlee for mirroring single-page applications as static files.

[github](https://github.com/hu553in/spa-crawler)

### GitHub workflow dashboard (web dashboard)

A browser-only dashboard I use to monitor GitHub Actions workflows across my repositories.

[website](https://gh-workflow-dashboard.vercel.app) ·
[github](https://github.com/hu553in/gh-workflow-dashboard)

### Skills (agent workflows)

My collection of reusable agent skills.

[website](https://skills.sh/hu553in/skills) · [github](https://github.com/hu553in/skills)

### Tizen tool (CLI tool)

A Python CLI for building, signing, and installing Tizen TV packages through Dockerized Tizen
Studio.

[github](https://github.com/hu553in/tizen-tool)

### Grooming studio website (landing page)

A website for a pet grooming studio in Omsk, built with React and Vite.

[website](https://xn-----flcj2bnpjd0gcb.xn--p1ai) ·
[github](https://github.com/hu553in/grooming-studio)

### ASCII profile card (github action)

A GitHub Action that generates Neofetch-style SVG profile cards with daily ASCII art and GitHub
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

A talk about the cybersecurity system I worked on at 7bits, covering architecture, scaling, and
failure handling.

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
