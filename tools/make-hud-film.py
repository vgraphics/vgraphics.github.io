"""The "Seeing double?" pictures: the same HUD mode shot without a HUD film (the double image a bare windscreen gives)
and with one (one sharp image), for the slider (assets/compare.js) on Speedometer's HUD wiki page and in the landing
page's FAQ answer about the double image (George, 10 Nov 2026, "film-before-after": KEEP), and in the landing page's
HUD chapter, where it carries the film's Amazon link (George, 11 Nov 2026, gear tips variation C; tools/lib/shop.mjs).

    python tools/make-hud-film.py [--stills <folder>] [--shot <name> ...]   (every shot by default)

Every pixel is the app's own drawing, never a painted one: the windscreen stills HudFramesTest renders with the app's
HUD renderer (Promo/speedometer/hud/stills/<style>_<layout>_city.png, 1920x1080; how to make them again:
SpeedometerWallpaper/docs/hud-mode/promo.md in the Games repo). "With film" is the still as it is. "Without film" adds
the windscreen's second reflection: the HUD alone (the still minus the night scene behind it, the scene being the
darkest of the four looks' stills at each pixel, as each look draws over the same drive), softened a little, moved up
and laid over at about half strength, as the glass's outer face reflects the phone a few millimetres above the inner
one.
Writes speedometer-wallpaper/img/hud/film-<shot>-{without,with}-<width>.avif/.webp; a page's compare names
/speedometer-wallpaper/img/hud/film-<shot> with these widths and sizes (tools/lib/compare.mjs).
Needs Pillow with AVIF support (Pillow 11.3 or later), NumPy and SciPy.
"""
import argparse, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SITE, 'speedometer-wallpaper', 'img', 'hud')
LOOKS = ['glass_number', 'horizon_gauge_arc', 'pulse_centre_bar', 'vector_fighter']
# Each shot: its look, the part of the still it shows (left, top, right, bottom) and the widths it's served at. Three
# looks and three framings, so each place on the site has a picture of its own (check-site: every picture once).
SHOTS = {
    'glass': ('glass_number', (240, 40, 1680, 850), [720, 1080, 1440]),   # the wiki's HUD page, 16:9
    'pulse': ('pulse_centre_bar', (480, 140, 1440, 780), [640, 960]),     # the landing page's FAQ answer, 3:2
    'vector': ('vector_fighter', (320, 140, 1600, 860), [640, 960, 1280]),  # the landing page's HUD chapter, 16:9
}
SHIFT = 0.015      # how far up the second image sits, as a share of the still's height
SOFT = 1.2         # its blur, in px
STRENGTH = 0.55    # its brightness against the first image


def stills_folder():
    """Promo/speedometer/hud/stills beside the site's checkout (a worktree of the site sits deeper, so look up a few
    levels)."""
    folder = SITE
    for _ in range(5):
        folder = os.path.dirname(folder)
        path = os.path.join(folder, 'Promo', 'speedometer', 'hud', 'stills')
        if os.path.isfile(os.path.join(path, f'{LOOKS[0]}_city.png')):
            return path
    sys.exit('Promo/speedometer/hud/stills not found beside the site; pass --stills')


def load(folder, look):
    return np.asarray(Image.open(os.path.join(folder, f'{look}_city.png')).convert('RGB')).astype(np.float32) / 255


def scene(stills):
    """The night drive behind the HUD: the darkest of the looks at each pixel. Where all four looks draw (the speed's
    middle), the scene is opened to take their strokes out, keeping the dim horizon line."""
    low = np.min(stills, axis=0)
    opened = ndimage.grey_opening(low, size=(25, 25, 1))
    bright = (low - opened).max(axis=2, keepdims=True) > 0.1
    return np.where(bright, opened, low)


def doubled(still, back):
    hud = np.clip(still - back, 0, 1)
    hud = ndimage.gaussian_filter(hud, sigma=(SOFT, SOFT, 0))
    dy = round(SHIFT * still.shape[0])
    ghost = np.zeros_like(hud)
    ghost[:-dy] = hud[dy:]
    ghost *= STRENGTH
    return 1 - (1 - still) * (1 - ghost)


def save(arr, base, widths):
    im = Image.fromarray(np.round(np.clip(arr, 0, 1) * 255).astype(np.uint8))
    for w in widths:
        r = im if w == im.width else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f'{base}-{w}.avif', 'AVIF', quality=60)
        r.save(f'{base}-{w}.webp', 'WEBP', quality=82, method=6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stills', help='the folder of HudFramesTest stills (Promo/speedometer/hud/stills beside the site)')
    ap.add_argument('--shot', action='append', choices=list(SHOTS), help='only this shot (again for more); all by default')
    args = ap.parse_args()
    folder = args.stills or stills_folder()
    stills = {look: load(folder, look) for look in LOOKS}
    back = scene(list(stills.values()))
    os.makedirs(OUT, exist_ok=True)
    for shot, (look, box, widths) in SHOTS.items():
        if args.shot and shot not in args.shot:
            continue
        left, top, right, bottom = box
        still = stills[look]
        for name, arr in (('without', doubled(still, back)), ('with', still)):
            save(arr[top:bottom, left:right], os.path.join(OUT, f'film-{shot}-{name}'), widths)
        print(f'film-{shot}: {right - left}x{bottom - top}, widths {widths}')


if __name__ == '__main__':
    main()
