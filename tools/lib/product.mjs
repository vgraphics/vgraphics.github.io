// A product's sources for its pages: <product>/page.json (its words, links and pictures) and <product>/theme/theme.json
// (its theme pack). tools/build-pages.mjs builds the landing page from them, and the wikis read the same "site" block
// (name, icon, menu, footer links) and pack, so every page of a product looks and links alike.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

// Every product with a landing page made from the template, in folder order.
export const products = () => readdirSync(root).filter((d) => existsSync(join(root, d, 'page.json'))).sort()

export function loadProduct(slug) {
  const read = (...p) => JSON.parse(readFileSync(join(root, slug, ...p), 'utf8'))
  return { slug, page: read('page.json'), theme: read('theme', 'theme.json') }
}
