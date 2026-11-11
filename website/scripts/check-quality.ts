import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import upstream from "../upstream.json";
import budgets from "./loc-budgets.json";

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const mode = process.argv[2];
if (mode === "mermaid") {
  const dom = new JSDOM("<!DOCTYPE html><body></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
  let count = 0;
  for (const file of ["README.md", ...files("docs")].filter((file) => file.endsWith(".md"))) {
    for (const match of readFileSync(file, "utf8").matchAll(/^```mermaid\r?\n([\s\S]*?)\r?\n```/gm)) {
      try { await mermaid.parse(match[1]); }
      catch (error) { throw new Error(`Invalid diagram in ${file}`, { cause: error }); }
      count++;
    }
  }
  if (!count) throw new Error("Expected at least one Mermaid diagram");
  console.log(`Validated ${count} Mermaid diagrams`);
  dom.window.close();
} else if (mode === "loc") {
  const owned = ["app", "components", "hooks", "lib", "scripts", "styles", "docs"]
    .flatMap(files).filter((file) => /\.(tsx?|jsx?|css|py|md)$/.test(file) && !(file in upstream.files));
  for (const file of owned) {
    const lines = readFileSync(file, "utf8").trimEnd().split("\n").length;
    const limit = (budgets.files as Record<string, number>)[file] ?? budgets.default;
    if (lines > limit) throw new Error(`${file}: ${lines} lines exceeds budget ${limit}`);
  }
  console.log(`LOC budgets passed for ${owned.length} authored files`);
} else {
  throw new Error("Usage: bun scripts/check-quality.ts mermaid|loc");
}
