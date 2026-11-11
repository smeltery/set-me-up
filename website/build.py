#!/usr/bin/env python3
"""Compatibility entrypoint for the native Next.js production build."""
import os
from pathlib import Path

os.chdir(Path(__file__).resolve().parent)
environment = dict(os.environ)
environment["PATH"] = "/opt/homebrew/bin:" + environment.get("PATH", "")
os.execvpe("bun", ["bun", "run", "build"], environment)
