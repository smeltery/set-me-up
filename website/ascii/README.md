# ASCII artwork

The hero uses asciicn's [Redwood
Light](https://asciicn.dev/docs/landscapes/redwood-light)
with blocks, truecolor, intensity 1, mist and motes enabled, 7px square
cells, and continuous animation. A subtle pointer-driven Glyph Trail uses
forest and pale canopy colors. The trail is disabled on touch-only devices and
under reduced motion.

The CTA uses asciicn's [Ember](https://asciicn.dev/docs/fields/ember) field
with copper, amber, and pale-gold highlights over forest shadows.
It chooses blocks, standard, or PETSCII once per page load. Its static
fallback uses blocks. The footer now uses ascii.rest's Misty Forest, Jungle
Falls, and Alpine Dawn, retaining 85% of their native colors with a 15% forest
tint. See the
[marketing README](../README.md#asciirest-integration) for the pinned bundle
and regeneration command. Scenes pause off screen and in hidden tabs;
reduced motion draws a still frame.

The second CTA uses asciicn’s [Black
Hole](https://asciicn.dev/docs/scenes/black-hole)
shader with its warm tint enabled for an amber and copper accretion ring. Its
disk is animated while visible,
and a fixed SVG frame remains available without WebGL.

The setup lab plays examples in its
[Terminal Window](https://asciicn.dev/docs/interface/terminal-window).
The hero and footer use the same Terminal Window with static content.
The asset generator adds a slot for the existing platform tabs and
copy controls while preserving the lab's scripted playback.

The marketing 404 page uses the actual asciicn [Not
Found](https://asciicn.dev/docs/interface/not-found)
component from the same pinned revision, with animated Braille grains, a
terminal
that echoes the missing path, and canopy accents. A guarded source adapter
adds moss-to-fern-to-canopy lighting across the digits while retaining upstream
erosion and drifting grains. It honors reduced motion and
hidden tabs. The HTML keeps a readable fallback and recovery links without
JavaScript.
The independent docs site reuses this bundle and the generated stylesheet. After
regenerating, run `python3 website/ascii/sync-docs.py` from the root to refresh
`docs/site/public/asciicn/`. Both adapters share the same scene and palette.
The Next.js app imports the scene components directly. The archived preview
server and static host
serve that page with HTTP 404 for unknown paths.

## Regenerate

Use Node.js 24 or newer, `tar`, and esbuild 0.25.9. From the repository
root, run:

```sh
npm ci --prefix website/ascii
node website/ascii/render.mjs
node website/ascii/render.mjs --check
python3 website/build.py
```

The generator downloads a pinned upstream source archive, checks its
SHA-256, and loads the engine from a temporary directory. Set
`ASCIICN_ARCHIVE` to the path of a previously downloaded copy of that
archive to render offline. The `--check` command compares the generated
SVGs, scene renderers, and terminal assets byte for byte.

## Make a new variation

- Edit `hero-landscape.mjs`, `cta-landscape.mjs`, and `footer-landscape.mjs`
  to adjust the scenes. `shader-scene.mjs` shares GPU rendering and capture.
  They animate in view and honor reduced motion. Each renderer's
  `capture()` method returns its glyph grid and colors.
- Edit `hero-trail.jsx` to tune the pointer trail's ramp, glyphs, decay,
  and spread. `site/art-motion.js` controls lazy loading and visibility.
- Edit `footer-landscape.mjs` to change the Nebula seed, its forest/canopy
  palette, charset choices, exposure, and drift. Redwood Light and Ember
  keep their native shaders.
- The stills record the 12-second frame at 1440 × 760 for the hero and
  1440 × 440 for the CTA, and a 12-second frame at 1440 × 560 for the footer.
  Each JSON file stores the grid dimensions,
  a string of glyphs in row order, and one palette index per glyph.
  Regenerate the SVGs after replacing those captures.
- Edit `orbit-landscape.mjs` for the Black Hole’s viewing angle, disk,
  and colors. `orbit-still.json` records its 12-second frame at 900 × 600.
- Recapture `cta-still.json` with `charset: "blocks"` to refresh the Ember
  fallback. The generator exports it as `cta-glyphs.svg`.
- Edit `feature-tiles.jsx` for the How it works examples. Each uses an
  asciicn ASCII Box around a file tree, module list, or plan summary.
  A highlight moves through the rows while the example is visible.
  The HTML provides a still fallback before the components load.
- Edit `smooth-scroll.mjs` for the Lenis scrolling behavior. The generator
  bundles the pinned dependency and its stylesheet with the scene assets.
- Edit `lab-terminal.jsx` to change the lab's scripted terminal playback.
  The adapter reads the pinned component's accessible playback control to
  advance only after the terminal finishes. `site/site.js` manages result
  holds, pause/resume, viewport visibility, and reduced motion.
- `lab-machine.jsx` retains the Retro Computer and Server Rack scene recipes
  for reuse. The focused setup lab uses the terminal without a separate scene.
  `lab-art.mjs` generates the retained relay station SVG asset.
- Use [asciicn Studio](https://asciicn.dev/studio) to try glyph sets and
  palettes. Record the source and settings in a recipe so edits can be
  regenerated. The finished SVGs can be reused on the docs site and as
  layers in social artwork.

The upstream engine is [MIT
licensed](https://github.com/opencoredev/asciicn/blob/d5592fc980cad39578f13b16f6e015404160669b/LICENSE).

The docs navigation also shares `partials/header.html`, `site/shell.css`, and
`site/navigation.js`. The sync script copies their docs adapters and minifies
the navigation stylesheet with esbuild. The docs build adds links to its
current content pages. Keep the generated `public/asciicn/` files in the docs
checkout so its deployments do not depend on the coordinator checkout.

## Next.js application

The current site imports the pinned React scenes directly in
`components/landscape.jsx` and uses the shared docs UI. The adapters and
export recipes here remain reproducible references and fallback asset
generators.
Platform logos use their native ascii.rest palettes, including Debian red,
Ubuntu orange, Arch blue, and Nix blue. Landscape colors receive a light forest
tint. The actual selected ascii.rest sources are vendored with their MIT license
in `../vendor/ascii-rest/`.
