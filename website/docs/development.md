# Development

## Reproducible tools

From `website/`, run `flox activate`. The checked-in Flox manifest and lock
provide Bun, Node 24, Python, Git, GitHub CLI, actionlint, ShellCheck, and
pre-commit. This is also the environment CI activates. Then install dependencies
with `bun install --frozen-lockfile`.

Use `flox activate --start-services` to manage the preview as a Flox service,
or `bun run dev` for a foreground server. The default URL is
<http://127.0.0.1:4175>; Next.js provides live reload and React Fast Refresh.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run check` | Lint, Markdown, Mermaid, LOC, integrity, types, and tests |
| `bun run ci` | All checks and the production build |
| `bun run build` | Produce the production Next.js application |
| `bun run start` | Serve the production build |

## Configuration

Set `SITE_URL` to the public marketing origin and `DOCS_URL` to the separate
documentation origin. For local docs, run
`DOCS_URL=http://127.0.0.1:4787 bun run dev`. Keep private values in ignored
`.env.local` files; never commit credentials.

The Vercel project uses `website` as its root directory. `vercel.json` selects
the Next.js preset and a frozen Bun install. Deploy the Next.js server build,
not the retained `site/` or `dist/` migration output.
