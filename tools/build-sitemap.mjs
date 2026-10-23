// Writes sitemap.xml from the pages: the canonical address of every page search engines may index.
// Usage: node tools/build-sitemap.mjs   (after adding, moving or removing a page; check-site fails until you do)
// A page is left out when it has <meta name="robots" content="noindex"> (the 404 page, the room invite page). There is
// no <lastmod>: search engines trust it only while it's always right, and nothing here would keep it right.
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

// sitemap.xml as it should be now. check-site compares the file with it.
export function sitemap() {
  // The pieces the template sets into pages (a policy's copy, a page's markup) aren't pages themselves.
  const skip = new Set(pieces())
  const urls = walk(root)
    .filter((f) => f.endsWith('.html') && !skip.has(f))
    .map((f) => readFileSync(join(root, f), 'utf8'))
    .filter((html) => !/<meta name="robots" content="[^"]*noindex/i.test(html))
    .map((html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1])
    .filter(Boolean)
    .sort()
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${xml(u)}</loc></url>`).join('\n')}
</urlset>
`
}

if (process.argv[1]?.endsWith('build-sitemap.mjs')) {
  const text = sitemap()
  writeFileSync(join(root, 'sitemap.xml'), text)
  console.log(`sitemap.xml: ${text.match(/<loc>/g)?.length ?? 0} pages`)
}
