// Help and the sign-up for news on every page (tools/lib/mail-list.mjs; VHub's newsletter-and-tickets design, George's
// "Approve all" of 30 Oct 2026): check-site's help-mail rule by kind of page. VHub's own pages, its /hub/join/ invite
// page among them, carry the company footer as the menu rule wants, sign-up included; a game's play, TV, join and demo
// screens carry no sign-up; every other footer links Help and carries the sign-up.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { productFoot } from '../lib/legal.mjs'
import { headerHelpProblems, helpLink, helpMailProblems, mailList } from '../lib/mail-list.mjs'
import { footer, header } from '../lib/partials.mjs'
import { loadProduct } from '../lib/product.mjs'

const LEGAL = '<p>© 2026 VGRAPHICS SINGLE MEMBER P.C. All rights reserved · G.E.MI. no. 181823306000 · VAT no. EL802736373</p>'
/** The company footer as index.html has it: the sign-up for VGraphics news and the Help link. */
const companyFoot = `<footer class="site-foot"><div class="wrap foot-news">${mailList(null)}</div><nav><a href="/hub/support/">Help and ideas</a></nav><div class="wrap legal">${LEGAL}</div></footer>`
/** A product page's footer as the template writes it. */
const productFooter = (slug, { help = true, signUp = true } = {}) =>
  `<footer class="foot has-art"><nav>${help ? `<a href="${helpLink(slug)[0]}">Help</a>` : ''}</nav>${signUp ? mailList(slug) : ''}</footer>`
const page = (foot) => `<!doctype html><html><body><main></main>${foot}</body></html>`

test("VHub's pages, its join page too, keep the company footer with its sign-up", () => {
  for (const path of ['/hub/join/', '/hub/settings/', '/hub/support/', '/hub/']) {
    assert.deepEqual(helpMailProblems(path, page(productFoot(companyFoot))), [], path)
  }
})

test("a game's play, TV, join and demo screens carry no sign-up", () => {
  for (const path of ['/palermo/join/', '/palermo/tv/', '/exitwise/play/', '/palermo/demo/screen.html']) {
    assert.deepEqual(helpMailProblems(path, page('<footer class="screen-foot">© 2026 VGraphics</footer>')), [], path)
    assert.equal(helpMailProblems(path, page(productFooter('palermo'))).length, 1, path)
  }
})

test('every other footer links Help and carries the sign-up', () => {
  assert.deepEqual(helpMailProblems('/exitwise/', page(productFooter('exitwise'))), [])
  assert.deepEqual(helpMailProblems('/', page(companyFoot)), [])
  assert.deepEqual(helpMailProblems('/exitwise/wiki/', page(productFooter('exitwise', { help: false }))), ['the footer has no Help link to /hub/support/'])
  assert.deepEqual(helpMailProblems('/games/', page(productFoot(companyFoot).replace(/<form class="mail-list"[\s\S]*?<\/form>/, ''))), [
    'the footer has no sign-up for news by email (tools/lib/mail-list.mjs)',
  ])
  // A page without either footer has nothing to check.
  assert.deepEqual(helpMailProblems('/exitwise/privacy.html', page('')), [])
})

test("the Help link names the product's VHub id, and the sign-up its topic", () => {
  assert.deepEqual(helpLink('speedometer-wallpaper'), ['/hub/support/?p=speedometer', 'Help'])
  assert.deepEqual(helpLink('nowhere'), ['/hub/support/', 'Help'])
  assert.match(mailList('exitwise'), /data-topic="exitwise"/)
  // Palermo Noir has no topic while VHub's catalog keeps it unlisted: its pages offer VGraphics news.
  assert.match(mailList('palermo'), /data-topic="vgraphics" data-product="palermo"/)
})

// Help in plain sight (George, 31 Oct 2026: "Help menu, I found it. Barely visible.").
test("every header has Help: the company header, and a product's before its play button", () => {
  const home = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
  assert.deepEqual(headerHelpProblems('/', home), [])
  assert.match(home, /<a class="n-help" href="\/hub\/support\/">Help<\/a>\s*<a class="cta" href="#contact">Contact<\/a>/)
  const exitwise = header(loadProduct('exitwise'))
  assert.deepEqual(headerHelpProblems('/exitwise/', `${exitwise}<main></main>`), [])
  assert.ok(exitwise.indexOf('href="/hub/support/?p=exitwise"') < exitwise.indexOf('class="play"'), 'Help comes before the play button')
  assert.deepEqual(headerHelpProblems('/exitwise/', '<header class="top"><nav class="subnav"><a href="/exitwise/">Overview</a></nav></header>'), [
    'the header has no Help link to /hub/support/',
  ])
  // VHub's pages are the menu rule's: they copy the company header.
  assert.deepEqual(headerHelpProblems('/hub/friends/', '<header class="site-head"><nav class="site-nav"></nav></header>'), [])
})

test("the footer's Help link is the product's pill", () => {
  const foot = footer(loadProduct('speedometer-wallpaper'))
  assert.match(foot, /<a class="foot-help" href="\/hub\/support\/\?p=speedometer">Help<\/a>/)
})

// What the sign-up says after the press (assets/mail-list.js; George, 31 Oct 2026: "I added my email to news letter but
// only a text small confirmation showing. Fix it."). The script runs here without a page: it hands its words and the
// meaning of VHub's answers to globalThis.VGMailList and wires nothing.
const pageScript = () => {
  const sandbox = {}
  runInNewContext(readFileSync(new URL('../../assets/mail-list.js', import.meta.url), 'utf8'), sandbox)
  return sandbox.VGMailList
}

test("a sign-up's answer is a card (the link went, or signed up at once) or an error in plain words", () => {
  const { WORDS, outcome } = pageScript()
  assert.deepEqual({ ...outcome('pending', WORDS.en) }, { card: true, title: 'Almost there', line: 'We sent a link to {email}. Tap it to confirm.' })
  assert.equal(outcome('confirmed', WORDS.en).title, "You're signed up")
  assert.deepEqual({ ...outcome('limit', WORDS.en) }, { card: false, error: 'Too many sign-ups from here right now. Try again in an hour.' })
  assert.equal(outcome('invalid', WORDS.en).error, "That doesn't look like an email address. Check it and try again.")
  // Anything VHub didn't mean (no answer, a new result) reads as a failure, never as nothing.
  assert.equal(outcome(undefined, WORDS.en).error, WORDS.en.failed)
  assert.equal(outcome('something-new', WORDS.en).error, WORDS.en.failed)
})

test('the card and the errors in English, and in Greek on a Greek page', () => {
  const { WORDS, wordsFor } = pageScript()
  assert.equal(wordsFor('el'), WORDS.el)
  assert.equal(wordsFor('el-GR'), WORDS.el)
  assert.equal(wordsFor('en'), WORDS.en)
  assert.equal(wordsFor(''), WORDS.en)
  assert.deepEqual(Object.keys(WORDS.el).sort(), Object.keys(WORDS.en).sort())
  for (const [key, text] of Object.entries(WORDS.en)) assert.doesNotMatch(text, /[\u0370-\u03FF]/, `en ${key}`)
  for (const [key, text] of Object.entries(WORDS.el)) assert.match(text, /[\u0370-\u03FF]/, `el ${key}`)
  assert.equal(WORDS.el.almost, 'Σχεδόν έτοιμο')
  assert.ok(WORDS.el.sent.includes('{email}'))
})
