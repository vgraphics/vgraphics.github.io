# Draws a product's link-preview card, <product>/img/card-1200x630.jpg (page.json social.image), from its key art and
# its approved logo: the art on the right, shaded towards the left, with the logo and one line of words there. The words
# are set in the product's own body face from its theme pack (theme.json, the font without "preload"), so nothing on
# the card is AI-drawn. Under WhatsApp's ~300 KB limit.
# Usage: python tools/make-product-card.py <product> <key art> <logo, transparent PNG> "<line>" [x]
#   x: the point across the art (0 to 1, 0.62 by default) set at 66 % of the card's width, so the left stays calm for
#      the logo; Palermo Noir's card uses 0.5
# (Pillow, fontTools with brotli for the WOFF2.)
import io, json, os, sys
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
W, H = 1200, 630


def font(theme, size):
    face = next(f for f in theme['fonts'] if not f.get('preload'))
    ttf = io.BytesIO()
    t = TTFont(os.path.join(ROOT, face['src'].lstrip('/')))
    t.flavor = None
    t.save(ttf)
    ttf.seek(0)
    return ImageFont.truetype(ttf, size)


def main():
    product, art_path, logo_path, line = sys.argv[1:5]
    x = float(sys.argv[5]) if len(sys.argv) > 5 else 0.62
    theme = json.load(open(os.path.join(ROOT, product, 'theme', 'theme.json'), encoding='utf-8'))
    page, ink = theme['tokens']['page'], theme['tokens']['ink']
    art = Image.open(art_path).convert('RGB')
    scale = H * 1.04 / art.height
    art = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
    # The art's point x lands at 66 % of the card's width; where the art doesn't reach, its own corner colour goes on.
    card = Image.new('RGB', (W, H), art.getpixel((2, 2)))
    card.paste(art, (round(W * 0.66 - art.width * x), (H - art.height) // 2))
    card = card.convert('RGBA')
    shade = Image.new('RGBA', (W, H))
    r, g, b = (int(page[i:i + 2], 16) for i in (1, 3, 5))
    for px in range(W):
        a = max(0, min(235, round(235 * (1 - (px - 330) / 330)))) if px > 330 else 235
        ImageDraw.Draw(shade).line([(px, 0), (px, H)], fill=(r, g, b, a))
    card.alpha_composite(shade)
    logo = Image.open(logo_path).convert('RGBA')
    logo.thumbnail((400, 230), Image.LANCZOS)
    top = (H - logo.height - 70) // 2
    card.alpha_composite(logo, (64, top))
    f = font(theme, 34)
    ImageDraw.Draw(card).text((66, top + logo.height + 30), line, font=f, fill=ink)
    out = os.path.join(ROOT, product, 'img', 'card-1200x630.jpg')
    card.convert('RGB').save(out, 'JPEG', quality=86, optimize=True, progressive=True)
    print(out, os.path.getsize(out) // 1024, 'KB')


main()
