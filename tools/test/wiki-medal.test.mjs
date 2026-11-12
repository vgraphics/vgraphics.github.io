// A wiki entry's medal (tools/lib/journey.mjs piece(), beside "What it shows" in tools/build-wiki.mjs): its picture has
// words of its own when wiki.json's "imageAlt" gives them, since the lead beside it may not name what it shows
// (Speedometer's music page: Rally's music dial; George, 12 Nov 2026: "Rally"). Lists that name the entry beside its
// picture leave the words out. Then the Speedometer entry itself: its medal is the Rally render, with its words.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { piece } from '../lib/journey.mjs'
import { root } from '../lib/product.mjs'

const photo = { slug: 'x', image: '/p/img/medal.webp' }

test('a medal photo carries the words it is given', () => {
  assert.equal(piece(photo, 'w-medal', 'A cream dial'), '<span class="w-medal"><img src="/p/img/medal.webp" alt="A cream dial" loading="lazy"></span>')
})

test('a medal photo without words stays decorative', () => {
  assert.match(piece(photo, 'w-medal'), / alt="" /)
  assert.match(piece(photo, 'w-medal', undefined), / alt="" /)
})

test('the words are escaped', () => {
  assert.match(piece(photo, 'w-medal', 'Rally\'s "music" dial & buttons'), / alt="Rally's &quot;music&quot; dial &amp; buttons" /)
})

test('a game piece and an icon keep no words of their own', () => {
  assert.match(piece({ piece: '/p/piece.webp' }, 'w-medal', 'ignored'), / alt="" /)
  assert.doesNotMatch(piece({ icon: '<svg></svg>' }, 'w-medal', 'ignored'), /ignored/)
})

test("Speedometer's music page shows Rally's music dial as its medal, with its words", () => {
  const wiki = JSON.parse(readFileSync(join(root, 'speedometer-wallpaper', 'wiki', 'wiki.json'), 'utf8'))
  const e = wiki.entries.find((x) => x.slug === 'music-calls-messages')
  assert.equal(e.image, '/speedometer-wallpaper/img/renders/medal-rally-music.webp')
  assert.ok(existsSync(join(root, e.image)), `${e.image} is on the site`)
  assert.match(e.imageAlt, /Rally/)
  const page = readFileSync(join(root, 'speedometer-wallpaper', 'wiki', 'music-calls-messages', 'index.html'), 'utf8')
  assert.match(page, /<span class="w-medal"><img src="\/speedometer-wallpaper\/img\/renders\/medal-rally-music(\.[0-9a-f]+)?\.webp" alt="The Rally style's cream dial[^"]*"/)
  assert.doesNotMatch(page, /class="w-medal"><img src="[^"]*future-kmh/)
})
