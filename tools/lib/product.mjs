// A product's sources for its pages: <product>/page.json (its words, links and pictures) and <product>/theme/theme.json
// (its theme pack). tools/build-pages.mjs builds the landing page from them, and the wikis read the same "site" block
// (name, icon, menu, footer links) and pack, so every page of a product looks and links alike.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { wikiArt } from './hero.mjs'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

// Every product with a landing page made from the template, in folder order.
export const products = () => readdirSync(root).filter((d) => existsSync(join(root, d, 'page.json'))).sort()

export function loadProduct(slug) {
  const read = (...p) => JSON.parse(readFileSync(join(root, slug, ...p), 'utf8'))
  return { slug, page: read('page.json'), theme: read('theme', 'theme.json') }
}

// A product's other pages made from the same template: <product>/<page>/page.json (exitwise/ranking, exitwise/room,
// exitwise/privacy), in folder order.
export const subpages = (slug) => readdirSync(join(root, slug), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(root, slug, d.name, 'page.json'))).map((d) => d.name).sort()

// A sub-page: its own words and sections, with the product's site block, stores, theme pack, footer art and closing
// card, and the product's key art in its hero unless it brings its own ("art": { "wiki": "<slug>", ... } opens on that
// wiki painting). The landing page's pictures are named from the product's folder, so they are made absolute here. Its
// address is /<product>/<page>/ unless page.json gives another ("path": "/exitwise/privacy.html", for an address the
// stores already link to).
export function loadSubpage(slug, sub) {
  const product = loadProduct(slug)
  const own = JSON.parse(readFileSync(join(root, slug, sub, 'page.json'), 'utf8'))
  const p = product.page
  const rebase = (img) => img && { ...img, src: img.src.startsWith('/') ? img.src : `/${slug}/${img.src}` }
  const { wiki, ...given } = own.hero?.art ?? {}
  const art = wiki ? wikiArt(slug, wiki, given) : own.hero?.art ?? p.hero.art
  const page = {
    ...own,
    site: p.site,
    stores: p.stores,
    footerArt: own.footerArt ?? p.footerArt,
    cta: own.cta ?? p.cta,
    path: own.path ?? `/${slug}/${sub}/`,
    hero: { ...own.hero, art: { ...art, tall: rebase(art.tall), wide: rebase(art.wide), ultra: rebase(art.ultra) } },
  }
  return { ...product, sub, page }
}

// The HTML files a page sets in itself: an "embed" block's piece of markup (exitwise/ranking/ranking.html) and a
// "document" block's copy of another repo's page (the game's privacy policy, as the Deployer copies it in). They are
// sources, not pages, so check-site and the sitemap pass over them.
export const pieces = () => products().flatMap((slug) => [null, ...subpages(slug)].flatMap((sub) => {
  const dir = sub ? join(slug, sub) : slug
  const page = JSON.parse(readFileSync(join(root, dir, 'page.json'), 'utf8'))
  return (page.sections ?? []).flatMap((s) => s.blocks ?? [])
    .flatMap((b) => (b.type === 'embed' ? [`${b.src}.html`] : b.type === 'document' ? [b.src] : []))
    .map((f) => join(dir, f))
}))
