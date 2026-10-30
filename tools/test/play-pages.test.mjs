// Play and try pages are the product alone, its About text on a page of its own (tools/lib/play-pages.mjs; George, 29
// Oct 2026: "When we play we play. No scroll needed."): which addresses are play and try pages, what fails one (an About
// panel or its button, the website's footer under the product, a template page that isn't a screen, no link to the
// About page), what an About page needs, and the template's try page and About pages as they are built.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aboutProblems, isPlayPage, playPageProblems } from '../lib/play-pages.mjs'
import { render } from '../build-pages.mjs'
import { loadProduct, loadSubpage } from '../lib/product.mjs'

// A play page as the Exitwise WebGL template now has it: the game, the banner strip and the bar with the About link.
const GAME = `<!doctype html><html lang="en"><head><style>html, body { overflow: hidden; }</style></head><body>
  <div id="first"><canvas id="unity-canvas"></canvas><div id="loader"></div><div id="ad-banner"></div></div>
  <footer><a href="/exitwise/">&larr; Exitwise</a><a href="/exitwise/about/">About</a><button type="button" id="statistics">Statistics</button></footer>
  <div id="consent" role="dialog"><h2 id="consent-title">Help improve Exitwise?</h2><button type="button">Allow</button></div>
</body></html>`

test('a product\'s /play/ and /demo/ are its play and try pages', () => {
  for (const path of ['/exitwise/play/', '/speedometer-wallpaper/play/', '/palermo/demo/']) assert.equal(isPlayPage(path), true, path)
  for (const path of ['/exitwise/', '/exitwise/about/', '/palermo/demo/screen.html', '/palermo/tv/', '/play/', '/exitwise/play/Build/x.html']) {
    assert.equal(isPlayPage(path), false, path)
  }
})

test('the game alone, with its About link in the bar, passes', () => {
  assert.deepEqual(playPageProblems(GAME, 'exitwise'), [])
})

test('an About panel, its button and the words under the game fail, as the panels of 27 Oct had them', () => {
  const panel = GAME.replace('</div>\n  <footer>', `</div>
  <main id="about" aria-labelledby="about-title"><h1 id="about-title">The arrow puzzle you can play right here</h1></main>
  <footer>`).replace('<footer>', '<footer><button type="button" id="about-go" aria-controls="about"><span>About this game</span></button>')
  const found = playPageProblems(panel, 'exitwise')
  assert.ok(found.some((m) => m.includes('#about') && m.includes('#about-go') && m.includes('#about-title')), found.join('\n'))
  assert.ok(found.some((m) => m.includes('"About this game"')), found.join('\n'))
  const demo = '<html><body><div id="app"></div><section class="demo-about"><p>Words</p></section><div class="demo-about-bar"><button type="button">Back to the game</button></div></body></html>'
  const more = playPageProblems(demo, 'palermo')
  assert.ok(more.some((m) => m.includes('.demo-about') && m.includes('.demo-about-bar')), more.join('\n'))
  assert.ok(more.some((m) => m.includes('"Back to the game"')), more.join('\n'))
})

test('the website\'s footer under the product fails, and a missing About link too', () => {
  const footer = GAME.replace('<footer>', '<footer id="party-legal" class="party-legal foot has-art">').replace('<a href="/exitwise/about/">About</a>', '')
  const found = playPageProblems(footer, 'exitwise')
  assert.ok(found.some((m) => m.includes('website\'s footer')), found.join('\n'))
  assert.ok(found.some((m) => m.includes("doesn't link its About page, /exitwise/about/")), found.join('\n'))
})

test('what a script writes later, a template holds and a comment says is not read', () => {
  const hidden = GAME.replace('<footer>', '<!-- the old <section id="about"> --><template class="private"><div class="demo-about"></div></template><script>var about = document.getElementById("about-go");</script><footer>')
  assert.deepEqual(playPageProblems(hidden, 'exitwise'), [])
})

test('a template play page must be a screen', () => {
  assert.ok(playPageProblems(GAME, 'exitwise', { template: true }).some((m) => m.includes('"screen"')))
  assert.deepEqual(playPageProblems(GAME.replace('<html lang="en">', '<html lang="en" class="screen">'), 'exitwise', { template: true }), [])
})

test('the template\'s try page is the app alone: a screen with the bar, its About link and no section under the phone', () => {
  const { html } = render('speedometer-wallpaper', 'play')
  assert.deepEqual(playPageProblems(html, 'speedometer-wallpaper', { template: true }), [])
  assert.ok(html.includes('<html lang="en" class="screen">'))
  assert.ok(html.includes('<header class="top scrolled">'), 'the header is the frosted bar from the first frame')
  assert.ok(html.includes('<footer class="screen-bar">') && !html.includes('class="foot'), 'the bar, not the footer')
  for (const gone of ['class="key-art', 'class="sec', 'class="cta-band', 'rel="preload" as="image"']) assert.ok(!html.includes(gone), gone)
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, 'one h1')
  assert.ok(html.includes('class="try-panel fade-edges"'), 'the panel scrolls in its own box')
})

test('a product with a play or try page needs its About page, with questions of its own, linked from its menu and its landing page', () => {
  const site = { nav: [{ label: 'Overview', href: '/x/' }, { label: 'About', href: '/x/about/' }] }
  const page = { sections: [{ id: 'questions', blocks: [{ type: 'faq', schema: false, items: [{ q: 'Why is the sky blue?', a: 'Air.' }] }] }] }
  const landing = '<header><a href="/x/about/">About</a></header><main><details class="faq-item"><summary>Is X free?<svg></svg></summary></details><a class="more" href="/x/about/">All about X</a></main>'
  assert.deepEqual(aboutProblems('x', { built: true, page, site, landing }), [])
  assert.match(aboutProblems('x', { built: false })[0], /no About page: add x\/about\/page\.json/)
  const found = aboutProblems('x', { built: true, page: { sections: [] }, site: { nav: site.nav.slice(0, 1) }, landing: landing.replace(/<main>[\s\S]*<\/main>/, '<main></main>') })
  assert.equal(found.length, 3, found.join('\n'))
  // Its questions are its own: no FAQPage data (the landing page's are the product's), and none the landing page asks.
  const copied = { sections: [{ id: 'questions', blocks: [{ type: 'faq', items: [{ q: 'is x free? ', a: 'Yes.' }] }] }] }
  const again = aboutProblems('x', { built: true, page: copied, site, landing })
  assert.ok(again.some((m) => m.includes('"schema": false')), again.join('\n'))
  assert.ok(again.some((m) => m.includes('already ask ("is x free? ")')), again.join('\n'))
})

test('the three About pages are built from the template, linked from their menus and landing pages', () => {
  for (const slug of ['exitwise', 'palermo', 'speedometer-wallpaper']) {
    const { html, file } = render(slug, 'about')
    assert.equal(file.replace(/\\/g, '/'), `${slug}/about/index.html`)
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${slug}: one h1`)
    assert.ok(html.includes('"@type": "AboutPage"'), `${slug}: its structured data`)
    assert.ok(!html.includes('"@type": "FAQPage"'), `${slug}: no FAQPage, which is the landing page's`)
    const { page } = loadSubpage(slug, 'about')
    assert.deepEqual(aboutProblems(slug, { built: true, page, site: loadProduct(slug).page.site, landing: render(slug).html }), [], slug)
  }
})

test('Palermo Noir\'s About page keeps the demo\'s section out while the demo is private', () => {
  const { html } = render('palermo', 'about')
  assert.equal(loadProduct('palermo').page.site.demo?.private, true, 'the demo is private today')
  assert.ok(!html.includes('Try it alone first'), 'its demo section is left out')
  assert.ok(!html.replace(/<template class="private">[\s\S]*?<\/template>/g, '').includes('href="/palermo/demo/"'), 'no public link to the demo')
})
