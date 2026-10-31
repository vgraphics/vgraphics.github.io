// Help and the sign-up for news on every page (tools/lib/mail-list.mjs; VHub's newsletter-and-tickets design, George's
// "Approve all" of 30 Oct 2026): check-site's help-mail rule by kind of page. VHub's own pages, its /hub/join/ invite
// page among them, carry the company footer as the menu rule wants, sign-up included; a game's play, TV, join and demo
// screens carry no sign-up; every other footer links Help and carries the sign-up.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { productFoot } from '../lib/legal.mjs'
import { helpLink, helpMailProblems, mailList } from '../lib/mail-list.mjs'

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
