// Checks the site's content rules before a push: node tools/check-site.mjs
// Prints one "path: [rule] message" line per problem and exits 1, or prints "OK: …" and exits 0.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP = ['.git', '.claude', 'tools', join('exitwise', 'play')]
const TEXT = /\.(html|css|js|mjs|txt|xml|md|json|svg)$/i

const COMPANY = [
  'VGRAPHICS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε.', 'VGRAPHICS SINGLE MEMBER P.C.', 'Ιδιωτική Κεφαλαιουχική Εταιρεία', 'private company',
  '181823306000', 'ELGEMI.181823306000', '802736373', 'Καυκάσου 10', '551 33', 'Καλαμαριά', 'Θεσσαλονίκη',
  'Kafkasou 10', 'Kalamaria', 'Thessaloniki', '22/01/2025', 'https://publicity.businessportal.gr/company/181823306000',
  'gvergidis90@gmail.com', 'lang="el"',
]
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
const pages = files.filter((f) => f.endsWith('.html'))
const urlPath = (f) => '/' + f.split(sep).join('/').replace(/(^|\/)index\.html$/, '$1')
let links = 0

for (const file of files.filter((f) => TEXT.test(f))) {
  const text = readFileSync(join(root, file), 'utf8')
  if (/\.(html|txt|xml)$/.test(file) && text.includes('vgraphics.github.io')) report(file, 'old-domain', 'mentions vgraphics.github.io')
  if (/6955395543|695 539 5543/.test(text)) report(file, 'no-phone', 'contains the phone number')
}

for (const file of pages) {
  const html = readFileSync(join(root, file), 'utf8')

  for (const s of ['VGRAPHICS SINGLE MEMBER P.C.', '181823306000', '802736373']) {
    if (!html.includes(s)) report(file, 'legal-footer', `missing "${s}"`)
  }
  if (!/href="\/company\/"/.test(html)) report(file, 'legal-footer', 'no link to /company/')

  if (!/<html[^>]*\slang="[^"]+"/.test(html)) report(file, 'head', 'no <html lang>')
  if (!/<meta name="viewport"/.test(html)) report(file, 'head', 'no viewport meta')
  if (!/<title>[^<\s][^<]*<\/title>/.test(html)) report(file, 'head', 'empty or missing <title>')
  if (file !== '404.html') {
    const want = `https://vgraphics.gr${urlPath(file)}`
    const got = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]
    if (got !== want) report(file, 'head', `canonical is ${got ?? 'missing'}, want ${want}`)
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

const cname = join(root, 'CNAME')
if (existsSync(cname) && readFileSync(cname, 'utf8').trim() !== 'vgraphics.gr') report('CNAME', 'cname', 'is not exactly vgraphics.gr')

const appAds = join(root, 'app-ads.txt')
if (!existsSync(appAds)) report('app-ads.txt', 'app-ads', 'missing')
else {
  const lines = readFileSync(appAds, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  for (const l of lines) {
    if (!/^[a-z0-9.-]+, [A-Za-z0-9-]+, (DIRECT|RESELLER)(, [a-z0-9]+)?$/.test(l)) report('app-ads.txt', 'app-ads', `bad line "${l}"`)
  }
  if (!lines.includes(ADMOB)) report('app-ads.txt', 'app-ads', 'no AdMob line')
}

if (problems.length) {
  console.log(problems.join('\n'))
  console.log(`${problems.length} problem(s)`)
  process.exit(1)
}
console.log(`OK: ${pages.length} pages, ${links} links checked`)
