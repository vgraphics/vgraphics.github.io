// Writes a page for each of a product's styles, <product>/styles/<slug>/page.json, and the style tiles on its landing
// page, both from <product>/styles/styles.json (each style's name, price, words and picture), so the two never differ.
// tools/build-pages.mjs then makes the pages from the template like any other page (George, 25 Oct 2026, on the
// Speedometer web ideas page: "A page for every style", kept). Each page has the style live, from the product's try
// page (<product>/play/page.json) without the start-up and kept to its style, then its look, then the next styles.
// Until styles.json says "published": true the pages stay out of search and the sitemap, and the landing tiles open the
// try page; then the tiles open the pages. They go live with the Play release that has the styles.
// Usage: node tools/make-style-pages.mjs, then node tools/build-pages.mjs <product> and node tools/build-sitemap.mjs.
// check-site fails while a page.json or the tiles differ from what this writes. Words take {name}, {others}, {price}
// and {count}.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { products, root } from './lib/product.mjs'
import { imageSize } from './lib/image-size.mjs'

const TITLE_MAX = 60
const DESCRIPTION_MAX = 160
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const read = (...p) => JSON.parse(readFileSync(join(root, ...p), 'utf8'))
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m))
const list = (names) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`)

// The products with styles: a folder with styles/styles.json beside its page.json.
export const styled = () => products().filter((slug) => existsSync(join(root, slug, 'styles', 'styles.json')))

function stylePage(slug, data, landing, demo, i) {
  const s = data.styles[i]
  const w = data.words
  const site = 'https://vgraphics.gr'
  const home = `/${slug}/`
  const url = `${site}/${slug}/styles/${s.slug}/`
  const price = demo.prices?.premium ?? ''
  const others = data.styles.filter((o) => o.free && o !== s).map((o) => o.name)
  const values = { name: s.name, others: list(others), price, count: data.styles.length }
  const title = `${s.name} ${w.titleTail}: ${s.seoTitle}`
  const description = `${s.name}: ${s.summary}. ${w.descriptionTail} ${s.free ? 'Free.' : `${price}, once.`}`
  if (title.length > TITLE_MAX) throw new Error(`${s.slug}: the title is ${title.length} characters (at most ${TITLE_MAX}): "${title}"`)
  if (description.length > DESCRIPTION_MAX) throw new Error(`${s.slug}: the description is ${description.length} characters (at most ${DESCRIPTION_MAX}): "${description}"`)
  const card = `/${slug}/img/styles/cards/${s.slug}.jpg`
  // A style's tile on another page of the product: its picture's address made absolute.
  const linked = (o) => {
    const t = tile(slug, o, price)
    return { ...t, image: { ...t.image, src: `/${slug}/${t.image.src}` } }
  }
  const next = [1, 2, 3, 4].map((n) => data.styles[(i + n) % data.styles.length])
  const priced = s.free ? w.free : w.paid
  const { type, startup, labels, ...given } = demo
  const { unlock, ...words } = labels ?? {}
  return {
    title,
    description,
    ...(data.published ? {} : { robots: 'noindex' }),
    social: {
      title: `${s.name}, a ${landing.site.name} style`,
      description: s.tagline,
      image: card,
      imageAlt: `The ${s.name} style of ${landing.site.name}, as the app draws it, over the night drive of its key art`,
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#page`,
          url,
          name: title,
          description,
          primaryImageOfPage: `${site}${card}`,
          about: { '@id': `${site}${home}#app` },
        },
        { '@type': 'MobileApplication', '@id': `${site}${home}#app`, name: landing.site.name, url: `${site}${home}` },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'VGraphics', item: `${site}/` },
            { '@type': 'ListItem', position: 2, name: landing.site.parent.name, item: `${site}${landing.site.parent.href}` },
            { '@type': 'ListItem', position: 3, name: landing.site.name, item: `${site}${home}` },
            { '@type': 'ListItem', position: 4, name: 'Styles', item: `${site}${home}#styles` },
            { '@type': 'ListItem', position: 5, name: s.name, item: url },
          ],
        },
      ],
    },
    hero: {
      title: `${s.name}, a ${landing.site.name} style`,
      lead: s.lead,
      align: 'left',
      badges: [{ href: '#live', label: 'See it live', icon: 'down', button: true }, 'google-play'],
    },
    sections: [
      {
        id: 'live',
        eyebrow: 'Live',
        title: `${s.name}, live`,
        intro: `${s.tagline} ${fill(w.liveIntro, values)}`,
        blocks: [{ type, ...given, referrer: data.referrer, startup: false, style: s.id, labels: words }],
      },
      {
        id: 'look',
        eyebrow: w.lookEyebrow,
        title: `About ${s.name}`,
        intro: s.look,
        blocks: [
          { type: 'gallery', items: [{ ...linked(s).image, caption: `${s.name}, drawn by the app itself` }] },
          { type: 'features', items: [priced, ...w.features].map((f) => ({ title: fill(f.title, values), text: fill(f.text, values) })) },
        ],
      },
      {
        id: 'more',
        eyebrow: 'Styles',
        title: 'More styles',
        intro: fill(w.moreIntro, values),
        blocks: [{ type: 'cards', layout: 'tile', items: next.map(linked) }],
        more: { href: `${home}#styles`, label: fill(w.allStyles, values) },
      },
    ],
  }
}

// A style's tile, as the landing page lists it: its picture at its own size, its price, its line, and where it opens.
function tile(slug, s, price, published = true) {
  const src = `img/styles/${s.image}.webp`
  const size = imageSize(join(root, slug, src))
  if (!size) throw new Error(`${slug}/${src}: missing or unreadable`)
  return {
    image: { src, alt: `The ${s.name} style, as the wallpaper draws it`, width: size.width, height: size.height },
    title: s.name,
    tag: s.free ? 'Free' : price,
    text: s.tagline,
    href: published ? `/${slug}/styles/${s.slug}/` : `/${slug}/play/#style=${s.id}`,
    ...(s.free ? {} : { tagTone: 'alt' }),
  }
}

// Every file this writes, as it should be now: [{ file, text }]. check-site compares them with the files.
export function styleSources() {
  return styled().flatMap((slug) => {
    const data = read(slug, 'styles', 'styles.json')
    const landing = read(slug, 'page.json')
    const demo = read(slug, 'play', 'page.json').sections.flatMap((s) => s.blocks ?? []).find((b) => b.type === 'try')
    if (!demo) throw new Error(`${slug}/play/page.json has no try block for the style pages to show`)
    const section = landing.sections.find((s) => s.id === 'styles')
    const tiles = section?.blocks.find((b) => b.type === 'cards' && b.layout === 'tile')
    if (!tiles) throw new Error(`${slug}/page.json has no "styles" section with a tile cards block for the styles`)
    tiles.items = data.styles.map((s) => tile(slug, s, demo.prices?.premium ?? '', data.published))
    return [
      { file: join(slug, 'page.json'), text: json(landing) },
      ...data.styles.map((s, i) => ({ file: join(slug, 'styles', s.slug, 'page.json'), text: json(stylePage(slug, data, landing, demo, i)) })),
    ]
  })
}

// Style pages styles.json no longer lists: their folders under <product>/styles/.
export const strayStylePages = () => styled().flatMap((slug) => {
  const listed = new Set(read(slug, 'styles', 'styles.json').styles.map((s) => s.slug))
  return readdirSync(join(root, slug, 'styles'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !listed.has(d.name)).map((d) => join(slug, 'styles', d.name))
})

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const { file, text } of styleSources()) {
    mkdirSync(dirname(join(root, file)), { recursive: true })
    writeFileSync(join(root, file), text)
    console.log(file.replace(/\\/g, '/'))
  }
  for (const dir of strayStylePages()) console.warn(`${dir.replace(/\\/g, '/')}: not in styles.json any more; delete it`)
}
