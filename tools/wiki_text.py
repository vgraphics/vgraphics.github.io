# Real words and numbers over the ones the AI drew in a wiki painting (the house rule, George, 26 Oct 2026: readable
# numbers and text in art are never AI-drawn). tools/make-wiki-art.py runs it on an entry with "text" in sources.json
# before it writes the served sizes, so the masters in art-src stay as Recraft made them. Each item paints the
# painting's own letters out of its box and sets the real ones in the game's fonts (<product>/fonts); the tall picture
# gets the same patch, scaled, where its copy of the master's strip ("tallCrop") holds the box.
#   "text": { "tallTop": <the strip's top in the tall picture>, "items": [ item, ... ] }
#   item: "box": [x0, y0, x1, y1] on the master, around the old letters only
#         "ink": "dark" | "light" | "both" | "#rrggbb" | "all", or a list of them: what to paint out, darker, lighter
#                or other than the box's edge (dark), near that colour, or everything (a clock's whole ring of numerals);
#                "threshold": how far (40); "except": "blue" leaves clearly blue pixels and "exceptGrow" px around them
#                (a clock's blue hands and their outline)
#         "fill": "inpaint" | "smooth": OpenCV's inpainting for small letters, or the colours around blended in
#                (inpaint); "known": only colours lighter than this grey level are blended in (a clock's face, not its
#                hands); "knownNear": only colours this close to the box's edge (a tile's own colour, not its rim)
#         "ring": [cx, cy, r0, r1]: only what lies between r0 and r1 from (cx, cy) (a clock's numerals)
#         "text", "font": "nunito" | "lilita", "weight" (Nunito's, 700), "colour" ("#rrggbb", or "ink": the old
#                 letters' own colour, the default), "stroke": [width, "#rrggbb"], and its place and size: "at": [x, y]
#                 (the middle of its letters; the old letters' middle by default) and "size" (their height in px; the
#                 old letters' height by default), or "pt" (the font's size in px) and "baseline": y (a row of words,
#                 its letters standing on one line)
#         "ticks": { "at": [cx, cy], "r": [r0, r1], "width", "colour" ("#rrggbb" or "ink"), "skip": [angles] }: a
#                 clock face's twelve ticks instead of numerals (angles in degrees, clockwise from 12 o'clock)
# Usage (before and after crops for review): python tools/wiki_text.py <product> <slug> <folder>
# Needs Pillow, numpy, opencv-python-headless and fontTools with brotli (for the WOFF2 fonts).
import io, json, math, os, sys
import cv2
import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FONTS = {'nunito': 'nunito-latin.woff2', 'lilita': 'lilita-one-latin.woff2'}
LUMA = np.array([0.299, 0.587, 0.114], dtype=np.float32)
_fonts = {}


def font(product, name, size, weight):
    if name not in _fonts:
        f = TTFont(os.path.join(ROOT, product, 'fonts', FONTS[name]))
        f.flavor = None
        data = io.BytesIO()
        f.save(data)
        _fonts[name] = data.getvalue()
    out = ImageFont.truetype(io.BytesIO(_fonts[name]), size)
    if name == 'nunito':
        out.set_variation_by_axes([weight])
    return out


def ink(arr, it):
    """The old letters in the item's box: a mask of the box, and their own colour."""
    x0, y0, x1, y1 = it['box']
    sub = arr[y0:y1, x0:x1].astype(np.float32)
    edge = np.concatenate([sub[0], sub[-1], sub[:, 0], sub[:, -1]])
    bg = np.median(edge, axis=0)
    level = it.get('threshold', 40)
    kinds = it.get('ink', 'dark')
    mask = np.zeros(sub.shape[:2], bool)
    for kind in kinds if isinstance(kinds, list) else [kinds]:
        if kind.startswith('#'):
            mask |= np.linalg.norm(sub - np.array([int(kind[i:i + 2], 16) for i in (1, 3, 5)]), axis=2) < level
        elif kind == 'dark':
            mask |= sub @ LUMA < bg @ LUMA - level
        elif kind == 'light':
            mask |= sub @ LUMA > bg @ LUMA + level
        elif kind == 'all':
            mask |= True
        else:
            mask |= np.linalg.norm(sub - bg, axis=2) > level * 1.5
    found = mask.copy()
    if it.get('except') == 'blue':
        grow = it.get('exceptGrow', 0)
        blue = (sub[..., 2] - sub[..., 0] >= 60).astype(np.uint8)
        if grow:
            blue = cv2.dilate(blue, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * grow + 1, 2 * grow + 1)))
        mask &= blue == 0
    if 'ring' in it:
        cx, cy, r0, r1 = it['ring']
        yy, xx = np.mgrid[y0:y1, x0:x1]
        r = np.hypot(xx - cx, yy - cy)
        mask &= (r >= r0) & (r <= r1)
    # The old letters' own colour: the quarter of what was found that stands furthest from the box's edge.
    far = np.linalg.norm(sub - bg, axis=2)
    pick = found & (far >= np.percentile(far[found], 75)) if found.any() else found
    colour = tuple(int(c) for c in np.median(sub[pick], axis=0)) if pick.any() else (0, 0, 0)
    return mask, colour


def clear(arr, it, mask):
    x0, y0, x1, y1 = it['box']
    grow = it.get('grow', 4)
    m = cv2.dilate(mask.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * grow + 1, 2 * grow + 1)))
    pad = 24 if it.get('fill', 'inpaint') == 'inpaint' else 48
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(arr.shape[1], x1 + pad), min(arr.shape[0], y1 + pad)
    region = arr[Y0:Y1, X0:X1].copy()
    full = np.zeros(region.shape[:2], np.uint8)
    full[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = m
    if it.get('fill', 'inpaint') == 'inpaint':
        region = cv2.inpaint(region, full, 7, cv2.INPAINT_TELEA)
    else:
        # The colours around the letters, blended into their place (a normalised blur), for big flat letters.
        r = region.astype(np.float32)
        known = (full == 0) & (r @ LUMA > it.get('known', -1))
        if 'knownNear' in it:
            sub = arr[y0:y1, x0:x1].astype(np.float32)
            bg = np.median(np.concatenate([sub[0], sub[-1], sub[:, 0], sub[:, -1]]), axis=0)
            known &= np.linalg.norm(r - bg, axis=2) < it['knownNear']
        known = known.astype(np.float32)
        sigma = max(x1 - x0, y1 - y0) / 6
        num = cv2.GaussianBlur(region.astype(np.float32) * known[..., None], (0, 0), sigma)
        den = cv2.GaussianBlur(known, (0, 0), sigma)[..., None]
        blend = num / np.maximum(den, 1e-3)
        region = np.where(full[..., None] > 0, blend, region).astype(np.uint8)
    arr[Y0:Y1, X0:X1] = region


def ticks(im, spec, ink_colour):
    (cx, cy), (r0, r1), width = spec['at'], spec['r'], spec['width']
    colour = ink_colour if spec.get('colour', 'ink') == 'ink' else spec['colour']
    # Drawn four times larger and scaled down, for smooth edges.
    s, R = 4, r1 + width
    layer = Image.new('RGBA', (2 * R * s, 2 * R * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(12):
        a = i * 30
        if a in spec.get('skip', []):
            continue
        w = width * (1.6 if i % 3 == 0 else 1)
        sx, sy = math.sin(math.radians(a)), -math.cos(math.radians(a))
        d.line([(R * s + sx * r0 * s, R * s + sy * r0 * s), (R * s + sx * r1 * s, R * s + sy * r1 * s)], fill=colour, width=round(w * s))
    layer = layer.resize((2 * R, 2 * R), Image.LANCZOS)
    im.alpha_composite(layer, (round(cx - R), round(cy - R)))


def write(im, product, it, mask, colour):
    x0, y0 = it['box'][:2]
    ys, xs = np.nonzero(mask)
    old = (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1) if len(xs) else None
    at = it.get('at') or ((old[0] + old[2]) / 2, (old[1] + old[3]) / 2)
    stroke = it.get('stroke', [0, None])
    name, weight = it.get('font', 'nunito'), it.get('weight', 700)
    if 'pt' in it:
        f = font(product, name, it['pt'], weight)
    else:
        size = it.get('size') or old[3] - old[1]
        probe = font(product, name, 200, weight)
        l, t, r, b = probe.getbbox(it['text'], stroke_width=round(stroke[0] * 200 / size))
        f = font(product, name, round(200 * size / (b - t)), weight)
    fill = colour if it.get('colour', 'ink') == 'ink' else it['colour']
    draw = ImageDraw.Draw(im)
    if 'baseline' in it:
        draw.text((at[0], it['baseline']), it['text'], font=f, fill=fill, anchor='ms', stroke_width=stroke[0], stroke_fill=stroke[1])
    else:
        l, t, r, b = f.getbbox(it['text'], stroke_width=stroke[0])
        draw.text((at[0] - (l + r) / 2, at[1] - (t + b) / 2), it['text'], font=f, fill=fill, stroke_width=stroke[0], stroke_fill=stroke[1])


def patch(product, wide, spec):
    """The master with its real text."""
    arr = np.array(wide.convert('RGB'))
    found = []
    for it in spec['items']:
        mask, colour = ink(arr, it)
        found.append((mask, colour))
        clear(arr, it, mask)
    im = Image.fromarray(arr).convert('RGBA')
    for it, (mask, colour) in zip(spec['items'], found):
        if 'ticks' in it:
            ticks(im, it['ticks'], colour)
        if 'text' in it:
            write(im, product, it, mask, colour)
    return im.convert('RGB')


def to_tall(orig, patched, tall, crop, top, boxes, margin=16, search=10):
    """The patch laid into the tall picture: each box, scaled as the strip is there, where it matches best."""
    k = tall.width / crop[1]
    out = tall.copy()
    t = np.asarray(tall.convert('L'), dtype=np.float32)
    for x0, y0, x1, y1 in boxes:
        x0, y0, x1, y1 = x0 - margin, y0 - margin, x1 + margin, y1 + margin
        if x0 < crop[0] or x1 > crop[0] + crop[1]:
            print(f'  box {x0, y0, x1, y1} is outside the tall picture\'s strip: not laid in')
            continue
        w, h = round((x1 - x0) * k), round((y1 - y0) * k)
        o = np.asarray(orig.crop((x0, y0, x1, y1)).resize((w, h), Image.LANCZOS).convert('L'), dtype=np.float32)
        px, py = round((x0 - crop[0]) * k), round(y0 * k + top)
        cost = lambda dx, dy: np.abs(t[py + dy:py + dy + h, px + dx:px + dx + w] - o).mean()
        dx, dy = min(((dx, dy) for dx in range(-search, search + 1) for dy in range(-search, search + 1)), key=lambda d: cost(*d))
        feather = max(2, round(margin * k / 2))
        alpha = Image.new('L', (w, h), 0)
        ImageDraw.Draw(alpha).rectangle((feather, feather, w - 1 - feather, h - 1 - feather), fill=255)
        alpha = alpha.filter(ImageFilter.GaussianBlur(feather / 2))
        out.paste(patched.crop((x0, y0, x1, y1)).resize((w, h), Image.LANCZOS), (px + dx, py + dy), alpha)
    return out


def real_text(product, s, wide, tall):
    """The master and the tall picture (None when the entry has no tall picture of its own) with their real text."""
    spec = s['text']
    patched = patch(product, wide, spec)
    if tall is not None:
        tall = to_tall(wide, patched, tall, s['tallCrop'], spec['tallTop'], [it['box'] for it in spec['items']])
    return patched, tall


if __name__ == '__main__':
    product, slug, folder = sys.argv[1:4]
    src = os.path.join(ROOT, product, 'wiki', 'art-src')
    s = json.load(open(os.path.join(src, 'sources.json'), encoding='utf-8'))['entries'][slug]
    wide = Image.open(os.path.join(src, s['master'])).convert('RGB')
    tall = Image.open(os.path.join(src, s['tall'])).convert('RGB') if s.get('tall') else None
    new_wide, new_tall = real_text(product, s, wide, tall)
    boxes = [it['box'] for it in s['text']['items']]
    x0, y0 = min(b[0] for b in boxes) - 60, min(b[1] for b in boxes) - 60
    x1, y1 = max(b[2] for b in boxes) + 60, max(b[3] for b in boxes) + 60
    os.makedirs(folder, exist_ok=True)
    pair = lambda a, b: Image.fromarray(np.hstack([np.asarray(a), np.full((a.height, 12, 3), 255, np.uint8), np.asarray(b)]))
    pair(wide.crop((x0, y0, x1, y1)), new_wide.crop((x0, y0, x1, y1))).save(os.path.join(folder, f'{slug}-wide.png'))
    if tall is not None:
        k, (cx, _), top = tall.width / s['tallCrop'][1], s['tallCrop'], s['text']['tallTop']
        box = (max(0, round((x0 - cx) * k)), round(y0 * k + top), min(tall.width, round((x1 - cx) * k)), round(y1 * k + top))
        pair(tall.crop(box), new_tall.crop(box)).save(os.path.join(folder, f'{slug}-tall.png'))
    print(slug, 'crops in', folder)
