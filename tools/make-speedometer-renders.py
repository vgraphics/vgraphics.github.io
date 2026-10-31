"""The app's real renders the Speedometer pages show beside their own: each place gets a picture of its own (George,
26 Oct 2026: "Each art must be used only once!!"), written to speedometer-wallpaper/img/renders/.

    python tools/make-speedometer-renders.py [--ref main] [--games <Games repo>] [--promo <frames folder>]

Every picture is the app's own drawing, never a painted one:
- "golden:<name>": logic_render's or feature_screens' screenshot goldens in the Games repo (read straight from git at
  --ref, no checkout needed);
- "drive:<style>/<frame>": a frame of the Promo demo drive (Promo/speedometer/frames/<style>/<frame>.jpg, the app's
  engine at the drive's speed; the frame number sets the speed).
A "phone" is the whole screen at 540x1200, as the site's other phones; a "dial" is the big dial alone, a 480 px circle
on a transparent ground, as img/dial-*.webp. Every design these come from draws its big dial at the same place.
The gallery (tools/make-gallery-images.py) takes its frames and floating dials from here too.
A name never ends in a number (classic-119kmh, not classic-119): check-site reads <name>-<number> as one picture's
sizes.
Needs Pillow with WebP.
"""
import argparse, io, os, subprocess, sys
from PIL import Image, ImageDraw

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SITE, "speedometer-wallpaper", "img", "renders")
GOLDENS = {
    "logic": "SpeedometerWallpaper/logic_render/src/test/screenshots/{}.png",
    "screens": "SpeedometerWallpaper/feature_screens/src/test/screenshots/{}.png",
}
# The big dial's middle on the app's 1080x2400 screen. Each dial below gives the radius that holds its bezel and
# nothing around it: Classic's small gauges and Future's clock sit just outside.
DIAL = (540, 969)

# name: (source, "phone", a dial's radius, or (radius, (x, y)) for a dial away from DIAL). Where each is shown is in
# the comment beside it.
RENDERS = {
    # The landing page's gallery (make-gallery-images.py), one per slide and floating dial.
    "prism-119kmh": ("drive:prism/0520", "phone"),                             # GPS: Prism at 119 km/h
    "amber-night-119kmh": ("drive:amber_night/0520", "phone"),                 # Amber Night at 119 km/h
    "carbon-power": ("golden:logic/skin_carbon_classic_power", "phone"),       # Power
    "torque-71kmh": ("drive:torque/0468", "phone"),                            # Torque at 71 km/h
    "vintage-pair-power": ("golden:logic/skin_vintage_pair_power", "phone"),   # Vintage
    "track-night-power": ("golden:logic/skin_track_night_power", "phone"),     # Every gauge
    "glass-49kmh": ("drive:glass/0156", "phone"),                              # Glass at 49 km/h
    # The skins' layouts draw their big dial lower since the app's layout fit of 27 Oct 2026, each where measured.
    "dial-vintage-power": ("golden:logic/skin_vintage_classic_power", (462, (537, 1006))),
    "dial-classic-17kmh": ("drive:classic/0104", 462),
    "dial-future-49kmh": ("drive:future/0156", 465),
    # /apps/ and the home page's Apps door: George's picks (26 Oct 2026: "Use prism, use vintage speedometer and clock,
    # use aura tower, use glass."), each in a layout or reading no other page shows.
    "prism-twin-kmh": ("golden:logic/cluster_prism_twin_kmh", "phone"),               # /apps/ hero phone
    "dial-aura-tower-kmh": ("golden:logic/cluster_aura_tower_kmh", (404, (540, 640))),  # /apps/ hero dial
    "aura-tower-power": ("golden:logic/cluster_aura_tower_power", "phone"),           # /apps/ screens
    # Vintage's speedometer and clock (skin_vintage_power is its Console layout, which George removed on 29 Oct 2026),
    # in the reading with every lamp lit: its power reading is Vintage's Styles tile.
    "vintage-speedo-clock-power": ("golden:logic/skin_vintage_pair_long_texts", "phone"),  # /apps/ screens
    "glass-column-power": ("golden:logic/skin_glass_column_power", "phone"),          # /apps/ screens
    "glass-119kmh": ("drive:glass/0520", "phone"),                                    # the home page's Apps door
    # The home page's Speedometer block.
    "dial-classic-71kmh": ("drive:classic/0468", 462),
    # The wiki's medals.
    "dial-classic-49kmh": ("drive:classic/0156", 462),                         # classic-design
    "dial-classic-104kmh": ("drive:classic/0624", 462),                        # big-gauge
    "dial-classic-31kmh": ("drive:classic/0312", 462),                         # gps-speed
    # Cockpit's classic layout went in the layout fit: its pair's big dial, top of the screen.
    "dial-cockpit-power": ("golden:logic/skin_cockpit_pair_power", (464, (541, 612))),        # power
    "dial-rally-power": ("golden:logic/skin_rally_classic_power", (462, (538, 1006))),        # big-gauge-tile
    "dial-future-cpu": ("golden:logic/future_cpu", 465),                       # cpu-clock
    "settings-owned": ("golden:screens/app_settings_owned_allowed", "phone"),  # restoring-future
}


def beside(path, marker):
    """A folder beside the site's checkout, known by `marker` inside it (a worktree of the site sits deeper, so look up
    a few levels; the site's own games/ folder is not the Games repo)."""
    folder = SITE
    for _ in range(5):
        folder = os.path.dirname(folder)
        if os.path.isdir(os.path.join(folder, path, marker)):
            return os.path.join(folder, path)
    sys.exit(f"{path} not found beside the site; pass it")


def source(spec, games, ref, promo):
    kind, _, what = spec.partition(":")
    if kind == "golden":
        group, _, name = what.partition("/")
        data = subprocess.run(["git", "-C", games, "cat-file", "blob", f"{ref}:{GOLDENS[group].format(name)}"],
                              capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(data)).convert("RGB")
    return Image.open(os.path.join(promo, f"{what}.jpg")).convert("RGB")


def phone(img):
    # The site's phones are 540x1200 (9:20): a taller screen loses a few pixels at each side.
    keep = min(img.width, round(img.height * 540 / 1200))
    left = (img.width - keep) // 2
    return img.crop((left, 0, left + keep, img.height)).resize((540, 1200), Image.LANCZOS)


def dial(img, r, centre=DIAL):
    if img.size != (1080, 2400):
        sys.exit(f"a dial is cut from a 1080x2400 screen, not {img.size}")
    x, y = centre
    out = img.crop((x - r, y - r, x + r, y + r)).convert("RGBA")
    # The circle, drawn four times larger and scaled down for a smooth edge.
    mask = Image.new("L", (out.width * 4, out.height * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, mask.width - 1, mask.height - 1), fill=255)
    out.putalpha(mask.resize(out.size, Image.LANCZOS))
    return out.resize((480, 480), Image.LANCZOS)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--ref", default="main", help="Games repo branch or commit to read the goldens from")
    parser.add_argument("--games", help="the Games repo (found beside the site by default)")
    parser.add_argument("--promo", help="the demo drive's frames (Promo/speedometer/frames beside the site by default)")
    args = parser.parse_args()
    games = args.games or beside("Games", ".git")
    promo = args.promo or beside(os.path.join("Promo", "speedometer", "frames"), "classic")
    os.makedirs(OUT, exist_ok=True)
    for name, (spec, kind) in RENDERS.items():
        img = source(spec, games, args.ref, promo)
        if kind == "phone":
            out = phone(img)
        elif isinstance(kind, tuple):
            out = dial(img, *kind)
        else:
            out = dial(img, kind)
        out.save(os.path.join(OUT, f"{name}.webp"), quality=84, method=6)
        print(name, spec)


if __name__ == "__main__":
    sys.exit(main())
