"""The moving big dial on Speedometer's demo phone (speedometer-wallpaper/demo/gauge.html), written to
speedometer-wallpaper/img/:

    python tools/make-speedometer-dial.py

- dial-still.webp: the app's render on the phone (img/shot-kmh.webp, 540x1200) with the big needle, its shadow and
  the speed digits painted out (OpenCV inpainting), so the page can draw them live;
- dial-needle.webp, dial-cap.webp: the app's own needle and cap art (Games repo, SpeedometerWallpaper
  logic_resources img__classic__needle__big.png and img__classic__cap__big.png, read straight from git), at twice the
  size they have on the 540 px render.

The geometry is ClassicDesign's, measured on the render: the needle turns about the cap's middle (269.2, 484.6), the
gauge is 460 px wide (the ticks end 0.398 of that from the middle), the needle is 0.31 x 0.0214 of it, starting 0.04
of it from the middle, and the cap 0.107. gauge.html places them with the numbers this prints. Needs Pillow with
WebP, numpy and opencv-python-headless.
"""
import io
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(SITE, "speedometer-wallpaper", "img")
ART = "SpeedometerWallpaper/logic_resources/src/main/res/drawable-nodpi/img__classic__{}__big.png"
PIVOT = (269.2, 484.6)
GAUGE = 460.0
ANGLE_AT_87 = -95 + 87 / 240 * 212  # the render's needle
DIGITS = (224, 393, 317, 441)  # the three LCD digits (two lit, one unlit), with a margin
LABEL_80 = (196, 342, 228, 369)  # the label the needle's tip runs past


def find_games():
    """The Games repo beside the site's checkout (a worktree of the site sits deeper, so look up a few levels)."""
    folder = SITE
    for _ in range(5):
        folder = os.path.dirname(folder)
        if os.path.isdir(os.path.join(folder, "Games", ".git")):
            return os.path.join(folder, "Games")
    sys.exit("Games repo not found beside the site")


def art(name):
    blob = subprocess.run(["git", "show", "main:" + ART.format(name)], cwd=find_games(), check=True, capture_output=True)
    return Image.open(io.BytesIO(blob.stdout)).convert("RGBA")


def needle_mask(shape):
    """The needle from its base under the cap to just past its tip, wider on the right where its shadow falls."""
    h, w = shape
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.radians(ANGLE_AT_87)
    dx, dy = xs - PIVOT[0], ys - PIVOT[1]
    along = dx * np.sin(a) - dy * np.cos(a)  # towards the tip
    across = dx * np.cos(a) + dy * np.sin(a)  # to the needle's right
    return (along > -8) & (along < 0.35 * GAUGE + 6) & (across > -7) & (across < 11)


def main():
    shot = np.asarray(Image.open(os.path.join(IMG, "shot-kmh.webp")).convert("RGB"))
    needle = needle_mask(shot.shape[:2])
    mask = needle.copy()
    x0, y0, x1, y1 = DIGITS
    mask[y0:y1, x0:x1] = True
    # The fill takes its colours from the edge of what it fills, so the "80" and the cap (which the page draws again on
    # top) are filled too, keeping their white out of the face; the "80" is then put back where the needle wasn't.
    ys, xs = np.mgrid[0:shot.shape[0], 0:shot.shape[1]]
    mask |= np.hypot(xs - PIVOT[0], ys - PIVOT[1]) < 27
    lx0, ly0, lx1, ly1 = LABEL_80
    mask[ly0:ly1, lx0:lx1] = True
    still = cv2.inpaint(np.ascontiguousarray(shot[..., ::-1]), mask.astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA)[..., ::-1]
    keep = np.zeros_like(needle)
    keep[ly0:ly1, lx0:lx1] = True
    keep &= ~needle
    still = np.where(keep[..., None], shot, still)
    Image.fromarray(np.ascontiguousarray(still)).save(os.path.join(IMG, "dial-still.webp"), quality=88, method=6)

    width, length = 0.0214 * GAUGE, 0.31 * GAUGE
    art("needle").resize((round(width * 2), round(length * 2)), Image.LANCZOS).save(
        os.path.join(IMG, "dial-needle.webp"), quality=92, method=6)
    cap = 0.107 * GAUGE
    art("cap").resize((round(cap * 2), round(cap * 2)), Image.LANCZOS).save(
        os.path.join(IMG, "dial-cap.webp"), quality=92, method=6)

    px, py = PIVOT
    print(f"needle: x={px - width / 2:.1f} y={py - length - 0.04 * GAUGE:.1f} width={width:.2f} height={length:.1f}")
    print(f"cap: x={px - cap / 2:.1f} y={py - cap / 2:.1f} size={cap:.1f}; turn about {px}px {py}px")


if __name__ == "__main__":
    main()
