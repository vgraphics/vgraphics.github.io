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
# A product whose brand folder isn't its site folder names both, brand:site: Palermo Noir's finals are in the VHub
# repo's docs/brand/palermo-noir/final/ and its pages in palermo/ ("python tools/make-brand-assets.py
# D:/Projects/Mine/VHub palermo-noir:palermo"). Its logo is a tall stack (the lamp over PALERMO / NOIR), too small to
# read in a 42 px header, so a <product>-wordmark-transparent.png (the logo's own letters alone) comes before the logo;
# and without a round badge, the small icons are the app icon.
# Palermo Noir's app icon is no longer the lantern in that VHub folder: since 30 Oct it is George's pick B2, the stranger
# (Palermo repo docs/brand/app-icon/final/icon), copied by hand as icon-32 (favicon-32), icon-180 (apple-touch-icon),
# icon-192 (app-icon-1024 at 192) and icon-512 (play-store-512). Running this for palermo-noir:palermo would bring the
# lantern back, so only do it for the logo and copy those four again afterwards.
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def main():
    games = sys.argv[1]
    product, _, site = (sys.argv[2] if len(sys.argv) > 2 else 'exitwise').partition(':')
    final = os.path.join(games, 'docs', 'brand', product, *(sys.argv[3] if len(sys.argv) > 3 else 'final').split('/'))
    out = os.path.join(ROOT, site or product, 'assets')
    os.makedirs(out, exist_ok=True)
    first = lambda *names: next((p for p in (os.path.join(final, n) for n in names) if os.path.exists(p)), None)
    logo = Image.open(first(f'{product}-lockup-transparent.png', f'{product}-wordmark-transparent.png', f'{product}-logo-transparent.png')).convert('RGBA')
    for w in (300, 600):
        logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS).save(os.path.join(out, f'logo-{w}.webp'), 'WEBP', quality=90, method=6)
    Image.open(os.path.join(final, 'icon', 'favicon-32.png')).save(os.path.join(out, 'icon-32.png'), optimize=True)
    Image.open(os.path.join(final, 'icon', 'apple-touch-icon.png')).save(os.path.join(out, 'icon-180.png'), optimize=True)
    badge = Image.open(first(f'{product}-badge.png', os.path.join('icon', 'app-icon-1024.png'))).convert('RGBA')
    for s in (192, 512):
        badge.resize((s, s), Image.LANCZOS).save(os.path.join(out, f'icon-{s}.png'), optimize=True)
    print(product, logo.size, '->', sorted(os.listdir(out)))


main()
