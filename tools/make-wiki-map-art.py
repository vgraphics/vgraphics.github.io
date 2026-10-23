# Writes the wiki's world pictures from the game's Recraft level map, laid out as the game lays it on a wide screen:
# each row's column (StreamingAssets/Map/<world>/<row>.jpg) between its two side pictures (StreamingAssets/MapWide/
# <world>/<row>-l.jpg and -r.jpg), at the sides' scale, so nothing is cut or repeated (George, 23 Oct 2026, about the
# old bands, three copies of a map tile side by side: "Look the trees behind. They are clipping. ... Fix it."):
#   <product>/wiki/img/bands/<world>.webp    16:9, 1920x1080: behind the phone in "In the game" on wide screens
#   <product>/wiki/img/worlds/<world>.webp   600x600: the world tiles (the journey and the world map)
# Usage: python tools/make-wiki-map-art.py <Games repo> [product]   (Pillow; product defaults to exitwise)
# The worlds are the product's wiki.json worlds; its "bands" lists the worlds that get a band.
import json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
BAND = (1920, 1080)
TILE = 600


def row(assets, world, n, art):
    # The column is drawn at art["column"] pixels a unit, the sides at art["sideScale"]: bring the column to the sides'.
    col = Image.open(os.path.join(assets, 'StreamingAssets', 'Map', world, f'{n}.jpg')).convert('RGB')
    left = Image.open(os.path.join(assets, 'StreamingAssets', 'MapWide', world, f'{n}-l.jpg')).convert('RGB')
    right = Image.open(os.path.join(assets, 'StreamingAssets', 'MapWide', world, f'{n}-r.jpg')).convert('RGB')
    k = art['sideScale'] / art['column']
    col = col.resize((round(col.width * k), left.height), Image.LANCZOS)
    out = Image.new('RGB', (left.width + col.width + right.width, left.height))
    out.paste(left, (0, 0))
    out.paste(col, (left.width, 0))
    out.paste(right, (left.width + col.width, 0))
    return out


def world_picture(assets, world):
    # One row from the middle of the world, away from where it meets the worlds before and after it. One row only: rows
    # are painted apart, and a tree on the line between two can lose its crown. Returns the row and where its column
    # starts.
    art = json.load(open(os.path.join(assets, '_Project', 'Resources', 'Worlds', world, 'MapArt.json'), encoding='utf-8'))
    n = len(art['rows']) // 2
    pic = row(assets, world, n, art)
    side = Image.open(os.path.join(assets, 'StreamingAssets', 'MapWide', world, f'{n}-l.jpg')).width
    return pic, side


def cut(im, ratio, at=None):
    # The picture at this width:height ratio, its full height, centred on x = at (the middle by default).
    w, h = im.size
    nw = min(w, round(h * ratio))
    nh = round(nw / ratio)
    x = max(0, min(w - nw, round((w / 2 if at is None else at) - nw / 2)))
    return im.crop((x, (h - nh) // 2, x + nw, (h - nh) // 2 + nh))


def main():
    games = sys.argv[1]
    product = sys.argv[2] if len(sys.argv) > 2 else 'exitwise'
    assets = os.path.join(games, 'ArrowPuzzle', 'Assets')
    wiki = json.load(open(os.path.join(ROOT, product, 'wiki', 'wiki.json'), encoding='utf-8'))
    img = os.path.join(ROOT, product, 'wiki', 'img')
    for d in ('bands', 'worlds'):
        os.makedirs(os.path.join(img, d), exist_ok=True)
    for wd in wiki['worlds']:
        pic, side = world_picture(assets, wd['id'])
        # The tile: the column's left edge in its middle, so it shows the path's edge and the scenery beside it.
        tile = cut(pic, 1, side).resize((TILE, TILE), Image.LANCZOS)
        tile.save(os.path.join(img, 'worlds', f"{wd['id']}.webp"), 'WEBP', quality=80, method=6)
        if wd['id'] in wiki.get('bands', []):
            band = cut(pic, BAND[0] / BAND[1]).resize(BAND, Image.LANCZOS)
            band.save(os.path.join(img, 'bands', f"{wd['id']}.webp"), 'WEBP', quality=80, method=6)
        print(wd['id'], pic.size)


main()
