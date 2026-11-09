# Writes the vgraphics.gr company favicon from the VGraphics logo's own shapes (img/vgraphics-logo.png, 555 x 473,
# traced: three letter strokes and four dots), into the site's root, where every company and hub page links them:
#   favicon.svg            the tab icon: the GV letters dark (#1d1d1d, the logo's own) on light browser themes and white
#                          on dark ones (prefers-color-scheme inside the SVG); the dots keep their colours on both
#   favicon.ico            16/32/48 px, white GV on a dark rounded tile, for browsers without SVG favicons (Safari
#                          before 26) and pages with no icon link (/tv, /join): it reads on light and dark tab strips
#   apple-touch-icon.png   180 px, the same on a full dark square (iOS rounds the corners itself)
# George, 9 Nov 2026: "Favicon needs improvent. White GV. Dont change the bullets color." The product pages keep their
# own icons (<product>/assets/, tools/make-brand-assets.py).
# Usage: python tools/make-favicon.py [preview.png]   (Pillow; with a path, also writes a 16/32 px preview sheet on
# light and dark tab strips, enlarged 8x)
import os, sys
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
W, H = 555, 473  # the logo's own size
LETTERS = [  # G, the diagonal, the right stroke
    [(1, 115), (284, 115), (284, 168), (56, 168), (56, 286), (142, 286), (197, 341), (1, 341)],
    [(135, 246), (218, 246), (444, 472), (361, 472)],
    [(391, 245), (445, 245), (445, 441), (391, 387)],
]
DOTS = [  # x, y, r, colour (exactly the logo's)
    (447.5, 26.9, 26.4, '#e5b834'),
    (517.7, 62.1, 28.5, '#d2676c'),
    (400.4, 127.4, 59.0, '#588ffa'),
    (513.2, 152.1, 40.4, '#4b4fd9'),
]
DARK_INK, LIGHT_INK, TILE = '#1d1d1d', '#ffffff', '#111016'  # TILE: the site's dark background (assets/vgraphics.css)


def svg():
    pad = (W - H) / 2  # a square view box, the logo centred
    paths = ''.join(f'<path d="M{"L".join(f"{x} {y}" for x, y in p)}Z"/>' for p in LETTERS)
    dots = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x, y, r, c in DOTS)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {-pad:g} {W} {W}">'
            f'<style>g{{fill:{DARK_INK}}}@media (prefers-color-scheme:dark){{g{{fill:{LIGHT_INK}}}}}</style>'
            f'<g>{paths}</g>{dots}</svg>\n')


def draw(size, ink, back=None, inset=0.0, radius=0.0):
    """The logo at size x size px: on a back tile (rounded by radius, a share of the size) or transparent, the logo
    inset by a share of the size on each side. Drawn 16x larger and scaled down, for smooth edges."""
    k = 16
    big = size * k
    im = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if back:
        d.rounded_rectangle((0, 0, big - 1, big - 1), radius=radius * big, fill=back)
    s = big * (1 - 2 * inset) / W
    ox, oy = big * inset, (big - H * s) / 2
    pt = lambda x, y: (ox + x * s, oy + y * s)
    for p in LETTERS:
        d.polygon([pt(x, y) for x, y in p], fill=ink)
    for x, y, r, c in DOTS:
        cx, cy = pt(x, y)
        d.ellipse((cx - r * s, cy - r * s, cx + r * s, cy + r * s), fill=c)
    return im.resize((size, size), Image.LANCZOS)


def tile(size):
    return draw(size, LIGHT_INK, TILE, inset=1 / 16 if size <= 16 else 0.08, radius=0.2)


def preview(path):
    """The SVG's two looks and the tile at 16 and 32 px, on Chrome's light and dark tab strips, enlarged 8x."""
    strips = [('#dee1e6', DARK_INK), ('#ffffff', DARK_INK), ('#202124', LIGHT_INK), ('#35363a', LIGHT_INK)]
    cells = []
    for back, ink in strips:
        for size in (16, 32):
            cells.append((back, draw(size, ink), size))
            cells.append((back, tile(size), size))
    cell = 40
    sheet = Image.new('RGB', (cell * 4, cell * len(strips)), 'white')
    for i, (back, icon, size) in enumerate(cells):
        x, y = (i % 4) * cell, (i // 4) * cell
        bg = Image.new('RGBA', (cell, cell), back)
        bg.alpha_composite(icon, ((cell - size) // 2, (cell - size) // 2))
        sheet.paste(bg.convert('RGB'), (x, y))
    sheet.resize((sheet.width * 8, sheet.height * 8), Image.NEAREST).save(path)


def main():
    with open(os.path.join(ROOT, 'favicon.svg'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(svg())
    tile(48).save(os.path.join(ROOT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)],
                  append_images=[tile(16), tile(32)])
    touch = Image.new('RGBA', (180, 180), TILE)
    touch.alpha_composite(draw(180, LIGHT_INK, inset=0.14))
    touch.convert('RGB').save(os.path.join(ROOT, 'apple-touch-icon.png'), optimize=True)
    if len(sys.argv) > 1:
        preview(sys.argv[1])


if __name__ == '__main__':
    main()
