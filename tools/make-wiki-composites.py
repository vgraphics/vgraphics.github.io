# Composes a wiki's paintings from the product's real art, for products whose entries have no painting of their own
# (Palermo Noir's roles, the Lawyer's power cards and its rules): every master is made in code from finished pictures,
# so nothing in it is drawn or lettered by an AI here.
#   role    a chapter scene behind, darkened and softened into a backdrop, with the role's full-length figure cut out of
#           its own art (the ground joined to the border made transparent, as tools/make-cutouts.py does) standing large
#           at about two thirds across; two figures for a pair
#   power   the same backdrop with a power card's picture in a rounded card, a fine gold edge and a soft gold glow
#   scene   a scene as it is, scaled to the master's size
# Each master goes to <slug>.webp in the product's masters (tools/art_src.py) with its record in sources.json
# (tools/make-wiki-art.py then makes the served sizes), and each entry's small square picture to
# <product>/wiki/img/medals/<slug>.webp.
# Usage: python tools/make-wiki-composites.py <product>    (reads compose.json in the product's masters:
#   { "about": "...", "licence": "...", "sizes": [1920, 1080],
#     "scenes": { "<name>": "<picture>" },
#     "entries": { "<slug>": { "kind": "role" | "power" | "scene", "scene": "<name>", "figures": ["<picture>", ...],
#                              "card": "<picture>", "medal": "<picture>", "medalTop": 0.04 } } })
# (Pillow with WebP, NumPy.)
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from art_src import art_src

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
GOLD = (201, 164, 110)


def cover(im, size):
    # Scale to cover the size, then cut the middle
    w, h = size
    k = max(w / im.width, h / im.height)
    r = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))


def backdrop(scene, size):
    # The scene, softened and darkened, with the edges deepened, so a figure or a card stands out in front of it
    bg = cover(scene, size).filter(ImageFilter.GaussianBlur(6))
    bg = ImageEnhance.Brightness(bg).enhance(0.34)
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w * 0.6) / (w * 0.75)) ** 2 + ((yy - h * 0.5) / (h * 0.8)) ** 2)
    v = np.clip(1.15 - d * 0.55, 0.45, 1)[..., None]
    return Image.fromarray((np.asarray(bg).astype(float) * v).clip(0, 255).astype(np.uint8))


def cutout(path):
    # Same as tools/make-cutouts.py: the ground joined to the border becomes transparent, the figure stays solid
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    ground = np.median(border, axis=0)
    diff = np.abs(a - ground).max(axis=2)
    lines = Image.fromarray(((diff > 22) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    fill = lines.convert('L')
    for xy in [(0, 0), (fill.width - 1, 0), (0, fill.height - 1), (fill.width - 1, fill.height - 1)]:
        if fill.getpixel(xy) == 0:
            ImageDraw.floodfill(fill, xy, 128)
    figure = (np.asarray(fill) != 128)
    solid = Image.fromarray((figure * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    soft = np.clip((diff - 8) / 30, 0, 1) * 255
    alpha = np.maximum(np.asarray(solid).astype(float), soft * figure)
    out = Image.fromarray(np.dstack([a.astype(np.uint8), alpha.astype(np.uint8)]), 'RGBA')
    return out.crop(out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())


def glow(size, box, strength):
    # A soft gold light behind a figure or a card
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(box, fill=GOLD + (strength,))
    return layer.filter(ImageFilter.GaussianBlur(size[0] / 14))


def role(bg, figures):
    w, h = bg.size
    canvas = bg.convert('RGBA')
    cuts = [cutout(f) for f in figures]
    tall = h * (0.86 if len(cuts) == 1 else 0.8)
    centres = [0.64] if len(cuts) == 1 else [0.54, 0.74]
    for cut, cx in zip(cuts, centres):
        k = tall / cut.height
        fig = cut.resize((round(cut.width * k), round(tall)), Image.LANCZOS)
        x, y = round(w * cx - fig.width / 2), round(h - fig.height - h * 0.05)
        canvas.alpha_composite(glow((w, h), (x - fig.width * 0.2, y + fig.height * 0.05, x + fig.width * 1.2, y + fig.height * 0.9), 70))
        canvas.alpha_composite(fig, (x, y))
    return canvas.convert('RGB')


def power(bg, card):
    w, h = bg.size
    canvas = bg.convert('RGBA')
    pic = Image.open(card).convert('RGB')
    ch = round(h * 0.84)
    pic = pic.resize((round(pic.width * ch / pic.height), ch), Image.LANCZOS)
    x, y = round(w * 0.64 - pic.width / 2), (h - pic.height) // 2
    radius = round(pic.width * 0.035)
    canvas.alpha_composite(glow((w, h), (x - pic.width * 0.25, y - pic.height * 0.05, x + pic.width * 1.25, y + pic.height * 1.05), 90))
    mask = Image.new('L', pic.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pic.width - 1, pic.height - 1), radius, fill=255)
    canvas.paste(pic, (x, y), mask)
    edge = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(edge).rounded_rectangle((x, y, x + pic.width - 1, y + pic.height - 1), radius, outline=GOLD + (220,), width=3)
    canvas.alpha_composite(edge.filter(ImageFilter.GaussianBlur(0.6)))
    return canvas.convert('RGB')


def medal(path, top):
    # A square from the picture: from near the top for a portrait (the face), else its middle
    im = Image.open(path).convert('RGB')
    s = min(im.width, im.height)
    x = (im.width - s) // 2
    y = round(im.height * top) if im.height > im.width else 0
    y = min(y, im.height - s)
    return im.crop((x, y, x + s, y + s)).resize((320, 320), Image.LANCZOS)


def main(product):
    src = art_src(product)
    medals = os.path.join(ROOT, product, 'wiki', 'img', 'medals')
    os.makedirs(medals, exist_ok=True)
    spec = json.load(open(os.path.join(src, 'compose.json'), encoding='utf-8'))
    size = tuple(spec['sizes'])
    scenes = {k: Image.open(v).convert('RGB') for k, v in spec['scenes'].items()}
    records = {}
    for slug, e in spec['entries'].items():
        if e['kind'] == 'scene':
            master = cover(scenes[e['scene']], size)
            made = f"the {e['scene']} scene ({os.path.basename(spec['scenes'][e['scene']])}) scaled to {size[0]}x{size[1]}"
        elif e['kind'] == 'role':
            master = role(backdrop(scenes[e['scene']], size), e['figures'])
            made = f"the {e['scene']} scene as a backdrop with {', '.join(os.path.basename(f) for f in e['figures'])} cut out in front"
        else:
            master = power(backdrop(scenes[e['scene']], size), e['card'])
            made = f"the {e['scene']} scene as a backdrop with the power card picture {os.path.basename(e['card'])}"
        master.save(os.path.join(src, f'{slug}.webp'), 'WEBP', quality=90, method=6)
        medal(e['medal'], e.get('medalTop', 0.04)).save(os.path.join(medals, f'{slug}.webp'), 'WEBP', quality=86, method=6)
        records[slug] = {'master': f'{slug}.webp', 'focus': 0.5 if e['kind'] == 'scene' else 0.64,
                         'made': f'Composed by tools/make-wiki-composites.py from {made}', 'licence': spec['licence']}
        print(product, slug)
    json.dump({'about': spec['about'], 'entries': records}, open(os.path.join(src, 'sources.json'), 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main(sys.argv[1])
