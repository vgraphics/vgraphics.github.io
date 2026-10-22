# Writes each wiki entry's painting in the sizes the wiki pages use, as AVIF and WebP:
#   <product>/wiki/img/art/<slug>-<width>.avif/.webp        the wide picture (cards, wide screens)
#   <product>/wiki/img/art/<slug>-tall-<width>.avif/.webp   a 3:4 cut from its middle (phones)
#   <product>/wiki/img/art/art.json                          the sizes, which tools/build-wiki.mjs reads
# Usage: python tools/make-wiki-art.py <map.json>
#   map.json: { "<product>": { "<slug>": "<source picture>" | { "wide": "<picture>", "tall": "<picture>" } } }
# The sources are the Recraft paintings (Recraft Pro on gvergidis90, project "Wiki art (Exitwise, Speedometer)").
# Needs Pillow with AVIF support (Pillow 11.3 or later).
import json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
WIDE = [640, 960, 1600, 2400]
TALL = [540, 810, 1152]


def widths(limit, choices):
    out = [w for w in choices if w <= limit]
    # The picture's own width too, when it is well past the last listed size, so wide screens get every pixel there is.
    return out + [limit] if not out or limit > out[-1] * 1.15 else out


def save(im, base, w):
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(f'{base}-{w}.webp', 'WEBP', quality=78, method=6)
    im.save(f'{base}-{w}.avif', 'AVIF', quality=55)
    return im.size


def main(map_file):
    jobs = json.load(open(map_file, encoding='utf-8'))
    for product, entries in jobs.items():
        out = os.path.join(ROOT, product, 'wiki', 'img', 'art')
        os.makedirs(out, exist_ok=True)
        manifest_file = os.path.join(out, 'art.json')
        manifest = json.load(open(manifest_file, encoding='utf-8')) if os.path.exists(manifest_file) else {}
        for slug, src in entries.items():
            wide_src, tall_src = (src['wide'], src.get('tall')) if isinstance(src, dict) else (src, None)
            wide = Image.open(wide_src).convert('RGB')
            ws = widths(wide.width, WIDE)
            for w in ws:
                size = save(wide, os.path.join(out, slug), w)
            tall = Image.open(tall_src).convert('RGB') if tall_src else wide
            if not tall_src:  # a 3:4 cut from the middle of the wide picture
                tw = round(tall.height * 3 / 4)
                x = (tall.width - tw) // 2
                tall = tall.crop((x, 0, x + tw, tall.height))
            ts = widths(tall.width, TALL)
            for w in ts:
                tsize = save(tall, os.path.join(out, slug + '-tall'), w)
            manifest[slug] = {'widths': ws, 'width': size[0], 'height': size[1], 'tall': {'widths': ts, 'width': tsize[0], 'height': tsize[1]}}
            print(product, slug, ws, ts)
        json.dump(dict(sorted(manifest.items())), open(manifest_file, 'w', encoding='utf-8'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1])
