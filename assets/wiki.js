// Every product's wiki (tools/build-wiki.mjs writes the pages): the index's search and filters, the playable board
// that shows a rule and then lets you play it, Speedometer's live gauge, and the world map. Each page works without it.
(() => {
  document.documentElement.classList.add('js')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const NS = 'http://www.w3.org/2000/svg'
  const el = (name, attrs, parent) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n }
  const tween = (ms, step) => new Promise((done) => {
    if (reduced) ms = 1
    const t0 = performance.now()
    const frame = (now) => { const t = Math.min(1, (now - t0) / ms); step(t); t < 1 ? requestAnimationFrame(frame) : done() }
    requestAnimationFrame(frame)
  })
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms))

  // ---------- Index: search and section filters ----------
  const q = document.getElementById('q')
  if (q) {
    const cards = [...document.querySelectorAll('.w-card[data-text]')]
    const secs = [...document.querySelectorAll('section.w-sec')]
    let filter = 'all'
    const apply = () => {
      const t = q.value.trim().toLowerCase()
      let any = false
      cards.forEach((c) => { const on = (!t || c.dataset.text.includes(t)) && (filter === 'all' || c.dataset.sec === filter); c.hidden = !on; any = any || on })
      secs.forEach((s) => { s.hidden = !s.querySelector('.w-card:not([hidden])') })
      document.getElementById('empty').hidden = any
    }
    q.addEventListener('input', apply)
    document.querySelectorAll('.w-chip').forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.filter
      document.querySelectorAll('.w-chip').forEach((x) => x.classList.toggle('on', x === b))
      apply()
    }))
  }

  // ---------- The playable board ----------
  // A board in wiki.json: { cols, rows, rocks: [[x, y]], portals: [{ cells: [[x, y], [x, y]], color, dots }],
  // bombs: [{ id, cells, dir }], arrows: [{ id, cells, dir, color }], script: [{ hl | tap: id, say }] }.
  // Cells run tail to head; dir is the head's direction (U, D, L, R).
  const CELL = 40, PAD = 16, SW = 13
  const DIRS = { U: [0, -1, -90], D: [0, 1, 90], L: [-1, 0, 180], R: [1, 0, 0] }
  const COL = { red: '#FF6B6B', orange: '#FF922B', yellow: '#F2B705', green: '#3BB273', blue: '#1C9FD8', purple: '#8C5CF0' }
  const ctr = ([x, y]) => [PAD + x * CELL + CELL / 2, PAD + y * CELL + CELL / 2]
  const key = (c) => c[0] + ',' + c[1]
  const pts = (list) => list.map((p) => p.join(' ')).join(' L')
  const ROCK = "<path d='M9 34l5-15 11-7 12 8 3 14-14 5z' fill='#B8A688' stroke='#3E352C' stroke-width='2.5' stroke-linejoin='round'/><path d='M14 19l11-7 12 8-11 4z' fill='#D2C3A6'/><path d='M26 24l11-4 3 14-14 5z' fill='#8F7E64'/><path d='M17 18l5-3' stroke='#F1E8D8' stroke-width='2' stroke-linecap='round'/>"
  const HEAD = (c) => `<path d="M15 0 L-3 -11 L-3 11 Z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`
  const BOMB = '<circle r="12.5" fill="#E9E3D8"/><circle r="11" fill="#2F2B38"/><path d="M8 -7.5 L17.5 0 L8 7.5z" fill="#2F2B38"/><circle cx="-3.6" cy="-4.2" r="2.6" fill="#fff" opacity=".8"/>'
  const SPARK = '<path d="M0 -6l1.6 4 4.4 2-4.4 2L0 6l-1.6-4-4.4-2 4.4-2z" fill="#FF922B"/><circle r="2" fill="#FFE29A"/>'
  const BURST = '<path d="M0 -19l5 12 13-3-9 10 9 10-13-3-5 12-5-12-13 3 9-10-9-10 13 3z" fill="#FFD27A" stroke="#FF922B" stroke-width="2.5" stroke-linejoin="round"/><circle r="5" fill="#fff"/>'

  function staticPiece(a) {
    const p = a.cells.map(ctr), [hx, hy] = p[p.length - 1], rot = DIRS[a.dir][2]
    if (a.color) return `<path d="M${pts(p)}" fill="none" stroke="${COL[a.color]}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(${hx} ${hy}) rotate(${rot})">${HEAD(COL[a.color])}</g>`
    const [tx, ty] = p[0]
    return `<path d="M${pts(p)}" stroke="#E9E3D8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M${pts(p)}" stroke="#2F2B38" stroke-width="4.5" stroke-linecap="round" fill="none"/><g transform="translate(${tx} ${ty})">${SPARK}</g><g transform="translate(${hx} ${hy}) rotate(${rot})">${BOMB}</g>`
  }

  document.querySelectorAll('.w-play[data-board]').forEach((host) => {
    const b = JSON.parse(host.dataset.board)
    const svg = host.querySelector('.w-board'), say = host.querySelector('.w-play-say')
    const hearts = [...host.querySelectorAll('.w-heart')]
    const steps = [...host.closest('.w-how').querySelectorAll('.w-steps li')]
    const portalAt = (c) => { for (const p of b.portals || []) { const i = p.cells.findIndex((q) => q[0] === c[0] && q[1] === c[1]); if (i >= 0) return p.cells[1 - i] } return null }
    let pieces, rocks, lives, busy, playing
    const occupied = (except) => { const occ = new Map(); for (const [k] of rocks) occ.set(k, 'rock'); for (const p of pieces) if (p.alive && p !== except) p.cells.forEach((c) => occ.set(key(c), p.id)); return occ }
    // The path from a head: through portals, until the edge or the first occupied cell.
    function trace(from, dir, occ) {
      let [x, y] = from
      const [dx, dy] = DIRS[dir], route = [[ctr(from)]], cells = []
      for (let n = 0; n < 60; n++) {
        x += dx; y += dy
        if (x < 0 || y < 0 || x >= b.cols || y >= b.rows) { const [cx, cy] = ctr([x, y]); route.at(-1).push([cx + dx * CELL * 3, cy + dy * CELL * 3]); return { route, cells, exit: true } }
        const twin = portalAt([x, y])
        if (twin) { route.at(-1).push(ctr([x, y])); route.push([ctr(twin)]); [x, y] = twin; continue }
        if (occ.has(key([x, y]))) { route.at(-1).push(ctr([x, y])); return { route, cells, blockedAt: [x, y], hit: occ.get(key([x, y])) } }
        cells.push([x, y]); route.at(-1).push(ctr([x, y]))
      }
      return { route, cells }
    }
    function build() {
      const w = PAD * 2 + b.cols * CELL, h = PAD * 2 + b.rows * CELL
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      let s = `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="18" class="card"/>`
      for (let y = 0; y < b.rows; y++) for (let x = 0; x < b.cols; x++) { const [cx, cy] = ctr([x, y]); s += `<circle cx="${cx}" cy="${cy}" r="2.6" class="dot"/>` }
      for (const p of b.portals || []) for (const c of p.cells) { const [cx, cy] = ctr(c); s += `<circle cx="${cx}" cy="${cy}" r="15.5" fill="#1E1A26" stroke="${p.color}" stroke-width="5"/><path d="M${cx} ${cy}c4-1.5 7 1 5.5 5M${cx} ${cy}c-1.5-4 1-7 5-5.5M${cx} ${cy}c-4 1.5-7-1-5.5-5M${cx} ${cy}c1.5 4-1 7-5 5.5" stroke="#6E6880" stroke-width="1.6" fill="none" stroke-linecap="round"/>${p.dots === 1 ? `<circle cx="${cx}" cy="${cy}" r="3" fill="#fff"/>` : ''}` }
      svg.innerHTML = s
      rocks = new Map((b.rocks || []).map((r) => { const [cx, cy] = ctr(r); const g = el('g', { transform: `translate(${cx - 19} ${cy - 19}) scale(.79)` }, svg); g.innerHTML = ROCK; return [key(r), g] }))
      pieces = [...(b.arrows || []), ...(b.bombs || [])].map((a) => {
        const name = a.color ? `${a.color} arrow` : 'bomb'
        const g = el('g', { class: 'piece', tabindex: 0, role: 'button', 'aria-label': `${name} pointing ${{ U: 'up', D: 'down', L: 'left', R: 'right' }[a.dir]}` }, svg)
        g.innerHTML = staticPiece(a)
        const p = { ...a, g, alive: true }
        g.addEventListener('click', () => { if (!playing) tap(p) })
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!playing) tap(p) } })
        return p
      })
      lives = 3; busy = false
      hearts.forEach((x) => x.classList.remove('lost'))
      steps.forEach((x) => x.classList.remove('on'))
      say.textContent = 'Tap an arrow with a clear path.'
    }
    async function tap(p) {
      if (busy || !p.alive || lives <= 0) return
      busy = true
      const t = trace(p.cells.at(-1), p.dir, occupied(p))
      const isBomb = !p.color, ok = t.exit || (isBomb && t.hit === 'rock')
      const body = (p.cells.length - 1) * CELL
      const segs = t.route.map((seg, i) => (i === 0 ? [...p.cells.map(ctr), ...seg.slice(1)] : seg))
      const col = p.color ? COL[p.color] : '#2F2B38'
      p.g.innerHTML = ''
      const lines = segs.map((seg) => {
        const d = `M${pts(seg)}`
        const under = isBomb ? el('path', { d, fill: 'none', stroke: '#E9E3D8', 'stroke-width': 8, 'stroke-linecap': 'round' }, p.g) : null
        const path = el('path', { d, fill: 'none', stroke: col, 'stroke-width': isBomb ? 4.5 : SW, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, p.g)
        return { path, under, len: path.getTotalLength() }
      })
      const head = el('g', {}, p.g); head.innerHTML = isBomb ? BOMB : HEAD(col)
      const tail = isBomb ? el('g', {}, p.g) : null
      if (tail) tail.innerHTML = SPARK
      const rot = DIRS[p.dir][2]
      // along: how far the tail has moved. Each segment shows the part of the body that is on it.
      const place = (along) => {
        let c = 0
        for (const L of lines) {
          for (const x of [L.path, L.under]) if (x) { x.style.strokeDasharray = `${body} ${L.len + body + CELL * 4}`; x.style.strokeDashoffset = String(c - along) }
          c += L.len
        }
        let hd = along + body, i = 0
        while (i < lines.length - 1 && hd > lines[i].len) { hd -= lines[i].len; i++ }
        const pt = lines[i].path.getPointAtLength(Math.max(0, Math.min(hd, lines[i].len)))
        head.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${rot})`)
        if (tail) { const tp = lines[0].path.getPointAtLength(Math.max(0, Math.min(along, lines[0].len))); tail.setAttribute('transform', `translate(${tp.x} ${tp.y})`) }
      }
      place(0)
      const total = lines.reduce((s, L) => s + L.len, 0)
      if (ok) {
        p.alive = false
        if (isBomb) {
          const dist = total - body - CELL * 0.5
          await tween(380 + dist * 0.6, (k) => place(dist * k * k))
          p.g.remove()
          const r = rocks.get(key(t.blockedAt)), [cx, cy] = ctr(t.blockedAt)
          const burst = el('g', { transform: `translate(${cx} ${cy})` }, svg); burst.innerHTML = BURST
          rocks.delete(key(t.blockedAt))
          await tween(420, (k) => { burst.setAttribute('transform', `translate(${cx} ${cy}) scale(${0.4 + k * 1.3})`); burst.style.opacity = String(1 - k * k); r.style.opacity = String(1 - k) })
          burst.remove(); r.remove()
        } else {
          await tween(520 + total * 0.35, (k) => { place((total - body) * k * k); p.g.style.opacity = k < 0.75 ? '1' : String(1 - (k - 0.75) / 0.25) })
          p.g.remove()
        }
        if (!playing) say.textContent = pieces.some((x) => x.alive) ? 'Nice. Which one next?' : 'Board clear!'
      } else {
        const push = t.cells.length * CELL + CELL * 0.3
        p.g.querySelectorAll('path[stroke]').forEach((x) => { if (x.getAttribute('stroke') !== '#E9E3D8') x.setAttribute('stroke', '#FF5A6E') })
        lives -= 1
        hearts[lives]?.classList.add('lost')
        say.textContent = lives > 0 ? 'Blocked! That cost a heart.' : 'Out of hearts. Tap Reset.'
        await tween(120 + push * 0.4, (k) => place(push * k))
        await tween(300, (k) => place(push * (1 - k) * (1 - k)))
        p.g.innerHTML = staticPiece(p)
      }
      busy = false
    }
    async function showMe() {
      build(); playing = true
      for (let i = 0; i < (b.script || []).length; i++) {
        const st = b.script[i]
        steps.forEach((x, j) => x.classList.toggle('on', j === Math.min(i, steps.length - 1)))
        say.textContent = st.say
        const p = pieces.find((x) => x.id === (st.hl || st.tap))
        if (st.hl) { p.g.classList.add('pulse'); await wait(1400); p.g.classList.remove('pulse') }
        if (st.tap) { await wait(500); await tap(p); await wait(450) }
      }
      playing = false
      say.textContent = 'Your turn: clear the rest.'
    }
    host.querySelector('[data-act=show]').addEventListener('click', showMe)
    host.querySelector('[data-act=reset]').addEventListener('click', build)
    build()
  })

  // ---------- The live gauge (Speedometer) ----------
  // wiki.json "gauge": { label, unit, min, max, offValue, onValue, off, on, offText, onText }.
  document.querySelectorAll('.w-gauge-try[data-gauge]').forEach((host) => {
    const g = JSON.parse(host.dataset.gauge), svg = host.querySelector('svg')
    const cx = 120, cy = 120, R = 100, a0 = 225, a1 = -45
    const ang = (v) => (a0 + (a1 - a0) * (v - g.min) / (g.max - g.min)) * Math.PI / 180
    const rot = (v) => 90 - ang(v) * 180 / Math.PI
    let s = '<defs><radialGradient id="wg-face" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#2A2A2F"/><stop offset="1" stop-color="#0E0E10"/></radialGradient><linearGradient id="wg-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F4F6"/><stop offset=".5" stop-color="#6D6D74"/><stop offset="1" stop-color="#2A2A2E"/></linearGradient></defs>'
    s += `<circle cx="${cx}" cy="${cy}" r="116" fill="url(#wg-rim)"/><circle cx="${cx}" cy="${cy}" r="109" fill="url(#wg-face)"/>`
    const step = (g.max - g.min) / 20
    for (let v = g.min; v <= g.max + 1e-9; v += step) {
      const big = Math.round((v - g.min) / step) % 4 === 0, a = ang(v), r1 = R - (big ? 16 : 9)
      s += `<line x1="${cx + Math.cos(a) * R}" y1="${cy - Math.sin(a) * R}" x2="${cx + Math.cos(a) * r1}" y2="${cy - Math.sin(a) * r1}" stroke="${v >= g.max - (g.max - g.min) * 0.2 ? '#F04A2C' : '#ECECEE'}" stroke-width="${big ? 4 : 2}" stroke-linecap="round"/>`
      if (big) s += `<text x="${cx + Math.cos(a) * (R - 30)}" y="${cy - Math.sin(a) * (R - 30) + 6}" class="num">${Math.round(v)}</text>`
    }
    s += `<text x="${cx}" y="${cy + 52}" class="unit">${g.unit}</text><g class="needle" style="transform-origin: ${cx}px ${cy}px"><path d="M${cx - 3.5} ${cy + 18} L${cx} ${cy - 92} L${cx + 3.5} ${cy + 18} Z" fill="#F04A2C"/></g><circle cx="${cx}" cy="${cy}" r="11" fill="#C9C9CE" stroke="#4A4A50" stroke-width="2"/><rect x="${cx - 34}" y="${cy + 64}" width="68" height="26" rx="5" fill="#0A0A0B" stroke="#34343A"/><text x="${cx}" y="${cy + 83}" class="lcd"></text>`
    svg.innerHTML = s
    const needle = svg.querySelector('.needle'), lcd = svg.querySelector('.lcd')
    let v = g.offValue, raf
    const show = (x) => { needle.style.transform = `rotate(${rot(x)}deg)`; lcd.textContent = x.toFixed(1) }
    show(v)
    const btn = host.querySelector('[data-act=plug]'), said = host.querySelector('.w-gauge-say')
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true'
      btn.setAttribute('aria-pressed', String(on))
      btn.textContent = on ? g.on : g.off
      said.textContent = on ? g.onText : g.offText
      cancelAnimationFrame(raf)
      const from = v, to = on ? g.onValue : g.offValue, t0 = performance.now()
      const frame = (now) => { const k = reduced ? 1 : Math.min(1, (now - t0) / 900); v = from + (to - from) * (1 - (1 - k) ** 3); show(v); if (k < 1) raf = requestAnimationFrame(frame) }
      raf = requestAnimationFrame(frame)
    })
  })

  // ---------- World map ----------
  document.querySelectorAll('[data-worlds]').forEach((wm) => {
    const tiles = [...wm.querySelectorAll('[data-world]')], cardsList = [...wm.querySelectorAll('[data-world-card]')]
    tiles.forEach((t) => t.addEventListener('click', (e) => {
      e.preventDefault()
      tiles.forEach((x) => { x.classList.toggle('on', x === t); if (x === t) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current') })
      cardsList.forEach((c) => c.classList.toggle('is-off', c.dataset.worldCard !== t.dataset.world))
    }))
  })
})()
