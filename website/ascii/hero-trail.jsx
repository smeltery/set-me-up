import { createRoot } from "react-dom/client";
import { GlyphTrail } from "@/components/asciicn/glyph-trail";

export function mountHeroTrail(container) {
  const root = createRoot(container);
  return {
    setRunning(running) {
      root.render(
        <GlyphTrail colorMode="duotone" ramp={["#102018", "#4a6542", "#b4bf85", "#e4e6bc"]} background="transparent"
          charset="standard" idle={false} decay={1.8} spread={1.1} cell={12}
          fps={30} animate={running} style={{ width: "100%", height: "100%" }} />,
      );
      container.dataset.ready = "";
    },
  };
}
