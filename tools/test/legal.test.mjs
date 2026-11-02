// The legal line by kind of page (tools/lib/legal.mjs; George, 31 Oct 2026: "These are required only at company page
// at vgraphics.gr. Remove from everywhere else."): which addresses are a product's screens, what each kind of page must
// and must not show, the controller sentence a privacy policy may carry, the company footer's product and company
// versions, the template's footer on a landing page and a try page's bar.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COMPANY_LEGAL, companyFoot, CONTROLLER, isCompanyPage, isPolicy, isProductScreen, legalProblems, PRODUCT_LEGAL, productFoot, SITE_LEGAL } from '../lib/legal.mjs'
import { footer, LEGAL, screenBar } from '../lib/partials.mjs'
import { loadProduct, loadSubpage } from '../lib/product.mjs'

const FULL = `<p>${COMPANY_LEGAL.replace('&copy;', '©')}</p>`
const SHORT = `<p>${SITE_LEGAL.replace('&copy;', '©')}</p>`

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

test('only /company/ is the company page, and the policies are the privacy pages', () => {
  assert.equal(isCompanyPage('/company/'), true)
  for (const path of ['/', '/terms/', '/privacy/', '/exitwise/']) assert.equal(isCompanyPage(path), false, path)
  for (const path of ['/privacy/', '/exitwise/privacy.html', '/palermo/privacy/source.html', '/hub/privacy.html']) assert.equal(isPolicy(path), true, path)
  for (const path of ['/terms/', '/exitwise/map-rules.html', '/exitwise/wiki/privacy-mode/']) assert.equal(isPolicy(path), false, path)
})

test('the company page needs the full line, and the short one is not enough for it', () => {
  assert.deepEqual(legalProblems('/company/', `<footer>${FULL}</footer>`), [])
  const short = legalProblems('/company/', `<footer>${SHORT}</footer>`)
  for (const s of ['VGRAPHICS SINGLE MEMBER P.C.', 'G.E.MI. no. 181823306000', 'VAT no. EL802736373']) assert.ok(short.some((m) => m.includes(s)), s)
})

test('every other website page says "© <year> VGraphics. All rights reserved" with its links, and none of the details', () => {
  assert.deepEqual(legalProblems('/exitwise/', `<footer>${SHORT}</footer>`), [])
  assert.deepEqual(legalProblems('/terms/', `<footer>${SHORT}</footer>`), [])
  const full = legalProblems('/exitwise/', `<footer>${FULL}</footer>`)
  for (const s of ['G.E.MI.', '181823306000', 'EL802736373', 'VAT no.', 'Kalamaria', 'VGRAPHICS SINGLE MEMBER P.C.']) assert.ok(full.some((m) => m.includes(`"${s}"`)), s)
  assert.ok(full.some((m) => m.includes('no copyright line')), full.join('\n'))
  const bare = legalProblems('/games/', `<footer><p>${PRODUCT_LEGAL}</p></footer>`)
  for (const s of ['no copyright line', '/company/', '/privacy/', '/terms/']) assert.ok(bare.some((m) => m.includes(s)), s)
  // the party doors put "All rights reserved" in a span, in the door's language
  assert.deepEqual(legalProblems('/tv/', '<footer>&copy; 2026 VGraphics. <span data-legal="rights">All rights reserved</span> · <a href="/company/">Company</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></footer>'), [])
})

test('a privacy policy may name the company in its controller sentence, and nowhere else', () => {
  const policy = `<main><p>${CONTROLLER}</p></main><footer>${SHORT}</footer>`
  assert.deepEqual(legalProblems('/exitwise/privacy.html', policy), [])
  assert.deepEqual(legalProblems('/hub/privacy.html', policy), [])
  const elsewhere = legalProblems('/exitwise/privacy.html', policy.replace('<main>', '<main><p>VGRAPHICS SINGLE MEMBER P.C. runs this.</p>'))
  assert.ok(elsewhere.some((m) => m.includes('outside the sentence')), elsewhere.join('\n'))
  const numbers = legalProblems('/privacy/', policy.replace('</main>', '<p>G.E.MI. no. 181823306000</p></main>'))
  assert.ok(numbers.some((m) => m.includes('"G.E.MI."')), numbers.join('\n'))
  // the sentence is a policy's alone: the terms of use may not borrow it
  assert.ok(legalProblems('/terms/', policy).some((m) => m.includes('"VGRAPHICS SINGLE MEMBER P.C."')))
})

test('a product screen says "© <year> VGraphics" and none of the company\'s details', () => {
  assert.deepEqual(legalProblems('/hub/', `<footer><p>${PRODUCT_LEGAL}</p></footer>`), [])
  assert.deepEqual(legalProblems('/palermo/tv/', '<footer id="party-legal" class="party-legal">© 2026 VGraphics</footer>'), [])
  const full = legalProblems('/palermo/tv/', `<footer>${FULL}</footer>`)
  for (const s of ['G.E.MI.', '181823306000', 'EL802736373', 'VAT no.', 'Kalamaria']) assert.ok(full.some((m) => m.includes(`"${s}"`)), s)
  assert.ok(full.some((m) => m.includes('without its legal line')), 'the full line is not the short one')
  assert.deepEqual(legalProblems('/exitwise/play/', '<footer></footer>'), ['a product screen without its legal line "© <year> VGraphics"'])
})

test('the company footer swaps only its legal paragraph: short on a product screen, full on the company page', () => {
  const foot = `<footer class="site-foot"><nav><a href="/company/">Company information</a></nav>${SHORT}</footer>`
  assert.equal(productFoot(foot), '<footer class="site-foot"><nav><a href="/company/">Company information</a></nav><p>© 2026 VGraphics</p></footer>')
  assert.equal(companyFoot(foot), `<footer class="site-foot"><nav><a href="/company/">Company information</a></nav>${FULL}</footer>`)
  assert.equal(productFoot(foot.replace('© 2026', '&copy; 2026')), productFoot(foot))
  // VHub's hub copies the footer from the live site, which may still carry the old full line for a while
  assert.equal(productFoot(foot.replace(SHORT, FULL)), productFoot(foot))
})

test('the template writes the website\'s line on a landing page and the product\'s in a try page\'s bar', () => {
  assert.equal(LEGAL, SITE_LEGAL)
  const landing = footer(loadProduct('speedometer-wallpaper'))
  assert.ok(landing.includes(SITE_LEGAL) && !landing.includes('G.E.MI.'))
  assert.deepEqual(legalProblems('/speedometer-wallpaper/', landing), [])
  const play = screenBar(loadSubpage('speedometer-wallpaper', 'play'))
  assert.ok(play.includes(`<span class="legal">${PRODUCT_LEGAL}`) && !play.includes('G.E.MI.'))
  assert.deepEqual(legalProblems('/speedometer-wallpaper/play/', play), [])
})
