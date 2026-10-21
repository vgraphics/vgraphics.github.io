"""Draws the VGraphics link-preview picture (og:image) of the home, services, multiplayer and VHub pages.

    python tools/make-card.py

Writes assets/img/vgraphics-card-1200x630.jpg in the site's look: the home page's headline beside the four menus
as four colour doors, with the real Exitwise and Speedometer screens. Needs Python 3 with Pillow (with WebP) and
fontTools with brotli, which turn the site's own fonts in assets/fonts into TTF files in a temporary folder.
Run it again after the home page's headline, the menus or the colours change.
"""
import os
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(ROOT, "assets", "img", "vgraphics-card-1200x630.jpg")
W, H, S = 1200, 630, 2  # drawn at twice the size, then scaled down for smooth edges

# The tokens in assets/vgraphics.css
BG, INK, INK2 = "#F6F2EA", "#16151B", "#4A4658"
SUN, CORAL, SKY, VIOLET = "#F4C430", "#EC7472", "#74A2FF", "#4B4CD6"
WHITE = "#FFFFFF"

TMP = tempfile.mkdtemp()


def ttf(name):
    """One of the site's WOFF2 fonts, saved as a TTF file Pillow can read."""
    path = os.path.join(TMP, name + ".ttf")
    font = TTFont(os.path.join(ROOT, "assets", "fonts", name + ".woff2"))
    font.flavor = None
    font.save(path)
    return path


BRICOLAGE = ttf("bricolage-grotesque-latin")  # axes: opsz, wght
COMMISSIONER = ttf("commissioner-latin")  # axis: wght


def display(size, weight=800):
    font = ImageFont.truetype(BRICOLAGE, size * S)
    font.set_variation_by_axes([min(96, size), weight])
    return font


def body(size, weight):
    font = ImageFont.truetype(COMMISSIONER, size * S)
    font.set_variation_by_axes([weight])
    return font


def rgb(hex_colour):
    return tuple(int(hex_colour[i:i + 2], 16) for i in (1, 3, 5))


def mix(top, under, alpha):
    """`top` at `alpha` over `under`, as one opaque colour."""
    return tuple(round(a * alpha + b * (1 - alpha)) for a, b in zip(rgb(top), rgb(under)))


def width(s, font, tracking=0.0):
    """Width of s in 1x pixels, with letter-spacing in em (CSS letter-spacing)."""
    return (sum(font.getlength(ch) for ch in s) + tracking * font.size * (len(s) - 1)) / S


def text(d, x, baseline, s, font, fill, tracking=0.0):
    """Draws s with its left end at x and its baseline at `baseline` (1x pixels); returns where it ends."""
    x, y = x * S, baseline * S
    for ch in s:
        d.text((x, y), ch, font=font, fill=fill, anchor="ls")
        x += font.getlength(ch) + tracking * font.size
    return x / S - tracking * font.size / S


def box(x0, y0, x1, y1):
    return [x0 * S, y0 * S, x1 * S, y1 * S]


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=radius, fill=255)
    out = img.copy()
    out.putalpha(ImageChops.multiply(img.getchannel("A"), mask))
    return out


def arrow(d, x, cy, fill, size=13):
    """The site's arrow icon (a shaft and a head), from x, centred on cy."""
    w = 2.4 * S
    d.line([x * S, cy * S, (x + size) * S, cy * S], fill=fill, width=round(w))
    d.line([(x + size * 0.55) * S, (cy - size * 0.42) * S, (x + size) * S, cy * S, (x + size * 0.55) * S, (cy + size * 0.42) * S],
           fill=fill, width=round(w), joint="curve")


def label(tile, colour, s):
    """A door's label: a white pill with the menu's name in capitals and an arrow."""
    d = ImageDraw.Draw(tile)
    font = body(15, 700)
    tw = width(s, font, 0.06)
    x0, y0, x1, y1 = 18, 18, 18 + 14 + tw + 9 + 13 + 14, 18 + 34
    d.rounded_rectangle(box(x0, y0, x1, y1), radius=17 * S, fill=mix(WHITE, colour, 0.86))
    text(d, x0 + 14, y0 + 22.5, s, font, INK, 0.06)
    arrow(d, x0 + 14 + tw + 9, (y0 + y1) / 2, INK)
    return x1


def shadowed(tile, img, x, y, blur=16, drop=16, strength=0.42):
    """Pastes img at (x, y) in tile pixels (2x) with a soft shadow under it."""
    alpha = Image.new("L", tile.size, 0)
    alpha.paste(img.getchannel("A").point(lambda a: int(a * strength)), (x, y + drop * S))
    tile.paste(Image.new("RGB", tile.size, (0, 0, 0)), (0, 0), alpha.filter(ImageFilter.GaussianBlur(blur * S)))
    tile.paste(img, (x, y), img)


def screen(src, w, frame=0, radius=22):
    """A screenshot w pixels wide (1x) with rounded corners, inside a dark phone frame when `frame` is set."""
    img = Image.open(os.path.join(ROOT, src)).convert("RGBA")
    iw = round((w - 2 * frame) * S)
    img = img.resize((iw, round(img.height * iw / img.width)), Image.LANCZOS)
    if not frame:
        return rounded(img, radius * S)
    f = round(frame * S)
    out = Image.new("RGBA", (img.width + 2 * f, img.height + 2 * f), (0, 0, 0, 0))
    ImageDraw.Draw(out).rounded_rectangle([0, 0, out.width - 1, out.height - 1], radius=radius * S, fill=rgb(INK))
    out.alpha_composite(rounded(img, (radius - frame) * S), (f, f))
    return out


def tilted(img, degrees_clockwise):
    return img.rotate(-degrees_clockwise, Image.BICUBIC, expand=True)


def door(canvas, x, y, w, h, colour, draw):
    """A rounded colour block; `draw(tile)` fills in its content, which the block's edges clip."""
    tile = Image.new("RGB", (w * S, h * S), rgb(colour))
    draw(tile)
    mask = Image.new("L", tile.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, tile.width - 1, tile.height - 1], radius=28 * S, fill=255)
    canvas.paste(tile, (x * S, y * S), mask)


def games(tile):
    label(tile, SUN, "GAMES")
    phone = tilted(screen("assets/img/exitwise-board.webp", 188), -4)
    shadowed(tile, phone, (tile.width - phone.width) // 2, 66 * S)


def apps(tile):
    label(tile, CORAL, "APPS")
    phone = tilted(screen("speedometer-wallpaper/img/shot-kmh.webp", 136, frame=5), 5)
    shadowed(tile, phone, (tile.width - phone.width) // 2, 60 * S)


def services(tile):
    """The tools as stickers, two rows in the bottom right corner (the site's door is wider and stacks four)."""
    label(tile, SKY, "SERVICES")
    font = body(15, 700)
    right, bottom, sh = tile.width / S - 18, tile.height / S - 18, 31
    rows = [(-12, [("Kotlin", VIOLET, -3), ("Unity", CORAL, 2)]), (0, [("Firebase", SUN, -2), ("WebGL", INK, 3)])]
    for r, (shift, row) in enumerate(rows):
        top = bottom - (len(rows) - r) * (sh + 8) + 8
        x = right + shift
        for name, dot, turn in reversed(row):
            sw = 12 + 8 + 7 + width(name, font) + 12
            sticker = Image.new("RGBA", (round(sw * S), sh * S), (0, 0, 0, 0))
            d = ImageDraw.Draw(sticker)
            d.rounded_rectangle([0, 0, sticker.width - 1, sticker.height - 1], radius=11 * S, fill=rgb(WHITE))
            d.ellipse(box(12, sh / 2 - 4, 20, sh / 2 + 4), fill=rgb(dot))
            text(d, 27, 21, name, font, INK)
            turned = tilted(sticker, turn)
            px = round((x - sw) * S - (turned.width - sticker.width) / 2)
            py = round(top * S - (turned.height - sticker.height) / 2)
            shadowed(tile, turned, px, py, blur=7, drop=6, strength=0.3)
            x -= sw + 8


def hub(tile):
    d = ImageDraw.Draw(tile)
    font = body(15, 700)
    tw = width("VHUB", font, 0.06)
    h = tile.height / S
    x0, y0, x1, y1 = 18, h / 2 - 17, 18 + 14 + tw + 9 + 13 + 14, h / 2 + 17
    d.rounded_rectangle(box(x0, y0, x1, y1), radius=17 * S, fill=mix(WHITE, VIOLET, 0.86))
    text(d, x0 + 14, y0 + 22.5, "VHUB", font, INK, 0.06)
    arrow(d, x0 + 14 + tw + 9, h / 2, INK)
    soon = "Coming soon"
    sf = body(14, 700)
    sw = 12 + 8 + 8 + width(soon, sf) + 12
    sx1 = tile.width / S - 18
    # The site's line if it fits between the label and the pill, else a shorter one
    room = sx1 - sw - 14 - (x1 + 14)
    line = next(s for s in ("One account for every game and app", "One account for every game", "One account, every game")
                if width(s, display(17, 700)) <= room)
    text(d, x1 + 14, h / 2 + 6.5, line, display(17, 700), WHITE)
    d.rounded_rectangle(box(sx1 - sw, h / 2 - 15, sx1, h / 2 + 15), radius=15 * S, fill=mix(WHITE, VIOLET, 0.86))
    d.ellipse(box(sx1 - sw + 12, h / 2 - 4, sx1 - sw + 20, h / 2 + 4), fill=rgb(INK))
    text(d, sx1 - sw + 28, h / 2 + 5, soon, sf, INK)


def dots(canvas):
    """The hero's dot grid, faded out from behind the doors."""
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy, rx, ry = 880, 300, 600, 470
    for gy in range(0, H, 26):
        for gx in range(0, W, 26):
            x, y = gx + 13, gy + 13
            t = (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2) ** 0.5
            a = 1.0 if t <= 0.2 else max(0.0, 1 - (t - 0.2) / 0.55)
            if a > 0:
                d.ellipse(box(x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill=rgb(INK) + (int(41 * a),))
    canvas.alpha_composite(layer)


def headline(canvas):
    d = ImageDraw.Draw(canvas)
    x = 64

    # The brand: the logo and the wordmark, as in the header
    logo = Image.open(os.path.join(ROOT, "img", "vgraphics-logo.png")).convert("RGBA")
    lh = 46
    logo = logo.resize((round(logo.width * lh / logo.height * S), lh * S), Image.LANCZOS)
    canvas.alpha_composite(logo, (x * S, 58 * S))
    text(d, x + logo.width / S + 14, 58 + lh / 2 + 8, "VGRAPHICS", display(22), INK, 0.08)

    # "Games, apps / and software, / carefully made." at the largest size that fits beside the doors
    lines = ["Games, apps", "and software,", "carefully made."]
    size = 84
    while max(width(l, display(size), -0.035) for l in lines) > 540 and size > 40:
        size -= 1
    font = display(size)
    lead = size * 0.98
    base = 168 + size * 0.78
    text(d, x, base, lines[0], font, INK, -0.035)
    text(d, x, base + lead, lines[1], font, INK, -0.035)
    word = width("carefully", font, -0.035)
    pad = 0.12 * size
    # The marker's right edge gives back the room the "y" leaves after itself
    d.rounded_rectangle(box(x, base + 2 * lead - 0.80 * size, x + word + 1.75 * pad, base + 2 * lead + 0.22 * size), radius=0.14 * size * S, fill=rgb(SUN))
    end = text(d, x + pad, base + 2 * lead, "carefully", font, INK, -0.035)
    text(d, end + 0.75 * pad + 0.2 * size, base + 2 * lead, "made.", font, INK2, -0.035)

    # A short line, then the address with the logo's four dots
    small = body(22, 500)
    lede = base + 2 * lead + 0.22 * size + 48
    text(d, x, lede, "Our own games and apps, and the ones", small, INK2)
    text(d, x, lede + 31, "we build for clients.", small, INK2)
    for i, c in enumerate((SUN, CORAL, SKY, VIOLET)):
        d.ellipse(box(x + i * 15, 556, x + i * 15 + 10, 566), fill=rgb(c))
    end = text(d, x + 4 * 15 + 10, 568, "vgraphics.gr", body(21, 700), INK)
    text(d, end + 10, 568, "· Thessaloniki, Greece", body(21, 500), INK2)


def main():
    canvas = Image.new("RGBA", (W * S, H * S), rgb(BG) + (255,))
    dots(canvas)
    # The four doors: Games tall on the left, Apps and Services stacked, VHub across the bottom
    x0, y0, gap, col = 640, 56, 14, 241
    door(canvas, x0, y0, col, 232 + gap + 180, SUN, games)
    door(canvas, x0 + col + gap, y0, col, 232, CORAL, apps)
    door(canvas, x0 + col + gap, y0 + 232 + gap, col, 180, SKY, services)
    door(canvas, x0, y0 + 232 + gap + 180 + gap, 2 * col + gap, 78, VIOLET, hub)
    headline(canvas)
    card = canvas.convert("RGB").resize((W, H), Image.LANCZOS)
    # A JPEG, without chroma subsampling so coloured text stays sharp: WhatsApp drops previews much over 300 KB.
    card.save(OUT, quality=90, subsampling=0, optimize=True, progressive=True)
    print(f"{os.path.relpath(OUT, ROOT)}: {card.width}x{card.height}, {os.path.getsize(OUT) // 1024} KB")


if __name__ == "__main__":
    main()
