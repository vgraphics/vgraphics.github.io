// The screenshot gallery's markup, for every product page: renderGallery(block, options) returns the stage, the
// layout George picked on 22 Oct. block is the gallery block of the product's page.json; its pictures live in
// block.img, relative to the page, as written by tools/make-gallery-images.py. tools/build-pages.mjs links
// /assets/gallery/gallery.css and gallery.js on every page that has one.
//
// page.json: { "type": "gallery", "layout": "stage", "img", "widths": [picture widths],
//   "stage"?: { wide, tall, widths, tallWidths } (art behind the phones), "pedestals"?: { world: rim height in % },
//   "pickups"?: [{ src, x, y, wide?: [x, y], size, depth, turn }] (things from the game floating around),
//   "items": [{ name, w, h, world, accent, tag, place, caption, text, alt, link?: { href, label } }] }

import { blurhashes } from './lib/blurhash.mjs'

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// How wide a phone's screen is drawn, for the browser to pick a picture size.
const SIZES = '(max-width: 600px) 55vw, 280px'

function srcset(data, name, ext) {
  return data.widths.map((w) => `${data.img}${name}-${w}.${ext} ${w}w`).join(', ')
}

// The picture carries its blurhash, which the lightbox paints until the full screenshot has loaded (data.hash).
function shotPicture(data, shot) {
  const mid = data.widths.find((w) => w >= 540) ?? data.widths.at(-1)
  const hash = data.hash?.[`${data.img}${shot.name}-${mid}.webp`]
  return `<picture${hash ? ` data-hash="${esc(hash)}"` : ''}><source type="image/avif" srcset="${srcset(data, shot.name, 'avif')}" sizes="${SIZES}">` +
    `<img src="${data.img}${shot.name}-${mid}.webp" srcset="${srcset(data, shot.name, 'webp')}" sizes="${SIZES}" ` +
    `width="${shot.w}" height="${shot.h}" alt="${esc(shot.alt)}" loading="lazy" decoding="async"></picture>`
}

function caption(shot) {
  const more = shot.link ? `<a class="g-more" href="${esc(shot.link.href)}">${esc(shot.link.label)}</a>` : ''
  return `<figcaption class="g-cap"><span class="g-tag"><b>${esc(shot.tag)}</b>${esc(shot.place)}</span>` +
    `<strong class="g-line" data-text="${esc(shot.caption)}">${esc(shot.caption)}</strong>` +
    `<span class="g-text">${esc(shot.text)}</span>${more}</figcaption>`
}

function slide(data, shot, i) {
  const n = data.items.length
  let art = `<button class="g-phone" type="button" aria-label="${esc(`Enlarge screenshot ${i + 1} of ${n}: ${shot.caption}`)}">` +
    `<span class="g-screen">${shotPicture(data, shot)}</span></button>`
  // A pedestal under the phone, its foot on the pedestal's rim.
  if (data.pedestals?.[shot.world] != null) {
    art += `<img class="g-ped" src="${data.img}island-${shot.world}.webp" style="--sink: ${data.pedestals[shot.world]}%" alt="" loading="lazy" decoding="async">`
  }
  return `<li class="g-slide" data-world="${esc(shot.world)}" style="--accent: ${esc(shot.accent)}">` +
    `<figure class="g-fig">${art}${caption(shot)}</figure></li>`
}

function pickups(data) {
  if (!data.pickups?.length) return ''
  return '<span class="g-pickups">' + data.pickups.map((p) =>
    `<span class="g-pickup" style="--x: ${p.x}; --y: ${p.y};${p.wide ? ` --wx: ${p.wide[0]}; --wy: ${p.wide[1]};` : ''} --s: ${p.size}; --d: ${p.depth}; --t: ${p.turn}">` +
    `<img src="${data.img}${p.src}.webp" alt="" width="${p.size}" loading="lazy" decoding="async"></span>`).join('') + '</span>'
}

function sky(data) {
  const s = data.stage
  if (!s) return ''
  const set = (name, widths, ext) => widths.map((w) => `${data.img}${name}-${w}.${ext} ${w}w`).join(', ')
  return `<picture class="g-sky-art">` +
    `<source media="(max-aspect-ratio: 4/5)" type="image/avif" srcset="${set(s.tall, s.tallWidths, 'avif')}" sizes="100vw">` +
    `<source media="(max-aspect-ratio: 4/5)" type="image/webp" srcset="${set(s.tall, s.tallWidths, 'webp')}" sizes="100vw">` +
    `<source type="image/avif" srcset="${set(s.wide, s.widths, 'avif')}" sizes="min(100vw, 1720px)">` +
    `<img src="${data.img}${s.wide}-${s.widths[1]}.webp" srcset="${set(s.wide, s.widths, 'webp')}" sizes="min(100vw, 1720px)" alt="" loading="lazy" decoding="async"></picture>`
}

// label: the id of the section heading that names the gallery.
// options.dir: the page's folder, which block.img is relative to (for the screenshots' blurhashes)
export function renderGallery(data, { label, dir } = {}) {
  data = { ...data, items: data.items ?? data.shots }
  if (dir) {
    const mid = data.widths.find((w) => w >= 540) ?? data.widths.at(-1)
    const files = data.items.map((s) => `${data.img}${s.name}-${mid}.webp`)
    const got = blurhashes(files.map((f) => `${dir}/${f}`))
    data.hash = Object.fromEntries(files.map((f) => [f, got[`${dir}/${f}`]]))
  }
  const ratio = +(data.items[0].w / data.items[0].h).toFixed(4)
  return `<div class="gallery" data-gallery="stage" style="--ratio: ${ratio}"${label ? ` aria-labelledby="${label}"` : ''}>
  <div class="g-panel">
    <div class="g-backdrop" aria-hidden="true">${sky(data)}${pickups(data)}</div>
    <ol class="g-track" aria-label="Screenshots">
      ${data.items.map((shot, i) => slide(data, shot, i)).join('\n      ')}
    </ol>
  </div>
</div>`
}
