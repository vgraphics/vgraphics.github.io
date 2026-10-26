// A picture file's own width and height, read from its header (no image library): PNG, JPEG, GIF, WebP, AVIF and
// SVG. check-site holds every <img width height> to them, so a page never states a shape its picture doesn't have
// (George, 24 Oct 2026: "These are stretched"). Returns { width, height }, or null for a file it can't read.
import { readFileSync } from 'node:fs'

export function imageSize(file) {
  let b
  try {
    b = readFileSync(file)
  } catch {
    return null
  }
  const ascii = (at, n) => b.toString('latin1', at, at + n)
  const size = (width, height) => (width > 0 && height > 0 ? { width, height } : null)
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) return size(b.readUInt32BE(16), b.readUInt32BE(20))
  if (ascii(0, 3) === 'GIF') return size(b.readUInt16LE(6), b.readUInt16LE(8))
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const chunk = ascii(12, 4)
    if (chunk === 'VP8 ') return size(b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff)
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21)
      return size((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
    }
    if (chunk === 'VP8X') return size(b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1)
    return null
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    // The first start-of-frame marker (SOF0 to SOF15, without DHT, JPG and DAC) holds the frame's size.
    let at = 2
    while (at + 9 < b.length) {
      if (b[at] !== 0xff) return null
      const marker = b[at + 1]
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return size(b.readUInt16BE(at + 7), b.readUInt16BE(at + 5))
      at += 2 + b.readUInt16BE(at + 2)
    }
    return null
  }
  if (ascii(4, 4) === 'ftyp' && /avi[fs]/.test(ascii(8, 24))) {
    // The image's spatial extents property (ispe): version and flags, then width and height.
    const at = b.indexOf('ispe', 0, 'latin1')
    return at > 0 ? size(b.readUInt32BE(at + 8), b.readUInt32BE(at + 12)) : null
  }
  const text = ascii(0, Math.min(b.length, 4096))
  const svg = text.match(/<svg\b[^>]*>/)?.[0]
  if (svg) {
    const attr = (name) => svg.match(new RegExp(`\\s${name}="([\\d.]+)(px)?"`))?.[1]
    const box = svg.match(/viewBox="[\d.\s-]*?\s([\d.]+)\s+([\d.]+)"/)
    const width = Number(attr('width') ?? box?.[1])
    const height = Number(attr('height') ?? box?.[2])
    return size(width, height)
  }
  return null
}
