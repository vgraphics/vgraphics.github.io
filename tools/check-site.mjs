// Checks the site's content rules before a push: node tools/check-site.mjs
// Prints one "path: [rule] message" line per problem and exits 1, or prints "OK: …" and exits 0.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { render } from './build-pages.mjs'
import { sitemap } from './build-sitemap.mjs'
import { pieces, products, subpages } from './lib/product.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// _mockups/ holds local design proposals that are never committed (excluded in .git/info/exclude).
const SKIP = ['.git', '.claude', 'tools', '_mockups', join('exitwise', 'play')]
const TEXT = /\.(html|css|js|mjs|txt|xml|md|json|svg)$/i

const COMPANY = [
  'VGRAPHICS SINGLE MEMBER P.C.', 'private company', 'G.E.MI.', '181823306000', 'ELGEMI.181823306000', 'EL802736373',
  'Kalamaria', 'Thessaloniki', '22/01/2025', 'https://publicity.businessportal.gr/company/181823306000',
  'gvergidis90@gmail.com',
]
// The site is in English (George, 22 Oct 2026): no Greek letters on a page in English, nor in the SVG pictures the pages
// show. The Greek names belong in the Greek store listings. GREEK_OK lists, by page path, any text that must legally stay
// in Greek; none so far.
const GREEK = /\p{Script=Greek}/u
const GREEK_OK = {}
const ADMOB = 'google.com, pub-7821189101210154, DIRECT, f08c47fec0942fa0'

const problems = []
const report = (file, rule, message) => problems.push(`${file}: [${rule}] ${message}`)

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    const rel = relative(root, full)
    if (SKIP.some((s) => rel === s || rel.startsWith(s + sep))) return []
    return statSync(full).isDirectory() ? walk(full) : [rel]
  })
}

const files = walk(root)
// A product's demo (<product>/demo/*.html), and the markup and policy copies its page.json blocks name, are pieces
// tools/build-pages.mjs sets into its pages, not pages.
const PARTIAL = /^[^\\/]+[\\/]demo[\\/][^\\/]+\.html$/
const PIECES = new Set(pieces())
const pages = files.filter((f) => f.endsWith('.html') && !PARTIAL.test(f) && !PIECES.has(f))
const urlPath = (f) => '/' + f.split(sep).join('/').replace(/(^|\/)index\.html$/, '$1')
let links = 0

for (const file of files.filter((f) => TEXT.test(f))) {
  const text = readFileSync(join(root, file), 'utf8')
  if (/\.(html|txt|xml)$/.test(file) && text.includes('vgraphics.github.io')) report(file, 'old-domain', 'mentions vgraphics.github.io')
  if (/6955395543|695 539 5543/.test(text)) report(file, 'no-phone', 'contains the phone number')
  if (/kafkasou|καυκ[άα]σου/i.test(text)) report(file, 'no-street', 'contains the street address')
  if (file.endsWith('.svg') && GREEK.test(text)) report(file, 'english', 'Greek letters in a picture the English pages show')
}

for (const file of pages) {
  const html = readFileSync(join(root, file), 'utf8')

  for (const s of ['VGRAPHICS SINGLE MEMBER P.C.', 'G.E.MI. no. 181823306000', 'VAT no. EL802736373']) {
    if (!html.includes(s)) report(file, 'legal-footer', `missing "${s}"`)
  }
  if (!/href="\/company\/"/.test(html)) report(file, 'legal-footer', 'no link to /company/')
  // The site's privacy policy: Google's OAuth consent screen (VGraphics Deployer) and AdSense look for it.
  if (!/href="\/privacy\/"/.test(html)) report(file, 'legal-footer', 'no link to /privacy/')

  if (!/<html[^>]*\slang="[^"]+"/.test(html)) report(file, 'head', 'no <html lang>')
  if (!/<meta name="viewport"/.test(html)) report(file, 'head', 'no viewport meta')
  if (!/<title>[^<\s][^<]*<\/title>/.test(html)) report(file, 'head', 'empty or missing <title>')
  if (file !== '404.html') {
    const want = `https://vgraphics.gr${urlPath(file)}`
    const got = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]
    if (got !== want) report(file, 'head', `canonical is ${got ?? 'missing'}, want ${want}`)
  }
  // Structured data for search results (JSON-LD): a block that isn't valid JSON is silently ignored by search engines.
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json)
    } catch (e) {
      report(file, 'json-ld', `structured data isn't valid JSON: ${e.message}`)
    }
  }

  if (/<html[^>]*\slang="en"/.test(html)) {
    const text = (GREEK_OK[urlPath(file)] ?? []).reduce((t, s) => t.replaceAll(s, ''), html)
    const at = text.search(GREEK)
    if (at >= 0) report(file, 'english', `Greek letters on an English page: "${text.slice(Math.max(0, at - 30), at + 30).replace(/\s+/g, ' ').trim()}"`)
  }

  if (/<script[^>]+src="https?:/i.test(html)) report(file, 'no-trackers', 'loads a third-party script')
  for (const t of ['fonts.googleapis.com', 'fonts.gstatic.com', 'googletagmanager', 'gtag(']) {
    if (html.includes(t)) report(file, 'no-trackers', `contains ${t}`)
  }

  for (const [, ref] of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    if (!ref || /^(#|\/\/|[a-z]+:)/i.test(ref)) continue
    links++
    const clean = decodeURIComponent(ref.replace(/[?#].*$/, ''))
    if (!clean) continue
    let target = clean.startsWith('/') ? join(root, clean) : join(root, dirname(file), clean)
    if (clean.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) target = join(target, 'index.html')
    if (!existsSync(target)) report(file, 'links', `broken link ${ref}`)
  }
}

// The company pages (every page on /assets/vgraphics.css) share the home page's header and footer, word for word.
// Only aria-current may differ, and it may only mark the page's own menu item.
const chrome = (html) => ({
  head: html.match(/<header class="site-head">[\s\S]*?<\/header>/)?.[0],
  foot: html.match(/<footer class="site-foot">[\s\S]*?<\/footer>/)?.[0],
})
const plain = (s) => s?.replace(/ aria-current="page"/g, '').replace(/\s+/g, ' ')
const homeHtml = readFileSync(join(root, 'index.html'), 'utf8')
// Google Search Console's proof of ownership (README, "Search engines"): without it the site loses its verification.
if (!/<meta name="google-site-verification" content="[^"]+">/.test(homeHtml)) report('index.html', 'search-console', 'no google-site-verification meta tag')
const home = chrome(homeHtml)
for (const menu of ['/games/', '/apps/', '/services/', '/hub/']) {
  if (!home.head?.includes(`href="${menu}"`)) report('index.html', 'menu', `the header has no link to ${menu}`)
}
for (const file of pages) {
  const html = readFileSync(join(root, file), 'utf8')
  if (!html.includes('href="/assets/vgraphics.css"')) continue
  const { head, foot } = chrome(html)
  if (plain(head) !== plain(home.head)) report(file, 'menu', "header differs from the home page's")
  if (plain(foot) !== plain(home.foot)) report(file, 'menu', "footer differs from the home page's")
  for (const [tag] of (head ?? '').matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)) {
    const href = tag.match(/href="([^"]*)"/)?.[1]
    if (href !== urlPath(file)) report(file, 'menu', `marks ${href} as the current page`)
  }
}

// Product landing pages come from one template (George, 22 Oct 2026: "the same layouts with different content and
// graphic"): each is exactly what tools/build-pages.mjs writes from its page.json and theme pack, and every product (a
// folder with its own privacy policy) has one. So are a product's other pages with a page.json (exitwise/ranking).
for (const slug of products()) {
  const { html, css, problems: pack } = render(slug)
  for (const m of pack) report(join(slug, 'theme', 'theme.json'), 'template', m)
  const made = [[join(slug, 'index.html'), html], [join(slug, 'theme', 'theme.css'), css]]
  for (const sub of subpages(slug)) {
    try {
      const page = render(slug, sub)
      made.push([page.file, page.html])
    } catch (e) {
      report(join(slug, sub, 'page.json'), 'template', e.message)
    }
  }
  for (const [file, want] of made) {
    const have = existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n') : null
    if (have !== want) report(file, 'template', 'not as tools/build-pages.mjs writes it: edit page.json or the theme pack, then run it')
  }
}
for (const dir of readdirSync(root)) {
  if (SKIP.includes(dir) || !existsSync(join(root, dir, 'privacy.html'))) continue
  if (!existsSync(join(root, dir, 'page.json'))) report(join(dir, 'index.html'), 'template', 'made by hand: every product page comes from tools/build-pages.mjs (give it a page.json and a theme pack)')
}

// url(...) in stylesheets and <style> blocks: self-hosted fonts and images must exist.
for (const file of files.filter((f) => /\.(css|html)$/.test(f))) {
  const text = readFileSync(join(root, file), 'utf8')
  const css = file.endsWith('.css') ? text : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
  for (const [, raw] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^(data:|[a-z]+:|#)/i.test(raw)) continue
    links++
    const clean = raw.replace(/[?#].*$/, '')
    const target = clean.startsWith('/') ? join(root, clean) : join(root, dirname(file), clean)
    if (!existsSync(target)) report(file, 'css-urls', `missing ${raw}`)
  }
}

const company = join(root, 'company', 'index.html')
if (!existsSync(company)) report('company/index.html', 'company', 'missing')
else {
  const html = readFileSync(company, 'utf8')
  for (const s of COMPANY) if (!html.includes(s)) report('company/index.html', 'company', `missing "${s}"`)
}

// sitemap.xml lists every page search engines may index, at its canonical address, exactly as tools/build-sitemap.mjs
// writes it; robots.txt points to it and blocks nothing.
const sitemapFile = join(root, 'sitemap.xml')
if (!existsSync(sitemapFile)) report('sitemap.xml', 'sitemap', 'missing: run node tools/build-sitemap.mjs')
else {
  const want = sitemap()
  const have = readFileSync(sitemapFile, 'utf8').replace(/\r\n/g, '\n')
  const locs = (text) => new Set([...text.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]))
  const [w, h] = [locs(want), locs(have)]
  for (const u of w) if (!h.has(u)) report('sitemap.xml', 'sitemap', `doesn't list ${u}: run node tools/build-sitemap.mjs`)
  for (const u of h) if (!w.has(u)) report('sitemap.xml', 'sitemap', `lists ${u}, which isn't a page to index: run node tools/build-sitemap.mjs`)
  if (have !== want && [...w].every((u) => h.has(u)) && w.size === h.size) report('sitemap.xml', 'sitemap', 'not as tools/build-sitemap.mjs writes it: run it')
}
const robots = join(root, 'robots.txt')
if (!existsSync(robots)) report('robots.txt', 'robots', 'missing')
else {
  const text = readFileSync(robots, 'utf8')
  if (!/^Sitemap: https:\/\/vgraphics\.gr\/sitemap\.xml\s*$/m.test(text)) report('robots.txt', 'robots', 'no "Sitemap: https://vgraphics.gr/sitemap.xml" line')
  if (/^Disallow:\s*\/\s*$/m.test(text)) report('robots.txt', 'robots', 'blocks the whole site')
}

const cname = join(root, 'CNAME')
if (existsSync(cname) && readFileSync(cname, 'utf8').trim() !== 'vgraphics.gr') report('CNAME', 'cname', 'is not exactly vgraphics.gr')

const appAds = join(root, 'app-ads.txt')
if (!existsSync(appAds)) report('app-ads.txt', 'app-ads', 'missing')
else {
  const lines = readFileSync(appAds, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  for (const l of lines) {
    // IAB variable lines (OWNERDOMAIN=…) are allowed; seller account ids may hold underscores (pub_11113).
    if (/^(OWNERDOMAIN|MANAGERDOMAIN|CONTACT|SUBDOMAIN|INVENTORYPARTNERDOMAIN)=\S+$/.test(l)) continue
    if (!/^[a-z0-9.-]+, [A-Za-z0-9_-]+, (DIRECT|RESELLER)(, [a-z0-9]+)?$/.test(l)) report('app-ads.txt', 'app-ads', `bad line "${l}"`)
  }
  if (!lines.includes(ADMOB)) report('app-ads.txt', 'app-ads', 'no AdMob line')
}

// ads.txt: the sellers of the ads on vgraphics.gr itself (AdSense), apart from the apps' app-ads.txt.
const adsTxt = join(root, 'ads.txt')
const sellers = existsSync(adsTxt) ? readFileSync(adsTxt, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : []
if (!existsSync(adsTxt)) report('ads.txt', 'ads-txt', 'missing')
for (const l of sellers) {
  if (/^(OWNERDOMAIN|MANAGERDOMAIN|CONTACT|SUBDOMAIN|INVENTORYPARTNERDOMAIN)=\S+$/.test(l)) continue
  if (!/^[a-z0-9.-]+, [A-Za-z0-9_-]+, (DIRECT|RESELLER)(, [a-z0-9]+)?$/.test(l)) report('ads.txt', 'ads-txt', `bad line "${l}"`)
}

// assets/web-ads.js: the ad switch every web game's play page loads before it decides about ads (README, "Ads on the
// web games"). Run as a browser runs it, it must define these settings and no others, well formed, nothing switched on
// without a publisher id, that publisher in ads.txt, and an entry for every game with a play page (<game>/play/).
const WEB_ADS = join('assets', 'web-ads.js')
const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
if (!existsSync(join(root, WEB_ADS))) report(WEB_ADS, 'web-ads', 'missing')
else {
  const page = {}
  page.window = page
  let ran = true
  try {
    runInNewContext(readFileSync(join(root, WEB_ADS), 'utf8'), page, { timeout: 1000 })
  } catch (e) {
    ran = false
    report(WEB_ADS, 'web-ads', `doesn't run: ${e.message}`)
  }
  const ads = page.VGRAPHICS_WEB_ADS
  // A file that doesn't run is reported once, above.
  if (ran && !isObject(ads)) report(WEB_ADS, 'web-ads', 'defines no window.VGRAPHICS_WEB_ADS object')
  else if (ran) {
    for (const k of Object.keys(ads)) {
      if (!['client', 'banners', 'gameAds', 'games'].includes(k)) report(WEB_ADS, 'web-ads', `unknown setting "${k}" (the settings are client, banners, gameAds and games)`)
    }
    const client = typeof ads.client === 'string' && /^ca-pub-\d{16}$/.test(ads.client) ? ads.client : null
    if (ads.client !== null && !client) report(WEB_ADS, 'web-ads', 'client is not null or a publisher id ("ca-pub-" and 16 digits)')
    for (const k of ['banners', 'gameAds']) if (typeof ads[k] !== 'boolean') report(WEB_ADS, 'web-ads', `${k} is not true or false`)
    if ((ads.banners === true || ads.gameAds === true) && !client) report(WEB_ADS, 'web-ads', 'ads are switched on without a publisher id (client)')
    if (client && !sellers.includes(`google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`)) {
      report('ads.txt', 'ads-txt', `no line for ${client}, the publisher in ${WEB_ADS}`)
    }
    const games = isObject(ads.games) ? ads.games : {}
    if (!isObject(ads.games)) report(WEB_ADS, 'web-ads', 'games is not an object with an entry per game')
    for (const [id, game] of Object.entries(games)) {
      if (!/^[a-z0-9-]+$/.test(id)) report(WEB_ADS, 'web-ads', `game "${id}": names are lower-case letters, digits and dashes`)
      if (!isObject(game)) {
        report(WEB_ADS, 'web-ads', `games.${id} is not { bannerSlot }`)
        continue
      }
      for (const k of Object.keys(game)) if (k !== 'bannerSlot') report(WEB_ADS, 'web-ads', `games.${id}: unknown setting "${k}" (a game has only bannerSlot)`)
      if (game.bannerSlot !== null && !(typeof game.bannerSlot === 'string' && /^\d{6,}$/.test(game.bannerSlot))) {
        report(WEB_ADS, 'web-ads', `games.${id}.bannerSlot is not null or an ad unit's data-ad-slot (digits, in quotes)`)
      }
    }
    for (const dir of readdirSync(root)) {
      if (SKIP.includes(dir)) continue
      if (existsSync(join(root, dir, 'play', 'index.html')) && !Object.hasOwn(games, dir)) report(WEB_ADS, 'web-ads', `no entry for ${dir}, which has a play page (${dir}/play/)`)
    }
  }
}

if (problems.length) {
  console.log(problems.join('\n'))
  console.log(`${problems.length} problem(s)`)
  process.exit(1)
}
console.log(`OK: ${pages.length} pages, ${links} links checked`)
