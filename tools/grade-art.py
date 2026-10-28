# Colour-grades one picture back to its set's balance, for a scene that came out redder or more orange than the rest
# (George, 27 Oct 2026: "Some images on palermo are more oragne than the others. Why?"). In CIE Lab, with the lightness
# left as it is (the drawing and its values don't move):
#   1. warm hues (reds, oranges, yellows) are pulled toward the set's gold by --hue (0 none, 1 all the way),
#   2. their chroma is scaled by --chroma (1 keeps it),
#   3. the shadows, mid-tones and lights are each moved onto the set's mean colour (soft bands, so nothing steps).
# The set's balance is the median of its paintings, kept in the target file:
#   { "shadow": [a, b], "mid": [a, b], "light": [a, b] }   bands: L* below 30, 30 to 60, above 60
# The wiki masters are WebP at quality 90, so a .webp out is written the same way; a .png out (a hero master) is
# lossless. Grade from the original, never from a graded picture (the record in sources.json names the commit that
# holds it).
# A transparent picture (a logo) keeps its alpha and only its opaque pixels count; a logo takes --no-bands, so its gold
# letters only turn to the set's gold and calm down (George, 27 Oct: "Logo is a bit orange too.").
# Usage: python tools/grade-art.py <in> <out> --target <json> [--hue 0.6] [--chroma 0.8] [--no-bands]
#        python tools/grade-art.py <picture> --measure     (prints the band colours and the warm-to-cool ratio)
# Needs numpy and Pillow.
import argparse, json, math
import numpy as np
from PIL import Image

M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
WHITE = np.array([0.95047, 1.0, 1.08883])
BANDS = {'shadow': (None, 30), 'mid': (30, 60), 'light': (60, None)}


def to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    xyz = c @ M.T / WHITE
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def to_rgb(lab):
    fy = (lab[..., 0] + 16) / 116
    f = np.stack([fy + lab[..., 1] / 500, fy, fy - lab[..., 2] / 200], -1)
    xyz = np.where(f ** 3 > 216 / 24389, f ** 3, (116 * f - 16) / (24389 / 27)) * WHITE
    c = xyz @ np.linalg.inv(M).T
    c = np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
    return np.clip(np.round(c * 255), 0, 255).astype(np.uint8)


def band(L, name):
    lo, hi = BANDS[name]
    return (L >= lo if lo is not None else True) & (L < hi if hi is not None else True)


def measure(lab):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C, h = np.hypot(a, b), np.degrees(np.arctan2(b, a)) % 360
    out = {n: [float(a[band(L, n)].mean()), float(b[band(L, n)].mean())] for n in BANDS}
    warm = (C > 8) & ((h < 110) | (h > 330))
    cool = (C > 8) & (h > 150) & (h < 315)
    out['warm_cool'] = float(warm.sum() / max(cool.sum(), 1))
    out['orange'] = float(((C > 25) & (h > 30) & (h < 65)).mean())
    return out


def soft_bands(L):
    s = np.clip((35 - L) / 15, 0, 1)   # all shadow below L* 20, none above 35
    li = np.clip((L - 55) / 15, 0, 1)  # all light above L* 70, none below 55
    return {'shadow': s, 'light': li, 'mid': np.clip(1 - s - li, 0, 1)}


def grade(lab, target, hue, chroma, bands=True, keep=None):
    # keep: the pixels that count (a logo's opaque ones); bands=False skips step 3, for a picture with no navy ground
    # of its own (a logo's gold letters would be pulled toward a painting's mixed mid-tones)
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    keep = np.ones(L.shape, bool) if keep is None else keep
    C, h = np.hypot(a, b), np.degrees(np.arctan2(b, a))
    gold = np.mean([math.degrees(math.atan2(target[n][1], target[n][0])) for n in ('mid', 'light')])
    # warm: reds to yellows (-20 to 100 degrees), easing out to -50 and 130; grey pixels (C* under 3) are left alone
    warm = np.clip(np.minimum(h + 50, 130 - h) / 30, 0, 1) * np.clip((C - 3) / 7, 0, 1)
    d = (gold - h + 180) % 360 - 180
    h = np.radians(h + hue * warm * d)
    C = C * (1 - warm * (1 - chroma))
    a, b = C * np.cos(h), C * np.sin(h)
    # each band's mean onto the target's, twice (the soft bands overlap, so one pass falls a little short)
    w = soft_bands(L)
    for _ in range(2 if bands else 0):
        for n in BANDS:
            sel = band(L, n) & keep
            da, db = target[n][0] - a[sel].mean(), target[n][1] - b[sel].mean()
            a, b = a + w[n] * da, b + w[n] * db
    return np.stack([L, a, b], -1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('src')
    p.add_argument('out', nargs='?')
    p.add_argument('--target')
    p.add_argument('--hue', type=float, default=0.6)
    p.add_argument('--chroma', type=float, default=0.8)
    p.add_argument('--no-bands', action='store_true')
    p.add_argument('--measure', action='store_true')
    o = p.parse_args()
    src = Image.open(o.src)
    alpha = src.getchannel('A') if 'A' in src.getbands() else None  # a transparent picture keeps its alpha
    keep = np.asarray(alpha) > 0 if alpha else None
    lab = to_lab(np.asarray(src.convert('RGB'), dtype=np.float32))
    if o.measure:
        print(json.dumps(measure(lab if keep is None else lab[keep])))
        return
    target = json.load(open(o.target, encoding='utf-8'))
    target = target.get('grade', {}).get('target', target)  # a sources.json with a "grade" record, or the bare target
    out = Image.fromarray(to_rgb(grade(lab, target, o.hue, o.chroma, not o.no_bands, keep)))
    if alpha:
        out.putalpha(alpha)
    if o.out.lower().endswith('.png'):  # a hero master or a logo, kept lossless
        out.save(o.out, 'PNG', optimize=True)
    else:
        out.save(o.out, 'WEBP', quality=90, method=6)
    graded = to_lab(np.asarray(out.convert('RGB'), dtype=np.float32))
    print(o.out, json.dumps(measure(graded if keep is None else graded[keep])))


if __name__ == '__main__':
    main()
