#!/usr/bin/env python3
"""Strip background from a portrait. Used by the thumbnail pipeline.

Usage: python3 remove-bg.py <input.png> <output.png>
"""
import sys
from pathlib import Path
from rembg import remove
from PIL import Image

if len(sys.argv) != 3:
    print("Usage: remove-bg.py <input.png> <output.png>", file=sys.stderr)
    sys.exit(1)

src = Path(sys.argv[1])
dst = Path(sys.argv[2])

if not src.exists():
    print(f"Input not found: {src}", file=sys.stderr)
    sys.exit(1)

print(f"Stripping background from {src.name}...")
img = Image.open(src)
out = remove(img)
out.save(dst)
print(f"Wrote {dst} ({dst.stat().st_size // 1024} KB)")
