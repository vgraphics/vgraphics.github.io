// Checks the site's content rules before a push: node tools/check-site.mjs
// Prints one "path: [rule] message" line per problem and exits 1, or prints "OK: …" and exits 0.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { render } from './build-pages.mjs'
import { sitemap } from './build-sitemap.mjs'
import { styleSources, strayStylePages } from './make-style-pages.mjs'
import { hotspot } from './lib/cursors.mjs'
import { documents, loadProduct, pieces, products, subpages } from './lib/product.mjs'
import { imageSize } from './lib/image-size.mjs'
import { readFaq } from './lib/faq.mjs'
import { emptyProblems, readNews } from './lib/news.mjs'

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

// The play or try button (George, 26 Oct 2026: "For all landing pages, when there is a play online/test online, make it
// a fancy primary button last on the toolbar buttons."), on every page GitHub Pages serves, as the phone menu above. A
// product whose folder has a play page (<product>/play/: Exitwise's game, Speedometer's try page) names it in its
// page.json, site.play { label, href }; then every product header in its folder ends with that link as the button
// (class "play", tools/lib/partials.mjs), inside the menu the phone panel opens, and has no other. A product without
// site.play has no button.
const playButton = (file, message) => report(file, 'play-button', message)
const isPlay = (attrs) => /\sclass="(?:[^"]*\s)?play(?:\s[^"]*)?"/.test(attrs)
const plays = new Map(products().map((slug) => [slug, loadProduct(slug).page.site.play]))
for (const [slug, play] of plays) {
  const file = join(slug, 'page.json')
  if (existsSync(join(root, slug, 'play', 'index.html')) && !play) playButton(file, `${slug} has a play page (/${slug}/play/) but no site.play { label, href }: every header of the product ends with it, as a button`)
  if (play && !(typeof play.label === 'string' && play.label.trim() && typeof play.href === 'string' && play.href.startsWith('/'))) playButton(file, 'site.play is not { label, href }, with the words on the button and an address on this site')
}
for (const file of served) {
  const slug = file.split('/')[0]
  if (!plays.has(slug)) continue
  const play = plays.get(slug)
  const html = readFileSync(join(root, file), 'utf8')
  for (const [, attrs, inner] of html.matchAll(/<header\b([^>]*)>([\s\S]*?)<\/header>/g)) {
    if (!(attrs.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) ?? []).includes('top')) continue
    const links = [...inner.matchAll(/<a\b([^>]*)>/g)].map((m) => m[1])
    const buttons = links.filter(isPlay)
    const menu = inner.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? ''
    if (!play) {
      if (buttons.length) playButton(file, `the header has a play button, but ${slug}/page.json gives no site.play`)
    } else if (!buttons.length) {
      playButton(file, `the header has no "${play.label}" button (${play.href}), which every page of ${slug} ends its menu with: make the page with the template (tools/build-pages.mjs, tools/build-wiki.mjs)`)
    } else if (buttons.length > 1) {
      playButton(file, `the header has ${buttons.length} play buttons: one, at the end of the menu`)
    } else if (!isPlay(links.at(-1))) {
      playButton(file, "the header's play button is not its last item")
    } else if (![...menu.matchAll(/<a\b([^>]*)>/g)].some((m) => isPlay(m[1]))) {
      playButton(file, "the header's play button is outside its menu, so the phone panel leaves it out")
    } else if (buttons[0].match(/\shref="([^"]*)"/)?.[1] !== play.href) {
      playButton(file, `the header's play button goes to ${buttons[0].match(/\shref="([^"]*)"/)?.[1] ?? 'nowhere'}, not ${play.href} (${slug}/page.json site.play)`)
    }
  }
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

// The chapter stepper (George, 24 Oct 2026: "... a stepper that updated during scroll. I can click any bullet. ... One
// chapter per anchor. This is a generic rule for all games and projects so implement for all."), on every page GitHub
// Pages serves, as the phone menu and the cursors above. assets/stepper.js builds it from the page's chapters, which
// this reads from the markup the same way: in <main>, the targets of a heading's link to itself (a.anchor, named by its
// heading) and of the links in a <nav> of the page's own ("On this page", named by their words), each id once. A page
// with two or more must load /assets/menu.js, which brings the stepper (or stepper.js itself), and each chapter must
// point at one element of the page, or its bullet leads nowhere.
const stepper = (file, message) => report(file, 'stepper', message)
const STEPPER_JS = /<script type="module" src="\/assets\/stepper\.js"><\/script>/
const words = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const literal = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
for (const f of ['stepper.js', 'stepper.css']) if (!existsSync(join(root, 'assets', f))) stepper(join('assets', f), 'missing')
if (!readFileSync(join(root, 'assets', 'menu.js'), 'utf8').includes('import("/assets/stepper.js")')) {
  stepper(join('assets', 'menu.js'), 'does not load /assets/stepper.js, the chapter stepper of every page with a header')
}
for (const file of served) {
  if (notPages.has(file) || PARTIAL.test(file)) continue
  const html = readFileSync(join(root, file), 'utf8')
  const main = html.match(/<main\b[\s\S]*<\/main>/)?.[0] ?? ''
  const chapters = new Map()
  const add = (href, name) => {
    if (href && !chapters.has(href)) chapters.set(href, name)
  }
  for (const [, inner] of main.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
    for (const [tag] of inner.matchAll(/<a\b[^>]*>/g)) {
      const href = tag.match(/\shref="#([^"]*)"/)?.[1]
      if (/\sclass="(?:[^"]*\s)?anchor(?:\s[^"]*)?"/.test(tag)) add(href, words(inner))
    }
  }
  for (const [, inner] of main.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/g)) {
    for (const [, href, text] of inner.matchAll(/<a\b[^>]*\shref="#([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) add(href, words(text))
  }
  let count = 0
  for (const [href, name] of chapters) {
    const id = decodeURIComponent(href)
    const many = html.match(new RegExp(`\\sid="${literal(id)}"`, 'g'))?.length ?? 0
    if (!many) stepper(file, `a chapter links to #${href}, which no element on the page has: its bullet would lead nowhere`)
    else if (many > 1) stepper(file, `${many} elements have the id "${id}", a chapter's: give each its own`)
    else if (!name) stepper(file, `the chapter #${href} has no name for its bullet: its heading or link has no words`)
    else count++
  }
  if (count >= 2 && !html.includes(MENU_JS) && !STEPPER_JS.test(html)) {
    stepper(file, `has ${count} chapters but no chapter stepper: load /assets/menu.js (${MENU_JS}), which brings /assets/stepper.js`)
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
// A product's style pages and its landing page's style tiles come from <product>/styles/styles.json
// (tools/make-style-pages.mjs), each page with its link-preview picture (tools/make-style-cards.py).
try {
  for (const { file, text } of styleSources()) {
    const have = existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n') : null
    if (have !== text) report(file, 'styles', 'not as tools/make-style-pages.mjs writes it: edit styles/styles.json, then run it and tools/build-pages.mjs')
    const card = JSON.parse(text).social?.image
    if (file.includes(`${sep}styles${sep}`) && card && !existsSync(join(root, card))) report(file, 'styles', `no link-preview picture ${card}: run python tools/make-style-cards.py`)
  }
  for (const dir of strayStylePages()) report(dir, 'styles', 'a style page styles.json no longer lists: delete it')
} catch (e) {
  report('styles/styles.json', 'styles', e.message)
}
for (const dir of readdirSync(root)) {
  // hub/ is VHub's web app, an app page only the Deployer's vhub-hub writes (README, "The app pages"), not a product
  // landing page: its privacy.html is VHub's policy, which comes with each release, and it has no page.json.
  if (SKIP.includes(dir) || dir === 'hub' || !existsSync(join(root, dir, 'privacy.html'))) continue
  if (!existsSync(join(root, dir, 'page.json'))) report(join(dir, 'index.html'), 'template', 'made by hand: every product page comes from tools/build-pages.mjs (give it a page.json and a theme pack)')
}

// "What's new" and "Questions and answers" on every product's landing page (George, 25 Oct 2026: "This apply as global
// rule. All landing pages must have it."): its page.json has a section of each name, with the template's news block
// and faq block, so each is a chapter with its heading's link (and a bullet on the stepper); the questions are well
// formed, and so is the changelog the news block reads (<product>/changelog.json, which the Deployer adds to).
const CHAPTERS = [['news', "What's new"], ['faq', 'Questions and answers']]
for (const slug of products()) {
  const file = join(slug, 'page.json')
  const sections = loadProduct(slug).page.sections ?? []
  for (const [type, title] of CHAPTERS) {
    const at = sections.filter((s) => s.blocks?.some((b) => b.type === type))
    if (!at.length) report(file, 'faq-news', `no "${title}" section: add one with a ${type} block (README, "What's new and Questions and answers")`)
    for (const s of at) if (s.title !== title) report(file, 'faq-news', `the section with the ${type} block is titled ${s.title ? `"${s.title}"` : 'nothing'}, not "${title}": every landing page names it the same`)
  }
  for (const b of sections.flatMap((s) => s.blocks ?? [])) {
    if (b.type === 'faq') for (const m of readFaq(b, slug).problems) report(file, 'faq-news', m)
    if (b.type === 'news') for (const m of readNews(b, slug).problems) report(join(slug, b.src ?? 'changelog.json'), 'faq-news', m)
    if (b.type === 'news') for (const m of emptyProblems(b.empty)) report(file, 'faq-news', m)
  }
}

// The questions and answers open and close with an animation, one at a time (George, 26 Oct 2026: "FAQ must open/close
// with animation always. One open at a time."): assets/faq.js does it, which /assets/menu.js loads on a page with a faq
// block, so every served page with one loads menu.js (or faq.js itself). Without it the answers still open, but jump,
// and several stay open.
const faqJs = (file, message) => report(file, 'faq-js', message)
const FAQ_JS = /<script type="module" src="\/assets\/faq\.js"><\/script>/
if (!existsSync(join(root, 'assets', 'faq.js'))) faqJs(join('assets', 'faq.js'), 'missing')
if (!readFileSync(join(root, 'assets', 'menu.js'), 'utf8').includes('import("/assets/faq.js")')) {
  faqJs(join('assets', 'menu.js'), 'does not load /assets/faq.js, which animates the questions and answers of every page with them')
}
for (const file of served) {
  if (notPages.has(file) || PARTIAL.test(file)) continue
  const html = readFileSync(join(root, file), 'utf8')
  if (/<div class="faq">/.test(html) && !html.includes(MENU_JS) && !FAQ_JS.test(html)) {
    faqJs(file, `has questions and answers that open with no animation and several at a time: load /assets/menu.js (${MENU_JS}), which brings /assets/faq.js`)
  }
}

// No text selection and no right-click (George, 26 Oct 2026: "Dont allow text selection and right clicking in any page.
// Global rule. Selected highlighted text must have color of app or game."), on every page GitHub Pages serves, as the
// phone menu and the cursors above: each loads /assets/menu.js, which brings /assets/no-select.js, or no-select.js
// itself. That links /assets/no-select.css, which turns selecting off everywhere but in text fields and colours their
// selection in the page's own colour, and keeps the right-click menu shut. No other stylesheet, <style> or style=""
// turns selecting back on, but for the text fields: another repo's own piece for its pages (the hub's, the Exitwise
// play page's) may let them be selected too.
const noSelect = (file, message) => report(file, 'no-select', message)
const NO_SELECT_JS = /<script\b[^>]*\ssrc="\/assets\/no-select\.js"[^>]*><\/script>/
// s split wherever at(character) is true outside brackets, parentheses and quotes.
const splitTop = (s, at) => {
  const parts = []
  let [depth, quote, from] = [0, '', 0]
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quote) {
      if (c === quote) quote = ''
    } else if (c === '"' || c === "'") quote = c
    else if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (!depth && at(c)) {
      parts.push(s.slice(from, i))
      from = i + 1
    }
  }
  return [...parts, s.slice(from)].map((p) => p.trim()).filter(Boolean)
}
// Whether each selector of a list ends on a text field: input, textarea, [contenteditable], or :is() or :where() of them.
const fieldsOnly = (list) => splitTop(list, (c) => c === ',').every((selector) => {
  const last = splitTop(selector, (c) => /[\s>+~]/.test(c)).at(-1) ?? ''
  const inner = last.match(/^:(?:is|where)\(([\s\S]*)\)$/)
  return inner ? fieldsOnly(inner[1]) : /^(?:input|textarea)(?![-\w])|^\[contenteditable\b/i.test(last)
})
// Each user-select in a stylesheet that turns selecting back on, with its rule's selector.
const reselects = (css) => {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...css.matchAll(/(?<![-\w])(?:-(?:webkit|moz|ms)-)?user-select:\s*(text|all|auto|contain)\b/g)].map((m) => {
    const open = css.lastIndexOf('{', m.index)
    const start = Math.max(css.lastIndexOf('}', open), css.lastIndexOf('{', open - 1), css.lastIndexOf(';', open)) + 1
    return { kind: m[1], selector: open < 0 || css.lastIndexOf('}', m.index) > open ? '' : css.slice(start, open).trim() }
  })
}
const reselect = (file, css) => {
  for (const { kind, selector } of reselects(css)) {
    if (!selector || !fieldsOnly(selector)) noSelect(file, `${selector ? `"${selector}"` : 'a rule'} sets user-select: ${kind}, which lets text be selected again: only text fields (input, textarea, [contenteditable]) may be`)
  }
}
for (const f of ['no-select.js', 'no-select.css']) if (!existsSync(join(root, 'assets', f))) noSelect(join('assets', f), 'missing')
if (!readFileSync(join(root, 'assets', 'menu.js'), 'utf8').includes('import("/assets/no-select.js")')) {
  noSelect(join('assets', 'menu.js'), 'does not load /assets/no-select.js, which keeps the text of every page with a header from being selected')
}
for (const file of served) {
  if (notPages.has(file) || PARTIAL.test(file)) continue
  const html = readFileSync(join(root, file), 'utf8')
  if (!html.includes(MENU_JS) && !NO_SELECT_JS.test(html)) {
    noSelect(file, `lets its text be selected and opens the right-click menu: load /assets/menu.js (${MENU_JS}), or with no header <script src="/assets/no-select.js" defer></script>`)
  }
  for (const [, css] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) reselect(file, css)
  for (const [, kind] of [...html.matchAll(/\sstyle="([^"]*)"/g)].flatMap((m) => [...m[1].matchAll(/(?<![-\w])(?:-(?:webkit|moz|ms)-)?user-select:\s*(text|all|auto|contain)\b/g)])) {
    noSelect(file, `a style="" sets user-select: ${kind}, which lets text be selected again: only text fields (input, textarea, [contenteditable]) may be`)
  }
}
for (const [file, css] of sheets) if (file.endsWith('.css') && file !== 'assets/no-select.css') reselect(file, css)

// Switches, never checkboxes (George, 26 Oct 2026: "I hate checkboxes. I always prefer toggles."): every on/off choice
// on a page GitHub Pages serves is the site's switch, a real checkbox that /assets/switch.css draws as a track and a
// knob: <input type="checkbox" class="switch" role="switch">, on a page that links that stylesheet. That holds for the
// checkboxes in a page's markup and for those the site's own scripts make (the try page's settings, assets/try/try.js):
// each `type = 'checkbox'` there gives the input the "switch" class and role in the lines that follow, and every page
// that loads such a script links switch.css. A choice of a few is a segmented control or option cards, never a row of
// checkboxes. The scripts other repos build (VHub's hub, the Exitwise game, the Speedometer engine) draw their own
// switch in their repo, whose tests hold it; here only their markup is read.
const switchRule = (file, message) => report(file, 'switch', message)
const SWITCH_CSS = /<link rel="stylesheet" href="\/assets\/switch\.css">/
const BUILT = /^(?:hub|exitwise\/play|speedometer-wallpaper\/play\/app)\//
const isSwitch = (tag) => /\srole="switch"/.test(tag) && /\sclass="(?:[^"]*\s)?switch(?:\s[^"]*)?"/.test(tag)
if (!existsSync(join(root, 'assets', 'switch.css'))) switchRule(join('assets', 'switch.css'), 'missing')
// The site's own scripts that make checkboxes, by their address.
const switchScripts = new Set()
const ownScripts = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.js'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter((f) => f && existsSync(join(root, f)) && !BUILT.test(f) && !f.startsWith('tools/'))
for (const file of ownScripts) {
  const js = readFileSync(join(root, file), 'utf8')
  for (const m of js.matchAll(/(?<!\[)\btype\s*[=:]\s*(['"])checkbox\1|setAttribute\(\s*(['"])type\2\s*,\s*(['"])checkbox\3/g)) {
    switchScripts.add('/' + file)
    const next = js.slice(m.index, m.index + 400)
    const cls = /class(?:Name)?\s*=\s*(['"])(?:[^'"]*\s)?switch(?:\s[^'"]*)?\1|classList\.add\([^)]*(['"])switch\2/.test(next)
    const role = /setAttribute\(\s*(['"])role\1\s*,\s*(['"])switch\2|\brole\s*[:=]\s*(['"])switch\3/.test(next)
    if (!cls || !role) switchRule(file, `line ${js.slice(0, m.index).split('\n').length} makes a checkbox that isn't the site's switch: give it the class "switch" and role "switch" (assets/switch.css)`)
  }
}
for (const file of served) {
  if (notPages.has(file) || PARTIAL.test(file)) continue
  const html = readFileSync(join(root, file), 'utf8')
  const boxes = [...html.matchAll(/<input\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => /\stype=["']?checkbox\b/i.test(tag))
  for (const tag of boxes.filter((t) => !isSwitch(t))) {
    switchRule(file, `${tag} is a checkbox: make it the site's switch, <input type="checkbox" class="switch" role="switch"> (assets/switch.css)`)
  }
  const makes = [...html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]).filter((src) => switchScripts.has(src))
  if ((boxes.length || makes.length) && !SWITCH_CSS.test(html)) {
    switchRule(file, `has switches (${boxes.length ? 'in its markup' : makes.join(', ')}) but doesn't link /assets/switch.css, which draws them: <link rel="stylesheet" href="/assets/switch.css">`)
  }
}

// No stretched pictures (George, 24 Oct 2026: "These are stretched."): every <img> on a served page that states its
// width and height states its own picture's shape, within rounding, so a box sized from them never squeezes it. (The
// stylesheets keep the rest: assets/product.css and assets/vgraphics.css give every img height: auto, and a box that
// sets both sides crops with object-fit.)
for (const file of served) {
  if (sources.has(file)) continue
  const html = readFileSync(join(root, file), 'utf8')
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    const src = tag.match(/\ssrc="([^"]+)"/)?.[1]
    const w = Number(tag.match(/\swidth="(\d+)"/)?.[1])
    const h = Number(tag.match(/\sheight="(\d+)"/)?.[1])
    if (!src || !w || !h || /^(data:|[a-z]+:|\/\/)/i.test(src)) continue
    const clean = decodeURIComponent(src.replace(/[?#].*$/, ''))
    const target = clean.startsWith('/') ? join(root, clean) : join(root, dirname(file), clean)
    const own = existsSync(target) ? imageSize(target) : null
    if (own && Math.abs((w / h) / (own.width / own.height) - 1) > 0.01) {
      report(file, 'stretch', `<img src="${src}"> says ${w} x ${h}, but the picture is ${own.width} x ${own.height}: give its real size, or cut the picture to that shape`)
    }
  }
}

// Every picture is used once (George, 26 Oct 2026, on Palermo's gallery: "Gallery has same hero as overview. Thats
// forbidden. Each art must be used only once!! General rule!!"): on the pages GitHub Pages serves, no hero, section or
// card shows a picture that is shown anywhere else on the site, on another page or the same one.
// - A picture is all of its files: its sizes and formats (<name>-<width>.avif, .webp, .jpg), the cuts one <picture>
//   holds (wide, tall, ultra), and its copies under other names, found by their content: the same bytes, or nearly the
//   same small print (tools/art-prints.py): a copy at another size or in another format, one trimmed a little at an
//   edge, or a cut of another shape from its middle. The prints are kept in the temp folder by each file's hash, so
//   only new files need Python.
// - A place is a page's hero, the section (or article) the picture is in, a product's footer, or its theme's
//   ornaments. The footer's picture and the ornaments are on every page of a product by design (George, 23 Oct 2026:
//   "The foother must be same on all pages."), one place each.
// - Not counted, on purpose (keep this list short): the <head> (link previews, preloads, icons), logos, store badges,
//   the soundtrack's cover, QR codes, pictures 256 px or smaller (icons, sprites, game pieces), the start-up's welcome
//   splash (the key art's own job, after the VGraphics intro: in a play page's markup, the WebGL template's
//   #loader-art; the try pages' start-up builds its own by script), pictures a script shows, stylesheet
//   backgrounds, a picture in a link to a page
//   that shows it (that card is the page's preview, as its link preview is), and a product gallery's tiles (George,
//   26 Oct 2026: "Yes: a wiki card or gallery tile may show the same picture as the page it previews. Every page's
//   hero and sections stay unique."). Gallery tiles are the pictures of the template's gallery block, a stage slide's
//   screenshot (.g-screen) or a picture in its plain row (.shots.fade-edges), and an album's tiles (.album-item), whose
//   lightbox shows them by script; never the gallery page's hero, the gallery's backdrop and pedestals, or any other
//   section.
// - tools/art-once-todo.json lists the reuses known when the rule came in (26 Oct 2026), each with its fix, until the
//   fix lands. A listed picture passes while it is shown only in places its entry names: a new place fails, and so
//   does a fixed picture until its entry is taken out, so the list only shrinks.
const ART_TODO = join('tools', 'art-once-todo.json')
const PICTURE = /\.(png|jpe?g|webp|avif|gif|svg)$/i
const VOIDS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const ART_FREE = new Set(['logo', 'product-name', 'foot-brand', 'brand', 'gp', 'ost-cover', 'ost-disc', 'ost-mini-show', 'try-qr',
  'g-screen', 'album-item'])
const ICON = 256
const artOf = (f) => f.replace(/-\d+\.(avif|webp|jpe?g|png|gif)$/i, '').replace(PICTURE, '')
// Where a picture is (chain: its element and the elements around it, outermost first): { free } when it isn't counted,
// else { place, to }, to being the page its link leads to.
function artPlace(page, chain) {
  const has = (c) => chain.some((e) => e.cls.includes(c))
  const both = (a, b) => chain.some((e) => e.cls.includes(a) && e.cls.includes(b))
  if (chain.some((e) => e.cls.some((c) => ART_FREE.has(c))) || both('ost-backdrop', 'blur') || both('shots', 'fade-edges')) return { free: true }
  if (/^\/[^/]+\/play\/$/.test(page) && chain.some((e) => e.id === 'loader-art')) return { free: true }
  const product = page.split('/')[1]
  if (has('foot-art')) return { place: `the footer of /${product}/` }
  if (has('orn') || has('horizon')) return { place: `the ornaments of /${product}/` }
  const href = chain.findLast((e) => e.tag === 'a' && e.href)?.href
  let to
  try {
    const u = href && new URL(href, `https://vgraphics.gr${page}`)
    if (u?.origin === 'https://vgraphics.gr') to = u.pathname.replace(/(^|\/)index\.html$/, '$1')
  } catch {}
  if (has('key-art')) return { place: `${page} hero`, to }
  const box = chain.findLast((e) => ['section', 'article', 'aside', 'header', 'footer'].includes(e.tag))
  return { place: box?.id ? `${page}#${box.id}` : `${page} ${box ? [box.tag, ...box.cls].join('.') : 'body'}`, to }
}
// A page's pictures, in its <body>: one use per <picture> (all its sources), per <img> outside one, and per element
// whose style attribute names one (a band's or a world card's --art), each { page, files, place | free, to }.
function pictureUses(file) {
  const page = urlPath(file)
  const html = readFileSync(join(root, file), 'utf8').replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi, '<$1$2></$1>')
  const uses = new Map()
  const stack = []
  const resolve = (ref) => {
    let clean = ref.replace(/^https:\/\/vgraphics\.gr(?=\/)/, '').replace(/[?#].*$/, '')
    if (!clean || /^(data:|[a-z]+:|\/\/)/i.test(clean)) return null
    try {
      clean = decodeURIComponent(clean)
    } catch {}
    if (!PICTURE.test(clean)) return null
    const target = clean.startsWith('/') ? clean.slice(1) : join(dirname(file), clean)
    return existsSync(join(root, target)) ? target.split(sep).join('/') : null
  }
  for (const m of html.slice(Math.max(0, html.search(/<body\b/))).matchAll(/<(\/?)([a-zA-Z][\w-]*)\b([^>]*)>/g)) {
    const [, close, name, attrs] = m
    const tag = name.toLowerCase()
    if (close) {
      const at = stack.findLastIndex((e) => e.tag === tag)
      if (at >= 0) stack.length = at
      continue
    }
    const el = { tag, at: m.index, cls: attrs.match(/\sclass="([^"]*)"/)?.[1].trim().split(/\s+/) ?? [], id: attrs.match(/\sid="([^"]*)"/)?.[1], href: attrs.match(/\shref="([^"]*)"/)?.[1] }
    const refs = []
    if (tag === 'img' || tag === 'source') {
      for (const [, a, v] of attrs.matchAll(/\s(src|srcset)="([^"]*)"/g)) refs.push(...(a === 'srcset' ? v.split(',').map((s) => s.trim().split(/\s+/)[0]) : [v]))
    }
    for (const [, u] of (attrs.match(/\sstyle="([^"]*)"/)?.[1] ?? '').matchAll(/url\(\s*(?:&quot;|['"])?([^'")&]+)/g)) refs.push(u)
    const files = refs.map(resolve).filter(Boolean)
    if (files.length) {
      const chain = [...stack, el]
      const key = chain.findLast((e) => e.tag === 'picture')?.at ?? el.at
      if (!uses.has(key)) uses.set(key, { page, files: new Set(), ...artPlace(page, chain) })
      for (const f of files) uses.get(key).files.add(f)
    }
    if (!VOIDS.has(tag) && !attrs.endsWith('/')) stack.push(el)
  }
  return [...uses.values()]
}
{
  const uses = served.filter((f) => !notPages.has(f) && !PARTIAL.test(f)).flatMap(pictureUses)
  const parent = new Map()
  const find = (a) => {
    while (parent.get(a) !== a) a = parent.get(a)
    return a
  }
  const unite = (a, b) => parent.set(find(b), find(a))
  // Each picture's largest side, from its smallest file's shape and its widest size's name (<name>-<width>), and one
  // file to fingerprint: about 512 px wide, WebP or JPEG before AVIF (quicker to read).
  const files = new Map()
  for (const u of uses) {
    u.arts = [...new Set([...u.files].map(artOf))]
    for (const a of u.arts) if (!parent.has(a)) parent.set(a, a)
    for (const a of u.arts.slice(1)) unite(u.arts[0], a)
    for (const f of u.files) files.set(artOf(f), (files.get(artOf(f)) ?? new Set()).add(f))
  }
  const sizes = new Map()
  const reps = new Map()
  for (const [a, set] of files) {
    const list = [...set].map((f) => ({ f, w: Number(f.match(/-(\d+)\.\w+$/)?.[1]) || 0 }))
    const size = imageSize(join(root, list.reduce((x, y) => (y.w < x.w ? y : x)).f))
    if (!size) continue
    const k = size.width / size.height
    const widest = Math.max(size.width, ...list.map((x) => x.w))
    sizes.set(a, Math.max(widest, widest / k))
    const score = (x) => Math.abs((x.w || size.width) - 512) + (/\.avif$/i.test(x.f) ? 4096 : 0)
    reps.set(a, { file: list.reduce((x, y) => (score(y) < score(x) ? y : x)).f, k })
  }
  // The prints of one version of tools/art-prints.py, so a change to it makes them anew.
  const PRINTER = join(root, 'tools', 'art-prints.py')
  const PRINTS = join(tmpdir(), `vgraphics-art-prints-${createHash('sha1').update(readFileSync(PRINTER)).digest('hex').slice(0, 10)}.json`)
  let prints = {}
  try {
    prints = JSON.parse(readFileSync(PRINTS, 'utf8'))
  } catch {}
  for (const r of reps.values()) r.hash = createHash('sha1').update(readFileSync(join(root, r.file))).digest('hex')
  const missing = [...reps.values()].filter((r) => !(r.hash in prints) && !/\.svg$/i.test(r.file))
  if (missing.length) {
    try {
      const got = JSON.parse(execFileSync('python', [PRINTER], { cwd: root, input: missing.map((r) => r.file).join('\n'), encoding: 'utf8', maxBuffer: 1 << 26 }))
      for (const r of missing) prints[r.hash] = got[r.file] ?? null
      writeFileSync(`${PRINTS}.${process.pid}`, JSON.stringify(prints))
      renameSync(`${PRINTS}.${process.pid}`, PRINTS)
    } catch (e) {
      report(join('tools', 'art-prints.py'), 'art-once', `can't fingerprint ${missing.length} picture(s), so copies under other names go unseen (it needs Python with Pillow 11.3 or later): ${e.message.split('\n')[0]}`)
    }
  }
  // Copies: the same bytes, or prints that match when laid over each other. Two of nearly the same shape (within 15%)
  // are laid whole, or one is cut to the other's shape at its start, middle or end (a copy cut a little); two of
  // different shapes by their centre squares (a 1:1 or 4:3 cut from the middle of a wide picture; a cut from its side
  // goes unseen). They match within 3.5 grey levels
  // (root mean square, of 255, on a grid 32 cells wide): a copy or a re-cut measures 2 or so, two screens of one app
  // that differ only in their readings 5 and up.
  const byHash = new Map()
  for (const [a, r] of reps) byHash.has(r.hash) ? unite(byHash.get(r.hash), a) : byHash.set(r.hash, a)
  // A print's region [x0, y0, x1, y1] (in its pixels) averaged into a grid of n x m cells.
  const grid = (t, [x0, y0, x1, y1], n, m) => {
    const out = new Float64Array(n * m)
    const [sx, sy] = [(x1 - x0) / n, (y1 - y0) / m]
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        const [ax, ay] = [x0 + i * sx, y0 + j * sy]
        let [sum, area] = [0, 0]
        for (let y = Math.floor(ay); y < Math.min(Math.ceil(ay + sy), t.h); y++) {
          const wy = Math.min(ay + sy, y + 1) - Math.max(ay, y)
          for (let x = Math.floor(ax); x < Math.min(Math.ceil(ax + sx), t.w); x++) {
            const wx = Math.min(ax + sx, x + 1) - Math.max(ax, x)
            sum += t.px[y * t.w + x] * wx * wy
            area += wx * wy
          }
        }
        out[j * n + i] = sum / area
      }
    }
    return out
  }
  const rms = (x, y) => {
    let sum = 0
    for (let i = 0; i < x.length; i++) sum += (x[i] - y[i]) ** 2
    return Math.sqrt(sum / x.length)
  }
  const thumbs = [...reps].filter(([, r]) => prints[r.hash]).map(([a, r]) => {
    const [, w, h, hex] = prints[r.hash].match(/^(\d+)x(\d+):([0-9a-f]*)$/)
    const t = { a, k: r.k, w: Number(w), h: Number(h), px: Buffer.from(hex, 'hex') }
    const s = Math.min(t.w, t.h)
    t.rows = Math.max(1, Math.round(32 / t.k))
    t.whole = grid(t, [0, 0, t.w, t.h], 32, t.rows)
    t.small = grid(t, [0, 0, t.w, t.h], 8, 8)
    t.square = grid(t, [(t.w - s) / 2, (t.h - s) / 2, (t.w + s) / 2, (t.h + s) / 2], 32, 32)
    return t
  })
  const copies = (a, b) => {
    const [W, N] = a.k >= b.k ? [a, b] : [b, a]
    const f = N.k / W.k
    if (f < 0.85) return rms(W.square, N.square) <= 3.5
    // A first look at 8 x 8 passes over pictures that are nothing alike.
    if (rms(W.small, N.small) > 24) return false
    return [0, 0.5, 1].some((at) => {
      const [from, to] = [at * (1 - f), at * (1 - f) + f]
      return rms(grid(W, [from * W.w, 0, to * W.w, W.h], 32, N.rows), N.whole) <= 3.5 ||
        rms(grid(N, [0, from * N.h, N.w, to * N.h], 32, W.rows), W.whole) <= 3.5
    })
  }
  for (let i = 0; i < thumbs.length; i++) {
    for (let j = i + 1; j < thumbs.length; j++) if (copies(thumbs[i], thumbs[j])) unite(thumbs[i].a, thumbs[j].a)
  }
  const pictures = new Map()
  for (const u of uses) {
    const p = find(u.arts[0])
    if (!pictures.has(p)) pictures.set(p, { arts: new Set(), uses: [] })
    pictures.get(p).uses.push(u)
    for (const a of u.arts) pictures.get(p).arts.add(a)
  }
  let todo = []
  try {
    todo = JSON.parse(readFileSync(join(root, ART_TODO), 'utf8')).reuses
  } catch (e) {
    report(ART_TODO, 'art-once', `can't be read: ${e.message}`)
  }
  const listed = new Set()
  for (const { arts, uses: all } of pictures.values()) {
    if (Math.max(...[...arts].map((a) => sizes.get(a) ?? 0)) <= ICON) continue
    const counted = all.filter((u) => !u.free)
    // The pages that show the picture themselves (in a gallery tile too), whose previews may show it.
    const shown = new Set(all.filter((u) => !u.to || u.to === u.page).map((u) => u.page))
    const places = [...new Set(counted.filter((u) => !(u.to && u.to !== u.page && shown.has(u.to))).map((u) => u.place))].sort()
    if (places.length < 2) continue
    const names = [...arts].sort()
    const t = todo.find((x) => x.art.some((a) => arts.has(a)))
    if (t) listed.add(t)
    const extra = t ? places.filter((p) => !t.places.includes(p)) : places
    if (!extra.length) continue
    const art = `${names[0]}${names.length > 1 ? ` (with ${names.slice(1).join(', ')})` : ''}`
    report(names[0], 'art-once', `${art} is shown in ${places.length} places: ${places.join('; ')}. Give each its own picture${t ? ` (${ART_TODO} lists it, but not in ${extra.join('; ')})` : ''}`)
  }
  for (const t of todo) if (!listed.has(t)) report(ART_TODO, 'art-once', `${t.art[0]} is no longer shown in two places: take its entry out`)
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
// without a publisher id, that publisher in ads.txt, and an entry for every game whose play page (<game>/play/) loads it.
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
    // A game's play page takes its ads from the switch. An app's try page (speedometer-wallpaper/play/) shows no ads
    // and loads no switch, so it needs no entry.
    for (const dir of readdirSync(root)) {
      if (SKIP.includes(dir)) continue
      const play = join(root, dir, 'play', 'index.html')
      if (!existsSync(play) || !readFileSync(play, 'utf8').includes('/assets/web-ads.js')) continue
      if (!Object.hasOwn(games, dir)) report(WEB_ADS, 'web-ads', `no entry for ${dir}, whose play page (${dir}/play/) loads the switch`)
    }
  }
}

if (problems.length) {
  console.log(problems.join('\n'))
  console.log(`${problems.length} problem(s)`)
  process.exit(1)
}
console.log(`OK: ${pages.length} pages, ${links} links checked`)
