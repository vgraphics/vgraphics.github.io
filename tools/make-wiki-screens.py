# Puts the app's real screens into the phones of a product's wiki paintings (George, 24 Oct 2026, about a Speedometer
# hero: "The screenshot of the speedometer is messy. Check it please. Its an abomination"). Recraft painted each phone
# with a dial of its own, with repeated or garbled numbers and made-up readouts, and the Crisp upscale made them sharp.
# Here every readable dial, number and screen comes from the app: its render-test goldens, or the frames its demo
# drive renders (Games repo, SpeedometerWallpaper; see screens.json for which).
#
# In the product's masters, kept in its own private repo (tools/art_src.py):
#   painted/<slug>.webp   the Recraft painting, as upscaled (never changed here; three were painted again on 24 Oct
#                         with a blank screen, see sources.json)
#   screens/<name>.webp   the app's screens, as the phones show them (made by --screens)
#   screens.json          which screen goes into which phone, and where the phone is
#   <slug>.webp           the master this writes, which tools/make-wiki-art.py serves
#
# Each phone gets a new front: black glass with round corners, the display inset by the bezel, the screen fitted to
# the display (stretched a little at most, past that padded with its own background, never squeezed), Android's status
# bar, the punch-hole camera, a faint sheen and the painting's own grain, warped into the painted glass's corners. The
# screen's light spills a little onto what's around it, whatever the painting has in front of the phone (a hand, a
# clamp, the dashboard) is laid back on top, and made-up text the painting left on a phone's rim is filled in.
#
# Usage:
#   python tools/make-wiki-screens.py <product> [slug ...]                  the masters (default: every entry)
#   python tools/make-wiki-screens.py <product> --screens <Games checkout> [--frames <demo frames folder>]
#                                                                           the screens, from the app's renders
#   python tools/make-wiki-screens.py <product> --check <folder> [slug ...] also writes before/after crops of the
#                                                                           phones to <folder>, for a review
#   python tools/make-wiki-screens.py <product> --blank <folder> [slug ...] the same pictures with every screen
#                                                                           switched off (black glass), into <folder>:
#                                                                           dial-free sources to outpaint from
#   python tools/make-wiki-screens.py <product> --style <style> --screens <Games checkout> slug ...
#                                                                           one of the app's styles into the phones of
#                                                                           those entries and their tall twins: the
#                                                                           spec (screens.json's style-<style>, or
#                                                                           style-<style>-land for a sideways phone),
#                                                                           those screens, then the pictures
# An entry need not be a wiki entry: painted/<name>.webp plus screens.json entries.<name> gives <name>.webp
# (a tall version, an index or privacy hero), and sources.json's "tall" can then name it.
# Then: python tools/make-wiki-art.py <product>, node tools/build-wiki.mjs <product>.
# Needs Pillow with WebP, numpy and opencv-python-headless.
import json
import os
import sys
import zlib

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from art_src import art_src

SS = 2           # the new front is drawn at twice the size it takes in the painting, then scaled down
STATUS_FONT = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Android', 'Sdk', 'platforms', 'android-29', 'data',
                           'fonts', 'Roboto-Medium.ttf')


# ------------------------------------------------------------------------------------------------------ the screens

def status_bar(width=1080):
    """Android's status bar, as an overlay for the top of a wallpaper: the time on the left, signal, Wi-Fi and
    battery on the right, at the size One UI draws them on a 1080 px wide screen (drawn three times larger and scaled
    down), over a soft shade."""
    s, k = 3, width / 1080
    h = round(110 * k)
    ink = Image.new('RGBA', (width * s, h * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(ink)
    white = (255, 255, 255, 235)
    u = k * s
    d.text((62 * u, 58 * u), '21:45', font=ImageFont.truetype(STATUS_FONT, round(40 * u)), fill=white, anchor='lm')
    right = width * s - 64 * u
    d.rounded_rectangle([right - 54 * u, 46 * u, right - 6 * u, 72 * u], radius=6 * u, outline=white, width=round(3 * u))
    d.rectangle([right - 50 * u, 50 * u, right - 19 * u, 68 * u], fill=white)
    d.rectangle([right - 5 * u, 54 * u, right, 64 * u], fill=white)
    for r in (26, 17, 8):
        cx = right - 91 * u
        d.arc([cx - r * u, 70 * u - r * u, cx + r * u, 70 * u + r * u], start=225, end=315, fill=white,
              width=round(5 * u))
    for i in range(4):
        x = right - 174 * u + i * 16 * u
        d.rounded_rectangle([x, (61 - i * 7) * u, x + 10 * u, 70 * u], radius=2 * u, fill=white)
    shade = Image.new('RGBA', (width, round(170 * k)), (0, 0, 0, 0))
    ImageDraw.Draw(shade).rectangle([0, 0, width, round(100 * k)], fill=(0, 0, 0, 60))
    shade = shade.filter(ImageFilter.GaussianBlur(30 * k))
    shade.alpha_composite(ink.resize((width, h), Image.LANCZOS))
    return shade


def home_screen(games):
    """A home screen's icon row, page dots and dock, as an overlay for the foot of a 1080 px wide wallpaper, with the
    app icons the key art's phone shows (Games repo, SpeedometerWallpaper/docs/designs/tools/make_designs.py)."""
    sys.path.insert(0, os.path.join(games, 'SpeedometerWallpaper', 'docs', 'designs', 'tools'))
    sys.dont_write_bytecode = True
    import make_designs as md
    top = 1880
    layer = Image.new('RGBA', (1080, 2400 - top), (0, 0, 0, 0))
    font = ImageFont.truetype(md.roboto('Regular'), 32)
    d = ImageDraw.Draw(layer)
    icons = md.app_icons(150)
    # The app's own launcher icon, both layers of the adaptive icon (make_designs shows only its background).
    launcher = Image.open(os.path.join(md.ART, 'img__launcher__background.png')).convert('RGBA')
    launcher.alpha_composite(Image.open(os.path.join(md.ART, 'img__launcher__foreground.png')).convert('RGBA')
                             .resize(launcher.size, Image.LANCZOS))
    inset = launcher.width * 18 / 108
    launcher = launcher.crop((inset, inset, launcher.width - inset, launcher.height - inset)).resize((150, 150),
                                                                                                    Image.LANCZOS)
    launcher.putalpha(icons['Speedometer'].getchannel('A'))
    icons['Speedometer'] = launcher
    for row, (names, y) in enumerate(((('Clock', 'Calendar', 'Gallery', 'Speedometer'), 1900),
                                       (('Phone', 'Messages', 'Internet', 'Camera'), 2205))):
        for i, name in enumerate(names):
            x = 135 + i * 270
            layer.alpha_composite(icons[name], (x - 75, y - top))
            if row == 0:
                d.text((x + 2, 2094 - top), name, font=font, fill=(0, 0, 0, 150), anchor='mm')
                d.text((x, 2092 - top), name, font=font, fill=(255, 255, 255, 255), anchor='mm')
    for x, a in ((510, 110), (540, 255), (570, 110)):
        d.ellipse([x - 4, 2144 - top, x + 4, 2152 - top], fill=(255, 255, 255, a))
    d.rounded_rectangle([470, 2378 - top, 610, 2384 - top], radius=3, fill=(255, 255, 255, 255))
    return layer


def make_screens(product, games, frames, names=None):
    src = art_src(product)
    spec = json.load(open(os.path.join(src, 'screens.json'), encoding='utf-8'))
    out = os.path.join(src, 'screens')
    os.makedirs(out, exist_ok=True)
    for name, s in spec['screens'].items():
        if names and name not in names:
            continue
        if s['from'] == 'golden':
            path = os.path.join(games, 'SpeedometerWallpaper', s.get('module', 'logic_render'), 'src', 'test',
                                'screenshots', s['file'])
        else:
            path = os.path.join(frames, s['style'], f"{s['frame']:04d}.jpg")
        im = Image.open(path).convert('RGB')
        if s.get('crop'):
            im = im.crop(tuple(s['crop']))
        im.save(os.path.join(out, name + '.webp'), 'WEBP', quality=95, method=6)
        print('screen', name, im.size)
    status_bar().save(os.path.join(out, 'overlay-status-bar.webp'), 'WEBP', lossless=True)
    home_screen(games).save(os.path.join(out, 'overlay-home.webp'), 'WEBP', lossless=True)
    print('overlays: status bar, home screen')


# ------------------------------------------------------------------------------------------------------ the phones

def homography(src, dst):
    return cv2.getPerspectiveTransform(np.float32(src), np.float32(dst))


def side_lengths(q):
    q = np.asarray(q, float)
    top, right = np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[2] - q[1])
    bottom, left = np.linalg.norm(q[2] - q[3]), np.linalg.norm(q[3] - q[0])
    return (top + bottom) / 2, (left + right) / 2


def pad(im, w, h, fill):
    """[im] centred in a w x h canvas, the rest filled with its edge pixels carried on (the wallpaper's plain
    background), its edges mirrored, or a colour, so nothing is squeezed."""
    a = np.asarray(im)
    py, px = h - a.shape[0], w - a.shape[1]
    widths = ((py // 2, py - py // 2), (px // 2, px - px // 2))
    if fill in ('edge', 'mirror'):
        return Image.fromarray(np.pad(a, widths + ((0, 0),), mode='edge' if fill == 'edge' else 'symmetric'))
    return Image.fromarray(np.stack([np.pad(a[..., c], widths, constant_values=v) for c, v in enumerate(fill)], -1))


def fitted(screen, w, h, phone, overlays):
    """The screen at the display's w x h. Up to [stretch] (1.12 = 12 %) it is stretched, which a phone seen at an
    angle hides; past that it is padded with its own edge pixels (fill 'edge', for a wallpaper's plain background),
    mirrored ('mirror') or an [r, g, b] colour. Then the status bar or the home screen go on, at the display's top and
    foot."""
    sw, sh = screen.size
    limit = phone.get('stretch', 1.12)
    fill = phone.get('fill', 'edge')
    want = (h / w) / (sh / sw)
    if want > limit:
        screen = pad(screen, sw, round(sh * want / limit), fill)
    elif want < 1 / limit:
        screen = pad(screen, round(sw / (want * limit)), sh, fill)
    shown = screen.resize((w, h), Image.LANCZOS).convert('RGBA')
    for name in phone.get('overlays', []):
        layer = overlays[name]
        layer = layer.resize((w, round(layer.height * w / layer.width)), Image.LANCZOS)
        shown.alpha_composite(layer, (0, 0 if name == 'status-bar' else h - layer.height))
    return shown.convert('RGB')


def front(phone, screen, size, overlays):
    """The phone's new front, flat: glass, the display with the screen, the camera and the sheen. RGBA."""
    W, H = size
    short = min(W, H)
    glass = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glass)
    gd.rounded_rectangle([0, 0, W - 1, H - 1], radius=phone.get('corner', 0.08) * short, fill=(6, 7, 9, 255))
    b = round(phone.get('bezel', 0.028) * short)
    dw, dh = W - 2 * b, H - 2 * b
    shown = fitted(screen, dw, dh, phone, overlays)
    light = phone.get('light', 0.94)
    shown = Image.fromarray(np.uint8(np.clip(np.asarray(shown, np.float32) * light, 0, 255)))
    mask = Image.new('L', (dw, dh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, dw - 1, dh - 1],
                                           radius=max(0, phone.get('corner', 0.08) * short - b * 0.8), fill=255)
    glass.paste(shown, (b, b), mask)
    camera = phone.get('camera', 'top' if H > W else 'left')
    if camera:
        r = short * 0.018
        cx, cy = {'top': (W / 2, b + short * 0.045), 'left': (b + short * 0.045, H / 2),
                  'right': (W - b - short * 0.045, H / 2)}[camera]
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(4, 4, 6, 255))
    # The sheen: a soft, wide band of reflected light across the glass, brighter towards one corner.
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    t = (xx / W * 0.65 + yy / H * 0.35)
    sheen = np.exp(-((t - phone.get('sheenAt', 0.28)) / 0.16) ** 2) * phone.get('sheen', 0.05)
    sheen += (1 - yy / H) * 0.02
    a = np.asarray(glass, np.float32)
    a[..., :3] = a[..., :3] + (255 - a[..., :3]) * sheen[..., None]
    return Image.fromarray(np.uint8(np.clip(a, 0, 255)), 'RGBA')


def grain_sigma(painting, quad):
    """The painting's own noise, measured just inside the painted phone's edge (its glass and bezel)."""
    q = np.asarray(quad, np.float32)
    x0, y0 = np.maximum(np.floor(q.min(0)).astype(int) - 8, 0)
    x1, y1 = np.ceil(q.max(0)).astype(int) + 8
    crop = painting[y0:y1, x0:x1].astype(np.float32)
    q = q - (x0, y0)
    c = q.mean(0)
    m = np.zeros(crop.shape[:2], np.uint8)
    cv2.fillPoly(m, [np.int32(q)], 1)
    cv2.fillPoly(m, [np.int32((q - c) * 0.97 + c)], 0)
    hp = crop - cv2.GaussianBlur(crop, (0, 0), 2)
    sel = hp[m > 0]
    return float(np.clip(np.median(np.abs(sel)) * 1.4826, 0.5, 6)) if len(sel) else 1.5


def lay_phone(img, painting, phone, screens, overlays):
    quad = np.asarray(phone['glass'], np.float32)
    w, h = side_lengths(quad)
    W, H = round(w * SS), round(h * SS)
    flat = front(phone, screens[phone['screen']], (W, H), overlays)
    xs, ys = quad[:, 0], quad[:, 1]
    pad = round(max(w, h) * 0.35)
    x0, y0 = max(0, int(xs.min()) - pad), max(0, int(ys.min()) - pad)
    x1, y1 = min(img.shape[1], int(xs.max()) + pad + 1), min(img.shape[0], int(ys.max()) + pad + 1)
    if x1 <= x0 or y1 <= y0:
        return
    M = homography([(0, 0), (W, 0), (W, H), (0, H)], (quad - (x0, y0)) * SS)
    big = cv2.warpPerspective(np.asarray(flat), M, ((x1 - x0) * SS, (y1 - y0) * SS), flags=cv2.INTER_LINEAR,
                              borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    warped = cv2.resize(big.astype(np.float32), (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA) / 255
    blur = phone.get('blur', 0.5)
    if blur:
        warped[..., :3] = cv2.GaussianBlur(warped[..., :3], (0, 0), blur)
    alpha = warped[..., 3:]
    colour = np.divide(warped[..., :3], np.maximum(alpha, 1e-4)) * (alpha > 0)
    region = img[y0:y1, x0:x1].astype(np.float32) / 255
    # The screen's light on what's around it.
    spill = phone.get('spill', 0.10)
    if spill:
        glow = cv2.GaussianBlur(colour * alpha, (0, 0), max(w, h) * 0.08)
        region = 1 - (1 - region) * (1 - glow * spill)
    sigma = grain_sigma(painting, quad) / 255 * phone.get('grain', 1.0)
    rng = np.random.default_rng(zlib.crc32(phone['screen'].encode()))
    colour = colour + rng.normal(0, 1, colour.shape).astype(np.float32) * sigma
    region = region * (1 - alpha) + np.clip(colour, 0, 1) * alpha
    img[y0:y1, x0:x1] = np.uint8(np.clip(region, 0, 1) * 255 + 0.5)


def keep_mask(shape, phone, painting):
    """Where the painting stays on top: polygons (with an optional colour test, e.g. skin), each feathered by its
    own amount (an out-of-focus edge, like the dashboard's, wants a wide one)."""
    m = np.zeros(shape[:2], np.float32)
    for k in phone.get('keep', []):
        p = np.zeros(shape[:2], np.uint8)
        cv2.fillPoly(p, [np.int32(np.round(k['poly']))], 1)
        if k.get('test') == 'skin':
            f = painting.astype(np.int32)
            r, g, b = f[..., 0], f[..., 1], f[..., 2]
            p &= ((r > 95) & (r > b + 25) & (r >= g)).astype(np.uint8)
            p = cv2.morphologyEx(p, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        m = np.maximum(m, cv2.GaussianBlur(p.astype(np.float32), (0, 0), k.get('feather', 1.2)))
    return m[..., None]


def clean(img, areas):
    """Made-up glyphs the painting left outside the screens (status-bar text on a phone's rim, button labels on the
    dashboard, marks on a mount) filled in from around them. An area is a polygon, whose pixels clearly brighter than
    their surroundings are inpainted, or {"poly": [...], "all": true}, inpainted whole (a label on a plain face)."""
    for area in areas:
        poly = np.int32(np.round(area['poly'] if isinstance(area, dict) else area))
        x0, y0 = np.maximum(poly.min(0) - 40, 0)
        x1, y1 = np.minimum(poly.max(0) + 41, (img.shape[1], img.shape[0]))
        crop = np.ascontiguousarray(img[y0:y1, x0:x1])
        m = np.zeros(crop.shape[:2], np.uint8)
        cv2.fillPoly(m, [poly - (x0, y0)], 1)
        if not (isinstance(area, dict) and area.get('all')):
            lum = crop.astype(np.float32).mean(2)
            local = cv2.medianBlur(np.uint8(lum), 31).astype(np.float32)
            m = ((lum - local > 18) & (m > 0)).astype(np.uint8)
            m = cv2.dilate(m, np.ones((5, 5), np.uint8))
        img[y0:y1, x0:x1] = cv2.inpaint(crop, m, 6, cv2.INPAINT_TELEA)
    return img


def compose(product, slug, entry, screens, overlays):
    src = art_src(product)
    painting = np.asarray(Image.open(os.path.join(src, 'painted', slug + '.webp')).convert('RGB'))
    base = clean(painting.copy(), entry.get('clean', []))
    img = base.copy()
    for phone in entry['phones']:
        lay_phone(img, painting, phone, screens, overlays)
    for phone in entry['phones']:
        k = keep_mask(img.shape, phone, painting)
        if k.any():
            img = np.uint8(img * (1 - k) + base * k + 0.5)
    out = Image.fromarray(img)
    if entry.get('crop'):
        # A flat band the painting came with (music-calls-messages' foot): cut to the box, back to the painting's size;
        # or a closer frame on the phone (cropTo the box's own size, so nothing is scaled up).
        out = out.crop(tuple(entry['crop'])).resize(tuple(entry.get('cropTo', out.size)), Image.LANCZOS)
    return out


def check(product, slug, entry, out, folder):
    """Before and after crops around the phones, at full size, for a review (into [folder], outside the site)."""
    src = art_src(product)
    os.makedirs(folder, exist_ok=True)
    painted = Image.open(os.path.join(src, 'painted', slug + '.webp')).convert('RGB')
    q = np.concatenate([np.asarray(p['glass']) for p in entry['phones']])
    pad = 60
    box = (max(0, int(q[:, 0].min()) - pad), max(0, int(q[:, 1].min()) - pad),
           min(out.width, int(q[:, 0].max()) + pad), min(out.height, int(q[:, 1].max()) + pad))
    painted.crop(box).save(os.path.join(folder, slug + '-before.jpg'), quality=90)
    out.crop(box).save(os.path.join(folder, slug + '-after.jpg'), quality=90)


def set_style(product, style, slugs):
    """Puts the style's screen into every phone of each entry and its tall twin: screens.json's "style-<style>" in an
    upright phone, "style-<style>-land" in a sideways one. Returns the screens they use."""
    src = art_src(product)
    path = os.path.join(src, 'screens.json')
    spec = json.load(open(path, encoding='utf-8'))
    used = set()
    for slug in slugs:
        for name in (slug, slug + '-tall'):
            for phone in spec['entries'].get(name, {}).get('phones', []):
                w, h = side_lengths(phone['glass'])
                phone['screen'] = f'style-{style}' + ('' if h > w else '-land')
                if phone['screen'] not in spec['screens']:
                    sys.exit(f'{phone["screen"]}: not in screens.json')
                used.add(phone['screen'])
    json.dump(spec, open(path, 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
    return used


def main(argv):
    product, rest = argv[0], argv[1:]
    value = {flag: rest[rest.index(flag) + 1] if flag in rest else None
             for flag in ('--screens', '--frames', '--style', '--check', '--blank')}
    games, frames, style, folder, blank = value.values()
    if games and not style:
        make_screens(product, games, frames)
        return
    if style and not games:
        sys.exit('--style needs --screens <Games checkout>, where the style\'s renders are')
    only = [a for a in rest if not a.startswith('--') and a not in value.values()]
    if style:
        # One style into the named entries' phones: the spec, those screens from the app's renders, then the pictures.
        make_screens(product, games, frames, set_style(product, style, only))
        only += [slug + '-tall' for slug in only]
    src = art_src(product)
    spec = json.load(open(os.path.join(src, 'screens.json'), encoding='utf-8'))
    wanted = {phone['screen'] for slug, entry in spec['entries'].items() if not only or slug in only
              for phone in entry['phones']}
    screens = {name: Image.open(os.path.join(src, 'screens', name + '.webp')).convert('RGB') for name in wanted}
    overlays = {name: Image.open(os.path.join(src, 'screens', f'overlay-{name}.webp')).convert('RGBA')
                for name in ('status-bar', 'home')}
    # The home screen's page dots and dock alone, for a style whose own layout reaches down to the icon row (Future).
    overlays['dock'] = overlays['home'].crop((0, 250, overlays['home'].width, overlays['home'].height))
    if blank:
        # The paintings with the same new front but the screen switched off: dial-free sources for outpainting.
        screens = {name: Image.new('RGB', im.size) for name, im in screens.items()}
        os.makedirs(blank, exist_ok=True)
    for slug, entry in spec['entries'].items():
        if only and slug not in only:
            continue
        for phone in entry['phones']:
            # A phone's own overlays (the home screen on set-as-wallpaper) win over its screen's.
            own = phone.get('overlays', spec['screens'][phone['screen']].get('overlays', []))
            phone['overlays'] = [] if blank else own
        out = compose(product, slug, entry, screens, overlays)
        out.save(os.path.join(blank or src, slug + '.webp'), 'WEBP', quality=90, method=6)
        if folder:
            check(product, slug, entry, out, folder)
        print(product, slug, 'phones', len(entry['phones']))


if __name__ == '__main__':
    main(sys.argv[1:])
