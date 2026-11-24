# Personal website

[![CI](https://github.com/hu553in/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/hu553in/personal-website/actions/workflows/ci.yml)

Personal website of Ruslan Khasanshin (hu553in).

Live at [hu553in.dev](https://hu553in.dev).

## What it does

- Renders a single-page profile: about, work, volunteering, skills, projects, writing and speaking,
  interests, and contacts
- Publishes a shadcn registry with demos and install instructions
- Includes an editable LinkedIn cover image with 1× and 2× PNG downloads
- Includes an Open Graph image editor using the site's OG template, with 1200 × 630 PNG downloads
- Offers optional interaction sounds, off by default, with a saved preference
- Keeps rendered content in shared data and mirrors public pages in Markdown
- Serves the design rules as-is at `/DESIGN.md`
- Supports light and dark themes with a system default, a manual toggle, a `d` shortcut, and a
  GIF-masked View Transitions animation on switch
- Ships SEO and AEO surfaces: Open Graph banner, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`,
  an `llms-full.txt` redirect, and Markdown twins advertised through HTML and HTTP alternate links

Page navigation highlights the current section and reveals "back to top" after the header. Short
trailing sections remain selectable in both scroll directions. URL fragments change only on explicit
navigation; ordinary scrolling preserves the current address.

## Requirements

- Bun
- Node.js in the range declared in `package.json`
- shfmt, for local checks
- uv, only when rebuilding Open Graph fonts

## Setup

```bash
bun ci
bun dev
```

## Configuration

Shared site identity and metadata live in `app/site-data.ts`; page content lives in `app/data.tsx`;
component docs live with their demos. Styles and CSS theme tokens live in `app/globals.css`.

## Development

```bash
bun dev             # Development server
bun run build       # Production build
bun build:og-fonts  # Rebuild Open Graph fonts
bun build:registry  # shadcn registry build
bun start           # Preview the built Worker locally
bun check:all       # Full local gate
bun check:fix       # Full local gate with automatic fixes
```

`bun check:e2e` installs Chromium, builds the production app, and checks navigation and the registry
on an isolated server at port 3028. It is included in the full gate. Failure screenshots and traces
are saved in `test-results/` and uploaded by CI.

To test an existing production build, run `bun playwright test --project chromium`. For all three
browsers, run `bun playwright install firefox webkit` after `bun playwright:install`, then
`bun playwright test`.

## Deployment

The `personal-website` Worker uses Cloudflare Workers Builds with the GitHub `main` branch.

- Build command `bun run build`. This generates the shadcn registry before `cf build`.
- Deploy command `npx cf deploy --prebuilt`.

For a manual deployment from an authenticated checkout, run `bun ci` and then `bun run deploy`.

## Tech stack

- vinext on Cloudflare Workers with React and the React Compiler
- Tailwind CSS
- shadcn and Shiki for the component registry
- next-themes and react-hotkeys-hook for theme switching
- react-icons for brand icons
- Bun fmt, Oxlint with Ultracite rules, Knip, Lefthook, and commitlint for tooling

## Resources

- [Production site](https://hu553in.dev)
- [Markdown version](https://hu553in.dev/index.md)
- [shadcn registry](https://hu553in.dev/registry)
- [shadcn registry Markdown version](https://hu553in.dev/registry.md)
- [shadcn registry MIT license](registry/LICENSE)
- [LinkedIn cover image](https://hu553in.dev/linkedin-cover-image)
- [LinkedIn cover image Markdown version](https://hu553in.dev/linkedin-cover-image.md)
- [Open Graph image](https://hu553in.dev/open-graph-image)
- [Open Graph image Markdown version](https://hu553in.dev/open-graph-image.md)
- [Design rules](https://hu553in.dev/DESIGN.md)
