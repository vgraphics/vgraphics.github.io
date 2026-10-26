// A product's theme pack, <product>/theme/theme.json, as the stylesheet every page of that product links first:
// @font-face rules for its fonts and one :root custom property per token. The shared layouts (assets/product.css for
// the landing pages, assets/wiki.css for the wikis) read only these properties, so no product's colours live there.
// tools/build-pages.mjs writes <product>/theme/theme.css; check-site.mjs checks it is up to date.
//
// theme.json: { "scheme": "light" | "dark", "fonts": [{ family, src, weight, preload? }], "tokens": { name: css value },
//   "swatches": [colours the layout hands out in turn: steps, feature marks], "mark": "<svg>" | null (the feature
//   lists' glyph, drawn in currentColor), "ornaments": { "edges": [...], "horizon": {...} | null } }
// Beside it, the pack's cursors (theme/cursor.svg, cursor-link.svg, cursor-text.svg; tools/lib/cursors.mjs) become
// theme.css's --cursor, --cursor-link and --cursor-text.
import { cursorCss } from './cursors.mjs'

// The tokens every pack sets, as assets/product.css reads them without a fallback. A pack may add its own (a game's
// heart red, say) for its demo or pictures; product.css also reads a few optional ones (marked there) with fallbacks.
export const TOKENS = [
  // Colours: the page, cards and insets, words, rules, the accents, and the main button (its face, words and edge)
  'page', 'page-pattern', 'page-pattern-size', 'surface', 'surface-2', 'ink', 'muted', 'line', 'accent', 'accent-2',
  'cta', 'cta-ink', 'cta-edge',
  // Over the key art: the header's words and their shadow, the shade under them, and the lead line
  'on-art', 'on-art-shadow', 'art-shade', 'lead-ink', 'lead-em', 'lead-shadow', 'lead-style', 'lead-size',
  // Shapes: corners, and the cards' face, edge, shadow, hover shadow and accent stripe (0px for none)
  'radius', 'radius-sm', 'card-bg', 'card-border', 'card-shadow', 'card-lift', 'card-stripe',
  // Type: the display face (headings, lead, logo) and the label face (menu, eyebrows, tags, buttons)
  'font-display', 'font-body', 'display-weight', 'display-case', 'display-tracking', 'display-leading',
  'label-font', 'label-weight', 'label-case', 'label-tracking', 'body-size', 'body-weight', 'h2-size',
  // Pieces: section spacing, the demo stage's colour under its picture, screenshot frames, step numbers, tags, the
  // menu's current page, and the footer's rule
  'section-pad', 'intro-bg', 'shot-frame', 'step-font', 'step-ink', 'tag-bg', 'tag-ink',
  'nav-current-bg', 'nav-current-ink', 'nav-current-line', 'foot-rule',
]

// Words over these pairs must read (WCAG): 4.5:1 for text, 7:1 for the main button (the coordinator's brief, 22 Oct).
const CONTRAST = [['ink', 'page', 4.5], ['muted', 'page', 4.5], ['ink', 'surface', 4.5], ['muted', 'surface', 4.5],
  ['accent', 'page', 4.5], ['cta-ink', 'cta', 7]]

function luminance(hex) {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? [...n].map((c) => c + c).join('') : n
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
// A colour's saturation (HSL, 0 to 1): a grey's is near 0.
function saturation(hex) {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? [...n].map((c) => c + c).join('') : n
  const c = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
  const [max, min] = [Math.max(...c), Math.min(...c)]
  const l = (max + min) / 2
  return max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1))
}

// What's wrong with a pack, as messages (none means it's fine).
export function checkTheme(theme) {
  const t = theme.tokens || {}
  const problems = TOKENS.filter((k) => !(k in t)).map((k) => `token --${k} is missing`)
  for (const [fg, bg, min] of CONTRAST) {
    if (!/^#[0-9a-f]{3,6}$/i.test(t[fg] ?? '') || !/^#[0-9a-f]{3,6}$/i.test(t[bg] ?? '')) continue
    const c = contrast(t[fg], t[bg])
    if (c < min) problems.push(`--${fg} on --${bg} is ${c.toFixed(2)}:1, under ${min}:1`)
  }
  // What a text field selects (assets/no-select.css) and the header's play or try button (assets/product.css): optional
  // --selection-ink on --selection, by default the page's colour on the scrollbar's (the accent's, without one).
  const [ink, sel] = [t['selection-ink'] ?? t.page, t.selection ?? t.scrollbar ?? t.accent]
  if (/^#[0-9a-f]{3,6}$/i.test(ink ?? '') && /^#[0-9a-f]{3,6}$/i.test(sel ?? '') && contrast(ink, sel) < 4.5) {
    problems.push(`selected text and the play button, ${ink} on ${sel} (--selection-ink on --selection: by default --page on --scrollbar or --accent), is ${contrast(ink, sel).toFixed(2)}:1, under 4.5:1`)
  }
  // That colour is the product's own, never a grey (George, 26 Oct 2026, on Exitwise's play button: "Create a better
  // play online button. More purple like the logo stroke.").
  if (/^#[0-9a-f]{3,6}$/i.test(sel ?? '') && saturation(sel) < 0.35) {
    problems.push(`the play button's colour ${sel} (--selection: by default --scrollbar or --accent) is greyish (saturation ${Math.round(saturation(sel) * 100)}%, under 35%): give the pack its own colour`)
  }
  if (!['light', 'dark'].includes(theme.scheme)) problems.push('scheme is not "light" or "dark"')
  if (!Array.isArray(theme.swatches) || !theme.swatches.length) problems.push('no swatches')
  return problems
}

const FORMAT = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' }

// cursors: the pack's cursor tokens, [[name, css value]] (tools/lib/cursors.mjs readCursors).
export function themeCss(slug, theme, cursors = []) {
  const fonts = (theme.fonts || []).map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.src}") format("${FORMAT[f.src.split('.').pop()]}"); font-weight: ${f.weight}; font-display: swap; }`)
  const vars = [
    ...Object.entries(theme.tokens).map(([k, v]) => `  --${k}: ${v};`),
    ...theme.swatches.map((c, i) => `  --swatch-${i + 1}: ${c};`),
    `  color-scheme: ${theme.scheme};`,
  ]
  return `/* ${slug}'s theme pack, written by tools/build-pages.mjs from theme.json: edit that, not this. */
${fonts.join('\n')}
:root {
${vars.join('\n')}
}
${cursorCss(cursors)}`
}
