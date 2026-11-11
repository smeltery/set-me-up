import { seedField } from "@/lib/ascii/seed";
import { createShaderScene } from "./shader-scene.mjs";

const scene = seedField("set-me-up-forest-mist", "nebula", {
  hue: [120, 145],
  turn: [-18, 8],
  vividness: .55,
  intensity: .8,
  nebula: { stars: [0, 0], drift: [.035, .055] },
});

const charsets = ["blocks", "standard", "petscii"];
const rgb = hex => hex.match(/../g).map(byte => parseInt(byte, 16) / 255);
const uniforms = {
  ...scene.uniforms,
  seedDark0: rgb("14291d"),
  seedDark1: rgb("426047"),
  seedDark2: rgb("819267"),
  seedDark3: rgb("d8dba8"),
};

export function createFooterLandscape(canvas, options = {}) {
  const charset = options.charset ?? charsets[crypto.getRandomValues(new Uint32Array(1))[0] % charsets.length];
  return createShaderScene(canvas, {
    name: "forest-nebula",
    field: scene.field,
    colorField: scene.colorField,
    uniforms,
    charset, cell: 8, paper: "#0a1510",
  });
}
