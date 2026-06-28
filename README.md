# Personal website

The deployed version is available at [hu553in.su](https://hu553in.su).

## What it does

- Builds a Hugo personal website with the `hugo-coder` theme.
- Keeps the theme as a Git submodule.
- Deploys the generated site with Vercel Git integration.

## Requirements

- Hugo Extended 0.154.5
- Git with submodule support

## Setup

```bash
git submodule update --init --recursive
make run
```

## Development

- `make run` starts the local Hugo server.
- `make clean` removes the generated `public/` directory.
- `make all` runs `clean` and then starts the local server.

## Tech stack

- Hugo with the `hugo-coder` theme
- Vercel
