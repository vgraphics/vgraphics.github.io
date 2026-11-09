// Frame pages (tools/lib/frames.mjs; the master coordinator, 2 Nov 2026): a template screen with one build in it that
// another Pages repo serves under vgraphics.gr, framed from the same origin on the page's own route (Palermo Noir's Unity
// WebGL build at /vg--palermo-play/). What fails a frame, and each of Palermo's waiting pages as the template builds it,
// with the rules that are its own (the Palermo coordinator, 2 and 3 Nov 2026: its title, description and canonical; its
// route; no site header on any, the game drawing its own; the play and demo pages the frame and the slim bar
// (← Palermo Noir · About · Privacy · © 2026 VGraphics), the TV and join pages the frame alone, their legal line in the
// build; noindex on every one, the About page carrying the SEO (the Palermo coordinator, 9 Nov 2026, for the launch);
// no-select on every one).
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { framePageProblems, frameProblems, frameShellProblems, frameSources, hasFrame, SERVED_ELSEWHERE } from '../lib/frames.mjs'
import { render } from '../build-pages.mjs'
import { root } from '../lib/product.mjs'

const source = (name) => join(root, 'palermo', 'frames', `${name}.json`)
const page = (blocks, screen = { heading: 'Play' }) => ({ screen, sections: [{ id: 'game', blocks }] })
const frame = (src, title = 'Palermo Noir') => ({ type: 'frame', src, title })

// Each page's own words, whether it is a door (TV or join: the frame alone), and whether it is kept out of search.
const PAGES = {
  play: { title: 'Play Palermo Noir online: the mafia party game in your browser', door: false, noindex: true },
  join: { title: 'Join the game · Palermo Noir', door: true, noindex: true },
  tv: { title: 'Palermo Noir · TV', door: true, noindex: true },
  demo: { title: 'Palermo Noir demo · Play a guided game online', door: false, noindex: true },
}

test("Palermo's play, join, TV and demo pages wait in palermo/frames/", () => {
  assert.deepEqual(frameSources(join(root, 'palermo', 'frames')), Object.keys(PAGES).sort())
  assert.ok(SERVED_ELSEWHERE.includes('vg--palermo-play'))
})

for (const [name, want] of Object.entries(PAGES)) {
  test(`/palermo/${name}/: its own title, description and canonical, ${want.noindex ? 'noindex' : 'for search'}, no site header, ${want.door ? 'the frame alone' : 'the frame and the slim bar'}, the build on ?route=${name}`, () => {
    const p = JSON.parse(readFileSync(source(name), 'utf8'))
    assert.equal(hasFrame(p), true)
    assert.deepEqual(frameProblems(p, name), [])
    const { html, file } = render('palermo', name, source(name))
    assert.equal(file, join('palermo', name, 'index.html'))
    assert.equal(p.title, want.title)
    assert.ok(html.includes(`<title>${want.title}</title>`), html.match(/<title>.*<\/title>/)?.[0])
    assert.ok(html.includes(`<meta name="description" content="${p.description}">`))
    assert.ok(html.includes(`<link rel="canonical" href="https://vgraphics.gr/palermo/${name}/">`))
    assert.equal(/<meta name="robots" content="noindex">/.test(html), want.noindex, 'noindex on every one')
    const body = html.split('<body>')[1]
    // No site header, menu, avatar or skip link on any: the game draws its own. It loads the no-select piece itself.
    for (const piece of ['<header', '<nav', 'vhub-avatar', 'menu-toggle', 'class="skip"']) assert.ok(!body.includes(piece), `the ${name} page has ${piece}`)
    assert.ok(!html.includes('<script src="/assets/menu.js" defer></script>'))
    assert.ok(html.includes('<script src="/assets/no-select.js" defer></script>'), 'it loads the no-select piece itself')
    const tags = body.match(/<[a-z0-9]+\b/g)
    if (want.door) {
      // The frame alone: no bar either; the build's page carries the legal line.
      assert.match(html, /<html lang="en" class="screen bare">/)
      for (const piece of ['screen-bar', '<footer', '/palermo/about/']) assert.ok(!body.includes(piece), `the ${name} page has ${piece}`)
      assert.deepEqual([...new Set(tags)].sort(), ['<h1', '<iframe', '<main', '<script'], 'nothing but the frame, its heading and the scripts')
    } else {
      // The frame and the slim bar: ← Palermo Noir · About · Privacy · © 2026 VGraphics (Company and Terms giving way on phones).
      assert.match(html, /<html lang="en" class="screen">/)
      const bar = body.match(/<footer class="screen-bar">[\s\S]*?<\/footer>/)?.[0] ?? ''
      assert.ok(bar.includes('<a href="/palermo/">&larr; Palermo Noir</a>'), bar)
      assert.ok(bar.includes('<a href="/palermo/about/">About</a>'), 'the About link in the bar')
      assert.ok(bar.includes('<a href="/palermo/privacy.html">Privacy</a>'), 'the policy in the bar')
      assert.match(bar, /&copy; 2026 VGraphics/, 'the short legal line')
      assert.deepEqual([...new Set(tags)].sort(), ['<a', '<footer', '<h1', '<iframe', '<main', '<script', '<span'], 'nothing but the frame, its heading, the bar and the scripts')
    }
    assert.deepEqual(frameShellProblems(html, `/palermo/${name}/`), [])
    assert.match(html, /<main id="main" class="screen-main framed">/)
    assert.ok(html.includes(`<iframe class="frame" data-src="/vg--palermo-play/?route=${name}" title="Palermo Noir"`))
    assert.doesNotMatch(html, /<iframe[^>]*\ssrc=/, 'assets/frame.js gives the frame its address, so the build never loads twice')
    assert.ok(html.includes('<script src="/assets/frame.js" defer></script>'))
    assert.deepEqual(framePageProblems(html, `/palermo/${name}/`), [])
  })
}

test('one frame on a screen, of a build another Pages repo serves, on the page\'s route, with a name', () => {
  assert.deepEqual(frameProblems(page([{ type: 'faq' }]), 'play'), [], 'no frame, nothing to say')
  const notScreen = frameProblems(page([frame('/vg--palermo-play/?route=play')], null), 'play')
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

test('a TV or join frame page is bare and kept out of search; a play or demo page keeps its shell and needs no noindex', () => {
  const bare = { heading: 'TV', bare: true }
  const tv = frameProblems(page([frame('/vg--palermo-play/?route=tv')], bare), 'tv')
  assert.ok(tv.some((m) => m.includes('"robots": "noindex"')), tv.join('\n'))
  const shell = frameProblems({ ...page([frame('/vg--palermo-play/?route=join')]), robots: 'noindex' }, 'join')
  assert.ok(shell.some((m) => m.includes('"bare": true')), shell.join('\n'))
  assert.deepEqual(frameProblems({ ...page([frame('/vg--palermo-play/?route=join')], bare), robots: 'noindex' }, 'join'), [])
  const barePlay = frameProblems(page([frame('/vg--palermo-play/?route=play')], { heading: 'Play', bare: true }), 'play')
  assert.ok(barePlay.some((m) => m.includes('drop "bare"')), barePlay.join('\n'))
  assert.deepEqual(frameProblems(page([frame('/vg--palermo-play/?route=play')]), 'play'), [])
})

test("a bare page's legal line is its build's: none on the page passes, the company's details still fail", () => {
  const { html } = render('palermo', 'tv', source('tv'))
  assert.ok(!html.includes('VGraphics</'), 'no legal line on the bare page itself')
  assert.deepEqual(framePageProblems(html, '/palermo/tv/'), [])
  const details = framePageProblems(html.replace('<main', '<p>VAT no. EL802736373</p><main'), '/palermo/tv/')
  assert.deepEqual([...new Set(details.map(([rule]) => rule))], ['legal-footer'])
  assert.deepEqual(framePageProblems(html.replace('<script src="/assets/no-select.js" defer></script>', ''), '/palermo/tv/').map(([rule]) => rule), ['no-select'])
})

test('a frame page keeps play-alone, the short legal line and no-select itself', () => {
  const { html } = render('palermo', 'play', source('play'))
  const rules = (h, path = '/palermo/play/') => [...new Set(framePageProblems(h, path).map(([rule]) => rule))]
  assert.deepEqual(rules(html.replace('&copy; 2026 VGraphics', '')), ['legal-footer'])
  assert.deepEqual(rules(html.replace('<script src="/assets/no-select.js" defer></script>', '')), ['no-select'])
  assert.deepEqual(rules(html.replace('<html lang="en" class="screen">', '<html lang="en">')), ['play-alone'])
  assert.deepEqual(rules(html.replace(/\s*<a href="\/palermo\/about\/">About<\/a>/, '')), ['play-alone'], 'a play page links its About page in its bar')
})

test('no site header on a frame page; the slim bar under a play or demo page, nothing under a TV or join page', () => {
  const play = render('palermo', 'play', source('play')).html
  const tv = render('palermo', 'tv', source('tv')).html
  const found = (html, path) => frameShellProblems(html, path).map(([, m]) => m)
  const headed = found(play.replace('<main', '<header class="top"><a href="/palermo/">Palermo Noir</a></header>\n  <main'), '/palermo/play/')
  assert.ok(headed.some((m) => m.includes('site header')), headed.join('\n'))
  const barless = found(play.replace(/<footer class="screen-bar">[\s\S]*?<\/footer>/, ''), '/palermo/play/')
  assert.ok(barless.some((m) => m.includes('slim bar')), barless.join('\n'))
  const barred = found(tv.replace('</main>', '</main>\n  <footer class="screen-bar"><a href="/palermo/about/">About</a></footer>'), '/palermo/tv/')
  assert.ok(barred.some((m) => m.includes('the frame alone')), barred.join('\n'))
  assert.deepEqual([...new Set(framePageProblems(play.replace('<main', '<header class="top"></header><main'), '/palermo/play/').map(([rule]) => rule))], ['play-alone'])
})
