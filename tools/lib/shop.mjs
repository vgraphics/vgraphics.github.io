// Amazon affiliate links (George, 11 Nov 2026, gear tips: "C", the before-and-after with the film's link on it and a dash
// mat row; the same pick as the app's "Seeing double?" card, SpeedometerWallpaper docs/hud-mode/design.md §6). A product's
// tip may point at a thing to buy on amazon.de: the HUD film for Speedometer's double image, a non-slip dash mat that
// keeps the phone flat in HUD mode. Every link:
// - is https://www.amazon.de/dp/<ASIN>?tag=<Associates tracking id>;
// - opens in a new tab as a paid link, target="_blank" rel="sponsored noopener";
// - carries an "Ad" mark;
// - sits above the Associates line, "As an Amazon Associate, VGraphics earns from qualifying purchases.", wherever it is.
// The ASINs and the tag live here alone (the app keeps its own copy: logic_constants HudGearConstants in the Games repo).
// OPEN: the film's ASIN and the amazon.de Associates tracking id aren't known yet. Their placeholders hold _TODO, and a
// link holding one is never written: its chip, its row, its Ad mark and the Associates line all stay off until it's
// real. check-site fails a page with an Amazon link that opens in the same tab, isn't sponsored, has no Associates line
// or holds a placeholder (shopPageProblems), and a block naming an item this file doesn't know (shopProblems).
import { esc } from './partials.mjs'

export const PLACEHOLDER = '_TODO'
// OPEN: VGraphics' amazon.de Associates tracking id (George signs up; it ends in -21).
export const ASSOCIATES_TAG = 'ASSOCIATES_TAG_TODO'
export const DISCLOSURE = 'As an Amazon Associate, VGraphics earns from qualifying purchases.'

// The things a page may link to, by id, each with its amazon.de ASIN.
export const ITEMS = {
  // OPEN: the HUD film George picks.
  'speedometer-hud-film': { asin: 'FILM_ASIN_TODO' },
  // JIMISHA non-slip dash mat, PU gel (George's pick on the gear-tips review page, 11 Nov 2026).
  'speedometer-dash-mat': { asin: 'B08C572S2B' },
}

export const shopUrl = (id) => `https://www.amazon.de/dp/${ITEMS[id].asin}?tag=${ASSOCIATES_TAG}`

// A link is written only when its item is known and holds no placeholder.
export const isReady = (id) => Boolean(ITEMS[id]) && !shopUrl(id).includes(PLACEHOLDER)

const line = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
const EXTERNAL = line('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>')
// A row's picture, a line icon (a row's "icon" names one): mat, a phone lying flat on a mat.
const ICONS = {
  mat: line('<rect x="2.5" y="14.5" width="19" height="4.5" rx="2.25"/><rect x="6.5" y="11" width="11" height="3.5" rx="1.2"/>'),
}
const AD = '<span class="ad-mark" aria-hidden="true">Ad</span>'
const link = (id, label) => `href="${esc(shopUrl(id))}" target="_blank" rel="sponsored noopener" aria-label="${esc(`Ad: ${label} on Amazon (opens in a new tab)`)}"`

// The chip on a before-and-after's "after" side (tools/lib/compare.mjs): shop { item, label }.
export const shopChip = (shop) => (shop && isReady(shop.item) ? `<a class="shop-chip" ${link(shop.item, shop.label)}>${AD}<span>${esc(shop.label)}</span>${EXTERNAL}</a>` : '')

// A row with a line icon, its title and words, and its button with the Ad mark beside it: { item, icon, title, text,
// label }.
export const shopRow = (r) => (isReady(r.item) ? `<li class="shop-row">${ICONS[r.icon] ? `<span class="shop-icon">${ICONS[r.icon]}</span>` : ''}<span class="shop-words"><b>${esc(r.title)}</b><span>${esc(r.text)}</span></span><span class="shop-act"><a class="shop-btn" ${link(r.item, r.label)}>${esc(r.label)}${EXTERNAL}</a>${AD}</span></li>` : '')

// The Associates line under the links a block shows (ids: the items it links to); nothing when it shows none.
export function disclosure(ids) {
  const shown = ids.filter((id) => id && isReady(id)).length
  return shown ? `<p class="shop-disc">${shown > 1 ? 'Affiliate links.' : 'Affiliate link.'} ${DISCLOSURE}</p>` : ''
}

// What's wrong with a block's shop link (check-site): an item this file doesn't know, or one without its words.
export function shopProblems(shop, what = 'shop') {
  const problems = []
  if (!ITEMS[shop?.item]) problems.push(`its ${what} names "${shop?.item}", not an item tools/lib/shop.mjs knows`)
  if (!shop?.label) problems.push(`its ${what} needs a label`)
  return problems
}

// What's wrong with a page's Amazon links (check-site): each opens in a new tab, as rel="sponsored noopener", holds no
// placeholder, and the page says the Associates line.
export function shopPageProblems(html) {
  const problems = []
  const links = [...html.matchAll(/<a\b[^>]*\shref="https?:\/\/(?:www\.)?amazon\.[^"]*"[^>]*>/gi)].map((m) => m[0])
  for (const a of links) {
    const href = a.match(/\shref="([^"]*)"/)[1]
    const rel = a.match(/\srel="([^"]*)"/)?.[1].split(/\s+/) ?? []
    if (!/\starget="_blank"/.test(a)) problems.push(`the Amazon link ${href} opens in the same tab: give it target="_blank"`)
    if (!rel.includes('sponsored') || !rel.includes('noopener')) problems.push(`the Amazon link ${href} isn't rel="sponsored noopener"`)
    if (href.includes(PLACEHOLDER)) problems.push(`the Amazon link ${href} holds a placeholder (${PLACEHOLDER})`)
  }
  if (links.length && !html.includes(DISCLOSURE)) problems.push(`Amazon links without the Associates line: "${DISCLOSURE}"`)
  return problems
}
