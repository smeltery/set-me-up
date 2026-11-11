"""Export the docs checkout's structured content for the marketing search."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOCS_SITE = ROOT.parent / "docs" / "site"
CONTENT = DOCS_SITE / "content-data" if (DOCS_SITE / "content-data").is_dir() else DOCS_SITE / "content"
CACHE = ROOT / "site" / "docs-search.json"


def searchable_text(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return " ".join(searchable_text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(searchable_text(item) for key, item in value.items()
                        if key not in {"id", "href", "icon", "language"})
    return ""


def load_index():
    if not CONTENT.is_dir():
        return json.loads(CACHE.read_text(encoding="utf-8"))
    pages = []
    for path in sorted(CONTENT.rglob("*.json")):
        page = json.loads(path.read_text(encoding="utf-8"))
        if not page["path"].startswith("/docs"):
            raise ValueError(f"Invalid docs search path in {path}")
        pages.append({
            "path": page["path"],
            "title": page["title"],
            "group": page["group"],
            "description": page["description"],
            "sections": [{
                "id": section["id"],
                "title": section["title"],
                "text": searchable_text(section),
            } for section in page["sections"]],
        })
    return pages


def write_index(destination):
    destination.write_text(json.dumps(load_index(), ensure_ascii=False, separators=(",", ":")) + "\n",
                           encoding="utf-8")


if __name__ == "__main__":
    write_index(CACHE)
