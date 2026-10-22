// The pieces every page of a product shares, for tools/build-pages.mjs and the wikis: the header with only the
// product's own logo top left (George's rule, 22 Oct 2026), the footer with the company's legal line, and the theme's
// decorative ornaments. Text from page.json is trusted HTML from this repo; esc() is for attribute values.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

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
// { src, widths, width, height, position }, with src-<width>.avif and .webp files) fades in from the page, and the
// links and legal line lie over its foot.
export function footer({ page }) {
  const s = page.site
  const links = [['/', 'More from VGraphics'], [s.parent.href, `More ${s.parent.name.toLowerCase()}`], ['/services/', 'Work with us'],
    ...s.footer.map((l) => [l.href, l.label]), ['mailto:gvergidis90@gmail.com', 'Contact']]
  const play = page.stores?.googlePlay ? '<br>Google Play and the Google Play logo are trademarks of Google LLC.' : ''
  const a = page.footerArt
  // Shown at the width that covers its box, clamp(320px, 42vw, 760px) high in assets/product.css.
  const r = a && a.width / a.height
  const sizes = a && `max(100vw, clamp(${Math.round(320 * r)}px, ${(42 * r).toFixed(1)}vw, ${Math.round(760 * r)}px))`
  const art = a ? `
    ${ornament(a, 'foot-art', sizes, `--foot-at: ${a.position}`)}` : ''
  return `<footer class="foot${a ? ' has-art' : ''}">${art}
    <div class="wrap">
      ${links.map(([href, label]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('\n      ')}
      <p class="legal">${LEGAL}${play}</p>
    </div>
  </footer>`
}

// A decorative piece of the theme's art: { src (path without the size and extension), width, height, widths? }.
// Each size exists as AVIF and WebP (WebP for browsers without AVIF; both keep transparency). Hidden from screen
// readers, lazy, and sized so nothing moves when it arrives.
export function ornament(o, cls, sizes, style) {
  const widths = o.widths || [o.width]
  const set = (ext) => widths.map((w) => `${o.src}-${w}.${ext} ${w}w`).join(', ')
  return `<div class="${cls}"${style ? ` style="${esc(style)}"` : ''} aria-hidden="true"><picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="${o.src}-${widths[widths.length - 1]}.webp" srcset="${set('webp')}" sizes="${sizes}" alt="" width="${o.width}" height="${o.height}" loading="lazy" decoding="async"></picture></div>`
}
