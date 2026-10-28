// Writes sitemap.xml from the pages: the canonical address of every page search engines may index, with the day it last
// changed.
// Usage: node tools/build-sitemap.mjs   (after adding, moving or removing a page; check-site fails until you do)
// A page is left out when it has <meta name="robots" content="noindex"> (the 404 page, the room invite page).
// <lastmod> is the date of the last commit that changed the page's file, or today while it has changes not committed
// yet, so a page built and committed on the same day keeps its date through the commit and the merge. Run it again
// after pages change (the Deployer's hub and party releases do); check-site checks which pages are listed, and that each
// has a date, but not the dates themselves, so a page the Deployer rewrites alone (What's new) keeps its old date until
// the next run.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pieces } from './lib/product.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// _mockups/ holds local design proposals that are never committed. Unlike check-site, the Deployer's play pages count.
const SKIP = ['.git', '.claude', 'tools', '_mockups', 'node_modules']
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    const rel = relative(root, full)
    if (SKIP.some((s) => rel === s || rel.startsWith(s + sep))) return []
    return statSync(full).isDirectory() ? walk(full) : [rel]
  })
}

// The day each HTML file last changed, by its path with forward slashes: today for one with changes not committed,
// else its last commit's date (git log lists the newest first, and merges name no files, so a merged page keeps the date
// of the commit that changed it).
function lastChanged() {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 })
  const dates = new Map()
  for (const commit of git('log', '--format=%x01%cs', '--name-only', '--', '*.html').split('\x01').slice(1)) {
    const [day, ...files] = commit.split('\n').map((l) => l.trim()).filter(Boolean)
    for (const f of files) if (!dates.has(f)) dates.set(f, day)
  }
  const today = new Date().toLocaleDateString('sv')
  for (const entry of git('status', '--porcelain', '-z', '--untracked-files=all', '--', '*.html').split('\0').filter(Boolean)) {
    dates.set(entry.slice(3), today)
  }
  return (file) => dates.get(file.split(sep).join('/')) ?? today
}

// sitemap.xml as it should be now. check-site compares the file with it.
export function sitemap() {
  // The pieces the template sets into pages (a policy's copy, a page's markup) aren't pages themselves.
  const skip = new Set(pieces())
  const changed = lastChanged()
  const urls = walk(root)
    .filter((f) => f.endsWith('.html') && !skip.has(f))
    .map((f) => [f, readFileSync(join(root, f), 'utf8')])
    .filter(([, html]) => !/<meta name="robots" content="[^"]*noindex/i.test(html))
    .map(([f, html]) => [html.match(/<link rel="canonical" href="([^"]*)"/)?.[1], changed(f)])
    .filter(([url]) => url)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, day]) => `  <url><loc>${xml(u)}</loc><lastmod>${day}</lastmod></url>`).join('\n')}
</urlset>
`
}

if (process.argv[1]?.endsWith('build-sitemap.mjs')) {
  const text = sitemap()
  writeFileSync(join(root, 'sitemap.xml'), text)
  console.log(`sitemap.xml: ${text.match(/<loc>/g)?.length ?? 0} pages`)
}
