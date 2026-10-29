// A page rule that takes a button's colours over (tools/lib/buttons.mjs; George, 29 Oct 2026, on /exitwise/ranking/'s
// error state: "The button shows no text. Check it."): selector weights, the buttons a page's markup and scripts hold,
// and the rules check-site fails, the ranking's `.ranking button` among them.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buttonOverrides, buttonsOf, rulesOf, specificity } from '../lib/buttons.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = (path) => readFileSync(join(root, path), 'utf8')
const overrides = (css, html, scripts = []) => buttonOverrides(rulesOf(css, 'page.css'), buttonsOf(html, scripts))
const BTN = '.btn { color: #FFFDF8; background: #3B3355; font: 700 1.1rem/1 sans-serif; }'

test('selectors weigh as the browser weighs them: :where() nothing, :is() and :not() their heaviest argument', () => {
  assert.deepEqual(specificity('.btn'), [0, 1, 0])
  assert.deepEqual(specificity('.ranking button'), [0, 1, 1])
  assert.deepEqual(specificity('.ranking button:where(:not(.btn))'), [0, 1, 1])
  assert.deepEqual(specificity('.ranking button:not(.btn)'), [0, 2, 1])
  assert.deepEqual(specificity('.vhub-menu :where(a, button)'), [0, 1, 0])
  assert.deepEqual(specificity(':is(.top.scrolled, .top) :is(.subnav a.play, a.play)'), [0, 4, 1])
  assert.deepEqual(specificity('#panel .row > a:hover'), [1, 2, 1])
  assert.deepEqual(specificity('.subnav a[aria-current="page"]'), [0, 2, 1])
})

test('the ranking\'s Try again, which its script writes into the board, lost its colour and type to `.ranking button`', () => {
  const html = '<section class="ranking"><div class="state" id="state"><div id="state-actions"></div></div></section>'
  const script = '$("state-actions").innerHTML = `<button class="btn" type="button" id="retry">Try again</button>`;'
  const found = overrides(`${BTN} .ranking button { font: inherit; color: inherit; }`, html, [script])
  assert.deepEqual(found.map((f) => [f.from, f.selector, f.props.sort()]), [['page.css', '.ranking button', ['color', 'font']]])
  assert.match(found[0].button, /#state/)
})

test('a box\'s reset that leaves the buttons out, or weighs one class, takes nothing', () => {
  const html = '<section class="ranking"><div id="state-actions"></div></section>'
  const script = 'document.getElementById("state-actions").innerHTML = \'<button class="btn">Try again</button>\''
  assert.deepEqual(overrides(`${BTN} .ranking button:where(:not(.btn)) { font: inherit; color: inherit; }`, html, [script]), [])
  assert.deepEqual(overrides(`${BTN} .ranking :where(a, button) { font: inherit; color: inherit; }`, html, [script]), [])
})

test('a button in a page\'s markup: a box rule outranking it fails, unless the button\'s own rule there outranks it back', () => {
  const html = '<footer class="foot"><div class="foot-cta"><a class="btn" href="/play/">Play</a></div><a href="/terms/">Terms</a></footer>'
  assert.deepEqual(overrides(`${BTN} .foot a { color: #222; }`, html).map((f) => [f.selector, f.props, f.button]),
    [['.foot a', ['color'], 'a.btn']])
  assert.deepEqual(overrides(`${BTN} .foot a { color: #222; } .foot-cta .btn { color: #FFF; }`, html), [])
})

test('a box rule takes nothing from a button it can\'t reach: in another box, of another element, or a property the button leaves', () => {
  const html = '<div class="faq-a"><a href="#a">Read more</a></div><main><a class="btn" href="/play/">Play</a></main>'
  assert.deepEqual(overrides(`${BTN} .faq-a a { color: #3B3355; }`, html), [])
  const links = '<div class="box"><a class="btn" href="/play/">Play</a></div>'
  assert.deepEqual(overrides(`${BTN} .box button { color: inherit; }`, links), [])
  assert.deepEqual(overrides(`${BTN} .box a { text-decoration: underline; padding: 0; }`, links), [])
})

test('the button classes are .btn, its kinds and the classes named as buttons', () => {
  const html = '<header class="top"><nav class="subnav"><a class="play-cta" href="/play/">Play</a></nav></header>' +
    '<div class="cta"><a class="btn btn-primary" href="/">Go</a><button class="ost-btn">Play</button><a class="card" href="/">Card</a></div>'
  assert.deepEqual(buttonsOf(html).map((b) => b.where), ['a.play-cta', 'a.btn.btn-primary', 'button.ost-btn'])
  assert.deepEqual(overrides('.play-cta { color: #FFF; } .top a { color: #EEE; }', html).map((f) => f.selector), ['.top a'])
})

test('the ranking page keeps its Try again\'s colours and type, and the check still sees that button', () => {
  const html = read('exitwise/ranking/index.html')
  const css = ['exitwise/theme/theme.css', 'assets/product.css', 'assets/cursors.css', 'exitwise/ranking/ranking.css']
  const buttons = buttonsOf(html, [read('exitwise/ranking/ranking.js')])
  assert.ok(buttons.some((b) => b.tag === '*' && b.ancestors.has('ranking')), 'the script\'s .btn inside .ranking')
  assert.deepEqual(buttonOverrides(css.flatMap((f) => rulesOf(read(f), f)), buttons), [])
})

test('the avatar menu\'s reset weighs one class, so the menu\'s own buttons keep their type', () => {
  const rule = rulesOf(read('assets/account.css')).find((r) => r.elements && r.boxes.includes('vhub-menu') && r.props.includes('font'))
  assert.deepEqual(rule?.weight, [0, 1, 0], rule?.selector)
})
