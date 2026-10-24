// Checks the site's content rules before a push: node tools/check-site.mjs
// Prints one "path: [rule] message" line per problem and exits 1, or prints "OK: …" and exits 0.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { render } from './build-pages.mjs'
import { sitemap } from './build-sitemap.mjs'
import { hotspot } from './lib/cursors.mjs'
import { documents, pieces, products, subpages } from './lib/product.mjs'

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

// The phone menu on every header (George, 24 Oct 2026: "at hub vgraphics page, the toolbar menu is not burger as other
// pages. Find all instances."). This looks at every HTML file GitHub Pages serves, whoever writes it (this repo, the
// template, the Deployer's hub/ and play pages): the files git tracks or would add, so only what git ignores
// (_mockups/, .claude/worktrees/) is left out.
// - The company header (class "site-head", with the nav.site-nav whose button /assets/menu.js adds) and a product's
//   (class "top", from tools/lib/partials.mjs, with the menu-toggle button and the nav it opens) come on a page that
//   loads /assets/menu.js and the header's stylesheet.
// - Any other <header> holding a menu (a <nav>, or two links or more) fails: it is one made by hand, without the phone
//   menu. A header with no menu (a logo and a language button, as the party games' doors have) has nothing to fold.
// - A <nav> outside <main>, the footers and the headers is a menu of its own, without the phone menu, and fails.
// - A document's source (a page.json "document" block: a policy another repo owns, which the template sets into its
//   page) is the text alone: one <main>, no header, menu or footer of its own, kept out of search (noindex) and pointing
//   to its page (canonical).
// Nothing is exempt: a page another repo writes (VHub's hub/, since vhub-hub shipped VHub 880438d on 24 Oct 2026) fails
// like any other until that repo brings the menu.
const MENU_JS = '<script src="/assets/menu.js" defer></script>'
const served = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.html'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter((f) => f && existsSync(join(root, f)))
const sources = new Map(documents().map((d) => [d.file.split(sep).join('/'), d.url]))
const burger = (file, message) => report(file, 'burger', message)
for (const file of served) {
  const html = readFileSync(join(root, file), 'utf8')
  if (sources.has(file)) {
    const want = sources.get(file)
    const got = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]
    if (html.match(/<main\b/g)?.length !== 1) report(file, 'source', 'needs exactly one <main> (the template sets in everything from the first to the last), not even in a comment')
    if (/<(header|nav|footer)\b/.test(html.replace(/<main\b[^>]*>[\s\S]*<\/main>/, ''))) report(file, 'source', "has a header, menu or footer of its own: keep only the text, in <main> (the site's template adds the rest)")
    if (!html.includes('<meta name="robots" content="noindex">')) report(file, 'source', 'not kept out of search: add <meta name="robots" content="noindex">')
    if (got !== want) report(file, 'source', `canonical is ${got ?? 'missing'}, want ${want}, the page it is set into`)
    continue
  }
  let ours = 0
  for (const [, attrs, inner] of html.matchAll(/<header\b([^>]*)>([\s\S]*?)<\/header>/g)) {
    const cls = attrs.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) ?? []
    if (cls.includes('site-head')) {
      ours++
      if (!/<nav\b[^>]*class="site-nav"/.test(inner)) burger(file, 'has a company header without the nav.site-nav that /assets/menu.js folds')
      if (!html.includes('href="/assets/vgraphics.css"')) burger(file, 'has the company header without /assets/vgraphics.css, which draws its phone menu')
    } else if (cls.includes('top')) {
      ours++
      const id = inner.match(/<button class="menu-toggle"[^>]*aria-controls="([^"]+)"/)?.[1]
      if (!id || !inner.includes(`id="${id}"`)) burger(file, 'has a product header without the menu-toggle button for its nav (tools/lib/partials.mjs writes both)')
      if (!html.includes('href="/assets/product.css"')) burger(file, 'has a product header without /assets/product.css, which draws its phone menu')
    } else if (/<nav\b/.test(inner) || (inner.match(/<a\b[^>]*\shref=/g)?.length ?? 0) >= 2) {
      burger(file, `has <header${attrs}> with a menu, neither the company header nor a product's, so no phone menu: make the page with the template (tools/build-pages.mjs) or give it the company header`)
    }
  }
  if (ours && !html.includes(MENU_JS)) burger(file, `does not load /assets/menu.js, the phone menu (${MENU_JS})`)
  const rest = html.replace(/<(main|footer|header)\b[^>]*>[\s\S]*?<\/\1>/g, '')
  if (/<nav\b/.test(rest)) burger(file, 'has a <nav> outside <main>, the footer and the company or product header: a menu with no phone menu')
}

// The cursors (George, 24 Oct 2026: "Can we get custom cursors on each landing page?"), on every page GitHub Pages
// serves, whoever writes it, as the phone menu above: each links /assets/cursors.css, which shows its product's (or
// VGraphics') pointer, hand and text cursor (tools/lib/cursors.mjs); no stylesheet or <style> sets the system's own
// pointer, text or default cursor in their place (they use var(--cursor-link, pointer) and the like); and every
// cursor picture a stylesheet names has its click point where the picture's data-hotspot says. The pieces the template
// sets into pages (a demo, an embed's markup, a policy's source) are not pages.
const cursor = (file, message) => report(file, 'cursors', message)
const SYSTEM = { pointer: 'var(--cursor-link, pointer)', text: 'var(--cursor-text, text)', default: 'var(--cursor, default)' }
const notPages = new Set([...pieces(), ...sources.keys()].map((f) => f.split(sep).join('/')))
const styles = (html) => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>|\sstyle="([^"]*)"/g)].map((m) => m[1] ?? m[2]).join('\n')
const sheets = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.css'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter((f) => f && existsSync(join(root, f))).map((f) => [f, readFileSync(join(root, f), 'utf8')])
for (const file of served) {
  if (notPages.has(file) || PARTIAL.test(file)) continue
  const html = readFileSync(join(root, file), 'utf8')
  if (!/<link rel="stylesheet" href="\/assets\/cursors\.css"/.test(html)) cursor(file, 'does not link /assets/cursors.css, which shows the cursors')
  sheets.push([file, styles(html)])
}
for (const [file, text] of sheets) {
  for (const [, kind] of text.matchAll(/(?<![-\w])cursor:\s*(pointer|text|default)\b/g)) cursor(file, `sets cursor: ${kind}, the system's own: use ${SYSTEM[kind]}`)
  for (const [, name, url, x, y] of text.matchAll(/--(cursor(?:-link|-text)?):\s*url\(\s*"([^"]+)"\s*\)\s+(\d+)\s+(\d+)/g)) {
    const picture = join(root, url.replace(/^\//, ''))
    if (!url.startsWith('/') || !existsSync(picture)) continue // a missing one is reported under css-urls
    const at = hotspot(readFileSync(picture, 'utf8'))
    if (typeof at === 'string') cursor(file, `--${name}'s ${url} ${at}`)
    else if (at.join(' ') !== `${x} ${y}`) cursor(file, `--${name} clicks at ${x} ${y}, but ${url}'s data-hotspot is ${at.join(' ')}`)
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
  // hub/ is VHub's web app, an app page only the Deployer's vhub-hub writes (README, "The app pages"), not a product
  // landing page: its privacy.html is VHub's policy, which comes with each release, and it has no page.json.
  if (SKIP.includes(dir) || dir === 'hub' || !existsSync(join(root, dir, 'privacy.html'))) continue
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
