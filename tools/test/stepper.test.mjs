// The chapter stepper's bookkeeping (assets/stepper.js): one stepper for the page's chapters, kept while they stay the
// same, drawn anew when a page that draws its content after loading (VHub's hub) changes them, and taken away below two
// chapters. Stepper and chapters are plain objects here, so it runs without a DOM.
// Run: node --test tools/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { keeper, sameChapters } from '../../assets/stepper.js'

/** A chapter: its id and name, on an element (any object stands for one). */
const chapter = (id, name = id, target = { id }) => ({ id, name, target })

/** A keeper over a page whose chapters are `page.now`, recording each stepper it draws and takes away. */
function page(now) {
  const state = { now, drawn: [], stopped: [] }
  state.sync = keeper(
    () => state.now,
    (chapters) => {
      const stepper = { chapters }
      state.drawn.push(stepper)
      return () => state.stopped.push(stepper)
    },
  )
  return state
}

test('the same chapters are the same ids and names on the same elements, in the same order', () => {
  const a = chapter('rules')
  const b = chapter('roles')
  assert.equal(sameChapters([a, b], [a, b]), true)
  assert.equal(sameChapters([], []), true)
  assert.equal(sameChapters([a, b], [b, a]), false)
  assert.equal(sameChapters([a, b], [a]), false)
  assert.equal(sameChapters([a], [chapter('rules', 'Rules', a.target)]), false)
  // The hub draws a page again with new elements under the same ids: the stepper must watch the new ones.
  assert.equal(sameChapters([a], [chapter('rules')]), false)
})

test('a page with two chapters or more gets one stepper, kept while its chapters stay', () => {
  const p = page([chapter('a'), chapter('b')])
  p.sync()
  assert.equal(p.drawn.length, 1)
  p.sync()
  p.sync()
  assert.equal(p.drawn.length, 1)
  assert.equal(p.stopped.length, 0)
})

test('one chapter or none: no stepper', () => {
  const p = page([])
  p.sync()
  p.now = [chapter('a')]
  p.sync()
  assert.equal(p.drawn.length, 0)
  assert.equal(p.stopped.length, 0)
})

test('chapters that come after loading (the hub, once VHub has started) get their stepper then', () => {
  const p = page([])
  p.sync()
  p.now = [chapter('friends'), chapter('requests'), chapter('blocked')]
  p.sync()
  assert.equal(p.drawn.length, 1)
  assert.deepEqual(p.drawn[0].chapters.map((c) => c.id), ['friends', 'requests', 'blocked'])
})

test("new chapters (another of the hub's pages) replace the stepper: the old one goes first", () => {
  const p = page([chapter('friends'), chapter('requests')])
  p.sync()
  p.now = [chapter('privacy'), chapter('notifications'), chapter('account'), chapter('data')]
  p.sync()
  assert.equal(p.drawn.length, 2)
  assert.deepEqual(p.stopped, [p.drawn[0]])
  assert.equal(p.drawn[1].chapters.length, 4)
})

test('fewer than two left: the stepper goes, and comes back with the chapters', () => {
  const two = [chapter('a'), chapter('b')]
  const p = page(two)
  p.sync()
  p.now = [two[0]]
  p.sync()
  assert.deepEqual(p.stopped, [p.drawn[0]])
  p.sync()
  assert.equal(p.stopped.length, 1)
  p.now = two
  p.sync()
  assert.equal(p.drawn.length, 2)
})
