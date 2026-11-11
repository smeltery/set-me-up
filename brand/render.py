#!/usr/bin/env python3
"""Build the shared social preview from the pinned Redwood Light still."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "brand"


def main():
    # Use asciicn's geometric block glyphs, exactly as the live hero does.
    scene = (ROOT / "website/site/hero-glyphs.svg").read_text(encoding="utf-8")
    scene = scene[scene.index("<svg"):]
    scene = scene.replace(
        'width="1440" height="760" viewBox="0 0 1440 760"',
        'width="1280" height="640" viewBox="0 0 1440 760" '
        'preserveAspectRatio="xMidYMid slice"',
        1,
    )
    template = (BRAND / "social-card-template.svg").read_text(encoding="utf-8")
    if template.count("{{REDWOOD_SCENE}}") != 1:
        raise ValueError("The social card template must contain one scene slot.")
    target = BRAND / "social-card.svg"
    target.write_text(template.replace("{{REDWOOD_SCENE}}", scene), encoding="utf-8")
    subprocess.run(
        ["rsvg-convert", "--output", str(BRAND / "social-card.png"), str(target)],
        check=True,
    )
    print("Rendered brand/social-card.svg and brand/social-card.png")


if __name__ == "__main__":
    main()
