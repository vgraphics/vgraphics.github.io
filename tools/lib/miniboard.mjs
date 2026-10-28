// A small still board for a page's pictures (the How to play cards), drawn as an inline SVG the way the game and the
// overview's playable board (exitwise/demo/board.js) draw theirs, George's "A3 Flat candy" of 22 Oct 2026: flat colour
// arrows in the UI's ink outline on a card in a cream frame, in the first world's colours. Keep the sizes and layers in
// step with board.js.
//
// spec: { cols, rows, arrows: [{ cells: [[x, y], ...] (tail to head), dir: U|D|L|R, colour: 0-5, state? }], hearts? }
//   state  "free":  a dotted path from its head to the edge, in the pack's second accent (its way out is clear)
//          "leave": on its way out, slid past the board's edge, with speed lines behind it and a tap ring where it was
//          "gone":  only a dashed ghost where it was
//          "bad":   in the mistake red, bumped against what blocks it
//   hearts [left, of]: a row of hearts above the board, the lost ones grey
import { esc } from './partials.mjs'

const CELL = 60, PAD = 36
const GROW = 0.28 * CELL, FRAME = 0.3 * CELL
const W = 0.45 * CELL, BEND = 0.27 * CELL, EDGE = 2
const LIGHT = [-0.6, -0.8]
const DIRS = { U: [0, -1, -90, 'up'], D: [0, 1, 90, 'down'], L: [-1, 0, 180, 'left'], R: [1, 0, 0, 'right'] }
// The Meadow (WorldStyles.cs), as board.js has it.
const WORLD = {
  card: '#FFFDF8', rim: '#E8DCC6', dot: '#C0AF95',
  arrows: [['red', '#EE4D5C'], ['orange', '#D9580E'], ['yellow', '#BE8508'], ['green', '#1F9F52'], ['blue', '#1E88DA'], ['purple', '#8C5CF0']],
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const css = (c) => `rgb(${c.map(Math.round).join(' ')})`
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const dim = (a, k) => a.map((v) => v * k)
const r1 = (n) => Math.round(n * 10) / 10

function route(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1]
    const ux = Math.sign(x - px), uy = Math.sign(y - py), vx = Math.sign(nx - x), vy = Math.sign(ny - y)
    if (ux === vx && uy === vy) continue
    d += ` L${r1(x - ux * BEND)} ${r1(y - uy * BEND)} A${r1(BEND)} ${r1(BEND)} 0 0 ${ux * vy - uy * vx > 0 ? 1 : 0} ${r1(x + vx * BEND)} ${r1(y + vy * BEND)}`
  }
  const [hx, hy] = pts[pts.length - 1]
  return `${d} L${hx} ${hy}`
}

function head(k) {
  const tip = 23.5, back = -3.5, half = 17, mid = (tip + back * 2) / 3
  const at = (x) => r1(mid + (x - mid) * k)
  return `M${at(tip)} 0 L${at(back)} ${r1(-half * k)} L${at(back)} ${r1(half * k)} Z`
}

const HEART = 'M24 40S7 29 7 17a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 12-17 23-17 23z'

// tokens: the theme pack's (ink, surface, mistake, accent-2, line, heart), as board.js reads them from the page.
export function miniboard(spec, tokens, label) {
  const INK = rgb(tokens.ink), CREAM = rgb(tokens.surface), MISTAKE = rgb(tokens.mistake), WHITE = [255, 255, 255]
  const look = (c) => ({ o: css(mix(dim(c, 0.55), INK, 0.55)), b: css(mix(c, dim(c, 0.86), 0.6)), m: css(c), s: css(mix(c, WHITE, 0.2)) })
  const { cols, rows } = spec
  const top = spec.hearts ? 46 : 0
  const center = ([x, y]) => [PAD + x * CELL + CELL / 2, top + PAD + y * CELL + CELL / 2]
  const out = []
  const ring = (grow, fill) => `<rect x="${r1(PAD - GROW - grow)}" y="${r1(top + PAD - GROW - grow)}" width="${r1(cols * CELL + 2 * (GROW + grow))}" height="${r1(rows * CELL + 2 * (GROW + grow))}" rx="${r1(GROW + grow)}" fill="${fill}"/>`
  out.push(ring(FRAME, css(mix(CREAM, INK, 0.8))), ring(FRAME - 0.035 * CELL, css(CREAM)), ring(0.09 * CELL, WORLD.rim),
    ring(0.035 * CELL, css(CREAM)), ring(0.03 * CELL, css(mix(CREAM, INK, 0.55))), ring(0, WORLD.card))
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const [cx, cy] = center([x, y])
    out.push(`<circle cx="${cx}" cy="${cy}" r="3.4" fill="${WORLD.dot}"/>`)
  }
  if (spec.hearts) {
    const [left, of] = spec.hearts
    const w = cols * CELL + 2 * PAD
    for (let i = 0; i < of; i++) out.push(`<path d="${HEART}" transform="translate(${r1(w / 2 + (i - (of - 1) / 2) * 40 - 17)} 2) scale(0.72)" fill="${i < left ? tokens.heart : tokens.line}"/>`)
  }
  for (const [i, a] of spec.arrows.entries()) {
    const [dx, dy, turn] = DIRS[a.dir]
    const shift = a.state === 'leave' ? (a.shift ?? 2.2) * CELL : a.state === 'bad' ? 0.22 * CELL : 0
    const pts = a.cells.map(center).map(([x, y]) => [x + dx * shift, y + dy * shift])
    const d = route(pts)
    const [hx, hy] = pts[pts.length - 1]
    const [name, colour] = WORLD.arrows[(a.colour ?? i) % WORLD.arrows.length]
    if (a.state === 'gone') {
      out.push(`<path d="${d}" fill="none" stroke="${css(mix(CREAM, INK, 0.35))}" stroke-width="3" stroke-dasharray="7 8" stroke-linecap="round" stroke-linejoin="round"/>`)
      continue
    }
    const c = a.state === 'bad' ? look(MISTAKE) : look(rgb(colour))
    if (a.state === 'free') {
      // The way out: dots from the head to just past the board's edge.
      const [ex, ey] = a.cells[a.cells.length - 1]
      const steps = dx > 0 ? cols - ex : dx < 0 ? ex + 1 : dy > 0 ? rows - ey : ey + 1
      for (let s = 1; s <= steps; s++) out.push(`<circle cx="${hx + dx * s * CELL * 0.62 + dx * 22}" cy="${hy + dy * s * CELL * 0.62 + dy * 22}" r="${s === steps ? 6 : 5}" fill="${tokens['accent-2']}"/>`)
    }
    if (a.state === 'leave') {
      // Speed lines behind the tail, and the tap where the arrow stood.
      const [tx, ty] = pts[0]
      for (const k of [-1, 0, 1]) out.push(`<path d="M${tx - dx * 20 + dy * k * 14} ${ty - dy * 20 + dx * k * 14} l${-dx * (k ? 22 : 34)} ${-dy * (k ? 22 : 34)}" stroke="${css(INK)}" stroke-opacity="0.35" stroke-width="5" stroke-linecap="round"/>`)
      const [ox, oy] = center(a.cells[0])
      out.push(`<circle cx="${ox}" cy="${oy}" r="24" fill="none" stroke="${css(INK)}" stroke-opacity="0.3" stroke-width="4"/><circle cx="${ox}" cy="${oy}" r="11" fill="${css(INK)}" fill-opacity="0.18"/>`)
    }
    const layers = [['o', W + 2 * EDGE, 1, 5 + 2 * EDGE, 0], ['b', W, 1, 5, 0], ['m', W * 0.84, 0.86, 4.3, W * 0.08], ['s', W * 0.38, 0.44, 2.5, W * 0.2]]
    const g = [`<g aria-label="${esc(`${a.state === 'bad' ? 'a blocked' : name} arrow pointing ${DIRS[a.dir][3]}`)}">`]
    for (const [k, width, scale, round, sh] of layers) {
      const [sx, sy] = [r1(LIGHT[0] * sh), r1(LIGHT[1] * sh)]
      g.push(`<path d="${d}" fill="none" stroke="${c[k]}" stroke-width="${r1(width)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${sx} ${sy})"/>`)
      g.push(`<path d="${head(scale)}" fill="${c[k]}" stroke="${c[k]}" stroke-width="${round}" stroke-linejoin="round" transform="translate(${r1(hx + sx)} ${r1(hy + sy)}) rotate(${turn})"/>`)
    }
    if (a.state === 'bad') g.push(`<path d="M${hx + dx * 30 - dy * 16} ${hy + dy * 30 - dx * 16} l${dx * 8 - dy * 6} ${dy * 8 - dx * 6} M${hx + dx * 30 + dy * 16} ${hy + dy * 30 + dx * 16} l${dx * 8 + dy * 6} ${dy * 8 + dx * 6}" stroke="${css(INK)}" stroke-width="4" stroke-linecap="round"/>`)
    out.push(g.join('') + '</g>')
  }
  // Room on both sides for a leaving arrow past the frame, so every board of a set is drawn at the same size.
  const extra = 40
  const width = cols * CELL + 2 * PAD, height = top + rows * CELL + 2 * PAD
  return `<svg class="miniboard" viewBox="${-extra} 0 ${width + 2 * extra} ${height}" role="img" aria-label="${esc(label)}">${out.join('')}</svg>`
}
