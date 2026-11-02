// Frame pages (tools/lib/frames.mjs; the master coordinator, 2 Nov 2026): a template screen with one build in it that
// another Pages repo serves under vgraphics.gr, framed from the same origin on the page's own route (Palermo Noir's Unity
// WebGL build at /vg--palermo-play/). What fails a frame, and Palermo's waiting pages as the template builds them.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { frameProblems, frameSources, hasFrame, SERVED_ELSEWHERE } from '../lib/frames.mjs'
import { playPageProblems } from '../lib/play-pages.mjs'
import { render } from '../build-pages.mjs'
import { root } from '../lib/product.mjs'

const PAGES = ['demo', 'join', 'play', 'tv']
const source = (name) => join(root, 'palermo', 'frames', `${name}.json`)
const page = (blocks, screen = { heading: 'Play' }) => ({ screen, sections: [{ id: 'game', blocks }] })
const frame = (src, title = 'Palermo Noir') => ({ type: 'frame', src, title })

test("Palermo's play, join, TV and demo pages wait in palermo/frames/, each framing the build on its own route", () => {
  assert.deepEqual(frameSources(join(root, 'palermo', 'frames')), PAGES)
  assert.ok(SERVED_ELSEWHERE.includes('vg--palermo-play'))
  for (const name of PAGES) {
    const p = JSON.parse(readFileSync(source(name), 'utf8'))
    assert.equal(hasFrame(p), true, name)
    assert.deepEqual(frameProblems(p, name), [], name)
  }
})

test('the template builds each as a screen: the frame alone, its script, the bar with the About link', () => {
  for (const name of PAGES) {
    const { html, file } = render('palermo', name, source(name))
    assert.equal(file, join('palermo', name, 'index.html'), name)
    assert.match(html, /<html lang="en" class="screen">/, name)
    assert.match(html, /<main id="main" class="screen-main framed">/, name)
    assert.ok(html.includes(`<iframe class="frame" data-src="/vg--palermo-play/?route=${name}" title="Palermo Noir"`), name)
    assert.doesNotMatch(html, /<iframe[^>]*\ssrc=/, `${name}: assets/frame.js gives the frame its address, so the build never loads twice`)
    assert.ok(html.includes('<script src="/assets/frame.js" defer></script>'), name)
    assert.ok(html.includes(`<link rel="canonical" href="https://vgraphics.gr/palermo/${name}/">`), name)
    assert.equal(/<meta name="robots" content="noindex">/.test(html), name !== 'play', `${name}: only the play page is for search`)
    const door = name === 'join' || name === 'tv'
    assert.deepEqual(playPageProblems(html, 'palermo', { template: true, about: !door }), [], name)
  }
})

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
