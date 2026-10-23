# Writes a product's logo and icons for the site from the game repo's brand finals, into <product>/assets/, the one
# place every page takes them from (page.json site.logo, icon, favicon, touchIcon):
#   logo-300.webp, logo-600.webp   the logo, transparent (the header and the footer)
#   icon-32.png                    the favicon
#   icon-180.png                   the Apple touch icon
#   icon-192.png, icon-512.png     the round icon for small badges (the games and home pages' cards)
# Usage: python tools/make-brand-assets.py <Games repo> [product] [finals]   (Pillow; product defaults to exitwise,
# finals to final: the folder under docs/brand/<product>/ that holds the picked finals)
# Exitwise's are in docs/brand/exitwise/round3/final/ (George's pick T4, 23 Oct 2026), so run it with "exitwise
# round3/final". Its logo is the round tower logo with the key art's painted title to its right
# (<product>-lockup-transparent.png; a product without a lockup uses its <product>-logo-transparent.png). The round
# logo alone is only for the favicon and the small badges ("solo only for mobile apps and stores"), and the touch icon
# is the app icon. A new pick replaces the finals; run this again and give page.json site.logo the new size.
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def main():
    games = sys.argv[1]
    product = sys.argv[2] if len(sys.argv) > 2 else 'exitwise'
    final = os.path.join(games, 'docs', 'brand', product, *(sys.argv[3] if len(sys.argv) > 3 else 'final').split('/'))
    out = os.path.join(ROOT, product, 'assets')
    os.makedirs(out, exist_ok=True)
    lockup = os.path.join(final, f'{product}-lockup-transparent.png')
    logo = Image.open(lockup if os.path.exists(lockup) else os.path.join(final, f'{product}-logo-transparent.png')).convert('RGBA')
    for w in (300, 600):
        logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS).save(os.path.join(out, f'logo-{w}.webp'), 'WEBP', quality=90, method=6)
    Image.open(os.path.join(final, 'icon', 'favicon-32.png')).save(os.path.join(out, 'icon-32.png'), optimize=True)
    Image.open(os.path.join(final, 'icon', 'apple-touch-icon.png')).save(os.path.join(out, 'icon-180.png'), optimize=True)
    badge = Image.open(os.path.join(final, f'{product}-badge.png')).convert('RGBA')
    for s in (192, 512):
        badge.resize((s, s), Image.LANCZOS).save(os.path.join(out, f'icon-{s}.png'), optimize=True)
    print(product, logo.size, '->', sorted(os.listdir(out)))


main()
