#!/usr/bin/env python3
"""Copy the shared pinned asciicn 404 bundle into the independent docs site."""
from pathlib import Path
import shutil
import subprocess
import re

ROOT = Path(__file__).resolve().parents[2]
source = ROOT / "website/site"
docs_site = ROOT / "docs/site"
if (docs_site / "upstream.json").is_file():
    for origin, destination in (("mark.svg", "favicon.svg"), ("mark.svg", "logo.svg"), ("social-card.png", "social-card.png")):
        shutil.copyfile(ROOT / "brand" / origin, docs_site / "public" / destination)
    print("Synced set-me-up branding. The Next.js docs own their upstream navigation and 404 source.")
    raise SystemExit(0)
target = ROOT / "docs/site/public/asciicn"
if not target.parent.is_dir():
    raise SystemExit("The docs site checkout is missing.")
target.mkdir(exist_ok=True)
for name in ("not-found.js", "terminal-ui.css"):
    shutil.copyfile(source / name, target / name)
    print(f"Synced {target / name}")

header = (ROOT / "website/partials/header.html").read_text()
header = header.replace('{{DOCS_URL}}', '').replace('{{SEARCH}}', '')
header = re.sub(r'<a class="nav-mobile-github"[\s\S]*?</a>', '', header)
header = header.replace('/assets/mark.svg', '/logo.svg')
header = header.replace('<button class="menu-toggle"', '<button aria-label="Open menu" class="menu-toggle"')
header = header.replace('M2 5h14M2 9h14M2 13h14', 'M2 5h14M2 11h14')
header = header.replace('/hero-glyphs.svg', '/asciicn/hero-glyphs.svg')
header = header.replace('href="/" aria-label="set-me-up home"', 'href="/docs" aria-label="set-me-up documentation home"')
header = header.replace('href="/" aria-label="Docs — external documentation site"', 'href="/docs"')
header = re.sub(r'<div class="nav-guides nav-mobile-only">[\s\S]*?</div>',
                '<div class="nav-guides nav-mobile-only"><!-- %docs-guides% --></div>', header)
(target / "navigation.html").write_text(header)
for name in ("hero-glyphs.svg", "hero-landscape.js", "smooth-scroll.js", "smooth-scroll.css", "search-grain.svg"):
    shutil.copyfile(source / name, target / name)
css = (source / "shell.css").read_text()
css = css.replace("860px", "1023px")
css += (source / "search.css").read_text().split('.site-search {')[0]
result = subprocess.run(["esbuild", "--loader=css", "--minify"], input=css, text=True, capture_output=True, check=True)
(target / "navigation.css").write_text(result.stdout)
script = (source / "navigation.js").read_text().replace("860px", "1023px")
# The docs pill uses asciicn's short popover transition, not a fullscreen reveal.
start = script.index("function setMenu(")
end = script.index("function dismissMenu()", start)
script = script[:start] + (ROOT / "website/ascii/docs-menu-transition.js").read_text() + "\n" + script[end:]
script = script.replace('body > .skip-link', 'body > .skip-link, body > #root')
script = script.replace('toggle.setAttribute("aria-expanded", String(open));', 'toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");')
script += """
for (const control of header.querySelectorAll('[data-search-open]')) {
  control.hidden = false;
  control.addEventListener('click', () => {
    window.dispatchEvent(new Event('site-search-open'));
    document.querySelector('.docs-search-trigger')?.click();
  });
}
"""
(target / "navigation.js").write_text(script)
print("Synced the shared marketing navigation and forest scene")
