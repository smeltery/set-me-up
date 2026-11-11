import { FIELD, COLOR_FIELD } from "smu-black-hole-scene";
import { createShaderScene } from "./shader-scene.mjs";

export function createOrbitLandscape(canvas) {
  return createShaderScene(canvas, {
    name: "black-hole", field: FIELD, colorField: COLOR_FIELD,
    uniforms: {
      bhBeaming: 2.5, bhCellRows: 1, bhOnLight: 0, bhOuter: 10,
      bhPacked: 0, bhScale: .95, bhShowStars: 1,
      bhTilt: 8 * Math.PI / 180, bhWarmTint: 1,
    },
    charset: "standard", cell: 9, paper: "#0a1510",
    palette: ["c27a49", "ffe1a6"],
  });
}
