// Which layout a game-settings choice gets in the avatar menu (assets/choice-layout.js, used by assets/account.js):
// short choices stay the segmented control, a choice too wide for the menu becomes stacked option cards.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SEG_LIMIT_PX, isLongChoice, segmentedWidth } from '../../assets/choice-layout.js'

test('short choices stay segmented', () => {
  assert.equal(isLongChoice(['Off', 'On']), false)
  assert.equal(isLongChoice(['Low', 'Medium', 'High']), false)
  assert.equal(isLongChoice(['Auto', 'Light', 'Dark']), false)
})

test("Palermo Noir's home look (4 long labels, about 450px) becomes cards", () => {
  const labels = ['Classic noir', 'Storybook night', 'Gilded parlour', 'Rain-soaked street']
  assert.ok(segmentedWidth(labels) > 400)
  assert.equal(isLongChoice(labels), true)
})

test('the limit sits between a 3-word choice and a 4-label one; no options is never long', () => {
  assert.ok(segmentedWidth(['Low', 'Medium', 'High']) < SEG_LIMIT_PX)
  assert.equal(isLongChoice([]), false)
})

test('account.js keeps the radio group and the stacked layout for long choices', () => {
  const js = readFileSync(new URL('../../assets/account.js', import.meta.url), 'utf8')
  assert.match(js, /isLongChoice\(/)
  assert.match(js, /role: "radiogroup"/)
  assert.match(js, /role: "radio"/)
  const css = readFileSync(new URL('../../assets/account.css', import.meta.url), 'utf8')
  assert.match(css, /\.vm-cards button\[aria-checked="true"\]/)
  assert.match(css, /min-height: 44px/)
})
