# Writes the small pictures of Exitwise's obstacles and powerups that the wiki and the landing page show beside an
# entry's name (the "Unlocks as you play" journey, an entry's "What it does", the world map's "New here"):
#   exitwise/wiki/img/pieces/<slug>.webp     192 px square, 2x the largest place they're shown (the 76 px medal)
#   exitwise/wiki/img/pieces/board-*.webp    96 px, the rock, bomb, portal, mirror, ice and gates the wiki's playable
#                                            boards draw (assets/wiki.js), each placed on its cell as the game places it
# from the game's own art (George, 23 Oct 2026: "These small icons need to be replaced"): the obstacles from the
# "Rich cartoon" pack (Resources/Traps, docs/obstacle-art), the coin and the powerups from Resources/Icons. Pieces the
# game paints in a world's colour (gates, keys, paint, portals: grey masks) are tinted the colour the wiki's own boards
# use, with the symbol the game draws on them.
# Usage: python tools/make-wiki-pieces.py <Games repo>
import os, sys
from PIL import Image, ImageChops, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'exitwise', 'wiki', 'img', 'pieces')
SIZE, PAD = 192, 0.06
BLUE, YELLOW, GREEN, CREAM = (28, 159, 216), (242, 183, 5), (43, 182, 115), (255, 253, 248)


def load(games, kind, name):
    return Image.open(os.path.join(games, 'ArrowPuzzle', 'Assets', '_Project', 'Resources', kind, name + '.png')).convert('RGBA')


def tint(im, rgb):
    # The game's SpriteRenderer.color: the grey mask times the colour, its shading kept.
    r, g, b, a = im.split()
    grey = Image.merge('RGB', (r, g, b))
    out = ImageChops.multiply(grey, Image.new('RGB', im.size, rgb))
    return Image.merge('RGBA', (*out.split(), a))


def fit(im):
    # The picture's own shape, centred on a square with a little room round it.
    im = im.crop(im.getbbox())
    room = round(SIZE * (1 - 2 * PAD))
    im = im.copy()
    im.thumbnail((room, room), Image.LANCZOS)
    out = Image.new('RGBA', (SIZE, SIZE))
    out.alpha_composite(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
    return out


def symbol(d, kind, cx, cy, r, fill):
    # The colour-blind symbols the wiki's boards and the game draw: a ring for blue, a triangle for yellow.
    if kind == 'circle':
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)
    else:
        d.polygon([(cx, cy - r), (cx + r * 0.95, cy + r * 0.7), (cx - r * 0.95, cy + r * 0.7)], fill=fill)


def shutter(games):
    im = load(games, 'Traps', 'Shutter')
    handle = load(games, 'Traps', 'ShutterHandle')
    w = round(im.width * 0.62)
    handle = handle.resize((w, round(handle.height * w / handle.width)), Image.LANCZOS)
    im.alpha_composite(handle, ((im.width - w) // 2, round(im.height * (1 - 0.216) - handle.height / 2)))
    return im


def gate(games, rgb=BLUE, mark='circle'):
    im = tint(load(games, 'Traps', 'Gate'), rgb)
    d = ImageDraw.Draw(im)
    if mark == 'circle':
        symbol(d, 'circle', im.width / 2, im.height / 2, im.width * 0.09, CREAM)
    else:
        symbol(d, 'triangle', im.width / 2, im.height / 2 + im.height * 0.02, im.width * 0.1, CREAM)
    return im


def two_colour_gate(games):
    im = tint(load(games, 'Traps', 'GateFrame'), BLUE)
    d = ImageDraw.Draw(im)
    cx, cy, pw, ph = im.width / 2, im.height / 2, im.width * 0.539, im.height * 0.516
    d.rounded_rectangle((cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2), radius=im.width * 0.04, fill=CREAM)
    symbol(d, 'circle', cx - pw * 0.22, cy, pw * 0.15, BLUE)
    symbol(d, 'triangle', cx + pw * 0.22, cy + ph * 0.03, pw * 0.17, YELLOW)
    return im


def paint(games):
    im = tint(load(games, 'Traps', 'Paint'), YELLOW)
    d = ImageDraw.Draw(im)
    symbol(d, 'triangle', im.width / 2, im.height / 2 + im.height * 0.02, im.width * 0.1, CREAM)
    return im


def portal(games, dot=True):
    ring = tint(load(games, 'Traps', 'PortalRing'), GREEN)
    im = Image.new('RGBA', ring.size)
    d = ImageDraw.Draw(im)
    c, r = ring.width / 2, ring.width * 0.33
    d.ellipse((c - r, c - r, c + r, c + r), fill=(30, 26, 38))
    # The turning swirl the game draws in the hole: four arms round a white middle.
    for k in range(4):
        d.arc((c - r * 0.75, c - r * 0.75, c + r * 0.75, c + r * 0.75), 90 * k, 90 * k + 55, fill=(110, 104, 128), width=round(r * 0.09))
    if dot:
        d.ellipse((c - r * 0.14, c - r * 0.14, c + r * 0.14, c + r * 0.14), fill=(255, 255, 255))
    im.alpha_composite(ring)
    return im


def key(games):
    im = tint(load(games, 'Traps', 'Key'), YELLOW)
    d = ImageDraw.Draw(im)
    symbol(d, 'triangle', im.width / 2 - 0.27 * im.width, im.height / 2 + 0.006 * im.height, im.width * 0.05, CREAM)
    # The game lays the key on its plate at -45 degrees.
    return im.rotate(45, resample=Image.BICUBIC, expand=True)


PIECES = {
    'rock': lambda g: load(g, 'Traps', 'Boulder1-1'),
    'level-2-rock': lambda g: load(g, 'Traps', 'Boulder2-1'),
    'level-3-rock': lambda g: load(g, 'Traps', 'Boulder3-1'),
    'bomb-arrow': lambda g: load(g, 'Traps', 'Bomb'),
    'chain-bomb': lambda g: load(g, 'Traps', 'ChainBomb'),
    'mirror': lambda g: load(g, 'Traps', 'Mirror'),
    'ice': lambda g: load(g, 'Traps', 'Ice'),
    'shutter': shutter,
    'colour-gate': gate,
    'two-colour-gate': two_colour_gate,
    'paint-tile': paint,
    'portal': portal,
    'colour-switch': key,
    'auto-play': lambda g: load(g, 'Icons', 'AutoPlay'),
    'grid-lines': lambda g: load(g, 'Icons', 'GridLines'),
    'remove-arrow': lambda g: load(g, 'Icons', 'Hammer'),
    'magic-wand': lambda g: load(g, 'Icons', 'Wand'),
    'coins': lambda g: load(g, 'Icons', 'Coin'),
}


# For the boards, uncropped, so the picture's middle is the cell's: the bomb's ball (0.485 of its width) sits over the
# board's charcoal ball and nose, and the portal (its dot drawn by the board, on one of the pair) round its cell. The
# mirror (a "/"; the board flips it for "\"), the ice (its number drawn by the board) and the gates, one per colour with
# its symbol, are cut to their own shape like the rock.
BOARD = {
    'board-rock': lambda g: fit(load(g, 'Traps', 'Boulder1-1')),
    'board-bomb': lambda g: load(g, 'Traps', 'Bomb'),
    'board-portal': lambda g: portal(g, dot=False),
    'board-mirror': lambda g: fit(load(g, 'Traps', 'Mirror')),
    'board-ice': lambda g: fit(load(g, 'Traps', 'Ice')),
    'board-gate-blue': lambda g: fit(gate(g)),
    'board-gate-yellow': lambda g: fit(gate(g, YELLOW, 'triangle')),
}


def main(games):
    os.makedirs(OUT, exist_ok=True)
    for slug, make in PIECES.items():
        fit(make(games)).save(os.path.join(OUT, slug + '.webp'), 'WEBP', quality=90, method=6)
        print(slug)
    for name, make in BOARD.items():
        make(games).resize((96, 96), Image.LANCZOS).save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=90, method=6)
        print(name)


if __name__ == '__main__':
    main(sys.argv[1])
