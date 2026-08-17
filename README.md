# Personal website

[![CI](https://github.com/hu553in/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/hu553in/personal-website/actions/workflows/ci.yml)

Personal website of Ruslan Khasanshin (hu553in).

Live at [hu553in.su](https://hu553in.su).

## What it does

- Renders a single-page profile: about, work, volunteering, skills, projects, writing and speaking,
  interests, and contacts
- Keeps rendered page content in one data module and mirrors it in a public Markdown version
- Supports light and dark themes with a system default, a manual toggle, and a GIF-masked View
  Transitions animation on switch
- Ships SEO and AEO surfaces: Open Graph banner, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`,
  an `llms-full.txt` redirect, and a Markdown twin advertised through HTML and HTTP alternate links

## Requirements

- Bun

## Setup

```bash
bun i
bun dev
```

## Configuration

There is no runtime configuration. Page content and metadata live in `app/data.tsx`; styles and CSS
theme tokens live in `app/globals.css`.

## Development

```bash
bun dev        # Development server
bun run build  # Production build
bun start      # Production server
bun check      # Full local gate
bun check:fix  # Full local gate with automatic fixes
```

## Tech stack

- Next.js with React and the React Compiler
- Tailwind CSS
- next-themes for theme switching
- react-icons for brand icons
- Bun, Ultracite (Oxlint + Oxfmt), Knip, Lefthook, and commitlint for tooling

## Resources

- [Production site](https://hu553in.su)
- [Markdown version](https://hu553in.su/index.md)
