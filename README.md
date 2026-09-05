# Personal website

[![CI](https://github.com/hu553in/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/hu553in/personal-website/actions/workflows/ci.yml)

Personal website of Ruslan Khasanshin (hu553in).

Live at [hu553in.su](https://hu553in.su).

## What it does

- Renders a single-page profile: about, work, volunteering, skills, projects, writing and speaking,
  interests, and contacts
- Publishes a shadcn registry with demos and install instructions
- Includes an editable LinkedIn cover image with 1× and 2× PNG downloads
- Keeps rendered content in shared data and mirrors public pages in Markdown
- Supports light and dark themes with a system default, a manual toggle, a `d` shortcut, and a
  GIF-masked View Transitions animation on switch
- Ships SEO and AEO surfaces: Open Graph banner, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`,
  an `llms-full.txt` redirect, and Markdown twins advertised through HTML and HTTP alternate links

## Requirements

- Bun
- shfmt, for local checks
- uv, only when rebuilding Open Graph fonts

## Setup

```bash
bun i
bun dev
```

## Configuration

There is no runtime configuration. Shared site identity and metadata live in `app/site-data.ts`;
page content lives in `app/data.tsx`; component docs live with their demos. Styles and CSS theme
tokens live in `app/globals.css`.

## Development

```bash
bun dev             # Development server
bun run build       # Production build
bun build:og-fonts  # Rebuild Open Graph fonts
bun build:registry  # shadcn registry build
bun start           # Production server
bun check           # Full local gate
bun check:fix       # Full local gate with automatic fixes
```

## Tech stack

- Next.js with React and the React Compiler
- Tailwind CSS
- shadcn and Shiki for the component registry
- next-themes and react-hotkeys-hook for theme switching
- react-icons for brand icons
- Bun, Ultracite (Oxlint + Oxfmt), Knip, Lefthook, and commitlint for tooling

## Resources

- [Production site](https://hu553in.su)
- [Markdown version](https://hu553in.su/index.md)
- [shadcn registry](https://hu553in.su/registry)
- [shadcn registry Markdown version](https://hu553in.su/registry.md)
- [shadcn registry MIT license](registry/LICENSE)
- [LinkedIn cover image](https://hu553in.su/linkedin-cover-image)
- [LinkedIn cover image Markdown version](https://hu553in.su/linkedin-cover-image.md)
