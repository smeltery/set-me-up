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
- Use the light-background lockup on Cream and the dark-background lockup on
  Forest Ink or Moss.

## README header and social preview

The root README and marketing link previews use the same 1280 × 640 PNG.
The backdrop is the hero’s actual asciicn Redwood Light still, with blocks,
truecolor, mist, motes, and 7 px square cells. Its pinned source and capture
settings live in [the ASCII recipes](../website/ascii/README.md).

Edit the copy and overlays in `social-card-template.svg`, then regenerate
from the repository root with Python and librsvg installed:

```bash
python3 brand/render.py
python3 website/build.py
```

`render.py` embeds `website/site/hero-glyphs.svg` in the editable social SVG
and exports the PNG. After updating the shared preview, synchronize the
separate docs checkout when it is present:

```bash
cp brand/social-card.png docs/site/public/og.png
```

Upload the new PNG under **Settings → Social preview** when the card changes.
GitHub stores this image separately from the README.
[GitHub social preview guide][github-preview]

[github-preview]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview

## Color

| Color | Hex | Role |
| --- | --- | --- |
| Forest Ink | `#14231B` | Primary text and dark brand surfaces |
| Cream | `#F7F6EF` | Reading surfaces and text on dark backgrounds |
| Moss | `#456449` | Primary actions and links |
| Canopy | `#D7DFB2` | Pale highlights and primary actions on dark backgrounds |
| Mist | `#DBE2C5` | Secondary text and subtle highlights |
| Slate | `#586750` | Secondary text on Cream |
| Forest Night | `#0A1510` | Artwork backdrops |

Use Forest Ink on Cream for long-form reading. Use Moss for links and
Canopy for highlights on dark surfaces. The website, documentation, logos,
and social previews share this Redwood Light palette; avoid orange UI accents.
Keep the forest artwork’s native lighting and bark colors.

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
