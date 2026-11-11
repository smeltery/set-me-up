import { getGlyphAtlas, atlasRampPositions } from "@/lib/ascii/atlas";
import { resolveCharset } from "@/lib/ascii/charsets";
import { createAsciiRenderer, createFrameInput, uniformSpecs } from "@/lib/ascii/gpu";
import { measureCell, gridSize } from "@/lib/ascii/measure";
const rgb = hex => hex.replace("#", "").match(/../g).map(byte => parseInt(byte, 16) / 255);

export function createShaderScene(canvas, settings) {
  const { field, colorField, uniforms, paper, charset: charsetName } = settings;
  const palette = settings.palette?.map(color => [...rgb(color), 1]);
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
  if (!gl) return null;
  let renderer = createAsciiRenderer(gl);
  if (!renderer) return null;

  if (!renderer.setField({ field, colorField, specs: uniformSpecs(uniforms) })) {
    renderer.dispose();
    return null;
  }
  const charset = resolveCharset(charsetName);
  const input = createFrameInput();
  input.colorMode = 1;
  input.paper.set([...rgb(paper), 1]);
  input.uniforms = uniforms;
  input.time = 12;
  if (palette) {
    input.stopCount = palette.length;
    palette.forEach((color, index) => input.stops.set(color.slice(0, 3), index * 3));
  }
  canvas.dataset.scene = settings.name;
  canvas.dataset.charset = charsetName;
  renderer.setMatrix(null);
  if (palette) renderer.setPalette(palette);
  let running = false;
  let frame = 0;
  let previous;
  let needsLayout = true;
  let dpr;
  let lost = false;

  function draw() {
    if (lost) return;
    if (needsLayout || dpr !== window.devicePixelRatio) {
      dpr = window.devicePixelRatio;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(dpr || 1, 2);
      const metrics = measureCell({ cell: settings.cell ?? 7, dpr: ratio, square: true });
      const atlas = getGlyphAtlas({ glyphs: charset.glyphs, metrics });
      renderer.setAtlas(atlas, {
        kind: 0,
        count: charset.glyphs.length,
        grid: charset.grid,
        positions: atlasRampPositions(atlas, charset.glyphs.length),
      });
      const { columns, rows } = gridSize(metrics, width, height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      renderer.resize({
        columns, rows, canvasWidth: canvas.width, canvasHeight: canvas.height, dpr: ratio,
      });
      needsLayout = false;
    }
    input.frame += 1;
    renderer.draw(input);
    canvas.dataset.ready = "true";
  }

  function tick(timestamp) {
    if (previous === undefined || timestamp - previous >= 32) {
      input.delta = previous === undefined ? 0 : (timestamp - previous) / 1000;
      input.time += input.delta;
      previous = timestamp;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  new ResizeObserver(() => {
    needsLayout = true;
    if (!running && canvas.clientWidth && canvas.clientHeight) draw();
  }).observe(canvas);

  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    lost = true;
    delete canvas.dataset.ready;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    renderer = createAsciiRenderer(gl);
    if (!renderer?.setField({ field, colorField, specs: uniformSpecs(uniforms) })) {
      renderer?.dispose();
      return;
    }
    lost = false;
    renderer.setMatrix(null);
    if (palette) renderer.setPalette(palette);
    needsLayout = true;
    previous = undefined;
    draw();
    if (running) frame = requestAnimationFrame(tick);
  });

  draw();
  return {
    setRunning(active) {
      running = active;
      if (active && !frame && !lost) frame = requestAnimationFrame(tick);
      if (!active) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = undefined;
      }
    },
    capture() {
      const cells = renderer.readCells();
      if (!cells) return null;
      return {
        columns: cells.columns,
        rows: cells.rows,
        glyphs: Array.from(cells.slots, slot => charset.glyphs[slot] ?? " "),
        colors: Array.from(cells.colors),
      };
    },
  };
}
