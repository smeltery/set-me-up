"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { SetupPanel } from "@/components/setup-panel";
import { AsciiGrid } from "@/lib/ascii/grid";
import { createRestDraw } from "@/lib/ascii-rest-frame";

const pieces = {
  apple: () => import("@/vendor/ascii-rest/pieces/apple"),
  debian: () => import("@/vendor/ascii-rest/pieces/debian"),
  ubuntu: () => import("@/vendor/ascii-rest/pieces/ubuntu"),
  "arch-linux": () => import("@/vendor/ascii-rest/pieces/arch-linux"),
  nixos: () => import("@/vendor/ascii-rest/pieces/nixos"),
  "file-tree": () => import("@/vendor/ascii-rest/pieces/file-tree"),
  "jungle-falls": () => import("@/vendor/ascii-rest/pieces/jungle-falls"),
  "misty-forest": () => import("@/vendor/ascii-rest/pieces/misty-forest"),
  "alpine-dawn": () => import("@/vendor/ascii-rest/pieces/alpine-dawn"),
};

// Lift native hues on dark surfaces without replacing their recognizable colors.
function logoColor(hex, theme) {
  if (theme !== "dark") return hex;
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.65 + 255 * 0.35)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function RestArt({ piece, logo = false, className = "", ...props }) {
  const element = useRef(null);
  const { resolvedTheme } = useTheme();
  const [failed, setFailed] = useState(false);
  const [scene, setScene] = useState(null);
  const [cell, setCell] = useState(6);
  useEffect(() => {
    let stopped = false;
    setScene(null);
    setFailed(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        pieces[piece]()
          .then((source) => {
            if (stopped) return;
            const artwork = {
              ...source,
              meta: {
                ...source.meta,
                ground: logo
                  ? undefined
                  : piece === "file-tree"
                    ? getComputedStyle(element.current).getPropertyValue("--code").trim()
                    : source.meta.ground,
                palette: source.meta.palette?.map((hex) =>
                  logo ? logoColor(hex, resolvedTheme) : hex,
                ),
              },
            };
            const options =
              piece === "file-tree"
                ? {
                    root: "~/blueprint",
                    entries:
                      "smu.toml\ndotfiles/\n  rcrc\n  modules/\n    example/\n      install.sh\n  tag-work/\n    gitconfig\nREADME.md",
                  }
                : {};
            if (piece === "file-tree") {
              artwork.meta.rows = 11;
              artwork.default = (options) => {
                const frame = source.default(options);
                return (time, environment) =>
                  frame(time, environment).split("\n").slice(0, 11).join("\n").trimEnd();
              };
            }
            const draw = createRestDraw(artwork.default(options), artwork.meta, {
              contain: logo || piece === "file-tree",
              paper: resolvedTheme !== "dark" && (logo || piece === "file-tree"),
            });
            setScene({ meta: artwork.meta, draw });
          })
          .catch((error) => {
            console.error(`Could not render ${piece}`, error);
            setFailed(true);
          });
      },
      { rootMargin: "160px" },
    );
    observer.observe(element.current);
    return () => {
      stopped = true;
      observer.disconnect();

    };
  }, [piece, logo, resolvedTheme]);
  useEffect(() => {
    if (!scene) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const ratio = scene.meta.cell ?? 2;
      const fit = logo || piece === "file-tree" ? Math.min : Math.max;
      const scale = fit(width / scene.meta.cols, height / (scene.meta.rows * ratio));
      // Keep the source grid density: smaller cells would duplicate its glyphs.
      setCell(Math.max(1, scale * ratio));
    });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [scene, logo, piece]);
  return (
    <div
      ref={element}
      role="img"
      className={className}
      data-ascii-rest={piece}
      data-ascii-logo={logo ? "" : undefined}
      data-ready={scene ? "" : undefined}
      data-failed={failed ? "" : undefined}
      style={{ aspectRatio: scene ? `${scene.meta.cols} / ${scene.meta.rows * (scene.meta.cell ?? 2)}` : undefined }}
      {...props}
    >
      {scene && (
        <AsciiGrid
          draw={scene.draw}
          cell={cell}
          square={scene.meta.cell === 1}
          colored
          paper={scene.meta.ground ?? "transparent"}
          ink="--foreground"
          fps={logo ? 12 : 15}
          stillTime={scene.meta.still ?? 0}
          animate={scene.meta.fps > 0}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export function ForestFooter() {
  const [piece, setPiece] = useState("jungle-falls");
  const choices = [
    ["jungle-falls", "Jungle falls"],
    ["misty-forest", "Misty forest"],
    ["alpine-dawn", "Alpine dawn"],
  ];
  return (
    <section className="launch" aria-labelledby="footer-start-title">
      <div className="wrap launch-content">
        <div className="launch-intro">
          <h2 id="footer-start-title">Make the blueprint yours.</h2>
          <p>Get set-me-up running on your next machine.</p>
        </div>
        <SetupPanel />
        <div className="forest-scenes" role="group" aria-label="Footer scenery">
          <span>Change scenery</span>
          {choices.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={piece === key}
              onClick={() => setPiece(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="launch-art">
        <RestArt
          piece={piece}
          data-forest-gallery=""
          role="img"
          aria-label={`${choices.find((choice) => choice[0] === piece)[1]} ASCII landscape`}
        />
      </div>
    </section>
  );
}
