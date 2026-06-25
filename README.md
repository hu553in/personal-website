# Personal website

[![CI](https://github.com/hu553in/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/hu553in/personal-website/actions/workflows/ci.yml)

The deployed version is available on GitHub Pages: [hu553in.su](https://hu553in.su).

## Local development

### Prerequisites

- Hugo Extended
- Git

```bash
git submodule update --init --recursive
make run
```

## Commands

- `make run` starts the local Hugo server.
- `make clean` removes the generated `public/` directory.
- `make all` runs `clean` and then starts the local server.

## Tech stack

- Hugo with the `hugo-coder` theme
- GitHub Pages
