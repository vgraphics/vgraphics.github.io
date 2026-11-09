// What search engines and link previews want from a page's head and headings, in one place: the generators
// (tools/build-pages.mjs, build-wiki.mjs, build-devlog.mjs) take their constants from here and tools/check-site.mjs holds
// every page that may be indexed to the rules below (George, 10 Nov 2026: "improve the SEO of our pages so we get more
// visitors"; README "Search engines"). A rule a product's own pages still miss is listed in tools/seo-known-gaps.json,
// one entry per page and check with the coordinator who owns the page; check-site fails on a gap that isn't listed and on
// a listed gap that is fixed, so the list only shrinks.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { imageSize } from './image-size.mjs'

/** og:locale: every page is in English (one language per page). */
export const OG_LOCALE = 'en_US'
/** The robots meta every indexable page carries: Google may show the large preview picture (Discover, image results). */
export const INDEX_ROBOTS = 'max-image-preview:large'
/** Characters shown in a result's title and description before Google cuts them (tags decoded). */
export const TITLE_LENGTH = [25, 65]
export const DESCRIPTION_LENGTH = [100, 165]
/** A link preview's picture is at least this wide (Facebook, LinkedIn and Google Discover ask for 1200 px). */
export const OG_IMAGE_MIN_WIDTH = 1200

export const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&amp;/g, '&')
/** Text for comparing words: lower case, no ™, & and spacing folded. */
export const plainText = (s) => decode(s).replace(/™/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

const meta = (head, attr, name) => head.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1]?.trim()

/** Heading levels in order, as [level, text]: the page's body without scripts, styles and SVG. */
export function headings(html) {
  const body = (html.split(/<\/head>/i)[1] ?? html).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, '')
  return [...body.matchAll(/<h([1-6])[\s>][\s\S]*?<\/h\1>/g)].map((m) => [+m[1], plainText(m[0].replace(/<[^>]+>/g, ' '))])
}

/** The structured data blocks of a page's head: { types: ['Organization', …], problems: [..] } */
export function structuredData(head) {
  const types = []
  const problems = []
  for (const [, json] of head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data
    try {
      data = JSON.parse(json)
    } catch {
      continue // check-site's json-ld rule reports invalid JSON
    }
    const items = Array.isArray(data) ? data : data['@graph'] ?? [data]
    if (!data['@context'] && !items.some((i) => i['@context'])) problems.push('a block has no @context')
    for (const item of items) {
      if (!item['@type']) problems.push('an item has no @type')
      else types.push(...[item['@type']].flat())
    }
  }
  return { types, problems }
}

/** The product's keywords for a page: tools/seo-keywords.json for the pages that belong to no product, else the
 * product's page.json "seo.keywords". Returns { list, product } (list undefined when the page needs none). */
export function keywordsFor(root, url, products, shared) {
  if (shared[url]) return { list: shared[url] }
  const slug = url.split('/')[1]
  if (!products.includes(slug)) return {}
  const page = JSON.parse(readFileSync(join(root, slug, 'page.json'), 'utf8'))
  return { list: page.seo?.keywords ?? [], product: slug, landing: url === `/${slug}/` }
}

/** What an indexable page's head and headings lack, as [check, message] pairs. html: the whole page; url: its address
 * (/exitwise/); root: the site's folder (for the link preview's picture); keywords: keywordsFor()'s answer. */
export function seoProblems({ html, url, root, keywords = {} }) {
  const out = []
  const head = html.split(/<\/head>/i)[0]
  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? '')
  const description = decode(meta(head, 'name', 'description') ?? '')
  const lengths = (what, text, [min, max]) => {
    if (text && (text.length < min || text.length > max)) out.push([`${what}-length`, `the ${what} is ${text.length} characters, want ${min} to ${max} (search results cut it): "${text.slice(0, 50)}…"`])
  }
  lengths('title', title, TITLE_LENGTH)
  lengths('description', description, DESCRIPTION_LENGTH)

  if (meta(head, 'property', 'og:locale') !== OG_LOCALE) out.push(['og-locale', `no <meta property="og:locale" content="${OG_LOCALE}">`])
  if (!meta(head, 'property', 'og:image:alt')) out.push(['og-image-alt', 'no og:image:alt (the link preview picture\'s description)'])
  if (!meta(head, 'name', 'twitter:image')) out.push(['twitter-image', 'no twitter:image'])
  const image = meta(head, 'property', 'og:image')
  if (image?.startsWith('https://vgraphics.gr/')) {
    const file = join(root, decodeURIComponent(image.slice('https://vgraphics.gr/'.length)))
    const size = existsSync(file) && /\.(png|jpe?g|webp|gif|avif)$/i.test(file) ? imageSize(file) : null
    if (!meta(head, 'property', 'og:image:width') || !meta(head, 'property', 'og:image:height')) out.push(['og-image-size', 'no og:image:width and og:image:height'])
    if (size && size.width < OG_IMAGE_MIN_WIDTH) out.push(['og-image-size', `og:image is ${size.width} px wide, want at least ${OG_IMAGE_MIN_WIDTH}: ${image}`])
  }
  const robots = head.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? ''
  if (!robots.includes(INDEX_ROBOTS)) out.push(['robots-preview', `no <meta name="robots" content="${INDEX_ROBOTS}"> (large preview pictures in Google)`])

  const { types, problems } = structuredData(head)
  for (const p of problems) out.push(['json-ld', `structured data: ${p}`])
  if (url === '/') {
    for (const t of ['Organization', 'WebSite']) if (!types.includes(t)) out.push(['json-ld', `the home page's structured data has no ${t}`])
  } else if (!types.includes('BreadcrumbList')) out.push(['breadcrumb', 'no BreadcrumbList in its structured data'])

  const levels = headings(html)
  let last = 0
  for (const [level, text] of levels) {
    if (last && level > last + 1) {
      out.push(['heading-order', `an h${level} ("${text.slice(0, 40)}") follows an h${last}: no level may be skipped`])
      break
    }
    last = level
  }

  for (const [tag] of (html.split(/<\/head>/i)[1] ?? '').matchAll(/<img\b[^>]*>/g)) {
    const alt = tag.match(/\salt="([^"]*)"/)
    if (!alt) out.push(['img-alt', `an <img> without alt: ${tag.slice(0, 90)}`])
    else if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(alt[1].trim()) || /^(image|img|picture|photo|screenshot)\d*$/i.test(alt[1].trim())) out.push(['img-alt', `an alt that is a file name or a placeholder: "${alt[1]}"`])
  }

  if (keywords.list) {
    const words = keywords.list.map(plainText)
    const has = (text) => words.some((k) => plainText(text).includes(k))
    if (!words.length) {
      if (keywords.landing) out.push(['keywords', 'no keywords declared (page.json "seo.keywords", the words people search for)'])
    } else if (keywords.product && !keywords.landing) {
      if (!has(title) && !has(description)) out.push(['keywords', `neither its title nor its description holds one of the product's keywords (${keywords.list.slice(0, 4).join(', ')}, …)`])
    } else {
      if (!has(title)) out.push(['keywords', `the title holds none of the keywords (${keywords.list.slice(0, 4).join(', ')}, …)`])
      if (!has(description)) out.push(['keywords', `the description holds none of the keywords (${keywords.list.slice(0, 4).join(', ')}, …)`])
      const h1 = levels.find(([l]) => l === 1)?.[1] ?? ''
      if (keywords.product && !has(h1)) out.push(['keywords', `the h1 holds none of the keywords (${keywords.list.slice(0, 4).join(', ')}, …)`])
    }
  }
  return out
}

/** hreflang pairs: each page that names alternates lists itself, every alternate is a page of the site that names it
 * back, and x-default is among them. pages: Map of url -> html. Returns [url, message] pairs. */
export function hreflangProblems(pages) {
  const out = []
  const alternates = new Map()
  for (const [url, html] of pages) {
    const head = html.split(/<\/head>/i)[0]
    const list = [...head.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [m[1], m[2]])
    if (list.length) alternates.set(url, list)
  }
  for (const [url, list] of alternates) {
    const self = `https://vgraphics.gr${url}`
    if (!list.some(([, href]) => href === self)) out.push([url, 'hreflang: the page does not list itself'])
    if (!list.some(([lang]) => lang === 'x-default')) out.push([url, 'hreflang: no x-default'])
    for (const [lang, href] of list) {
      const target = href.startsWith('https://vgraphics.gr/') ? href.slice('https://vgraphics.gr'.length) : null
      if (!target || !pages.has(target)) out.push([url, `hreflang ${lang}: ${href} is no page of the site`])
      else if (target !== url && !alternates.get(target)?.some(([, h]) => h === self)) out.push([url, `hreflang ${lang}: ${href} does not name this page back`])
    }
  }
  return out
}

/** Indexable pages no other page of the site links to (Google finds a page by a link or the sitemap, and ranks the ones
 * the site itself points to). pages: Map of url -> html, every page (noindex ones link too); indexable: the urls that may
 * be indexed. Returns the orphan urls. */
export function orphanPages(pages, indexable) {
  const linked = new Set()
  for (const [url, html] of pages) {
    for (const [, ref] of html.matchAll(/\shref="([^"#?]*)[^"]*"/g)) {
      if (!ref || /^([a-z]+:|\/\/)/i.test(ref)) continue
      const base = ref.startsWith('/') ? ref : new URL(ref, `https://vgraphics.gr${url}`).pathname
      const target = base.replace(/index\.html$/, '')
      if (target !== url) linked.add(target)
    }
  }
  return [...indexable].filter((u) => u !== '/' && !linked.has(u))
}
