// The shared squishy loading bar (assets/startup/loading-bar.js; D:\Projects\Mine\CLAUDE.md, "Start-up"), run against a
// pretend page and clock, as the Games repo's docs/brand/splash/loading-bar.test.mjs ran Exitwise's own copy (George,
// 22 Oct 2026: "the loading starts at 99% ... add a good animation"): the bar waits empty under the intro, fills across
// the welcome art's 2 s, is full just as the game may come in and never sooner, never shows more than the download,
// counts up without jumps, and keeps still under reduced motion. Then what it draws: the product's mark at its head
// (never another product's), its colour, and a rule in loading-bar.css for every part.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const SCRIPT = readFileSync(new URL('../../assets/startup/loading-bar.js', import.meta.url), 'utf8')
const CSS = readFileSync(new URL('../../assets/startup/loading-bar.css', import.meta.url), 'utf8')

function element() {
  const classes = new Set()
  return {
    style: { setProperty(name, value) { this[name] = value } },
    attributes: {},
    children: [],
    animations: [],
    classes,
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c) },
    setAttribute(name, value) { this.attributes[name] = String(value) },
    appendChild(child) { this.children.push(child); return child },
    animate(frames, timing) {
      const run = { frames, timing: typeof timing === 'number' ? { duration: timing } : timing, cancelled: false, cancel() { this.cancelled = true } }
      this.animations.push(run)
      return run
    },
  }
}

// One bar with its clock: at(ms, fn) schedules what the page does, run(until) plays the clock to then.
function bar({ reducedMotion = false, options = {} } = {}) {
  let clock = 0
  let nextId = 1
  const timers = []
  const later = (fn, ms) => {
    timers.push({ id: nextId++, at: clock + Math.max(0, ms || 0), fn })
    return nextId - 1
  }
  const parts = {}
  for (const name of ['fill', 'head', 'tip', 'jelly', 'hop', 'shadow']) parts[name] = element()
  parts.face = element()
  parts.tip.querySelector = () => parts.face
  const root = element()
  root.querySelector = (selector) => parts[selector.replace('.bar-', '')]
  const page = {
    document: { createElement: () => element() },
    setTimeout: later,
    requestAnimationFrame: (fn) => later(() => fn(clock), 16),
    performance: { now: () => clock },
    matchMedia: (query) => ({ matches: reducedMotion && query.includes('reduce') }),
    CSS: { supports: () => true },
  }
  page.window = page
  vm.createContext(page)
  vm.runInContext(SCRIPT, page)
  const steps = []
  let full = null
  const api = page.VGLoadingBar(root, { onStep: (shown) => steps.push({ at: clock, shown }), onFull: () => { full = clock }, ...options })
  return {
    api, parts, steps, root,
    full: () => full,
    now: () => clock,
    at: (ms, fn) => timers.push({ id: nextId++, at: ms, fn }),
    run(until) {
      for (;;) {
        timers.sort((a, b) => a.at - b.at || a.id - b.id)
        const next = timers[0]
        if (!next || next.at > until) break
        timers.shift()
        clock = Math.max(clock, next.at)
        next.fn()
      }
      clock = until
    },
  }
}

// The share the planned transition puts the bar at: from translateX(calc(1 - shown) ...).
const shownBy = (el) => (el.style.transform ? 1 - parseFloat(/calc\(([\d.]+) \*/.exec(el.style.transform)[1]) : 0)
const duration = (el) => (el.style.transition ? parseInt(/transform (\d+)ms/.exec(el.style.transition)[1], 10) : 0)

test('a cached visit: empty under the intro, then one glide across the welcome art\'s 2 s, full as the game may come in', () => {
  // Downloaded at 150 ms under the intro; the intro gone at 3.3 s; the art's 2 s to 5.3 s.
  const page = bar()
  page.api.pace(Infinity, Infinity)
  page.at(150, () => page.api.show(1))
  page.run(3300)
  assert.equal(page.steps.length, 0, 'no count under the intro')
  assert.equal(shownBy(page.parts.fill), 0, 'empty under the intro')
  page.api.pace(3300, 5300)
  assert.equal(shownBy(page.parts.fill), 1, page.parts.fill.style.transition)
  assert.equal(duration(page.parts.fill), 2000, page.parts.fill.style.transition)
  let settledAt = null
  page.at(5300, () => page.api.whenSettled(() => { settledAt = page.now() }))
  page.run(9000)
  const first = page.steps[0]
  const last = page.steps.at(-1)
  assert.ok(first.shown < 0.01 && first.at <= 3320, `it counts from 0 %: ${JSON.stringify(first)}`)
  assert.deepEqual(page.steps.filter((s) => s.shown >= 1 && s.at < 5300), [], 'never full before the 2 s')
  assert.ok(last.shown === 1 && last.at >= 5300 && last.at <= 5320, `full at 2 s: ${JSON.stringify(last)}`)
  const mid = page.steps.find((s) => s.at >= 4290 && s.at <= 4310)
  assert.ok(mid && Math.abs(mid.shown - 0.5) < 0.03, `about half way at 1 s: ${JSON.stringify(mid)}`)
  assert.deepEqual(page.steps.filter((s, i) => i && s.shown < page.steps[i - 1].shown), [], 'never goes back')
  assert.deepEqual(page.steps.filter((s, i) => i && s.shown - page.steps[i - 1].shown > 0.025), [], 'counts up without jumps')
  assert.equal(Math.round(page.full()), 6070, 'the hop ends 770 ms after full, then onFull')
  assert.equal(Math.round(settledAt), 6070, 'and then the game comes in')
  assert.ok(page.root.classes.has('starting'), 'full and settled, it nudges and shines while the game starts')
  const tips = page.parts.tip.animations.filter((a) => !a.cancelled).map((a) => Math.round(a.timing.delay))
  assert.ok(tips.length === 4 && tips[3] === 2000 && tips[0] > 0 && tips[2] < 2000, `a gulp at each quarter and the pop at full: ${JSON.stringify(tips)}`)
  assert.equal(page.root.children.reduce((n, s) => n + s.animations.filter((a) => !a.cancelled).length, 0), 12, 'six sparkles at full, two at each quarter')
  assert.deepEqual(page.parts.hop.animations.map((a) => Math.round(a.timing.delay)), [2150], 'the hop starts a beat after full')
})

test('a slow download: never ahead of it, never back, full once it has all come', () => {
  // 20 % when the intro has gone, all of it by 10 s.
  const page = bar()
  page.api.pace(Infinity, Infinity)
  const download = (t) => Math.min(1, 0.2 + 0.8 * Math.max(0, t - 3300) / 6700)
  for (let t = 0; t <= 10000; t += 100) page.at(t, () => page.api.show(download(t)))
  page.at(3300, () => page.api.pace(3300, 5300))
  page.run(12000)
  assert.deepEqual(page.steps.filter((s) => s.shown > download(s.at) + 1e-6), [], 'never ahead of the download')
  const last = page.steps.at(-1)
  assert.ok(last.shown === 1 && last.at >= 10000 && last.at < 10600, JSON.stringify(last))
  assert.deepEqual(page.steps.filter((s, i) => i && s.shown < page.steps[i - 1].shown), [], 'never goes back')
})

test('no pace (no welcome art): the download itself, gliding', () => {
  const page = bar()
  page.at(100, () => page.api.show(0.5))
  page.run(1000)
  const last = page.steps.at(-1)
  assert.ok(last.shown === 0.5 && last.at <= 600, JSON.stringify(last))
})

test('reduced motion: it fills, and nothing squashes, wobbles, stretches, sparkles or hops', () => {
  const page = bar({ reducedMotion: true })
  page.api.show(1)
  page.run(2000)
  assert.equal(page.steps.at(-1).shown, 1)
  assert.ok(!Object.values(page.parts).some((p) => p.animations.length) && !page.root.children.some((s) => s.animations.length), 'animations ran')
})

test('stopped (the game couldn\'t start), it stays where it is and stops nudging', () => {
  const page = bar()
  page.api.show(1)
  page.run(3000)
  assert.ok(page.root.classes.has('starting'))
  page.api.stop()
  assert.ok(!page.root.classes.has('starting'))
  assert.equal(page.parts.fill.style.transition, 'none')
})

test('it draws its parts, the product\'s mark at its head and its colour, and says what it is', () => {
  const arrow = bar({ options: { tip: 'arrow', colour: '#B3122E', label: 'Loading Exitwise' } }).root
  for (const part of ['bar-shadow', 'bar-hop', 'bar-jelly', 'bar-track', 'bar-groove', 'bar-fill', 'bar-head', 'bar-tip tip-arrow']) {
    assert.ok(arrow.innerHTML.includes(`class="${part}"`), part)
  }
  assert.ok(arrow.classes.has('vg-bar'))
  assert.equal(arrow.style['--vg-bar-fill'], '#B3122E')
  assert.deepEqual(arrow.attributes, { role: 'progressbar', 'aria-label': 'Loading Exitwise', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' })
  // Any other product gets the round knob, never Exitwise's arrow or Speedometer's dial.
  for (const tip of [undefined, 'dial', 'toString']) {
    const html = bar({ options: { tip } }).root.innerHTML
    assert.ok(html.includes('class="bar-tip tip-round"') && !html.includes('polygon'), String(tip))
  }
  assert.equal(bar().root.style['--vg-bar-fill'], undefined, 'without a colour, the stylesheet\'s')
})

test('loading-bar.css draws every part the script makes, in the --vg-bar-* colours, and keeps still under reduced motion', () => {
  const made = new Set([...SCRIPT.matchAll(/class="(bar-[a-z]+)/g), ...SCRIPT.matchAll(/'(bar-spark)'/g)].map((m) => m[1]))
  assert.ok(made.size >= 9, [...made].join(', '))
  for (const part of made) assert.ok(CSS.includes(`.vg-bar .${part}`), part)
  for (const v of ['--vg-bar-fill', '--vg-bar-track', '--vg-bar-groove', '--vg-bar-spark', '--vg-bar-ink', '--vg-bar-height', '--vg-bar-width']) assert.ok(CSS.includes(`var(${v}`), v)
  assert.match(CSS, /@media \(prefers-reduced-motion: reduce\) \{\s*\.vg-bar\.starting \.bar-tip, \.vg-bar\.starting \.bar-groove::after \{ animation: none; \}/)
})
