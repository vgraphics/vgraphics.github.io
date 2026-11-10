// Which layout a game-settings choice gets in the avatar menu (assets/choice-layout.js, used by assets/account.js):
// short choices stay the segmented control, a choice too wide for the menu becomes stacked option cards.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ROW_GAP_PX, ROW_PX, isLongChoice, nameWidth, segmentedWidth } from '../../assets/choice-layout.js'

// The real catalog's choices today (VHub catalog/palermo.json and speedometer.json), labels and names copied in.
const catalog = [
  ['Palermo Noir', 'Language', ['English', 'Greek'], false],
  ['Palermo Noir', 'Motion', ['As the device', 'Calmer'], false],
  ['Palermo Noir', 'Home look', ['The Promenade', 'The Fountain', 'The Rain', 'The Lamplighter'], true],
  ['Speedometer', 'Speed', ['km/h', 'mph'], false],
  ['Speedometer', 'Clock', ["Phone's", '12 h', '24 h'], false],
]
for (const [product, name, labels, cards] of catalog) {
  test(`${product} "${name}" is ${cards ? 'cards' : 'segmented'}`, () => {
    assert.equal(isLongChoice(labels, name), cards)
  })
}

test('the name counts: a long name pushes the same labels to cards, no options is never long', () => {
  assert.equal(isLongChoice(['As the device', 'Calmer'], 'Motion'), false)
  assert.equal(isLongChoice(['As the device', 'Calmer'], 'Reduce animation and movement'), true)
  assert.ok(nameWidth('Motion') + ROW_GAP_PX + segmentedWidth(['As the device', 'Calmer']) <= ROW_PX)
  assert.equal(isLongChoice([], 'Anything'), false)
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
