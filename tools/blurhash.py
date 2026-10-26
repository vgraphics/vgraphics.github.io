# Blurhashes for the site's preview pictures (George, 26 Oct 2026: "Use blurhash. General rules for all pages."):
# reads picture paths (relative to the repo root), one per line, on stdin and prints {path: blurhash} as JSON.
# The hash is the blurhash format (https://blurha.sh, 4 x 3 components), a short string the page paints as a soft
# picture of the same shape while the real one loads (assets/blurhash.js). tools/lib/blurhash.mjs runs this only
# for pictures not yet in tools/blurhash.json. (Pillow with AVIF, NumPy.)
import json, math, sys
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
B83 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~'


def b83(value, length):
    return ''.join(B83[(value // 83 ** (length - 1 - i)) % 83] for i in range(length))


def to_linear(v):
    v = v / 255
    return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)


def to_srgb(v):
    v = min(1, max(0, v))
    return round(v * 12.92 * 255 + 0.5) if v <= 0.0031308 else round((1.055 * v ** (1 / 2.4) - 0.055) * 255 + 0.5)


def encode(path, cx=4, cy=3):
    im = Image.open(path).convert('RGB')
    im.thumbnail((96, 96), Image.BILINEAR)  # the hash keeps only the broad colours, so a small copy is enough
    px = to_linear(np.asarray(im).astype(float))
    h, w = px.shape[:2]
    xs, ys = np.arange(w), np.arange(h)
    factors = []
    for j in range(cy):
        for i in range(cx):
            basis = np.cos(math.pi * j * ys / h)[:, None] * np.cos(math.pi * i * xs / w)[None, :]
            norm = 1 if i == 0 and j == 0 else 2
            factors.append(norm * (px * basis[:, :, None]).sum(axis=(0, 1)) / (w * h))
    dc, ac = factors[0], factors[1:]
    out = b83((cx - 1) + (cy - 1) * 9, 1)
    peak = max(abs(v) for f in ac for v in f)
    q = max(0, min(82, math.floor(peak * 166 - 0.5)))
    out += b83(q, 1)
    top = (q + 1) / 166
    out += b83((to_srgb(dc[0]) << 16) + (to_srgb(dc[1]) << 8) + to_srgb(dc[2]), 4)
    for f in ac:
        r, g, b = (max(0, min(18, math.floor(math.copysign(abs(v / top) ** 0.5, v) * 9 + 9.5))) for v in f)
        out += b83(r * 19 * 19 + g * 19 + b, 2)
    return out


print(json.dumps({p: encode(p) for p in (line.strip() for line in sys.stdin) if p}))
