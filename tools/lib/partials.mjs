// The pieces every page of a product shares, for tools/build-pages.mjs and the wikis: the header with only the
// product's own logo top left (George's rule, 22 Oct 2026), the closing card and the footer with the company's legal
// line (the same on every page, George, 23 Oct 2026: "The foother must be same on all pages"; a product's screens, its
// try page, carry the short one, tools/lib/legal.mjs), the store badges and buttons, and the theme's decorative
// ornaments. Text from page.json is trusted HTML from this repo; esc() is for attribute values.
import { readFileSync } from 'node:fs'
import { isProductScreen, PRODUCT_LEGAL } from './legal.mjs'
import { helpLink, mailList } from './mail-list.mjs'

export const esc =(s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const LEGAL = '&copy; 2026 VGRAPHICS SINGLE MEMBER P.C. All rights reserved · G.E.MI. no. 181823306000 · VAT no. EL802736373 · Kalamaria, Greece · <a href="/company/">Company information</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms of use</a>'

export const ICONS = {
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.6v12.8a1.1 1.1 0 0 0 1.7.93l10-6.4a1.1 1.1 0 0 0 0-1.86l-10-6.4A1.1 1.1 0 0 0 8 5.6z"/></svg>',
}

// Every section heading carries a link to itself (George, 22 Oct 2026: "All sections ... must have anchors and copy on
// click"); assets/anchors.js copies it, and without JavaScript it is a plain link. id: the section's (or heading's) id.
export const anchor = (id, title) => `<a class="anchor" href="#${id}" aria-label="Copy the link to ${esc(title.replace(/<[^>]+>/g, ''))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></a>`

// The quote's play button (a pause while it speaks)
export const PLAY_PAUSE = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 5.3v13.4a1.2 1.2 0 0 0 1.8 1l10.4-6.7a1.2 1.2 0 0 0 0-2L10 4.3a1.2 1.2 0 0 0-1.8 1z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="5.6" y="4.6" width="4.6" height="14.8" rx="1.7"/><rect x="13.8" y="4.6" width="4.6" height="14.8" rx="1.7"/></svg>'

// A line said in the product, set large across the content's width, with a small play button after its last word
// when the page has the recording (assets/product.js plays it, one recording at a time; listen is the button's name
// for screen readers): { text, by?, audio?, listen? }. A landing page's quote block and a wiki entry's quotes (a role's
// own lines in its own voice, George, 28 Oct 2026: "In palermo wiki, in any character, have a quote with play button to
// hear his voice. Same way we do in overview page.") are this one piece. George, 24 Oct 2026: "a small play/pause next
// to quotes".
export function quote(b) {
  const cut = b.text.lastIndexOf(' ') + 1
  const text = b.audio ? `${b.text.slice(0, cut)}<span class="quote-end">${b.text.slice(cut)}<button class="quote-play" type="button" data-voice="${esc(b.audio)}" aria-pressed="false" aria-label="${esc(b.listen ?? 'Listen')}">${PLAY_PAUSE}</button></span>` : b.text
  return `<figure class="sec-quote">
          <blockquote><p>${text}</p></blockquote>${b.by ? `
          <figcaption>${b.by}</figcaption>` : ''}
        </figure>`
}

// A product's play and try buttons: page.json site.play { label, href, soon? }, and site.demo { label, href } for one
// that also has a guided demo (Palermo Noir, George, 27 Oct 2026: "Build the demo button. Its different from play
// online. Build both buttons and for play now say Coming soon."). The main button (the header's last item, the landing
// pages' .play-cta) is the one that can be played now: site.play, or the demo while site.play.soon holds the words the
// game shows until it opens ("Coming soon"). The second sits beside it: before the game opens, the game itself as a
// quiet chip that leads nowhere; after, the demo as a link ringed in the button's colour. Taking soon out of page.json
// opens the game everywhere at once: it becomes the main button and the demo the second.
// A demo can be private (site.demo.private: true; George, 27 Oct 2026, on Palermo Noir's: "palermo demo must only show
// if i am logged in with garithos account. Else hide it."): then the pair is as if there were no demo, and only the
// testers' (tester: true) has it. The pages carry the demo's buttons inside private templates (forTesters), which
// assets/private.js opens for the VHub accounts it lists; nobody else gets a button, badge or link to it. Taking
// private out of page.json makes the demo public everywhere at once.
export function playButtons(site = {}, { tester = false } = {}) {
  const demo = site.demo?.private && !tester ? undefined : site.demo
  const open = site.play && !site.play.soon ? site.play : undefined
  return { main: open ?? demo, second: open ? demo : site.play }
}

// Markup only the testers see while the product's demo is private (assets/private.js puts it in the page for them):
// inert in a <template>, so it shows, links and counts for nobody else, search engines included.
const forTesters = (site, html) => (site.demo?.private ? `<template class="private">${html}</template>` : html)

// Words about the demo in page.json's and faq.json's texts, <span data-demo>…</span>: left out while the demo is
// private, shown as words once it is public.
export const demoText = (site, html) => (site?.demo?.private ? html.replace(/\s*<span data-demo>[\s\S]*?<\/span>/g, '') : html.replace(/<span data-demo>([\s\S]*?)<\/span>/g, '$1'))

// The VHub entry, one piece on every product's pages: "Get your VHub name" to the hub for everyone, and a signed-in
// player's own VHub name and picture, linking to their profile, once assets/vhub.js finds their session (George, 28 Oct
// 2026: "I am logged in. Shouldnt it show my name and avatar here? And this must be in exitwise page and speedometer
// page too right?"). chip: as a chip of the links block; else a pill, as in a closing card's badges.
const PERSON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/></svg>'
export const vhubEntry = (chip = false) => `<a class="vhub-entry${chip ? '' : ' pill'}" href="/hub/" data-vhub><span class="vhub-face" aria-hidden="true">${PERSON}</span><span class="vhub-words"><b class="vhub-name">${chip ? 'Your VHub name' : 'Get your VHub name'}</b>${chip ? '' : '<small class="vhub-note">Your name in every room</small>'}</span></a>`

// The VHub avatar, the last item of every header (George, 28 Oct 2026: "All pages must show the VHub avatar clickable on
// top right after any play or try button."; VHub docs/superpowers/specs/2026-10-28-vhub-settings-sync-design.md 4.1):
// the VHub mark until assets/account.js finds a signed-in player and draws their picture and level, and the menu it
// opens. The company header (index.html and its copies) carries the same button, word for word.
export const VHUB_AVATAR = '<button class="vhub-avatar" type="button" aria-haspopup="dialog" aria-label="Sign in to VHub"><span class="vhub-avatar-face" aria-hidden="true"><svg viewBox="339.250 238.250 298.000 291.750" aria-hidden="true" focusable="false"><path d="M528.806 238.776C540.432 237.926 552.868 238.894 564.552 238.548C581.31 238.05 597.378 241.667 611.012 251.809C624.565 261.908 633.5 277.022 635.812 293.765C637.217 303.315 637.503 340.929 635.433 349.939C634.086 355.706 631.54 361.125 627.963 365.843C620.561 375.583 611.15 379.843 599.429 381.541C578.369 382.218 554.858 381.672 533.617 381.611C528.672 357.238 516.281 344.209 491.258 340.543C491.488 322.851 491.154 305.149 491.281 287.455C491.325 281.327 491.258 275.156 492.522 269.13C493.756 263.258 496.339 257.753 500.067 253.051C507.685 243.462 517.195 240.021 528.806 238.776Z" fill="#EF6866"/><path d="M403.995 238.83C405.34 238.772 406.687 238.728 408.033 238.699C429.002 238.296 458.621 235.135 473.669 249.866C478.454 254.558 481.879 260.46 483.58 266.943C486.034 276.274 485.219 327.421 485.275 339.96C460.602 344.715 447.389 356.683 443.068 381.694L423.938 381.625C387.289 381.547 344.76 390.134 340.224 340.009C335.775 290.835 344.888 242.245 403.995 238.83Z" fill="#FCBB09"/><path d="M533.604 388.297C551.582 388.104 599.046 385.607 613.494 391.889C623.026 396.034 630.151 403.774 633.818 413.471C638.235 425.151 637.905 462.831 635.773 475.901C634.784 481.822 633.01 487.585 630.496 493.036C622.501 510.469 609.4 520.262 591.871 526.76C574.424 531.876 556.316 529.078 538.161 529.87C525.125 530.438 512.189 528.068 502.579 518.312C497.869 513.52 494.545 507.542 492.959 501.014C490.42 490.883 491.367 443.059 491.383 429.717C515.423 426.378 529.933 412.375 533.604 388.297Z" fill="#4C3B9D"/><path d="M420.692 388.13L442.952 387.955C447.191 413.659 460.191 425.04 485.23 429.747L485.305 483.779C485.243 497.212 483.569 508.778 473.313 518.707C468.436 523.421 462.405 526.769 455.825 528.414C446.881 530.651 416.177 529.662 405.018 529.579C367.154 529.531 338.464 499.279 340.299 461.526C341.365 440.478 335.326 415.971 352.147 399.482C368.237 383.709 399.064 388.068 420.692 388.13Z" fill="#4792EF"/></svg></span></button>'

// Badges and actions: "google-play", "vhub" (the VHub entry), { href, label, note? } (a pill) or { href, label, icon?,
// button: true }. A pill to
// the product's main play or try page (playButtons) is its play button instead, the header's (assets/product.css
// .play-cta: George, 27 Oct 2026, "A, Clean"), with its note as a small line under the row; a pill to the second is
// the second button (.demo-cta, or the game's .soon-cta while it is coming soon, without a note), and of the two the
// main one comes first, wherever page.json lists them.
export function actions(page, list, cls = 'badges') {
  const { main, second } = playButtons(page.site, { tester: true })
  const at = (p) => (p ? list.findIndex((b) => b.href === p.href) : -1)
  const [m, s] = [at(main), at(second)]
  if (s >= 0 && m > s) list = list.map((b, i) => (i === m ? list[s] : i === s ? list[m] : b))
  // A private demo's badge and its note are the testers' alone.
  const own = (b, html) => (b.href === page.site.demo?.href ? forTesters(page.site, html) : html)
  const notes = []
  const items = list.map((b) => {
    if (b === 'google-play') return `<a class="gp" href="${esc(page.stores.googlePlay)}"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250"></a>`
    if (b === 'vhub') return vhubEntry()
    if (b.button) return `<a class="btn" href="${esc(b.href)}">${b.label}${b.icon ? ICONS[b.icon] : ''}</a>`
    if (main && b.href === main.href) {
      if (b.note) notes.push(own(b, `<small class="play-note">${b.note}</small>`))
      return own(b, `<a class="play-cta" href="${esc(b.href)}">${ICONS.play}<span>${b.label}</span></a>`)
    }
    if (second && b.href === second.href) {
      if (second.soon) return `<span class="soon-cta"><span>${b.label}</span><small>${esc(second.soon)}</small></span>`
      return own(b, `<a class="demo-cta" href="${esc(b.href)}">${b.label}</a>`)
    }
    return own(b, `<a class="pill" href="${esc(b.href)}"><b>${b.label}</b>${b.note ? `<small>${b.note}</small>` : ''}</a>`)
  })
  return `<div class="${cls}">${items.join('')}${notes.join('')}</div>`
}

// The last call to action, the card that stands half in the footer's picture: every page of a product ends with it
// and the footer, so the two read as one footer. cta is { title, text, badges }: the page's own, else the product's.
export function closing(page, cta = page.cta) {
  if (!cta) return ''
  return `<section class="cta-band" aria-labelledby="cta-title">
      <div class="wrap">
        <div class="panel">
          <h2 id="cta-title">${cta.title}</h2>
          ${cta.text ? `<p>${demoText(page.site, cta.text)}</p>` : ''}
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
// key art, in the pack's on-art colours. On phones, and wherever the row doesn't fit, the menu folds into the button,
// which opens it as a panel (assets/menu.js, assets/product.css); every link shows wherever it fits (a nav entry's
// "wide" only marks it wide-only, a secondary link). A product that can be played or tried in the browser (page.json
// site.play: { label, href }) ends its menu with that page, drawn as its main button (George, 26 Oct 2026: "For all
// landing pages, when there is a play online/test online, make it a fancy primary button last on the toolbar
// buttons."), so it is the phone panel's last item too; a product with a demo as well has the second button just
// before it (playButtons, above), which stays in the panel when the main one moves to the folded bar. On a product
// screen (page.json "screen"), with no art behind it and nothing to scroll, it is the frosted bar from the first frame.
export function header({ page }, { current } = {}) {
  const s = page.site
  const links = s.nav.map((n) => `<a${n.wide ? ' class="wide-only"' : ''} href="${esc(n.href)}"${n.href === current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`)
  // Help on every header (George, 31 Oct 2026: "Help menu, I found it. Barely visible."): VHub's ticket page for this
  // product, after its own pages and before its demo and play buttons, so play stays last.
  const [helpHref, helpLabel] = helpLink(s.nav[0].href.split('/')[1])
  links.push(`<a class="help-link" href="${esc(helpHref)}">${esc(helpLabel)}</a>`)
  const { main: p, second } = playButtons(s, { tester: true })
  // A private demo's button is the testers' alone (playButtons).
  const own = (b, html) => (b === s.demo ? forTesters(s, html) : html)
  if (second?.soon) links.push(`<span class="play-soon">${esc(second.label)}<small>${esc(second.soon)}</small></span>`)
  else if (second) links.push(own(second, `<a class="demo-link" href="${esc(second.href)}"${second.href === current ? ' aria-current="page"' : ''}>${esc(second.label)}</a>`))
  if (p) links.push(own(p, `<a class="play" href="${esc(p.href)}" title="${esc(p.label)}"${p.href === current ? ' aria-current="page"' : ''}>${ICONS.play}<span class="play-label">${esc(p.label)}</span></a>`))
  return `<header class="top${page.screen ? ' scrolled' : ''}">
    <a class="product-name" href="${esc(s.nav[0].href)}">${brand(s, 36, '150px')}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu"><span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span></button>
    <nav class="subnav" id="site-menu" aria-label="${esc(s.name)}">
      ${links.join('\n      ')}
    </nav>
    ${VHUB_AVATAR}
  </header>`
}

// The footer is styled like the hero (George, 22 Oct 2026): a picture generated from the key art (page.json footerArt:
// { src, widths, width, height, position }, with src-<width>.avif and .webp files) fades in from the page. Over its foot,
// centred (George picked layout B): the product's logo, one row of links, round buttons for its stores and the
// studio's channels, then the legal line: the company's full one on the website's pages, "© <year> VGraphics" on the
// product's own screens (tools/lib/legal.mjs).
export function footer({ page, slug }) {
  const s = page.site
  // The product's own pages (its menu, without Overview, under the footer's names for them), then the studio's.
  const own = new Map(s.nav.slice(1).map((n) => [n.href, n.label]))
  for (const l of s.footer) own.set(l.href, l.label)
  const links = [...own, [s.parent.href, `More ${s.parent.name.toLowerCase()}`], ['/services/', 'Work with us'], helpLink(slug), ['mailto:support@vgraphics.gr', 'Contact']]
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
        ${links.map(([href, label]) => `<a${href.startsWith('/hub/support/') ? ' class="foot-help"' : ''} href="${esc(href)}">${esc(label)}</a>`).join('<span class="sep" aria-hidden="true">·</span>\n        ')}
      </nav>${isProductScreen(page.path ?? `/${slug}/`) ? '' : `
      ${mailList(slug)}`}${buttons(page)}
      <p class="legal">${isProductScreen(page.path ?? `/${slug}/`) ? PRODUCT_LEGAL : LEGAL}${play}</p>
    </div>${f ? f.band : ''}
  </footer>`
}

// A product screen's foot (page.json "screen": the try page): one slim bar under the product in place of the footer, so
// nothing lies below it to scroll to (George, 29 Oct 2026: "When we play we play. No scroll needed."), as the web
// games' play pages have it: the way back to the product, its About page (/<product>/about/, which check-site requires
// of every product with a play or try page), its privacy policy and the short legal line, whose Company and Terms give
// way first on phones.
export function screenBar({ page, slug }) {
  const s = page.site
  const privacy = [...s.nav, ...s.footer].find((l) => /privacy/i.test(l.href))
  return `<footer class="screen-bar">
    <a href="${esc(s.nav[0].href)}">&larr; ${esc(s.nav[0].label)}</a>
    <a href="/${slug}/about/">About</a>${privacy ? `
    <a href="${esc(privacy.href)}">Privacy</a>` : ''}
    <span class="legal">${PRODUCT_LEGAL}<span class="long"> · <a href="/company/">Company</a> · <a href="/terms/">Terms</a></span></span>
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
