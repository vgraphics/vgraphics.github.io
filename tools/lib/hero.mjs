// The hero every product page opens with: the landing page's, its other pages' (ranking, room, policies) and every
// wiki page's. One box, assets/product.css .key-art. The landing page's (the overview's) is the screen's height on
// landscape screens up to 16:10 (a 16:10 box on squarer ones) and the whole 9:16 tall picture on portrait screens up
// to 4:5. Every other page's is shorter, .key-art.is-page (George, 24 Oct 2026: "The hero height is not so good for
// other pages other than overview. Revert to previous height +20%"): the band those pages had before 23 Oct, 20%
// taller, showing the middle of the tall picture on portrait screens. The art fades out at its foot and the page's
// words stand in its last fifth. tools/build-pages.mjs and tools/build-wiki.mjs both build it here, so the pages
// can't drift apart.
//
// art: { alt, tall, wide, ultra?, position?, fade?: { wide, tall }, placeholder? }; each picture is
// { src, widths, jpeg?, width, height, sizes? }, as src-<width>.avif and .webp, and src-<width>.jpg for the jpeg widths.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { esc } from './partials.mjs'
import { root } from './product.mjs'

export const TALL = '(max-aspect-ratio: 4/5)'
const ULTRA = '(min-aspect-ratio: 2/1)'

export const srcset = (img, ext, widths) => widths.map((w) => `${img.src}-${w}.${ext} ${w}w`).join(', ')
const dims = (img) => ` width="${img.width}" height="${img.height}"`

// The art as one <picture>: the tall cut on portrait screens up to 4:5, the ultra-wide one past 2:1 if there is one,
// else the wide one; AVIF, then WebP, then JPEG. The same choices as preloads, so the browser fetches it first.
export function heroPicture(a) {
  const sources = (img, media, sizes) => [
    `<source${media ? ` media="${media}"` : ''} type="image/avif" srcset="${srcset(img, 'avif', img.widths)}" sizes="${sizes}"${dims(img)}>`,
    `<source${media ? ` media="${media}"` : ''} type="image/webp" srcset="${srcset(img, 'webp', img.widths)}" sizes="${sizes}"${dims(img)}>`,
    ...(media && img.jpeg ? [`<source media="${media}" srcset="${srcset(img, 'jpg', img.jpeg)}" sizes="${sizes}"${dims(img)}>`] : []),
  ]
  const wideSizes = a.wide.sizes || '100vw'
  const fallback = a.wide.jpeg ? `${a.wide.src}-${a.wide.jpeg.at(-1)}.jpg" srcset="${srcset(a.wide, 'jpg', a.wide.jpeg)}` : `${a.wide.src}-${a.wide.widths.at(-1)}.webp`
  const picture = [
    ...sources(a.tall, TALL, '100vw'),
    ...(a.ultra ? sources(a.ultra, ULTRA, '100vw') : []),
    ...sources(a.wide, '', wideSizes),
    `<img src="${fallback}" sizes="${wideSizes}"${dims(a.wide)} fetchpriority="high" alt="${esc(a.alt ?? '')}">`,
  ]
  const preload = (img, media, sizes) => `<link rel="preload" as="image" type="image/avif" media="${media}" imagesrcset="${srcset(img, 'avif', img.widths)}" imagesizes="${sizes}" fetchpriority="high">`
  const preloads = [
    preload(a.tall, TALL, '100vw'),
    preload(a.wide, a.ultra ? '(min-aspect-ratio: 4/5) and (max-aspect-ratio: 2/1)' : `not all and ${TALL}`, wideSizes),
    ...(a.ultra ? [preload(a.ultra, ULTRA, '100vw')] : []),
  ]
  return { picture, preloads }
}

// The hero: the art and, in its foot, the page's own words (foot: its markup). overview: the landing page's full-height
// box, else the other pages' shorter one. cls adds a page's own classes, attrs any attributes (aria-labelledby).
// Per-picture settings become the box's custom properties: --art-at (the crop's anchor on landscape screens),
// --art-fade and --art-fade-tall (where the fade starts), --art-placeholder.
export function heroSection(a, { cls = '', attrs = '', foot, overview = false }) {
  const style = [a.position && `--art-at: ${a.position}`, a.fade && `--art-fade: ${a.fade.wide}; --art-fade-tall: ${a.fade.tall}`,
    a.placeholder && `--art-placeholder: ${a.placeholder}`].filter(Boolean).join('; ')
  return `<section class="key-art${overview ? '' : ' is-page'}${cls ? ' ' + cls : ''}"${style ? ` style="${esc(style)}"` : ''}${attrs}>
      <picture>
        ${heroPicture(a).picture.join('\n        ')}
      </picture>
      ${foot}
    </section>`
}

// A wiki painting as hero art (wiki entries, and pages that open on one: "art": { "wiki": "<slug>" }), from
// <product>/wiki/img/art/art.json (tools/make-wiki-art.py): the wide picture, and its 9:16 tall version. These heroes
// are the other pages' shorter box, clamp(384px, 43.2vw, 74.4svh) on landscape screens, so the picture is the screen's
// width, or wider where the box's height asks for more: sizes says so.
const arts = {}
export function wikiArt(product, slug, extra = {}) {
  arts[product] ??= existsSync(join(root, product, 'wiki', 'img', 'art', 'art.json'))
    ? JSON.parse(readFileSync(join(root, product, 'wiki', 'img', 'art', 'art.json'), 'utf8')) : {}
  const a = arts[product][slug]
  if (!a) throw new Error(`${product}: no wiki painting "${slug}" in wiki/img/art (run tools/make-wiki-art.py)`)
  const base = `/${product}/wiki/img/art/${slug}`
  const k = a.width / a.height
  const sizes = `max(100vw, ${Math.round(384 * k)}px, min(${+(43.2 * k).toFixed(1)}vw, ${+(74.4 * k).toFixed(1)}vh))`
  return {
    position: '50% 35%', fade: { wide: '86%', tall: '80%' }, ...extra,
    tall: { src: `${base}-tall`, widths: a.tall.widths, jpeg: a.tall.jpeg, width: a.tall.width, height: a.tall.height },
    wide: { src: base, widths: a.widths, jpeg: a.jpeg, width: a.width, height: a.height, sizes },
  }
}
