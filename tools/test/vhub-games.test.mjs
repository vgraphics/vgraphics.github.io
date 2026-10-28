// The game and app rows of the VHub avatar's menu (assets/vhub-games.js, drawn by assets/account.js), in both of its lists:
// the product's icon in a rounded tile, the same size for every product, then its name (George, 28 Oct 2026: "Use logo
// only (icon not letters) and then app name. Use rounded clip for aps icons and same size for all.").
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ICON_PX, gameRow, shortName } from '../../assets/vhub-games.js'

/** account.js's el() as plain objects, so the rows draw without a DOM. */
const el = (tag, attrs = {}, ...children) => ({ tag, attrs, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) })
const text = (node) => (typeof node === 'string' ? node : node.children.map(text).join(''))

// As VHub's catalog index publishes them (catalog/products.json).
const exitwise = { id: 'exitwise', name: 'Exitwise', kind: 'game', logo: '/exitwise/assets/logo-300.webp', icon: '/hub/products/exitwise-icon.webp' }
const speedometer = { id: 'speedometer', name: 'Speedometer Live Wallpaper', kind: 'app', logo: '/speedometer-wallpaper/img/icon.png', icon: '/hub/products/speedometer-icon.webp' }

const css = readFileSync(new URL('../../assets/account.css', import.meta.url), 'utf8')
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** The body of the rule whose selector is exactly `selector`, at the start of a line. */
const rule = (selector) => css.match(new RegExp(`(?:^|\\n)${escape(selector)}\\s*\\{([^}]*)\\}`))?.[1] ?? ''

test("a row is the product's icon, then its name", () => {
  const row = gameRow(el, exitwise, () => {})
  assert.equal(row.tag, 'button')
  assert.equal(row.children.length, 2)
  const [tile, name] = row.children
  assert.equal(tile.tag, 'img')
  assert.equal(tile.attrs.class, 'vm-game-icon')
  assert.equal(tile.attrs.src, exitwise.icon)
  // The name stands beside it, so the picture says nothing more to a screen reader.
  assert.equal(tile.attrs.alt, '')
  assert.equal(name.attrs.class, 'vm-game-name')
  assert.equal(text(name), 'Exitwise')
})

test('never the logo, whose wordmark has letters', () => {
  for (const p of [exitwise, speedometer]) assert.ok(!JSON.stringify(gameRow(el, p, () => {})).includes(p.logo), p.id)
})

test("every product's icon is drawn the same size", () => {
  assert.equal(ICON_PX, 40)
  for (const p of [exitwise, speedometer]) {
    const [tile] = gameRow(el, p, () => {}).children
    assert.equal(Number(tile.attrs.width), ICON_PX, p.id)
    assert.equal(Number(tile.attrs.height), ICON_PX, p.id)
  }
})

test('Speedometer has its name now, the short one its settings use', () => {
  assert.equal(shortName(speedometer), 'Speedometer')
  assert.equal(shortName(exitwise), 'Exitwise')
  assert.equal(text(gameRow(el, speedometer, () => {}).children[1]), 'Speedometer')
})

test('a product with no icon yet gets a plain tile in its colour, the same size, and its name', () => {
  // Palermo Noir's icon waits for George's pick; its catalog colour is sky.
  const [tile, name] = gameRow(el, { id: 'palermo', name: 'Palermo Noir', kind: 'game', color: 'sky' }, () => {}).children
  assert.equal(tile.tag, 'span')
  assert.equal(tile.attrs.class, 'vm-game-icon vm-tile-sky')
  assert.equal(tile.attrs['aria-hidden'], 'true')
  assert.equal(tile.children.length, 0)
  assert.equal(text(name), 'Palermo Noir')
})

test("the tile's colour is one of the catalog's four, VHub's violet otherwise", () => {
  const tile = (color) => gameRow(el, { id: 'x', name: 'X', kind: 'app', color }, () => {}).children[0].attrs.class
  for (const c of ['sun', 'coral', 'sky', 'violet']) assert.equal(tile(c), `vm-game-icon vm-tile-${c}`)
  assert.equal(tile(undefined), 'vm-game-icon vm-tile-violet')
  assert.equal(tile('red x'), 'vm-game-icon vm-tile-violet')
})

test('account.css fills each colour tile', () => {
  for (const [c, hex] of [['sun', '#F4C430'], ['coral', '#EC7472'], ['sky', '#74A2FF'], ['violet', '#4B4CD6']]) {
    assert.match(rule(`.vm-game-icon.vm-tile-${c}`), new RegExp(`background:\\s*var\\(--${c},\\s*${hex}\\)`), c)
  }
})

test('a tap chooses the product', () => {
  let chosen = 0
  gameRow(el, exitwise, () => chosen++).attrs.click()
  assert.equal(chosen, 1)
})

test('account.css clips the icon to a rounded square of that size, and keeps the name on one line', () => {
  const icon = rule('.vm-game-icon')
  assert.match(icon, new RegExp(`(^|[\\s;])width:\\s*${ICON_PX}px`))
  assert.match(icon, new RegExp(`(^|[\\s;])height:\\s*${ICON_PX}px`))
  assert.match(icon, /border-radius:\s*\d/)
  assert.match(icon, /object-fit:\s*cover/)
  assert.match(icon, /flex:\s*none/)
  const name = rule('.vm-game-name')
  assert.match(name, /white-space:\s*nowrap/)
  assert.match(name, /text-overflow:\s*ellipsis/)
  // A touch row: at least 44px high.
  const height = Number(rule('.vm-game').match(/min-height:\s*(\d+)px/)?.[1])
  assert.ok(height >= 44, `.vm-game min-height ${height}`)
})

test('account.js draws both lists with these rows, never a logo', () => {
  const js = readFileSync(new URL('../../assets/account.js', import.meta.url), 'utf8')
  assert.match(js, /import \{[^}]*\bgameRow\b[^}]*\} from "\/assets\/vhub-games\.js"/)
  assert.match(js, /gameRow\(el, /)
  assert.doesNotMatch(js, /product\.logo/)
})
