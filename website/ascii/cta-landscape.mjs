import { FIELD, COLOR_FIELD } from "smu-ember-scene";
import { createShaderScene } from "./shader-scene.mjs";

const charsets = ["blocks", "standard", "petscii"];

export function createCtaLandscape(canvas, options = {}) {
  const charset = options.charset ?? charsets[crypto.getRandomValues(new Uint32Array(1))[0] % charsets.length];
  return createShaderScene(canvas, {
    name: "ember", field: FIELD, colorField: COLOR_FIELD,
    uniforms: { emHeight: .48, emPacked: 0, emSparks: .4, emWind: .15 },
    charset, cell: 8, paper: "#0a1510",
    palette: ["0a1510", "142b20", "f9d9a0", "ef9b53"],
  });
}
