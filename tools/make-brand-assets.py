# Writes a product's logo and icons for the site from the game repo's brand finals, into <product>/assets/, the one
# place every page takes them from (page.json site.logo, icon, favicon, touchIcon):
#   logo-300.webp, logo-600.webp   the title logo, transparent (the header and the footer)
#   icon-32.png                    the favicon
#   icon-180.png                   the Apple touch icon
#   icon-192.png, icon-512.png     the round icon for small badges (the games and home pages' cards)
# Usage: python tools/make-brand-assets.py <Games repo> [product]   (Pillow; product defaults to exitwise)
# Exitwise's finals are in docs/brand/exitwise/final/: the logo is the key art's painted title (George, 22 Oct 2026),
# the icon the round E, a stand-in while George picks a new one. A new pick replaces the finals; run this again.
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def main():
    games = sys.argv[1]
    product = sys.argv[2] if len(sys.argv) > 2 else 'exitwise'
    final = os.path.join(games, 'docs', 'brand', product, 'final')
    out = os.path.join(ROOT, product, 'assets')
    os.makedirs(out, exist_ok=True)
    logo = Image.open(os.path.join(final, f'{product}-logo-transparent.png')).convert('RGBA')
    for w in (300, 600):
        logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS).save(os.path.join(out, f'logo-{w}.webp'), 'WEBP', quality=90, method=6)
    Image.open(os.path.join(final, 'icon', 'favicon-32.png')).save(os.path.join(out, 'icon-32.png'), optimize=True)
    Image.open(os.path.join(final, 'icon', 'apple-touch-icon.png')).save(os.path.join(out, 'icon-180.png'), optimize=True)
    badge = Image.open(os.path.join(final, f'{product}-badge.png')).convert('RGBA')
    for s in (192, 512):
        badge.resize((s, s), Image.LANCZOS).save(os.path.join(out, f'icon-{s}.png'), optimize=True)
    print(product, logo.size, '->', sorted(os.listdir(out)))


main()
