import { describe, expect, test } from "bun:test";
import { profiles, stages } from "../lib/setup-data";
import index from "../content-data/search.json";
import { upstreamMismatches } from "./check-upstream";
import * as debian from "../vendor/ascii-rest/pieces/debian";
import * as ubuntu from "../vendor/ascii-rest/pieces/ubuntu";
import * as arch from "../vendor/ascii-rest/pieces/arch-linux";
import * as nix from "../vendor/ascii-rest/pieces/nixos";

describe("independent marketing deployment", () => {
  test("retains the actual upstream UI source", () => expect(upstreamMismatches()).toEqual([]));
  test("indexes the authored docs without a runtime child checkout", () => {
    expect(index.length).toBeGreaterThanOrEqual(22);
    expect(new Set(index.map((page) => page.path)).size).toBe(index.length);
    for (const page of index) {
      expect(page.path.startsWith("/docs")).toBe(true);
      expect(page.title).toBeTruthy();
      expect(page.description).toBeTruthy();
    }
  });
  test("all machine profiles have four meaningful demo commands and results", () => {
    expect(Object.keys(profiles)).toHaveLength(3);
    expect(Object.keys(stages)).toHaveLength(4);
    for (const profile of Object.values(profiles))
      for (const stage of Object.values(stages)) {
        expect(stage.command(profile)).toMatch(/^smu /);
        expect(stage.output(profile).length).toBeGreaterThan(2);
      }
    expect(stages.preview.command(profiles.vps)).toContain("--machine vps");
    expect(stages.apply.command(profiles.vps)).toContain("--setup-profile vps");
  });
  test("the platform logos retain distinctive upstream palettes", () => {
    expect(debian.meta.palette[0]).toBe("#a80030");
    expect(new Set([debian, ubuntu, arch, nix].map((piece) => piece.meta.palette[0])).size).toBe(4);
  });
});
