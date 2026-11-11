import { FIELD, COLOR_FIELD } from "smu-redwood-scene";
import { createShaderScene } from "./shader-scene.mjs";

export function createHeroLandscape(canvas) {
  return createShaderScene(canvas, {
    name: "redwood-light", field: FIELD, colorField: COLOR_FIELD,
    uniforms: { rwIntensity: 1, rwMistOn: 1, rwMotesOn: 1 },
    charset: "blocks", cell: 7, paper: "#060a08",
  });
}
