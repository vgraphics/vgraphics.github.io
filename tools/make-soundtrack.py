"""Makes what a product's soundtrack block needs from its key art and its music (tools/lib/soundtrack.mjs):

    python tools/make-soundtrack.py exitwise [--top 0.04] [--src exitwise/img/key-art-tall-1440.webp]

1. The album cover: a square cut of the tall key art, as <product>/img/cover-320 and cover-640 (.avif and .webp).
   It is the cover beside the player, the label on its record and the picture on a phone's lock screen. --top is
   where the square starts, as a share of the picture's height (0.04: just above Exitwise's glowing door).
2. The waveforms: <product>/audio/peaks.json, the loudness of each .m4a in <product>/audio/ in 160 steps (0-100),
   drawn as the player's seek bar.

Needs Python 3 with Pillow (with AVIF and WebP) and ffmpeg on the PATH. Run it again after the key art or the music
changes, then tools/build-pages.mjs.
"""
import argparse
import array
import json
import math
import os
import subprocess

from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
COVER_SIZES = (320, 640)
STEPS = 160
RANGE_DB = 12  # a step this far under the loudest is drawn at the least height; game music is even, so keep it narrow


def cover(product, top, src):
    art = Image.open(os.path.join(ROOT, src)).convert("RGB")
    w, h = art.size
    y = round(top * h)
    if y + w > h:
        raise SystemExit(f"{src}: a square from {top} of the height runs past the bottom")
    square = art.crop((0, y, w, y + w))
    for size in COVER_SIZES:
        out = os.path.join(ROOT, product, "img", f"cover-{size}")
        im = square.resize((size, size), Image.LANCZOS)
        im.save(out + ".avif", quality=64)
        im.save(out + ".webp", quality=82, method=6)


def peaks(path):
    """The track's loudness in STEPS even slices: each slice's RMS in dB, scaled so the loudest is 100."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                         check=True, capture_output=True).stdout
    samples = array.array("h", raw)
    size = len(samples) / STEPS
    db = []
    for i in range(STEPS):
        part = samples[round(i * size):round((i + 1) * size)]
        rms = math.sqrt(sum(s * s for s in part) / max(1, len(part)))
        db.append(20 * math.log10(max(rms, 1) / 32768))
    loudest = max(db)
    return [max(8, round(100 * (1 - (loudest - d) / RANGE_DB))) for d in db]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("product")
    ap.add_argument("--top", type=float, default=0.04)
    ap.add_argument("--src")
    a = ap.parse_args()
    cover(a.product, a.top, a.src or os.path.join(a.product, "img", "key-art-tall-1440.webp"))
    audio = os.path.join(ROOT, a.product, "audio")
    waves = {f: peaks(os.path.join(audio, f)) for f in sorted(os.listdir(audio)) if f.endswith(".m4a")}
    with open(os.path.join(audio, "peaks.json"), "w", encoding="utf-8") as out:
        out.write("{\n" + ",\n".join(f'  "{f}": {json.dumps(p, separators=(",", ":"))}' for f, p in waves.items()) + "\n}\n")
    print(f"{a.product}: cover-320/640 (.avif, .webp), audio/peaks.json ({len(waves)} tracks)")


if __name__ == "__main__":
    main()
