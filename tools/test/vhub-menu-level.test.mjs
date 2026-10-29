// The VHub avatar menu's level line (assets/account.js): "Level 37 · 740 XP to level 38", the next level's number,
// never the XP it starts at (29 Oct 2026: George's menu read "Level 37 · 740 XP to level 17020"). VHub's site bridge
// answers site.level(xp) with its SDK's levelProgress (VHub sdk/ts/src/curve.ts): { level, into, needed, next }, next
// being the total XP the next level starts at. Read as text, like the other tests here: no DOM.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const account = readFileSync(new URL('../../assets/account.js', import.meta.url), 'utf8')

// What the bridge gives for 16,280 XP: level 37 starts at 16,200 XP and level 38 at 17,020.
const progress = { level: 37, into: 80, needed: 820, next: 17020 }

test('the menu names the next level, not the XP it starts at, in English and Greek', () => {
  const call = account.match(/t\.toNext\(([^()]*)\)/)
  assert.ok(call, 'the level line')
  const [xp, level] = new Function('next', `return [${call[1]}]`)(progress)
  assert.deepEqual([xp, level], [740, 38])
  const toNext = [...account.matchAll(/toNext: (\(xp, n\) => `[^`]*`),/g)].map((m) => new Function(`return ${m[1]}`)())
  assert.equal(toNext.length, 2, 'English and Greek')
  assert.equal(toNext[0](xp, level), '740 XP to level 38')
  assert.equal(toNext[1](xp, level), '740 XP για το επίπεδο 38')
})
