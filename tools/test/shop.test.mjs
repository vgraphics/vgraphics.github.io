// Amazon affiliate links (tools/lib/shop.mjs; George, 11 Nov 2026, gear tips "C"): the link format, the placeholders
// that keep a link off a page, the Associates line, check-site's page rule, and every item the site's data names.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ASSOCIATES_TAG, disclosure, DISCLOSURE, isReady, ITEMS, PLACEHOLDER, shopChip, shopPageProblems, shopRow, shopUrl } from '../lib/shop.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const AMAZON_LINK = /^https:\/\/www\.amazon\.de\/dp\/[A-Za-z0-9_]+\?tag=[A-Za-z0-9_-]+$/

test('every link is an amazon.de product page with the Associates tag', () => {
  for (const id of Object.keys(ITEMS)) {
    assert.match(shopUrl(id), AMAZON_LINK)
    assert.ok(shopUrl(id).endsWith(`?tag=${ASSOCIATES_TAG}`))
  }
  assert.equal(shopUrl('speedometer-dash-mat'), `https://www.amazon.de/dp/B08C572S2B?tag=${ASSOCIATES_TAG}`)
})

test('a link holding a placeholder is never written, with its Ad mark and Associates line', () => {
  for (const id of Object.keys(ITEMS)) {
    const chip = shopChip({ item: id, label: 'Get it' })
    const row = shopRow({ item: id, icon: 'mat', title: 'T', text: 'W', label: 'See on Amazon' })
    if (shopUrl(id).includes(PLACEHOLDER)) {
      assert.equal(isReady(id), false)
      assert.equal(chip, '')
      assert.equal(row, '')
      assert.equal(disclosure([id]), '')
    } else {
      assert.equal(isReady(id), true)
      for (const html of [chip, row]) {
        assert.ok(html.includes('target="_blank" rel="sponsored noopener"'), html)
        assert.ok(html.includes('>Ad<'), html)
      }
      assert.ok(disclosure([id]).includes(DISCLOSURE))
    }
  }
  assert.equal(isReady('no-such-item'), false)
  assert.equal(shopChip({ item: 'no-such-item', label: 'x' }), '')
  // A new item before its ASIN is chosen (every real one is filled in since 11 Nov 2026).
  ITEMS['test-new-gear'] = { asin: `NEW${PLACEHOLDER}` }
  try {
    assert.equal(isReady('test-new-gear'), false)
    assert.equal(shopChip({ item: 'test-new-gear', label: 'Get it' }), '')
    assert.equal(shopRow({ item: 'test-new-gear', icon: 'mat', title: 'T', text: 'W', label: 'See on Amazon' }), '')
    assert.equal(disclosure(['test-new-gear']), '')
  } finally {
    delete ITEMS['test-new-gear']
  }
})

test('the live links: the vgraphics-21 tag, the picked film and mat, no price on the page', () => {
  assert.equal(ASSOCIATES_TAG, 'vgraphics-21')
  assert.equal(shopUrl('speedometer-hud-film'), 'https://www.amazon.de/dp/B0G24LVDRV?tag=vgraphics-21')
  assert.equal(shopUrl('speedometer-dash-mat'), 'https://www.amazon.de/dp/B08C572S2B?tag=vgraphics-21')
  assert.equal(DISCLOSURE, 'As an Amazon Associate I earn from qualifying purchases.')
  const row = shopRow({ item: 'speedometer-dash-mat', icon: 'mat', title: 'Phone sliding?', text: 'W', label: 'See on Amazon' })
  assert.ok(row.includes('aria-label="Ad: See on Amazon (opens in a new tab)"'), row)
  assert.doesNotMatch(row + shopChip({ item: 'speedometer-hud-film', label: 'Get the film' }), /€|\bEUR\b|\bprice\b|\bdeal\b/i)
})

test('the Associates line counts the links it sits under', () => {
  const ready = Object.keys(ITEMS).filter(isReady)
  assert.equal(disclosure([]), '')
  assert.equal(disclosure([undefined]), '')
  if (ready.length) assert.ok(disclosure([ready[0]]).startsWith('<p class="shop-disc">Affiliate link. '))
  if (ready.length > 1) assert.ok(disclosure(ready).startsWith('<p class="shop-disc">Affiliate links. '))
})

test("check-site's page rule: a new tab, sponsored noopener, no placeholder, the Associates line", () => {
  const good = `<a href="https://www.amazon.de/dp/B08C572S2B?tag=vgraphics-21" target="_blank" rel="sponsored noopener">x</a><p>${DISCLOSURE}</p>`
  assert.deepEqual(shopPageProblems(good), [])
  assert.deepEqual(shopPageProblems('<a href="https://example.com/">x</a>'), [])
  assert.equal(shopPageProblems('<a href="https://www.amazon.de/dp/B08C572S2B?tag=vgraphics-21" rel="sponsored noopener">x</a>').length, 2)
  assert.equal(shopPageProblems(`<a href="https://www.amazon.de/dp/B08C572S2B?tag=vgraphics-21" target="_blank" rel="noopener">x</a>${DISCLOSURE}`).length, 1)
  assert.equal(shopPageProblems(`<a href="https://www.amazon.de/dp/X?tag=ASSOCIATES_TAG_TODO" target="_blank" rel="sponsored noopener">x</a>${DISCLOSURE}`).length, 1)
})

test("every shop item the site's data names is one shop.mjs knows", () => {
  const files = ['speedometer-wallpaper/page.json', 'speedometer-wallpaper/faq.json', 'speedometer-wallpaper/wiki/wiki.json']
  const named = []
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk)
    if (!v || typeof v !== 'object') return
    if (v.shop) named.push(v.shop.item)
    if (v.type === 'gear') for (const r of v.items ?? []) named.push(r.item)
    Object.values(v).forEach(walk)
  }
  for (const f of files) walk(JSON.parse(readFileSync(join(root, f), 'utf8')))
  assert.ok(named.length >= 4, `found ${named.length} shop items`)
  for (const id of named) assert.ok(ITEMS[id], `${id} isn't in tools/lib/shop.mjs`)
})
