# Cuts figures drawn in light lines on a flat dark ground (Palermo Noir's cast: gold engraving on navy) out of their
# ground, for a theme's edge ornaments (theme.json ornaments.edges): the ground joined to the picture's border becomes
# transparent and everything the figure's outline encloses stays solid, so its dark clothes don't turn see-through.
# Each figure is cropped to itself and written as <product>/img/orn/<name>-<width>.avif and .webp (with alpha), never
# larger than the master; the theme.json entries are printed.
# Usage: python tools/make-cutouts.py <product> <name>=<master> [<name>=<master> ...]
# (Pillow with AVIF and NumPy.)
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
WIDTHS = [260, 520]


def cutout(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    ground = np.median(border, axis=0)
    diff = np.abs(a - ground).max(axis=2)
    lines = Image.fromarray(((diff > 22) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    # Fill the ground from the border: whatever the fill can't reach is the figure
    fill = lines.convert('L')
    for xy in [(0, 0), (fill.width - 1, 0), (0, fill.height - 1), (fill.width - 1, fill.height - 1)]:
        if fill.getpixel(xy) == 0:
            ImageDraw.floodfill(fill, xy, 128)
    figure = (np.asarray(fill) != 128)
    solid = Image.fromarray((figure * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    soft = np.clip((diff - 8) / 30, 0, 1) * 255  # the outermost strokes, antialiased
    alpha = np.maximum(np.asarray(solid).astype(float), soft * figure)
    rgba = np.dstack([a.astype(np.uint8), alpha.astype(np.uint8)])
    out = Image.fromarray(rgba, 'RGBA')
    return out.crop(out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())


def main():
    product = sys.argv[1]
    out = os.path.join(ROOT, product, 'img', 'orn')
    os.makedirs(out, exist_ok=True)
    edges = []
    for arg in sys.argv[2:]:
        name, path = arg.split('=', 1)
        fig = cutout(path)
        widths = [w for w in WIDTHS if w <= fig.width]
        if not widths or widths[-1] < fig.width < WIDTHS[-1]:
            widths.append(fig.width)  # a figure between two sizes is served whole as the largest
        for w in widths:
            r = fig.resize((w, round(fig.height * w / fig.width)), Image.LANCZOS)
            r.save(os.path.join(out, f'{name}-{w}.avif'), 'AVIF', quality=60)
            r.save(os.path.join(out, f'{name}-{w}.webp'), 'WEBP', quality=82, method=6)
        top = widths[-1]
        edges.append({'src': f'/{product}/img/orn/{name}', 'widths': widths, 'width': top, 'height': round(fig.height * top / fig.width)})
    print(json.dumps(edges, indent=2))


main()
