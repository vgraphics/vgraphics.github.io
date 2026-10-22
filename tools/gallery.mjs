// The screenshot gallery's markup, for every product page: renderGallery(data, options) returns the <section>.
// data is the product's gallery.json; its pictures live in data.img, relative to the page, as written by
// tools/make-gallery-images.py. The section needs /assets/gallery/gallery.css and gallery.js on the page.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// How wide a phone's screen is drawn in each layout, for the browser to pick a picture size.
const SIZES = {
  stage: '(max-width: 600px) 55vw, 280px',
  path: '(max-width: 760px) 50vw, 300px',
  story: '(max-width: 899px) 46vw, 360px',
}

function srcset(data, name, ext) {
  return data.widths.map((w) => `${data.img}${name}-${w}.${ext} ${w}w`).join(', ')
}

function shotPicture(data, shot, sizes) {
  const mid = data.widths.find((w) => w >= 540) ?? data.widths.at(-1)
  return `<picture><source type="image/avif" srcset="${srcset(data, shot.name, 'avif')}" sizes="${sizes}">` +
    `<img src="${data.img}${shot.name}-${mid}.webp" srcset="${srcset(data, shot.name, 'webp')}" sizes="${sizes}" ` +
    `width="${shot.w}" height="${shot.h}" alt="${esc(shot.alt)}" loading="lazy" decoding="async"></picture>`
}

function world(data, shot) {
  return `<img class="g-world" src="${data.img}world-${shot.world}-640.webp" srcset="${data.img}world-${shot.world}-640.webp 640w, ` +
    `${data.img}world-${shot.world}-1024.webp 1024w" sizes="(max-width: 760px) 100vw, 560px" alt="" loading="lazy" decoding="async">`
}

function caption(shot, i, n, layout) {
  const num = layout === 'story' ? `<span class="g-num">${i + 1} / ${n}</span>` : ''
  const more = shot.link ? `<a class="g-more" href="${esc(shot.link.href)}">${esc(shot.link.label)}</a>` : ''
  return `<figcaption class="g-cap">${num}<span class="g-tag"><b>${esc(shot.tag)}</b>${esc(shot.place)}</span>` +
    `<strong class="g-line" data-text="${esc(shot.caption)}">${esc(shot.caption)}</strong>` +
    `<span class="g-text">${esc(shot.text)}</span>${more}</figcaption>`
}

function slide(data, shot, i, layout) {
  const n = data.shots.length
  const phone = `<button class="g-phone" type="button" aria-label="${esc(`Enlarge screenshot ${i + 1} of ${n}: ${shot.caption}`)}">` +
    `<span class="g-screen">${shotPicture(data, shot, SIZES[layout])}</span></button>`
  let art = phone
  if (layout === 'stage' && data.pedestals) {
    art += `<img class="g-ped" src="${data.img}island-${shot.world}.webp" alt="" loading="lazy" decoding="async">`
  }
  if (layout === 'path') art = `<div class="g-scene">${world(data, shot)}${phone}</div>`
  if (layout === 'story') art = world(data, shot) + phone
  return `<li class="g-slide" data-world="${esc(shot.world)}" style="--accent: ${esc(shot.accent)}">` +
    `<figure class="g-fig">${art}${caption(shot, i, n, layout)}</figure></li>`
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

export function renderGallery(data, { layout = data.layout ?? 'stage', id = 'gallery' } = {}) {
  const shots = data.shots.map((shot, i) => slide(data, shot, i, layout)).join('\n      ')
  const ratio = +(data.shots[0].w / data.shots[0].h).toFixed(4)
  const backdrop = layout === 'stage' ? `<div class="g-backdrop" aria-hidden="true">${sky(data)}${pickups(data)}</div>` :
    layout === 'story' ? `<div class="g-backdrop" aria-hidden="true" hidden>${pickups(data)}</div>` : ''
  const hand = layout === 'path' ? ` data-hand="${data.img}pickup-hand.webp"` : ''
  return `<section class="gallery" id="${id}" data-gallery="${layout}"${hand} style="--ratio: ${ratio}" aria-labelledby="${id}-title">
  <div class="g-panel">
    ${backdrop}
    <div class="g-head"><h2 class="g-title${layout === 'stage' ? ' g-lettered' : ''}" id="${id}-title" data-text="${esc(data.heading)}">${esc(data.heading)}</h2></div>
    <ol class="g-track">
      ${shots}
    </ol>
  </div>
</section>`
}
