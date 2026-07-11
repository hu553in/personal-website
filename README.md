# personal-website

[![CI](https://github.com/hu553in/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/hu553in/personal-website/actions/workflows/ci.yml)

Personal website of Ruslan Khasanshin (hu553in), live at [hu553in.su](https://hu553in.su).

## What it does

- Renders a single-page profile: about, work, stack, projects, publications, interests, and contacts.
- Keeps all content in one data module, so copy changes never touch markup.
- Supports light and dark themes with a system default, a manual toggle, and a GIF-masked View Transitions animation on switch.
- Ships SEO and AEO surfaces: Open Graph banner, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`, and a Markdown twin of the page served through content negotiation.

## Requirements

- Bun 1.3.14

## Setup

```bash
bun install
bun dev
```

## Configuration

There is no runtime configuration. All content, metadata, and theme colors live in `src/app/data.tsx`.

## Development

- `bun dev` starts the Next.js development server.
- `bun build` runs a production build.
- `bun start` serves the production build.
- `bun check` runs the formatter, linter, and TypeScript checks.
- `bun check:fix` runs the same gate with formatter and linter fixes.

## Tech stack

- Next.js with React and the React Compiler
- Tailwind CSS
- next-themes for theme switching
- react-icons for brand icons
- Bun, Ultracite (Oxlint + Oxfmt), Lefthook, and commitlint for tooling

## Resources

- [Production site](https://hu553in.su)
- [Markdown version](https://hu553in.su/index.md)
