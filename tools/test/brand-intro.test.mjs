// The shared VGraphics intro (assets/startup/brand-intro.js; D:\Projects\Mine\CLAUDE.md, "Start-up"), run against a
// pretend page and clock, as the Games repo's docs/brand/splash/brand-intro.test.mjs ran Exitwise's copy and the palermo
// repo's unity/tools/web/brand-intro.test.mjs its stand-in. The welcome art's 2 s (George, 22 Oct 2026: "Loading screen
// must show for at least 2 seconds. Add a timer to check."): when the product may come in (VGIntro.gameReady), what
// VGIntro.welcomeMs() reports for splash_shown, and the bar's window (VGIntro.welcomeWindow). Then the two shapes it
// joins: the party games' data-under, data-film, playing() and vgintro:done, and no-intro and no-film on html.
// Run: node --test tools/test/*.test.mjs
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'

const SCRIPT = readFileSync(new URL('../../assets/startup/brand-intro.js', import.meta.url), 'utf8')

// ---------- A pretend page ----------

function element(tag) {
  const listeners = {}
  const classes = new Set()
  const el = {
    children: [], parent: null, attributes: {}, style: {}, observers: [], plays: 0,
    get lastChild() { return this.children[this.children.length - 1] || null },
    setAttribute(name, value) { this.attributes[name] = String(value) },
    appendChild(child) { child.parent = this; this.children.push(child); return child },
    remove() {
      if (!this.parent) return
      this.parent.children = this.parent.children.filter((c) => c !== this)
      this.parent = null
    },
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn) },
    removeEventListener(type, fn) { listeners[type] = (listeners[type] || []).filter((f) => f !== fn) },
    dispatch(type) { (listeners[type] || []).slice().forEach((fn) => fn({ type })) },
    classList: {
      add(name) { if (!classes.has(name)) { classes.add(name); el.observers.slice().forEach((o) => o.notify()) } },
      remove(name) { if (classes.delete(name)) el.observers.slice().forEach((o) => o.notify()) },
      contains(name) { return classes.has(name) },
    },
  }
  if (tag === 'video') Object.assign(el, { play() { el.plays++; return Promise.resolve() }, pause() {}, currentTime: 0, duration: 2.8 })
  return el
}

// One page load: the covered element (id `under`), the script's tag (`attrs`), html's classes, the clock, and the script
// run once. `at(ms, fn)` schedules what the page or the player does; `events` is every event sent to the document, with
// its time, and `doc` takes the document's own events (a key). `eventConstructor: false` is an engine without `new Event`.
function load({ reducedMotion = false, html = [], attrs = {}, under = 'loader', eventConstructor = true } = {}) {
  let clock = 0
  let nextId = 1
  const timers = []
  const events = []
  const setTimeout = (fn, ms) => {
    timers.push({ id: nextId++, at: clock + Math.max(0, ms || 0), fn })
    return nextId - 1
  }
  const loader = element('div')
  const root = element('html')
  html.forEach((name) => root.classList.add(name))
  const docListeners = element('document')
  const document = {
    head: element('head'),
    documentElement: root,
    currentScript: { getAttribute: (name) => (name in attrs ? attrs[name] : null) },
    getElementById: (id) => (id === under ? loader : null),
    createElement: (tag) => element(tag),
    createEvent: () => ({ initEvent(type) { this.type = type } }),
    addEventListener: (type, fn) => docListeners.addEventListener(type, fn),
    removeEventListener: (type, fn) => docListeners.removeEventListener(type, fn),
    dispatchEvent: (event) => { events.push([clock, event.type]); docListeners.dispatch(event.type) },
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; this.target = null }
    observe(target) { this.target = target; target.observers.push(this) }
    disconnect() {
      if (this.target) this.target.observers = this.target.observers.filter((o) => o !== this)
      this.target = null
    }
    notify() { this.callback([], this) }
  }
  const page = {
    document, setTimeout, MutationObserver,
    performance: { now: () => clock },
    matchMedia: (query) => ({ matches: reducedMotion && query.includes('reduce') }),
  }
  if (eventConstructor) page.Event = class Event { constructor(type) { this.type = type } }
  page.window = page
  vm.createContext(page)
  vm.runInContext(SCRIPT, page)
  // The script adds its layer, holding the video, to the covered element.
  const layer = loader.lastChild
  const video = layer && layer.children[0]
  return {
    loader, layer, video, intro: page.VGIntro, events, doc: docListeners,
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
    now: () => clock,
  }
}

// Plays one visit: the film's first frame at 100 ms, the art decoded at artAt (or never), the film's end at 2.8 s unless
// a tap comes first, and the product ready at readyAt. Returns when the page let the product in, welcomeMs() then, and
// each window the page's loading bar was given ([when, from, until]).
function visit({ artAt = 300, readyAt, tapAt = null, reducedMotion = false, filmEnds = true, html = [], also = () => {} }) {
  const page = load({ reducedMotion, html })
  let gameAt = null
  let shownMs = null
  const windows = []
  page.intro.welcomeWindow((from, until) => windows.push([page.now(), from, until]))
  page.at(100, () => page.video.dispatch('playing'))
  if (artAt != null) page.at(artAt, () => page.loader.classList.add('with-art'))
  if (filmEnds) page.at(2800, () => page.video.dispatch('ended'))
  if (tapAt != null) page.at(tapAt, () => page.layer.dispatch('pointerdown'))
  page.at(readyAt, () => page.intro.gameReady(() => {
    gameAt = page.now()
    shownMs = page.intro.welcomeMs()
  }))
  also(page)
  page.run(30000)
  return { gameAt, shownMs, windows, page }
}

// ---------- The 2 s ----------

test('the minimum is 2 s', () => assert.match(SCRIPT, /var WELCOME_MS = 2000;/))

test("first visit: the product comes in as soon as it is ready; the art was on screen from the film's fade (3.3 s)", () => {
  const { gameAt, shownMs } = visit({ readyAt: 12000 })
  assert.equal(gameAt, 12000)
  assert.equal(shownMs, 8700)
})

test("cached visit: the intro gives way at once (300 ms), and the product waits for the art's 2 s", () => {
  const { gameAt, shownMs } = visit({ readyAt: 1500 })
  assert.equal(gameAt, 3800)
  assert.equal(shownMs, 2000)
})

test("late art: the product waits for 2 s from the art's arrival", () => {
  const { gameAt, shownMs } = visit({ artAt: 5000, readyAt: 5500 })
  assert.equal(gameAt, 7000)
  assert.equal(shownMs, 2000)
})

test('no art: the product comes in at once, and welcomeMs says -1, so no splash_shown', () => {
  const { gameAt, shownMs } = visit({ artAt: null, readyAt: 1500 })
  assert.equal(gameAt, 1500)
  assert.equal(shownMs, -1)
})

test('a tap skips the film, and the art still has its 2 s', () => {
  const { gameAt, shownMs } = visit({ readyAt: 1200, tapAt: 600 })
  assert.equal(gameAt, 3100)
  assert.equal(shownMs, 2000)
})

test('reduced motion: the still lockup for 1 s, then the art has its 2 s', () => {
  const { gameAt, shownMs, page } = visit({ readyAt: 1200, reducedMotion: true, filmEnds: false })
  assert.equal(page.video.plays, 0)
  assert.equal(gameAt, 3500)
  assert.equal(shownMs, 2000)
})

test("the bar's window opens once the intro has gone and ends as the product comes in", () => {
  const cached = visit({ readyAt: 1500 })
  assert.deepEqual(cached.windows, [[1800, 1800, 3800]])
  const late = visit({ artAt: 5000, readyAt: 5500 })
  assert.deepEqual(late.windows, [[3300, 3300, 3300], [5000, 5000, 7000]])
  assert.deepEqual(visit({ artAt: null, readyAt: 1500 }).windows, [[1800, 1800, 1800]])
})

test('whenever the product is ready, the art is on screen at least 2 s, and never held longer', () => {
  for (let readyAt = 400; readyAt <= 9000; readyAt += 50) {
    const { gameAt, shownMs } = visit({ readyAt })
    assert.ok(shownMs >= 2000, `${readyAt}: ${shownMs} ms`)
    assert.ok(!(gameAt > readyAt && shownMs > 2000), `${readyAt}: in at ${gameAt}, ${shownMs} ms`)
  }
})

// ---------- The films ----------

test("the films are the site's own, by absolute address, the 720 WebM first", () => {
  const { video } = load()
  assert.deepEqual(video.children.map((s) => s.src), ['/assets/startup/vgraphics-intro-720.webm', '/assets/startup/vgraphics-intro-720.mp4'])
})

test('a TV (data-film="1080"): the 1080 MP4 alone, since that film has no WebM', () => {
  const { video } = load({ attrs: { 'data-film': '1080' } })
  assert.deepEqual(video.children.map((s) => s.src), ['/assets/startup/vgraphics-intro-1080.mp4'])
})

test('every film it can ask for is on the site, beside it', () => {
  for (const attrs of [{}, { 'data-film': '1080' }]) {
    for (const { src } of load({ attrs }).video.children) assert.ok(existsSync(new URL(`../..${src}`, import.meta.url)), src)
  }
})

// ---------- The party games' shape ----------

test('data-under: it covers the element named, "loader" by default', () => {
  assert.equal(load({ attrs: { 'data-under': 'intro-box' }, under: 'intro-box' }).layer.attributes['aria-hidden'], 'true')
  assert.ok(load().layer)
  const nothing = load({ attrs: { 'data-under': 'intro-box' } })
  assert.equal(nothing.layer, null)
  assert.equal(nothing.intro, undefined)
})

test('playing() holds until the intro starts to fade, and vgintro:done comes that moment, once', () => {
  const seen = []
  const { page } = visit({
    readyAt: 12000, tapAt: 600,
    also: (p) => { [599, 601].forEach((ms) => p.at(ms, () => seen.push([ms, p.intro.playing(), p.events.length]))) },
  })
  assert.deepEqual(seen, [[599, true, 0], [601, false, 1]])
  assert.deepEqual(page.events, [[600, 'vgintro:done']])
})

test('vgintro:done on an engine without the Event constructor', () => {
  const page = load({ eventConstructor: false })
  page.at(100, () => page.layer.dispatch('pointerdown'))
  page.run(1000)
  assert.deepEqual(page.events, [[100, 'vgintro:done']])
})

test('a key skips it (a TV remote too)', () => {
  const page = load()
  page.at(100, () => page.video.dispatch('playing'))
  page.at(600, () => page.doc.dispatch('keydown'))
  page.run(650)
  assert.equal(page.intro.playing(), false)
  assert.deepEqual(page.events, [[600, 'vgintro:done']])
})

// ---------- html's classes ----------

test('a join link (no-intro): no intro and no key art, so the page lets the product in at once', () => {
  const page = load({ html: ['no-intro'] })
  assert.equal(page.layer, null)
  assert.equal(page.intro, undefined)
})

test('a TV vgraphics.gr/tv sent (no-film): the film never plays, and the key art keeps its 2 s', () => {
  const { gameAt, shownMs, page } = visit({ readyAt: 1000, html: ['no-film'], filmEnds: false })
  assert.equal(page.video.plays, 0)
  assert.equal(page.video.preload, 'none')
  // It gives way at once (0.5 s fade), the art came at 0.3 s: on screen from 0.5 s, in at 2.5 s.
  assert.equal(gameAt, 2500)
  assert.equal(shownMs, 2000)
  assert.deepEqual(page.events, [[0, 'vgintro:done']])
})

// ---------- Any TV ----------

test('ES5 alone, so it parses on any TV: no arrows, let, const, class, template strings, ?. or ??', () => {
  const code = SCRIPT.replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /=>|`|\b(?:let|const|class)\s|\?\.|\?\?/)
})
