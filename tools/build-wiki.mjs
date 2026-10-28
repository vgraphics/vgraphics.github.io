// Builds each product's wiki from <product>/wiki/wiki.json into static pages:
//   <product>/wiki/index.html and <product>/wiki/<slug>/index.html
// Usage: node tools/build-wiki.mjs [product ...]   (default: every product with a wiki/wiki.json)
// The JSON is the single source; never edit the generated pages by hand. Its text is trusted HTML from this repo.
// An entry with "robots": "noindex" stays on the wiki but out of search and the sitemap: one with too little text of
// its own (AdSense's "Low-value content" review, 27 Oct 2026). Take it out once the entry has a real write-up.
//
// One layout for every product's wiki (George, 22 Oct 2026, direction "A+B"): each entry opens on its own Recraft
// painting, then a calm reading column with the game's or app's own pieces in it: level bubbles and world chips, a
// board that plays the rule and can be played, the tip card, a world map, a live gauge. The look comes from the
// product's theme pack (<product>/theme/theme.css) and the shared assets/wiki.css; the header and footer are the
// product pages' own (tools/lib/partials.mjs), so a wiki page looks and links like its landing page.
// An entry's "quote" ({ text, by, audio, listen }, audio from the site's root) is the landing page's quote block, a
// line it says with a button to hear it, set after the entry's lede: Palermo Noir's roles each say their own line in
// their own voice (George, 28 Oct 2026: "In palermo wiki, in any character, have a quote with play button to hear his
// voice. Same way we do in overview page.").
//
// Pictures: tools/make-wiki-art.py writes <product>/wiki/img/art/<slug>-<width>.avif/.webp/.jpg (wide) and
// <slug>-tall-<width>.avif/.webp/.jpg (the 9:16 cut for portrait screens) with art.json, the sizes this script reads.
// Every page's hero is the landing page's box (tools/lib/hero.mjs), so it is exactly as tall.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadProduct, root } from './lib/product.mjs'
import { anchor, closing, header, footer, iconLinks, quote } from './lib/partials.mjs'
import { journey, lvBadge, piece, worldOf } from './lib/journey.mjs'
import { heroPicture, heroSection, srcset, wikiArt } from './lib/hero.mjs'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = (s) => String(s).replace(/<[^>]+>/g, '')
const SECTION_LABEL = { traps: 'Obstacle', powerups: 'Powerup', basics: 'Basics', big: 'The big gauge', gauges: 'Small gauge', lights: 'Warning light', setup: 'Setup', designs: 'Style' }

// The page's place on the site as structured data (search results show it as breadcrumbs): VGraphics › Games or Apps ›
// the product › Wiki, then the entry. "<" is escaped so no text can close the script.
function breadcrumbs(w, entry) {
  const p = w.product
  const trail = [['VGraphics', '/'], [p.parent.name, p.parent.href], [p.name, p.home], ['Wiki', `/${p.slug}/wiki/`]]
  if (entry) trail.push([entry.name, `/${p.slug}/wiki/${entry.slug}/`])
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `https://vgraphics.gr${href}` })),
  }
  return JSON.stringify(ld).replace(/</g, '\\u003c')
}

// An entry as an article (structured data, beside the breadcrumbs): its painting, what it is about (the game or app
// its landing page describes, by that page's @id), and VGraphics as author and publisher.
function article(product, e, { description, path, image }) {
  const about = product.page.structuredData?.['@graph']?.[0]
  const vgraphics = { '@type': 'Organization', '@id': 'https://vgraphics.gr/#organization', name: 'VGraphics', url: 'https://vgraphics.gr/' }
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: e.name,
    description,
    image: `https://vgraphics.gr${image.src}`,
    url: `https://vgraphics.gr${path}`,
    mainEntityOfPage: `https://vgraphics.gr${path}`,
    inLanguage: 'en',
    ...(about?.['@id'] && { about: { '@type': about['@type'], '@id': about['@id'], name: about.name } }),
    author: vgraphics,
    publisher: vgraphics,
  }
  return JSON.stringify(ld).replace(/</g, '\\u003c')
}

// An entry's search title: the first of wiki.json's "entryTitles" that fits in 60 characters, filled with the entry's
// name and its section's "kind" ("Rock (obstacle) · Exitwise arrow puzzle wiki"); in a section without a kind, the
// patterns with {kind} are passed over. Else "<name> · <product> wiki".
function entryTitle(w, e) {
  const kind = w.sections.find((s) => s.id === e.section)?.kind
  return (w.entryTitles ?? []).filter((t) => kind || !t.includes('{kind}'))
    .map((t) => t.replace('{name}', e.name).replace('{kind}', kind))
    .find((t) => t.length <= 60) ?? `${e.name} · ${w.product.name} wiki`
}

// An entry's search description: its summary, then the sentences of "What it does" while they fit in 160 characters.
// The first one that doesn't fit is cut at a word, so the description always says more than the summary. A short one
// ends with wiki.json's "entryTail" when it fits (what the product is, in the words people search for).
function describe(e, tail) {
  let d = strip(e.summary).trim()
  if (!/[.!?]$/.test(d)) d += '.'
  for (const s of (e.what || []).flatMap((x) => strip(x).trim().split(/(?<=[.!?])\s+/))) {
    if (d.length + 1 + s.length <= 160) {
      d += ' ' + s
      continue
    }
    if (160 - d.length > 40) d += ' ' + s.slice(0, 158 - d.length).replace(/\s+\S*$/, '').replace(/[\s,:;(–-]+$/, '') + '…'
    break
  }
  if (tail && d.length + 1 + tail.length <= 160) d += ' ' + tail
  return d
}

// A page's link preview: a painting's own 1280 px JPEG (an entry's, or the index's when it is one of the paintings),
// else the wiki's product image (wiki.json product.image), with the landing page's words for it when it is the same.
function preview(w, product, slug, alt) {
  const a = slug && w.art[slug]
  if (a?.jpeg?.includes(1280)) return { src: `/${w.product.slug}/wiki/img/art/${slug}-1280.jpg`, width: 1280, height: Math.round((1280 * a.height) / a.width), alt }
  const card = product.page.social
  return { src: w.product.image, alt: w.product.image === card?.image ? card.imageAlt : w.product.name }
}

// ---------- Pictures ----------
// A card's painting: the wide picture, which a card always shows (16:9); AVIF, then WebP, then JPEG; lazy.
function artPicture(w, slug, { cls, sizes }) {
  const a = w.art[slug]
  const img = { src: `/${w.product.slug}/wiki/img/art/${slug}`, widths: a.widths, jpeg: a.jpeg }
  const fallback = img.jpeg ? `${img.src}-${img.jpeg[0]}.jpg" srcset="${srcset(img, 'jpg', img.jpeg)}" sizes="${sizes}` : `${img.src}-${img.widths[0]}.webp`
  return `<picture class="${cls}">${['avif', 'webp'].map((x) => `<source type="image/${x}" srcset="${srcset(img, x, img.widths)}" sizes="${sizes}">`).join('')}<img src="${fallback}" width="${a.width}" height="${a.height}" alt="" loading="lazy"></picture>`
}
// The index hero: the wiki's own picture (wiki.json "art", George, 24 Oct 2026: "Privacy policy uses the same image as
// overview. Generate another please. WiKi page too."), either one of its paintings ({ "wiki": "<slug>", alt, ... }) or
// a picture of its own, as page.json's hero.art ({ alt, tall, wide, ... }, named from the product's folder; Palermo's,
// George's round-5 pick); else the landing page's key art (page.json hero.art).
function keyArt(product, w) {
  if (w.indexArt?.wiki) {
    const { wiki, ...given } = w.indexArt
    return wikiArt(product.slug, wiki, given)
  }
  const a = w.indexArt?.wide ? w.indexArt : product.page.hero.art, at = (img) => img && { ...img, src: img.src.startsWith('/') ? img.src : `/${product.slug}/${img.src}` }
  return { ...a, tall: at(a.tall), wide: at(a.wide), ultra: at(a.ultra) }
}

// ---------- Small shared pieces ----------
// A section's heading, as the landing page's: its words and a link to itself.
const h2 = (id, title) => `<h2 class="w-h2" id="${id}">${title}${anchor(id, title)}</h2>`
const worldChip = (wd) => (wd ? `<span class="w-world" style="--w: ${wd.colour}">${esc(wd.name)}</span>` : '')
const arrival = (w, e) => {
  const wd = worldOf(w, e.firstLevel)
  return e.firstLevel > 1 ? `Arrives on level ${e.firstLevel}${wd ? ` · ${wd.name}` : ''}` : e.firstLevel === 1 ? 'From the first level' : ''
}
const inGameTip = (e) => (e.notes || []).find((x) => x.startsWith('In-game tip:'))?.replace(/^In-game tip:\s*/, '').replace(/^"|"$/g, '')
const notesOf = (e) => (e.notes || []).filter((x) => !x.startsWith('In-game tip:'))
const card = (w, e) => {
  const wd = worldOf(w, e.firstLevel)
  const badges = e.firstLevel > 1 ? `<span class="w-card-badges">${lvBadge(e.firstLevel, 'sm')}${worldChip(wd)}</span>` : ''
  return `<a class="w-card" href="/${w.product.slug}/wiki/${e.slug}/" data-sec="${e.section}" data-text="${esc((e.name + ' ' + strip(e.summary)).toLowerCase())}">
        <span class="w-card-art">${artPicture(w, e.slug, { cls: 'w-card-pic', sizes: '(min-width: 900px) 360px, (min-width: 560px) 50vw, 100vw' })}${badges}</span>
        <span class="w-card-body"><b>${esc(e.name)}</b><span>${e.summary}</span></span>
      </a>`
}

// ---------- The page shell ----------
function shell(w, product, { title, description, path, body, entry, image, preload = '', script }) {
  const p = w.product
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">${entry?.robots ? `
  <meta name="robots" content="${esc(entry.robots)}">` : ''}
  <link rel="canonical" href="https://vgraphics.gr${path}">
  ${iconLinks(product.page)}
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="https://vgraphics.gr${path}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="VGraphics">${image?.src ? `
  <meta property="og:image" content="https://vgraphics.gr${esc(image.src)}">${image.width ? `
  <meta property="og:image:width" content="${image.width}">
  <meta property="og:image:height" content="${image.height}">` : ''}
  <meta property="og:image:alt" content="${esc(image.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://vgraphics.gr${esc(image.src)}">` : ''}
  <script type="application/ld+json">${breadcrumbs(w, entry)}</script>${entry ? `
  <script type="application/ld+json">${article(product, entry, { description, path, image })}</script>` : ''}${preload ? `
  ${preload}` : ''}
  <link rel="stylesheet" href="/${p.slug}/theme/theme.css">
  <link rel="stylesheet" href="/assets/product.css">
  <link rel="stylesheet" href="/assets/wiki.css">
  <link rel="stylesheet" href="/assets/cursors.css">
  <script src="/assets/anchors.js" defer></script>
  <script src="/assets/product.js" defer></script>
  <script src="/assets/menu.js" defer></script>${script ? `
  <script src="/assets/wiki.js" defer></script>` : ''}
</head>
<body class="wiki">
<a class="skip" href="#main">Skip to content</a>
${header(product, { current: `/${p.slug}/wiki/` })}
<main id="main">
${body}
${closing(product.page)}
</main>
${footer(product)}
</body>
</html>
`
}

// ---------- Index ----------
function indexPage(w, product) {
  const p = w.product
  const tiles = w.worlds ? `  <section class="w-journey wrap" aria-labelledby="h-journey">
    <div class="w-head"><h2 id="h-journey">Unlocks as you play${anchor('h-journey', 'Unlocks as you play')}</h2><p>Each world brings something new. Pick one to read how it works.</p></div>
    ${journey(w)}
  </section>` : ''
  const sections = w.sections.map((s) => `  <section class="w-sec wrap" id="${s.id}" data-sec="${s.id}" aria-labelledby="h-${s.id}">
    <div class="w-head"><h2 id="h-${s.id}">${esc(s.title)}${anchor(`h-${s.id}`, esc(s.title))}</h2><p>${s.intro}</p></div>
    <div class="w-grid">
      ${w.entries.filter((e) => e.section === s.id).map((e) => card(w, e)).join('\n      ')}
    </div>
  </section>`).join('\n')
  const art = keyArt(product, w)
  const body = `  ${heroSection(art, { cls: 'w-hero is-index', foot: `<div class="w-hero-foot wrap">
      <p class="w-kicker">${esc(p.name)} wiki</p>
      <h1>${esc(w.heading || w.title)}</h1>
      <p class="w-lede">${w.intro}</p>
      <label class="w-search"><span class="sr-only">Search the wiki</span><input type="search" id="q" placeholder="Search ${w.entries.length} entries…" autocomplete="off"></label>
    </div>` })}
${tiles}
  <div class="w-chips wrap" role="group" aria-label="Show"><button type="button" class="w-chip on" data-filter="all">All <b>${w.entries.length}</b></button>${w.sections.map((s) => `<button type="button" class="w-chip" data-filter="${s.id}">${esc(s.title)}</button>`).join('')}</div>
${sections}
  <p class="w-empty wrap" id="empty" hidden>Nothing matches that. Try another word.</p>`
  const image = preview(w, product, w.indexArt?.wiki, art.alt)
  return shell(w, product, { title: w.metaTitle ?? `${w.title} · ${p.name}`, description: w.metaDescription ?? strip(w.intro), path: `/${p.slug}/wiki/`, body, image, script: true, preload: heroPicture(art).preloads.join('\n  ') })
}

// ---------- Entry ----------
function stepsBlock(w, e) {
  const steps = e.steps || (e.how || []).map((text) => ({ text }))
  if (!steps.length) return ''
  const list = `<ol class="w-steps">${steps.map((s, i) => `<li data-step="${i}"><span class="w-step-n">${i + 1}</span><p>${s.text}</p></li>`).join('')}</ol>`
  if (e.board) {
    return `<section class="w-panel w-how" aria-labelledby="h-how">
      ${h2('h-how', `How it works`)}
      <div class="w-how-grid">
        <div class="w-play" data-board="${esc(JSON.stringify(e.board))}" data-art="/${w.product.slug}/wiki/img/pieces/">
          <div class="w-play-hud"><span class="w-hearts" aria-label="Hearts">${'<svg class="w-heart" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40S7 29 7 17a8.5 8.5 0 0 1 17-3 8.5 8.5 0 0 1 17 3c0 12-17 23-17 23z"/></svg>'.repeat(3)}</span><span class="w-play-say" aria-live="polite">Tap an arrow with a clear path.</span></div>
          <svg class="w-board" role="group" aria-label="A small ${esc(e.name.toLowerCase())} board you can play"></svg>
          <div class="w-play-acts"><button type="button" class="w-btn" data-act="show">Show me</button><button type="button" class="w-btn ghost" data-act="reset">Reset</button></div>
        </div>
        ${list}
      </div>
    </section>`
  }
  if (e.gauge) {
    return `<section class="w-panel" aria-labelledby="h-how">${h2('h-how', `Try it`)}
      <div class="w-gauge-try" data-gauge="${esc(JSON.stringify(e.gauge))}"><svg class="w-gauge" viewBox="0 0 240 240" role="img" aria-label="${esc(e.gauge.label)}"></svg><div><button type="button" class="w-btn" data-act="plug" aria-pressed="false">${esc(e.gauge.off)}</button><p class="w-gauge-say" aria-live="polite">${esc(e.gauge.offText)}</p></div></div>
    </section>
    <section class="w-block" aria-labelledby="h-steps">${h2('h-steps', `How it works`)}${list}</section>`
  }
  return `<section class="w-block" aria-labelledby="h-how">${h2('h-how', `${e.section === 'traps' ? 'How to beat it' : e.section === 'powerups' ? 'How to use it' : 'How it works'}`)}${list}</section>`
}
// "What it does": the first paragraph as the lead beside the piece, then each further paragraph as a card whose first
// sentence is its heading.
function whatBlock(w, e) {
  const [lead, ...rest] = e.what || []
  if (!lead) return ''
  const split = (p) => { const m = p.match(/^(.+?[.!?])\s+([\s\S]*)$/); return m ? [m[1], m[2]] : [p, ''] }
  return `<section class="w-block" aria-labelledby="h-what">${h2('h-what', `${w.whatTitle || (w.product.slug === 'exitwise' ? 'What it does' : 'What it shows')}`)}
      <div class="w-what">
        <div class="w-what-lead">${piece(e, 'w-medal')}<p>${lead}</p></div>${rest.length ? `
        <div class="w-what-cards">${rest.map((p, i) => { const [h, t] = split(p); return `<div class="w-what-card" style="--k: var(--swatch-${(i % 6) + 1})"><b>${h}</b>${t ? `<p>${t}</p>` : ''}</div>` }).join('')}</div>` : ''}
      </div>
    </section>`
}
function tipBlock(w, e) {
  const t = e.tip || (inGameTip(e) && { title: inGameTip(e), label: 'In-game tip' })
  if (!t) return ''
  const hand = w.hand ? `<img class="w-hand" src="${esc(w.hand)}" alt="" width="80" height="80" loading="lazy">` : ''
  return `<div class="w-tip">${hand}<aside class="w-tipcard" aria-label="${esc(t.label)}"><p class="w-tip-label">${esc(t.label)}</p><p class="w-tip-title">${esc(t.title)}</p>${t.text ? `<p>${esc(t.text)}</p>` : ''}${w.hand ? '<span class="w-gotit" aria-hidden="true">Got it</span>' : ''}</aside></div>`
}
function worldMap(w) {
  const p = w.product
  const detail = (wd, i) => {
    const list = w.entries.filter((e) => e.firstLevel > 1 && worldOf(w, e.firstLevel) === wd).sort((a, b) => a.firstLevel - b.firstLevel)
    return `<div class="w-wcard${wd.id === w.worldsOpen ? '' : ' is-off'}" id="world-${wd.id}" data-world-card="${wd.id}">
          <div class="w-wcard-art" style="--w: ${wd.colour}; --art: url(/${p.slug}/wiki/img/worlds/${wd.id}.webp)"><span class="w-wt-n big">${i + 1}</span></div>
          <div class="w-wcard-body"><p class="w-kicker">World ${i + 1} of ${w.worlds.length}</p><h3>${esc(wd.name)}</h3><p class="w-wcard-lv">Levels ${wd.from}–${wd.to} · hard levels at night</p>${list.length
            ? `<p class="w-kicker">New here</p><ul class="w-new">${list.map((e) => `<li><a href="/${p.slug}/wiki/${e.slug}/">${lvBadge(e.firstLevel, 'sm')}${piece(e, 'journey-piece')}<span>${esc(e.name)}</span></a></li>`).join('')}</ul>`
            : '<p class="w-muted">Nothing new here: the obstacles you know, mixed together on bigger boards.</p>'}</div>
        </div>`
  }
  return `<section class="w-panel" aria-labelledby="h-map">${h2('h-map', `World map`)}<p class="w-muted">The worlds in the order you play them. Pick one to see what it brings.</p>
      <div class="w-wm" data-worlds>
        <ol class="w-wm-tiles">${w.worlds.map((wd, i) => `<li><a class="w-wt${wd.id === w.worldsOpen ? ' on' : ''}" href="#world-${wd.id}" data-world="${wd.id}"${wd.id === w.worldsOpen ? ' aria-current="true"' : ''} style="--w: ${wd.colour}; --art: url(/${p.slug}/wiki/img/worlds/${wd.id}.webp)"><span class="w-wt-n">${i + 1}</span><span class="w-wt-name">${esc(wd.name)}</span><span class="w-wt-lv">${wd.from}–${wd.to}</span></a></li>`).join('')}</ol>
        <div class="w-wd">
        ${w.worlds.map(detail).join('\n        ')}
        </div>
      </div>
    </section>`
}
// "In the game": a phone on small screens; on wide ones the browser game's wide player, the world's level-map art
// edge to edge with the game in the middle. A wide figure (wider than tall) is shown as it is. Each entry has a band of
// its own, cut from another row of its world's map (tools/make-wiki-map-art.py), so no band is shown twice (George,
// 26 Oct 2026: "Each art must be used only once!!").
function inTheGame(w, e) {
  const f = e.figure
  if (!f) return ''
  const wide = f.width > f.height
  // The world the screenshot shows (named in its words), else the one the entry arrives in. make-wiki-map-art.py
  // makes the same choice.
  const named = w.worlds?.find((x) => new RegExp(`\\b${x.name}\\b`, 'i').test(`${f.alt} ${f.caption || ''}`))
  const wd = named || worldOf(w, e.firstLevel) || w.worlds?.[0]
  const file = `${w.product.slug}/wiki/img/bands/${e.slug}.webp`
  const band = !wide && w.bands && wd && w.bands.includes(wd.id) && existsSync(join(root, file))
  const play = w.playHref ? `<a class="w-btn" href="${esc(w.playHref)}">Play in your browser</a>` : ''
  return `<section class="w-block" aria-labelledby="h-game">${h2('h-game', `${esc(w.figureTitle || 'In the game')}`)}
      <figure class="w-player${wide ? ' is-wide' : ''}"><div class="w-player-screen"${band ? ` style="--band: url(/${file})"` : ''}><img src="${esc(f.src)}" alt="${esc(f.alt)}" width="${f.width}" height="${f.height}" loading="lazy"></div><figcaption><span>${f.caption || ''}</span>${play}</figcaption></figure>
    </section>`
}
function entryPage(w, product, e, i) {
  const p = w.product
  const s = w.sections.find((x) => x.id === e.section)
  const bySlug = Object.fromEntries(w.entries.map((x) => [x.slug, x]))
  const prev = w.entries[i - 1], next = w.entries[i + 1]
  const wd = worldOf(w, e.firstLevel)
  const facts = [...(e.firstLevel > 1 ? [['Arrives', `Level ${e.firstLevel}${wd ? ' · ' + wd.name : ''}`]] : []), ...(e.facts || [])]
  const related = (e.related || []).filter((r) => bySlug[r]).slice(0, 3)
  const art = wikiArt(p.slug, e.slug, { alt: e.artAlt || '' })
  const body = `  ${heroSection(art, { cls: 'w-hero', foot: `<div class="w-hero-foot wrap">
      <nav class="w-crumbs" aria-label="Breadcrumb"><a href="/${p.slug}/wiki/">Wiki</a> <span aria-hidden="true">›</span> <a href="/${p.slug}/wiki/#${s.id}">${esc(s.title)}</a></nav>
      <h1>${esc(e.name)}</h1>
      <p class="w-arrive">${lvBadge(e.firstLevel > 1 ? e.firstLevel : null)}${worldChip(e.firstLevel > 1 ? wd : null)}<span>${esc(arrival(w, e) || SECTION_LABEL[e.section] || s.title)}</span></p>
    </div>` })}
  <article class="w-body wrap">
    <p class="w-lede">${e.summary}</p>${facts.length ? `
    <dl class="w-glance">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}${e.quote ? `
    ${quote(e.quote)}` : ''}
    ${stepsBlock(w, e)}
    ${whatBlock(w, e)}
    ${tipBlock(w, e)}
    ${notesOf(e).length ? `<section class="w-block" aria-labelledby="h-notes">${h2('h-notes', `Good to know`)}<ul class="w-ticks">${notesOf(e).map((x) => `<li>${x}</li>`).join('')}</ul></section>` : ''}
    ${e.worldMap && w.worlds ? worldMap(w) : ''}
    ${inTheGame(w, e)}
    ${related.length ? `<section class="w-block" aria-labelledby="h-rel">${h2('h-rel', `${esc(w.relatedTitle || 'Works with')}`)}<div class="w-grid three">${related.map((r) => card(w, bySlug[r])).join('')}</div></section>` : ''}
    <nav class="w-pager" aria-label="More entries">${prev ? `<a class="w-btn ghost" href="/${p.slug}/wiki/${prev.slug}/" rel="prev"><span aria-hidden="true">◀</span> ${esc(prev.name)}</a>` : '<span></span>'}${next ? `<a class="w-btn" href="/${p.slug}/wiki/${next.slug}/" rel="next">${esc(next.name)} <span aria-hidden="true">▶</span></a>` : '<span></span>'}</nav>
  </article>`
  return shell(w, product, {
    title: entryTitle(w, e), description: describe(e, w.entryTail), path: `/${p.slug}/wiki/${e.slug}/`, body, entry: e,
    image: preview(w, product, e.slug, e.artAlt || `${e.name}, from the ${p.name} wiki`),
    preload: heroPicture(art).preloads.join('\n  '), script: !!(e.board || e.gauge || e.worldMap),
  })
}

const products = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(root).filter((d) => existsSync(join(root, d, 'wiki', 'wiki.json')))

for (const slug of products) {
  const dir = join(root, slug, 'wiki')
  const w = JSON.parse(readFileSync(join(dir, 'wiki.json'), 'utf8'))
  const product = loadProduct(slug)
  const artFile = join(dir, 'img', 'art', 'art.json')
  // wiki.json's own "art" (the index hero's painting) stays as indexArt; w.art becomes the paintings' sizes.
  w.indexArt = w.art
  w.art = existsSync(artFile) ? JSON.parse(readFileSync(artFile, 'utf8')) : {}
  // Every entry belongs to a known section and has its painting; order entries by section so prev/next follows the index.
  const order = w.sections.map((s) => s.id)
  for (const e of w.entries) {
    if (!order.includes(e.section)) throw new Error(`${slug}: ${e.slug} has unknown section ${e.section}`)
    if (!w.art[e.slug]) throw new Error(`${slug}: ${e.slug} has no painting in wiki/img/art (run tools/make-wiki-art.py)`)
  }
  w.entries.sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section))
  // Remove pages of entries that no longer exist, then write fresh ones.
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && d.name !== 'img' && existsSync(join(dir, d.name, 'index.html'))) rmSync(join(dir, d.name), { recursive: true })
  }
  writeFileSync(join(dir, 'index.html'), indexPage(w, product))
  w.entries.forEach((e, i) => {
    mkdirSync(join(dir, e.slug), { recursive: true })
    writeFileSync(join(dir, e.slug, 'index.html'), entryPage(w, product, e, i))
  })
  console.log(`${slug}: wiki index + ${w.entries.length} entries`)
}
