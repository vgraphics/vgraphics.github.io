"""Writes a QR code as a small SVG, for a try page's "scan with your phone" (tools/lib/try.mjs, page.json qr).

The code is made here, once, so the page loads no QR library: python tools/make-qr.py <link> <out.svg>
(Python with segno: pip install segno). Dark modules on a transparent ground; the page sets it on white.
"""
import io
import re
import sys

import segno


def main():
    if len(sys.argv) != 3:
        sys.exit("usage: python tools/make-qr.py <link> <out.svg>")
    link, out = sys.argv[1], sys.argv[2]
    # M: about 15% of the code can be lost to a smudge or a glare and it still reads.
    code = segno.make(link, error="m", micro=False)
    buffer = io.BytesIO()
    code.save(buffer, kind="svg", scale=4, border=0, dark="#0B0B0C", light=None, xmldecl=False, svgns=True,
              title="A QR code of " + link, nl=False)
    # A viewBox, so the page can show it at any size.
    svg = re.sub(r'width="(\d+)" height="(\d+)"', r'width="\1" height="\2" viewBox="0 0 \1 \2"',
                 buffer.getvalue().decode("utf-8"), count=1)
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(svg + "\n")
    print(f"{out}: version {code.version}, {code.symbol_size(border=0)[0]} modules")


if __name__ == "__main__":
    main()
