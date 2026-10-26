// The level map's worlds as tiles in play order, each on its own world art with what it brings: the wiki index's
// "Unlocks as you play" and the landing page's "A new twist every few worlds" are this one piece (assets/product.css,
// .journey), read from the product's wiki/wiki.json (worlds and entries), so both pages show the same worlds, levels
// and pieces.
import { esc } from './partials.mjs'

export const worldOf = (w, lv) => (lv && w.worlds ? w.worlds.find((x) => lv >= x.from && lv <= x.to) : null)
export const lvBadge = (lv, cls = '') => (lv ? `<span class="bubble${cls ? ' ' + cls : ''}" aria-label="Level ${lv}">${lv}</span>` : '')
// An entry's small picture: its piece from the game's art (tools/make-wiki-pieces.py, shown whole), else its icon,
// else its image (a photo that fills the medal).
export function piece(e, cls) {
  if (e.piece) return `<span class="${cls} is-piece"><img src="${esc(e.piece)}" alt="" width="192" height="192" loading="lazy"></span>`
  if (e.icon) return `<span class="${cls}" aria-hidden="true">${e.icon}</span>`
  return `<span class="${cls}"><img src="${esc(e.image)}" alt="" loading="lazy"></span>`
}

// sections: only entries of these wiki sections (all by default); detail: each entry's summary under its name.
// The world's name, and its art behind the tile, link to its card on the wiki's world map (the entry with worldMap),
// so the tile is that card's preview and the art is not shown twice (George, 26 Oct 2026: "Each art must be used only
// once!!").
export function journey(w, { sections, detail } = {}) {
  const slug = w.product.slug
  const map = w.entries.find((e) => e.worldMap)
  const entries = w.entries.filter((e) => e.firstLevel > 1 && (!sections || sections.includes(e.section)))
  const stops = w.worlds
    .map((wd) => [wd, entries.filter((e) => worldOf(w, e.firstLevel) === wd).sort((a, b) => a.firstLevel - b.firstLevel)])
    .filter(([, list]) => list.length)
  const item = (e) => `<li><a href="/${slug}/wiki/${e.slug}/">${lvBadge(e.firstLevel, 'sm')}${piece(e, 'journey-piece')}${detail
    ? `<span><b>${esc(e.name)}</b><small>${e.summary}</small></span>` : `<span>${esc(e.name)}</span>`}</a></li>`
  const head = (wd) => {
    const inner = `<b>${esc(wd.name)}</b><span>Levels ${wd.from}–${wd.to}</span>`
    const art = ` style="--art: url(/${slug}/wiki/img/worlds/${wd.id}.webp)"`
    return map ? `<a class="journey-head" href="/${slug}/wiki/${map.slug}/#world-${wd.id}"${art}>${inner}</a>` : `<p class="journey-head"${art}>${inner}</p>`
  }
  return `<ol class="journey${detail ? ' detail' : ''}">
${stops.map(([wd, list]) => `      <li class="journey-world" style="--w: ${wd.colour}">
        ${head(wd)}
        <ul>${list.map(item).join('')}</ul>
      </li>`).join('\n')}
    </ol>`
}
