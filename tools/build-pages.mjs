// Builds each product's landing page from <product>/page.json and its theme pack <product>/theme/theme.json, into
// <product>/index.html and <product>/theme/theme.css. One layout for every VGraphics game and app (George, 22 Oct
// 2026: "the same layouts with different content and graphic"): the structure is here and in assets/product.css, each
// product's look in its pack. Never edit a generated page; check-site.mjs fails when one differs from what this writes.
// Usage: node tools/build-pages.mjs [product ...]   (default: every product with a page.json)
//
// page.json holds the page's words, links and pictures (trusted HTML from this repo):
//   title, description           the search result's title and snippet
//   social                       { title, description, image, imageAlt }: the link preview (a 1200x630 picture)
//   structuredData               the JSON-LD block, as is
//   site                         { name, icon, parent: { name, href }, nav: [{ label, href, wide? }], footer: [...] },
//                                shared with the product's other pages
//   stores                       { googlePlay }: the store links the "google-play" badge points at
//   hero                         { lead, align: center | left, badges, art }: the key art and its foot
//     art                        { alt, tall, wide, ultra?, position, fade: { wide, tall }, placeholder }; each picture
//                                is { src, widths, jpeg?, width, height, sizes? }, with src-<width>.avif and .webp files
//   intro                        { id, eyebrow?, title, lede, actions?, demo, caption?, stage? }: a section whose stage
//                                holds demo/<demo>.html (its .css and .js beside it), the caption under it; stage is
//                                { tall, wide, position? }, each picture { src, widths, width, height }, as
//                                src-<width>.avif and .webp
//   sections                     [{ id, eyebrow?, title, intro?, blocks, more? }] or [{ id, band }]
//                                blocks: gallery, steps, cards (layout icon | media | side), features, tour, soundtrack
//   cta                          { title, text, badges }: the last call to action
// Badges and actions are "google-play", { href, label, note? } (a pill) or { href, label, icon?, button: true }.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { esc, footer, header, ornament } from './lib/partials.mjs'
import { loadProduct, products, root } from './lib/product.mjs'
import { checkTheme, themeCss } from './lib/theme.mjs'
import { soundtrack } from './lib/soundtrack.mjs'
import { renderGallery } from './gallery.mjs'

const TALL = '(max-aspect-ratio: 4/5)'
const ULTRA = '(min-aspect-ratio: 2/1)'
const ICONS = {
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
}

const set = (img, ext, widths) => widths.map((w) => `${img.src}-${w}.${ext} ${w}w`).join(', ')
const dims = (img) => ` width="${img.width}" height="${img.height}"`
const image = (i, lazy = true) => `<img src="${esc(i.src)}" alt="${esc(i.alt)}"${dims(i)}${lazy ? ' loading="lazy"' : ''}>`

function actions(p, list, cls = 'badges') {
  return `<div class="${cls}">${list.map((b) => {
    if (b === 'google-play') return `<a class="gp" href="${esc(p.stores.googlePlay)}"><img src="/assets/img/google-play-badge.png" alt="Get it on Google Play" width="646" height="250"></a>`
    if (b.button) return `<a class="btn" href="${esc(b.href)}">${b.label}${b.icon ? ICONS[b.icon] : ''}</a>`
    return `<a class="pill" href="${esc(b.href)}"><b>${b.label}</b>${b.note ? `<small>${b.note}</small>` : ''}</a>`
  }).join('')}</div>`
}

// The key art as one <picture>: the tall cut on portrait screens up to 4:5, the ultra-wide one past 2:1 if there is
// one, else the wide one; AVIF, then WebP, then JPEG. The same choices as preloads, so the browser fetches it first.
function keyArt(a) {
  const sources = (img, media, sizes) => [
    `<source${media ? ` media="${media}"` : ''} type="image/avif" srcset="${set(img, 'avif', img.widths)}" sizes="${sizes}"${dims(img)}>`,
    `<source${media ? ` media="${media}"` : ''} type="image/webp" srcset="${set(img, 'webp', img.widths)}" sizes="${sizes}"${dims(img)}>`,
    ...(media && img.jpeg ? [`<source media="${media}" srcset="${set(img, 'jpg', img.jpeg)}" sizes="${sizes}"${dims(img)}>`] : []),
  ]
  const wideSizes = a.wide.sizes || '100vw'
  const picture = [
    ...sources(a.tall, TALL, '100vw'),
    ...(a.ultra ? sources(a.ultra, ULTRA, '100vw') : []),
    ...sources(a.wide, '', wideSizes),
    `<img src="${a.wide.src}-${a.wide.jpeg.at(-1)}.jpg" srcset="${set(a.wide, 'jpg', a.wide.jpeg)}" sizes="${wideSizes}"${dims(a.wide)} fetchpriority="high" alt="${esc(a.alt)}">`,
  ]
  const preload = (img, media, sizes) => `<link rel="preload" as="image" type="image/avif" media="${media}" imagesrcset="${set(img, 'avif', img.widths)}" imagesizes="${sizes}" fetchpriority="high">`
  const preloads = [
    preload(a.tall, TALL, '100vw'),
    preload(a.wide, a.ultra ? '(min-aspect-ratio: 4/5) and (max-aspect-ratio: 2/1)' : `not all and ${TALL}`, wideSizes),
    ...(a.ultra ? [preload(a.ultra, ULTRA, '100vw')] : []),
  ]
  return { picture, preloads }
}

function hero(p, picture) {
  const h = p.hero
  const a = h.art
  const style = `--art-at: ${a.position}; --art-fade: ${a.fade.wide}; --art-fade-tall: ${a.fade.tall}; --art-placeholder: ${a.placeholder}`
  return `<section class="key-art${h.align === 'left' ? ' foot-left' : ''}" style="${esc(style)}" aria-labelledby="title">
      <picture>
        ${picture.join('\n        ')}
      </picture>
      <div class="hero-foot">
        <div class="wrap">
          <h1 id="title" class="sr-only">${esc(p.site.name)}</h1>
          <p class="lead">${h.lead}</p>
          ${actions(p, h.badges)}
        </div>
      </div>
    </section>`
}

// The intro is a section like the others (its heading, the lede, the main action), with the product's live demo on a
// stage of its own, as the gallery and the soundtrack have theirs: a picture from the key art's world behind it, the
// tall one on narrow screens; lazy, so it waits for the scroll.
function stage(st) {
  if (!st) return ''
  const sources = (img, media, sizes) => ['avif', 'webp'].map((ext) => `<source${media ? ` media="${media}"` : ''} type="image/${ext}" srcset="${set(img, ext, img.widths)}" sizes="${sizes}">`).join('')
  return `<picture class="demo-backdrop" aria-hidden="true">${sources(st.tall, '(max-width: 899px)', '100vw')}${sources(st.wide, '', '(max-width: 1160px) 100vw, 1120px')}<img src="${st.wide.src}-${st.wide.widths.at(-1)}.webp" alt="" width="${st.wide.width}" height="${st.wide.height}" loading="lazy" decoding="async"></picture>`
}

function intro(p, demo) {
  const i = p.intro
  const head = [
    i.eyebrow && `<span class="eyebrow">${i.eyebrow}</span>`,
    `<h2 id="${i.id}-title">${i.title}${anchor(i, i.title)}</h2>`,
    `<p class="sec-intro">${i.lede}</p>`,
    i.actions && actions(p, i.actions),
  ].filter(Boolean).join('\n          ')
  const at = i.stage?.position ? ` style="${esc(`--stage-at: ${i.stage.position}`)}"` : ''
  return `<section class="sec intro" id="${i.id}" aria-labelledby="${i.id}-title">
      <div class="wrap">
        <div class="sec-head">
          ${head}
        </div>${demo ? `
        <div class="demo-stage"${at}>
          ${stage(i.stage)}
          <div class="demo">
${demo.trimEnd()}
          </div>
          ${i.caption ? `<p class="demo-cap">${i.caption}</p>` : ''}
        </div>` : ''}
      </div>
    </section>`
}

// One renderer per block type. Items that take turns in the pack's swatches (steps, feature marks) get --c.
const BLOCKS = {
  // The album, a small player and the track list (tools/lib/soundtrack.mjs, assets/soundtrack.css and .js)
  soundtrack,

  // A gallery with a layout is the shared screenshot gallery (tools/gallery.mjs, assets/gallery/); without one, a row.
  gallery: (b, product, s) => b.layout ? renderGallery(b, { label: `${s.id}-title` }) : `<div class="shots">
          ${b.items.map((i) => `<figure>${image(i)}${i.caption ? `<figcaption>${i.caption}</figcaption>` : ''}</figure>`).join('\n          ')}
        </div>`,

  steps: (b, { theme }) => `<ol class="steps n${b.items.length}">
          ${b.items.map((s, i) => `<li style="--c: var(--swatch-${(i % theme.swatches.length) + 1})">${s}</li>`).join('\n          ')}
        </ol>`,

  cards: (b, { slug }) => {
    const tag = (c) => (c.tag ? `<span class="tag${c.tagTone === 'alt' ? ' alt' : ''}">${c.tag}</span>` : '')
    const list = (c) => (c.list ? `<ul>${c.list.map((x) => `<li>${x}</li>`).join('')}</ul>` : '')
    const card = {
      // An icon from the product's folder, set in the page so it needs no request, beside the words; the card links.
      icon: (c) => `<li class="card"><a href="${esc(c.href)}"><span class="pic">${readFileSync(join(root, slug, c.icon), 'utf8').trim().replace('<svg', '<svg aria-hidden="true"')}</span><span>${tag(c)}<h3>${c.title}</h3><p>${c.text}</p></span></a></li>`,
      media: (c) => `<li class="card">${image(c.image)}${tag(c)}<h3>${c.title}</h3><p>${c.text}</p>${list(c)}</li>`,
      side: (c) => `<li class="card">${image(c.image)}<div>${tag(c)}<h3>${c.title}</h3><p>${c.text}</p>${list(c)}</div></li>`,
    }[b.layout]
    return `<${b.ordered ? 'ol' : 'ul'} class="cards ${b.layout}">
          ${b.items.map(card).join('\n          ')}
        </${b.ordered ? 'ol' : 'ul'}>`
  },

  features: (b, { theme }) => {
    const mark = theme.mark ? theme.mark.replace('<svg', '<svg class="mark" aria-hidden="true"') : ''
    return `<ul class="features${b.items.length === 4 ? ' n4' : ''}">
          ${b.items.map((f, i) => `<li style="--c: var(--swatch-${(i % theme.swatches.length) + 1})">${mark}<span><b>${f.title}</b>${f.text}</span></li>`).join('\n          ')}
        </ul>`
  },

  // Numbered spots on a phone screen, each opening its part of the list (assets/product.js; without JavaScript every
  // part stays open).
  tour: (b) => `<div class="tour" data-open="${b.open}">
          <div class="stage">
            <div class="phone">
              ${image(b.image)}
              ${b.spots.map((s) => `<button class="spot" type="button" style="left:${s.x}%;top:${s.y}%" aria-controls="${s.part}" aria-expanded="false" aria-label="${s.n}, ${esc(s.label)}"><span>${s.n}</span></button>`).join('\n              ')}
            </div>
          </div>
          <ol class="parts">
            ${b.parts.map((t) => `<li class="part"><button type="button" aria-controls="${t.id}" aria-expanded="true"><span class="n">${t.n}</span>${t.title}${ICONS.chevron}</button>
              <div class="body" id="${t.id}">${t.body}${t.more ? `<a class="more" href="${esc(t.more)}">More in the wiki →</a>` : ''}</div></li>`).join('\n            ')}
          </ol>
        </div>`,
}

// Every section heading carries a link to itself (George, 22 Oct 2026: "All sections ... must have anchors and copy on
// click"); assets/anchors.js copies it, and without JavaScript it is a plain link.
const anchor = (s, title) => `<a class="anchor" href="#${s.id}" aria-label="Copy the link to ${esc(title.replace(/<[^>]+>/g, ''))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></a>`

function section(product, s) {
  if (s.band) {
    const b = s.band
    return `<section class="sec" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="wrap">
        <div class="band">
          ${b.art ?? ''}
          <div><h2 id="${s.id}-title">${b.title}${anchor(s, b.title)}</h2><p>${b.text}</p></div>
          ${b.link ? `<a class="link" href="${esc(b.link.href)}">${b.link.label}</a>` : ''}
        </div>
      </div>
    </section>`
  }
  const head = [
    s.eyebrow && `<span class="eyebrow">${s.eyebrow}</span>`,
    `<h2 id="${s.id}-title">${s.title}${anchor(s, s.title)}</h2>`,
    s.intro && `<p class="sec-intro">${s.intro}</p>`,
  ].filter(Boolean).join('\n          ')
  return `<section class="sec" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="wrap">
        <div class="sec-head">
          ${head}
        </div>
        ${s.blocks.map((b) => BLOCKS[b.type](b, product, s)).join('\n        ')}
        ${s.more ? `<a class="more" href="${esc(s.more.href)}">${s.more.label}</a>` : ''}
      </div>
    </section>`
}

function cta(p) {
  const c = p.cta
  return `<section class="cta-band" aria-labelledby="cta-title">
      <div class="wrap">
        <div class="panel">
          <h2 id="cta-title">${c.title}</h2>
          ${c.text ? `<p>${c.text}</p>` : ''}
          ${actions(p, c.badges)}
        </div>
      </div>
    </section>`
}

// The theme's ornaments: edge pieces take turns left and right in the gaps after every second section (none in the
// hero), and the horizon runs along the very bottom, above the footer.
function decorate(theme, parts) {
  const edges = theme.ornaments?.edges ?? []
  const out = []
  parts.forEach((part, i) => {
    out.push(part)
    const e = edges[(i >> 1) % edges.length]
    if (edges.length && i % 2 === 1 && i < parts.length - 1) out.push(ornament(e, `orn orn-${(i >> 1) % 2 ? 'right' : 'left'}`, e.sizes ?? '(max-width: 900px) 140px, 380px'))
  })
  const h = theme.ornaments?.horizon
  if (h) out.push(ornament(h, 'horizon', '100vw'))
  return out
}

export function render(slug) {
  const product = loadProduct(slug)
  const { page: p, theme: t } = product
  const demoFile = (ext) => p.intro.demo && join(root, slug, `${p.intro.demo}.${ext}`)
  const demo = p.intro.demo ? readFileSync(demoFile('html'), 'utf8') : ''
  const demoCss = demoFile('css') && existsSync(demoFile('css'))
  const demoJs = demoFile('js') && existsSync(demoFile('js'))
  const art = keyArt(p.hero.art)
  const fonts = t.fonts.filter((f) => f.preload).map((f) => `<link rel="preload" href="${f.src}" as="font" type="font/${f.src.split('.').pop()}" crossorigin>`)
  const tour = p.sections.some((s) => s.blocks?.some((b) => b.type === 'tour'))
  const ost = p.sections.some((s) => s.blocks?.some((b) => b.type === 'soundtrack'))
  const gallery = p.sections.some((s) => s.blocks?.some((b) => b.type === 'gallery' && b.layout))
  const body = decorate(t, [intro(p, demo), ...p.sections.map((s) => section(product, s)), cta(p)])
  const url = `https://vgraphics.gr/${slug}/`
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Written by tools/build-pages.mjs from page.json and theme/theme.json: edit those, then run it. -->
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}">
  <meta name="theme-color" content="${t.tokens.page}">
  <meta name="color-scheme" content="${t.scheme}">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="${esc(p.site.icon)}">
  <link rel="apple-touch-icon" href="${esc(p.site.icon)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="VGraphics">
  <meta property="og:title" content="${esc(p.social.title)}">
  <meta property="og:description" content="${esc(p.social.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://vgraphics.gr${esc(p.social.image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(p.social.imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://vgraphics.gr${esc(p.social.image)}">
  <script type="application/ld+json">
${JSON.stringify(p.structuredData, null, 2).replace(/</g, '\\u003c')}
  </script>
  ${[...fonts, ...art.preloads].join('\n  ')}
  <link rel="stylesheet" href="/${slug}/theme/theme.css">
  <link rel="stylesheet" href="/assets/product.css">${gallery ? `
  <link rel="stylesheet" href="/assets/gallery/gallery.css">` : ''}${ost ? `
  <link rel="stylesheet" href="/assets/soundtrack.css">` : ''}${demoCss ? `
  <link rel="stylesheet" href="${p.intro.demo}.css">` : ''}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  ${header(product, { current: `/${slug}/` })}

  <main id="main">
    ${hero(p, art.picture)}

    ${body.join('\n\n    ')}
  </main>

  ${footer(product)}${existsSync(join(root, 'assets', 'anchors.js')) ? `
  <script src="/assets/anchors.js" defer></script>` : ''}${tour ? `
  <script src="/assets/product.js" defer></script>` : ''}${gallery ? `
  <script src="/assets/gallery/gallery.js" defer></script>` : ''}${demoJs ? `
  <script src="${p.intro.demo}.js" defer></script>` : ''}${ost ? `
  <script src="/assets/soundtrack.js" defer></script>` : ''}
</body>
</html>
`
  // Pieces read from files (demo, icons) carry CRLF in a checkout with core.autocrlf; the page is always LF.
  return { html: html.replace(/\r\n/g, '\n'), css: themeCss(slug, t), problems: checkTheme(t) }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const list = process.argv.slice(2).length ? process.argv.slice(2) : products()
  for (const slug of list) {
    const { html, css, problems } = render(slug)
    if (problems.length) {
      console.error(problems.map((m) => `${slug}/theme/theme.json: ${m}`).join('\n'))
      process.exit(1)
    }
    writeFileSync(join(root, slug, 'index.html'), html)
    writeFileSync(join(root, slug, 'theme', 'theme.css'), css)
    console.log(`${slug}: index.html + theme/theme.css`)
  }
}
