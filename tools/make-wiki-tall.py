# Makes a wiki painting's own tall picture for portrait screens (George, 24 Oct 2026: "Make tall version for all
# images. Crop sucks."): the master's subject whole, with more of its world above and below, instead of a 9:16 cut of
# the wide picture.
#   1. python tools/make-wiki-tall.py crop <product> <dir> [slug ...] [--screens <folder>]
#      writes <dir>/<slug>.jpg for each entry with a "tallCrop" [x, width] in sources.json: that full-height strip of
#      the master (the subject whole), 1376 px on its long side, to outpaint to 9:16 in Recraft (Nano Banana 2.1),
#      then Crisp upscale and export.
#   2. python tools/make-wiki-tall.py <product> <slug> <outpaint> [--screens <folder>]
#      writes <product>/wiki/art-src/<slug>-tall.webp (1440x2560, the "tall" in sources.json) from the exported
#      outpaint. The outpaint is one seamless picture, but it re-draws the strip at about half the master's resolution
#      and changes small things in it (a swirl, a die's dots). So the crisp strip goes back where the outpaint holds it,
#      found by matching, and fades into the outpaint's own copy just inside its top and foot; where the outpaint's new
#      sky and ground start a shade off its strip, they are shaded to meet it (seams()).
#   --screens <folder>: for paintings whose phones show the app (Speedometer). The strip comes from the screen-off copy
#      in <folder> (tools/make-wiki-screens.py <product> --blank <folder>), never from a painting with an AI-drawn
#      dial, and compose writes the tall background to art-src/painted/<slug>-tall.webp with the entry
#      "<slug>-tall" in screens.json: each phone's glass (and its keep and clean polygons) mapped into the tall frame.
#      Then python tools/make-wiki-screens.py <product> <slug>-tall lays the app's real screens in, writing
#      art-src/<slug>-tall.webp, and "tall" in sources.json names it. A phone that runs past the wide picture's edge
#      (its glass reaches past the frame) needs its glass checked in the tall picture.
# Then python tools/make-wiki-art.py <product> <slug> makes the served sizes.
import json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MARGIN, BAND = 0.02, 0.08   # the fade into the outpaint: how far inside the strip it ends, and how long it is (of its height)
FADE = 0.42   # how far into the new sky and ground (of their height) the seam's shading reaches
STEP = 14   # the largest shade step (of 255) taken for a seam
OUT = (1440, 2560)   # the tall picture: 9:16, the largest width make-wiki-art.py serves


def entries(product):
    path = os.path.join(ROOT, product, 'wiki', 'art-src', 'sources.json')
    return path, json.load(open(path, encoding='utf-8'))


def strip(product, slug, s, screens=None):
    src = os.path.join(screens, f'{slug}.webp') if screens else os.path.join(ROOT, product, 'wiki', 'art-src', s['master'])
    im = Image.open(src).convert('RGB')
    x, w = s['tallCrop']
    # The master's first and last rows carry a little of what it was upscaled on: they're left out.
    return im.crop((x, 2, x + w, im.height - 2))


def crop(product, out, only, screens=None):
    _, src = entries(product)
    os.makedirs(out, exist_ok=True)
    for slug, s in src['entries'].items():
        if 'tallCrop' not in s or (only and slug not in only):
            continue
        c = strip(product, slug, s, screens)
        k = 1376 / max(c.size)
        c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS).save(os.path.join(out, f'{slug}.jpg'), quality=93)
        print(slug, c.size)


def grey(im, q):
    return np.asarray(im.resize((im.width // q, im.height // q), Image.BOX).convert('L'), float)


def locate(O, I):
    # Where, and how large, the outpaint holds the strip: (scale, x, y, error), x <= 0 where the model re-drew the
    # strip a little wider than the frame (never narrower). An eighth-size search, then to two pixels at half size.
    def search(q, scales, xs, ys):
        o, best = grey(O, q), None
        for s in scales:
            i = grey(I.resize((max(round(I.width * s), O.width), round(I.height * s)), Image.BOX), q)
            for y in ys(o, i):
                if y < 0 or y + i.shape[0] > o.shape[0]:
                    continue
                for x in xs(o, i):
                    if x > 0 or x + i.shape[1] < o.shape[1]:
                        continue
                    e = np.mean((o[y:y + i.shape[0], 12:-12] - i[:, -x + 12:-x + o.shape[1] - 12]) ** 2)
                    if best is None or e < best[0]:
                        best = (e, s, x * q, y * q)
        return best
    mid = (O.height - I.height) // 16
    _, s0, x0, y0 = search(8, np.arange(1.0, 1.06, 0.004), lambda o, i: range(o.shape[1] - i.shape[1], 1),
                           lambda o, i: range(mid - o.shape[0] // 10, mid + o.shape[0] // 10 + 1))
    e, s, x, y = search(2, np.arange(max(1.0, s0 - 0.004), s0 + 0.0041, 0.001), lambda o, i: range(x0 // 2 - 6, x0 // 2 + 7),
                        lambda o, i: range(y0 // 2 - 6, y0 // 2 + 7))
    return s, x, y, e


def seams(O, y0, y1):
    # The outpaint often keeps the strip as it was and paints the new sky and ground a shade off it, so a straight
    # line shows at the strip's top and foot. The line is found as the row near each end of the strip where the
    # picture steps most. Each new part is then shaded to meet the strip: the step across that row, column by column
    # and smoothed along it, is exact at the line and fades out over FADE of the part's height, its detail fading
    # first (the further from the line, the more it is smoothed), so no streaks run off what differs along the line.
    C = O.copy()
    k, r = 4, 16
    s0 = O.shape[1] / 766   # the smoothing is set for the outpaint's own width, before any upscale
    ease = lambda w: w * w * (3 - 2 * w)
    step_at = lambda y: np.abs(O[y] - O[y - 1]).mean()
    for side in ('top', 'foot'):
        y = y0 if side == 'top' else y1
        if y - r - k < 1 or y + r + k > O.shape[0] - 1:
            continue
        rows = range(y - r, y + r + 1)
        steps = np.array([step_at(t) for t in rows])
        line = rows[int(np.argmax(steps))]
        if steps.max() < 1.5 * np.median(steps):
            continue   # no line here
        b = max(2, round(2 * s0))   # the line's own rows, bridged at the end
        if side == 'top':
            inner, outer, start, sign, reach = O[line + b:line + b + k].mean(0), O[line - b - k:line - b].mean(0), line - b - 1, -1, round(line * FADE)
        else:
            inner, outer, start, sign, reach = O[line - b - k:line - b].mean(0), O[line + b:line + b + k].mean(0), line + b, 1, round((O.shape[0] - line) * FADE)
        # Only a shade's step is a seam; a larger one is the picture's own edge (a wall's foot), left as it is.
        diff = np.clip(gaussian_filter1d(inner - outer, 12 * s0, axis=0), -STEP, STEP)
        for d in range(reach):
            C[start + sign * d] += ease(1 - d / reach) * gaussian_filter1d(diff, s0 * (12 + 1.5 * d), axis=0)
        for j in range(1, 2 * b):
            f = j / (2 * b)
            C[line - b + j] = (1 - f) * C[line - b] + f * C[line + b]
    return C


def screens_entry(product, slug, size, a, bx, by):
    # The phones of the wide painting, mapped into the tall picture (tall = a * wide + b), as screens.json's
    # "<slug>-tall": the same screens and fit, every polygon moved with the picture. An entry with a crop gives its
    # polygons in the painting before the crop; the screen-off copy (size) is the crop, scaled back up.
    path = os.path.join(ROOT, product, 'wiki', 'art-src', 'screens.json')
    spec = json.load(open(path, encoding='utf-8'))
    wide = spec['entries'][slug]
    c = wide.get('crop', [0, 0, size[0], size[1]])
    sx, sy = size[0] / (c[2] - c[0]), size[1] / (c[3] - c[1])
    move = lambda poly: [[round(a * (px - c[0]) * sx + bx, 1), round(a * (py - c[1]) * sy + by, 1)] for px, py in poly]
    def walk(v):
        if isinstance(v, list) and v and isinstance(v[0], list) and len(v[0]) == 2 and all(isinstance(n, (int, float)) for n in v[0]):
            return move(v)
        if isinstance(v, list):
            return [walk(i) for i in v]
        if isinstance(v, dict):
            return {key: (walk(val) if key in ('glass', 'keep', 'clean', 'poly') else val) for key, val in v.items()}
        return v
    tall = {key: walk(val) if key in ('phones', 'clean', 'keep') else val for key, val in wide.items() if key != 'crop'}
    spec['entries'][f'{slug}-tall'] = tall
    json.dump(spec, open(path, 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)


def compose(product, slug, outpaint, screens=None):
    path, src = entries(product)
    s = src['entries'][slug]
    O = Image.open(outpaint).convert('RGB')
    I = strip(product, slug, s, screens)
    f1 = O.width / I.width
    I = I.resize((O.width, round(I.height * O.width / I.width)), Image.LANCZOS)
    k, x, y, err = locate(O, I)
    I = I.resize((max(round(I.width * k), O.width), round(I.height * k)), Image.LANCZOS).crop((-x, 0, -x + O.width, round(I.height * k)))
    C = seams(np.asarray(O, float), y, y + I.height)
    Ia = np.asarray(I, float)[:O.height - y]
    h = Ia.shape[0]
    d = np.minimum(np.arange(h), np.arange(h)[::-1]) / h
    a = np.clip((d - MARGIN) / BAND, 0, 1)
    a = (a * a * (3 - 2 * a))[:, None, None]
    C[y:y + h] = a * Ia + (1 - a) * C[y:y + h]
    im = Image.fromarray(np.clip(C, 0, 255).astype(np.uint8))
    # To 9:16 exactly (the outpaint comes out a few pixels off), then to the size served.
    w = min(im.width, round(im.height * 9 / 16))
    hh = min(im.height, round(w * 16 / 9))
    cx, cy = (im.width - w) // 2, (im.height - hh) // 2
    im = im.crop((cx, cy, cx + w, cy + hh)).resize(OUT, Image.LANCZOS)
    art = os.path.join(ROOT, product, 'wiki', 'art-src')
    if screens:
        # Where a point of the wide master lands in the tall picture (a * point + b), for the phones' glass.
        f2 = OUT[0] / w
        master = Image.open(os.path.join(screens, f'{slug}.webp')).size
        screens_entry(product, slug, master, f1 * k * f2, (x - cx - s['tallCrop'][0] * f1 * k) * f2, (y - cy - 2 * f1 * k) * f2)
        os.makedirs(os.path.join(art, 'painted'), exist_ok=True)
        im.save(os.path.join(art, 'painted', f'{slug}-tall.webp'), 'WEBP', quality=90, method=6)
    else:
        im.save(os.path.join(art, f'{slug}-tall.webp'), 'WEBP', quality=90, method=6)
        s['tall'] = f'{slug}-tall.webp'
        json.dump(src, open(path, 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
    print(f'{product} {slug}: strip rows {y}-{y + h} of {O.height}, scale {k:.3f}, x {x}, error {err:.1f}')


if __name__ == '__main__':
    args, screens = sys.argv[1:], None
    if '--screens' in args:
        i = args.index('--screens')
        screens = args[i + 1]
        args = args[:i] + args[i + 2:]
    if args[0] == 'crop':
        crop(args[1], args[2], args[3:], screens)
    else:
        compose(*args[:3], screens=screens)
