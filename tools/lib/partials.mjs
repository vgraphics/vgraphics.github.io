// The pieces every page of a product shares, for tools/build-pages.mjs and the wikis: the header with only the
// product's own logo top left (George's rule, 22 Oct 2026), the footer with the company's legal line, and the theme's
// decorative ornaments. Text from page.json is trusted HTML from this repo; esc() is for attribute values.
import { readFileSync } from 'node:fs'

export const esc =(s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const LEGAL = '&copy; 2026 VGRAPHICS SINGLE MEMBER P.C. · G.E.MI. no. 181823306000 · VAT no. EL802736373 · Kalamaria, Greece · <a href="/company/">Company information</a> · <a href="/privacy/">Privacy</a>'

// The product's logo and menu. current: the menu link of the page shown (an href). onArt: the header lies over the
// key art, in the pack's on-art colours.
export function header({ page }, { current } = {}) {
  const s = page.site
  const links = s.nav.map((n) => `<a${n.wide ? ' class="wide-only"' : ''} href="${esc(n.href)}"${n.href === current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`)
  return `<header class="top">
    <a class="product-name" href="${esc(s.nav[0].href)}"><img src="${esc(s.icon)}" alt="" width="36" height="36"><span>${esc(s.name)}</span></a>
    <nav class="subnav" aria-label="${esc(s.name)}">
      ${links.join('\n      ')}
    </nav>
  </header>`
}

// The footer is styled like the hero (George, 22 Oct 2026): a picture generated from the key art (page.json footerArt:
// { src, widths, width, height, position }, with src-<width>.avif and .webp files) fades in from the page. Over its foot,
// centred (George picked layout B): the product's logo, one row of links, round buttons for its stores and the
// studio's channels, then the legal line.
export function footer({ page }) {
  const s = page.site
  // The product's own pages (its menu, without Overview, under the footer's names for them), then the studio's.
  const own = new Map(s.nav.slice(1).map((n) => [n.href, n.label]))
  for (const l of s.footer) own.set(l.href, l.label)
  const links = [...own, [s.parent.href, `More ${s.parent.name.toLowerCase()}`], ['/services/', 'Work with us'], ['mailto:gvergidis90@gmail.com', 'Contact']]
  const play = page.stores?.googlePlay ? '<br>Google Play and the Google Play logo are trademarks of Google LLC.' : ''
  const a = page.footerArt
  // The picture fills the footer, about clamp(240px, 30vw, 600px) of art above the links plus the links themselves
  // (assets/product.css), so it is shown at the width that covers that box.
  const r = a && a.width / a.height
  const sizes = a && `max(100vw, calc((clamp(240px, 30vw, 600px) + 260px) * ${r.toFixed(2)}))`
  const art = a ? `
    ${ornament(a, 'foot-art', sizes, `--foot-at: ${a.position}`)}` : ''
  return `<footer class="foot${a ? ' has-art' : ''}">${art}
    <div class="wrap">
      <a class="foot-brand" href="${esc(s.nav[0].href)}"><img src="${esc(s.icon)}" alt="" width="48" height="48"><span>${esc(s.name)}</span></a>
      <nav class="foot-links" aria-label="${esc(s.name)} and VGraphics">
        ${links.map(([href, label]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('\n        ')}
      </nav>${buttons(page)}
      <p class="legal">${LEGAL}${play}</p>
    </div>
  </footer>`
}

// The product's stores, as round icon buttons beside the channels: a store appears once page.json's stores names it
// (googlePlay now, appStore once there is an Apple developer account).
const STORES = {
  googlePlay: ['on Google Play', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M6 9.5h12V18a1 1 0 0 1-1 1h-1v2.5a1.5 1.5 0 0 1-3 0V19h-2v2.5a1.5 1.5 0 0 1-3 0V19H7a1 1 0 0 1-1-1zM3.5 9.5A1.5 1.5 0 0 1 5 11v4.5a1.5 1.5 0 0 1-3 0V11a1.5 1.5 0 0 1 1.5-1.5zm17 0A1.5 1.5 0 0 1 22 11v4.5a1.5 1.5 0 0 1-3 0V11a1.5 1.5 0 0 1 1.5-1.5zM6.2 8.5a6 6 0 0 1 3.1-4.6l-1-1.8a.4.4 0 0 1 .7-.4l1 1.8a6.5 6.5 0 0 1 4 0l1-1.8a.4.4 0 0 1 .7.4l-1 1.8a6 6 0 0 1 3.1 4.6zM9.5 6.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6zm5 0a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z"/></svg>'],
  appStore: ['on the App Store', '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z"/></svg>'],
}

function buttons(page) {
  const stores = Object.entries(STORES).filter(([key]) => page.stores?.[key])
    .map(([key, [where, icon]]) => `<a href="${esc(page.stores[key])}" aria-label="${esc(page.site.name)} ${where}" title="${esc(page.site.name)} ${where}">${icon}</a>`)
  const all = [...stores, ...social(page)]
  return all.length ? `
      <div class="foot-icons">${all.join('')}</div>` : ''
}

// The studio's channels, as mono icons in the footer: the site-wide ones in tools/lib/site.json, which a product's
// page.json may override (site.social: { network: { label?, href } }). A network without a link isn't shown, so a
// channel appears the day its link is set. A new network needs its entry and an icon below.
const SITE = JSON.parse(readFileSync(new URL('./site.json', import.meta.url), 'utf8'))
const SOCIAL_ICONS = {
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.75 15.1V8.9L15.6 12z"/></svg>',
  spotify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.1 15.9a.7.7 0 0 1-1 .2c-2.7-1.6-6-2-10-1.1a.7.7 0 1 1-.3-1.4c4.3-1 8-.5 11 1.3.3.2.4.7.3 1zm1.4-3a.9.9 0 0 1-1.2.3c-3-1.9-7.7-2.4-11.3-1.3a.9.9 0 1 1-.5-1.7c4.1-1.2 9.2-.6 12.7 1.5.4.3.5.8.3 1.2zm.1-3.2C15 8.6 9 8.4 5.6 9.4a1 1 0 1 1-.6-2c3.9-1.2 10.5-1 14.6 1.5a1 1 0 1 1-1 1.8z"/></svg>',
}
const LINK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>'

function social(page) {
  const own = page.site.social ?? {}
  return Object.keys({ ...SITE.social, ...own }).map((network) => ({ network, ...SITE.social[network], ...own[network] }))
    .filter((c) => c.href)
    .map((c) => `<a href="${esc(c.href)}" aria-label="${esc(c.label ?? c.network)}" title="${esc(c.label ?? c.network)}">${SOCIAL_ICONS[c.network] ?? LINK_ICON}</a>`)
}

// A decorative piece of the theme's art: { src (path without the size and extension), width, height, widths? }.
// Each size exists as AVIF and WebP (WebP for browsers without AVIF; both keep transparency). Hidden from screen
// readers, lazy, and sized so nothing moves when it arrives.
export function ornament(o, cls, sizes, style) {
  const widths = o.widths || [o.width]
  const set = (ext) => widths.map((w) => `${o.src}-${w}.${ext} ${w}w`).join(', ')
  return `<div class="${cls}"${style ? ` style="${esc(style)}"` : ''} aria-hidden="true"><picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="${o.src}-${widths[widths.length - 1]}.webp" srcset="${set('webp')}" sizes="${sizes}" alt="" width="${o.width}" height="${o.height}" loading="lazy" decoding="async"></picture></div>`
}
