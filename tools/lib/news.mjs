// "What's new" on every product's landing page (George, 25 Oct 2026: "This apply as global rule. All landing pages
// must have it."; D:\Projects\Mine\CLAUDE.md): the template's "news" block, fed by the product's changelog, which the
// Deployer adds to on every release players get (D:\Projects\Deployer, src/projects/siteNews.ts). The newest release
// stands open in a card; the ones before it are a list beside it, each row opening its own lines. A long list scrolls
// in its own box (D:\Projects\Mine\CLAUDE.md, "Long lists scroll in their own box"): three and a half rows show, its
// edges fade (assets/fade-edges.js) and its scrollbar is in the product's colour (assets/product.css, .news).
//
// The changelog is <product>/changelog.json (the block's src names another file in the page's folder):
//   { "entries": [{ version, date, platforms?, title?, items, link?, commit? }] }, newest first
//   version     what the release calls itself: "1.0.17", or a web build's "1.0.4f5d9766"
//   date        the day it reached players, YYYY-MM-DD
//   platforms   where it shipped: "Android", "Web"
//   title       its headline in one line ("17 new styles"), shown in place of "Version 1.0.17", which then joins the
//               date; written by hand (Speedometer's reading, Games docs/superpowers/specs/2026-10-26-speedometer-web-
//               market-design.md §7: a headline and at most three short lines)
//   items       its notes for players, plain text (the template escapes them), a line each
//   link        { href, label }: where to see it (a new style's page, the try page), under its lines
//   commit      the commit it was built from (the Deployer's): a web build of the same commit joins the store's entry
// An empty list is a product not out yet: the block says so in its words (the block's empty), or in the default ones.
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

// The block's entries, and what's wrong with its file (check-site reports it). A file that is missing or broken shows
// as no releases, so the page still builds and check-site says why.
export function readNews(b, dir) {
  const name = b.src ?? 'changelog.json'
  const file = join(root, dir, name)
  if (!existsSync(file)) return { entries: [], problems: [`no ${name} for its news block (the Deployer adds each release to it)`] }
  let log
  try {
    log = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    return { entries: [], problems: [`${name} isn't valid JSON: ${e.message}`] }
  }
  if (!Array.isArray(log?.entries)) return { entries: [], problems: [`${name} has no entries list: { "entries": [...] }`] }
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
  return { entries: problems.length ? [] : log.entries, problems }
}

const when = (e) => `<time datetime="${esc(e.date)}">${day(e.date)}</time>`
const where = (e) => (e.platforms ?? []).map((p) => `<span class="tag">${esc(p)}</span>`).join('')
// An entry's name: its headline, else its version. With a headline, the version stands beside the date.
const heading = (e) => esc(e.title ?? `Version ${e.version}`)
const version = (e) => (e.title ? `<span>Version ${esc(e.version)}</span>` : '')
const lines = (e) => `<ul>${e.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>${e.link ? `<a class="news-link" href="${esc(e.link.href)}">${esc(e.link.label)}</a>` : ''}`

export function news(entries, { empty } = {}) {
  if (!entries.length) return `<p class="news-empty">${empty ?? 'Nothing here yet: the first release will show here, with every one after it.'}</p>`
  const [latest, ...older] = entries
  return `<div class="news${older.length ? '' : ' single'}">
          <article class="news-latest">
            <p class="news-meta"><span class="tag alt">Latest</span>${version(latest)}${when(latest)}${where(latest)}</p>
            <h3>${heading(latest)}</h3>
            ${lines(latest)}
          </article>${older.length ? `
          <div class="news-older">
            <h3>Earlier updates</h3>
            <ol class="news-list fade-edges">
              ${older.map((e) => `<li><details><summary><b>${heading(e)}</b>${when(e)}${ICONS.chevron}</summary>${e.title || e.platforms?.length ? `<p class="news-meta">${version(e)}${where(e)}</p>` : ''}${lines(e)}</details></li>`).join('\n              ')}
            </ol>
          </div>` : ''}
        </div>`
}
