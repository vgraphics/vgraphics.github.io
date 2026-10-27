// Writes the devlog, /devlog/ and a page per post at /devlog/<slug>/, from devlog/posts.json: notes from the studio on
// how the games and apps are made (AdSense's "Low-value content" review, 27 Oct 2026, asked for ongoing, genuine
// content). Each page is a company page, so its header and footer are taken from the home page, the master, word for
// word (check-site); run this again after the home page's header or footer changes.
// Usage: node tools/build-devlog.mjs, then node tools/build-sitemap.mjs.
//
// devlog/posts.json: { "posts": [{ slug, date, product, title, description, lede, sections, links }] }, any order
//   date         the day it went up, YYYY-MM-DD
//   product      what it is about, the post's kicker ("Exitwise")
//   description  its search and link-preview line (at most 160 characters)
//   lede         its opening paragraph; sections: [{ title, paragraphs }] after it; links: [{ href, label }] at its foot
// Its text is trusted HTML from this repo. Only real work goes here: no filler posts.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './lib/product.mjs'

const DESCRIPTION_MAX = 160
const SITE = 'https://vgraphics.gr'
const CARD = `${SITE}/assets/img/vgraphics-card-1200x630.jpg`
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = (s) => String(s).replace(/<[^>]+>/g, '')
const day = (d) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`
const json = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/\n/g, '\n  ')

const home = readFileSync(join(root, 'index.html'), 'utf8')
const header = home.match(/<header class="site-head">[\s\S]*?<\/header>/)?.[0]
const footer = home.match(/<footer class="site-foot">[\s\S]*?<\/footer>/)?.[0]
if (!header || !footer) throw new Error("index.html: can't find the site header or footer")

const { posts } = JSON.parse(readFileSync(join(root, 'devlog', 'posts.json'), 'utf8'))
for (const p of posts) {
  if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`a post's slug "${p.slug}" isn't lower-case words and dashes`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw new Error(`${p.slug}: date "${p.date}" isn't YYYY-MM-DD`)
  if (p.description.length > DESCRIPTION_MAX) throw new Error(`${p.slug}: the description is ${p.description.length} characters (at most ${DESCRIPTION_MAX})`)
}
posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

const organization = { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'VGraphics', url: `${SITE}/` }

function page({ path, title, description, ogTitle, ld, style, main }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${path}">
  <link rel="icon" href="/img/vgraphics-logo.png">
  <meta name="theme-color" content="#F6F2EA" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#111016" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="${path === '/devlog/' ? 'website' : 'article'}">
  <meta property="og:site_name" content="VGraphics">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}${path}">
  <meta property="og:image" content="${CARD}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="VGraphics: games, apps and software, carefully made. Games, Apps, Services and VHub.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${CARD}">
  <script type="application/ld+json">
  ${json(ld)}
  </script>
  <link rel="preload" href="/assets/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/vgraphics.css">
  <link rel="stylesheet" href="/assets/cursors.css">
  <script src="/assets/menu.js" defer></script>
  <style>
    /* The devlog: a calm reading column on the company pages' paper, the post's product as its kicker. */
    .intro { padding-block: var(--s5) var(--s4); display: grid; gap: var(--s2); justify-items: start; }
    .intro h1 { font-size: clamp(2.2rem, 5.4vw, 3.8rem); max-width: 18em; text-wrap: balance; }
${style}
  </style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

${header}

<main id="main" class="wrap">
${main}
</main>

${footer}
<script src="/assets/vhub-me.js" defer></script>
</body>
</html>
`
}

const card = (p) => `    <article class="post-card">
      <span class="post-meta">${esc(p.product)} · <time datetime="${p.date}">${day(p.date)}</time></span>
      <h2><a href="/devlog/${p.slug}/">${esc(p.title)}</a></h2>
      <p>${esc(p.description)}</p>
      <a class="btn btn-ghost" href="/devlog/${p.slug}/" aria-label="Read: ${esc(p.title)}">Read the post</a>
    </article>`

const CARD_STYLE = `    .posts { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 18px; padding-bottom: var(--s7); }
    .post-card { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; padding: 26px; border-radius: var(--r-lg); background: var(--surface); border: 1px solid var(--line); }
    .post-card h2 { font-size: 1.4rem; text-wrap: balance; }
    .post-card h2 a { color: inherit; text-decoration: none; }
    .post-card p { color: var(--ink-2); }
    .post-card .btn { margin-top: auto; }
    .post-meta { font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-2); }`

function postPage(p) {
  const path = `/devlog/${p.slug}/`
  const others = posts.filter((o) => o !== p).slice(0, 2)
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        url: `${SITE}${path}`,
        mainEntityOfPage: `${SITE}${path}`,
        image: CARD,
        inLanguage: 'en',
        author: organization,
        publisher: organization,
        isPartOf: { '@type': 'Blog', '@id': `${SITE}/devlog/#blog`, name: 'VGraphics devlog' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'VGraphics', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Devlog', item: `${SITE}/devlog/` },
          { '@type': 'ListItem', position: 3, name: p.title, item: `${SITE}${path}` },
        ],
      },
    ],
  }
  const main = `  <article class="post">
    <div class="intro">
      <span class="kicker"><span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span> Devlog · ${esc(p.product)}</span>
      <h1>${esc(p.title)}</h1>
      <p class="chip"><time datetime="${p.date}">${day(p.date)}</time></p>
    </div>
    <div class="text">
      <p class="lede">${p.lede}</p>
${p.sections.map((s) => `      <section>
        <h2>${esc(s.title)}</h2>
${s.paragraphs.map((t) => `        <p>${t}</p>`).join('\n')}
      </section>`).join('\n')}
      <div class="see">${(p.links ?? []).map((l, i) => `<a class="btn ${i ? 'btn-ghost' : 'btn-primary'}" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}<a class="btn btn-ghost" href="/devlog/">All posts</a></div>
    </div>
  </article>${others.length ? `
  <section class="more" aria-labelledby="more-title">
    <h2 id="more-title">More from the devlog</h2>
    <div class="posts">
${others.map(card).join('\n')}
    </div>
  </section>` : ''}`
  const style = `    .text { display: grid; gap: var(--s4); max-width: 42em; padding-bottom: var(--s6); }
    .text section { display: grid; gap: var(--s2); }
    .text h2 { font-size: clamp(1.4rem, 2.6vw, 1.9rem); text-wrap: balance; }
    .text p { font-size: 1.08rem; line-height: 1.7; }
    .text .lede { font-size: clamp(1.15rem, 1.6vw, 1.3rem); max-width: none; }
    .see { display: flex; flex-wrap: wrap; gap: 12px; padding-top: var(--s2); }
    .more { display: grid; gap: var(--s3); border-top: 1px solid var(--line); padding-top: var(--s5); }
    .more > h2 { font-size: 1.6rem; }
${CARD_STYLE}`
  return page({ path, title: `${p.title} · VGraphics devlog`, description: p.description, ogTitle: p.title, ld, style, main })
}

function indexPage() {
  const path = '/devlog/'
  const description = 'Notes from VGraphics on how Exitwise, Speedometer Live Wallpaper and our other games and apps are designed and built.'
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${SITE}/devlog/#blog`,
        name: 'VGraphics devlog',
        description,
        url: `${SITE}${path}`,
        inLanguage: 'en',
        publisher: organization,
        blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, datePublished: p.date, url: `${SITE}/devlog/${p.slug}/` })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'VGraphics', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Devlog', item: `${SITE}${path}` },
        ],
      },
    ],
  }
  const main = `  <div class="intro">
    <span class="kicker"><span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span> Devlog</span>
    <h1>Notes from the studio</h1>
    <p class="lede">How our games and apps are designed and built: the problems, the fixes and the reasons behind them. A new post when there is something worth telling.</p>
  </div>
  <div class="posts">
${posts.map(card).join('\n')}
  </div>`
  return page({ path, title: 'Devlog: how our games and apps are made · VGraphics', description, ogTitle: 'VGraphics devlog', ld, style: CARD_STYLE, main })
}

const dir = join(root, 'devlog')
for (const e of readdirSync(dir, { withFileTypes: true })) {
  if (e.isDirectory() && !posts.some((p) => p.slug === e.name) && existsSync(join(dir, e.name, 'index.html'))) rmSync(join(dir, e.name), { recursive: true })
}
writeFileSync(join(dir, 'index.html'), indexPage())
for (const p of posts) {
  mkdirSync(join(dir, p.slug), { recursive: true })
  writeFileSync(join(dir, p.slug, 'index.html'), postPage(p))
}
console.log(`devlog: index + ${posts.length} post${posts.length === 1 ? '' : 's'}`)
