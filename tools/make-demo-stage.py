"""Pictures for a product page's demo stage (page.json intro.stage, see tools/build-pages.mjs), written to
<product>/img/demo/ as stage-wide-<width> and stage-tall-<width>, each as AVIF and WebP.

    python tools/make-demo-stage.py exitwise
    python tools/make-demo-stage.py speedometer-wallpaper --wide <night drive, wide> --tall <night drive, tall>

Pictures are kept as made, at each width up to their own; page.json gives the sizes this prints. Exitwise's come from
the game's own Meadow backdrop (Games repo, Resources/Worlds/meadow/Backdrop.png, read straight from git), the Recraft
world whose colours the demo board wears: the tall one is the backdrop itself, and the wide one (made here, unless
--wide gives another) keeps the backdrop's two edges with their trees and fills the middle with its own open grass,
without the river and the pond, at 3:2 so a stage of about that shape keeps the trees whole. Speedometer's are cut
from its key art's Recraft night drive. Needs Pillow with AVIF (12 or later) and numpy.

The pictures in use (Recraft Pro on gvergidis90@gmail.com, so VGraphics owns them; project "VGraphics site demo stages",
https://www.recraft.ai/project/448793a3-8896-4eda-9a7e-43018ae0189e, 22 Oct 2026; Recraft V4.1, then Crisp upscale):
- Exitwise wide, style "Exitwise Map", 3:2: "Top-down view, seen from directly above, of a sunny green meadow for a casual
  puzzle game backdrop. Round leafy trees, a few pine trees, pink and yellow flower bushes, red spotted mushrooms and
  small grey rocks run along the left and right edges. A winding sandy path in the lower left corner and a small lily
  pond in the lower right corner. The whole middle is wide open plain grass with soft lighter and darker patches,
  nothing on it. No sky, no horizon, no people, no text."
- Speedometer wide 16:9 and tall 9:16, style from a reference (the key art's night drive scene): "Cinematic photo from
  the driver's seat of a car at night. The dark black leather dashboard with fine orange stitching runs across the lower
  third, completely empty and clear, with a thin warm amber ambient light strip along its far edge. Above it the
  windscreen is covered in rain droplets, and through it a blurred city at night: round bokeh street lights, glowing
  tower windows and long red tail-light streaks on the road. Deep blue night tones, shallow depth of field, moody and
  premium. Nothing on the dashboard: no phone, no mount, no gadgets, no people, no text, no logos."
"""
import argparse
import io
import os
import subprocess
import sys

import numpy as np
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDE = (960, 1600, 2400)
TALL = {"exitwise": (640, 1024), "speedometer-wallpaper": (640, 960, 1280)}
MEADOW = "ArrowPuzzle/Assets/_Project/Resources/Worlds/meadow/Backdrop.png"


def find_games():
    """The Games repo beside the site's checkout (a worktree of the site sits deeper, so look up a few levels)."""
    folder = SITE
    for _ in range(5):
        folder = os.path.dirname(folder)
        if os.path.isdir(os.path.join(folder, "Games", ".git")):
            return os.path.join(folder, "Games")
    sys.exit("Games repo not found beside the site; pass --tall")


def save(img, out, name, widths):
    img = img.convert("RGB")
    for width in sorted({min(w, img.width) for w in widths}):
        cut = img if img.width == width else img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
        cut.save(os.path.join(out, f"{name}-{width}.avif"), quality=54, speed=4)
        cut.save(os.path.join(out, f"{name}-{width}.webp"), quality=76, method=6)
        print(f"{name}-{width}: {cut.width}x{cut.height}")


def widened(backdrop):
    """The Meadow backdrop at 3:2: its left and right edges as they are, the open grass between them repeated (every
    other copy mirrored, each cross-faded into the next), from below the river to above the pond."""
    a = np.asarray(backdrop.convert("RGB")).astype(np.float32)[150:1290]
    h = a.shape[0]
    width = round(h * 1.5)
    total = np.zeros((h, width, 3), np.float32)
    weight = np.zeros((h, width, 1), np.float32)

    def put(strip, x, fade_in, fade_out):
        m = np.ones(strip.shape[1], np.float32)
        if fade_in:
            m[:fade_in] = np.linspace(0, 1, fade_in)
        if fade_out:
            m[-fade_out:] = np.linspace(1, 0, fade_out)
        total[:, x:x + strip.shape[1]] += strip * m[None, :, None]
        weight[:, x:x + strip.shape[1]] += m[None, :, None]

    fade = 110
    left, grass, right = a[:, :470], a[:, 340:690], a[:, 554:]
    x, i = left.shape[1] - fade, 0
    while x < width - right.shape[1]:
        put(grass if i % 2 == 0 else grass[:, ::-1], x, fade, fade)
        x, i = x + grass.shape[1] - fade, i + 1
    put(left, 0, 0, fade)
    put(right, width - right.shape[1], fade, 0)
    return Image.fromarray(np.clip(total / np.maximum(weight, 1e-6), 0, 255).astype(np.uint8))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("product", choices=sorted(TALL))
    p.add_argument("--wide")
    p.add_argument("--tall")
    a = p.parse_args()
    out = os.path.join(SITE, a.product, "img", "demo")
    os.makedirs(out, exist_ok=True)

    if a.product == "exitwise":
        meadow = Image.open(io.BytesIO(subprocess.run(["git", "show", f"main:{MEADOW}"], cwd=find_games(), check=True,
                                                      capture_output=True).stdout))
        wide, tall = (Image.open(a.wide) if a.wide else widened(meadow)), (Image.open(a.tall) if a.tall else meadow)
    elif a.wide and a.tall:
        wide, tall = Image.open(a.wide), Image.open(a.tall)
    else:
        sys.exit("--wide and --tall are needed")
    save(wide, out, "stage-wide", WIDE)
    save(tall, out, "stage-tall", TALL[a.product])


if __name__ == "__main__":
    main()
