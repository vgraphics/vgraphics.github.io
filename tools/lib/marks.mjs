// Our names as trade marks on the website's pages (George, 3 Nov 2026: "Yes, add ™"): ™ after VGraphics, Exitwise,
// Palermo Noir and Quizfall, the names the EU trade mark search found free (Games repo docs/legal/trademarks.md), in
// every heading that names them and at their first mention in the page's text. Not VHub (a mark another company
// registered), never ® (none is registered yet), and nowhere else: not in titles, descriptions, structured data, link
// labels, buttons, menus, footers or quotes, not on a product's own screens (its play, TV, join and demo pages, the hub,
// the try pages: the game or app itself), and not in the policies and map rules the products' repos own. The template
// (tools/build-pages.mjs, build-wiki.mjs, build-devlog.mjs) writes them through markPage; check-site holds every other
// page to the same (markProblems).
import { isProductScreen } from './legal.mjs'

export const MARKS = ['VGraphics', 'Exitwise', 'Palermo Noir', 'Quizfall']
const TM = '™'

/** Whether the page at `path` carries the marks: the website's own pages, not a product's screens or its documents. */
export const takesMarks = (path) => !isProductScreen(path) && !/\/(privacy|map-rules)(\/|\.html$)/.test(path)

// Text in these is a label, a quote or code, not the page's own words: it never takes the first mention's ™. So is a
// kicker, eyebrow, breadcrumb, chip or a post's meta line, by its class.
const LABELS = new Set(['a', 'button', 'nav', 'label', 'select', 'option', 'code', 'kbd', 'samp', 'blockquote', 'q', 'cite'])
const LABEL_CLASS = /\bclass="[^"]*\b(kicker|eyebrow|crumbs?|breadcrumbs?|chip|badge|post-meta)\b/
const HEADING = /^h[1-6]$/
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
// Comments and the elements whose content is never the page's text, whole; then any other tag.
const TOKEN = /<!--[\s\S]*?-->|<(script|style|svg|template|textarea|noscript)\b[\s\S]*?<\/\1\s*>|<[^>]*>/gi

// A mention of the name: a word of its own (not part of an address or a longer word), not a possessive ("Exitwise's":
// the mark goes on a plain mention), not the legal line's "© <year> VGraphics", and whether it already has its ™.
const mention = (name) => new RegExp(`(?<![\\w@./-])(?<!(?:©|&copy;)\\s*(?:\\d{4}\\s*)?)${name.replace(' ', '\\s+')}(?![\\w-]|['’]s\\b)(™|&trade;|&#8482;)?`, 'g')

/**
 * The page with each mark's ™ in place (its <main> only: the header, menus and footer are shared and never take it),
 * and what was added: [{ name, where: 'heading' | 'text', near }]. Unchanged for a page that takes no marks.
 */
export function withMarks(path, html) {
  const added = []
  if (!takesMarks(path)) return { html, added }
  const open = html.search(/<main\b/)
  const close = html.lastIndexOf('</main>')
  if (open < 0 || close < open) return { html, added }
  const main = html.slice(open, close)
  const stack = []
  const firstDone = new Set()
  let inHeading = new Set()
  let out = ''
  let at = 0
  const text = (t) => {
    const heading = stack.some((e) => HEADING.test(e.name))
    const label = stack.some((e) => e.label)
    if (!heading && label) return t
    for (const name of MARKS) {
      if (heading ? inHeading.has(name) : firstDone.has(name)) continue
      const m = mention(name).exec(t)
      if (!m) continue
      if (heading) inHeading.add(name)
      else firstDone.add(name)
      if (m[1]) continue
      const end = m.index + m[0].length
      added.push({ name, where: heading ? 'heading' : 'text', near: t.slice(Math.max(0, m.index - 20), end + 20).replace(/\s+/g, ' ').trim() })
      t = t.slice(0, end) + TM + t.slice(end)
    }
    return t
  }
  for (const m of main.matchAll(TOKEN)) {
    out += text(main.slice(at, m.index)) + m[0]
    at = m.index + m[0].length
    if (m[1] || m[0].startsWith('<!') || m[0].startsWith('<?')) continue
    const tag = m[0].match(/^<(\/?)([a-z][a-z0-9-]*)/i)
    if (!tag) continue
    const name = tag[2].toLowerCase()
    if (tag[1]) {
      const i = stack.findLastIndex((e) => e.name === name)
      if (i >= 0) stack.length = i
    } else if (!VOID.has(name) && !m[0].endsWith('/>')) {
      if (HEADING.test(name)) inHeading = new Set()
      stack.push({ name, label: LABELS.has(name) || LABEL_CLASS.test(m[0]) })
    }
  }
  out += text(main.slice(at))
  return { html: html.slice(0, open) + out + html.slice(close), added }
}

/** The page as the template writes it: with its marks. */
export const markPage = (path, html) => withMarks(path, html).html

/** What is wrong with a page's marks: a ™ missing (on the pages that take them), or a mark we don't claim, anywhere. */
export function markProblems(path, html) {
  const out = withMarks(path, html).added.map(({ name, where, near }) =>
    `no ™ after "${name}" ${where === 'heading' ? 'in a heading' : 'at its first mention in the text'} ("${near}"): run the page's builder, or node tools/add-marks.mjs for a hand-made page`)
  if (/VHub\s*(™|&trade;|&#8482;)/.test(html)) out.push('"VHub" with ™: another company registered that name, so we never claim it')
  if (/(VGraphics|Exitwise|Palermo Noir|Quizfall|VHub)\s*(™|&trade;|&#8482;)?\s*(®|&reg;|&#174;)/.test(html)) out.push('® after one of our names: none is registered, so it is ™ (or nothing), never ®')
  return out
}
