// A picture's blurhash (https://blurha.sh; written on the page by tools/lib/blurhash.mjs) painted as a small soft
// image, for the previews to show while the real picture loads (George, 26 Oct 2026: "preview open on previous image
// until new loads ... Use blurhash. General rules for all pages."). The lightboxes load it with import().
const B83 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";
const d83 = (s) => [...s].reduce((v, c) => v * 83 + B83.indexOf(c), 0);
const linear = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const srgb = (v) => {
  v = Math.max(0, Math.min(1, v));
  return v <= 0.0031308 ? Math.round(v * 12.92 * 255 + 0.5) : Math.round((1.055 * v ** (1 / 2.4) - 0.055) * 255 + 0.5);
};

// The hash's pixels, w x h, as RGBA
export function decode(hash, w, h) {
  const size = d83(hash[0]), nx = (size % 9) + 1, ny = Math.floor(size / 9) + 1;
  const top = (d83(hash[1]) + 1) / 166;
  const colours = [];
  for (let i = 0; i < nx * ny; i++) {
    if (i === 0) {
      const v = d83(hash.slice(2, 6));
      colours.push([linear(v >> 16), linear((v >> 8) & 255), linear(v & 255)]);
    } else {
      const v = d83(hash.slice(4 + i * 2, 6 + i * 2));
      colours.push([Math.floor(v / 361), Math.floor(v / 19) % 19, v % 19].map((q) => Math.sign(q - 9) * ((q - 9) / 9) ** 2 * top));
    }
  }
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const k = Math.cos((Math.PI * x * i) / w) * Math.cos((Math.PI * y * j) / h), c = colours[i + j * nx];
          r += c[0] * k;
          g += c[1] * k;
          b += c[2] * k;
        }
      }
      const o = 4 * (x + y * w);
      px[o] = srgb(r);
      px[o + 1] = srgb(g);
      px[o + 2] = srgb(b);
      px[o + 3] = 255;
    }
  }
  return px;
}

// The hash as a data: URL of a picture 32 px on its long side, in the shape w : h (a CSS background stretches it
// smooth). Each one is painted once.
const urls = new Map();
export function url(hash, w, h) {
  const key = `${hash}:${w}:${h}`;
  if (!urls.has(key)) {
    const cw = w >= h ? 32 : Math.max(1, Math.round((32 * w) / h)), ch = w >= h ? Math.max(1, Math.round((32 * h) / w)) : 32;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    canvas.getContext("2d").putImageData(new ImageData(decode(hash, cw, ch), cw, ch), 0, 0);
    urls.set(key, canvas.toDataURL());
  }
  return urls.get(key);
}
