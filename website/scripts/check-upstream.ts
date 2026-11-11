import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import provenance from "../upstream.json";

export const upstreamMismatches = () =>
  Object.entries(provenance.files).flatMap(([file, record]) => {
    if (record.adapted) return [];
    const actual = createHash("sha256")
      .update(readFileSync(file))
      .digest("hex");
    return actual === record.sha256 ? [] : [file];
  });
if (import.meta.main) {
  const mismatches = upstreamMismatches();
  if (mismatches.length)
    throw new Error(
      `Original asciicn source changed: ${mismatches.join(", ")}. Record and explain any deliberate adaptation.`
    );
  console.log(
    `Verified ${Object.values(provenance.files).filter((file) => !file.adapted).length} unchanged upstream source files at ${provenance.revision}`
  );
}
