// The "undefined" rule (tools/lib/leaked-text.mjs, check-site rule undefined-text; Platform job 26 C, from Palermo: its
// tip cards printed the word "undefined" before their fix): a page whose visible text holds it fails; scripts, JSON-LD,
// styles, comments, attributes and longer words don't count. Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leakedText, visibleText } from '../lib/leaked-text.mjs'

const page = (body, head = '<title>Palermo Noir journey: the tip cards</title>') => `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`

test('a page whose visible text says undefined fails, with the words around it', () => {
  const found = leakedText(page('<div class="w-tipcard"><p class="w-tip-label">Tip</p><p class="w-tip-title">undefined</p></div>'))
  assert.equal(found.length, 1)
  assert.match(found[0], /Tip undefined/)
  assert.equal(leakedText(page('<p>Tip: undefined, undefined</p>')).length, 2)
})

test('the title counts too, since it is shown in the tab and in search results', () => {
  assert.equal(leakedText(page('<p>All good</p>', '<title>undefined · Palermo Noir wiki</title>')).length, 1)
})

test('scripts, JSON-LD, styles, comments, SVG, templates and attributes are not visible text', () => {
  const body = [
    '<script>const tip = undefined; if (tip === undefined) {}</script>',
    '<script type="application/ld+json">{"name":"x","image":undefined}</script>',
    '<style>.a::after { content: "undefined" }</style>',
    '<!-- undefined -->',
    '<svg><text>undefined</text></svg>',
    '<template><p>undefined</p></template>',
    '<img src="a.webp" alt="undefined" width="1" height="1">',
    '<a href="/undefined/" title="undefined" data-x="undefined">Link</a>',
  ].join('\n')
  assert.deepEqual(leakedText(page(body)), [])
})

test('a longer word that holds it, or a different case, is not the leak', () => {
  assert.deepEqual(leakedText(page('<p>an undefinedness, my-undefined-thing and Undefined behaviour</p>')), [])
})

test('visibleText leaves the words of the page and drops the markup', () => {
  assert.match(visibleText(page('<h1>Hello <b>world</b></h1><script>x()</script>')), /Hello\s+world/)
  assert.doesNotMatch(visibleText(page('<h1>Hello</h1><script>x()</script>')), /x\(\)|<h1>/)
})

test('a page of the site that is fine passes', () => {
  assert.deepEqual(leakedText(page('<h1>Palermo Noir</h1><p>A mafia party game for 5 to 14 players.</p>')), [])
})
