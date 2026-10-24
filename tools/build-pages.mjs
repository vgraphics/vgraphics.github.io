// Builds each product's landing page from <product>/page.json and its theme pack <product>/theme/theme.json, into
// <product>/index.html and <product>/theme/theme.css, and the product's other pages from <product>/<page>/page.json into
// <product>/<page>/index.html, or the address page.json gives (exitwise/ranking, exitwise/room, exitwise/privacy.html).
// One layout for every VGraphics game and app (George, 22 Oct 2026: "the same layouts with different content and
// graphic"): the structure is here and in assets/product.css, each product's look in its pack. Every page of a product
// has the same header, closing card and footer (George, 23 Oct 2026). Never edit a generated page; check-site.mjs
// fails when one differs from what this writes.
// Usage: node tools/build-pages.mjs [product ...]   (default: every product with a page.json, and its pages)
//
// A product's other page holds the same fields as its landing page, except site, stores and footerArt (the product's),
// with intro and cta optional (its closing card is the product's unless it gives its own), and path (its address, when
// it isn't /<product>/<page>/) and robots ("noindex") as extras; its hero shows the product's key art unless it gives
// its own art, and hero.title is its heading (the landing page's is the product's name). Every page's hero is the
// landing page's height (George, 23 Oct 2026), the one box in tools/lib/hero.mjs.
//
// page.json holds the page's words, links and pictures (trusted HTML from this repo):
//   title, description           the search result's title and snippet
//   social                       { title, description, image, imageAlt }: the link preview (a 1200x630 picture)
//   structuredData               the JSON-LD block, as is
//   site                         { name, icon, parent: { name, href }, nav: [{ label, href, wide? }], footer: [...] },
//                                shared with the product's other pages
//   stores                       { googlePlay }: the store links the "google-play" badge points at
//   hero                         { title?, lead, align: center | left, badges, art }: the key art and its foot
//     art                        { alt, tall, wide, ultra?, position, fade: { wide, tall }, placeholder }; each picture
//                                is { src, widths, jpeg?, width, height, sizes? }, with src-<width>.avif and .webp files;
//                                or, on another page, { wiki: "<slug>", alt, position?, fade?, placeholder? }: that
//                                wiki entry's painting
//   intro                        { id, eyebrow?, title, lede, actions?, demo, caption?, stage? }: a section whose stage
//                                holds demo/<demo>.html (its .css and .js beside it), the caption under it
//   sections                     [{ id, eyebrow?, title, intro?, art?, figure?, stage?, blocks, more? }] or [{ id, band }]
//                                art: { src, widths, width, height, alt, position? }: a picture across the section's top,
//                                its heading starting in the picture's faded foot; figure: { src, widths, width, height,
//                                side? }: a character beside the section's words (tools/make-cutouts.py), left or "right"
//                                blocks: gallery, steps, cards (layout icon | media | side; dense: true for a deck of
//                                many small media cards, two to a row on phones, framed like playing cards; deck: true
//                                for one row that scrolls sideways between two arrows), features, facts, actions, tour, soundtrack,
//                                journey, embed, document
//   stage                        { tall, wide, position? }: a picture from the product's world behind a section's
//                                blocks (or the intro's demo), each picture { src, widths, width, height }, as
//                                src-<width>.avif and .webp, the tall one on narrow screens
//   cta                          { title, text, badges }: the closing card, half in the footer's picture
// Badges and actions are "google-play", { href, label, note? } (a pill) or { href, label, icon?, button: true }.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { actions, anchor, closing, esc, footer, header, iconLinks, ICONS, ornament } from './lib/partials.mjs'
import { loadProduct, loadSubpage, products, root, subpages } from './lib/product.mjs'
import { checkTheme, themeCss } from './lib/theme.mjs'
import { heroPicture, heroSection, wikiArt } from './lib/hero.mjs'
import { soundtrack } from './lib/soundtrack.mjs'
import { journey } from './lib/journey.mjs'
import { miniboard } from './lib/miniboard.mjs'
import { renderGallery } from './gallery.mjs'

const set = (img, ext, widths) => widths.map((w) => `${img.src}-${w}.${ext} ${w}w`).join(', ')
const dims = (img) => ` width="${img.width}" height="${img.height}"`
const image = (i, lazy = true) => `<img src="${esc(i.src)}" alt="${esc(i.alt)}"${dims(i)}${lazy ? ' loading="lazy"' : ''}>`

// The hero: the key art (or the page's own art) in the box every product page shares (tools/lib/hero.mjs), the lead
// and the badges in its foot. The painted title stands in for the h1, which stays for screen readers and search.
function hero(p) {
  const h = p.hero
  return heroSection(h.art, { cls: h.align === 'left' ? 'foot-left' : '', attrs: ' aria-labelledby="title"', foot: `<div class="hero-foot">
        <div class="wrap">
          <h1 id="title" class="sr-only">${esc(h.title ?? p.site.name)}</h1>
          <p class="lead">${h.lead}</p>
          ${h.badges?.length ? actions(p, h.badges) : ''}
        </div>
      </div>` })
}

// A stage: a picture from the key art's world behind a section's content, as the intro's demo, the gallery and the
// soundtrack have theirs; the tall one on narrow screens; lazy, so it waits for the scroll. { "wiki": "<slug>" } stands
// on that wiki entry's painting, in the sizes it has.
function stageArt(st, slug) {
  if (!st) return ''
  if (st.wiki) st = wikiArt(slug, st.wiki, st)
  const sources = (img, media, sizes) => ['avif', 'webp'].map((ext) => `<source${media ? ` media="${media}"` : ''} type="image/${ext}" srcset="${set(img, ext, img.widths)}" sizes="${sizes}">`).join('')
  return `<picture class="scene-art" aria-hidden="true">${sources(st.tall, '(max-width: 899px)', '100vw')}${sources(st.wide, '', '(max-width: 1160px) 100vw, 1120px')}<img src="${st.wide.src}-${st.wide.widths.at(-1)}.webp" alt="" width="${st.wide.width}" height="${st.wide.height}" loading="lazy" decoding="async"></picture>`
}
const stageAt = (st) => (st?.position ? ` style="${esc(`--stage-at: ${st.position}`)}"` : '')

function intro(p, demo) {
  const i = p.intro
  const head = [
    i.eyebrow && `<span class="eyebrow">${i.eyebrow}</span>`,
    `<h2 id="${i.id}-title">${i.title}${anchor(i.id, i.title)}</h2>`,
    `<p class="sec-intro">${i.lede}</p>`,
    i.actions && actions(p, i.actions),
  ].filter(Boolean).join('\n          ')
  return `<section class="sec intro" id="${i.id}" aria-labelledby="${i.id}-title">
      <div class="wrap">
        <div class="sec-head">
          ${head}
        </div>${demo ? `
        <div class="scene demo-stage"${stageAt(i.stage)}>
          ${stageArt(i.stage)}
          <div class="demo">
${demo.trimEnd()}
          </div>
          ${i.caption ? `<p class="demo-cap">${i.caption}</p>` : ''}
        </div>` : ''}
      </div>
    </section>`
}

// A product's wiki (for the journey block): its wiki.json, read once.
const wikis = {}
const wikiOf = (slug) => (wikis[slug] ??= JSON.parse(readFileSync(join(root, slug, 'wiki', 'wiki.json'), 'utf8')))

// One renderer per block type. Items that take turns in the pack's swatches (steps, feature marks) get --c.
const BLOCKS = {
  // A row of buttons and pills, the same kinds as the hero's badges: { type: "actions", items: [...] }
  actions: (b, product) => actions(product.page, b.items, 'badges sec-actions'),

  // Key figures in a row, each a big value over its label: { type: "facts", items: [{ value, label }] }
  facts: (b) => `<ul class="facts-row">
          ${b.items.map((f) => `<li><b>${f.value}</b><span>${f.label}</span></li>`).join('\n          ')}
        </ul>`,

  // The album, a small player and the track list (tools/lib/soundtrack.mjs, assets/soundtrack.css and .js)
  soundtrack,

  // A gallery with a layout is the shared screenshot gallery (tools/gallery.mjs, assets/gallery/); without one, a row
  // that scrolls sideways, its sides fading while more lies beyond (assets/fade-edges.js).
  gallery: (b, product, s) => b.layout ? renderGallery(b, { label: `${s.id}-title` }) : `<div class="shots fade-edges">
          ${b.items.map((i) => `<figure>${image(i)}${i.caption ? `<figcaption>${i.caption}</figcaption>` : ''}</figure>`).join('\n          ')}
        </div>`,

  // Steps are plain lines in numbered cards; steps given as { title, text, board? } are the game's own cards, each
  // with its level bubble and a small still board (tools/lib/miniboard.mjs) drawing the step.
  steps: (b, { theme }) => {
    const rich = b.items.some((s) => typeof s === 'object')
    const item = (s, i) => {
      const c = `--c: var(--swatch-${(i % theme.swatches.length) + 1})`
      if (typeof s !== 'object') return `<li style="${c}">${s}</li>`
      return `<li style="${c}"><span class="bubble" aria-hidden="true">${i + 1}</span>${s.board ? miniboard(s.board, theme.tokens, s.boardAlt ?? s.title) : ''}<h3>${s.title}</h3><p>${s.text}</p></li>`
    }
    return `<ol class="steps n${b.items.length}${rich ? ' cards-game' : ''}">
          ${b.items.map(item).join('\n          ')}
        </ol>`
  },

  cards: (b, { slug }) => {
    const tag = (c) => (c.tag ? `<span class="tag${c.tagTone === 'alt' ? ' alt' : ''}">${c.tag}</span>` : '')
    const list = (c) => (c.list ? `<ul>${c.list.map((x) => `<li>${x}</li>`).join('')}</ul>` : '')
    // A card's back (cards item "back": HTML, "facts": [[label, value]], "href": its page): kept in a <template>, which
    // assets/product.js turns the card over to in its full-screen view; without JavaScript it stays unseen.
    const back = (c) => (c.back ? `<template class="card-back">${c.facts ? `<dl>${c.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}${c.back}${c.href ? `<a class="card-more" href="${esc(c.href)}">${c.more ?? 'Read more'} →</a>` : ''}</template>` : '')
    const card = {
      // An icon from the product's folder, set in the page so it needs no request, beside the words; the card links.
      icon: (c) => `<li class="card"><a href="${esc(c.href)}"><span class="pic">${readFileSync(join(root, slug, c.icon), 'utf8').trim().replace('<svg', '<svg aria-hidden="true"')}</span><span>${tag(c)}<h3>${c.title}</h3><p>${c.text}</p></span></a></li>`,
      media: (c) => `<li class="card">${image(c.image)}${tag(c)}<h3>${c.title}</h3><p>${c.text}</p>${list(c)}${back(c)}</li>`,
      side: (c) => `<li class="card">${image(c.image)}<div>${tag(c)}<h3>${c.title}</h3><p>${c.text}</p>${list(c)}</div></li>`,
    }[b.layout]
    const cards = `<${b.ordered ? 'ol' : 'ul'} class="cards ${b.layout}${b.dense ? ' dense' : ''}${b.deck ? ' deck' : ''}">
          ${b.items.map(card).join('\n          ')}
        </${b.ordered ? 'ol' : 'ul'}>`
    if (!b.deck) return cards
    // A deck: one row that scrolls sideways, with an arrow on each side (assets/product.js moves it a card at a time)
    const arrow = (dir, label) => `<button class="deck-btn ${dir}" type="button" aria-label="${label}" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg></button>`
    return `<div class="deck-wrap">${arrow('prev', 'Previous cards')}
        ${cards}
        ${arrow('next', 'Next cards')}</div>`
  },

  features: (b, { theme }) => {
    const mark = theme.mark ? theme.mark.replace('<svg', '<svg class="mark" aria-hidden="true"') : ''
    return `<ul class="features${b.items.length === 4 ? ' n4' : ''}">
          ${b.items.map((f, i) => `<li style="--c: var(--swatch-${(i % theme.swatches.length) + 1})">${mark}<span><b>${f.title}</b>${f.text}</span></li>`).join('\n          ')}
        </ul>`
  },

  // The level map's worlds, each with what it brings, from the product's wiki (tools/lib/journey.mjs): sections picks
  // the wiki's sections (all by default), detail adds each entry's summary.
  journey: (b, { slug }) => journey(wikiOf(slug), { sections: b.sections, detail: b.detail }),

  // A piece of the page's own markup: <src>.html from the page's folder goes in the page, with <src>.css and <src>.js
  // beside it linked when they exist (the ranking's boards, the room invite's card).
  embed: (b, { dir }) => `<div class="embed">
${readFileSync(join(root, dir, `${b.src}.html`), 'utf8').trimEnd()}
        </div>`,

  // A document another repo owns, set in the page as it is (the products' privacy policies and Exitwise's map rules,
  // copied in from their repos, Exitwise's policy by the Deployer): the <main> of the copy at src, without the heading
  // the hero now shows. The copy is the text alone (check-site: one <main>, no chrome of its own, noindex).
  document: (b, { dir }) => {
    const file = join(root, dir, b.src)
    const main = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').match(/<main\b[^>]*>([\s\S]*)<\/main>/)?.[1]
    if (!main) throw new Error(`${join(dir, b.src)} has no <main> to set in the page`)
    return `<div class="document">
${main.replace(/\s*<p class="kicker">[\s\S]*?<\/p>/, '').replace(/\s*<h1>[\s\S]*?<\/h1>/, '').trim()}
        </div>`
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

// A section's art (page.json section "art"): the picture across the top of the section, full-bleed, fading into the
// page at its foot, where the section's heading starts, inside the art's last 30% (George, 24 Oct 2026: "move art to
// top of section and add scrim on bottom so title can sit and section continue"). { src, widths, width, height, alt,
// position? }, as src-<width>.avif and .webp; lazy, so it waits for the scroll. It is never drawn wider than 1.2 times
// the picture (--sec-art-w), its sides fading into the page on wider screens, so it stays sharp.
function sectionArt(a) {
  const style = `--sec-art-w: ${Math.round(a.width * 1.2)}px${a.position ? `; --sec-art-at: ${a.position}` : ''}`
  const sizes = `min(100vw, ${Math.round(a.width * 1.2)}px)`
  return `<div class="sec-art" style="${esc(style)}"><picture><source type="image/avif" srcset="${set(a, 'avif', a.widths)}" sizes="${sizes}"><img src="${esc(a.src)}-${a.widths.at(-1)}.webp" srcset="${set(a, 'webp', a.widths)}" sizes="${sizes}" alt="${esc(a.alt)}"${dims(a)} loading="lazy" decoding="async"></picture></div>`
}

function section(product, s) {
  if (s.band) {
    const b = s.band
    return `<section class="sec" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="wrap">
        <div class="band">
          ${b.art ?? ''}
          <div><h2 id="${s.id}-title">${b.title}${anchor(s.id, b.title)}</h2><p>${b.text}</p></div>
          ${b.link ? `<a class="link" href="${esc(b.link.href)}">${b.link.label}</a>` : ''}
        </div>
      </div>
    </section>`
  }
  const head = s.title && [
    s.eyebrow && `<span class="eyebrow">${s.eyebrow}</span>`,
    `<h2 id="${s.id}-title">${s.title}${anchor(s.id, s.title)}</h2>`,
    s.intro && `<p class="sec-intro">${s.intro}</p>`,
  ].filter(Boolean).join('\n          ')
  const blocks = s.blocks.map((b) => BLOCKS[b.type](b, product, s)).join('\n        ')
  const art = s.art ? `
      ${sectionArt(s.art)}` : ''
  // A section's figure (page.json section "figure": { src, widths, width, height, side? }): one of the product's
  // characters standing beside the section's words, inside the content's width, turned to face them (George, 24 Oct
  // 2026: "Keep it as is but inside content width including character width"); decorative, so hidden from screen readers.
  const f = s.figure
  if (f && s.title) {
    return `<section class="sec${s.art ? ' has-art' : ''}" id="${s.id}" aria-labelledby="${s.id}-title">${art}
      <div class="wrap with-figure${f.side === 'right' ? ' figure-right' : ''}">
        <picture class="sec-figure" aria-hidden="true"><source type="image/avif" srcset="${set(f, 'avif', f.widths)}" sizes="260px"><img src="${esc(f.src)}-${f.widths.at(-1)}.webp" srcset="${set(f, 'webp', f.widths)}" sizes="260px" alt=""${dims(f)} loading="lazy" decoding="async"></picture>
        <div class="sec-body">
          <div class="sec-head">
          ${head}
          </div>
          ${blocks}
          ${s.more ? `<a class="more" href="${esc(s.more.href)}">${s.more.label}</a>` : ''}
        </div>
      </div>
    </section>`
  }
  // A section without a title is the page's own text under its hero (a policy, whose headings are its own).
  return `<section class="sec${s.art ? ' has-art' : ''}" id="${s.id}"${s.title ? ` aria-labelledby="${s.id}-title"` : ''}>${art}
      <div class="wrap">${s.title ? `
        <div class="sec-head">
          ${head}
        </div>` : ''}
        ${s.stage ? `<div class="scene"${stageAt(s.stage)}>
          ${stageArt(s.stage, product.slug)}
          ${blocks}
        </div>` : blocks}
        ${s.more ? `<a class="more" href="${esc(s.more.href)}">${s.more.label}</a>` : ''}
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

// A product's landing page, or with sub its page <slug>/<sub>/: { html, file (where it goes), css, problems }.
export function render(slug, sub) {
  const product = sub ? loadSubpage(slug, sub) : loadProduct(slug)
  const { page: p, theme: t } = product
  product.dir = sub ? join(slug, sub) : slug
  const path = p.path ?? `/${slug}/`
  const demoFile = (ext) => p.intro?.demo && join(root, product.dir, `${p.intro.demo}.${ext}`)
  const demo = p.intro?.demo ? readFileSync(demoFile('html'), 'utf8') : ''
  const demoCss = demoFile('css') && existsSync(demoFile('css'))
  const demoJs = demoFile('js') && existsSync(demoFile('js'))
  const art = heroPicture(p.hero.art)
  const fonts = t.fonts.filter((f) => f.preload).map((f) => `<link rel="preload" href="${f.src}" as="font" type="font/${f.src.split('.').pop()}" crossorigin>`)
  const blocks = p.sections.flatMap((s) => s.blocks ?? [])
  const ost = blocks.some((b) => b.type === 'soundtrack')
  const gallery = blocks.some((b) => b.type === 'gallery' && b.layout)
  const embeds = blocks.filter((b) => b.type === 'embed').map((b) => `/${product.dir.replace(/\\/g, '/')}/${b.src}`)
  const beside = (ext) => embeds.filter((e) => existsSync(join(root, `${e}.${ext}`)))
  const body = decorate(t, [...(p.intro ? [intro(p, demo)] : []), ...p.sections.map((s) => section(product, s)), closing(p)])
  const url = `https://vgraphics.gr${path}`
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Written by tools/build-pages.mjs from page.json and theme/theme.json: edit those, then run it. -->
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}">${p.robots ? `
  <meta name="robots" content="${esc(p.robots)}">` : ''}
  <meta name="theme-color" content="${t.tokens.page}">
  <meta name="color-scheme" content="${t.scheme}">
  <link rel="canonical" href="${url}">
  ${iconLinks(p)}
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
  <meta name="twitter:image" content="https://vgraphics.gr${esc(p.social.image)}">${p.structuredData ? `
  <script type="application/ld+json">
${JSON.stringify(p.structuredData, null, 2).replace(/</g, '\\u003c')}
  </script>` : ''}
  ${[...fonts, ...art.preloads].join('\n  ')}
  <link rel="stylesheet" href="/${slug}/theme/theme.css">
  <link rel="stylesheet" href="/assets/product.css">${gallery ? `
  <link rel="stylesheet" href="/assets/gallery/gallery.css">` : ''}${ost ? `
  <link rel="stylesheet" href="/assets/soundtrack.css">` : ''}${demoCss ? `
  <link rel="stylesheet" href="${p.intro.demo}.css">` : ''}${beside('css').map((e) => `
  <link rel="stylesheet" href="${e}.css">`).join('')}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  ${header(product, { current: path })}

  <main id="main">
    ${hero(p)}

    ${body.join('\n\n    ')}
  </main>

  ${footer(product)}${existsSync(join(root, 'assets', 'anchors.js')) ? `
  <script src="/assets/anchors.js" defer></script>` : ''}
  <script src="/assets/product.js" defer></script>
  <script src="/assets/menu.js" defer></script>${gallery ? `
  <script src="/assets/gallery/gallery.js" defer></script>` : ''}${demoJs ? `
  <script src="${p.intro.demo}.js" defer></script>` : ''}${ost ? `
  <script src="/assets/soundtrack.js" defer></script>` : ''}${beside('js').map((e) => `
  <script src="${e}.js" defer></script>`).join('')}
</body>
</html>
`
  // Pieces read from files (demo, icons) carry CRLF in a checkout with core.autocrlf; the page is always LF.
  const file = path.endsWith('/') ? join(path.slice(1), 'index.html') : path.slice(1)
  return { html: html.replace(/\r\n/g, '\n'), file, css: themeCss(slug, t), problems: checkTheme(t) }
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
    for (const sub of subpages(slug)) {
      const page = render(slug, sub)
      writeFileSync(join(root, page.file), page.html)
      console.log(`${slug}/${sub}: ${page.file.replace(/\\/g, '/')}`)
    }
  }
}
