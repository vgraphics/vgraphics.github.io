// A product's sources for its pages: <product>/page.json (its words, links and pictures) and <product>/theme/theme.json
// (its theme pack). tools/build-pages.mjs builds the landing page from them, and the wikis read the same "site" block
// (name, icon, menu, footer links) and pack, so every page of a product looks and links alike.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readCursors } from './cursors.mjs'
import { wikiArt } from './hero.mjs'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

// Every product with a landing page made from the template, in folder order.
export const products = () => readdirSync(root).filter((d) => existsSync(join(root, d, 'page.json'))).sort()

// cursors: its theme pack's cursor pictures as theme.css tokens, and what's wrong with them (tools/lib/cursors.mjs)
export function loadProduct(slug) {
  const read = (...p) => JSON.parse(readFileSync(join(root, slug, ...p), 'utf8'))
  return { slug, page: read('page.json'), theme: read('theme', 'theme.json'), cursors: readCursors(join(root, slug, 'theme'), `/${slug}/theme`) }
}

// A product's other pages made from the same template: <product>/<page>/page.json (exitwise/ranking, exitwise/room,
// exitwise/privacy), and the pages of a group, <product>/<group>/<page>/page.json, when the group's folder has no
// page.json of its own (speedometer-wallpaper/styles/vintage), named "<group>/<page>"; in folder order.
const folders = (dir) => readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
export const subpages = (slug) => folders(join(root, slug)).flatMap((name) => {
  if (existsSync(join(root, slug, name, 'page.json'))) return [name]
  return folders(join(root, slug, name)).filter((page) => existsSync(join(root, slug, name, page, 'page.json'))).map((page) => `${name}/${page}`)
}).sort()

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
    footerScene: own.footerScene ?? p.footerScene,
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

// The intro demos a product's pages set in their stage (page.json intro.demo: exitwise/demo/board.html, with its .css and
// .js beside it), which tools/build-pages.mjs sets into the page: pieces, not pages. Any other HTML in a product's demo/
// folder is a page of its own (Palermo Noir's guided demo, /palermo/demo/, which the Deployer's palermo-web publishes).
export const demoPieces = () => products().flatMap((slug) => [null, ...subpages(slug)].flatMap((sub) => {
  const dir = sub ? join(slug, sub) : slug
  const page = JSON.parse(readFileSync(join(root, dir, 'page.json'), 'utf8'))
  return page.intro?.demo ? [join(dir, `${page.intro.demo}.html`)] : []
}))

// The "document" blocks' copies alone, each with the address of the page it is set into, the page (slug, sub) and
// where the copy comes from (the block's from, { repo, path }; tools/sync-documents.mjs): { file, url, slug, sub, from }.
export const documents = () => products().flatMap((slug) => [null, ...subpages(slug)].flatMap((sub) => {
  const dir = sub ? join(slug, sub) : slug
  const page = JSON.parse(readFileSync(join(root, dir, 'page.json'), 'utf8'))
  const path = page.path ?? (sub ? `/${slug}/${sub}/` : `/${slug}/`)
  return (page.sections ?? []).flatMap((s) => s.blocks ?? []).filter((b) => b.type === 'document')
    .map((b) => ({ file: join(dir, b.src), url: `https://vgraphics.gr${path}`, slug, sub, from: b.from }))
}))
