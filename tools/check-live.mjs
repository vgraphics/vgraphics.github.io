#!/usr/bin/env node
// What Google reads on the live site (Search Console, 12 Nov 2026: the "new reasons" email of the Domain property
// sc-domain:vgraphics.gr, which counts http:// and www. addresses too). QA runs it after every release of the site:
//
//   node tools/check-live.mjs [--base https://vgraphics.gr]
//
// - every address in /sitemap.xml answers 200 itself (no redirect), names itself as its canonical, and is not noindex
//   (meta robots or X-Robots-Tag);
// - every same-site href and src on those pages answers 200: not a redirect, not a 4xx;
// - http://, www. and http://www. of / and of a deep page are exactly one 301 to the https:// bare address;
// - each old address Google still asks for (the WordPress ones, two old key-art pictures) is exactly one 301 to its page,
//   and a folder with no page answers 404 (not the 403 of Options -Indexes).
//
// Hostinger's CDN rate-limits: at most 4 requests at a time, and a 429 is retried after a pause. It prints a short table
// and exits 1 when anything fails. It only reads: it never changes the site.

import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const at = args.indexOf('--base')
const base = (at >= 0 && args[at + 1] ? args[at + 1] : 'https://vgraphics.gr').replace(/\/$/, '')
const host = new URL(base).host
const AGENT = 'vgraphics-check-live/1 (+https://vgraphics.gr/)'

/** Old addresses and the one 301 each must be (.htaccess, tools/lib/htaccess.mjs). */
export const OLD_ADDRESSES = [
  ['/index.php', '/'],
  ['/index.php/', '/'],
  ['/index.php/contact/', '/#contact'],
  ['/index.php/contact/index.html', '/#contact'],
  ['/index.php/about-2/', '/company/'],
  ['/index.php/about-2/index.html', '/company/'],
  ['/index.php/category/news/', '/'],
  ['/index.php/feed/', '/'],
  ['/speedometer-wallpaper/img/key-art', '/speedometer-wallpaper/img/key-art-1920.jpg'],
  ['/speedometer-wallpaper/img/key-art-tall', '/speedometer-wallpaper/img/key-art-tall-1080.jpg'],
]

/** Folders with no page of their own: a plain 404. */
export const NO_PAGE_FOLDERS = ['/assets/startup/', '/speedometer-wallpaper/play/app/', '/party-doors/', '/vg--palermo-play/']

// At most 4 requests at a time.
let running = 0
const waiting = []
const slot = () => (running < 4 ? (running++, Promise.resolve()) : new Promise((r) => waiting.push(r)))
const free = () => (waiting.length ? waiting.shift()() : running--)
const pause = (ms) => new Promise((r) => setTimeout(r, ms))

/** One request, redirects not followed: { status, location, headers, text }. A 429 or a dropped connection is tried
 * again, up to 5 times, after the server's Retry-After or a growing pause. */
async function ask(url, { body = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    await slot()
    let answer
    try {
      const r = await fetch(url, { method: body ? 'GET' : 'HEAD', redirect: 'manual', headers: { 'user-agent': AGENT }, signal: AbortSignal.timeout(30_000) })
      answer = { status: r.status, location: r.headers.get('location') ?? '', headers: r.headers, text: body ? await r.text() : '' }
    } catch (e) {
      answer = { status: 0, location: '', headers: new Headers(), text: '', error: e.cause?.code ?? e.message }
    } finally {
      free()
    }
    // A server that won't answer HEAD gets the GET.
    if (!body && (answer.status === 405 || answer.status === 501)) return ask(url, { body: true })
    if ((answer.status === 429 || answer.status === 0 || answer.status >= 500) && attempt < 5) {
      const after = Number(answer.headers.get('retry-after'))
      await pause(Number.isFinite(after) && after > 0 ? Math.min(after, 30) * 1000 : 1000 * 2 ** attempt)
      continue
    }
    return answer
  }
}

const said = (a) => (a.status ? `${a.status}${a.location ? ` -> ${a.location}` : ''}` : a.error || 'no answer')
const absolute = (to, from) => {
  try {
    return new URL(to, from).href
  } catch {
    return to
  }
}

const rows = []
const row = (check, url, ok, result) => rows.push({ check, url: url.replace(base, '') || '/', ok, result })

/** Exactly one 301 from `from` to `to` (both absolute). */
async function oneHop(check, from, to) {
  const a = await ask(from)
  if (a.status !== 301) return row(check, from, false, `${said(a)}, want one 301 to ${to}`)
  const got = absolute(a.location, from)
  if (got !== to) return row(check, from, false, `301 -> ${got}, want ${to}`)
  // The address it lands on is a page (no second hop). A #fragment is the browser's, never sent.
  const end = await ask(to.replace(/#.*$/, ''))
  row(check, from, end.status === 200, end.status === 200 ? `301 -> ${a.location}` : `301 -> ${a.location}, which answers ${said(end)}`)
}

const main = async () => {
  const map = await ask(`${base}/sitemap.xml`, { body: true })
  if (map.status !== 200) {
    console.error(`${base}/sitemap.xml answers ${said(map)}`)
    process.exit(1)
  }
  const pages = [...map.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))

  // The sitemap's pages: 200, self-canonical, indexable; and the same-site links on them.
  const links = new Map()
  await Promise.all(
    pages.map(async (url) => {
      const a = await ask(url, { body: true })
      if (a.status !== 200) return row('sitemap page', url, false, `${said(a)}, want 200`)
      const problems = []
      const canonical = a.text.match(/<link\b[^>]*\brel="canonical"[^>]*>/i)?.[0].match(/\bhref="([^"]*)"/i)?.[1]
      if (canonical !== url) problems.push(`canonical ${canonical ?? 'missing'}`)
      const robots = [...a.text.matchAll(/<meta\b[^>]*\bname="robots"[^>]*>/gi)].map((m) => m[0].match(/\bcontent="([^"]*)"/i)?.[1] ?? '').join(',')
      if (/noindex/i.test(robots)) problems.push(`meta robots ${robots}`)
      if (/noindex/i.test(a.headers.get('x-robots-tag') ?? '')) problems.push(`X-Robots-Tag ${a.headers.get('x-robots-tag')}`)
      row('sitemap page', url, !problems.length, problems.join('; ') || '200, self-canonical, indexable')
      for (const [, ref] of a.text.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
        const raw = ref.replace(/&amp;/g, '&')
        if (!raw || /^(#|mailto:|tel:|data:|javascript:|blob:)/i.test(raw)) continue
        let to
        try {
          to = new URL(raw, url)
        } catch {
          continue
        }
        if (to.host !== host || !/^https?:$/.test(to.protocol)) continue
        to.hash = ''
        if (!links.has(to.href)) links.set(to.href, url)
      }
    }),
  )
  await Promise.all(
    [...links].map(async ([to, from]) => {
      const a = await ask(to)
      if (a.status !== 200) row('link', to, false, `${said(a)}, want 200 (on ${from.replace(base, '') || '/'})`)
    }),
  )
  const linkFailures = rows.filter((r) => r.check === 'link').length
  row('links', `${links.size} same-site links`, linkFailures === 0, linkFailures ? `${linkFailures} not 200` : 'all 200')

  // http://, www. and http://www. in one hop, for / and one deep page.
  const deep = new URL(pages.map((p) => new URL(p)).filter((u) => u.host === host).sort((a, b) => b.pathname.split('/').length - a.pathname.split('/').length)[0]?.href ?? `${base}/company/`)
  for (const path of ['/', deep.pathname]) {
    const to = `https://${host}${path}`
    for (const from of [`http://${host}${path}`, `https://www.${host}${path}`, `http://www.${host}${path}`]) await oneHop('one hop', from, to)
  }

  // Old addresses: one 301 each. Folders with no page: 404.
  await Promise.all(OLD_ADDRESSES.map(([from, to]) => oneHop('old address', `${base}${from}`, `${base}${to}`)))
  await Promise.all(
    NO_PAGE_FOLDERS.map(async (path) => {
      const a = await ask(`${base}${path}`)
      row('no-page folder', `${base}${path}`, a.status === 404, a.status === 404 ? '404' : `${said(a)}, want 404`)
    }),
  )

  // The table: every failure, and one line per kind of check.
  const kinds = [...new Set(rows.map((r) => r.check))]
  const failed = rows.filter((r) => !r.ok)
  const width = Math.max(...rows.map((r) => r.check.length))
  console.log(`check-live ${base}: ${pages.length} sitemap pages, ${links.size} same-site links\n`)
  for (const k of kinds) {
    const all = rows.filter((r) => r.check === k && !(k === 'link' && r.ok))
    if (!all.length) continue
    const bad = all.filter((r) => !r.ok).length
    console.log(`${bad ? 'FAIL' : 'ok  '} ${k.padEnd(width)} ${all.length - bad}/${all.length}`)
  }
  for (const r of rows.filter((r) => r.check === 'one hop' || r.check === 'old address' || r.check === 'no-page folder' || !r.ok)) {
    console.log(`  ${r.ok ? 'ok  ' : 'FAIL'} ${r.check.padEnd(width)} ${r.url}  ${r.result}`)
  }
  console.log(failed.length ? `\n${failed.length} failed` : '\nall clean')
  process.exit(failed.length ? 1 : 0)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main()
