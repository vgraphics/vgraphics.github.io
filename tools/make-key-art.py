# Writes a product's hero pictures, the sizes page.json hero.art names, from its key art masters:
#   <product>/img/key-art-wide-<width>.avif/.webp (+ .jpg at 960 and 1920)   landscape screens
#   <product>/img/key-art-tall-<width>.avif/.webp (+ .jpg at 1080)           portrait screens up to 4:5, a 9:16 cut
# and prints the "tall" and "wide" entries for page.json (with the wide one's sizes: the hero box is at least 16:10 and
# as tall as the screen, so a wider picture is shown at the box's height). Never larger than the master: a size the
# master can't fill is left out.
# Usage: python tools/make-key-art.py <product> <wide master> <tall master>
#        python tools/make-key-art.py <product> <wide master> --cut <x>   (no tall master: a 9:16 cut of the wide one at
#                                                                         its full height, centred at x, 0 to 1)
#        add --name <name> to write <name>-wide and <name>-tall instead of key-art-wide and key-art-tall: a section's
#        stage picture (page.json "stage"), from the key art's world, in AVIF and WebP only
#        python tools/make-key-art.py <product> <picture> --name <name> --whole   (one picture shown whole, as a scenes
#                                                                         block's: <name>-<width>, AVIF and WebP)
# (Pillow with AVIF.) Old sizes of the same pictures are removed first, so a new key art leaves nothing behind.
import json, os, re, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# Up to 4K (George, 26 Oct 2026: "All of them must be 4k"): 3840 wide, and the tall cut at the same height
WIDE = ([960, 1280, 1920, 2560, 3840], [960, 1920])
TALL = ([480, 720, 1080, 1440, 2160], [1080])


def save(im, out, name, choices):
    sizes, jpegs = choices
    widths = [w for w in sizes if w <= im.width]
    if not widths or widths[-1] < im.width < sizes[-1]:
        widths.append(im.width)  # a master between two sizes is served whole as the largest
    for old in os.listdir(out):
        if re.fullmatch(rf'{name}-\d+\.(avif|webp|jpg)', old):
            os.remove(os.path.join(out, old))
    for w in widths:
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w != im.width else im
        base = os.path.join(out, f'{name}-{w}')
        r.save(f'{base}.avif', 'AVIF', quality=55)
        r.save(f'{base}.webp', 'WEBP', quality=80, method=6)
        if w in jpegs:
            r.save(f'{base}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
    top = widths[-1]
    entry = {'src': f'img/{name}', 'widths': widths, 'jpeg': [w for w in jpegs if w in widths] or None,
             'width': top, 'height': round(im.height * top / im.width)}
    return {k: v for k, v in entry.items() if v is not None}


def main():
    args = sys.argv[1:]
    name = 'key-art'
    if '--name' in args:
        i = args.index('--name')
        name = args[i + 1]
        del args[i:i + 2]
    sys.argv[1:] = args
    product, wide_path = sys.argv[1], sys.argv[2]
    wide = Image.open(wide_path).convert('RGB')
    if sys.argv[3] == '--whole':
        out = os.path.join(ROOT, product, 'img')
        os.makedirs(out, exist_ok=True)
        print(json.dumps(save(wide, out, name, (WIDE[0], []))))
        return
    if sys.argv[3] == '--cut':
        x, w = float(sys.argv[4]), round(wide.height * 9 / 16)
        left = min(max(round(wide.width * x - w / 2), 0), wide.width - w)
        tall = wide.crop((left, 0, left + w, wide.height))
    else:
        tall = Image.open(sys.argv[3]).convert('RGB')
    out = os.path.join(ROOT, product, 'img')
    os.makedirs(out, exist_ok=True)
    # A stage has no JPEG fallback: the template's stages serve AVIF and WebP only
    jpeg = name == 'key-art'
    w = save(wide, out, f'{name}-wide', WIDE if jpeg else (WIDE[0], []))
    t = save(tall, out, f'{name}-tall', TALL if jpeg else (TALL[0], []))
    k = w['width'] / w['height']
    w['sizes'] = f'max(100vw, min({62.5 * k:.0f}vw, {100 * k:.0f}vh))'
    print(json.dumps({'tall': t, 'wide': w}))


main()
