# Writes each wiki entry's painting in the sizes the pages use (tools/build-wiki.mjs, tools/lib/hero.mjs):
#   <product>/wiki/img/art/<slug>-<width>.avif/.webp(/.jpg)        the wide picture (heroes on landscape screens, cards)
#   <product>/wiki/img/art/<slug>-tall-<width>.avif/.webp(/.jpg)   the 9:16 cut for portrait screens, the hero's shape
#   <product>/wiki/img/art/art.json                                the sizes, which the builders read
# from the masters in <product>/wiki/art-src/ (sources.json there says where each came from, its prompt and licence).
# Never larger than the master: a small picture is never upscaled, only served at the sizes it has.
# Usage: python tools/make-wiki-art.py <product> [slug ...]   (default: every entry in the product's sources.json)
#   sources.json: { "about", "entries": { "<slug>": { "master": "<file in art-src>", "tall": "<file>"?, "focus": 0.5?,
#   and the record: how it was made, its prompt, the Recraft project, the upscale } } }
#   tall: a picture of its own for portrait screens (made for them), else a 9:16 cut of the master, centred on focus
#   (0 is the left edge, 1 the right), so the entry's subject stays in the frame.
# Needs Pillow with AVIF support (Pillow 11.3 or later).
import json, os, re, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# Heroes fill the screen's width (up to ultra-wide); phones get the tall cut. The largest size covers a 3440 px wide
# screen at 93%; larger masters stay in art-src.
WIDE, WIDE_JPEG, WIDE_MAX = [640, 1280, 1920, 2560, 3200], [1280, 1920], 3200
TALL, TALL_JPEG = [540, 810, 1080, 1440], [1080]


def widths(limit, choices):
    out = [w for w in choices if w <= limit]
    # The picture's own width too, when it is well past the last listed size, so it gets every pixel there is.
    return out + [limit] if not out or limit > out[-1] * 1.15 else out


def save(im, base, sizes, jpeg):
    for w in sizes:
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f'{base}-{w}.avif', 'AVIF', quality=55)
        r.save(f'{base}-{w}.webp', 'WEBP', quality=78, method=6)
        if w in jpeg:
            r.save(f'{base}-{w}.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
    return r.size


def cut(im, focus):
    # The 9:16 cut, as wide as the picture is tall allows, centred on focus and kept inside the picture.
    w = min(im.width, round(im.height * 9 / 16))
    h = min(im.height, round(w * 16 / 9))
    x = min(max(round(im.width * focus - w / 2), 0), im.width - w)
    return im.crop((x, (im.height - h) // 2, x + w, (im.height - h) // 2 + h))


def main(product, only):
    src = os.path.join(ROOT, product, 'wiki', 'art-src')
    out = os.path.join(ROOT, product, 'wiki', 'img', 'art')
    os.makedirs(out, exist_ok=True)
    sources = json.load(open(os.path.join(src, 'sources.json'), encoding='utf-8'))['entries']
    manifest_file = os.path.join(out, 'art.json')
    manifest = json.load(open(manifest_file, encoding='utf-8')) if os.path.exists(manifest_file) else {}
    for slug, s in sources.items():
        if only and slug not in only:
            continue
        old = re.compile(rf'^{re.escape(slug)}(-tall)?-\d+\.(avif|webp|jpg)$')
        for f in os.listdir(out):
            if old.match(f):
                os.remove(os.path.join(out, f))
        wide = Image.open(os.path.join(src, s['master'])).convert('RGB')
        ws = widths(min(wide.width, WIDE_MAX), WIDE)
        wj = [w for w in WIDE_JPEG if w in ws] or ws[:1]
        size = save(wide, os.path.join(out, slug), ws, wj)
        tall = Image.open(os.path.join(src, s['tall'])).convert('RGB') if s.get('tall') else wide
        tall = cut(tall, s.get('focus', 0.5))
        ts = widths(tall.width, TALL)
        tj = [w for w in TALL_JPEG if w in ts] or ts[-1:]
        tsize = save(tall, os.path.join(out, slug + '-tall'), ts, tj)
        manifest[slug] = {'widths': ws, 'jpeg': wj, 'width': size[0], 'height': size[1],
                          'tall': {'widths': ts, 'jpeg': tj, 'width': tsize[0], 'height': tsize[1]}}
        print(product, slug, ws, ts)
    json.dump(dict(sorted(manifest.items())), open(manifest_file, 'w', encoding='utf-8', newline='\n'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:])
