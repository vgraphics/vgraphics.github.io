// "What's new" on every product's landing page (George, 25 Oct 2026: "This apply as global rule. All landing pages
// must have it."; D:\Projects\Mine\CLAUDE.md): the template's "news" block, fed by the product's changelog, which the
// Deployer adds to on every release players get (D:\Projects\Deployer, src/projects/siteNews.ts). The update card
// (George, 28 Oct 2026, picking design A of four on a review page: "Maybe whats new open a new card like characters to
// see whats need there?"): the newest update's date, headline and first line on one compact card, on a small stack of
// cards, with how many there are. A click grows it into a card holding every update, flying from its place as the role
// cards do (assets/product.js); the newest stands open there, and each of the others opens its lines, one at a time,
// with an animation (assets/faq.js, as every expandable: George, 27 Oct 2026, D:\Projects\Mine\CLAUDE.md). The big
// card's inside scrolls as one box, its edges fading (assets/fade-edges.js), its scrollbar in the product's colour
// (assets/product.css, .news). Players read dates and headlines; the version (a web build's "0.1.66bcb235") is small
// print under each update's lines, "Build …", for support questions (George's pick: "Small, inside the notes").
//
// The changelog is <product>/changelog.json (the block's src names another file in the page's folder):
//   { "entries": [{ version, date, platforms?, title?, items, link?, commit? }] }, newest first
//   version     what the release calls itself: "1.0.17", or a web build's "1.0.4f5d9766"
//   date        the day it reached players, YYYY-MM-DD
//   platforms   where it shipped: "Android", "Web"
//   title       its headline in one line ("17 new styles"); without one, its first line stands in (cut near 60
//               characters), and its lines then start at the second; the Deployer's notes give every VGraphics
//               release one, and Speedometer's are by hand (Games docs/superpowers/specs/2026-10-26-speedometer-web-
//               market-design.md §7: a headline and at most three short lines)
//   items       its notes for players, plain text (the template escapes them), a line each
//   link        { href, label }: where to see it (a new style's page, the try page), under its lines
//   commit      the commit it was built from (the Deployer's): a web build of the same commit joins the store's entry
// An empty list is a product not out yet (George, 26 Oct 2026: "Design the empty view better please."): the newest
// release's card holds its place, with an emblem in the product's colour, a title, a line and, if the block gives one, a
// link. The block's empty says it: its line (trusted HTML), or { title?, text?, link? }, the title ("Coming soon" unless
// it says), the line (else the default one) and a link ({ href, label }: the try page, say), a soft call to action.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { esc, ICONS } from './partials.mjs'
import { root } from './product.mjs'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const isDay = (d) => {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false
  const t = new Date(`${d}T00:00:00Z`)
  return !isNaN(t) && t.toISOString().startsWith(d) // 2026-02-30 is no day
}
const day = (d) => {
  const [y, m, n] = d.split('-').map(Number)
  return `${n} ${MONTHS[m - 1]} ${y}`
}

// While the product's demo is private (page.json site.demo.private; partials.mjs playButtons), a release that speaks of
// it (its headline or a line names the demo, or its link goes to it) is the testers' alone (George, 28 Oct 2026, on the
// review page: "Testers see them"). The block everybody sees leaves it out, so it says nothing of the demo; the
// testers' own block, with every release, waits in a private template, which assets/private.js opens for them in its
// place (assets/product.css hides the first of two blocks). Once the demo is public, everybody gets every release.
const aboutDemo = (e, demo) => e.link?.href === demo.href || /\bdemo\b/i.test([e.title ?? '', ...e.items].join(' '))

// A release with nothing for players: its one line is the one the Deployer writes when its notes weren't for players
// (NEWS_FALLBACK, D:\Projects\Deployer src/projects/siteNews.ts). It shows nowhere and stays in the changelog, so
// "No changes you'll notice" never tops the card.
const quiet = (e) => e.items.length === 1 && e.items[0].trim() === 'Improvements and fixes.'

// The block's entries (testers: every release, when the demo's are kept from everybody else), and what's wrong with
// its file (check-site reports it). A file that is missing or broken shows as no releases, so the page still builds
// and check-site says why. site: the product's page.json site, for its demo.
export function readNews(b, dir, site) {
  const name = b.src ?? 'changelog.json'
  const file = join(root, dir, name)
  if (!existsSync(file)) return { entries: [], testers: null, problems: [`no ${name} for its news block (the Deployer adds each release to it)`] }
  let log
  try {
    log = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    return { entries: [], testers: null, problems: [`${name} isn't valid JSON: ${e.message}`] }
  }
  if (!Array.isArray(log?.entries)) return { entries: [], testers: null, problems: [`${name} has no entries list: { "entries": [...] }`] }
  const problems = []
  log.entries.forEach((e, n) => {
    const at = `${name} entry ${n + 1}${typeof e?.version === 'string' ? ` (${e.version})` : ''}`
    if (typeof e?.version !== 'string' || !e.version.trim()) problems.push(`${at} has no version`)
    if (!isDay(e?.date)) problems.push(`${at}'s date isn't a day as YYYY-MM-DD`)
    if (!Array.isArray(e?.items) || !e.items.length || e.items.some((i) => typeof i !== 'string' || !i.trim())) problems.push(`${at} has no items, or one that isn't a line of text`)
    if (e?.platforms !== undefined && (!Array.isArray(e.platforms) || e.platforms.some((p) => typeof p !== 'string' || !p.trim()))) problems.push(`${at}'s platforms isn't a list of names`)
    if (e?.title !== undefined && (typeof e.title !== 'string' || !e.title.trim())) problems.push(`${at}'s title isn't a line of text`)
    if (e?.link !== undefined && !['href', 'label'].every((k) => typeof e.link?.[k] === 'string' && e.link[k].trim())) problems.push(`${at}'s link isn't { href, label }`)
    if (n && isDay(e?.date) && isDay(log.entries[n - 1]?.date) && e.date > log.entries[n - 1].date) problems.push(`${at} is newer than the one above it: newest first`)
  })
  if (problems.length) return { entries: [], testers: null, problems }
  const all = log.entries.filter((e) => !quiet(e))
  const shown = site?.demo?.private ? all.filter((e) => !aboutDemo(e, site.demo)) : all
  return { entries: shown, testers: shown.length < all.length ? all : null, problems }
}

// What's wrong with the block's empty (check-site reports it): its line, or { title?, text?, link? }.
export function emptyProblems(empty) {
  if (empty === undefined) return []
  if (typeof empty === 'string') return empty.trim() ? [] : ["the news block's empty has no words"]
  if (!empty || typeof empty !== 'object' || Array.isArray(empty)) return ["the news block's empty isn't its line or { title, text, link }"]
  const problems = Object.keys(empty).filter((k) => !['title', 'text', 'link'].includes(k)).map((k) => `the news block's empty has "${k}": it takes title, text and link`)
  for (const k of ['title', 'text']) if (empty[k] !== undefined && (typeof empty[k] !== 'string' || !empty[k].trim())) problems.push(`the news block's empty.${k} isn't a line of text`)
  if (empty.link !== undefined && !['href', 'label'].every((k) => typeof empty.link?.[k] === 'string' && empty.link[k].trim())) problems.push("the news block's empty.link isn't { href, label }")
  return problems
}

const when = (e) => `<time datetime="${esc(e.date)}">${day(e.date)}</time>`
const where = (e) => (e.platforms ?? []).map((p) => `<span class="tag">${esc(p)}</span>`).join('')
const count = (n) => `${n} update${n === 1 ? '' : 's'}`
// An entry's headline: its own, else its first line, cut at a word near 60 characters. Its lines then start at the
// second, unless the first was cut or is all it has. lead: the line under the headline on the card.
function headline(e) {
  if (e.title) return e.title
  const first = e.items[0].replace(/\.$/, '')
  return first.length <= 64 ? first : `${first.slice(0, first.lastIndexOf(' ', 60))}…`
}
const lines = (e) => (e.title || e.items.length < 2 || headline(e).endsWith('…') ? e.items : e.items.slice(1))
const lead = (e) => (e.title ? e.items[0] : (e.items[1] ?? ''))
const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'

// The compact card on the page: the newest update, on a stack of cards. It opens the big card by its id: the script
// flies it out (assets/product.js), and without the script the browser's own command (commandfor) opens it at once.
function card(entries, id) {
  const [e] = entries
  const [, month, n] = e.date.split('-').map(Number)
  return `<button class="news-card" type="button" aria-haspopup="dialog" aria-controls="${id}" commandfor="${id}" command="show-modal">
            <span class="news-stack" aria-hidden="true"></span>
            <span class="news-face">
              <span class="news-stamp" aria-hidden="true"><b>${n}</b>${MONTHS[month - 1]}</span>
              <span class="news-text">
                <span class="news-eyebrow">Latest update · ${when(e)}</span>
                <span class="news-title">${esc(headline(e))}</span>${lead(e) ? `
                <span class="news-lead">${esc(lead(e))}</span>` : ''}
              </span>
              <span class="news-go"><span class="btn">See what's new</span><small>${count(entries.length)}</small></span>
            </span>
          </button>`
}

// An update in the big card: its date, headline and the newest's tag, opening its lines, its link and the small print
// (where it shipped, its version). The newest stands open. The rows are the list's own children, so assets/faq.js
// keeps one open at a time.
const row = (e, i) => `<details class="news-row"${i ? '' : ' open'}><summary>${when(e)}<b>${esc(headline(e))}</b>${i ? '' : '<span class="tag alt">Latest</span>'}${ICONS.chevron}</summary><ul>${lines(e).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>${e.link ? `<a class="news-link" href="${esc(e.link.href)}">${esc(e.link.label)}</a>` : ''}<p class="news-meta">${where(e)}<span class="news-build">Build ${esc(e.version)}</span></p></details>`

// The big card with every update, a modal dialog over the dimmed page (its shade); the close button, Escape or a click
// on the shade closes it.
function sheet(entries, id, name) {
  return `<dialog class="news-dialog" id="${id}" aria-labelledby="${id}-title">
            <div class="news-shade"></div>
            <div class="news-sheet" tabindex="-1">
              <header class="news-head">
                <div>
                  <p class="news-eyebrow">What's new</p>
                  <h3 id="${id}-title">Every update to ${esc(name)}</h3>
                  <p>${count(entries.length)}, newest first</p>
                </div>
                <button class="news-close" type="button" aria-label="Close" commandfor="${id}" command="close">${CLOSE}</button>
              </header>
              <div class="news-body fade-edges">
                <div class="news-list">
                  ${entries.map(row).join('\n                  ')}
                </div>
              </div>
            </div>
          </dialog>`
}

const block = (entries, id, name) => `<div class="news">
          ${card(entries, id)}
          ${sheet(entries, id, name)}
        </div>`

// The card of a product not out yet, in the newest release's place: a calendar with a spark in the product's colour.
const SOON = { title: 'Coming soon', text: 'Nothing here yet: the first release will show here, with every one after it.' }
const EMBLEM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path fill="currentColor" stroke="none" d="M12 11.5l1.1 2.4 2.4 1.1-2.4 1.1L12 18.5l-1.1-2.4L8.5 15l2.4-1.1z"/></svg>'
function soon(empty) {
  const { title, text, link } = { ...SOON, ...(typeof empty === 'string' ? { text: empty } : empty) }
  return `<div class="news single">
          <article class="news-latest news-soon">
            <span class="news-emblem" aria-hidden="true">${EMBLEM}</span>
            <div>
              <h3>${esc(title)}</h3>
              <p>${text}</p>${link ? `
              <a class="news-link" href="${esc(link.href)}">${esc(link.label)}</a>` : ''}
            </div>
          </article>
        </div>`
}

// The block: readNews' { entries, testers }, the page.json block (its empty) and the product's name (page.json
// site.name). The testers' block follows everybody's, in a private template.
export function news({ entries, testers }, { empty } = {}, name) {
  const everybody = entries.length ? block(entries, 'news-all', name) : soon(empty)
  return testers ? `${everybody}
        <template class="private">${block(testers, 'news-all-testers', name)}</template>` : everybody
}
