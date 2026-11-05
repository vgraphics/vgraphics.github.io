// The soundtrack player's switching between tracks (assets/soundtrack.js, with the real assets/audio-fade.js), run
// against a pretend page, <audio> and clock (George, 5 Nov 2026: "Clicking a song at player while another plays,
// sometimes keeps the progress and sometimes it stays paused. Check it for all players."): a track picked while another
// plays begins at 0:00 (or at a place picked on its own waveform) once the other has faded out, and it plays whatever
// comes in between: a double-click, a second pick, a pick back, the old song stalling or ending. A single click on the
// playing track's row still pauses it, and a pause still keeps the picked track out until play.
// Run: node --test tools/test/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const PLAYER = readFileSync(new URL('../../assets/soundtrack.js', import.meta.url), 'utf8')
const FADES = readFileSync(new URL('../../assets/audio-fade.js', import.meta.url), 'utf8')
const IMPORT = 'import("/assets/audio-fade.js")' // the player's own load of the fades, given the real module here

const TRACKS = [
  { title: 'One', src: '/one.mp3', duration: 180 },
  { title: 'Two', src: '/two.mp3', duration: 200 },
  { title: 'Three', src: '/three.mp3', duration: 160 },
]
const SKIP = 350 // ms the playing song takes to fade out before a picked one begins (soundtrack.js)

const flush = () => new Promise((resolve) => setImmediate(resolve))

function element(props = {}) {
  const listeners = {}
  const classes = new Set()
  const el = {
    dataset: {},
    attributes: {},
    textContent: '',
    hidden: false,
    clientWidth: 0,
    clientHeight: 0,
    offsetTop: 0,
    offsetHeight: 0,
    scrollTop: 0,
    scrollHeight: 0,
    style: { setProperty() {}, removeProperty() {} },
    classList: {
      toggle: (c, on = !classes.has(c)) => (on ? classes.add(c) : classes.delete(c), on),
      contains: (c) => classes.has(c),
    },
    setAttribute(name, value) { el.attributes[name] = String(value) },
    getAttribute: (name) => el.attributes[name] ?? null,
    removeAttribute(name) { delete el.attributes[name] },
    addEventListener(type, fn) { (listeners[type] ??= []).push(fn) },
    emit(type, extra = {}) { for (const fn of listeners[type] ?? []) fn({ type, target: el, preventDefault() {}, ...extra }) },
    click() { el.emit('click', { detail: 1 }) },
    focus() {},
    scrollIntoView() {},
    scrollTo() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    querySelector: () => null,
    querySelectorAll: () => [],
    ...props,
  }
  return el
}

// One player on a page, as tools/lib/soundtrack.mjs writes it, with a chapter's song button for track 3. Its <audio>
// is heard `load` ms after play() for a new source (at once for one already loaded), plays on in steps of 5 ms with a
// timeupdate every 250 ms, and ends at its duration; wait(ms) moves the clock, the fades' timer and the playing along.
async function page({ load = 120 } = {}) {
  let now = 0
  let nextId = 1
  let heard = null // when the <audio> is next heard
  const timers = new Map()
  const length = (src) => TRACKS.find((t) => t.src === src).duration

  const audio = element({ paused: true, currentTime: 0, duration: NaN, readyState: 0, error: null, volume: 1, muted: false, playbackRate: 1, loads: [], plays: [] })
  Object.defineProperty(audio, 'src', {
    get: () => audio.attributes.src ?? '',
    // A new source: what played stops without an event (the media element's load) and the new one waits at 0:00
    set(src) {
      audio.loads.push({ src, at: now, volume: audio.volume })
      audio.attributes.src = src
      Object.assign(audio, { paused: true, currentTime: 0, duration: NaN, readyState: 0, error: null })
      heard = null
    },
  })
  audio.play = () => {
    if (audio.paused) {
      audio.plays.push({ src: audio.src, from: audio.currentTime, at: now })
      audio.paused = false
      heard = now + (audio.readyState ? 5 : load)
    }
    return Promise.resolve()
  }
  audio.pause = () => {
    if (audio.paused) return
    audio.paused = true
    heard = null
    audio.emit('pause')
  }

  const named = (names) => Object.fromEntries(names.map((n) => [n, element({ parentElement: element() })]))
  const main = named(['play', 'prev', 'next', 'loop', 'label', 'title', 'cur', 'dur', 'mute', 'volume'])
  const minis = named(['play', 'next', 'close', 'show', 'title', 'cur', 'dur', 'mute', 'volume'])
  const rows = TRACKS.map((t) => {
    const name = element({ textContent: t.title, firstElementChild: element() })
    return element({ dataset: { src: t.src, duration: String(t.duration) }, parentElement: element(), querySelector: (s) => (s === '.ost-t' ? name : null) })
  })
  const bars = [0, 1].map(() => {
    const wave = element()
    const range = element({ value: 0, max: TRACKS[0].duration })
    return { range, box: element({ querySelector: (s) => (s === '.ost-wave' ? wave : s === '.ost-range' ? range : null) }) }
  })
  const mini = element({ hidden: true, querySelector: (s) => minis[/^\[data-ost="(\w+)"\]$/.exec(s)?.[1]] ?? null })
  const parts = { audio, '.ost-deck': element(), '.ost-list': element(), '[data-ost="live"]': element(), '.ost-mini': mini }
  const root = element({
    dataset: { album: 'Album', artwork: '/cover.webp' },
    querySelector: (s) => parts[s] ?? main[/^\.ost-player \[data-ost="(\w+)"\]$/.exec(s)?.[1]] ?? null,
    querySelectorAll: (s) => (s === '.ost-seek' ? bars.map((b) => b.box) : s === '.ost-track' ? rows : []),
  })
  const songs = [element({ dataset: { ostSong: '2' } })]

  const ctx = {
    console,
    navigator: {},
    document: {
      body: { append() {} },
      activeElement: null,
      createElement: () => ({ volume: 1 }), // a browser that keeps a page's volume (not iOS)
      querySelectorAll: (s) => (s === '.ost' ? [root] : s === '[data-ost-song]' ? songs : []),
    },
    performance: { now: () => now },
    setInterval: (fn, ms) => {
      const id = nextId++
      timers.set(id, { fn, ms, next: now + ms })
      return id
    },
    clearInterval: (id) => timers.delete(id),
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    localStorage: { getItem: () => null, setItem() {} },
    getComputedStyle: () => ({ getPropertyValue: () => '', paddingLeft: '0', paddingRight: '0' }),
    IntersectionObserver: class { observe() {} },
    ResizeObserver: class { observe() {} },
  }
  ctx.window = ctx
  vm.createContext(ctx)
  const fades = vm.runInContext(`(() => {\n${FADES.replace(/^export /gm, '')}\nreturn { resume, duck, fader }\n})()`, ctx)
  ctx.loadFades = () => Promise.resolve(fades)
  vm.runInContext(PLAYER.replace(IMPORT, 'loadFades()'), ctx)
  await flush() // the fades have loaded

  async function wait(ms) {
    for (const end = now + ms; now < end; ) {
      now += 5
      if (heard !== null && now >= heard) {
        heard = null
        if (!audio.readyState) {
          Object.assign(audio, { readyState: 4, duration: length(audio.src) })
          audio.emit('loadedmetadata')
        }
        audio.emit('playing')
      }
      if (!audio.paused && audio.readyState) {
        audio.currentTime += 0.005
        if (audio.currentTime >= audio.duration) {
          // Its end, as the browser has it: paused, then "pause" and "ended"
          Object.assign(audio, { currentTime: audio.duration, paused: true })
          audio.emit('pause')
          audio.emit('ended')
        } else if (now % 250 === 0) audio.emit('timeupdate')
      }
      for (const [id, t] of [...timers]) {
        if (timers.has(id) && now >= t.next) {
          t.next += t.ms
          t.fn()
        }
      }
      await flush()
    }
  }

  const click = (el, detail = 1) => el.emit('click', { detail })
  return {
    audio, rows, songs, main, mini: minis, bar: bars[0].range, wait, click,
    get now() { return now },
    get state() { return root.dataset.state },
    get src() { return audio.getAttribute('src') },
    get loads() { return audio.loads.map((l) => l.src) },
    get last() { return audio.plays.at(-1) },
    // Track i heard and faded all the way in, then moved on to `seconds`
    async playFrom(i, seconds) {
      click(rows[i])
      await wait(load + 1000)
      assert.equal(root.dataset.state, 'playing')
      audio.currentTime = seconds
      audio.emit('timeupdate')
    },
  }
}

test('the player loads its fades the way this test gives them', () => {
  assert.ok(PLAYER.includes(IMPORT))
})

test('a track picked while another plays begins at 0:00 once the other has faded out', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  assert.equal(p.bar.value, 80)
  const picked = p.now
  p.click(p.rows[1])
  assert.equal(p.state, 'loading')
  assert.equal(p.bar.value, 0)
  await p.wait(1000)
  assert.deepEqual(p.loads, ['/one.mp3', '/two.mp3'])
  const cut = p.audio.loads.at(-1)
  assert.ok(cut.at - picked >= SKIP, 'the song before fades out over 0.35 s first')
  assert.equal(cut.volume, 0, 'and is silent when the picked one loads')
  assert.equal(p.last.src, '/two.mp3')
  assert.equal(p.last.from, 0, "not at the place the song before had got to")
  assert.equal(p.state, 'playing')
  assert.ok(p.bar.value < 1)
})

test('a double-click on another track\'s row plays it, from 0:00', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.rows[1], 1)
  await p.wait(150)
  p.click(p.rows[1], 2)
  await p.wait(1000)
  assert.equal(p.src, '/two.mp3')
  assert.equal(p.last.from, 0)
  assert.equal(p.audio.paused, false)
  assert.equal(p.state, 'playing')
})

test('a double-click on a row with nothing playing plays it, even when it is heard before the second click', async () => {
  const p = await page({ load: 50 })
  p.click(p.rows[1], 1)
  await p.wait(150)
  assert.equal(p.state, 'playing')
  p.click(p.rows[1], 2)
  await p.wait(1000)
  assert.equal(p.audio.paused, false)
  assert.equal(p.state, 'playing')
  assert.equal(p.audio.plays.length, 1)
})

test('a second click on the picked row while it is still on its way keeps it coming', async () => {
  const p = await page({ load: 600 })
  await p.playFrom(0, 80)
  p.click(p.rows[1])
  await p.wait(SKIP + 200) // the song before has gone, the picked one is loading
  assert.equal(p.state, 'loading')
  p.click(p.rows[1]) // a single click, well apart from the first
  await p.wait(1000)
  assert.equal(p.src, '/two.mp3')
  assert.equal(p.audio.paused, false)
  assert.equal(p.state, 'playing')
})

test('a chapter\'s song button plays its track, and a double-click on it doesn\'t pause it', async () => {
  const p = await page({ load: 50 })
  p.click(p.songs[0], 1)
  await p.wait(150)
  p.click(p.songs[0], 2)
  await p.wait(1000)
  assert.equal(p.src, '/three.mp3')
  assert.equal(p.state, 'playing')
  assert.equal(p.songs[0].attributes['aria-pressed'], 'true')
})

test('two tracks picked quickly: the last one plays from 0:00 and the one between never loads', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.rows[1])
  await p.wait(100)
  p.click(p.rows[2])
  await p.wait(1000)
  assert.deepEqual(p.loads, ['/one.mp3', '/three.mp3'])
  assert.equal(p.last.src, '/three.mp3')
  assert.equal(p.last.from, 0)
  assert.equal(p.state, 'playing')
})

test('Next twice quickly on the mini-bar: the second track after plays, from 0:00', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.mini.next)
  await p.wait(100)
  p.click(p.mini.next)
  await p.wait(1000)
  assert.equal(p.src, '/three.mp3')
  assert.equal(p.last.from, 0)
  assert.equal(p.state, 'playing')
})

test('the track that was fading out, picked back, starts again from 0:00', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.rows[1])
  await p.wait(100)
  p.click(p.rows[0])
  await p.wait(1000)
  assert.deepEqual(p.loads, ['/one.mp3'])
  assert.ok(p.audio.currentTime < 1, 'from its start, not from 1:20')
  assert.ok(p.bar.value < 1)
  assert.equal(p.audio.paused, false)
  assert.equal(p.state, 'playing')
})

test('the song fading out, back from a stall, doesn\'t take over from the picked one', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.rows[1])
  await p.wait(100)
  p.audio.emit('playing') // the old song plays again after waiting for data
  await p.wait(1000)
  assert.equal(p.src, '/two.mp3')
  assert.equal(p.last.from, 0)
  assert.equal(p.state, 'playing')
})

test('the song fading out, ending meanwhile, doesn\'t move on past the picked one', async () => {
  const p = await page()
  await p.playFrom(0, 179.9)
  p.click(p.rows[1])
  await p.wait(1000) // it ends 0.1 s in
  assert.deepEqual(p.loads, ['/one.mp3', '/two.mp3'])
  assert.equal(p.last.from, 0)
  assert.equal(p.state, 'playing')
})

test('a place picked on the picked track\'s waveform before it loads is where it begins', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.rows[1])
  await p.wait(100)
  p.bar.value = 30
  p.bar.emit('change')
  await p.wait(1000)
  assert.equal(p.last.src, '/two.mp3')
  assert.equal(p.last.from, 30)
  assert.equal(p.state, 'playing')
})

test('a pause while the picked track waits keeps it out; play then begins it at 0:00', async () => {
  const p = await page()
  await p.playFrom(0, 80)
  p.click(p.rows[1])
  await p.wait(100)
  p.click(p.main.play)
  await p.wait(1000)
  assert.deepEqual(p.loads, ['/one.mp3'])
  assert.equal(p.audio.paused, true)
  assert.equal(p.state, 'paused')
  p.click(p.main.play)
  await p.wait(1000)
  assert.equal(p.last.src, '/two.mp3')
  assert.equal(p.last.from, 0)
  assert.equal(p.state, 'playing')
})

test('a single click on the playing track\'s row pauses it, and the next one carries on from there', async () => {
  const p = await page()
  await p.playFrom(1, 50)
  p.click(p.rows[1])
  assert.equal(p.state, 'paused')
  await p.wait(1000)
  assert.equal(p.audio.paused, true)
  const where = p.audio.currentTime
  assert.ok(where > 50)
  p.click(p.rows[1])
  await p.wait(1000)
  assert.equal(p.last.from, where)
  assert.equal(p.state, 'playing')
})
