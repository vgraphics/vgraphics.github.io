"""Draws the link-preview picture (og:image) of every style page, from the product's own pictures.

    python tools/make-style-cards.py

For each product with styles/styles.json (tools/make-style-pages.mjs), writes <product>/img/styles/cards/<slug>.jpg,
1200x630: the product's key art, blurred and darkened, behind the style's name and price in the product's display
font, and the style's real render (img/styles/<image>.webp, cut from the app's goldens) in a phone frame. No drawn
gauges: the dial is the app's own picture. Needs Python 3 with Pillow (with WebP) and fontTools with brotli, which turn
the product's WOFF2 font into a TTF file in a temporary folder. Run it again after a style, its picture or its price
changes.
"""
import json
import os
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
W, H, S = 1200, 630, 2  # drawn at twice the size, then scaled down for smooth edges
TMP = tempfile.mkdtemp()

# Speedometer's theme pack tokens (speedometer-wallpaper/theme/theme.json)
PAGE, INK, ACCENT, AMBER, GREEN, FRAME = "#0B0B0C", "#ECECEE", "#F04A2C", "#FFB547", "#4BD66B", "#1A1A1D"


def ttf(product, name):
    """The product's WOFF2 font, saved as a TTF file Pillow can read."""
    path = os.path.join(TMP, name + ".ttf")
    if not os.path.exists(path):
        font = TTFont(os.path.join(ROOT, product, "fonts", name + ".woff2"))
        font.flavor = None
        font.save(path)
    return path


def cover(img, w, h):
    """img scaled to fill w x h, cut to its middle."""
    scale = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left, top = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((left, top, left + w, top + h))


def fitted(product, name, size, text, width):
    """The display font at size, smaller until text fits width."""
    while True:
        font = ImageFont.truetype(ttf(product, name), size)
        if font.getlength(text) <= width or size <= 40:
            return font
        size -= 4


def card(product, style, price, title):
    w, h = W * S, H * S
    art = Image.open(os.path.join(ROOT, product, "img", "key-art-1920.jpg")).convert("RGB")
    out = cover(art, w, h).filter(ImageFilter.GaussianBlur(14 * S))
    # The page's colour over it, darkest on the left where the words go.
    alpha = Image.new("L", (w, 1))
    alpha.putdata([round(255 * (0.94 - 0.5 * x / w)) for x in range(w)])
    shade = Image.new("RGBA", (w, h), PAGE)
    shade.putalpha(alpha.resize((w, h)))
    out = Image.alpha_composite(out.convert("RGBA"), shade)

    # The style's real render in a phone frame, on the right.
    shot = Image.open(os.path.join(ROOT, product, "img", "styles", style["image"] + ".webp")).convert("RGB")
    ph = 556 * S
    pw = round(shot.width * ph / shot.height)
    shot = shot.resize((pw, ph), Image.LANCZOS)
    border, radius = 7 * S, 30 * S
    x, y = round(w * 0.74 - pw / 2), (h - ph) // 2
    shadow = Image.new("RGBA", (w, h))
    ImageDraw.Draw(shadow).rounded_rectangle((x - border, y - border + 18 * S, x + pw + border, y + ph + border + 18 * S), radius + border, fill=(0, 0, 0, 170))
    out = Image.alpha_composite(out, shadow.filter(ImageFilter.GaussianBlur(22 * S)))
    draw = ImageDraw.Draw(out)
    draw.rounded_rectangle((x - border, y - border, x + pw + border, y + ph + border), radius + border, fill=FRAME)
    mask = Image.new("L", (pw, ph))
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph - 1), radius, fill=255)
    out.paste(shot, (x, y), mask)

    # The words, on the left: the product, the style's name, its price.
    left, width = 76 * S, round(w * 0.74 - pw / 2) - 76 * S - 48 * S
    name = style["name"].upper()
    small = ImageFont.truetype(ttf(product, "saira-condensed-600"), 30 * S)
    big = fitted(product, "saira-condensed-800", 132 * S, name, width)
    tag = ImageFont.truetype(ttf(product, "saira-condensed-600"), 44 * S)
    draw.text((left, 196 * S), title.upper(), font=small, fill=ACCENT)
    draw.text((left, 236 * S), name, font=big, fill=INK)
    label = "FREE" if style["free"] else price
    draw.text((left, 236 * S + big.size + 26 * S), label, font=tag, fill=GREEN if style["free"] else AMBER)
    return out.convert("RGB").resize((W, H), Image.LANCZOS)


def main():
    for product in sorted(os.listdir(ROOT)):
        data_file = os.path.join(ROOT, product, "styles", "styles.json")
        if not os.path.isfile(data_file):
            continue
        with open(data_file, encoding="utf-8") as f:
            data = json.load(f)
        with open(os.path.join(ROOT, product, "page.json"), encoding="utf-8") as f:
            title = json.load(f)["site"]["name"]
        with open(os.path.join(ROOT, product, "play", "page.json"), encoding="utf-8") as f:
            demo = next(b for s in json.load(f)["sections"] for b in s.get("blocks", []) if b["type"] == "try")
        price = demo.get("prices", {}).get("premium", "")
        folder = os.path.join(ROOT, product, "img", "styles", "cards")
        os.makedirs(folder, exist_ok=True)
        for style in data["styles"]:
            path = os.path.join(folder, style["slug"] + ".jpg")
            card(product, style, price, title).save(path, quality=86, optimize=True, progressive=True)
            print(os.path.relpath(path, ROOT).replace(os.sep, "/"))


if __name__ == "__main__":
    main()
