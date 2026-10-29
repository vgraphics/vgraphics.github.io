// The legal line by kind of page (tools/lib/legal.mjs; George, 29 Oct 2026: "These are only required at the website not
// in the apps. Apps just can say VGraphics."): which addresses are a product's screens, what each kind of page must and
// must not show, the company footer's product version, and the template's footer on a landing page and a try page.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isProductScreen, legalProblems, PRODUCT_LEGAL, productFoot } from '../lib/legal.mjs'
import { footer, LEGAL } from '../lib/partials.mjs'
import { loadProduct, loadSubpage } from '../lib/product.mjs'

const FULL = '<p>© 2026 VGRAPHICS SINGLE MEMBER P.C. All rights reserved · G.E.MI. no. 181823306000 · VAT no. EL802736373 · Kalamaria, Greece · <a href="/company/">Company information</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms of use</a></p>'

test('a product\'s play, TV, join and demo pages, the hub and the try pages are product screens', () => {
  for (const path of ['/exitwise/play/', '/speedometer-wallpaper/play/', '/palermo/tv/', '/palermo/join/', '/palermo/demo/',
    '/palermo/demo/screen.html', '/hub/', '/hub/settings/', '/hub/delete/']) {
    assert.equal(isProductScreen(path), true, path)
  }
})

test('the website\'s pages, the company\'s /tv/ and /join/ doors and the hub\'s policy are not', () => {
  for (const path of ['/', '/tv/', '/join/', '/company/', '/privacy/', '/terms/', '/exitwise/', '/exitwise/wiki/',
    '/exitwise/wiki/worlds/', '/exitwise/privacy.html', '/palermo/gallery/', '/speedometer-wallpaper/styles/classic/', '/hub/privacy.html']) {
    assert.equal(isProductScreen(path), false, path)
  }
})

test('a website page needs the full line, and a product screen\'s short line is not enough for it', () => {
  assert.deepEqual(legalProblems('/exitwise/', `<footer>${FULL}</footer>`), [])
  const short = legalProblems('/exitwise/', `<footer><p>${PRODUCT_LEGAL}</p></footer>`)
  assert.ok(short.some((m) => m.includes('G.E.MI. no. 181823306000')), short.join('\n'))
  assert.ok(short.some((m) => m.includes('/terms/')), short.join('\n'))
})

test('a product screen says "© <year> VGraphics" and none of the company\'s numbers', () => {
  assert.deepEqual(legalProblems('/hub/', `<footer><p>${PRODUCT_LEGAL}</p></footer>`), [])
  assert.deepEqual(legalProblems('/palermo/tv/', '<footer id="party-legal" class="party-legal">© 2026 VGraphics</footer>'), [])
  const full = legalProblems('/palermo/tv/', `<footer>${FULL}</footer>`)
  for (const s of ['G.E.MI.', '181823306000', 'EL802736373', 'VAT no.']) assert.ok(full.some((m) => m.includes(`"${s}"`)), s)
  assert.ok(full.some((m) => m.includes('without its legal line')), 'the full line is not the short one')
  assert.deepEqual(legalProblems('/exitwise/play/', '<footer></footer>'), ['a product screen without its legal line "© <year> VGraphics"'])
})

test('the company footer\'s product version swaps only its legal paragraph', () => {
  const foot = `<footer class="site-foot"><nav><a href="/company/">Company</a></nav>${FULL}</footer>`
  assert.equal(productFoot(foot), '<footer class="site-foot"><nav><a href="/company/">Company</a></nav><p>© 2026 VGraphics</p></footer>')
  assert.equal(productFoot(foot.replace('© 2026', '&copy; 2026')), productFoot(foot))
})

test('the template writes the full line on a landing page and the short one on a try page', () => {
  const landing = footer(loadProduct('speedometer-wallpaper'))
  assert.ok(landing.includes(LEGAL) && !landing.includes(PRODUCT_LEGAL))
  const play = footer(loadSubpage('speedometer-wallpaper', 'play'))
  assert.ok(play.includes(`<p class="legal">${PRODUCT_LEGAL}`) && !play.includes('G.E.MI.'))
})
