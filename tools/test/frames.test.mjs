// Frame pages (tools/lib/frames.mjs; the master coordinator, 2 Nov 2026): a template screen with one build in it that
// another Pages repo serves under vgraphics.gr, framed from the same origin on the page's own route (Palermo Noir's Unity
// WebGL build at /vg--palermo-play/). What fails a frame, and each of Palermo's waiting pages as the template builds it,
// with the rules that are its own (the Palermo coordinator, 2 Nov 2026: its title, description and canonical, noindex on
// the TV and join pages only, the About link in the bar of the play and demo pages only, its route; the short legal line
// and no-select on every one).
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { framePageProblems, frameProblems, frameSources, hasFrame, SERVED_ELSEWHERE } from '../lib/frames.mjs'
import { render } from '../build-pages.mjs'
import { root } from '../lib/product.mjs'

const source = (name) => join(root, 'palermo', 'frames', `${name}.json`)
const page = (blocks, screen = { heading: 'Play' }) => ({ screen, sections: [{ id: 'game', blocks }] })
const frame = (src, title = 'Palermo Noir') => ({ type: 'frame', src, title })

// Each page's own words, and whether it is a door (TV or join: out of search, no About link in its bar).
const PAGES = {
  play: { title: 'Play Palermo Noir online: the mafia party game in your browser', door: false },
  join: { title: 'Join the game · Palermo Noir', door: true },
  tv: { title: 'Palermo Noir · TV', door: true },
  demo: { title: 'Palermo Noir demo · Play a guided game online', door: false },
}

test("Palermo's play, join, TV and demo pages wait in palermo/frames/", () => {
  assert.deepEqual(frameSources(join(root, 'palermo', 'frames')), Object.keys(PAGES).sort())
  assert.ok(SERVED_ELSEWHERE.includes('vg--palermo-play'))
})

for (const [name, want] of Object.entries(PAGES)) {
  test(`/palermo/${name}/: its own title, description and canonical, ${want.door ? 'noindex and no About link' : 'for search, with the About link'}, the build on ?route=${name}`, () => {
    const p = JSON.parse(readFileSync(source(name), 'utf8'))
    assert.equal(hasFrame(p), true)
    assert.deepEqual(frameProblems(p, name), [])
    const { html, file } = render('palermo', name, source(name))
    assert.equal(file, join('palermo', name, 'index.html'))
    assert.equal(p.title, want.title)
    assert.ok(html.includes(`<title>${want.title}</title>`), html.match(/<title>.*<\/title>/)?.[0])
    assert.ok(html.includes(`<meta name="description" content="${p.description}">`))
    assert.ok(html.includes(`<link rel="canonical" href="https://vgraphics.gr/palermo/${name}/">`))
    assert.equal(/<meta name="robots" content="noindex">/.test(html), want.door, 'noindex on the TV and join pages only')
    const bar = html.match(/<footer class="screen-bar">[\s\S]*?<\/footer>/)?.[0] ?? ''
    assert.equal(bar.includes('href="/palermo/about/"'), !want.door, 'the About link in the play and demo pages\' bar only')
    assert.match(bar, /&copy; 2026 VGraphics/, 'the short legal line')
    assert.match(html, /<html lang="en" class="screen">/)
    assert.match(html, /<main id="main" class="screen-main framed">/)
    assert.ok(html.includes(`<iframe class="frame" data-src="/vg--palermo-play/?route=${name}" title="Palermo Noir"`))
    assert.doesNotMatch(html, /<iframe[^>]*\ssrc=/, 'assets/frame.js gives the frame its address, so the build never loads twice')
    assert.ok(html.includes('<script src="/assets/frame.js" defer></script>'))
    assert.ok(html.includes('<script src="/assets/menu.js" defer></script>'), 'menu.js brings the no-select piece')
    assert.deepEqual(framePageProblems(html, `/palermo/${name}/`), [])
  })
}

test('one frame on a screen, of a build another Pages repo serves, on the page\'s route, with a name', () => {
  assert.deepEqual(frameProblems(page([{ type: 'faq' }]), 'play'), [], 'no frame, nothing to say')
  const notScreen = frameProblems(page([frame('/vg--palermo-play/?route=play')], undefined), 'play')
  assert.ok(notScreen.some((m) => m.includes('"screen"')), notScreen.join('\n'))
  for (const src of ['https://example.com/?route=play', '//example.com/?route=play', '/palermo/game/?route=play', 'vg--palermo-play/?route=play', '']) {
    const found = frameProblems(page([frame(src)]), 'play')
    assert.ok(found.some((m) => m.includes('SERVED_ELSEWHERE')), `${src}: ${found.join('\n')}`)
  }
  const wrong = frameProblems(page([frame('/vg--palermo-play/?route=tv')]), 'play')
  assert.ok(wrong.some((m) => m.includes('route tv') && m.includes('?route=play')), wrong.join('\n'))
  const none = frameProblems(page([frame('/vg--palermo-play/#route=play')]), 'play')
  assert.ok(none.some((m) => m.includes('no route')), none.join('\n'))
  const untitled = frameProblems(page([frame('/vg--palermo-play/?route=play', '')]), 'play')
  assert.ok(untitled.some((m) => m.includes('title')), untitled.join('\n'))
  const two = frameProblems(page([frame('/vg--palermo-play/?route=play'), frame('/vg--palermo-play/?route=play')]), 'play')
  assert.ok(two.some((m) => m.includes('2 frames')), two.join('\n'))
})

test('a TV or join frame page without noindex fails; a play page needs none', () => {
  const tv = frameProblems(page([frame('/vg--palermo-play/?route=tv')]), 'tv')
  assert.ok(tv.some((m) => m.includes('"robots": "noindex"')), tv.join('\n'))
  assert.deepEqual(frameProblems({ ...page([frame('/vg--palermo-play/?route=join')]), robots: 'noindex' }, 'join'), [])
  assert.deepEqual(frameProblems(page([frame('/vg--palermo-play/?route=play')]), 'play'), [])
})

test('a frame page keeps play-alone, the short legal line and no-select itself', () => {
  const { html } = render('palermo', 'play', source('play'))
  const rules = (h, path = '/palermo/play/') => [...new Set(framePageProblems(h, path).map(([rule]) => rule))]
  assert.deepEqual(rules(html.replace('&copy; 2026 VGraphics', '')), ['legal-footer'])
  assert.deepEqual(rules(html.replace('<script src="/assets/menu.js" defer></script>', '')), ['no-select'])
  assert.deepEqual(rules(html.replace('<html lang="en" class="screen">', '<html lang="en">')), ['play-alone'])
  assert.deepEqual(rules(html.replace(/\s*<a href="\/palermo\/about\/">About<\/a>/, '')), ['play-alone'], 'a play page links its About page')
})
