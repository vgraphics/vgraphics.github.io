// Every <img> of a gallery and of the soundtrack's cover states its picture's own width and height, read from the files
// (Platform job 26, from Exitwise: 16 pictures on /exitwise/ had none, so the page shifted as they loaded). The sizes
// come from tools/lib/image-size.mjs; check-site's stretch rule holds each to its file's shape. Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderGallery } from '../gallery.mjs'
import { imageSize, sizeAttrs } from '../lib/image-size.mjs'
import { root } from '../lib/product.mjs'
import { soundtrack } from '../lib/soundtrack.mjs'

const imgs = (html) => [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0])
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]

// A product's own block of a type, as tools/build-pages.mjs writes it (the gallery's screenshots' blurhashes come from the cache)
const blocks = (slug, type) => {
  const walk = (o) => (Array.isArray(o) ? o : Object.values(o ?? {})).flatMap((x) => (x && typeof x === 'object' ? (x.type === type && (type !== 'gallery' || x.layout) ? [x] : walk(x)) : []))
  return walk(JSON.parse(readFileSync(join(root, slug, 'page.json'), 'utf8')))
}
const [gallery] = blocks('exitwise', 'gallery')

test('sizeAttrs reads the picture file\'s own width and height, and says nothing for a file it cannot read', () => {
  const file = join(root, 'exitwise', gallery.img, `${gallery.pickups[0].src}.webp`)
  const size = imageSize(file)
  assert.ok(size.width > 0 && size.height > 0)
  assert.equal(sizeAttrs(file), ` width="${size.width}" height="${size.height}"`)
  assert.equal(sizeAttrs(join(root, 'exitwise', 'no-such-picture.webp')), '')
})

test('every <img> of the gallery has a width and a height that match its file', () => {
  const html = renderGallery(gallery, { label: 'gallery-title', dir: 'exitwise' })
  const tags = imgs(html)
  assert.ok(tags.length >= gallery.items.length + (gallery.pickups?.length ?? 0) + 1, 'the stage, the pedestals, the pickups and the screenshots are all <img>')
  for (const tag of tags) {
    const [w, h] = [Number(attr(tag, 'width')), Number(attr(tag, 'height'))]
    assert.ok(w > 0 && h > 0, `no width and height: ${tag.slice(0, 120)}`)
    const own = imageSize(join(root, 'exitwise', attr(tag, 'src')))
    assert.ok(own, `no file for ${attr(tag, 'src')}`)
    assert.ok(Math.abs(w / h / (own.width / own.height) - 1) <= 0.01, `${attr(tag, 'src')} says ${w} x ${h}, the file is ${own.width} x ${own.height}`)
  }
})

test('the stage, the pedestals and the pickups state the file\'s exact size', () => {
  const tags = imgs(renderGallery(gallery, { label: 'gallery-title', dir: 'exitwise' }))
  const exact = (tag) => {
    const own = imageSize(join(root, 'exitwise', attr(tag, 'src')))
    assert.equal(`${attr(tag, 'width')}x${attr(tag, 'height')}`, `${own.width}x${own.height}`, attr(tag, 'src'))
  }
  const pedestals = tags.filter((t) => /class="g-ped"/.test(t))
  assert.equal(pedestals.length, gallery.items.filter((s) => gallery.pedestals?.[s.world] != null).length)
  pedestals.forEach(exact)
  const pickups = tags.filter((t) => gallery.pickups?.some((p) => attr(t, 'src') === `${gallery.img}${p.src}.webp`))
  assert.equal(pickups.length, gallery.pickups.length)
  pickups.forEach(exact)
  exact(tags.find((t) => attr(t, 'src') === `${gallery.img}${gallery.stage.wide}-${gallery.stage.widths[1]}.webp`))
})

test('the soundtrack cover\'s blurred backdrop and record disc state a square size, like the cover', () => {
  const block = { album: 'Album', cover: { src: 'img/cover', widths: [320, 640], width: 640, height: 640, alt: 'The cover' }, background: null, youtube: null, soundcloud: null, tracks: [{ title: 'One', src: 'audio/one.m4a', duration: '1:00' }] }
  const html = soundtrack(block, { slug: 'no-such-product', theme: { swatches: ['#fff'] } })
  const tags = imgs(html)
  // the blurred backdrop, the record's disc, the cover and the mini-bar's thumbnail
  assert.equal(tags.length, 4)
  for (const tag of tags) assert.ok(Number(attr(tag, 'width')) > 0 && Number(attr(tag, 'height')) > 0, `no width and height: ${tag.slice(0, 120)}`)
  const blur = html.match(/<span class="ost-backdrop blur"[^>]*>(<img[^>]*>)/)[1]
  assert.equal(attr(blur, 'width'), '320')
  assert.equal(attr(blur, 'height'), '320')
})

test('the soundtrack\'s own background picture states the size of its file (Palermo\'s)', () => {
  const [block] = blocks('palermo', 'soundtrack')
  assert.ok(block.background?.wide, 'Palermo\'s soundtrack has its own background')
  const html = soundtrack(block, { slug: 'palermo', theme: { swatches: ['#fff'] } })
  const tag = html.match(/<picture class="ost-backdrop"[^>]*>[\s\S]*?(<img[^>]*>)<\/picture>/)[1]
  const file = join(root, 'palermo', attr(tag, 'src'))
  const own = imageSize(file)
  assert.ok(own, `no file for ${attr(tag, 'src')}`)
  assert.equal(`${attr(tag, 'width')}x${attr(tag, 'height')}`, `${own.width}x${own.height}`)
  // every picture of the block states its size
  for (const t of imgs(html)) assert.ok(Number(attr(t, 'width')) > 0 && Number(attr(t, 'height')) > 0, `no width and height: ${t.slice(0, 120)}`)
})
