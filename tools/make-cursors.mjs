// Draws the site's cursors (George, 24 Oct 2026: "Can we get custom cursors on each landing page?"), each product's
// three in its own look and VGraphics' for the company pages and the hub: the pointer (cursor.svg), the hand over
// whatever clicks (cursor-link.svg) and the text cursor in text fields (cursor-text.svg). 32 x 32 vector pictures, the
// click point in each svg's data-hotspot="x y", which tools/build-pages.mjs and tools/check-site.mjs read
// (tools/lib/cursors.mjs). George picked these from three options each on the review page
// https://claude.ai/artifact/4V2PeBPVi1AwabCjnTQsVa (gvergidis90@gmail.com). Drawn in code: no Recraft, nothing to
// license. Usage: node tools/make-cursors.mjs, then node tools/build-pages.mjs. A new product adds its three here.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { root } from './lib/product.mjs'

const r = (n) => +n.toFixed(2)
const pts = (list) => list.map((p) => p.map(r).join(' ')).join(' ')
const svg = (hot, body, defs = '') => [
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" data-hotspot="${hot.join(' ')}">`,
  ...(defs ? [`<defs>${defs}</defs>`] : []),
  ...body.filter(Boolean),
  '</svg>',
  '',
].join('\n')

// The usual pointer, its tip at (3.5, 2.5), and its shadow
const ARROW = 'M3.5 2.5L3.5 24L8.6 19.3L12.2 27.4L16 25.8L12.5 17.9L19.4 17.9Z'
const ARROW_HOT = [3, 2]
const arrowShadow = (o, dx = 0.9, dy = 1.3) => `<path d="${ARROW}" transform="translate(${dx} ${dy})" fill="#000" stroke="#000" stroke-width="2.4" stroke-linejoin="round" opacity="${o}"/>`

// A pointing hand (a glove), the index finger up, its tip at (13, 1.8), with a cuff
const HAND = [
  '<rect x="3.8" y="16.2" width="10" height="5" rx="2.5" transform="rotate(-38 8.8 18.7)"/>',
  '<rect x="10.2" y="12.6" width="16.6" height="13.2" rx="4.6"/>',
  '<rect x="10.2" y="1.8" width="5.6" height="16" rx="2.8"/>',
  '<rect x="15" y="10.4" width="4.8" height="9" rx="2.4"/>',
  '<rect x="19.2" y="11.4" width="4.6" height="8.6" rx="2.3"/>',
  '<rect x="22.8" y="13.2" width="4" height="7.6" rx="2"/>',
].join('')
const CUFF = '<rect x="11.2" y="24.2" width="14.8" height="4.8" rx="1.6"/>'
const HAND_HOT = [13, 2]
// The outline is the shapes drawn wide behind them, so fingers, palm and cuff share one edge; lip: a 3D lip below
function glove({ outline, w = 2.4, face, cuff, cuffLine, lines, lineW = 1.1, shadow, lip, extra = '' }) {
  const all = HAND + CUFF
  const out = (fill, stroke) => `<g fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round">${all}</g>`
  return [
    `<g transform="translate(0.9 1.3)" opacity="${shadow}">${out('#000', '#000')}</g>`,
    lip && `<g transform="translate(0 1.5)">${out(lip, outline)}</g>`,
    out(outline, outline),
    `<g fill="${face}">${HAND}</g>`,
    `<g fill="${cuff}">${CUFF}</g>`,
    cuffLine && `<path d="M12.4 26.6h12.4" stroke="${cuffLine}" stroke-width="0.9" stroke-linecap="round"/>`,
    `<path d="M15 13.6v4M19.2 14.4v4M22.8 15.8v3.6" stroke="${lines}" stroke-width="${lineW}" stroke-linecap="round" fill="none"/>`,
    extra,
  ]
}

// The text cursor, its click point in the middle
const IB = 'M12.2 5.6H19.8M16 5.6V26.4M12.2 26.4H19.8'
const IB_HOT = [16, 16]
const beam = (stroke, width, { d = IB, at, more = '' } = {}) => `<path d="${d}"${at ? ` transform="translate(${at})"` : ''} fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${more}/>`
const beamShadow = (width, o, d = IB) => beam('#000', width, { d, at: '0.8 1.2', more: ` opacity="${o}"` })

// --- Exitwise: "Cream sticker", the game's white buttons with their beige lip, in the UI's ink --------------------
const EX = { ink: '#3B3355', cream: '#FFFDF8', lip: '#DED4C4', violet: '#8C5CF0' }
const exitwise = {
  cursor: svg(ARROW_HOT, [
    arrowShadow(0.24, 0.9, 2.6),
    `<path d="${ARROW}" transform="translate(0 1.5)" fill="${EX.lip}" stroke="${EX.ink}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="${ARROW}" fill="${EX.cream}" stroke="${EX.ink}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="M5.7 7.4L5.7 15.6" stroke="${EX.violet}" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>`,
  ]),
  'cursor-link': svg(HAND_HOT, glove({ outline: EX.ink, face: EX.cream, cuff: EX.violet, cuffLine: '#C3A8FA', lines: EX.ink, lip: EX.lip, shadow: 0.24 })),
  'cursor-text': svg(IB_HOT, [beamShadow(5.2, 0.24), beam(EX.ink, 5.2, { at: '0 1.4' }), beam(EX.lip, 2.8, { at: '0 1.4' }), beam(EX.ink, 5.2), beam(EX.cream, 2.8)]),
}

// --- Speedometer: the dashboard's faceted nav arrow, a steel glove with a red racing cuff, a red-edged text cursor --
const SP = { red: '#F04A2C', black: '#0B0B0C' }
const steel = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#C9C9D0"/><stop offset="0.7" stop-color="#8E8E98"/><stop offset="1" stop-color="#D8D8DE"/></linearGradient>`
const DART = { T: [3.4, 3.4], R: [25, 11.4], N: [13.8, 13.8], B: [11.4, 25] }
const speedometer = {
  cursor: svg([3, 3], [
    `<polygon points="${pts([DART.T, DART.R, DART.N, DART.B])}" transform="translate(0.9 1.3)" fill="#000" stroke="#000" stroke-width="2.2" stroke-linejoin="round" opacity="0.32"/>`,
    `<polygon points="${pts([DART.T, DART.R, DART.N, DART.B])}" fill="${SP.black}" stroke="${SP.black}" stroke-width="3.4" stroke-linejoin="round"/>`,
    `<polygon points="${pts([DART.T, DART.R, DART.N])}" fill="#34343A"/>`,
    `<polygon points="${pts([DART.T, DART.N, DART.B])}" fill="#1A1A1D"/>`,
    `<polygon points="${pts([DART.T, DART.R, DART.N, DART.B])}" fill="none" stroke="${SP.red}" stroke-width="1.4" stroke-linejoin="round"/>`,
  ]),
  'cursor-link': svg(HAND_HOT, glove({ outline: SP.black, w: 2, face: 'url(#steel)', cuff: SP.red, cuffLine: '#FFFFFF', lines: '#55555E', shadow: 0.34 }), steel('steel')),
  'cursor-text': svg(IB_HOT, [beamShadow(5.4, 0.34), beam(SP.black, 5.4), beam(SP.red, 3.4), beam('#26262A', 1.3)]),
}

// --- Palermo Noir: the stiletto, the gold manicule (the printer's pointing hand) and a gold fountain-pen nib --------
const PN = { navy: '#0B1623', gold: '#C9A46E', pale: '#FFF6E2' }
const gold = (id, user) => `<linearGradient id="${id}" ${user ? 'gradientUnits="userSpaceOnUse" x1="4" y1="2" x2="28" y2="30"' : 'x1="0" y1="0" x2="1" y2="1"'}><stop offset="0" stop-color="#F6E7CC"/><stop offset="0.45" stop-color="${PN.gold}"/><stop offset="1" stop-color="#8A6634"/></linearGradient>`
// The stiletto, blade up and left: blade, crossguard, a navy grip bound in gold, the pommel
const BLADE = 'translate(3.4 3.4) rotate(45)'
const STILETTO = '<path d="M0 0L16.4 -2.3L16.4 2.3Z"/><rect x="16" y="-5.2" width="2.6" height="10.4" rx="1.3"/><rect x="18.2" y="-1.9" width="7.6" height="3.8" rx="1"/><circle cx="27.6" cy="0" r="2.4"/>'
const NIB = 'M0 0L-4.6 -10.5Q-5.5 -13 -4.7 -15.6L-4.1 -20.2Q0 -22.2 4.1 -20.2L4.7 -15.6Q5.5 -13 4.6 -10.5Z'
const NIB_AT = 'translate(5.2 26.8) rotate(38)'
const palermo = {
  cursor: svg([3, 3], [
    `<g transform="translate(0.9 1.3)" opacity="0.4"><g transform="${BLADE}" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round">${STILETTO}</g></g>`,
    `<g transform="${BLADE}">`,
    `<g fill="${PN.navy}" stroke="${PN.navy}" stroke-width="2.2" stroke-linejoin="round">${STILETTO}</g>`,
    '<path d="M0.9 -0.12L16.2 -2.1L16.2 0Z" fill="#F4EEE3"/>',
    '<path d="M0.9 0.12L16.2 2.1L16.2 0Z" fill="#A99C86"/>',
    '<rect x="16" y="-5.2" width="2.6" height="10.4" rx="1.3" fill="url(#gold)"/>',
    `<rect x="18.2" y="-1.9" width="7.6" height="3.8" rx="1" fill="${PN.navy}"/>`,
    `<path d="M19.6 1.9l1.6 -3.8M22 1.9l1.6 -3.8M24.4 1.9l1.2 -2.8" stroke="${PN.gold}" stroke-width="0.7"/>`,
    '<circle cx="27.6" cy="0" r="2.4" fill="url(#gold)"/>',
    '</g>',
  ], gold('gold')),
  'cursor-link': svg(HAND_HOT, glove({
    outline: PN.navy, w: 2.2, face: 'url(#gold)', cuff: PN.navy, cuffLine: PN.gold, lines: PN.navy, lineW: 0.8, shadow: 0.4,
    extra: `<g stroke="${PN.navy}" stroke-width="0.7"><path d="M11.4 29.6q1.2 1.6 2.5 0t2.5 0 2.5 0 2.5 0 2.5 0 2.4 0" fill="none" stroke-linecap="round"/></g><path d="M12.6 4.2v8" stroke="${PN.navy}" stroke-width="0.6" stroke-linecap="round" opacity="0.8"/>`,
  }), gold('gold', true)),
  'cursor-text': svg([5, 27], [
    `<path d="${NIB}" transform="translate(0.8 1.2) ${NIB_AT}" fill="#000" stroke="#000" stroke-width="2.2" stroke-linejoin="round" opacity="0.4"/>`,
    `<g transform="${NIB_AT}">`,
    `<path d="${NIB}" fill="url(#gold)" stroke="${PN.navy}" stroke-width="2" stroke-linejoin="round"/>`,
    `<path d="M-4.5 -16.6Q0 -18 4.5 -16.6" fill="none" stroke="${PN.navy}" stroke-width="0.9"/>`,
    `<path d="M0 -1.6V-10.4" stroke="${PN.navy}" stroke-width="0.9" stroke-linecap="round"/>`,
    `<circle cx="0" cy="-11.8" r="1.3" fill="${PN.navy}"/>`,
    `<path d="M-2.6 -14.2L-3.4 -11.2" stroke="${PN.pale}" stroke-width="0.7" stroke-linecap="round"/>`,
    '</g>',
  ], gold('gold')),
}

// --- VGraphics (company pages and the hub): the logo's ink with a white edge, so it reads in light and dark mode; the
// glove's cuff and the "i"'s dot are the logo's sky blue, edged in ink (George: "dots need black stroke") ---------
const VG = { ink: '#16151B', sky: '#74A2FF' }
const I_DOT = 'M12.2 9.6H19.8M16 9.6V26.6M12.2 26.6H19.8'
const vgraphics = {
  cursor: svg(ARROW_HOT, [arrowShadow(0.3), `<path d="${ARROW}" fill="${VG.ink}" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round"/>`]),
  'cursor-link': svg(HAND_HOT, glove({ outline: '#FFFFFF', w: 1.8, face: VG.ink, cuff: VG.sky, lines: '#FFFFFF', lineW: 0.9, shadow: 0.3 })),
  'cursor-text': svg([16, 18], [beamShadow(4.2, 0.3, I_DOT), beam('#FFFFFF', 4.2, { d: I_DOT }), beam(VG.ink, 2.2, { d: I_DOT }),
    `<circle cx="16" cy="4.4" r="2.7" fill="${VG.sky}" stroke="${VG.ink}" stroke-width="1"/>`]),
}

const SETS = [['exitwise/theme', exitwise], ['speedometer-wallpaper/theme', speedometer], ['palermo/theme', palermo], ['assets/img', vgraphics]]
for (const [dir, set] of SETS) {
  for (const [name, text] of Object.entries(set)) {
    const file = join(root, dir, `${name}.svg`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, text)
    console.log(`${dir}/${name}.svg`)
  }
}
