# Fingerprints pictures for check-site's art-once rule (tools/check-site.mjs): reads picture paths, one per line, on
# stdin and prints one JSON object { "<path>": "<print>" } with each picture's print, or null for a file it can't read.
# The print is the picture in grey, softened and fitted in 96 x 96 px, its shape kept: "<width>x<height>:<hex pixels>".
# check-site lays two prints over each other (whole, or one cut to the other's shape) to find a copy under another
# name, at another size or in another format, or cut from it.
# Needs Pillow with AVIF and WebP support (Pillow 11.3 or later), as the other picture tools here.
import json, sys
from PIL import Image, ImageFilter, ImageOps


def fingerprint(path):
    try:
        with Image.open(path) as im:
            im.draft('RGB', (512, 512))
            im = ImageOps.exif_transpose(im)
            # Transparent parts count as black, so a sprite's shape decides its print, not what its hidden pixels hold.
            if im.mode in ('RGBA', 'LA', 'P'):
                im = im.convert('RGBA')
                im = Image.alpha_composite(Image.new('RGBA', im.size, (0, 0, 0, 255)), im)
            im = im.convert('RGB')
            im.thumbnail((256, 256), Image.LANCZOS)
            im = im.filter(ImageFilter.GaussianBlur(1)).convert('L')
            im.thumbnail((96, 96), Image.BOX)
            return f'{im.width}x{im.height}:{im.tobytes().hex()}'
    except Exception:
        return None


paths = [line.strip() for line in sys.stdin if line.strip()]
json.dump({p: fingerprint(p) for p in paths}, sys.stdout)
