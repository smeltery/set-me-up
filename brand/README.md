# set-me-up brand kit

**Your setup, repeatable.**

set-me-up is a modular framework for managing dotfiles and system setup. Keep
your configuration in a version-controlled blueprint, then use `smu` to apply
the modules a machine needs.

## Logo

| Asset | Where to use it |
| --- | --- |
| [Light-background lockup](logo-light.svg) | Light docs, READMEs, and slides |
| [Dark-background lockup](logo-dark.svg) | Dark docs, banners, and slides |
| [Square mark](mark.svg) | Avatars, favicons, and compact placements |
| [Social preview](social-card.png) | 1280 × 640 README header and link preview |
| [Social preview source](social-card.svg) | Editable artwork |

The mark pairs a terminal prompt with a chamfered cursor. The cursor repeats
the prompt's angled edge, a small nod to how modules fit into a setup. The
wordmark is drawn as vectors, so it renders without a font install.

- Give the lockup clear space of at least one quarter of its tile width,
  measured from the visible artwork.
- Keep the lockup at least 180 px wide on screen. Use the square mark for
  smaller placements down to 16 px.
- Use the light-background lockup on Frost and the dark-background lockup on
  Ink or Cobalt.

## README header and social preview

The root README uses the same PNG as the GitHub social preview. Edit the
ASCII landscape or text in `social-card.svg`, then export the PNG from the
repository root with librsvg installed.

```bash
rsvg-convert --output brand/social-card.png brand/social-card.svg
```

Upload the new PNG under **Settings → Social preview** when the card changes.
GitHub stores this image separately from the README.
[GitHub social preview guide][github-preview]

[github-preview]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview

## Color

| Color | Hex | Role |
| --- | --- | --- |
| Ink | `#111A3A` | Dark surfaces and primary text on Frost |
| Frost | `#F7F9FF` | Light surfaces and primary text on Ink or Cobalt |
| Cobalt | `#3046B4` | Brand surface and links on Frost |
| Ice | `#CCD7FF` | Highlights and secondary text on Ink or Cobalt |
| Slate | `#4C5C84` | Secondary text on Frost |

Use Ink on Frost for long-form reading. Underline Cobalt links in running copy.

## Typography and ASCII

- **Headlines and prose** use the platform system sans. Use bold headlines
  and regular-weight body copy. On the web, use
  `system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Commands, paths, and ASCII artwork** use JetBrains Mono when available.
  The fallback stack is `ui-monospace, Menlo, Consolas, monospace`.
- **Use `>_` as the plain-text mark.** Use the [ASCII blueprint](blueprint.txt)
  in terminal and README artwork. Preserve spaces and line breaks in a code
  block. If you render the artwork as an image, describe the setup in alt text.

## Naming and voice

- Write **set-me-up** in lowercase with hyphens, including in headings.
- Write `smu` for the command. Use **blueprint** for the repository that
  defines a setup and **module** for a unit of configuration.
- Lead with what a command does. Where a step changes system state, say what
  it applies or updates. Put review or preview steps before apply steps.
- Keep platform claims specific. Modules and provisioning adapters can vary
  by operating system.

The short description is “A modular framework for managing dotfiles and
system setup.” For a longer introduction, use “Define your setup in a
blueprint, then use `smu` to apply the modules each machine needs.”
