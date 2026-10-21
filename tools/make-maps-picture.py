"""Draws the Custom maps picture of the multiplayer page, also shown on the services page's Custom maps card.

    python tools/make-maps-picture.py

Writes assets/img/exitwise-maps.webp: three Exitwise boards in three of the editor's shapes and world looks (a heart in
Clockwork town, a ring in Autumn woods, a diamond in the Crystal caves), cut from the store screenshots in exitwise/img
and fanned out like cards. The background stays transparent, so the dark blocks the picture sits on show through.
Needs Python 3 with Pillow (with WebP). Run it again after those screenshots change.
"""
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(ROOT, "assets", "img", "exitwise-maps.webp")
W, H, S = 1200, 680, 2  # drawn at twice the size, then scaled down for smooth edges

# Crop boxes in the screenshots' 720x1280 pixels: each board and the world around it, without the level's buttons
# and counters above and below.
HEART = (60, 460, 660, 1132)
RING = (60, 399, 660, 1139)
DIAMOND = (60, 399, 660, 1139)


def shot(name):
    return Image.open(os.path.join(ROOT, "exitwise", "img", name + ".webp")).convert("RGB")


def without_stray_arrow(img):
    """The Crystal caves shot has the tail of an arrow flying off its right edge, which reads as a glitch once cropped:
    fills it in from the plain sky just above and below it."""
    x0, y0, x1, y1 = 600, 428, 660, 443
    above = img.crop((x0, y0 - 1, x1, y0))
    below = img.crop((x0, y1, x1, y1 + 1))
    for y in range(y0, y1):
        img.paste(Image.blend(above, below, (y - y0 + 1) / (y1 - y0 + 1)), (x0, y))
    return img


def board(img, crop, w, radius=28):
    """The crop of a screenshot, w pixels wide (1x), with rounded corners."""
    img = img.crop(crop)
    iw = round(w * S)
    img = img.resize((iw, round(img.height * iw / img.width)), Image.LANCZOS)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius=radius * S, fill=255)
    img.putalpha(mask)
    return img


def place(canvas, img, cx, cy, degrees_clockwise, blur=22, drop=20, strength=0.6):
    """Turns img, centres it on (cx, cy) in 1x pixels and pastes it with a soft shadow under it."""
    # Premultiplied while turning, so the transparent corners don't darken the edges
    img = img.convert("RGBa").rotate(-degrees_clockwise, Image.BICUBIC, expand=True).convert("RGBA")
    x, y = round(cx * S - img.width / 2), round(cy * S - img.height / 2)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow.paste((8, 10, 24, 255), (x, y + drop * S), img.getchannel("A").point(lambda a: int(a * strength)))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(blur * S)))
    canvas.alpha_composite(img, (x, y))


def main():
    canvas = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    # The ring and the diamond behind, turned out to the sides; the heart in front
    place(canvas, board(shot("7-paint"), RING, 380), 261, 357, -7)
    place(canvas, board(without_stray_arrow(shot("5-shutters")), DIAMOND, 380), 939, 357, 7)
    place(canvas, board(shot("8-switches"), HEART, 500), 600, 312, 0)
    picture = canvas.convert("RGBa").resize((W, H), Image.LANCZOS).convert("RGBA")
    picture.save(OUT, quality=90, method=6)
    print(f"{os.path.relpath(OUT, ROOT)}: {picture.width}x{picture.height}, {os.path.getsize(OUT) // 1024} KB")


if __name__ == "__main__":
    main()
