import type { AsciiGridDrawContext } from "@/lib/ascii/grid";
import type { Frame, Meta } from "@/vendor/ascii-rest/types";
import { cellWidth } from "@/vendor/ascii-rest/width";

/** Bridge ascii.rest's text and palette frames into asciicn's native glyph grid. */
export function createRestDraw(
  render: Frame,
  meta: Meta,
  { contain = false, paper = false } = {},
) {
  const colors = meta.palette ? new Uint8Array(meta.cols * meta.rows) : undefined;
  const palette = meta.palette?.map((hex) =>
    [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)),
  );
  const glyphs = Array.from({ length: meta.cols * meta.rows }, () => " ");
  const indices = new Uint8Array(glyphs.length);

  return ({ frame, columns, rows, time, metrics }: AsciiGridDrawContext) => {
    glyphs.fill(" ");
    colors?.fill(0);
    const lines = render(time, { paper, color: colors }).split("\n");
    for (let y = 0; y < Math.min(lines.length, meta.rows); y++) {
      let x = 0;
      let position = 0;
      for (const glyph of lines[y]) {
        const width = cellWidth(glyph.codePointAt(0)!);
        if (x >= meta.cols) break;
        const index = y * meta.cols + x;
        glyphs[index] = glyph;
        indices[index] = colors?.[y * meta.cols + position] ?? 0;
        x += width;
        position++;
      }
    }

    // Fit in physical pixels, so square landscapes and tall text cells retain their proportions.
    const sourceWidth = meta.cols;
    const sourceHeight = meta.rows * (meta.cell ?? 2);
    const width = columns * metrics.width;
    const height = rows * metrics.height;
    const scale = (contain ? Math.min : Math.max)(width / sourceWidth, height / sourceHeight);
    const left = (width - sourceWidth * scale) / 2;
    const top = (height - sourceHeight * scale) / 2;
    for (let y = 0; y < rows; y++) {
      const sy = Math.floor(((y + 0.5) * metrics.height - top) / (scale * (meta.cell ?? 2)));
      if (sy < 0 || sy >= meta.rows) continue;
      for (let x = 0; x < columns; x++) {
        const sx = Math.floor(((x + 0.5) * metrics.width - left) / scale);
        if (sx < 0 || sx >= meta.cols) continue;
        const index = sy * meta.cols + sx;
        const color = palette?.[indices[index]];
        frame.put(x, y, glyphs[index], color ? [color[0], color[1], color[2]] : undefined);
      }
    }
  };
}
