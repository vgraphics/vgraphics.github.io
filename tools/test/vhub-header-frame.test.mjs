// The signed-in player's VHub rank frame around their picture in the header's VHub avatar (assets/account.js; George,
// 29 Oct 2026: "Yes, show it"): the profile read brings the frame, the avatar is drawn in it at a reach that keeps it
// inside every header bar and clear of the buttons beside it, and the frame takes the ring's place with no disc behind
// it. Read as text, like the other tests here: no DOM.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const account = read('assets/account.js')
/** A number from `source`, or a failure naming `what`. */
const number = (source, re, what) => {
  const m = source.match(re)
  assert.ok(m, what)
  return Number(m[1])
}

test("the profile read brings the frame VHub's profile holds", () => {
  const session = read('assets/vhub-session.js')
  assert.match(session, /\["name", "avatar", "photo", "level", "frame", "products"\]/)
  assert.match(session, /frame: \(f\.frame && f\.frame\.stringValue\) \|\| null/)
})

test('the header draws the player in their frame, at the header reach, and takes it off when they sign out', () => {
  assert.match(account, /level: profile\.level, frame: profile\.frame/)
  assert.match(account, /pictures\.draw\(face, player, 96, HEADER_REACH\)/)
  assert.match(account, /VHubAvatars\?\.plain\(face\);\s*face\.innerHTML = MARK;/)
})

test('the framed avatar stays inside every header bar and clear of the buttons beside it', () => {
  const reach = number(account, /const HEADER_REACH = ([\d.]+);/, 'HEADER_REACH')
  const product = read('assets/product.css')
  const company = read('assets/vgraphics.css')
  const avatar = number(product, /\.vhub-avatar \{[^}]*?height: (\d+)px/, "the product header's avatar")
  assert.equal(number(company, /\.vhub-avatar \{[^}]*?height: (\d+)px/, "the company header's avatar"), avatar)
  // The product bar: the avatar's row with its padding above and below; the company and hub bar: its least height.
  const productBar = avatar + 2 * number(product, /\.top \{[^}]*?padding: calc\((\d+)px/, "the product bar's padding")
  const companyBar = number(company, /\.site-head \.wrap \{[^}]*?min-height: (\d+)px/, "the company bar's height")
  assert.ok(reach * avatar <= Math.min(productBar, companyBar), `${reach * avatar}px tall in a ${Math.min(productBar, companyBar)}px bar`)
  // Past each side, inside the folded bar's gap to the menu and play buttons (the widest frames reach this far).
  const gap = number(product, /\.top\.folded \{ column-gap: (\d+)px/, "the folded bar's gap")
  assert.ok(((reach - 1) / 2) * avatar <= gap, `${((reach - 1) / 2) * avatar}px past each side, the gap ${gap}px`)
})

test('the frame takes the ring’s place, with no disc behind it', () => {
  const css = read('assets/account.css')
  const rule = css.match(/\.vhub-avatar\.signed-in:has\(\.vhub-avatar-face\[data-framed\]\) \{([^}]*)\}/)
  assert.ok(rule, 'the framed avatar rule')
  assert.match(rule[1], /background: transparent/)
  assert.match(rule[1], /box-shadow: none/)
})
