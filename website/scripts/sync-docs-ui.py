#!/usr/bin/env python3
"""Keep the actual asciicn shell identical across independently built sites."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT.parent / "docs/site"
MANIFEST = ROOT / "shared-ui.json"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true")
args = parser.parse_args()
manifest = json.loads(MANIFEST.read_text())
mismatches = []
for relative, expected in manifest["files"].items():
    local = ROOT / relative
    upstream = DOCS / relative
    if args.check:
        if hashlib.sha256(local.read_bytes()).hexdigest() != expected:
            mismatches.append(relative)
        if upstream.exists() and local.read_bytes() != upstream.read_bytes():
            mismatches.append(f"{relative} differs from docs")
    else:
        local.write_bytes(upstream.read_bytes())
        manifest["files"][relative] = hashlib.sha256(local.read_bytes()).hexdigest()
if mismatches:
    raise SystemExit("Shared UI drift: " + ", ".join(mismatches))
if not args.check:
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
print(f"Verified {len(manifest['files'])} shared UI, theme, and typography files")
