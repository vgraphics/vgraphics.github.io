// Help and the sign-up for news on every page (tools/lib/mail-list.mjs; VHub's newsletter-and-tickets design, George's
// "Approve all" of 30 Oct 2026): check-site's help-mail rule by kind of page. VHub's own pages, its /hub/join/ invite
// page among them, carry the company footer as the menu rule wants, sign-up included; a game's play, TV, join and demo
// screens carry no sign-up; every other footer links Help and carries the sign-up. Then the sign-up's look and places,
// check-site's sign-up-look rule, and what the sign-up says after the press.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { productFoot } from '../lib/legal.mjs'
import { headerHelpProblems, helpLink, helpMailProblems, mailList, signUpCssProblems, signUpLookProblems, WORDINGS } from '../lib/mail-list.mjs'
import { news } from '../lib/news.mjs'
import { closing, footer, header } from '../lib/partials.mjs'
import { loadProduct } from '../lib/product.mjs'

const LEGAL = '<p>© 2026 VGraphics. All rights reserved · <a href="/company/">Company</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms of use</a></p>'
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
  for (const path of ['/palermo/join/', '/palermo/tv/', '/palermo/tv-classic/', '/exitwise/play/', '/palermo/demo/screen.html']) {
    assert.deepEqual(helpMailProblems(path, page('<footer class="screen-foot">© 2026 VGraphics</footer>')), [], path)
    assert.equal(helpMailProblems(path, page(productFooter('palermo'))).length, 1, path)
    // What's new's row and the closing card's sign-up count too.
    assert.equal(helpMailProblems(path, page(mailList('exitwise', 'news'))).length, 1, path)
    assert.equal(helpMailProblems(path, page(mailList('exitwise', 'close'))).length, 1, path)
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

// The sign-up's look and places (George's "Keep" marks on the mail review page, 3 Nov 2026): a product's Sign up is its
// play button, wherever it stands (the footer, the end of What's new, the closing card); the company's its own .btn.
test("a product's Sign up is its play button in every place, the company's its own .btn", () => {
  for (const slug of ['exitwise', 'speedometer-wallpaper', 'palermo']) {
    for (const place of Object.keys(WORDINGS)) {
      const form = mailList(slug, place)
      assert.match(form, /<button class="play-cta" type="submit">Sign up<\/button>/, `${slug} ${place}`)
      assert.doesNotMatch(form, /class="btn/, `${slug} ${place}`)
    }
  }
  assert.match(mailList(null), /<button class="btn" type="submit">Sign up<\/button>/)
})

test('each place has its own field, words and words id', () => {
  assert.deepEqual(WORDINGS, { foot: 'site-footer-1', news: 'site-news-1', close: 'site-closing-1' })
  const [foot, row, close] = Object.keys(WORDINGS).map((place) => mailList('exitwise', place))
  assert.deepEqual([foot, row, close].map((f) => f.match(/<input id="([^"]+)"/)[1]), ['ml-exitwise', 'ml-exitwise-news', 'ml-exitwise-close'])
  assert.deepEqual([foot, row, close].map((f) => f.match(/data-wording="([^"]+)"/)[1]), Object.values(WORDINGS))
  // The footer's keeps its bare class, which the help-mail rule looks for in a footer.
  assert.match(foot, /^<form class="mail-list" data-topic="exitwise"/)
  assert.match(row, /^<form class="mail-list mail-list-news" data-topic="exitwise"/)
  assert.match(row, /<span class="mail-list-mark" aria-hidden="true"><svg/)
  assert.match(row, /<label class="mail-list-title" for="ml-exitwise-news">Get the next update by email<\/label><span class="mail-list-fine">One email a month at most, for people aged 16 and over\. <a href="\/privacy\/#website">Privacy<\/a><\/span>/)
  assert.match(close, /^<form class="mail-list mail-list-close" data-topic="exitwise"/)
  assert.match(close, /<span class="mail-list-or">Not ready yet\?<\/span>\s*<label class="mail-list-title" for="ml-exitwise-close">Get Exitwise news by email<\/label>/)
  assert.match(close, /<span class="mail-list-fine">For people aged 16 and over\./)
  // Palermo Noir's pages offer VGraphics news, and its row says so.
  assert.match(mailList('palermo', 'news'), /data-topic="vgraphics" data-product="palermo"[\s\S]*>Get VGraphics news by email<\/label>/)
})

test("What's new ends with the row, after the testers' block too", () => {
  const soon = news({ entries: [], testers: null }, {}, 'Exitwise', 'exitwise')
  assert.match(soon, /<form class="mail-list mail-list-news" data-topic="exitwise"[\s\S]*<\/form>$/)
  const entry = { version: '1.0.1', date: '2026-11-01', title: 'A new world', items: ['A line.'] }
  const both = news({ entries: [entry], testers: [entry, entry] }, {}, 'Speedometer', 'speedometer-wallpaper')
  assert.match(both, /data-topic="speedometer"/)
  assert.ok(both.indexOf('</template>') < both.indexOf('<form class="mail-list mail-list-news"'), "after the testers' block, so the two blocks stay side by side")
})

test("the closing card's sign-up is the product's own, under its buttons", () => {
  for (const [slug, id] of [['exitwise', 'exitwise'], ['speedometer-wallpaper', 'speedometer']]) {
    const html = closing(loadProduct(slug).page)
    assert.ok(html.indexOf('<div class="badges">') < html.indexOf('<form class="mail-list mail-list-close"'), slug)
    assert.match(html, new RegExp(`<form class="mail-list mail-list-close" data-topic="${id}" data-product="${id}"`), slug)
  }
})

// check-site's sign-up-look rule (tools/lib/mail-list.mjs signUpLookProblems, signUpCssProblems).
const productPage = (theme, body) => `<!doctype html><html><head><link rel="stylesheet" href="/${theme}/theme/theme.css"><link rel="stylesheet" href="/assets/product.css"></head><body>${body}</body></html>`

test("a product page's sign-ups are the product's own, in its play button's look and tokens", () => {
  const speedometer = loadProduct('speedometer-wallpaper')
  const built = productPage('speedometer-wallpaper', `<main>${closing(speedometer.page)}</main>${footer(speedometer)}`)
  assert.deepEqual(signUpLookProblems('/speedometer-wallpaper/', built), [])
  assert.deepEqual(signUpLookProblems('/exitwise/', productPage('exitwise', news({ entries: [], testers: null }, {}, 'Exitwise', 'exitwise'))), [])
  assert.deepEqual(signUpLookProblems('/palermo/wiki/', productPage('palermo', mailList('palermo'))), [])
  // Speedometer's yellow Sign up as it was: its --cta in the chunky .btn.
  assert.deepEqual(signUpLookProblems('/speedometer-wallpaper/', built.replace('<button class="play-cta" type="submit">', '<button class="btn" type="submit">')), [
    `the sign-up ml-speedometer-wallpaper-close: its Sign up isn't the product's play button (class "play-cta")`,
    'the sign-up ml-speedometer-wallpaper-close: its Sign up carries .btn, the chunky --cta button: the play button\'s look alone',
  ])
  // Another product's sign-up, colours of its own, another product's theme.
  assert.deepEqual(signUpLookProblems('/speedometer-wallpaper/', productPage('speedometer-wallpaper', mailList('exitwise'))), ["the sign-up ml-exitwise is exitwise's, not speedometer's"])
  assert.deepEqual(signUpLookProblems('/exitwise/', productPage('exitwise', mailList('exitwise').replace('novalidate>', 'novalidate style="--play: #FFB547">'))), [
    "the sign-up ml-exitwise sets colours of its own (a style attribute): the product's tokens only",
  ])
  assert.deepEqual(signUpLookProblems('/exitwise/wiki/', productPage('speedometer-wallpaper', mailList('exitwise'))), [
    "the page doesn't link /exitwise/theme/theme.css, the product's tokens its sign-up reads",
    "the page links /speedometer-wallpaper/theme/theme.css, another product's tokens",
  ])
})

test("the company pages keep their own Sign up; VHub's pages and pages without a sign-up have nothing to check", () => {
  assert.deepEqual(signUpLookProblems('/', page(companyFoot)), [])
  assert.deepEqual(signUpLookProblems('/games/', page(mailList('exitwise'))), ["a company page's sign-up has a product's play button (.play-cta): the company pages keep their own .btn"])
  assert.deepEqual(signUpLookProblems('/hub/settings/', page(mailList('exitwise'))), [])
  assert.deepEqual(signUpLookProblems('/exitwise/', page('')), [])
})

test("product.css gives the sign-up's buttons .play-cta's colours alone", () => {
  assert.deepEqual(signUpCssProblems(readFileSync(new URL('../../assets/product.css', import.meta.url), 'utf8')), [])
  assert.deepEqual(signUpCssProblems('.mail-list-row .btn { min-height: 44px; border-bottom: 4px solid var(--cta-edge); }'), [
    "\".mail-list-row .btn\" reads the chunky button's --cta tokens: the sign-up takes the play button's (--play, --sb, --play-ink)",
  ])
  assert.deepEqual(signUpCssProblems('@media (min-width: 760px) { .mail-list .play-cta { background: #FFB547; color: #170A02; } }'), [
    "\".mail-list .play-cta\" sets the colours of the sign-up's button: .play-cta gives them, from the product's tokens",
  ])
  // The sign-up's own parts may have colours, and rules about other things aren't its.
  assert.deepEqual(signUpCssProblems('.mail-state-actions :is(button, a) { color: var(--ink); background: none; } .foot-cta .btn { background: var(--cta); }'), [])
})

// What the sign-up says after the press (assets/mail-list.js; George kept "after the press" on the mail review page,
// 3 Nov 2026: "Keep as designed"). The script runs here without a page: it hands its words, its cards and the meaning
// of VHub's answers to globalThis.VGMailList and wires nothing.
const pageScript = () => {
  const sandbox = {}
  runInNewContext(readFileSync(new URL('../../assets/mail-list.js', import.meta.url), 'utf8'), sandbox)
  return sandbox.VGMailList
}

test("VHub's answer is a card or an error under the field; a typed address gets the inbox card", () => {
  const { outcome } = pageScript()
  assert.deepEqual({ ...outcome('pending') }, { card: 'inbox' })
  assert.deepEqual({ ...outcome('confirmed') }, { card: 'signed' })
  assert.deepEqual({ ...outcome('limit') }, { card: 'limit' })
  assert.deepEqual({ ...outcome('invalid') }, { field: 'invalid' })
  assert.deepEqual({ ...outcome('age') }, { field: 'age' })
  // Anything VHub didn't mean (no answer, a new result) is the failure card, never nothing.
  for (const result of [undefined, null, 'something-new']) assert.deepEqual({ ...outcome(result) }, { card: 'failed' }, String(result))
})

test('each state has its card, as designed', () => {
  const { VIEWS } = pageScript()
  const shape = (kind) => {
    const v = VIEWS[kind]
    return { tone: v.tone, mark: v.mark, chips: v.chips ?? null, actions: [...v.actions], note: v.note ?? null, next: !!v.next, main: v.main ?? null }
  }
  assert.deepEqual(Object.keys(VIEWS), ['inbox', 'signed', 'already', 'unsub', 'limit', 'failed', 'expired'])
  assert.deepEqual(shape('inbox'), { tone: 'quiet', mark: 'mail', chips: 'asked', actions: ['again', 'change'], note: 'inboxNote', next: false, main: null })
  assert.deepEqual(shape('signed'), { tone: 'play', mark: 'check', chips: 'topics', actions: ['manage'], note: null, next: true, main: null })
  assert.deepEqual(shape('already'), { tone: 'quiet', mark: 'check', chips: 'topics', actions: ['manage'], note: null, next: true, main: null })
  assert.deepEqual(shape('unsub'), { tone: 'quiet', mark: 'wave', chips: null, actions: ['signUpAgain'], note: null, next: true, main: null })
  assert.deepEqual(shape('limit'), { tone: 'error', mark: 'bang', chips: null, actions: [], note: null, next: false, main: null })
  assert.deepEqual(shape('failed'), { tone: 'error', mark: 'bang', chips: null, actions: ['retry'], note: null, next: false, main: null })
  assert.deepEqual(shape('expired'), { tone: 'error', mark: 'bang', chips: null, actions: [], note: null, next: false, main: 'resend' })
})

test("every card's words are there, in English and in Greek", () => {
  const { WORDS, VIEWS, NEXT } = pageScript()
  for (const lang of ['en', 'el']) {
    for (const [kind, v] of Object.entries(VIEWS)) {
      for (const key of [v.title, v.line, v.chips, v.note, v.main, ...v.actions].filter(Boolean)) assert.equal(typeof WORDS[lang][key], 'string', `${lang} ${kind} ${key}`)
    }
    for (const { words } of Object.values(NEXT)) assert.equal(typeof WORDS[lang][words], 'string', `${lang} ${words}`)
    for (const key of ['sending', 'againIn', 'againDone', 'invalid', 'age']) assert.equal(typeof WORDS[lang][key], 'string', `${lang} ${key}`)
  }
  // The lines that name the address, the topic or the wait keep their places in both languages.
  for (const key of ['inboxLine', 'signedLine', 'alreadyLine', 'expiredLine']) assert.ok(WORDS.en[key].includes('{email}') && WORDS.el[key].includes('{email}'), key)
  assert.ok(WORDS.en.alreadyLine.includes('{topic}') && WORDS.el.alreadyLine.includes('{topic}'))
  assert.ok(WORDS.en.againIn.includes('{time}') && WORDS.el.againIn.includes('{time}'))
})

test('the lines fill in, and Send again counts down the 10 minutes', () => {
  const { say, clock, TOPICS } = pageScript()
  assert.equal(say('{topic} news already comes to {email}.', { topic: 'Exitwise', email: 'fan@example.com' }), 'Exitwise news already comes to fan@example.com.')
  assert.equal(say('Τα νέα {topic} έρχονται ήδη.', { topic: TOPICS.exitwise.el }), 'Τα νέα του Exitwise έρχονται ήδη.')
  assert.equal(say('Send again in {time}'), 'Send again in {time}')
  assert.equal(clock(10 * 60 * 1000), '10:00')
  assert.equal(clock(592000), '9:52')
  assert.equal(clock(1), '0:01')
  assert.equal(clock(-5), '0:00')
})

test("each topic's chip has its icon on the site, and each next step leads to a page", () => {
  const { TOPICS, NEXT } = pageScript()
  assert.deepEqual(Object.keys(TOPICS).sort(), Object.keys(NEXT).sort())
  for (const [id, t] of Object.entries(TOPICS)) assert.ok(existsSync(new URL(`../..${t.icon}`, import.meta.url)), `${id} ${t.icon}`)
  for (const [id, n] of Object.entries(NEXT)) assert.ok(existsSync(new URL(`../..${n.href}index.html`, import.meta.url)), `${id} ${n.href}`)
  // Every topic a form asks for has its chip: the products with a topic, and VGraphics.
  for (const slug of ['exitwise', 'speedometer-wallpaper', 'palermo', null]) assert.ok(TOPICS[mailList(slug).match(/data-topic="([^"]+)"/)[1]], String(slug))
})

test('the words in English, and in Greek on a Greek page', () => {
  const { WORDS, wordsFor } = pageScript()
  assert.equal(wordsFor('el'), WORDS.el)
  assert.equal(wordsFor('el-GR'), WORDS.el)
  assert.equal(wordsFor('en'), WORDS.en)
  assert.equal(wordsFor(''), WORDS.en)
  assert.deepEqual(Object.keys(WORDS.el).sort(), Object.keys(WORDS.en).sort())
  for (const [key, text] of Object.entries(WORDS.en)) assert.doesNotMatch(text, /[\u0370-\u03FF]/, `en ${key}`)
  for (const [key, text] of Object.entries(WORDS.el)) assert.match(text, /[\u0370-\u03FF]/, `el ${key}`)
  assert.equal(WORDS.en.inbox, 'Check your inbox')
  assert.equal(WORDS.el.inbox, 'Έλεγξε τα εισερχόμενά σου')
})
