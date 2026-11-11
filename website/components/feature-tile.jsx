"use client";
import { AsciiBox } from "@/components/asciicn/ascii-box";
import { useFrameLoop } from "@/lib/ascii/motion";
import { useRef, useState } from "react";

const features = {
  blueprint: {
    title: "~/blueprint",
    secondsPerRow: 1.8,
    startRow: 0,
    rows: [
      ["├─", "smu.toml", "adapter"],
      ["├─", "dotfiles/", "your files"],
      ["└─", "modules/", "setup"],
    ],
  },
  modules: {
    title: "select modules",
    secondsPerRow: 1.15,
    startRow: 1,
    rows: [
      ["[+]", "base", "essentials"],
      ["[+]", "node/npm", "packages"],
      ["[+]", "neovim", "editor"],
    ],
  },
  plan: {
    title: "$ smu plan",
    secondsPerRow: 2.35,
    startRow: 2,
    rows: [
      ["›", "Adapter", "rcm"],
      ["›", "Module", "base"],
      ["✓", "Conflicts", "none"],
    ],
  },
};

export function FeatureTile({ feature }) {
  const scene = features[feature];
  const isPlan = feature === "plan";
  const target = useRef(null);
  const [active, setActive] = useState(-1);
  useFrameLoop(
    (time, delta) => {
      setActive(
        delta === 0
          ? -1
          : (Math.floor(time / scene.secondsPerRow) + scene.startRow) % scene.rows.length,
      );
    },
    { target, fps: 4 },
  );

  return (
    <div className="feature-ui" ref={target}>
      <AsciiBox
        title={scene.title}
        frame={isPlan ? "double" : "rounded"}
        padding={0.5}
        cell={12}
        color="--feature-frame"
        className="feature-box"
      >
        <div className="feature-rows">
          {scene.rows.map(([glyph, label, detail], index) => (
            <div className="feature-row" data-active={index === active} key={label}>
              <span className="feature-mark">
                {feature === "modules" ? (index === active ? "[✓]" : "[ ]") : glyph}
              </span>
              <span>{label}</span>
              <span className="feature-detail">{detail}</span>
            </div>
          ))}
        </div>
      </AsciiBox>
      <p className="feature-status">
        {isPlan ? "READ ONLY · NO FILES CHANGED" : "PLATFORM + SHARED MODULES"}
      </p>
    </div>
  );
}
