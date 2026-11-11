#!/usr/bin/env python3
"""Bundle selected MIT-licensed ascii.rest pieces from an immutable revision."""
from pathlib import Path
import os
import shutil
import subprocess
import tarfile
import tempfile
from urllib.request import urlretrieve

ROOT = Path(__file__).resolve().parents[1]
REVISION = "b9e5af079c99ea83e6154b4d7fa3cb6917b66731"
with tempfile.TemporaryDirectory() as directory:
    temporary = Path(directory).resolve()
    source = os.environ.get("ASCII_REST_SOURCE")
    if source:
        source = Path(source)
        actual = subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()
        if actual != REVISION:
            raise SystemExit(f"Expected ascii.rest {REVISION}, got {actual}")
    else:
        archive = temporary / "ascii.tar.gz"
        urlretrieve(f"https://codeload.github.com/bas3line/ascii/tar.gz/{REVISION}", archive)
        with tarfile.open(archive) as bundle:
            for member in bundle.getmembers():
                if not (member.name.startswith(f"ascii-{REVISION}/src/") or member.name == f"ascii-{REVISION}/LICENSE"):
                    continue
                destination = (temporary / member.name).resolve()
                if not destination.is_relative_to(temporary) or member.issym() or member.islnk():
                    raise SystemExit("Unsafe path in ascii.rest source archive")
                bundle.extract(member, temporary)
        source = temporary / f"ascii-{REVISION}"
    output = ROOT / "site/ascii-rest"
    output.mkdir(exist_ok=True)
    for old_chunk in output.glob("*.js"):
        old_chunk.unlink()
    subprocess.run([
        "esbuild", str(ROOT / "ascii/ascii-rest.ts"), "--bundle", "--splitting",
        "--format=esm", "--chunk-names=[name]", "--target=es2022", "--minify", f"--outdir={output}",
        f"--alias:ascii-rest={source / 'src'}",
    ], check=True)
    shutil.copyfile(source / "LICENSE", output / "LICENSE.txt")
    (output / "SOURCE.txt").write_text(f"https://github.com/bas3line/ascii/tree/{REVISION}\n")
