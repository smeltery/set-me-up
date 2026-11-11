#!/usr/bin/env python3
"""Start the Next.js development preview with native Fast Refresh."""
import argparse
import os
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--port", type=int, default=4175)
args = parser.parse_args()
os.chdir(Path(__file__).resolve().parent)
environment = dict(os.environ)
environment["PATH"] = "/opt/homebrew/bin:" + environment.get("PATH", "")
os.execvpe("bunx", ["bunx", "next", "dev", "--hostname", "127.0.0.1", "--port", str(args.port)], environment)
