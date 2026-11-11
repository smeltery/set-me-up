"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { RedwoodLight } from "@/components/asciicn/redwood-light";
import { Ember } from "@/components/asciicn/ember";
import { BlackHole } from "@/components/asciicn/black-hole";
import { GlyphTrail } from "@/components/asciicn/glyph-trail";

export function Landscape({ kind, className }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const [charset, setCharset] = useState("standard");
  useEffect(() => {
    setCharset(
      ["blocks", "standard", "petscii"][crypto.getRandomValues(new Uint32Array(1))[0] % 3],
    );
  }, []);
  const common = {
    className: `${className} native-landscape`,
    "aria-hidden": true,
    fps: 24,
    style: { width: "100%", height: "100%" },
  };
  if (kind === "hero")
    return (
      <RedwoodLight
        {...common}
        charset="blocks"
        cell={7}
        square
        intensity={1}
        motes
        mist
        colorMode="truecolor"
      />
    );
  if (kind === "cta")
    return (
      <Ember
        {...common}
        charset={charset}
        cell={8}
        intensity={isLight ? 0.7 : 0.48}
        sparks={0.4}
        wind={0.15}
        paper="--background"
        ink="--ember-ink"
        flame="--ember-flame"
      />
    );
  return (
    <BlackHole
      {...common}
      charset="standard"
      cell={9}
      tint={isLight ? "theme" : "warm"}
      scale={0.95}
      diskSize={10}
      beaming={2.5}
      tilt={8}
      paper="--background"
      ink="--orbit-ink"
      accent="--orbit-accent"
    />
  );
}

export function HeroTrail() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setActive(pointer.matches && !reduced.matches);
    update();
    pointer.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      pointer.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);
  return active ? (
    <div className="hero-trail" aria-hidden="true">
      <GlyphTrail
        colorMode="duotone"
        ramp={["--background", "--scene-moss", "--scene-fern", "--scene-canopy"]}
        background="transparent"
        charset="standard"
        idle={false}
        decay={1.8}
        spread={1.1}
        cell={12}
        fps={30}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  ) : null;
}
