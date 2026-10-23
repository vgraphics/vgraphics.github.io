# Makes the master of the Worlds entry's wide hero (exitwise/wiki/art-src/worlds.webp) from George's bird's-eye island
# and its Recraft outpaint (George, 23 Oct 2026: "the hero image is blurry. Need to content generate it for width."):
#   worlds-island.webp     his 1:2 picture, Crisp upscaled to 2048x4096 (also the tall picture for phones)
#   worlds-outpaint.webp   the same picture outpainted to 16:9 (Nano Banana 2.1 in Recraft), Crisp upscaled
# The outpaint keeps his picture in its middle at a quarter of the resolution, and its new sea doesn't quite take up
# his picture's light (a sun haze across the top, a vignette), so a line and a step in shade showed where his picture
# ends. Here his crisp picture goes back in the middle, unchanged, so the title stays sharp, and the new sides are
# shaded to meet it: each side's difference from his picture along the join, smoothed, fades out over the side's
# inner part, and the join itself is blended over a narrow band.
# Usage: python tools/make-wiki-worlds.py
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'exitwise', 'wiki', 'art-src')
FADE = 0.42   # how far into each side (of its width) the shading correction reaches
BLEND = 0.02   # the join's blend band, of the island's width


def locate(out, isl):
    # Where, and how large, the outpaint holds his picture: the scale and place where a quarter-size copy of it matches
    # best (the model re-drew it a little larger than the frame and cut its top and foot).
    q = 4
    o = np.asarray(out.resize((out.width // q, out.height // q), Image.BOX).convert('L'), float)
    best = None
    for s in np.arange(1.0, 1.05, 0.002):
        w, h = round(isl.width * s / q), round(isl.height * s / q)
        i = np.asarray(isl.resize((w, h), Image.BOX).convert('L'), float)
        for y in range(o.shape[0] - h, 1):
            iy = i[-y:-y + o.shape[0]]
            for x in range(o.shape[1] // 2 - w // 2 - 12, o.shape[1] // 2 - w // 2 + 13):
                e = np.mean((o[:, x:x + w] - iy) ** 2)
                if best is None or e < best[0]:
                    best = (e, s, x * q, y * q)
    # Then to the pixel, at full size (every second row, the middle of his picture, away from the joins).
    _, s0, x0, y0 = best
    best = None
    O = np.asarray(out.convert('L'), float)
    for s in np.arange(s0 - 0.004, s0 + 0.0041, 0.002):
        im = isl.resize((round(isl.width * s), round(isl.height * s)), Image.LANCZOS)
        I = np.asarray(im.convert('L'), float)
        w = I.shape[1]
        for y in range(max(y0 - 8, O.shape[0] - I.shape[0]), min(y0 + 8, 0) + 1, 2):
            Iy = I[-y:-y + O.shape[0]]
            for x in range(x0 - 16, x0 + 17, 2):
                e = np.mean((O[::2, x + 40:x + w - 40] - Iy[::2, 40:w - 40]) ** 2)
                if best is None or e < best[0]:
                    best = (e, s, x, y)
    return best[1:]


def main():
    out = Image.open(os.path.join(SRC, 'worlds-outpaint.webp')).convert('RGB')
    isl = Image.open(os.path.join(SRC, 'worlds-island.webp')).convert('RGB')
    H = out.height
    isl = isl.resize((round(isl.width * H / isl.height), H), Image.LANCZOS)
    s, x0, y = locate(out, isl)
    isl = isl.resize((round(isl.width * s), round(isl.height * s)), Image.LANCZOS).crop((0, -y, round(isl.width * s), -y + H))
    O = np.asarray(out, float)
    # His picture's outermost columns carry a little of the white it was upscaled on: they're left out.
    tl, tr = 1, 3
    I = np.asarray(isl, float)[:, tl:isl.width - tr]
    x0, x1 = x0 + tl, x0 + isl.width - tr
    smooth = lambda d: gaussian_filter1d(d, 40, axis=0)
    ease = lambda w: w * w * (3 - 2 * w)
    # Each side's step along the join, row by row: his picture's edge against the side's columns beyond it, measured
    # clear of the outpaint's own soft edge (g columns), which is bridged afterwards. The step is spread into the side
    # as a harmonic field would be: exact at the join, softer the further away (blurred along the join in proportion
    # to the distance), and gone by FADE of the side's width, so shapes crossing the join meet without a streak.
    k, g = 3, 4
    C = O.copy()
    for side in ('left', 'right'):
        if side == 'left':
            edge, step = x0 - g - 1, -1
            diff = I[:, :k].mean(1) - O[:, edge - k + 1:edge + 1].mean(1)
            reach = round(edge * FADE)
        else:
            edge, step = x1 + g, 1
            diff = I[:, -k:].mean(1) - O[:, edge:edge + k].mean(1)
            reach = round((O.shape[1] - edge) * FADE)
        diff = gaussian_filter1d(diff, 1.5, axis=0)
        for d in range(reach):
            C[:, edge + step * d] += ease(1 - d / reach) * gaussian_filter1d(diff, 0.6 * d + 0.5, axis=0)
    # His picture in the middle. Just inside each join, the outpaint's own copy of it (a shade off his) is shaded to
    # his, then fades into his over a short band, so neither the shade nor the detail steps at the join.
    b = max(8, round(I.shape[1] * BLEND))
    band = C[:, x0:x1].copy()
    band[:, :b] += smooth(I[:, :b].mean(1) - O[:, x0:x0 + b].mean(1))[:, None, :]
    band[:, -b:] += smooth(I[:, -b:].mean(1) - O[:, x1 - b:x1].mean(1))[:, None, :]
    a = np.ones(I.shape[1])
    ramp = ease(np.linspace(0, 1, b))
    a[:b], a[-b:] = ramp, ramp[::-1]
    C[:, x0:x1] = a[None, :, None] * I + (1 - a[None, :, None]) * band
    # The outpaint's soft edge: a straight blend from the shaded side to his picture.
    for j in range(g):
        f = (j + 1) / (g + 1)
        C[:, x0 - g + j] = (1 - f) * C[:, x0 - g - 1] + f * C[:, x0]
        C[:, x1 + g - 1 - j] = (1 - f) * C[:, x1 + g] + f * C[:, x1 - 1]
    Image.fromarray(np.clip(C, 0, 255).astype(np.uint8)).save(os.path.join(SRC, 'worlds.webp'), 'WEBP', quality=90, method=6)
    print(f'island x {x0}-{x1} of {O.shape[1]}, scale {s:.3f}, top {y}')


if __name__ == '__main__':
    main()
