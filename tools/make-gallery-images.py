"""Pictures for a product page's screenshot gallery (tools/gallery.mjs), written to <product>/img/gallery/.

    python tools/make-gallery-images.py exitwise --ref feature/exitwise-hero-bleed --recraft <folder>
    python tools/make-gallery-images.py speedometer-wallpaper

Exitwise's game frames are cut from the App Store-size store screenshots in the Games repo (read straight from git,
no checkout needed): the card make_screenshots.py lays the frame on is the whole game screen, 1080x2088. The coin
and bomb are the game's Recraft icons from the same repo. The stage art, the island
pedestals and the other pickups were made in Recraft for the gallery; --recraft is the folder they were saved to.
Needs Pillow with AVIF (12 or later).
"""
import argparse
import io
import json
import os
import subprocess
import sys

from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def find_games():
    """The Games repo beside the site's checkout (a worktree of the site sits deeper, so look up a few levels)."""
    folder = SITE
    for _ in range(5):
        folder = os.path.dirname(folder)
        if os.path.isdir(os.path.join(folder, "Games", ".git")):
            return os.path.join(folder, "Games")
    sys.exit("Games repo not found beside the site; pass --games")


GAMES = None
SHOT_WIDTHS = (360, 540, 720, 1080)
STAGE_WIDE = (960, 1600, 2400)
STAGE_TALL = (640, 960, 1280)

EXITWISE = {
    # make_screenshots.STORES["app-store-6.7"]["card"] on the 1290x2796 store screenshot.
    "card": (105, 600, 1080, 2088),
    "shots": ["1-board", "2-map", "3-mirrors", "4-portals", "5-shutters", "6-chain", "7-paint", "8-switches"],
    # Game icons reused as pickups: (file in docs/store/recraft/icons, name on the site, width written).
    "icons": [("coin", "pickup-coin", 160), ("bomb", "pickup-bomb", 168)],
    "recraft_pickups": ["heart", "key", "gem", "star"],
    "islands": ["jungle", "candy:candyland", "volcano", "lagoon", "crystal:crystalcaves", "clockwork:clockworktown",
                "autumn:autumnwoods"],
}


def blob(ref, path):
    return subprocess.run(["git", "-C", GAMES, "cat-file", "blob", f"{ref}:{path}"], capture_output=True,
                          check=True).stdout


def save(img, out, name, avif=True, webp_quality=80, avif_quality=58):
    if avif:
        img.save(os.path.join(out, f"{name}.avif"), quality=avif_quality, speed=4)
    img.save(os.path.join(out, f"{name}.webp"), quality=webp_quality, method=6)


def scaled(img, width):
    return img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)


def trimmed(img, pad=4):
    """`img` cut to its visible pixels, with a small transparent margin."""
    img = img.convert("RGBA")
    box = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if not box:
        return img
    l, t, r, b = box
    return img.crop((max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, b + pad)))


def rim(island):
    """Where a phone stands on an island pedestal: the island's widest row (the middle of its flat top, seen from
    a little above), as a percentage of its height, for gallery.json's "pedestals"."""
    # The longest unbroken run of each row, so floating pebbles beside the island don't count.
    alpha = island.getchannel("A").point(lambda a: 1 if a > 128 else 0)
    width = island.width
    data = list(alpha.getdata())
    widths = []
    for y in range(island.height):
        best = run = 0
        for v in data[y * width:(y + 1) * width]:
            run = run + 1 if v else 0
            best = max(best, run)
        widths.append(best)
    top = max(widths)
    rows = [y for y, w in enumerate(widths) if w >= top * 0.985]
    return round(100 * rows[len(rows) // 2] / island.height, 1)


def exitwise(ref, recraft, out):
    x, y, w, h = EXITWISE["card"]
    for name in EXITWISE["shots"]:
        frame = Image.open(io.BytesIO(blob(ref, f"docs/store/screenshots/app-store-6.7/{name}.png"))).convert("RGB")
        frame = frame.crop((x, y, x + w, y + h))
        for width in SHOT_WIDTHS:
            save(scaled(frame, width), out, f"{name}-{width}")
        print("shot", name)
    for icon, name, width in EXITWISE["icons"]:
        art = trimmed(Image.open(io.BytesIO(blob(ref, f"docs/store/recraft/icons/{icon}.png"))))
        save(scaled(art, width), out, name, avif=False, webp_quality=88)
        print("pickup", name)
    if not recraft:
        return
    for pickup in EXITWISE["recraft_pickups"]:
        path = os.path.join(recraft, f"pickup-{pickup}.png")
        if os.path.exists(path):
            save(scaled(trimmed(Image.open(path)), 160), out, f"pickup-{pickup}", avif=False, webp_quality=88)
            print("pickup", pickup)
    sinks = {}
    for entry in EXITWISE["islands"]:
        file, _, world = entry.partition(":")
        path = os.path.join(recraft, f"island-{file}.png")
        if os.path.exists(path):
            art = trimmed(Image.open(path))
            save(scaled(art, 640), out, f"island-{world or file}", avif=False, webp_quality=84)
            sinks[world or file] = rim(art)
            print("island", world or file, sinks[world or file])
    if sinks:
        print('"pedestals":', json.dumps(sinks))
    for name, widths in (("stage-wide", STAGE_WIDE), ("stage-tall", STAGE_TALL)):
        for candidate in (f"{name}-up.png", f"{name}.png"):
            path = os.path.join(recraft, candidate)
            if os.path.exists(path):
                art = Image.open(path).convert("RGB")
                for width in widths:
                    save(scaled(art, min(width, art.width)), out, f"{name}-{width}", avif_quality=52, webp_quality=74)
                print("stage", candidate, art.size)
                break


SPEEDOMETER = {
    "shots": ["shot-kmh", "shot-power", "shot-cpu", "shot-wifi"],
    "dials": ["dial-speed", "dial-power", "dial-cpu"],
    # The styles' own renders: logic_render's wallpaper goldens (TopScrimRendererTest, the S25+'s 1080x2340 screen),
    # read from the Games repo. Gallery frames are cut to the site's 540x1200 phones (a few pixels off each side).
    "goldens": "SpeedometerWallpaper/logic_render/src/test/screenshots/wallpaper_{}.png",
    "style_shots": ["amber_night", "torque", "vintage", "glass"],
    # Every style the app sells, for the Styles tiles (img/styles/<name>.webp, 360 px).
    "styles": ["classic", "steel", "graphite", "future", "carbon", "vintage", "amber_night", "rally", "glass", "cockpit",
               "harbour", "track_night", "torque", "circuit", "prism", "aura", "pulse", "vector", "horizon"],
}


def speedometer(ref, out):
    """Classic's frames are the site's 540x1200 pictures (no larger ones exist yet); the other styles' frames and the
    Styles tiles are cut from the app's wallpaper goldens at `ref`; the big dial's three faces float around them."""
    img = os.path.join(SITE, "speedometer-wallpaper", "img")
    for name in SPEEDOMETER["shots"]:
        frame = Image.open(os.path.join(img, f"{name}.webp")).convert("RGB")
        for width in (360, 540):
            save(scaled(frame, width), out, f"{name}-{width}")
        print("shot", name)
    for name in SPEEDOMETER["style_shots"]:
        golden = Image.open(io.BytesIO(blob(ref, SPEEDOMETER["goldens"].format(name)))).convert("RGB")
        keep = round(golden.height * 540 / 1200)
        left = (golden.width - keep) // 2
        frame = golden.crop((left, 0, left + keep, golden.height)).resize((540, 1200), Image.LANCZOS)
        for width in (360, 540):
            save(scaled(frame, width), out, f"style-{name}-{width}")
        print("style shot", name)
    tiles = os.path.join(img, "styles")
    os.makedirs(tiles, exist_ok=True)
    for name in SPEEDOMETER["styles"]:
        golden = Image.open(io.BytesIO(blob(ref, SPEEDOMETER["goldens"].format(name)))).convert("RGB")
        save(scaled(golden, 360), tiles, name, avif=False, webp_quality=82)
        print("style tile", name)
    for dial in SPEEDOMETER["dials"]:
        save(scaled(trimmed(Image.open(os.path.join(img, f"{dial}.webp"))), 240), out, f"pickup-{dial}", avif=False,
             webp_quality=86)
        print("pickup", dial)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("product", choices=["exitwise", "speedometer-wallpaper"])
    parser.add_argument("--ref", default="main", help="Games repo branch or commit to read from")
    parser.add_argument("--recraft", help="folder with the Recraft art made for the gallery")
    parser.add_argument("--games", help="the Games repo (found beside the site by default)")
    args = parser.parse_args()
    global GAMES
    GAMES = args.games or find_games()
    out = os.path.join(SITE, args.product, "img", "gallery")
    os.makedirs(out, exist_ok=True)
    if args.product == "exitwise":
        exitwise(args.ref, args.recraft, out)
    else:
        speedometer(args.ref, out)


if __name__ == "__main__":
    sys.exit(main())
