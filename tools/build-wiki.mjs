// Builds each product's wiki from <product>/wiki/wiki.json into static pages:
//   <product>/wiki/index.html and <product>/wiki/<slug>/index.html
// Usage: node tools/build-wiki.mjs [product ...]   (default: every product with a wiki/wiki.json)
// The JSON is the single source; never edit the generated pages by hand. Its text is trusted HTML from this repo.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = (s) => String(s).replace(/<[^>]+>/g, '')

const LEGAL = `<p class="legal">&copy; 2026 VGRAPHICS SINGLE MEMBER P.C. · ΓΕΜΗ 181823306000 · ΑΦΜ 802736373 · Kafkasou 10, 551 33 Kalamaria, Greece · <a href="/company/">Company information</a></p>`

function picture(e, cls) {
  if (e.icon) return `<span class="${cls} pic-svg" aria-hidden="true">${e.icon}</span>`
  const lazy = cls === 'entry-pic' ? '' : ' loading="lazy"'
  return `<span class="${cls}"><img src="${esc(e.image)}" alt=""${lazy}></span>`
}

function shell(w, { title, description, path, body }) {
  const p = w.product
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="https://vgraphics.gr${path}">
  <link rel="icon" href="${esc(p.icon)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="https://vgraphics.gr${path}">
  <link rel="stylesheet" href="/${p.slug}/wiki/wiki.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="bar">
  <a class="back" href="/" aria-label="VGraphics home"><img src="${esc(p.logo || '/img/vgraphics-logo.png')}" alt="" width="555" height="473"></a>
  <a class="product" href="${esc(p.home)}"><img src="${esc(p.icon)}" alt="" width="36" height="36"><span>${esc(p.name)}</span></a>
  <nav class="subnav" aria-label="${esc(p.name)}">${w.nav.map((n) => `<a href="${esc(n.href)}"${n.current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('')}</nav>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <a href="/">More from VGraphics</a>
  <a href="${esc(p.home)}">${esc(p.name)}</a>
  <a href="/${p.slug}/privacy.html">Privacy policy</a>
  <a href="mailto:gvergidis90@gmail.com">Contact</a>
  ${LEGAL}
</footer>
</body>
</html>
`
}

function card(e, w) {
  const level = e.firstLevel ? `<span class="chip">Level ${e.firstLevel}+</span>` : ''
  return `<a class="card" href="/${w.product.slug}/wiki/${e.slug}/" data-text="${esc((e.name + ' ' + strip(e.summary)).toLowerCase())}">
      ${picture(e, 'card-pic')}
      <span class="card-body"><b>${esc(e.name)}</b><span>${e.summary}</span>${level}</span>
    </a>`
}

function indexPage(w) {
  const sections = w.sections.map((s) => {
    const entries = w.entries.filter((e) => e.section === s.id)
    return `  <section class="sec" id="${s.id}" aria-labelledby="h-${s.id}">
    <div class="sec-head"><h2 id="h-${s.id}">${esc(s.title)}</h2><p>${s.intro}</p></div>
    <div class="cards">
    ${entries.map((e) => card(e, w)).join('\n    ')}
    </div>
  </section>`
  }).join('\n')
  const body = `  <section class="hero">
    <p class="kicker">${esc(w.product.name)} · Wiki</p>
    <h1>${esc(w.title)}</h1>
    <p class="lede">${w.intro}</p>
    <label class="search"><span class="sr-only">Search the wiki</span><input type="search" id="q" placeholder="Search ${w.entries.length} entries…" autocomplete="off"></label>
    <nav class="jump" aria-label="Sections">${w.sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('')}</nav>
  </section>
${sections}
  <p class="empty" id="empty" hidden>Nothing matches that. Try another word.</p>
  <script>
    // Filter the cards as you type. Without JavaScript every entry stays visible.
    (() => {
      const q = document.getElementById("q"), cards = [...document.querySelectorAll(".card")], secs = [...document.querySelectorAll(".sec")];
      q.addEventListener("input", () => {
        const t = q.value.trim().toLowerCase(); let any = false;
        cards.forEach((c) => { const on = !t || c.dataset.text.includes(t); c.hidden = !on; any = any || on; });
        secs.forEach((s) => { s.hidden = ![...s.querySelectorAll(".card")].some((c) => !c.hidden); });
        document.getElementById("empty").hidden = any;
      });
    })();
  </script>`
  return shell(w, { title: `${w.title} · ${w.product.name}`, description: strip(w.intro), path: `/${w.product.slug}/wiki/`, body })
}

function entryPage(w, e, i) {
  const s = w.sections.find((x) => x.id === e.section)
  const bySlug = Object.fromEntries(w.entries.map((x) => [x.slug, x]))
  const prev = w.entries[i - 1], next = w.entries[i + 1]
  const list = (items) => `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`
  const blocks = [
    e.what && `<section class="block"><h2>What it does</h2>${e.what.map((x) => `<p>${x}</p>`).join('')}</section>`,
    e.how && `<section class="block"><h2>${s.id === 'powerups' || s.id === 'traps' ? 'How to use it' : 'How it works for you'}</h2>${list(e.how)}</section>`,
    e.notes && `<section class="block note"><h2>Good to know</h2>${list(e.notes)}</section>`,
  ].filter(Boolean).join('\n    ')
  const related = (e.related || []).filter((r) => bySlug[r])
  const body = `  <nav class="crumbs" aria-label="Breadcrumb"><a href="/${w.product.slug}/wiki/">Wiki</a> <span aria-hidden="true">›</span> <a href="/${w.product.slug}/wiki/#${s.id}">${esc(s.title)}</a></nav>
  <article class="entry">
    <header class="entry-head">
      ${picture(e, 'entry-pic')}
      <div>
        <p class="kicker">${esc(s.title)}</p>
        <h1>${esc(e.name)}</h1>
        <p class="lede">${e.summary}</p>
        ${e.firstLevel ? `<p class="chips"><span class="chip">First appears on level ${e.firstLevel}</span></p>` : ''}
      </div>
    </header>
    ${blocks}
    ${related.length ? `<section class="block"><h2>Works with</h2><div class="cards small">${related.map((r) => card(bySlug[r], w)).join('')}</div></section>` : ''}
  </article>
  <nav class="pager" aria-label="More entries">
    ${prev ? `<a class="prev" href="/${w.product.slug}/wiki/${prev.slug}/"><span>Previous</span>${esc(prev.name)}</a>` : '<span></span>'}
    ${next ? `<a class="next" href="/${w.product.slug}/wiki/${next.slug}/"><span>Next</span>${esc(next.name)}</a>` : '<span></span>'}
  </nav>`
  return shell(w, { title: `${e.name} · ${w.title}`, description: strip(e.summary), path: `/${w.product.slug}/wiki/${e.slug}/`, body })
}

const products = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(root).filter((d) => existsSync(join(root, d, 'wiki', 'wiki.json')))

for (const product of products) {
  const dir = join(root, product, 'wiki')
  const w = JSON.parse(readFileSync(join(dir, 'wiki.json'), 'utf8'))
  // Every entry belongs to a known section; order entries by section so prev/next follows the index.
  const order = w.sections.map((s) => s.id)
  for (const e of w.entries) if (!order.includes(e.section)) throw new Error(`${product}: ${e.slug} has unknown section ${e.section}`)
  w.entries.sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section))
  // Remove pages of entries that no longer exist, then write fresh ones.
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && d.name !== 'img' && existsSync(join(dir, d.name, 'index.html'))) rmSync(join(dir, d.name), { recursive: true })
  }
  writeFileSync(join(dir, 'index.html'), indexPage(w))
  w.entries.forEach((e, i) => {
    mkdirSync(join(dir, e.slug), { recursive: true })
    writeFileSync(join(dir, e.slug, 'index.html'), entryPage(w, e, i))
  })
  console.log(`${product}: wiki index + ${w.entries.length} entries`)
}
