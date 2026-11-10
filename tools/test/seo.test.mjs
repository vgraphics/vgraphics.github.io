// The SEO rules (tools/lib/seo.mjs; George, 10 Nov 2026: "improve the SEO of our pages so we get more visitors"):
// what a good page passes, and each rule failing on its own. Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { entryTitle, entryTitleProblem, hreflangProblems, INDEX_ROBOTS, keywordsFor, OG_LOCALE, orphanPages, seoProblems } from '../lib/seo.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const TITLE = 'Exitwise: a free arrow puzzle game for phones'
const DESCRIPTION = 'Exitwise is a free arrow puzzle game: slide every arrow off the board before you run out of moves, on iPhone, Android or in the browser.'
const page = ({ title = TITLE, description = DESCRIPTION, extra = '', body = '<h1>Exitwise</h1><h2>How to play</h2>' } = {}) => `<!doctype html><html lang="en"><head>
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="${INDEX_ROBOTS}">
<meta property="og:locale" content="${OG_LOCALE}">
<meta property="og:image" content="https://vgraphics.gr/exitwise/img/card-1200x630.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Exitwise">
<meta name="twitter:image" content="https://vgraphics.gr/exitwise/img/card-1200x630.jpg">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[]}</script>
${extra}</head><body>${body}</body></html>`
const checks = (html, url = '/exitwise/about/', keywords = {}) => seoProblems({ html, url, root, keywords }).map(([check]) => check)

test('a page with everything passes', () => {
  assert.deepEqual(checks(page()), [])
})

test('a title or description outside the length search results show fails', () => {
  assert.deepEqual(checks(page({ title: 'Exitwise' })), ['title-length'])
  assert.deepEqual(checks(page({ description: 'x'.repeat(170) })), ['description-length'])
})

test('a missing locale, robots preview, picture description or Twitter picture fails', () => {
  assert.deepEqual(checks(page().replace(/<meta property="og:locale"[^>]*>\n/, '')), ['og-locale'])
  assert.deepEqual(checks(page().replace(/<meta name="robots"[^>]*>\n/, '')), ['robots-preview'])
  assert.deepEqual(checks(page().replace(/<meta property="og:image:alt"[^>]*>\n/, '')), ['og-image-alt'])
  assert.deepEqual(checks(page().replace(/<meta name="twitter:image"[^>]*>\n/, '')), ['twitter-image'])
})

test('a skipped heading level fails, and a picture needs an alt that is not a file name', () => {
  assert.deepEqual(checks(page({ body: '<h1>Exitwise</h1><h3>Skipped</h3>' })), ['heading-order'])
  assert.deepEqual(checks(page({ body: '<h1>Exitwise</h1><img src="/a.png">' })), ['img-alt'])
  assert.deepEqual(checks(page({ body: '<h1>Exitwise</h1><img src="/a.png" alt="a.png">' })), ['img-alt'])
  assert.deepEqual(checks(page({ body: '<h1>Exitwise</h1><img src="/a.png" alt="">' })), [])
})

test('every page but the home page needs a BreadcrumbList, and the home page an Organization and a WebSite', () => {
  const none = page().replace(/<script type="application\/ld\+json">.*<\/script>\n/, '')
  assert.deepEqual(checks(none), ['breadcrumb'])
  assert.deepEqual(checks(none, '/'), ['json-ld', 'json-ld'])
})

test('a landing page\'s title, description and h1 hold a keyword; another page of the product, its title or description', () => {
  const keywords = { list: ['arrow puzzle game'], product: 'exitwise', landing: true }
  const landing = page({ body: '<h1>Exitwise arrow puzzle game</h1>' })
  assert.deepEqual(checks(landing, '/exitwise/', keywords), [])
  assert.deepEqual(checks(page({ body: '<h1>Exitwise</h1>' }), '/exitwise/', keywords), ['keywords'])
  assert.deepEqual(checks(landing, '/exitwise/', { ...keywords, list: [] }), ['keywords'])
  assert.deepEqual(checks(page(), '/exitwise/about/', { list: ['mafia'], product: 'exitwise' }), ['keywords'])
  assert.deepEqual(checks(page(), '/exitwise/about/', { list: [], product: 'exitwise' }), [])
})

test('keywords come from the shared file for the pages that belong to no product', () => {
  const shared = { '/games/': ['arrow puzzle'] }
  assert.deepEqual(keywordsFor(root, '/games/', ['exitwise'], shared), { list: ['arrow puzzle'] })
  assert.deepEqual(keywordsFor(root, '/terms/', ['exitwise'], shared), {})
})

// A wiki entry's search title (Platform job 26, from Exitwise): its own "title" first, so a product can word it as the
// question people ask; else the entryTitles patterns; else "<name> · <product> wiki".
const WIKI = {
  product: { name: 'Exitwise' },
  sections: [{ id: 'obstacles', kind: 'obstacle' }, { id: 'rules' }],
  entryTitles: ['{name} ({kind}) · Exitwise arrow puzzle wiki', '{name} ({kind}) · Exitwise wiki'],
}

test('a wiki entry\'s own title comes before the entryTitles patterns', () => {
  const own = { name: 'Colour gate', section: 'obstacles', title: 'How does the colour gate work in Exitwise?' }
  assert.equal(entryTitle(WIKI, own), 'How does the colour gate work in Exitwise?')
  assert.equal(entryTitle(WIKI, { ...own, title: '  Padded title for the colour gate  ' }), 'Padded title for the colour gate')
})

test('a wiki entry without a title takes the first entryTitles pattern that fits in 60 characters', () => {
  assert.equal(entryTitle(WIKI, { name: 'Rock', section: 'obstacles' }), 'Rock (obstacle) · Exitwise arrow puzzle wiki')
  assert.equal(entryTitle(WIKI, { name: 'Rock', section: 'obstacles', title: '' }), 'Rock (obstacle) · Exitwise arrow puzzle wiki')
  // too long for the first pattern (66 characters), so the second
  assert.equal(entryTitle(WIKI, { name: 'Colour gate crossing point', section: 'obstacles' }), 'Colour gate crossing point (obstacle) · Exitwise wiki')
  // a section without a kind passes the {kind} patterns over
  assert.equal(entryTitle(WIKI, { name: 'Moves', section: 'rules' }), 'Moves · Exitwise wiki')
})

test('an entry\'s own title must be a string of the length search results show', () => {
  assert.equal(entryTitleProblem({ slug: 'a' }), undefined)
  assert.equal(entryTitleProblem({ slug: 'a', title: 'How does the colour gate work in Exitwise?' }), undefined)
  assert.match(entryTitleProblem({ slug: 'a', title: 'Colour gate' }), /11 characters, want 25 to 65/)
  assert.match(entryTitleProblem({ slug: 'a', title: 'x'.repeat(66) }), /66 characters, want 25 to 65/)
  assert.equal(entryTitleProblem({ slug: 'a', title: 'x'.repeat(65) }), undefined)
  assert.equal(entryTitleProblem({ slug: 'a', title: 'x'.repeat(25) }), undefined)
  assert.match(entryTitleProblem({ slug: 'a', title: 42 }), /not a string/)
})

test('every entry of every wiki.json passes the title rule, and the titles are all different', () => {
  const titles = new Map()
  for (const dir of readdirSync(root)) {
    const file = join(root, dir, 'wiki', 'wiki.json')
    if (!existsSync(file)) continue
    const w = JSON.parse(readFileSync(file, 'utf8'))
    for (const e of w.entries ?? []) {
      assert.equal(entryTitleProblem(e), undefined, `${dir}/wiki/wiki.json ${e.slug}`)
      const title = entryTitle(w, e)
      assert.ok(!titles.has(title), `${dir} ${e.slug} and ${titles.get(title)} have the same title: ${title}`)
      titles.set(title, `${dir} ${e.slug}`)
    }
  }
})

test('hreflang alternates list themselves, name each other back and have an x-default', () => {
  const link = (lang, path) => `<link rel="alternate" hreflang="${lang}" href="https://vgraphics.gr${path}">`
  const en = page({ extra: link('en', '/a/') + link('el', '/el/a/') + link('x-default', '/a/') })
  const el = page({ extra: link('en', '/a/') + link('el', '/el/a/') + link('x-default', '/a/') })
  assert.deepEqual(hreflangProblems(new Map([['/a/', en], ['/el/a/', el]])), [])
  assert.equal(hreflangProblems(new Map([['/a/', en]])).length, 1)
  const oneWay = page({ extra: link('en', '/a/') + link('x-default', '/a/') })
  assert.ok(hreflangProblems(new Map([['/a/', en], ['/el/a/', oneWay]])).length > 0)
})

test('a page no other page links to is an orphan', () => {
  const pages = new Map([['/', '<a href="/games/">Games</a>'], ['/games/', '<a href="/exitwise/">x</a>'], ['/exitwise/', ''], ['/lonely/', '']])
  assert.deepEqual(orphanPages(pages, ['/', '/games/', '/exitwise/', '/lonely/']), ['/lonely/'])
})
