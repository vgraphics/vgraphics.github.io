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
  soundcloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/></svg>',
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
