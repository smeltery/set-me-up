# set-me-up website

[![CI](https://github.com/smeltery/set-me-up/actions/workflows/website.yml/badge.svg)](https://github.com/smeltery/set-me-up/actions/workflows/website.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-149eca)](https://react.dev/)
[![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1)](https://bun.sh/)
[![Flox](https://img.shields.io/badge/environment-Flox-99c33c)](https://flox.dev/)
[![License](https://img.shields.io/badge/license-PolyForm_Shield-456449)](LICENSE)

The marketing site for set-me-up: repeatable machine setup from a blueprint
repository. It combines an interactive setup walkthrough, searchable guides,
and animated ASCII scenes with accessible light and dark themes.

```sh
cd website
flox activate
bun install --frozen-lockfile
bun run dev
```

Open <http://127.0.0.1:4175>. Fast Refresh updates the preview as you edit.
Run `bun run ci` before pushing; it is the same gate used in CI and pre-commit.

See [docs/](docs/README.md) for architecture, artwork, development, and delivery.
For product setup, use the [published documentation](https://set-me-up-docs.vercel.app/docs).
