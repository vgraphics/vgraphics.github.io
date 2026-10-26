// The pieces every page of a product shares, for tools/build-pages.mjs and the wikis: the header with only the
// product's own logo top left (George's rule, 22 Oct 2026), the closing card and the footer with the company's legal
// line (the same on every page, George, 23 Oct 2026: "The foother must be same on all pages"), the store badges and
// buttons, and the theme's decorative ornaments. Text from page.json is trusted HTML from this repo; esc() is for
// attribute values.
import { readFileSync } from 'node:fs'

export const esc =(s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const LEGAL = '&copy; 2026 VGRAPHICS SINGLE MEMBER P.C. · G.E.MI. no. 181823306000 · VAT no. EL802736373 · Kalamaria, Greece · <a href="/company/">Company information</a> · <a href="/privacy/">Privacy</a>'

export const ICONS = {
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.6v12.8a1.1 1.1 0 0 0 1.7.93l10-6.4a1.1 1.1 0 0 0 0-1.86l-10-6.4A1.1 1.1 0 0 0 8 5.6z"/></svg>',
}

// Every section heading carries a link to itself (George, 22 Oct 2026: "All sections ... must have anchors and copy on
// click"); assets/anchors.js copies it, and without JavaScript it is a plain link. id: the section's (or heading's) id.
export const anchor = (id, title) => `<a class="anchor" href="#${id}" aria-label="Copy the link to ${esc(title.replace(/<[^>]+>/g, ''))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></a>`

// Badges and actions: "google-play", { href, label, note? } (a pill) or { href, label, icon?, button: true }.
export function actions(page, list, cls = 'badges') {
  return `<div class="${cls}">${list.map((b) => {
    if (b === 'google-play') return `<a class="gp" href="${esc(page.stores.googlePlay)}"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250"></a>`
    if (b.button) return `<a class="btn" href="${esc(b.href)}">${b.label}${b.icon ? ICONS[b.icon] : ''}</a>`
    return `<a class="pill" href="${esc(b.href)}"><b>${b.label}</b>${b.note ? `<small>${b.note}</small>` : ''}</a>`
  }).join('')}</div>`
}

// The last call to action, the card that stands half in the footer's picture: every page of a product ends with it
// and the footer, so the two read as one footer. cta is { title, text, badges }: the page's own, else the product's.
export function closing(page, cta = page.cta) {
  if (!cta) return ''
  return `<section class="cta-band" aria-labelledby="cta-title">
      <div class="wrap">
        <div class="panel">
          <h2 id="cta-title">${cta.title}</h2>
          ${cta.text ? `<p>${cta.text}</p>` : ''}
          ${actions(page, cta.badges)}
        </div>
      </div>
    </section>`
}

// The page's favicon and touch icon: page.json site.favicon and touchIcon (the product's <product>/assets/ files,
// tools/make-brand-assets.py), else its icon.
export const iconLinks = ({ site: s }) => `<link rel="icon" href="${esc(s.favicon ?? s.icon)}">
  <link rel="apple-touch-icon" href="${esc(s.touchIcon ?? s.icon)}">`

// The product's own logo (George's rule: only it, top left): page.json site.logo { src, widths, width, height }, the
// title as the product paints it, which carries the name; without one, its icon beside its typed name. height is the
// height it is shown at.
function brand(s, height, sizes) {
  if (!s.logo) return `<img src="${esc(s.icon)}" alt="" width="${height}" height="${height}"><span>${esc(s.name)}</span>`
  const l = s.logo
  return `<img class="logo" src="${esc(l.src)}-${l.widths.at(-1)}.webp" srcset="${l.widths.map((w) => `${esc(l.src)}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" alt="${esc(s.name)}" width="${Math.round(height * l.width / l.height)}" height="${height}">`
}

// The product's logo and menu. current: the menu link of the page shown (an href). onArt: the header lies over the
// key art, in the pack's on-art colours. On phones the menu folds into the button, which opens it as a panel
// (assets/menu.js, assets/product.css). A product that can be played or tried in the browser (page.json site.play:
// { label, href }) ends its menu with that page, drawn as its main button (George, 26 Oct 2026: "For all landing pages,
// when there is a play online/test online, make it a fancy primary button last on the toolbar buttons."), so it is the
// phone panel's last item too; its title names it where the button shows only its icon.
export function header({ page }, { current } = {}) {
  const s = page.site
  const links = s.nav.map((n) => `<a${n.wide ? ' class="wide-only"' : ''} href="${esc(n.href)}"${n.href === current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`)
  const p = s.play
  if (p) links.push(`<a class="play" href="${esc(p.href)}" title="${esc(p.label)}"${p.href === current ? ' aria-current="page"' : ''}>${ICONS.play}<span class="play-label">${esc(p.label)}</span></a>`)
  return `<header class="top">
    <a class="product-name" href="${esc(s.nav[0].href)}">${brand(s, 36, '150px')}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu"><span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span></button>
    <nav class="subnav" id="site-menu" aria-label="${esc(s.name)}">
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
  const links = [...own, [s.parent.href, `More ${s.parent.name.toLowerCase()}`], ['/services/', 'Work with us'], ['mailto:support@vgraphics.gr', 'Contact']]
  const play = page.stores?.googlePlay ? '<br>Google Play and the Google Play logo are trademarks of Google LLC.' : ''
  const a = page.footerArt
  // The picture fills the footer, about clamp(170px, 21vw, 420px) of art above the links plus the links themselves
  // (assets/product.css), so it is shown at the width that covers that box.
  const r = a && a.width / a.height
  const sizes = a && `max(100vw, calc((clamp(170px, 21vw, 420px) + 260px) * ${r.toFixed(2)}))`
  const art = a ? `
    ${ornament(a, 'foot-art', sizes, `--foot-at: ${a.position}`)}` : ''
  const f = page.footerScene && scene(page.footerScene)
  return `<footer class="foot${a || f ? ' has-art' : ''}${f ? ' has-scene' : ''}">${art}${f ? f.sky : ''}
    <div class="wrap">
      <a class="foot-brand" href="${esc(s.nav[0].href)}">${brand(s, 48, '230px')}</a>
      <nav class="foot-links" aria-label="${esc(s.name)} and VGraphics">
        ${links.map(([href, label]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('<span class="sep" aria-hidden="true">·</span>\n        ')}
      </nav>${buttons(page)}
      <p class="legal">${LEGAL}${play}</p>
    </div>${f ? f.band : ''}
  </footer>`
}

// A footer drawn as a scene instead of one picture (page.json "footerScene"; Palermo Noir, George, 24 Oct 2026: "a
// pattern 50px around side walk ... above it a 120px around sea which ends to a line like horizon ... Above foot
// elements the full moon. On the very bottom left, on the side walk stands the spy. Next to him some railings and a cat
// on them and on the right a full lamp animating a blinking light ... Animating clouds or rain or wind randomly"). Along
// its foot the sea and the sidewalk repeat sideways, so it fits any width; the figures stand on the sidewalk, the moon
// above them; assets/product.js picks the weather. footerScene: { height, walk: { height, src? }, sea: { height, src? },
// moon?, left: [figure], lamp?: figure + { lit?, glow: [x%, y%] }, weather: { kinds, cloud, leaf, rain } }, a figure
// being { src, width, height, show (its height in px on wide screens), flip? }, every src absolute. Every piece is a
// Recraft picture (George: "All graphics must be generated from recraft"); the page only places and moves them.
function scene(s) {
  const img = (p, cls, src = p.src) => `<img class="${cls}" src="${esc(src)}" alt="" width="${p.width}" height="${p.height}" style="--show: ${p.show}px" loading="lazy" decoding="async">`
  const strip = (p, cls) => `<span class="${cls}" style="background-image: url('${esc(p.src)}')"></span>`
  const l = s.lamp
  const lamp = l ? `
      <span class="fs-lamp" style="--show: ${l.show}px; --gx: ${l.glow[0]}%; --gy: ${l.glow[1]}%">${img(l, 'off')}${l.lit ? img(l, 'on', l.lit) : ''}<span class="glow"></span></span>` : ''
  const w = s.weather
  return {
    sky: `
    <div class="foot-weather" aria-hidden="true" data-kinds="${esc(w.kinds.join(' '))}" style="--cloud: url('${esc(w.cloud)}'); --leaf: url('${esc(w.leaf)}'); --rain: url('${esc(w.rain)}')"></div>`,
    band: `
    <div class="foot-scene" aria-hidden="true" style="--fs-h: ${s.height}px; --walk-h: ${s.walk.height}px; --sea-h: ${s.sea.height}px">
      ${s.moon ? img(s.moon, 'fs-moon') : ''}${strip(s.sea, 'fs-sea')}${strip(s.walk, 'fs-walk')}
      <span class="fs-left">${s.left.map((p) => img(p, `fs-fig${p.flip ? ' flip' : ''}`)).join('')}</span>${lamp}
    </div>`,
  }
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
